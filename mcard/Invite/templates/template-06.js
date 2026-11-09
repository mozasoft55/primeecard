/* ==========================================================================
   SHUBHO BIBAHO — Royal Bengali Hindu Watercolor Heritage (Template 06)
   Authentic 2000IQ Reframe based on Royal Bengali Invitation Card Art:
   - Centerpiece Royal Bengali Wedding Card (Exact high-DPI parchment card art)
   - Arch canopy, hanging jasmine/wisteria garlands, serene lake & Rajbari backdrop
   - Bengali Bride in Red Banarasi silk & Mukut + Groom in Topor & Dhoti-Kurta
   - Auspicious invocation: "|| শ্রী শ্রী প্রজাপতয়ে নমঃ ||"
   - Auspicious Lagna ("শুভ লগ্ন"), Bengali numerals translation ("০-৯"), and dates
   - Complete ritual timeline (Gaye Holud, Mehendi, Aashirbaad, Shubho Bibaho, Boubhat)
     with authentic fallback photography for each ritual
   - Entry Gate with Royal Sindoor Bindi Seal & Marigold/Alta petal celebration
   - Live Countdown Timer (Days, Hours, Min, Sec) & Interactive Calendar grid
   - Google Maps Directions & Google Calendar Sync
   - Interactive WhatsApp RSVP generator with guest counter & function selection
   - Bilingual support: Instant toggle between English and বাংলা
   - Shehnai / Music audio player toggle
   ========================================================================== */

/* ---------- Helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
const clean = v => String(v ?? '').trim();
const safeUrl = u => (/^https?:\/\//i.test(clean(u)) ? esc(clean(u)) : '');
const safeImg = u => {
  const s = clean(u);
  if (!s) return '';
  if (/^https?:\/\/[^\s'"<>]+$/i.test(s)) return s;
  if (/^blob:[^\s'"<>]+$/i.test(s)) return s;
  if (/^\.?\/?assets\/[^\s'"<>]+$/i.test(s)) return s;
  if (/^[a-z0-9_-]+\.(jpg|jpeg|png|webp|svg)$/i.test(s)) return `./assets/${s}`;
  if (s.startsWith('data:image/') && s.includes(';base64,')) {
    if (!/[\s'"<>]/.test(s.slice(0, 50))) return s;
  }
  return '';
};
const getStoredPhoto = k => {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    if (typeof sessionStorage !== 'undefined' && typeof sessionStorage.getItem === 'function') {
      const v = sessionStorage.getItem(k);
      if (v) return v;
    }
  } catch { return ''; }
  return '';
};
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORD = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const ORD_BN = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম'];
const BN_DIG = '০১২৩৪৫৬৭৮৯';
const toBn = s => String(s).replace(/\d/g, d => BN_DIG[d]);
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Galada&family=Hind+Siliguri:wght@300;400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap';

function dparts(v) {
  const raw = clean(v);
  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/), y, mo, d;
  if (m) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = raw.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{4})$/))) {
    mo = MONTHS.findIndex(n => n.slice(0, 3).toLowerCase() === m[2].slice(0, 3).toLowerCase()) + 1;
    [y, d] = [+m[3], +m[1]];
  } else if ((m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/))) {
    [y, mo, d] = [+m[3], +m[2], +m[1]];
  } else return null;
  if (!mo) return null;
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? { y, mo, d } : null;
}
const weekday = p => new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay();

function timeParts(v) {
  const raw = clean(v);
  if (!raw) return null;
  if (/T/.test(raw)) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const s = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
      const [h, mi] = s.split(':').map(Number);
      return { h, mi };
    }
  }
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([AaPp][Mm])?$/);
  if (!m) return null;
  let h = +m[1];
  const mi = +(m[2] || 0), mer = m[3] ? m[3].toUpperCase() : '';
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h > 23 || mi > 59 ? null : { h, mi };
}
const timeEn = v => {
  const t = timeParts(v);
  if (!t) return clean(v);
  return `${t.h % 12 || 12}:${pad(t.mi)} ${t.h >= 12 ? 'PM' : 'AM'}`;
};
const timeBn = v => {
  const t = timeParts(v);
  if (!t) return clean(v);
  const h = t.h, per = h >= 4 && h < 6 ? 'ভোর' : h >= 6 && h < 12 ? 'সকাল' : h >= 12 && h < 15 ? 'দুপুর' : h >= 15 && h < 17 ? 'বিকেল' : h >= 17 && h < 20 ? 'সন্ধ্যা' : 'রাত';
  const h12 = h % 12 || 12;
  return t.mi ? `${per} ${toBn(h12)}:${toBn(pad(t.mi))}` : `${per} ${toBn(h12)}টা`;
};

function parseWhen(dv, tv, offset = '+05:30') {
  const d = dparts(dv);
  if (!d) return null;
  const rt = clean(tv);
  const t = rt.match(/^(\d{1,2})(?::([0-5]\d))?(?::[0-5]\d)?\s*([AaPp][Mm])?$/);
  if (rt && !t) return null;
  let h = t ? +t[1] : 0;
  const mi = t ? +(t[2] || 0) : 0;
  const mer = t && t[3] ? t[3].toUpperCase() : '';
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  if (h > 23) return null;
  const ts = Date.parse(`${d.y}-${pad(d.mo)}-${pad(d.d)}T${pad(h)}:${pad(mi)}:00${offset}`);
  return Number.isNaN(ts) ? null : ts;
}

/* ---------- Bilingual Text ---------- */
const L = (en, bn) => `<span data-l="en">${esc(en)}</span><span data-l="bn">${esc(bn || en)}</span>`;
const LH = (en, bn) => `<span data-l="en">${en}</span><span data-l="bn">${bn || en}</span>`;
const TXT = {
  kicker: ['A CELEBRATION OF LOVE', 'ভালোবাসার উৎসব'],
  dear: ['Dear', 'শ্রদ্ধেয়'],
  open: ['Open', 'খুলুন'],
  tapOpen: ['Tap to open the invitation', 'আমন্ত্রণপত্র খুলতে ছুঁয়ে দিন'],
  title: ['Shubho Bibaho', 'শুভ বিবাহ'],
  weddingOf: ['The wedding celebration of', 'শুভ বিবাহে'],
  together: ['Together with their families', 'উভয় পরিবারের পক্ষ থেকে'],
  inviteDef: ['Request the pleasure of your company as they begin their sacred journey together.', 'দুই পরিবারের ভালোবাসা ও আশীর্বাদে আমাদের বিবাহ অনুষ্ঠানে আপনি সাদর আমন্ত্রিত।'],
  invocDef: ['|| Shree Shree Prajapataye Namah ||', '|| শ্রী শ্রী প্রজাপতয়ে নমঃ ||'],
  invited: ['Invited', 'আমন্ত্রিত'],
  begin: ['View Invitation', 'আমন্ত্রণপত্র দেখুন'],
  scrollDown: ['Scroll down', 'নিচে স্ক্রল করুন'],
  daysToGo: ['days to go', 'দিন বাকি'],
  today: ['Today is the auspicious day ✦', 'আজই সেই শুভদিন ✦'],
  bibaho: ['Shubho Bibaho', 'শুভ বিবাহ'],
  bless1: ['With the love and blessings of both families,', 'দুই পরিবারের ভালোবাসা ও আশীর্বাদে'],
  bless2: ['we cordially invite you to our wedding celebration', 'আমাদের বিবাহ অনুষ্ঠানে আপনি সাদর আমন্ত্রিত'],
  lagna: ['Auspicious Lagna', 'শুভ লগ্ন'],
  presence: ['Your gracious presence will make our celebration complete', 'আপনার উপস্থিতি আমাদের আনন্দ পূর্ণ করবে'],
  contact: ['Contact', 'যোগাযোগ'],
  storyEy: ['A little bit of forever', 'চিরকালের গল্প'],
  storyH: ['Our Journey', 'আমাদের গল্প'],
  storySub: ['Every love story is sacred. Ours is a collection of cherished moments that brought us together.', 'প্রতিটি ভালোবাসার গল্পই পবিত্র। আমাদের গল্প ছোট ছোট মুহূর্তের মালা, যা আমাদের এখানে এনেছে।'],
  poemDef: ['Two souls united by destiny, blessed with eternal love, walking seven sacred steps toward a lifetime of happiness.', 'দুটি মন, একটি পবিত্র বন্ধন, সাতপাকের অঙ্গীকার আর আজীবনের ভালোবাসা। প্রতিটি আগামীকাল হোক আনন্দময়।'],
  dateEy: ['Mark your calendar', 'দিনটি মনে রাখুন'],
  dateH: ['Save the Date', 'শুভদিন ও শুভলগ্ন'],
  days: ['Days', 'দিন'], hrs: ['Hours', 'ঘণ্টা'], min: ['Min', 'মিনিট'], sec: ['Sec', 'সেকেন্ড'],
  addCal: ['Save to Google Calendar', 'গুগল ক্যালেন্ডারে সেভ করুন'],
  began: ['The celebration has begun ✦', 'উৎসব শুরু হয়েছে ✦'],
  evEy: ['The festivities', 'উৎসবের আয়োজন'],
  evH: ['Rituals & Celebrations', 'অনুষ্ঠানসূচি ও মাঙ্গলিক পর্ব'],
  evSub: ['Sacred rituals, heartfelt laughter, music and eternal memories. We would be delighted to have you with us.', 'ঐতিহ্যবাহী আচার, আনন্দ, সুর আর স্মৃতি — আপনার শুভ উপস্থিতি আমাদের আনন্দ দ্বিগুণ করবে।'],
  day: ['Day', 'দিন'],
  dress: ['Dress code', 'পোশাকবিধি'],
  momEy: ['Glimpses of us', 'আমাদের মুহূর্ত'],
  momH: ['Moments of Love', 'স্মৃতির অ্যালবাম'],
  venEy: ['Join us', 'আমাদের সঙ্গে থাকুন'],
  venH: ['The Destination', 'অনুষ্ঠানস্থল'],
  venSub: ['A serene setting for a celebration close to our hearts.', 'আমাদের হৃদয়ের কাছের এক উৎসবের সুন্দর আয়োজন।'],
  venTag: ['The wedding destination', 'বিয়ের ঠিকানা'],
  directions: ['Get directions', 'পথ নির্দেশ'],
  calendar: ['Calendar', 'ক্যালেন্ডার'],
  rsvpEy: ['Your presence is our present', 'আপনার উপস্থিতিই আমাদের উপহার'],
  rsvpH: ['Kindly RSVP', 'আপনার উত্তর জানান'],
  yourName: ['Your name', 'আপনার নাম'],
  yes: ["Yes, we'll be there", 'হ্যাঁ, আমরা আসছি'],
  no: ["Sorry, can't make it", 'দুঃখিত, আসতে পারছি না'],
  howMany: ['How many of you?', 'আপনারা কতজন?'],
  people: ['people', 'জন'],
  which: ['Which functions?', 'কোন কোন অনুষ্ঠানে থাকবেন?'],
  note: ['A note for the couple & family (optional)', 'বর-কনে ও পরিবারের জন্য বার্তা (ঐচ্ছিক)'],
  send: ['Send RSVP on WhatsApp', 'হোয়াটসঅ্যাপে উত্তর পাঠান'],
  cap: ['WhatsApp opens with your reply filled in. Just press send.', 'আপনার উত্তর লেখা অবস্থায় হোয়াটসঅ্যাপ খুলবে। শুধু সেন্ড চাপুন।'],
  endEy: ['Forever begins', 'নতুন জীবনের শুরু'],
  endBless: ['With love & blessings', 'ভালোবাসা ও আশীর্বাদসহ'],
  s1: ['How We Met', 'প্রথম শুভদৃষ্টি'],
  s1t: ['One unexpected hello became a thousand conversations, shared dreams, and a friendship that felt like home.', 'একটি অপ্রত্যাশিত শুভদৃষ্টি থেকে শুরু হলো হাজার কথার গল্প, আর এক ভালোবাসা যা ঘরের মতোই আপন।'],
  s2: ['The Promise', 'প্রতিশ্রুতি'],
  s2t: ['With happy tears and hearts full of hope, we chose each other — and all the beautiful tomorrows still to come.', 'আনন্দাশ্রু আর আশায় ভরা মন নিয়ে আমরা একে অপরকে বেছে নিলাম — সাত জন্মের সঙ্গী হওয়ার শুভ আশায়।'],
  s3: ['The Big Day', 'শুভ বিবাহ'],
  s3t: ['Now, surrounded by the people we love, we cannot wait to celebrate the beginning of our forever with you.', 'আজ আমাদের প্রিয়জনদের আশীর্বাদ মাথায় নিয়ে শুরু হচ্ছে আমাদের সাতপাকের যাত্রা — আপনাদেরও পাশে চাই।'],
  guestSal: ['Cordially Invited', 'সাদর আমন্ত্রণ'],
  withFam: ['With Family', 'পরিবার সহ'],
  guestCount: ['Guest(s)', 'জন অতিথি'],
  countdownHead: ['Auspicious Countdown', 'মাঙ্গলিক ক্ষণগণনা'],
  untilLagna: ['Until the Auspicious Lagna', 'শুভ লগ্নের আর বাকি'],
  viewCard: ['View Wedding Card', 'আমন্ত্রণপত্র দেখুন'],
  scratchHint: ['✦ Scratch with your finger to reveal our secret blessing ✦', '✦ আশীর্বাদ ও বিশেষ বার্তাটি দেখতে ঘষুন বা ছুঁয়ে দিন ✦'],
  revEy: ['A surprise for you', 'আপনার জন্য চমক'],
  revH: ['Special Message', 'বিশেষ বার্তা'],
  revTap: ['✦ Tap to reveal ✦', '✦ দেখতে ছুঁয়ে দিন ✦'],
  revMsg: ['We are truly blessed to have you in our lives. Your love and blessings mean the world to us as we take our seven sacred steps together. See you at the celebration!', 'আমাদের জীবনে আপনাদের উপস্থিতি সত্যিই পরম আশীর্বাদ। সাতপাকের এই পবিত্র যাত্রায় আপনাদের আন্তরিক আশীর্বাদ ও উপস্থিতি আমাদের সবচেয়ে বড় উপহার। অনুষ্ঠানে দেখা হচ্ছে!'],
  revSign: ['With all our love & reverence', 'আন্তরিক ভালোবাসা ও শ্রদ্ধায়']
};
const t = k => L(TXT[k][0], TXT[k][1]);

/* ---------- Themes ---------- */
const hex6 = v => {
  const m = clean(v).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  return '#' + (m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]).toLowerCase();
};
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hexOf = a => '#' + a.map(c => pad(clamp(Math.round(c), 0, 255).toString(16))).join('');
const mixc = (h1, h2, k) => { const a = rgbOf(h1), b = rgbOf(h2); return hexOf(a.map((c, i) => c + (b[i] - c) * k)); };
const THEMES = {
  maroon: { p: '#8e1a34', a: '#b5121b', paper: '#fbf5eb', cream: '#f7eed8', gold: '#c99738' },
  royal: { p: '#8e1a34', a: '#b5121b', paper: '#fbf5eb', cream: '#f7eed8', gold: '#c99738' },
  emerald: { p: '#0f543e', a: '#187858', paper: '#f7fbf6', cream: '#eaf4e6', gold: '#d4af37' },
  navy: { p: '#1b2f5e', a: '#244585', paper: '#f9faff', cream: '#e7ecf7', gold: '#dfb85f' },
  rose: { p: '#9c2f55', a: '#c43e6e', paper: '#fff6f8', cream: '#f8e4ea', gold: '#d4a24c' },
  sindoor: { p: '#a11d21', a: '#c8231f', paper: '#fdf3ec', cream: '#f8ecd4', gold: '#d4a23b' },
  haldi: { p: '#9a5b0b', a: '#b5121b', paper: '#fef8e7', cream: '#faf0d2', gold: '#e0a82e' },
  peacock: { p: '#0f5f6b', a: '#8e1a34', paper: '#eef5f3', cream: '#f3f0e0', gold: '#c99738' }
};
function themeVars(w) {
  const th = THEMES[clean(w.theme || w.theme_name).toLowerCase()] || THEMES.maroon;
  const p = hex6(w.primary_color) || th.p, a = hex6(w.accent_color) || th.a, paper = hex6(w.paper_color) || th.paper, cream = th.cream, gold = th.gold;
  const dark = mixc(p, '#000000', .3), ink = mixc(p, '#000000', .68), soft = mixc(p, '#ffffff', .88), mid = mixc(mixc(p, '#ffffff', .6), '#b4a5a7', .35);
  return `--p:${p};--p-dark:${dark};--p-soft:${soft};--p-mid:${mid};--p-rgb:${rgbOf(p).join(',')};--a:${a};--paper:${paper};--cream:${cream};--gold:${gold};--ink:${ink};--ink-rgb:${rgbOf(ink).join(',')}`;
}

