-- Run after supabase-schema.sql and after importing the CSV files.
-- This syncs the sample wedding card/programme and preserves the public RPC contract.

begin;

alter table public.weddings
  add column if not exists updated_at timestamptz not null default now();

insert into public.weddings (
  id,
  source_id,
  couple_name,
  bride_name,
  groom_name,
  event_date,
  template_style,
  theme_name,
  theme_color
)
values (
  '14a3f460-81e0-472d-b469-0820a7aca687',
  'W-0001',
  'Tarana & Akbar',
  'Tarana',
  'Akbar',
  date '2026-10-27',
  'template-02',
  'maroon',
  '#7A1426'
)
on conflict (id) do update
set source_id = excluded.source_id,
    couple_name = excluded.couple_name,
    bride_name = excluded.bride_name,
    groom_name = excluded.groom_name,
    event_date = excluded.event_date,
    template_style = excluded.template_style,
    theme_name = excluded.theme_name,
    theme_color = excluded.theme_color,
    updated_at = now();

insert into public.wedding_details (
  wedding_id,
  status,
  host_name,
  host_address,
  bride_full,
  groom_full,
  bride_parents,
  groom_parents,
  ceremony_title,
  invocation,
  message,
  ceremony_time,
  venue_title,
  venue,
  address,
  map_url,
  compliments,
  footer_text,
  frame_image,
  image1,
  image2,
  image3,
  image4,
  image5,
  slug,
  share_message,
  music_url
)
values (
  '14a3f460-81e0-472d-b469-0820a7aca687',
  'active',
  'Mrs. & Mr. Md Kalim Khan',
  null,
  'Dr. Tarana Khatoon',
  'Md Akbar Ansari',
  '(D/o Mrs. & Mr. Md Kalim Khan, Howrah, West Bengal)',
  '(S/o Mrs. & Mr. Md Moin Ansari, Ramgarh, Jharkhand)',
  'Marriage Ceremony',
  'In the name of Allah the most beneficent & merciful',
  null,
  time '21:30:00',
  'Banquet Hall',
  'Shuubh Arambh Banquet',
  '131, Belilious Rd, Tikiapara, Howrah',
  'https://maps.app.goo.gl/DEwWDrJ1V8omQNgVA',
  'Kalim Fish Seed, Howrah Fish Market',
  'Md Kalim Khan & Family',
  null,
  null,
  null,
  null,
  null,
  null,
  'tarana-akbar-w0001',
  null,
  null
)
on conflict (wedding_id) do update
set status = excluded.status,
    host_name = excluded.host_name,
    host_address = excluded.host_address,
    bride_full = excluded.bride_full,
    groom_full = excluded.groom_full,
    bride_parents = excluded.bride_parents,
    groom_parents = excluded.groom_parents,
    ceremony_title = excluded.ceremony_title,
    invocation = excluded.invocation,
    message = excluded.message,
    ceremony_time = excluded.ceremony_time,
    venue_title = excluded.venue_title,
    venue = excluded.venue,
    address = excluded.address,
    map_url = excluded.map_url,
    compliments = excluded.compliments,
    footer_text = excluded.footer_text,
    frame_image = excluded.frame_image,
    image1 = excluded.image1,
    image2 = excluded.image2,
    image3 = excluded.image3,
    image4 = excluded.image4,
    image5 = excluded.image5,
    slug = excluded.slug,
    share_message = excluded.share_message,
    music_url = excluded.music_url;

delete from public.events
where wedding_id = '14a3f460-81e0-472d-b469-0820a7aca687';

