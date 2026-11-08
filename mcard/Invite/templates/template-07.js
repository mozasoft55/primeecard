/* ==========================================================================
   Blush Editorial — "Envelope & Arch" Wedding Invitation  (template 7)
   Light ivory-paper luxury stationery look. Wax-sealed envelope entry, arch
   photo frames, editorial numbered story, mini wedding calendar, vertical
   timeline, masonry moments + lightbox, pill-toggle RSVP, dark finale.

   Contract:
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a complete, readable static invitation (no JS needed).

   wedding fields (all optional, nothing is hard-coded):
     bride_name, groom_name, name_order ('bride_first'), date, time,
     timezone_offset (default +05:30), venue, address, city, map_url,
     invocation, invite_text, families | footer_text, poem, hashtag,
     hero_image, venue_image, rsvp_number, rsvp_contacts,
     story: [{title,text,image}] (array or JSON string, max 3),
     travel_info, stay_info, music_url,
     theme: 'blush'(default)|'sage'|'lavender'|'terracotta'|'sky',
     accent_color, accent2_color, paper_color  ('#RRGGBB' overrides),
     gallery: [https urls] (array / JSON string / ';'-separated)
   events[]: event_name, event_date, event_time, venue, address, description,
     dress_code, dress_color, local_name, image_url
   guest: name, with_family
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORD = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap';

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

/* ---------- dynamic theme ---------- */
const PRESETS = {
  maroon: { a: '#8e1b34', a2: '#c99e32', paper: '#fdf9f4', ink: '#20050a' },
  royal: { a: '#8e1b34', a2: '#c99e32', paper: '#fdf9f4', ink: '#20050a' },
  emerald: { a: '#0c5238', a2: '#d4af37', paper: '#f4f8f5', ink: '#041d14' },
  navy: { a: '#142e5d', a2: '#dfb85f', paper: '#f4f6fb', ink: '#050f24' },
  rose: { a: '#99224f', a2: '#d49a50', paper: '#fdf5f8', ink: '#250412' },
  blush: { a: '#b4566b', a2: '#7d8f69', paper: '#fbf6ef', ink: '#281317' },
  sage: { a: '#5f7a61', a2: '#c08a6a', paper: '#f7f7f0', ink: '#1c251c' },
  lavender: { a: '#7a63a8', a2: '#c5a46a', paper: '#f8f5fb', ink: '#211833' },
  terracotta: { a: '#b5593c', a2: '#6b7f6a', paper: '#fbf4ec', ink: '#2c140d' },
  sky: { a: '#3f6f9f', a2: '#c9a66b', paper: '#f4f8fb', ink: '#0e1f30' }
};
const hex6 = v => {
  const m = clean(v).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  return '#' + (m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]).toLowerCase();
};
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hexOf = a => '#' + a.map(c => pad(Math.max(0, Math.min(255, Math.round(c))).toString(16))).join('');
const scale = (h, k) => hexOf(rgbOf(h).map(c => c * k));
const mix = (h1, h2, t) => { const a = rgbOf(h1), b = rgbOf(h2); return hexOf(a.map((c, i) => c + (b[i] - c) * t)); };
const lumOf = h => { const [r, g, b] = rgbOf(h); return 0.299 * r + 0.587 * g + 0.114 * b; };

function themeVars(w) {
  const p = PRESETS[clean(w.theme || w.theme_name).toLowerCase()] || PRESETS.maroon || PRESETS.blush;
  const a = hex6(w.accent_color) || p.a, a2 = hex6(w.accent2_color) || p.a2;
  const paperCand = hex6(w.paper_color);
  // Protect template 07 paper: must remain light luxury stationery (lum >= 65)
  const paper = (paperCand && lumOf(paperCand) >= 65) ? paperCand : p.paper;
  const ink = p.ink || scale(a, .22);
  const dark = scale(a, .7), soft = mix(a, '#ffffff', .82), mid = mix(a, '#ffffff', .6), paper2 = mix(paper, a, .07);
  const rgb = h => rgbOf(h).join(',');
  return `--paper:${paper};--paper2:${paper2};--ink:${ink};--a:${a};--a-dark:${dark};--a-soft:${soft};--a-mid:${mid};--a2:${a2};--a-rgb:${rgb(a)};--a2-rgb:${rgb(a2)};--ink-rgb:${rgb(ink)};--paper-rgb:${rgb(paper)}`;
}

/* ---------- imagery (Unsplash; every <img> has a fallback) ---------- */
const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const KINDS = [
  { re: /haldi|ubtan|pithi|gaye\s*holud/i, icon: '🌼', img: '1606216794074-735e91aa2c92', alt: '1599661046827-dacff0c0f09a', dress: '#f4c542' },
  { re: /mehendi|mehndi|henna/i, icon: '🌿', img: '1583939003579-730e3918a45a', alt: '1465495976277-4387d4b0b4c6', dress: '#187653' },
  { re: /sangeet|cocktail|music|garba|dandiya/i, icon: '🎶', img: '1469371670807-013ccf25f16a', alt: '1511795409834-ef04bbd61622', dress: '#7444a1' },
  { re: /baraat|barat|procession/i, icon: '🐎', img: '1519167758481-83f550bb49b3', alt: '1606216794074-735e91aa2c92', dress: '#e88aab' },
  { re: /jaimala|varmala|engagement|sagai|tilak|ring/i, icon: '💐', img: '1519225421980-715cb0215aed', alt: '1465495976277-4387d4b0b4c6', dress: '#d8b56e' },
  { re: /phere|pheras|nikah|wedding|vivah|shaadi|biye|ceremony|saptapadi/i, icon: '🔥', img: '1465495976277-4387d4b0b4c6', alt: '1519741497674-611481863552', dress: '#8e1e32' },
  { re: /reception|walima|dinner|aashirbaad|aashirvad|blessing/i, icon: '✨', img: '1511795409834-ef04bbd61622', alt: '1469371670807-013ccf25f16a', dress: '#e6cbd3' }
];
const DEFAULT_KIND = { icon: '✦', img: '1519741497674-611481863552', alt: '1522413452208-996ff3f3e740', dress: '#d9b8a8' };
const kindOf = name => KINDS.find(k => k.re.test(name)) || DEFAULT_KIND;

const DEFAULT_STORY = [
  { title: 'How We Met', text: 'One unexpected hello became a thousand conversations, shared dreams, and a friendship that felt like home.', image: U('1529636798458-92182e662485', 700), alt: U('1519741497674-611481863552', 700) },
  { title: 'The Proposal', text: 'With happy tears and hearts full of hope, we chose each other—and all the beautiful tomorrows still to come.', image: U('1519741497674-611481863552', 700), alt: U('1522413452208-996ff3f3e740', 700) },
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

/* mini month calendar for the wedding month (events days get a dot) */
function calendarHtml(day, evDates) {
  const first = new Date(Date.UTC(day.y, day.mo - 1, 1)).getUTCDay();
  const dim = new Date(Date.UTC(day.y, day.mo, 0)).getUTCDate();
  const dots = new Set(evDates.map(dparts).filter(p => p && p.y === day.y && p.mo === day.mo).map(p => p.d));
  const head = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(c => `<span class="t7-cal-h">${c}</span>`).join('');
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    cells += d === day.d
      ? `<span class="t7-cal-d t7-cal-on" aria-label="Wedding day"><b>${d}</b></span>`
      : `<span class="t7-cal-d${dots.has(d) ? ' t7-cal-dot' : ''}">${d}</span>`;
  }
  return `<div class="t7-cal-grid" role="img" aria-label="${esc(MONTHS[day.mo - 1])} ${day.y} calendar">${head}${cells}</div>`;
}

