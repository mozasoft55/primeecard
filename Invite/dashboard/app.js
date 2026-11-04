import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR, parseGuestCsv } from '../onboarding-core.js';
import { computeStats, STATUS_ORDER } from './rsvp-stats.js';

const params = new URLSearchParams(location.search);
let orderReference = params.get('order') || sessionStorage.getItem('customer-dashboard-order') || '';
if (orderReference) sessionStorage.setItem('customer-dashboard-order', orderReference);

const $ = id => document.getElementById(id);
const loading = $('loading-state');
const errorState = $('error-state');
const dashboardContent = $('dashboard-content');
const trackerBody = $('tracker-body');
const guestWrap = $('guest-table-wrap');
const guestDialog = $('guest-dialog');
const guestForm = $('guest-form');
const importDialog = $('import-dialog');
const csvInput = $('guest-csv');
const importButton = $('import-guests');
const importPreview = $('import-preview');
const replyDialog = $('reply-dialog');

let dashboard = null;
let importedGuests = [];
let opens = {};            // invite_code -> { first_opened_at, last_opened_at, open_count }
let goal = 0;              // guest goal (people)
let goalEditing = false;
let filter = 'all';
let query = '';
let stats = null;

const STATUS_META = {
  attending: { label: 'Coming', tile: 'Coming' },
  maybe: { label: 'Not sure', tile: 'Not sure' },
  declined: { label: 'Not coming', tile: 'Not coming' },
  seen: { label: 'Opened, no reply', tile: 'Opened, no reply' },
  not_opened: { label: 'Link not opened', tile: 'Link not opened' }
};

/* ───────────── helpers ───────────── */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function formatDate(value) {
  if (!value) return 'Not set';
  const parts = String(value).slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 'Not set';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])));
}

function timeAgo(value) {
  const t = typeof value === 'number' ? value : Date.parse(value);
  if (!Number.isFinite(t) || !t) return '';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
  const days = Math.round(hrs / 24);
  if (days < 30) return days + (days === 1 ? ' day ago' : ' days ago');
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

function waNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = '91' + digits; // plain Indian mobile number
  return digits.length >= 10 ? digits : '';
}

function showError(message) {
  if (loading) loading.hidden = true;
  if (dashboardContent) dashboardContent.hidden = true;
  if (errorState) errorState.hidden = false;
  const el = $('error-message');
  if (el) el.textContent = message;

  const heading = errorState ? errorState.querySelector('h1') : null;
  const linkForm = $('dashboard-link-form');
  const helper = errorState ? errorState.querySelector('.helper') : null;
  const retryBtn = $('error-retry-button');

  if (orderReference) {
    if (heading) heading.textContent = 'Dashboard Notice';
    if (linkForm) linkForm.hidden = true;
    if (helper) helper.hidden = true;
    if (retryBtn) retryBtn.hidden = false;
  } else {
    if (heading) heading.textContent = 'Open your private dashboard';
    if (linkForm) linkForm.hidden = false;
    if (helper) helper.hidden = false;
    if (retryBtn) retryBtn.hidden = true;
  }
}

function formatMoney(paise, fallback = 0) {
  const val = (paise !== undefined && paise !== null) ? Number(paise) : fallback;
  if (!Number.isFinite(val) || val <= 0) return '₹0.00';
  try {
    return formatINR(Math.round(val));
  } catch {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Math.round(val) / 100);
  }
}

let toastTimer;
function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}
function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

/* ───────────── network ───────────── */

