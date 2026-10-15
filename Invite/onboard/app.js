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
let eventRows = DEFAULT_EVENTS.map(event => ({ ...event, event_date: '', note: '' }));
let packages = [];
let paymentConfig = { upi_vpa: '', merchant_name: '' };
let themes = [];
let captchaWidget;
let turnstileLoadAttempts = 0;
let packageConfigurationLoaded = false;
let designConfigurationLoaded = false;
let cashRequestMode = false;
let busy = false;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

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
  for (const [key, messageText] of Object.entries(fieldErrors)) {
    console.info('Onboarding field validation:', key, messageText);
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
        <label class="field">Time<input type="time" data-event-index="${index}" data-event-field="time" value="${escapeHtml(event.event_time)}"></label>
        <label class="field field-wide">Notes<input data-event-index="${index}" data-event-field="note" value="${escapeHtml(event.note)}" maxlength="500" placeholder="Optional notes"></label>
      </div>
    </article>`).join('');
}

function readEventInputs() {
  eventRows = eventRows.map((event, index) => {
    const value = field => eventList.querySelector(`[data-event-index="${index}"][data-event-field="${field}"]`)?.value ?? event[field === 'name' ? 'event_name' : field === 'date' ? 'event_date' : field];
    return {
      event_name: value('name'),
      event_date: value('date'),
      event_time: value('time'),
      note: value('note')
    };
  });
}

function renderPackageChoices() {
  if (!packages.length) {
    showConfigurationFailure(new Error(packageConfigurationLoaded
      ? 'No active packages are available. Ask the business to activate and price a package, then retry.'
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
        <small>Discount ${formatINR(item.discount_paise)} · Balance ${formatINR(item.list_price_paise - item.discount_paise - item.advance_paise)}</small>
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

function renderDesignChoices(styles, availableThemes, warning = '') {
  themes = availableThemes;
  form.elements.template_style.innerHTML = '<option value="">Choose a style</option>' + styles
    .map(style => `<option value="${escapeHtml(style.template_id)}">${escapeHtml(style.template_id)} · ${escapeHtml(style.style_name)}</option>`).join('');
  form.elements.theme_name.innerHTML = '<option value="">Choose a theme</option>' + themes
    .map(theme => `<option value="${escapeHtml(theme.theme_name)}">${escapeHtml(theme.theme_name)}</option>`).join('');
  form.elements.template_style.value = styles.some(style => style.template_id === 'template-02')
    ? 'template-02'
    : styles[0]?.template_id || '';
  form.elements.theme_name.value = themes.some(theme => theme.theme_name === 'maroon')
    ? 'maroon'
    : themes[0]?.theme_name || '';
  designWarning.textContent = warning;
  designWarning.hidden = !warning;
  renderThemePreview();
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
  upiChoice.disabled = !checkoutAvailable || !upiAvailable;
  cashChoice.disabled = !checkoutAvailable;
  upiChoice.closest('.payment-choice').querySelector('small').textContent = upiAvailable
    ? 'Payment awaits independent verification'
    : 'Currently unavailable; choose cash settlement';
  const paymentWarning = document.getElementById('payment-config-warning');
  paymentWarning.textContent = upiAvailable
    ? ''
    : 'UPI payments are unavailable because merchant payment details are not configured. Cash settlement may still be selected.';
  paymentWarning.hidden = !checkoutAvailable || upiAvailable;
  if (!checkoutAvailable) {
    upiChoice.checked = false;
    cashChoice.checked = false;
    upiPanel.hidden = true;
    cashPanel.hidden = true;
    form.elements.utr.disabled = true;
    form.elements.proof.disabled = true;
    updateQr();
    syncNavigationAvailability();
    updateConfigurationWarnings();
    return;
  }
  if (!upiAvailable && upiChoice.checked) cashChoice.checked = true;
  const mode = form.elements.payment_mode.value;
  const upi = mode === 'upi';
  upiPanel.hidden = !upi;
  cashPanel.hidden = upi;
  const utr = form.elements.utr;
  const proof = form.elements.proof;
  utr.disabled = !upi;
  proof.disabled = !upi;
  document.getElementById('merchant-name').textContent = paymentConfig.merchant_name || 'not configured';
  document.getElementById('upi-vpa').textContent = paymentConfig.upi_vpa || 'not configured';
  updateQr();
  syncNavigationAvailability();
}

function isUpiConfigured() {
  return /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(paymentConfig.upi_vpa)
    && Boolean(paymentConfig.merchant_name?.trim());
}

function syncSubmitAvailability() {
  if (cashRequestMode) {
    submitButton.disabled = busy;
    return;
  }
  const siteKey = ONBOARDING_CONFIG.turnstileSiteKey;
  const captchaReady = captchaWidget !== undefined
    && Boolean(window.turnstile?.getResponse(captchaWidget));
  submitButton.disabled = busy || !packageConfigurationLoaded || packages.length === 0
    || !captchaReady || !siteKey || siteKey.startsWith('SET_');
}

function syncNavigationAvailability() {
  nextButton.disabled = !cashRequestMode && currentStep === 2
    && (!packageConfigurationLoaded || packages.length === 0);
}

function updateConfigurationWarnings() {
  const warning = document.getElementById('config-warning');
  const checkoutAvailable = packageConfigurationLoaded && packages.length > 0;
  warning.hidden = !checkoutAvailable || !warning.textContent;
  document.getElementById('captcha-container').hidden = !checkoutAvailable;
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
    const whatsapp = form.elements.whatsapp_phone.value.replace(/[^\d+]/g, '');
    if (whatsapp && !/^\+?\d{8,15}$/.test(whatsapp)) fieldErrors.whatsapp_phone = 'Enter a valid WhatsApp number.';
    if (Object.keys(fieldErrors).length) {
      showError('Please complete the highlighted fields.', fieldErrors);
      return false;
    }
  }
  if (index === 1) {
    if (packageConfigurationLoaded && !designConfigurationLoaded) {
      showError('Design choices are shown as a preview, but the live style and theme catalogue is unavailable. The business must configure these choices before an order can be created.');
      return false;
    }
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
      const labels = {
        event_date: 'Wedding date',
        template_style: 'Invitation style',
        theme_name: 'Colour theme',
        map_url: 'Google Maps URL',
        ceremony_time: 'Ceremony time',
        events: 'Programme timeline'
      };
      const details = Object.entries(fieldErrors).map(([key, message]) => {
        const eventMatch = key.match(/^event_(\d+)_(name|date|time)$/);
        const label = eventMatch
          ? `Programme event ${Number(eventMatch[1]) + 1} ${eventMatch[2]}`
          : labels[key] || key;
        return `${label}: ${message}`;
      });
      showError(details.join(' '), fieldErrors);
      return false;
    }
  }
  if (index === 2) {
    if (!packageConfigurationLoaded) {
      return false;
    }
    if (!packages.length) {
      return false;
    }
    const fieldErrors = Object.fromEntries(Object.entries(collectInput().errors).filter(([key]) =>
      ['payment_mode', 'utr'].includes(key)
    ));
    if (Object.keys(fieldErrors).length) {
      showError('Please correct the payment choice before continuing.', fieldErrors);
      return false;
    }
    if (!selectedPackage()) {
      showError('Choose an available package before continuing.');
      return false;
    }
    if (!form.elements.payment_mode.value) {
      showError('Choose a payment method.');
      return false;
    }
    if (form.elements.payment_mode.value === 'upi' && !isUpiConfigured()) {
      showError('UPI is unavailable until valid merchant payment details are configured. Choose cash settlement or contact support.');
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
    ).join('') + '<p class="request-summary">This sends a manual quote request only. It does not confirm an order, create a wedding dashboard, reserve a package, or record a payment.</p>';
    document.getElementById('order-consent').hidden = true;
    document.getElementById('review-privacy').textContent = 'Your contact details will be shared with the business team so they can respond to your request.';
    return;
  }
  document.getElementById('review-heading').textContent = 'Review your order';
  document.getElementById('review-hint').textContent = 'Please check these details before creating your secure order.';
  document.getElementById('order-consent').hidden = false;
  document.getElementById('review-privacy').textContent = 'Your order reference identifies the order only. Private dashboard access is sent separately through the email address you provided.';
  const input = collectInput().value;
  const pack = selectedPackage();
  const paymentName = input.payment_mode === 'upi' ? 'UPI · Pending Verification' : 'Cash · Pending Cash Verification';
  const rows = [
    ['Customer', input.customer_name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Couple', `${input.bride_name} & ${input.groom_name}`],
    ['Wedding date', input.event_date],
    ['Venue', input.venue || 'To be confirmed'],
    ['Design', `${input.template_style} · ${input.theme_name}`],
    ['Programme', `${input.events.length} event(s)`],
    ['Package', pack?.name ?? 'Not selected'],
    ['List price', pack ? formatINR(pack.list_price_paise) : '—'],
    ['Discount', pack ? formatINR(pack.discount_paise) : '—'],
    ['Advance payable', pack ? formatINR(pack.advance_paise) : '—'],
    ['Payment', paymentName]
  ];
  document.getElementById('review-content').innerHTML = rows.map(([label, value], index) =>
    `<div class="${index === 5 ? 'full' : ''}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
  ).join('');
}

