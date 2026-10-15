import test from 'node:test';
import assert from 'node:assert/strict';
import { translateText } from '../i18n.js';

test('translates shared invitation labels into Bengali, Hindi, and Urdu', () => {
  assert.equal(translateText('Wedding Invitation', 'bn'), 'বিবাহের আমন্ত্রণ');
  assert.equal(translateText('Open Invitation', 'hi'), 'निमंत्रण खोलें');
  assert.equal(translateText('RSVP', 'ur'), 'اپنی شرکت کی اطلاع دیں');
  assert.equal(translateText('Not sure yet', 'bn'), 'এখনও নিশ্চিত নই');
  assert.equal(translateText('Sending...', 'hi'), 'भेजा जा रहा है...');
  assert.equal(translateText('RSVP sent', 'ur'), 'جواب بھیج دیا گیا');
});

test('localizes invitation guest count and dates while leaving names untouched', () => {
  assert.equal(translateText('Invitation for 4 guests', 'bn'), '৪ জনের আমন্ত্রণ');
  assert.equal(translateText('2027-02-14', 'hi'), '14 फ़रवरी 2027');
  assert.equal(translateText('SUNDAY, FEBRUARY 14, 2027', 'bn'), 'রবিবার, ১৪ ফেব্রুয়ারি, ২০২৭');
  assert.equal(translateText('Nadia Rahman', 'ur'), 'Nadia Rahman');
});

test('unsupported language values preserve the original copy', () => {
  assert.equal(translateText('Wedding Invitation', 'fr'), 'Wedding Invitation');
});

test('localizes decorated countdown and abbreviated event dates', () => {
  assert.equal(translateText('✦ The auspicious moment arrives in ✦', 'bn'), '✦ শুভক্ষণ আসতে বাকি ✦');
  assert.equal(translateText('FEB', 'bn'), 'ফেব্রুয়ারি');
  assert.equal(translateText('15', 'bn'), '১৫');
});

test('translates template-specific Bengali wedding copy into Urdu', () => {
  assert.equal(translateText('Shubho Bibaho', 'ur'), 'شادی مبارک');
  assert.match(translateText('With the blessings of the Almighty and our elders, we joyfully invite you to bless the newly-weds with your presence.', 'ur'), /اللہ کے فضل/);
});

test('localizes dates already formatted in Bengali or Hindi', () => {
  assert.equal(translateText('रविवार, 14 फ़रवरी 2027', 'ur'), 'اتوار، 14 فروری، 2027');
  assert.equal(translateText('রবিবার, ১৪ ফেব্রুয়ারি, ২০২৭', 'hi'), 'रविवार, 14 फ़रवरी 2027');
});
