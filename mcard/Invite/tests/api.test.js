import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchInvitationByCode, fetchWeddingById, submitRsvp } from '../api.js';
import { SUPABASE_CONFIG } from '../supabase-config.js';

test.before(() => { SUPABASE_CONFIG.anonKey = 'test-publishable-key'; });

test('fetchInvitationByCode returns guest, wedding, and programme from the lookup RPC', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/rest/v1/rpc/lookup_invitation');
    assert.equal(options.method, 'POST');
    assert.equal(JSON.parse(options.body).p_invite_code, 'VIP-AKBAR-01');
    return Response.json({
      guest: {
        wedding_id: 'c8675da8-54d0-4aef-9008-03fdd1a44702',
        invite_code: 'VIP-AKBAR-01',
        guest_name: 'Ayesha Rahman',
        family_members: 3,
        category: 'family',
        with_family: true
      },
      wedding: {
        id: 'c8675da8-54d0-4aef-9008-03fdd1a44702',
        couple_name: 'Tarana & Akbar',
        event_date: '2026-10-27',
        template_style: 'template-02',
        theme_color: '#123456',
        time: '18:30',
        venue: 'Garden Hall',
        theme_colors: { primary: '#123456', accent: '#abcdef' }
      },
      events: [{
        event_name: 'Mehndi',
        event_date: '2026-10-26',
        event_time: '19:00',
        note: 'Dinner follows'
      }]
    });
  };

  const result = await fetchInvitationByCode(' VIP-AKBAR-01 ');
  assert.equal(result.guest.name, 'Ayesha Rahman');
  assert.equal(result.guest.persons, 3);
  assert.equal(result.guest.with_family, true);
  assert.equal(result.wedding.bride_name, 'Tarana');
  assert.equal(result.wedding.groom_name, 'Akbar');
  assert.equal(result.wedding.date, '2026-10-27');
  assert.equal(result.wedding.template_id, 'template-02');
  assert.equal(result.wedding.time, '6:30 PM');
  assert.deepEqual(result.wedding.theme_colors, { primary: '#123456', accent: '#abcdef' });
  assert.equal(result.events[0].event_name, 'Mehndi');
  assert.equal(result.events[0].event_time, '7:00 PM');
});

test('fetchInvitationByCode reports missing codes and unknown invitations', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    return Response.json(null);
  };

  await assert.rejects(fetchInvitationByCode(' '), /personalized invitation/i);
  assert.equal(requested, false);
  await assert.rejects(fetchInvitationByCode('UNKNOWN'), /code was not found/i);
});

test('fetchWeddingById reads the complete normalized payload from the RPC', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/rest/v1/rpc/lookup_wedding');
    assert.equal(JSON.parse(options.body).p_wedding_id, 'wedding-uuid');
    return Response.json({
      wedding: {
        id: 'wedding-uuid',
        couple_name: 'Tarana & Akbar',
        event_date: '2026-10-27',
        template_style: 'template-02',
        theme_color: '#123456'
      },
      events: [{
        event_name: 'Nikah',
        event_date: '2026-10-27',
        event_time: '11:30',
        note: ''
      }]
    });
  };

  const result = await fetchWeddingById('wedding-uuid');
  assert.equal(result.wedding.date, '2026-10-27');
  assert.equal(result.wedding.bride_name, 'Tarana');
  assert.equal(result.events[0].event_name, 'Nikah');
  assert.equal(result.events[0].event_time, '11:30 AM');
});

test('submitRsvp saves responses through the invite-code RPC without trusting a wedding ID', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/rest/v1/rpc/submit_invitation_rsvp');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), {
      p_invite_code: 'VIP-AKBAR-01',
      p_status: 'attending',
      p_attending_count: 2,
      p_wishes_message: 'Congratulations!'
    });
    return Response.json({ success: true, message: 'Your RSVP has been saved.' });
  };

  const result = await submitRsvp({
    inviteCode: 'VIP-AKBAR-01',
    response: 'attending',
    attendees: 2,
    wishesMessage: ' Congratulations! ',
    capacity: 3
  });
  assert.equal(result.success, true);
});

test('submitRsvp rejects an attendee count above invitation capacity before requesting', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let requested = false;
  globalThis.fetch = async () => { requested = true; };

  await assert.rejects(submitRsvp({
    inviteCode: 'VIP-AKBAR-01',
    response: 'attending',
    attendees: 4,
    capacity: 3
  }), /between 1 and 3/);
  assert.equal(requested, false);
});

test('submitRsvp sends zero attendees for declined and tentative responses', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const submitted = [];
  globalThis.fetch = async (_url, options) => {
    submitted.push(JSON.parse(options.body));
    return Response.json({ success: true });
  };

  for (const status of ['declined', 'tentative']) {
    await submitRsvp({
      inviteCode: 'VIP-AKBAR-01',
      response: status,
      attendees: 3,
      capacity: 3
    });
  }
  assert.deepEqual(submitted.map(body => [body.p_status, body.p_attending_count]), [
    ['declined', 0],
    ['tentative', 0]
  ]);
});
