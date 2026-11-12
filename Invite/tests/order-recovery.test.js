import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone10,
  maskOrderCouple,
  OrderSecurityShield,
  matchOrderCredentials
} from '../onboarding-core.js';

class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test('normalizePhone10 extracts clean 10 digits from various Indian phone formats', () => {
  assert.equal(normalizePhone10('+91 94779 29927'), '9477929927');
  assert.equal(normalizePhone10('09477929927'), '9477929927');
  assert.equal(normalizePhone10('+919876543210'), '9876543210');
  assert.equal(normalizePhone10('9876543210'), '9876543210');
  assert.equal(normalizePhone10('98-765-43210'), '9876543210');
  assert.equal(normalizePhone10('12345'), ''); // Too short
  assert.equal(normalizePhone10(''), '');
  assert.equal(normalizePhone10(null), '');
});

test('maskOrderCouple obscures couple names for zero-leak privacy', () => {
  assert.equal(maskOrderCouple('Priya', 'Rohan'), 'P****a & R****n');
  assert.equal(maskOrderCouple('Al', 'Bo'), 'A* & B*');
  assert.equal(maskOrderCouple('', ''), '*** & ***');
});

test('matchOrderCredentials strictly enforces dual-factor reference and phone correlation', () => {
  const sampleOrder = {
    order_reference: 'ORD-20261112-ABCD',
    phone: '+919477929927',
    wedding: {
      couple_name: 'Priya & Rohan'
    }
  };

  // Valid exact match
  assert.equal(matchOrderCredentials(sampleOrder, 'ORD-20261112-ABCD', '9477929927'), true);
  assert.equal(matchOrderCredentials(sampleOrder, 'ord-20261112-abcd', '+91 94779 29927'), true); // case-insensitive

  // Order with .reference and guests array phone
  const guestOrder = {
    reference: 'ORD-A1E64E20',
    guests: [
      { guest_name: 'Software Tester', phone: '9876543210' }
    ]
  };
  assert.equal(matchOrderCredentials(guestOrder, 'ORD-A1E64E20', '9876543210'), true);
  assert.equal(matchOrderCredentials(guestOrder, 'ord-a1e64e20', '+91 98765 43210'), true);
  assert.equal(matchOrderCredentials(guestOrder, 'ORD-A1E64E20', '9123456780'), false);

  // Reference mismatch
  assert.equal(matchOrderCredentials(sampleOrder, 'ORD-WRONG-REF', '9477929927'), false);

  // Phone mismatch (attacker knows reference but not phone)
  assert.equal(matchOrderCredentials(sampleOrder, 'ORD-20261112-ABCD', '9888888888'), false);

  // Missing values
  assert.equal(matchOrderCredentials(sampleOrder, '', '9477929927'), false);
  assert.equal(matchOrderCredentials(sampleOrder, 'ORD-20261112-ABCD', ''), false);
  assert.equal(matchOrderCredentials(null, 'ORD-20261112-ABCD', '9477929927'), false);
});

test('OrderSecurityShield enforces rate limiting and 4-attempt lockout against brute-force attacks', () => {
  const mockStorage = new MockStorage();

  // Initially unlocked
  assert.equal(OrderSecurityShield.checkIsLocked(mockStorage).isLocked, false);
  assert.equal(OrderSecurityShield.isLocked(mockStorage), false);
  assert.equal(OrderSecurityShield.MAX_ATTEMPTS, 4);

  // 1st failed attempt
  let status = OrderSecurityShield.recordFailure(mockStorage);
  assert.equal(status.isLocked, false);
  assert.equal(status.attemptsRemaining, 3);
  assert.equal(OrderSecurityShield.isLocked(mockStorage), false);

  // 2nd failed attempt
  status = OrderSecurityShield.recordFailure(mockStorage);
  assert.equal(status.isLocked, false);
  assert.equal(status.attemptsRemaining, 2);

  // 3rd failed attempt
  status = OrderSecurityShield.recordFailure(mockStorage);
  assert.equal(status.isLocked, false);
  assert.equal(status.attemptsRemaining, 1);

  // 4th failed attempt: LOCKOUT TRIGGERED!
  status = OrderSecurityShield.recordFailure(mockStorage);
  assert.equal(status.isLocked, true);
  assert.equal(status.attemptsRemaining, 0);

  // Next check confirms lockout is active
  const check = OrderSecurityShield.checkIsLocked(mockStorage);
  assert.equal(check.isLocked, true);
  assert.equal(OrderSecurityShield.isLocked(mockStorage), true);
  assert.ok(check.remainingMins > 0);

  // Success resets the shield
  OrderSecurityShield.recordSuccess(mockStorage);
  assert.equal(OrderSecurityShield.checkIsLocked(mockStorage).isLocked, false);
  assert.equal(OrderSecurityShield.isLocked(mockStorage), false);
});
