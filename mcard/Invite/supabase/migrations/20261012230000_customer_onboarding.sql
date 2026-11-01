-- Additive customer onboarding, payment audit, access, and notification schema.
-- Prerequisites: run supabase-schema.sql and the approved wedding data import first.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.weddings') is null
     or to_regclass('public.wedding_details') is null
     or to_regclass('public.events') is null
     or to_regclass('public.rsvp_contacts') is null
     or to_regclass('public.guests') is null
     or to_regclass('public.customers') is null
     or to_regclass('public.themes') is null
     or to_regclass('public.styles') is null
     or to_regclass('public.rsvps') is null then
    raise exception 'Run the existing wedding schema migration before onboarding migration 20261012230000.';
  end if;

  if exists (
    select required.table_name, required.column_name
    from (values
      ('weddings', 'id'), ('weddings', 'source_id'), ('weddings', 'couple_name'),
      ('weddings', 'bride_name'), ('weddings', 'groom_name'), ('weddings', 'event_date'),
      ('weddings', 'template_style'), ('weddings', 'theme_name'), ('weddings', 'theme_color'),
      ('wedding_details', 'wedding_id'), ('wedding_details', 'status'),
      ('wedding_details', 'host_name'), ('wedding_details', 'bride_full'),
      ('wedding_details', 'groom_full'), ('wedding_details', 'bride_parents'),
      ('wedding_details', 'groom_parents'), ('wedding_details', 'ceremony_title'),
      ('wedding_details', 'invocation'), ('wedding_details', 'ceremony_time'),
      ('wedding_details', 'venue_title'), ('wedding_details', 'venue'),
      ('wedding_details', 'address'), ('wedding_details', 'map_url'),
      ('wedding_details', 'compliments'), ('wedding_details', 'footer_text'),
      ('wedding_details', 'slug'),
      ('events', 'wedding_id'), ('events', 'sort_order'), ('events', 'event_name'),
      ('events', 'event_date'), ('events', 'event_time'), ('events', 'note'),
      ('rsvp_contacts', 'wedding_id'), ('rsvp_contacts', 'sort_order'),
      ('rsvp_contacts', 'contact_name'), ('rsvp_contacts', 'phone'),
      ('rsvp_contacts', 'is_primary'),
      ('guests', 'wedding_id'), ('guests', 'invite_code'), ('guests', 'guest_name'),
      ('guests', 'family_members'), ('guests', 'phone'), ('guests', 'category'),
      ('guests', 'city_address'), ('guests', 'with_family'),
      ('customers', 'customer_id'), ('customers', 'wedding_id'),
      ('customers', 'customer_name'), ('customers', 'phone'), ('customers', 'city'),
      ('customers', 'package'), ('customers', 'list_price_inr'),
      ('customers', 'discount_inr'), ('customers', 'advance_paid_inr'),
      ('customers', 'order_status'), ('customers', 'order_date'),
      ('customers', 'delivery_due'), ('customers', 'notes'),
      ('themes', 'theme_name'), ('themes', 'primary_color'),
      ('styles', 'template_id'),
      ('rsvps', 'wedding_id'), ('rsvps', 'invite_code'), ('rsvps', 'status'),
      ('rsvps', 'attending_count'), ('rsvps', 'wishes_message'),
      ('rsvps', 'submitted_at')
    ) as required(table_name, column_name)
    where not exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = required.table_name
        and c.column_name = required.column_name
    )
  ) then
    raise exception 'Existing wedding schema is missing one or more required columns. Compare it with supabase-schema.sql before running this migration.';
  end if;

  if exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and ((c.table_name = 'weddings' and c.column_name = 'id')
        or (c.table_name = 'customers' and c.column_name = 'customer_id')
        or (c.table_name = 'customers' and c.column_name = 'wedding_id')
        or (c.table_name = 'wedding_details' and c.column_name = 'wedding_id')
        or (c.table_name = 'events' and c.column_name = 'wedding_id')
        or (c.table_name = 'guests' and c.column_name = 'wedding_id'))
      and c.data_type <> 'text'
  ) then
    raise exception 'Existing identifier columns must be text to preserve the current invitation schema.';
  end if;

  if to_regprocedure('private.wedding_card_payload(text)') is null then
    raise exception 'Run supabase-final-fix.sql first; private.wedding_card_payload(text) is required by the customer dashboard.';
  end if;
end;
$$;

alter table public.customers
  add column if not exists email text,
  add column if not exists whatsapp_phone text,
  add column if not exists preferred_contact text;

create table if not exists public.onboarding_packages (
  package_code text primary key,
  display_name text not null,
  list_price_paise bigint not null check (list_price_paise >= 0),
  discount_paise bigint not null default 0 check (discount_paise >= 0),
  advance_paise bigint not null check (advance_paise >= 0),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  active boolean not null default false,
  display_order smallint not null default 1,
  updated_at timestamptz not null default now(),
  constraint onboarding_package_discount_check
    check (discount_paise <= list_price_paise),
  constraint onboarding_package_advance_check
    check (advance_paise <= list_price_paise - discount_paise),
  constraint onboarding_package_active_price_check
    check (not active or (list_price_paise > 0 and advance_paise > 0))
);

insert into public.onboarding_packages (
  package_code, display_name, list_price_paise, discount_paise,
  advance_paise, features, active, display_order
)
values
  ('standard', 'Standard', 0, 0, 0, '[]'::jsonb, false, 1),
  ('premium', 'Premium', 0, 0, 0, '[]'::jsonb, false, 2)
