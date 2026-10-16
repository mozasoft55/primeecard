import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR, parseGuestCsv } from '../onboarding-core.js';

const params = new URLSearchParams(location.search);
let accessToken = params.get('token') || sessionStorage.getItem('customer-dashboard-token') || 'direct-access';
let orderReference = params.get('order') || sessionStorage.getItem('customer-dashboard-order') || '';

if (orderReference) {
  sessionStorage.setItem('customer-dashboard-order', orderReference);
  sessionStorage.setItem('customer-dashboard-token', accessToken);
}

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
  loading.hidden = true;
  dashboardContent.hidden = true;
  errorState.hidden = false;
  document.getElementById('error-message').textContent = message;
}

// BULLETPROOF DATABASE RPC REQUEST (Zero Edge Function / Zero 404)
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
    throw new Error(result.error || 'Dashboard request failed.');
  }
  return result.dashboard ?? result;
}

function renderGuests(guests) {
  const table = guests && guests.length
    ? `<table><thead><tr><th>Guest</th><th>Category</th><th>Invited count</th><th>Phone</th><th>Private code</th><th>Share</th><th>Manage</th></tr></thead><tbody>
      ${guests.map(guest => {
        const invitationUrl = new URL(`?code=${encodeURIComponent(guest.invite_code)}`, new URL('../', location.href)).href;
        const message = `You are invited to ${dashboard.wedding.couple_name}'s wedding celebration. View your invitation: ${invitationUrl}`;
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
  document.getElementById('guest-table-wrap').innerHTML = table;
}

function renderRsvps(rsvps, guests) {
  const list = rsvps || [];
  const guestList = guests || [];
  const byStatus = list.reduce((summary, item) => {
    summary[item.status] = (summary[item.status] || 0) + 1;
    return summary;
  }, {});
  const pending = Math.max(0, guestList.length - list.length);
  document.getElementById('rsvp-summary').innerHTML = [
    ['Invited', guestList.length],
    ['Pending', pending],
    ['Attending', byStatus.attending || 0],
    ['Declined', byStatus.declined || 0],
    ['Tentative', byStatus.tentative || 0]
  ].map(([name, count]) => `<span class="rsvp-chip">${escapeHtml(name)} · ${escapeHtml(count)}</span>`).join('');
  document.getElementById('rsvp-table-wrap').innerHTML = list.length
    ? `<table><thead><tr><th>Guest</th><th>Response</th><th>Attending</th><th>Response time</th><th>Wishes</th></tr></thead><tbody>
      ${list.map(item => `<tr><td>${escapeHtml(item.guest_name)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.attending_count)}</td><td>${escapeHtml(new Date(item.submitted_at).toLocaleString())}</td><td>${escapeHtml(item.wishes_message || '—')}</td></tr>`).join('')}
      </tbody></table>`
    : '<p class="helper">No RSVP responses have arrived yet.</p>';
}

function renderTimeline(events) {
  const list = events || [];
  document.getElementById('timeline').innerHTML = list.length
    ? list.map(event => `<li><time>${escapeHtml(formatDate(event.event_date))}</time><strong>${escapeHtml(event.event_name)}</strong><small>${escapeHtml(event.event_time || '')}${event.note ? ` · ${escapeHtml(event.note)}` : ''}</small></li>`).join('')
    : '<li><strong>No events added</strong></li>';
}

function renderDashboard(data) {
  dashboard = data;
  loading.hidden = true;
  errorState.hidden = true;
  dashboardContent.hidden = false;
  document.getElementById('couple-title').textContent = data.wedding.couple_name || 'Your wedding';
  document.getElementById('wedding-date').textContent = formatDate(data.event_date);
  document.getElementById('order-reference').textContent = data.order_reference;
  document.getElementById('package-name').textContent = data.package;
  document.getElementById('order-status').textContent = data.order_status;
  document.getElementById('payment-status').textContent = data.payment_status;
  document.getElementById('list-price').textContent = formatINR(data.list_price_paise);
  document.getElementById('discount').textContent = formatINR(data.discount_paise);
  document.getElementById('advance-expected').textContent = formatINR(data.advance_expected_paise);
  document.getElementById('advance-verified').textContent = formatINR(data.advance_verified_paise);
  document.getElementById('balance').textContent = formatINR(data.balance_paise);
  
  const previewLink = document.getElementById('preview-link');
  if (previewLink) {
    previewLink.href = `../?code=${encodeURIComponent(data.preview_guest_code || '9D6JGSQY7YD8')}`;
  }
  
  const guestLinks = document.getElementById('generate-guest-links');
  if (guestLinks) {
    guestLinks.href = `../guest-list.html?w=${encodeURIComponent(data.wedding_id)}`;
  }

  renderGuests(data.guests || []);
  renderRsvps(data.rsvps || [], data.guests || []);
  renderTimeline(data.events || []);
}

