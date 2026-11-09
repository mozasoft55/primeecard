export const STANDARDIZED_EVENTS = Object.freeze([
  { name: 'Gaye Holud', tradition: 'Bengali Hindu', image: 'template-06-gaye-holud.jpg', time: '10:00' },
  { name: 'Aashirbad', tradition: 'Bengali Hindu', image: 'template-06-ashirbad.jpg', time: '12:00' },
  { name: 'Biye / Shubho Bibaho', tradition: 'Bengali Hindu', image: 'template-06-shubho-bibaho.jpg', time: '19:30' },
  { name: 'Bou Bhaat', tradition: 'Bengali Hindu', image: 'template-06-boubhat.jpg', time: '19:00' },
  { name: 'Haldi', tradition: 'Hindu / North Indian', image: 'template-06-haldi.jpg', time: '10:00' },
  { name: 'Mehdi', tradition: 'Hindu / Muslim', image: 'template-06-mehendi.jpg', time: '17:00' },
  { name: 'Sangeet', tradition: 'Hindu / North Indian', image: 'template-06-sangeet.jpg', time: '19:00' },
  { name: 'Milaad Sharif', tradition: 'Muslim', image: 'template-06-milad-sharif.jpg', time: '18:00' },
  { name: 'Nikah', tradition: 'Muslim', image: 'template-06-milad-sharif.jpg', time: '20:00' },
  { name: 'Walima', tradition: 'Muslim', image: 'template-06-reception.jpg', time: '19:30' },
  { name: 'Barat', tradition: 'Hindu / Muslim', image: 'template-06-baraat.jpg', time: '18:30' },
  { name: 'Phere / Varmala', tradition: 'Hindu', image: 'template-06-phere.jpg', time: '20:30' },
  { name: 'Reception', tradition: 'Universal', image: 'template-06-reception.jpg', time: '19:30' },
  { name: 'Ring Ceremony / Engagement', tradition: 'Universal', image: 'template-06-jaimala.jpg', time: '18:00' },
  { name: 'Cocktail Evening', tradition: 'Modern', image: 'template-06-sangeet.jpg', time: '20:00' },
  { name: 'Anand Karaj', tradition: 'Sikh', image: 'template-06-jaimala.jpg', time: '10:30' }
]);

export function getEventImage(eventName) {
  if (!eventName) return 'template-06-phere.jpg';
  const cleanName = String(eventName).trim().toLowerCase();
  const match = STANDARDIZED_EVENTS.find(e => e.name.toLowerCase() === cleanName);
  if (match) return match.image;
  if (/gaye|holud/i.test(cleanName)) return 'template-06-gaye-holud.jpg';
  if (/ashirbad|aashirbad/i.test(cleanName)) return 'template-06-ashirbad.jpg';
  if (/biye|bibaho|vivah|wedding|shaadi/i.test(cleanName)) return 'template-06-shubho-bibaho.jpg';
  if (/bou\s*bhaat|boubhat/i.test(cleanName)) return 'template-06-boubhat.jpg';
  if (/haldi|ubtan|pithi/i.test(cleanName)) return 'template-06-haldi.jpg';
  if (/mehdi|mehendi|henna/i.test(cleanName)) return 'template-06-mehendi.jpg';
  if (/sangeet|garba|dandiya/i.test(cleanName)) return 'template-06-sangeet.jpg';
  if (/milaad|milad|nikah/i.test(cleanName)) return 'template-06-milad-sharif.jpg';
  if (/walima/i.test(cleanName)) return 'template-06-reception.jpg';
  if (/barat|baraat/i.test(cleanName)) return 'template-06-baraat.jpg';
  if (/phere|saat\s*paak|sindoor/i.test(cleanName)) return 'template-06-phere.jpg';
  if (/reception|preeti\s*bhoj|dinner/i.test(cleanName)) return 'template-06-reception.jpg';
  if (/ring|engagement|sagai/i.test(cleanName)) return 'template-06-jaimala.jpg';
  return 'template-06-phere.jpg';
}

export const DEFAULT_EVENTS = Object.freeze([
  { event_name: 'Haldi', event_time: '10:00', image: 'template-06-haldi.jpg' },
  { event_name: 'Mehdi', event_time: '17:00', image: 'template-06-mehendi.jpg' },
  { event_name: 'Biye / Shubho Bibaho', event_time: '19:30', image: 'template-06-shubho-bibaho.jpg' },
  { event_name: 'Reception', event_time: '19:30', image: 'template-06-reception.jpg' }
]);

