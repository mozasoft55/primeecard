/* ==========================================================================
   TEMPLATE 07 — THE NEW LUXURY EXPERIENCE
   Peacock Teal · Midnight Sapphire · Antique Copper · Warm Pearl · Champagne

   CONCEPT: "The Sealed Invitation"
   - Entrance: a 3D invitation envelope on a dusk Rajbari scene. Tap the copper
     wax seal: the seal cracks, the flap rotates open in perspective, the card
     rises, then the camera dives through the card into the invitation.
   - Botanical system: a banana-leaf canopy (torn, veined, drooping leaves)
     with hanging marigold strands, plus banana-plant clumps with a blossom.
   - Shape language: arches, leaf-corner frames, copper hairlines.
   - Motion: perspective flips, clip-path image reveals, parallax depth,
     scroll-drawn story line, countdown rings, drifting light motes.

   PUBLIC API (unchanged from Template 06):
     export default function render({ guest, wedding, events })  -> HTML string
     export function mount(root, { guest, wedding, events })     -> cleanup()

   ASSET MAP (resolved against wedding.asset_base, default ./assets/):
     cover  t7-cover-dusk.webp          couple t7-couple-arch.webp
     venue  t7-venue-courtyard.webp     card   t7-card-paper.webp
     story  t7-story-meeting|promise|union.webp
     gallery t7-gallery-01 … 06.webp
     rituals t7-ritual-haldi|mehendi|sangeet|aiburo|malabadal|bibaho|
             reception|baraat|default.webp
   Every image has a painted fallback, so a missing file never leaves a hole.
   ========================================================================== */

/* ---------- Helpers (data contracts preserved from Template 06) ---------- */
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
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400;1,6..96,500&family=Hanken+Grotesk:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap';

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
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d ? { y, mo, d } : null;
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
  const tp = timeParts(v);
  if (!tp) return clean(v);
  return `${tp.h % 12 || 12}:${pad(tp.mi)} ${tp.h >= 12 ? 'PM' : 'AM'}`;
};
const timeBn = v => {
  const tp = timeParts(v);
  if (!tp) return clean(v);
  const h = tp.h, per = h >= 4 && h < 6 ? 'ভোর' : h >= 6 && h < 12 ? 'সকাল' : h >= 12 && h < 15 ? 'দুপুর' : h >= 15 && h < 17 ? 'বিকেল' : h >= 17 && h < 20 ? 'সন্ধ্যা' : 'রাত';
  const h12 = h % 12 || 12;
  return tp.mi ? `${per} ${toBn(h12)}:${toBn(pad(tp.mi))}` : `${per} ${toBn(h12)}টা`;
};

function parseWhen(dv, tv, offset = '+05:30') {
  const d = dparts(dv);
  if (!d) return null;
  const rt = clean(tv);
  const m = rt.match(/^(\d{1,2})(?::([0-5]\d))?(?::[0-5]\d)?\s*([AaPp][Mm])?$/);
  if (rt && !m) return null;
  let h = m ? +m[1] : 0;
  const mi = m ? +(m[2] || 0) : 0;
  const mer = m && m[3] ? m[3].toUpperCase() : '';
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  if (h > 23) return null;
  const ts = Date.parse(`${d.y}-${pad(d.mo)}-${pad(d.d)}T${pad(h)}:${pad(mi)}:00${offset}`);
  return Number.isNaN(ts) ? null : ts;
}

/* ---------- Bilingual text ---------- */
const L = (en, bn) => `<span data-l="en">${esc(en)}</span><span data-l="bn">${esc(bn || en)}</span>`;
const LH = (en, bn) => `<span data-l="en">${en}</span><span data-l="bn">${bn || en}</span>`;
const TXT = {
  kicker: ['A celebration of love', 'ভালোবাসার উৎসব'],
  dear: ['Dear', 'শ্রদ্ধেয়'],
  open: ['Open', 'খুলুন'],
  tapOpen: ['Touch the seal to open your invitation', 'আমন্ত্রণপত্র খুলতে সিলমোহরটি ছুঁয়ে দিন'],
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
  scratchHint: ['Scratch the foil with your finger to reveal our blessing', 'আশীর্বাদ ও বিশেষ বার্তাটি দেখতে আঙুল দিয়ে ঘষুন'],
  revEy: ['A surprise for you', 'আপনার জন্য চমক'],
  revH: ['Special Message', 'বিশেষ বার্তা'],
  revTap: ['Reveal the message', 'বার্তাটি দেখুন'],
  revMsg: ['We are truly blessed to have you in our lives. Your love and blessings mean the world to us as we take our seven sacred steps together. See you at the celebration!', 'আমাদের জীবনে আপনাদের উপস্থিতি সত্যিই পরম আশীর্বাদ। সাতপাকের এই পবিত্র যাত্রায় আপনাদের আন্তরিক আশীর্বাদ ও উপস্থিতি আমাদের সবচেয়ে বড় উপহার। অনুষ্ঠানে দেখা হচ্ছে!'],
  revSign: ['With all our love & reverence', 'আন্তরিক ভালোবাসা ও শ্রদ্ধায়'],
  revSub: ['A heartfelt secret blessing for you from the couple', 'আমাদের পক্ষ থেকে আপনার জন্য এক আন্তরিক বিশেষ বার্তা'],
  cardH: ['The Wedding Invitation', 'বিবাহের আমন্ত্রণপত্র']
};
const t = k => L(TXT[k][0], TXT[k][1]);

/* ---------- Themes (new luxury palettes; legacy theme names still accepted) ---------- */
const hex6 = v => {
  const m = clean(v).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  return '#' + (m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]).toLowerCase();
};
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hexOf = a => '#' + a.map(c => pad(clamp(Math.round(c), 0, 255).toString(16))).join('');
const mixc = (h1, h2, k) => { const a = rgbOf(h1), b = rgbOf(h2); return hexOf(a.map((c, i) => c + (b[i] - c) * k)); };
const THEMES = {
  peacock: { p: '#075b60', s: '#102a43', a: '#b77a50', paper: '#fff8ed', cream: '#eadcc4', gold: '#f5d9a8' },
  navy: { p: '#1a4470', s: '#0c1f35', a: '#b77a50', paper: '#fbf8f0', cream: '#e6dcc8', gold: '#f2d8a6' },
  emerald: { p: '#0c5a45', s: '#0d2b2a', a: '#b8884c', paper: '#fbf8ee', cream: '#e6dfc6', gold: '#f3d9a0' },
  maroon: { p: '#7a1f3d', s: '#2a0f1e', a: '#c08a52', paper: '#fff8ed', cream: '#ecdcc6', gold: '#f5d9a8' },
  royal: { p: '#7a1f3d', s: '#2a0f1e', a: '#c08a52', paper: '#fff8ed', cream: '#ecdcc6', gold: '#f5d9a8' },
  rose: { p: '#8f3256', s: '#2b1630', a: '#c0805a', paper: '#fff7f3', cream: '#efdcd0', gold: '#f5d9a8' },
  sindoor: { p: '#a02a2a', s: '#2c1218', a: '#c28a4a', paper: '#fff6ee', cream: '#efdcc4', gold: '#f5d9a8' },
  haldi: { p: '#8a5a0f', s: '#2a2110', a: '#b5532f', paper: '#fff9e9', cream: '#f0e2b8', gold: '#f7de9c' }
};
function themeVars(w) {
  const th = THEMES[clean(w.theme || w.theme_name).toLowerCase()] || THEMES.peacock;
  const p = hex6(w.primary_color) || th.p;
  const a = hex6(w.accent_color) || th.a;
  const paper = hex6(w.paper_color) || th.paper;
  const s = hex6(w.secondary_color) || (hex6(w.primary_color) ? mixc(p, '#000000', .62) : th.s);
  const cream = th.cream, gold = th.gold;
  const dark = mixc(p, '#000000', .3), ink = mixc(s, '#000000', .3), soft = mixc(p, '#ffffff', .9), mid = mixc(p, '#ffffff', .62);
  return `--p:${p};--p-dark:${dark};--p-soft:${soft};--p-mid:${mid};--p-rgb:${rgbOf(p).join(',')};--s:${s};--s-rgb:${rgbOf(s).join(',')};--a:${a};--a-rgb:${rgbOf(a).join(',')};--paper:${paper};--cream:${cream};--gold:${gold};--ink:${ink};--ink-rgb:${rgbOf(ink).join(',')}`;
}

/* ---------- Asset map ---------- */
const A = {
  cover: 't7-cover-dusk.webp', couple: 't7-couple-arch.webp', venue: 't7-venue-courtyard.webp', card: 't7-card-paper.webp',
  story: ['t7-story-meeting.webp', 't7-story-promise.webp', 't7-story-union.webp'],
  gallery: [1, 2, 3, 4, 5, 6].map(n => `t7-gallery-${pad(n)}.webp`),
  ev: { haldi: 't7-ritual-haldi.webp', mehendi: 't7-ritual-mehendi.webp', sangeet: 't7-ritual-sangeet.webp', puja: 't7-ritual-aiburo.webp', garland: 't7-ritual-malabadal.webp', vow: 't7-ritual-bibaho.webp', feast: 't7-ritual-reception.webp', baraat: 't7-ritual-baraat.webp', fallback: 't7-ritual-default.webp' }
};

/* ---------- Event kinds & icons ---------- */
const KINDS = [
  { re: /haldi|holud|ubtan|pithi|gaye/i, icon: 'flower', asset: A.ev.haldi, dress: { en: 'Marigold & Sunlit Yellow', bn: 'গাঁদা হলুদ ও সোনালি' }, c: '#e8b13a' },
  { re: /mehendi|mehndi|henna/i, icon: 'leaf', asset: A.ev.mehendi, dress: { en: 'Leaf Green & Pastels', bn: 'পাতা সবুজ ও হালকা রঙ' }, c: '#3d8a5a' },
  { re: /sangeet|cocktail|music|dhak|dandiya|garba/i, icon: 'music', asset: A.ev.sangeet, dress: { en: 'Festive & Jewel Tones', bn: 'উৎসবের রঙিন পোশাক' }, c: '#6a3d7a' },
  { re: /aiburo|aibhat|puja|pujo|shanti|ganesh|nandimukh|vrata/i, icon: 'lamp', asset: A.ev.puja, dress: { en: 'Traditional', bn: 'ঐতিহ্যবাহী' }, c: '#eadcc4' },
  { re: /mala\s*badal|jaimala|varmala|engagement|sagai|tilak|ring|ashirbad|aashirbad/i, icon: 'garland', asset: A.ev.garland, dress: { en: 'Traditional', bn: 'ঐতিহ্যবাহী' }, c: '#d9b27c' },
  { re: /phere|saat\s*paak|sampradan|sindoor|vivah|biye|bibaho|wedding|ceremony|kanyadan/i, icon: 'kalash', asset: A.ev.vow, dress: { en: 'Red, White & Gold', bn: 'লাল, সাদা ও সোনালি' }, c: '#b5322a' },
  { re: /reception|bou\s*bhat|boubhat|dinner|bhoj|feast|walima/i, icon: 'feast', asset: A.ev.feast, dress: { en: 'Formal Elegance', bn: 'অভিজাত পোশাক' }, c: '#075b60' },
  { re: /baraat|bor\s*boron|boron/i, icon: 'lamp', asset: A.ev.baraat, dress: { en: 'Royal Festive', bn: 'রাজকীয় উৎসব' }, c: '#b77a50' }
];
const DEFAULT_KIND = { icon: 'flower', asset: A.ev.fallback, dress: null, c: '#b77a50' };
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

const DEFAULT_STORY = [{ k: 's1', image: '' }, { k: 's2', image: '' }, { k: 's3', image: '' }];
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

/* ==========================================================================
   BOTANICAL ART — banana leaves are generated, not drawn by hand:
   torn edges, parallel side veins, drooping midrib, two-tone lit/shade halves.
   ========================================================================== */
