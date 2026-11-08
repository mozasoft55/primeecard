/* ==========================================================================
   MONSOON MAJESTY — "The Walk Together"   (template 8)
   A universal, religion-neutral cinematic invitation. The whole page is one
   fixed scroll-driven landscape: procedurally generated rocky mountains
   (unique per couple), flying birds, drifting clouds, light rain that grows
   as you scroll, rare gentle lightning, a winding lamp-lit road — and a
   couple in formal dress walking hand in hand toward a golden dawn.
   Sky, mountains, rain and light all morph with scroll progress.

   Contract:
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a complete, readable static invitation (no JS needed).

   wedding fields (all optional, nothing is hard-coded):
     bride_name, groom_name, name_order ('bride_first'), date, time,
     timezone_offset (default +05:30), venue, address, city, map_url,
     invocation (e.g. "Bismillah", "Om", "Shubho Bibaho" — default is neutral),
     invite_text, families | footer_text, poem, hashtag, venue_image,
     rsvp_number, rsvp_contacts, story:[{title,text,image}] (max 3),
     travel_info, stay_info, music_url,
     theme: 'monsoon'(default)|'twilight'|'emerald'|'ruby', accent_color '#RRGGBB',
     gallery: [https urls] (array / JSON string / ';'-separated)
   events[]: event_name, event_date, event_time, venue, address, description,
     dress_code, dress_color, local_name (Hindi/Bengali/Urdu… any script),
     image_url
   guest: name, with_family

   PERFORMANCE: no backdrop-filter, compositor-only animations (transform /
   opacity), one rAF scroll loop, pooled rain drawn as ONE canvas path, rain
   pauses when the tab is hidden, DPR capped, everything cleaned on unmount.
   ========================================================================== */

/* ---------- helpers ---------- */
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
const ORD = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Marcellus&family=Noto+Naskh+Arabic:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Raleway:wght@300;400;500;600&display=swap';

function dparts(v) {
  const raw = clean(v);
  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/), y, mo, d;
  if (m) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = raw.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{4})$/))) {
    mo = MONTHS.findIndex(n => n.slice(0, 3).toLowerCase() === m[2].slice(0, 3).toLowerCase()) + 1; [y, d] = [+m[3], +m[1]];
  } else if ((m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/))) [y, mo, d] = [+m[3], +m[2], +m[1]];
  else return null;
  if (!mo) return null;
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? { y, mo, d } : null;
}
const weekday = p => DAYS[new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay()];
const longDate = p => `${pad(p.d)} ${MONTHS[p.mo - 1]} ${p.y}`;
const shortDate = p => `${pad(p.d)} ${MONTHS[p.mo - 1].slice(0, 3)} ${p.y}`;

function fmtTime(v) {
  const raw = clean(v);
  if (!raw) return '';
  if (/T/.test(raw)) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).replace(/\b(am|pm)\b/i, s => s.toUpperCase());
  }
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);
  if (m) {
    let h = +m[1];
    const mer = m[3] ? m[3].toUpperCase() : (h >= 12 ? 'PM' : 'AM');
    if (!m[3]) h = h % 12 || 12;
    return `${h}:${m[2]} ${mer}`;
  }
  return raw;
}

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

/* ---------- colour + scene engine (shared by render() and mount()) ---------- */
const hex6 = v => {
  const m = clean(v).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  return '#' + (m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]).toLowerCase();
};
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hexOf = a => '#' + a.map(c => pad(clamp(Math.round(c), 0, 255).toString(16))).join('');
const mix = (h1, h2, t) => { const a = rgbOf(h1), b = rgbOf(h2); return hexOf(a.map((c, i) => c + (b[i] - c) * t)); };
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

/* palettes: n = dusk, s = storm, d = golden dawn → [sky top, sky bottom] */
const THEMES = {
  monsoon: { n: ['#0b1233', '#3b3f7e'], s: ['#060a1b', '#1d2c46'], d: ['#2e4a8f', '#ffbf6e'], gold: '#e6bd5c', acc: '#2fb5a3' },
  twilight: { n: ['#1b0c30', '#6f3b80'], s: ['#0e0720', '#2f2247'], d: ['#5e3b86', '#ff9c8c'], gold: '#f1c47c', acc: '#e58fb0' },
  emerald: { n: ['#05211d', '#1f5f55'], s: ['#03130f', '#12352f'], d: ['#216660', '#f6d878'], gold: '#ecc96f', acc: '#7fd1b9' },
  ruby: { n: ['#220711', '#702040'], s: ['#12050b', '#341322'], d: ['#5d2040', '#ffb56e'], gold: '#f2c46b', acc: '#ff8aa1' }
};
const pickTheme = w => {
  const t = THEMES[clean(w?.theme || w?.theme_name).toLowerCase()] || THEMES.maroon || THEMES.monsoon;
  const gold = hex6(w?.accent_color) || t.gold;
  return { ...t, gold };
};

/* scroll progress keyframes: pal 0=dusk 1=storm 2=dawn */
const KEYS = [
  { p: 0, pal: 0, rain: .14, birds: 1, stars: .9, moon: 1, sun: 0, rb: 0, clouds: .35, lamps: .9 },
  { p: .2, pal: 0, rain: .24, birds: .8, stars: .6, moon: .85, sun: 0, rb: 0, clouds: .6, lamps: 1 },
  { p: .38, pal: 1, rain: .72, birds: .1, stars: 0, moon: .2, sun: 0, rb: 0, clouds: 1, lamps: 1 },
  { p: .58, pal: 1, rain: .95, birds: 0, stars: 0, moon: 0, sun: 0, rb: 0, clouds: 1, lamps: 1 },
  { p: .76, pal: 1.4, rain: .3, birds: .5, stars: 0, moon: 0, sun: .25, rb: 0, clouds: .6, lamps: .8 },
  { p: .9, pal: 2, rain: 0, birds: 1, stars: 0, moon: 0, sun: .9, rb: .85, clouds: .25, lamps: .5 },
  { p: 1, pal: 2, rain: 0, birds: 1, stars: 0, moon: 0, sun: 1, rb: .95, clouds: .2, lamps: .4 }
];
const NUM = ['rain', 'birds', 'stars', 'moon', 'sun', 'rb', 'clouds', 'lamps', 'pal'];

function sceneAt(theme, p) {
  p = clamp(p, 0, 1);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = smooth(clamp((p - a.p) / (b.p - a.p), 0, 1));
  const s = {};
  NUM.forEach(k => { s[k] = lerp(a[k], b[k], t); });
  const pal = [theme.n, theme.s, theme.d];
  const lo = Math.floor(s.pal), hi = Math.min(2, lo + 1), f = s.pal - lo;
  const top = mix(pal[lo][0], pal[hi][0], f), bot = mix(pal[lo][1], pal[hi][1], f);
  const g = rgbOf(theme.gold);
  const v = {
    '--sky-t': top, '--sky-b': bot,
    '--m0': mix(bot, '#05060f', .38), '--m1': mix(bot, '#05060f', .55), '--m2': mix(bot, '#05060f', .7), '--m3': mix(bot, '#05060f', .84),
    '--mist': `${bot}`, '--cloud': mix(bot, '#000000', .35),
    '--ground': mix(top, '#000000', .8), '--road': mix(mix(top, '#000000', .8), bot, .32), '--tree': mix(top, '#000000', .86),
    '--fig': mix(top, '#000000', .55), '--fig2': mix(mix(top, '#000000', .55), theme.acc, .16),
    '--moon': s.moon.toFixed(3), '--stars': s.stars.toFixed(3), '--birds': s.birds.toFixed(3), '--clouds': s.clouds.toFixed(3),
    '--sun': s.sun.toFixed(3), '--rb': s.rb.toFixed(3), '--lamps': s.lamps.toFixed(3)
  };
  return { vars: v, rain: s.rain, sun: s.sun, g };
}
const varsText = o => Object.entries(o).map(([k, v]) => `${k}:${v}`).join(';');

/* ---------- procedural rocky mountains (unique per couple) ---------- */
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

function ridge(r, { base, amp, rough, snow }) {
  const W = 1600, H = 600;
  let h = [base + (r() - .5) * amp * .5, base + (r() - .5) * amp * .5], d = amp;
  for (let l = 0; l < 6; l++) {
    const nh = [];
    for (let i = 0; i < h.length - 1; i++) { nh.push(h[i]); nh.push((h[i] + h[i + 1]) / 2 + (r() - .5) * d); }
    nh.push(h[h.length - 1]); h = nh; d *= rough;
  }
  const pts = h.map((y, i) => [Math.round(i * W / (h.length - 1)), Math.round(clamp(y - Math.pow(r(), 4) * amp * .35, 40, H - 20))]);
  const top = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
  const fill = `${top}L${W} ${H}L0 ${H}Z`;
  let shade = '', snowP = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i], [px, py] = pts[i - 1], [nx, ny] = pts[i + 1];
    if (y < py && y < ny) {
      shade += `M${x} ${y}L${nx} ${ny}L${x} ${ny}Z`;
      if (snow && y < base - amp * .3) {
        const lx = x + (px - x) * .26, ly = y + (py - y) * .26, rx = x + (nx - x) * .26, ry = y + (ny - y) * .26;
        snowP += `M${x} ${y}L${rx} ${ry}L${x + (rx - x) * .55} ${ry - 7}L${x} ${y + 16}L${lx + (x - lx) * .45} ${ly - 7}L${lx} ${ly}Z`;
      }
    }
  }
  return { fill, top, shade, snow: snowP };
}

function pine(x, y, h) {
  const w = h * .26;
  return `M${x} ${y - h}L${x + w * .55} ${y - h * .62}L${x + w * .3} ${y - h * .62}L${x + w * .8} ${y - h * .3}L${x + w * .4} ${y - h * .3}L${x + w} ${y - h * .04}L${x + w * .12} ${y - h * .04}L${x + w * .12} ${y}L${x - w * .12} ${y}L${x - w * .12} ${y - h * .04}L${x - w} ${y - h * .04}L${x - w * .4} ${y - h * .3}L${x - w * .8} ${y - h * .3}L${x - w * .3} ${y - h * .62}L${x - w * .55} ${y - h * .62}Z`;
}
function pines(r, count, W, H, tall) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const h = tall * (.45 + r() * .55);
    d += pine(Math.round(W * (i + r() * .7) / count + 10), H, h);
  }
  return d;
}

