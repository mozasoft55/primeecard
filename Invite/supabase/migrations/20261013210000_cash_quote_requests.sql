begin;

create table if not exists public.onboarding_cash_requests (
  request_id uuid primary key default gen_random_uuid(),
  request_reference text not null unique,
  idempotency_key uuid not null unique,
  request_hash text not null,
  customer_name text not null,
  email text,
  phone text,
  city text,
  bride_name text,
  groom_name text,
  event_date date,
  request_details jsonb not null default '{}'::jsonb
    check (jsonb_typeof(request_details) = 'object'),
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Converted', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_cash_request_contact_check
    check (nullif(btrim(coalesce(email, '')), '') is not null
        or nullif(btrim(coalesce(phone, '')), '') is not null)
);

create index if not exists onboarding_cash_requests_status_created_idx
  on public.onboarding_cash_requests (status, created_at desc);

alter table public.onboarding_cash_requests enable row level security;
revoke all on public.onboarding_cash_requests from public, anon, authenticated;

create or replace function public.submit_cash_quote_request(
  p_input jsonb,
  p_idempotency_key uuid,
  p_client_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.onboarding_cash_requests%rowtype;
  v_reference text;
  v_request_id uuid;
  v_rate_count integer;
  v_request_hash text;
  v_now timestamptz := now();
  v_email text := lower(btrim(coalesce(p_input->>'email', '')));
  v_phone text := regexp_replace(coalesce(p_input->>'phone', ''), '[^0-9+]', '', 'g');
  v_customer_name text := btrim(coalesce(p_input->>'customer_name', ''));
  v_date_text text := nullif(btrim(coalesce(p_input->>'event_date', '')), '');
begin
  if p_idempotency_key is null
     or p_client_fingerprint is null
     or length(p_client_fingerprint) < 32
     or coalesce(jsonb_typeof(p_input), '') <> 'object' then
    raise exception using errcode = '22023', message = 'Invalid cash quote request.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_idempotency_key::text, 0)
  );

  v_request_hash := encode(extensions.digest(convert_to(p_input::text, 'UTF8'), 'sha256'), 'hex');
  select * into v_existing
  from public.onboarding_cash_requests
  where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> v_request_hash then
      raise exception using errcode = '22023', message = 'This request key was already used for different request details.';
    end if;
    return jsonb_build_object(
      'success', true,
      'replayed', true,
      'request_reference', v_existing.request_reference,
      'status', v_existing.status
    );
  end if;

  insert into public.onboarding_rate_limits (fingerprint, window_started_at, request_count)
  values (p_client_fingerprint, date_trunc('hour', v_now), 1)
  on conflict (fingerprint, window_started_at)
  do update set request_count = public.onboarding_rate_limits.request_count + 1
  returning request_count into v_rate_count;
  if v_rate_count > 5 then
    raise exception using errcode = 'P0001', message = 'Too many requests. Please try again later.';
  end if;

  if length(v_customer_name) not between 2 and 120
     or (v_email = '' and v_phone = '')
     or (v_email <> '' and v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
     or (v_phone <> '' and v_phone !~ '^\+?[0-9]{8,15}$')
     or (v_date_text is not null and v_date_text !~ '^\d{4}-\d{2}-\d{2}$') then
    raise exception using errcode = '22023', message = 'Please enter your name and a valid phone number or email address.';
  end if;

  v_request_id := gen_random_uuid();
  v_reference := 'CASH-' || upper(substr(replace(v_request_id::text, '-', ''), 1, 12));

  insert into public.onboarding_cash_requests (
    request_id, request_reference, idempotency_key, request_hash, customer_name, email, phone,
    city, bride_name, groom_name, event_date, request_details
  )
  values (
    v_request_id,
    v_reference,
    p_idempotency_key,
    v_request_hash,
    v_customer_name,
    nullif(v_email, ''),
    nullif(v_phone, ''),
    nullif(btrim(coalesce(p_input->>'city', '')), ''),
    nullif(btrim(coalesce(p_input->>'bride_name', '')), ''),
    nullif(btrim(coalesce(p_input->>'groom_name', '')), ''),
    case when v_date_text is null then null else v_date_text::date end,
    p_input
  );

  return jsonb_build_object(
    'success', true,
    'replayed', false,
    'request_reference', v_reference,
    'status', 'New'
  );
end;
$$;

revoke all on function public.submit_cash_quote_request(jsonb, uuid, text)
  from public, anon, authenticated;
grant execute on function public.submit_cash_quote_request(jsonb, uuid, text)
  to service_role;

create or replace function public.get_admin_cash_quote_requests()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.onboarding_admins a
    where a.user_id = auth.uid() and a.is_active
  ) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  return coalesce((
    select jsonb_agg(to_jsonb(q) order by q.created_at desc)
    from (
      select request_id, request_reference, customer_name, email, phone, city,
             bride_name, groom_name, event_date, request_details, status, created_at
      from public.onboarding_cash_requests
      where status in ('New', 'Contacted')
      order by created_at desc
      limit 200
    ) q
  ), '[]'::jsonb);
end;
$$;

create or replace function public.update_admin_cash_quote_request(
  p_request_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := btrim(coalesce(p_status, ''));
begin
  if not exists (
    select 1
    from public.onboarding_admins a
    where a.user_id = auth.uid() and a.is_active
  ) then
    raise exception using errcode = '42501', message = 'Administrator access is required.';
  end if;

  if p_request_id is null or v_status not in ('New', 'Contacted', 'Converted', 'Closed') then
    raise exception using errcode = '22023', message = 'Cash quote request update is invalid.';
  end if;

  update public.onboarding_cash_requests
  set status = v_status, updated_at = now()
  where request_id = p_request_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Cash quote request was not found.';
  end if;

  return jsonb_build_object('success', true, 'status', v_status);
end;
$$;

revoke all on function public.get_admin_cash_quote_requests()
  from public, anon, authenticated;
revoke all on function public.update_admin_cash_quote_request(uuid, text)
  from public, anon, authenticated;
grant execute on function public.get_admin_cash_quote_requests()
  to authenticated;
grant execute on function public.update_admin_cash_quote_request(uuid, text)
  to authenticated;

commit;