const BRANCH = `<svg viewBox="0 0 120 220" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M60 214C58 160 64 110 52 6"/><path d="M59 180c-22-6-34-22-38-40 22 2 36 14 38 40z" fill="currentColor" fill-opacity=".16"/><path d="M60 150c22-4 36-20 40-40-22 0-37 14-40 40z" fill="currentColor" fill-opacity=".16"/><path d="M57 118c-20-4-30-18-34-34 20 2 32 12 34 34z" fill="currentColor" fill-opacity=".16"/><path d="M57 88c18-4 28-16 31-32-18 0-29 12-31 32z" fill="currentColor" fill-opacity=".16"/><path d="M54 56c-13-4-20-13-22-25 14 1 21 9 22 25z" fill="currentColor" fill-opacity=".16"/></g><g fill="currentColor"><circle cx="52" cy="8" r="3"/><circle cx="26" cy="66" r="2"/><circle cx="96" cy="130" r="2"/><circle cx="18" cy="148" r="2"/></g></svg>`;

/* ---------- styles (scoped under .t7; colours come from theme variables) ---------- */
const STYLE = `
.t7,.t7 *,.t7 *:before,.t7 *:after{box-sizing:border-box}
.t7{--paper:#fbf6ef;--paper2:#f4ece0;--ink:#281317;--a:#b4566b;--a-dark:#7e3c4b;--a-soft:#f4e3e7;--a-mid:#e1b8c1;--a2:#7d8f69;--a-rgb:180,86,107;--a2-rgb:125,143,105;--ink-rgb:40,19,23;--paper-rgb:251,246,239;
  --f-disp:Italiana,"Playfair Display",serif;--f-serif:"Playfair Display",Georgia,serif;--f-script:"Pinyon Script",cursive;--f-sans:Jost,system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;overflow-anchor:none;color:var(--ink);font:300 15px/1.75 var(--f-sans);-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 70% 30% at 85% 0,rgba(var(--a-rgb),.08),transparent 70%),radial-gradient(ellipse 60% 25% at 5% 40%,rgba(var(--a2-rgb),.07),transparent 70%),var(--paper)}
.t7.t7-locked{height:100vh!important;height:100svh!important;max-height:100vh!important;max-height:100svh!important;overflow:hidden!important}
.t7 h1,.t7 h2,.t7 h3,.t7 p,.t7 figure{margin-top:0}
.t7 img{display:block;max-width:100%}
.t7 button{font:inherit;color:inherit;cursor:pointer}
.t7 a{color:inherit}
.t7 :focus-visible{outline:2px solid var(--a);outline-offset:3px}
.t7-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--a2),var(--a))}
.t7-wrap{position:relative;width:100%;max-width:1080px;margin:0 auto;padding:0 22px}
.t7 section{position:relative;padding:92px 0}
.t7-eyebrow{font:500 10.5px var(--f-sans);letter-spacing:.36em;text-transform:uppercase;color:var(--a);margin-bottom:12px}
.t7-head{text-align:center;margin-bottom:50px}
.t7-head h2{font:400 clamp(32px,7vw,54px)/1.1 var(--f-disp);letter-spacing:.06em;margin:0 0 12px;text-transform:uppercase}
.t7-head p{max-width:440px;margin:0 auto;color:rgba(var(--ink-rgb),.7);font-size:14px}
.t7-orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--a);margin:18px auto 0;font-size:11px}
.t7-orn:before,.t7-orn:after{content:"";height:1px;width:56px;background:linear-gradient(90deg,transparent,var(--a))}
.t7-orn:after{transform:scaleX(-1)}
.t7-ph{background:linear-gradient(135deg,var(--a-soft),var(--paper2))}
.t7 img.t7-fi{opacity:0;transition:opacity .9s ease}
.t7 img.t7-fi.t7-loaded{opacity:1}
.t7 img.t7-failed{opacity:0!important}
.t7-reveal{opacity:0;transform:translateY(32px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t7-reveal.t7-in{opacity:1;transform:none}
.t7-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 28px;border-radius:40px;border:1px solid var(--a);text-decoration:none;font:500 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;position:relative;overflow:hidden;color:#fff;background:var(--a);transition:transform .35s var(--ease),background .35s,color .35s}
.t7-btn:hover{transform:translateY(-3px);background:var(--a-dark)}
.t7-btn.t7-ghost{background:transparent;color:var(--a)}
.t7-btn.t7-ghost:hover{background:var(--a);color:#fff}
/* entry: envelope */
.t7-entry{position:fixed;inset:0;width:100%;z-index:900;display:grid;place-items:center;padding:clamp(12px,2.5vh,24px);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;background:radial-gradient(ellipse at 50% 38%,var(--paper) 0,var(--paper2) 75%);transition:opacity .8s ease,transform .8s var(--ease)}
.t7-entry.t7-leaving{opacity:0;transform:scale(1.06);pointer-events:none}
.t7-entry-in{display:flex;flex-direction:column;align-items:center;gap:clamp(12px,2.6vh,24px);margin:auto;text-align:center;max-width:94vw;transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t7-boot .t7-entry-in{opacity:1;transform:none}
.t7-kicker{font:500 10px var(--f-sans);letter-spacing:.4em;color:var(--a)}
.t7-env{--w:min(84vw,400px,calc(46vh*1.47));position:relative;width:var(--w);height:calc(var(--w)*.68);margin-top:clamp(36px,11vh,96px);perspective:1200px;filter:drop-shadow(0 22px 26px rgba(var(--ink-rgb),.22))}
.t7-env-back{position:absolute;inset:0;background:linear-gradient(160deg,var(--a-mid),var(--a));border-radius:4px}
.t7-letter{position:absolute;left:7%;right:7%;top:9%;bottom:9%;z-index:1;display:grid;place-content:center;text-align:center;padding:0 8px;background:linear-gradient(180deg,#fffdf9,var(--paper));border-radius:3px;box-shadow:0 1px 3px rgba(var(--ink-rgb),.2);transition:transform 1s var(--ease) .45s}
.t7-letter small{font:500 calc(var(--w)*.024) var(--f-sans);letter-spacing:.34em;color:var(--a)}
.t7-letter b{display:block;font:400 calc(var(--w)*.1)/1.1 var(--f-script);color:var(--ink);margin:4px 0}
.t7-letter em{font:italic 400 calc(var(--w)*.036) var(--f-serif);color:rgba(var(--ink-rgb),.7)}
.t7-pocket{position:absolute;inset:0;z-index:2;pointer-events:none}
.t7-pocket i{position:absolute;inset:0}
.t7-pocket i:nth-child(1){background:linear-gradient(120deg,var(--a-soft),var(--a-mid));clip-path:polygon(0 0,52% 56%,0 100%)}
.t7-pocket i:nth-child(2){background:linear-gradient(240deg,var(--a-soft),var(--a-mid));clip-path:polygon(100% 0,48% 56%,100% 100%)}
.t7-pocket i:nth-child(3){background:linear-gradient(0deg,var(--a-mid),var(--a-soft));clip-path:polygon(0 100%,50% 44%,100% 100%)}
.t7-flap{position:absolute;left:0;right:0;top:0;height:58%;z-index:3;transform-origin:50% 0;background:linear-gradient(180deg,var(--a-soft),var(--a-mid));clip-path:polygon(0 0,100% 0,50% 100%);transition:transform .8s var(--ease),z-index 0s .38s}
.t7-open .t7-flap{transform:rotateX(180deg);z-index:0}
.t7-open .t7-letter{transform:translateY(-52%)}
.t7-seal{position:absolute;z-index:4;left:50%;top:58%;width:clamp(58px,calc(var(--w)*.19),82px);aspect-ratio:1;margin:0;transform:translate(-50%,-50%);border:0;border-radius:50%;display:grid;place-content:center;color:var(--a-soft);
  background:radial-gradient(circle at 34% 28%,var(--a),var(--a-dark) 80%);box-shadow:inset 0 2px 2px rgba(255,255,255,.35),inset 0 -5px 8px rgba(0,0,0,.3),0 8px 14px rgba(var(--ink-rgb),.35);animation:t7-bob 3s ease-in-out infinite;will-change:transform}
.t7-seal:before{content:"";position:absolute;inset:5px;border-radius:50%;border:1px solid rgba(255,255,255,.4)}
.t7-seal:after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 26px rgba(var(--a-rgb),.9);opacity:0;animation:t7-glow 3s ease-in-out infinite;pointer-events:none}
.t7-seal b{font:400 calc(var(--w)*.062)/1 var(--f-disp);letter-spacing:.02em}
.t7-seal.t7-burst{animation:t7-burst .5s ease-in forwards}
@keyframes t7-bob{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.07)}}
@keyframes t7-glow{0%,100%{opacity:0}50%{opacity:1}}
@keyframes t7-burst{40%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(0);opacity:0}}
.t7-guest-line{font:italic 400 clamp(15px,2.3vh,18px) var(--f-serif);color:var(--ink)}
.t7-entry-note{font:500 10px var(--f-sans);letter-spacing:.3em;text-transform:uppercase;color:rgba(var(--ink-rgb),.6);cursor:pointer}
/* hero */
.t7-hero{position:relative;min-height:100vh;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:clamp(60px,9vh,96px) 20px clamp(70px,10vh,100px);text-align:center;isolation:isolate}
.t7-branch{position:absolute;color:var(--a2);opacity:.55;width:clamp(70px,16vw,150px);pointer-events:none;z-index:0}
.t7-branch svg{display:block;width:100%;height:auto}
.t7-branch.t7-b1{top:-10px;left:-6px;transform:rotate(18deg)}
.t7-branch.t7-b2{bottom:-10px;right:-6px;transform:rotate(198deg);color:var(--a)}
.t7-petals{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.t7-petal{position:absolute;top:-24px;left:var(--l,50%);width:var(--s,10px);height:calc(var(--s,10px)*1.4);border-radius:150% 0 150% 0;background:var(--a-mid);opacity:0;animation:t7-fall var(--d,12s) linear infinite;animation-delay:var(--dl,0s)}
@keyframes t7-fall{0%{transform:translate3d(0,0,0) rotate(0);opacity:0}10%{opacity:.8}90%{opacity:.7}100%{transform:translate3d(var(--x,40px),108vh,0) rotate(540deg);opacity:0}}
.t7-hero-in{position:relative;z-index:2;max-width:640px;width:100%}
.t7-invoc{font:italic 400 14px var(--f-serif);color:var(--a-dark);margin-bottom:4px}
.t7-arch{--aw:min(72vw,290px);position:relative;width:var(--aw);margin:clamp(14px,2.4vh,24px) auto clamp(8px,1.6vh,16px)}
.t7-arch:before{content:"";position:absolute;inset:-12px;border:1px solid var(--a);border-radius:calc(var(--aw)/2 + 12px) calc(var(--aw)/2 + 12px) 4px 4px;opacity:.55;pointer-events:none}
.t7-arch-img{position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:calc(var(--aw)/2) calc(var(--aw)/2) 0 0;box-shadow:0 26px 50px rgba(var(--ink-rgb),.25)}
.t7-hero-img{position:absolute;inset:-6% 0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.6s ease;transform:translate3d(0,0,0) scale(1.08);will-change:transform}
.t7-hero-img.t7-on{opacity:1}
.t7-names{font:400 clamp(54px,15vw,112px)/.95 var(--f-script);color:var(--a);margin:clamp(14px,2.4vh,26px) 0 0}
.t7-names span{display:block;font:400 .34em var(--f-disp);color:var(--a2);letter-spacing:.3em;margin:2px 0}
.t7-hero-copy{max-width:400px;margin:12px auto 0;font:italic 400 15px var(--f-serif);color:rgba(var(--ink-rgb),.78)}
.t7-datebar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;max-width:420px;margin:clamp(16px,3vh,26px) auto 0}
.t7-datebar>div{font:500 11px var(--f-sans);letter-spacing:.3em;text-transform:uppercase;color:var(--a-dark);border-top:1px solid var(--a);border-bottom:1px solid var(--a);padding:9px 0}
.t7-datebar strong{font:400 clamp(46px,11vw,66px)/1 var(--f-disp);color:var(--ink)}
.t7-where{font:italic 400 14px var(--f-serif);margin-top:12px;color:rgba(var(--ink-rgb),.75)}
.t7-cd{display:none;justify-content:center;gap:10px;margin-top:18px}
.t7-cd.t7-live{display:flex}
.t7-cd div{min-width:62px;padding:10px 6px 8px;border:1px solid var(--a-mid);border-radius:14px;background:rgba(255,255,255,.55);overflow:hidden}
.t7-cd b{display:block;font:400 26px/1.1 var(--f-disp);color:var(--a);font-variant-numeric:tabular-nums}
.t7-cd b.t7-tick{animation:t7-tick .5s var(--ease)}
@keyframes t7-tick{from{transform:translateY(-35%);opacity:0}to{transform:none;opacity:1}}
.t7-cd small{font:500 8px var(--f-sans);letter-spacing:.2em;color:rgba(var(--ink-rgb),.6)}
.t7-cd-done{font:italic 400 15px var(--f-serif);color:var(--a)}
.t7-pill{display:inline-block;margin-top:16px;padding:8px 20px;border-radius:30px;border:1px solid var(--a-mid);background:rgba(255,255,255,.6);font:500 10px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;color:var(--a-dark)}
.t7-cta{margin-top:clamp(16px,3vh,28px)}
.t7-cue{position:absolute;bottom:20px;left:0;right:0;z-index:2;font:500 9px var(--f-sans);letter-spacing:.3em;color:var(--a);text-transform:uppercase}
.t7-cue i{display:block;width:1px;height:36px;margin:8px auto 0;background:linear-gradient(var(--a),transparent);transform-origin:top;animation:t7-drip 2s ease-in-out infinite}
@keyframes t7-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.t7-intro .t7-hero-in>*{animation:t7-up 1.1s var(--ease) both;animation-delay:calc(var(--i,0)*.1s)}
.t7-intro .t7-branch{animation:t7-fadein 1.6s ease .3s both}
@keyframes t7-up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes t7-fadein{from{opacity:0}}
/* invitation quote */
.t7-quote{text-align:center;max-width:620px;margin:0 auto}
.t7-quote:before{content:"“";display:block;font:400 96px/.6 var(--f-script);color:var(--a-mid);height:46px}
.t7-quote p{font:italic 400 clamp(20px,4.6vw,28px)/1.7 var(--f-serif);margin:0 0 18px}
.t7-quote small{display:block;font:500 11px var(--f-sans);letter-spacing:.3em;color:var(--a);text-transform:uppercase}
/* story: editorial rows */
.t7-chap{display:grid;gap:26px;align-items:center;justify-items:center;margin-bottom:76px;text-align:center}
.t7-chap:last-child{margin-bottom:0}
.t7-chap-img{--aw:min(70vw,250px);width:var(--aw);aspect-ratio:3/4;position:relative;overflow:hidden;border-radius:calc(var(--aw)/2) calc(var(--aw)/2) 8px 8px;box-shadow:0 22px 44px rgba(var(--ink-rgb),.22)}
.t7-chap-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t7-chap:hover .t7-chap-img img{transform:scale(1.06)}
.t7-num{font:400 clamp(64px,16vw,104px)/1 var(--f-disp);color:transparent;-webkit-text-stroke:1px var(--a);display:block}
.t7-chap h3{font:400 clamp(34px,8vw,46px)/1.1 var(--f-script);color:var(--a);margin:-8px 0 10px}
.t7-chap p{max-width:380px;margin:0 auto;color:rgba(var(--ink-rgb),.78);font-size:14.5px}
/* calendar */
.t7-calcard{max-width:420px;margin:0 auto;padding:34px 26px 30px;border-radius:26px;text-align:center;background:linear-gradient(180deg,#fff,var(--paper));border:1px solid var(--a-mid);box-shadow:0 30px 60px rgba(var(--ink-rgb),.14)}
.t7-calcard h3{font:400 28px var(--f-disp);letter-spacing:.2em;text-transform:uppercase;color:var(--a);margin:0 0 4px}
.t7-calcard small{display:block;font:500 11px var(--f-sans);letter-spacing:.3em;color:rgba(var(--ink-rgb),.6);margin-bottom:20px}
.t7-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 0;justify-items:center}
.t7-cal-h{font:500 10px var(--f-sans);letter-spacing:.1em;color:var(--a2);padding-bottom:6px}
.t7-cal-d{position:relative;width:34px;height:34px;display:grid;place-items:center;font:400 14px var(--f-sans);font-variant-numeric:tabular-nums}
.t7-cal-dot:after{content:"";position:absolute;bottom:2px;width:4px;height:4px;border-radius:50%;background:var(--a2)}
.t7-cal-on{color:#fff}
.t7-cal-on b{position:relative;z-index:1;font-weight:600}
.t7-cal-on:before{content:"";position:absolute;inset:-3px;border-radius:50%;background:var(--a);box-shadow:0 6px 16px rgba(var(--a-rgb),.5)}
.t7-cal-on:after{content:"♥";position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--a)}
.t7-calcard .t7-btn{margin-top:26px}
/* timeline */
.t7-day{display:block;margin:46px 0 26px 52px;font:500 11px var(--f-sans);letter-spacing:.3em;text-transform:uppercase;color:var(--a)}
.t7-day:first-of-type{margin-top:0}
.t7-tl{position:relative}
.t7-tl:before{content:"";position:absolute;left:19px;top:0;bottom:0;width:1px;background:linear-gradient(transparent,var(--a-mid) 6%,var(--a-mid) 94%,transparent)}
.t7-tl-item{position:relative;padding-left:52px;margin-bottom:34px}
.t7-tl-dot{position:absolute;left:11px;top:4px;width:17px;height:17px;border-radius:50%;background:var(--paper);border:1px solid var(--a);box-shadow:0 0 0 5px var(--paper)}
.t7-tl-dot:after{content:"";position:absolute;inset:4px;border-radius:50%;background:var(--a)}
.t7-tl-time{font:400 20px var(--f-disp);letter-spacing:.14em;color:var(--a);margin-bottom:8px}
.t7-tl-card{overflow:hidden;border-radius:20px;background:#fff;border:1px solid rgba(var(--a-rgb),.2);box-shadow:0 18px 40px rgba(var(--ink-rgb),.1);transition:transform .5s var(--ease),box-shadow .5s}
.t7-tl-card:hover{transform:translateY(-4px);box-shadow:0 26px 50px rgba(var(--ink-rgb),.16)}
.t7-tl-img{position:relative;height:150px;overflow:hidden}
.t7-tl-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t7-tl-card:hover .t7-tl-img img{transform:scale(1.07)}
.t7-tl-ic{position:absolute;right:12px;bottom:-16px;z-index:2;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#fff;font-size:18px;box-shadow:0 6px 14px rgba(var(--ink-rgb),.2)}
.t7-tl-b{padding:20px 20px 20px}
.t7-tl-b h3{font:400 24px/1.15 var(--f-disp);letter-spacing:.06em;margin:0}
.t7-tl-b small{display:block;font:400 12.5px "Noto Serif Devanagari",serif;color:var(--a2);margin:3px 0 8px}
.t7-tl-meta{font-size:12.5px;color:rgba(var(--ink-rgb),.75);margin:8px 0}
.t7-tl-meta b{color:var(--a);font-weight:500;margin-right:5px}
.t7-tl-b p{font-size:13px;color:rgba(var(--ink-rgb),.7);margin:0 0 12px}
.t7-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 8px;border-radius:30px;border:1px solid var(--a-mid);font-size:11px;letter-spacing:.04em}
.t7-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(var(--ink-rgb),.25)}
/* moments */
.t7-masonry{column-count:2;column-gap:12px}
.t7-masonry figure{position:relative;margin:0 0 12px;break-inside:avoid;overflow:hidden;border-radius:18px;cursor:zoom-in;box-shadow:0 14px 30px rgba(var(--ink-rgb),.14)}
.t7-masonry figure:nth-child(3n+1){aspect-ratio:4/5}.t7-masonry figure:nth-child(3n+2){aspect-ratio:1/1}.t7-masonry figure:nth-child(3n){aspect-ratio:3/4}
.t7-masonry img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t7-masonry figure:hover img{transform:scale(1.07)}
.t7-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(var(--ink-rgb),.92);cursor:zoom-out;animation:t7-fadein .3s ease}
.t7-lb img{max-width:min(94vw,900px);max-height:88vh;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
/* venue */
.t7-venue-grid{display:grid;gap:22px}
.t7-venue-photo{position:relative;height:clamp(250px,56vw,420px);margin:0;border-radius:200px 200px 24px 24px;overflow:hidden;box-shadow:0 30px 60px rgba(var(--ink-rgb),.22)}
.t7-venue-photo img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--ease)}
.t7-venue-photo:hover img{transform:scale(1.06)}
.t7-vcard{padding:34px 26px;border-radius:24px;text-align:center;background:#fff;border:1px solid rgba(var(--a-rgb),.22);box-shadow:0 22px 50px rgba(var(--ink-rgb),.1)}
.t7-vcard h3{font:400 clamp(26px,6vw,36px)/1.15 var(--f-disp);letter-spacing:.06em;color:var(--a);margin:4px 0 10px}
.t7-vcard p{font-size:14px;color:rgba(var(--ink-rgb),.75);margin:0 0 22px}
.t7-vbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.t7-chips{display:grid;gap:12px;margin-top:18px}
.t7-chip{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:16px 18px;border-radius:18px;background:var(--a-soft);font-size:13px;color:rgba(var(--ink-rgb),.8)}
.t7-chip span{font-size:20px;color:var(--a)}
.t7-chip p{margin:0}
/* dark finale: rsvp + footer */
.t7-dark{background:radial-gradient(ellipse 70% 40% at 50% 0,rgba(var(--a-rgb),.35),transparent 70%),var(--ink);color:var(--paper)}
.t7-dark .t7-head h2{color:var(--a-mid)}
.t7-dark .t7-head p{color:rgba(var(--paper-rgb),.7)}
.t7-dark .t7-eyebrow{color:var(--a-mid)}
.t7-rsvp{position:relative;max-width:540px;margin:0 auto;padding:42px 28px 34px;border-radius:28px;color:var(--ink);background:linear-gradient(180deg,#fffdf9,var(--paper));box-shadow:0 40px 90px rgba(0,0,0,.45)}
.t7-rsvp h2{text-align:center;font:400 clamp(26px,6vw,34px)/1.2 var(--f-disp);letter-spacing:.05em;color:var(--a);margin:0 0 10px}
.t7-rsvp-intro{text-align:center;font-size:13.5px;color:rgba(var(--ink-rgb),.72);margin:0 0 26px}
.t7-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:40px;background:var(--a-soft)}
.t7-seg button{min-height:46px;border:0;border-radius:36px;background:transparent;font:500 10.5px var(--f-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--a-dark);transition:background .35s,color .35s,box-shadow .35s}
.t7-seg button[aria-pressed="true"]{background:var(--a);color:#fff;box-shadow:0 8px 18px rgba(var(--a-rgb),.4)}
.t7-field{position:relative;margin:22px 0}
.t7-field label{display:block;font:500 10px var(--f-sans);letter-spacing:.24em;color:var(--a);margin-bottom:4px}
.t7-field input,.t7-field textarea{width:100%;display:block;background:transparent;border:0;border-bottom:1px solid var(--a-mid);border-radius:0;padding:9px 0 10px;font:inherit;font-size:15px;color:var(--ink);outline:none;-webkit-appearance:none;appearance:none}
.t7-field textarea{resize:none;min-height:60px}
.t7-field input::placeholder,.t7-field textarea::placeholder{color:rgba(var(--ink-rgb),.4)}
.t7-field:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--a);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease);pointer-events:none}
.t7-field:focus-within:after{transform:scaleX(1)}
.t7-stepper{display:flex;align-items:center;justify-content:space-between;gap:12px}
.t7-stepper>div{display:flex;align-items:center;gap:6px}
.t7-stepper button{width:40px;height:40px;border-radius:50%;border:1px solid var(--a);background:transparent;color:var(--a);font-size:20px;line-height:1;transition:background .3s,color .3s}
.t7-stepper button:hover{background:var(--a);color:#fff}
.t7-stepper output{min-width:34px;text-align:center;font:400 24px var(--f-disp);color:var(--ink)}
.t7-send{width:100%;margin-top:10px;min-height:56px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#fff;font:600 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;background:linear-gradient(120deg,var(--a-dark),var(--a));box-shadow:0 14px 30px rgba(var(--a-rgb),.45);transition:transform .35s var(--ease)}
.t7-send:hover{transform:translateY(-3px)}
.t7-send:active{transform:scale(.98)}
.t7-send:after{content:"";position:absolute;top:0;bottom:0;width:34%;left:-50%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);animation:t7-sweep 4s ease-in-out infinite;will-change:transform}
@keyframes t7-sweep{0%,55%{transform:skewX(-22deg) translateX(0)}100%{transform:skewX(-22deg) translateX(600%)}}
.t7-status{min-height:20px;margin:14px 0 0;font-size:12px;text-align:center;color:var(--a)}
.t7-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.t7-contact{display:inline-block;padding:9px 16px;border-radius:30px;border:1px solid var(--a-mid);text-decoration:none;font-size:12px;color:var(--a-dark)}
.t7-end{text-align:center;padding:70px 22px 80px}
.t7-mono{width:112px;height:112px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(var(--paper-rgb),.4);box-shadow:0 0 0 8px rgba(var(--paper-rgb),.06);font:400 38px var(--f-script);color:var(--a-mid)}
.t7-end h3{font:400 clamp(30px,7vw,44px)/1.15 var(--f-script);color:var(--paper);margin:0 0 8px}
.t7-end p{font:500 10px var(--f-sans);letter-spacing:.3em;color:rgba(var(--paper-rgb),.65);margin:8px 0 0;text-transform:uppercase}
.t7-end .t7-tag{font:italic 400 17px var(--f-serif);letter-spacing:.02em;text-transform:none;color:var(--a-mid)}
.t7-music{display:none;position:fixed;z-index:50;right:16px;bottom:16px;width:46px;height:46px;border-radius:50%;border:1px solid var(--a);background:rgba(var(--paper-rgb),.92);color:var(--a);font-size:17px;box-shadow:0 8px 22px rgba(var(--ink-rgb),.25)}
.t7-js .t7-music.t7-has{display:block}
.t7-music[aria-pressed="true"]{background:var(--a);color:#fff}
@media(min-width:820px){
  .t7 section{padding:124px 0}
  .t7-chap{grid-template-columns:1fr 1fr;gap:64px;text-align:left;justify-items:stretch}
  .t7-chap .t7-chap-img{justify-self:center}
  .t7-chap .t7-chap-txt{max-width:400px}
  .t7-chap:nth-child(even) .t7-chap-img{order:2}
  .t7-chap:nth-child(even) .t7-chap-txt{justify-self:end}
  .t7-chap p{margin:0}
  .t7-tl:before{left:50%}
  .t7-day{display:table;margin:50px auto 30px;padding:6px 22px;background:var(--paper);position:relative;z-index:1}
  .t7-tl-item{padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:76px;align-items:start}
  .t7-tl-dot{left:50%;transform:translateX(-50%);top:6px}
  .t7-tl-item.t7-l{grid-template-areas:"card time"}
  .t7-tl-item.t7-r{grid-template-areas:"time card"}
  .t7-tl-card{grid-area:card}
  .t7-tl-time{grid-area:time;margin:2px 0 0;font-size:26px}
  .t7-tl-item.t7-r .t7-tl-time{text-align:right}
  .t7-masonry{column-count:3;column-gap:16px}
  .t7-masonry figure{margin-bottom:16px}
  .t7-venue-grid{grid-template-columns:1.05fr 1fr;align-items:center;gap:40px}
  .t7-rsvp{padding:52px 48px 42px}
}
@media(max-width:360px){.t7-wrap{padding:0 16px}.t7-cd div{min-width:54px}.t7-cd{gap:6px}}
@media(prefers-reduced-motion:reduce){.t7 *,.t7 *:before,.t7 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t7-js .t7-reveal{opacity:1!important;transform:none!important}}
@media print{.t7-progress,.t7-entry,.t7-music,.t7-cue,.t7-petals{display:none!important}.t7-js .t7-reveal{opacity:1!important;transform:none!important}.t7-js img.t7-fi{opacity:1!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const g = guest || {};
  const evs = Array.isArray(events) ? events : [];
  const offset = clean(w.timezone_offset) || '+05:30';

  const rawBride = clean(w.bride_name) || 'Bride';
  const rawGroom = clean(w.groom_name) || 'Groom';
  const brideFirst = clean(w.name_order) === 'bride_first';
  const [rawFirst, rawSecond] = brideFirst ? [rawBride, rawGroom] : [rawGroom, rawBride];
  const first = esc(rawFirst), second = esc(rawSecond);
  const initials = `${rawFirst.charAt(0)} &amp; ${rawSecond.charAt(0)}`.toUpperCase();
  const monoInit = `${esc(rawFirst.charAt(0).toUpperCase())}&amp;${esc(rawSecond.charAt(0).toUpperCase())}`;
  const guestName = esc(clean(guest?.name) || 'Respected Guest');
  const guestLine = guest?.with_family ? `${guestName} &amp; Family` : guestName;
  const invocation = esc(clean(w.invocation) || 'Shree Ganeshaya Namah');
  const venue = esc(clean(w.venue) || 'Wedding Venue');
  const address = esc(clean(w.address));
  const city = esc(clean(w.city));
  const where = [venue, city].filter(Boolean).join(', ');
  const families = clean(w.families);
  const signature = esc(clean(w.footer_text) || families || `The ${clean(w.bride_name).split(/\s+/).pop() || 'Bride'} & ${clean(w.groom_name).split(/\s+/).pop() || 'Groom'} Families`);
  const poem = esc(clean(w.poem) || 'Two hearts, one beautiful story, one promise, a lifetime of love. May every tomorrow shine brighter together.');
  const inviteText = esc(clean(w.invite_text) || 'Request the pleasure of your company as they begin their beautiful journey together.');
  const hashtag = esc(clean(w.hashtag));

  const day = dparts(w.date);
  const dateLong = day ? longDate(day) : 'Date to be announced';
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

  const heroImg = safeImg(w.hero_image);
  const heroList = [heroImg, U('1519741497674-611481863552', 1200), U('1465495976277-4387d4b0b4c6', 1200), U('1522413452208-996ff3f3e740', 1200)].filter(Boolean);
  const venueImg = safeImg(w.venue_image) || U('1477587458883-47145ed94245', 1200);
  const story = readStory(w.story);
  const gallery = readGallery(w.gallery);

  /* events grouped by day, sorted */
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
  let n = 0;
  const eventsHtml = groups.map((g, gi) => {
    const label = `Day ${ORD[gi] || gi + 1}${g.p ? ` · ${weekday(g.p)}, ${shortDate(g.p)}` : ''}`;
    const items = g.items.map(e => {
      const name = clean(e.event_name) || 'Celebration';
      const k = kindOf(name);
      const side = n++ % 2 === 0 ? 't7-l' : 't7-r';
      const img = safeImg(e.image_url) || U(k.img);
      const loc = clean(e.venue || e.address) || clean(w.venue);
      const t = fmtTime(e.event_time);
      const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
      return `<article class="t7-tl-item ${side} t7-reveal">
        <span class="t7-tl-dot" aria-hidden="true"></span>
        <div class="t7-tl-time">${t ? esc(t) : '✦'}</div>
        <div class="t7-tl-card">
          <div class="t7-tl-img t7-ph"><img class="t7-fi" src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t7-tl-ic" aria-hidden="true">${k.icon}</span></div>
          <div class="t7-tl-b"><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}
            ${loc ? `<div class="t7-tl-meta"><b>⌖</b>${esc(loc)}</div>` : ''}
            ${clean(e.description) ? `<p>${esc(e.description)}</p>` : ''}
            ${clean(e.dress_code) ? `<div class="t7-dress"><span class="t7-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
          </div></div></article>`;
    }).join('');
    return `<span class="t7-day t7-reveal">${esc(label)}</span>${items}`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t7-fonts>
