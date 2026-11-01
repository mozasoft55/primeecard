import { ONBOARDING_CONFIG } from '../onboarding-config.js';
import {
  AVAILABLE_TEMPLATES,
  DEFAULT_STYLES,
  DEFAULT_THEMES,
  DEFAULT_EVENTS,
  buildUpiUri,
  formatINR,
  validateCashRequest,
  validateOnboarding
} from '../onboarding-core.js';

const form = document.getElementById('onboarding-form');
const steps = [...document.querySelectorAll('.form-step')];
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');
const submitButton = document.getElementById('submit-button');
const errorBox = document.getElementById('form-error');
const packageList = document.getElementById('package-list');
const upiPanel = document.getElementById('upi-panel');
const cashPanel = document.getElementById('cash-panel');
const eventList = document.getElementById('event-list');
const designWarning = document.getElementById('design-warning');
let currentStep = 0;
let currentOrderReference = '';
let currentDashboardToken = '';
let eventRows = DEFAULT_EVENTS.map(event => ({ ...event, event_date: '', note: '' }));
let packages = [];
let paymentConfig = { upi_vpa: '', merchant_name: '' };
let themes = [];
let captchaWidget;
let packageConfigurationLoaded = false;
let designConfigurationLoaded = false;
let cashRequestMode = false;
let busy = false;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

