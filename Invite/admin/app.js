import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR } from '../onboarding-core.js';

/* Security model
 * - Identity: Supabase Auth (email + password), then TOTP authenticator code (MFA -> JWT claim aal2).
 * - Authority: enforced in the database (admin-security.sql).
 * - Multi-Admin Audit: tracked per action (verified_by, action_by).
 * - Kill-Switch: activates/deactivates live guest card URLs.
 */

const SUPABASE_URL = ONBOARDING_CONFIG.supabaseUrl
  || (ONBOARDING_CONFIG.verifyPaymentEndpoint ? ONBOARDING_CONFIG.verifyPaymentEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
const IDLE_MS = 15 * 60 * 1000;
const MAX_PASSWORD_TRIES = 5;
const MAX_CODE_TRIES = 5;
const LOCK_MS = 60 * 1000;

try { sessionStorage.removeItem('wedding-admin-access-token'); } catch (e) { /* ignore */ }

const sb = createClient(SUPABASE_URL, ONBOARDING_CONFIG.publishableKey, {
  auth: {
    storage: window.sessionStorage,
    storageKey: 'wedding-admin-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const digitsOnly = value => String(value || '').replace(/\D/g, '').slice(0, 6);

let payments = [];
let cashRequests = [];
let enrollFactorId = '';
let passwordFails = 0;
let codeFails = 0;
let lockedUntil = 0;
let idleTimer = null;
let idleActive = false;
let currentFilter = 'pending';
let searchQuery = '';

/* ───────────── views ───────────── */

const AUTH_VIEWS = ['password', 'mfa', 'enroll', 'denied'];

function showView(name) {
  document.body.dataset.view = name;
  $('view-boot').hidden = name !== 'boot';
  $('auth-card').hidden = !AUTH_VIEWS.includes(name);
  for (const v of AUTH_VIEWS) $('view-' + v).hidden = v !== name;
  $('view-console').hidden = name !== 'console';
  const signedIn = ['mfa', 'enroll', 'denied', 'console'].includes(name);
  $('session-bar').hidden = !signedIn;
  $('staff-label').hidden = signedIn;
  $('aal-badge').hidden = name !== 'console';
  $('stepper').dataset.step = name === 'password' ? '1' : '2';
  const focusTarget = { password: 'view-password', mfa: 'mfa-code', enroll: 'enroll-code' }[name];
  if (focusTarget) {
    const el = $(focusTarget);
    (el.matches('input') ? el : el.querySelector('input'))?.focus();
  }
}

function setMsg(id, text, kind = 'error') {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.dataset.kind = kind;
}

let toastTimer;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

function showError(message) {
  const box = $('admin-error');
  box.textContent = message;
  box.hidden = !message;
}

function wipeConsole() {
  payments = [];
  cashRequests = [];
  $('payment-queue').replaceChildren();
  $('cash-request-queue').replaceChildren();
  $('stats').replaceChildren();
  showError('');
}

/* ───────────── idle timeout ───────────── */

function bumpIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => forceSignOut('You were signed out after 15 minutes of inactivity.'), IDLE_MS);
}
function startIdle() { idleActive = true; bumpIdle(); }
function stopIdle() { idleActive = false; clearTimeout(idleTimer); }
for (const eventName of ['pointerdown', 'keydown', 'touchstart', 'scroll']) {
  window.addEventListener(eventName, () => { if (idleActive) bumpIdle(); }, { passive: true });
}

async function forceSignOut(message) {
  stopIdle();
  wipeConsole();
  try { await sb.auth.signOut(); } catch (e) { /* session may already be gone */ }
  setMsg('login-message', message || '', 'info');
  showView('password');
}

/* ───────────── routing ───────────── */

async function route() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { stopIdle(); wipeConsole(); return showView('password'); }
    $('session-email').textContent = session.user.email || '';

    const { data: who, error: whoError } = await sb.rpc('admin_whoami');
    if (whoError) {
      const missing = whoError.code === 'PGRST202' || /admin_whoami/i.test(whoError.message || '');
      throw new Error(missing ? 'setup' : 'whoami');
    }
    if (!who || !who.is_admin) { stopIdle(); wipeConsole(); return showView('denied'); }

    startIdle();
    const { data: aal, error: aalError } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) throw aalError;
    if (aal.currentLevel === 'aal2') return openConsole();
    if (aal.nextLevel === 'aal2') return showView('mfa');
    return beginEnrollment();
  } catch (error) {
    console.error('Admin route error:', error);
    const text = error && error.message === 'setup'
      ? 'Server security is not installed yet. Run admin-security.sql in Supabase, then reload.'
      : 'We could not verify your session. Please sign in again.';
    await forceSignOut(text);
  }
}