on conflict (package_code) do nothing;

create table if not exists public.onboarding_orders (
  order_reference text primary key,
  idempotency_key uuid not null unique,
  request_hash text not null,
  customer_id text not null unique references public.customers(customer_id) on delete restrict,
  wedding_id text not null unique references public.weddings(id) on delete restrict,
  email text not null,
  package_code text not null references public.onboarding_packages(package_code) on delete restrict,
  payment_mode text not null check (payment_mode in ('upi', 'cash')),
  order_status text not null default 'Pending'
    check (order_status in ('Pending', 'Confirmed', 'In Production', 'Delivered', 'Cancelled')),
  payment_status text not null
    check (payment_status in ('Pending', 'Pending Verification', 'Pending Cash Verification', 'Partially Paid', 'Paid', 'Rejected', 'Refunded')),
  provisioning_status text not null default 'Provisioned'
    check (provisioning_status in ('Provisioned', 'Failed')),
  invitation_status text not null default 'Not Sent'
    check (invitation_status in ('Not Sent', 'Ready', 'Sent')),
  payable_total_paise bigint not null check (payable_total_paise >= 0),
  advance_expected_paise bigint not null check (advance_expected_paise >= 0),
  advance_verified_paise bigint not null default 0 check (advance_verified_paise >= 0),
  access_token_hash text not null,
  access_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_order_verified_limit
    check (advance_verified_paise <= payable_total_paise)
);

create index if not exists onboarding_orders_wedding_idx
  on public.onboarding_orders (wedding_id);
create index if not exists onboarding_orders_email_idx
  on public.onboarding_orders (lower(email));

create table if not exists public.onboarding_payments (
  payment_id uuid primary key default gen_random_uuid(),
  order_reference text not null references public.onboarding_orders(order_reference) on delete restrict,
  customer_id text not null references public.customers(customer_id) on delete restrict,
  wedding_id text not null references public.weddings(id) on delete restrict,
  payment_mode text not null check (payment_mode in ('upi', 'cash')),
  currency text not null default 'INR' check (currency = 'INR'),
  expected_amount_paise bigint not null check (expected_amount_paise >= 0),
  claimed_amount_paise bigint not null default 0 check (claimed_amount_paise >= 0),
  verified_amount_paise bigint not null default 0 check (verified_amount_paise >= 0),
  external_reference text,
  payment_status text not null
    check (payment_status in ('Pending Verification', 'Pending Cash Verification', 'Partially Paid', 'Paid', 'Rejected', 'Refunded')),
  proof_storage_path text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  constraint onboarding_payment_verified_not_over_claim
    check (verified_amount_paise <= greatest(claimed_amount_paise, expected_amount_paise))
);

create index if not exists onboarding_payments_order_idx
  on public.onboarding_payments (order_reference, submitted_at desc);
create index if not exists onboarding_payments_wedding_idx
  on public.onboarding_payments (wedding_id);

create table if not exists public.onboarding_payment_audit (
  audit_id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.onboarding_payments(payment_id) on delete restrict,
  order_reference text not null references public.onboarding_orders(order_reference) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('verified', 'partially_verified', 'rejected')),
  previous_status text not null,
  next_status text not null,
  verified_amount_paise bigint not null check (verified_amount_paise >= 0),
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_payment_audit_payment_idx
  on public.onboarding_payment_audit (payment_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.onboarding_access_tokens (
  order_reference text primary key references public.onboarding_orders(order_reference) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_rate_limits (
  fingerprint text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (fingerprint, window_started_at)
);

create table if not exists public.notification_outbox (
  event_id uuid primary key default gen_random_uuid(),
  order_reference text not null references public.onboarding_orders(order_reference) on delete cascade,
  event_type text not null check (event_type in ('customer_order_confirmation')),
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  provider_message_ids jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  constraint notification_outbox_order_event_unique unique (order_reference, event_type)
);

create index if not exists notification_outbox_claim_idx
  on public.notification_outbox (available_at, created_at)
  where status in ('pending', 'failed');

create table if not exists public.onboarding_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.onboarding_packages enable row level security;
alter table public.onboarding_orders enable row level security;
alter table public.onboarding_payments enable row level security;
alter table public.onboarding_payment_audit enable row level security;
alter table public.onboarding_access_tokens enable row level security;
alter table public.onboarding_rate_limits enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.onboarding_admins enable row level security;

revoke all on public.onboarding_packages, public.onboarding_orders,
  public.onboarding_payments, public.onboarding_access_tokens,
  public.notification_outbox, public.onboarding_admins, public.onboarding_rate_limits
  from public, anon, authenticated;
revoke all on public.onboarding_payment_audit from public, anon, authenticated;
revoke all on public.customers from anon, authenticated;
revoke all on public.guests from anon, authenticated;
revoke all on public.rsvps from anon, authenticated;

create or replace function public.get_onboarding_packages()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'code', p.package_code,
    'name', p.display_name,
    'list_price_paise', p.list_price_paise,
    'discount_paise', p.discount_paise,
    'advance_paise', p.advance_paise,
    'features', p.features
  ) order by p.display_order), '[]'::jsonb)
  from public.onboarding_packages p
  where p.active
$$;

