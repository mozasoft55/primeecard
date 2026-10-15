import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVAILABLE_TEMPLATES,
  buildUpiUri,
  DEFAULT_STYLES,
  DEFAULT_THEMES,
  formatINR,
  parseGuestCsv,
  validateCashRequest,
  validateOnboarding
} from '../onboarding-core.js';

const validOrder = {
  customer_name: 'Customer Example',
  email: 'customer@example.com',
  phone: '+919876543210',
  whatsapp_phone: '',
  city: 'Howrah',
  preferred_contact: 'whatsapp',
  bride_name: 'Ayesha',
  groom_name: 'Arif',
  event_date: '2027-02-14',
  ceremony_time: '18:30',
  template_style: 'template-02',
  theme_name: 'maroon',
  package_code: 'standard',
  payment_mode: 'upi',
  events: [{
    event_name: 'Nikah',
    event_date: '2027-02-14',
    event_time: '18:30',
    note: ''
  }]
};

test('formats package money from integer paise', () => {
  assert.equal(formatINR(125050), '₹1,250.50');
  assert.throws(() => formatINR(1.5), /integer amount in paise/i);
});

test('builds an encoded dynamic UPI payment URI from paise', () => {
  const uri = buildUpiUri({
    vpa: 'merchant.store@upi',
    merchantName: 'Royal Wedding Cards',
    amountPaise: 300050,
    orderReference: 'ORD-123'
  });
  const parsed = new URL(uri);
  assert.equal(parsed.protocol, 'upi:');
  assert.equal(parsed.hostname, 'pay');
  assert.equal(parsed.searchParams.get('pa'), 'merchant.store@upi');
  assert.equal(parsed.searchParams.get('pn'), 'Royal Wedding Cards');
  assert.equal(parsed.searchParams.get('am'), '3000.50');
  assert.equal(parsed.searchParams.get('cu'), 'INR');
  assert.throws(() => buildUpiUri({
    vpa: 'not-a-vpa',
    merchantName: 'Shop',
    amountPaise: 300,
    orderReference: 'ORD'
  }), /UPI ID is invalid/i);
});

test('validates valid UPI onboarding and preserves the server-priced package key', () => {
  const result = validateOnboarding(validOrder);
  assert.equal(result.valid, true);
  assert.deepEqual(result.value.events, validOrder.events);
  assert.equal(result.value.package_code, 'standard');
  assert.equal(result.value.utr, '');
});

test('keeps onboarding design choices available when the configuration service is offline', () => {
  assert.deepEqual(DEFAULT_STYLES.map(style => style.template_id), AVAILABLE_TEMPLATES);
  assert.ok(DEFAULT_THEMES.some(theme => theme.theme_name === 'maroon'));
  for (const theme of DEFAULT_THEMES) {
    for (const key of ['primary_color', 'primary_dark_color', 'accent_color', 'paper_top_color', 'paper_bottom_color', 'text_color']) {
      assert.match(theme[key], /^#[\da-f]{6}$/i);
    }
  }
  assert.equal(validateOnboarding({
    ...validOrder,
    template_style: DEFAULT_STYLES[0].template_id,
    theme_name: DEFAULT_THEMES.find(theme => theme.theme_name === 'maroon').theme_name
  }).valid, true);
});

test('cash checkout rejects UTR data and invalid input without client prices', () => {
  const result = validateOnboarding({
    ...validOrder,
    payment_mode: 'cash',
    utr: 'fake-reference',
    template_style: 'javascript:alert(1)'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.utr);
  assert.ok(result.errors.template_style);
  assert.equal('list_price_paise' in result.value, false);
  assert.equal('advance_verified_paise' in result.value, false);
});

test('rejects malformed dates, non-HTTPS map URLs, and invalid event counts', () => {
  const result = validateOnboarding({
    ...validOrder,
    event_date: '2027-02-30',
    map_url: 'javascript:alert(1)',
    events: []
  });
  assert.ok(result.errors.event_date);
  assert.ok(result.errors.map_url);
  assert.ok(result.errors.events);
});

test('accepts a minimal cash quote request without package or event selection', () => {
  const result = validateCashRequest({
    customer_name: 'Ayesha Khan',
    phone: '+91 98765 43210',
    bride_name: 'Ayesha'
  });
  assert.equal(result.valid, true);
  assert.equal(result.value.phone, '+919876543210');
  assert.equal(result.value.email, '');
  assert.equal('package_code' in result.value, false);
});

test('requires a reachable contact and validates any supplied contact details', () => {
  assert.ok(validateCashRequest({ customer_name: 'Ayesha' }).errors.contact);
  assert.ok(validateCashRequest({
    customer_name: 'Ayesha',
    phone: '123456789012345678',
    email: 'not-an-email'
  }).errors.phone);
  assert.ok(validateCashRequest({
    customer_name: 'Ayesha',
    phone: '+919876543210',
    whatsapp_phone: 'nope'
  }).errors.whatsapp_phone);
});

test('parses quoted Excel-export CSV rows and maps guest fields', () => {
  const rows = parseGuestCsv(
    '\uFEFFguest_name,family_members,phone,category,city_address\r\n' +
    '"Khan, Ayesha",3,+919876543210,family,"Howrah, West Bengal"\r\n' +
    '"Guest ""Two""",1,,person,Kolkata\r\n'
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].guest_name, 'Khan, Ayesha');
  assert.equal(rows[0].city_address, 'Howrah, West Bengal');
  assert.equal(rows[1].guest_name, 'Guest "Two"');
});

test('rejects duplicate guest rows, invalid guest counts, and malformed CSV', () => {
  assert.throws(() => parseGuestCsv(
    'guest_name,phone\nAyesha,+911234567890\nAyesha,+911234567890'
  ), /duplicates a guest name/i);
  assert.throws(() => parseGuestCsv(
    'guest_name,family_members\nAyesha,99'
  ), /invalid guest name, family_members/i);
  assert.throws(() => parseGuestCsv(
    'guest_name,phone\nAyesha,1234567890123456789012345'
  ), /contact detail/i);
  assert.throws(() => parseGuestCsv('guest_name\n\n'), /at least one guest row|does not contain any guest rows/i);
  assert.throws(() => parseGuestCsv('guest_name\n"Ayesha'), /unterminated quoted field/i);
});
