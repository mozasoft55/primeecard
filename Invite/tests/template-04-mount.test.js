import test from 'node:test';
import assert from 'node:assert/strict';
import renderT04, { mount } from '../templates/template-04.js';

test('template-04 renders gate opening with lights-off, family board, and couple parents', () => {
  const html = renderT04({
    guest: { name: 'Aarav Sharma', persons: 2, with_family: true },
    wedding: {
      bride_name: 'Zoya',
      groom_name: 'Faizan',
      bride_full: 'Zoya Fatima',
      groom_full: 'Faizan Ahmad',
      bride_parents: 'Mrs. & Mr. Tariq Fatima',
      groom_parents: 'Mrs. & Mr. Naseem Ahmad',
      couple_photo: 'https://example.com/couple.jpg',
      date: '2026-11-20',
      time: '8:00 PM',
      venue: 'Grand Imperial Palace',
      address: 'Kolkata, WB'
    },
    events: [
      { event_name: 'Nikah Ceremony', event_date: '2026-11-20', event_time: '20:00' }
    ]
  });

  // Screen 0: Gate opening, lights off initially, doors portal, wax seal trigger, sparklers container
  assert.match(html, /class="[^"]*t04-cover[^"]*t04-unlit[^"]*"/);
  assert.match(html, /class="t04-doors-portal"/);
  assert.match(html, /class="t04-door t04-door-l"/);
  assert.match(html, /class="t04-door t04-door-r"/);
  assert.match(html, /class="t04-sparks"/);
  assert.match(html, /class="t04-wax-trigger"/);
  assert.match(html, /TAP TO OPEN/);
  assert.match(html, /প্রবেশ করুন/);

  // Screen 1: First screen with Guest Name & Family Invitation Board
  assert.match(html, /data-screen="1"/);
  assert.match(html, /FAMILY INVITATION BOARD/);
  assert.match(html, /Aarav Sharma &amp; Family/);
  assert.match(html, /data-type="single"/);
  assert.match(html, /data-type="family"/);
  assert.match(html, /On opening the invitation, the lights will softly illuminate and the doors will gently unfold/);
  assert.match(html, /Surah Ar-Rum/);

  // Screen 2: Second screen with Bride & Groom details, Parents, and Photographs
  assert.match(html, /data-screen="2"/);
  assert.match(html, /Dulhan \/ Bride/);
  assert.match(html, /Dulha \/ Groom/);
  assert.match(html, /Zoya Fatima/);
  assert.match(html, /Faizan Ahmad/);
  assert.match(html, /D\/o Mrs\. &amp; Mr\. Tariq Fatima/);
  assert.match(html, /S\/o Mrs\. &amp; Mr\. Naseem Ahmad/);
  assert.match(html, /class="t04-couple-arch-hero"/);
});

test('template-04 mount initializes safely and returns cleanup function', () => {
  const listeners = {};
  const mockClassList = new Set(['t04']);
  const mockElement = {
    classList: {
      add(c) { mockClassList.add(c); },
      remove(c) { mockClassList.delete(c); },
      toggle(c, v) { if (v) mockClassList.add(c); else mockClassList.delete(c); },
      contains(c) { return mockClassList.has(c); }
    },
    dataset: {},
    style: { setProperty() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(evt, fn) {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener(evt, fn) {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(f => f !== fn);
      }
    }
  };

  const cleanup = mount(mockElement, {
    guest: { name: 'Test Guest' },
    wedding: { bride_name: 'B', groom_name: 'G' },
    events: []
  });

  assert.equal(typeof cleanup, 'function');
  assert.doesNotThrow(() => cleanup());
});
