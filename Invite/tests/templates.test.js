import test from 'node:test';
import assert from 'node:assert/strict';

const wedding = {
  bride_name: '<script>alert(1)</script>',
  groom_name: 'Imran',
  date: '2027-02-14',
  time: '7:30 PM',
  venue: 'Grand Ballroom',
  address: 'Dhaka',
  map_url: 'https://example.com/venue',
  rsvp_contacts: '01700000000',
  message: 'A joyful celebration',
  invocation: 'With blessings',
  footer_text: 'The families'
};
const guest = { name: 'Nadia Rahman', persons: 2, with_family: false };
const events = [{ event_name: 'Nikah', event_date: '2027-02-14', event_time: '4:00 PM' }];

for (let number = 1; number <= 10; number++) {
  const templateId = `template-${String(number).padStart(2, '0')}`;
  test(`${templateId} renders the invitation contract and escapes wedding data`, async () => {
    const module = await import(`../templates/${templateId}.js`);
    const html = module.default({ guest, wedding, events });
    assert.equal(typeof html, 'string');
    assert.ok(html.length > 200);
    assert.match(html, /Nadia Rahman/);
    assert.match(html, /Imran/);
    assert.match(html, /Nikah/);
    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  });
}
