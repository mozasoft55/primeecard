import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ScrollReveal } from '../token-engine/ScrollReveal.js';

const cssPath = fileURLToPath(new URL('../token-engine/royal-animations.css', import.meta.url));

test('royal-animations.css strictly uses composite-only properties and prefers-reduced-motion', () => {
  const css = fs.readFileSync(cssPath, 'utf8');

  // Must contain hardware-accelerated 3D transforms & opacity
  assert.ok(css.includes('translate3d('));
  assert.ok(css.includes('scale3d('));
  assert.ok(css.includes('will-change: transform, opacity'));

  // Must strictly avoid layout shift animations (no animating width/height/margin in reveal classes)
  assert.equal(css.includes('transition: width'), false);
  assert.equal(css.includes('transition: height'), false);
  assert.equal(css.includes('transition: margin'), false);

  // Must contain micro-interactions
  assert.ok(css.includes('.btn-royal-interactive'));
  assert.ok(css.includes('.btn-foil-sweep'));
  assert.ok(css.includes('.motif-pulse'));
  assert.ok(css.includes('.token-card-canvas.template-morphing'));

  // Must include WCAG accessibility media query
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
});

test('ScrollReveal initializes with performance-first defaults', () => {
  const engine = new ScrollReveal({
    selector: '.test-reveal',
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.15
  });

  assert.equal(engine.selector, '.test-reveal');
  assert.equal(engine.rootMargin, '0px 0px -40px 0px');
  assert.equal(engine.threshold, 0.15);
  assert.equal(engine.once, true);
});

test('ScrollReveal.reveal adds is-revealed class and dispatches custom event', () => {
  const engine = new ScrollReveal({ once: true });

  // Lightweight mock element
  let customEventFired = false;
  const mockElement = {
    classList: {
      classes: new Set(),
      add(cls) { this.classes.add(cls); },
      remove(cls) { this.classes.delete(cls); },
      contains(cls) { return this.classes.has(cls); }
    },
    addEventListener(event, handler) {},
    removeEventListener(event, handler) {},
    dispatchEvent(event) {
      if (event.type === 'reveal') customEventFired = true;
    }
  };

  engine.reveal(mockElement);

  assert.ok(mockElement.classList.contains('is-revealed'));
  assert.equal(customEventFired, true);
});

test('ScrollReveal.revealAll forces instant visibility across all matching elements', () => {
  const engine = new ScrollReveal();

  const mockCards = [
    { classList: { classes: new Set(), add(...cls) { cls.forEach(c => this.classes.add(c)); } } },
    { classList: { classes: new Set(), add(...cls) { cls.forEach(c => this.classes.add(c)); } } }
  ];

  const mockRoot = {
    querySelectorAll: (sel) => mockCards
  };

  engine.revealAll(mockRoot);

  mockCards.forEach(card => {
    assert.ok(card.classList.classes.has('is-revealed'));
    assert.ok(card.classList.classes.has('is-settled'));
  });
});