create or replace function public.provision_new_customer(
  p_input jsonb,
  p_idempotency_key uuid,
  p_dashboard_token text,
  p_client_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.onboarding_orders%rowtype;
  v_package public.onboarding_packages%rowtype;
  v_wedding_id text;
  v_source_id text;
  v_customer_id text;
  v_order_reference text;
  v_slug text;
  v_preview_guest_code text;
  v_payment_id uuid;
  v_email text;
  v_customer_name text;
  v_phone text;
  v_whatsapp text;
  v_city text;
  v_bride text;
  v_groom text;
  v_template text;
  v_theme text;
  v_theme_color text;
  v_payment_mode text;
  v_payment_status text;
  v_utr text;
  v_payable bigint;
  v_advance bigint;
  v_events jsonb;
  v_event jsonb;
  v_now timestamptz := now();
  v_access_hash text;
  v_request_hash text;
  v_outbox_event_id uuid;
  v_rate_count integer;
begin
  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'Invalid request.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_idempotency_key::text, 0)
  );

  if p_dashboard_token is null or length(p_dashboard_token) < 32
     or length(p_dashboard_token) > 200 then
    raise exception using errcode = '22023', message = 'Invalid request.';
  end if;

  v_request_hash := encode(extensions.digest(convert_to(p_input::text, 'UTF8'), 'sha256'), 'hex');
  select * into v_existing
  from public.onboarding_orders
  where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> v_request_hash then
      raise exception using errcode = '22023', message = 'This request key was already used for different order details.';
    end if;
    return jsonb_build_object(
      'success', true,
      'replayed', true,
      'order_reference', v_existing.order_reference,
      'customer_id', v_existing.customer_id,
      'wedding_id', v_existing.wedding_id,
      'preview_guest_code', (
        select g.invite_code
        from public.guests g
        where g.wedding_id = v_existing.wedding_id and g.category = 'preview'
        order by g.created_at limit 1
      ),
      'payment_status', v_existing.payment_status,
      'provisioning_status', v_existing.provisioning_status
    );
  end if;

  if p_client_fingerprint is null or length(p_client_fingerprint) < 32 then
    raise exception using errcode = '22023', message = 'Invalid request.';
  end if;

  insert into public.onboarding_rate_limits (fingerprint, window_started_at, request_count)
  values (p_client_fingerprint, date_trunc('hour', v_now), 1)
  on conflict (fingerprint, window_started_at)
  do update set request_count = public.onboarding_rate_limits.request_count + 1
  returning request_count into v_rate_count;
  if v_rate_count > 5 then
    raise exception using errcode = 'P0001', message = 'Too many requests. Please try again later.';
  end if;
  delete from public.onboarding_rate_limits
  where window_started_at < date_trunc('hour', v_now) - interval '24 hours';

  v_email := lower(btrim(coalesce(p_input->>'email', '')));
  v_customer_name := btrim(coalesce(p_input->>'customer_name', ''));
  v_phone := regexp_replace(coalesce(p_input->>'phone', ''), '[^0-9+]', '', 'g');
  v_whatsapp := regexp_replace(coalesce(p_input->>'whatsapp_phone', ''), '[^0-9+]', '', 'g');
  v_city := btrim(coalesce(p_input->>'city', ''));
  v_bride := btrim(coalesce(p_input->>'bride_name', ''));
  v_groom := btrim(coalesce(p_input->>'groom_name', ''));
  v_template := btrim(coalesce(p_input->>'template_style', ''));
  v_theme := btrim(coalesce(p_input->>'theme_name', ''));
  v_payment_mode := lower(btrim(coalesce(p_input->>'payment_mode', '')));
  v_utr := nullif(btrim(coalesce(p_input->>'utr', '')), '');
  v_events := p_input->'events';

  if length(v_customer_name) not between 2 and 120
     or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
     or length(v_phone) not between 8 and 16
     or length(v_city) not between 1 and 100
     or length(v_bride) not between 1 and 100
     or length(v_groom) not between 1 and 100
     or v_template not in ('template-01', 'template-02', 'template-03', 'template-04', 'template-05', 'template-06', 'template-07', 'template-08', 'template-09', 'template-10')
     or v_payment_mode not in ('upi', 'cash')
     or coalesce(jsonb_typeof(v_events), '') <> 'array' then
    raise exception using errcode = '22023', message = 'Please check the required onboarding fields.';
  end if;
  if jsonb_array_length(v_events) not between 1 and 40 then
    raise exception using errcode = '22023', message = 'Please provide between 1 and 40 events.';
  end if;
  if coalesce(p_input->>'preferred_contact', 'whatsapp') not in ('whatsapp', 'phone', 'email') then
    raise exception using errcode = '22023', message = 'Choose a valid contact preference.';
  end if;

  if (select count(*) from public.styles s where s.template_id = v_template) = 0
     or (select count(*) from public.themes t where t.theme_name = v_theme) = 0 then
    raise exception using errcode = '22023', message = 'The selected design is unavailable.';
  end if;

  select * into v_package
  from public.onboarding_packages
  where package_code = p_input->>'package_code'
    and active
  for share;
  if not found then
    raise exception using errcode = '22023', message = 'The selected package is unavailable.';
  end if;

  v_payable := v_package.list_price_paise - v_package.discount_paise;
  v_advance := v_package.advance_paise;
  v_payment_status := case
    when v_payment_mode = 'upi' then 'Pending Verification'
    else 'Pending Cash Verification'
  end;

  for v_event in select value from jsonb_array_elements(v_events)
  loop
    if jsonb_typeof(v_event) <> 'object'
       or length(btrim(coalesce(v_event->>'event_name', ''))) not between 1 and 100
       or coalesce(v_event->>'event_date', '') !~ '^\d{4}-\d{2}-\d{2}$'
       or (v_event ? 'event_time' and nullif(v_event->>'event_time', '') is not null
           and (v_event->>'event_time') !~ '^\d{2}:\d{2}(:\d{2})?$')
       or length(coalesce(v_event->>'note', '')) > 500 then
      raise exception using errcode = '22023', message = 'One or more event details are invalid.';
    end if;
  end loop;

  v_wedding_id := gen_random_uuid()::text;
  v_source_id := 'W-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_customer_id := 'C-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_order_reference := 'ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_slug := lower(v_source_id) || '-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_preview_guest_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));
  v_access_hash := encode(extensions.digest(convert_to(p_dashboard_token, 'UTF8'), 'sha256'), 'hex');

  select t.primary_color into v_theme_color
  from public.themes t
  where t.theme_name = v_theme;

  insert into public.weddings (
    id, source_id, couple_name, bride_name, groom_name, event_date,
    template_style, theme_name, theme_color
  )
  values (
    v_wedding_id,
    v_source_id,
    v_bride || ' & ' || v_groom,
    v_bride,
    v_groom,
    (p_input->>'event_date')::date,
    v_template,
    v_theme,
    v_theme_color
  );

  insert into public.wedding_details (
    wedding_id, status, host_name, bride_full, groom_full, bride_parents,
    groom_parents, ceremony_title, invocation, ceremony_time, venue_title,
    venue, address, map_url, slug
  )
  values (
    v_wedding_id,
    'active',
    nullif(btrim(coalesce(p_input->>'host_name', '')), ''),
    v_bride,
    v_groom,
    nullif(btrim(coalesce(p_input->>'bride_parents', '')), ''),
    nullif(btrim(coalesce(p_input->>'groom_parents', '')), ''),
    nullif(btrim(coalesce(p_input->>'ceremony_title', '')), ''),
    nullif(btrim(coalesce(p_input->>'invocation', '')), ''),
    nullif(p_input->>'ceremony_time', '')::time,
    nullif(btrim(coalesce(p_input->>'venue_title', '')), ''),
    nullif(btrim(coalesce(p_input->>'venue', '')), ''),
    nullif(btrim(coalesce(p_input->>'address', '')), ''),
    nullif(btrim(coalesce(p_input->>'map_url', '')), ''),
    v_slug
  );

  insert into public.guests (
    wedding_id, invite_code, guest_name, family_members, category, with_family
  )
  values (
    v_wedding_id, v_preview_guest_code, 'Sample Preview Guest', 1, 'preview', false
  );

  insert into public.events (
    wedding_id, sort_order, event_name, event_date, event_time, note
  )
  select v_wedding_id,
         ordinality::smallint,
         btrim(value->>'event_name'),
         (value->>'event_date')::date,
         nullif(value->>'event_time', '')::time,
         nullif(btrim(coalesce(value->>'note', '')), '')
  from jsonb_array_elements(v_events) with ordinality;

  insert into public.customers (
    customer_id, wedding_id, customer_name, phone, city, package,
    list_price_inr, discount_inr, advance_paid_inr, order_status,
    order_date, delivery_due, notes, email, whatsapp_phone, preferred_contact
  )
  values (
    v_customer_id,
    v_wedding_id,
    v_customer_name,
    v_phone,
    v_city,
    v_package.display_name,
    v_package.list_price_paise::numeric / 100,
    v_package.discount_paise::numeric / 100,
    0,
    'Pending',
    current_date,
    nullif(p_input->>'delivery_due', '')::date,
    null,
    v_email,
    nullif(v_whatsapp, ''),
    nullif(btrim(coalesce(p_input->>'preferred_contact', '')), '')
  );

  insert into public.rsvp_contacts (
    wedding_id, sort_order, contact_name, phone, is_primary
  )
  values (
    v_wedding_id,
    1,
    v_customer_name,
    coalesce(nullif(v_whatsapp, ''), v_phone),
    true
  );

  insert into public.onboarding_orders (
    order_reference, idempotency_key, request_hash, customer_id, wedding_id, email,
    package_code, payment_mode, order_status, payment_status,
    payable_total_paise, advance_expected_paise, advance_verified_paise,
    access_token_hash, access_expires_at
  )
  values (
    v_order_reference,
    p_idempotency_key,
    v_request_hash,
    v_customer_id,
    v_wedding_id,
    v_email,
    v_package.package_code,
    v_payment_mode,
    'Pending',
    v_payment_status,
    v_payable,
    v_advance,
    0,
    v_access_hash,
    v_now + interval '30 days'
  );

  insert into public.onboarding_access_tokens (
    order_reference, token_hash, expires_at
  )
  values (v_order_reference, v_access_hash, v_now + interval '30 days');

  insert into public.onboarding_payments (
    order_reference, customer_id, wedding_id, payment_mode,
    expected_amount_paise, claimed_amount_paise, verified_amount_paise,
    external_reference, payment_status
  )
  values (
    v_order_reference,
    v_customer_id,
    v_wedding_id,
    v_payment_mode,
    v_advance,
    case when v_payment_mode = 'upi' and v_utr is not null then v_advance else 0 end,
    0,
    case when v_payment_mode = 'upi' then v_utr else null end,
    v_payment_status
  )
  returning payment_id into v_payment_id;

  insert into public.notification_outbox (
    order_reference, event_type, payload
  )
  values (
    v_order_reference,
    'customer_order_confirmation',
    jsonb_build_object(
      'order_reference', v_order_reference,
      'customer_id', v_customer_id,
      'wedding_id', v_wedding_id,
      'wedding_slug', v_slug,
      'preview_guest_code', v_preview_guest_code,
      'customer_name', v_customer_name,
      'email', v_email,
      'phone', v_phone,
      'city', v_city,
      'bride_name', v_bride,
      'groom_name', v_groom,
      'event_date', p_input->>'event_date',
      'package_name', v_package.display_name,
      'list_price_paise', v_package.list_price_paise,
      'discount_paise', v_package.discount_paise,
      'advance_expected_paise', v_advance,
      'advance_verified_paise', 0,
      'balance_paise', v_payable,
      'payment_mode', v_payment_mode,
      'payment_status', v_payment_status,
      'utr', v_utr,
      'dashboard_token', p_dashboard_token
    )
  )
  returning event_id into v_outbox_event_id;

  return jsonb_build_object(
    'success', true,
    'replayed', false,
    'order_reference', v_order_reference,
    'customer_id', v_customer_id,
    'wedding_id', v_wedding_id,
    'wedding_slug', v_slug,
    'preview_guest_code', v_preview_guest_code,
    'payment_status', v_payment_status,
    'provisioning_status', 'Provisioned',
    'notification_status', 'pending',
    'notification_event_id', v_outbox_event_id,
    'payment_id', v_payment_id
  );
