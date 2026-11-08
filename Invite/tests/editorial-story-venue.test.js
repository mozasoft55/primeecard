import test from 'node:test';
import assert from 'node:assert/strict';
import { TokenTemplateController } from '../token-engine/TokenTemplateController.js';

test('renderStorySection renders compressed image with lazy-loading when photo is present', () => {
  const story = {
    date: 'October 18, 2023',
    quote: '“One serendipitous afternoon over hot chai…”',
    text: 'What began as a quiet conversation soon unfolded into forever.',
    image: './assets/template-06-couple.webp'
  };
  const couple = { bride: 'Sanjukta', groom: 'Purushottam' };

  const html = TokenTemplateController.renderStorySection(story, couple);

  // Must render image with lazy-loading and decoding="async"
  assert.ok(html.includes('<img class="story-photo-img"'));
  assert.ok(html.includes('src="./assets/template-06-couple.webp"'));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('decoding="async"'));
  assert.equal(html.includes('story-photo-fallback'), false);

  // Must render editorial story content
  assert.ok(html.includes('How We Met'));
  assert.ok(html.includes('October 18, 2023'));
  assert.ok(html.includes('One serendipitous afternoon'));
  assert.ok(html.includes('Sanjukta &amp; Purushottam'));
});

test('renderStorySection renders luxury graceful fallback monogram when no photo is uploaded', () => {
  const story = {
    date: 'October 18, 2023',
    quote: '“Destiny brought our paths together.”',
    text: 'Two souls walking side by side.',
    image: '' // No photo provided!
  };
  const couple = { bride: 'Sanjukta', groom: 'Purushottam' };

  const html = TokenTemplateController.renderStorySection(story, couple);

  // Must NOT render <img>
  assert.equal(html.includes('<img'), false);

  // Must render graceful monogram fallback
  assert.ok(html.includes('class="story-photo-fallback"'));
  assert.ok(html.includes('story-fallback-monogram'));
  assert.ok(html.includes('S &amp; P'));
  assert.ok(html.includes('United by Destiny'));
});

test('renderVenueShowcase renders hero venue image with timing ribbon when photo is present', () => {
  const venue = {
    name: 'Grand Heritage Palace Grounds',
    hall: 'The Royal Mandap Courtyard',
    address: 'Riverfront Promenade',
    city: 'Kolkata, West Bengal',
    map_url: 'https://maps.google.com/?q=Heritage+Palace',
    image: './assets/template-06-palace.webp'
  };

  const html = TokenTemplateController.renderVenueShowcase(venue, '7:30 PM');

  // Must render venue photo with lazy-loading and decoding="async"
  assert.ok(html.includes('<img class="venue-photo-img"'));
  assert.ok(html.includes('src="./assets/template-06-palace.webp"'));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('decoding="async"'));
  assert.equal(html.includes('venue-photo-fallback'), false);

  // Must render details
  assert.ok(html.includes('Grand Heritage Palace Grounds'));
  assert.ok(html.includes('The Royal Mandap Courtyard'));
  assert.ok(html.includes('Riverfront Promenade'));
  assert.ok(html.includes('7:30 PM Onwards'));
  assert.ok(html.includes('Get Driving Directions ↗'));
  assert.ok(html.includes('href="https://maps.google.com/?q=Heritage+Palace"'));
});

test('renderVenueShowcase renders architectural arch fallback when no venue photo is uploaded', () => {
  const venue = {
    name: 'Royal Heritage Palace',
    address: 'Bally, Howrah',
    city: 'West Bengal',
    image: '' // No venue photo
  };

  const html = TokenTemplateController.renderVenueShowcase(venue, '7:00 PM');

  // Must NOT render <img>
  assert.equal(html.includes('<img'), false);

  // Must render graceful architectural fallback
  assert.ok(html.includes('class="venue-photo-fallback"'));
  assert.ok(html.includes('class="venue-fallback-arch"'));
  assert.ok(html.includes('Royal Heritage Palace'));
  assert.ok(html.includes('Get Driving Directions ↗'));
});