function renderTurnstile() {
  const configWarning = document.getElementById('config-warning');
  const siteKey = ONBOARDING_CONFIG.turnstileSiteKey;
  if (!siteKey || siteKey.startsWith('SET_')) {
    configWarning.textContent = 'Order submission is disabled until a Cloudflare Turnstile site key is set in onboarding-config.js and its matching secret is set for the onboarding Edge Function.';
    configWarning.hidden = !packageConfigurationLoaded || !packages.length;
    syncSubmitAvailability();
    return;
  }
  if (!window.turnstile) {
    turnstileLoadAttempts += 1;
    if (turnstileLoadAttempts > 120) {
      configWarning.textContent = 'Security verification could not load. Check your connection and refresh before submitting.';
      configWarning.hidden = !packageConfigurationLoaded || !packages.length;
      syncSubmitAvailability();
      return;
    }
    setTimeout(renderTurnstile, 250);
    return;
  }
  try {
    captchaWidget = window.turnstile.render('#captcha-container', {
      sitekey: siteKey,
      theme: 'light',
      callback: syncSubmitAvailability,
      'expired-callback': syncSubmitAvailability,
      'error-callback': () => {
        showError('Security verification could not load. Please refresh and try again.');
        configWarning.hidden = !packageConfigurationLoaded || !packages.length;
        syncSubmitAvailability();
      }
    });
  } catch (error) {
    console.error('Turnstile widget could not be initialized.', error);
    configWarning.textContent = 'Security verification could not be initialized. Confirm the configured site key is valid for this website, then refresh.';
    configWarning.hidden = !packageConfigurationLoaded || !packages.length;
  }
  syncSubmitAvailability();
}