export const AVAILABLE_TEMPLATES = Object.freeze([
  'template-01',
  'template-02',
  'template-03',
  'template-04',
  'template-05',
  'template-06',
  'template-07',
  'template-08',
  'template-09',
  'template-10'
]);

export const DEFAULT_STYLES = Object.freeze([
  { template_id: 'template-01', style_name: 'Classic Frame' },
  { template_id: 'template-02', style_name: 'Royal Arch' },
  { template_id: 'template-03', style_name: 'Rajmahal Jharokha' },
  { template_id: 'template-04', style_name: 'Royal Shadi Card' },
  { template_id: 'template-05', style_name: 'Rajput Marwari' },
  { template_id: 'template-06', style_name: 'Cinematic Royal' },
  { template_id: 'template-07', style_name: 'Envelope & Arch' },
  { template_id: 'template-08', style_name: 'Celestial Gate' },
  { template_id: 'template-09', style_name: 'Celestial Palace' },
  { template_id: 'template-10', style_name: 'Jannat Bagh' }
]);

export const DEFAULT_THEMES = Object.freeze([
  { theme_name: 'maroon', label: 'Royal Maroon & Imperial Gold', primary_color: '#7A1426', primary_dark_color: '#3F0713', accent_color: '#C9A24A', paper_top_color: '#FFFDF8', paper_bottom_color: '#F2DFBF', text_color: '#3B1A1F' },
  { theme_name: 'emerald', label: 'Emerald Velvet & Champagne Gold', primary_color: '#0F4D3A', primary_dark_color: '#06281E', accent_color: '#D4AF37', paper_top_color: '#FBFFF9', paper_bottom_color: '#E4EFD9', text_color: '#12332A' },
  { theme_name: 'navy', label: 'Sapphire Midnight & Antique Gold', primary_color: '#1B2F5E', primary_dark_color: '#0A1633', accent_color: '#E0B95E', paper_top_color: '#FCFDFF', paper_bottom_color: '#E3E8F2', text_color: '#14213F' },
  { theme_name: 'rose', label: 'Plum Velvet & Rose Gold', primary_color: '#9C2F55', primary_dark_color: '#55132D', accent_color: '#D4A24C', paper_top_color: '#FFFBFC', paper_bottom_color: '#F5DDE3', text_color: '#4A1A2A' },
  { theme_name: 'charcoal-gold', label: 'Charcoal & Gold', primary_color: '#2B2B2B', primary_dark_color: '#111111', accent_color: '#C9A24A', paper_top_color: '#FAF8F3', paper_bottom_color: '#EBE6DA', text_color: '#222222' },
  { theme_name: 'royal-purple', label: 'Royal Purple & Gold', primary_color: '#4B2A7B', primary_dark_color: '#2A1450', accent_color: '#D4AF37', paper_top_color: '#FBF8FF', paper_bottom_color: '#E8DEF5', text_color: '#2C1A4A' },
  { theme_name: 'saffron', label: 'Imperial Saffron', primary_color: '#C2410C', primary_dark_color: '#7C2D12', accent_color: '#B8860B', paper_top_color: '#FFFAF0', paper_bottom_color: '#FFE8C2', text_color: '#4A2208' },
  { theme_name: 'teal', label: 'Peacock Teal & Gold', primary_color: '#0E6B72', primary_dark_color: '#063C41', accent_color: '#D4AF37', paper_top_color: '#F4FBFB', paper_bottom_color: '#D7ECEC', text_color: '#0F3A3D' }
]);

export function formatINR(paise) {
  if (!Number.isSafeInteger(Number(paise)) || Number(paise) < 0) {
    throw new Error('Price must be a non-negative integer amount in paise.');
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(paise) / 100);
}

export function buildUpiUri({ vpa, merchantName, amountPaise, orderReference }) {
  const normalizedVpa = String(vpa || '').trim();
  if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(normalizedVpa)) {
    throw new Error('The configured merchant UPI ID is invalid.');
  }
  const amount = Number(amountPaise);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('UPI payment amount must be a positive integer number of paise.');
  }
  const params = new URLSearchParams({
    pa: normalizedVpa,
    pn: String(merchantName || '').trim().slice(0, 80),
    am: `${Math.floor(amount / 100)}.${String(amount % 100).padStart(2, '0')}`,
    cu: 'INR',
    tn: `Wedding order ${String(orderReference || '').slice(0, 40)}`
  });
  return `upi://pay?${params.toString()}`;
}

