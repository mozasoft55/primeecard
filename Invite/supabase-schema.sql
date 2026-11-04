create table if not exists public.themes (
  theme_name text primary key,
  primary_color text not null,
  primary_dark_color text not null,
  accent_color text not null,
  paper_top_color text not null,
  paper_bottom_color text not null,
  text_color text not null,
  note text,
  constraint themes_hex_colors_check check (
    primary_color ~ '^#[0-9A-Fa-f]{6}$'
    and primary_dark_color ~ '^#[0-9A-Fa-f]{6}$'
    and accent_color ~ '^#[0-9A-Fa-f]{6}$'
    and paper_top_color ~ '^#[0-9A-Fa-f]{6}$'
    and paper_bottom_color ~ '^#[0-9A-Fa-f]{6}$'
    and text_color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

create table if not exists public.styles (
  template_id text primary key,
  style_name text not null,
  css_class text,
  look text,
  best_for text
);

create table if not exists public.weddings (
  id text primary key,
  source_id text,
  couple_name text not null,
  bride_name text,
  groom_name text,
  event_date date not null,
  template_style text not null default 'template-02',
  theme_name text,
  theme_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weddings_template_style_check check (
    template_style in (
      'template-01', 'template-02', 'template-03', 'template-04', 'template-05',
      'template-06', 'template-07', 'template-08', 'template-09', 'template-10'
    )
  ),
  constraint weddings_theme_color_check check (
    theme_color is null or theme_color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

alter table public.weddings add column if not exists bride_name text;
alter table public.weddings add column if not exists groom_name text;
alter table public.weddings add column if not exists theme_name text;
alter table public.weddings add column if not exists source_id text;
alter table public.weddings add column if not exists created_at timestamptz not null default now();
alter table public.weddings add column if not exists updated_at timestamptz not null default now();
create unique index if not exists weddings_source_id_unique
  on public.weddings (source_id) where source_id is not null;

create table if not exists public.wedding_details (
  wedding_id text primary key references public.weddings(id) on delete cascade,
  status text not null default 'active',
  host_name text,
  host_address text,
  bride_full text,
  groom_full text,
  bride_parents text,
  groom_parents text,
  ceremony_title text,
  invocation text,
  message text,
  ceremony_time time,
  venue_title text,
  venue text,
  address text,
  map_url text,
  compliments text,
  footer_text text,
  frame_image text,
  image1 text,
  image2 text,
  image3 text,
  image4 text,
  image5 text,
  slug text,
  share_message text,
  music_url text
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null references public.weddings(id) on delete cascade,
  invite_code text not null,
  guest_name text not null,
  family_members integer not null default 1 check (family_members between 1 and 20),
  phone text,
  category text not null default 'person',
  city_address text,
  with_family boolean not null default false,
  rsvp_status_manual text,
  invite_sent boolean not null default false,
  created_at timestamptz not null default now(),
  constraint guests_invite_code_not_blank check (length(btrim(invite_code)) > 0)
);

alter table public.guests add column if not exists city_address text;
alter table public.guests add column if not exists with_family boolean not null default false;
alter table public.guests add column if not exists rsvp_status_manual text;
alter table public.guests add column if not exists invite_sent boolean not null default false;
alter table public.guests add column if not exists created_at timestamptz not null default now();

create unique index if not exists guests_invite_code_unique
  on public.guests (lower(btrim(invite_code)));
create index if not exists guests_wedding_id_idx on public.guests (wedding_id);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null references public.weddings(id) on delete cascade,
  sort_order smallint not null check (sort_order > 0),
  event_name text not null,
  event_date date not null,
  event_time time,
  note text,
  constraint events_wedding_sort_order_unique unique (wedding_id, sort_order)
);

create index if not exists events_wedding_schedule_idx
  on public.events (wedding_id, sort_order);

create table if not exists public.rsvp_contacts (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null references public.weddings(id) on delete cascade,
  sort_order smallint not null check (sort_order > 0),
  contact_name text,
  phone text not null,
  is_primary boolean not null default false,
  constraint rsvp_contacts_wedding_sort_order_unique unique (wedding_id, sort_order)
);

create index if not exists rsvp_contacts_wedding_id_idx
  on public.rsvp_contacts (wedding_id, sort_order);

create unique index if not exists rsvp_contacts_one_primary_per_wedding
  on public.rsvp_contacts (wedding_id) where is_primary;

create table if not exists public.customers (
  customer_id text primary key,
  wedding_id text not null references public.weddings(id) on delete restrict,
  customer_name text not null,
  phone text,
  city text,
  package text,
  list_price_inr numeric(12, 2) not null default 0 check (list_price_inr >= 0),
  discount_inr numeric(12, 2) not null default 0 check (discount_inr >= 0),
  advance_paid_inr numeric(12, 2) not null default 0 check (advance_paid_inr >= 0),
  order_status text not null,
  order_date date,
  delivery_due date,
  notes text,
  created_at timestamptz not null default now(),
  constraint customers_discount_within_price check (discount_inr <= list_price_inr),
  constraint customers_advance_within_net_price check (
    advance_paid_inr <= list_price_inr - discount_inr
  )
);

create index if not exists customers_wedding_id_idx on public.customers (wedding_id);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id text not null references public.weddings(id) on delete cascade,
  invite_code text not null,
  status text not null check (status in ('attending', 'declined', 'tentative')),
  attending_count integer not null default 0 check (attending_count between 0 and 20),
  wishes_message text not null default '' check (char_length(wishes_message) <= 1000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rsvps drop constraint if exists rsvps_one_per_invitation;
create unique index if not exists rsvps_one_per_invitation
  on public.rsvps (wedding_id, lower(btrim(invite_code)));
create index if not exists rsvps_wedding_id_idx on public.rsvps (wedding_id);

alter table public.themes enable row level security;
alter table public.styles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_details enable row level security;
alter table public.guests enable row level security;
alter table public.events enable row level security;
alter table public.rsvp_contacts enable row level security;
alter table public.customers enable row level security;
alter table public.rsvps enable row level security;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.wedding_card_payload(p_wedding_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', w.id,
    'couple_name', w.couple_name,
    'bride_name', w.bride_name,
    'groom_name', w.groom_name,
    'event_date', w.event_date,
    'date', w.event_date,
    'time', case when d.ceremony_time is null then '' else to_char(d.ceremony_time, 'HH24:MI') end,
    'template_style', w.template_style,
    'template_id', w.template_style,
    'theme_name', w.theme_name,
    'theme', w.theme_name,
    'theme_color', coalesce(w.theme_color, t.primary_color),
    'theme_colors', jsonb_build_object(
      'primary', coalesce(w.theme_color, t.primary_color, '#7a1426'),
      'primary_dark', coalesce(t.primary_dark_color, '#3f0713'),
      'accent', coalesce(t.accent_color, '#b98a2f'),
      'paper_top', coalesce(t.paper_top_color, '#fffdf8'),
      'paper_bottom', coalesce(t.paper_bottom_color, '#f2dfbf'),
      'text', coalesce(t.text_color, '#3b1a1f')
    ),
    'bride_full', d.bride_full,
    'groom_full', d.groom_full,
    'bride_parents', d.bride_parents,
    'groom_parents', d.groom_parents,
    'host_name', d.host_name,
    'host_address', d.host_address,
    'ceremony_title', d.ceremony_title,
    'invocation', d.invocation,
    'message', d.message,
    'venue_title', d.venue_title,
    'venue', d.venue,
    'address', d.address,
    'map_url', d.map_url,
    'compliments', d.compliments,
    'footer_text', d.footer_text,
    'frame_image', d.frame_image,
    'image1', d.image1,
    'image2', d.image2,
    'image3', d.image3,
    'image4', d.image4,
    'image5', d.image5,
    'slug', d.slug,
    'share_message', d.share_message,
    'music_url', d.music_url,
    'rsvp_contacts', coalesce((
      select string_agg(
        concat_ws(': ', nullif(btrim(c.contact_name), ''), nullif(btrim(c.phone), '')),
        E'\n' order by c.sort_order
      )
      from public.rsvp_contacts c
      where c.wedding_id = w.id
    ), ''),
    'rsvp_number', coalesce((
      select c.phone
      from public.rsvp_contacts c
      where c.wedding_id = w.id and c.is_primary
      order by c.sort_order
      limit 1
    ), ''),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_name', e.event_name,
        'event_date', e.event_date,
        'event_time', case when e.event_time is null then '' else to_char(e.event_time, 'HH24:MI') end,
        'note', coalesce(e.note, '')
      ) order by e.sort_order)
      from public.events e
      where e.wedding_id = w.id
    ), '[]'::jsonb)
  )
  from public.weddings w
  left join public.wedding_details d on d.wedding_id = w.id
  left join public.themes t on t.theme_name = w.theme_name
  where w.id = p_wedding_id
