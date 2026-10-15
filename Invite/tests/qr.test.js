import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('vendored QR encoder generates an SVG for a personalized invitation URL', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(new URL('../vendor/qrcode-generator.js', import.meta.url), 'utf8'), context);
  const qr = context.qrcode(0, 'M');
  qr.addData('https://example.com/invite/?code=RANDOM_INVITE_CODE&lang=en');
  qr.make();
  const svg = qr.createSvgTag(6, 8);
  assert.match(svg, /<svg/);
  assert.match(svg, /<path/);
});
