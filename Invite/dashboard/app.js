import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR, parseGuestCsv } from '../onboarding-core.js';

const params = new URLSearchParams(location.search);
let orderReference = params.get('order') || sessionStorage.getItem('customer-dashboard-order') || 'ORD-EF36690B';

sessionStorage.setItem('customer-dashboard-order', orderReference);

const loading = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const dashboardContent = document.getElementById('dashboard-content');
const guestForm = document.getElementById('guest-form');
const csvInput = document.getElementById('guest-csv');
const importButton = document.getElementById('import-guests');
const importPreview = document.getElementById('import-preview');
const editDialog = document.getElementById('edit-dialog');
let dashboard;
let importedGuests = [];

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

function showError(message) {
  if (loading) loading.hidden = true;
  if (dashboardContent) dashboardContent.hidden = true;
  if (errorState) errorState.hidden = false;
  const msgElem = document.getElementById('error-message');
  if (msgElem) msgElem.textContent = message;
}

// 100% DIRECT DATABASE RPC (Zero Edge Function dependency)
async function dashboardRequest(action, extra = {}) {
  const supabaseBase = ONBOARDING_CONFIG.supabaseUrl 
    || (ONBOARDING_CONFIG.dashboardEndpoint ? ONBOARDING_CONFIG.dashboardEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
  const rpcUrl = `${supabaseBase}/rest/v1/rpc/manage_customer_dashboard`;

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'apikey': ONBOARDING_CONFIG.publishableKey,
      'Authorization': `Bearer ${ONBOARDING_CONFIG.publishableKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_order_reference: orderReference,
      p_action: action,
      p_extra: extra
    }),
    cache: 'no-store'
  });

  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error(result.error || result.message || 'Dashboard request failed.');
  }
  return result.dashboard ?? result;
}

function renderGuests(guests) {
  const list = guests || [];
  const table = list.length
    ? `<table><thead><tr><th>Guest</th><th>Category</th><th>Invited count</th><th>Phone</th><th>Private code</th><th>Share</th><th>Manage</th></tr></thead><tbody>
      ${list.map(guest => {
        const invitationUrl = new URL(`?code=${encodeURIComponent(guest.invite_code)}`, new URL('../', location.href)).href;
        const message = `You are invited to ${dashboard?.wedding?.couple_name || 'our'}'s wedding celebration. View your invitation: ${invitationUrl}`;
        const whatsappUrl = `https://wa.me/${String(guest.phone \vert{}\vert{} '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        return `<tr>
          <td>${escapeHtml(guest.guest_name)}</td>
          <td>${escapeHtml(guest.category || 'Family')}</td>
          <td>${escapeHtml(guest.family_members)}</td>
          <td>${escapeHtml(guest.phone || '—')}</td>
          <td><code>${escapeHtml(guest.invite_code)}</code></td>
          <td class="table-actions"><button type="button" data-copy="${escapeHtml(invitationUrl)}">Copy link</button>${guest.phone ? `<a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ''}</td>
          <td class="table-actions"><button type="button" data-edit="${escapeHtml(guest.id)}">Edit</button><button type="button" data-delete="${escapeHtml(guest.id)}">Delete</button></td>
        </tr>`;
      }).join('')}
      </tbody></table>`
    : '<p class="helper">No guests added yet. Add a guest or import a CSV to create secure invitation links.</p>';
  const wrap = document.getElementById('guest-table-wrap');
  if (wrap) wrap.innerHTML = table;
}

function renderRsvps(rsvps, guests) {
  const list = rsvps || [];
  const guestList = guests || [];
  const byStatus = list.reduce((summary, item) => {
    summary[item.status] = (summary[item.status] || 0) + 1;
    return summary;
  }, {});
  const pending = Math.max(0, guestList.length - list.length);
  const summaryElem = document.getElementById('rsvp-summary');
  if (summaryElem) {
    summaryElem.innerHTML = [
      ['Invited', guestList.length],
      ['Pending', pending],
      ['Attending', byStatus.attending || 0],
      ['Declined', byStatus.declined || 0],
      ['Tentative', byStatus.tentative || 0]
    ].map(([name, count]) => `<span class="rsvp-chip">${escapeHtml(name)} · ${escapeHtml(count)}</span>`).join('');
  }
  const tableWrap = document.getElementById('rsvp-table-wrap');
  if (tableWrap) {
    tableWrap.innerHTML = list.length
      ? `<table><thead><tr><th>Guest</th><th>Response</th><th>Attending</th><th>Response time</th><th>Wishes</th></tr></thead><tbody>
        ${list.map(item => `<tr><td>${escapeHtml(item.guest_name)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.attending_count)}</td><td>${escapeHtml(new Date(item.submitted_at).toLocaleString())}</td><td>${escapeHtml(item.wishes_message || '—')}</td></tr>`).join('')}
        </tbody></table>`
      : '<p class="helper">No RSVP responses have arrived yet.</p>';
  }
}

function renderTimeline(events) {
  const list = events || [];
  const timelineElem = document.getElementById('timeline');
  if (timelineElem) {
    timelineElem.innerHTML = list.length
      ? list.map(event => `<li><time>${escapeHtml(formatDate(event.event_date))}</time><strong>${escapeHtml(event.event_name)}</strong><small>${escapeHtml(event.event_time || '')}${event.note ? ` · ${escapeHtml(event.note)}` : ''}</small></li>`).join('')
      : '<li><strong>No events added</strong></li>';
  }
}

function renderDashboard(data) {
  dashboard = data;

  // HIDE SPINNER AND SHOW CONTENT IMMEDIATELY
  if (loading) loading.hidden = true;
  if (errorState) errorState.hidden = true;
  if (dashboardContent) dashboardContent.hidden = false;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('couple-title', data?.wedding?.couple_name || 'Tarana & Akbar');
  setTxt('wedding-date', formatDate(data?.event_date));
  setTxt('order-reference', data?.order_reference || orderReference);
  setTxt('package-name', data?.package || 'Standard Package');
  setTxt('order-status', data?.order_status || 'Order Received');
  setTxt('payment-status', data?.payment_status || 'Pending Verification');
  setTxt('list-price', formatINR(data?.list_price_paise || 400000));
  setTxt('discount', formatINR(data?.discount_paise || 100000));
  setTxt('advance-expected', formatINR(data?.advance_expected_paise || 150000));
  setTxt('advance-verified', formatINR(data?.advance_verified_paise || 0));
  setTxt('balance', formatINR(data?.balance_paise || 150000));

  const previewLink = document.getElementById('preview-link');
  if (previewLink) {
    previewLink.href = `../?code=${encodeURIComponent(data?.preview_guest_code || '9D6JGSQY7YD8')}`;
  }

  const guestLinks = document.getElementById('generate-guest-links');
  if (guestLinks) {
    guestLinks.href = `../guest-list.html?w=${encodeURIComponent(data?.wedding_id || '')}`;
  }

  renderGuests(data?.guests || []);
  renderRsvps(data?.rsvps || [], data?.guests || []);
  renderTimeline(data?.events || []);
}

async function refreshDashboard() {
  try {
    const data = await dashboardRequest('load');
    renderDashboard(data);
  } catch (err) {
    console.error('Dashboard load error:', err);
    showError(err.message || 'Failed to load dashboard.');
  }
}

// Event Listeners
document.getElementById('csv-template')?.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent('guest_name,family_members,phone,category,city_address\nSample Guest,2,+919876543210,Family,Howrah\n')}`);

guestForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = guestForm.querySelector('[type=submit]');
  if (submit) submit.disabled = true;
  const values = Object.fromEntries(new FormData(guestForm));
  try {
    await dashboardRequest('add_guests', { guests: [{
      ...values,
      family_members: Number(values.family_members),
      with_family: Number(values.family_members) > 1
    }] });
    guestForm.reset();
    if (guestForm.elements.family_members) guestForm.elements.family_members.value = '1';
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  } finally {
    if (submit) submit.disabled = false;
  }
});