/* ---------- Content & Icon Helpers ---------- */
const KINDS = [
  { re: /gaye\s*holud/i, icon: 'flower', asset: 'template-06-gaye-holud.jpg', dress: { en: 'Yellow & Marigold', bn: 'হলুদ ও গাঁদা রঙ' }, c: '#f4c542' },
  { re: /biye|shubho\s*bibaho/i, icon: 'kalash', asset: 'template-06-shubho-bibaho.jpg', dress: { en: 'Red, White & Gold', bn: 'লাল, সাদা ও সোনালি' }, c: '#b5121b' },
  { re: /bou\s*bhat|boubhat|bhaat/i, icon: 'feast', asset: 'template-06-boubhat.jpg', dress: { en: 'Banarasi & Dhuti Elegance', bn: 'বেনারসি ও ধুতি' }, c: '#8e2a45' },
  { re: /ashirbad|aashirbad/i, icon: 'garland', asset: 'template-06-ashirbad.jpg', dress: { en: 'Traditional Silk', bn: 'ঐতিহ্যবাহী রেশম' }, c: '#d8b56e' },
  { re: /haldi|ubtan|pithi/i, icon: 'flower', asset: 'template-06-haldi.jpg', dress: { en: 'Yellow & Marigold', bn: 'হলুদ ও গাঁদা রঙ' }, c: '#f4c542' },
  { re: /phere|saat\s*paak|sampradan|sindoor|vivah|wedding|ceremony|kanyadan/i, icon: 'kalash', asset: 'template-06-phere.jpg', dress: { en: 'Red, White & Gold', bn: 'লাল, সাদা ও সোনালি' }, c: '#b5121b' },
  { re: /reception|dinner|bhoj|feast/i, icon: 'feast', asset: 'template-06-reception.jpg', dress: { en: 'Banarasi & Formal Elegance', bn: 'জমকালো আনুষ্ঠানিক পোশাক' }, c: '#8e2a45' },
  { re: /mehendi|mehndi|henna/i, icon: 'leaf', asset: 'template-06-mehendi.jpg', dress: { en: 'Green & Pastels', bn: 'সবুজ ও হালকা রঙ' }, c: '#3f8f3a' },
  { re: /sangeet|cocktail|music|dhak|dandiya|garba/i, icon: 'music', asset: 'template-06-sangeet.jpg', dress: { en: 'Festive & Colourful', bn: 'উৎসবের রঙিন পোশাক' }, c: '#7a2a6a' },
  { re: /milaad|milad|nikah/i, icon: 'lamp', asset: 'template-06-milad-sharif.jpg', dress: { en: 'Traditional Islamic', bn: 'ঐতিহ্যবাহী পোশাক' }, c: '#2e7d32' },
  { re: /walima/i, icon: 'feast', asset: 'template-06-boubhat.jpg', dress: { en: 'Royal Reception', bn: 'ওয়ালিমা উৎসব' }, c: '#8e2a45' },
  { re: /baraat|bor\s*boron|boron/i, icon: 'lamp', asset: 'template-06-baraat.jpg', dress: { en: 'Royal Festive', bn: 'রাজকীয় উৎসব' }, c: '#c8281e' },
  { re: /jaimala|varmala|mala\s*badal/i, icon: 'garland', asset: 'template-06-jaimala.jpg', dress: { en: 'Traditional', bn: 'ঐতিহ্যবাহী' }, c: '#d8b56e' },
  { re: /anand\s*karaj/i, icon: 'kalash', asset: 'template-06-phere.jpg', dress: { en: 'Traditional Sikh', bn: 'ঐতিহ্যবাহী আনন্দ কারজ' }, c: '#b5121b' },
  { re: /aiburo|aibhat|puja|pujo|shanti|ganesh|nandimukh|vrata/i, icon: 'lamp', asset: 'template-06-card-art.jpg', dress: { en: 'Traditional', bn: 'ঐতিহ্যবাহী' }, c: '#e9d9a6' }
];
const DEFAULT_KIND = { icon: 'flower', asset: 'template-06-phere.jpg', dress: null, c: '#d9b8a8' };
const kindOf = name => KINDS.find(k => k.re.test(name)) || DEFAULT_KIND;
const ICONS = {
  flower: '<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="5.6" r="2.8"/><circle cx="12" cy="18.4" r="2.8"/><circle cx="5.6" cy="12" r="2.8"/><circle cx="18.4" cy="12" r="2.8"/>',
  leaf: '<path d="M5 19C5 10 11 5 20 5C20 14 15 19 5 19Z"/><path d="M5 19L14 10"/>',
  music: '<ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8V16C4 17.7 7.6 19 12 19S20 17.7 20 16V8"/><path d="M4 12.5C8 14 16 14 20 12.5" stroke-dasharray="2 2"/>',
  lamp: '<path d="M3 14C3 18 7 20 12 20S21 18 21 14Z"/><path d="M12 4C9 7.4 9 10.6 12 12C15 10.6 15 7.4 12 4Z"/>',
  garland: '<path d="M3.5 5C3.5 16 20.5 16 20.5 5"/><circle cx="12" cy="17.2" r="2"/><circle cx="7" cy="13" r="1.5"/><circle cx="17" cy="13" r="1.5"/>',
  kalash: '<path d="M8 9H16C18 12 18 17 15 21H9C6 17 6 12 8 9Z"/><path d="M9 9V7H15V9"/><path d="M12 2.5L9 7M12 2.5L15 7M12 2.5V7"/>',
  feast: '<circle cx="12" cy="14" r="6.5"/><path d="M12 7.5V3M8.2 5L9.2 8M15.8 5L14.8 8"/>'
};
const icon = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

const DEFAULT_STORY = [
  { k: 's1', image: '' }, { k: 's2', image: '' }, { k: 's3', image: '' }
];
function readStory(raw) {
  let a = raw;
  if (typeof a === 'string') { try { a = JSON.parse(a); } catch { a = null; } }
  return DEFAULT_STORY.map((d, i) => {
    const s = Array.isArray(a) ? a[i] : null;
    return {
      title: L(clean(s?.title) || TXT[d.k][0], clean(s?.title) || TXT[d.k][1]),
      text: L(clean(s?.text) || TXT[d.k + 't'][0], clean(s?.text) || TXT[d.k + 't'][1]),
      altTitle: clean(s?.title) || TXT[d.k][0],
      image: safeImg(s?.image)
    };
  });
}
function readGallery(raw) {
  let a = raw;
  if (typeof a === 'string') { try { a = JSON.parse(a); } catch { a = lines(a); } }
  if (!Array.isArray(a)) return [];
  return a.map(x => safeImg(typeof x === 'string' ? x : (x?.image || x?.url))).filter(Boolean).slice(0, 9);
}

/* ---------- Scaled Vector Frieze & Garlands ---------- */
const jasPetals = [0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-5.2" rx="2.7" ry="5.2" transform="rotate(${r})"/>`).join('');
const spokes = [0, 45, 90, 135].map(a => `<path d="M-26 0H26" stroke="#8a5a12" stroke-width="2.4" transform="rotate(${a})"/>`).join('');

const man = (x, s = 1, o = {}) => `<g transform="translate(${x} ${o.y ?? 172}) scale(${s * (o.flip ? -1 : 1)} ${s})">
<ellipse cx="0" cy="-94" rx="13" ry="6.5" fill="${o.turban || '#d6322a'}"/><path d="M-9-96C-8-110 8-110 9-96Z" fill="${o.turban || '#c8281e'}"/>
<circle cx="0" cy="-84" r="9.5" fill="#e6a56d"/><path d="M-5-85h2.4M2.6-85H5" stroke="#2b1a17" stroke-width="1.4" stroke-linecap="round"/><path d="M-4-80Q0-78 4-80" stroke="#2b1a17" stroke-width="1.2" fill="none"/>
<path d="M-13-73L13-73L17-30L-17-30Z" fill="${o.shirt || '#f08a3c'}"/><path d="M-13-73L-8-30M13-73L8-30" stroke="#c96a22" stroke-width="1.4"/>
${o.torso ? '' : '<path d="M-17-34H17L21 0H-21Z" fill="#fdf8ec"/><path d="M-21-5H21" stroke="#c8281e" stroke-width="3"/><path d="M-15 0h11v-4h-11zM4 0h11v-4H4z" fill="#e6a56d"/>'}
${o.prop || ''}</g>`;
const SPEAR = '<path d="M21-6V-128" stroke="#6b3a1e" stroke-width="3"/><path d="M21-128l-5 13h10z" fill="#bfc3c8"/><path d="M13-62L21-60" stroke="#e6a56d" stroke-width="5" stroke-linecap="round"/>';
const STICK = '<path d="M20 0L24-104" stroke="#6b3a1e" stroke-width="3.5"/><path d="M13-62L22-60" stroke="#e6a56d" stroke-width="5" stroke-linecap="round"/>';
const HORN = '<path d="M7-84L56-100Q66-102 70-92L60-82Q52-84 7-80Z" fill="#e8b02a" stroke="#a97a12" stroke-width="1.2"/><path d="M12-62L-4-78" stroke="#e6a56d" stroke-width="5" stroke-linecap="round"/>';
const horse = (x, s = 1) => `<g transform="translate(${x} 172) scale(${s})">
<path d="M6-56C-12-52-14-30-8-14" stroke="#b01f18" stroke-width="7" fill="none" stroke-linecap="round"/>
<rect x="16" y="-34" width="9" height="34" rx="3" fill="#c8281e"/><rect x="30" y="-34" width="9" height="34" rx="3" fill="#a81b14"/><rect x="70" y="-34" width="9" height="34" rx="3" fill="#c8281e"/><rect x="84" y="-34" width="9" height="34" rx="3" fill="#a81b14"/>
<path d="M16 0h9v-5h-9zM30 0h9v-5h-9zM70 0h9v-5h-9zM84 0h9v-5h-9z" fill="#3a1a10"/>
<ellipse cx="55" cy="-50" rx="46" ry="23" fill="#d32f22"/><path d="M84-62L106-98L120-93L104-52Z" fill="#d32f22"/><path d="M100-98L108-111L114-96Z" fill="#a81b14"/>
<ellipse cx="122" cy="-91" rx="14" ry="8" transform="rotate(28 122 -91)" fill="#d32f22"/><circle cx="124" cy="-95" r="1.7" fill="#1a0f0a"/>
<path d="M86-62C94-78 100-86 104-98" stroke="#7d140f" stroke-width="5" fill="none"/>
<rect x="40" y="-67" width="40" height="22" rx="4" fill="#f6c342"/><path d="M40-56H80" stroke="#c8281e" stroke-width="3"/><path d="M44-48h32" stroke="#c8281e" stroke-width="1.5" stroke-dasharray="3 3"/>
<path d="M88-70L112-97M98-58L121-87" stroke="#fff" stroke-width="2" opacity=".85"/></g>`;
const cart = (x, s = 1, inner = '') => `<g transform="translate(${x} 172) scale(${s})">
<path d="M-26-44H4" stroke="#7a4a22" stroke-width="5"/><rect x="0" y="-52" width="116" height="9" rx="2" fill="#a8621f"/>${inner}
${[28, 92].map(cx => `<g transform="translate(${cx} -26)"><circle r="26" fill="#e8b02a" stroke="#8a5a12" stroke-width="4"/><circle r="5" fill="#8a5a12"/>${spokes}</g>`).join('')}</g>`;
const DOLI = '<rect x="12" y="-100" width="84" height="48" rx="3" fill="#c8281e"/><path d="M10-100Q54-128 98-100Z" fill="#a81b14"/><path d="M26-52V-88Q54-104 82-88V-52Z" fill="#6e0f12"/><circle cx="54" cy="-74" r="8" fill="#e6a56d"/><path d="M42-62Q54-52 66-62V-52H42Z" fill="#e0452a"/><path d="M45-80Q54-94 63-80Z" fill="#c8281e"/><path d="M10-100H98" stroke="#e8b02a" stroke-width="3"/><circle cx="54" cy="-116" r="3" fill="#e8b02a"/>';
const elephant = (x, s = 1) => `<g transform="translate(${x} 172) scale(${s})">
<rect x="22" y="-52" width="26" height="52" rx="8" fill="#7e4527"/><rect x="60" y="-52" width="26" height="52" rx="8" fill="#6d3b20"/><rect x="116" y="-52" width="26" height="52" rx="8" fill="#7e4527"/><rect x="150" y="-52" width="26" height="52" rx="8" fill="#6d3b20"/>
<path d="M26 0h18M64 0h18M120 0h18M154 0h18" stroke="#f1e6cf" stroke-width="3" stroke-linecap="round"/>
<rect x="8" y="-124" width="160" height="88" rx="42" fill="#8f4f2c"/><circle cx="178" cy="-98" r="34" fill="#8f4f2c"/>
<path d="M198-84C216-70 216-30 200-12C193-5 184-10 191-19C202-35 200-62 188-72Z" fill="#8f4f2c"/>
<ellipse cx="152" cy="-92" rx="16" ry="26" fill="#7e4527"/><path d="M188-66C200-60 208-64 212-72" stroke="#f6efdc" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="188" cy="-108" r="2.4" fill="#1a0f0a"/>
<path d="M20-124Q88-152 156-124L150-68Q88-84 26-68Z" fill="#c8281e"/><path d="M20-124Q88-152 156-124" stroke="#e8b02a" stroke-width="5" fill="none"/><path d="M30-78Q88-92 146-78" stroke="#e8b02a" stroke-width="3" stroke-dasharray="4 5" fill="none"/>
<path d="M170-124Q178-138 188-124" stroke="#e8b02a" stroke-width="4" fill="none"/>
${man(0, .78, { torso: true, y: 0, prop: '' }).replace('translate(0 0)', 'translate(88 -118)')}</g>`;
const FRIEZE = `<g id="t9-fz">${horse(4, .95)}${cart(124, .95, DOLI)}${man(300, 1, { prop: SPEAR })}${elephant(340, .9)}${man(570, 1, { prop: STICK })}${man(624, 1, { prop: STICK, flip: true })}${horse(700, .95)}${cart(820, .95)}${man(890, .92, { y: 172 - 50 * .95, prop: HORN })}${man(1010, 1, { prop: SPEAR })}${man(1066, 1, { prop: STICK, flip: true })}
<g fill="#f08a1f" opacity=".9">${[[270, 168], [560, 170], [1130, 168], [1170, 160]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 0Q4-8 8 0Q4 6 0 0Z"/>`).join('')}</g></g>`;

const DEFS = `<svg class="t9-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<g id="t9-mg"><circle r="18" fill="#f6a31c"/><circle r="18" fill="none" stroke="#e8860e" stroke-width="3.4" stroke-dasharray="5.2 3.1"/><circle r="12.6" fill="#f2900f"/><circle r="12.6" fill="none" stroke="#d9720a" stroke-width="2.4" stroke-dasharray="3.8 2.5"/><circle r="6.6" fill="#d96b0b"/><circle r="2.6" fill="#f9c35a"/></g>
<g id="t9-lf"><path d="M0 0C6-9 17-10 24-4C17 5 6 7 0 0Z" fill="#4f9a36"/><path d="M1 0L21-3.5" stroke="#2f6f24" stroke-width=".9" fill="none"/></g>
<g id="t9-jas"><g fill="#fffdf6" stroke="#e3d9c0" stroke-width=".6">${jasPetals}</g><circle r="1.7" fill="#f0c94b"/></g>
<linearGradient id="t9-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8dc82"/><stop offset=".5" stop-color="#c79a35"/><stop offset="1" stop-color="#ecc962"/></linearGradient>
<linearGradient id="t9-sar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ea7a2c"/><stop offset=".55" stop-color="#d03a24"/><stop offset="1" stop-color="#b5121b"/></linearGradient>
<linearGradient id="t9-leafg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9bd66e"/><stop offset=".6" stop-color="#4f9a36"/><stop offset="1" stop-color="#2d7a2a"/></linearGradient>
${FRIEZE}</defs></svg>`;

function garland(len = 600, bell = true) {
  const end = bell ? len - 110 : len - 8;
  let s = `<line x1="35" y1="0" x2="35" y2="${end + 6}" stroke="#8a6a35" stroke-width="1.3"/>`;
  let y = 16, i = 0;
  while (y < end) {
    const dx = i % 2 ? 3 : -3;
    s += `<use href="#t9-mg" transform="translate(${35 + dx} ${y}) scale(.54)"/><use href="#t9-mg" transform="translate(${35 - dx} ${y + 11}) scale(.46)"/>`;
    s += `<use href="#t9-lf" transform="translate(35 ${y + 22}) rotate(-168) scale(.8)"/><use href="#t9-lf" transform="translate(35 ${y + 22}) rotate(-12) scale(.8)"/>`;
    y += 32; i++;
  }
  if (bell) {
    const by = end + 4;
    s += `<g transform="translate(35 ${by})"><g class="t9-bell"><path d="M-3 0h6v5h-6z" fill="#b8892f"/><path d="M-13 31Q-13 8 0 6Q13 8 13 31L17 36H-17Z" fill="url(#t9-gold)" stroke="#8a6320" stroke-width=".8"/><path d="M-11 23H11" stroke="#8a6320" stroke-width=".8"/><circle cx="0" cy="40" r="3.2" fill="#b8892f"/></g>
    <g class="t9-tas"><path d="M-9 38L-16 68M0 40V76M9 38L16 68" stroke="#8a6a35" stroke-width="1"/>
    <use href="#t9-mg" transform="translate(-16 72) scale(.38)"/><use href="#t9-mg" transform="translate(0 82) scale(.38)"/><use href="#t9-mg" transform="translate(16 72) scale(.38)"/>
    <use href="#t9-lf" transform="translate(-16 80) rotate(100) scale(.46)"/><use href="#t9-lf" transform="translate(16 80) rotate(80) scale(.46)"/></g></g>`;
  }
  return `<svg viewBox="0 0 70 ${len}" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">${s}</svg>`;
}

function banana(flip) {
  const leaves = [[-158, 1.0], [-128, 1.08], [-98, 1.02], [-66, 1.1], [-36, .96]].map(([a, sc]) => {
    const veins = [...Array(7)].map((_, i) => { const x = 22 + i * 17; return `<path d="M${x} -${1 + i * .6}L${x + 9} -${12 - i}M${x} ${1 + i * .6}L${x + 9} ${10 - i * .5}" stroke="rgba(255,255,255,.28)" stroke-width="1"/>`; }).join('');
    return `<g transform="translate(100 252) rotate(${a}) scale(${sc})"><path d="M0 0C24-24 90-34 160-14C118 18 44 28 0 0Z" fill="url(#t9-leafg)" stroke="#2d6f26" stroke-width="1.2"/><path d="M2 0C50-4 110-8 158-14" stroke="#d6f0b0" stroke-width="2.2" fill="none"/>${veins}<path d="M92-17L86-4M118-18L112-2" stroke="#fbe8de" stroke-width="2.2"/></g>`;
  }).join('');
  return `<svg viewBox="0 0 220 270" aria-hidden="true" focusable="false" style="${flip ? 'transform:scaleX(-1)' : ''}"><path d="M100 262Q98 240 104 214" stroke="#6b8f3a" stroke-width="7" fill="none" stroke-linecap="round"/>${leaves}</svg>`;
}