/* ───────────── step 1: password ───────────── */

$('view-password').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type=submit]');
  const wait = Math.ceil((lockedUntil - Date.now()) / 1000);
  if (wait > 0) return setMsg('login-message', 'Too many attempts. Try again in ' + wait + ' seconds.');

  const values = new FormData(form);
  const email = String(values.get('email') || '').trim();
  const password = String(values.get('password') || '');
  form.elements.password.value = '';
  if (!email || !password) return setMsg('login-message', 'Enter your email and password.');

  button.disabled = true;
  setMsg('login-message', 'Signing in…', 'info');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  button.disabled = false;

  if (error) {
    passwordFails += 1;
    if (passwordFails >= MAX_PASSWORD_TRIES || error.status === 429) {
      lockedUntil = Date.now() + LOCK_MS;
      passwordFails = 0;
      return setMsg('login-message', 'Too many attempts. Please wait a minute and try again.');
    }
    return setMsg('login-message', 'Incorrect email or password.');
  }
  passwordFails = 0;
  setMsg('login-message', '');
  await route();
});

$('pw-toggle').addEventListener('click', event => {
  const input = $('pw');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  event.currentTarget.textContent = show ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-pressed', String(show));
});

/* ───────────── step 2a: verify code ───────────── */

function wireCodeInput(inputId, formId) {
  const input = $(inputId);
  input.addEventListener('input', () => {
    input.value = digitsOnly(input.value);
    if (input.value.length === 6) $(formId).requestSubmit();
  });
}
wireCodeInput('mfa-code', 'view-mfa');
wireCodeInput('enroll-code', 'view-enroll');

$('view-mfa').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type=submit]');
  const code = digitsOnly(form.elements.code.value);
  if (code.length !== 6) return setMsg('mfa-message', 'Enter the 6-digit code.');
  button.disabled = true;
  setMsg('mfa-message', 'Checking…', 'info');
  try {
    const { data: factors, error: listError } = await sb.auth.mfa.listFactors();
    if (listError) throw listError;
    const factor = factors && factors.totp && factors.totp[0];
    if (!factor) { setMsg('mfa-message', ''); return await route(); }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (error) {
      codeFails += 1;
      form.elements.code.value = '';
      if (codeFails >= MAX_CODE_TRIES) { codeFails = 0; return await forceSignOut('Too many incorrect codes. Please sign in again.'); }
      return setMsg('mfa-message', 'That code is incorrect or has expired. Check your app and try again.');
    }
    codeFails = 0;
    form.elements.code.value = '';
    setMsg('mfa-message', '');
    await route();
  } catch (error) {
    console.error(error);
    setMsg('mfa-message', 'Could not verify the code right now. Please try again.');
  } finally {
    button.disabled = false;
  }
});

/* ───────────── step 2b: enroll ───────────── */

async function beginEnrollment() {
  showView('enroll');
  $('enroll-secret').textContent = 'Preparing…';
  $('enroll-qr').removeAttribute('src');
  setMsg('enroll-message', '');
  try {
    const { data: list } = await sb.auth.mfa.listFactors();
    for (const factor of (list && list.all) || []) {
      if (factor.factor_type === 'totp' && factor.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: factor.id });
    }
    const { data, error } = await sb.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Admin app ' + Math.random().toString(36).slice(2, 8)
    });
    if (error) throw error;
    enrollFactorId = data.id;
    $('enroll-qr').src = data.totp.qr_code;
    $('enroll-secret').textContent = String(data.totp.secret || '').replace(/(.{4})/g, '$1 ').trim();
  } catch (error) {
    console.error(error);
    $('enroll-secret').textContent = '—';
    setMsg('enroll-message', 'Could not start setup. Reload the page and try again.');
  }
}

$('copy-secret').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('enroll-secret').textContent.replace(/\s/g, '')); toast('Key copied'); }
  catch { toast('Could not copy. Select the key and copy it manually.'); }
});