exception
  when unique_violation then
    select * into v_existing
    from public.onboarding_orders
    where idempotency_key = p_idempotency_key;
    if found then
      if v_existing.request_hash <> v_request_hash then
        raise exception using errcode = '22023', message = 'This request key was already used for different order details.';
      end if;
      return jsonb_build_object(
        'success', true,
        'replayed', true,
        'order_reference', v_existing.order_reference,
        'customer_id', v_existing.customer_id,
        'wedding_id', v_existing.wedding_id,
        'preview_guest_code', (
          select g.invite_code
          from public.guests g
          where g.wedding_id = v_existing.wedding_id and g.category = 'preview'
          order by g.created_at limit 1
        ),
        'payment_status', v_existing.payment_status,
        'provisioning_status', v_existing.provisioning_status
      );
    end if;
    raise exception using errcode = 'P0001', message = 'Unable to provision order; retry with the same request key.';
end;
$$;

create or replace function public.get_customer_dashboard(p_access_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.onboarding_orders%rowtype;
  v_customer public.customers%rowtype;
  v_wedding jsonb;
  v_events jsonb;
  v_guests jsonb;
  v_rsvps jsonb;
begin
  if p_access_token is null or length(p_access_token) < 32 then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  select o.* into v_order
  from public.onboarding_orders o
  join public.onboarding_access_tokens a on a.order_reference = o.order_reference
  where a.revoked_at is null
    and a.expires_at > now()
    and a.token_hash = encode(extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'), 'hex');
  if not found then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  select c.* into v_customer
  from public.customers c
  where c.customer_id = v_order.customer_id;
  select jsonb_build_object(
    'wedding', payload.value,
    'events', payload.value->'events'
  )
  into v_wedding
  from (select private.wedding_card_payload(v_order.wedding_id) as value) payload;
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_name', e.event_name, 'event_date', e.event_date,
    'event_time', e.event_time, 'note', e.note, 'sort_order', e.sort_order
  ) order by e.sort_order), '[]'::jsonb)
  into v_events from public.events e where e.wedding_id = v_order.wedding_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', g.id, 'guest_name', g.guest_name, 'family_members', g.family_members,
    'phone', g.phone, 'category', g.category, 'city_address', g.city_address,
    'with_family', g.with_family, 'invite_code', g.invite_code
  ) order by g.created_at), '[]'::jsonb)
  into v_guests from public.guests g where g.wedding_id = v_order.wedding_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'guest_name', g.guest_name, 'status', r.status,
    'attending_count', r.attending_count, 'wishes_message', r.wishes_message,
    'submitted_at', r.submitted_at
  ) order by r.submitted_at desc), '[]'::jsonb)
  into v_rsvps
  from public.rsvps r
  join public.guests g on lower(btrim(g.invite_code)) = lower(btrim(r.invite_code))
    and g.wedding_id = r.wedding_id
  where r.wedding_id = v_order.wedding_id;

  return jsonb_build_object(
    'order_reference', v_order.order_reference,
    'customer_id', v_customer.customer_id,
    'wedding_id', v_order.wedding_id,
    'wedding_slug', v_wedding->'wedding'->>'slug',
    'preview_guest_code', (
      select g.invite_code
      from public.guests g
      where g.wedding_id = v_order.wedding_id and g.category = 'preview'
      order by g.created_at limit 1
    ),
    'package_code', v_order.package_code,
    'package', v_customer.package,
    'event_date', v_wedding->'wedding'->>'event_date',
    'order_status', v_order.order_status,
    'payment_status', v_order.payment_status,
    'provisioning_status', v_order.provisioning_status,
    'invitation_status', v_order.invitation_status,
    'list_price_paise', round(v_customer.list_price_inr * 100)::bigint,
    'discount_paise', round(v_customer.discount_inr * 100)::bigint,
    'payable_total_paise', v_order.payable_total_paise,
    'advance_expected_paise', v_order.advance_expected_paise,
    'advance_verified_paise', v_order.advance_verified_paise,
    'balance_paise', greatest(0, v_order.payable_total_paise - v_order.advance_verified_paise),
    'wedding', v_wedding->'wedding',
    'events', v_events,
    'guests', v_guests,
    'rsvps', v_rsvps
  );