function supabaseBase() {
  return ONBOARDING_CONFIG.supabaseUrl
    || (ONBOARDING_CONFIG.dashboardEndpoint ? ONBOARDING_CONFIG.dashboardEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
}

async function callRpc(name, body) {
  const response = await fetch(supabaseBase() + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: {
      'apikey': ONBOARDING_CONFIG.publishableKey,
      'Authorization': 'Bearer ' + ONBOARDING_CONFIG.publishableKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.success === false) {
    throw new Error((result && (result.error || result.message)) || 'Request failed.');
  }
  return result;
}

async function dashboardRequest(action, extra = {}) {
  const result = await callRpc('manage_customer_dashboard', {
    p_order_reference: orderReference,
    p_action: action,
    p_extra: extra
  });
  return result.dashboard ?? result;
}

// Goal + link-open tracking live behind their own RPCs (see guest-tracking.sql).
// If those are not installed yet the dashboard still works; tracking is simply empty.
async function loadTracking() {
  try { return await callRpc('get_guest_tracking', { p_order_reference: orderReference }); }
  catch (error) { console.warn('Guest tracking unavailable:', error.message); return null; }
}

/* ───────────── local persistence (kept from the original dashboard) ───────────── */

const guestsKey = ref => 'customer-dashboard-guests-' + (ref || 'default');
const goalKey = ref => 'customer-dashboard-goal-' + (ref || 'default');

function saveLocalGuests(ref, guests) {
  if (!ref) return;
  try { localStorage.setItem(guestsKey(ref), JSON.stringify(guests || [])); }
  catch (e) { console.warn('localStorage save failed:', e); }
}
function getStoredLocalGuests(ref) {
  if (!ref) return null;
  try { const raw = localStorage.getItem(guestsKey(ref)); if (raw) return JSON.parse(raw); }
  catch (e) { console.warn('localStorage read failed:', e); }
  return null;
}
function readLocalGoal(ref) {
  try { const raw = localStorage.getItem(goalKey(ref)); if (raw) return JSON.parse(raw); }
  catch (e) { /* ignore */ }
  return null;
}
function writeLocalGoal(ref, value, synced) {
  try { localStorage.setItem(goalKey(ref), JSON.stringify({ value, synced })); }
  catch (e) { /* ignore */ }
}

function resolveGoal(data, tracking) {
  const local = readLocalGoal(orderReference);
  if (local && local.value > 0 && local.synced === false) return local.value; // saved here, server not reached yet
  const candidates = [tracking && tracking.target_guest_count, data && data.target_guest_count,
    data && data.wedding && data.wedding.target_guest_count, local && local.value];
  for (const c of candidates) {
    const n = Math.floor(Number(c));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

/* ───────────── sharing ───────────── */

function invitationUrl(guest) {
  return new URL('?code=' + encodeURIComponent(guest.invite_code || ''), new URL('../', location.href)).href;
}

function coupleOwner() {
  const name = dashboard && dashboard.wedding && dashboard.wedding.couple_name;
  return name ? name + '’s' : 'our';
}

function shareMessage(state) {
  const url = invitationUrl(state.guest);
  const name = state.guest.guest_name || 'there';
  if (state.sent && (state.status === 'seen' || state.status === 'not_opened' || state.status === 'maybe')) {
    return 'Hello ' + name + ', a gentle reminder to open and reply to ' + coupleOwner() + ' wedding invitation: ' + url;
  }
  return 'You are invited to ' + coupleOwner() + ' wedding celebration. View your invitation: ' + url;
}

function shareAction(state) {
  const guest = state.guest;
  const number = waNumber(guest.phone);
  const id = escapeHtml(guest.id);
  const msg = shareMessage(state);
  const label = (state.status === 'seen' || state.status === 'maybe') ? 'Remind' : 'WhatsApp';
  const href = number
    ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(msg)
    : 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);

  return '<a class="act act-primary" href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" data-sent="' + id + '">' + label + '</a>';
}

/* ───────────── rendering: tracker ───────────── */

function badge(status) {
  return '<span class="badge b-' + status + '">' + escapeHtml(STATUS_META[status].label) + '</span>';
}

function goalFormHtml() {
  return '<form class="goal-form" data-goal-form>' +
    '<label for="goal-input">Guest goal <span class="field-hint">how many people you plan to invite in total</span></label>' +
    '<div class="goal-row">' +
      '<input id="goal-input" name="goal" type="number" min="1" max="5000" inputmode="numeric" placeholder="e.g. 300" value="' + (goal || '') + '" required>' +
      '<button class="button button-primary button-small" type="submit">Save goal</button>' +
      (goal ? '<button class="button button-outline button-small" type="button" data-cancel-goal>Cancel</button>' : '') +
    '</div></form>';
}

function nudgeReason(state) {
  if (state.status === 'not_opened') return state.sent ? 'Link shared, not opened yet' : 'Invite not sent yet';
  if (state.status === 'seen') return 'Opened ' + (timeAgo(state.lastOpenedAt) || 'earlier') + ', no reply yet';
  return 'Said not sure' + (state.replyAt ? ' · ' + timeAgo(state.replyAt) : '');
}

function renderTracker() {
  if (!trackerBody || !stats) return;
  const s = stats;
  const hasGuests = s.invitations > 0;
  let html = '';

  // 1. Hero numbers
  const stillLabel = s.overBy ? 'Over goal by' : 'Still to invite';
  const stillValue = !s.goal ? '—' : (s.overBy || s.remaining);
  html += '<div class="tracker-hero">' +
    '<div class="hero-main"><span class="hero-big">' + s.people.attending + '</span>' +
      '<span class="hero-label">' + (s.people.attending === 1 ? 'person' : 'people') + ' confirmed</span>' +
      '<small>' + (s.goal ? s.confirmedPctOfGoal + '% of your ' + s.goal + ' guest goal' : 'Set a guest goal to track your progress') + '</small></div>' +
    '<dl class="hero-facts">' +
      '<div><dt>Guest goal</dt><dd>' + (s.goal || '—') + ' <button type="button" class="link-btn" data-edit-goal>' + (s.goal ? 'Edit' : 'Set') + '</button></dd></div>' +
      '<div><dt>Invited so far</dt><dd>' + s.invitedPeople + '</dd><dd class="sub">' + plural(s.invitations, 'invitation', 'invitations') + '</dd></div>' +
      '<div><dt>' + stillLabel + '</dt><dd>' + stillValue + '</dd></div>' +
      '<div><dt>Replied</dt><dd>' + (hasGuests ? s.replyRatePct + '%' : '—') + '</dd><dd class="sub">' + s.repliedInvites + ' of ' + s.invitations + ' invitations</dd></div>' +
    '</dl></div>';

  // 2. Goal form (always when no goal yet, or while editing)
  if (!s.goal || goalEditing) html += goalFormHtml();

  // 3. Progress bar
  if (hasGuests || s.goal) {
    const parts = s.segments.filter(seg => seg.people > 0);
    const labelParts = s.segments.filter(seg => seg.people > 0).map(seg =>
      seg.people + ' ' + (seg.key === 'remaining' ? 'still to invite' : STATUS_META[seg.key].label.toLowerCase()));
    html += '<div class="bar" role="img" aria-label="' + escapeHtml((s.goal ? 'Out of ' + s.goal + ' guests: ' : 'Guests: ') + (labelParts.join(', ') || 'none yet')) + '">' +
      parts.map(seg => '<span class="seg s-' + seg.key + '" style="width:' + seg.pct.toFixed(2) + '%" title="' +
        escapeHtml((seg.key === 'remaining' ? 'Still to invite' : STATUS_META[seg.key].label) + ': ' + seg.people) + '"></span>').join('') +
      '</div>';
  }

  // 4. Status tiles (click to filter the guest list)
  html += '<div class="tiles">' + STATUS_ORDER.map(key =>
    '<button type="button" class="tile t-' + key + '" data-filter="' + key + '" aria-pressed="' + (filter === key) + '">' +
      '<span>' + escapeHtml(STATUS_META[key].tile) + '</span><strong>' + s.people[key] + '</strong>' +
      '<small>' + plural(s.invites[key], 'invitation', 'invitations') + '</small></button>').join('') +
    (s.goal ? '<div class="tile tile-static t-remaining"><span>Still to invite</span><strong>' + s.remaining + '</strong><small>of ' + s.goal + ' goal</small></div>' : '') +
    '</div>';
  html += '<p class="tiles-note">Numbers count people, so a family of 4 counts as 4.' +
    (s.seatsToPlan ? ' <b>Plan for ' + s.seatsToPlan + ' ' + (s.seatsToPlan === 1 ? 'seat' : 'seats') + '</b> (' + s.people.attending + ' confirmed + ' + s.people.maybe + ' not sure).' : '') + '</p>';

  // 5. Needs a nudge
  const priority = { not_opened: 0, seen: 1, maybe: 2 };
  const nudges = s.states.filter(st => st.status in priority)
    .sort((a, b) => priority[a.status] - priority[b.status]);
  if (nudges.length) {
    html += '<div class="subpanel"><h3>Needs a nudge <span class="count">' + nudges.length + '</span></h3><ul class="nudge-list">' +
      nudges.map(st => '<li class="nudge-item"><div>' + badge(st.status) + '<strong>' + escapeHtml(st.guest.guest_name) + '</strong>' +
        '<small>' + escapeHtml(nudgeReason(st)) + '</small></div>' + shareAction(st) + '</li>').join('') +
      '</ul></div>';
  }

  // 6. Recent replies with wishes
  const replies = s.states.filter(st => st.reply && st.replyAt).sort((a, b) => b.replyAt - a.replyAt);
  html += '<div class="subpanel"><div class="panel-head" style="margin-bottom: 8px;"><h3>Recent replies <span class="count">' + replies.length + '</span></h3>' +
    (replies.length ? '<button type="button" class="link-btn" data-filter="replies">View all in guest list ↓</button>' : '') + '</div>' +
    (replies.length
      ? '<ul class="reply-list">' + replies.map(st => '<li><div class="reply-top">' + badge(st.status) +
          '<strong>' + escapeHtml(st.guest.guest_name) + '</strong>' +
          (st.status === 'attending' ? '<span class="muted">' + plural(st.attendingPeople, 'person', 'people') + '</span>' : '') +
          '<time>' + escapeHtml(timeAgo(st.replyAt)) + '</time></div>' +
          (st.reply.wishes_message ? '<p class="reply-wish" data-view-reply="' + escapeHtml(st.guest.id) + '" style="cursor: pointer;" title="Click to view full message">“' + escapeHtml(st.reply.wishes_message) + '”</p>' : '') + '</li>').join('') + '</ul>'
      : '<p class="helper">No replies yet. They will appear here, with any wishes, as guests respond.</p>') + '</div>';

  trackerBody.innerHTML = html;
}

/* ───────────── rendering: guest list ───────────── */

function renderChips() {
  const el = $('filter-chips');
  if (!el || !stats) return;
  const chips = [
    ['all', 'All', stats.invitations],
    ...STATUS_ORDER.map(k => [k, STATUS_META[k].tile, stats.invites[k]]),
    ['replies', 'Replies', stats.repliedInvites]
  ];
  el.innerHTML = chips.map(c => '<button type="button" class="chip" data-filter="' + c[0] + '" aria-pressed="' + (filter === c[0]) + '">' +
    escapeHtml(c[1]) + ' <span>' + c[2] + '</span></button>').join('');
}

function statusSub(state) {
  if (state.status === 'seen') {
    return 'Opened ' + (timeAgo(state.lastOpenedAt) || 'earlier') + (state.openCount > 1 ? ' · ' + state.openCount + ' times' : '');
  }
  if (state.status === 'not_opened') return state.sent ? 'Link shared' : 'Not sent yet';
  if (state.source === 'manual') return 'Marked by you';
  return state.replyAt ? 'Replied ' + timeAgo(state.replyAt) : '';
}

function guestRow(state, index = 0) {
  const g = state.guest;
  const id = escapeHtml(g.id);
  const sub = [g.category, g.phone].filter(Boolean).join(' · ');
  const peopleCell = (state.status === 'attending' && state.attendingPeople < state.invitedPeople)
    ? state.attendingPeople + '<span> of ' + state.invitedPeople + '</span>' : String(state.invitedPeople);

  let wishHtml = '';
  if (state.reply && state.reply.wishes_message) {
    wishHtml = '<div class="g-wish" data-view-reply="' + id + '" title="Click to view message">“' + escapeHtml(state.reply.wishes_message) + '”</div>';
  } else if (filter === 'replies') {
    wishHtml = '<div class="g-no-wish">No message written</div>';
  }

  const replyMenuOption = (state.reply && state.reply.wishes_message)
    ? '<button type="button" data-view-reply="' + id + '">View reply message</button>'
    : '';

  return '<tr>' +
    '<td class="g-idx">' + (index + 1) + '</td>' +
    '<td class="g-name"><strong>' + escapeHtml(g.guest_name) + '</strong><small>' + escapeHtml(sub || 'No phone added') + '</small>' + wishHtml + '</td>' +
    '<td class="g-people" data-label="People">' + peopleCell + '</td>' +
    '<td class="g-status">' + badge(state.status) + '<small>' + escapeHtml(statusSub(state)) + '</small></td>' +
    '<td class="g-actions"><div class="row-actions">' + shareAction(state) +
      '<details class="menu"><summary class="icon-btn" aria-label="More actions for ' + escapeHtml(g.guest_name) + '">⋯</summary>' +
      '<div class="menu-list">' +
        '<button type="button" data-copy="' + escapeHtml(invitationUrl(g)) + '">Copy invite link</button>' +
        replyMenuOption +
        '<button type="button" data-edit="' + id + '">Edit details</button>' +
        '<button type="button" class="danger" data-delete="' + id + '">Delete guest</button>' +
      '</div></details></div></td></tr>';
}

function renderGuestList() {
  if (!guestWrap || !stats) return;
  const q = query.trim().toLowerCase();
  const rows = stats.states.filter(st => {
    if (filter === 'replies') {
      const isReplied = Boolean(st.reply || ['attending', 'maybe', 'declined'].includes(st.status));
      if (!isReplied) return false;
    } else if (filter !== 'all' && st.status !== filter) {
      return false;
    }
    if (!q) return true;
    const g = st.guest;
    return [g.guest_name, g.phone, g.category].some(v => String(v || '').toLowerCase().includes(q));
  });

  const line = $('guest-summary-line');
  if (line) {
    const scrollHint = rows.length > 5 ? ' · Scroll table to view all' : '';
    if (filter === 'replies') {
      line.textContent = plural(rows.length, 'reply', 'replies') + ' received · Click messages to view full details' + scrollHint;
    } else {
      line.textContent = stats.invitations
        ? plural(stats.invitations, 'invitation', 'invitations') + ' · ' + plural(stats.invitedPeople, 'person', 'people') +
          (rows.length !== stats.invitations ? ' · showing ' + rows.length : '') + scrollHint
        : 'Nobody added yet';
    }
  }

  if (!stats.invitations) {
    guestWrap.innerHTML = '<div class="empty"><p>No guests yet. Add your first guest, or import a whole list from Excel.</p>' +
      '<button type="button" class="button button-primary button-small" data-add-guest>＋ Add guest</button></div>';
    return;
  }
  if (!rows.length) {
    guestWrap.innerHTML = '<div class="empty"><p>' + (filter === 'replies' ? 'No replies received yet.' : 'No guests match this filter.') + '</p>' +
      '<button type="button" class="button button-outline button-small" data-filter="all" data-clear-search>Show everyone</button></div>';
    return;
  }
  guestWrap.innerHTML = '<table class="guest-table"><thead><tr><th class="th-idx">#</th><th>Guest</th><th>People</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
    rows.map((st, idx) => guestRow(st, idx)).join('') + '</tbody></table>';
}

function renderAll() {
  if (!dashboard) return;
  stats = computeStats({ guests: dashboard.guests || [], rsvps: dashboard.rsvps || [], opens, goal });
  renderTracker();
  renderChips();
  renderGuestList();
}

function setFilter(next, { scroll = false } = {}) {
  filter = next;
  renderTracker();
  renderChips();
  renderGuestList();
  if (scroll) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('guest-panel').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
}

function renderTimeline(events) {
  const list = events || [];
  const el = $('timeline');
  if (!el) return;
  el.innerHTML = list.length ? list.map(event => {
    const note = event.note ? ' · ' + escapeHtml(event.note) : '';
    return '<li><time>' + escapeHtml(formatDate(event.event_date)) + '</time><strong>' + escapeHtml(event.event_name) + '</strong><small>' + escapeHtml(event.event_time || '') + note + '</small></li>';
  }).join('') : '<li><strong>No events added</strong></li>';
}

function renderDashboard(data) {
  dashboard = data;
  if (loading) loading.hidden = true;
  if (errorState) errorState.hidden = true;
  if (dashboardContent) dashboardContent.hidden = false;

  const setTxt = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
  setTxt('couple-title', (data && data.wedding && data.wedding.couple_name) ? data.wedding.couple_name : 'Tarana & Akbar');
  setTxt('wedding-date', formatDate(data ? data.event_date : null));
  setTxt('order-reference', (data && data.order_reference) ? data.order_reference : orderReference);
  setTxt('package-name', (data && data.package) ? data.package : 'Standard Package');
  setTxt('order-status', (data && data.order_status) ? data.order_status : 'Order Received');
  setTxt('payment-status', (data && data.payment_status) ? data.payment_status : 'Pending Verification');
  const listPrice = (data && data.list_price_paise != null) ? Number(data.list_price_paise) : 400000;
  const discount = (data && data.discount_paise != null) ? Number(data.discount_paise) : 0;
  const advanceExpected = (data && data.advance_expected_paise != null) ? Number(data.advance_expected_paise) : 150000;
  const advanceVerified = (data && data.advance_verified_paise != null) ? Number(data.advance_verified_paise) : 0;
  const rawBalance = (data && data.balance_paise != null) ? Number(data.balance_paise) : (listPrice - discount - advanceVerified);
  const balance = Math.max(0, rawBalance);

  setTxt('list-price', formatMoney(listPrice));
  setTxt('discount', formatMoney(discount));
  setTxt('advance-expected', formatMoney(advanceExpected));
  setTxt('advance-verified', formatMoney(advanceVerified));
  setTxt('balance', formatMoney(balance));

  const previewLink = $('preview-link');
  if (previewLink) previewLink.href = '../?code=' + encodeURIComponent((data && data.preview_guest_code) ? data.preview_guest_code : '9D6JGSQY7YD8');
  const guestLinks = $('generate-guest-links');
  if (guestLinks) guestLinks.href = '../guest-list.html?w=' + encodeURIComponent((data && data.wedding_id) ? data.wedding_id : '');

  renderTimeline(data ? data.events : []);
  renderAll();
}

/* ───────────── loading ───────────── */

async function refreshDashboard() {
  try {
    const [data, tracking] = await Promise.all([dashboardRequest('load'), loadTracking()]);

    const stored = getStoredLocalGuests(orderReference);
    if (stored !== null) {
      data.guests = stored;
    } else if (Array.isArray(data.guests)) {
      // First load: drop the auto-created sample guest so the list starts clean.
      const previewCode = data.preview_guest_code;
      data.guests = data.guests.filter(g => {
        if (previewCode && g.invite_code === previewCode && !g._userEdited) return false;
        if (g.category === 'preview' && !g._userEdited) return false;
        return true;
      });
      saveLocalGuests(orderReference, data.guests);
    }

    opens = {};
    for (const item of (tracking && Array.isArray(tracking.opens)) ? tracking.opens : []) {
      if (item && item.invite_code) opens[item.invite_code] = item;
    }
    goal = resolveGoal(data, tracking);

    renderDashboard(data);

    // A goal saved while the server was unreachable is retried quietly.
    const local = readLocalGoal(orderReference);
    if (local && local.synced === false && local.value > 0) syncGoal(local.value, { silent: true });
  } catch (err) {
    console.error('Dashboard load error:', err);
    showError(err.message || 'Failed to load dashboard.');
  }
}

async function syncGoal(value, { silent = false } = {}) {
  try {
    await callRpc('set_guest_goal', { p_order_reference: orderReference, p_target: value });
    writeLocalGoal(orderReference, value, true);
    return true;
  } catch (error) {
    console.warn('Goal sync notice:', error.message);
    writeLocalGoal(orderReference, value, false);
    if (!silent) toast('Goal saved on this device. Server sync is not available yet.');
    return false;
  }
}

/* ───────────── guest actions ───────────── */

function guestPayload(guest) {
  return {
    guest_name: guest.guest_name, family_members: guest.family_members, phone: guest.phone || '',
    category: guest.category || 'Family', city_address: guest.city_address || '',
    with_family: guest.family_members > 1, invite_sent: Boolean(guest.invite_sent)
  };
}

function markSent(guestId) {
  const guest = (dashboard.guests || []).find(g => String(g.id) === String(guestId));
  if (!guest || guest.invite_sent) return;
  guest.invite_sent = true;
  saveLocalGuests(orderReference, dashboard.guests);
  // Re-render after the browser has followed the WhatsApp link.
  setTimeout(renderAll, 200);
  dashboardRequest('update_guest', { guest_id: guest.id, guest: guestPayload(guest) })
    .catch(e => console.warn('Server update_guest notice:', e.message));
}

function openGuestForm(guest) {
  guestForm.reset();
  const editing = Boolean(guest);
  $('guest-dialog-title').textContent = editing ? 'Edit guest' : 'Add guest';
  $('save-another').hidden = editing;
  $('save-guest').textContent = editing ? 'Save changes' : 'Save guest';
  $('guest-form-error').hidden = true;
  guestForm.elements.guest_id.value = editing ? guest.id : '';
  guestForm.elements.guest_name.value = editing ? (guest.guest_name || '') : '';
  guestForm.elements.family_members.value = editing ? (guest.family_members || 1) : 1;
  guestForm.elements.phone.value = editing ? (guest.phone || '') : '';
  guestForm.elements.category.value = editing ? (guest.category || 'Family') : 'Family';
  guestForm.elements.city_address.value = editing ? (guest.city_address || '') : '';
  openDialog(guestDialog);
  guestForm.elements.guest_name.focus();
}

guestForm.addEventListener('submit', async event => {
  event.preventDefault();
  const again = event.submitter && event.submitter.value === 'another';
  const values = Object.fromEntries(new FormData(guestForm));
  const name = String(values.guest_name || '').trim();
  const errorEl = $('guest-form-error');
  if (!name) {
    errorEl.textContent = 'Please enter the guest’s name.';
    errorEl.hidden = false;
    guestForm.elements.guest_name.focus();
    return;
  }
  errorEl.hidden = true;
  const people = Math.min(20, Math.max(1, Math.floor(Number(values.family_members)) || 1));
  const fields = {
    guest_name: name, family_members: people, phone: String(values.phone || '').trim(),
    category: String(values.category || '').trim() || 'Family', city_address: String(values.city_address || '').trim()
  };

  if (values.guest_id) {
    const index = dashboard.guests.findIndex(g => String(g.id) === String(values.guest_id));
    if (index === -1) return;
    dashboard.guests[index] = { ...dashboard.guests[index], ...fields, with_family: people > 1, _userEdited: true };
    saveLocalGuests(orderReference, dashboard.guests);
    renderAll();
    closeDialog(guestDialog);
    toast('Guest updated');
    dashboardRequest('update_guest', { guest_id: values.guest_id, guest: guestPayload(dashboard.guests[index]) })
      .catch(e => console.warn('Server update_guest notice:', e.message));
    return;
  }

  const newGuest = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('g-' + Date.now()),
    ...fields, with_family: people > 1, invite_sent: false,
    invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(), _userEdited: true
  };
  dashboard.guests = Array.isArray(dashboard.guests) ? dashboard.guests : [];
  dashboard.guests.push(newGuest);
  saveLocalGuests(orderReference, dashboard.guests);
  renderAll();
  dashboardRequest('add_guests', { guests: [newGuest] })
    .catch(e => console.warn('Server add_guests notice:', e.message));

  if (again) {
    toast(name + ' added');
    guestForm.elements.guest_name.value = '';
    guestForm.elements.phone.value = '';
    guestForm.elements.city_address.value = '';
    guestForm.elements.family_members.value = 1;
    guestForm.elements.guest_name.focus();
  } else {
    closeDialog(guestDialog);
    toast('Guest added');
  }
});

function deleteGuest(guestId) {
  const guest = (dashboard.guests || []).find(g => String(g.id) === String(guestId));
  if (!guest || !confirm('Delete ' + (guest.guest_name || 'this guest') + '?')) return;
  dashboard.guests = dashboard.guests.filter(g => String(g.id) !== String(guestId));
  saveLocalGuests(orderReference, dashboard.guests);
  renderAll();
  toast('Guest deleted');
  dashboardRequest('delete_guest', { guest_id: guestId })
    .catch(e => console.warn('Server delete_guest notice:', e.message));
}

/* ───────────── CSV import ───────────── */

csvInput.addEventListener('change', async () => {
  importedGuests = [];
  importButton.disabled = true;
  importPreview.hidden = false;
  const file = csvInput.files && csvInput.files[0];
  if (!file) { importPreview.hidden = true; return; }
  try {
    importedGuests = parseGuestCsv(await file.text());
    importPreview.textContent = 'Ready to import ' + plural(importedGuests.length, 'guest', 'guests') + '.';
    importButton.textContent = 'Import ' + importedGuests.length;
    importButton.disabled = importedGuests.length === 0;
  } catch (error) {
    importPreview.textContent = error.message;
  }
});

importButton.addEventListener('click', async () => {
  if (!importedGuests.length) return;
  importButton.disabled = true;
  importButton.textContent = 'Importing…';
  const newGuests = importedGuests.map(g => ({
    ...g,
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('g-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)),
    invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    invite_sent: false,
    _userEdited: true
  }));
  dashboard.guests = Array.isArray(dashboard.guests) ? dashboard.guests : [];
  dashboard.guests.push(...newGuests);
  saveLocalGuests(orderReference, dashboard.guests);
  renderAll();
  closeDialog(importDialog);
  toast(plural(newGuests.length, 'guest', 'guests') + ' imported');
  importedGuests = [];
  csvInput.value = '';
  importButton.textContent = 'Import guests';
  dashboardRequest('add_guests', { guests: newGuests })
    .catch(e => console.warn('Server add_guests notice:', e.message));
});

/* ───────────── events ───────────── */

$('open-add-guest').addEventListener('click', () => openGuestForm(null));
$('cancel-guest').addEventListener('click', () => closeDialog(guestDialog));
$('open-import').addEventListener('click', () => {
  $('more-menu').removeAttribute('open');
  importedGuests = [];
  csvInput.value = '';
  importPreview.hidden = true;
  importButton.disabled = true;
  importButton.textContent = 'Import guests';
  openDialog(importDialog);
});
$('cancel-import').addEventListener('click', () => closeDialog(importDialog));
$('close-reply-dialog')?.addEventListener('click', () => closeDialog(replyDialog));

function openReplyDialog(state) {
  if (!replyDialog || !state) return;
  const g = state.guest;
  const reply = state.reply || {};
  const nameEl = $('reply-dialog-name');
  const statusEl = $('reply-dialog-status');
  const attendingEl = $('reply-dialog-attending');
  const messageEl = $('reply-dialog-message');
  const timeEl = $('reply-dialog-time');

  if (nameEl) nameEl.textContent = (g.guest_name || 'Guest') + '’s Response';
  if (statusEl) statusEl.textContent = STATUS_META[state.status]?.label || state.status;
  if (attendingEl) {
    attendingEl.textContent = state.status === 'attending'
      ? plural(state.attendingPeople, 'person', 'people') + ' attending (out of ' + state.invitedPeople + ' invited)'
      : (state.status === 'declined' ? '0 people (Declined)' : state.invitedPeople + ' people (Tentative)');
  }
  if (messageEl) {
    messageEl.textContent = reply.wishes_message ? '“' + reply.wishes_message + '”' : 'No message was written with this reply.';
  }
  if (timeEl) {
    timeEl.textContent = state.replyAt ? new Date(state.replyAt).toLocaleString() + ' (' + timeAgo(state.replyAt) + ')' : '—';
  }
  openDialog(replyDialog);
}

for (const dialog of [guestDialog, importDialog, replyDialog]) {
  if (!dialog) continue;
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const outside = event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
    if (outside) closeDialog(dialog);
  });
}

$('guest-search').addEventListener('input', event => {
  query = event.target.value;
  renderGuestList();
});

const csvTemplate = $('csv-template');
if (csvTemplate) {
  csvTemplate.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent('guest_name,family_members,phone,category,city_address\nSample Guest,2,+919876543210,Family,Howrah\n'));
}