$('view-enroll').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type=submit]');
  const code = digitsOnly(form.elements.code.value);
  if (!enrollFactorId) return setMsg('enroll-message', 'Setup is not ready. Reload the page and try again.');
  if (code.length !== 6) return setMsg('enroll-message', 'Enter the 6-digit code from your app.');
  button.disabled = true;
  setMsg('enroll-message', 'Checking…', 'info');
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: enrollFactorId, code });
  button.disabled = false;
  if (error) {
    form.elements.code.value = '';
    return setMsg('enroll-message', 'That code did not match. Wait for the next code in your app and try again.');
  }
  enrollFactorId = '';
  form.elements.code.value = '';
  setMsg('enroll-message', '');
  toast('Two-step verification is now on');
  await route();
});

for (const el of document.querySelectorAll('[data-signout]')) el.addEventListener('click', () => forceSignOut(''));
$('signout').addEventListener('click', () => forceSignOut(''));

sb.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT') { stopIdle(); wipeConsole(); showView('password'); }
});

/* ───────────── admin calls ───────────── */

async function callAdmin(action, payload = {}) {
  const { data, error } = await sb.rpc('manage_admin_portal', { p_action: action, p_payload: payload });
  if (error) {
    if (error.code === 'PGRST301' || /jwt/i.test(error.message || '')) {
      await forceSignOut('Your session expired. Please sign in again.');
      throw new Error('Session expired.');
    }
    throw new Error(error.message || 'Administrator request failed.');
  }
  if (!data || data.success !== true) {
    if (data && ['unauthenticated', 'not_authorised', 'mfa_required'].includes(data.code)) {
      route();
      throw new Error(data.error || 'You do not have access to this action.');
    }
    throw new Error((data && (data.error || data.message)) || 'Administrator request failed.');
  }
  return data;
}

function confirmAction({ title, body, confirmLabel, danger = false }) {
  return new Promise(resolve => {
    const dialog = $('confirm-dialog');
    $('confirm-title').textContent = title;
    $('confirm-body').textContent = body;
    const ok = $('confirm-ok');
    ok.textContent = confirmLabel;
    ok.classList.toggle('button-danger', danger);
    ok.classList.toggle('button-primary', !danger);
    dialog.returnValue = '';
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true });
    dialog.showModal();
  });
}

/* ───────────── console ───────────── */

async function openConsole() {
  showView('console');
  try { await renderQueue(); } catch (error) { showError(error.message); }
}

async function renderQueue() {
  showError('');
  const [queue, cash] = await Promise.all([
    callAdmin('list', { action: 'list' }),
    callAdmin('list_cash_requests', { action: 'list_cash_requests' })
  ]);
  payments = queue.payments || [];
  cashRequests = cash.cash_requests || [];
  renderStats();
  renderPayments();
  renderCashRequests();
}

function renderStats() {
  const claimed = payments.reduce((sum, p) => sum + (Number(p.claimed_amount_paise) || 0), 0);
  const expected = payments.reduce((sum, p) => sum + (Number(p.expected_amount_paise) || 0), 0);
  const fresh = cashRequests.filter(r => r.status === 'New').length;
  const tiles = [
    ['Awaiting review', String(payments.filter(p => (p.payment_status || '').toLowerCase().includes('pending')).length), 'pending claims', 'warn'],
    ['Claimed total', formatINR(claimed), 'across all orders', ''],
    ['Expected total', formatINR(expected), 'advance due', ''],
    ['New cash requests', String(fresh), fresh ? 'need a call' : 'none waiting', fresh ? 'warn' : 'ok']
  ];
  $('stats').innerHTML = tiles.map(t => '<article class="stat ' + t[3] + '"><small>' + escapeHtml(t[0]) + '</small><strong>' + escapeHtml(t[1]) + '</strong><span>' + escapeHtml(t[2]) + '</span></article>').join('');
}