const rnd = (seed, i) => { const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
function leaf(len, wid, droop, seed) {
  const N = 15;
  const Y = (x, y) => (y + droop * Math.pow(x / len, 2)).toFixed(1);
  const X = x => x.toFixed(1);
  const top = [], bot = [];
  let veins = '';
  for (let i = 0; i <= N; i++) {
    const x = len * i / N;
    const h = wid * Math.sin(Math.PI * Math.pow(i / N, .82));
    const inner = i > 1 && i < N - 1;
    const ht = inner && rnd(seed, i) > .6 ? h * (.35 + rnd(seed, i + 9) * .25) : h;
    const hb = inner && rnd(seed, i + 40) > .64 ? h * (.38 + rnd(seed, i + 21) * .25) : h;
    top.push([x, -ht]); bot.push([x, hb]);
    if (i > 0 && i < N) {
      const x2 = x + len / N * 1.15;
      veins += `M${X(x)} ${Y(x, 0)}L${X(x2)} ${Y(x2, -ht * .96)}M${X(x)} ${Y(x, 0)}L${X(x2)} ${Y(x2, hb * .96)}`;
    }
  }
  const up = 'M0 0' + top.map(([x, y]) => `L${X(x)} ${Y(x, y)}`).join('') + `L${X(len)} ${Y(len, 0)}Q${X(len / 2)} 0 0 0Z`;
  const lo = 'M0 0' + bot.map(([x, y]) => `L${X(x)} ${Y(x, y)}`).join('') + `L${X(len)} ${Y(len, 0)}Q${X(len / 2)} 0 0 0Z`;
  return `<path d="${up}" fill="url(#t7-lf-hi)" stroke="#0f4a36" stroke-width=".7" stroke-linejoin="round"/><path d="${lo}" fill="url(#t7-lf-lo)" stroke="#0f4a36" stroke-width=".7" stroke-linejoin="round"/><path d="${veins}" stroke="rgba(236,255,214,.3)" stroke-width=".6" fill="none"/><path d="M0 0Q${X(len / 2)} 0 ${X(len)} ${Y(len, 0)}" stroke="#d3ecaa" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}
const leafAt = (x, y, ang, len, wid, droop, seed, delay = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${ang})"><g class="t7-sway" style="animation-delay:${delay}s">${leaf(len, wid, droop, seed)}</g></g>`;

/* Hanging marigold + jasmine strand (hung from the canopy, sways softly) */
function strand(x, len, d) {
  let s = `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#7a5a2c" stroke-width=".8"/>`;
  for (let y = 8, i = 0; y < len; y += 11, i++) {
    s += i % 3 === 2
      ? `<use href="#t7-jas" transform="translate(${x} ${y}) scale(.9)"/>`
      : `<use href="#t7-mg" transform="translate(${x + (i % 2 ? .8 : -.8)} ${y}) scale(${(.3 - (y / len) * .06).toFixed(2)})"/>`;
  }
  s += `<path d="M${x} ${len}l-3 5 3 5 3-5z" fill="#b77a50"/>`;
  return `<g class="t7-strand" style="animation-delay:${d}s">${s}</g>`;
}
/* Canopy: two arching fans of leaves from the top corners + hanging strands */
const CANOPY = `<svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
${[[34, 205, 36, -10, 1, 0], [54, 170, 30, 6, 2, -1.5], [74, 140, 26, 18, 3, -3], [16, 215, 38, -22, 4, -2]].map(([a, l, w, dr, sd, dl]) => leafAt(-8, -6, a, l, w, dr, sd, dl)).join('')}
${[[146, 205, 36, 10, 5, -1], [126, 170, 30, -6, 6, -2.5], [106, 140, 26, -18, 7, -4], [164, 215, 38, 22, 8, -.5]].map(([a, l, w, dr, sd, dl]) => leafAt(408, -6, a, l, w, dr, sd, dl)).join('')}
${[[22, 62, 0], [46, 108, -1.2], [70, 78, -2.4], [94, 44, -.7]].map(([x, l, d]) => strand(x, l, d)).join('')}
${[[378, 62, -.4], [354, 108, -1.6], [330, 78, -2.8], [306, 44, -1.1]].map(([x, l, d]) => strand(x, l, d)).join('')}
</svg>`;

/* Banana plant clump with a hanging banana blossom (kela mocha) */
function clump(flip) {
  const ls = [[-104, 168, 24, 30], [-126, 150, 22, -26], [-80, 150, 22, 30], [-148, 124, 20, -34], [-56, 124, 20, 34]];
  return `<svg viewBox="0 0 240 250" aria-hidden="true" focusable="false"${flip ? ' style="transform:scaleX(-1)"' : ''}>
<defs><linearGradient id="t7-stem" x1="0" x2="1"><stop offset="0" stop-color="#9ccb72"/><stop offset=".6" stop-color="#4e8f4a"/><stop offset="1" stop-color="#2d6b3c"/></linearGradient></defs>
<path d="M104 250 Q100 190 112 126 L130 126 Q142 190 138 250Z" fill="url(#t7-stem)"/>
${ls.map(([a, l, w, dr], i) => leafAt(121, 126, a, l, w, dr, 20 + i, -i * .9)).join('')}
<g transform="translate(130 128)"><path d="M0 0C6 14 10 30 2 46C-8 36 -8 14 0 0Z" fill="#8c2f3f"/><path d="M0 4C4 16 6 30 1 42" stroke="#c9675c" stroke-width="1.2" fill="none"/><path d="M-3 18C2 22 6 26 7 32" stroke="#d98a78" stroke-width="1" fill="none"/></g></svg>`;
}
const CLUMP_L = clump(false), CLUMP_R = clump(true);

/* Dusk Rajbari scene — painted fallback for the cover photograph */
const COVER_SCENE = `<svg class="t7-scene" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="t7-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1c30"/><stop offset=".42" stop-color="#0d4650"/><stop offset=".62" stop-color="#b77a50"/><stop offset="1" stop-color="#f5d9a8"/></linearGradient>
<linearGradient id="t7-wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a47"/><stop offset="1" stop-color="#08202f"/></linearGradient>
<radialGradient id="t7-moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4d6"/><stop offset=".25" stop-color="#f5d9a8" stop-opacity=".7"/><stop offset="1" stop-color="#f5d9a8" stop-opacity="0"/></radialGradient>
<g id="t7-pal"><rect x="70" y="0" width="260" height="120" fill="#0a1a2a"/><path d="M96 0V-40Q130-86 164 -40V0ZM236 0V-40Q270-86 304-40V0Z" fill="#0a1a2a"/><path d="M158 0V-90Q200-170 242-90V0Z" fill="#0a1a2a"/><circle cx="200" cy="-146" r="7" fill="#0a1a2a"/><path d="M200-153v-20" stroke="#0a1a2a" stroke-width="2"/>
${[96, 146, 230, 280].map(x => `<path d="M${x} 118V62Q${x + 12} 40 ${x + 24} 62V118Z" fill="#f5d9a8" opacity=".85"/>`).join('')}<path d="M178 118V44Q200 8 222 44V118Z" fill="#ffe6b0" opacity=".95"/>
${[100, 150, 234, 284].map(x => `<path d="M${x} -2V-30Q${x + 8} -46 ${x + 16} -30V-2Z" fill="#b77a50" opacity=".7"/>`).join('')}</g>
</defs>
<rect width="400" height="800" fill="url(#t7-sky)"/>
<circle cx="296" cy="190" r="90" fill="url(#t7-moon)"/>
${[[40, 60], [96, 120], [150, 40], [210, 96], [262, 52], [330, 110], [370, 36], [60, 190], [120, 230], [24, 140]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.5}" fill="#fff4d6" opacity=".7"/>`).join('')}
<g transform="translate(0 520)"><use href="#t7-pal"/></g>
<rect y="640" width="400" height="160" fill="url(#t7-wat)"/>
<g transform="translate(0 760) scale(1 -.55)" opacity=".28"><use href="#t7-pal"/></g>
${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${30 + i * 8} ${664 + i * 18}H${370 - i * 8}" stroke="#f5d9a8" stroke-opacity=".${3 - (i > 4 ? 1 : 0)}" stroke-width="1" stroke-dasharray="${14 + i * 3} ${10 + i * 2}"/>`).join('')}
${[60, 110, 290, 340].map((x, i) => `<circle cx="${x}" cy="${690 + i % 2 * 22}" r="3" fill="#f5d9a8" opacity=".9"/><circle cx="${x}" cy="${690 + i % 2 * 22}" r="9" fill="#f5d9a8" opacity=".18"/>`).join('')}
</svg>`;

/* Shared SVG definitions (gradients, marigold, jasmine) — defined once */
const jasPetals = [0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-5.2" rx="2.7" ry="5.2" transform="rotate(${r})"/>`).join('');
const DEFS = `<svg class="t7-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="t7-lf-hi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6dd86"/><stop offset=".55" stop-color="#5ea65a"/><stop offset="1" stop-color="#2f7d52"/></linearGradient>
<linearGradient id="t7-lf-lo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb36a"/><stop offset=".55" stop-color="#2f7d52"/><stop offset="1" stop-color="#14513f"/></linearGradient>
<linearGradient id="t7-copper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5d9a8"/><stop offset=".45" stop-color="#b77a50"/><stop offset="1" stop-color="#e6b98a"/></linearGradient>
<radialGradient id="t7-wax" cx=".34" cy=".3" r=".75"><stop offset="0" stop-color="#e9a874"/><stop offset=".5" stop-color="#b77a50"/><stop offset="1" stop-color="#6e3f22"/></radialGradient>
<g id="t7-mg"><circle r="18" fill="#f2a31c"/><circle r="18" fill="none" stroke="#e07f0c" stroke-width="3.4" stroke-dasharray="5.2 3.1"/><circle r="12.6" fill="#f08a10"/><circle r="12.6" fill="none" stroke="#c96a0a" stroke-width="2.4" stroke-dasharray="3.8 2.5"/><circle r="6.6" fill="#c96a0a"/><circle r="2.6" fill="#f9c35a"/></g>
<g id="t7-jas"><g fill="#fffdf6" stroke="#e3d9c0" stroke-width=".6">${jasPetals}</g><circle r="1.7" fill="#f0c94b"/></g>
</defs></svg>`;

/* Ornaments */
const ORN = `<svg class="t7-orn" viewBox="0 0 220 20" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M4 10H92M128 10H216"/><path d="M110 2L118 10L110 18L102 10Z" fill="currentColor" stroke="none"/><circle cx="96" cy="10" r="1.6" fill="currentColor" stroke="none"/><circle cx="124" cy="10" r="1.6" fill="currentColor" stroke="none"/></g></svg>`;
const LOTUS = `<svg class="t7-lotus" viewBox="0 0 120 44" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M60 3C54 12 52 24 60 36C68 24 66 12 60 3Z"/><path d="M60 36C44 34 32 26 28 14C42 14 54 22 60 36Z"/><path d="M60 36C76 34 88 26 92 14C78 14 66 22 60 36Z"/><path d="M60 38C40 40 22 36 8 28C26 26 46 30 60 38Z"/><path d="M60 38C80 40 98 36 112 28C94 26 74 30 60 38Z"/></g></svg>`;

/* Copper wax seal with the couple's initials (initials switch language with the page) */
function waxPath() {
  const pts = Array.from({ length: 14 }, (_, k) => {
    const ang = k / 14 * Math.PI * 2, r = 43 + (k % 3 === 0 ? 4 : k % 2 ? -1.5 : 2);
    return [60 + r * Math.cos(ang), 60 + r * Math.sin(ang)];
  });
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const f = n => n.toFixed(1);
  const s0 = mid(pts[pts.length - 1], pts[0]);
  let d = `M${f(s0[0])} ${f(s0[1])}`;
  pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % pts.length]); d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; });
  return d + 'Z';
}
const sealSvg = (en, bn) => `<svg class="t7-seal-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
<path d="${waxPath()}" fill="url(#t7-wax)" stroke="#5a3119" stroke-width="1.2"/>
<circle cx="60" cy="60" r="33" fill="none" stroke="#f5d9a8" stroke-opacity=".7" stroke-width="1.4"/><circle cx="60" cy="60" r="29.5" fill="none" stroke="#3d2010" stroke-opacity=".45" stroke-width="1"/>
<path d="M36 40Q60 24 84 40" fill="none" stroke="#fff4d6" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
<text data-l="en" x="60" y="68" class="t7-seal-t">${esc(en)}</text><text data-l="bn" x="60" y="67" class="t7-seal-t t7-seal-bn">${esc(bn)}</text></svg>`;

/* Stamp & postmark (RSVP reply card) */
function stampSvg(en, bn) {
  const W = 62, H = 74, r = 2.7, gap = 7.4;
  let holes = '';
  for (let x = gap / 2; x < W; x += gap) holes += `<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
  for (let y = gap / 2; y < H; y += gap) holes += `<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
  return `<svg class="t7-stamp" viewBox="-3 -3 ${W + 6} ${H + 6}" aria-label="${esc(en)}" role="img"><defs><mask id="t7-stm"><rect x="-3" y="-3" width="${W + 6}" height="${H + 6}" fill="#fff"/><g fill="#000">${holes}</g></mask></defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="var(--p)" mask="url(#t7-stm)"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="1.5" fill="none" stroke="rgba(245,217,168,.6)" stroke-width=".8"/>
  <path d="M14 16Q31 8 48 16" stroke="rgba(245,217,168,.5)" stroke-width=".8" fill="none"/>
  <text data-l="en" x="31" y="44" class="t7-st">${esc(en)}</text><text data-l="bn" x="31" y="44" class="t7-st t7-st-bn">${esc(bn)}</text>
  <path d="M20 56H42" stroke="rgba(245,217,168,.6)" stroke-width=".8"/><circle cx="31" cy="62" r="1.6" fill="rgba(245,217,168,.8)"/></svg>`;
}
function postmark(city, date) {
  const txt = `${city} ✦ ${date} ✦`;
  return `<svg class="t7-postmark" viewBox="0 0 80 80" aria-hidden="true" focusable="false"><defs><path id="t7-pm" d="M40 40m-27 0a27 27 0 1 1 54 0a27 27 0 1 1-54 0"/></defs><g fill="none" stroke="var(--a)" stroke-width="1.2"><circle cx="40" cy="40" r="35"/><circle cx="40" cy="40" r="20"/></g><text font-size="7.6" font-weight="600" letter-spacing="1.2" fill="var(--a)" font-family="Hanken Grotesk,sans-serif"><textPath href="#t7-pm">${esc(txt.toUpperCase())}</textPath></text><path d="M30 40h20M32 44h16" stroke="var(--a)" stroke-width="1.2"/></svg>`;
}
const WHATSAPP = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z" stroke-linejoin="round"/><path d="M9 8.5c.2 3 3 5.8 6 6l1.2-1.4-2-1-.9.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.9-1-2z" fill="currentColor" stroke="none"/></svg>';
const CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
const GCAL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7v-5z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/></svg>';

/* ==========================================================================
   STYLESHEET
   ========================================================================== */