async function loadConfiguration() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(ONBOARDING_CONFIG.onboardingEndpoint, {
      headers: { apikey: ONBOARDING_CONFIG.publishableKey },
      cache: 'no-store',
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The onboarding service did not respond within 15 seconds. Check your connection and try again.');
    }
    throw new Error('The onboarding service could not be reached. Check that its Edge Function is deployed and this website origin is allowed.');
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw new Error(`Package choices could not be loaded (service returned ${response.status}). Check the onboarding service configuration or try again.`);
  }
  let config;
  try {
    config = await response.json();
  } catch {
    throw new Error('The onboarding service returned an unreadable configuration response. Please try again or contact support.');
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('The onboarding service returned an invalid configuration response.');
  }
  const receivedPackages = Array.isArray(config.packages) ? config.packages : [];
  packages = receivedPackages.filter(item => item && typeof item.code === 'string'
    && item.code.trim() && typeof item.name === 'string' && item.name.trim()
    && ['list_price_paise', 'discount_paise', 'advance_paise'].every(key =>
      Number.isSafeInteger(item[key]) && item[key] >= 0)
    && item.discount_paise <= item.list_price_paise
    && item.advance_paise <= item.list_price_paise - item.discount_paise
    && (item.features === undefined || Array.isArray(item.features)));
  if (packages.length !== receivedPackages.length) {
    throw new Error('The onboarding service returned incomplete or invalid package pricing. Please contact support.');
  }
  packageConfigurationLoaded = true;
  paymentConfig = config.payment && typeof config.payment === 'object'
    ? {
        upi_vpa: String(config.payment.upi_vpa || ''),
        merchant_name: String(config.payment.merchant_name || '')
      }
    : { upi_vpa: '', merchant_name: '' };
  const receivedStyles = Array.isArray(config.styles) ? config.styles : [];
  const styles = receivedStyles.filter(style => style && AVAILABLE_TEMPLATES.includes(style.template_id)
    && typeof style.style_name === 'string' && style.style_name.trim());
  const receivedThemes = Array.isArray(config.themes) ? config.themes : [];
  themes = receivedThemes.filter(theme => theme && typeof theme.theme_name === 'string'
    && theme.theme_name.trim()
    && ['primary_color', 'primary_dark_color', 'accent_color', 'paper_top_color', 'paper_bottom_color', 'text_color']
      .every(key => /^#[\da-f]{6}$/i.test(String(theme[key] || ''))));
  designConfigurationLoaded = styles.length > 0 && themes.length > 0;
  let designWarningText = '';
  if (!styles.length || !themes.length) {
    if (!styles.length) styles.push(...DEFAULT_STYLES);
    if (!themes.length) themes = [...DEFAULT_THEMES];
    designWarningText = 'Built-in design choices are shown for preview, but the live catalogue is empty or invalid. Seed valid styles and themes in Supabase before accepting orders.';
  }
  renderDesignChoices(styles, themes, designWarningText);
  renderPackageChoices();
  updatePaymentPanel();
  updateConfigurationWarnings();
}

function showConfigurationFailure(error) {
  packageConfigurationLoaded = false;
  packages = [];
  document.getElementById('cash-fallback').hidden = false;
  packageList.innerHTML = `<p class="inline-error">${escapeHtml(error.message || 'Package choices could not be loaded.')}</p><button type="button" id="retry-config" class="button button-outline button-small package-retry">Try loading packages again</button>`;
  document.getElementById('retry-config').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Retrying…';
    try {
      await loadConfiguration();
      if (packages.length) {
        showError('');
      }
    } catch (retryError) {
      console.error('Onboarding configuration retry failed.', retryError);
      showConfigurationFailure(retryError);
    }
  });
  updatePaymentPanel();
  syncNavigationAvailability();
  updateConfigurationWarnings();
  syncSubmitAvailability();
}

