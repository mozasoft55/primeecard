import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGuestInvitationUrl, parseGuestLinkEntries } from '../guest-links.js';

test('parses saved invite code and guest name rows', () => {
  assert.deepEqual(
    parseGuestLinkEntries('VIP-AKBAR-01 | Ayesha Rahman\nFAM-02 | Mr. and Mrs. Das'),
    [
      { code: 'VIP-AKBAR-01', name: 'Ayesha Rahman' },
      { code: 'FAM-02', name: 'Mr. and Mrs. Das' }
    ]
  );
});

test('rejects a guest name without a saved invite code', () => {
  assert.throws(
    () => parseGuestLinkEntries('Kolkata\nHome'),
    /Line 1: enter an existing Supabase invite code and guest name/
  );
});

test('rejects empty or excessive guest lists', () => {
  assert.throws(() => parseGuestLinkEntries(' \n '), /Add guests from your dashboard first/);
  assert.throws(() => parseGuestLinkEntries(Array(101).fill('CODE | Guest').join('\n')), /up to 100/);
});

test('builds an encoded invitation URL with code and language', () => {
  assert.equal(
    buildGuestInvitationUrl('https://example.test/guest-list.html?w=123', 'CODE & 1', 'bn'),
    'https://example.test/?code=CODE+%26+1&lang=bn'
  );
});