document.getElementById('generate-guest-links')?.addEventListener('click', event => {
  if (!dashboard) return;
  event.preventDefault();
  sessionStorage.setItem('wedding-guest-link-data', JSON.stringify({
    wedding_id: dashboard.wedding_id,
    bride_name: dashboard.wedding.bride_name,
    groom_name: dashboard.wedding.groom_name,
    guests: (dashboard.guests || [])
      .filter(guest => guest.category !== 'preview')
      .map(({ guest_name, invite_code }) => ({ guest_name, invite_code }))
  }));
  location.href = event.currentTarget.href;
});

async function refreshDashboard() {
  if (!orderReference) {
    throw new Error('Please enter your order reference to load your dashboard.');
  }
  const data = await dashboardRequest('load');
  renderDashboard(data);
}

document.getElementById('dashboard-link-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const pasted = document.getElementById('dashboard-link-input').value.trim();
    let order = pasted;
    if (pasted.includes('order=')) {
      const url = new URL(pasted, location.href);
      order = url.searchParams.get('order') || pasted;
    }
    orderReference = order;
    sessionStorage.setItem('customer-dashboard-order', order);
    history.replaceState(null, '', `${location.pathname}?order=${encodeURIComponent(order)}`);
    await refreshDashboard();
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});

const csvTemplate = document.getElementById('csv-template');
if (csvTemplate) {
  csvTemplate.href = `data:text/csv;charset=utf-8,${encodeURIComponent('guest_name,family_members,phone,category,city_address\nSample Guest,2,+919876543210,family,Howrah\n')}`;
}

guestForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = guestForm.querySelector('[type=submit]');
  submit.disabled = true;
  const values = Object.fromEntries(new FormData(guestForm));
  try {
    await dashboardRequest('add_guests', { guests: [{
      ...values,
      family_members: Number(values.family_members),
      with_family: Number(values.family_members) > 1
    }] });
    guestForm.reset();
    guestForm.elements.family_members.value = '1';
    guestForm.elements.category.value = 'Family';
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  } finally {
    submit.disabled = false;
  }
});

csvInput?.addEventListener('change', async () => {
  importedGuests = [];
  importButton.disabled = true;
  importPreview.hidden = false;
  const file = csvInput.files?.[0];
  if (!file) {
    importPreview.hidden = true;
    return;
  }
  try {
    importedGuests = parseGuestCsv(await file.text());
    importPreview.textContent = `Ready to import ${importedGuests.length} guests: ${importedGuests.slice(0, 5).map(g => g.guest_name).join(', ')}${importedGuests.length > 5 ? '…' : ''}.`;
    importButton.disabled = false;
  } catch (error) {
    importPreview.textContent = error.message;
  }
});

importButton?.addEventListener('click', async () => {
  if (!importedGuests.length) return;
  importButton.disabled = true;
  importButton.textContent = 'Importing…';
  try {
    const result = await dashboardRequest('add_guests', { guests: importedGuests });
    importPreview.textContent = `Imported ${result.inserted} guest records successfully.`;
    importedGuests = [];
    csvInput.value = '';
    await refreshDashboard();
  } catch (error) {
    importPreview.textContent = error.message;
    importButton.disabled = false;
  } finally {
    importButton.textContent = 'Import validated rows';
  }
});

document.getElementById('guest-table-wrap')?.addEventListener('click', async event => {
  const copy = event.target.closest('[data-copy]');
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  if (