csvInput?.addEventListener('change', async () => {
  importedGuests = [];
  if (importButton) importButton.disabled = true;
  if (importPreview) importPreview.hidden = false;
  const file = csvInput.files?.[0];
  if (!file) return;
  try {
    importedGuests = parseGuestCsv(await file.text());
    if (importPreview) {
      importPreview.textContent = `Ready to import ${importedGuests.length} guests: ${importedGuests.slice(0, 5).map(g => g.guest_name).join(', ')}${importedGuests.length > 5 ? '…' : ''}.`;
    }
    if (importButton) importButton.disabled = false;
  } catch (error) {
    if (importPreview) importPreview.textContent = error.message;
  }
});

importButton?.addEventListener('click', async () => {
  if (!importedGuests.length) return;
  importButton.disabled = true;
  importButton.textContent = 'Importing…';
  try {
    const result = await dashboardRequest('add_guests', { guests: importedGuests });
    if (importPreview) importPreview.textContent = `Imported ${result.inserted} guest records successfully.`;
    importedGuests = [];
    csvInput.value = '';
    await refreshDashboard();
  } catch (error) {
    if (importPreview) importPreview.textContent = error.message;
  } finally {
    importButton.disabled = false;
    importButton.textContent = 'Import validated rows';
  }
});

document.getElementById('guest-table-wrap')?.addEventListener('click', async event => {
  const copy = event.target.closest('[data-copy]');
  const remove = event.target.closest('[data-delete]');
  if (copy) {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = 'Copied';
      setTimeout(() => { copy.textContent = 'Copy link'; }, 2000);
    } catch {
      alert('Could not copy link.');
    }
  }
  if (remove && confirm('Delete this guest?')) {
    try {
      await dashboardRequest('delete_guest', { guest_id: remove.dataset.delete });
      await refreshDashboard();
    } catch (error) {
      alert(error.message);
    }
  }
});

document.getElementById('refresh-button')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await refreshDashboard();
  } finally {
    button.disabled = false;
  }
});

// START EXECUTION INSTANTLY
refreshDashboard();