end;
$$;

create or replace function public.add_dashboard_guests(
  p_access_token text,
  p_guests jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.onboarding_orders%rowtype;
  v_row jsonb;
  v_count integer := 0;
  v_name text;
  v_family integer;
  v_phone text;
  v_category text;
  v_city text;
  v_code text;
  v_guest_id uuid;
  v_ids jsonb := '[]'::jsonb;
begin
  select o.* into v_order
  from public.onboarding_orders o
  join public.onboarding_access_tokens a on a.order_reference = o.order_reference
  where a.revoked_at is null and a.expires_at > now()
    and a.token_hash = encode(extensions.digest(convert_to(coalesce(p_access_token, ''), 'UTF8'), 'sha256'), 'hex');
  if not found then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  if coalesce(jsonb_typeof(p_guests), '') <> 'array' then
    raise exception using errcode = '22023', message = 'Provide between 1 and 500 guests.';
  end if;
  if jsonb_array_length(p_guests) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'Provide between 1 and 500 guests.';
  end if;
  for v_row in select value from jsonb_array_elements(p_guests)
  loop
    v_count := v_count + 1;
    v_name := btrim(coalesce(v_row->>'guest_name', ''));
    v_family := case when coalesce(v_row->>'family_members', '') ~ '^\d+$'
      then (v_row->>'family_members')::integer else 1 end;
    v_phone := btrim(coalesce(v_row->>'phone', ''));
    v_category := btrim(coalesce(v_row->>'category', 'person'));
    v_city := btrim(coalesce(v_row->>'city_address', ''));
    if length(v_name) not between 1 and 120
       or v_family not between 1 and 20
       or length(v_phone) > 24
       or length(v_category) > 60
       or length(v_city) > 250
       or (v_row ? 'with_family' and jsonb_typeof(v_row->'with_family') not in ('boolean', 'null')) then
      raise exception using errcode = '22023', message = 'Guest row contains invalid name, guest count, or contact details.';
    end if;
    if exists (
      select 1
      from public.guests g
      where g.wedding_id = v_order.wedding_id
        and lower(btrim(g.guest_name)) = lower(v_name)
        and regexp_replace(coalesce(g.phone, ''), '[^0-9]', '', 'g')
          = regexp_replace(coalesce(v_row->>'phone', ''), '[^0-9]', '', 'g')
    ) then
      raise exception using errcode = 'P0001', message = 'Guest list contains a duplicate name and phone number.';
    end if;
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));
    insert into public.guests (
      wedding_id, invite_code, guest_name, family_members, phone,
      category, city_address, with_family
    )
    values (
      v_order.wedding_id, v_code, v_name, v_family,
      nullif(v_phone, ''),
      coalesce(nullif(v_category, ''), 'person'),
      nullif(v_city, ''),
      coalesce((v_row->>'with_family')::boolean, v_family > 1)
    )
    returning id into v_guest_id;
    v_ids := v_ids || jsonb_build_array(jsonb_build_object(
      'id', v_guest_id,
      'guest_name', v_name,
      'family_members', v_family,
      'invite_code', v_code
    ));
  end loop;
  return jsonb_build_object('success', true, 'inserted', v_count, 'guests', v_ids);