/* Authentic Bengali Alpona Divider */
const ALPONA = `<svg class="t9-alp" viewBox="0 0 340 40" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path class="t9-draw-path" pathLength="1" d="M170 8C160 16 160 28 170 34C180 28 180 16 170 8Z"/>
  <path class="t9-draw-path" pathLength="1" d="M170 34C156 32 148 24 150 14C160 15 168 22 170 34"/>
  <path class="t9-draw-path" pathLength="1" d="M170 34C184 32 192 24 190 14C180 15 172 22 170 34"/>
  <path class="t9-draw-path" pathLength="1" d="M142 24C126 24 118 14 104 16C92 18 88 28 78 26C70 24 70 18 62 18H12"/>
  <path class="t9-draw-path" pathLength="1" d="M198 24C214 24 222 14 236 16C248 18 252 28 262 26C270 24 270 18 278 18H328"/>
  <circle class="t9-draw-path" pathLength="1" cx="8" cy="18" r="2.5"/>
  <circle class="t9-draw-path" pathLength="1" cx="332" cy="18" r="2.5"/>
  <path class="t9-draw-path" pathLength="1" d="M112 16C110 9 116 5 122 7M228 16C230 9 224 5 218 7"/>
</g></svg>`;

/* Sacred Lotus Flourish Divider */
const LOTUS_CARD_SVG = `<svg class="t9-card-lotus" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M80 3C78 13 72 23 65 27C73 26 78 19 80 13C82 19 87 26 95 27C88 23 82 13 80 3Z" fill="#a81c24" stroke="#c9a24a" stroke-width="1.2"/>
  <path d="M80 7C75 15 68 23 58 26C67 24 74 19 77 14C78 19 82 24 80 7Z" fill="#881219" stroke="#c9a24a" stroke-width="1"/>
  <path d="M80 7C85 15 92 23 102 26C93 24 86 19 83 14C82 19 78 24 80 7Z" fill="#881219" stroke="#c9a24a" stroke-width="1"/>
  <path d="M58 25C47 23 34 26 18 32C32 29 45 29 57 27M102 25C113 23 126 26 142 32C128 29 115 29 103 27" stroke="#c9a24a" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="80" cy="29" r="2.5" fill="#c9a24a"/>
  <circle cx="68" cy="29" r="1.5" fill="#c9a24a"/>
  <circle cx="92" cy="29" r="1.5" fill="#c9a24a"/>
</svg>`;

/* Ornate Royal Wax Seal with 16 Gold Filigree Scallops & Beveled Ring */
const SEAL_PETALS = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map(deg => `
  <g transform="rotate(${deg} 60 60)">
    <circle cx="60" cy="12.5" r="5.6" fill="url(#t9-seal-gold)" stroke="#784c12" stroke-width="0.8"/>
    <circle cx="60" cy="6.6" r="2.2" fill="#fff2aa" stroke="#8a5a14" stroke-width="0.6"/>
  </g>`).join('');

const SEAL_SVG = `<svg class="t9-seal-svg" viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="t9-seal-wax" cx="36%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#e52d38"/>
      <stop offset="50%" stop-color="#b0141e"/>
      <stop offset="85%" stop-color="#7a0a12"/>
      <stop offset="100%" stop-color="#4d040a"/>
    </radialGradient>
    <linearGradient id="t9-seal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2aa"/>
      <stop offset="28%" stop-color="#d4a342"/>
      <stop offset="65%" stop-color="#fae292"/>
      <stop offset="100%" stop-color="#8a5a18"/>
    </linearGradient>
    <filter id="t9-seal-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#45080c" flood-opacity="0.45"/>
    </filter>
  </defs>
  <g filter="url(#t9-seal-shadow)">
    ${SEAL_PETALS}
    <circle cx="60" cy="60" r="48" fill="none" stroke="url(#t9-seal-gold)" stroke-width="3.2"/>
    <circle cx="60" cy="60" r="45" fill="none" stroke="#684210" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="42" fill="url(#t9-seal-wax)"/>
    <circle cx="60" cy="60" r="41" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(70,5,10,0.5)" stroke-width="1"/>
  </g>
</svg>`;
const LOTUS_DIVIDER_SVG = `<svg class="t9-lotus-flourish" viewBox="0 0 240 44" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M120 4c-5 12-14 20-22 22 10 1 17-6 22-18 5 12 12 19 22 18-8-2-17-10-22-22z" fill="var(--gold)" stroke="none"/>
  <path d="M120 16c-3 8-9 13-15 14 7 1 11-4 15-11 4 7 8 12 15 11-6-1-12-6-15-14z" fill="var(--p)" stroke="none"/>
  <circle cx="120" cy="33" r="3" fill="var(--gold)"/>
  <circle cx="120" cy="40" r="1.5" fill="var(--gold)"/>
  <path d="M96 26C80 26 65 14 50 20c-12 5-18 16-32 16M144 26c16 0 31-12 46-6 12 5 18 16 32 16" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="18" cy="36" r="2.5" fill="var(--gold)"/>
  <circle cx="222" cy="36" r="2.5" fill="var(--gold)"/>
  <circle cx="6" cy="36" r="1.5" fill="var(--gold)"/>
  <circle cx="234" cy="36" r="1.5" fill="var(--gold)"/>
</svg>`;

/* Footprints Cue */
const FOOT = '<path d="M8 2C4 2 2 7 3 12C4 17 5 22 6 28C7 33 13 33 14 28C15 22 16 17 16 12C16 7 13 2 8 2Z"/><circle cx="3" cy="-2" r="1.6"/><circle cx="8" cy="-4" r="1.8"/><circle cx="13" cy="-2" r="1.6"/><circle cx="16" cy="2" r="1.4"/>';
const FOOTPRINTS = `<svg class="t9-foot" viewBox="0 0 44 70" aria-hidden="true" focusable="false"><g class="t9-fp1" fill="#b5121b" transform="translate(4 28)">${FOOT}</g><g class="t9-fp2" fill="#b5121b" transform="translate(24 10)">${FOOT}</g></svg>`;

/* Stamp & Postmark */
function stampSvg(en, bn) {
  const W = 62, H = 74, r = 2.7, gap = 7.4;
  let holes = '';
  for (let x = gap / 2; x < W; x += gap) holes += `<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
  for (let y = gap / 2; y < H; y += gap) holes += `<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
  return `<svg class="t9-stamp" viewBox="-3 -3 ${W + 6} ${H + 6}" aria-label="${esc(en)}" role="img"><defs><mask id="t9-stm"><rect x="-3" y="-3" width="${W + 6}" height="${H + 6}" fill="#fff"/><g fill="#000">${holes}</g></mask></defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="var(--p)" mask="url(#t9-stm)"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="1.5" fill="none" stroke="rgba(255,238,226,.55)" stroke-width=".8"/>
  <path d="M14 16Q31 8 48 16" stroke="rgba(255,238,226,.5)" stroke-width=".8" fill="none"/>
  <text data-l="en" x="31" y="44" class="t9-st">${esc(en)}</text><text data-l="bn" x="31" y="44" class="t9-st t9-st-bn">${esc(bn)}</text>
  <path d="M20 56H42" stroke="rgba(255,238,226,.6)" stroke-width=".8"/><circle cx="31" cy="62" r="1.6" fill="rgba(255,238,226,.75)"/></svg>`;
}
function postmark(city, date) {
  const txt = `${city} ✦ ${date} ✦`;
  return `<svg class="t9-postmark" viewBox="0 0 80 80" aria-hidden="true" focusable="false"><defs><path id="t9-pm" d="M40 40m-27 0a27 27 0 1 1 54 0a27 27 0 1 1-54 0"/></defs><g fill="none" stroke="var(--p)" stroke-width="1.2"><circle cx="40" cy="40" r="35"/><circle cx="40" cy="40" r="20"/></g><text font-size="7.6" font-weight="600" letter-spacing="1.2" fill="var(--p)" font-family="Cormorant Garamond,serif"><textPath href="#t9-pm">${esc(txt.toUpperCase())}</textPath></text><path d="M30 40h20M32 44h16" stroke="var(--p)" stroke-width="1.2"/></svg>`;
}

const DIAMOND_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='170' height='170' viewBox='0 0 170 170'%3E%3Cpath d='M85 6L164 85L85 164L6 85Z' fill='none' stroke='%23c9a39d' stroke-opacity='.25' stroke-width='1.2'/%3E%3Cpath d='M85 34L136 85L85 136L34 85Z' fill='none' stroke='%23c9a39d' stroke-opacity='.15' stroke-width='1'/%3E%3C/svg%3E\")";
const WHATSAPP = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z" stroke-linejoin="round"/><path d="M9 8.5c.2 3 3 5.8 6 6l1.2-1.4-2-1-.9.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.9-1-2z" fill="currentColor" stroke="none"/></svg>';
const CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

