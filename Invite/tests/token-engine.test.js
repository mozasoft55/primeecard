import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TokenTemplateController } from '../token-engine/TokenTemplateController.js';

const templatesJsonPath = fileURLToPath(new URL('../token-engine/templates.json', import.meta.url));

test('templates.json contains at least 4 modular entries with required schema', () => {
  const raw = fs.readFileSync(templatesJsonPath, 'utf8');
  const catalog = JSON.parse(raw);
  assert.ok(Array.isArray(catalog.templates), 'templates catalog must be an array');
  assert.ok(catalog.templates.length >= 4, 'must have at least 4 entries');

  const communities = catalog.templates.map(t => t.community);
  assert.ok(communities.includes('Hindu'));
  assert.ok(communities.includes('Muslim'));
  assert.ok(communities.includes('Sikh'));
  assert.ok(communities.includes('Royal Modern'));

  catalog.templates.forEach(t => {
    assert.ok(t.id, 'id is required');
    assert.ok(t.title, 'title is required');
    assert.ok(t.community, 'community is required');
    assert.ok(t.theme, 'theme is required');
    assert.ok(t.tokens, 'tokens object is required');
    assert.ok(t.tokens['--card-bg'], 'must contain --card-bg');
    assert.ok(t.tokens['--text-primary'], 'must contain --text-primary');
    assert.ok(t.tokens['--accent-gold'], 'must contain --accent-gold');
    assert.ok(t.tokens['--card-font-display'], 'must contain --card-font-display');
  });
});

test('TokenTemplateController initializes and manages active template state', () => {
  const raw = fs.readFileSync(templatesJsonPath, 'utf8');
  const catalog = JSON.parse(raw);
  const controller = new TokenTemplateController({
    templates: catalog.templates,
    defaultTemplateId: 'hindu-vedic-crimson'
  });

  assert.equal(controller.activeTemplate.id, 'hindu-vedic-crimson');
  assert.equal(controller.activeTemplate.community, 'Hindu');

  assert.ok(controller.templates.has('muslim-emerald-noor'));
  assert.ok(controller.templates.has('sikh-anand-karaj'));
  assert.ok(controller.templates.has('royal-modern-minimal'));
});

