// Call this once on the guest-facing invitation page (the page that reads ?code=XXXX).
//
//   import { trackInviteOpen } from './dashboard/track-invite-open.js';
//   trackInviteOpen(new URLSearchParams(location.search).get('code'));
//
// It records "this guest opened their link" so the dashboard can tell
// "opened, no reply" apart from "link not opened". Counted once per browser session.
import { ONBOARDING_CONFIG } from '../onboarding-config.js';

export function trackInviteOpen(code) {
  const inviteCode = String(code || '').trim();
  if (!inviteCode) return;
  const marker = 'invite-open-' + inviteCode;
  try {
    if (sessionStorage.getItem(marker)) return;
    sessionStorage.setItem(marker, '1');
  } catch (e) { /* storage blocked: still track, just not de-duplicated */ }

  const base = ONBOARDING_CONFIG.supabaseUrl
    || (ONBOARDING_CONFIG.dashboardEndpoint ? ONBOARDING_CONFIG.dashboardEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
  fetch(base + '/rest/v1/rpc/track_invite_open', {
    method: 'POST',
    headers: {
      'apikey': ONBOARDING_CONFIG.publishableKey,
      'Authorization': 'Bearer ' + ONBOARDING_CONFIG.publishableKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_invite_code: inviteCode }),
    keepalive: true
  }).catch(() => { /* tracking must never break the invitation */ });
}