<style>${STYLE}</style>
<noscript><style>.t7-entry{display:none!important}.t7.t7-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t7-reveal{opacity:1!important;transform:none!important}.t7 img.t7-fi{opacity:1!important}.t7-hero-img{opacity:1}</style></noscript>
<div class="t7 t7-js t7-locked" style="${themeVars(w)}" data-when="${esc(String(whenTs ?? parseWhen(w.date, '', offset) ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-hero-imgs="${esc(JSON.stringify(heroList))}" data-names="${esc(`${rawGroom} & ${rawBride}`)}" data-venue="${esc(clean(w.venue))}">
  <div class="t7-progress" aria-hidden="true"></div>

  <div class="t7-entry" role="dialog" aria-label="Wedding invitation envelope">
    <div class="t7-entry-in">
      <div class="t7-kicker">YOU ARE INVITED</div>
      <div class="t7-env">
        <div class="t7-env-back"></div>
        <div class="t7-letter"><small>THE WEDDING OF</small><b>${first} &amp; ${second}</b><em>${esc(day ? longDate(day) : city)}</em></div>
        <div class="t7-pocket" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="t7-flap" aria-hidden="true"></div>
        <button class="t7-seal" type="button" data-open aria-label="Open wedding invitation"><b>${esc(rawFirst.charAt(0).toUpperCase())}${esc(rawSecond.charAt(0).toUpperCase())}</b></button>
      </div>
      <div class="t7-guest-line">Dear ${guestLine}</div>
      <div class="t7-entry-note">Tap the seal to open</div>
    </div>
  </div>

  <main>
    <header class="t7-hero" data-hero>
      <div class="t7-branch t7-b1" aria-hidden="true">${BRANCH}</div>
      <div class="t7-branch t7-b2" aria-hidden="true">${BRANCH}</div>
      <div class="t7-petals" aria-hidden="true"></div>
      <div class="t7-hero-in">
        <div class="t7-invoc" style="--i:0">${invocation}</div>
        <div class="t7-eyebrow" style="--i:1">Together with their families</div>
        <div class="t7-arch" style="--i:2"><div class="t7-arch-img t7-ph"><i class="t7-hero-img"></i></div></div>
        <h1 class="t7-names" style="--i:3">${first} <span>&amp;</span> ${second}</h1>
        <p class="t7-hero-copy" style="--i:4">${inviteText}</p>
        <div class="t7-datebar" style="--i:5" aria-label="Wedding date">
          <div>${esc(dayName || 'Save the date')}</div>
          <strong>${day ? pad(day.d) : '--'}</strong>
          <div>${day ? esc(MONTHS[day.mo - 1].slice(0, 3)) + ' ' + day.y : 'TBA'}</div>
        </div>
        <p class="t7-where" style="--i:6">${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</p>
        <div class="t7-cd" style="--i:6" role="timer"><div><b data-u="d">--</b><small>DAYS</small></div><div><b data-u="h">--</b><small>HRS</small></div><div><b data-u="m">--</b><small>MIN</small></div><div><b data-u="s">--</b><small>SEC</small></div></div>
        <div class="t7-pill" style="--i:7">Invited: ${guestLine}</div><br>
        <div class="t7-cta" style="--i:8"><a href="#" data-goto="story" class="t7-btn">Discover our story <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="t7-cue" aria-hidden="true">Scroll<i></i></div>
    </header>

    <section data-sec="story">
      <div class="t7-wrap">
        <div class="t7-quote t7-reveal"><p>${poem}</p>${families ? `<small>${esc(families)}</small>` : ''}<div class="t7-orn"><span>✦</span></div></div>
      </div>
      <div class="t7-wrap" style="margin-top:84px">
        ${story.map((s, i) => `<article class="t7-chap t7-reveal">
          <div class="t7-chap-img t7-ph"><img class="t7-fi" src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div>
          <div class="t7-chap-txt"><span class="t7-num" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}
      </div>
    </section>

    ${day ? `<section style="padding-top:20px">
      <div class="t7-wrap">
        <div class="t7-head t7-reveal"><div class="t7-eyebrow">Mark your calendar</div><h2>Save the Date</h2><div class="t7-orn"><span>✦</span></div></div>
        <div class="t7-calcard t7-reveal">
          <h3>${esc(MONTHS[day.mo - 1])}</h3><small>${day.y}</small>
          ${calendarHtml(day, evs.map(e => e.event_date))}
          <p style="margin:22px 0 0;font:italic 400 15px var(--f-serif)">${esc(dayName)}${timeText ? `, ${esc(timeText)}` : ''}</p>
          ${calUrl ? `<a class="t7-btn" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Add to calendar</a>` : ''}
        </div>
      </div>
    </section>` : ''}

    ${groups.length ? `<section>
      <div class="t7-wrap">
        <div class="t7-head t7-reveal"><div class="t7-eyebrow">The festivities</div><h2>Celebrations</h2>
          <p>Traditions, laughter, music and memories. We would be delighted to have you with us.</p><div class="t7-orn"><span>✦</span></div></div>
        <div class="t7-tl">${eventsHtml}</div>
      </div>
    </section>` : ''}

    ${gallery.length ? `<section style="padding-top:20px">
      <div class="t7-wrap">
        <div class="t7-head t7-reveal"><div class="t7-eyebrow">Glimpses of us</div><h2>Moments</h2><div class="t7-orn"><span>✦</span></div></div>
        <div class="t7-masonry">${gallery.map((g, i) => `<figure class="t7-ph t7-reveal" data-lb="${esc(g)}"><img class="t7-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></figure>`).join('')}</div>
      </div>
    </section>` : ''}

    <section>
      <div class="t7-wrap">
        <div class="t7-head t7-reveal"><div class="t7-eyebrow">Join us</div><h2>The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <div class="t7-venue-grid">
          <figure class="t7-venue-photo t7-ph t7-reveal"><img class="t7-fi" src="${esc(venueImg)}" data-fallback="${esc(U('1519741497674-611481863552', 1200))}" alt="${venue}" loading="lazy" decoding="async"></figure>
          <div class="t7-reveal">
            <div class="t7-vcard">
              <div class="t7-eyebrow">The wedding destination</div>
              <h3>${venue}</h3>
              <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
              <div class="t7-vbtns">
                ${mapUrl ? `<a class="t7-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">⌖ &nbsp;Directions</a>` : ''}
                ${calUrl ? `<a class="t7-btn t7-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Calendar</a>` : ''}
              </div>
            </div>
            ${travel.length ? `<div class="t7-chips">${travel.map(([i, t]) => `<div class="t7-chip"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="t7-dark">
      <section style="padding-bottom:40px">
        <div class="t7-wrap">
          <div class="t7-head t7-reveal"><div class="t7-eyebrow">Your presence is our present</div><h2>Kindly RSVP</h2></div>
          <form class="t7-rsvp t7-reveal" data-rsvp novalidate>
            <h2>Will you grace us<br>with your presence?</h2>
            <p class="t7-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
            ${canRsvp ? `
            <div class="t7-seg" role="group" aria-label="Attendance"><button type="button" data-att="Joyfully accepts" aria-pressed="false">Joyfully accepts</button><button type="button" data-att="Regretfully declines" aria-pressed="false">Regretfully declines</button></div>
            <div class="t7-field"><label for="t7-name">YOUR NAME</label><input id="t7-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
            <div class="t7-field t7-stepper" data-guests><label style="margin:0">NUMBER OF GUESTS</label><div><button type="button" data-step="-1" aria-label="Fewer guests">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1}</output><button type="button" data-step="1" aria-label="More guests">+</button></div></div>
            <div class="t7-field"><label for="t7-note">A NOTE FOR THE COUPLE (OPTIONAL)</label><textarea id="t7-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
            <button class="t7-send" type="submit">Send reply via WhatsApp &nbsp;↗</button>
            <p class="t7-status" role="status" aria-live="polite"></p>` : ''}
            ${contacts.length ? `<div class="t7-contacts">${contacts.map(c => `<a class="t7-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
          </form>
        </div>
      </section>
      <footer class="t7-end">
        <div class="t7-mono t7-reveal" aria-hidden="true">${monoInit}</div>
        <h3 class="t7-reveal">With love &amp; gratitude</h3>
        ${hashtag ? `<p class="t7-tag">${hashtag.startsWith('#') ? hashtag : '#' + hashtag}</p>` : ''}
        <p>${signature}</p>
        <p style="margin-top:14px">${esc(dateNums)}${city ? ` &nbsp;|&nbsp; ${city}` : ''}</p>
      </footer>
    </div>
  </main>

  <button class="t7-music" type="button" aria-label="Toggle music" aria-pressed="false">♫</button>
</div>`;
}

/* ---------- mount ---------- */
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
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  let dead = false;

  /* scroll lock so nothing behind the envelope can move */
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
    html.style.overflow = 'auto';
    body.style.overflow = 'visible';
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
  };
  host.classList.add('t7-js');
  host.classList.remove('t7-boot');
  lock();

  /* smooth boot: reveal entry immediately and ensure boot class is removed */
  (() => {
    const f = doc.fonts;
    if (f && typeof f.load === 'function') {
      Promise.all([f.load('40px "Pinyon Script"'), f.load('20px Italiana'), f.load('300 15px Jost')]).catch(() => {});
    }
    win.requestAnimationFrame(() => host.classList.remove('t7-boot'));
  })();

  /* hero image: one candidate at a time, fade in once decoded */
  const heroImgEl = $('.t7-hero-img');
  let heroList = [];
  try { heroList = JSON.parse(host.dataset.heroImgs || '[]'); } catch { heroList = []; }
  const tryHero = i => {
    if (dead || !heroImgEl || i >= heroList.length) return;
    const im = new Image();
    im.onload = () => {
      if (dead) return;
      const show = () => { heroImgEl.style.backgroundImage = `url("${heroList[i]}")`; win.requestAnimationFrame(() => heroImgEl.classList.add('t7-on')); };
      (typeof im.decode === 'function' ? im.decode().catch(() => {}) : Promise.resolve()).then(show);
    };
    im.onerror = () => tryHero(i + 1);
    im.src = heroList[i];
  };
  tryHero(0);

  /* images: fade in on load, one fallback, then hide */
  $$('img').forEach(img => {
    const ok = () => img.classList.add('t7-loaded');
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t7-failed');
    };
    on(img, 'load', ok); on(img, 'error', fail);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
  });
  later(() => $$('img.t7-fi').forEach(i => i.classList.add('t7-loaded')), 5000);

  /* falling petals */
  const petals = $('.t7-petals');
  if (petals && !reduce) {
    for (let i = 0; i < 14; i++) {
      const p = doc.createElement('span'); p.className = 't7-petal';
      p.style.cssText = `--l:${rand(0, 100)}%;--s:${rand(7, 13)}px;--d:${rand(11, 20)}s;--dl:${-rand(0, 18)}s;--x:${rand(-60, 80)}px`;
      petals.appendChild(p);
    }
  }

  /* envelope open sequence */
  const entry = $('.t7-entry'), seal = $('[data-open]'), note = $('.t7-entry-note'), hero = $('[data-hero]');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (seal) seal.classList.add('t7-burst');
    if (entry) entry.classList.add('t7-open');
    later(() => {
      if (entry) entry.classList.add('t7-leaving');
      host.classList.remove('t7-locked');
      unlock();
    }, 1500);
    later(() => { if (hero) hero.classList.add('t7-intro'); }, 1400);
    later(() => {
      if (entry) entry.remove();
      host.classList.remove('t7-locked');
      unlock(); onScroll();
    }, 2200);
  };
  on(seal, 'click', open);
  on(note, 'click', open);
  if (entry) on(entry, 'click', (e) => { if (!e.target.closest('button')) open(); });

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* progress + hero parallax (CSS start state equals JS scale: no jump) */
  const bar = $('.t7-progress');
  let tick = false;
  function onScroll() {
    if (tick || locked) return; tick = true;
    win.requestAnimationFrame(() => {
      tick = false;
      const scY = win.scrollY ?? html.scrollTop ?? 0;
      const vh = win.innerHeight || html.clientHeight || 800;
      const max = (html.scrollHeight || body.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scY / max) : 0})`;
      if (hero && heroImgEl && !reduce) {
        const top = hero.getBoundingClientRect().top;
        if (top < 0 && -top < vh * 1.3) heroImgEl.style.transform = `translate3d(0,${-top * .12}px,0) scale(1.08)`;
        else if (top >= 0) heroImgEl.style.transform = '';
      }
    });
  }
  on(win, 'scroll', onScroll, { passive: true });

  /* reveals (stagger delay cleared afterwards) */
  const clearDelay = el => later(() => { el.style.transitionDelay = ''; }, 1400);
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t7-in'); clearDelay(e.target); io.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.t7-reveal').forEach(el => io.observe(el));
    undo.push(() => io.disconnect());
  } else $$('.t7-reveal').forEach(el => el.classList.add('t7-in'));

  /* countdown with tick animation */
  const when = Number(host.dataset.when);
  const cdBox = $('.t7-cd');
  if (when && cdBox) {
    const set = (k, v) => {
      const el = $(`[data-u="${k}"]`, cdBox); if (!el) return;
      const t = pad(v);
      if (el.textContent !== t) { el.textContent = t; if (!reduce) { el.classList.remove('t7-tick'); void el.offsetWidth; el.classList.add('t7-tick'); } }
    };
    let id;
    const step = () => {
      const left = when - Date.now();
      if (left <= 0) { cdBox.innerHTML = '<span class="t7-cd-done">The celebration has begun ✦</span>'; clearInterval(id); return; }
      const s = Math.floor(left / 1000);
      set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
    };
    cdBox.classList.add('t7-live'); step();
    id = setInterval(step, 1000); timers.push(id);
  }

  /* lightbox */
  const closeLb = () => { $('.t7-lb')?.remove(); };
  $$('[data-lb]').forEach(f => on(f, 'click', () => {
    const src = f.dataset.lb; if (!src) return;
    closeLb();
    const lb = doc.createElement('div'); lb.className = 't7-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    const im = doc.createElement('img'); im.src = src; im.alt = 'Moment';
    lb.appendChild(im); lb.addEventListener('click', closeLb); host.appendChild(lb);
  }));
  on(doc, 'keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* RSVP: segmented choice + stepper + WhatsApp */
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
      count = Math.max(1, Math.min(12, count + Number(b.dataset.step)));
      if (out) out.textContent = String(count);
    }));
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const nt = $('[name="note"]', form).value.trim();
      const status = $('.t7-status', form);
      if (!name || !att) { status.textContent = 'Please add your name and choose whether you can join.'; return; }
      const names = host.dataset.names || '';
      const dateTxt = $('.t7-datebar', host)?.textContent.replace(/\s+/g, ' ').trim() || '';
      const msg = [`Wedding RSVP — ${names}`, `Name: ${name}`, `Response: ${att}`, att !== 'Regretfully declines' && `Guests: ${count}`, nt && `Note: ${nt}`, dateTxt && `Wedding date: ${dateTxt}`, host.dataset.venue && `Venue: ${host.dataset.venue}`].filter(Boolean).join('\n');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      status.textContent = 'Thank you! Your WhatsApp reply is opening in a new tab.';
    });
  }

  /* optional music */
  const musicBtn = $('.t7-music'), musicUrl = host.dataset.music;
  if (musicBtn && musicUrl) {
    const audio = new Audio(musicUrl); audio.loop = true; audio.preload = 'none';
    musicBtn.classList.add('t7-has');
    on(musicBtn, 'click', () => {
      const play = audio.paused;
      (play ? audio.play() : Promise.resolve(audio.pause())).catch(() => {});
      musicBtn.setAttribute('aria-pressed', String(play)); musicBtn.textContent = play ? '♪' : '♫';
    });
    undo.push(() => audio.pause());
  }

  const cleanup = () => {
    dead = true;
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    closeLb();
    unlock();
    host.classList.remove('t7-js', 't7-locked');
    delete host._t7Cleanup;
  };
  host._t7Cleanup = cleanup;
  return cleanup;
}