test('TokenTemplateController and Template 06 reflect uploaded banquet and couple photos', async () => {
  const couplePhoto = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vsGAA==';
  const venuePhoto = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vsGAA==';

  // 1. TokenTemplateController centerpiece & venue showcase reflection
  const controller = new TokenTemplateController({
    templates: [
      { id: 'hindu-vedic-crimson', community: 'Hindu', tokens: {} },
      { id: 'hindu-bengali-alta', community: 'Hindu', tokens: {} }
    ],
    defaultTemplateId: 'hindu-vedic-crimson'
  });

  const state = {
    couple: { bride: 'Sanjukta', groom: 'Purushottam' },
    couple_photo: couplePhoto,
    venue_photo: venuePhoto,
    venue: { name: 'Royal Heritage Banquet Palace' }
  };

  const mount = {
    className: '',
    style: { setProperty: () => {} },
    setAttribute: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    innerHTML: ''
  };

  controller.render(mount, state);

  // Couple photo must reflect in centerpiece jharokha artwork frame
  assert.ok(mount.innerHTML.includes(couplePhoto), 'Couple photo must reflect in TokenTemplateController');
  assert.ok(mount.innerHTML.includes('bengali-artwork-img'), 'Must render in bengali-artwork-img');

  // Venue banquet photo must reflect in venue showcase
  assert.ok(mount.innerHTML.includes(venuePhoto), 'Banquet photo must reflect in TokenTemplateController venue showcase');
  assert.ok(mount.innerHTML.includes('venue-photo-img'), 'Must render in venue-photo-img');

  // 2. Template-06 legacy reflection
  const t06 = (await import('../templates/template-06.js')).default;
  const t06Html = t06({
    guest: { name: 'Respected Guest' },
    wedding: {
      bride_name: 'Sanjukta',
      groom_name: 'Purushottam',
      couple_photo: couplePhoto,
      venue_photo: venuePhoto,
      venue: 'Royal Heritage Banquet Palace'
    }
  });

  assert.ok(t06Html.includes(couplePhoto), 'Couple photo must reflect in Template 06 hero / spotlight frame');
  assert.ok(t06Html.includes(venuePhoto), 'Banquet photo must reflect in Template 06 destination venue section');
});

test('Template 06 hero has invocation/title top before photo and guaranteed RSVP with events', async () => {
  const t06 = (await import('../templates/template-06.js')).default;
  const html = t06({
    guest: { name: 'Respected Guest', with_family: true },
    wedding: {
      bride_name: 'Sanjukta',
      groom_name: 'Purushottam',
      venue: 'Royal Palace Banquet'
    },
    events: []
  });

  // 1. Invocation & Shubho Bibaho MUST appear before the spotlight couple photo
  const invocPos = html.indexOf('|| Shree Shree Prajapataye Namah ||');
  const titlePos = html.indexOf('Shubho Bibaho');
  const photoPos = html.indexOf('class="t9-spotlight-frame');

  assert.ok(invocPos !== -1, 'Invocation must exist');
  assert.ok(titlePos !== -1, 'Ceremony title must exist');
  assert.ok(photoPos !== -1, 'Spotlight photo frame must exist');
  assert.ok(invocPos < photoPos, 'Invocation must be above the photo frame');
  assert.ok(titlePos < photoPos, 'Ceremony title must be above the photo frame');
  assert.ok(html.includes('t9-lotus-flourish'), 'Sacred lotus flourish divider must exist at top');

  // 2. RSVP section MUST include interactive inputs, chips, and WhatsApp submit
  assert.ok(html.includes('data-rsvp'), 'RSVP form must exist');
  assert.ok(html.includes('data-att="yes"'), 'RSVP attendance yes button must exist');
  assert.ok(html.includes('data-att="no"'), 'RSVP attendance no button must exist');
  assert.ok(html.includes('t9-chips-row'), 'RSVP function chips row must exist');
  assert.ok(html.includes('t9-send'), 'RSVP WhatsApp submit button must exist');
  assert.ok(html.includes('Gaye Holud &amp; Mehendi') || html.includes('Gaye Holud & Mehendi'), 'Default Bengali event chip must exist');

  // 3. Bengali Hindu royal assets & features (Entry frame, swinging bells, Google Calendar)
  assert.ok(html.includes("t9-entry-pillars") || html.includes("bengali-entry-frame"), "Page 1 Entry gate card must be framed with authentic Bengali design");
  assert.ok(html.includes("t9-hero-pillars"), "Page 2 Hero must feature banana tree pillars");
  assert.ok(html.includes("t9-bell-left") && html.includes("t9-bell-right"), "Page 2 Hero must feature swinging bells on left and right");
  assert.ok(html.includes("t9-btn-gcal"), "Save the Date must feature dedicated Google Calendar button");
  assert.ok(html.includes("calendar.google.com/calendar/render"), "Google Calendar render URL must be present");
});