end;
$$;

create or replace function public.delete_dashboard_guest(
  p_access_token text,
  p_guest_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wedding_id text;
begin
  select o.wedding_id into v_wedding_id
  from public.onboarding_orders o
  join public.onboarding_access_tokens a on a.order_reference = o.order_reference
  where a.revoked_at is null and a.expires_at > now()
    and a.token_hash = encode(extensions.digest(convert_to(coalesce(p_access_token, ''), 'UTF8'), 'sha256'), 'hex');
  if not found then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  delete from public.guests
  where id = p_guest_id and wedding_id = v_wedding_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Guest not found.';
  end if;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.update_dashboard_guest(
  p_access_token text,
  p_guest_id uuid,
  p_guest jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wedding_id text;
  v_name text;
  v_family integer;
  v_phone text;
  v_category text;
  v_city text;
begin
  select o.wedding_id into v_wedding_id
  from public.onboarding_orders o
  join public.onboarding_access_tokens a on a.order_reference = o.order_reference
  where a.revoked_at is null and a.expires_at > now()
    and a.token_hash = encode(extensions.digest(convert_to(coalesce(p_access_token, ''), 'UTF8'), 'sha256'), 'hex');
  if not found then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  v_name := btrim(coalesce(p_guest->>'guest_name', ''));
  v_family := case when coalesce(p_guest->>'family_members', '') ~ '^\d+$'
    then (p_guest->>'family_members')::integer else 1 end;
  v_phone := btrim(coalesce(p_guest->>'phone', ''));
  v_category := btrim(coalesce(p_guest->>'category', 'person'));
  v_city := btrim(coalesce(p_guest->>'city_address', ''));
  if length(v_name) not between 1 and 120
     or v_family not between 1 and 20
     or length(v_phone) > 24
     or length(v_category) > 60
     or length(v_city) > 250
     or (p_guest ? 'with_family' and jsonb_typeof(p_guest->'with_family') not in ('boolean', 'null')) then
    raise exception using errcode = '22023', message = 'Guest row contains invalid name, guest count, or contact details.';
  end if;
  if exists (
    select 1
    from public.guests g
    where g.wedding_id = v_wedding_id
      and g.id <> p_guest_id
      and lower(btrim(g.guest_name)) = lower(v_name)
      and regexp_replace(coalesce(g.phone, ''), '[^0-9]', '', 'g')
        = regexp_replace(v_phone, '[^0-9]', '', 'g')
  ) then
    raise exception using errcode = 'P0001', message = 'Another guest has the same name and phone number.';
  end if;
  update public.guests
  set guest_name = v_name,
      family_members = v_family,
  phone = nullif(v_phone, ''),
  category = coalesce(nullif(v_category, ''), 'person'),
  city_address = nullif(v_city, ''),
      with_family = coalesce((p_guest->>'with_family')::boolean, v_family > 1)
  where id = p_guest_id and wedding_id = v_wedding_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Guest not found.';
  end if;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.attach_onboarding_payment_proof(
  p_access_token text,
  p_order_reference text,
  p_payment_id uuid,
  p_storage_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.onboarding_orders o
    join public.onboarding_access_tokens a on a.order_reference = o.order_reference
    where o.order_reference = p_order_reference
      and a.revoked_at is null
      and a.expires_at > now()
      and a.token_hash = encode(extensions.digest(convert_to(coalesce(p_access_token, ''), 'UTF8'), 'sha256'), 'hex')
  ) then
    raise exception using errcode = '28000', message = 'Access link is invalid or expired.';
  end if;
  if p_storage_path is null
     or p_storage_path !~ ('^' || p_order_reference || '/[A-Za-z0-9._-]+$') then
    raise exception using errcode = '22023', message = 'Invalid payment proof path.';
  end if;
  update public.onboarding_payments
  set proof_storage_path = p_storage_path,
      claimed_amount_paise = expected_amount_paise
  where payment_id = p_payment_id
    and order_reference = p_order_reference
    and payment_mode = 'upi';
  if not found then
    raise exception using errcode = 'P0002', message = 'Payment record not found.';
  end if;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.verify_onboarding_payment(
  p_payment_id uuid,
  p_verified_amount_paise bigint,
  p_decision text,
  p_rejection_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.onboarding_payments%rowtype;
  v_order public.onboarding_orders%rowtype;
  v_verified_total bigint;
begin
  if not exists (
    select 1 from public.onboarding_admins a
    where a.user_id = auth.uid() and a.is_active
  ) then
    raise exception using errcode = '42501', message = 'Administrator access required.';
  end if;
  if p_decision not in ('verify', 'reject') then
    raise exception using errcode = '22023', message = 'Invalid payment decision.';
  end if;
  select * into v_payment
  from public.onboarding_payments
  where payment_id = p_payment_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Payment record not found.';
  end if;
  select * into v_order
  from public.onboarding_orders
  where order_reference = v_payment.order_reference
  for update;
  if v_payment.payment_status in ('Paid', 'Refunded', 'Rejected') then
    raise exception using errcode = '22023', message = 'Payment is already finalized.';
  end if;
  if p_decision = 'verify' then
    if p_verified_amount_paise is null or p_verified_amount_paise < 1
       or p_verified_amount_paise > v_payment.expected_amount_paise then
      raise exception using errcode = '22023', message = 'Verified amount is outside the allowed payment amount.';
    end if;
    update public.onboarding_payments
    set verified_amount_paise = p_verified_amount_paise,
        payment_status = case when p_verified_amount_paise >= v_payment.expected_amount_paise then 'Paid' else 'Partially Paid' end,
        verified_at = now(),
        verified_by = auth.uid(),
        rejection_reason = null
    where payment_id = p_payment_id;
  else
    if length(btrim(coalesce(p_rejection_reason, ''))) not between 3 and 500 then
      raise exception using errcode = '22023', message = 'Please provide a rejection reason.';
    end if;
    update public.onboarding_payments
    set payment_status = 'Rejected',
        verified_at = now(),
        verified_by = auth.uid(),
        rejection_reason = btrim(p_rejection_reason)
    where payment_id = p_payment_id;
  end if;

  select coalesce(sum(verified_amount_paise), 0)::bigint into v_verified_total
  from public.onboarding_payments
  where order_reference = v_payment.order_reference;
  update public.onboarding_orders
  set advance_verified_paise = v_verified_total,
      order_status = case
        when v_verified_total >= advance_expected_paise then 'Confirmed'
        else order_status
      end,
      payment_status = case
        when v_verified_total >= payable_total_paise then 'Paid'
        when v_verified_total > 0 then 'Partially Paid'
        when p_decision = 'reject' then 'Rejected'
        else payment_status
      end,
      updated_at = now()
  where order_reference = v_payment.order_reference;
  update public.customers
  set advance_paid_inr = v_verified_total::numeric / 100,
      order_status = case
        when v_verified_total >= v_order.advance_expected_paise then 'Confirmed'
        else order_status
      end
  where customer_id = v_order.customer_id;
  insert into public.onboarding_payment_audit (
    payment_id, order_reference, actor_user_id, action,
    previous_status, next_status, verified_amount_paise, reason
  )
  select v_payment.payment_id,
         v_payment.order_reference,
         auth.uid(),
         case
           when p_decision = 'reject' then 'rejected'
           when p_verified_amount_paise >= v_payment.expected_amount_paise then 'verified'
           else 'partially_verified'
         end,
         v_payment.payment_status,
         p.payment_status,
         case when p_decision = 'verify' then p_verified_amount_paise else v_payment.verified_amount_paise end,
         case when p_decision = 'reject' then btrim(p_rejection_reason) else null end
  from public.onboarding_payments p
  where p.payment_id = v_payment.payment_id;
  return jsonb_build_object('success', true, 'verified_amount_paise', v_verified_total);
end;
$$;

create or replace function public.get_admin_payment_queue()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_queue jsonb;
begin
  if not exists (
    select 1 from public.onboarding_admins a
    where a.user_id = auth.uid() and a.is_active
  ) then
    raise exception using errcode = '42501', message = 'Administrator access required.';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'payment_id', p.payment_id,
    'order_reference', p.order_reference,
    'customer_id', p.customer_id,
    'wedding_id', p.wedding_id,
    'customer_name', c.customer_name,
    'customer_email', c.email,
    'customer_phone', c.phone,
    'city', c.city,
    'couple_name', w.couple_name,
    'event_date', w.event_date,
    'package', c.package,
    'payment_mode', p.payment_mode,
    'expected_amount_paise', p.expected_amount_paise,
    'claimed_amount_paise', p.claimed_amount_paise,
    'verified_amount_paise', p.verified_amount_paise,
    'external_reference', p.external_reference,
    'proof_storage_path', p.proof_storage_path,
    'payment_status', p.payment_status,
    'submitted_at', p.submitted_at
  ) order by p.submitted_at), '[]'::jsonb)
  into v_queue
  from public.onboarding_payments p
  join public.customers c on c.customer_id = p.customer_id
  join public.weddings w on w.id = p.wedding_id
  where p.payment_status in ('Pending Verification', 'Pending Cash Verification', 'Partially Paid');
  return v_queue;
