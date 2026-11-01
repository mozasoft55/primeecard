import { SUPABASE_CONFIG } from './supabase-config.js';

const REQUEST_TIMEOUT_MS = 15000;
const THEME_COLOR_KEYS = ['primary', 'primary_dark', 'accent', 'paper_top', 'paper_bottom', 'text'];

function cleanText(value, maxLength) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function isValidIsoDate(value) {
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return false;
  const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  return date.getFullYear() === Number(parts[1])
    && date.getMonth() === Number(parts[2]) - 1
    && date.getDate() === Number(parts[3]);
}

function normalizeDate(value) {
  const raw = cleanText(value, 40);
  if (isValidIsoDate(raw)) return raw;
  const namedMonth = raw.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{4})$/);
  const numeric = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  let iso = '';
  if (namedMonth) {
    const month = new Date(`${namedMonth[2]} 1, 2000`).getMonth();
    if (!Number.isNaN(month)) {
      iso = `${namedMonth[3]}-${String(month + 1).padStart(2, '0')}-${namedMonth[1].padStart(2, '0')}`;
    }
  } else if (numeric) {
    iso = `${numeric[3]}-${numeric[2].padStart(2, '0')}-${numeric[1].padStart(2, '0')}`;
  } else {
    const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s]/);
    if (isoDate) iso = `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
  }
  return isValidIsoDate(iso) ? iso : '';
}

function normalizeTime(value) {
  const raw = cleanText(value, 40);
  const twelveHour = raw.match(/^(0?[1-9]|1[0-2])(?::([0-5]\d))?\s*([AP]M)$/i);
  if (twelveHour) return `${Number(twelveHour[1])}:${twelveHour[2] || '00'} ${twelveHour[3].toUpperCase()}`;
  const twentyFourHour = raw.match(/^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (!twentyFourHour) return '';
  const hour = Number(twentyFourHour[1]);
  return `${hour % 12 || 12}:${twentyFourHour[2]} ${hour < 12 ? 'AM' : 'PM'}`;
}

function normalizeWeddingRecord(record) {
  const coupleName = cleanText(record.couple_name, 200);
  const names = coupleName.split(/\s*&\s*/, 2);
  const color = /^#[\da-f]{6}$/i.test(String(record.theme_color || '')) ? record.theme_color : '';
  const sourceColors = record.theme_colors && typeof record.theme_colors === 'object'
    ? record.theme_colors
    : {};
  const themeColors = Object.fromEntries(THEME_COLOR_KEYS
    .map(key => [key, sourceColors[key]])
    .filter(([, value]) => /^#[\da-f]{6}$/i.test(String(value || ''))));
  if (color) themeColors.primary = color;

  return {
    ...record,
    bride_name: cleanText(record.bride_name || names[0], 100),
    groom_name: cleanText(record.groom_name || names[1], 100),
    bride_full: cleanText(record.bride_full, 140),
    groom_full: cleanText(record.groom_full, 140),
    date: normalizeDate(record.event_date || record.date),
    time: normalizeTime(record.time),
    venue: cleanText(record.venue, 180),
    address: cleanText(record.address, 500),
    map_url: cleanText(record.map_url, 2000),
    rsvp_contacts: cleanText(record.rsvp_contacts, 1200),
    rsvp_number: cleanText(record.rsvp_number, 40).replace(/[^\d+]/g, ''),
    theme_colors: Object.keys(themeColors).length ? themeColors : undefined,
    theme_color: color,
    message: cleanText(record.message, 1200),
    share_message: cleanText(record.share_message, 1200),
    template_id: cleanText(record.template_style || record.template_id, 30) || 'template-02',
    theme: cleanText(record.theme_name || record.theme, 40)
  };
}

function normalizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events
    .filter(event => event && typeof event === 'object' && !Array.isArray(event))
    .map(event => ({
      ...event,
      event_name: cleanText(event.event_name, 100),
      event_date: normalizeDate(event.event_date),
      event_time: normalizeTime(event.event_time),
      note: cleanText(event.note, 300)
    }));
}

function assertSupabaseConfig() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('PASTE_')) {
    throw new Error('Supabase is not configured. Add your project publishable/anon key in supabase-config.js.');
  }
}

async function supabaseRequest(path, { method = 'GET', body } = {}) {
  assertSupabaseConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${path}`, {
      method,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) {
      let message = `Supabase returned HTTP ${response.status}.`;
      try {
        const error = await response.json();
        if (error.message) message = error.message;
      } catch {
        // Preserve the HTTP status when the service response is not JSON.
      }
      throw new Error(message);
    }
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Supabase took too long to respond. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeWeddingPayload(data) {
  if (!data || !data.wedding || typeof data.wedding !== 'object') {
    throw new Error('Wedding record not found.');
  }
  return {
    ...data,
    wedding: normalizeWeddingRecord(data.wedding),
    events: normalizeEvents(data.events)
  };
}

function normalizeInvitation(data) {
  if (!data || !data.guest || !data.wedding) {
    throw new Error('This invitation code was not found. Please check the link and try again.');
  }
  const guest = data.guest;
  const capacity = Number(guest.family_members);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
    throw new Error('This invitation has an invalid guest limit.');
  }
  return {
    ...normalizeWeddingPayload(data),
    guest: {
      ...guest,
      name: cleanText(guest.guest_name, 100),
      invite_code: cleanText(guest.invite_code, 120),
      persons: capacity,
      person_display: String(capacity),
      with_family: guest.with_family === true || String(guest.category || '').toLowerCase() === 'family',
      family_display: guest.with_family === true || String(guest.category || '').toLowerCase() === 'family' ? '✓' : '✕'
    }
  };
}

export async function fetchInvitationByCode(inviteCode) {
  const code = String(inviteCode || '').trim();
  if (!code || code.length > 120) {
    throw new Error('Open your personalized invitation using its ?code= invite link.');
  }
  const data = await supabaseRequest('rpc/lookup_invitation', {
    method: 'POST',
    body: { p_invite_code: code }
  });
  return normalizeInvitation(data);
}

export async function fetchWeddingById(id) {
  const weddingId = String(id || '').trim();
  if (!weddingId || weddingId.length > 120) throw new Error('A wedding ID is required.');
  const data = await supabaseRequest('rpc/lookup_wedding', {
    method: 'POST',
    body: { p_wedding_id: weddingId }
  });
  return normalizeWeddingPayload(data);
}

export async function submitRsvp({ inviteCode, response, attendees, wishesMessage, capacity }) {
  const code = String(inviteCode || '').trim();
  const normalizedResponse = String(response || '').trim().toLowerCase();
  const count = Number(attendees);
  const maxGuests = Number(capacity);

  if (!code) throw new Error('A valid invitation link is required to send your RSVP.');
  if (!['attending', 'declined', 'tentative'].includes(normalizedResponse)) {
    throw new Error('Choose attending, declined, or tentative.');
  }
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 20) {
    throw new Error('This invitation has an invalid guest limit.');
  }
  if (normalizedResponse === 'attending' && (!Number.isInteger(count) || count < 1 || count > maxGuests)) {
    throw new Error(`Guest count must be between 1 and ${maxGuests}.`);
  }

  const result = await supabaseRequest('rpc/submit_invitation_rsvp', {
    method: 'POST',
    body: {
      p_invite_code: code,
      p_status: normalizedResponse,
      p_attending_count: normalizedResponse === 'attending' ? count : 0,
      p_wishes_message: cleanText(wishesMessage, 1000)
    }
  });
  if (!result || result.success !== true) throw new Error('Your RSVP could not be saved.');
  return result;
}