/* ---------- Complete Fixed Stylesheet ---------- */
const STYLE = `
.t9,.t9 *,.t9 *:before,.t9 *:after{box-sizing:border-box}
.t9{--p:#8e1a34;--p-dark:#621023;--p-soft:#f9ebe9;--p-mid:#c7a6ae;--p-rgb:142,26,52;--a:#b5121b;--paper:#fbf5eb;--cream:#f7eed8;--gold:#c99738;--mg:#f19a1a;--ink:#320c16;--ink-rgb:50,12,22;--muted:rgba(var(--ink-rgb),.72);
  --f-title:Galada,"Tiro Bangla",cursive;--f-head:"Cormorant Garamond","Tiro Bangla",Georgia,serif;--f-body:"Hind Siliguri","Cormorant Garamond",system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow:visible;color:var(--ink);font:500 17px/1.7 var(--f-body);-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 70% 30% at 90% 0,rgba(241,154,26,.08),transparent 70%),radial-gradient(ellipse 60% 28% at 0 45%,rgba(142,26,52,.05),transparent 70%),var(--paper)}
.t9[data-lang="bn"]{--f-title:Galada,"Tiro Bangla",cursive;--f-head:"Tiro Bangla","Hind Siliguri",serif;--f-body:"Hind Siliguri",system-ui,sans-serif;font:400 16px/1.8 var(--f-body)}
.t9[data-lang="bn"] [data-l="en"],.t9:not([data-lang="bn"]) [data-l="bn"]{display:none!important}
.t9.t9-locked{min-height:100vh;overflow:visible}
.t9 h1,.t9 h2,.t9 h3,.t9 p,.t9 figure{margin-top:0}
.t9 img{display:block;max-width:100%}
.t9 button{font:inherit;color:inherit;cursor:pointer}
.t9 a{color:inherit}
.t9 [hidden]{display:none!important}
.t9 :focus-visible{outline:2px solid var(--p);outline-offset:3px}

/* Progress bar */
.t9-progress{position:fixed;top:0;left:0;height:3.5px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--gold),var(--a),var(--p))}
.t9-wrap{position:relative;width:100%;max-width:1040px;margin:0 auto;padding:0 24px}
.t9 section{position:relative;padding:88px 0}
.t9-eyebrow{font:700 12px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a);margin-bottom:8px}
.t9[data-lang="bn"] .t9-eyebrow{letter-spacing:.08em;font-size:14px}
.t9-head{text-align:center;margin-bottom:44px;position:relative;z-index:2}
.t9-head h2{font:700 clamp(32px,7.5vw,52px)/1.15 var(--f-head);color:var(--p);margin:0 0 10px;letter-spacing:.01em}
.t9-head p{max-width:520px;margin:0 auto;color:var(--muted);font-size:17.5px}

/* Alpona Divider */
.t9-alp{display:block;width:min(320px,75%);height:auto;margin:16px auto 0;color:var(--a);opacity:.85}
.t9-alp path.t9-draw-path,.t9-alp circle.t9-draw-path{stroke-dasharray:1;stroke-dashoffset:1}
.t9-revealed .t9-alp path.t9-draw-path,.t9-revealed .t9-alp circle.t9-draw-path,.t9-revealed.t9-alp path.t9-draw-path,.t9-revealed.t9-alp circle.t9-draw-path{animation:t9-draw 2.2s ease forwards}
@keyframes t9-draw{to{stroke-dashoffset:0}}

/* Placeholders & Animation */
.t9-ph{background:linear-gradient(135deg,#fbf2e5,#ebd4c4)}
.t9 img.t9-fi{opacity:0;transition:opacity .8s ease}
.t9 img.t9-fi.t9-loaded{opacity:1}
.t9 img.t9-failed{opacity:0!important}
.t9-rv{opacity:0;transform:translateY(24px);transition:opacity .85s var(--ease),transform .85s var(--ease)}
.t9-rv.t9-revealed{opacity:1;transform:none}

/* Buttons */
.t9-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 28px;border-radius:30px;border:0;text-decoration:none;color:#fff;font:700 16px var(--f-head);background:var(--p);box-shadow:0 10px 24px rgba(var(--p-rgb),.32);transition:transform .3s var(--ease),box-shadow .3s;position:relative;overflow:hidden}
.t9-btn:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(var(--p-rgb),.4)}
.t9-btn.t9-ghost{background:rgba(255,250,244,.85);color:var(--p);border:1.8px solid var(--p);box-shadow:none}
.t9-btn.t9-ghost:hover{background:var(--p-soft)}
.t9-btn:after{content:"";position:absolute;top:0;bottom:0;width:34%;left:-60%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);animation:t9-sweep 4.2s ease-in-out infinite}
@keyframes t9-sweep{0%,55%{transform:skewX(-22deg) translateX(0)}100%{transform:skewX(-22deg) translateX(520%)}}

/* Language switch */
.t9-lang{display:inline-flex;gap:3px;padding:3px;border-radius:24px;background:rgba(255,250,244,.95);border:1px solid rgba(var(--p-rgb),.3);box-shadow:0 4px 14px rgba(var(--ink-rgb),.12)}
.t9-lang button{min-width:42px;height:30px;padding:0 10px;border:0;border-radius:20px;background:transparent;color:var(--p);font:700 13px "Hind Siliguri",var(--f-head);transition:background .3s,color .3s}
.t9-lang button[aria-pressed="true"]{background:var(--p);color:#fff}
.t9-lang-float{position:fixed;z-index:70;top:14px;right:14px}
.t9-entry .t9-lang{position:absolute;z-index:10;top:14px;right:14px}

/* Petals falling */
.t9-petals{position:fixed;inset:0;z-index:40;pointer-events:none;overflow:hidden}
.t9-petal{position:absolute;top:-24px;left:var(--l,50%);width:var(--s,10px);height:calc(var(--s,10px)*1.5);border-radius:100% 0 100% 0;background:linear-gradient(135deg,#f9b233,#e8700f);opacity:0;animation:t9-fall var(--d,14s) linear infinite;animation-delay:var(--dl,0s);will-change:transform}
@keyframes t9-fall{0%{transform:translate3d(0,0,0) rotate(0);opacity:0}8%{opacity:.85}92%{opacity:.7}100%{transform:translate3d(var(--x,40px),108vh,0) rotate(560deg);opacity:0}}

/* Curtains / Double Doors Entry Gate (First Page matching User Image 1 & Sample Image 2) */
.t9-entry{position:fixed;inset:0;width:100%;height:100vh;height:100svh;z-index:900;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,#fffcf5 0%,#faecd6 70%,#f4dcba 100%);transition:background .6s ease}
.t9-entry.t9-open{background:transparent!important;pointer-events:none!important}
.t9-cur{position:absolute;top:0;bottom:0;width:50.1%;height:100%;overflow:hidden;transition:transform 1.6s cubic-bezier(.7,0,.2,1);will-change:transform;z-index:2}
.t9-cur.t9-cl{left:0;border-right:1.5px solid rgba(201,162,74,.85);box-shadow:2px 0 16px rgba(40,10,15,.18)}
.t9-cur.t9-cr{right:0;border-left:1.5px solid rgba(201,162,74,.85);box-shadow:-2px 0 16px rgba(40,10,15,.18)}
.t9-door-panel{position:absolute;top:0;height:100%;width:200%;display:flex;align-items:center;justify-content:center}
.t9-door-left{left:0}
.t9-door-right{left:-100%}
.t9-door-bg{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
@media (max-width:768px),(orientation:portrait){.t9-door-bg{object-fit:cover}}
.t9-open .t9-cl{transform:translateX(-102%) skewX(-2deg)}
.t9-open .t9-cr{transform:translateX(102%) skewX(2deg)}

.t9-gate-in{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(8px,1.8vh,20px) 16px;overflow-y:auto;touch-action:pan-y;transition:opacity .4s ease,transform .4s var(--ease);pointer-events:auto}
.t9-gate-in>*{margin:0}
.t9-boot .t9-gate-in{opacity:1;transform:none}
.t9-open .t9-gate-in{opacity:0;transform:scale(1.04);pointer-events:none}

/* First Page Card: Transparent container inside Image 1's ornate gold frame matching Image 2 */
.t9-gate-card{position:relative;z-index:10;background:transparent;border:0;box-shadow:none;max-width:440px;width:min(92vw,440px);display:flex;flex-direction:column;align-items:center;text-align:center;padding:2px 8px;gap:clamp(3px,.8vh,6px);box-sizing:border-box}
.t9-gate-lotus-top{display:block;width:min(72px,20vw);height:auto;margin:0 auto}
.t9-card-lotus{display:block;width:100%;height:auto}
.t9-gate-invoc{font:italic 600 clamp(11.5px,1.5vh,14px) var(--f-head);color:#8b1523;margin:0;letter-spacing:.04em;display:flex;align-items:center;gap:6px}
.t9-gate-invoc span{font-size:9px;color:var(--gold)}
.t9-gate-title{font:400 clamp(36px,6vh,52px)/1.05 "Galada",var(--f-title);color:#8b1523;margin:0;text-shadow:0 1px 0 rgba(255,255,255,.85)}
.t9-gate-flourish{margin:-3px auto 1px;width:min(140px,34vw);opacity:.95;line-height:0}
.t9-kicker{font:700 clamp(9.5px,1.2vh,11px) var(--f-body);letter-spacing:.24em;color:#7a5929;text-transform:uppercase;margin:0}
.t9[data-lang="bn"] .t9-kicker{letter-spacing:.05em;font-size:12px}
.t9-gate-names{font:700 clamp(19px,3vh,26px)/1.15 var(--f-head);color:#2c0b10;margin:1px 0 3px}

/* Guest Box matching Image 2 */
.t9-guest-box{width:100%;max-width:350px;padding:clamp(5px,1vh,9px) 14px;border-radius:16px;background:linear-gradient(180deg,#fff9ee 0%,#faecd3 100%);border:1.4px solid rgba(201,162,74,.7);box-shadow:0 4px 14px rgba(180,130,60,.12),inset 0 1px 0 rgba(255,255,255,.9);margin:2px 0;text-align:center}
.t9-guest-kicker{display:block;font:700 10.5px var(--f-body);letter-spacing:.22em;text-transform:uppercase;color:#a81c24;margin-bottom:2px}
.t9[data-lang="bn"] .t9-guest-kicker{letter-spacing:.05em;font-size:12px}
.t9-guest-name{font:700 clamp(17px,3.2vw,22px)/1.2 var(--f-head);color:#2c0b10;margin:0 0 3px}
.t9-guest-pill{display:inline-block;padding:2px 14px;border-radius:14px;background:rgba(201,162,74,.22);border:1px solid rgba(201,162,74,.5);font:600 11px var(--f-body);color:#6a4c18}

/* Seal Button: Ornate Gold Filigree Ring with Ruby Wax Center matching Image 2 - 100% Vector Circle */
.t9-bindi{position:relative;width:clamp(84px,11.5vh,98px);height:clamp(84px,11.5vh,98px);aspect-ratio:1/1;border-radius:50%;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;margin:3px auto 1px;padding:0;animation:t9-pulse 3s ease-in-out infinite;will-change:transform}
.t9-seal-svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.t9-bindi-txt{position:relative;z-index:2;font:700 clamp(16px,2.2vh,19px) var(--f-head);color:#fffaf0;letter-spacing:.06em;text-shadow:0 1px 2px rgba(0,0,0,.65);pointer-events:none;display:block;margin-top:-1px}
.t9-bindi:hover{transform:scale(1.05)}
.t9-bindi.t9-burst{animation:t9-burst .5s ease-in forwards}
@keyframes t9-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes t9-burst{45%{transform:scale(1.2)}100%{transform:scale(0);opacity:0}}
.t9-gate-note{font:700 clamp(9.5px,1.2vh,11px) var(--f-body);letter-spacing:.18em;text-transform:uppercase;color:#7a5929;cursor:pointer;margin-top:2px}
.t9[data-lang="bn"] .t9-gate-note{letter-spacing:.04em;text-transform:none}

/* Phuljhadi (Golden Sparklers / Festive Sparks Fireworks) Animation on Door Opening */
.t9-phuljhadi{position:fixed;left:50%;top:50%;width:0;height:0;pointer-events:none;z-index:9999}
.t9-spark{position:absolute;left:0;top:0;width:var(--sz,6px);height:var(--sz,6px);border-radius:50%;background:radial-gradient(circle,#fff,var(--col,#ffd700) 60%,transparent);box-shadow:0 0 8px #ffd700,0 0 16px #ff9900,0 0 24px #ff5500;opacity:0;transform:translate(-50%,-50%);animation:t9-spark-shoot var(--dur,1.3s) cubic-bezier(0.12,0.8,0.32,1) forwards;animation-delay:var(--del,0s);will-change:transform,opacity}
.t9-spark-star{position:absolute;left:0;top:0;font-size:var(--sz,14px);color:var(--col,#ffe066);text-shadow:0 0 8px #ffd700,0 0 16px #ff8800;opacity:0;animation:t9-star-twinkle var(--dur,1.3s) ease-out forwards;animation-delay:var(--del,0s);will-change:transform,opacity}
@keyframes t9-spark-shoot{0%{transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(0) scale(1.5);opacity:1}60%{opacity:1;transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(calc(var(--dist,160px)*-0.85)) scale(1)}100%{transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(calc(var(--dist,160px)*-1)) scale(0.2);opacity:0}}
@keyframes t9-star-twinkle{0%{transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(0) scale(0) rotate(0);opacity:1}50%{transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(calc(var(--dist,140px)*-0.7)) scale(1.3) rotate(180deg);opacity:1}100%{transform:translate(-50%,-50%) rotate(var(--angle,0deg)) translateY(calc(var(--dist,140px)*-1)) scale(0) rotate(360deg);opacity:0}}

/* HERO SECTION (PAGE 2): FULL WINDOW SIZE, 100VH VIEWPORT FIT */
.t9-hero{position:relative;width:100%;height:100vh;height:100svh;max-height:100vh;max-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:clamp(10px,2vh,24px) 16px clamp(12px,2.5vh,28px);box-sizing:border-box}

/* Banana Tree Pillars & Animated Jhumkas: Full Screen Height Top-to-Bottom */
.t9-hero-pillars{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:hidden;box-sizing:border-box}
.t9-pillar{position:absolute;top:0;bottom:0;height:100%;aspect-ratio:318/960;width:auto;max-width:min(28vw,360px);pointer-events:none}
.t9-pillar-left{left:0}
.t9-pillar-right{right:0}
.t9-pillar picture{display:block;width:100%;height:100%}
.t9-pillar-img{display:block;width:100%;height:100%;object-fit:contain}
.t9-pillar-left .t9-pillar-img{object-position:left top}
.t9-pillar-right .t9-pillar-img{object-position:right top}

/* Animated Hanging Jhumkas (Desktop default: hooks into 960h canopy) */
.t9-jhumka-sway{position:absolute;top:11.46%;width:17%;transform-origin:50% 0;pointer-events:none;will-change:transform}
.t9-jhumka-left{left:36.16%;animation:t9-jhumka-swing-left 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate}
.t9-jhumka-right{left:63.52%;width:17.6%;animation:t9-jhumka-swing-right 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate}
.t9-jhumka-sway img{display:block;width:100%;height:auto;transform:translateX(-50%)}
@keyframes t9-jhumka-swing-left{0%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}100%{transform:rotate(-9deg)}}
@keyframes t9-jhumka-swing-right{0%{transform:rotate(9deg)}50%{transform:rotate(-9deg)}100%{transform:rotate(9deg)}}

/* Mobile Viewport: 100% Full Screen Height Top-to-Bottom Banana Tree */
@media(max-width:768px){
  .t9-pillar{width:clamp(68px,20vw,88px);max-width:none;aspect-ratio:auto}
  .t9-pillar-img{object-fit:fill}
  .t9-jhumka-sway{top:3.9%;width:44%}
  .t9-jhumka-right{width:44%}
}

.t9-frieze{position:absolute;left:0;right:0;bottom:0;height:clamp(50px,7vh,80px);overflow:hidden;z-index:3}
.t9-fz-track{display:flex;height:100%;width:max-content;animation:t9-march 70s linear infinite}
.t9-fz-track svg{flex:0 0 auto;height:100%;width:auto;aspect-ratio:1200/190}
@keyframes t9-march{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}

/* Hero Inner Content: Grand, spacious, majestic sizing */
.t9-hero-in{position:relative;z-index:4;width:100%;max-width:680px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:clamp(3px,0.7vh,7px)}
.t9-auspicious-head{display:flex;flex-direction:column;align-items:center;text-align:center;margin:0 auto;position:relative;z-index:5}
.t9-lotus-wrap{display:block;width:min(160px,36vw);margin:0 auto 2px;color:var(--gold);opacity:.95}
.t9-lotus-wrap svg{display:block;width:100%;height:auto}
.t9-invoc{font:italic 600 clamp(13px,1.9vh,16.5px) var(--f-head);color:var(--p);margin-bottom:2px;letter-spacing:.03em}
.t9-title{font:400 clamp(44px,7vh,66px)/1.06 var(--f-title);color:var(--a);margin:0;text-shadow:0 1.5px 0 rgba(255,255,255,.75)}

/* Spotlight Couple Portrait Frame */
/* Spotlight Couple Portrait Frame: Royal Golden Circle */
.t9-spotlight-frame{position:relative;width:clamp(150px,min(46vw,26vh),200px);height:clamp(150px,min(46vw,26vh),200px);aspect-ratio:1/1;border-radius:50%;padding:7px;background:conic-gradient(from 0deg,var(--gold),#fff0aa,var(--gold),#fae6aa,var(--gold));box-shadow:0 14px 38px rgba(var(--ink-rgb),.26),0 0 0 4px rgba(201,162,74,.42),0 0 18px rgba(201,162,74,.25);margin:clamp(3px,0.7vh,8px) auto;transition:transform .4s var(--ease)}
.t9-spotlight-frame:hover{transform:scale(1.03)}
.t9-spotlight-frame>div{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;border:3.5px solid #fffaf2;background:#f8eedc;box-shadow:inset 0 0 10px rgba(70,20,25,.18)}
.t9-spotlight-frame img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}

/* Subtitle, Names, Invite Message */
.t9-sub{margin:0;font:700 clamp(11px,1.5vh,13.5px) var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--p)}
.t9[data-lang="bn"] .t9-sub{letter-spacing:.06em;text-transform:none;font-size:15px}
.t9-names{font:700 clamp(28px,4.8vh,44px)/1.15 var(--f-head);color:var(--p);margin:0}
.t9-names i{display:inline-block;font:italic 500 .62em var(--f-head);color:var(--a);margin:0 5px}
.t9-hero-copy{max-width:520px;margin:0 auto;font:italic 500 clamp(13px,1.9vh,16.5px)/1.45 var(--f-head);color:var(--muted)}

/* Hero Royal Person & Family Invited Box (matching Template 2) */
.t9-hero-guest-box{width:100%;max-width:390px;margin:clamp(2px,0.6vh,6px) auto 0;padding:clamp(8px,1.4vh,12px) 20px;border-radius:18px;background:linear-gradient(180deg,rgba(255,250,242,.94),rgba(252,240,222,.94));border:1.4px solid rgba(201,162,74,.75);box-shadow:0 6px 18px rgba(180,130,60,.14),inset 0 1px 0 rgba(255,255,255,.95);text-align:center}
.t9-hero-guest-sal{display:block;font:700 11px var(--f-body);letter-spacing:.24em;text-transform:uppercase;color:#a81c24;margin-bottom:2px}
.t9[data-lang="bn"] .t9-hero-guest-sal{letter-spacing:.05em;font-size:13px}
.t9-hero-guest-name{font:700 clamp(18px,3.2vw,24px)/1.2 var(--f-head);color:#3b1016;margin:0 0 3px}
.t9-hero-guest-pill{display:inline-block;padding:2px 14px;border-radius:14px;background:rgba(201,162,74,.24);border:1px solid rgba(201,162,74,.55);font:600 12px var(--f-body);color:#6a4c18}

/* Sacred Story & Journey Section */
section[data-sec="story"]{background:radial-gradient(ellipse 70% 30% at 50% 0%,rgba(255,255,255,.7),transparent 70%),linear-gradient(180deg,var(--paper),var(--cream) 50%,var(--paper));position:relative;overflow:hidden;padding:clamp(44px,7.5vh,84px) 0}

/* Auspicious Poem Box */
.t9-poem{max-width:640px;margin:0 auto clamp(24px,4vh,44px);padding:clamp(20px,3.5vw,32px) clamp(18px,3vw,28px);text-align:center;border-radius:24px;background:linear-gradient(180deg,rgba(255,250,244,.95),rgba(253,243,230,.92));border:1.4px solid rgba(201,162,74,.55);box-shadow:0 16px 36px rgba(var(--ink-rgb),.08),0 0 0 4px rgba(255,250,244,.7)}
.t9-poem p{margin:0;font:italic 600 clamp(17px,3.5vw,22px)/1.65 var(--f-head);color:var(--p)}
.t9-poem small{display:block;margin-top:10px;font:700 clamp(11px,1.8vw,13px) var(--f-body);letter-spacing:.24em;color:var(--a);text-transform:uppercase}
.t9[data-lang="bn"] .t9-poem small{letter-spacing:.05em;text-transform:none}

/* Alternating Zigzag Chapters: Left -> Down Right -> Down Left */
.t9-chap{display:grid;grid-template-columns:clamp(100px,28vw,165px) 1fr;gap:clamp(16px,4vw,36px);align-items:center;text-align:left;max-width:680px;margin:0 auto clamp(28px,5vh,48px)}
.t9-chap:last-child{margin-bottom:0}
.t9-chap.t9-chap-rev,
.t9-chap:nth-of-type(even){grid-template-columns:1fr clamp(100px,28vw,165px);text-align:right}
.t9-chap.t9-chap-rev .t9-medal,
.t9-chap:nth-of-type(even) .t9-medal{order:2;justify-self:end}
.t9-chap.t9-chap-rev .t9-chap-txt,
.t9-chap:nth-of-type(even) .t9-chap-txt{order:1;text-align:right;align-items:flex-end;justify-self:end}

/* Royal Golden Circle Medallion Frame */
.t9-medal{position:relative;width:100%;max-width:165px;aspect-ratio:1/1;border-radius:50%;padding:clamp(5px,1.2vw,7px);background:conic-gradient(from 0deg,var(--gold),#fff0aa,var(--gold),#fae6aa,var(--gold));box-shadow:0 12px 30px rgba(var(--ink-rgb),.2),0 0 0 3.5px rgba(201,162,74,.4),0 0 16px rgba(201,162,74,.22);transition:transform .4s var(--ease);flex-shrink:0;box-sizing:border-box}
.t9-medal:hover{transform:scale(1.04)}
.t9-medal>div{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;border:3px solid #fffaf2;background:#f8eedc;box-shadow:inset 0 0 10px rgba(70,20,25,.18)}
.t9-medal img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block;border-radius:50%}

/* Chapter Text & Numeral */
.t9-chap-txt{display:flex;flex-direction:column;justify-content:center}
.t9-num{font:700 clamp(32px,7vw,52px)/1 var(--f-head);color:transparent;-webkit-text-stroke:1.3px var(--a);letter-spacing:.02em;margin-bottom:2px;display:inline-block}
.t9-chap h3{font:700 clamp(18px,3.8vw,26px)/1.2 var(--f-head);color:var(--p);margin:0 0 6px}
.t9-chap p{margin:0;color:var(--muted);font:500 clamp(13px,2.2vw,15.5px)/1.5 var(--f-head);max-width:440px}

/* Save the Date Section */
.t9-sec-date{background:radial-gradient(ellipse 70% 30% at 50% 0%,rgba(255,255,255,.7),transparent 70%),linear-gradient(180deg,var(--paper),var(--cream) 50%,var(--paper));position:relative;overflow:hidden;padding:70px 0 90px}
.t9-datecard{position:relative;max-width:540px;margin:0 auto;padding:40px 24px 34px;border-radius:28px;background:linear-gradient(180deg,#fffaf3,#fff4e6);border:1.5px solid rgba(201,162,74,.6);box-shadow:0 22px 50px rgba(var(--ink-rgb),.14),0 0 0 6px rgba(255,250,244,.8);text-align:center}
.t9-cal-m{font:700 clamp(24px,5.5vw,34px) var(--f-head);color:var(--p);letter-spacing:.06em;text-transform:uppercase}
.t9-cal-y{font:italic 600 22px var(--f-head);color:var(--a);margin-top:-2px}
.t9-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:340px;margin:22px auto 0;font:600 15px var(--f-head)}
.t9-cal-h{font:700 12px var(--f-body);color:var(--muted);padding:4px 0}
.t9-cal-d{aspect-ratio:1;display:grid;place-items:center;border-radius:50%;color:var(--ink);transition:background .2s}
.t9-cal-on{background:var(--p)!important;color:#fff!important;box-shadow:0 4px 12px rgba(var(--p-rgb),.35)}
.t9-cal-dot{position:relative}
.t9-cal-dot:after{content:"";position:absolute;bottom:3px;left:50%;width:4px;height:4px;border-radius:50%;background:var(--a);transform:translateX(-50%)}
.t9-cal-time{margin:28px 0 0;font:italic 600 19px var(--f-head);color:var(--p)}
.t9-cd{display:none;justify-content:center;gap:8px;margin:20px 0 0}
.t9-cd.t9-live{display:flex}
.t9-cd div{min-width:66px;padding:10px 6px 8px;border:1.8px solid var(--p);border-radius:18px;background:var(--p-soft);overflow:hidden}
.t9-cd b{display:block;font:700 28px/1.1 var(--f-head);color:var(--p);font-variant-numeric:tabular-nums}
.t9-cd b.t9-tick{animation:t9-tick .5s var(--ease)}
@keyframes t9-tick{from{transform:translateY(-35%);opacity:0}to{transform:none;opacity:1}}
.t9-cd small{font:700 11px var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.t9-cd-done{font:italic 700 20px var(--f-head);color:var(--a)}
.t9-date-actions{display:flex;justify-content:center;margin-top:22px;position:relative;z-index:3}
.t9-btn-gcal{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:12px 28px;font-size:clamp(14px,2.5vw,16px);font-weight:700;border-radius:999px;background:linear-gradient(135deg,var(--p),#6b0c16);color:#fff9f0!important;box-shadow:0 8px 24px rgba(110,10,20,.35),0 0 0 2px rgba(201,162,74,.4);transition:transform .25s ease,box-shadow .25s ease;text-decoration:none}
.t9-btn-gcal:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(110,10,20,.45),0 0 0 3px rgba(201,162,74,.7)}
.t9-gcal-svg{color:#f7d282;flex-shrink:0}

/* Celebrations Section */
.t9-sec-ev{background:radial-gradient(ellipse 60% 20% at 70% 10%,rgba(255,255,255,.7),transparent 70%),linear-gradient(180deg,var(--cream),#f6ead0 60%,var(--cream));overflow:hidden}
.t9-ev-col{position:relative;z-index:2;max-width:880px;margin:0 auto;padding:0 4px}
.t9-day{display:block;margin:32px 0 16px;font:700 15px var(--f-body);letter-spacing:.2em;text-transform:uppercase;color:var(--a);text-align:center}
.t9[data-lang="bn"] .t9-day{letter-spacing:.03em;text-transform:none;font-size:17px}
.t9-day:first-of-type{margin-top:0}

.t9-evs{display:grid;gap:24px;position:relative}
.t9-evcard{border-radius:22px;overflow:hidden;background:linear-gradient(180deg,#fffaf3,#fff4e6);border:1px solid rgba(201,162,74,.55);box-shadow:0 16px 36px rgba(var(--ink-rgb),.1);transition:transform .4s var(--ease),box-shadow .4s}
.t9-evcard:hover{transform:translateY(-3px);box-shadow:0 22px 46px rgba(var(--ink-rgb),.15)}
.t9-evimg{height:clamp(230px,44vw,320px);overflow:hidden;position:relative;background:linear-gradient(135deg,#fcf2e3,#f5ded0)}
.t9-evimg img{width:100%;height:100%;object-fit:cover;object-position:center 14%;display:block;transition:transform 1.2s var(--ease)}
.t9-evcard:hover .t9-evimg img{transform:scale(1.06)}
.t9-evtop{display:flex;align-items:center;gap:16px;padding:18px 20px 0}
.t9-evdate{flex:0 0 auto;width:64px;padding:8px 0 6px;text-align:center;border-radius:14px;background:var(--p);color:#fff;box-shadow:0 6px 14px rgba(var(--p-rgb),.28)}
.t9-evdate b{display:block;font:700 24px/1 var(--f-head)}
.t9-evdate small{font:600 11px var(--f-body);letter-spacing:.08em;text-transform:uppercase}
.t9-evtop h3{font:700 clamp(22px,5.4vw,28px)/1.2 var(--f-head);color:var(--p);margin:0}
.t9-evtop small.t9-local{display:block;font:500 15px "Tiro Bangla","Hind Siliguri",serif;color:var(--a);margin-top:2px}
.t9-evb{padding:12px 20px 20px}
.t9-meta{font:600 16px var(--f-head);color:var(--ink);margin:4px 0}
.t9-meta b{color:var(--a);margin-right:8px;font-weight:700}
.t9-desc{font-size:16px;color:var(--muted);margin:8px 0 12px}
.t9-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 16px 6px 10px;border-radius:30px;border:1.6px solid var(--p-mid);background:var(--p-soft);font:600 14px var(--f-head)}
.t9-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(0,0,0,.25)}

/* Gallery / Moments */
.t9-flow{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:20px 24px 30px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.t9-flow::-webkit-scrollbar{display:none}
.t9-flow figure{flex:0 0 min(68vw,290px);aspect-ratio:3/4;margin:0;position:relative;padding:10px 10px 32px;scroll-snap-align:center;cursor:zoom-in;background:#fffaf2;border:1px solid rgba(201,162,74,.6);border-radius:6px;box-shadow:0 16px 36px rgba(var(--ink-rgb),.18);transition:transform .4s var(--ease)}
.t9-flow figure:nth-child(odd){transform:rotate(-1.4deg)}.t9-flow figure:nth-child(even){transform:rotate(1.2deg)}
.t9-flow figure:hover{transform:rotate(0) translateY(-6px)}
.t9-flow figure:before{content:"";position:absolute;top:-10px;left:50%;width:70px;height:22px;transform:translateX(-50%) rotate(-3deg);background:repeating-linear-gradient(45deg,rgba(241,154,26,.75) 0 6px,rgba(249,194,90,.75) 6px 12px);box-shadow:0 2px 6px rgba(0,0,0,.2)}
.t9-flow img{width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block}
.t9-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(40,12,20,.9);cursor:zoom-out;animation:t9-fadein .3s ease}
.t9-lb img{max-width:min(94vw,900px);max-height:88vh;border-radius:8px;box-shadow:0 30px 80px rgba(0,0,0,.6)}

/* Venue */
.t9-venue-grid{display:grid;gap:24px;max-width:880px;margin:0 auto}
.t9-venue-photo{position:relative;height:clamp(240px,50vw,360px);margin:0;border-radius:200px 200px 22px 22px;overflow:hidden;border:1.5px solid var(--gold);box-shadow:0 24px 56px rgba(var(--ink-rgb),.22),0 0 0 6px rgba(201,162,74,.15);background:linear-gradient(#fbf3df,#f2e5c6)}
.t9-venue-photo img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block}
.t9-vcard{padding:32px 24px;text-align:center;border-radius:26px;background:linear-gradient(180deg,#fffaf6,#fff5ec);border:1px solid #ecd7bf;box-shadow:0 20px 48px rgba(120,50,50,.12)}
.t9-vcard h3{font:700 clamp(25px,6vw,35px)/1.2 var(--f-head);color:var(--p);margin:4px 0 8px}
.t9-vcard p{font-size:17px;color:var(--muted);margin:0 0 20px}
.t9-vbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.t9-chips{display:grid;gap:12px;margin-top:16px}
.t9-chipc{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:16px 18px;border-radius:18px;background:var(--p-soft);border:1px solid var(--p-mid);font-size:16px;color:var(--ink)}
.t9-chipc span{font-size:20px;color:var(--a)}
.t9-chipc p{margin:0}

/* RSVP */
.t9-sec-rsvp{background:${DIAMOND_BG},linear-gradient(180deg,#f3ded8,#edd5cd);padding-bottom:70px}
.t9-rsvp{position:relative;max-width:440px;margin:0 auto;padding:36px 22px 22px;border-radius:30px;background:linear-gradient(180deg,#fffaf6,#fff6ef);border:1px solid #ecd7bf;box-shadow:0 26px 60px rgba(120,50,50,.22)}
.t9-rsvp:before{content:"";position:absolute;inset:7px;border:1px solid rgba(201,162,74,.38);border-radius:24px;pointer-events:none}
.t9-stamp{position:absolute;top:-22px;right:14px;width:66px;height:auto;transform:rotate(6deg);filter:drop-shadow(0 6px 8px rgba(0,0,0,.25));z-index:3;transition:transform .4s var(--ease)}
.t9-rsvp:hover .t9-stamp{transform:rotate(2deg) translateY(-2px)}
.t9-st{font:700 21px "Cormorant Garamond",serif;fill:#fff4ea;text-anchor:middle;letter-spacing:.02em}
.t9-st-bn{font:700 19px "Tiro Bangla","Hind Siliguri",serif}
.t9-postmark{position:absolute;top:-10px;right:62px;width:78px;height:78px;transform:rotate(-14deg);opacity:.42;z-index:2;pointer-events:none}

.t9-lab{display:block;font:600 19px var(--f-head);color:var(--ink);margin:0 0 8px}
.t9-fld{margin:0 0 20px;position:relative}

.t9-input{width:100%;height:54px;border-radius:18px;border:1.8px solid var(--p-mid);background:var(--p-soft);padding:0 16px;font:500 19px var(--f-body);color:var(--ink);outline:none;transition:border-color .3s,box-shadow .3s;-webkit-appearance:none;appearance:none}
textarea.t9-input{height:110px;padding:12px 16px;resize:none;line-height:1.5}
.t9-input:focus{border-color:var(--p);box-shadow:0 0 0 4px rgba(var(--p-rgb),.14)}
.t9-input::placeholder{color:rgba(var(--ink-rgb),.38)}

.t9-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:52px;margin:0 0 12px;padding:0 16px;border-radius:18px;border:1.8px solid var(--p-mid);background:var(--p-soft);font:700 19px var(--f-head);color:var(--ink);text-align:left;transition:background .3s,color .3s,border-color .3s,box-shadow .3s}
.t9-rd{flex:0 0 auto;width:28px;height:28px;border-radius:50%;border:2px solid var(--p-mid);display:grid;place-items:center;color:var(--p);background:transparent;transition:background .3s,border-color .3s}
.t9-rd svg{opacity:0;transform:scale(.4);transition:opacity .25s,transform .3s var(--ease)}
.t9-opt[aria-pressed="true"]{background:var(--p);border-color:var(--p);color:#fff;box-shadow:0 12px 24px rgba(var(--p-rgb),.32)}
.t9-opt[aria-pressed="true"] .t9-rd{background:#fff;border-color:#fff}
.t9-opt[aria-pressed="true"] .t9-rd svg,.t9-chip[aria-pressed="true"] .t9-rd svg{opacity:1;transform:none}

.t9-step{display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 8px;border-radius:30px;border:1.8px solid var(--p-mid);background:var(--p-soft)}
.t9-step button{width:44px;height:44px;border-radius:50%;border:0;background:var(--p);color:#fff;font:600 26px/1 var(--f-head);display:grid;place-items:center;box-shadow:0 6px 14px rgba(var(--p-rgb),.28);transition:transform .2s var(--ease)}
.t9-step button:active{transform:scale(.92)}
.t9-step output{font:italic 700 30px var(--f-head);color:var(--ink)}
.t9-step output small{font:600 16px var(--f-body);font-style:normal;color:var(--muted);margin-left:6px}

.t9-chips-row{display:flex;flex-wrap:wrap;gap:10px}
.t9-chip{flex:1 1 auto;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px 0 8px;border-radius:26px;border:1.8px solid var(--p-mid);background:transparent;font:700 17px var(--f-head);color:var(--ink);transition:background .3s,border-color .3s}
.t9-chip .t9-rd{width:24px;height:24px}
.t9-chip small{margin-left:auto;font:500 13.5px var(--f-body);color:var(--muted)}
.t9-chip[aria-pressed="true"]{border-color:var(--p);background:var(--p-soft)}
.t9-chip[aria-pressed="true"] .t9-rd{background:var(--p);border-color:var(--p);color:#fff}

.t9-send{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;margin-top:6px;border:0;border-radius:32px;background:var(--p);color:#fff;font:700 19px var(--f-head);box-shadow:0 14px 26px rgba(var(--p-rgb),.38);transition:transform .3s var(--ease)}
.t9-send:hover{transform:translateY(-2px)}
.t9-send:active{transform:scale(.98)}
.t9-cap{text-align:center;font:500 15px/1.5 var(--f-body);color:#8d7b79;margin:14px 10px 0}
.t9-status{min-height:22px;margin:10px 0 0;font:700 15px var(--f-body);text-align:center;color:var(--a)}
.t9-shake{animation:t9-shake .45s}
@keyframes t9-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.t9-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px}
.t9-contact{display:inline-block;padding:8px 16px;border-radius:30px;border:1.6px solid var(--p-mid);text-decoration:none;font:600 15px var(--f-body);color:var(--p)}
.t9-hide{display:none!important}

/* Finale */
.t9-end{position:relative;text-align:center;padding:70px 22px calc(clamp(80px,14svh,140px) + 36px);background:linear-gradient(180deg,#eedcd6,var(--paper) 40%);overflow:hidden}

/* Scratch / Reveal Surprise Card */
.t9-sec-reveal{background:linear-gradient(180deg,var(--paper),#fef5ed 50%,var(--paper));padding:84px 0 96px}
.t9-reveal-wrap{max-width:440px;margin:0 auto;text-align:center}
.t9-scratch-card{position:relative;width:100%;min-height:220px;border-radius:24px;border:1.5px solid rgba(201,162,74,.6);box-shadow:0 20px 48px rgba(var(--ink-rgb),.14),0 0 0 5px rgba(255,250,244,.8);overflow:hidden;background:linear-gradient(180deg,#fffdf9,#fff8ee)}
.t9-scratch-secret{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 20px;text-align:center;background:radial-gradient(ellipse at 50% 50%,#fffaf2 40%,#fbf0df 100%)}
.t9-secret-star{color:var(--a);font-size:14px;letter-spacing:6px;margin-bottom:8px}
.t9-secret-msg{font:italic 600 clamp(16px,3.8vw,20px)/1.55 var(--f-head);color:var(--p);margin:0 0 10px}
.t9-secret-sign{font:600 13px var(--f-body);color:var(--a);letter-spacing:.08em;text-transform:uppercase}
.t9-secret-sign b{display:block;font:700 18px var(--f-head);color:var(--ink);letter-spacing:0;text-transform:none;margin-top:2px}
.t9-scratch-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:3;touch-action:none;cursor:crosshair;transition:opacity .6s ease}
.t9-scratch-overlay{position:absolute;inset:0;z-index:4;display:grid;place-items:center;background:linear-gradient(135deg,rgba(181,18,27,.94),rgba(142,26,52,.96));color:#fff;pointer-events:none;transition:opacity .5s ease}
.t9-scratch-card.t9-active .t9-scratch-overlay{opacity:0;pointer-events:none}
.t9-scratch-card.t9-cleared .t9-scratch-canvas{opacity:0;pointer-events:none}
.t9-so-content{padding:16px 20px;text-align:center}
.t9-so-icon{font-size:24px;color:var(--gold);display:block;margin-bottom:6px;animation:t9-pulse 2s infinite}
.t9-so-content b{font:700 19px var(--f-head);letter-spacing:.04em}
.t9-so-content small{display:block;font:500 12.5px var(--f-body);opacity:.85;margin-top:4px}
.t9-scratch-caption{margin-top:14px;font:italic 600 14.5px var(--f-head);color:var(--a)}
.t9-end .t9-eyebrow{margin-bottom:6px}
.t9-end h2{font:400 clamp(40px,10vw,72px)/1.1 var(--f-title);color:var(--a);margin:0}
.t9-end p{font:700 13px var(--f-body);letter-spacing:.22em;color:var(--p);margin:10px 0 0;text-transform:uppercase}
.t9[data-lang="bn"] .t9-end p{letter-spacing:.03em;text-transform:none;font-size:15px}
.t9-end .t9-tag{font:italic 600 20px var(--f-head);letter-spacing:0;text-transform:none;color:var(--a)}
.t9-end .t9-frieze{z-index:1}

.t9-music{display:none;position:fixed;z-index:60;right:14px;bottom:14px;width:46px;height:46px;border-radius:50%;border:1.6px solid var(--p);background:rgba(255,250,244,.95);color:var(--p);font-size:18px;box-shadow:0 6px 18px rgba(var(--ink-rgb),.2)}
.t9-js .t9-music.t9-has{display:block}
.t9-music[aria-pressed="true"]{background:var(--p);color:#fff}

@media(min-width:820px){
  .t9 section{padding:110px 0}
  .t9-chap{grid-template-columns:190px 1fr;gap:44px;max-width:760px}
  .t9-chap.t9-chap-rev,.t9-chap:nth-of-type(even){grid-template-columns:1fr 190px}
  .t9-medal{max-width:190px}
  .t9-venue-grid{grid-template-columns:1fr 1fr;align-items:center;max-width:960px}
}
@media(max-width:380px){
  .t9-wrap{padding:0 16px}
  .t9-chap{grid-template-columns:92px 1fr;gap:12px}
  .t9-chap.t9-chap-rev,.t9-chap:nth-of-type(even){grid-template-columns:1fr 92px}
  .t9-medal{max-width:92px;padding:4px}
  .t9-cd div{min-width:56px}
  .t9-cd{gap:5px}
  .t9-cal-d{width:32px;height:32px}
}
@media(prefers-reduced-motion:reduce){
  .t9 *,.t9 *:before,.t9 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .t9-js .t9-rv{opacity:1!important;transform:none!important}
  .t9-alp path.t9-draw-path,.t9-alp circle.t9-draw-path{stroke-dashoffset:0!important}
}
@media print{
  .t9-progress,.t9-entry,.t9-music,.t9-petals,.t9-lang-float{display:none!important}
  .t9-js .t9-rv{opacity:1!important;transform:none!important}
  .t9-js img.t9-fi{opacity:1!important}
  .t9-alp path.t9-draw-path,.t9-alp circle.t9-draw-path{stroke-dashoffset:0!important}
}
`;