function renderPayments() {
  const host = $('payment-queue');
  if (!host) return;

  const counts = {
    pending: 0,
    verified: 0,
    rejected: 0,
    suspended: 0,
    all: payments.length
  };

  payments.forEach(p => {
    const pStatus = (p.payment_status || '').toLowerCase();
    const cStatus = (p.card_status || 'Active').toLowerCase();

    if (cStatus === 'suspended') counts.suspended++;
    if (pStatus.includes('pending')) counts.pending++;
    else if (pStatus.includes('verified')) counts.verified++;
    else if (pStatus.includes('rejected')) counts.rejected++;
  });

  if ($('count-pending')) $('count-pending').textContent = counts.pending;
  if ($('count-verified')) $('count-verified').textContent = counts.verified;
  if ($('count-rejected')) $('count-rejected').textContent = counts.rejected;
  if ($('count-suspended')) $('count-suspended').textContent = counts.suspended;
  if ($('count-all')) $('count-all').textContent = counts.all;

  const filtered = payments.filter(payment => {
    const pStatus = (payment.payment_status || '').toLowerCase();
    const cStatus = (payment.card_status || 'Active').toLowerCase();

    let tabMatch = true;
    if (currentFilter === 'pending') tabMatch = pStatus.includes('pending');
    else if (currentFilter === 'verified') tabMatch = pStatus.includes('verified');
    else if (currentFilter === 'rejected') tabMatch = pStatus.includes('rejected');
    else if (currentFilter === 'suspended') tabMatch = (cStatus === 'suspended');

    if (!tabMatch) return false;

    if (searchQuery) {
      const matchTarget = `${payment.order_reference} ${payment.customer_name} ${payment.customer_phone} ${payment.couple_name}`.toLowerCase();
      return matchTarget.includes(searchQuery);
    }

    return true;
  });

  if (!filtered.length) {
    host.innerHTML = `<div class="empty"><strong>No records found.</strong><span>No data matching the current filter.</span></div>`;
    return;
  }

  host.innerHTML = filtered.map(payment => {
    const isVerified = (payment.payment_status || '').toLowerCase().includes('verified');
    const isRejected = (payment.payment_status || '').toLowerCase().includes('rejected');
    const isPending = !isVerified && !isRejected;
    const isCardSuspended = (payment.card_status || 'Active') === 'Suspended';
    const mismatch = Number(payment.claimed_amount_paise) !== Number(payment.expected_amount_paise);

    let auditHtml = '';
    if (payment.verified_by) {
      const dateStr = payment.verified_at ? new Date(payment.verified_at).toLocaleString() : '';
      auditHtml = `
        <div class="audit-stamp">
          <b>Action by Admin:</b> ${escapeHtml(payment.verified_by)} <br>
          <small><b>Timestamp:</b> ${escapeHtml(dateStr)}</small>
          ${payment.rejection_reason ? `<br><small style="color:var(--bad)"><b>Rejection reason:</b> ${escapeHtml(payment.rejection_reason)}</small>` : ''}
        </div>
      `;
    }

    const publicUrl = new URL('?code=' + encodeURIComponent(payment.preview_guest_code || ''), new URL('../', location.href)).href;

    return `
      <article class="payment-card" data-payment="${escapeHtml(payment.payment_id)}">
        <div class="payment-card-head">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <p class="eyebrow" style="margin:0;">${escapeHtml(payment.payment_status)} · ${escapeHtml(payment.payment_mode)}</p>
              <button type="button" 
                      class="toggle-url-btn ${isCardSuspended ? 'suspended-state' : 'active-state'}" 
                      data-toggle-card="${escapeHtml(payment.order_reference)}" 
                      data-next-state="${isCardSuspended ? 'Active' : 'Suspended'}">
                ${isCardSuspended ? '🔴 URL Disabled (Suspended)' : '🟢 URL Live & Active'}
              </button>
            </div>
            <h3>${escapeHtml(payment.order_reference)}</h3>
          </div>
          <div class="amount-pair">
            <span>Claimed</span>
            <strong class="${mismatch && isPending ? 'bad' : ''}">${formatINR(payment.claimed_amount_paise)}</strong>
          </div>
        </div>

        ${mismatch && isPending ? `<p class="flag">Claimed amount differs from expected advance of ${formatINR(payment.expected_amount_paise)}. Check received amount.</p>` : ''}

        <div class="facts">
          <p><b>Customer</b>${escapeHtml(payment.customer_name)} · ${escapeHtml(payment.customer_phone)}</p>
          <p><b>Email / City</b>${escapeHtml(payment.customer_email || '—')} · ${escapeHtml(payment.city || '—')}</p>
          <p><b>Couple / Date</b>${escapeHtml(payment.couple_name)} · ${escapeHtml(payment.event_date)}</p>
          <p><b>Package</b>${escapeHtml(payment.package)}</p>
          <p><b>Expected advance</b>${formatINR(payment.expected_amount_paise)}</p>
          <p><b>Card Link</b><a href="${escapeHtml(publicUrl)}" target="_blank" style="color:var(--wine); font-size:13px;">Open Guest Preview ↗</a></p>
        </div>

        ${auditHtml}

        ${isPending ? `
          <form class="review-form" data-review="${escapeHtml(payment.payment_id)}">
            <label>Verified amount (INR)
              <input name="verified_rupees" type="number" min="0" step="0.01" value="${(Number(payment.expected_amount_paise) / 100).toFixed(2)}" required>
            </label>
            <button class="button button-primary" name="decision" value="verify" type="submit">Verify &amp; activate card</button>
            <button class="button button-outline" name="decision" value="reject" type="submit" formnovalidate>Reject</button>
            <label class="reject-reason">Rejection reason
              <input name="rejection_reason" maxlength="500" placeholder="Required if rejecting">
            </label>
          </form>
        ` : `
          <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span style="font-size:12px; color:var(--muted)">Processed &amp; locked in ledger.</span>
            ${isVerified ? '<span style="color:var(--ok); font-weight:700; font-size:13px;">✓ Settlement Completed</span>' : ''}
            ${isRejected ? '<span style="color:var(--bad); font-weight:700; font-size:13px;">✕ Claim Rejected</span>' : ''}
          </div>
        `}
      </article>
    `;
  }).join('');
}