$$;

create or replace function public.lookup_wedding(p_wedding_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('wedding', payload.value, 'events', payload.value->'events')
  from public.weddings w
  cross join lateral (
    select private.wedding_card_payload(w.id) as value
  ) payload
  where w.id = p_wedding_id
$$;

create or replace function public.lookup_invitation(p_invite_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'guest', jsonb_build_object(
      'wedding_id', g.wedding_id,
      'invite_code', g.invite_code,
      'guest_name', g.guest_name,
      'family_members', g.family_members,
      'category', g.category,
      'with_family', g.with_family
    ),
    'wedding', payload.value,
    'events', payload.value->'events'
  )
  from public.guests g
  cross join lateral (
    select private.wedding_card_payload(g.wedding_id) as value
  ) payload
  where lower(btrim(g.invite_code)) = lower(btrim(p_invite_code))
  limit 1
$$;

create or replace function public.submit_invitation_rsvp(
  p_invite_code text,
  p_status text,
  p_attending_count integer,
  p_wishes_message text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest record;
begin
  if p_status is null or p_status not in ('attending', 'declined', 'tentative') then
    raise exception 'Choose attending, declined, or tentative.';
  end if;

  select g.wedding_id, g.invite_code, g.family_members
    into v_guest
  from public.guests g
  where lower(btrim(g.invite_code)) = lower(btrim(p_invite_code));

  if not found then
    raise exception 'Invitation code was not found.';
  end if;

  if p_status = 'attending' then
    if p_attending_count is null
      or p_attending_count < 1
      or p_attending_count > v_guest.family_members then
      raise exception 'Guest count exceeds the invitation limit.';
    end if;
  elsif coalesce(p_attending_count, 0) <> 0 then
    raise exception 'Attendee count must be zero unless attending.';
  end if;

  if char_length(coalesce(p_wishes_message, '')) > 1000 then
    raise exception 'Wishes message must be 1000 characters or fewer.';
  end if;

  insert into public.rsvps (
    wedding_id, invite_code, status, attending_count, wishes_message
  )
  values (
    v_guest.wedding_id,
    v_guest.invite_code,
    p_status,
    case when p_status = 'attending' then p_attending_count else 0 end,
    btrim(coalesce(p_wishes_message, ''))
  )
  on conflict (wedding_id, (lower(btrim(invite_code))))
  do update set
    status = excluded.status,
    attending_count = excluded.attending_count,
    wishes_message = excluded.wishes_message,
    submitted_at = now(),
    updated_at = now();

  return jsonb_build_object('success', true, 'message', 'Your RSVP has been saved.');
end;
$$;

revoke all on public.themes, public.styles, public.weddings, public.wedding_details,
  public.guests, public.events, public.rsvp_contacts, public.customers, public.rsvps
  from anon, authenticated;

revoke all on function private.wedding_card_payload(text) from public, anon, authenticated;
revoke all on function public.lookup_wedding(text) from public;
revoke all on function public.lookup_invitation(text) from public;
revoke all on function public.submit_invitation_rsvp(text, text, integer, text) from public;
grant execute on function public.lookup_wedding(text) to anon, authenticated;
grant execute on function public.lookup_invitation(text) to anon, authenticated;
grant execute on function public.submit_invitation_rsvp(text, text, integer, text) to anon, authenticated;