export function validateOnboarding(input) {
  const errors = {};
  const text = (key, maximum) => String(input[key] ?? '').trim().slice(0, maximum);
  const required = (key, label, maximum) => {
    const value = text(key, maximum);
    if (!value) errors[key] = `${label} is required.`;
    return value;
  };

  const email = required('email', 'Email address', 254).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  const phone = required('phone', 'Phone number', 24).replace(/[^\d+]/g, '');
  if (phone && !/^\+?\d{8,15}$/.test(phone)) errors.phone = 'Enter a valid phone number.';
  const whatsapp = text('whatsapp_phone', 24).replace(/[^\d+]/g, '');
  if (whatsapp && !/^\+?\d{8,15}$/.test(whatsapp)) errors.whatsapp_phone = 'Enter a valid WhatsApp number.';
  const weddingDate = required('event_date', 'Wedding date', 10);
  if (!isIsoDate(weddingDate)) errors.event_date = 'Enter a valid wedding date.';
  const template = required('template_style', 'Invitation design', 30);
  if (!AVAILABLE_TEMPLATES.includes(template)) errors.template_style = 'Choose an available invitation design.';

  const events = Array.isArray(input.events) ? input.events : [];
  if (!events.length || events.length > 40) errors.events = 'Add between 1 and 40 programme events.';
  const normalizedEvents = events.map((event, index) => {
    const name = String(event.event_name ?? '').trim();
    const date = String(event.event_date ?? '').trim();
    const time = String(event.event_time ?? '').trim();
    if (!name || name.length > 100) errors[`event_${index}_name`] = 'Each event needs a name (up to 100 characters).';
    if (!isIsoDate(date)) errors[`event_${index}_date`] = 'Each event needs a valid date.';
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) errors[`event_${index}_time`] = 'Please select a valid time.';
    const item = {
      event_name: name.slice(0, 100),
      event_date: date,
      event_time: time,
      note: String(event.note ?? '').trim().slice(0, 500)
    };
    if (event.image || event.event_image) {
      item.image = String(event.image || event.event_image).trim().slice(0, 300);
    }
    return item;
  });

  const mapUrl = text('map_url', 2000);
  if (mapUrl) {
    try {
      if (new URL(mapUrl).protocol !== 'https:') errors.map_url = 'Map links must use HTTPS.';
    } catch {
      errors.map_url = 'Enter a valid Google Maps URL.';
    }
  }
  const paymentMode = String(input.payment_mode ?? '').toLowerCase();
  if (!['upi', 'cash'].includes(paymentMode)) errors.payment_mode = 'Choose UPI or cash settlement.';
  const paymentUtr = String(input.utr ?? '').trim().slice(0, 120);
  if (paymentMode === 'cash' && paymentUtr) errors.utr = 'UTR is not used for cash settlement.';
  const ceremonyTime = text('ceremony_time', 8);
  if (ceremonyTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(ceremonyTime)) {
    errors.ceremony_time = 'Please select a valid time (hour, minute, and AM/PM).';
  }

  const value = {
    customer_name: required('customer_name', 'Customer name', 120),
    phone,
    whatsapp_phone: whatsapp,
    email,
    city: required('city', 'City', 100),
    preferred_contact: text('preferred_contact', 20) || 'whatsapp',
    bride_name: required('bride_name', 'Bride name', 100),
    groom_name: required('groom_name', 'Groom name', 100),
    bride_parents: text('bride_parents', 240),
    groom_parents: text('groom_parents', 240),
    host_name: text('host_name', 180),
    event_date: weddingDate,
    invocation: text('invocation', 200),
    ceremony_title: text('ceremony_title', 120),
    ceremony_time: ceremonyTime,
    venue_title: text('venue_title', 120),
    venue: text('venue', 180),
    address: text('address', 500),
    map_url: mapUrl,
    groom_photo: text('groom_photo', 500000),
    bride_photo: text('bride_photo', 500000),
    couple_photo: text('couple_photo', 500000),
    venue_photo: text('venue_photo', 500000),
    template_style: template,
    theme_name: required('theme_name', 'Theme', 60),
    package_code: required('package_code', 'Package', 40),
    payment_mode: paymentMode,
    utr: paymentMode === 'upi' ? paymentUtr : '',
    events: normalizedEvents
  };
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value
  };
}