/* ---------- static art ---------- */
const BIRD = `<svg class="t8-bird-def" width="0" height="0" aria-hidden="true" focusable="false"><defs><symbol id="t8-bird" viewBox="0 0 28 12"><path d="M1 9Q8 0 14 8Q20 0 27 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol></defs></svg>`;

const COUPLE = `<svg class="t8-pair" viewBox="0 0 200 340" aria-hidden="true" focusable="false">
<ellipse cx="100" cy="328" rx="86" ry="7" fill="rgba(0,0,0,.4)"/>
<g class="t8-bob">
 <g class="t8-groom">
  <g class="t8-leg t8-l1"><path class="f1" d="M43 206L60 206L58 314Q58 322 52 322L40 322Q37 316 43 312Z"/></g>
  <g class="t8-leg t8-l2"><path class="f1" d="M64 206L81 206L82 312Q87 316 84 322L72 322Q66 322 66 314Z"/></g>
  <path class="f1" d="M38 66Q62 56 86 66L92 130L97 214Q62 226 27 214L32 130Z"/>
  <path class="f1" d="M38 68L26 150Q25 159 31 159L39 157L46 76Z"/>
  <path class="f1" d="M84 68L100 146L106 168L113 166L108 144L96 66Z"/>
  <circle class="f1" cx="62" cy="40" r="14"/>
  <path class="f1" d="M48 38Q50 20 62 20Q76 20 76 38Q70 29 62 29Q54 29 48 38Z"/>
  <path class="gd" d="M62 60V218M50 64l12 14 12-14"/>
  <circle class="gf" cx="62" cy="100" r="2"/><circle class="gf" cx="62" cy="126" r="2"/><circle class="gf" cx="62" cy="152" r="2"/>
 </g>
 <g class="t8-bride">
  <g class="t8-gown"><path class="f2" d="M122 72Q140 64 158 72L154 116Q150 122 156 130Q184 210 195 314Q140 332 86 314Q104 212 126 130Q132 122 126 116Z"/>
   <path class="gd" d="M126 117Q140 124 154 117M88 313Q140 331 193 313"/></g>
  <path class="f2" d="M126 74L108 150L106 167L113 169L117 152L134 80Z"/>
  <path class="f2" d="M156 74L172 146Q174 154 168 156L162 150L150 82Z"/>
  <g class="t8-veil"><path class="sheer" d="M128 44Q116 130 110 262Q140 278 170 262Q164 130 152 44Q140 36 128 44Z"/></g>
  <circle class="f2" cx="140" cy="48" r="12.5"/><circle class="f2" cx="140" cy="33" r="6.5"/>
 </g>
 <circle class="f1" cx="109" cy="171" r="5.5"/>
</g></svg>`;

const JAALI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23e6bd5c' stroke-opacity='.2' stroke-width='1'%3E%3Cpath d='M32 4l8 20 20 8-20 8-8 20-8-20-20-8 20-8z'/%3E%3Ccircle cx='32' cy='32' r='9'/%3E%3Cpath d='M0 0l8 8M64 0l-8 8M0 64l8-8M64 64l-8-8'/%3E%3C/g%3E%3C/svg%3E\")";

/* ---------- imagery ---------- */
const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const KINDS = [
  { re: /haldi|ubtan|pithi|gaye\s*holud/i, icon: '🌼', img: '1606216794074-735e91aa2c92', alt: '1599661046827-dacff0c0f09a', dress: '#f4c542' },
  { re: /mehendi|mehndi|henna|menhdi/i, icon: '🌿', img: '1583939003579-730e3918a45a', alt: '1465495976277-4387d4b0b4c6', dress: '#187653' },
  { re: /sangeet|cocktail|music|garba|dandiya|qawwali/i, icon: '🎶', img: '1469371670807-013ccf25f16a', alt: '1511795409834-ef04bbd61622', dress: '#7444a1' },
  { re: /baraat|barat|procession/i, icon: '🐎', img: '1519167758481-83f550bb49b3', alt: '1606216794074-735e91aa2c92', dress: '#e88aab' },
  { re: /jaimala|varmala|engagement|sagai|tilak|ring|mangni/i, icon: '💐', img: '1519225421980-715cb0215aed', alt: '1465495976277-4387d4b0b4c6', dress: '#d8b56e' },
  { re: /phere|pheras|nikah|nikkah|wedding|vivah|shaadi|biye|bibaho|ceremony|saptapadi|anand/i, icon: '✦', img: '1465495976277-4387d4b0b4c6', alt: '1519741497674-611481863552', dress: '#8e1e32' },
  { re: /reception|walima|dinner|aashirbaad|aashirvad|blessing|bou\s*bhat/i, icon: '✨', img: '1511795409834-ef04bbd61622', alt: '1469371670807-013ccf25f16a', dress: '#e6cbd3' }
];
const DEFAULT_KIND = { icon: '✦', img: '1519741497674-611481863552', alt: '1522413452208-996ff3f3e740', dress: '#d9b8a8' };
const kindOf = name => KINDS.find(k => k.re.test(name)) || DEFAULT_KIND;

const DEFAULT_STORY = [
  { title: 'How We Met', text: 'One unexpected hello became a thousand conversations, shared dreams, and a friendship that felt like home.', image: U('1529636798458-92182e662485', 700), alt: U('1519741497674-611481863552', 700) },
  { title: 'The Promise', text: 'With happy tears and hearts full of hope, we chose each other—and all the beautiful tomorrows still to come.', image: U('1519741497674-611481863552', 700), alt: U('1522413452208-996ff3f3e740', 700) },
  { title: 'The Big Day', text: 'Now, surrounded by the people we love, we cannot wait to celebrate the beginning of our forever with you.', image: U('1520854221256-17451cc331bf', 700), alt: U('1606216794074-735e91aa2c92', 700) }
];
function readStory(raw) {
  let a = raw;
  if (typeof a === 'string') { try { a = JSON.parse(a); } catch { a = null; } }
  if (!Array.isArray(a) || !a.length) return DEFAULT_STORY;
  return a.slice(0, 3).map((s, i) => ({
    title: clean(s?.title) || DEFAULT_STORY[i % 3].title,
    text: clean(s?.text) || DEFAULT_STORY[i % 3].text,
    image: safeImg(s?.image) || DEFAULT_STORY[i % 3].image,
    alt: DEFAULT_STORY[i % 3].alt
  }));
}
function readGallery(raw) {
  let a = raw;
  if (typeof a === 'string') { try { a = JSON.parse(a); } catch { a = lines(a); } }
  if (!Array.isArray(a)) return [];
  return a.map(x => safeImg(typeof x === 'string' ? x : (x?.image || x?.url))).filter(Boolean).slice(0, 9);
}

