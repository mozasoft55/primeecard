import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TemplateSelector } from '../token-engine/TemplateSelector.js';

const templatesJsonPath = fileURLToPath(new URL('../token-engine/templates.json', import.meta.url));
const catalog = JSON.parse(fs.readFileSync(templatesJsonPath, 'utf8'));

test('TemplateSelector initializes with all 6 quick filter categories in strict order with Hindu default', () => {
  const selector = new TemplateSelector({
    templates: catalog.templates
  });

  // Strict order: [🕉️ Hindu (Default), ☪️ Muslim, ☬ Sikh, 👑 Royal, 🌸 Floral, ✨ All]
  assert.deepEqual(selector.categories, ['Hindu', 'Muslim', 'Sikh', 'Royal', 'Floral', 'All']);
  assert.equal(selector.activeFilter, 'Hindu');
});

test('TemplateSelector implements hard isolation and clean memory swap', () => {
  const selector = new TemplateSelector({
    templates: catalog.templates,
    initialCommunity: 'Muslim'
  });

  // Strict Muslim isolation
  assert.equal(selector.activeFilter, 'Muslim');
  const muslimTemplates = selector.getFilteredTemplates();
  assert.ok(muslimTemplates.length >= 2);
  assert.ok(muslimTemplates.every(t => (t.community || '').toLowerCase() === 'muslim' || (t.tags || []).includes('Muslim')));
  // Verify unselected community nodes are NOT included
  assert.ok(muslimTemplates.every(t => (t.community || '').toLowerCase() !== 'hindu' && (t.community || '').toLowerCase() !== 'sikh'));

  // Switch to Sikh
  selector.setFilter('Sikh');
  assert.equal(selector.activeFilter, 'Sikh');
  const sikhTemplates = selector.getFilteredTemplates();
  assert.ok(sikhTemplates.length >= 1);
  assert.ok(sikhTemplates.every(t => (t.community || '').toLowerCase() === 'sikh'));

  // Switch to Royal
  selector.setFilter('Royal');
  assert.equal(selector.activeFilter, 'Royal');
  const royalTemplates = selector.getFilteredTemplates();
  assert.ok(royalTemplates.length >= 2);
  assert.ok(royalTemplates.some(t => t.id === 'royal-darbar-noir'));
  assert.ok(royalTemplates.some(t => t.id === 'royal-modern-minimal'));

  // Switch to Floral
  selector.setFilter('Floral');
  assert.equal(selector.activeFilter, 'Floral');
  const floralTemplates = selector.getFilteredTemplates();
  assert.ok(floralTemplates.some(t => t.id === 'floral-blush-botanical'));

  // Switch to All
  selector.setFilter('All');
  assert.equal(selector.activeFilter, 'All');
  const allTemplates = selector.getFilteredTemplates();
  assert.equal(allTemplates.length, catalog.templates.length);
});

test('TemplateSelector generates animated gold shimmer skeleton boxes (aspect ratio 3:4)', () => {
  const selector = new TemplateSelector({
    templates: catalog.templates
  });

  const skeletonHtml = selector._renderSkeletonHtml(4);
  assert.ok(skeletonHtml.includes('ts-card--skeleton'));
  assert.ok(skeletonHtml.includes('ts-skeleton-shimmer'));
  assert.ok(skeletonHtml.includes('ts-skeleton-line--title'));
  assert.ok(skeletonHtml.includes('ts-skeleton-line--sub'));
  // Count skeleton cards
  const count = (skeletonHtml.match(/ts-card--skeleton/g) || []).length;
  assert.equal(count, 4);
});

test('TemplateSelector search query filters across title, theme, community, and tags', () => {
  const selector = new TemplateSelector({
    templates: catalog.templates,
    initialCommunity: 'All'
  });

  selector.search('alta');
  const altaResults = selector.getFilteredTemplates();
  assert.equal(altaResults.length, 1);
  assert.equal(altaResults[0].id, 'hindu-bengali-alta');

  selector.search('velvet');
  const velvetResults = selector.getFilteredTemplates();
  assert.ok(velvetResults.length >= 2);
  assert.ok(velvetResults.every(t => (t.tags || []).includes('Velvet') || t.theme.toLowerCase().includes('velvet')));

  // Clear search restores all items under current filter
  selector.search('');
  assert.equal(selector.getFilteredTemplates().length, catalog.templates.length);
});

test('TemplateSelector lightweight rendering excludes heavy HTML markup', () => {
  const selector = new TemplateSelector({
    templates: catalog.templates
  });

  const html = selector._renderGridCardsHtml(catalog.templates);
  
  // Must render semantic card components with front covers
  assert.ok(html.includes('class="ts-card'));
  assert.ok(html.includes('loading="lazy"'));
  assert.ok(html.includes('decoding="async"'));
  assert.ok(html.includes('data-template-id="hindu-vedic-crimson"'));

  // Must NOT render heavy card canvas or nested full invitation markup
  assert.equal(html.includes('token-card-canvas'), false);
  assert.equal(html.includes('token-card__venue'), false);
  assert.equal(html.includes('token-card__events'), false);
  assert.equal(html.includes('token-card__cta'), false);
});

test('TemplateSelector selection triggers onSelect callback with full template and tokens', () => {
  let selectedEventPayload = null;

  const selector = new TemplateSelector({
    templates: catalog.templates,
    onSelect: (template) => {
      selectedEventPayload = template;
    }
  });

  selector.selectTemplate('muslim-emerald-noor');
  
  assert.equal(selector.selectedTemplateId, 'muslim-emerald-noor');
  assert.ok(selectedEventPayload);
  assert.equal(selectedEventPayload.id, 'muslim-emerald-noor');
  assert.equal(selectedEventPayload.community, 'Muslim');
  assert.ok(selectedEventPayload.tokens);
  assert.ok(selectedEventPayload.tokens['--card-bg']);
  assert.ok(selectedEventPayload.tokens['--accent-gold']);
});

test('TemplateSelector safely escapes template strings against XSS injection', () => {
  const safe = TemplateSelector.escapeHtml('<img src=x onerror=alert(1)> & "quotes"');
  assert.equal(safe, '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quotes&quot;');
});