function renderCashRequests() {
  const host = $('cash-request-queue');
  if (!cashRequests.length) {
    host.innerHTML = '<div class="empty"><strong>No cash quote requests need follow-up.</strong></div>';
    return;
  }
  host.innerHTML = cashRequests.map(request => {
    const details = request.request_details || {};
    const id = escapeHtml(request.request_id);
    return `
      <article class="payment-card">
        <div class="payment-card-head">
          <div>
            <p class="eyebrow">${escapeHtml(request.status)} · Manual quote request</p>
            <h3>${escapeHtml(request.request_reference)}</h3>
          </div>
        </div>
        <div class="facts">
          <p><b>Customer</b>${escapeHtml(request.customer_name)}</p>
          <p><b>Phone / Email</b>${escapeHtml(request.phone || '—')} · ${escapeHtml(request.email || '—')}</p>
          <p><b>City</b>${escapeHtml(request.city || '—')}</p>
          <p><b>Couple / Date</b>${escapeHtml([request.bride_name, request.groom_name].filter(Boolean).join(' & ') || '—')} · ${escapeHtml(request.event_date || '—')}</p>
          <p><b>Venue</b>${escapeHtml(details.venue || '—')}</p>
          <p><b>Received</b>${escapeHtml(new Date(request.created_at).toLocaleString())}</p>
        </div>
        <div class="request-actions">
          ${request.status === 'New' ? `<button class="button button-outline button-small" type="button" data-cash-status="Contacted" data-cash-request="${id}">Mark contacted</button>` : ''}
          <button class="button button-primary button-small" type="button" data-cash-status="Converted" data-cash-request="${id}">Mark converted</button>
          <button class="button button-outline button-small" type="button" data-cash-status="Closed" data-cash-request="${id}">Close request</button>
        </div>
      </article>
    `;
  }).join('');
}

/* ───────────── event handlers ───────────── */

$('payment-filter-tabs')?.addEventListener('click', event => {
  const btn = event.target.closest('[data-filter]');
  if (!btn) return;
  document.querySelectorAll('#payment-filter-tabs .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderPayments();
});

$('admin-search-input')?.addEventListener('input', event => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderPayments();
});

