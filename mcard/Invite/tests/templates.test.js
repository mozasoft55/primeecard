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

test('template-01 matches the cinematic Monsoon Majesty invitation design with live wedding details', async () => {
  const module = await import('../templates/template-01.js');
  const html = module.default({
    guest: { name: 'Anika Family', persons: 4, with_family: true },
    wedding: {
      bride_name: 'Anika Sharma',
      groom_name: 'Rohan Mukherjee',
      bride_parents: 'Mr. & Mrs. Sharma',
      groom_parents: 'Mr. & Mrs. Mukherjee',
      date: '2027-02-14',
      time: '7:30 PM',
      venue: 'Grand Ballroom',
      address: 'Dhaka',
      map_url: 'https://example.com/venue',
      rsvp_number: '+8801700000000',
      footer_text: 'The Sharma & Mukherjee Families'
    },
    events: [{ event_name: 'Shubho Bibaho', event_date: '2027-02-14', event_time: '7:30 PM' }]
  });

  assert.match(html, /class="t8/);
  assert.match(html, /Anika Sharma/);
  assert.match(html, /Rohan Mukherjee/);
  assert.match(html, /14 February 2027|14 · 02 · 2027/);
  assert.match(html, /Grand Ballroom/);
  assert.match(html, /Anika Family/);
  assert.match(html, /Shubho Bibaho/);
  assert.match(html, /The Sharma &amp; Mukherjee Families/);
  assert.match(html, /data-u="d"/);
  assert.match(html, /data-u="h"/);
  assert.match(html, /data-u="m"/);
  assert.match(html, /data-u="s"/);
  assert.match(html, /data-open/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('template-01 leaves unavailable guest actions disabled when wedding details are missing', async () => {
  const module = await import('../templates/template-01.js');
  const html = module.default({
    guest: { name: 'Nadia Rahman', persons: 2, with_family: false },
    wedding: { bride_name: 'Anika', groom_name: 'Rohan' },
    events: []
  });

  assert.match(html, /(?:Date to be announced|To be announced)/);
  assert.doesNotMatch(html, /calendar\.google\.com\/calendar\/render\?[^"]*action=TEMPLATE/);
});

test('template-01 uses the wedding date for the countdown when present', async () => {
  const module = await import('../templates/template-01.js');
  const html = module.default({
    guest: { name: 'Nadia Rahman', persons: 2, with_family: false },
    wedding: { bride_name: 'Anika', groom_name: 'Rohan', date: '2027-02-14', time: '7:30 PM' },
    events: [{ event_name: 'Wedding Ceremony', event_date: '2027-02-14', event_time: '7:30 PM' }]
  });

  assert.match(html, /data-when="\d+"/);
  assert.doesNotMatch(html, /Date to be announced/);
});

test('template-01 omits the countdown timestamp for an invalid wedding date', async () => {
  const module = await import('../templates/template-01.js');
  const html = module.default({
    guest: { name: 'Nadia Rahman', persons: 2, with_family: false },
    wedding: { bride_name: 'Anika', groom_name: 'Rohan', date: '2027-02-30' },
    events: []
  });

  assert.match(html, /data-when=""/);
  assert.match(html, /(?:Date to be announced|To be announced)/);
});

test('template-03 presents the Rajmahal Jharokha royal wedding invitation and guest actions', async () => {
  const module = await import('../templates/template-03.js');
  const html = module.default({
    guest: { name: 'Nadia Rahman', persons: 4, with_family: true },
    wedding: {
      bride_name: 'Madhurima',
      groom_name: 'Imran',
      date: '2027-02-14',
      time: '7:30 PM',
      venue: 'Grand Ballroom',
      address: 'Dhaka',
      map_url: 'https://example.com/venue',
      rsvp_number: '+8801700000000',
      rsvp_contacts: '01700000000',
      invocation: 'With the blessings of our families',
      footer_text: 'The Mukherjee & Rahman Families'
    },
    events: [{ event_name: 'Shubho Bibaho', event_date: '2027-02-14', event_time: '7:30 PM' }]
  });

  assert.match(html, /class="t9/);
  assert.match(html, /Madhurima/);
  assert.match(html, /Imran/);
  assert.match(html, /Grand Ballroom/);
  assert.match(html, /Nadia Rahman/);
  assert.match(html, /Shubho Bibaho/);
  assert.match(html, /data-u="d"/);
  assert.match(html, /data-u="h"/);
  assert.match(html, /data-u="m"/);
  assert.match(html, /data-u="s"/);
  assert.match(html, /data-open/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('template-03 countdown timestamp is omitted for an unknown wedding date', async () => {
  const module = await import('../templates/template-03.js');
  const html = module.default({
    guest: { name: 'Nadia Rahman', persons: 2, with_family: false },
    wedding: { bride_name: 'Madhurima', groom_name: 'Imran' },
    events: []
  });

  assert.match(html, /data-when=""/);
  assert.match(html, /(?:Date to be announced|To be announced)/);
});

test('template-04 removes unwanted branding and retains working invitation navigation controls', async () => {
  const module = await import('../templates/template-04.js');
  const html = module.default({
    guest,
    wedding: { ...wedding, bride_name: 'Anika', groom_name: 'Rohan' },
    events
  });

  assert.match(html, /data-next>Begin Invitation/);
  assert.match(html, /data-screen="1"/);
  assert.match(html, /data-prev/);
  assert.doesNotMatch(html, /ROYAL WEDDING|A FAMILY WEDDING INVITATION|MADE WITH LOVE/);
});

test('template-04 renders the five-section royal Islamic Shadi card invitation with authentic motifs', async () => {
  const module = await import('../templates/template-04.js');
  const html = module.default({
    guest: { name: 'Ayesha Rahman', persons: 3, with_family: true },
    wedding: {
      bride_name: 'Tarana',
      groom_name: 'Akbar',
      bride_full: 'Dr. Tarana Khatoon',
      groom_full: 'Md Akbar Ansari',
      bride_parents: 'Mrs. & Mr. Md Kalim Khan',
      groom_parents: 'Mrs. & Mr. Md Moin Ansari',
      date: '2026-10-27',
      time: '9:30 PM',
      venue: 'Shuubh Arambh Banquet',
      address: 'Howrah, West Bengal',
      map_url: 'https://maps.app.goo.gl/example',
      ceremony_title: 'Marriage Ceremony & Walima',
      invocation: 'In the name of Allah the most beneficent & merciful',
      footer_text: 'Md Kalim Khan & Family'
    },
    events: [
      { event_name: 'Nikah Mubarak', event_date: '2026-10-27', event_time: '21:30', note: 'Auspicious union' }
    ]
  });

  // Check Shadi Card cultural and aesthetic markers
  assert.match(html, /Shadi Mubarak/);
  assert.match(html, /بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ/);
  assert.match(html, /Surah Ar-Rum/);
  assert.match(html, /Ayesha Rahman &amp; Family/);
  assert.match(html, /Dulhan \/ Bride/);
  assert.match(html, /Dulha \/ Groom/);
  assert.match(html, /Dr\. Tarana Khatoon/);
  assert.match(html, /Md Akbar Ansari/);
  assert.match(html, /Mrs\. &amp; Mr\. Md Kalim Khan/);
  assert.match(html, /Nikah Mubarak/);
  assert.match(html, /Programme-e-Taqreeb/);
  assert.match(html, /id="t04-calendar"/);
  assert.match(html, /id="t04-maps"/);
  assert.match(html, /data-reveal>Scratch Card/);
  assert.match(html, /data-restart>Start Again ↻/);
  assert.equal((html.match(/class="t04-screen[^"]*" data-screen=/g) || []).length, 5);
});

test('template-04 gracefully handles missing dates and venue links', async () => {
  const module = await import('../templates/template-04.js');
  const html = module.default({
    guest: { name: 'Zahid Khan', persons: 1, with_family: false },
    wedding: { bride_name: 'Zoya', groom_name: 'Faizan' },
    events: []
  });

  assert.match(html, /Date To Follow/);
  assert.match(html, /Venue To Follow/);
  assert.match(html, /Zahid Khan/);
  assert.doesNotMatch(html, /&amp; Family/);
});

test('template-05 renders five invitation screens with working navigation controls', async () => {
  const module = await import('../templates/template-05.js');
  const html = module.default({ guest, wedding, events });

  assert.equal((html.match(/class="t05-screen[^"]*" data-screen=/g) || []).length, 5);
  assert.match(html, /data-next>Begin Invitation/);
  assert.match(html, /data-prev/);
  assert.match(html, /data-step="4"/);
  assert.match(html, /data-restart/);
});
