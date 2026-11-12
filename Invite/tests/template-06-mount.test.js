import test from 'node:test';
import assert from 'node:assert/strict';
import * as t06 from '../templates/template-06.js';

test('template-06 mount initializes without throwing any reference or runtime errors', () => {
  const elements = new Map();
  function createMockElement(tag, attrs = {}) {
    const listeners = {};
    const el = {
      tagName: tag.toUpperCase(),
      dataset: { ...attrs },
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains() { return false; }
      },
      style: {},
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k] ?? null; },
      removeAttribute(k) { delete this[k]; },
      addEventListener(evt, fn) {
        listeners[evt] = listeners[evt] || [];
        listeners[evt].push(fn);
      },
      removeEventListener() {},
      querySelector(selector) {
        return createMockElement('div');
      },
      querySelectorAll() {
        return [];
      },
      getBoundingClientRect() {
        return { left: 0, top: 0, width: 100, height: 100 };
      },
      getContext() {
        return {
          fillRect() {},
          clearRect() {},
          beginPath() {},
          arc() {},
          fill() {},
          getImageData() { return { data: new Uint8Array(100) }; }
        };
      },
      appendChild() {},
      remove() {}
    };
    return el;
  }

  const mockHost = createMockElement('div', {
    lang: 'en',
    wa: '919477929927',
    orderRef: 'ORD-123'
  });

  const mockDoc = {
    documentElement: createMockElement('html'),
    body: createMockElement('body'),
    fonts: { load: () => Promise.resolve() },
    createElement: tag => createMockElement(tag),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {}
  };

  const mockWin = {
    innerWidth: 1024,
    innerHeight: 768,
    scrollY: 0,
    localStorage: {
      getItem: () => null,
      setItem: () => {}
    },
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame: fn => setTimeout(fn, 16),
    matchMedia: () => ({ matches: false })
  };

  mockHost.ownerDocument = mockDoc;
  mockDoc.defaultView = mockWin;
  global.document = mockDoc;
  global.window = mockWin;
  global.Audio = class { play() { return Promise.resolve(); } pause() {} };

  assert.doesNotThrow(() => {
    const cleanup = t06.mount(mockHost, {
      guest: { name: 'Priya', persons: 2, invite_code: 'TEST1234' },
      wedding: { bride_name: 'Pari', groom_name: 'Para' },
      events: []
    });
    if (typeof cleanup === 'function') cleanup();
  });
});