const STYLE = `
.t7,.t7 *,.t7 *:before,.t7 *:after{box-sizing:border-box}
.t7{--p:#075b60;--p-dark:#054246;--p-soft:#e6f0ee;--p-mid:#7fb0ac;--p-rgb:7,91,96;--s:#102a43;--s-rgb:16,42,67;--a:#b77a50;--a-rgb:183,122,80;--paper:#fff8ed;--cream:#eadcc4;--gold:#f5d9a8;--ink:#0b1d2f;--ink-rgb:11,29,47;--muted:rgba(var(--ink-rgb),.74);
  --f-disp:"Bodoni Moda","Noto Serif Bengali",Georgia,serif;--f-body:"Hanken Grotesk","Hind Siliguri",system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);--canopy:clamp(118px,38vw,230px);--leafr:0 clamp(34px,8vw,64px) 0 clamp(34px,8vw,64px);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;color:var(--ink);background:var(--paper);font:400 17px/1.65 var(--f-body);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.t7[data-lang="bn"]{--f-disp:"Noto Serif Bengali","Bodoni Moda",serif;--f-body:"Hind Siliguri",system-ui,sans-serif;line-height:1.85}
.t7[data-lang="bn"] i,.t7[data-lang="bn"] em{font-style:normal}
.t7[data-lang="bn"] [data-l="en"],.t7:not([data-lang="bn"]) [data-l="bn"]{display:none!important}
.t7 h1,.t7 h2,.t7 h3,.t7 p,.t7 figure{margin-top:0}
.t7 img{display:block;max-width:100%}
.t7 button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.t7 a{color:inherit}
.t7 [hidden]{display:none!important}
.t7 :focus-visible{outline:2px solid var(--a);outline-offset:3px}
.t7-wrap{position:relative;width:100%;max-width:1080px;margin:0 auto;padding:0 clamp(20px,5vw,40px)}
.t7-sec{position:relative;padding:clamp(76px,12vw,140px) 0}
.t7-sheet{z-index:2;border-radius:clamp(30px,7vw,84px) clamp(30px,7vw,84px) 0 0;margin-top:calc(-1 * clamp(30px,7vw,84px));padding-top:calc(clamp(76px,12vw,140px) + 10px)}
.t7-dark{color:var(--paper)}
.t7-ey{display:block;font:italic 500 clamp(16px,3.6vw,20px)/1.3 var(--f-disp);color:var(--a);margin:0 0 10px}
.t7-dark .t7-ey{color:var(--gold)}
.t7-h{font:500 clamp(34px,8.2vw,66px)/1.08 var(--f-disp);letter-spacing:-.01em;margin:0 0 14px;text-wrap:balance}
.t7-lead{max-width:520px;color:var(--muted);font-size:clamp(16px,2.4vw,18px)}
.t7-dark .t7-lead{color:rgba(255,248,237,.8)}
.t7-orn{display:block;width:min(220px,60%);height:auto;color:var(--a);margin:18px 0 0}
.t7-center{text-align:center}.t7-center .t7-orn,.t7-center .t7-lead{margin-left:auto;margin-right:auto}
.t7-dark .t7-orn{color:var(--gold)}

/* painted image fallback: a missing photo never leaves a hole */
.t7-ph{background:radial-gradient(circle at 30% 20%,rgba(245,217,168,.5),transparent 55%),linear-gradient(150deg,var(--p) 0%,var(--s) 100%);position:relative}
.t7-ph:after{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 44' fill='none' stroke='%23f5d9a8' stroke-opacity='.35' stroke-width='1.2'%3E%3Cpath d='M60 3C54 12 52 24 60 36C68 24 66 12 60 3Z'/%3E%3Cpath d='M60 36C44 34 32 26 28 14C42 14 54 22 60 36Z'/%3E%3Cpath d='M60 36C76 34 88 26 92 14C78 14 66 22 60 36Z'/%3E%3C/svg%3E") center/42% no-repeat;pointer-events:none}
.t7 img.t7-fi{position:relative;z-index:1;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .9s ease}
.t7 img.t7-fi.t7-loaded{opacity:1}
.t7 img.t7-failed{opacity:0!important}

/* motion language: clip reveals for pictures, perspective flips for paper, a short rise for text */
.t7-js [data-rv]{transition:opacity .9s var(--ease),transform 1s var(--ease),clip-path 1.3s var(--ease);transition-delay:var(--d,0s)}
.t7-js [data-rv="rise"]{opacity:0;transform:translateY(16px)}
.t7-js [data-rv="clip"]{clip-path:inset(0 0 100% 0)}
.t7-js [data-rv="clip"] img{transform:scale(1.22);transition:transform 1.6s var(--ease),opacity .9s ease;transition-delay:var(--d,0s)}
.t7-js [data-rv="flip"]{opacity:0;transform:perspective(1000px) rotateX(16deg) translateY(34px);transform-origin:50% 0}
.t7-js [data-rv].t7-in{opacity:1;transform:none;clip-path:inset(-90px)}
.t7-js [data-rv="clip"].t7-in img{transform:scale(1)}

/* buttons, language, progress, motes */
.t7-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 28px;border-radius:999px;border:1px solid rgba(255,255,255,.28);text-decoration:none;color:#fff9ee;font:600 16px var(--f-body);background:linear-gradient(135deg,var(--p),var(--p-dark));box-shadow:0 10px 26px rgba(var(--p-rgb),.34),inset 0 1px 0 rgba(255,255,255,.25);position:relative;overflow:hidden;transition:transform .35s var(--ease),box-shadow .35s}
.t7-btn:hover{transform:translateY(-2px);box-shadow:0 16px 32px rgba(var(--p-rgb),.4),inset 0 1px 0 rgba(255,255,255,.3)}
.t7-btn:before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(245,217,168,.5) 50%,transparent 70%);transform:translateX(-120%);transition:transform .8s var(--ease)}
.t7-btn:hover:before{transform:translateX(120%)}
.t7-btn.t7-copper{background:linear-gradient(135deg,#c78d60,var(--a) 55%,#8c5532);box-shadow:0 10px 26px rgba(var(--a-rgb),.4),inset 0 1px 0 rgba(255,255,255,.35)}
.t7-btn.t7-ghost{background:transparent;color:var(--p);border:1.5px solid currentColor;box-shadow:none}
.t7-dark .t7-btn.t7-ghost{color:var(--gold)}
.t7-btn > *{position:relative}
.t7-lang{display:inline-flex;gap:2px;padding:3px;border-radius:999px;background:rgba(255,248,237,.92);border:1px solid rgba(var(--a-rgb),.5);box-shadow:0 4px 14px rgba(var(--s-rgb),.2);backdrop-filter:blur(8px)}
.t7-lang button{min-width:44px;height:32px;padding:0 10px;border:0;border-radius:999px;background:transparent;color:var(--s);font:700 13px "Hind Siliguri",var(--f-body);transition:background .3s,color .3s}
.t7-lang button[aria-pressed="true"]{background:var(--s);color:var(--gold)}
.t7-lang-float{position:fixed;z-index:70;top:max(12px,env(safe-area-inset-top));right:12px}
.t7-entry .t7-lang{position:absolute;z-index:12;top:max(12px,env(safe-area-inset-top));right:12px}
.t7-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--gold),var(--a),var(--p))}
.t7-motes{position:fixed;inset:0;z-index:40;pointer-events:none;overflow:hidden}
.t7-mote{position:absolute;bottom:-20px;left:var(--l);width:var(--s);height:var(--s);border-radius:50%;background:radial-gradient(circle,#fff4d6,rgba(245,217,168,0) 70%);opacity:0;animation:t7-mote var(--d) linear infinite;animation-delay:var(--dl)}
@keyframes t7-mote{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:.8}88%{opacity:.5}100%{transform:translate3d(var(--x),-112vh,0);opacity:0}}
.t7-music{display:none;position:fixed;z-index:60;right:14px;bottom:max(14px,env(safe-area-inset-bottom));width:48px;height:48px;border-radius:50%;border:1px solid rgba(var(--a-rgb),.7);background:linear-gradient(135deg,var(--s),var(--p-dark));color:var(--gold);font-size:19px;box-shadow:0 8px 22px rgba(var(--s-rgb),.35)}
.t7-js .t7-music.t7-has{display:block}
.t7-music[aria-pressed="true"]{background:linear-gradient(135deg,#c78d60,var(--a));color:#fff}

/* botanical layers */
.t7-canopy{position:absolute;top:0;left:0;right:0;height:var(--canopy);pointer-events:none;z-index:4;transform:translateY(calc(var(--sy,0) * -.07px))}
.t7-canopy svg{display:block;width:100%;height:100%;overflow:visible}
.t7-sway{transform-origin:0 0;animation:t7-leaf 8s ease-in-out infinite alternate}
@keyframes t7-leaf{from{transform:rotate(-1.4deg)}to{transform:rotate(2deg)}}
.t7-strand{transform-box:fill-box;transform-origin:50% 0;animation:t7-strand 5.2s ease-in-out infinite alternate}
@keyframes t7-strand{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
.t7-clump{position:absolute;bottom:0;width:clamp(120px,34vw,250px);pointer-events:none;z-index:1}
.t7-clump svg{display:block;width:100%;height:auto}
.t7-clump-l{left:-3%}.t7-clump-r{right:-3%}

/* ===== ENTRANCE: the sealed envelope ===== */
.t7-entry{position:fixed;inset:0;z-index:900;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#0a1c30;perspective:1600px}
.t7-entry .t7-scene,.t7-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.t7-entry-veil{position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 48%,rgba(245,217,168,.18),transparent 70%),linear-gradient(180deg,rgba(10,28,48,.55),rgba(7,91,96,.25) 55%,rgba(10,28,48,.7))}
.t7-stage{position:relative;z-index:6;display:flex;flex-direction:column;align-items:center;gap:clamp(20px,4vh,34px);padding:calc(var(--canopy) * .55) 16px 28px;width:100%}
.t7-env-wrap{width:min(88vw,400px);transform-origin:50% 55%}
.t7-env{position:relative;width:100%;aspect-ratio:10/7;perspective:1500px;animation:t7-float 6s ease-in-out infinite alternate;filter:drop-shadow(0 34px 40px rgba(0,0,0,.45))}
@keyframes t7-float{from{transform:translateY(-5px) rotateX(2deg)}to{transform:translateY(7px) rotateX(-1deg)}}
.t7-env>*{position:absolute}
.t7-env-back{inset:0;border-radius:6px;background:linear-gradient(160deg,#18506b,#0b2338)}
.t7-env-card{inset:7% 6% 5% 6%;z-index:3;border-radius:3px;background:linear-gradient(180deg,#fffdf6,var(--paper) 60%,#f1e4cc);box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;padding:clamp(10px,3vw,16px) 8px 0;text-align:center;color:var(--s);overflow:hidden}
.t7-env-card:before{content:"";position:absolute;inset:6px;border:1px solid rgba(var(--a-rgb),.65);border-radius:2px;pointer-events:none}
.t7-env-card .t7-lotus{width:clamp(34px,10vw,48px);color:var(--a)}
.t7-ec-t{font:italic 500 clamp(18px,5.4vw,26px)/1.1 var(--f-disp);color:var(--p)}
.t7-ec-n{font:500 clamp(12px,3.4vw,16px)/1.2 var(--f-disp);color:var(--s)}
.t7-env-front{inset:0;z-index:4;border-radius:6px;clip-path:polygon(0 0,50% 54%,100% 0,100% 100%,0 100%);background:linear-gradient(170deg,#1f5a76 0%,#123a55 45%,#0b2338 100%)}
.t7-env-front:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.035) 0 2px,transparent 2px 7px)}
.t7-env-front svg{position:absolute;inset:0;width:100%;height:100%}
.t7-env-to{position:absolute;left:0;right:0;bottom:11%;text-align:center;padding:0 12%;color:var(--gold);font:italic 500 clamp(14px,4vw,19px)/1.25 var(--f-disp)}
.t7-env-to span{display:block;font-size:.8em;color:rgba(245,217,168,.75)}
.t7-env-to b{display:block;font-weight:500;color:#fff8ed;font-style:normal;font-size:1.12em;overflow-wrap:anywhere}
.t7-flap{left:0;right:0;top:0;height:54%;z-index:5;transform-origin:50% 0;transform-style:preserve-3d}
.t7-flap i{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;clip-path:polygon(0 0,100% 0,50% 100%)}
.t7-flap .t7-fa{background:linear-gradient(165deg,#2a6c86,#14405c 60%,#0c2a42)}
.t7-flap .t7-fa:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(245,217,168,.18))}
.t7-flap .t7-fb{transform:rotateX(180deg);background:linear-gradient(180deg,var(--p) 0%,var(--p-dark) 100%)}
.t7-flap .t7-fb:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0,rgba(245,217,168,.35) 0 2px,transparent 2.5px) 0 0/14px 14px}
.t7-flap-line{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;backface-visibility:hidden}
.t7-seal{position:absolute;z-index:8;left:50%;top:54%;width:clamp(62px,19vw,86px);height:clamp(62px,19vw,86px);margin:calc(clamp(62px,19vw,86px) / -2) 0 0 calc(clamp(62px,19vw,86px) / -2);border:0;padding:0;background:transparent;border-radius:50%;filter:drop-shadow(0 6px 8px rgba(0,0,0,.5));animation:t7-pulse 2.6s ease-in-out infinite;transition:transform .3s var(--ease)}
.t7-seal:hover{transform:scale(1.07)}
.t7-seal-svg{display:block;width:100%;height:100%}
.t7-seal-t{font:italic 500 28px "Bodoni Moda","Noto Serif Bengali",serif;fill:#fff0cf;text-anchor:middle;letter-spacing:.5px;paint-order:stroke;stroke:#5a3119;stroke-width:.8px}
.t7-seal-bn{font:600 24px "Noto Serif Bengali",serif;font-style:normal}
@keyframes t7-pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,217,168,.5)}50%{box-shadow:0 0 0 16px rgba(245,217,168,0)}}
.t7-hint{max-width:300px;text-align:center;color:var(--gold);font:italic 500 clamp(15px,3.6vw,18px)/1.4 var(--f-disp);text-shadow:0 1px 8px rgba(0,0,0,.5)}
.t7-flare{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(255,244,214,.95) 0,rgba(245,217,168,.5) 22%,transparent 60%)}
.t7-spark{position:fixed;z-index:9999;width:var(--z);height:var(--z);margin:calc(var(--z) / -2) 0 0 calc(var(--z) / -2);border-radius:50%;background:radial-gradient(circle,#fff,#f5d9a8 55%,transparent 72%);pointer-events:none}
/* opening choreography (≈2.8s): crack → flap → card rises → dive through → veil lifts */
.t7-opening .t7-seal{animation:t7-crack .55s var(--ease) forwards;pointer-events:none}
.t7-opening .t7-env{animation:none}
.t7-opening .t7-flap{animation:t7-flap 1s .3s cubic-bezier(.55,0,.25,1) forwards}
.t7-opening .t7-env-card{animation:t7-rise 1s .95s cubic-bezier(.3,.8,.25,1) forwards}
.t7-opening .t7-env-wrap{animation:t7-dive .85s 1.85s cubic-bezier(.6,0,.9,.4) forwards}
.t7-opening .t7-hint{animation:t7-gone .4s forwards}
.t7-opening .t7-flare{animation:t7-flare 1.1s 1.9s ease-in forwards}
.t7-opening{animation:t7-veil .7s 2.15s ease forwards}
.t7-opening .t7-canopy,.t7-opening .t7-clump{animation:t7-gone .7s 2.1s forwards}
@keyframes t7-crack{0%{transform:scale(1)}30%{transform:scale(1.18) rotate(-4deg)}100%{transform:scale(.2) rotate(18deg);opacity:0}}
@keyframes t7-flap{0%{transform:rotateX(0);z-index:5}49%{z-index:5}50%{z-index:1}100%{transform:rotateX(-180deg);z-index:1}}
@keyframes t7-rise{to{transform:translateY(-46%) scale(1.04)}}
@keyframes t7-dive{to{transform:scale(3.4) translateY(10%);opacity:0}}
@keyframes t7-gone{to{opacity:0}}
@keyframes t7-flare{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
@keyframes t7-veil{to{opacity:0;visibility:hidden}}

.t7-entry .t7-cover-img{opacity:0;transition:opacity 1s ease}
.t7-entry .t7-cover-img.t7-loaded{opacity:1}
.t7-ven-bg img{opacity:0;transition:opacity 1s ease}
.t7-ven-bg img.t7-loaded{opacity:1}
.t7-hero .t7-clump{bottom:clamp(30px,7vw,84px)}

/* ===== HERO: arched window under the canopy ===== */
.t7-hero{position:relative;z-index:1;min-height:100svh;display:flex;justify-content:center;text-align:center;padding:calc(var(--canopy) * .9) 18px clamp(130px,26vw,200px);background:radial-gradient(ellipse 80% 40% at 50% 0,rgba(245,217,168,.55),transparent 70%),linear-gradient(180deg,var(--paper),#f7ecd6)}
.t7-hero-in{position:relative;z-index:3;width:100%;max-width:640px;display:flex;flex-direction:column;align-items:center;gap:6px}
.t7-invoc{font:italic 500 clamp(15px,3.8vw,19px)/1.3 var(--f-disp);color:var(--a);margin:0}
.t7-title{font:500 clamp(30px,8vw,48px)/1.1 var(--f-disp);color:var(--s);margin:0 0 10px}
.t7-arch{position:relative;width:min(74vw,330px);aspect-ratio:3/4;margin:6px auto 0}
.t7-arch:before{content:"";position:absolute;inset:-11px;border:1px solid var(--a);border-radius:999px 999px 18px 18px;opacity:.8}
.t7-arch:after{content:"";position:absolute;inset:-22px;border:1px solid rgba(var(--a-rgb),.35);border-radius:999px 999px 26px 26px}
.t7-arch-in{position:absolute;inset:0;border-radius:999px 999px 14px 14px;overflow:hidden;box-shadow:0 30px 60px rgba(var(--s-rgb),.32)}
.t7-arch-in img{object-position:center 22%;transform:translateY(calc(var(--sy,0) * .03px)) scale(1.08)}
.t7-arch-in:after{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,transparent 55%,rgba(var(--s-rgb),.35));pointer-events:none}
.t7-sub{margin:34px 0 0;font:italic 500 clamp(16px,3.8vw,20px) var(--f-disp);color:var(--p)}
.t7-names{font:500 clamp(40px,11.5vw,82px)/1.02 var(--f-disp);color:var(--s);margin:0;text-wrap:balance;letter-spacing:-.015em}
.t7-names i{display:block;font:italic 400 .56em/1.1 var(--f-disp);color:var(--a);margin:2px 0}
.t7-hero-copy{max-width:470px;margin:8px auto 0;color:var(--muted);font:italic 400 clamp(16px,3.6vw,19px)/1.55 var(--f-disp)}
.t7-plate{position:relative;margin-top:22px;padding:14px 34px 12px;background:linear-gradient(180deg,#fffdf6,#f5e8cf);border:1px solid var(--a);box-shadow:0 14px 32px rgba(var(--s-rgb),.16);clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,14px 100%,0 50%);max-width:100%}
.t7-plate-sal{display:block;font:italic 400 15px var(--f-disp);color:var(--a)}
.t7-plate-name{font:500 clamp(20px,5vw,27px)/1.2 var(--f-disp);color:var(--s);margin:0 0 4px;overflow-wrap:anywhere}
.t7-pill{display:inline-block;padding:2px 14px;border-radius:999px;background:rgba(var(--p-rgb),.1);border:1px solid rgba(var(--p-rgb),.35);font:600 12.5px var(--f-body);color:var(--p)}
.t7-cue{display:block;width:1px;height:46px;margin:24px auto 0;background:linear-gradient(var(--a),transparent);transform-origin:top;animation:t7-cue 2.4s ease-in-out infinite}
@keyframes t7-cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}

/* ===== COUNTDOWN: rings on midnight sapphire ===== */
.t7-sec-cd{background:radial-gradient(ellipse 70% 60% at 50% 0,rgba(var(--p-rgb),.6),transparent 70%),linear-gradient(180deg,var(--s),#0a1c30);overflow:hidden}
.t7-sec-cd:before{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(245,217,168,.5) 0 1px,transparent 1.5px) 0 0/46px 46px;opacity:.18}
.t7-sec-cd .t7-wrap{z-index:2}
.t7-rings{display:flex;justify-content:center;flex-wrap:wrap;gap:clamp(14px,4vw,40px);margin-top:36px}
.t7-unit{display:flex;flex-direction:column;align-items:center;gap:8px}
.t7-ring{position:relative;width:clamp(68px,19.5vw,118px);aspect-ratio:1/1;display:grid;place-items:center}
.t7-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.t7-rt{fill:none;stroke:rgba(245,217,168,.18);stroke-width:3}
.t7-rf{fill:none;stroke:url(#t7-copper);stroke-width:3.6;stroke-linecap:round;stroke-dasharray:289;stroke-dashoffset:289;transition:stroke-dashoffset .9s var(--ease)}
.t7-ring b{font:500 clamp(22px,6.2vw,38px)/1 var(--f-disp);color:var(--paper);font-variant-numeric:tabular-nums}
.t7-ring b.t7-tick{animation:t7-tick .5s var(--ease)}
@keyframes t7-tick{from{transform:translateY(-30%);opacity:0}to{transform:none;opacity:1}}
.t7-unit small{font:600 13px var(--f-body);color:var(--gold)}
.t7-togo{margin:34px 0 0;font:italic 500 clamp(18px,4.4vw,24px) var(--f-disp);color:var(--gold)}

/* ===== JOURNEY: a line that draws itself as you scroll ===== */
.t7-sec-story{background:linear-gradient(180deg,var(--paper),var(--cream) 55%,var(--paper));padding-bottom:clamp(90px,14vw,160px)}
.t7-poem{max-width:620px;margin:0 0 clamp(54px,9vw,96px)}
.t7-poem p{margin:0;font:italic 400 clamp(21px,5vw,32px)/1.45 var(--f-disp);color:var(--p)}
.t7-poem small{display:block;margin-top:14px;font:600 15px var(--f-body);color:var(--a)}
.t7-journey{position:relative;margin-top:clamp(36px,6vw,60px)}
.t7-journey:before{content:"";position:absolute;left:clamp(14px,4vw,22px);top:0;bottom:0;width:1px;background:rgba(var(--a-rgb),.25)}
.t7-line{position:absolute;left:clamp(14px,4vw,22px);top:0;bottom:0;width:2px;margin-left:-.5px;background:linear-gradient(var(--a),var(--gold));transform-origin:top;transform:scaleY(var(--jp,0))}
.t7-chap{position:relative;display:grid;gap:18px;padding:0 0 clamp(54px,9vw,90px) clamp(44px,11vw,64px)}
.t7-chap:last-child{padding-bottom:0}
.t7-chap:before{content:"";position:absolute;left:clamp(8px,2.8vw,16px);top:8px;width:14px;height:14px;border:2px solid var(--a);background:var(--paper);transform:rotate(45deg)}
.t7-chap-img{position:relative;width:min(78%,340px);aspect-ratio:4/5;border-radius:999px 999px 14px 14px;overflow:hidden;box-shadow:0 24px 48px rgba(var(--s-rgb),.22)}
.t7-chap:nth-child(odd) .t7-chap-img{border-radius:14px 14px 999px 999px}
.t7-chap-img img{object-position:center 22%}
.t7-chap-n{font:italic 400 clamp(54px,14vw,96px)/.9 var(--f-disp);color:transparent;-webkit-text-stroke:1px var(--a);margin:0 0 6px}
.t7-chap h3{font:500 clamp(26px,6.4vw,40px)/1.15 var(--f-disp);color:var(--s);margin:0 0 8px}
.t7-chap p{margin:0;color:var(--muted);max-width:430px;font-size:clamp(16px,2.4vw,18px)}

/* ===== INVITATION CARD ===== */
.t7-sec-card{background:radial-gradient(ellipse 70% 50% at 50% 100%,rgba(var(--a-rgb),.28),transparent 70%),linear-gradient(170deg,var(--p) 0%,var(--p-dark) 45%,var(--s) 100%);overflow:hidden}
.t7-sec-card:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(245,217,168,.045) 0 1px,transparent 1px 22px),repeating-linear-gradient(-45deg,rgba(245,217,168,.045) 0 1px,transparent 1px 22px)}
.t7-stage3d{position:relative;perspective:1200px;margin:40px auto 0;max-width:540px}
.t7-card{position:relative;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .5s var(--ease);transform-style:preserve-3d;padding:clamp(34px,8vw,58px) clamp(24px,7vw,48px);text-align:center;color:var(--s);background:linear-gradient(180deg,#fffdf6,var(--paper) 55%,#f3e6cd);box-shadow:0 40px 80px rgba(0,0,0,.4),0 0 0 1px rgba(var(--a-rgb),.4);overflow:hidden;border-radius:4px 4px 120px 120px / 4px 4px 56px 56px}
.t7-card-art{position:absolute;inset:0;opacity:.16;mix-blend-mode:multiply}
.t7-card:before{content:"";position:absolute;inset:10px;border:1px solid var(--a);border-radius:2px 2px 110px 110px / 2px 2px 48px 48px;pointer-events:none;z-index:2}
.t7-card:after{content:"";position:absolute;inset:16px;border:1px solid rgba(var(--a-rgb),.4);border-radius:2px 2px 104px 104px / 2px 2px 42px 42px;pointer-events:none;z-index:2}
.t7-card>*:not(.t7-card-art){position:relative;z-index:3}
.t7-card .t7-lotus{width:64px;color:var(--a);margin:0 auto 10px}
.t7-card .t7-invoc{margin-bottom:6px}
.t7-card h3{font:italic 500 clamp(24px,6vw,34px)/1.15 var(--f-disp);color:var(--p);margin:4px 0 10px}
.t7-card .t7-fam{font:600 15px var(--f-body);color:var(--a);margin:0 0 8px}
.t7-card p{margin:0 0 6px;color:var(--muted);font:400 clamp(16px,3.6vw,18px)/1.55 var(--f-disp)}
.t7-card .t7-cn{font:500 clamp(34px,9.5vw,54px)/1.05 var(--f-disp);color:var(--s);margin:12px 0 10px;text-wrap:balance}
.t7-card .t7-cn i{display:block;font:italic 400 .5em/1.2 var(--f-disp);color:var(--a)}
.t7-card .t7-lg{margin:18px auto 0;padding-top:16px;border-top:1px solid rgba(var(--a-rgb),.5);max-width:340px}
.t7-card .t7-lg em{display:block;font:italic 500 17px var(--f-disp);color:var(--a);margin-bottom:2px}
.t7-card .t7-lg strong{display:block;font:500 clamp(22px,5.6vw,30px)/1.2 var(--f-disp);color:var(--s)}
.t7-card .t7-lg span.t7-w{display:block;margin-top:6px;font:500 clamp(16px,3.8vw,19px)/1.4 var(--f-disp);color:var(--p)}
.t7-card .t7-pres{margin:18px 0 12px;font-style:italic}
.t7-card .t7-cts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:6px}
.t7-cts a{display:inline-block;padding:6px 16px;border-radius:999px;border:1px solid rgba(var(--p-rgb),.4);text-decoration:none;font:600 15px var(--f-body);color:var(--p)}

/* ===== EVENTS: day tabs + leaf-cornered rows ===== */
.t7-sec-ev{background:linear-gradient(180deg,var(--paper),#f9efdb)}
.t7-tabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:28px 0 8px;padding:2px 0 6px;-webkit-overflow-scrolling:touch}
.t7-tabs::-webkit-scrollbar{display:none}
.t7-tab{flex:0 0 auto;padding:10px 20px;border-radius:999px;border:1px solid rgba(var(--p-rgb),.4);background:transparent;color:var(--p);font:600 15px var(--f-body);transition:background .3s,color .3s,border-color .3s}
.t7-tab[aria-selected="true"]{background:var(--p);color:#fff8ed;border-color:var(--p);box-shadow:0 8px 18px rgba(var(--p-rgb),.3)}
.t7-day{font:italic 500 clamp(19px,4.6vw,24px) var(--f-disp);color:var(--a);margin:22px 0 4px}
.t7-evs{display:grid;gap:clamp(40px,7vw,72px);margin-top:26px}
.t7-ev{display:grid;gap:18px}
.t7-ev-img{position:relative;aspect-ratio:16/11;border-radius:var(--leafr);overflow:hidden;box-shadow:0 22px 44px rgba(var(--s-rgb),.2)}
.t7-ev-img img{object-position:center 22%}
.t7-ev-top{display:flex;align-items:flex-start;gap:16px}
.t7-ev-date{flex:0 0 auto;min-width:58px;text-align:center;border-right:1px solid rgba(var(--a-rgb),.5);padding-right:16px}
.t7-ev-date b{display:block;font:500 clamp(38px,10vw,54px)/.95 var(--f-disp);color:var(--a)}
.t7-ev-date small{font:600 13px var(--f-body);color:var(--p)}
.t7-ev h3{font:500 clamp(24px,6vw,36px)/1.15 var(--f-disp);color:var(--s);margin:0}
.t7-ev .t7-local{display:block;font:500 16px "Noto Serif Bengali",serif;color:var(--a);margin-top:2px}
.t7-meta{display:flex;align-items:center;gap:10px;margin:6px 0 0;font:500 16px var(--f-body);color:var(--ink)}
.t7-meta svg{flex:0 0 auto;color:var(--a)}
.t7-desc{margin:10px 0 12px;color:var(--muted);font-size:16.5px;max-width:520px}
.t7-dress{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 10px;border-radius:999px;border:1px solid rgba(var(--p-rgb),.35);background:rgba(var(--p-rgb),.06);font:600 14px var(--f-body)}
.t7-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(0,0,0,.25)}

/* ===== CALENDAR ===== */
.t7-sec-cal{background:linear-gradient(180deg,#f9efdb,var(--cream))}
.t7-cal{display:grid;gap:34px;align-items:center}
.t7-bigd{font:400 clamp(110px,34vw,230px)/.82 var(--f-disp);color:transparent;-webkit-text-stroke:1.2px var(--a);letter-spacing:-.03em;margin:0}
.t7-bigm{font:italic 500 clamp(24px,6vw,34px) var(--f-disp);color:var(--p);margin:8px 0 0}
.t7-cal-time{margin:6px 0 0;font:500 clamp(17px,4vw,20px) var(--f-disp);color:var(--ink)}
.t7-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:380px;font:500 16px var(--f-body);padding:20px;background:rgba(255,253,246,.8);border:1px solid rgba(var(--a-rgb),.4);border-radius:var(--leafr);box-shadow:0 18px 40px rgba(var(--s-rgb),.1)}
.t7-cal-h{text-align:center;font:600 12.5px var(--f-body);color:var(--a);padding:4px 0}
.t7-cal-d{aspect-ratio:1;display:grid;place-items:center;border-radius:50%;color:var(--ink);position:relative}
.t7-cal-on{background:linear-gradient(135deg,#c78d60,var(--a));color:#fff!important;box-shadow:0 6px 14px rgba(var(--a-rgb),.45);font-weight:700}
.t7-cal-dot:after{content:"";position:absolute;bottom:3px;left:50%;width:4px;height:4px;border-radius:50%;background:var(--p);transform:translateX(-50%)}
.t7-cal-act{margin-top:22px}

/* ===== GALLERY: leaf-cornered mosaic ===== */
.t7-sec-gal{background:var(--paper)}
.t7-mosaic{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:clamp(130px,38vw,230px);grid-auto-flow:dense;gap:clamp(8px,2vw,14px);margin-top:34px}
.t7-g{position:relative;padding:0;border:0;cursor:zoom-in;overflow:hidden;border-radius:var(--leafr);box-shadow:0 14px 30px rgba(var(--s-rgb),.16);background:var(--p)}
.t7-g:nth-child(odd){border-radius:clamp(34px,8vw,64px) 0 clamp(34px,8vw,64px) 0}
.t7-g:nth-child(4n+1){grid-row:span 2}
.t7-g:nth-child(5n+3){grid-column:span 2}
.t7-g img{transition:transform 1.2s var(--ease),opacity .9s}
.t7-g:hover img{transform:scale(1.07)}
.t7-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(8,20,34,.94);animation:t7-fade .3s ease}
@keyframes t7-fade{from{opacity:0}to{opacity:1}}
.t7-lb img{max-width:min(94vw,920px);max-height:84vh;border-radius:6px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.t7-lb button{position:absolute;width:48px;height:48px;border-radius:50%;border:1px solid rgba(245,217,168,.6);background:rgba(16,42,67,.7);color:var(--gold);font-size:22px;display:grid;place-items:center}
.t7-lb .t7-lb-x{top:max(14px,env(safe-area-inset-top));right:14px}.t7-lb .t7-lb-p{left:12px;top:50%}.t7-lb .t7-lb-n{right:12px;top:50%}

/* ===== VENUE: full-bleed photograph, glass pavilion ===== */
.t7-sec-ven{min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;padding-top:clamp(120px,24vw,220px);color:var(--paper)}
.t7-ven-bg{position:absolute;inset:0;z-index:0;background:linear-gradient(150deg,var(--p),var(--s))}
.t7-ven-bg img{position:absolute;inset:-6% 0;width:100%;height:112%;object-fit:cover;object-position:center 40%;transform:translateY(calc(var(--vy,0) * 1px))}
.t7-ven-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(var(--s-rgb),.7) 0%,rgba(var(--s-rgb),.25) 35%,rgba(var(--s-rgb),.9) 100%)}
.t7-sec-ven .t7-wrap{z-index:2}
.t7-pavilion{margin-top:40px;max-width:560px;padding:clamp(26px,6vw,42px);border-radius:var(--leafr);background:rgba(255,248,237,.12);border:1px solid rgba(245,217,168,.5);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 30px 60px rgba(0,0,0,.35)}
.t7-pavilion h3{font:500 clamp(28px,7vw,44px)/1.12 var(--f-disp);margin:0 0 10px}
.t7-pavilion p{margin:0 0 20px;color:rgba(255,248,237,.88);font-size:17px}
.t7-vbtns{display:flex;flex-wrap:wrap;gap:10px}
.t7-chips{display:grid;gap:10px;margin-top:20px}
.t7-chipc{display:grid;grid-template-columns:30px 1fr;gap:10px;padding:14px 16px;border-radius:14px;background:rgba(var(--s-rgb),.5);border:1px solid rgba(245,217,168,.3);font-size:16px}
.t7-chipc span{font-size:19px;color:var(--gold)}
.t7-chipc p{margin:0;color:var(--paper)}

/* ===== RSVP: a reply card with notched edges ===== */
.t7-sec-rsvp{background:radial-gradient(ellipse 70% 40% at 50% 0,rgba(255,255,255,.55),transparent 70%),linear-gradient(180deg,var(--cream),#e3d2b5)}
.t7-rsvp{position:relative;max-width:460px;margin:34px auto 0;padding:48px 24px 26px;background:linear-gradient(180deg,#fffdf6,var(--paper));box-shadow:0 30px 60px rgba(var(--s-rgb),.22);-webkit-mask:radial-gradient(circle 11px at 0 38px,transparent 98%,#000) left/51% 100% no-repeat,radial-gradient(circle 11px at 100% 38px,transparent 98%,#000) right/51% 100% no-repeat;mask:radial-gradient(circle 11px at 0 38px,transparent 98%,#000) left/51% 100% no-repeat,radial-gradient(circle 11px at 100% 38px,transparent 98%,#000) right/51% 100% no-repeat}
.t7-rsvp:before{content:"";position:absolute;inset:8px;border:1px dashed rgba(var(--a-rgb),.55);pointer-events:none}
.t7-stamp{position:absolute;top:10px;right:20px;width:62px;height:auto;transform:rotate(5deg);filter:drop-shadow(0 6px 8px rgba(0,0,0,.25));z-index:3}
.t7-st{font:italic 500 21px "Bodoni Moda",serif;fill:#fff4ea;text-anchor:middle}
.t7-st-bn{font:600 19px "Noto Serif Bengali",serif;font-style:normal}
.t7-postmark{position:absolute;top:2px;right:70px;width:76px;height:76px;transform:rotate(-14deg);opacity:.45;z-index:2;pointer-events:none}
.t7-lab{display:block;font:500 19px var(--f-disp);color:var(--s);margin:0 0 8px}
.t7-fld{margin:0 0 22px;position:relative}
.t7-input{width:100%;height:54px;border-radius:12px;border:1.5px solid rgba(var(--p-rgb),.35);background:rgba(var(--p-rgb),.05);padding:0 16px;font:500 18px var(--f-body);color:var(--ink);outline:none;transition:border-color .3s,box-shadow .3s;-webkit-appearance:none;appearance:none}
textarea.t7-input{height:108px;padding:12px 16px;resize:none;line-height:1.5}
.t7-input:focus{border-color:var(--p);box-shadow:0 0 0 4px rgba(var(--p-rgb),.14)}
.t7-opt{display:flex;align-items:center;gap:12px;width:100%;min-height:52px;margin:0 0 10px;padding:0 16px;border-radius:12px;border:1.5px solid rgba(var(--p-rgb),.35);background:transparent;font:500 18px var(--f-disp);color:var(--ink);text-align:left;transition:background .3s,color .3s,border-color .3s,box-shadow .3s}
.t7-rd{flex:0 0 auto;width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(var(--p-rgb),.5);display:grid;place-items:center;color:var(--p);transition:background .3s,border-color .3s}
.t7-rd svg{opacity:0;transform:scale(.4);transition:opacity .25s,transform .3s var(--ease)}
.t7-opt[aria-pressed="true"]{background:var(--p);border-color:var(--p);color:#fff8ed;box-shadow:0 12px 24px rgba(var(--p-rgb),.3)}
.t7-opt[aria-pressed="true"] .t7-rd{background:var(--gold);border-color:var(--gold);color:var(--s)}
.t7-opt[aria-pressed="true"] .t7-rd svg,.t7-chip[aria-pressed="true"] .t7-rd svg{opacity:1;transform:none}
.t7-step{display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 8px;border-radius:999px;border:1.5px solid rgba(var(--p-rgb),.35)}
.t7-step button{width:44px;height:44px;border-radius:50%;border:0;background:linear-gradient(135deg,#c78d60,var(--a));color:#fff;font:600 26px/1 var(--f-body);display:grid;place-items:center;box-shadow:0 6px 14px rgba(var(--a-rgb),.35);transition:transform .2s var(--ease)}
.t7-step button:active{transform:scale(.9)}
.t7-step output{font:italic 500 30px var(--f-disp);color:var(--s)}
.t7-step output small{font:600 16px var(--f-body);font-style:normal;color:var(--muted);margin-left:6px}
.t7-chips-row{display:flex;flex-wrap:wrap;gap:10px}
.t7-chip{flex:1 1 auto;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px 0 8px;border-radius:999px;border:1.5px solid rgba(var(--p-rgb),.35);background:transparent;font:500 16px var(--f-disp);color:var(--ink);transition:background .3s,border-color .3s}
.t7-chip .t7-rd{width:24px;height:24px}
.t7-chip small{margin-left:auto;font:500 13px var(--f-body);color:var(--muted)}
.t7-chip[aria-pressed="true"]{border-color:var(--p);background:rgba(var(--p-rgb),.09)}
.t7-chip[aria-pressed="true"] .t7-rd{background:var(--p);border-color:var(--p);color:#fff}
.t7-send{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;margin-top:6px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--p),var(--p-dark));color:#fff8ed;font:600 18px var(--f-body);box-shadow:0 14px 26px rgba(var(--p-rgb),.38);transition:transform .3s var(--ease)}
.t7-send:hover{transform:translateY(-2px)}.t7-send:active{transform:scale(.98)}
.t7-cap{text-align:center;font:500 15px/1.5 var(--f-body);color:var(--muted);margin:14px 10px 0}
.t7-status{min-height:22px;margin:10px 0 0;font:700 15px var(--f-body);text-align:center;color:#9a3b1c}
.t7-shake{animation:t7-shake .45s}
@keyframes t7-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.t7-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px}
.t7-contact{display:inline-block;padding:8px 16px;border-radius:999px;border:1px solid rgba(var(--p-rgb),.4);text-decoration:none;font:600 15px var(--f-body);color:var(--p)}
.t7-hide{display:none!important}

/* ===== SCRATCH: copper foil over a hidden blessing ===== */
.t7-sec-reveal{background:radial-gradient(ellipse 60% 50% at 50% 100%,rgba(var(--p-rgb),.55),transparent 70%),linear-gradient(180deg,var(--s),#0a1c30);overflow:hidden}
.t7-reveal-wrap{max-width:460px;margin:36px auto 0;text-align:center}
.t7-scratch-card{position:relative;width:100%;border-radius:var(--leafr);overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.45),0 0 0 1px rgba(245,217,168,.5);background:linear-gradient(180deg,#fffdf6,var(--paper))}
.t7-scratch-secret{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(36px,8vw,52px) clamp(24px,7vw,40px);text-align:center;color:var(--s)}
.t7-secret-star{color:var(--a);font-size:14px;letter-spacing:6px;margin-bottom:10px}
.t7-secret-msg{font:italic 400 clamp(18px,4.4vw,22px)/1.55 var(--f-disp);color:var(--p);margin:0 0 14px}
.t7-secret-sign{font:600 14px var(--f-body);color:var(--a)}
.t7-secret-sign b{display:block;font:500 clamp(20px,5vw,26px)/1.2 var(--f-disp);color:var(--s);margin-top:2px}
.t7-scratch-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:3;touch-action:none;cursor:crosshair;transition:opacity .8s ease}
.t7-scratch-card.t7-cleared .t7-scratch-canvas{opacity:0;pointer-events:none}
.t7-scratch-caption{margin:16px auto 14px;max-width:340px;font:italic 500 17px/1.45 var(--f-disp);color:var(--gold)}

/* ===== BLESSING / FINALE ===== */
.t7-end{position:relative;text-align:center;padding:clamp(90px,14vw,150px) 22px calc(clamp(120px,30vw,230px) + 20px);background:radial-gradient(ellipse 80% 50% at 50% 0,rgba(var(--a-rgb),.3),transparent 70%),linear-gradient(180deg,var(--p-dark),var(--s));color:var(--paper);overflow:hidden}
.t7-end .t7-ey{color:var(--gold)}
.t7-end h2{font:500 clamp(40px,11vw,84px)/1.05 var(--f-disp);margin:0;text-wrap:balance;letter-spacing:-.015em}
.t7-end .t7-orn{margin:22px auto;color:var(--gold)}
.t7-end p{position:relative;z-index:2;margin:8px 0 0;font:500 clamp(16px,3.6vw,19px)/1.5 var(--f-disp);color:rgba(255,248,237,.86)}
.t7-end .t7-tag{font:italic 500 clamp(20px,5vw,26px) var(--f-disp);color:var(--gold)}
.t7-end h2,.t7-end .t7-ey,.t7-end .t7-orn{position:relative;z-index:2}

@media(min-width:820px){
  .t7-chap{grid-template-columns:minmax(0,340px) 1fr;align-items:center;gap:56px}
  .t7-chap:nth-child(even){grid-template-columns:1fr minmax(0,340px)}
  .t7-chap:nth-child(even) .t7-chap-img{order:2;justify-self:end}
  .t7-chap-img{width:100%}
  .t7-ev{grid-template-columns:1.05fr 1fr;align-items:center;gap:48px}
  .t7-ev:nth-child(even) .t7-ev-img{order:2}
  .t7-cal{grid-template-columns:1fr 1fr;gap:64px}
  .t7-mosaic{grid-template-columns:repeat(4,1fr)}
  .t7-hero-in{max-width:760px}
}
@media(max-width:360px){.t7-wrap{padding:0 16px}.t7-rings{gap:10px}.t7-plate{padding:12px 26px 10px}}
@media(prefers-reduced-motion:reduce){
  .t7 *,.t7 *:before,.t7 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}
  .t7-js [data-rv]{opacity:1!important;transform:none!important;clip-path:none!important}
  .t7-motes{display:none}
}
@media print{.t7-progress,.t7-entry,.t7-music,.t7-motes,.t7-lang-float{display:none!important}.t7-js [data-rv]{opacity:1!important;transform:none!important;clip-path:none!important}.t7-js img.t7-fi{opacity:1!important}}
`;

