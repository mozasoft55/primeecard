import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import { formatINR, parseGuestCsv } from '../onboarding-core.js';

const params = new URLSearchParams(location.search);
let accessToken = params.get('token') || sessionStorage.getItem('customer-dashboard-token') || '';
let orderReference = params.get('order') || sessionStorage.getItem('customer-dashboard-order') || '';
if (params.has('token')) {
  sessionStorage.setItem('customer-dashboard-token', accessToken);
  history.replaceState(null, '', `${location.pathname}${orderReference ? `?order=${encodeURIComponent(orderReference)}` : ''}`);
}
if (orderReference) sessionStorage.setItem('customer-dashboard-order', orderReference);

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

async function dashboardRequest(action, extra = {}) {
  const response = await fetch(ONBOARDING_CONFIG.dashboardEndpoint, {
    method: 'POST',
    headers: {
      apikey: ONBOARDING_CONFIG.publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, ...extra }),
    cache: 'no-store'
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    if (response.status === 401) {
      sessionStorage.removeItem('customer-dashboard-token');
      accessToken = '';
    }
    throw new Error(result.error || 'Dashboard request failed.');
  }
  return result.dashboard ?? result;
}

function renderGuests(guests) {
  const table = guests.length
    ? `<table><thead><tr><th>Guest</th><th>Category</th><th>Invited count</th><th>Phone</th><th>Private code</th><th>Share</th><th>Manage</th></tr></thead><tbody>
      ${guests.map(guest => {
        const invitationUrl = new URL(`?code=${encodeURIComponent(guest.invite_code)}`, new URL('../', location.href)).href;
        const message = `You are invited to ${dashboard.wedding.couple_name}'s wedding celebration. View your invitation: ${invitationUrl}`;
        const whatsappUrl = `https://wa.me/${String(guest.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        return `<tr>
          <td>${escapeHtml(guest.guest_name)}</td>
          <td>${escapeHtml(guest.category || 'person')}</td>
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
  const byStatus = rsvps.reduce((summary, item) => {
    summary[item.status] = (summary[item.status] || 0) + 1;
    return summary;
  }, {});
  const pending = Math.max(0, guests.length - rsvps.length);
  document.getElementById('rsvp-summary').innerHTML = [
    ['Invited', guests.length],
    ['Pending', pending],
    ['Attending', byStatus.attending || 0],
    ['Declined', byStatus.declined || 0],
    ['Tentative', byStatus.tentative || 0]
  ].map(([name, count]) => `<span class="rsvp-chip">${escapeHtml(name)} · ${escapeHtml(count)}</span>`).join('');
  document.getElementById('rsvp-table-wrap').innerHTML = rsvps.length
    ? `<table><thead><tr><th>Guest</th><th>Response</th><th>Attending</th><th>Response time</th><th>Wishes</th></tr></thead><tbody>
      ${rsvps.map(item => `<tr><td>${escapeHtml(item.guest_name)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.attending_count)}</td><td>${escapeHtml(new Date(item.submitted_at).toLocaleString())}</td><td>${escapeHtml(item.wishes_message || '—')}</td></tr>`).join('')}
      </tbody></table>`
    : '<p class="helper">No RSVP responses have arrived yet.</p>';
}

function renderTimeline(events) {
  document.getElementById('timeline').innerHTML = events.length
    ? events.map(event => `<li><time>${escapeHtml(formatDate(event.event_date))}</time><strong>${escapeHtml(event.event_name)}</strong><small>${escapeHtml(event.event_time || '')}${event.note ? ` · ${escapeHtml(event.note)}` : ''}</small></li>`).join('')
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
  document.getElementById('preview-link').href = data.preview_guest_code
    ? `../?code=${encodeURIComponent(data.preview_guest_code)}`
    : `../share.html?id=${encodeURIComponent(data.wedding_id)}`;
  const guestLinks = document.getElementById('generate-guest-links');
  guestLinks.href = `../guest-list.html?w=${encodeURIComponent(data.wedding_id)}`;
  renderGuests(data.guests);
  renderRsvps(data.rsvps, data.guests);
  renderTimeline(data.events);
}

document.getElementById('generate-guest-links').addEventListener('click', event => {
  if (!dashboard) return;
  event.preventDefault();
  sessionStorage.setItem('wedding-guest-link-data', JSON.stringify({
    wedding_id: dashboard.wedding_id,
    bride_name: dashboard.wedding.bride_name,
    groom_name: dashboard.wedding.groom_name,
    guests: dashboard.guests
      .filter(guest => guest.category !== 'preview')
      .map(({ guest_name, invite_code }) => ({ guest_name, invite_code }))
  }));
  location.href = event.currentTarget.href;
});

