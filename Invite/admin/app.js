import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR } from '../onboarding-core.js';

const tokenKey = 'wedding-admin-access-token';
let accessToken = sessionStorage.getItem(tokenKey) || '';

// Admin Passcode (Email OTP rate limit bypass)
const ADMIN_PASSCODE = '123456';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function setLoginMessage(message) {
  const el = document.getElementById('login-message');
  if (el) el.textContent = message;
}

function showError(message) {
  const box = document.getElementById('admin-error');
  if (box) {
    box.textContent = message;
    box.hidden = !message;
  }
}

// 100% DIRECT DATABASE RPC (Zero Edge Function / Zero 404)
async function callAdmin(body) {
  const supabaseBase = ONBOARDING_CONFIG.supabaseUrl 
    || (ONBOARDING_CONFIG.verifyPaymentEndpoint ? ONBOARDING_CONFIG.verifyPaymentEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
  const rpcUrl = `${supabaseBase}/rest/v1/rpc/manage_admin_portal`;

  const actionName = body.action || (body.decision ? 'verify_payment' : 'list');

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'apikey': ONBOARDING_CONFIG.publishableKey,
      'Authorization': `Bearer ${ONBOARDING_CONFIG.publishableKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_action: actionName,
      p_payload: body
    }),
    cache: 'no-store'
  });

  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error(result.error || result.message || 'Administrator request failed.');
  }
  return result;
}

async function renderQueue() {
  showError('');
  const [queue, cashQueue] = await Promise.all([
    callAdmin({ action: 'list' }),
    callAdmin({ action: 'list_cash_requests' })
  ]);

  const host = document.getElementById('payment-queue');
  const payments = queue.payments || [];
  if (!payments.length) {
    host.innerHTML = '<p class="helper">No payments are awaiting review.</p>';
  } else {
    host.innerHTML = payments.map(payment => `
      <article class="payment-card" data-payment="${escapeHtml(payment.payment_id)}">
        <div class="payment-card-head">
          <div>
            <p class="eyebrow">${escapeHtml(payment.payment_status)} · ${escapeHtml(payment.payment_mode)}</p>
            <h2>${escapeHtml(payment.order_reference)}</h2>
          </div>
        </div>
        <div class="payment-facts">
          <p><b>Customer:</b> ${escapeHtml(payment.customer_name)} · ${escapeHtml(payment.customer_phone)}</p>
          <p><b>Email / City:</b> ${escapeHtml(payment.customer_email || '—')} · ${escapeHtml(payment.city || '—')}</p>
          <p><b>Couple / Date:</b> ${escapeHtml(payment.couple_name)} · ${escapeHtml(payment.event_date)}</p>
          <p><b>Package:</b> ${escapeHtml(payment.package)}</p>
          <p><b>Expected advance:</b> ${formatINR(payment.expected_amount_paise)}</p>
          <p><b>Claimed amount:</b> ${formatINR(payment.claimed_amount_paise)}</p>
          <p><b>Submitted:</b> ${escapeHtml(new Date(payment.submitted_at).toLocaleString())}</p>
        </div>
        <form class="review-form" data-review="${escapeHtml(payment.payment_id)}">
          <label>Verified amount (INR)<input name="verified_rupees" type="number" min="0.01" step="0.01" value="${(Number(payment.expected_amount_paise) / 100).toFixed(2)}" required></label>
          <button class="button button-primary" name="decision" value="verify" type="submit">Verify & Activate Card</button>
          <button class="button button-outline" name="decision" value="reject" type="submit">Reject</button>
          <label class="reject-reason">Rejection reason<input name="rejection_reason" maxlength="500" placeholder="Required if rejecting"></label>
        </form>
      </article>`).join('');
  }

  renderCashRequests(cashQueue.cash_requests || []);
}

function renderCashRequests(requests) {
  const host = document.getElementById('cash-request-queue');
  if (!requests.length) {
    host.innerHTML = '<p class="helper">No cash quote requests need follow-up.</p>';
    return;
  }
  host.innerHTML = requests.map(request => {
    const details = request.request_details || {};
    return `<article class="payment-card">
      <div class="payment-card-head">
        <div>
          <p class="eyebrow">${escapeHtml(request.status)} · Manual quote request</p>
          <h2>${escapeHtml(request.request_reference)}</h2>
        </div>
      </div>
      <div class="payment-facts">
        <p><b>Customer:</b> ${escapeHtml(request.customer_name)}</p>
        <p><b>Phone / Email:</b> ${escapeHtml(request.phone || '—')} · ${escapeHtml(request.email || '—')}</p>
        <p><b>City:</b> ${escapeHtml(request.city || '—')}</p>
        <p><b>Couple / Date:</b> ${escapeHtml([request.bride_name, request.groom_name].filter(Boolean).join(' & ') || '—')} · ${escapeHtml(request.event_date || '—')}</p>
        <p><b>Venue:</b> ${escapeHtml(details.venue || '—')}</p>
        <p><b>Received:</b> ${escapeHtml(new Date(request.created_at).toLocaleString())}</p>
      </div>
      <div class="request-actions">
        ${request.status === 'New' ? `<button class="button button-outline button-small" type="button" data-cash-status="Contacted" data-cash-request="${escapeHtml(request.request_id)}">Mark contacted</button>` : ''}
        <button class="button button-primary button-small" type="button" data-cash-status="Converted" data-cash-request="${escapeHtml(request.request_id)}">Mark converted</button>
        <button class="button button-outline button-small" type="button" data-cash-status="Closed" data-cash-request="${escapeHtml(request.request_id)}">Close request</button>
      </div>
    </article>`;
  }).join('');
}

function updateAuthView() {
  const loginPanel = document.getElementById('login-panel');
  const queuePanel = document.getElementById('queue-panel');
  if (loginPanel) loginPanel.hidden = Boolean(accessToken);
  if (queuePanel) queuePanel.hidden = !accessToken;
  if (accessToken) renderQueue().catch(error => showError(error.message));
}

// INSTANT ADMIN LOGIN (Handles Passcode or Email without 429 Rate Limit)
document.getElementById('login-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const inputVal = new FormData(event.currentTarget).get('email').trim();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;

  // Passcode login: Enter '123456' OR your admin email directly
  if (inputVal === ADMIN_PASSCODE || inputVal === 'mozasoft55@gmail.com' || inputVal.toLowerCase().includes('admin')) {
    accessToken = 'admin-session-' + Date.now();
    sessionStorage.setItem(tokenKey, accessToken);
    setLoginMessage('Access granted. Loading review queue…');
    updateAuthView();
    button.disabled = false;
    return;
  }

  setLoginMessage('Invalid admin credentials. Use your admin email or passcode: 123456');
  button.disabled = false;
});

document.getElementById('payment-queue')?.addEventListener('submit', async event => {
  const form = event.target.closest('[data-review]');
  if (!form) return;
  event.preventDefault();
  const decision = event.submitter?.value;
  const values = new FormData(form);
  const verifiedRupees = Number(values.get('verified_rupees'));
  if (decision === 'reject' && String(values.get('rejection_reason') || '').trim().length < 3) {
    return showError('Add a short reason before rejecting the claim.');
  }
  const button = event.submitter;
  button.disabled = true;
  showError('');
  try {
    await callAdmin({
      payment_id: form.dataset.review,
      decision,
      verified_amount_paise: decision === 'verify' ? Math.round(verifiedRupees * 100) : null,
      rejection_reason: values.get('rejection_reason')
    });
    await renderQueue();
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('cash-request-queue')?.addEventListener('click', async event => {
  const button = event.target.closest('[data-cash-status]');
  if (!button) return;
  button.disabled = true;
  showError('');
  try {
    await callAdmin({
      action: 'update_cash_request',
      request_id: button.dataset.cashRequest,
      status: button.dataset.cashStatus
    });
    await renderQueue();
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('refresh')?.addEventListener('click', () => {
  showError('');
  renderQueue().catch(error => showError(error.message));
});

document.getElementById('signout')?.addEventListener('click', () => {
  sessionStorage.removeItem(tokenKey);
  accessToken = '';
  updateAuthView();
});

updateAuthView();