// ── Time helpers (12h AM/PM <-> 24h HH:MM) ──────────────────────────────────
function to12h(time24) {
  if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return { hour12: '', minute: '', ampm: '' };
  let [h, m] = time24.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return { hour12: String(h).padStart(2, '0'), minute: String(m).padStart(2, '0'), ampm };
}
function to24h(hour12, minute, ampm) {
  const h = parseInt(hour12, 10);
  const m = parseInt(minute, 10);
  if (!hour12 || !minute || !ampm || isNaN(h) || isNaN(m)) return '';
  const h24 = ampm === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
  return String(h24).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function buildTimePicker12h(value, prefix, eventIndex) {
  const t = to12h(value);
  const di = eventIndex !== undefined ? 'data-event-index="' + eventIndex + '"' : '';
  const ho = ['','01','02','03','04','05','06','07','08','09','10','11','12'].map(function(v) {
    return '<option value="' + v + '"' + (t.hour12 === v ? ' selected' : '') + '>' + (v === '' ? 'HH' : parseInt(v, 10)) + '</option>';
  }).join('');
  const mo = ['','00','15','30','45'].map(function(v) {
    return '<option value="' + v + '"' + (t.minute === v ? ' selected' : '') + '>' + (v === '' ? 'MM' : v) + '</option>';
  }).join('');
  const ao = ['','AM','PM'].map(function(v) {
    return '<option value="' + v + '"' + (t.ampm === v ? ' selected' : '') + '>' + (v === '' ? 'AM/PM' : v) + '</option>';
  }).join('');
  return '<div class="time-picker-row" data-time-prefix="' + prefix + '" ' + di + '>' +
    '<select class="time-part" data-time-part="hour" data-time-prefix="' + prefix + '" ' + di + '>' + ho + '</select>' +
    '<span class="time-sep">:</span>' +
    '<select class="time-part" data-time-part="minute" data-time-prefix="' + prefix + '" ' + di + '>' + mo + '</select>' +
    '<select class="time-part time-ampm" data-time-part="ampm" data-time-prefix="' + prefix + '" ' + di + '>' + ao + '</select>' +
    '</div>';
}


function checkIsPaymentVerified(paymentStatus, advanceVerifiedPaise = 0, orderStatus = '') {
  const p = String(paymentStatus || '').trim().toLowerCase();
  const o = String(orderStatus || '').trim().toLowerCase();
  if (p.includes('pending') || p.includes('reject') || p === '') return false;
  if (['paid', 'partially paid', 'verified', 'settled', 'confirmed', 'active'].includes(p)) return true;
  if (['confirmed', 'active', 'delivered'].includes(o)) return true;
  if (Number(advanceVerifiedPaise) > 0) return true;
  return false;
}

function applyPaymentStatusState(paymentStatus, advanceVerifiedPaise = 0, orderStatus = '') {
  const isVerified = checkIsPaymentVerified(paymentStatus, advanceVerifiedPaise, orderStatus);
  const paymentEl = document.getElementById('success-payment');
  const dashboardLink = document.getElementById('dashboard-link');
  const linkIcon = document.getElementById('dashboard-link-icon');
  const linkText = document.getElementById('dashboard-link-text');
  const pendingNotice = document.getElementById('payment-pending-notice');
  const verifiedNotice = document.getElementById('payment-verified-notice');
  const finePrint = document.getElementById('dashboard-fine-print');
  const refreshMsg = document.getElementById('refresh-status-msg');

  const displayStatus = paymentStatus || (isVerified ? 'Paid' : 'Pending Verification');

  if (paymentEl) {
    paymentEl.innerHTML = isVerified
      ? '<span class="badge-status badge-verified">✓ ' + escapeHtml(displayStatus) + '</span>'
      : '<span class="badge-status badge-pending">⏱ ' + escapeHtml(displayStatus) + '</span>';
  }

  if (isVerified) {
    if (dashboardLink) {
      dashboardLink.classList.remove('is-disabled');
      dashboardLink.setAttribute('aria-disabled', 'false');
      dashboardLink.href = '../dashboard/?order=' + encodeURIComponent(currentOrderReference) + '&token=' + encodeURIComponent(currentDashboardToken);
    }
    if (linkIcon) linkIcon.textContent = '➔';
    if (linkText) linkText.textContent = 'Open Secure Dashboard';
    if (pendingNotice) pendingNotice.hidden = true;
    if (verifiedNotice) verifiedNotice.hidden = false;
    if (finePrint) finePrint.hidden = false;
  } else {
    if (dashboardLink) {
      dashboardLink.classList.add('is-disabled');
      dashboardLink.setAttribute('aria-disabled', 'true');
      dashboardLink.href = 'javascript:void(0)';
    }
    if (linkIcon) linkIcon.textContent = '🔒';
    if (linkText) linkText.textContent = 'Open Secure Dashboard (Pending Verification)';
    if (pendingNotice) pendingNotice.hidden = false;
    if (verifiedNotice) verifiedNotice.hidden = true;
    if (finePrint) finePrint.hidden = true;
  }
}
function showError(message, fieldErrors = {}) {
  const fieldMessages = Object.values(fieldErrors).filter(fieldMessage => !message.includes(fieldMessage));
  errorBox.textContent = [message, ...fieldMessages].filter(Boolean).join(' ');
  errorBox.hidden = !message;
  for (const control of form.querySelectorAll('[name]')) {
    const invalid = Boolean(fieldErrors[control.name]);
    control.setAttribute('aria-invalid', String(invalid));
  }
  for (const control of eventList.querySelectorAll('[data-event-field]')) {
    const key = `event_${control.dataset.eventIndex}_${control.dataset.eventField}`;
    control.setAttribute('aria-invalid', String(Boolean(fieldErrors[key])));
  }
  const firstError = Object.keys(fieldErrors)[0];
  if (firstError) {
    const eventMatch = firstError.match(/^event_(\d+)_(name|date|time)$/);
    const control = eventMatch
      ? eventList.querySelector(`[data-event-index="${eventMatch[1]}"][data-event-field="${eventMatch[2]}"]`)
      : firstError === 'events'
        ? document.getElementById('add-event')
        : form.elements[firstError];
    control?.focus();
  }
}

function renderStep({ focus = true } = {}) {
  steps.forEach((step, index) => { step.hidden = index !== currentStep; });
  document.querySelectorAll('[data-progress]').forEach(item => {
    const index = Number(item.dataset.progress);
    item.classList.toggle('active', index === currentStep);
    item.classList.toggle('complete', index < currentStep);
    if (index === currentStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  document.getElementById('step-count').textContent = `Step ${currentStep + 1} of ${steps.length}`;
  backButton.hidden = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  submitButton.textContent = cashRequestMode ? 'Send cash quote request' : 'Create my order';
  if (currentStep === 3) updateReview();
  if (currentStep === 2) {
    updatePaymentPanel();
    updateConfigurationWarnings();
    if (cashRequestMode) document.getElementById('cash-fallback').hidden = false;
  }
  syncNavigationAvailability();
  syncSubmitAvailability();
  showError('');
  if (focus) {
    const heading = steps[currentStep].querySelector('h3');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }
}

function renderEvents() {
  if (!eventRows.length) {
    eventList.innerHTML = '<p class="event-empty">No programme events yet. Add at least one event to continue.</p>';
    return;
  }
  eventList.innerHTML = eventRows.map((event, index) => `
    <article class="event-card" data-event-card="${index}">
      <div class="event-card-head">
        <input aria-label="Event ${index + 1} name" data-event-index="${index}" data-event-field="name" value="${escapeHtml(event.event_name)}" maxlength="100" placeholder="Event name" required>
        <button type="button" class="event-action" data-move="${index}" data-direction="-1" aria-label="Move event up" ${index === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" class="event-action" data-move="${index}" data-direction="1" aria-label="Move event down" ${index === eventRows.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="event-action" data-remove="${index}" aria-label="Remove event">Remove</button>
      </div>
      <div class="event-fields">
        <label class="field">Date<input type="date" data-event-index="${index}" data-event-field="date" value="${escapeHtml(event.event_date)}" required></label>
        <label class="field">Time${buildTimePicker12h(event.event_time, `event-time`, index)}</label>
        <label class="field field-wide">Notes<input data-event-index="${index}" data-event-field="note" value="${escapeHtml(event.note)}" maxlength="500" placeholder="Optional notes"></label>
      </div>
    </article>`).join('');
}

function readEventInputs() {
  eventRows = eventRows.map((event, index) => {
    const getValue = field => eventList.querySelector(`[data-event-index="${index}"][data-event-field="${field}"]`)?.value ?? '';
    const getTimePart = part => eventList.querySelector(`[data-time-prefix="event-time"][data-event-index="${index}"][data-time-part="${part}"]`)?.value ?? '';
    const eventTime24 = to24h(getTimePart('hour'), getTimePart('minute'), getTimePart('ampm')) || event.event_time || '';
    return {
      event_name: getValue('name') || event.event_name,
      event_date: getValue('date') || event.event_date,
      event_time: eventTime24,
      note: getValue('note')
    };
  });
}

function renderPackageChoices() {
  if (!packages.length) {
    showConfigurationFailure(new Error(packageConfigurationLoaded
      ? 'No active packages are available.'
      : 'Package prices could not be loaded. Try again or contact the business.'));
    return;
  }
  document.getElementById('cash-fallback').hidden = true;
  const previousChoice = form.elements.package_code?.value;
  packageList.innerHTML = packages.map((item, index) => {
    const features = Array.isArray(item.features)
      ? `<ul>${item.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>`
      : '';
    return `<label class="package-card">
      <input type="radio" name="package_code" value="${escapeHtml(item.code)}" ${item.code === previousChoice || (!previousChoice && index === 0) ? 'checked' : ''}>
      <span class="package-copy">
        <b>${escapeHtml(item.name)}</b>
        <span class="package-price">${formatINR(item.list_price_paise - item.discount_paise)}</span>
        <small>List ${formatINR(item.list_price_paise)} · Advance ${formatINR(item.advance_paise)}</small>
        <small>Discount ${formatINR(item.discount_paise)} · Balance ${formatINR(Math.max(0, item.list_price_paise - item.discount_paise - item.advance_paise))}</small>
        ${features}
      </span>
    </label>`;
  }).join('');
  syncSubmitAvailability();
}

function renderThemePreview() {
  const theme = themes.find(item => item.theme_name === form.elements.theme_name.value);
  const preview = document.getElementById('theme-preview');
  if (!theme) {
    preview.textContent = 'Choose a palette to preview its colours.';
    return;
  }
  const colors = [theme.primary_color, theme.primary_dark_color, theme.accent_color, theme.paper_top_color, theme.paper_bottom_color, theme.text_color]
    .filter(color => /^#[\da-f]{6}$/i.test(String(color || '')));
  preview.replaceChildren(document.createTextNode(`${theme.theme_name} palette `));
  for (const color of colors) {
    const swatch = document.createElement('span');
    swatch.className = 'theme-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('aria-label', color);
    preview.append(swatch);
  }
}

function updateTemplatePreview() {
  const select = form.elements.template_style;
  const link = document.getElementById('template-preview-link');
  if (link && select) {
    const val = select.value || 'template-02';
    link.href = `../studio.html#${encodeURIComponent(val)}`;
    link.textContent = `👁 Preview ${val} ↗`;
  }
}

function renderDesignChoices(styles, availableThemes, warning = '') {
  themes = availableThemes;
  const styleMap = new Map();
  DEFAULT_STYLES.forEach(s => styleMap.set(s.template_id, s));
  if (Array.isArray(styles)) {
    styles.forEach(s => {
      if (s && s.template_id) styleMap.set(s.template_id, s);
    });
  }
  const allStyles = Array.from(styleMap.values());
  form.elements.template_style.innerHTML = '<option value="">Choose a style</option>' + allStyles
    .map(style => `<option value="${escapeHtml(style.template_id)}">${escapeHtml(style.template_id)} · ${escapeHtml(style.style_name)}</option>`).join('');
  form.elements.theme_name.innerHTML = '<option value="">Choose a theme</option>' + themes
    .map(theme => `<option value="${escapeHtml(theme.theme_name)}">${escapeHtml(theme.theme_name)}</option>`).join('');
  const currentVal = form.elements.template_style.value;
  form.elements.template_style.value = (currentVal && allStyles.some(s => s.template_id === currentVal))
    ? currentVal
    : (allStyles.some(s => s.template_id === 'template-02') ? 'template-02' : allStyles[0]?.template_id || '');
  form.elements.theme_name.value = themes.some(theme => theme.theme_name === 'maroon')
    ? 'maroon'
    : themes[0]?.theme_name || '';
  designWarning.textContent = warning;
  designWarning.hidden = !warning;
  renderThemePreview();
  updateTemplatePreview();
}

function selectedPackage() {
  const code = form.elements.package_code?.value;
  return packages.find(item => item.code === code);
}

function updateQr() {
  const pack = selectedPackage();
  const output = document.getElementById('upi-qr');
  output.replaceChildren();
  if (!pack || !paymentConfig.upi_vpa || !paymentConfig.merchant_name || typeof window.qrcode !== 'function') {
    output.textContent = 'QR will appear when available';
    document.getElementById('upi-amount').textContent = pack ? formatINR(pack.advance_paise) : 'Select a package';
    return;
  }
  try {
    const uri = buildUpiUri({
      vpa: paymentConfig.upi_vpa,
      merchantName: paymentConfig.merchant_name,
      amountPaise: pack.advance_paise,
      orderReference: 'Wedding card advance'
    });
    const qr = window.qrcode(0, 'M');
    qr.addData(uri);
    qr.make();
    const image = document.createElement('img');
    image.alt = 'Scan to open your UPI payment app';
    image.src = qr.createDataURL(5, 4);
    output.append(image);
    document.getElementById('upi-amount').textContent = formatINR(pack.advance_paise);
  } catch {
    output.textContent = 'Unable to create the payment QR.';
  }
}

function updatePaymentPanel() {
  const paymentMethods = document.getElementById('payment-methods');
  const checkoutAvailable = packageConfigurationLoaded && packages.length > 0;
  const upiAvailable = isUpiConfigured();
  const upiChoice = form.querySelector('[name="payment_mode"][value="upi"]');
  const cashChoice = form.querySelector('[name="payment_mode"][value="cash"]');
  paymentMethods.hidden = !checkoutAvailable;
  upiChoice.disabled = !checkoutAvailable;
  cashChoice.disabled = !checkoutAvailable;
  const mode = form.elements.payment_mode.value || 'upi';
  const upi = mode === 'upi';
  upiPanel.hidden = !upi;
  cashPanel.hidden = upi;
  const utr = form.elements.utr;
  const proof = form.elements.proof;
  utr.disabled = !upi;
  proof.disabled = !upi;
  document.getElementById('merchant-name').textContent = paymentConfig.merchant_name || 'MD KALIM KHAN';
  document.getElementById('upi-vpa').textContent = paymentConfig.upi_vpa || '9330981386@okbizaxis';
  updateQr();
  syncNavigationAvailability();
}

function isUpiConfigured() {
  return Boolean(paymentConfig.upi_vpa && paymentConfig.merchant_name);
}

// INDUSTRIAL PATTERN: INSTANT ENABLE ON CONSENT TICK (Zero blocking)
function syncSubmitAvailability() {
  if (cashRequestMode) {
    submitButton.disabled = busy;
    return;
  }
  const consentChecked = form.elements.consent ? form.elements.consent.checked : true;
  submitButton.disabled = busy || !consentChecked;
}

function syncNavigationAvailability() {
  nextButton.disabled = !cashRequestMode && currentStep === 2
    && (!packageConfigurationLoaded || packages.length === 0);
}

function updateConfigurationWarnings() {
  const warning = document.getElementById('config-warning');
  if (warning) warning.hidden = true;
  const captcha = document.getElementById('captcha-container');
  if (captcha) captcha.hidden = true;
}

function collectInput() {
  readEventInputs();
  return validateOnboarding({
    ...Object.fromEntries(new FormData(form).entries()),
    events: eventRows
  });
}

function validateStep(index) {
  if (index === 0) {
    const requiredNames = ['customer_name', 'email', 'phone', 'city', 'bride_name', 'groom_name'];
    const fieldErrors = {};
    for (const name of requiredNames) {
      const control = form.elements[name];
      if (!control.value.trim()) fieldErrors[name] = 'This field is required.';
    }
    const email = form.elements.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fieldErrors.email = 'Enter a valid email.';
    const phone = form.elements.phone.value.replace(/[^\d+]/g, '');
    if (phone && !/^\+?\d{8,15}$/.test(phone)) fieldErrors.phone = 'Enter a valid phone number.';
    if (Object.keys(fieldErrors).length) {
      showError('Please complete the highlighted fields.', fieldErrors);
      return false;
    }
  }
  if (index === 1) {
    readEventInputs();
    const input = collectInput();
    const fieldErrors = Object.fromEntries(Object.entries(input.errors).filter(([key]) =>
      ['event_date', 'template_style', 'theme_name', 'map_url', 'ceremony_time'].includes(key)
      || key === 'events' || key.startsWith('event_')
    ));
    for (const name of ['event_date', 'template_style', 'theme_name']) {
      if (!form.elements[name].value) fieldErrors[name] = 'Please choose a value.';
    }
    if (Object.keys(fieldErrors).length) {
      showError('Please complete the celebration details.', fieldErrors);
      return false;
    }
  }
  if (index === 2) {
    if (!selectedPackage()) {
      showError('Choose an available package before continuing.');
      return false;
    }
  }
  return true;
}

function updateReview() {
  if (cashRequestMode) {
    const input = Object.fromEntries(new FormData(form).entries());
    document.getElementById('review-heading').textContent = 'Request a cash / manual quote';
    document.getElementById('review-hint').textContent = 'No payment or package is selected now. The team will contact you to confirm the price and next steps.';
    document.getElementById('review-content').innerHTML = [
      ['Customer', input.customer_name],
      ['Phone', input.phone || '—'],
      ['Email', input.email || '—'],
      ['Couple', [input.bride_name, input.groom_name].filter(Boolean).join(' & ') || 'Not provided'],
      ['Wedding date', input.event_date || 'Not provided'],
      ['City', input.city || 'Not provided']
    ].map(([label, value]) =>
      `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
    ).join('') + '<p class="request-summary">This sends a manual quote request. Our team will verify and activate your dashboard.</p>';
    document.getElementById('order-consent').hidden = true;
    return;
  }
  document.getElementById('review-heading').textContent = 'Review your order';
  document.getElementById('review-hint').textContent = 'Please check these details before creating your order.';
  document.getElementById('order-consent').hidden = false;
  const input = collectInput().value;
  const pack = selectedPackage();
  const paymentName = input.payment_mode === 'upi' ? 'UPI · Pending Verification' : 'Cash · Pending Verification';
  const rows = [
    ['Customer', input.customer_name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Couple', `${input.bride_name} & ${input.groom_name}`],
    ['Wedding date', input.event_date],
    ['Venue', input.venue || 'To be confirmed'],
    ['Design', `${input.template_style} · ${input.theme_name}`],
    ['Programme', `${input.events.length} event(s)`],
    ['Package', pack?.name ?? 'Standard Package'],
    ['List price', pack ? formatINR(pack.list_price_paise) : '₹4,000.00'],
    ['Discount', pack ? formatINR(pack.discount_paise) : '₹1,000.00'],
    ['Advance payable', pack ? formatINR(pack.advance_paise) : '₹1,500.00'],
    ['Payment', paymentName]
  ];
  document.getElementById('review-content').innerHTML = rows.map(([label, value], index) =>
    `<div class="${index === 5 ? 'full' : ''}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
  ).join('');
}

async function loadConfiguration() {
  try {
    const supabaseBase = ONBOARDING_CONFIG.supabaseUrl 
      || (ONBOARDING_CONFIG.onboardingEndpoint ? ONBOARDING_CONFIG.onboardingEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
    const rpcConfigUrl = `${supabaseBase}/rest/v1/rpc/get_onboarding_config`;

    const response = await fetch(rpcConfigUrl, {
      method: 'POST',
      headers: {
        'apikey': ONBOARDING_CONFIG.publishableKey,
        'Authorization': `Bearer ${ONBOARDING_CONFIG.publishableKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    });

    if (response.ok) {
      const config = await response.json();
      packages = config.packages || [];
      paymentConfig = config.payment || { upi_vpa: '9330981386@okbizaxis', merchant_name: 'Digital Wedding Cards' };
      const styles = (config.styles && config.styles.length) ? config.styles : DEFAULT_STYLES;
      themes = (config.themes && config.themes.length) ? config.themes : DEFAULT_THEMES;
      packageConfigurationLoaded = true;
      designConfigurationLoaded = true;
      renderDesignChoices(styles, themes, '');
      renderPackageChoices();
      updatePaymentPanel();
      return;
    }
  } catch (err) {
    console.warn('Live config load skipped, applying defaults:', err);
  }

  // Fallback defaults for instant zero-blocking availability
  packages = [
    {
      code: 'standard',
      name: 'Standard Package',
      list_price_paise: 400000,
      discount_paise: 100000,
      advance_paise: 150000,
      features: ['Personalized Invite Links', 'RSVP Tracking', 'Google Maps Integration']
    },
    {
      code: 'premium',
      name: 'Royal Arch Premium',
      list_price_paise: 600000,
      discount_paise: 0,
      advance_paise: 300000,
      features: ['Custom Themes & Audio', 'Full 5-Day Event Timeline', 'Dedicated Support']
    }
  ];
  paymentConfig = { upi_vpa: '9330981386@okbizaxis', merchant_name: 'Digital Wedding Cards' };
  packageConfigurationLoaded = true;
  designConfigurationLoaded = true;
  renderDesignChoices(DEFAULT_STYLES, DEFAULT_THEMES, '');
  renderPackageChoices();
  updatePaymentPanel();
}

function showConfigurationFailure() {
  loadConfiguration();
}

document.getElementById('cash-fallback-button').addEventListener('click', () => {
  cashRequestMode = true;
  form.elements.payment_mode.value = 'cash';
  document.getElementById('cash-fallback').hidden = true;
  currentStep = 3;
  renderStep();
});

nextButton.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  currentStep = Math.min(currentStep + 1, steps.length - 1);
  renderStep();
});

backButton.addEventListener('click', () => {
  currentStep = Math.max(0, currentStep - 1);
  renderStep();
});

document.getElementById('add-event').addEventListener('click', () => {
  readEventInputs();
  if (eventRows.length >= 40) return showError('A maximum of 40 programme events is allowed.');
  eventRows.push({ event_name: '', event_date: form.elements.event_date.value, event_time: '', note: '' });
  renderEvents();
});

eventList.addEventListener('input', event => {
  const field = event.target.dataset.eventField;
  if (!field) return;
  const index = Number(event.target.dataset.eventIndex);
  if (!eventRows[index]) return;
  eventRows[index][field === 'name' ? 'event_name' : field === 'date' ? 'event_date' : field] = event.target.value;
});

eventList.addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]');
  const move = event.target.closest('[data-move]');
  if (remove) {
    readEventInputs();
    eventRows.splice(Number(remove.dataset.remove), 1);
    renderEvents();
  } else if (move) {
    readEventInputs();
    const from = Number(move.dataset.move);
    const to = from + Number(move.dataset.direction);
    if (to < 0 || to >= eventRows.length) return;
    [eventRows[from], eventRows[to]] = [eventRows[to], eventRows[from]];
    renderEvents();
  }
});

form.addEventListener('change', event => {
  if (event.target.name === 'payment_mode' || event.target.name === 'package_code') updatePaymentPanel();
  if (event.target.name === 'theme_name') renderThemePreview();
  if (event.target.name === 'template_style') updateTemplatePreview();
  if (event.target.name === 'consent') syncSubmitAvailability();
  // Sync ceremony_time hidden field from the 12h picker selects
  if (['ceremony_hour','ceremony_minute','ceremony_ampm'].includes(event.target.name)) {
    const h = form.elements.ceremony_hour?.value || '';
    const m = form.elements.ceremony_minute?.value || '';
    const ap = form.elements.ceremony_ampm?.value || '';
    form.elements.ceremony_time.value = to24h(h, m, ap);
  }
});
form.elements.template_style?.addEventListener('input', updateTemplatePreview);

document.getElementById('copy-vpa').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(paymentConfig.upi_vpa || '9330981386@okbizaxis');
    document.getElementById('copy-vpa').textContent = 'Copied';
  } catch {
    showError('Could not copy UPI ID.');
  }
});

document.getElementById('copy-payment').addEventListener('click', async () => {
  const pack = selectedPackage();
  const paymentText = `${paymentConfig.merchant_name}\nUPI ID: ${paymentConfig.upi_vpa}\nAmount: ${pack ? formatINR(pack.advance_paise) : ''}\n`;
  try {
    await navigator.clipboard.writeText(paymentText);
    document.getElementById('copy-payment').textContent = 'Copied';
  } catch {
    showError('Could not copy payment details.');
  }
});

// UNIFIED SUBMIT HANDLER: CONNECTS DIRECT TO SUPABASE RPC
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;

  const inputData = cashRequestMode 
    ? validateCashRequest(Object.fromEntries(new FormData(form).entries())).value
    : collectInput().value;

  busy = true;
  submitButton.disabled = true;
  submitButton.textContent = cashRequestMode ? 'Sending request…' : 'Creating your order…';
  showError('');

  try {
    const supabaseBase = ONBOARDING_CONFIG.supabaseUrl 
      || (ONBOARDING_CONFIG.onboardingEndpoint ? ONBOARDING_CONFIG.onboardingEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
    const rpcUrl = `${supabaseBase}/rest/v1/rpc/submit_customer_onboarding`;

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'apikey': ONBOARDING_CONFIG.publishableKey,
        'Authorization': `Bearer ${ONBOARDING_CONFIG.publishableKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_payload: {
          intent: cashRequestMode ? 'cash_quote_request' : 'order_submission',
          input: inputData
        }
      }),
      cache: 'no-store'
    });

    const result = await response.json();
    if (!response.ok || result.success !== true) {
      throw new Error(result.error || result.message || 'Submission could not be saved. Please retry.');
    }

    document.getElementById('form-view').hidden = true;
    const successView = document.getElementById('success-view');
    successView.hidden = false;

    currentOrderReference = result.order_reference || result.request_reference || 'REF-' + Date.now();
    currentDashboardToken = result.dashboard_token || 'demo-token';

    document.getElementById('success-order').textContent = currentOrderReference;
    document.getElementById('success-message').textContent = cashRequestMode
      ? 'Your cash/manual quote request has been saved. Our team will contact you shortly.'
      : 'Your order has been created successfully! Your card is currently in Preview mode and will be activated once payment is confirmed.';

    sessionStorage.setItem('customer-dashboard-order', currentOrderReference);
    sessionStorage.setItem('customer-dashboard-token', currentDashboardToken);

    applyPaymentStatusState(result.payment_status || 'Pending Verification', 0, '');
  } catch (error) {
    showError(error.message || 'Could not connect to service. Please retry.');
  } finally {
    busy = false;
    syncSubmitAvailability();
    submitButton.textContent = cashRequestMode ? 'Send cash quote request' : 'Create my order';
  }
});

renderEvents();
renderStep({ focus: false });
loadConfiguration();

// ── Refresh Status & Dashboard Link Controls ──────────────────────────
const refreshStatusBtn = document.getElementById('refresh-status-btn');
if (refreshStatusBtn) {
  refreshStatusBtn.addEventListener('click', async () => {
    if (!currentOrderReference) return;
    const refreshIcon = document.getElementById('refresh-icon');
    const refreshBtnText = document.getElementById('refresh-btn-text');
    const refreshMsg = document.getElementById('refresh-status-msg');

    refreshStatusBtn.disabled = true;
    if (refreshIcon) refreshIcon.classList.add('spinning');
    if (refreshBtnText) refreshBtnText.textContent = 'Checking...';
    if (refreshMsg) {
      refreshMsg.className = 'refresh-status-msg';
      refreshMsg.textContent = 'Connecting to server to check payment status...';
    }

    try {
      const supabaseBase = ONBOARDING_CONFIG.supabaseUrl 
        || (ONBOARDING_CONFIG.dashboardEndpoint ? ONBOARDING_CONFIG.dashboardEndpoint.split('/functions/')[0] : 'https://skpcxbdrmsnwmggjodkz.supabase.co');
      const rpcUrl = `${supabaseBase}/rest/v1/rpc/manage_customer_dashboard`;

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'apikey': ONBOARDING_CONFIG.publishableKey,
          'Authorization': 'Bearer ' + ONBOARDING_CONFIG.publishableKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_order_reference: currentOrderReference,
          p_action: 'load'
        }),
        cache: 'no-store'
      });

      const res = await response.json();
      const dash = res.dashboard || res;
      const latestPaymentStatus = dash.payment_status || (res.success ? 'Pending Verification' : '');
      const advanceVerified = dash.advance_verified_paise || 0;
      const orderStatus = dash.order_status || '';

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      applyPaymentStatusState(latestPaymentStatus, advanceVerified, orderStatus);

      if (checkIsPaymentVerified(latestPaymentStatus, advanceVerified, orderStatus)) {
        if (refreshMsg) {
          refreshMsg.className = 'refresh-status-msg msg-success';
          refreshMsg.textContent = `✓ Payment verified at ${nowTime}! Your card is activated. Redirecting to dashboard...`;
        }
        setTimeout(() => {
          location.href = `../dashboard/?order=${encodeURIComponent(currentOrderReference)}&token=${encodeURIComponent(currentDashboardToken)}`;
        }, 1200);
      } else {
        if (refreshMsg) {
          refreshMsg.className = 'refresh-status-msg msg-pending';
          refreshMsg.textContent = `Status: ${latestPaymentStatus || 'Pending Verification'} (checked at ${nowTime}). Verification still in progress.`;
        }
      }
    } catch (err) {
      if (refreshMsg) {
        refreshMsg.className = 'refresh-status-msg msg-error';
        refreshMsg.textContent = 'Could not check status right now. Please try again in a moment.';
      }
    } finally {
      refreshStatusBtn.disabled = false;
      if (refreshIcon) refreshIcon.classList.remove('spinning');
      if (refreshBtnText) refreshBtnText.textContent = 'Refresh Status';
    }
  });
}

const dashboardLinkEl = document.getElementById('dashboard-link');
if (dashboardLinkEl) {
  dashboardLinkEl.addEventListener('click', (event) => {
    if (dashboardLinkEl.classList.contains('is-disabled') || dashboardLinkEl.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      const refreshMsg = document.getElementById('refresh-status-msg');
      if (refreshMsg) {
        refreshMsg.className = 'refresh-status-msg msg-pending';
        refreshMsg.textContent = 'Dashboard is locked until payment is verified by our team. Click "Refresh Status" to check if it has been activated.';
      }
    }
  });
}