$('dashboard-content').addEventListener('click', async event => {
  const t = event.target;
  const filterBtn = t.closest('[data-filter]');
  const copy = t.closest('[data-copy]');
  const sent = t.closest('[data-sent]');
  const edit = t.closest('[data-edit]');
  const remove = t.closest('[data-delete]');
  const viewReply = t.closest('[data-view-reply]');

  if (viewReply) {
    const guestId = viewReply.dataset.viewReply;
    const st = (stats && stats.states) ? stats.states.find(s => String(s.guest.id) === String(guestId)) : null;
    if (st) openReplyDialog(st);
    const menu = t.closest('details.menu');
    if (menu) menu.removeAttribute('open');
    return;
  }

  if (t.closest('[data-add-guest]')) { openGuestForm(null); return; }

  if (filterBtn) {
    if (filterBtn.hasAttribute('data-clear-search')) { query = ''; $('guest-search').value = ''; }
    const next = filterBtn.dataset.filter;
    const fromTile = Boolean(filterBtn.closest('#tracker'));
    setFilter(filter === next && next !== 'all' ? 'all' : next, { scroll: fromTile });
    return;
  }
  if (t.closest('[data-edit-goal]')) {
    goalEditing = true; renderTracker();
    const input = $('goal-input'); if (input) { input.focus(); input.select(); }
    return;
  }
  if (t.closest('[data-cancel-goal]')) { goalEditing = false; renderTracker(); return; }

  if (copy) {
    try { await navigator.clipboard.writeText(copy.dataset.copy); toast('Invite link copied'); }
    catch { toast('Could not copy the link'); }
  }
  if (sent) markSent(sent.dataset.sent);
  if (edit) {
    const guest = (dashboard.guests || []).find(g => String(g.id) === String(edit.dataset.edit));
    if (guest) openGuestForm(guest);
  }
  if (remove) deleteGuest(remove.dataset.delete);

  const menu = t.closest('details.menu');
  if (menu && t.closest('.menu-list')) menu.removeAttribute('open');
});