$('payment-queue').addEventListener('click', async event => {
  const toggleBtn = event.target.closest('[data-toggle-card]');
  if (!toggleBtn) return;

  const orderRef = toggleBtn.dataset.toggleCard;
  const nextState = toggleBtn.dataset.nextState;

  const ok = await confirmAction({
    title: `${nextState === 'Suspended' ? 'Deactivate' : 'Activate'} Invitation URL?`,
    body: nextState === 'Suspended'
      ? `Kya aap order ${orderRef} ka invitation URL temporarily suspend karna chahte hain? Guest link kholne par card inactive message show hoga.`
      : `Order ${orderRef} ke invitation card ko wapas Live aur active kar diya jayega.`,
    confirmLabel: nextState === 'Suspended' ? 'Yes, Disable URL' : 'Yes, Activate URL',
    danger: nextState === 'Suspended'
  });

  if (!ok) return;

  toggleBtn.disabled = true;
  toggleBtn.textContent = 'Updating...';

  try {
    await callAdmin('toggle_card_status', { customer_id: orderRef, status: nextState });
    toast(`Order ${orderRef} status set to ${nextState}`);
    await renderQueue();
  } catch (err) {
    showError(err.message);
    toggleBtn.disabled = false;
  }
});

$('payment-queue').addEventListener('submit', async event => {
  const form = event.target.closest('[data-review]');
  if (!form) return;
  event.preventDefault();
  const button = event.submitter;
  const decision = button && button.value;
  if (decision !== 'verify' && decision !== 'reject') return;
  const payment = payments.find(p => String(p.payment_id) === form.dataset.review);
  if (!payment) return;
  const values = new FormData(form);
  const reason = String(values.get('rejection_reason') || '').trim();
  const rupees = Number(values.get('verified_rupees'));

  if (decision === 'reject') {
    const finalReason = reason || 'Payment not verified';
    const ok = await confirmAction({
      title: 'Reject the claim for ' + payment.order_reference + '?',
      body: 'The customer’s card stays inactive. Reason: ' + finalReason,
      confirmLabel: 'Reject claim',
      danger: true
    });
    if (!ok) return;

    for (const b of form.querySelectorAll('button')) b.disabled = true;
    try {
      await callAdmin('verify_payment', {
        payment_id: form.dataset.review,
        decision: 'reject',
        verified_amount_paise: null,
        rejection_reason: finalReason
      });
      toast('Claim rejected.');
      await renderQueue();
    } catch (error) {
      showError(error.message);
      for (const b of form.querySelectorAll('button')) b.disabled = false;
    }
    return;
  }

  if (decision === 'verify') {
    if (!Number.isFinite(rupees) || rupees < 0) return showError('Enter a valid amount.');
    showError('');

    const paise = Math.round(rupees * 100);
    const differs = paise !== Number(payment.expected_amount_paise);
    const ok = await confirmAction({
      title: 'Verify ' + formatINR(paise) + ' for ' + payment.order_reference + '?',
      body: 'This records ' + formatINR(paise) + ' as received, activates the card, and logs your admin credentials in the audit ledger.' +
        (differs ? ' Note: this differs from expected advance of ' + formatINR(payment.expected_amount_paise) + '.' : ''),
      confirmLabel: 'Yes, verify and activate'
    });
    if (!ok) return;

    for (const b of form.querySelectorAll('button')) b.disabled = true;
    try {
      await callAdmin('verify_payment', {
        payment_id: form.dataset.review,
        decision: 'verify',
        verified_amount_paise: paise,
        rejection_reason: ''
      });
      toast('Payment verified. Card activated.');
      await renderQueue();
    } catch (error) {
      showError(error.message);
      for (const b of form.querySelectorAll('button')) b.disabled = false;
    }
  }
});

$('cash-request-queue').addEventListener('click', async event => {
  const button = event.target.closest('[data-cash-status]');
  if (!button) return;
  const status = button.dataset.cashStatus;
  if (status !== 'Contacted') {
    const ok = await confirmAction({
      title: status === 'Converted' ? 'Mark as converted?' : 'Close this request?',
      body: status === 'Converted' ? 'Use this once the customer has agreed a package and price.' : 'The request will leave the follow-up list.',
      confirmLabel: status === 'Converted' ? 'Yes, converted' : 'Close request',
      danger: status === 'Closed'
    });
    if (!ok) return;
  }
  button.disabled = true;
  showError('');
  try {
    await callAdmin('update_cash_request', { action: 'update_cash_request', request_id: button.dataset.cashRequest, status });
    toast('Request updated: ' + status);
    await renderQueue();
  } catch (error) {
    showError(error.message);
    button.disabled = false;
  }
});

$('refresh').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try { await renderQueue(); toast('Queue refreshed'); } catch (error) { showError(error.message); }
  button.disabled = false;
});

route();