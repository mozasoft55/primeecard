import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  calculateTargetDimensions,
  validateImageFile,
  COMPRESSION_DEFAULTS
} from '../utils/image-compressor.js';

test('formatBytes accurately formats bytes into readable units', () => {
  assert.equal(formatBytes(0), '0 Bytes');
  assert.equal(formatBytes(500), '500 Bytes');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(204800), '200 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(8388608), '8 MB');
  assert.equal(formatBytes(null), '0 Bytes');
  assert.equal(formatBytes(undefined), '0 Bytes');
});

test('calculateTargetDimensions proportionally scales down landscape photos to max 1200px', () => {
  // 4000 x 3000 (standard smartphone camera 4:3 landscape)
  const result = calculateTargetDimensions(4000, 3000, 1200);
  assert.equal(result.width, 1200);
  assert.equal(result.height, 900);
  assert.equal(result.wasScaled, true);

  // 16:9 Landscape (3840 x 2160 4K)
  const res4k = calculateTargetDimensions(3840, 2160, 1200);
  assert.equal(res4k.width, 1200);
  assert.equal(res4k.height, 675);
  assert.equal(res4k.wasScaled, true);
});

test('calculateTargetDimensions proportionally scales down portrait photos to max 1200px', () => {
  // 3000 x 4000 (smartphone vertical portrait)
  const result = calculateTargetDimensions(3000, 4000, 1200);
  assert.equal(result.width, 900);
  assert.equal(result.height, 1200);
  assert.equal(result.wasScaled, true);
});

test('calculateTargetDimensions does not upscale photos smaller than maxDimension', () => {
  // 800 x 600 image should keep exact dimensions
  const result = calculateTargetDimensions(800, 600, 1200);
  assert.equal(result.width, 800);
  assert.equal(result.height, 600);
  assert.equal(result.wasScaled, false);
});

test('calculateTargetDimensions rejects invalid or non-positive dimensions', () => {
  assert.throws(() => calculateTargetDimensions(0, 500), /Invalid image dimensions/);
  assert.throws(() => calculateTargetDimensions(-10, 500), /Invalid image dimensions/);
  assert.throws(() => calculateTargetDimensions(500, 0), /Invalid image dimensions/);
});

test('validateImageFile accepts valid image types and rejects invalid files', () => {
  // Mock valid Blob/File
  const validJpeg = new Blob(['sample-jpeg-bytes'], { type: 'image/jpeg' });
  validJpeg.name = 'couple-photo.jpg';

  const validPng = new Blob(['sample-png-bytes'], { type: 'image/png' });
  validPng.name = 'venue.png';

  const validWebp = new Blob(['sample-webp-bytes'], { type: 'image/webp' });
  validWebp.name = 'palace.webp';

  assert.doesNotThrow(() => validateImageFile(validJpeg));
  assert.doesNotThrow(() => validateImageFile(validPng));
  assert.doesNotThrow(() => validateImageFile(validWebp));

  // Rejects null / undefined
  assert.throws(() => validateImageFile(null), /Please select a valid image file/);
  assert.throws(() => validateImageFile(undefined), /Please select a valid image file/);

  // Rejects empty file (0 bytes)
  const emptyBlob = new Blob([], { type: 'image/jpeg' });
  emptyBlob.name = 'empty.jpg';
  assert.throws(() => validateImageFile(emptyBlob), /is empty \(0 bytes\)/);

  // Rejects invalid non-image MIME types
  const pdfBlob = new Blob(['dummy-pdf'], { type: 'application/pdf' });
  pdfBlob.name = 'wedding-doc.pdf';
  assert.throws(() => validateImageFile(pdfBlob), /Unsupported format/);

  // Rejects oversized file (> 25MB)
  const hugeMock = {
    size: 26 * 1024 * 1024,
    type: 'image/jpeg',
    name: 'huge-raw-dslr.jpg'
  };
  Object.setPrototypeOf(hugeMock, Blob.prototype);
  assert.throws(() => validateImageFile(hugeMock), /exceeds the maximum allowed limit/);
});