/* ---------- styles ---------- */
const STYLE = `
.t8,.t8 *,.t8 *:before,.t8 *:after{box-sizing:border-box}
.t8{--gold:#e6bd5c;--gold2:#f6e2a6;--gold-rgb:230,189,92;--acc:#2fb5a3;--ivory:#f6f0e2;--muted:rgba(246,240,226,.74);--sky-t:#0b1233;--sky-b:#3b3f7e;
  --m0:#2b2f66;--m1:#202452;--m2:#171a3d;--m3:#0f1128;--mist:#3b3f7e;--cloud:#222550;--ground:#03050f;--road:#161a38;--tree:#02040c;--fig:#060a1c;--fig2:#0b1226;
  --moon:1;--stars:.9;--birds:1;--clouds:.35;--sun:0;--rb:0;--lamps:.9;
  --f-disp:Marcellus,"Cormorant Garamond",serif;--f-script:"Alex Brush",cursive;--f-serif:"Cormorant Garamond",Georgia,serif;--f-sans:Raleway,system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;overflow-anchor:none;color:var(--ivory);font:300 15px/1.75 var(--f-sans);-webkit-font-smoothing:antialiased;background:var(--sky-t)}
.t8.t8-locked{height:100vh!important;height:100svh!important;max-height:100vh!important;max-height:100svh!important;overflow:hidden!important}
.t8 h1,.t8 h2,.t8 h3,.t8 p,.t8 figure{margin-top:0}
.t8 img{display:block;max-width:100%}
.t8 button{font:inherit;color:inherit;cursor:pointer}
.t8 a{color:inherit}
.t8 :focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.t8-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--acc),var(--gold),var(--gold2));box-shadow:0 0 10px rgba(var(--gold-rgb),.7)}
/* ===== scene ===== */
.t8-scene{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:linear-gradient(180deg,var(--sky-t) 0%,var(--sky-b) 72%)}
.t8-scene>*{position:absolute}
.t8-stars{inset:0 0 40% 0;opacity:var(--stars)}
.t8-stars i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.8}
.t8-stars i:nth-child(3n){animation:t8-twinkle 3.4s ease-in-out infinite alternate;animation-delay:var(--dl,0s)}
@keyframes t8-twinkle{from{opacity:.2}to{opacity:1}}
.t8-moon{top:9%;right:12%;width:clamp(54px,10vw,96px);aspect-ratio:1;border-radius:50%;opacity:var(--moon);background:radial-gradient(circle at 36% 34%,#fffaf0,#ebe4d0 55%,#cdc5ae);box-shadow:0 0 40px 10px rgba(255,250,230,.28),0 0 150px 56px rgba(190,205,255,.16)}
.t8-moon:before{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 62% 60%,rgba(120,110,90,.22) 0 9%,transparent 10%),radial-gradient(circle at 30% 66%,rgba(120,110,90,.18) 0 7%,transparent 8%),radial-gradient(circle at 56% 26%,rgba(120,110,90,.16) 0 6%,transparent 7%)}
.t8-sun{left:50%;top:66%;width:150vmax;height:80vmax;margin:-40vmax 0 0 -75vmax;opacity:var(--sun);background:radial-gradient(closest-side,rgba(255,226,160,.95),rgba(255,176,96,.38) 34%,transparent 70%);will-change:opacity}
.t8-cloud{width:90vw;height:32vh;border-radius:50%;background:radial-gradient(closest-side,var(--cloud),transparent);opacity:calc(var(--clouds)*.9);animation:t8-drift 52s ease-in-out infinite alternate;will-change:transform}
.t8-cloud:nth-of-type(1){top:-8%;left:-20%}.t8-cloud:nth-of-type(2){top:6%;left:30%;animation-duration:64s;animation-direction:alternate-reverse}
.t8-cloud:nth-of-type(3){top:18%;left:-30%;width:110vw;animation-duration:78s}.t8-cloud:nth-of-type(4){top:12%;left:55%;animation-duration:58s;animation-direction:alternate-reverse}
@keyframes t8-drift{from{transform:translate3d(-8vw,0,0)}to{transform:translate3d(10vw,2vh,0)}}
.t8-flock{left:0;top:var(--y);width:0;height:0;opacity:var(--birds);color:var(--tree);animation:t8-fly var(--d,46s) linear infinite;animation-delay:var(--dl,0s);will-change:transform}
.t8-flock svg{position:absolute;left:var(--x);top:var(--y);width:var(--s);height:calc(var(--s)*.43);animation:t8-flap var(--f,.6s) ease-in-out infinite alternate;animation-delay:var(--fd,0s)}
@keyframes t8-fly{from{transform:translate3d(-30vw,0,0)}to{transform:translate3d(130vw,-7vh,0)}}
@keyframes t8-flap{from{transform:scaleY(1)}to{transform:scaleY(.3)}}
.t8-mt{left:0;bottom:0;width:100%;height:max(46vh,min(76vh,37.5vw));will-change:transform}
.t8-mt .fill{fill:var(--c)}
.t8-mt .shade{fill:rgba(0,0,5,.26)}
.t8-mt .snow{fill:rgba(255,255,255,.55)}
.t8-mt .rim{fill:none;stroke:rgba(var(--gold-rgb),.55);stroke-width:1.2;vector-effect:non-scaling-stroke}
.t8-rb{left:0;bottom:0;width:100%;height:max(46vh,min(76vh,37.5vw));opacity:var(--rb)}
.t8-mist{left:-20%;width:140%;height:26vh;bottom:30vh;background:linear-gradient(180deg,transparent,var(--mist) 60%,transparent);opacity:.32;animation:t8-drift 40s ease-in-out infinite alternate}
.t8-mist.t8-m2{bottom:44vh;opacity:.2;animation-duration:55s;animation-direction:alternate-reverse}
.t8-fg{inset:0;width:100%;height:100%}
.t8-fg .ground{fill:var(--ground)}
.t8-fg .road{fill:var(--road)}
.t8-fg .sheen{fill:rgba(var(--gold-rgb),.14)}
.t8-trees{bottom:0;height:46vh;width:min(46vw,520px);fill:var(--tree)}
.t8-trees.t8-tl{left:-4vw}.t8-trees.t8-tr{right:-4vw;transform:scaleX(-1)}
.t8-lamp{border-radius:50%;background:#ffe2a0;box-shadow:0 0 12px 4px rgba(255,214,130,.65),0 0 40px 12px rgba(255,190,90,.25);opacity:var(--lamps);transform:translate(-50%,-50%)}
.t8-couple{left:50%;bottom:2.5vh;height:clamp(150px,31vh,300px);aspect-ratio:200/340;transform:translate3d(-50%,0,0);transform-origin:50% 100%;will-change:transform;filter:drop-shadow(0 0 8px rgba(var(--gold-rgb),.35))}
.t8-pair{display:block;width:100%;height:100%;overflow:visible}
.t8-pair .f1{fill:var(--fig)}.t8-pair .f2{fill:var(--fig2)}
.t8-pair .f1,.t8-pair .f2{stroke:rgba(var(--gold-rgb),.75);stroke-width:.9}
.t8-pair .sheer{fill:rgba(var(--gold-rgb),.16);stroke:rgba(var(--gold-rgb),.6);stroke-width:.8}
.t8-pair .gd{fill:none;stroke:rgba(var(--gold-rgb),.7);stroke-width:1}
.t8-pair .gf{fill:rgba(var(--gold-rgb),.9)}
.t8-pair .t8-leg,.t8-pair .t8-bob,.t8-pair .t8-gown{transform-box:fill-box;transform-origin:50% 0;animation-play-state:paused}
.t8-pair .t8-veil{transform-box:fill-box;transform-origin:50% 0;animation:t8-veil 5s ease-in-out infinite alternate}
.t8-walk .t8-pair .t8-bob{animation:t8-bob .7s ease-in-out infinite;animation-play-state:running}
.t8-walk .t8-pair .t8-l1{animation:t8-step .7s ease-in-out infinite;animation-play-state:running}
.t8-walk .t8-pair .t8-l2{animation:t8-step .7s ease-in-out infinite -.35s;animation-play-state:running}
.t8-walk .t8-pair .t8-gown{animation:t8-sway .7s ease-in-out infinite alternate;animation-play-state:running}
@keyframes t8-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
@keyframes t8-step{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes t8-sway{from{transform:skewX(-1.6deg)}to{transform:skewX(1.6deg)}}
@keyframes t8-veil{from{transform:skewX(-2.5deg) rotate(-.6deg)}to{transform:skewX(3deg) rotate(.8deg)}}
.t8-rain{inset:0;width:100%;height:100%}
.t8-flash{inset:0;opacity:0;background:radial-gradient(ellipse at var(--fx,50%) 18%,rgba(205,222,255,.62),rgba(165,190,255,.14) 46%,transparent 72%)}
.t8-bolt{inset:0;width:100%;height:100%;opacity:0}
.t8-bolt path{fill:none;stroke:#e9f0ff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 5px #9fb8ff)}
.t8-fly-dust{inset:0}
.t8-fly-dust i{position:absolute;left:var(--l);top:var(--t);width:3px;height:3px;border-radius:50%;background:var(--gold2);box-shadow:0 0 10px 3px rgba(var(--gold-rgb),.7);opacity:0;animation:t8-fire 6s ease-in-out infinite;animation-delay:var(--dl)}
@keyframes t8-fire{0%,100%{opacity:0;transform:translate3d(0,0,0)}50%{opacity:calc(var(--sun)*1);transform:translate3d(var(--x),-18px,0)}}
/* ===== content ===== */
.t8-main{position:relative;z-index:2}
.t8-wrap{position:relative;width:100%;max-width:1080px;margin:0 auto;padding:0 22px}
.t8 section{position:relative;padding:90px 0}
.t8-eyebrow{font:500 10.5px var(--f-sans);letter-spacing:.38em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.t8-head{text-align:center;margin-bottom:46px}
.t8-head h2{font:400 clamp(30px,7vw,52px)/1.12 var(--f-disp);letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px}
.t8-head p{max-width:440px;margin:0 auto;color:var(--muted);font-size:14px;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.t8-orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--gold);margin:18px auto 0;font-size:11px}
.t8-orn:before,.t8-orn:after{content:"";height:1px;width:56px;background:linear-gradient(90deg,transparent,var(--gold))}
.t8-orn:after{transform:scaleX(-1)}
.t8-gold{background:linear-gradient(110deg,#a8791f 0%,#fff0b8 24%,var(--gold) 44%,#fff7d8 58%,#b8862e 78%,#f2d27c 100%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t8-shimmer 8s linear infinite}
@keyframes t8-shimmer{0%{background-position:-220% center}100%{background-position:220% center}}
.t8-x3d{position:relative;display:block}
.t8-x3d:before{content:attr(data-text);position:absolute;left:0;top:0;width:100%;color:#6a4d12;-webkit-text-fill-color:#6a4d12;text-shadow:0 1px #7a5a18,0 2px #6d4f12,0 3px #5f440e,0 4px #523a0b,0 5px #452f08,0 6px 5px rgba(0,0,0,.4),0 16px 26px rgba(0,0,0,.5);pointer-events:none}
.t8-x3d .t8-gold{position:relative;display:block}
.t8-card{position:relative;border-radius:22px;background:linear-gradient(145deg,rgba(14,20,48,.78),rgba(8,12,30,.7));border:1px solid rgba(var(--gold-rgb),.34);box-shadow:0 24px 60px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12)}
.t8-3d{transform:perspective(1000px) rotateX(calc(var(--rx,0deg) + var(--px,0deg))) rotateY(var(--py,0deg));transition:transform .45s var(--ease),box-shadow .4s;will-change:transform}
.t8-3d:hover{box-shadow:0 34px 70px rgba(0,0,0,.55),0 0 36px rgba(var(--gold-rgb),.16),inset 0 1px 0 rgba(255,255,255,.16)}
.t8-ph{background:linear-gradient(135deg,#1a2347,#0b1226)}
.t8 img.t8-fi{opacity:0;transition:opacity .9s ease}
.t8 img.t8-fi.t8-loaded{opacity:1}
.t8 img.t8-failed{opacity:0!important}
.t8-reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t8-reveal.t8-in{opacity:1;transform:none}
.t8-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 28px;border-radius:40px;border:0;text-decoration:none;color:#241a05;font:600 11px var(--f-sans);letter-spacing:.2em;text-transform:uppercase;position:relative;overflow:hidden;background:linear-gradient(120deg,#b98230,#fdf1c6 36%,var(--gold) 62%,#f8e5a4 82%,#c9983c);background-size:220% 100%;box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.65);transition:transform .35s var(--ease),background-position .8s}
.t8-btn:hover{transform:translateY(-3px);background-position:100% 0}
.t8-btn.t8-ghost{background:transparent;color:var(--gold2);border:1px solid rgba(var(--gold-rgb),.6);box-shadow:none}
.t8-btn.t8-ghost:hover{background:rgba(var(--gold-rgb),.16)}
.t8-btn:after,.t8-send:after{content:"";position:absolute;top:0;bottom:0;width:36%;left:-60%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);animation:t8-sweep 4s ease-in-out infinite;will-change:transform}
@keyframes t8-sweep{0%,55%{transform:skewX(-22deg) translateX(0)}100%{transform:skewX(-22deg) translateX(520%)}}
/* ===== gate entry ===== */
.t8-entry{position:fixed;inset:0;width:100%;z-index:900;perspective:1800px;overflow:hidden}
.t8-door{position:absolute;top:0;bottom:0;width:50.3%;background:${JAALI},linear-gradient(90deg,#0b1233,#141c4a 60%,#0a1030);backface-visibility:hidden;transition:transform 2s cubic-bezier(.7,0,.2,1);will-change:transform;box-shadow:inset 0 0 90px rgba(0,0,0,.6)}
.t8-door:before{content:"";position:absolute;inset:14px;border:1px solid rgba(var(--gold-rgb),.55)}
.t8-door:after{content:"";position:absolute;inset:24px;border:1px solid rgba(var(--gold-rgb),.22)}
.t8-door.t8-dl{left:0;transform-origin:0 50%}
.t8-door.t8-dr{right:0;transform-origin:100% 50%}
.t8-open .t8-dl{transform:rotateY(-112deg)}
.t8-open .t8-dr{transform:rotateY(112deg)}
.t8-seam{position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;z-index:2;background:linear-gradient(transparent,var(--gold),transparent);box-shadow:0 0 18px rgba(var(--gold-rgb),.8);transition:opacity .5s}
.t8-open .t8-seam{opacity:0}
.t8-gate-in{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(10px,2.2vh,20px);text-align:center;padding:20px;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;transition:opacity .6s ease .1s,transform .6s var(--ease)}
.t8-gate-in>*{margin:0}
.t8-gate-in{justify-content:safe center}
.t8-boot .t8-gate-in{opacity:1;transform:none}
.t8-open .t8-gate-in{opacity:0;transform:scale(1.06);pointer-events:none}
.t8-kicker{font:500 clamp(9px,1.4vh,10.5px) var(--f-sans);letter-spacing:.4em;color:var(--gold2)}
.t8-gate-names{font:400 clamp(44px,9vh,76px)/1.05 var(--f-script);filter:drop-shadow(0 0 16px rgba(var(--gold-rgb),.4))}
.t8-gate-sub{font:500 clamp(9px,1.3vh,10.5px) var(--f-sans);letter-spacing:.24em;color:var(--gold)}
.t8-guest-line{font:italic 400 clamp(15px,2.3vh,19px) var(--f-serif);color:var(--gold2)}
.t8-medallion{position:relative;width:clamp(104px,17vh,136px);aspect-ratio:1;border-radius:50%;border:0;display:grid;place-content:center;gap:2px;color:#4a3208;margin-top:4px;
  background:radial-gradient(circle at 34% 26%,#fff3c4 0,#ecc873 22%,#b98435 50%,#f6db8c 68%,#986323 86%,#f9e5a3 100%);box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -8px 12px rgba(110,69,27,.5),0 14px 28px rgba(0,0,0,.55);animation:t8-pulse 3s ease-in-out infinite;will-change:transform}
.t8-medallion:before{content:"";position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(128,85,30,.6);box-shadow:inset 0 0 0 4px rgba(249,230,160,.27)}
.t8-medallion:after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 56px rgba(var(--gold-rgb),.75);opacity:0;animation:t8-glow 3s ease-in-out infinite;pointer-events:none}
.t8-medallion b{font:400 clamp(22px,3.8vh,30px) var(--f-disp);letter-spacing:.04em}
.t8-medallion small{font:600 clamp(7px,1.1vh,8.5px) var(--f-sans);letter-spacing:.22em}
.t8-medallion.t8-burst{animation:t8-burst .5s ease-in forwards}
@keyframes t8-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes t8-glow{0%,100%{opacity:0}50%{opacity:1}}
@keyframes t8-burst{45%{transform:scale(1.22)}100%{transform:scale(0);opacity:0}}
.t8-gate-note{font:500 clamp(9px,1.3vh,10.5px) var(--f-sans);letter-spacing:.3em;text-transform:uppercase;color:rgba(246,240,226,.7);cursor:pointer}
/* ===== hero ===== */
.t8-hero{min-height:100vh;min-height:100svh;display:flex;justify-content:center;text-align:center;padding:clamp(40px,8vh,84px) 20px 0}
.t8-hero-in{max-width:700px;width:100%;position:relative}
.t8-invoc{font:italic 400 clamp(15px,2vh,17px) var(--f-serif);color:var(--gold2);text-shadow:0 2px 12px rgba(0,0,0,.7)}
.t8-hero .t8-eyebrow{margin-top:8px}
.t8-names{font:400 clamp(50px,13.5vw,118px)/1.02 var(--f-script);margin:clamp(6px,1.6vh,16px) 0 0}
.t8-hero-copy{max-width:420px;margin:10px auto 0;font:italic 400 clamp(14px,1.9vh,16px) var(--f-serif);color:var(--ivory);text-shadow:0 2px 14px rgba(0,0,0,.8)}
.t8-medal{display:inline-grid;gap:0;margin-top:clamp(14px,3vh,28px);padding:14px 34px 12px;border-radius:120px;border:1px solid rgba(var(--gold-rgb),.6);background:linear-gradient(135deg,rgba(14,20,48,.7),rgba(8,12,30,.55));box-shadow:0 0 0 6px rgba(var(--gold-rgb),.07),0 18px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.18);animation:t8-float 5s ease-in-out infinite}
@keyframes t8-float{50%{transform:translateY(-7px)}}
.t8-medal small{font:600 9.5px var(--f-sans);letter-spacing:.36em;color:var(--gold)}
.t8-medal .t8-x3d{font:400 clamp(44px,8vh,62px)/1.05 var(--f-disp)}
.t8-medal em{font:italic 400 15px var(--f-serif);color:var(--gold2)}
.t8-where{margin:12px 0 0;font:italic 400 15px var(--f-serif);text-shadow:0 2px 12px rgba(0,0,0,.8)}
.t8-pill{display:inline-block;margin-top:12px;padding:7px 18px;border-radius:30px;border:1px solid rgba(var(--gold-rgb),.45);background:rgba(8,12,30,.5);font:500 10px var(--f-sans);letter-spacing:.2em;text-transform:uppercase;color:var(--gold2)}
.t8-cta{margin-top:clamp(14px,2.6vh,24px)}
.t8-cue{margin-top:clamp(14px,3vh,28px);font:500 9px var(--f-sans);letter-spacing:.3em;color:var(--gold2);text-transform:uppercase;text-shadow:0 2px 10px rgba(0,0,0,.8)}
.t8-intro .t8-hero-in>*{animation:t8-up 1.1s var(--ease) both;animation-delay:calc(var(--i,0)*.1s)}
@keyframes t8-up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
/* ===== story ===== */
.t8-poem{max-width:640px;margin:0 auto 70px;padding:38px 30px;text-align:center}
.t8-poem p{margin:0;font:italic 400 clamp(19px,4.4vw,26px)/1.7 var(--f-serif)}
.t8-poem small{display:block;margin-top:14px;font:500 11px var(--f-sans);letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
.t8-chap{margin-bottom:46px}
.t8-chap:last-child{margin-bottom:0}
.t8-chap .t8-card{display:grid;gap:0;overflow:hidden;max-width:760px;margin:0 auto}
.t8-chap-img{position:relative;height:230px;overflow:hidden}
.t8-chap-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t8-chap .t8-card:hover .t8-chap-img img{transform:scale(1.07)}
.t8-chap-img:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,12,30,.85),transparent 55%)}
.t8-num{position:absolute;z-index:2;left:20px;bottom:6px;font:400 64px/1 var(--f-disp);color:transparent;-webkit-text-stroke:1px var(--gold)}
.t8-chap-txt{padding:26px 26px 30px}
.t8-chap h3{font:400 clamp(34px,8vw,44px)/1.1 var(--f-script);color:var(--gold2);margin:0 0 8px}
.t8-chap p{margin:0;color:var(--muted);font-size:14.5px}
/* ===== date ===== */
.t8-date{text-align:center}
.t8-date-card{max-width:560px;margin:0 auto;padding:44px 26px 38px}
.t8-date-wd{font:400 clamp(36px,9vw,54px)/1 var(--f-script);color:var(--gold2)}
.t8-date-big{font:400 clamp(70px,20vw,128px)/1 var(--f-disp);margin:6px 0}
.t8-date-my{font:400 clamp(16px,3.6vw,22px) var(--f-disp);letter-spacing:.34em;text-transform:uppercase;color:var(--gold)}
.t8-date-time{margin:16px 0 0;font:italic 400 17px var(--f-serif)}
.t8-cd{display:none;justify-content:center;gap:10px;margin:26px 0 0}
.t8-cd.t8-live{display:flex}
.t8-cd div{min-width:64px;padding:11px 6px 8px;border:1px solid rgba(var(--gold-rgb),.4);border-radius:14px;background:rgba(0,0,0,.25);overflow:hidden}
.t8-cd b{display:block;font:400 26px/1.1 var(--f-disp);color:var(--gold2);font-variant-numeric:tabular-nums}
.t8-cd b.t8-tick{animation:t8-tick .5s var(--ease)}
@keyframes t8-tick{from{transform:translateY(-35%);opacity:0}to{transform:none;opacity:1}}
.t8-cd small{font:500 8px var(--f-sans);letter-spacing:.2em;color:var(--muted)}
.t8-cd-done{font:italic 400 17px var(--f-serif);color:var(--gold2)}
.t8-date-card .t8-btn{margin-top:26px}
/* ===== events ===== */
.t8-day{display:block;margin:44px 0 24px;text-align:center;font:500 11px var(--f-sans);letter-spacing:.3em;text-transform:uppercase;color:var(--gold);text-shadow:0 2px 10px rgba(0,0,0,.7)}
.t8-day:first-of-type{margin-top:0}
.t8-evs{display:grid;gap:26px}
.t8-ev{overflow:hidden}
.t8-ev-img{position:relative;height:172px;overflow:hidden}
.t8-ev-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t8-ev:hover .t8-ev-img img{transform:scale(1.08)}
.t8-ev-img:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,12,30,.95) 4%,rgba(8,12,30,.35) 55%,transparent)}
.t8-ev-t{position:absolute;z-index:2;left:18px;right:18px;bottom:12px;display:flex;align-items:flex-end;gap:12px}
.t8-ev-t .ic{font-size:26px;filter:drop-shadow(0 0 10px rgba(var(--gold-rgb),.6))}
.t8-ev-t h3{font:400 23px/1.15 var(--f-disp);letter-spacing:.06em;margin:0}
.t8-ev-t small{display:block;font:400 13px "Noto Serif Devanagari","Noto Serif Bengali","Noto Naskh Arabic",serif;color:var(--gold2);margin-top:3px}
.t8-ev-time{position:absolute;z-index:2;top:12px;right:12px;padding:5px 13px;border-radius:20px;border:1px solid rgba(var(--gold-rgb),.55);background:rgba(8,12,30,.6);font:600 10px var(--f-sans);letter-spacing:.16em;color:var(--gold2)}
.t8-ev-b{padding:18px 20px 20px}
.t8-meta{font-size:12.5px;color:var(--ivory);margin-bottom:8px}
.t8-meta b{color:var(--gold);font-weight:500;margin-right:6px}
.t8-desc{font-size:13px;color:var(--muted);margin:0 0 12px}
.t8-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 8px;border-radius:30px;border:1px solid rgba(var(--gold-rgb),.35);background:rgba(0,0,0,.2);font-size:11px}
.t8-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.5)}
/* ===== moments ===== */
.t8-flow{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:24px 0 34px;scrollbar-width:none;-webkit-overflow-scrolling:touch;perspective:1200px}
.t8-flow::-webkit-scrollbar{display:none}
.t8-flow:before,.t8-flow:after{content:"";flex:0 0 calc(50% - min(36vw,170px) - 18px)}
.t8-flow figure{flex:0 0 min(72vw,340px);aspect-ratio:3/4;margin:0;border-radius:22px;overflow:hidden;scroll-snap-align:center;cursor:zoom-in;border:1px solid rgba(var(--gold-rgb),.4);box-shadow:0 24px 50px rgba(0,0,0,.5);opacity:.55;transform:scale(.86) rotateY(var(--ry,0deg));transition:transform .6s var(--ease),opacity .6s}
.t8-flow figure.t8-cf{opacity:1;transform:scale(1)}
.t8-flow img{width:100%;height:100%;object-fit:cover}
.t8-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(4,6,16,.93);cursor:zoom-out;animation:t8-fadein .3s ease}
@keyframes t8-fadein{from{opacity:0}}
.t8-lb img{max-width:min(94vw,900px);max-height:88vh;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
/* ===== venue ===== */
.t8-venue-grid{display:grid;gap:22px}
.t8-venue-photo{position:relative;height:clamp(240px,54vw,400px);margin:0;border-radius:200px 200px 22px 22px;overflow:hidden;border:1px solid rgba(var(--gold-rgb),.5);box-shadow:0 30px 70px rgba(0,0,0,.55)}
.t8-venue-photo img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--ease)}
.t8-venue-photo:hover img{transform:scale(1.06)}
.t8-vcard{padding:34px 26px;text-align:center}
.t8-vcard h3{font:400 clamp(24px,6vw,34px)/1.2 var(--f-disp);letter-spacing:.06em;margin:4px 0 10px}
.t8-vcard p{font-size:14px;color:var(--muted);margin:0 0 22px}
.t8-vbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.t8-chips{display:grid;gap:12px;margin-top:16px}
.t8-chip{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:16px 18px;border-radius:18px;font-size:13px;color:var(--muted)}
.t8-chip span{font-size:20px;color:var(--gold)}
.t8-chip p{margin:0}
/* ===== rsvp ===== */
.t8-rsvp{max-width:540px;margin:0 auto;padding:42px 28px 34px}
.t8-rsvp h2{text-align:center;font:400 clamp(24px,6vw,32px)/1.25 var(--f-disp);letter-spacing:.06em;margin:0 0 10px}
.t8-rsvp-intro{text-align:center;font-size:13.5px;color:var(--muted);margin:0 0 24px}
.t8-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:40px;background:rgba(0,0,0,.3);border:1px solid rgba(var(--gold-rgb),.3)}
.t8-seg button{min-height:46px;border:0;border-radius:36px;background:transparent;font:500 10.5px var(--f-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--gold2);transition:background .35s,color .35s}
.t8-seg button[aria-pressed="true"]{background:linear-gradient(120deg,#b98230,var(--gold));color:#241a05}
.t8-field{position:relative;margin:22px 0}
.t8-field label{display:block;font:500 10px var(--f-sans);letter-spacing:.24em;color:var(--gold);margin-bottom:4px}
.t8-field input,.t8-field textarea{width:100%;display:block;background:transparent;border:0;border-bottom:1px solid rgba(var(--gold-rgb),.4);border-radius:0;padding:9px 0 10px;font:inherit;font-size:15px;color:#fff;outline:none;-webkit-appearance:none;appearance:none}
.t8-field textarea{resize:none;min-height:60px}
.t8-field input::placeholder,.t8-field textarea::placeholder{color:rgba(246,240,226,.4)}
.t8-field:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold2),var(--gold),var(--gold2),transparent);box-shadow:0 0 12px rgba(var(--gold-rgb),.9);transform:scaleX(0);transition:transform .6s var(--ease);pointer-events:none}
.t8-field:focus-within:after{transform:scaleX(1)}
.t8-stepper{display:flex;align-items:center;justify-content:space-between;gap:12px}
.t8-stepper>div{display:flex;align-items:center;gap:6px}
.t8-stepper button{width:40px;height:40px;border-radius:50%;border:1px solid var(--gold);background:transparent;color:var(--gold2);font-size:20px;line-height:1}
.t8-stepper output{min-width:34px;text-align:center;font:400 24px var(--f-disp)}
.t8-send{width:100%;margin-top:10px;min-height:56px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#241a05;font:700 11px var(--f-sans);letter-spacing:.2em;text-transform:uppercase;background:linear-gradient(120deg,#b98230,#fdf1c6 34%,var(--gold) 60%,#f8e5a4 80%,#c9983c);background-size:220% 100%;box-shadow:0 12px 30px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.7);transition:transform .35s var(--ease),background-position .8s}
.t8-send:hover{transform:translateY(-3px);background-position:100% 0}
.t8-send:active{transform:scale(.98)}
.t8-status{min-height:20px;margin:14px 0 0;font-size:12px;text-align:center;color:var(--gold2)}
.t8-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.t8-contact{display:inline-block;padding:9px 16px;border-radius:30px;border:1px solid rgba(var(--gold-rgb),.45);text-decoration:none;font-size:12px;color:var(--gold2)}
/* ===== finale ===== */
.t8-end{text-align:center;padding:60px 22px 44vh}
.t8-end .t8-eyebrow{margin-bottom:6px}
.t8-end-names{font:400 clamp(44px,11vw,84px)/1.05 var(--f-script)}
.t8-end p{font:500 10px var(--f-sans);letter-spacing:.3em;color:var(--ivory);margin:10px 0 0;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.7)}
.t8-end .t8-tag{font:italic 400 19px var(--f-serif);letter-spacing:.02em;text-transform:none;color:var(--gold2)}
.t8-music{display:none;position:fixed;z-index:50;right:16px;bottom:16px;width:46px;height:46px;border-radius:50%;border:1px solid rgba(var(--gold-rgb),.6);background:rgba(8,12,30,.88);color:var(--gold2);font-size:17px;box-shadow:0 6px 20px rgba(0,0,0,.5)}
.t8-js .t8-music.t8-has{display:block}
.t8-music[aria-pressed="true"]{background:var(--gold);color:#241a05}
@media(min-width:820px){
  .t8 section{padding:120px 0}
  .t8-chap .t8-card{grid-template-columns:1fr 1fr}
  .t8-chap-img{height:100%;min-height:300px}
  .t8-chap:nth-child(even) .t8-card{direction:rtl}.t8-chap:nth-child(even) .t8-card>*{direction:ltr}
  .t8-evs{grid-template-columns:repeat(2,1fr)}
  .t8-venue-grid{grid-template-columns:1.05fr 1fr;align-items:center;gap:40px}
  .t8-rsvp{padding:52px 48px 42px}
}
@media(max-width:360px){.t8-wrap{padding:0 16px}.t8-cd div{min-width:54px}.t8-cd{gap:6px}}
@media(prefers-reduced-motion:reduce){.t8 *,.t8 *:before,.t8 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t8-js .t8-reveal{opacity:1!important;transform:none!important}}
@media print{.t8-scene,.t8-progress,.t8-entry,.t8-music{display:none!important}.t8{background:#10163a}.t8-js .t8-reveal{opacity:1!important;transform:none!important}.t8-js img.t8-fi{opacity:1!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const evs = Array.isArray(events) ? events : [];
  const offset = clean(w.timezone_offset) || '+05:30';
  const theme = pickTheme(w);

  const rawBride = clean(w.bride_name) || 'Bride';
  const rawGroom = clean(w.groom_name) || 'Groom';
  const brideFirst = clean(w.name_order) === 'bride_first';
  const [rawFirst, rawSecond] = brideFirst ? [rawBride, rawGroom] : [rawGroom, rawBride];
  const first = esc(rawFirst), second = esc(rawSecond);
  const namesTxt = `${first} &amp; ${second}`;
  const initials = `${esc(rawFirst.charAt(0).toUpperCase())}&amp;${esc(rawSecond.charAt(0).toUpperCase())}`;
  const guestName = esc(clean(guest?.name) || 'Respected Guest');
  const guestLine = guest?.with_family ? `${guestName} &amp; Family` : guestName;
  const invocation = esc(clean(w.invocation) || 'With the blessings of the Almighty');
  const venue = esc(clean(w.venue) || 'Wedding Venue');
  const address = esc(clean(w.address));
  const city = esc(clean(w.city));
  const where = [venue, city].filter(Boolean).join(', ');
  const families = clean(w.families);
  const signature = esc(clean(w.footer_text) || families || `The ${clean(w.bride_name).split(/\s+/).pop() || 'Bride'} & ${clean(w.groom_name).split(/\s+/).pop() || 'Groom'} Families`);
  const poem = esc(clean(w.poem) || 'Two hearts, one beautiful story, one promise, a lifetime of love. May every tomorrow shine brighter together.');
  const inviteText = esc(clean(w.invite_text) || 'Request the pleasure of your company as they begin their beautiful journey together.');
  const hashtag = clean(w.hashtag);

  const day = dparts(w.date);
  const dateLong = day ? longDate(day) : 'Date to be announced';
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';
  const dayName = day ? weekday(day) : '';
  const timeText = fmtTime(w.time);
  const whenTs = parseWhen(w.date, w.time, offset);

  const mapUrl = safeUrl(w.map_url) || (clean(w.venue) || clean(w.address)
    ? esc(`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: [w.venue, w.address].filter(Boolean).join(', ') })}`) : '');
  const iso = t => new Date(t).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const calUrl = (whenTs && clean(w.time))
    ? esc(`https://calendar.google.com/calendar/render?${new URLSearchParams({ action: 'TEMPLATE', text: `Wedding of ${rawFirst} & ${rawSecond}`, dates: `${iso(whenTs)}/${iso(whenTs + 4 * 3600e3)}`, location: [w.venue, w.address, w.city].map(clean).filter(Boolean).join(', ') })}`) : '';
  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || contacts[0] || '';
  const digits = phoneRaw.replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = wa.length >= 10;

  const venueImg = safeImg(w.venue_image) || U('1477587458883-47145ed94245', 1200);
  const story = readStory(w.story);
  const gallery = readGallery(w.gallery);

  /* ---- scene art (unique per couple) ---- */
  const r = rng(hashStr(`${rawFirst}|${rawSecond}|${clean(w.date)}`));
  const LAYERS = [{ base: 330, amp: 240, rough: .55, snow: true }, { base: 385, amp: 200, rough: .54 }, { base: 440, amp: 165, rough: .52 }, { base: 505, amp: 95, rough: .5 }];
  const mts = LAYERS.map((L, i) => ({ i, ...ridge(r, L) }));
  const mtSvg = m => `<svg class="t8-mt" data-k="${[.25, .5, .8, 1.1][m.i]}" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" style="--c:var(--m${m.i})"><path class="fill" d="${m.fill}"/><path class="shade" d="${m.shade}"/>${m.snow ? `<path class="snow" d="${m.snow}"/>` : ''}<path class="rim" d="${m.top}"/></svg>`;
  const rbArcs = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#9775fa', '#d0a2f7'].map((c, i) => { const rr = 560 - i * 12; return `<path d="M${800 - rr} 600A${rr} ${rr} 0 0 1 ${800 + rr} 600" fill="none" stroke="${c}" stroke-opacity=".4" stroke-width="12"/>`; }).join('');
  const stars = Array.from({ length: 46 }, () => `<i style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 100).toFixed(1)}%;--dl:${(-r() * 3).toFixed(2)}s;transform:scale(${(.6 + r() * 1).toFixed(2)})"></i>`).join('');
  const flocks = [[16, 46, 0], [30, 62, -22], [10, 80, -41]].map(([y, d, dl], k) => `<div class="t8-flock" style="--y:${y}%;--d:${d}s;--dl:${dl}s">${Array.from({ length: 5 + k }, (_, j) => `<svg viewBox="0 0 28 12" style="--x:${(j * 26 + (j % 2) * 8)}px;--y:${(Math.abs(j - 2) * 9 + (j % 2) * 5)}px;--s:${16 - k * 2}px;--f:${(.45 + r() * .3).toFixed(2)}s;--fd:${(-r() * .5).toFixed(2)}s"><use href="#t8-bird"/></svg>`).join('')}</div>`).join('');
  const lampYs = [93, 85.5, 79.5, 75, 71.8, 69.4];
  const lamps = lampYs.map(y => { const hw = 1 + (y - 66.5) / 33.5 * 23; const sz = 4 + (y - 66.5) / 33.5 * 12; return [-1, 1].map(s => `<div class="t8-lamp" style="left:${(50 + s * (hw + 3.2)).toFixed(2)}%;top:${y}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px"></div>`).join(''); }).join('');
  const dust = Array.from({ length: 14 }, () => `<i style="--l:${(r() * 100).toFixed(0)}%;--t:${(48 + r() * 40).toFixed(0)}%;--dl:${(-r() * 6).toFixed(1)}s;--x:${((r() - .5) * 40).toFixed(0)}px"></i>`).join('');
  const treesL = pines(r, 7, 520, 460, 400), treesR = pines(r, 7, 520, 460, 380);
  const init = sceneAt(theme, 0);
  const rootVars = `${varsText(init.vars)};--gold:${theme.gold};--gold2:${mix(theme.gold, '#ffffff', .55)};--gold-rgb:${init.g.join(',')};--acc:${theme.acc}`;

  /* ---- events ---- */
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
  const eventsHtml = groups.map((g, gi) => {
    const label = `Day ${ORD[gi] || gi + 1}${g.p ? ` · ${weekday(g.p)}, ${shortDate(g.p)}` : ''}`;
    const cards = g.items.map(e => {
      const name = clean(e.event_name) || 'Celebration';
      const k = kindOf(name);
      const img = safeImg(e.image_url) || U(k.img);
      const loc = clean(e.venue || e.address) || clean(w.venue);
      const t = fmtTime(e.event_time);
      const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
      return `<div class="t8-reveal"><article class="t8-card t8-ev t8-3d">
        <div class="t8-ev-img t8-ph"><img class="t8-fi" src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async">${t ? `<span class="t8-ev-time">${esc(t)}</span>` : ''}
          <div class="t8-ev-t"><span class="ic" aria-hidden="true">${k.icon}</span><div><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small dir="auto">${esc(e.local_name)}</small>` : ''}</div></div></div>
        <div class="t8-ev-b">
          ${loc ? `<div class="t8-meta"><b>⌖</b>${esc(loc)}</div>` : ''}
          ${clean(e.description) ? `<p class="t8-desc">${esc(e.description)}</p>` : ''}
          ${clean(e.dress_code) ? `<div class="t8-dress"><span class="t8-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
        </div></article></div>`;
    }).join('');
    return `<span class="t8-day t8-reveal">${esc(label)}</span><div class="t8-evs">${cards}</div>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t8-fonts>
<style>${STYLE}</style>
<noscript><style>.t8-entry{display:none!important}.t8.t8-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t8-reveal{opacity:1!important;transform:none!important}.t8 img.t8-fi{opacity:1!important}</style></noscript>
<div class="t8 t8-js t8-locked t8-boot" style="${esc(rootVars)}" data-when="${esc(String(whenTs ?? parseWhen(w.date, '', offset) ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-theme="${esc(clean(w.theme).toLowerCase())}" data-accent="${esc(hex6(w.accent_color) || '')}" data-names="${esc(`${rawGroom} & ${rawBride}`)}" data-venue="${esc(clean(w.venue))}">
  ${BIRD}
  <div class="t8-scene" aria-hidden="true">
    <div class="t8-stars">${stars}</div>
    <div class="t8-moon"></div>
    <div class="t8-sun"></div>
    <div class="t8-cloud"></div><div class="t8-cloud"></div><div class="t8-cloud"></div><div class="t8-cloud"></div>
    ${flocks}
    ${mtSvg(mts[0])}
    <div class="t8-mist"></div>
    ${mtSvg(mts[1])}
    <svg class="t8-rb" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" focusable="false">${rbArcs}</svg>
    ${mtSvg(mts[2])}
    <div class="t8-mist t8-m2"></div>
    ${mtSvg(mts[3])}
    <svg class="t8-fg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path class="ground" d="M0 68Q25 64 50 66T100 65V100H0Z"/><path class="road" d="M26 100Q44 84 48.6 66.5L51.4 66.5Q56 84 74 100Z"/><path class="sheen" d="M38 100Q47 84 49.4 66.5L50.6 66.5Q53 84 62 100Z"/></svg>
    <svg class="t8-trees t8-tl" viewBox="0 0 520 460" preserveAspectRatio="xMinYMax slice" focusable="false"><path d="${treesL}"/></svg>
    <svg class="t8-trees t8-tr" viewBox="0 0 520 460" preserveAspectRatio="xMinYMax slice" focusable="false"><path d="${treesR}"/></svg>
    ${lamps}
    <div class="t8-fly-dust">${dust}</div>
    <div class="t8-couple">${COUPLE}</div>
    <canvas class="t8-rain"></canvas>
    <div class="t8-flash"></div>
    <svg class="t8-bolt" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path d=""/></svg>
  </div>
  <div class="t8-progress" aria-hidden="true"></div>

  <div class="t8-entry" role="dialog" aria-label="Wedding invitation gate">
    <div class="t8-door t8-dl"></div><div class="t8-door t8-dr"></div><div class="t8-seam"></div>
    <div class="t8-gate-in">
      <div class="t8-kicker">A CELEBRATION OF LOVE</div>
      <p class="t8-gate-names t8-gold">${namesTxt}</p>
      <div class="t8-gate-sub">${[city, day ? longDate(day) : ''].filter(Boolean).join(' · ').toUpperCase()}</div>
      <div class="t8-guest-line">Dear ${guestLine}</div>
      <button class="t8-medallion" type="button" data-open aria-label="Open wedding invitation"><b>${initials}</b><small>ENTER</small></button>
      <div class="t8-gate-note">Tap to open the gates</div>
    </div>
  </div>

  <main class="t8-main">
    <header class="t8-hero" data-hero>
      <div class="t8-hero-in">
        <div class="t8-invoc" style="--i:0">${invocation}</div>
        <div class="t8-eyebrow" style="--i:1">Together with their families</div>
        <h1 class="t8-names t8-x3d" data-text="${namesTxt}" style="--i:2"><span class="t8-gold">${namesTxt}</span></h1>
        <p class="t8-hero-copy" style="--i:3">${inviteText}</p>
        <div class="t8-medal" style="--i:4" aria-label="Wedding date"><small>${esc(dayName ? dayName.toUpperCase() : 'SAVE THE DATE')}</small><b class="t8-x3d" data-text="${day ? pad(day.d) : '--'}"><span class="t8-gold">${day ? pad(day.d) : '--'}</span></b><em>${day ? esc(MONTHS[day.mo - 1]) + ' ' + day.y : 'To be announced'}</em></div>
        <p class="t8-where" style="--i:5">${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</p>
        <div class="t8-pill" style="--i:6">Invited: ${guestLine}</div><br>
        <div class="t8-cta" style="--i:7"><a href="#" data-goto="story" class="t8-btn">Walk with us <span aria-hidden="true">↓</span></a></div>
        <div class="t8-cue" style="--i:8">Scroll · and watch the journey begin</div>
      </div>
    </header>

    <section data-sec="story">
      <div class="t8-wrap">
        <div class="t8-reveal"><div class="t8-card t8-3d t8-poem"><p>${poem}</p>${families ? `<small>${esc(families)}</small>` : ''}</div></div>
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">A little bit of forever</div><h2 class="t8-gold">Our Journey</h2><div class="t8-orn"><span>✦</span></div></div>
        ${story.map((s, i) => `<div class="t8-chap t8-reveal"><article class="t8-card t8-3d">
          <div class="t8-chap-img t8-ph"><img class="t8-fi" src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"><span class="t8-num" aria-hidden="true">${pad(i + 1)}</span></div>
          <div class="t8-chap-txt"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article></div>`).join('')}
      </div>
    </section>

    <section class="t8-date" data-sec="date">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">When the sky clears</div><h2 class="t8-gold">The Day</h2><div class="t8-orn"><span>✦</span></div></div>
        <div class="t8-reveal"><div class="t8-card t8-3d t8-date-card" data-date>
          <div class="t8-date-wd">${esc(dayName || 'Save the date')}</div>
          <div class="t8-date-big t8-x3d" data-text="${day ? pad(day.d) : '--'}"><span class="t8-gold">${day ? pad(day.d) : '--'}</span></div>
          <div class="t8-date-my">${day ? esc(MONTHS[day.mo - 1]) + ' ' + day.y : esc(dateNums)}</div>
          ${timeText ? `<p class="t8-date-time">at ${esc(timeText)}${city ? ` · ${city}` : ''}</p>` : ''}
          <div class="t8-cd" role="timer"><div><b data-u="d">--</b><small>DAYS</small></div><div><b data-u="h">--</b><small>HRS</small></div><div><b data-u="m">--</b><small>MIN</small></div><div><b data-u="s">--</b><small>SEC</small></div></div>
          ${calUrl ? `<a class="t8-btn" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Add to calendar</a>` : ''}
        </div></div>
      </div>
    </section>

    ${groups.length ? `<section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">The festivities</div><h2 class="t8-gold">Celebrations</h2>
          <p>Traditions, laughter, music and memories. We would be delighted to have you with us.</p><div class="t8-orn"><span>✦</span></div></div>
        ${eventsHtml}
      </div>
    </section>` : ''}

    ${gallery.length ? `<section style="padding-top:10px">
      <div class="t8-wrap"><div class="t8-head t8-reveal" style="margin-bottom:10px"><div class="t8-eyebrow">Glimpses of us</div><h2 class="t8-gold">Moments</h2><div class="t8-orn"><span>✦</span></div></div></div>
      <div class="t8-flow" data-flow>${gallery.map((g, i) => `<figure class="t8-ph" data-lb="${esc(g)}"><img class="t8-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></figure>`).join('')}</div>
    </section>` : ''}

    <section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Join us</div><h2 class="t8-gold">The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <div class="t8-venue-grid">
          <figure class="t8-venue-photo t8-ph t8-reveal"><img class="t8-fi" src="${esc(venueImg)}" data-fallback="${esc(U('1519741497674-611481863552', 1200))}" alt="${venue}" loading="lazy" decoding="async"></figure>
          <div class="t8-reveal">
            <div class="t8-card t8-3d t8-vcard">
              <div class="t8-eyebrow">The wedding destination</div>
              <h3 class="t8-gold">${venue}</h3>
              <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
              <div class="t8-vbtns">
                ${mapUrl ? `<a class="t8-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">⌖ &nbsp;Directions</a>` : ''}
                ${calUrl ? `<a class="t8-btn t8-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Calendar</a>` : ''}
              </div>
            </div>
            ${travel.length ? `<div class="t8-chips">${travel.map(([i, t]) => `<div class="t8-card t8-chip"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <section style="padding-bottom:40px">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Your presence is our present</div><h2 class="t8-gold">Kindly RSVP</h2></div>
        <div class="t8-reveal"><form class="t8-card t8-rsvp" data-rsvp novalidate>
          <h2 class="t8-gold">Will you grace us<br>with your presence?</h2>
          <p class="t8-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
          ${canRsvp ? `
          <div class="t8-seg" role="group" aria-label="Attendance"><button type="button" data-att="Joyfully accepts" aria-pressed="false">Joyfully accepts</button><button type="button" data-att="Regretfully declines" aria-pressed="false">Regretfully declines</button></div>
          <div class="t8-field"><label for="t8-name">YOUR NAME</label><input id="t8-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
          <div class="t8-field t8-stepper" data-guests><label style="margin:0">NUMBER OF GUESTS</label><div><button type="button" data-step="-1" aria-label="Fewer guests">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1}</output><button type="button" data-step="1" aria-label="More guests">+</button></div></div>
          <div class="t8-field"><label for="t8-note">A NOTE FOR THE COUPLE (OPTIONAL)</label><textarea id="t8-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
          <button class="t8-send" type="submit">Send reply via WhatsApp &nbsp;↗</button>
          <p class="t8-status" role="status" aria-live="polite"></p>` : ''}
          ${contacts.length ? `<div class="t8-contacts">${contacts.map(c => `<a class="t8-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form></div>
      </div>
    </section>

    <footer class="t8-end">
      <div class="t8-eyebrow t8-reveal">Forever begins</div>
      <h2 class="t8-end-names t8-x3d t8-reveal" data-text="${namesTxt}"><span class="t8-gold">${namesTxt}</span></h2>
      ${hashtag ? `<p class="t8-tag">${esc(hashtag.startsWith('#') ? hashtag : '#' + hashtag)}</p>` : ''}
      <p>${signature}</p>
      <p style="margin-top:14px">${esc(dateNums)}${city ? ` &nbsp;|&nbsp; ${city}` : ''}</p>
    </footer>
  </main>

  <button class="t8-music" type="button" aria-label="Toggle music" aria-pressed="false">♫</button>
</div>`;
}

/* ---------- mount ---------- */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  const host = root?.classList?.contains('t8') ? root : root?.querySelector?.('.t8');
  if (!host) return () => {};
  if (typeof host._t8Cleanup === 'function') host._t8Cleanup();

  const doc = host.ownerDocument || document;
  const win = doc.defaultView || window;
  if (!doc.querySelector('link[data-t8-fonts]')) {
    const l = doc.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-t8-fonts', '');
    (doc.head || doc.body).appendChild(l);
  }

  const $ = (s, r = host) => r.querySelector(s);
  const $$ = (s, r = host) => [...r.querySelectorAll(s)];
  const reduce = typeof win.matchMedia === 'function' ? win.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const canHover = typeof win.matchMedia === 'function' ? win.matchMedia('(hover:hover) and (pointer:fine)').matches : false;
  const rand = (a, b) => a + Math.random() * (b - a);
  const undo = [];
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  let dead = false;
  const theme = pickTheme({ theme: host.dataset.theme, accent_color: host.dataset.accent });

  /* scroll lock while the gate is closed */
  const html = doc.documentElement, body = doc.body;
  let locked = false;
  const lock = () => {
    if (locked) return; locked = true;
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  };
  const unlock = () => {
    if (!locked) return; locked = false;
    html.style.overflow = '';
    body.style.overflow = '';
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
  };
  host.classList.add('t8-js');
  host.classList.remove('t8-boot');
  lock();

  /* smooth boot: gate content fades in only after fonts are ready */
  (() => {
    const f = doc.fonts;
    const ready = (!f || typeof f.load !== 'function') ? Promise.resolve()
      : Promise.all([f.load('40px "Alex Brush"'), f.load('20px Marcellus'), f.load('300 15px Raleway'), f.load('italic 400 16px "Cormorant Garamond"')]).catch(() => {});
    Promise.race([ready, new Promise(r => later(r, 1600))]).then(() => { if (!dead) win.requestAnimationFrame(() => host.classList.remove('t8-boot')); });
  })();

  /* images: fade in, one fallback, then hide */
  $$('img').forEach(img => {
    const ok = () => img.classList.add('t8-loaded');
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t8-failed');
    };
    on(img, 'load', ok); on(img, 'error', fail);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
  });
  later(() => $$('img.t8-fi').forEach(i => i.classList.add('t8-loaded')), 5000);

  /* ===== scene engine ===== */
  const scene = $('.t8-scene');
  const mts = $$('.t8-mt');
  const couple = $('.t8-couple');
  const bar = $('.t8-progress');
  const cache = {};
  let rainLevel = 0, activity = 0, curP = 0, tick = false, lastY = 0, walkT = 0;
  const setVars = vars => {
    for (const k in vars) if (cache[k] !== vars[k]) { cache[k] = vars[k]; scene.style.setProperty(k, vars[k]); }
  };
  const sceneUpdate = () => {
    const vh = win.innerHeight || html.clientHeight || 800, vw = win.innerWidth || html.clientWidth || 400;
    const max = Math.max(1, (html.scrollHeight || body.scrollHeight || vh) - vh);
    const y = win.scrollY ?? html.scrollTop ?? 0;
    const p = locked ? 0 : clamp(y / max, 0, 1);
    curP = p;
    const s = sceneAt(theme, p);
    setVars(s.vars); rainLevel = s.rain;
    mts.forEach(m => { m.style.transform = `translate3d(0,${(p * Number(m.dataset.k) * vh * .07).toFixed(1)}px,0)`; });
    if (couple) {
      const sc = 1 - p * .62;
      couple.style.transform = `translate3d(calc(-50% + ${(Math.sin(p * Math.PI * 2.4) * vw * .016).toFixed(1)}px),${(-p * vh * .27).toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
    }
    if (bar) bar.style.transform = `scaleX(${p})`;
    tilt3d(vh);
  };
  /* subtle scroll-driven 3D tilt on cards */
  const cards3d = $$('.t8-3d');
  const tilt3d = vh => {
    if (reduce) return;
    const rects = [];
    for (const el of cards3d) { const r = el.getBoundingClientRect(); if (r.bottom > -50 && r.top < vh + 50) rects.push([el, r]); }
    for (const [el, r] of rects) el.style.setProperty('--rx', `${clamp(((r.top + r.height / 2) / vh - .5) * -10, -6, 6).toFixed(2)}deg`);
  };
  function onScroll() {
    const y = win.scrollY ?? 0;
    activity = Math.min(1, activity + Math.abs(y - lastY) / 70); lastY = y;
    if (!locked && couple) {
      host.classList.add('t8-walk');
      clearTimeout(walkT); walkT = setTimeout(() => host.classList.remove('t8-walk'), 220);
    }
    if (tick) return; tick = true;
    win.requestAnimationFrame(() => { tick = false; if (!dead) sceneUpdate(); });
  }
  on(win, 'scroll', onScroll, { passive: true });
  on(win, 'resize', () => { if (!dead) { sizeRain(); sceneUpdate(); } });
  undo.push(() => clearTimeout(walkT));

  /* pointer tilt (desktop only) */
  if (canHover && !reduce) cards3d.forEach(el => {
    on(el, 'pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--py', `${(((e.clientX - r.left) / r.width) - .5) * 9}deg`);
      el.style.setProperty('--px', `${(((e.clientY - r.top) / r.height) - .5) * -7}deg`);
    });
    on(el, 'pointerleave', () => { el.style.setProperty('--py', '0deg'); el.style.setProperty('--px', '0deg'); });
  });

  /* ===== rain: pooled drops, ONE stroked path per frame ===== */
  const rc = $('.t8-rain');
  const rctx = rc && rc.getContext ? rc.getContext('2d') : null;
  let RW = 0, RH = 0, DPR = 1, drops = [];
  function sizeRain() {
    if (!rc || !rctx) return;
    DPR = Math.min(1.5, win.devicePixelRatio || 1);
    RW = win.innerWidth || 400; RH = win.innerHeight || 800;
    rc.width = Math.round(RW * DPR); rc.height = Math.round(RH * DPR);
    const n = Math.min(170, Math.floor(RW * RH / 8500));
    drops = Array.from({ length: n }, () => ({ x: rand(-RW * .2, RW), y: rand(0, RH), l: rand(10, 24), v: rand(.7, 1.3) }));
  }
  let raf = 0, lastT = 0, rainClear = true;
  const rainFrame = t => {
    if (dead) return;
    raf = win.requestAnimationFrame(rainFrame);
    if (doc.hidden || !rctx) return;
    const dt = Math.min(48, t - lastT || 16); lastT = t;
    const inten = reduce ? 0 : rainLevel * (.5 + .5 * Math.min(1, activity));
    activity *= .965;
    if (inten < .02) { if (!rainClear) { rctx.clearRect(0, 0, rc.width, rc.height); rainClear = true; } return; }
    rainClear = false;
    const n = Math.floor(drops.length * inten);
    rctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    rctx.clearRect(0, 0, RW, RH);
    rctx.strokeStyle = `rgba(196,214,255,${(.2 + .28 * inten).toFixed(2)})`;
    rctx.lineWidth = 1;
    rctx.beginPath();
    const k = dt / 16;
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      d.y += d.v * 15 * k; d.x += d.v * 3.3 * k;
      if (d.y > RH) { d.y = -d.l; d.x = rand(-RW * .2, RW); }
      rctx.moveTo(d.x, d.y); rctx.lineTo(d.x + d.l * .22, d.y + d.l);
    }
    rctx.stroke();
  };
  sizeRain();
  if (rctx && !reduce) { raf = win.requestAnimationFrame(rainFrame); undo.push(() => win.cancelAnimationFrame(raf)); }

  /* ===== gentle lightning ===== */
  const flashEl = $('.t8-flash'), boltSvg = $('.t8-bolt'), boltPath = boltSvg && $('path', boltSvg);
  const strike = () => {
    if (reduce || dead || !flashEl || typeof flashEl.animate !== 'function') return;
    const x0 = rand(14, 86);
    flashEl.style.setProperty('--fx', `${x0}%`);
    let x = x0, y = 0, d = `M${x} 0`;
    while (y < 52) { y += rand(5, 10); x += rand(-6, 6); d += `L${x.toFixed(1)} ${y.toFixed(1)}`; }
    let bx = x0 + rand(-5, 5), by = rand(14, 26); d += `M${bx} ${by}`;
    for (let i = 0; i < 3; i++) { bx += rand(2, 6) * (x0 > 50 ? -1 : 1); by += rand(4, 8); d += `L${bx.toFixed(1)} ${by.toFixed(1)}`; }
    if (boltPath) boltPath.setAttribute('d', d);
    flashEl.animate([{ opacity: 0 }, { opacity: .34 }, { opacity: .06 }, { opacity: .26 }, { opacity: 0 }], { duration: 650, easing: 'ease-out' });
    if (boltSvg) boltSvg.animate([{ opacity: 0 }, { opacity: .85 }, { opacity: .15 }, { opacity: .6 }, { opacity: 0 }], { duration: 540 });
  };
  let nextStrike = Date.now() + 6000;
  const sid = setInterval(() => {
    if (doc.hidden || locked) return;
    if (rainLevel > .55 && Date.now() > nextStrike) { strike(); nextStrike = Date.now() + rand(8000, 15000); }
  }, 1000);
  timers.push(sid);

  /* ===== gate sequence ===== */
  const entry = $('.t8-entry'), medal = $('[data-open]'), note = $('.t8-gate-note'), hero = $('[data-hero]');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (medal) medal.classList.add('t8-burst');
    if (entry) entry.classList.add('t8-open');
    activity = 1;
    later(strike, 650);
    later(() => { if (hero) hero.classList.add('t8-intro'); }, 1200);
    later(() => {
      if (entry) entry.remove();
      host.classList.remove('t8-locked');
      unlock(); sceneUpdate();
    }, 2300);
  };
  on(medal, 'click', open);
  on(note, 'click', open);

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* reveals (+ lightning when the date appears) */
  const clearDelay = el => later(() => { el.style.transitionDelay = ''; }, 1400);
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t8-in'); clearDelay(e.target); io.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.t8-reveal').forEach(el => io.observe(el));
    undo.push(() => io.disconnect());
    const dateEl = $('[data-date]');
    if (dateEl) {
      const dio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { later(strike, 500); dio.disconnect(); } }, { threshold: .6 });
      dio.observe(dateEl); undo.push(() => dio.disconnect());
    }
    /* coverflow centre detection */
    const flow = $('[data-flow]');
    if (flow) {
      const figs = $$('figure', flow);
      const cio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('t8-cf', e.isIntersecting)), { root: flow, rootMargin: '0px -34% 0px -34%', threshold: .5 });
      figs.forEach(f => cio.observe(f)); undo.push(() => cio.disconnect());
      figs[0]?.classList.add('t8-cf');
    }
  } else {
    $$('.t8-reveal').forEach(el => el.classList.add('t8-in'));
    $$('.t8-flow figure').forEach(f => f.classList.add('t8-cf'));
  }

  /* countdown */
  const when = Number(host.dataset.when);
  const cdBox = $('.t8-cd');
  if (when && cdBox) {
    const set = (k, v) => {
      const el = $(`[data-u="${k}"]`, cdBox); if (!el) return;
      const t = pad(v);
      if (el.textContent !== t) { el.textContent = t; if (!reduce) { el.classList.remove('t8-tick'); void el.offsetWidth; el.classList.add('t8-tick'); } }
    };
    let id;
    const step = () => {
      const left = when - Date.now();
      if (left <= 0) { cdBox.innerHTML = '<span class="t8-cd-done">The celebration has begun ✦</span>'; clearInterval(id); return; }
      const s = Math.floor(left / 1000);
      set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
    };
    cdBox.classList.add('t8-live'); step();
    id = setInterval(step, 1000); timers.push(id);
  }

  /* lightbox */
  const closeLb = () => { $('.t8-lb')?.remove(); };
  $$('[data-lb]').forEach(f => on(f, 'click', () => {
    const src = f.dataset.lb; if (!src) return;
    closeLb();
    const lb = doc.createElement('div'); lb.className = 't8-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    const im = doc.createElement('img'); im.src = src; im.alt = 'Moment';
    lb.appendChild(im); lb.addEventListener('click', closeLb); host.appendChild(lb);
  }));
  on(doc, 'keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* RSVP */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa;
  if (form && waNum) {
    let att = '';
    const segBtns = $$('[data-att]', form);
    const guestsBox = $('[data-guests]', form), out = $('[data-count]', form);
    let count = Number(out?.textContent) || 1;
    segBtns.forEach(b => on(b, 'click', () => {
      att = b.dataset.att;
      segBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (guestsBox) guestsBox.style.display = att === 'Regretfully declines' ? 'none' : '';
    }));
    $$('[data-step]', form).forEach(b => on(b, 'click', () => {
      count = clamp(count + Number(b.dataset.step), 1, 12);
      if (out) out.textContent = String(count);
    }));
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const nt = $('[name="note"]', form).value.trim();
      const status = $('.t8-status', form);
      if (!name || !att) { status.textContent = 'Please add your name and choose whether you can join.'; return; }
      const dateTxt = $('[data-date]', host)?.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) || '';
      const msg = [`Wedding RSVP — ${host.dataset.names || ''}`, `Name: ${name}`, `Response: ${att}`, att !== 'Regretfully declines' && `Guests: ${count}`, nt && `Note: ${nt}`, dateTxt && `Wedding date: ${dateTxt}`, host.dataset.venue && `Venue: ${host.dataset.venue}`].filter(Boolean).join('\n');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      status.textContent = 'Thank you! Your WhatsApp reply is opening in a new tab.';
    });
  }

  /* optional music */
  const musicBtn = $('.t8-music'), musicUrl = host.dataset.music;
  if (musicBtn && musicUrl) {
    const audio = new Audio(musicUrl); audio.loop = true; audio.preload = 'none';
    musicBtn.classList.add('t8-has');
    on(musicBtn, 'click', () => {
      const play = audio.paused;
      (play ? audio.play() : Promise.resolve(audio.pause())).catch(() => {});
      musicBtn.setAttribute('aria-pressed', String(play)); musicBtn.textContent = play ? '♪' : '♫';
    });
    undo.push(() => audio.pause());
  }

  sceneUpdate();

  const cleanup = () => {
    dead = true;
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    closeLb();
    unlock();
    host.classList.remove('t8-js', 't8-locked', 't8-walk');
    delete host._t8Cleanup;
  };
  host._t8Cleanup = cleanup;
  return cleanup;
}