async function refreshDashboard() {
  if (!accessToken || !orderReference) {
    throw new Error('Open the secure dashboard link from your order email. An order reference alone does not grant access.');
  }
  const data = await dashboardRequest('load');
  renderDashboard(data);
}

document.getElementById('dashboard-link-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const pasted = document.getElementById('dashboard-link-input').value.trim();
    const link = new URL(pasted, location.href);
    const token = link.searchParams.get('token');
    const order = link.searchParams.get('order');
    if (link.origin !== location.origin || !link.pathname.endsWith('/dashboard/')
        || !token || token.length < 32 || !order) {
      throw new Error('Paste the complete dashboard link from your order email. It must include both order and token.');
    }
    accessToken = token;
    orderReference = order;
    sessionStorage.setItem('customer-dashboard-token', token);
    sessionStorage.setItem('customer-dashboard-order', order);
    history.replaceState(null, '', `${location.pathname}?order=${encodeURIComponent(order)}`);
    await refreshDashboard();
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('csv-template').href = `data:text/csv;charset=utf-8,${encodeURIComponent('guest_name,family_members,phone,category,city_address\nSample Guest,2,+919876543210,family,Howrah\n')}`;

guestForm.addEventListener('submit', async event => {
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
    guestForm.elements.category.value = 'person';
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  } finally {
    submit.disabled = false;
  }
});

csvInput.addEventListener('change', async () => {
  importedGuests = [];
  importButton.disabled = true;
  importPreview.hidden = false;
  const file = csvInput.files?.[0];
  if (!file) {
    importPreview.hidden = true;
    return;
  }
  if (!file.name.toLowerCase().endsWith('.csv') || file.size > 1024 * 1024) {
    importPreview.textContent = 'Choose a CSV file up to 1 MB. Export .xlsx sheets as CSV first.';
    return;
  }
  try {
    importedGuests = parseGuestCsv(await file.text());
    const existingKeys = new Set(dashboard.guests.map(guest =>
      `${String(guest.guest_name).trim().toLocaleLowerCase()}\u0000${String(guest.phone || '').replace(/\D/g, '')}`
    ));
    const existingDuplicate = importedGuests.find(guest =>
      existingKeys.has(`${guest.guest_name.trim().toLocaleLowerCase()}\u0000${guest.phone.replace(/\D/g, '')}`)
    );
    if (existingDuplicate) {
      importedGuests = [];
      throw new Error(`Guest "${existingDuplicate.guest_name}" already exists with this phone number.`);
    }
    importPreview.textContent = `Ready to import ${importedGuests.length} guests: ${importedGuests.slice(0, 5).map(guest => guest.guest_name).join(', ')}${importedGuests.length > 5 ? '…' : ''}. No rows are written until you confirm.`;
    importButton.disabled = false;
  } catch (error) {
    importPreview.textContent = error.message;
  }
});

importButton.addEventListener('click', async () => {
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

document.getElementById('guest-table-wrap').addEventListener('click', async event => {
  const copy = event.target.closest('[data-copy]');
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  if (copy) {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = 'Copied';
    } catch {
      alert('Could not copy link. Select and copy the invitation link from the guest row.');
    }
  }
  if (edit) {
    const guest = dashboard.guests.find(item => item.id === edit.dataset.edit);
    if (!guest) return;
    const editForm = document.getElementById('edit-form');
    for (const name of ['guest_name', 'family_members', 'phone', 'category', 'city_address']) {
      editForm.elements[name].value = guest[name] ?? '';
    }
    editForm.elements.guest_id.value = guest.id;
    editDialog.showModal();
  }
  if (remove && confirm('Delete this guest and disable their invitation code?')) {
    try {
      await dashboardRequest('delete_guest', { guest_id: remove.dataset.delete });
      await refreshDashboard();
    } catch (error) {
      alert(error.message);
    }
  }
});

document.getElementById('edit-form').addEventListener('submit', async event => {
  if (event.submitter?.value !== 'save') return;
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const guestId = values.guest_id;
  delete values.guest_id;
  values.family_members = Number(values.family_members);
  values.with_family = values.family_members > 1;
  const button = document.getElementById('save-guest');
  button.disabled = true;
  try {
    await dashboardRequest('update_guest', { guest_id: guestId, guest: values });
    editDialog.close();
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('refresh-button').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await refreshDashboard();
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});

if (!accessToken || !orderReference) {
  showError('This is a private dashboard. Paste the complete secure link from your order email below to load your wedding, payment, guest, and RSVP data.');
} else {
  refreshDashboard().catch(error => showError(error.message));
}