/* ---------- Render Function ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedBride = getStoredPhoto('wedding-bride-photo') || getStoredPhoto('wedding_bride_photo') || getStoredPhoto('onboard-bride-photo');
  const storedGroom = getStoredPhoto('wedding-groom-photo') || getStoredPhoto('wedding_groom_photo') || getStoredPhoto('onboard-groom-photo');
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo')
    || getStoredPhoto('wedding_venue_photo')
    || getStoredPhoto('onboard-venue-photo')
    || getStoredPhoto('wedding-banquet-photo')
    || getStoredPhoto('wedding_banquet_photo')
    || getStoredPhoto('onboard-banquet-photo')
    || getStoredPhoto('venue_photo')
    || getStoredPhoto('banquet_photo');
  const assetBase = clean(w.asset_base) || './assets/';

  const defaultBengaliEvents = [
    { event_name: 'Aashirbad & Blessings', event_name_bn: 'আশীর্বাদ অনুষ্ঠান', event_date: clean(w.date) || '2026-12-03', event_time: '11:00', venue: clean(w.venue) || 'Banquet Courtyard', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'ব্যাঙ্কোয়েট কোর্টইয়ার্ড', description: 'Elderly blessings with dhan-durba, gold ornaments and traditional sweets.', description_bn: 'ধান-দূর্বা, সোনার গয়না ও ঐতিহ্যবাহী মিষ্টি সহযোগে গুরুজনদের শুভ আশীর্বাদ।' },
    { event_name: 'Gaye Holud & Tattva', event_name_bn: 'গায়ে হলুদ ও তত্ত্ব', event_date: clean(w.date) || '2026-12-04', event_time: '17:00', venue: clean(w.venue) || 'Banquet Courtyard', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'ব্যাঙ্কোয়েট কোর্টইয়ার্ড', description: 'Traditional turmeric ceremony, vibrant alpana, music and blessings.', description_bn: 'ঐতিহ্যবাহী গায়ে হলুদ, আলপনা, সঙ্গীত ও তত্ত্ব আদান-প্রদান।' },
    { event_name: 'Shubho Bibaho & Saat Paak', event_name_bn: 'শুভ বিবাহ ও সাতপাক', event_date: clean(w.date) || '2026-12-05', event_time: clean(w.time) || '19:00', venue: clean(w.venue) || 'Royal Mandap Grounds', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'রয়্যাল মণ্ডপ প্রাঙ্গণ', description: 'Sacred Vedic wedding vows, Shubho Drishti, Mala Badal and Saat Paak.', description_bn: 'শুভদৃষ্টি, মালাবদল, সম্প্রদান এবং পবিত্র সাতপাক।' },
    { event_name: 'Bou Bhaat & Reception', event_name_bn: 'বৌভাত ও প্রীতিভোজ', event_date: clean(w.date) || '2026-12-06', event_time: '19:30', venue: clean(w.venue) || 'Grand Imperial Palace', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'গ্র্যান্ড ইম্পেরিয়াল প্যালেস', description: 'Grand dinner, royal feast, musical evening and heartfelt celebration.', description_bn: 'ভাত-কাপড়ের অনুষ্ঠান, রাজকীয় প্রীতিভোজ ও আনন্দ সম্মিলন।' }
  ];

  const rawList = (Array.isArray(events) && events.length) ? events : defaultBengaliEvents;
  const evs = rawList.map((e, idx) => ({
    ...e,
    event_name: clean(e.event_name) || clean(e.name) || clean(e.title) || defaultBengaliEvents[idx % defaultBengaliEvents.length].event_name,
    event_name_bn: clean(e.event_name_bn) || clean(e.name_bn) || clean(e.title_bn) || clean(e.event_name) || clean(e.name) || defaultBengaliEvents[idx % defaultBengaliEvents.length].event_name_bn,
    event_date: clean(e.event_date) || clean(e.date) || clean(w.date) || defaultBengaliEvents[idx % defaultBengaliEvents.length].event_date,
    event_time: clean(e.event_time) || clean(e.time) || defaultBengaliEvents[idx % defaultBengaliEvents.length].event_time,
    venue: clean(e.venue) || clean(e.address) || clean(w.venue) || defaultBengaliEvents[idx % defaultBengaliEvents.length].venue,
    venue_bn: clean(e.venue_bn) || clean(e.address_bn) || clean(e.venue) || clean(w.venue_bn) || clean(w.venue) || defaultBengaliEvents[idx % defaultBengaliEvents.length].venue_bn,
    description: clean(e.description) || defaultBengaliEvents[idx % defaultBengaliEvents.length].description,
    description_bn: clean(e.description_bn) || clean(e.description) || defaultBengaliEvents[idx % defaultBengaliEvents.length].description_bn
  }));
  const offset = clean(w.timezone_offset) || '+05:30';
  const lang0 = clean(w.lang || w.language).toLowerCase() || 'en';

  /* Names */
  const rb = clean(w.bride_name) || 'Bride', rg = clean(w.groom_name) || 'Groom';
  const rbBn = clean(w.bride_name_bn) || rb, rgBn = clean(w.groom_name_bn) || rg;
  const brideFirst = clean(w.name_order) === 'bride_first';
  const [fEn, sEn] = brideFirst ? [rb, rg] : [rg, rb];
  const [fBn, sBn] = brideFirst ? [rbBn, rgBn] : [rgBn, rbBn];
  const namesLine = LH(`${esc(fEn)} <i>&amp;</i> ${esc(sEn)}`, `${esc(fBn)} <i>ও</i> ${esc(sBn)}`);
  const namesPlain = L(`${fEn} & ${sEn}`, `${fBn} ও ${sBn}`);
  const initEn = `${fEn.charAt(0).toUpperCase()}&${sEn.charAt(0).toUpperCase()}`;
  const initBn = `${[...fBn][0] || ''}&${[...sBn][0] || ''}`;
  const guestName = clean(guest?.name) || '';
  const gEn = guestName || 'Respected Guest', gBn = guestName || 'শ্রদ্ধেয় অতিথি';
  const hasFamily = Boolean(guest?.with_family);
  const isFamilyAlreadyInName = /family/i.test(gEn);
  const isBnFamilyAlreadyInName = /family|পরিবার/i.test(gBn);
  const guestDisplayNameEn = hasFamily && !isFamilyAlreadyInName ? `${gEn} & Family` : gEn;
  const guestDisplayNameBn = hasFamily && !isBnFamilyAlreadyInName ? `${gBn} ও পরিবার` : gBn;
  const guestLine = L(guestDisplayNameEn, guestDisplayNameBn);
  const guestBadgeText = hasFamily
    ? L(guest?.persons && guest.persons > 1 ? `Family Invitation · ${guest.persons} Persons` : 'Family Invitation', guest?.persons && guest.persons > 1 ? `পরিবার সহ · ${toBn(guest.persons)} জন` : 'পরিবার সহ সাদর আমন্ত্রণ')
    : (guest?.persons && guest.persons > 1 ? L(`${guest.persons} Persons`, `${toBn(guest.persons)} জন অতিথি`) : L('Personal Invitation', 'সাদর নিমন্ত্রণ'));

  const fld = (k, defEn, defBn) => {
    const en = clean(w[k]), bn = clean(w[k + '_bn']);
    return L(en || defEn, bn || en || defBn);
  };
  const raw = (k, def = '') => clean(w[k]) || def;
  const ceremonyTitle = fld('ceremony_title', TXT.title[0], TXT.title[1]);
  const invocation = fld('invocation', TXT.invocDef[0], TXT.invocDef[1]);
  const inviteText = fld('invite_text', TXT.inviteDef[0], TXT.inviteDef[1]);
  const venue = fld('venue', 'Wedding Venue', 'বিবাহ স্থান');
  const address = fld('address', '', '');
  const hasAddr = !!(raw('address') || raw('address_bn'));
  const city = fld('city', '', '');
  const hasCity = !!(raw('city') || raw('city_bn'));
  const where = LH(
    `${esc(clean(w.venue) || 'Wedding Venue')}${clean(w.city) ? ', ' + esc(clean(w.city)) : ''}`,
    `${esc(clean(w.venue_bn) || clean(w.venue) || 'বিবাহ স্থান')}${(clean(w.city_bn) || clean(w.city)) ? ', ' + esc(clean(w.city_bn) || clean(w.city)) : ''}`
  );
  const families = fld('families', '', '');
  const hasFam = !!(raw('families') || raw('families_bn'));
  const poem = fld('poem', TXT.poemDef[0], TXT.poemDef[1]);
  const hashtag = clean(w.hashtag), hashtagBn = clean(w.hashtag_bn);
  const signature = fld(
    'footer_text',
    raw('families') ? raw('families') : `The ${clean(w.bride_name).split(/\s+/).pop() || 'Bride'} & ${clean(w.groom_name).split(/\s+/).pop() || 'Groom'} Families`,
    raw('families_bn') || (raw('families') ? raw('families') : 'উভয় পরিবার')
  );

  /* Dates */
  const day = dparts(w.date);
  const wd = day ? weekday(day) : null;
  const dEn = day ? `${pad(day.d)} ${MONTHS[day.mo - 1]} ${day.y}` : 'Date to be announced';
  const dBn = day ? `${toBn(day.d)} ${MONTHS_BN[day.mo - 1]} ${toBn(day.y)}` : 'তারিখ শীঘ্রই জানানো হবে';
  const dateLong = L(dEn, dBn);
  const dayName = day ? L(DAYS[wd], DAYS_BN[wd]) : '';
  const tEn = timeEn(w.time), tBn = timeBn(w.time);
  const timeL = clean(w.time) ? L(tEn, tBn) : '';
  const numsEn = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';
  const numsBn = day ? `${toBn(pad(day.d))} · ${toBn(pad(day.mo))} · ${toBn(day.y)}` : 'শীঘ্রই জানানো হবে';
  const whenTs = parseWhen(w.date, w.time, offset);
  let targetTs = whenTs;
  if ((!targetTs || targetTs <= Date.now()) && Array.isArray(evs) && evs.length) {
    const mainEv = evs.find(e => /phere|vivah|biye|bibaho|wedding|ceremony|sampradan|jaimala|reception/i.test(clean(e.event_name)));
    if (mainEv) {
      const evTs = parseWhen(mainEv.event_date, mainEv.event_time, offset);
      if (evTs && evTs > Date.now()) targetTs = evTs;
    }
    if (!targetTs || targetTs <= Date.now()) {
      const futureEv = evs.map(e => parseWhen(e.event_date, e.event_time, offset)).filter(t => t && t > Date.now()).sort((a, b) => a - b)[0];
      if (futureEv) targetTs = futureEv;
    }
  }
  const activeWhen = targetTs ?? whenTs ?? parseWhen(w.date, '', offset) ?? '';

  const mapUrl = safeUrl(w.map_url) || (clean(w.venue) || clean(w.address)
    ? esc(`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: [w.venue, w.address].filter(Boolean).join(', ') })}`) : '');
  const iso = x => new Date(x).toISOString().replace(/[-:]|\.\d{3}/g, '');
  let calDates = '';
  if (whenTs) {
    calDates = `${iso(whenTs)}/${iso(whenTs + 4 * 3600e3)}`;
  } else if (day) {
    const yStr = String(day.y);
    const mStr = String(day.mo).padStart(2, '0');
    const dStr = String(day.d).padStart(2, '0');
    calDates = `${yStr}${mStr}${dStr}T133000Z/${yStr}${mStr}${dStr}T173000Z`;
  } else {
    calDates = '20261128T133000Z/20261128T173000Z';
  }
  const calLoc = [w.venue, w.address, w.city].map(clean).filter(Boolean).join(', ') || 'Kolkata, West Bengal';
  const calText = `Wedding of ${fEn || 'Groom'} & ${sEn || 'Bride'}`;
  const calDetails = `Shubho Bibaho ceremony of ${fEn || 'Groom'} & ${sEn || 'Bride'}. Venue: ${calLoc}`;
  const calUrl = esc(`https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: calText,
    dates: calDates,
    details: calDetails,
    location: calLoc
  })}`);

  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || clean(w.rsvp_phone) || clean(w.phone) || clean(w.whatsapp) || contacts[0] || '9477929927';
  const digits = phoneRaw.replace(/\D/g, '') || '9477929927';
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = true;
  const brideImg = safeImg(w.bride_photo) || safeImg(w.bride_photo_url) || safeImg(w.bride_image) || safeImg(storedBride) || `${assetBase}default-bride.webp`;
  const groomImg = safeImg(w.groom_photo) || safeImg(w.groom_photo_url) || safeImg(w.groom_image) || safeImg(storedGroom) || `${assetBase}default-groom.webp`;
  const heroImg = safeImg(w.couple_photo) || safeImg(w.hero_image) || safeImg(w.couple_image) || safeImg(storedCouple) || `${assetBase}template-06-couple.webp`;
  const venueImg = safeImg(w.venue_photo)
    || safeImg(w.venue_image)
    || safeImg(w.banquet_image)
    || safeImg(w.banquet_photo)
    || safeImg(w.banquet)
    || safeImg(storedVenue)
    || `${assetBase}template-06-palace.jpg`;
  const cardArtImg = safeImg(w.card_image) || `${assetBase}template-06-card-clean.webp`;
  const story = readStory(w.story);
  const gallery = readGallery(w.gallery);

  /* Events */
  const stamp = e => parseWhen(e.event_date, e.event_time, offset) ?? (dparts(e.event_date) ? Date.UTC(dparts(e.event_date).y, dparts(e.event_date).mo - 1, dparts(e.event_date).d) : Infinity);
  const sorted = [...evs].sort((a, b) => stamp(a) - stamp(b));
  const groups = [];
  sorted.forEach(e => {
    const p = dparts(e.event_date);
    const key = p ? `${p.y}-${p.mo}-${p.d}` : 'tbd';
    let g = groups.find(x => x.key === key);
    if (!g) groups.push(g = { key, p, items: [] });
    g.items.push(e);
  });
  const evNames = e => { const en = clean(e.event_name) || 'Celebration'; return [en, clean(e.event_name_bn) || en]; };
  const evShort = e => { const p = dparts(e.event_date); return p ? [`${p.d} ${MONTHS[p.mo - 1].slice(0, 3)}`, `${toBn(p.d)} ${MONTHS_BN[p.mo - 1]}`] : ['', '']; };

  const eventsHtml = groups.map((g, gi) => {
    const label = g.p
      ? LH(`Day ${ORD[gi] || gi + 1} · ${DAYS[weekday(g.p)]}, ${pad(g.p.d)} ${MONTHS[g.p.mo - 1].slice(0, 3)} ${g.p.y}`, `${ORD_BN[gi] || toBn(gi + 1)} দিন · ${DAYS_BN[weekday(g.p)]}, ${toBn(g.p.d)} ${MONTHS_BN[g.p.mo - 1]} ${toBn(g.p.y)}`)
      : LH(`Day ${ORD[gi] || gi + 1}`, `${ORD_BN[gi] || toBn(gi + 1)} দিন`);
    const cards = g.items.map(e => {
      const [nEn, nBn] = evNames(e);
      const k = kindOf(nEn);
      const img = safeImg(e.image) || safeImg(e.event_image) || safeImg(e.image_url) || safeImg(e.photo_url) || (k.asset ? `${assetBase}${k.asset}` : '');
      const loc = clean(e.venue || e.address) || clean(w.venue);
      const locBn = clean(e.venue_bn || e.address_bn) || loc;
      const tm = clean(e.event_time) ? L(timeEn(e.event_time), timeBn(e.event_time)) : '';
      const p = dparts(e.event_date);
      const dressEn = clean(e.dress_code) || (k.dress ? k.dress.en : ''), dressBn = clean(e.dress_code_bn) || clean(e.dress_code) || (k.dress ? k.dress.bn : '');
      const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.c;
      const descEn = clean(e.description), descBn = clean(e.description_bn) || descEn;

      return `<div class="t9-ev t9-rv">
        <article class="t9-evcard">
          ${img ? `<div class="t9-evimg t9-ph"><img class="t9-fi" src="${esc(img)}" alt="${esc(nEn)}" loading="lazy" decoding="async"></div>` : ''}
          <div class="t9-evtop">
            ${p ? `<div class="t9-evdate"><b>${LH(String(p.d), toBn(p.d))}</b><small>${LH(esc(MONTHS[p.mo - 1].slice(0, 3)), esc(MONTHS_BN[p.mo - 1]))}</small></div>` : ''}
            <div><h3>${L(nEn, nBn)}</h3>${clean(e.local_name) ? `<small class="t9-local" dir="auto">${esc(e.local_name)}</small>` : ''}</div>
          </div>
          <div class="t9-evb">
            ${tm ? `<div class="t9-meta"><b>◷</b>${tm}</div>` : ''}
            ${loc ? `<div class="t9-meta"><b>⌖</b>${L(loc, locBn)}</div>` : ''}
            ${descEn ? `<p class="t9-desc">${L(descEn, descBn)}</p>` : ''}
            ${dressEn ? `<div class="t9-dress"><span class="t9-sw" style="background:${color}"></span>${t('dress')}: ${L(dressEn, dressBn)}</div>` : ''}
          </div>
        </article>
      </div>`;
    }).join('');
    return `<span class="t9-day t9-rv">${label}</span><div class="t9-evs">${cards}</div>`;
  }).join('');

  /* RSVP function chips */
  const seen = new Set();
  const fchips = sorted.filter(e => { const [n] = evNames(e); const k = `${n}|${clean(e.event_date)}`; if (seen.has(k)) return false; seen.add(k); return true; }).map(e => {
    const [nEn, nBn] = evNames(e); const [sEnD, sBnD] = evShort(e);
    return `<button type="button" class="t9-chip" data-fn="${esc(nEn)}" data-fn-bn="${esc(nBn)}" data-fd="${esc(sEnD)}" data-fd-bn="${esc(sBnD)}" aria-pressed="true"><span class="t9-rd">${CHECK}</span><span>${L(nEn, nBn)}</span>${sEnD ? `<small>${L(sEnD, sBnD)}</small>` : ''}</button>`;
  }).join('');

  /* Calendar Grid */
  let calHtml = '';
  if (day) {
    const first = new Date(Date.UTC(day.y, day.mo - 1, 1)).getUTCDay();
    const dim = new Date(Date.UTC(day.y, day.mo, 0)).getUTCDate();
    const dots = new Set(evs.map(e => dparts(e.event_date)).filter(p => p && p.y === day.y && p.mo === day.mo).map(p => p.d));
    const head = [['S', 'র'], ['M', 'সো'], ['T', 'ম'], ['W', 'বু'], ['T', 'বৃ'], ['F', 'শু'], ['S', 'শ']].map(([a, b]) => `<span class="t9-cal-h">${L(a, b)}</span>`).join('');
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= dim; d++) cells += d === day.d ? `<span class="t9-cal-d t9-cal-on" aria-label="Wedding day"><b>${L(String(d), toBn(d))}</b></span>` : `<span class="t9-cal-d${dots.has(d) ? ' t9-cal-dot' : ''}">${L(String(d), toBn(d))}</span>`;
    calHtml = `<div class="t9-cal-grid" role="img" aria-label="${esc(MONTHS[day.mo - 1])} ${day.y}">${head}${cells}</div>`;
  }

  const travel = [clean(w.travel_info) && ['✈', 'travel_info'], clean(w.stay_info) && ['⌂', 'stay_info']].filter(Boolean);
  const FRIEZE_USE = n => `<svg viewBox="0 0 1200 190" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false"><use href="#t9-fz"/></svg>`.repeat(n);
  const frieze = `<div class="t9-frieze" aria-hidden="true"><div class="t9-fz-track">${FRIEZE_USE(8)}</div></div>`;

  const storyVignettes = [
    heroImg,
    `${assetBase}template-06-jaimala.jpg`,
    `${assetBase}template-06-phere.jpg`
  ];

  const defaultMoments = [
    heroImg,
    brideImg,
    groomImg,
    venueImg
  ];
  const galleryItems = gallery.length ? gallery : defaultMoments;

  const stampEl = stampSvg(initEn, initBn);
  const postEl = postmark(clean(w.city) || 'Kolkata', numsEn.replace(/ · /g, '.'));
  const themeStyle = themeVars(w);

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t9-fonts>
<style>${STYLE}</style>
<noscript><style>.t9-entry{display:none!important}.t9.t9-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t9-rv{opacity:1!important;transform:none!important}.t9 img.t9-fi{opacity:1!important}.t9-alp path.t9-draw-path,.t9-alp circle.t9-draw-path{stroke-dashoffset:0!important}</style></noscript>
<div class="t9 t9-js t9-locked t9-boot" data-lang="${lang0}" style="${esc(themeStyle)}" data-when="${esc(String(activeWhen))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-names-en="${esc(`${fEn} & ${sEn}`)}" data-names-bn="${esc(`${fBn} ও ${sBn}`)}" data-venue="${esc(clean(w.venue))}" data-venue-bn="${esc(clean(w.venue_bn) || clean(w.venue))}">
  ${DEFS}
  <div class="t9-progress" aria-hidden="true"></div>
  <div class="t9-petals" aria-hidden="true"></div>

  <div class="t9-lang t9-lang-float" role="group" aria-label="Language" hidden><button type="button" data-setlang="en" aria-pressed="false">EN</button><button type="button" data-setlang="bn" aria-pressed="false">বাং</button></div>

  <!-- Royal Gate Entrance (First Page matching User Image 1 & Sample Image 2) -->
  <div class="t9-entry" role="dialog" aria-label="Wedding invitation">
    <!-- Royal Double Doors (Left and Right) that slide open to sides -->
    <div class="t9-cur t9-cl" aria-hidden="true">
      <div class="t9-door-panel t9-door-left">
        <picture>
          <source srcset="${assetBase}bengali-entry-complete-bg.webp" type="image/webp">
          <source srcset="${assetBase}bengali-entry-frame.webp" type="image/webp">
          <img class="t9-door-bg" src="${assetBase}bengali-entry-complete-bg.png" alt="" loading="eager" decoding="async">
        </picture>
      </div>
    </div>
    <div class="t9-cur t9-cr" aria-hidden="true">
      <div class="t9-door-panel t9-door-right">
        <picture>
          <source srcset="${assetBase}bengali-entry-complete-bg.webp" type="image/webp">
          <source srcset="${assetBase}bengali-entry-frame.webp" type="image/webp">
          <img class="t9-door-bg" src="${assetBase}bengali-entry-complete-bg.png" alt="" loading="eager" decoding="async">
        </picture>
      </div>
    </div>

    <div class="t9-lang" role="group" aria-label="Language"><button type="button" data-setlang="en" aria-pressed="false">EN</button><button type="button" data-setlang="bn" aria-pressed="false">বাং</button></div>

    <!-- First Page Card Content (Inside the Golden Frame matching Image 2) -->
    <div class="t9-gate-in">
      <div class="t9-gate-card">
        <div class="t9-gate-lotus-top" aria-hidden="true">${LOTUS_CARD_SVG}</div>
        <p class="t9-gate-invoc"><span>✦</span> ${invocation} <span>✦</span></p>
        <h1 class="t9-gate-title">${ceremonyTitle}</h1>
        <div class="t9-gate-flourish" aria-hidden="true">
          <svg viewBox="0 0 200 16" width="160" height="13" fill="none"><path d="M10 8 Q60 1 90 8 T170 8" stroke="#c9a24a" stroke-width="1.4"/><path d="M100 3 C98 1 95 3 95 5 C95 8 100 11 100 11 C100 11 105 8 105 5 C105 3 102 1 100 3 Z" fill="#b5121b" stroke="#c9a24a" stroke-width="0.8"/><circle cx="20" cy="8" r="2" fill="#c9a24a"/><circle cx="180" cy="8" r="2" fill="#c9a24a"/></svg>
        </div>
        <p class="t9-kicker">${t('kicker')}</p>
        <p class="t9-gate-names">${namesPlain}</p>
        
        <!-- Person, family invitation box matching Image 2 -->
        <div class="t9-guest-box">
          <span class="t9-guest-kicker">${t('guestSal')}</span>
          <h2 class="t9-guest-name">${guestLine}</h2>
          ${guestBadgeText ? `<span class="t9-guest-pill">${guestBadgeText}</span>` : ''}
        </div>

        <!-- Ornate Wax Seal Button with Gold Filigree Ring (100% Vector SVG Circle - Non-Distorted) -->
        <button class="t9-bindi" type="button" data-open aria-label="${t('open')}">
          ${SEAL_SVG}
          <b class="t9-bindi-txt">${t('open')}</b>
        </button>
        <div class="t9-gate-note">✦ ${t('tapOpen')} ✦</div>
      </div>
    </div>
  </div>

  <main>
    <!-- Hero Header (Page 2: Full Window Size, Left & Right Attached, Not Cutting Any Portion) -->
    <header class="t9-hero" data-hero>
      <!-- Royal Bengali Banana Tree Pillars with Swinging Brass Bells -->
      <div class="t9-hero-pillars" aria-hidden="true">
        <div class="t9-pillar t9-pillar-left">
          <picture>
            <source media="(max-width: 768px)" srcset="${assetBase}bengali-border-mobile-left.webp" type="image/webp">
            <source media="(max-width: 768px)" srcset="${assetBase}bengali-border-mobile-left.png" type="image/png">
            <source srcset="${assetBase}bengali-border-extended-left.webp" type="image/webp">
            <img class="t9-pillar-img" src="${assetBase}bengali-border-extended-left.png" alt="" loading="eager" decoding="async">
          </picture>
          <div class="t9-jhumka-sway t9-jhumka-left t9-bell-left">
            <picture>
              <source srcset="${assetBase}bengali-jhumka-left.webp" type="image/webp">
              <img src="${assetBase}bengali-jhumka-left.png" alt="" decoding="async">
            </picture>
          </div>
        </div>

        <div class="t9-pillar t9-pillar-right">
          <picture>
            <source media="(max-width: 768px)" srcset="${assetBase}bengali-border-mobile-right.webp" type="image/webp">
            <source media="(max-width: 768px)" srcset="${assetBase}bengali-border-mobile-right.png" type="image/png">
            <source srcset="${assetBase}bengali-border-extended-right.webp" type="image/webp">
            <img class="t9-pillar-img" src="${assetBase}bengali-border-extended-right.png" alt="" loading="eager" decoding="async">
          </picture>
          <div class="t9-jhumka-sway t9-jhumka-right t9-bell-right">
            <picture>
              <source srcset="${assetBase}bengali-jhumka-right.webp" type="image/webp">
              <img src="${assetBase}bengali-jhumka-right.png" alt="" decoding="async">
            </picture>
          </div>
        </div>
      </div>

      ${frieze}
        <div class="t9-hero-in">
        <div class="t9-auspicious-head t9-rv">
          <div class="t9-lotus-wrap" aria-hidden="true">${LOTUS_DIVIDER_SVG}</div>
          <div class="t9-invoc">${invocation}</div>
          <h1 class="t9-title">${ceremonyTitle}</h1>
        </div>
        <div class="t9-spotlight-frame t9-rv" data-feet>
          <div class="t9-ph"><img class="t9-fi" src="${esc(heroImg)}" alt="${esc(`${fEn} & ${sEn}`)}" decoding="async"></div>
        </div>
        <p class="t9-sub">${t('weddingOf')}</p>
        <h2 class="t9-names">${namesLine}</h2>
        <p class="t9-hero-copy">${inviteText}</p>
        
        <!-- Person & Family Invited Box (matching Template 2) -->
        <div class="t9-hero-guest-box t9-rv">
          <span class="t9-hero-guest-sal">${t('guestSal')}</span>
          <h3 class="t9-hero-guest-name">${guestLine}</h3>
          ${guestBadgeText ? `<span class="t9-hero-guest-pill">${guestBadgeText}</span>` : ''}
        </div>
      </div>
    </header>

    <!-- Sacred Story & Journey -->
    <section data-sec="story">
      <div class="t9-wrap">
        <div class="t9-poem t9-rv"><p>${poem}</p>${hasFam ? `<small>${families}</small>` : ''}</div>
        <div class="t9-head t9-rv"><div class="t9-eyebrow">${t('storyEy')}</div><h2>${t('storyH')}</h2><p>${t('storySub')}</p>${ALPONA}</div>
        ${story.map((s, i) => `<article class="t9-chap ${i % 2 === 1 ? 't9-chap-rev' : ''} t9-rv"><div class="t9-medal"><div class="t9-ph"><img class="t9-fi" src="${esc(s.image || storyVignettes[i] || storyVignettes[0])}" alt="${esc(s.altTitle)}" loading="lazy" decoding="async"></div></div>
          <div class="t9-chap-txt"><span class="t9-num" aria-hidden="true">${LH(pad(i + 1), toBn(pad(i + 1)))}</span><h3>${s.title}</h3><p>${s.text}</p></div></article>`).join('')}
      </div>
    </section>

    <!-- Save the Date & Live Countdown -->
    <section class="t9-sec-date" data-sec="date">
      <div class="t9-wrap">
        <div class="t9-head t9-rv"><div class="t9-eyebrow">${t('dateEy')}</div><h2>${t('dateH')}</h2>${ALPONA}</div>
        <div class="t9-rv"><div class="t9-datecard" data-date>
          ${day ? `<div class="t9-cal-m">${LH(esc(MONTHS[day.mo - 1]), esc(MONTHS_BN[day.mo - 1]))}</div><div class="t9-cal-y">${LH(String(day.y), toBn(day.y))}</div>${calHtml}` : `<div class="t9-cal-m">${L('To be announced', 'শীঘ্রই জানানো হবে')}</div>`}
          <p class="t9-cal-time">${[dayName, timeL].filter(Boolean).map((x, i) => i ? ' · ' + x : x).join('')}</p>
          <div class="t9-cd" role="timer"><div><b data-u="d">--</b><small>${t('days')}</small></div><div><b data-u="h">--</b><small>${t('hrs')}</small></div><div><b data-u="m">--</b><small>${t('min')}</small></div><div><b data-u="s">--</b><small>${t('sec')}</small></div></div>
          <div class="t9-date-actions">
            <a class="t9-btn t9-btn-gcal" href="${calUrl}" target="_blank" rel="noopener noreferrer" aria-label="Save to Google Calendar">
              <svg class="t9-gcal-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7v-5z"/>
              </svg>
              <span>${t('addCal')}</span>
            </a>
          </div>
        </div></div>
      </div>
    </section>

    <!-- Bengali Rituals Timeline -->
    ${groups.length ? `<section class="t9-sec-ev">
      <div class="t9-wrap"><div class="t9-ev-col">
        <div class="t9-head t9-rv"><div class="t9-eyebrow">${t('evEy')}</div><h2>${t('evH')}</h2><p>${t('evSub')}</p>${ALPONA}</div>
        ${eventsHtml}
      </div></div>
    </section>` : ''}

    <!-- Interactive Scratch & Reveal Surprise Card -->
    <section class="t9-sec-reveal" data-sec="reveal">
      <div class="t9-wrap">
        <div class="t9-head t9-rv">
          <div class="t9-eyebrow">${t('revEy')}</div>
          <h2>${t('revH')}</h2>
          <p>${L('A heartfelt secret blessing for you from the couple', 'আমাদের পক্ষ থেকে আপনার জন্য এক আন্তরিক বিশেষ বার্তা')}</p>
          ${ALPONA}
        </div>
        <div class="t9-reveal-wrap t9-rv">
          <div class="t9-scratch-card" data-scratch>
            <div class="t9-scratch-secret">
              <span class="t9-secret-star">✦ ✦ ✦</span>
              <p class="t9-secret-msg">${t('revMsg')}</p>
              <div class="t9-secret-sign">
                <span>${t('revSign')}</span>
                <b>${namesPlain}</b>
              </div>
            </div>
            <canvas class="t9-scratch-canvas" aria-label="Scratch card"></canvas>
            <div class="t9-scratch-overlay" data-scratch-cover>
              <div class="t9-so-content">
                <span class="t9-so-icon">✦</span>
                <b>${t('revTap')}</b>
                <small>${t('scratchHint')}</small>
              </div>
            </div>
          </div>
          <p class="t9-scratch-caption">${t('scratchHint')}</p>
        </div>
      </div>
    </section>

    <!-- Moments of Love Gallery -->
    <section style="padding-top:20px">
      <div class="t9-wrap"><div class="t9-head t9-rv" style="margin-bottom:6px"><div class="t9-eyebrow">${t('momEy')}</div><h2>${t('momH')}</h2>${ALPONA}</div></div>
      <div class="t9-flow">${galleryItems.map((g, i) => `<figure class="t9-ph" data-lb="${esc(g)}"><img class="t9-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></figure>`).join('')}</div>
    </section>

    <!-- Venue Destination -->
    <section>
      <div class="t9-wrap">
        <div class="t9-head t9-rv"><div class="t9-eyebrow">${t('venEy')}</div><h2>${t('venH')}</h2><p>${t('venSub')}</p>${ALPONA}</div>
        <div class="t9-venue-grid">
          <figure class="t9-venue-photo t9-rv"><img class="t9-fi" src="${esc(venueImg)}" alt="${esc(clean(w.venue) || 'Venue')}" loading="lazy" decoding="async"></figure>
          <div class="t9-rv">
            <div class="t9-vcard">
              <div class="t9-eyebrow">${t('venTag')}</div>
              <h3>${venue}</h3>
              <p>${(hasAddr || hasCity) ? `${hasAddr ? address : ''}${hasAddr && hasCity ? ', ' : ''}${hasCity ? city : ''}<br>` : ''}${day ? `${dayName}, ${dateLong}${timeL ? ' · ' + timeL : ''}` : ''}</p>
              <div class="t9-vbtns">
                ${mapUrl ? `<a class="t9-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">⌖ &nbsp;${t('directions')}</a>` : ''}
                ${calUrl ? `<a class="t9-btn t9-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;${t('calendar')}</a>` : ''}
              </div>
            </div>
            ${travel.length ? `<div class="t9-chips">${travel.map(([i, k]) => `<div class="t9-chipc"><span aria-hidden="true">${i}</span><p>${L(clean(w[k]), clean(w[k + '_bn']) || clean(w[k]))}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive WhatsApp RSVP -->
    <section class="t9-sec-rsvp" data-sec="rsvp">
      <div class="t9-wrap">
        <div class="t9-head t9-rv"><div class="t9-eyebrow">${t('rsvpEy')}</div><h2>${t('rsvpH')}</h2></div>
        <div class="t9-rv"><form class="t9-rsvp" data-rsvp novalidate>
          ${postEl}${stampEl}
          ${canRsvp ? `
          <div class="t9-fld"><label class="t9-lab" for="t9-name">${t('yourName')}</label><input class="t9-input" id="t9-name" name="name" type="text" autocomplete="name" value="${guestName ? esc(guestName) : ''}" required></div>
          <div class="t9-fld" role="group" aria-label="Attendance">
            <button type="button" class="t9-opt" data-att="yes" aria-pressed="true"><span class="t9-rd">${CHECK}</span><span>${t('yes')}</span></button>
            <button type="button" class="t9-opt" data-att="no" aria-pressed="false" style="margin-bottom:0"><span class="t9-rd">${CHECK}</span><span>${t('no')}</span></button>
          </div>
          <div class="t9-fld" data-guests><span class="t9-lab">${t('howMany')}</span><div class="t9-step"><button type="button" data-step="-1" aria-label="Fewer">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1} <small>${t('people')}</small></output><button type="button" data-step="1" aria-label="More">+</button></div></div>
          ${fchips ? `<div class="t9-fld" data-fns><span class="t9-lab">${t('which')}</span><div class="t9-chips-row">${fchips}</div></div>` : ''}
          <div class="t9-fld"><label class="t9-lab" for="t9-note">${t('note')}</label><textarea class="t9-input" id="t9-note" name="note" rows="3"></textarea></div>
          <button class="t9-send" type="submit">${WHATSAPP}<span>${t('send')}</span></button>
          <p class="t9-status" role="status" aria-live="polite"></p>
          <p class="t9-cap">${t('cap')}</p>` : ''}
          ${contacts.length ? `<div class="t9-contacts">${contacts.map(c => `<a class="t9-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form></div>
      </div>
    </section>

    <!-- Finale -->
    <footer class="t9-end">
      <div class="t9-eyebrow t9-rv">${t('endEy')}</div>
      <h2 class="t9-rv">${namesPlain}</h2>
      ${ALPONA}
      ${hashtag ? `<p class="t9-tag">${L(hashtag.startsWith('#') ? hashtag : '#' + hashtag, hashtagBn || (hashtag.startsWith('#') ? hashtag : '#' + hashtag))}</p>` : ''}
      <p>${t('endBless')}</p>
      <p>${signature}</p>
      <p style="margin-top:12px">${LH(esc(numsEn), esc(numsBn))}${hasCity ? ' &nbsp;|&nbsp; ' + city : ''}</p>
      ${frieze}
    </footer>
  </main>

  <button class="t9-music" type="button" aria-label="Toggle music" aria-pressed="false">♫</button>
</div>`;
}

/* ---------- Mount Function ---------- */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  const host = root?.classList?.contains('t9') ? root : root?.querySelector?.('.t9');
  if (!host) return () => {};
  if (typeof host._t9Cleanup === 'function') host._t9Cleanup();

  const doc = host.ownerDocument || document;
  const win = doc.defaultView || window;
  if (!doc.querySelector('link[data-t9-fonts]')) {
    const l = doc.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-t9-fonts', '');
    (doc.head || doc.body).appendChild(l);
  }

  const $ = (s, r = host) => r.querySelector(s);
  const $$ = (s, r = host) => [...r.querySelectorAll(s)];
  const reduce = typeof win.matchMedia === 'function' ? win.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const rand = (a, b) => a + Math.random() * (b - a);
  const undo = [];
  const on = (tg, e, f, o) => { if (tg) { tg.addEventListener(e, f, o); undo.push(() => tg.removeEventListener(e, f, o)); } };
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  let dead = false;

  /* Smooth curtains entrance gate: unhindered fluid scrolling */
  const html = doc.documentElement, body = doc.body;
  let locked = false;
  const lock = () => {
    if (locked) return; locked = true;
  };
  const unlock = () => {
    if (!locked) return; locked = false;
    host.classList.remove('t9-locked');
    if (html?.style) html.style.overflow = '';
    if (body?.style) body.style.overflow = '';
  };
  host.classList.add('t9-js');
  lock();

  /* Smooth boot */
  host.classList.remove('t9-boot');
  (() => {
    const f = doc.fonts;
    const ready = (!f || typeof f.load !== 'function') ? Promise.resolve()
      : Promise.all([f.load('40px Galada'), f.load('600 20px "Cormorant Garamond"'), f.load('16px "Hind Siliguri"'), f.load('16px "Tiro Bangla"')]).catch(() => {});
    Promise.race([ready, new Promise(r => later(r, 600))]).then(() => { if (!dead) win.requestAnimationFrame(() => host.classList.remove('t9-boot')); });
  })();

  /* Language toggle */
  let lang = host.dataset.lang || 'en';
  try { const s = win.localStorage?.getItem('t9-lang'); if (!host.dataset.lang && (s === 'bn' || s === 'en')) lang = s; } catch { /* ignore */ }
  const bn = () => lang === 'bn';
  const num = n => (bn() ? toBn(n) : String(n));
  const applyLang = l => {
    lang = l; host.dataset.lang = l;
    try { win.localStorage?.setItem('t9-lang', l); } catch { /* ignore */ }
    $$('[data-setlang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setlang === l)));
    if (doc.documentElement) doc.documentElement.setAttribute('lang', l === 'bn' ? 'bn' : 'en');
    if (typeof updateAllCountdowns === 'function') updateAllCountdowns();
    updateCount();
  };
  $$('[data-setlang]').forEach(b => on(b, 'click', () => applyLang(b.dataset.setlang)));

  /* Image load states */
  $$('img').forEach(img => {
    const ok = () => img.classList.add('t9-loaded');
    const fail = () => img.classList.add('t9-failed');
    on(img, 'load', ok); on(img, 'error', fail);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
  });
  later(() => $$('img.t9-fi').forEach(i => i.classList.add('t9-loaded')), 4500);

  /* Petals falling */
  const pet = $('.t9-petals');
  if (pet && !reduce) {
    for (let i = 0; i < 14; i++) {
      const p = doc.createElement('span'); p.className = 't9-petal';
      p.style.cssText = `--l:${rand(0, 100)}%;--s:${rand(6, 11)}px;--d:${rand(14, 22)}s;--dl:${-rand(0, 20)}s;--x:${rand(-60, 80)}px`;
      pet.appendChild(p);
    }
  }
  const burstPetals = () => {
    if (!pet || reduce) return;
    for (let i = 0; i < 24; i++) {
      const p = doc.createElement('span'); p.className = 't9-petal';
      p.style.cssText = `--l:${rand(20, 80)}%;--s:${rand(8, 14)}px;--d:${rand(3.5, 6)}s;--dl:${-rand(0, 1)}s;--x:${rand(-120, 120)}px;top:${rand(30, 60)}%;animation-iteration-count:1`;
      pet.appendChild(p); later(() => p.remove(), 6000);
    }
  };

    /* Phuljhadi (Festive Golden Sparklers) Burst Animation */
  const firePhuljhadi = () => {
    const bRect = bindi ? bindi.getBoundingClientRect() : { left: win.innerWidth / 2, top: win.innerHeight / 2, width: 0, height: 0 };
    const cx = bRect.left + bRect.width / 2;
    const cy = bRect.top + bRect.height / 2;
    const box = doc.createElement('div');
    box.className = 't9-phuljhadi';
    box.style.left = `${cx}px`;
    box.style.top = `${cy}px`;
    const colors = ['#fff', '#fff2a8', '#ffd700', '#ffaa00', '#ff6622', '#ffdd55'];
    const starGlyphs = ['✦', '✧', '★', '✸', '✹'];
    for (let i = 0; i < 40; i++) {
      const sp = doc.createElement('div');
      sp.className = 't9-spark';
      const angle = (i * 9) + (Math.random() * 8 - 4);
      const dist = 70 + Math.random() * 220;
      const sz = 4 + Math.random() * 6;
      const col = colors[Math.floor(Math.random() * colors.length)];
      const dur = 0.9 + Math.random() * 0.7;
      const del = Math.random() * 0.16;
      sp.style.cssText = `--angle:${angle}deg;--dist:${dist}px;--sz:${sz}px;--col:${col};--dur:${dur}s;--del:${del}s`;
      box.appendChild(sp);
    }
    for (let i = 0; i < 16; i++) {
      const st = doc.createElement('div');
      st.className = 't9-spark-star';
      st.textContent = starGlyphs[i % starGlyphs.length];
      const angle = (i * 22.5) + (Math.random() * 12 - 6);
      const dist = 80 + Math.random() * 180;
      const sz = 11 + Math.random() * 10;
      const col = colors[Math.floor(Math.random() * colors.length)];
      const dur = 1.0 + Math.random() * 0.6;
      const del = Math.random() * 0.14;
      st.style.cssText = `--angle:${angle}deg;--dist:${dist}px;--sz:${sz}px;--col:${col};--dur:${dur}s;--del:${del}s`;
      box.appendChild(st);
    }
    doc.body.appendChild(box);
    later(() => box.remove(), 2000);
  };

  /* Entry Gate Open: Instant smooth unlock on tap */
  const entry = $('.t9-entry'), bindi = $('[data-open]'), note = $('.t9-gate-note');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (bindi) bindi.classList.add('t9-burst');
    firePhuljhadi();
    if (entry) {
      entry.classList.add('t9-open');
      entry.style.pointerEvents = 'none';
    }
    burstPetals();
    unlock();
    host.classList.remove('t9-locked');
    const fl = $('.t9-lang-float'); if (fl) fl.hidden = false;
    onScroll(true);
    later(() => {
      if (entry) {
        entry.style.display = 'none';
        entry.remove();
      }
    }, 1600);
  };
  on(bindi, 'click', e => { e.stopPropagation(); open(); });
  on(note, 'click', e => { e.stopPropagation(); open(); });
  on(entry, 'click', e => { if (e.target.closest('.t9-lang')) return; open(); });
  on(entry, 'wheel', () => { if (!opened) open(); }, { passive: true });
  on(entry, 'touchmove', () => { if (!opened) open(); }, { passive: true });
  on(win, 'wheel', () => { if (!opened) open(); }, { passive: true });
  on(win, 'touchmove', () => { if (!opened) open(); }, { passive: true });
  on(doc, 'keydown', e => {
    if (!opened && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Enter'].includes(e.key)) {
      open();
    }
  });

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* Scroll Progress */
  const bar = $('.t9-progress'), feet = $('[data-feet]');
  let tick = false;
  function onScroll(force) {
    if (tick && !force) return; tick = true;
    win.requestAnimationFrame(() => {
      tick = false; if (dead) return;
      const scY = win.scrollY ?? html.scrollTop ?? 0;
      const vh = win.innerHeight || html.clientHeight || 800;
      const max = (html.scrollHeight || body.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(scY / max, 0, 1) : 0})`;
      if (feet && !reduce && scY < vh * 0.8) feet.style.transform = `translateY(${(scY * .08).toFixed(1)}px)`;
    });
  }
  on(win, 'scroll', () => onScroll(false), { passive: true });

  /* REVEALS: Target class `.t9-revealed` */
  const clearDelay = el => later(() => { el.style.transitionDelay = ''; }, 1200);
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .forEach((e, k) => {
          e.target.style.transitionDelay = `${k * 80}ms`;
          e.target.classList.add('t9-revealed');
          clearDelay(e.target);
          io.unobserve(e.target);
        });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });

    $$('.t9-rv').forEach(el => io.observe(el));
    undo.push(() => io.disconnect());

    const aio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('t9-revealed');
        aio.unobserve(e.target);
      }
    }), { threshold: .3 });
    $$('.t9-alp').forEach(el => aio.observe(el));
    undo.push(() => aio.disconnect());
  } else {
    $$('.t9-rv,.t9-alp').forEach(el => el.classList.add('t9-revealed'));
  }

  /* Countdown */
  const when = Number(host.dataset.when);
  const cdBox = $('.t9-cd'), togo = $('[data-togo]');

  const setUnit = (unit, val, root) => {
    if (!root) return;
    const el = root.querySelector(`[data-u="${unit}"]`);
    if (!el) return;
    const tx = num(pad(val));
    if (el.textContent !== tx) {
      el.textContent = tx;
      if (!reduce) { el.classList.remove('t9-tick'); void el.offsetWidth; el.classList.add('t9-tick'); }
    }
  };

  function updateAllCountdowns() {
    if (!when) return;
    const left = when - Date.now();
    const isPast = left <= 0;

    if (isPast) {
      setUnit('d', 0, cdBox); setUnit('h', 0, cdBox); setUnit('m', 0, cdBox); setUnit('s', 0, cdBox);
      if (togo) {
        togo.hidden = false;
        togo.textContent = bn() ? TXT.today[1] : TXT.today[0];
      }
      return;
    }

    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    setUnit('d', d, cdBox);
    setUnit('h', h, cdBox);
    setUnit('m', m, cdBox);
    setUnit('s', sec, cdBox);

    if (togo) {
      togo.hidden = false;
      togo.textContent = bn() ? `${toBn(d)} ${TXT.daysToGo[1]}` : `${d} ${TXT.daysToGo[0]}`;
    }
  }

  if (when) {
    if (cdBox) cdBox.classList.add('t9-live');
    updateAllCountdowns();
    const id = setInterval(updateAllCountdowns, 1000);
    timers.push(id);
  }

  /* Interactive Scratch & Reveal Card */
  const scWrap = $('[data-scratch]');
  if (scWrap) {
    const canvas = $('.t9-scratch-canvas', scWrap);
    const cover = $('[data-scratch-cover]', scWrap);
    let scratched = false;
    let isDrawing = false;
    let painted = false;

    const initCanvas = () => {
      if (!canvas || painted) return;
      const rect = scWrap.getBoundingClientRect();
      const w = Math.round(rect.width) || 360;
      const h = Math.round(rect.height) || 200;
      const dpr = Math.min(2, win.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#c99738');
      grad.addColorStop(0.3, '#fae6aa');
      grad.addColorStop(0.7, '#c99738');
      grad.addColorStop(1, '#e5b850');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      for (let i = 0; i < 45; i++) {
        ctx.beginPath();
        ctx.arc((i * 41) % w, (i * 31) % h, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#611624';
      ctx.font = 'bold 17px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ SCRATCH TO REVEAL ✦', w / 2, h / 2 - 8);
      ctx.font = '600 12.5px "Hind Siliguri", sans-serif';
      ctx.fillText('আঙুল দিয়ে ঘষে বার্তাটি দেখুন', w / 2, h / 2 + 16);
      painted = true;
    };

    const clearScratch = () => {
      if (scratched) return;
      scratched = true;
      scWrap.classList.add('t9-cleared');
      burstPetals();
    };

    const scratchAt = (clientX, clientY) => {
      if (scratched || !canvas) return;
      scWrap.classList.add('t9-active');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, win.devicePixelRatio || 1);
      const x = (clientX - rect.left) * dpr;
      const y = (clientY - rect.top) * dpr;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 26 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    on(scWrap, 'pointerdown', e => {
      initCanvas();
      isDrawing = true;
      scWrap.classList.add('t9-active');
      scratchAt(e.clientX, e.clientY);
    });
    on(win, 'pointermove', e => {
      if (!isDrawing) return;
      scratchAt(e.clientX, e.clientY);
    });
    on(win, 'pointerup', () => {
      if (isDrawing) {
        isDrawing = false;
        try {
          const ctx = canvas.getContext('2d');
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let empty = 0;
          for (let i = 3; i < data.length; i += 16) {
            if (data[i] === 0) empty++;
          }
          if (empty > (data.length / 16) * 0.25) {
            clearScratch();
          }
        } catch { /* ignore cross-origin check */ }
      }
    });

    if (cover) {
      on(cover, 'click', () => {
        initCanvas();
        scWrap.classList.add('t9-active');
      });
    }
    on(scWrap, 'dblclick', clearScratch);

    later(initCanvas, 1400);
  }

  /* Lightbox */
  const closeLb = () => { $('.t9-lb')?.remove(); };
  $$('[data-lb]').forEach(f => on(f, 'click', () => {
    const src = f.dataset.lb; if (!src) return;
    closeLb();
    const lb = doc.createElement('div'); lb.className = 't9-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    const im = doc.createElement('img'); im.src = src; im.alt = 'Moment';
    lb.appendChild(im); lb.addEventListener('click', closeLb); host.appendChild(lb);
  }));
  on(doc, 'keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* RSVP Handling */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa || '919477929927';
  let count = 1;
  const outEl = form && $('[data-count]', form);
  function updateCount() {
    if (!outEl) return;
    outEl.firstChild.nodeValue = `${num(count)} `;
  }
  if (form && waNum) {
    let att = 'yes';
    const guestsBox = $('[data-guests]', form), fnBox = $('[data-fns]', form);
    count = Number(outEl?.textContent) || (guest?.with_family ? 2 : 1);
    updateCount();
    const opts = $$('[data-att]', form);
    opts.forEach(b => on(b, 'click', () => {
      att = b.dataset.att;
      opts.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const no = att === 'no';
      if (guestsBox) guestsBox.classList.toggle('t9-hide', no);
      if (fnBox) fnBox.classList.toggle('t9-hide', no);
    }));
    $$('[data-step]', form).forEach(b => on(b, 'click', () => {
      count = clamp(count + Number(b.dataset.step), 1, 20);
      updateCount();
    }));
    $$('.t9-chip', form).forEach(c => on(c, 'click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))));
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const nt = $('[name="note"]', form).value.trim();
      const status = $('.t9-status', form);
      if (!name) {
        status.textContent = bn() ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please add your name.';
        form.classList.remove('t9-shake'); void form.offsetWidth; form.classList.add('t9-shake');
        return;
      }
      const B = bn();
      const fns = att === 'yes' ? $$('.t9-chip[aria-pressed="true"]', form).map(c => `${B ? c.dataset.fnBn : c.dataset.fn}${(B ? c.dataset.fdBn : c.dataset.fd) ? ' (' + (B ? c.dataset.fdBn : c.dataset.fd) + ')' : ''}`) : [];
      const names = B ? host.dataset.namesBn : host.dataset.namesEn;
      const venueTxt = B ? host.dataset.venueBn : host.dataset.venue;
      const msg = [
        `${B ? 'বিবাহ আমন্ত্রণ — উত্তর' : 'Wedding RSVP'} — ${names || ''}`,
        `${B ? 'নাম' : 'Name'}: ${name}`,
        `${B ? 'উত্তর' : 'Response'}: ${att === 'yes' ? (B ? TXT.yes[1] : TXT.yes[0]) : (B ? TXT.no[1] : TXT.no[0])}`,
        att === 'yes' && `${B ? 'অতিথি সংখ্যা' : 'Guests'}: ${num(count)}`,
        fns.length && `${B ? 'অনুষ্ঠান' : 'Functions'}: ${fns.join(', ')}`,
        nt && `${B ? 'বার্তা' : 'Note'}: ${nt}`,
        venueTxt && `${B ? 'স্থান' : 'Venue'}: ${venueTxt}`
      ].filter(Boolean).join('\n');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      status.textContent = B ? 'ধন্যবাদ! হোয়াটসঅ্যাপ নতুন ট্যাবে খুলছে।' : 'Thank you! WhatsApp is opening in a new tab.';
    });
  }

  /* Audio */
  const musicBtn = $('.t9-music'), musicUrl = host.dataset.music;
  if (musicBtn && musicUrl) {
    const audio = new Audio(musicUrl); audio.loop = true; audio.preload = 'none';
    musicBtn.classList.add('t9-has');
    on(musicBtn, 'click', () => {
      const play = audio.paused;
      (play ? audio.play() : Promise.resolve(audio.pause())).catch(() => {});
      musicBtn.setAttribute('aria-pressed', String(play));
      musicBtn.textContent = play ? '♪' : '♫';
    });
    undo.push(() => audio.pause());
  }

  applyLang(lang);
  onScroll(true);

  /* Live dynamic photo update listener from onboard page */
  if (typeof win !== 'undefined' && win.addEventListener) {
    const onLivePhoto = e => {
      if (e.detail?.slot === 'venue' && e.detail?.dataUrl) {
        $$('.t9-venue-photo img', host).forEach(img => { img.src = e.detail.dataUrl; });
      }
    };
    win.addEventListener('wedding-photo-updated', onLivePhoto);
    undo.push(() => win.removeEventListener('wedding-photo-updated', onLivePhoto));
  }

  const cleanup = () => {
    dead = true;
    timers.forEach(tm => { clearTimeout(tm); clearInterval(tm); });
    undo.forEach(f => f());
    closeLb();
    unlock();
    host.classList.remove('t9-js', 't9-locked');
    delete host._t9Cleanup;
  };
  host._t9Cleanup = cleanup;
  return cleanup;
}