document.getElementById('cash-fallback-button').addEventListener('click', () => {
  cashRequestMode = true;
  form.elements.payment_mode.value = 'cash';
  document.getElementById('cash-fallback').hidden = true;
  currentStep = 3;
  renderStep();
  syncSubmitAvailability();
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
});

document.getElementById('copy-vpa').addEventListener('click', async () => {
  if (!paymentConfig.upi_vpa) return showError('Merchant UPI ID is not configured.');
  try {
    await navigator.clipboard.writeText(paymentConfig.upi_vpa);
    document.getElementById('copy-vpa').textContent = 'Copied';
  } catch {
    showError('Could not copy the UPI ID. Select and copy it from the payment details.');
  }
});

document.getElementById('copy-payment').addEventListener('click', async () => {
  const pack = selectedPackage();
  if (!pack || !paymentConfig.upi_vpa) return showError('Select a package and configure merchant UPI details first.');
  const paymentText = `${paymentConfig.merchant_name}\nUPI ID: ${paymentConfig.upi_vpa}\nAmount: ${formatINR(pack.advance_paise)}\n`;
  try {
    await navigator.clipboard.writeText(paymentText);
    document.getElementById('copy-payment').textContent = 'Copied';
  } catch {
    showError('Could not copy the payment details. Select them manually from the payment panel.');
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  if (cashRequestMode) {
    const validation = validateCashRequest(Object.fromEntries(new FormData(form).entries()));
    if (!validation.valid) {
      currentStep = 0;
      renderStep();
      showError('Please provide a name and at least one way for the team to contact you.', validation.errors);
      return;
    }
    busy = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending request…';
    showError('');
    const requestKey = sessionStorage.getItem('cash-quote-idempotency-key') || crypto.randomUUID();
    sessionStorage.setItem('cash-quote-idempotency-key', requestKey);
    try {
      const response = await fetch(ONBOARDING_CONFIG.onboardingEndpoint, {
        method: 'POST',
        headers: {
          apikey: ONBOARDING_CONFIG.publishableKey,
          'Content-Type': 'application/json',
          'idempotency-key': requestKey
        },
        body: JSON.stringify({ intent: 'cash_quote_request', input: validation.value }),
        cache: 'no-store'
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The service returned an unreadable response. Your request may not have been saved; retry using the same page.');
      }
      if (!response.ok || result.success !== true) {
        if (response.status === 404) {
          throw new Error('The onboarding function was not found in the configured Supabase project. Ask the project administrator to deploy the “onboarding” Edge Function to that project, then retry this request.');
        }
        throw new Error(result.error || 'Cash quote request could not be saved. Please retry or contact the business.');
      }
      document.getElementById('form-view').hidden = true;
      document.getElementById('success-view').hidden = false;
      document.getElementById('success-eyebrow').textContent = 'Request received';
      document.getElementById('success-heading').textContent = 'We’ll be in touch.';
      document.getElementById('success-order').textContent = result.request_reference;
      document.querySelector('#success-view .success-details dt').textContent = 'Request reference';
      document.querySelectorAll('#success-view .success-details dt')[1].textContent = 'Request status';
      document.getElementById('success-payment').textContent = result.status || 'New';
      document.getElementById('success-message').textContent = 'Your cash/manual quote request was saved. The team will contact you to confirm the package, price and next steps. This is not yet a confirmed order, and no wedding dashboard has been created.';
      const dashboardLink = document.getElementById('dashboard-link');
      dashboardLink.hidden = true;
      dashboardLink.removeAttribute('href');
      document.querySelector('#success-view .fine-print').textContent = 'Keep your request reference for follow-up. A dashboard will be created only after the team confirms your package and order.';
      sessionStorage.removeItem('cash-quote-idempotency-key');
    } catch (error) {
      const networkFailure = error instanceof TypeError
        || (error instanceof Error && /failed to fetch|networkerror/i.test(error.message));
      showError(networkFailure
        ? `Could not connect to the onboarding service. Check your internet connection and confirm the onboarding Edge Function is deployed. If you manage this site, add this exact origin to the Edge Function APP_ALLOWED_ORIGINS setting: ${location.origin}. Your request key is kept, so retrying this form is safe.`
        : error.message || 'Cash quote request could not be sent. Please try again.');
    } finally {
      busy = false;
      syncSubmitAvailability();
      submitButton.textContent = 'Send cash quote request';
    }
    return;
  }
  if (!validateStep(3)) return;
  const validation = collectInput();
  if (!validation.valid) {
    const firstError = Object.keys(validation.errors)[0];
    const weddingFields = [
      'event_date', 'ceremony_title', 'ceremony_time', 'venue_title', 'venue',
      'address', 'map_url', 'template_style', 'theme_name'
    ];
    const targetStep = firstError.startsWith('event_') || weddingFields.includes(firstError)
      ? 1
      : ['package_code', 'payment_mode', 'utr'].includes(firstError) ? 2 : 0;
    currentStep = targetStep;
    renderStep();
    showError('Please correct the highlighted information before submitting.', validation.errors);
    return;
  }
  if (!packageConfigurationLoaded || !packages.length) {
    return showError('Order submission is unavailable until package configuration loads. Use “Try loading packages again” on the package step.');
  }
  const proof = form.elements.proof.files?.[0];
  if (validation.value.payment_mode === 'upi' && proof
      && (!['image/jpeg', 'image/png', 'image/webp'].includes(proof.type) || proof.size > 3 * 1024 * 1024)) {
    currentStep = 2;
    renderStep();
    showError('Payment proof must be a JPG, PNG or WebP image no larger than 3 MB.');
    form.elements.proof.focus();
    return;
  }
  if (!form.elements.consent.checked) return showError('Please confirm the order information before submitting.');
  const captchaToken = captchaWidget === undefined ? '' : window.turnstile?.getResponse(captchaWidget) ?? '';
  if (!captchaToken) return showError('Complete the security check before submitting.');

  busy = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Creating your order…';
  showError('');
  const requestKey = sessionStorage.getItem('onboarding-idempotency-key') || crypto.randomUUID();
  sessionStorage.setItem('onboarding-idempotency-key', requestKey);
  const body = new FormData();
  body.set('input', JSON.stringify(validation.value));
  if (validation.value.payment_mode === 'upi' && proof) body.set('proof', proof);

  try {
    const response = await fetch(ONBOARDING_CONFIG.onboardingEndpoint, {
      method: 'POST',
      headers: {
        apikey: ONBOARDING_CONFIG.publishableKey,
        'idempotency-key': requestKey,
        'cf-turnstile-response': captchaToken
      },
      body
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) {
      if (result.field_errors) {
        const firstError = Object.keys(result.field_errors)[0] || '';
        const weddingFields = [
          'event_date', 'ceremony_title', 'ceremony_time', 'venue_title', 'venue',
          'address', 'map_url', 'template_style', 'theme_name'
        ];
        currentStep = firstError === 'events' || firstError.startsWith('event_') || weddingFields.includes(firstError)
          ? 1
          : ['package_code', 'payment_mode', 'utr'].includes(firstError) ? 2 : 0;
        renderStep();
        showError(result.error || 'Please correct the highlighted information.', result.field_errors);
      }
      else showError(result.error || 'Your order could not be submitted. Try again with the same form.');
      window.turnstile?.reset(captchaWidget);
      return;
    }
    document.getElementById('form-view').hidden = true;
    const successView = document.getElementById('success-view');
    successView.hidden = false;
    document.getElementById('success-order').textContent = result.order_reference;
    document.getElementById('success-payment').textContent = result.payment_status;
    const message = result.notification_status === 'sent'
      ? 'Your order is provisioned. Our email provider accepted the confirmation email; delivery may take a few minutes. Any UPI payment remains pending verification until our team confirms receipt.'
      : 'Your order is provisioned. Confirmation email is queued; you do not need to submit again. Payment remains unverified until our team confirms receipt.';
    const proofWarning = proof && result.payment_proof_status !== 'uploaded'
      ? ' The order was created, but your payment image could not be attached. Please contact support and quote your order reference.'
      : '';
    document.getElementById('success-message').textContent = `${message}${proofWarning}`;
    const dashboardLink = document.getElementById('dashboard-link');
    dashboardLink.href = `../dashboard/?order=${encodeURIComponent(result.order_reference)}`;
    if (result.dashboard_token) {
      sessionStorage.setItem('customer-dashboard-token', result.dashboard_token);
      sessionStorage.setItem('customer-dashboard-order', result.order_reference);
    } else {
      dashboardLink.textContent = 'Open the secure link sent by email';
      dashboardLink.removeAttribute('href');
      dashboardLink.setAttribute('aria-disabled', 'true');
    }
    sessionStorage.removeItem('onboarding-idempotency-key');
  } catch {
    showError('We could not confirm the response. Do not create a new order; retry with this same form or check your email for the order link.');
    window.turnstile?.reset(captchaWidget);
  } finally {
    busy = false;
    syncSubmitAvailability();
    submitButton.textContent = cashRequestMode ? 'Send cash quote request' : 'Create my order';
  }
});

renderEvents();
renderStep({ focus: false });
renderDesignChoices(
  [...DEFAULT_STYLES],
  [...DEFAULT_THEMES],
  'Loading the live design catalogue. These choices are previews until the service confirms which designs can be ordered.'
);
loadConfiguration().catch(error => {
  console.error('Onboarding configuration could not be loaded.', error);
  renderDesignChoices(
    [...DEFAULT_STYLES],
    [...DEFAULT_THEMES],
    'Design choices are shown for preview, but the onboarding service could not be reached. Check Edge Function deployment and APP_ALLOWED_ORIGINS/CORS configuration.'
  );
  updatePaymentPanel();
  showConfigurationFailure(error);
});
renderTurnstile();