export function validateCashRequest(input) {
  const errors = {};
  const text = (key, maximum) => String(input[key] ?? '').trim().slice(0, maximum);
  const customerName = text('customer_name', 120);
  const email = text('email', 254).toLowerCase();
  const rawPhone = text('phone', 24);
  const rawWhatsapp = text('whatsapp_phone', 24);
  const phone = rawPhone.replace(/[^\d+]/g, '');
  const whatsapp = rawWhatsapp.replace(/[^\d+]/g, '');
  const brideName = text('bride_name', 100);
  const groomName = text('groom_name', 100);
  const eventDate = text('event_date', 10);

  if (customerName.length < 2) errors.customer_name = 'Enter your name so the team knows who to contact.';
  if (!phone && !email) errors.contact = 'Provide either a phone number or email address.';
  if (rawPhone && !/^\+?\d{8,15}$/.test(phone)) errors.phone = 'Enter a valid phone number.';
  if (rawWhatsapp && !/^\+?\d{8,15}$/.test(whatsapp)) errors.whatsapp_phone = 'Enter a valid WhatsApp number.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.';
  if (eventDate && !isIsoDate(eventDate)) errors.event_date = 'Enter a valid wedding date.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: {
      customer_name: customerName,
      email,
      phone,
      whatsapp_phone: whatsapp,
      city: text('city', 100),
      preferred_contact: text('preferred_contact', 20) || 'whatsapp',
      bride_name: brideName,
      groom_name: groomName,
      bride_parents: text('bride_parents', 240),
      groom_parents: text('groom_parents', 240),
      host_name: text('host_name', 180),
      event_date: eventDate,
      invocation: text('invocation', 200),
      ceremony_title: text('ceremony_title', 120),
      ceremony_time: text('ceremony_time', 8),
      venue_title: text('venue_title', 120),
      venue: text('venue', 180),
      address: text('address', 500),
      map_url: text('map_url', 2000)
    }
  };
}

export function parseGuestCsv(csvText) {
  const rows = parseCsvRows(String(csvText ?? ''));
  if (rows.length < 2) throw new Error('The CSV must contain a header and at least one guest row.');
  if (rows.length > 501) throw new Error('Import a maximum of 500 guests at once.');
  const headers = rows[0].map(header => header.trim().replace(/^\uFEFF/, '').toLowerCase().replace(/[\s-]+/g, '_'));
  const nameIndex = headers.findIndex(header => ['guest_name', 'name', 'guest'].includes(header));
  const countIndex = headers.findIndex(header => ['family_members', 'guest_count', 'persons'].includes(header));
  const phoneIndex = headers.findIndex(header => ['phone', 'mobile', 'whatsapp'].includes(header));
  const categoryIndex = headers.findIndex(header => header === 'category');
  const cityIndex = headers.findIndex(header => ['city', 'city_address', 'address'].includes(header));
  if (nameIndex < 0) throw new Error('CSV header must include guest_name (or name).');
  const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));
  if (!dataRows.length) throw new Error('The CSV does not contain any guest rows.');
  const guests = dataRows.map((row, index) => {
    const familyText = countIndex < 0 ? '1' : (row[countIndex] || '1').trim();
    const familyCount = Number(familyText);
    const guestName = (row[nameIndex] || '').trim();
    const phone = phoneIndex < 0 ? '' : String(row[phoneIndex] || '').trim();
    const category = categoryIndex < 0 ? 'person' : String(row[categoryIndex] || 'person').trim();
    const cityAddress = cityIndex < 0 ? '' : String(row[cityIndex] || '').trim();
    if (!guestName || guestName.length > 120
        || !Number.isInteger(familyCount) || familyCount < 1 || familyCount > 20
        || phone.length > 24 || category.length > 60 || cityAddress.length > 250) {
      throw new Error(`CSV row ${index + 2} has an invalid guest name, family_members value, or contact detail.`);
    }
    return {
      guest_name: guestName,
      family_members: familyCount,
      phone,
      category,
      city_address: cityAddress,
      with_family: familyCount > 1
    };
  });
  const seen = new Set();
  for (const [index, guest] of guests.entries()) {
    const key = `${guest.guest_name.trim().toLocaleLowerCase()}\u0000${guest.phone.replace(/\D/g, '')}`;
    if (seen.has(key)) throw new Error(`CSV row ${index + 2} duplicates a guest name and phone number.`);
    seen.add(key);
  }
  return guests;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}
