-- Run this in the Supabase SQL Editor to fix the live RSVP RPC ambiguity.
-- The old overload used argument types (integer, text, text, text); the
-- application uses (text, text, integer, text).

begin;

drop function if exists public.submit_invitation_rsvp(integer, text, text, text);

notify pgrst, 'reload schema';

commit;