/* ==========================================================================
   RENDER  — signature unchanged: render({ guest, wedding, events })
   ========================================================================== */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const assetBase = clean(w.asset_base) || './assets/';

  const defaultBengaliEvents = [
    { event_name: 'Gaye Holud & Mehendi', event_name_bn: 'গায়ে হলুদ ও মেহেন্দি', event_date: clean(w.date) || '2026-12-04', event_time: '17:00', venue: clean(w.venue) || 'Banquet Courtyard', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'ব্যাঙ্কোয়েট কোর্টইয়ার্ড', description: 'Traditional turmeric ceremony, vibrant alpana, music and blessings.', description_bn: 'ঐতিহ্যবাহী গায়ে হলুদ, আলপনা, সঙ্গীত ও আশীর্বাদ।' },
    { event_name: 'Shubho Bibaho & Phere', event_name_bn: 'শুভ বিবাহ ও সাতপাক', event_date: clean(w.date) || '2026-12-05', event_time: clean(w.time) || '19:00', venue: clean(w.venue) || 'Royal Mandap Grounds', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'রয়্যাল মণ্ডপ প্রাঙ্গণ', description: 'Sacred Vedic wedding vows, Shubho Drishti, Mala Badal and Saat Paak.', description_bn: 'শুভদৃষ্টি, মালাবদল, সম্প্রদান এবং পবিত্র সাতপাক।' },
    { event_name: 'Preeti Bhoj & Reception', event_name_bn: 'প্রীতিভোজ ও সংবর্ধনা', event_date: clean(w.date) || '2026-12-06', event_time: '19:30', venue: clean(w.venue) || 'Grand Imperial Palace', venue_bn: clean(w.venue_bn) || clean(w.venue) || 'গ্র্যান্ড ইম্পেরিয়াল প্যালেস', description: 'Grand dinner, royal feast, musical evening and heartfelt celebration.', description_bn: 'রাজকীয় প্রীতিভোজ, সঙ্গীত সন্ধ্যা ও প্রাণবন্ত আনন্দ সম্মিলন।' }
  ];
  const dflt = idx => defaultBengaliEvents[idx % defaultBengaliEvents.length];
  const rawList = (Array.isArray(events) && events.length) ? events : defaultBengaliEvents;
  const evs = rawList.map((e, idx) => ({
    ...e,
    event_name: clean(e.event_name) || clean(e.name) || clean(e.title) || dflt(idx).event_name,
    event_name_bn: clean(e.event_name_bn) || clean(e.name_bn) || clean(e.title_bn) || clean(e.event_name) || clean(e.name) || dflt(idx).event_name_bn,
    event_date: clean(e.event_date) || clean(e.date) || clean(w.date) || dflt(idx).event_date,
    event_time: clean(e.event_time) || clean(e.time) || dflt(idx).event_time,
    venue: clean(e.venue) || clean(e.address) || clean(w.venue) || dflt(idx).venue,
    venue_bn: clean(e.venue_bn) || clean(e.address_bn) || clean(e.venue) || clean(w.venue_bn) || clean(w.venue) || dflt(idx).venue_bn,
    description: clean(e.description) || dflt(idx).description,
    description_bn: clean(e.description_bn) || clean(e.description) || dflt(idx).description_bn
  }));
  const offset = clean(w.timezone_offset) || '+05:30';
  const lang0 = clean(w.lang || w.language).toLowerCase();
  const langAttr = lang0 === 'bn' || lang0 === 'en' ? lang0 : '';

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
    const en = clean(w[k]), bnv = clean(w[k + '_bn']);
    return L(en || defEn, bnv || en || defBn);
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
      const futureEv = evs.map(e => parseWhen(e.event_date, e.event_time, offset)).filter(x => x && x > Date.now()).sort((a, b) => a - b)[0];
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
    const ymd = `${day.y}${pad(day.mo)}${pad(day.d)}`;
    calDates = `${ymd}T133000Z/${ymd}T173000Z`;
  } else {
    calDates = '20261128T133000Z/20261128T173000Z';
  }
  const calLoc = [w.venue, w.address, w.city].map(clean).filter(Boolean).join(', ') || 'Kolkata, West Bengal';
  const calText = `Wedding of ${fEn || 'Groom'} & ${sEn || 'Bride'}`;
  const calDetails = `Shubho Bibaho ceremony of ${fEn || 'Groom'} & ${sEn || 'Bride'}. Venue: ${calLoc}`;
  const calUrl = esc(`https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE', text: calText, dates: calDates, details: calDetails, location: calLoc
  })}`);

  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || clean(w.rsvp_phone) || clean(w.phone) || clean(w.whatsapp) || contacts[0] || '9477929927';
  const digits = phoneRaw.replace(/\D/g, '') || '9477929927';
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = true;

  /* Images: dynamic data first, then stored photos, then the new Template 07 asset names */
  const heroImg = safeImg(w.couple_photo) || safeImg(w.hero_image) || safeImg(w.couple_image) || safeImg(storedCouple) || `${assetBase}${A.couple}`;
  const venueImg = safeImg(w.venue_photo) || safeImg(w.venue_image) || safeImg(w.banquet_image) || safeImg(storedVenue) || `${assetBase}${A.venue}`;
  const coverImg = safeImg(w.cover_image) || `${assetBase}${A.cover}`;
  const cardArtImg = safeImg(w.card_image) || `${assetBase}${A.card}`;
  const story = readStory(w.story);
  const gallery = readGallery(w.gallery);
  const storyImgs = A.story.map(f => `${assetBase}${f}`);
  const galleryItems = gallery.length ? gallery : [heroImg, venueImg, ...A.gallery.slice(0, 4).map(f => `${assetBase}${f}`)];

  /* Events: sorted, grouped by day (same logic as Template 06) */
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
  const dayLabel = (g, gi) => g.p
    ? LH(`Day ${ORD[gi] || gi + 1} · ${DAYS[weekday(g.p)]}, ${pad(g.p.d)} ${MONTHS[g.p.mo - 1].slice(0, 3)} ${g.p.y}`, `${ORD_BN[gi] || toBn(gi + 1)} দিন · ${DAYS_BN[weekday(g.p)]}, ${toBn(g.p.d)} ${MONTHS_BN[g.p.mo - 1]} ${toBn(g.p.y)}`)
    : LH(`Day ${ORD[gi] || gi + 1}`, `${ORD_BN[gi] || toBn(gi + 1)} দিন`);
  const tabLabel = (g, gi) => g.p
    ? LH(`${DAYS[weekday(g.p)].slice(0, 3)}, ${g.p.d} ${MONTHS[g.p.mo - 1].slice(0, 3)}`, `${DAYS_BN[weekday(g.p)]}, ${toBn(g.p.d)} ${MONTHS_BN[g.p.mo - 1]}`)
    : LH(`Day ${ORD[gi] || gi + 1}`, `${ORD_BN[gi] || toBn(gi + 1)} দিন`);

  const eventCard = e => {
    const [nEn, nBn] = evNames(e);
    const k = kindOf(nEn);
    const img = safeImg(e.image_url) || (k.asset ? `${assetBase}${k.asset}` : '');
    const loc = clean(e.venue || e.address) || clean(w.venue);
    const locBn = clean(e.venue_bn || e.address_bn) || loc;
    const tm = clean(e.event_time) ? L(timeEn(e.event_time), timeBn(e.event_time)) : '';
    const p = dparts(e.event_date);
    const dressEn = clean(e.dress_code) || (k.dress ? k.dress.en : ''), dressBn = clean(e.dress_code_bn) || clean(e.dress_code) || (k.dress ? k.dress.bn : '');
    const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.c;
    const descEn = clean(e.description), descBn = clean(e.description_bn) || descEn;
    return `<article class="t7-ev">
      ${img ? `<div class="t7-ev-img t7-ph" data-rv="clip"><img class="t7-fi" src="${esc(img)}" alt="${esc(nEn)}" loading="lazy" decoding="async"></div>` : ''}
      <div data-rv="rise">
        <div class="t7-ev-top">
          ${p ? `<div class="t7-ev-date"><b>${LH(String(p.d), toBn(p.d))}</b><small>${LH(esc(MONTHS[p.mo - 1].slice(0, 3)), esc(MONTHS_BN[p.mo - 1]))}</small></div>` : ''}
          <div><h3>${L(nEn, nBn)}</h3>${clean(e.local_name) ? `<small class="t7-local" dir="auto">${esc(e.local_name)}</small>` : ''}</div>
        </div>
        ${tm ? `<div class="t7-meta">${icon(k.icon)}<span>${tm}</span></div>` : ''}
        ${loc ? `<div class="t7-meta">${PIN}<span>${L(loc, locBn)}</span></div>` : ''}
        ${descEn ? `<p class="t7-desc">${L(descEn, descBn)}</p>` : ''}
        ${dressEn ? `<div class="t7-dress"><span class="t7-sw" style="background:${color}"></span>${t('dress')}: ${L(dressEn, dressBn)}</div>` : ''}
      </div>
    </article>`;
  };
  const tabsHtml = groups.length > 1 ? `<div class="t7-tabs" role="tablist">${groups.map((g, gi) => `<button type="button" class="t7-tab" role="tab" id="t7-tab-${gi}" data-tab="${gi}" aria-controls="t7-panel-${gi}" aria-selected="${gi === 0}">${tabLabel(g, gi)}</button>`).join('')}</div>` : '';
  const panelsHtml = groups.map((g, gi) => `<div class="t7-panel" role="tabpanel" id="t7-panel-${gi}" data-panel="${gi}" data-ts="${esc(String(stamp(g.items[0])))}" ${groups.length > 1 ? `aria-labelledby="t7-tab-${gi}"` : ''}>
    <div class="t7-day">${dayLabel(g, gi)}</div><div class="t7-evs">${g.items.map(eventCard).join('')}</div></div>`).join('');

  /* RSVP function chips */
  const seen = new Set();
  const fchips = sorted.filter(e => { const [n] = evNames(e); const kk = `${n}|${clean(e.event_date)}`; if (seen.has(kk)) return false; seen.add(kk); return true; }).map(e => {
    const [nEn, nBn] = evNames(e); const [sEnD, sBnD] = evShort(e);
    return `<button type="button" class="t7-chip" data-fn="${esc(nEn)}" data-fn-bn="${esc(nBn)}" data-fd="${esc(sEnD)}" data-fd-bn="${esc(sBnD)}" aria-pressed="true"><span class="t7-rd">${CHECK}</span><span>${L(nEn, nBn)}</span>${sEnD ? `<small>${L(sEnD, sBnD)}</small>` : ''}</button>`;
  }).join('');

  /* Calendar grid */
  let calHtml = '';
  if (day) {
    const first = new Date(Date.UTC(day.y, day.mo - 1, 1)).getUTCDay();
    const dim = new Date(Date.UTC(day.y, day.mo, 0)).getUTCDate();
    const dots = new Set(evs.map(e => dparts(e.event_date)).filter(p => p && p.y === day.y && p.mo === day.mo).map(p => p.d));
    const head = [['S', 'র'], ['M', 'সো'], ['T', 'ম'], ['W', 'বু'], ['T', 'বৃ'], ['F', 'শু'], ['S', 'শ']].map(([a, b]) => `<span class="t7-cal-h">${L(a, b)}</span>`).join('');
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= dim; d++) cells += d === day.d ? `<span class="t7-cal-d t7-cal-on" aria-label="Wedding day">${L(String(d), toBn(d))}</span>` : `<span class="t7-cal-d${dots.has(d) ? ' t7-cal-dot' : ''}">${L(String(d), toBn(d))}</span>`;
    calHtml = `<div class="t7-cal-grid" role="img" aria-label="${esc(MONTHS[day.mo - 1])} ${day.y}">${head}${cells}</div>`;
  }

  const travel = [clean(w.travel_info) && ['✈', 'travel_info'], clean(w.stay_info) && ['⌂', 'stay_info']].filter(Boolean);
  const stampEl = stampSvg(initEn, initBn);
  const postEl = postmark(clean(w.city) || 'Kolkata', numsEn.replace(/ · /g, '.'));
  const themeStyle = themeVars(w);
  const ring = (u, k) => `<div class="t7-unit"><div class="t7-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="t7-rt" cx="50" cy="50" r="46"/><circle class="t7-rf" cx="50" cy="50" r="46"/></svg><b data-u="${u}">--</b></div><small>${t(k)}</small></div>`;

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t7-fonts>
<style>${STYLE}</style>
<noscript><style>.t7-entry{display:none!important}.t7-js [data-rv]{opacity:1!important;transform:none!important;clip-path:none!important}.t7 img.t7-fi,.t7-ven-bg img{opacity:1!important}.t7-tabs{display:none}.t7-rf{stroke-dashoffset:0}</style></noscript>
<div class="t7 t7-js t7-locked" ${langAttr ? `data-lang="${langAttr}"` : ''} style="${esc(themeStyle)}" data-when="${esc(String(activeWhen))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-names-en="${esc(`${fEn} & ${sEn}`)}" data-names-bn="${esc(`${fBn} ও ${sBn}`)}" data-venue="${esc(clean(w.venue))}" data-venue-bn="${esc(clean(w.venue_bn) || clean(w.venue))}">
  ${DEFS}
  <div class="t7-progress" aria-hidden="true"></div>
  <div class="t7-motes" aria-hidden="true"></div>
  <div class="t7-lang t7-lang-float" role="group" aria-label="Language" hidden><button type="button" data-setlang="en" aria-pressed="false">EN</button><button type="button" data-setlang="bn" aria-pressed="false">বাং</button></div>

  <!-- ENTRANCE: sealed envelope -->
  <div class="t7-entry" role="dialog" aria-modal="true" aria-label="Wedding invitation">
    ${COVER_SCENE}
    <img class="t7-cover-img" src="${esc(coverImg)}" alt="" loading="eager" decoding="async">
    <div class="t7-entry-veil"></div>
    <div class="t7-canopy" aria-hidden="true">${CANOPY}</div>
    <div class="t7-clump t7-clump-l" aria-hidden="true">${CLUMP_L}</div><div class="t7-clump t7-clump-r" aria-hidden="true">${CLUMP_R}</div>
    <div class="t7-lang" role="group" aria-label="Language"><button type="button" data-setlang="en" aria-pressed="false">EN</button><button type="button" data-setlang="bn" aria-pressed="false">বাং</button></div>
    <div class="t7-stage">
      <div class="t7-env-wrap">
        <div class="t7-env">
          <div class="t7-env-back"></div>
          <div class="t7-env-card" aria-hidden="true">${LOTUS}<div class="t7-ec-t">${ceremonyTitle}</div><div class="t7-ec-n">${namesPlain}</div></div>
          <div class="t7-env-front"><svg viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L50 37.8L100 0" fill="none" stroke="rgba(245,217,168,.5)" stroke-width=".5" vector-effect="non-scaling-stroke"/></svg></div>
          <div class="t7-env-to"><span>${t('dear')}</span><b>${guestLine}</b></div>
          <div class="t7-flap" aria-hidden="true"><i class="t7-fa"></i><i class="t7-fb"></i></div>
          <button class="t7-seal" type="button" data-open aria-label="${esc(TXT.open[0])}">${sealSvg(initEn, initBn)}</button>
        </div>
      </div>
      <p class="t7-hint" data-note>${t('tapOpen')}</p>
    </div>
    <div class="t7-flare" aria-hidden="true"></div>
  </div>

  <main>
    <!-- WELCOME & COUPLE -->
    <header class="t7-hero" data-hero>
      <div class="t7-canopy" aria-hidden="true">${CANOPY}</div>
      <div class="t7-hero-in">
        <p class="t7-invoc" data-rv="rise">${invocation}</p>
        <h1 class="t7-title" data-rv="rise" style="--d:.1s">${ceremonyTitle}</h1>
        <div class="t7-arch"><div class="t7-arch-in t7-ph" data-rv="clip" style="--d:.2s"><img class="t7-fi" src="${esc(heroImg)}" alt="${esc(`${fEn} & ${sEn}`)}" decoding="async"></div></div>
        <p class="t7-sub" data-rv="rise">${t('weddingOf')}</p>
        <h2 class="t7-names" data-rv="rise" style="--d:.1s">${namesLine}</h2>
        <p class="t7-hero-copy" data-rv="rise">${inviteText}</p>
        <div class="t7-plate" data-rv="flip">
          <span class="t7-plate-sal">${t('guestSal')}</span>
          <h3 class="t7-plate-name">${guestLine}</h3>
          ${guestBadgeText ? `<span class="t7-pill">${guestBadgeText}</span>` : ''}
        </div>
        <span class="t7-cue" aria-hidden="true"></span>
      </div>
      <div class="t7-clump t7-clump-l" aria-hidden="true">${CLUMP_L}</div><div class="t7-clump t7-clump-r" aria-hidden="true">${CLUMP_R}</div>
    </header>

    ${activeWhen ? `<!-- COUNTDOWN -->
    <section class="t7-sec t7-sheet t7-dark t7-sec-cd" data-sec="countdown">
      <div class="t7-wrap t7-center">
        <div data-rv="rise"><span class="t7-ey">${t('countdownHead')}</span><h2 class="t7-h">${t('untilLagna')}</h2>${ORN}</div>
        <div class="t7-rings" role="timer" aria-label="Countdown" data-rv="rise">${ring('d', 'days')}${ring('h', 'hrs')}${ring('m', 'min')}${ring('s', 'sec')}</div>
        <p class="t7-togo" data-togo hidden></p>
      </div>
    </section>` : ''}

    <!-- OUR JOURNEY -->
    <section class="t7-sec t7-sheet t7-sec-story" data-sec="story">
      <div class="t7-wrap">
        <div class="t7-poem" data-rv="rise"><p>${poem}</p>${hasFam ? `<small>${families}</small>` : ''}</div>
        <div data-rv="rise"><span class="t7-ey">${t('storyEy')}</span><h2 class="t7-h">${t('storyH')}</h2><p class="t7-lead">${t('storySub')}</p>${ORN}</div>
        <div class="t7-journey" data-journey><span class="t7-line" aria-hidden="true"></span>
          ${story.map((s, i) => `<article class="t7-chap"><div class="t7-chap-img t7-ph" data-rv="clip"><img class="t7-fi" src="${esc(s.image || storyImgs[i] || storyImgs[0])}" alt="${esc(s.altTitle)}" loading="lazy" decoding="async"></div>
            <div data-rv="rise" style="--d:.15s"><div class="t7-chap-n" aria-hidden="true">${LH(pad(i + 1), toBn(pad(i + 1)))}</div><h3>${s.title}</h3><p>${s.text}</p></div></article>`).join('')}
        </div>
      </div>
    </section>

    <!-- WEDDING INVITATION CARD -->
    <section class="t7-sec t7-sheet t7-dark t7-sec-card" data-sec="card">
      <div class="t7-wrap t7-center">
        <div data-rv="rise"><span class="t7-ey">${t('viewCard')}</span><h2 class="t7-h">${t('cardH')}</h2>${ORN}</div>
        <div class="t7-stage3d" data-rv="flip">
          <div class="t7-card" data-tilt>
            <div class="t7-card-art t7-ph" aria-hidden="true"><img class="t7-fi" src="${esc(cardArtImg)}" alt="" loading="lazy" decoding="async"></div>
            ${LOTUS}
            <p class="t7-invoc">${invocation}</p>
            <h3>${t('together')}</h3>
            ${hasFam ? `<p class="t7-fam">${families}</p>` : ''}
            <p>${t('bless1')}<br>${t('bless2')}</p>
            <div class="t7-cn">${namesLine}</div>
            <div class="t7-lg"><em>${t('lagna')}</em><strong>${[dayName, dateLong].filter(Boolean).map((x, i) => i ? ', ' + x : x).join('')}</strong>${timeL ? `<span class="t7-w">${timeL}</span>` : ''}<span class="t7-w">${where}</span></div>
            <p class="t7-pres">${t('presence')}</p>
            ${contacts.length ? `<div class="t7-cts"><span class="t7-fam" style="margin:0">${t('contact')}:</span>${contacts.map(c => `<a href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <!-- EVENTS -->
    ${groups.length ? `<section class="t7-sec t7-sheet t7-sec-ev" data-sec="events">
      <div class="t7-wrap">
        <div data-rv="rise"><span class="t7-ey">${t('evEy')}</span><h2 class="t7-h">${t('evH')}</h2><p class="t7-lead">${t('evSub')}</p>${ORN}</div>
        ${tabsHtml}${panelsHtml}
      </div>
    </section>` : ''}

    <!-- CALENDAR -->
    <section class="t7-sec t7-sheet t7-sec-cal" data-sec="date">
      <div class="t7-wrap"><div class="t7-cal">
        <div data-rv="rise">
          <span class="t7-ey">${t('dateEy')}</span>
          ${day ? `<p class="t7-bigd" aria-hidden="true">${LH(pad(day.d), toBn(pad(day.d)))}</p><h2 class="t7-bigm">${LH(`${esc(MONTHS[day.mo - 1])} ${day.y}`, `${esc(MONTHS_BN[day.mo - 1])} ${toBn(day.y)}`)}</h2>` : `<h2 class="t7-h">${t('dateH')}</h2><p class="t7-bigm">${L('To be announced', 'শীঘ্রই জানানো হবে')}</p>`}
          <p class="t7-cal-time">${[dayName, timeL].filter(Boolean).map((x, i) => i ? ' · ' + x : x).join('')}</p>
          <div class="t7-cal-act"><a class="t7-btn t7-copper" href="${calUrl}" target="_blank" rel="noopener noreferrer" aria-label="Save to Google Calendar">${GCAL}<span>${t('addCal')}</span></a></div>
        </div>
        <div data-rv="flip" data-date>${calHtml}</div>
      </div></div>
    </section>

    <!-- GALLERY -->
    <section class="t7-sec t7-sheet t7-sec-gal" data-sec="gallery">
      <div class="t7-wrap t7-center" data-rv="rise"><span class="t7-ey">${t('momEy')}</span><h2 class="t7-h">${t('momH')}</h2>${ORN}</div>
      <div class="t7-wrap"><div class="t7-mosaic">${galleryItems.map((g, i) => `<button type="button" class="t7-g t7-ph" data-lb="${esc(g)}" data-rv="clip" style="--d:${(i % 4) * .08}s" aria-label="Photo ${i + 1}"><img class="t7-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></button>`).join('')}</div></div>
    </section>

    <!-- VENUE & DIRECTIONS -->
    <section class="t7-sec t7-sheet t7-dark t7-sec-ven" data-sec="venue">
      <div class="t7-ven-bg" data-vbg><img src="${esc(venueImg)}" alt="${esc(clean(w.venue) || 'Venue')}" loading="lazy" decoding="async"></div>
      <div class="t7-wrap">
        <div data-rv="rise"><span class="t7-ey">${t('venEy')}</span><h2 class="t7-h">${t('venH')}</h2><p class="t7-lead">${t('venSub')}</p></div>
        <div class="t7-pavilion" data-rv="flip">
          <span class="t7-ey">${t('venTag')}</span>
          <h3>${venue}</h3>
          <p>${(hasAddr || hasCity) ? `${hasAddr ? address : ''}${hasAddr && hasCity ? ', ' : ''}${hasCity ? city : ''}<br>` : ''}${day ? `${dayName}, ${dateLong}${timeL ? ' · ' + timeL : ''}` : ''}</p>
          <div class="t7-vbtns">
            ${mapUrl ? `<a class="t7-btn t7-copper" href="${mapUrl}" target="_blank" rel="noopener noreferrer">${PIN}<span>${t('directions')}</span></a>` : ''}
            ${calUrl ? `<a class="t7-btn t7-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">${GCAL}<span>${t('calendar')}</span></a>` : ''}
          </div>
          ${travel.length ? `<div class="t7-chips">${travel.map(([ic, k]) => `<div class="t7-chipc"><span aria-hidden="true">${ic}</span><p>${L(clean(w[k]), clean(w[k + '_bn']) || clean(w[k]))}</p></div>`).join('')}</div>` : ''}
        </div>
      </div>
    </section>

    <!-- RSVP -->
    <section class="t7-sec t7-sheet t7-sec-rsvp" data-sec="rsvp">
      <div class="t7-wrap">
        <div class="t7-center" data-rv="rise"><span class="t7-ey">${t('rsvpEy')}</span><h2 class="t7-h">${t('rsvpH')}</h2>${ORN}</div>
        <div data-rv="flip"><form class="t7-rsvp" data-rsvp novalidate>
          ${postEl}${stampEl}
          ${canRsvp ? `
          <div class="t7-fld"><label class="t7-lab" for="t7-name">${t('yourName')}</label><input class="t7-input" id="t7-name" name="name" type="text" autocomplete="name" value="${guestName ? esc(guestName) : ''}" required></div>
          <div class="t7-fld" role="group" aria-label="Attendance">
            <button type="button" class="t7-opt" data-att="yes" aria-pressed="true"><span class="t7-rd">${CHECK}</span><span>${t('yes')}</span></button>
            <button type="button" class="t7-opt" data-att="no" aria-pressed="false" style="margin-bottom:0"><span class="t7-rd">${CHECK}</span><span>${t('no')}</span></button>
          </div>
          <div class="t7-fld" data-guests><span class="t7-lab">${t('howMany')}</span><div class="t7-step"><button type="button" data-step="-1" aria-label="Fewer">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1} <small>${t('people')}</small></output><button type="button" data-step="1" aria-label="More">+</button></div></div>
          ${fchips ? `<div class="t7-fld" data-fns><span class="t7-lab">${t('which')}</span><div class="t7-chips-row">${fchips}</div></div>` : ''}
          <div class="t7-fld"><label class="t7-lab" for="t7-note">${t('note')}</label><textarea class="t7-input" id="t7-note" name="note" rows="3"></textarea></div>
          <button class="t7-send" type="submit">${WHATSAPP}<span>${t('send')}</span></button>
          <p class="t7-status" role="status" aria-live="polite"></p>
          <p class="t7-cap">${t('cap')}</p>` : ''}
          ${contacts.length ? `<div class="t7-contacts">${contacts.map(c => `<a class="t7-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form></div>
      </div>
    </section>

    <!-- SCRATCH & REVEAL -->
    <section class="t7-sec t7-sheet t7-dark t7-sec-reveal" data-sec="reveal">
      <div class="t7-wrap t7-center">
        <div data-rv="rise"><span class="t7-ey">${t('revEy')}</span><h2 class="t7-h">${t('revH')}</h2><p class="t7-lead">${t('revSub')}</p>${ORN}</div>
        <div class="t7-reveal-wrap" data-rv="flip">
          <div class="t7-scratch-card" data-scratch>
            <div class="t7-scratch-secret">
              <span class="t7-secret-star">✦ ✦ ✦</span>
              <p class="t7-secret-msg">${t('revMsg')}</p>
              <div class="t7-secret-sign"><span>${t('revSign')}</span><b>${namesPlain}</b></div>
            </div>
            <canvas class="t7-scratch-canvas" aria-hidden="true"></canvas>
          </div>
          <p class="t7-scratch-caption">${t('scratchHint')}</p>
          <button type="button" class="t7-btn t7-ghost" data-reveal><span>${t('revTap')}</span></button>
        </div>
      </div>
    </section>

    <!-- FINAL BLESSING -->
    <footer class="t7-end t7-sheet">
      <span class="t7-ey" data-rv="rise">${t('endEy')}</span>
      <h2 data-rv="rise">${namesPlain}</h2>
      ${ORN}
      ${hashtag ? `<p class="t7-tag">${L(hashtag.startsWith('#') ? hashtag : '#' + hashtag, hashtagBn || (hashtag.startsWith('#') ? hashtag : '#' + hashtag))}</p>` : ''}
      <p>${t('endBless')}</p>
      <p>${signature}</p>
      <p style="margin-top:14px">${LH(esc(numsEn), esc(numsBn))}${hasCity ? ' &nbsp;|&nbsp; ' + city : ''}</p>
      <div class="t7-clump t7-clump-l" aria-hidden="true">${CLUMP_L}</div><div class="t7-clump t7-clump-r" aria-hidden="true">${CLUMP_R}</div>
    </footer>
  </main>

  <button class="t7-music" type="button" aria-label="Toggle music" aria-pressed="false">♫</button>
</div>`;
}

/* ==========================================================================
   MOUNT — behaviour, interactions and lifecycle (returns cleanup())
   ========================================================================== */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  const host = root?.classList?.contains('t7') ? root : root?.querySelector?.('.t7');
  if (!host) return () => {};
  if (typeof host._t7Cleanup === 'function') host._t7Cleanup();

  const doc = host.ownerDocument || document;
  const win = doc.defaultView || window;
  if (!doc.querySelector('link[data-t7-fonts]')) {
    const l = doc.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-t7-fonts', '');
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
  const extras = new Set();
  let dead = false;

  /* Scroll lock while the envelope is closed */
  const html = doc.documentElement, body = doc.body;
  const prevOv = { h: html?.style?.overflow || '', b: body?.style?.overflow || '' };
  let locked = false;
  const lock = () => { if (locked) return; locked = true; if (html?.style) html.style.overflow = 'hidden'; if (body?.style) body.style.overflow = 'hidden'; };
  const unlock = () => {
    if (!locked) return; locked = false;
    host.classList.remove('t7-locked');
    if (html?.style) html.style.overflow = prevOv.h;
    if (body?.style) body.style.overflow = prevOv.b;
  };
  host.classList.add('t7-js');

  /* ---------- Language ---------- */
  let lang = host.dataset.lang || '';
  if (!lang) { try { const s = win.localStorage?.getItem('t7-lang'); if (s === 'bn' || s === 'en') lang = s; } catch { /* ignore */ } }
  lang = lang || 'en';
  const bn = () => lang === 'bn';
  const num = n => (bn() ? toBn(n) : String(n));
  let repaintScratch = null;
  const applyLang = l => {
    lang = l; host.dataset.lang = l;
    try { win.localStorage?.setItem('t7-lang', l); } catch { /* ignore */ }
    $$('[data-setlang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setlang === l)));
    if (doc.documentElement) doc.documentElement.setAttribute('lang', l === 'bn' ? 'bn' : 'en');
    updateAllCountdowns();
    updateCount();
    if (repaintScratch) repaintScratch();
  };
  $$('[data-setlang]').forEach(b => on(b, 'click', () => applyLang(b.dataset.setlang)));

  /* ---------- Image states ---------- */
  $$('img').forEach(img => {
    const ok = () => img.classList.add('t7-loaded');
    const fail = () => img.classList.add('t7-failed');
    on(img, 'load', ok); on(img, 'error', fail);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
  });
  later(() => $$('img.t7-fi').forEach(i => { if (!i.classList.contains('t7-failed')) i.classList.add('t7-loaded'); }), 4500);

  /* ---------- Drifting light motes ---------- */
  const motes = $('.t7-motes');
  if (motes && !reduce) {
    for (let i = 0; i < 14; i++) {
      const m = doc.createElement('span'); m.className = 't7-mote';
      m.style.cssText = `--l:${rand(0, 100).toFixed(1)}%;--s:${rand(5, 14).toFixed(1)}px;--d:${rand(16, 28).toFixed(1)}s;--dl:${(-rand(0, 24)).toFixed(1)}s;--x:${rand(-70, 70).toFixed(0)}px`;
      motes.appendChild(m);
    }
  }
  /* Golden light burst (Web Animations API; silently skipped if unsupported) */
  const sparks = (cx, cy, n = 30, dist = 220) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const s = doc.createElement('i'); s.className = 't7-spark';
      s.style.cssText = `left:${cx}px;top:${cy}px;--z:${rand(3, 9).toFixed(1)}px`;
      body.appendChild(s); extras.add(s);
      const a = rand(0, Math.PI * 2), d = rand(40, dist);
      const gone = () => { s.remove(); extras.delete(s); };
      if (typeof s.animate === 'function') {
        const an = s.animate([{ transform: 'translate(0,0) scale(1.4)', opacity: 1 }, { transform: `translate(${(Math.cos(a) * d).toFixed(0)}px,${(Math.sin(a) * d + 36).toFixed(0)}px) scale(.2)`, opacity: 0 }], { duration: rand(900, 1700), easing: 'cubic-bezier(.12,.8,.32,1)', fill: 'forwards' });
        an.onfinish = gone;
      }
      later(gone, 2000);
    }
  };

  /* ---------- Reveals (started once the invitation is visible) ---------- */
  let revealsOn = false;
  const startReveals = () => {
    if (revealsOn || dead) return; revealsOn = true;
    host.classList.add('t7-live');
    const els = $$('[data-rv]');
    if (reduce || typeof IntersectionObserver === 'undefined') { els.forEach(el => el.classList.add('t7-in')); return; }
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((e, k) => {
        const base = parseFloat(e.target.style.getPropertyValue('--d')) || 0;
        if (!base) e.target.style.setProperty('--d', `${(k * .07).toFixed(2)}s`);
        e.target.classList.add('t7-in');
        io.unobserve(e.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    els.forEach(el => io.observe(el));
    undo.push(() => io.disconnect());
  };

  /* ---------- Entrance: the sealed envelope ---------- */
  const entry = $('.t7-entry'), seal = $('[data-open]'), hint = $('[data-note]');
  let opened = false, finished = false;
  const showFloat = () => { const fl = $('.t7-lang-float'); if (fl) fl.hidden = false; };
  const finish = () => {
    if (finished) return; finished = true;
    unlock(); showFloat();
    if (entry) entry.remove();
    startReveals(); onScroll(true);
  };
  const open = () => {
    if (opened) return; opened = true;
    const r = seal ? seal.getBoundingClientRect() : { left: win.innerWidth / 2, top: win.innerHeight / 2, width: 0, height: 0 };
    sparks(r.left + r.width / 2, r.top + r.height / 2, 34, 200);
    if (reduce || !entry) { finish(); return; }
    entry.classList.add('t7-opening');
    later(() => { const e = $('.t7-env-card', entry)?.getBoundingClientRect(); if (e) sparks(e.left + e.width / 2, e.top + e.height / 2, 30, 260); }, 1500);
    later(() => { unlock(); showFloat(); startReveals(); }, 2150);
    later(finish, 3000);
  };
  if (entry) { lock(); host.classList.add('t7-locked'); } else { later(finish, 0); }
  on(seal, 'click', e => { e.stopPropagation(); open(); });
  on(hint, 'click', open);
  on($('.t7-env-wrap', entry || host), 'click', e => { if (!e.target.closest('.t7-lang')) open(); });

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* ---------- Scroll: progress, depth, drawing line ---------- */
  const bar = $('.t7-progress'), journey = $('[data-journey]'), vbg = $('[data-vbg]');
  let tick = false;
  function onScroll(force) {
    if (tick && !force) return; tick = true;
    win.requestAnimationFrame(() => {
      tick = false; if (dead) return;
      const scY = win.scrollY ?? html.scrollTop ?? 0;
      const vh = win.innerHeight || html.clientHeight || 800;
      const max = (html.scrollHeight || body.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(scY / max, 0, 1) : 0})`;
      if (!reduce && scY < vh * 1.4) host.style.setProperty('--sy', String(Math.round(scY)));
      if (journey) {
        const r = journey.getBoundingClientRect();
        journey.style.setProperty('--jp', clamp((vh * .62 - r.top) / Math.max(r.height, 1), 0, 1).toFixed(3));
      }
      if (vbg && !reduce) {
        const r = vbg.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) vbg.style.setProperty('--vy', ((vh / 2 - (r.top + r.height / 2)) * .07).toFixed(1));
      }
    });
  }
  on(win, 'scroll', () => onScroll(false), { passive: true });

  /* ---------- Countdown rings ---------- */
  const when = Number(host.dataset.when);
  const startTs = Date.now();
  const total = Math.max(1, when - startTs);
  const cdBox = $('.t7-rings'), togo = $('[data-togo]');
  const setUnit = (unit, val, frac) => {
    if (!cdBox) return;
    const el = cdBox.querySelector(`[data-u="${unit}"]`);
    if (!el) return;
    const tx = num(pad(val));
    if (el.textContent !== tx) {
      el.textContent = tx;
      if (!reduce) { el.classList.remove('t7-tick'); void el.offsetWidth; el.classList.add('t7-tick'); }
    }
    const rf = el.parentElement.querySelector('.t7-rf');
    if (rf) rf.style.strokeDashoffset = String((289 * (1 - clamp(frac, 0, 1))).toFixed(1));
  };
  function updateAllCountdowns() {
    if (!when) return;
    const left = when - Date.now();
    if (left <= 0) {
      ['d', 'h', 'm', 's'].forEach(u => setUnit(u, 0, 0));
      if (togo) { togo.hidden = false; togo.textContent = bn() ? TXT.today[1] : TXT.today[0]; }
      return;
    }
    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    setUnit('d', d, left / total);
    setUnit('h', h, h / 24);
    setUnit('m', m, m / 60);
    setUnit('s', sec, sec / 60);
    if (togo) { togo.hidden = false; togo.textContent = bn() ? `${toBn(d)} ${TXT.daysToGo[1]}` : `${d} ${TXT.daysToGo[0]}`; }
  }
  if (when) {
    updateAllCountdowns();
    timers.push(setInterval(updateAllCountdowns, 1000));
  }

  /* ---------- Event day tabs ---------- */
  const tabs = $$('[data-tab]'), panels = $$('[data-panel]');
  if (panels.length > 1 && tabs.length === panels.length) {
    const showTab = (i, focus) => {
      tabs.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
    };
    let idx = panels.findIndex(p => Number(p.dataset.ts) >= Date.now() - 864e5);
    if (idx < 0) idx = 0;
    showTab(idx);
    tabs.forEach((b, i) => {
      on(b, 'click', () => showTab(i));
      on(b, 'keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); showTab((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); showTab((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  }

  /* ---------- Invitation card: gentle 3D tilt ---------- */
  const card = $('[data-tilt]');
  if (card && !reduce) {
    const stage = card.parentElement;
    const rest = () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
    on(stage, 'pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
    });
    on(stage, 'pointerleave', rest); on(stage, 'pointerup', rest); on(stage, 'pointercancel', rest);
  }

  /* ---------- Scratch & reveal (copper foil) ---------- */
  const scWrap = $('[data-scratch]');
  if (scWrap) {
    const canvas = $('.t7-scratch-canvas', scWrap);
    const revealBtn = $('[data-reveal]');
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    let scratched = false, drawing = false, started = false, last = null;
    const paint = () => {
      if (!ctx || scratched || started) return;
      const w = scWrap.offsetWidth, h = scWrap.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, win.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#b77a50'); g.addColorStop(.25, '#f1cfa0'); g.addColorStop(.5, '#c58b5e'); g.addColorStop(.78, '#f5d9a8'); g.addColorStop(1, '#a96d44');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1;
      for (let x = -h; x < w; x += 9) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(90,49,25,.5)'; ctx.lineWidth = 1.4; ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = '#4a2812'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = bn() ? '600 18px "Noto Serif Bengali", serif' : 'italic 500 22px "Bodoni Moda", Georgia, serif';
      ctx.fillText(bn() ? '✦ ঘষে বার্তাটি দেখুন ✦' : '✦ Scratch to reveal ✦', w / 2, h / 2);
    };
    repaintScratch = paint;
    const clearScratch = () => {
      if (scratched) return; scratched = true;
      scWrap.classList.add('t7-cleared');
      const r = scWrap.getBoundingClientRect();
      sparks(r.left + r.width / 2, r.top + r.height / 2, 26, 200);
    };
    const pt = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * (canvas.width / r.width / Math.min(2, win.devicePixelRatio || 1)), (e.clientY - r.top) * (canvas.height / r.height / Math.min(2, win.devicePixelRatio || 1))]; };
    const stroke = (a, b) => {
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 46;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
    };
    const coverage = () => {
      try {
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let empty = 0, n = 0;
        for (let i = 3; i < d.length; i += 16) { n++; if (d[i] < 20) empty++; }
        if (n && empty / n > .42) clearScratch();
      } catch { /* ignore */ }
    };
    if (canvas && ctx) {
      on(canvas, 'pointerdown', e => {
        if (scratched) return;
        started = true; drawing = true; last = pt(e);
        try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        stroke(last, [last[0] + .1, last[1] + .1]);
      });
      on(canvas, 'pointermove', e => { if (!drawing) return; const p = pt(e); stroke(last, p); last = p; });
      const up = () => { if (!drawing) return; drawing = false; coverage(); };
      on(canvas, 'pointerup', up); on(canvas, 'pointercancel', up);
      on(win, 'resize', () => paint());
      later(paint, 500);
      if (typeof IntersectionObserver !== 'undefined') {
        const so = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) paint(); }, { threshold: 0 });
        so.observe(scWrap); undo.push(() => so.disconnect());
      }
    } else { scWrap.classList.add('t7-cleared'); }
    on(revealBtn, 'click', clearScratch);
    on(scWrap, 'dblclick', clearScratch);
  }

  /* ---------- Lightbox with previous / next ---------- */
  const lbItems = $$('[data-lb]');
  let lbIndex = -1, lbOpener = null;
  const closeLb = () => {
    const lb = $('.t7-lb'); if (lb) lb.remove();
    lbIndex = -1;
    if (lbOpener && lbOpener.focus) lbOpener.focus();
    lbOpener = null;
  };
  const showLb = i => {
    if (!lbItems.length) return;
    lbIndex = (i + lbItems.length) % lbItems.length;
    let lb = $('.t7-lb');
    if (!lb) {
      lb = doc.createElement('div'); lb.className = 't7-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo');
      lb.innerHTML = '<img alt="Moment"><button type="button" class="t7-lb-x" aria-label="Close">✕</button>' + (lbItems.length > 1 ? '<button type="button" class="t7-lb-p" aria-label="Previous">‹</button><button type="button" class="t7-lb-n" aria-label="Next">›</button>' : '');
      lb.addEventListener('click', e => {
        if (e.target.closest('.t7-lb-x') || e.target === lb) closeLb();
        else if (e.target.closest('.t7-lb-p')) showLb(lbIndex - 1);
        else if (e.target.closest('.t7-lb-n')) showLb(lbIndex + 1);
      });
      let sx = 0;
      lb.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1)); }, { passive: true });
      host.appendChild(lb);
      const x = lb.querySelector('.t7-lb-x'); if (x) x.focus();
    }
    lb.querySelector('img').src = lbItems[lbIndex].dataset.lb;
  };
  lbItems.forEach((f, i) => on(f, 'click', () => { lbOpener = f; showLb(i); }));
  on(doc, 'keydown', e => {
    if (lbIndex < 0) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    else if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
  });

  /* ---------- RSVP (WhatsApp) ---------- */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa || '919477929927';
  let count = 1;
  const outEl = form && $('[data-count]', form);
  function updateCount() {
    if (!outEl || !outEl.firstChild) return;
    outEl.firstChild.nodeValue = `${num(count)} `;
  }
  if (form && waNum) {
    let att = 'yes';
    const guestsBox = $('[data-guests]', form), fnBox = $('[data-fns]', form);
    const persons = parseInt(guest?.persons, 10);
    count = clamp(persons > 0 ? persons : (guest?.with_family ? 2 : 1), 1, 20);
    updateCount();
    const opts = $$('[data-att]', form);
    opts.forEach(b => on(b, 'click', () => {
      att = b.dataset.att;
      opts.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const no = att === 'no';
      if (guestsBox) guestsBox.classList.toggle('t7-hide', no);
      if (fnBox) fnBox.classList.toggle('t7-hide', no);
    }));
    $$('[data-step]', form).forEach(b => on(b, 'click', () => { count = clamp(count + Number(b.dataset.step), 1, 20); updateCount(); }));
    $$('.t7-chip', form).forEach(c => on(c, 'click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))));
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const nt = $('[name="note"]', form).value.trim();
      const status = $('.t7-status', form);
      if (!name) {
        status.textContent = bn() ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please add your name.';
        form.classList.remove('t7-shake'); void form.offsetWidth; form.classList.add('t7-shake');
        return;
      }
      const B = bn();
      const fns = att === 'yes' ? $$('.t7-chip[aria-pressed="true"]', form).map(c => `${B ? c.dataset.fnBn : c.dataset.fn}${(B ? c.dataset.fdBn : c.dataset.fd) ? ' (' + (B ? c.dataset.fdBn : c.dataset.fd) + ')' : ''}`) : [];
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

  /* ---------- Music ---------- */
  const musicBtn = $('.t7-music'), musicUrl = host.dataset.music;
  if (musicBtn && musicUrl) {
    const audio = new Audio(musicUrl); audio.loop = true; audio.preload = 'none';
    musicBtn.classList.add('t7-has');
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

  const cleanup = () => {
    dead = true;
    timers.forEach(tm => { clearTimeout(tm); clearInterval(tm); });
    undo.forEach(f => f());
    extras.forEach(n => n.remove()); extras.clear();
    closeLb();
    unlock();
    host.classList.remove('t7-js', 't7-locked', 't7-live');
    delete host._t7Cleanup;
  };
  host._t7Cleanup = cleanup;
  return cleanup;
}