insert into public.events (
  wedding_id,
  sort_order,
  event_name,
  event_date,
  event_time,
  note
)
values
  ('14a3f460-81e0-472d-b469-0820a7aca687', 1, 'Milaad Sharif', date '2026-10-24', time '21:00:00', 'Baad Namaz-e-Isha'),
  ('14a3f460-81e0-472d-b469-0820a7aca687', 2, 'Rasm-e-Haldi', date '2026-10-25', time '06:00:00', ''),
  ('14a3f460-81e0-472d-b469-0820a7aca687', 3, 'Rasm-e-Mehndi', date '2026-10-26', time '18:00:00', ''),
  ('14a3f460-81e0-472d-b469-0820a7aca687', 4, 'Nikah', date '2026-10-27', time '21:30:00', 'Baraat 8:00 PM, Dinner 8:30 PM'),
  ('14a3f460-81e0-472d-b469-0820a7aca687', 5, 'Rukhsati', date '2026-10-28', time '08:00:00', '');

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
    'time', case
      when d.ceremony_time is null then ''
      else to_char(d.ceremony_time, 'HH24:MI')
    end,
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
        'event_time', case
          when e.event_time is null then ''
          else to_char(e.event_time, 'HH24:MI')
        end,
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

revoke all on function private.wedding_card_payload(text)
  from public, anon, authenticated;

create or replace function public.lookup_wedding(p_wedding_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wedding', payload.value,
    'events', payload.value->'events'
  )
  from public.weddings w
  cross join lateral (
    select private.wedding_card_payload(w.id) as value
  ) payload
  where w.id = p_wedding_id
$$;

-- Remove the legacy parameter-order overload so PostgREST can resolve
-- named-argument RPC calls to a single function.
drop function if exists public.submit_invitation_rsvp(integer, text, text, text);

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
  where p_invite_code is not null
    and lower(btrim(g.invite_code)) = lower(btrim(p_invite_code))
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
  v_status text;
  v_wishes_message text;
begin
  if p_invite_code is null or length(btrim(p_invite_code)) = 0 then
    raise exception 'A valid invitation code is required.';
  end if;

  if length(btrim(p_invite_code)) > 120 then
    raise exception 'Invitation code is too long.';
  end if;

  v_status := lower(btrim(coalesce(p_status, '')));
  if v_status not in ('attending', 'declined', 'tentative') then
    raise exception 'Choose attending, declined, or tentative.';
  end if;

  v_wishes_message := btrim(coalesce(p_wishes_message, ''));
  if char_length(v_wishes_message) > 1000 then
    raise exception 'Wishes message must be 1000 characters or fewer.';
  end if;

  select g.wedding_id, g.invite_code, g.family_members
    into v_guest
  from public.guests g
  where lower(btrim(g.invite_code)) = lower(btrim(p_invite_code))
  limit 1;

  if not found then
    raise exception 'Invitation code was not found.';
  end if;

  if v_status = 'attending' then
    if p_attending_count is null
      or p_attending_count < 1
      or p_attending_count > v_guest.family_members then
      raise exception 'Guest count exceeds the invitation limit.';
    end if;
  elsif coalesce(p_attending_count, 0) <> 0 then
    raise exception 'Attendee count must be zero unless attending.';
  end if;

  insert into public.rsvps (
    wedding_id,
    invite_code,
    status,
    attending_count,
    wishes_message
  )
  values (
    v_guest.wedding_id,
    v_guest.invite_code,
    v_status,
    case when v_status = 'attending' then p_attending_count else 0 end,
    v_wishes_message
  )
  on conflict (wedding_id, (lower(btrim(invite_code))))
  do update set
    status = excluded.status,
    attending_count = excluded.attending_count,
    wishes_message = excluded.wishes_message,
    submitted_at = now(),
    updated_at = now();

  return jsonb_build_object(
    'success', true,
    'message', 'Your RSVP has been saved.'
  );
end;
$$;

revoke all on public.themes, public.styles, public.weddings,
  public.wedding_details, public.guests, public.events,
  public.rsvp_contacts, public.customers, public.rsvps
  from anon, authenticated;

revoke all on function public.lookup_invitation(text)
  from public, anon, authenticated;
revoke all on function public.lookup_wedding(text)
  from public, anon, authenticated;
revoke all on function public.submit_invitation_rsvp(text, text, integer, text)
  from public, anon, authenticated;

grant execute on function public.lookup_invitation(text)
  to anon, authenticated;
grant execute on function public.lookup_wedding(text)
  to anon, authenticated;
grant execute on function public.submit_invitation_rsvp(text, text, integer, text)
  to anon, authenticated;

notify pgrst, 'reload schema';

commit;
