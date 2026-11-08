import test from 'node:test';
import assert from 'node:assert/strict';
import { CountdownTimer } from '../token-engine/CountdownTimer.js';
import { ParticleCanvas } from '../token-engine/ParticleCanvas.js';
import { AudioController } from '../token-engine/AudioController.js';
import { RoyalEnvelope } from '../token-engine/RoyalEnvelope.js';
import { TemplateSelector } from '../token-engine/TemplateSelector.js';

test('CountdownTimer accurately computes time remaining and formats digits', () => {
  // Test with fixed future date (2 days, 3 hours, 4 minutes, 5 seconds ahead)
  const now = Date.now();
  const futureMs = now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000 + 500;
  const timer = new CountdownTimer({ targetDate: new Date(futureMs) });

  const time = timer.calculateTime();
  assert.equal(time.days, 2);
  assert.equal(time.hours, 3);
  assert.equal(time.minutes, 4);
  assert.equal(time.seconds, 5);
  assert.equal(time.isPast, false);

  // Formatting pad test
  assert.equal(CountdownTimer.pad(5), '05');
  assert.equal(CountdownTimer.pad(12), '12');
  assert.equal(CountdownTimer.pad(0), '00');
});

test('CountdownTimer gracefully identifies past or invalid dates', () => {
  const pastTimer = new CountdownTimer({ targetDate: 'January 1, 2020' });
  const pastTime = pastTimer.calculateTime();
  assert.equal(pastTime.isPast, true);
  assert.equal(pastTime.days, 0);

  const invalidTimer = new CountdownTimer({ targetDate: 'invalid-date' });
  assert.equal(invalidTimer.isValidDate(), false);
  const invalidTime = invalidTimer.calculateTime();
  assert.equal(invalidTime.isPast, true);
});

test('ParticleCanvas enforces 60 FPS safety guardrails and toggle lifecycle', () => {
  const engine = new ParticleCanvas({
    canvas: 'test-canvas',
    maxParticles: 100, // Requesting too many particles
    autoStart: false
  });

  // Guardrail: capped at maximum 60 particles
  assert.ok(engine.maxParticles <= 60, 'Particles must be capped <= 60 for 60fps performance');
  assert.equal(engine.isRunning, false);

  engine.toggle();
  assert.equal(engine.isRunning, true);

  engine.toggle();
  assert.equal(engine.isRunning, false);

  engine.destroy();
  assert.equal(engine.particles.length, 0);
});

test('AudioController manages volume levels and playback controls', () => {
  const audio = new AudioController({
    audioSrc: './test-sound.mp3',
    volume: 0.5,
    autoRender: false
  });

  assert.equal(audio.targetVolume, 0.5);
  assert.equal(audio.isPlaying, false);

  // Clamping tests
  audio.setVolume(1.8);
  assert.equal(audio.targetVolume, 1);

  audio.setVolume(-0.4);
  assert.equal(audio.targetVolume, 0);
});

test('RoyalEnvelope controls open/close state transitions', () => {
  let unveilFired = false;
  const envelope = new RoyalEnvelope({
    targetCard: null,
    sealText: 'TAP TO UNVEIL',
    initiallyOpen: false,
    onUnveil: () => {
      unveilFired = true;
    }
  });

  assert.equal(envelope.isOpen, false);
  envelope.open();
  assert.equal(envelope.isOpen, true);
  assert.equal(unveilFired, true);

  envelope.close();
  assert.equal(envelope.isOpen, false);

  envelope.toggle();
  assert.equal(envelope.isOpen, true);
});

test('TemplateSelector determines luxury theme badges and handles mobile preview', () => {
  const selector = new TemplateSelector({
    container: null,
    templates: [
      { id: 'hindu-vedic-crimson', title: 'Rajmahal', community: 'Hindu', tags: ['Royal', 'Vedic'] },
      { id: 'muslim-emerald-noor', title: 'Noor-e-Jannat', community: 'Muslim', tags: ['Velvet'] },
      { id: 'floral-blush-botanical', title: 'Blush Garden', community: 'Floral', tags: ['Floral'] }
    ]
  });

  assert.equal(selector._getLuxuryBadge(selector.templates[0]), 'Ultra Royal');
  assert.equal(selector._getLuxuryBadge(selector.templates[1]), 'Foil Shimmer');
  assert.equal(selector._getLuxuryBadge(selector.templates[2]), 'Bespoke Floral');

  let previewedTemplate = null;
  selector.onMobilePreview = (tmpl) => {
    previewedTemplate = tmpl;
  };

  selector.triggerMobilePreview(selector.templates[1]);
  assert.equal(selector.selectedTemplateId, 'muslim-emerald-noor');
  assert.equal(previewedTemplate?.id, 'muslim-emerald-noor');
});