end;
$$;

create or replace function public.claim_notification_outbox(p_event_id uuid default null)
returns table(event_id uuid, order_reference text, payload jsonb, attempts integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with next_event as (
    select o.event_id
    from public.notification_outbox o
    where (
        (o.status in ('pending', 'failed') and o.available_at <= now())
        or (o.status = 'processing' and o.locked_at < now() - interval '15 minutes')
      )
      and o.attempts < 10
      and (p_event_id is null or o.event_id = p_event_id)
    order by o.created_at
    for update skip locked
    limit 1
  )
  update public.notification_outbox o
  set status = 'processing',
      attempts = o.attempts + 1,
      locked_at = now()
  from next_event n
  where o.event_id = n.event_id
  returning o.event_id, o.order_reference, o.payload, o.attempts;
end;
$$;

create or replace function public.finish_notification_outbox(
  p_event_id uuid,
  p_success boolean,
  p_provider_message_ids jsonb default '{}'::jsonb,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notification_outbox
  set status = case when p_success then 'sent' else 'failed' end,
      sent_at = case when p_success then now() else null end,
      available_at = case
        when p_success then available_at
        else now() + make_interval(mins => least(60, greatest(1, attempts * 5)))
      end,
      provider_message_ids = case when p_success then p_provider_message_ids else provider_message_ids end,
      last_error = case when p_success then null else left(coalesce(p_error, 'Delivery failed'), 500) end,
      locked_at = null,
      payload = case when p_success or attempts >= 10 then payload - 'dashboard_token' else payload end
  where event_id = p_event_id and status = 'processing';
  if not found then
    raise exception using errcode = 'P0002', message = 'Notification event not found or not claimed.';
  end if;
  return jsonb_build_object('success', true, 'status', case when p_success then 'sent' else 'failed' end);
end;
$$;

revoke all on function public.get_onboarding_packages() from public;
revoke all on function public.provision_new_customer(jsonb, uuid, text, text) from public, anon, authenticated;
revoke all on function public.get_customer_dashboard(text) from public, anon, authenticated;
revoke all on function public.add_dashboard_guests(text, jsonb) from public, anon, authenticated;
revoke all on function public.delete_dashboard_guest(text, uuid) from public, anon, authenticated;
revoke all on function public.update_dashboard_guest(text, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.attach_onboarding_payment_proof(text, text, uuid, text) from public, anon, authenticated;
revoke all on function public.verify_onboarding_payment(uuid, bigint, text, text) from public, anon, authenticated;
revoke all on function public.get_admin_payment_queue() from public, anon, authenticated;
revoke all on function public.claim_notification_outbox(uuid) from public, anon, authenticated;
revoke all on function public.finish_notification_outbox(uuid, boolean, jsonb, text) from public, anon, authenticated;

grant execute on function public.get_onboarding_packages() to anon, authenticated;
grant execute on function public.get_onboarding_packages() to service_role;
grant execute on function public.provision_new_customer(jsonb, uuid, text, text) to service_role;
grant execute on function public.get_customer_dashboard(text) to service_role;
grant execute on function public.add_dashboard_guests(text, jsonb) to service_role;
grant execute on function public.delete_dashboard_guest(text, uuid) to service_role;
grant execute on function public.update_dashboard_guest(text, uuid, jsonb) to service_role;
grant execute on function public.attach_onboarding_payment_proof(text, text, uuid, text) to service_role;
grant execute on function public.verify_onboarding_payment(uuid, bigint, text, text) to authenticated, service_role;
grant execute on function public.get_admin_payment_queue() to authenticated, service_role;
grant execute on function public.claim_notification_outbox(uuid) to service_role;
grant execute on function public.finish_notification_outbox(uuid, boolean, jsonb, text) to service_role;

commit;