$('tracker-body').addEventListener('submit', async event => {
  const form = event.target.closest('[data-goal-form]');
  if (!form) return;
  event.preventDefault();
  const value = Math.floor(Number(new FormData(form).get('goal')));
  if (!Number.isFinite(value) || value < 1 || value > 5000) { toast('Enter a goal between 1 and 5000'); return; }
  goal = value;
  goalEditing = false;
  writeLocalGoal(orderReference, value, false);
  renderAll();
  if (await syncGoal(value)) toast('Guest goal saved');
});

// Close any open ⋯ / More menu when clicking elsewhere.
document.addEventListener('click', event => {
  document.querySelectorAll('details.menu[open]').forEach(menu => { if (!menu.contains(event.target)) menu.removeAttribute('open'); });
});

$('refresh-button')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Refreshing…';
  try { await refreshDashboard(); }
  finally { button.disabled = false; button.textContent = 'Refresh'; }
});

$('error-retry-button')?.addEventListener('click', async () => {
  if (loading) loading.hidden = false;
  if (errorState) errorState.hidden = true;
  await refreshDashboard();
});

$('dashboard-link-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const input = $('dashboard-link-input');
  const val = input ? input.value.trim() : '';
  if (val) {
    try {
      const u = new URL(val, location.href);
      location.href = u.href;
    } catch {
      alert('Please enter a valid dashboard link.');
    }
  }
});

refreshDashboard();
