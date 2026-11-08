/* ==========================================================================
   Royal Gold & Silver — "Celestial Gate" Wedding Invitation (template 8)
   Midnight stage, liquid gold + silver foil, 3D palace gates, armillary seal,
   orbiting rings, tilt-reactive arch, 3D event carousel, sparkle dust canvas.

   Contract (same as template 7):
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a complete, readable static invitation (no JS needed).

   wedding fields (all optional): bride_name, groom_name, name_order, date, time,
     timezone_offset, venue, address, city, map_url, invocation, invite_text,
     families | footer_text, poem, hashtag, hero_image, venue_image, rsvp_number,
     rsvp_contacts, story[{title,text,image}], travel_info, stay_info, music_url,
     theme: 'royal'(default)|'emerald'|'maroon'|'noir',
     accent_color (gold), accent2_color (silver), paper_color (stage bg),
     gallery: [https urls]
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
const ORD = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600&family=Pinyon+Script&display=swap';

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

/* ---------- theme: midnight stage + gold + silver ---------- */
const PRESETS = {
  maroon: { bg: '#1b0709', g: '#d9b24c', s: '#d8d0d4' },
  royal: { bg: '#1b0709', g: '#d9b24c', s: '#d8d0d4' },
  emerald: { bg: '#06150f', g: '#d4af37', s: '#cfd8d2' },
  navy: { bg: '#050c20', g: '#dfb85f', s: '#cbcfd8' },
  rose: { bg: '#180518', g: '#e4b67a', s: '#e4c8d3' },
  noir: { bg: '#09090b', g: '#d4af37', s: '#d0d0d4' }
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
  const p = PRESETS[clean(w.theme || w.theme_name).toLowerCase()] || PRESETS.maroon || PRESETS.royal;
  const g = hex6(w.accent_color) || p.g, s = hex6(w.accent2_color) || p.s;
  const paperCand = hex6(w.paper_color);
  // Protect Template 08: Must maintain a midnight stage background (lum < 65)
  const bg = (paperCand && lumOf(paperCand) < 65) ? paperCand : p.bg;
  const rgb = h => rgbOf(h).join(',');
  return `--bg:${bg};--bg2:${mix(bg, '#ffffff', .07)};--card:${mix(bg, '#ffffff', .05)};--g:${g};--gl:${mix(g, '#ffffff', .5)};--gx:${mix(g, '#ffffff', .85)};--gd:${scale(g, .5)};--s:${s};--sl:${mix(s, '#ffffff', .6)};--sd:${scale(s, .5)};--g-rgb:${rgb(g)};--s-rgb:${rgb(s)};--bg-rgb:${rgb(bg)};--ivory:#f6efe0`;
}

/* ---------- imagery ---------- */
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

function calendarHtml(day, evDates) {
  const first = new Date(Date.UTC(day.y, day.mo - 1, 1)).getUTCDay();
  const dim = new Date(Date.UTC(day.y, day.mo, 0)).getUTCDate();
  const dots = new Set(evDates.map(dparts).filter(p => p && p.y === day.y && p.mo === day.mo).map(p => p.d));
  const head = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(c => `<span class="t8-cal-h">${c}</span>`).join('');
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    cells += d === day.d
      ? `<span class="t8-cal-d t8-cal-on" aria-label="Wedding day"><b>${d}</b></span>`
      : `<span class="t8-cal-d${dots.has(d) ? ' t8-cal-dot' : ''}">${d}</span>`;
  }
  return `<div class="t8-cal-grid" role="img" aria-label="${esc(MONTHS[day.mo - 1])} ${day.y} calendar">${head}${cells}</div>`;
}

/* ---------- SVG art: mandala + shared metallic gradients ---------- */
const mandala = (() => {
  let p = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5;
    p += `<path transform="rotate(${a})" d="M0-40C11-52 11-64 0-70C-11-64-11-52 0-40Z"/><path transform="rotate(${a + 11.25})" d="M0-72C15-82 15-90 0-95C-15-90-15-82 0-72Z"/>`;
  }
  for (let i = 0; i < 8; i++) p += `<path transform="rotate(${i * 45})" d="M0-14L0-40"/>`;
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false"><g fill="none" stroke="url(#t8-gold)" stroke-width=".55" stroke-linejoin="round"><circle r="98"/><circle r="97" stroke-dasharray="1 3"/><circle r="72" stroke="url(#t8-silver)"/><circle r="40"/><circle r="14" stroke="url(#t8-silver)"/>${p}</g></svg>`;
})();
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="t8-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--gd)"/><stop offset=".3" style="stop-color:var(--gl)"/><stop offset=".55" style="stop-color:var(--g)"/><stop offset=".8" style="stop-color:var(--gx)"/><stop offset="1" style="stop-color:var(--gd)"/></linearGradient>
<linearGradient id="t8-silver" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--sd)"/><stop offset=".4" style="stop-color:var(--sl)"/><stop offset=".7" style="stop-color:var(--s)"/><stop offset="1" style="stop-color:var(--sd)"/></linearGradient></defs></svg>`;

/* ---------- styles ---------- */
const STYLE = `
.t8,.t8 *,.t8 *:before,.t8 *:after{box-sizing:border-box}
.t8{--gold:linear-gradient(110deg,var(--gd) 0%,var(--gl) 20%,var(--g) 38%,var(--gx) 50%,var(--g) 62%,var(--gl) 80%,var(--gd) 100%);
  --silver:linear-gradient(110deg,var(--sd) 0%,var(--sl) 25%,var(--s) 42%,#fff 50%,var(--s) 60%,var(--sl) 80%,var(--sd) 100%);
  --f-cinzel:Cinzel,"Cormorant Garamond",serif;--f-serif:"Cormorant Garamond",Georgia,serif;--f-script:"Pinyon Script",cursive;--f-sans:Jost,system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;overflow-anchor:none;color:var(--ivory);font:300 15px/1.75 var(--f-sans);-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 80% 40% at 50% 0,rgba(var(--g-rgb),.16),transparent 70%),radial-gradient(ellipse 60% 30% at 0 55%,rgba(var(--s-rgb),.08),transparent 70%),radial-gradient(ellipse 60% 30% at 100% 85%,rgba(var(--g-rgb),.1),transparent 70%),var(--bg)}
.t8.t8-locked{height:100vh!important;height:100svh!important;max-height:100svh!important;overflow:hidden!important}
.t8 h1,.t8 h2,.t8 h3,.t8 p,.t8 figure{margin-top:0}
.t8 img{display:block;max-width:100%}
.t8 button{font:inherit;color:inherit;cursor:pointer}
.t8 a{color:inherit}
.t8 :focus-visible{outline:2px solid var(--gl);outline-offset:3px}
.t8-goldtx,.t8-head h2,.t8-names,.t8-quote p,.t8-ev-time,.t8-datebar strong,.t8-end h3{background:var(--gold);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t8-shine 7s linear infinite}
.t8-silvertx{background:var(--silver);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t8-shine 9s linear infinite reverse}
@keyframes t8-shine{from{background-position:200% 0}to{background-position:-50% 0}}
.t8-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:var(--gold)}
.t8-fx{position:fixed;inset:0;width:100%;height:100%;z-index:950;pointer-events:none}
.t8-wrap{position:relative;width:100%;max-width:1080px;margin:0 auto;padding:0 22px}
.t8 section{position:relative;padding:92px 0}
.t8-eyebrow{font:500 10.5px var(--f-sans);letter-spacing:.38em;text-transform:uppercase;color:var(--sl);margin-bottom:12px}
.t8-head{text-align:center;margin-bottom:46px}
.t8-head h2{font:500 clamp(28px,6.4vw,48px)/1.15 var(--f-cinzel);letter-spacing:.14em;margin:0 0 12px;text-transform:uppercase}
.t8-head p{max-width:440px;margin:0 auto;color:rgba(246,239,224,.66);font-size:14px}
.t8-orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--g);margin:18px auto 0;font-size:11px}
.t8-orn:before,.t8-orn:after{content:"";height:1px;width:64px;background:linear-gradient(90deg,transparent,var(--g))}
.t8-orn:after{transform:scaleX(-1)}
.t8-ph{background:linear-gradient(135deg,var(--card),var(--bg2))}
.t8 img.t8-fi{opacity:0;transition:opacity .9s ease}
.t8 img.t8-fi.t8-loaded{opacity:1}
.t8 img.t8-failed{opacity:0!important}
.t8-reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t8-reveal.t8-in{opacity:1;transform:none}
.t8-foil{border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box,var(--gold) border-box;background-size:100% 100%,250% 100%}
.t8-shine{position:relative}
.t8-shine:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.2),transparent 55%);mix-blend-mode:overlay}
[data-tilt]{transition:transform .25s ease;will-change:transform}
.t8-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 28px;border-radius:40px;border:0;text-decoration:none;font:600 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;position:relative;overflow:hidden;color:#1a1304;background:var(--gold);background-size:250% 100%;box-shadow:0 10px 28px rgba(var(--g-rgb),.35),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .35s var(--ease),box-shadow .35s;animation:t8-shine 6s linear infinite}
.t8-btn:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(var(--g-rgb),.5),inset 0 1px 0 rgba(255,255,255,.5)}
.t8-btn.t8-ghost{background:transparent;color:var(--gl);box-shadow:inset 0 0 0 1px var(--g);animation:none}
.t8-btn.t8-ghost:hover{background:rgba(var(--g-rgb),.14)}
/* gate */
.t8-gate{position:fixed;inset:0;z-index:900;overflow:hidden;perspective:1600px;background:radial-gradient(circle at 50% 50%,#fff3c4 0,var(--g) 22%,var(--gd) 50%,var(--bg) 82%);transition:opacity .9s ease .1s}
.t8-gate.t8-leaving{opacity:0;pointer-events:none}
.t8-door{position:absolute;top:0;bottom:0;width:50.4%;z-index:1;overflow:hidden;background:repeating-linear-gradient(90deg,rgba(var(--g-rgb),.06) 0 1px,transparent 1px 22px),linear-gradient(180deg,var(--bg2),var(--bg));transition:transform 1.9s cubic-bezier(.65,0,.25,1);backface-visibility:hidden}
.t8-door:before{content:"";position:absolute;inset:14px;border:1px solid rgba(var(--g-rgb),.75);pointer-events:none;z-index:2}
.t8-door:after{content:"";position:absolute;inset:22px;border:1px dashed rgba(var(--s-rgb),.35);pointer-events:none;z-index:2}
.t8-door-l{left:0;transform-origin:0 50%;box-shadow:inset -40px 0 60px rgba(0,0,0,.5)}
.t8-door-r{right:0;transform-origin:100% 50%;box-shadow:inset 40px 0 60px rgba(0,0,0,.5)}
.t8-door svg{position:absolute;top:50%;width:200%;height:auto;transform:translateY(-50%);opacity:.95}
.t8-door-l svg{left:0}.t8-door-r svg{left:-100%}
.t8-open .t8-door-l{transform:rotateY(-104deg)}
.t8-open .t8-door-r{transform:rotateY(104deg)}
.t8-gate-ui{position:relative;z-index:3;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vh,20px);text-align:center;padding:20px;transition:opacity .6s ease,transform .9s var(--ease)}
.t8-boot .t8-gate-ui{opacity:1;transform:none}
.t8-open .t8-gate-ui{opacity:0;pointer-events:none}
.t8-kicker{font:500 10px var(--f-sans);letter-spacing:.44em;color:var(--sl)}
.t8-gate-names{font:400 clamp(40px,11vw,72px)/1 var(--f-script);margin:0;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}
.t8-gate-date{font:500 11px var(--f-cinzel);letter-spacing:.3em;color:var(--gl)}
.t8-medal{position:relative;width:clamp(118px,30vw,160px);aspect-ratio:1;margin:clamp(6px,2vh,18px) 0;perspective:700px;transform-style:preserve-3d}
.t8-ring{position:absolute;inset:0;border-radius:50%;border:2px solid var(--gl);box-shadow:0 0 14px rgba(var(--g-rgb),.65),inset 0 0 14px rgba(var(--g-rgb),.4);animation:t8-r1 9s linear infinite;pointer-events:none}
.t8-ring:nth-child(2){inset:9%;border-color:var(--sl);box-shadow:0 0 12px rgba(var(--s-rgb),.5);animation:t8-r2 11s linear infinite}
.t8-ring:nth-child(3){inset:-9%;border-color:var(--g);animation:t8-r3 14s linear infinite}
@keyframes t8-r1{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}
@keyframes t8-r2{from{transform:rotateX(0) rotateZ(35deg)}to{transform:rotateX(360deg) rotateZ(35deg)}}
@keyframes t8-r3{from{transform:rotateZ(-50deg) rotateY(0)}to{transform:rotateZ(-50deg) rotateY(360deg)}}
.t8-seal{position:absolute;inset:27%;border:0;border-radius:50%;display:grid;place-content:center;color:#1a1304;background:radial-gradient(circle at 32% 26%,var(--gx),var(--g) 45%,var(--gd) 95%);box-shadow:inset 0 2px 3px rgba(255,255,255,.6),inset 0 -6px 10px rgba(0,0,0,.35),0 0 30px rgba(var(--g-rgb),.8);animation:t8-pulse 2.6s ease-in-out infinite}
.t8-seal b{font:600 clamp(15px,4vw,22px)/1 var(--f-cinzel);letter-spacing:.04em}
.t8-seal.t8-burst{animation:t8-burst .6s ease-in forwards}
@keyframes t8-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes t8-burst{40%{transform:scale(1.4)}100%{transform:scale(0);opacity:0}}
.t8-guest-line{font:italic 500 clamp(17px,2.6vh,21px) var(--f-serif);color:var(--ivory)}
.t8-entry-note{font:500 10px var(--f-sans);letter-spacing:.32em;text-transform:uppercase;color:var(--sl);cursor:pointer;animation:t8-blink 2.4s ease-in-out infinite}
@keyframes t8-blink{50%{opacity:.35}}
/* hero */
.t8-hero{position:relative;min-height:100vh;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:clamp(56px,8vh,90px) 20px clamp(70px,10vh,100px);text-align:center;isolation:isolate}
.t8-halo{position:absolute;left:50%;top:38%;width:min(150vw,980px);aspect-ratio:1;margin:calc(min(150vw,980px)/-2) 0 0 calc(min(150vw,980px)/-2);z-index:0;pointer-events:none;opacity:.4;animation:t8-spin 120s linear infinite}
.t8-halo.t8-h2{width:min(104vw,700px);margin:calc(min(104vw,700px)/-2) 0 0 calc(min(104vw,700px)/-2);opacity:.55;animation-direction:reverse;animation-duration:80s}
.t8-halo svg{width:100%;height:100%;display:block}
@keyframes t8-spin{to{transform:rotate(360deg)}}
.t8-hero-in{position:relative;z-index:2;max-width:640px;width:100%}
.t8-invoc{font:500 12px var(--f-cinzel);letter-spacing:.3em;color:var(--gl);margin-bottom:4px}
.t8-arch{--aw:min(68vw,290px);position:relative;width:var(--aw);margin:clamp(16px,3vh,30px) auto 10px;perspective:1000px}
.t8-orbit{position:absolute;left:-26%;width:152%;aspect-ratio:1;top:50%;margin-top:-76%;border-radius:50%;border:1px solid rgba(var(--g-rgb),.6);transform:rotateX(72deg);animation:t8-orbit 14s linear infinite;pointer-events:none;z-index:0}
.t8-orbit:before{content:"";position:absolute;top:-4px;left:50%;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--gx);box-shadow:0 0 16px 5px rgba(var(--g-rgb),.85)}
.t8-orbit.t8-o2{left:-12%;width:124%;margin-top:-62%;border-color:rgba(var(--s-rgb),.55);animation-duration:20s;animation-direction:reverse}
.t8-orbit.t8-o2:before{background:#fff;box-shadow:0 0 14px 4px rgba(var(--s-rgb),.9)}
@keyframes t8-orbit{from{transform:rotateX(72deg) rotateZ(0)}to{transform:rotateX(72deg) rotateZ(360deg)}}
.t8-arch-tilt{position:relative;z-index:1;padding:7px;border-radius:calc(var(--aw)/2) calc(var(--aw)/2) 6px 6px;background:var(--gold);background-size:250% 100%;animation:t8-shine 7s linear infinite;box-shadow:0 0 70px rgba(var(--g-rgb),.3),0 34px 60px rgba(0,0,0,.65)}
.t8-arch-img{position:relative;aspect-ratio:3/4;overflow:hidden;background:var(--card);border-radius:calc(var(--aw)/2 - 7px) calc(var(--aw)/2 - 7px) 2px 2px}
.t8-hero-img{position:absolute;inset:-6% 0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.6s ease;transform:translate3d(0,0,0) scale(1.08);will-change:transform}
.t8-hero-img.t8-on{opacity:1}
.t8-arch-img:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%);background-size:250% 100%;animation:t8-gloss 6s ease-in-out infinite;pointer-events:none}
@keyframes t8-gloss{0%{background-position:150% 0}60%,100%{background-position:-60% 0}}
.t8-names{font:400 clamp(54px,15vw,112px)/1 var(--f-script);margin:clamp(14px,2.4vh,26px) 0 0;padding:0 .1em .12em;filter:drop-shadow(0 6px 18px rgba(var(--g-rgb),.25))}
.t8-names span{display:block;font:400 .3em var(--f-cinzel);letter-spacing:.3em;margin:2px 0}
.t8-hero-copy{max-width:420px;margin:10px auto 0;font:italic 500 17px/1.6 var(--f-serif);color:rgba(246,239,224,.82)}
.t8-datebar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;max-width:430px;margin:clamp(16px,3vh,26px) auto 0}
.t8-datebar>div{font:500 11px var(--f-cinzel);letter-spacing:.28em;text-transform:uppercase;color:var(--gl);border-top:1px solid var(--g);border-bottom:1px solid var(--g);padding:9px 0}
.t8-datebar strong{font:500 clamp(46px,11vw,68px)/1 var(--f-cinzel)}
.t8-where{font:italic 500 16px var(--f-serif);margin-top:12px;color:rgba(246,239,224,.78)}
.t8-cd{display:none;justify-content:center;gap:10px;margin-top:18px}
.t8-cd.t8-live{display:flex}
.t8-cd div{min-width:64px;padding:10px 6px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:1px solid rgba(var(--g-rgb),.5);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 10px 24px rgba(0,0,0,.4);perspective:300px}
.t8-cd b{display:block;font:500 26px/1.1 var(--f-cinzel);color:var(--gl);font-variant-numeric:tabular-nums}
.t8-cd b.t8-tick{animation:t8-tick .6s var(--ease)}
@keyframes t8-tick{from{transform:rotateX(-90deg);opacity:0}to{transform:none;opacity:1}}
.t8-cd small{font:500 8px var(--f-sans);letter-spacing:.22em;color:var(--sl)}
.t8-cd-done{font:italic 500 17px var(--f-serif);color:var(--gl)}
.t8-pill{display:inline-block;margin-top:16px;padding:8px 20px;border-radius:30px;border:1px solid rgba(var(--s-rgb),.5);background:rgba(255,255,255,.04);font:500 10px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;color:var(--sl)}
.t8-cta{margin-top:clamp(16px,3vh,28px)}
.t8-cue{position:absolute;bottom:18px;left:0;right:0;z-index:2;font:500 9px var(--f-sans);letter-spacing:.3em;color:var(--sl);text-transform:uppercase}
.t8-cue i{display:block;width:1px;height:34px;margin:8px auto 0;background:linear-gradient(var(--g),transparent);transform-origin:top;animation:t8-drip 2s ease-in-out infinite}
@keyframes t8-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.t8-intro .t8-hero-in>*{animation:t8-up 1.2s var(--ease) both;animation-delay:calc(var(--i,0)*.1s)}
.t8-intro .t8-arch{animation-name:t8-arch-in}
@keyframes t8-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes t8-arch-in{from{opacity:0;transform:translateY(40px) scale(.9)}to{opacity:1;transform:none}}
/* quote */
.t8-quote{text-align:center;max-width:640px;margin:0 auto}
.t8-quote:before{content:"“";display:block;font:400 96px/.6 var(--f-script);color:var(--g);height:46px}
.t8-quote p{font:italic 500 clamp(21px,4.6vw,30px)/1.6 var(--f-serif);margin:0 0 18px}
.t8-quote small{display:block;font:500 11px var(--f-cinzel);letter-spacing:.3em;color:var(--sl);text-transform:uppercase}
/* story */
.t8-chap{display:grid;gap:26px;align-items:center;justify-items:center;margin-bottom:78px;text-align:center}
.t8-chap:last-child{margin-bottom:0}
.t8-chap-img{--aw:min(70vw,250px);width:var(--aw);aspect-ratio:3/4;padding:5px;border-radius:calc(var(--aw)/2) calc(var(--aw)/2) 8px 8px;background:var(--gold);background-size:250% 100%;box-shadow:0 26px 50px rgba(0,0,0,.6),0 0 50px rgba(var(--g-rgb),.18)}
.t8-chap-in{width:100%;height:100%;overflow:hidden;border-radius:calc(var(--aw)/2 - 5px) calc(var(--aw)/2 - 5px) 4px 4px;position:relative}
.t8-chap-in img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t8-chap:hover .t8-chap-in img{transform:scale(1.07)}
.t8-num{font:500 clamp(64px,16vw,104px)/1 var(--f-cinzel);color:transparent;-webkit-text-stroke:1px var(--g);display:block}
.t8-chap h3{font:400 clamp(36px,8vw,48px)/1.1 var(--f-script);margin:-8px 0 10px}
.t8-chap p{max-width:390px;margin:0 auto;color:rgba(246,239,224,.74);font-size:14.5px}
/* calendar */
.t8-calwrap{max-width:420px;margin:0 auto}
.t8-calcard{padding:34px 26px 30px;border-radius:26px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.55),0 0 60px rgba(var(--g-rgb),.15)}
.t8-calcard h3{font:500 26px var(--f-cinzel);letter-spacing:.24em;text-transform:uppercase;margin:0 0 4px}
.t8-calcard small{display:block;font:500 11px var(--f-sans);letter-spacing:.32em;color:var(--sl);margin-bottom:20px}
.t8-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 0;justify-items:center}
.t8-cal-h{font:500 10px var(--f-sans);letter-spacing:.1em;color:var(--sl);padding-bottom:6px}
.t8-cal-d{position:relative;width:34px;height:34px;display:grid;place-items:center;font:400 14px var(--f-sans);font-variant-numeric:tabular-nums;color:rgba(246,239,224,.82)}
.t8-cal-dot:after{content:"";position:absolute;bottom:2px;width:4px;height:4px;border-radius:50%;background:var(--sl)}
.t8-cal-on{color:#1a1304}
.t8-cal-on b{position:relative;z-index:1;font-weight:600}
.t8-cal-on:before{content:"";position:absolute;inset:-3px;border-radius:50%;background:radial-gradient(circle at 32% 26%,var(--gx),var(--g) 55%,var(--gd));box-shadow:0 0 22px rgba(var(--g-rgb),.8);animation:t8-pulse 2.4s ease-in-out infinite}
.t8-cal-on:after{content:"♥";position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--gl)}
.t8-calcard .t8-btn{margin-top:26px}
/* celebrations: 3D rail */
.t8-rail{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:34px max(22px,calc(50% - 170px)) 40px;perspective:1300px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.t8-rail::-webkit-scrollbar{display:none}
.t8-ev{flex:0 0 min(78vw,340px);scroll-snap-align:center;border-radius:22px;overflow:hidden;transform:rotateY(var(--r,0deg)) scale(var(--s,1));opacity:var(--o,1);transition:transform .12s linear,opacity .12s linear;box-shadow:0 30px 60px rgba(0,0,0,.55)}
.t8-ev-img{position:relative;height:170px;overflow:hidden}
.t8-ev-img img{width:100%;height:100%;object-fit:cover}
.t8-ev-img:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,var(--card))}
.t8-ev-ic{position:absolute;right:14px;bottom:-4px;z-index:2;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--bg);border:1px solid var(--g);font-size:18px}
.t8-ev-day{position:absolute;left:14px;top:14px;z-index:2;padding:5px 12px;border-radius:20px;background:rgba(var(--bg-rgb),.75);border:1px solid rgba(var(--g-rgb),.6);font:500 9.5px var(--f-sans);letter-spacing:.2em;text-transform:uppercase;color:var(--gl)}
.t8-ev-b{padding:6px 22px 24px;text-align:center}
.t8-ev-time{font:500 22px var(--f-cinzel);letter-spacing:.14em;margin-bottom:4px}
.t8-ev-b h3{font:500 21px/1.2 var(--f-cinzel);letter-spacing:.08em;margin:0;text-transform:uppercase}
.t8-ev-b small{display:block;font:400 13px "Noto Serif Devanagari",serif;color:var(--sl);margin:3px 0 8px}
.t8-ev-meta{font-size:12.5px;color:rgba(246,239,224,.7);margin:8px 0}
.t8-ev-meta b{color:var(--gl);font-weight:500;margin-right:5px}
.t8-ev-b p{font-size:13px;color:rgba(246,239,224,.66);margin:0 0 12px}
.t8-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 8px;border-radius:30px;border:1px solid rgba(var(--s-rgb),.45);font-size:11px;letter-spacing:.04em}
.t8-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.4)}
.t8-nav{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:4px}
.t8-nav button{width:44px;height:44px;border-radius:50%;border:1px solid var(--g);background:transparent;color:var(--gl);font-size:18px;transition:background .3s}
.t8-nav button:hover{background:rgba(var(--g-rgb),.18)}
.t8-nav span{font:500 9.5px var(--f-sans);letter-spacing:.3em;color:var(--sl);text-transform:uppercase}
/* moments */
.t8-masonry{column-count:2;column-gap:12px}
.t8-masonry figure{position:relative;margin:0 0 12px;break-inside:avoid;overflow:hidden;border-radius:18px;cursor:zoom-in;box-shadow:0 16px 34px rgba(0,0,0,.5);border:1px solid rgba(var(--g-rgb),.35)}
.t8-masonry figure:nth-child(3n+1){aspect-ratio:4/5}.t8-masonry figure:nth-child(3n+2){aspect-ratio:1/1}.t8-masonry figure:nth-child(3n){aspect-ratio:3/4}
.t8-masonry img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t8-masonry figure:hover img{transform:scale(1.07)}
.t8-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(var(--bg-rgb),.94);cursor:zoom-out;animation:t8-fadein .3s ease}
.t8-lb img{max-width:min(94vw,900px);max-height:88vh;border-radius:10px;border:1px solid var(--g);box-shadow:0 30px 80px rgba(0,0,0,.7)}
@keyframes t8-fadein{from{opacity:0}}
/* venue */
.t8-venue-grid{display:grid;gap:24px}
.t8-venue-photo{position:relative;height:clamp(250px,56vw,420px);margin:0;border-radius:200px 200px 24px 24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.6);border:1px solid var(--g)}
.t8-venue-photo img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--ease)}
.t8-venue-photo:hover img{transform:scale(1.06)}
.t8-vcard{padding:34px 26px;border-radius:24px;text-align:center;box-shadow:0 26px 60px rgba(0,0,0,.45)}
.t8-vcard h3{font:500 clamp(24px,5.5vw,32px)/1.2 var(--f-cinzel);letter-spacing:.1em;margin:4px 0 10px;text-transform:uppercase}
.t8-vcard p{font-size:14px;color:rgba(246,239,224,.72);margin:0 0 22px}
.t8-vbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.t8-chips{display:grid;gap:12px;margin-top:16px}
.t8-chip{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(var(--s-rgb),.25);font-size:13px;color:rgba(246,239,224,.8)}
.t8-chip span{font-size:20px;color:var(--gl)}
.t8-chip p{margin:0}
/* rsvp + footer */
.t8-finale{background:radial-gradient(ellipse 70% 40% at 50% 0,rgba(var(--g-rgb),.2),transparent 70%),linear-gradient(180deg,transparent,rgba(0,0,0,.45))}
.t8-rsvp{position:relative;max-width:540px;margin:0 auto;padding:42px 28px 34px;border-radius:28px;box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 70px rgba(var(--g-rgb),.15)}
.t8-rsvp h2{text-align:center;font:500 clamp(22px,5vw,28px)/1.3 var(--f-cinzel);letter-spacing:.08em;margin:0 0 10px;text-transform:uppercase}
.t8-rsvp-intro{text-align:center;font-size:13.5px;color:rgba(246,239,224,.7);margin:0 0 26px}
.t8-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:40px;background:rgba(255,255,255,.05);border:1px solid rgba(var(--s-rgb),.3)}
.t8-seg button{min-height:46px;border:0;border-radius:36px;background:transparent;font:500 10.5px var(--f-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--sl);transition:background .35s,color .35s,box-shadow .35s}
.t8-seg button[aria-pressed="true"]{background:var(--gold);background-size:250% 100%;color:#1a1304;box-shadow:0 8px 22px rgba(var(--g-rgb),.45)}
.t8-field{position:relative;margin:22px 0}
.t8-field label{display:block;font:500 10px var(--f-sans);letter-spacing:.24em;color:var(--gl);margin-bottom:4px}
.t8-field input,.t8-field textarea{width:100%;display:block;background:transparent;border:0;border-bottom:1px solid rgba(var(--s-rgb),.4);border-radius:0;padding:9px 0 10px;font:inherit;font-size:15px;color:var(--ivory);outline:none;-webkit-appearance:none;appearance:none}
.t8-field textarea{resize:none;min-height:60px}
.t8-field input::placeholder,.t8-field textarea::placeholder{color:rgba(246,239,224,.35)}
.t8-field:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease);pointer-events:none}
.t8-field:focus-within:after{transform:scaleX(1)}
.t8-stepper{display:flex;align-items:center;justify-content:space-between;gap:12px}
.t8-stepper>div{display:flex;align-items:center;gap:6px}
.t8-stepper button{width:40px;height:40px;border-radius:50%;border:1px solid var(--g);background:transparent;color:var(--gl);font-size:20px;line-height:1;transition:background .3s}
.t8-stepper button:hover{background:rgba(var(--g-rgb),.2)}
.t8-stepper output{min-width:34px;text-align:center;font:500 22px var(--f-cinzel);color:var(--ivory)}
.t8-send{width:100%;margin-top:10px;min-height:56px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#1a1304;font:600 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;background:var(--gold);background-size:250% 100%;animation:t8-shine 6s linear infinite;box-shadow:0 14px 34px rgba(var(--g-rgb),.4);transition:transform .35s var(--ease)}
.t8-send:hover{transform:translateY(-3px)}
.t8-send:active{transform:scale(.98)}
.t8-status{min-height:20px;margin:14px 0 0;font-size:12px;text-align:center;color:var(--gl)}
.t8-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.t8-contact{display:inline-block;padding:9px 16px;border-radius:30px;border:1px solid rgba(var(--s-rgb),.4);text-decoration:none;font-size:12px;color:var(--sl)}
.t8-end{text-align:center;padding:70px 22px 80px}
.t8-coin{width:116px;height:116px;margin:0 auto 22px;perspective:600px}
.t8-coin i{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;font:500 30px var(--f-cinzel);font-style:normal;color:#1a1304;background:radial-gradient(circle at 32% 26%,var(--gx),var(--g) 50%,var(--gd));box-shadow:inset 0 0 0 6px rgba(0,0,0,.12),inset 0 0 0 7px rgba(255,255,255,.4),0 0 50px rgba(var(--g-rgb),.45);animation:t8-coin 7s linear infinite;transform-style:preserve-3d}
@keyframes t8-coin{to{transform:rotateY(360deg)}}
.t8-end h3{font:400 clamp(32px,7vw,46px)/1.2 var(--f-script);margin:0 0 8px}
.t8-end p{font:500 10px var(--f-sans);letter-spacing:.3em;color:rgba(246,239,224,.6);margin:8px 0 0;text-transform:uppercase}
.t8-end .t8-tag{font:italic 500 18px var(--f-serif);letter-spacing:.02em;text-transform:none;color:var(--gl)}
.t8-music{display:none;position:fixed;z-index:60;right:16px;bottom:16px;width:46px;height:46px;border-radius:50%;border:1px solid var(--g);background:rgba(var(--bg-rgb),.9);color:var(--gl);font-size:17px;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.t8-js .t8-music.t8-has{display:block}
.t8-music[aria-pressed="true"]{background:var(--gold);color:#1a1304}
@media(min-width:820px){
  .t8 section{padding:120px 0}
  .t8-chap{grid-template-columns:1fr 1fr;gap:64px;text-align:left;justify-items:stretch}
  .t8-chap .t8-chap-img{justify-self:center}
  .t8-chap .t8-chap-txt{max-width:400px}
  .t8-chap:nth-child(even) .t8-chap-img{order:2}
  .t8-chap:nth-child(even) .t8-chap-txt{justify-self:end}
  .t8-chap p{margin:0}
  .t8-masonry{column-count:3;column-gap:16px}
  .t8-masonry figure{margin-bottom:16px}
  .t8-venue-grid{grid-template-columns:1.05fr 1fr;align-items:center;gap:40px}
  .t8-rsvp{padding:52px 48px 42px}
}
@media(max-width:360px){.t8-wrap{padding:0 16px}.t8-cd div{min-width:54px}.t8-cd{gap:6px}}
@media(prefers-reduced-motion:reduce){.t8 *,.t8 *:before,.t8 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t8-js .t8-reveal{opacity:1!important;transform:none!important}}
@media print{.t8-progress,.t8-gate,.t8-music,.t8-cue,.t8-fx{display:none!important}.t8-js .t8-reveal{opacity:1!important;transform:none!important}.t8-js img.t8-fi{opacity:1!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const evs = Array.isArray(events) ? events : [];
  const offset = clean(w.timezone_offset) || '+05:30';

  const rawBride = clean(w.bride_name) || 'Bride';
  const rawGroom = clean(w.groom_name) || 'Groom';
  const brideFirst = clean(w.name_order) === 'bride_first';
  const [rawFirst, rawSecond] = brideFirst ? [rawBride, rawGroom] : [rawGroom, rawBride];
  const first = esc(rawFirst), second = esc(rawSecond);
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

  const heroList = [safeImg(w.hero_image), U('1519741497674-611481863552', 1200), U('1465495976277-4387d4b0b4c6', 1200), U('1522413452208-996ff3f3e740', 1200)].filter(Boolean);
  const venueImg = safeImg(w.venue_image) || U('1477587458883-47145ed94245', 1200);
  const story = readStory(w.story);
  const gallery = readGallery(w.gallery);

  /* events: sorted, day index per unique date */
  const stamp = e => parseWhen(e.event_date, e.event_time, offset) ?? (dparts(e.event_date) ? Date.UTC(dparts(e.event_date).y, dparts(e.event_date).mo - 1, dparts(e.event_date).d) : Infinity);
  const sorted = [...evs].sort((a, b) => stamp(a) - stamp(b));
  const dayKeys = [];
  const eventsHtml = sorted.map(e => {
    const name = clean(e.event_name) || 'Celebration';
    const k = kindOf(name);
    const p = dparts(e.event_date);
    const key = p ? `${p.y}-${p.mo}-${p.d}` : 'tbd';
    if (!dayKeys.includes(key)) dayKeys.push(key);
    const gi = dayKeys.indexOf(key);
    const label = `Day ${ORD[gi] || gi + 1}${p ? ` · ${shortDate(p)}` : ''}`;
    const img = safeImg(e.image_url) || U(k.img);
    const loc = clean(e.venue || e.address) || clean(w.venue);
    const t = fmtTime(e.event_time);
    const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
    return `<article class="t8-ev t8-foil">
      <div class="t8-ev-img t8-ph"><img class="t8-fi" src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t8-ev-day">${esc(label)}</span><span class="t8-ev-ic" aria-hidden="true">${k.icon}</span></div>
      <div class="t8-ev-b"><div class="t8-ev-time">${t ? esc(t) : '✦'}</div><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}
        ${loc ? `<div class="t8-ev-meta"><b>⌖</b>${esc(loc)}</div>` : ''}
        ${clean(e.description) ? `<p>${esc(e.description)}</p>` : ''}
        ${clean(e.dress_code) ? `<div class="t8-dress"><span class="t8-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
      </div></article>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t8-fonts>
<style>${STYLE}</style>
<noscript><style>.t8-gate{display:none!important}.t8.t8-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t8-reveal{opacity:1!important;transform:none!important}.t8 img.t8-fi{opacity:1!important}.t8-hero-img{opacity:1}</style></noscript>
<div class="t8 t8-js t8-locked" style="${themeVars(w)}" data-when="${esc(String(whenTs ?? parseWhen(w.date, '', offset) ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-hero-imgs="${esc(JSON.stringify(heroList))}" data-names="${esc(`${rawGroom} & ${rawBride}`)}" data-venue="${esc(clean(w.venue))}">
  ${DEFS}
  <div class="t8-progress" aria-hidden="true"></div>

  <div class="t8-gate" role="dialog" aria-label="Wedding invitation gate">
    <div class="t8-door t8-door-l" aria-hidden="true">${mandala}</div>
    <div class="t8-door t8-door-r" aria-hidden="true">${mandala}</div>
    <div class="t8-gate-ui">
      <div class="t8-kicker">YOU ARE INVITED</div>
      <h2 class="t8-gate-names t8-goldtx">${first} &amp; ${second}</h2>
      <div class="t8-gate-date">${esc(day ? longDate(day) : city)}</div>
      <div class="t8-medal"><i class="t8-ring"></i><i class="t8-ring"></i><i class="t8-ring"></i>
        <button class="t8-seal" type="button" data-open aria-label="Open wedding invitation"><b>${esc(rawFirst.charAt(0).toUpperCase())}${esc(rawSecond.charAt(0).toUpperCase())}</b></button></div>
      <div class="t8-guest-line">Dear ${guestLine}</div>
      <div class="t8-entry-note">Tap the seal to open the gates</div>
    </div>
  </div>

  <main>
    <header class="t8-hero" data-hero>
      <div class="t8-halo" aria-hidden="true">${mandala}</div>
      <div class="t8-halo t8-h2" aria-hidden="true">${mandala}</div>
      <div class="t8-hero-in">
        <div class="t8-invoc" style="--i:0">${invocation}</div>
        <div class="t8-eyebrow" style="--i:1">Together with their families</div>
        <div class="t8-arch" style="--i:2"><i class="t8-orbit"></i><i class="t8-orbit t8-o2"></i>
          <div class="t8-arch-tilt t8-shine" data-tilt="12" data-arch><div class="t8-arch-img t8-ph"><i class="t8-hero-img"></i></div></div></div>
        <h1 class="t8-names" style="--i:3">${first} <span class="t8-silvertx">&amp;</span> ${second}</h1>
        <p class="t8-hero-copy" style="--i:4">${inviteText}</p>
        <div class="t8-datebar" style="--i:5" aria-label="Wedding date">
          <div>${esc(dayName || 'Save the date')}</div>
          <strong>${day ? pad(day.d) : '--'}</strong>
          <div>${day ? esc(MONTHS[day.mo - 1].slice(0, 3)) + ' ' + day.y : 'TBA'}</div>
        </div>
        <p class="t8-where" style="--i:6">${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</p>
        <div class="t8-cd" style="--i:6" role="timer"><div><b data-u="d">--</b><small>DAYS</small></div><div><b data-u="h">--</b><small>HRS</small></div><div><b data-u="m">--</b><small>MIN</small></div><div><b data-u="s">--</b><small>SEC</small></div></div>
        <div class="t8-pill" style="--i:7">Invited: ${guestLine}</div><br>
        <div class="t8-cta" style="--i:8"><a href="#" data-goto="story" class="t8-btn">Discover our story <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="t8-cue" aria-hidden="true">Scroll<i></i></div>
    </header>

    <section data-sec="story">
      <div class="t8-wrap">
        <div class="t8-quote t8-reveal"><p>${poem}</p>${families ? `<small>${esc(families)}</small>` : ''}<div class="t8-orn"><span>✦</span></div></div>
      </div>
      <div class="t8-wrap" style="margin-top:84px">
        ${story.map((s, i) => `<article class="t8-chap t8-reveal">
          <div class="t8-chap-img t8-shine" data-tilt="9"><div class="t8-chap-in t8-ph"><img class="t8-fi" src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div></div>
          <div class="t8-chap-txt"><span class="t8-num" aria-hidden="true">${pad(i + 1)}</span><h3 class="t8-goldtx">${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}
      </div>
    </section>

    ${day ? `<section style="padding-top:20px">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Mark your calendar</div><h2>Save the Date</h2><div class="t8-orn"><span>✦</span></div></div>
        <div class="t8-calwrap t8-reveal"><div class="t8-calcard t8-foil t8-shine" data-tilt="8">
          <h3 class="t8-goldtx">${esc(MONTHS[day.mo - 1])}</h3><small>${day.y}</small>
          ${calendarHtml(day, evs.map(e => e.event_date))}
          <p style="margin:22px 0 0;font:italic 500 17px var(--f-serif)">${esc(dayName)}${timeText ? `, ${esc(timeText)}` : ''}</p>
          ${calUrl ? `<a class="t8-btn" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Add to calendar</a>` : ''}
        </div></div>
      </div>
    </section>` : ''}

    ${sorted.length ? `<section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">The festivities</div><h2>Celebrations</h2>
          <p>Traditions, laughter, music and memories. Swipe through each celebration.</p><div class="t8-orn"><span>✦</span></div></div>
      </div>
      <div class="t8-rail" data-rail tabindex="0" aria-label="Celebrations">${eventsHtml}</div>
      <div class="t8-nav"><button type="button" data-rail-nav="-1" aria-label="Previous celebration">‹</button><span>Swipe</span><button type="button" data-rail-nav="1" aria-label="Next celebration">›</button></div>
    </section>` : ''}

    ${gallery.length ? `<section style="padding-top:20px">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Glimpses of us</div><h2>Moments</h2><div class="t8-orn"><span>✦</span></div></div>
        <div class="t8-masonry">${gallery.map((g, i) => `<figure class="t8-ph t8-reveal" data-lb="${esc(g)}"><img class="t8-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></figure>`).join('')}</div>
      </div>
    </section>` : ''}

    <section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Join us</div><h2>The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <div class="t8-venue-grid">
          <figure class="t8-venue-photo t8-ph t8-reveal"><img class="t8-fi" src="${esc(venueImg)}" data-fallback="${esc(U('1519741497674-611481863552', 1200))}" alt="${venue}" loading="lazy" decoding="async"></figure>
          <div class="t8-reveal">
            <div class="t8-vcard t8-foil t8-shine" data-tilt="6">
              <div class="t8-eyebrow">The wedding destination</div>
              <h3 class="t8-goldtx">${venue}</h3>
              <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
              <div class="t8-vbtns">
                ${mapUrl ? `<a class="t8-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">⌖ &nbsp;Directions</a>` : ''}
                ${calUrl ? `<a class="t8-btn t8-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Calendar</a>` : ''}
              </div>
            </div>
            ${travel.length ? `<div class="t8-chips">${travel.map(([i, t]) => `<div class="t8-chip"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="t8-finale">
      <section style="padding-bottom:40px">
        <div class="t8-wrap">
          <div class="t8-head t8-reveal"><div class="t8-eyebrow">Your presence is our present</div><h2>Kindly RSVP</h2></div>
          <form class="t8-rsvp t8-foil t8-reveal" data-rsvp novalidate>
            <h2 class="t8-goldtx">Will you grace us<br>with your presence?</h2>
            <p class="t8-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
            ${canRsvp ? `
            <div class="t8-seg" role="group" aria-label="Attendance"><button type="button" data-att="Joyfully accepts" aria-pressed="false">Joyfully accepts</button><button type="button" data-att="Regretfully declines" aria-pressed="false">Regretfully declines</button></div>
            <div class="t8-field"><label for="t8-name">YOUR NAME</label><input id="t8-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
            <div class="t8-field t8-stepper" data-guests><label style="margin:0">NUMBER OF GUESTS</label><div><button type="button" data-step="-1" aria-label="Fewer guests">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1}</output><button type="button" data-step="1" aria-label="More guests">+</button></div></div>
            <div class="t8-field"><label for="t8-note">A NOTE FOR THE COUPLE (OPTIONAL)</label><textarea id="t8-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
            <button class="t8-send" type="submit">Send reply via WhatsApp &nbsp;↗</button>
            <p class="t8-status" role="status" aria-live="polite"></p>` : ''}
            ${contacts.length ? `<div class="t8-contacts">${contacts.map(c => `<a class="t8-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
          </form>
        </div>
      </section>
      <footer class="t8-end">
        <div class="t8-coin t8-reveal" aria-hidden="true"><i>${monoInit}</i></div>
        <h3 class="t8-reveal">With love &amp; gratitude</h3>
        ${hashtag ? `<p class="t8-tag">${hashtag.startsWith('#') ? hashtag : '#' + hashtag}</p>` : ''}
        <p>${signature}</p>
        <p style="margin-top:14px">${esc(dateNums)}${city ? ` &nbsp;|&nbsp; ${city}` : ''}</p>
      </footer>
    </div>
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
  const rand = (a, b) => a + Math.random() * (b - a);
  const undo = [];
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  let dead = false;

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
    html.style.overflow = 'auto';
    body.style.overflow = 'visible';
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
  };
  host.classList.add('t8-js');
  host.classList.remove('t8-boot');
  lock();

  /* boot: reveal gate UI immediately and ensure boot class is removed */
  (() => {
    const f = doc.fonts;
    if (f && typeof f.load === 'function') {
      Promise.all([f.load('40px "Pinyon Script"'), f.load('500 20px Cinzel'), f.load('300 15px Jost')]).catch(() => {});
    }
    win.requestAnimationFrame(() => host.classList.remove('t8-boot'));
  })();

  /* hero image: one candidate at a time */
  const heroImgEl = $('.t8-hero-img');
  let heroList = [];
  try { heroList = JSON.parse(host.dataset.heroImgs || '[]'); } catch { heroList = []; }
  const tryHero = i => {
    if (dead || !heroImgEl || i >= heroList.length) return;
    const im = new Image();
    im.onload = () => {
      if (dead) return;
      const show = () => { heroImgEl.style.backgroundImage = `url("${heroList[i]}")`; win.requestAnimationFrame(() => heroImgEl.classList.add('t8-on')); };
      (typeof im.decode === 'function' ? im.decode().catch(() => {}) : Promise.resolve()).then(show);
    };
    im.onerror = () => tryHero(i + 1);
    im.src = heroList[i];
  };
  tryHero(0);

  /* images: fade in, one fallback */
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

  /* gold & silver sparkle dust (canvas) */
  const cv = doc.createElement('canvas');
  cv.className = 't8-fx'; cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);
  const cx = cv.getContext && cv.getContext('2d');
  const cs = win.getComputedStyle(host);
  const GOLD = cs.getPropertyValue('--gl').trim() || '#f1d98a';
  const SILVER = cs.getPropertyValue('--sl').trim() || '#e3e6ea';
  let W = 0, H = 0, raf = 0;
  const P = [];
  const fit = () => {
    const dpr = Math.min(2, win.devicePixelRatio || 1);
    W = win.innerWidth || 800; H = win.innerHeight || 600;
    cv.width = W * dpr; cv.height = H * dpr;
    if (cx) cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit(); on(win, 'resize', fit);
  const ambient = () => ({ x: rand(0, W), y: rand(0, H), vx: rand(-.12, .12), vy: -rand(.1, .5), r: rand(.6, 2.1), a: rand(0, 6.28), sp: rand(.015, .045), c: Math.random() < .72 ? GOLD : SILVER, star: Math.random() < .2 });
  const star = (x, y, r) => {
    cx.beginPath();
    cx.moveTo(x, y - r * 4); cx.quadraticCurveTo(x, y, x + r * 4, y); cx.quadraticCurveTo(x, y, x, y + r * 4); cx.quadraticCurveTo(x, y, x - r * 4, y); cx.quadraticCurveTo(x, y, x, y - r * 4);
    cx.fill();
  };
  const burst = (x, y, n = 90) => {
    if (reduce || !cx) return;
    for (let i = 0; i < n; i++) {
      const ang = rand(0, 6.28), sp = rand(1.5, 9);
      P.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, r: rand(.8, 2.6), life: rand(50, 110), max: 110, c: Math.random() < .7 ? GOLD : SILVER, star: Math.random() < .25, burst: true });
    }
  };
  if (cx && !reduce) {
    const count = W < 600 ? 34 : 60;
    for (let i = 0; i < count; i++) P.push(ambient());
    const frame = () => {
      if (dead) return;
      cx.clearRect(0, 0, W, H);
      if (!doc.hidden) {
        for (let i = P.length - 1; i >= 0; i--) {
          const p = P[i];
          p.x += p.vx; p.y += p.vy;
          let al;
          if (p.burst) {
            p.vx *= .96; p.vy = p.vy * .96 + .06; p.life--;
            if (p.life <= 0) { P.splice(i, 1); continue; }
            al = Math.min(1, p.life / 50);
          } else {
            p.a += p.sp;
            if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
            if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
            al = .15 + .6 * Math.abs(Math.sin(p.a));
          }
          cx.globalAlpha = al; cx.fillStyle = p.c;
          if (p.star) star(p.x, p.y, p.r); else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); }
        }
        cx.globalAlpha = 1;
      }
      raf = win.requestAnimationFrame(frame);
    };
    raf = win.requestAnimationFrame(frame);
  }

  /* 3D tilt (pointer) + gyro on the hero arch */
  $$('[data-tilt]').forEach(el => {
    const max = Number(el.dataset.tilt) || 10;
    on(el, 'pointermove', e => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      el.style.transform = `perspective(900px) rotateX(${((.5 - py) * max).toFixed(2)}deg) rotateY(${((px - .5) * max).toFixed(2)}deg)`;
    });
    on(el, 'pointerleave', () => { el.style.transform = ''; });
  });
  const archEl = $('[data-arch]');
  if (archEl && !reduce) {
    on(win, 'deviceorientation', e => {
      if (e.gamma == null || e.beta == null) return;
      const ry = Math.max(-14, Math.min(14, e.gamma * .45)), rx = Math.max(-12, Math.min(12, (45 - e.beta) * .3));
      archEl.style.transform = `perspective(900px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
    });
  }

  /* gate open sequence */
  const gate = $('.t8-gate'), seal = $('[data-open]'), note = $('.t8-entry-note'), hero = $('[data-hero]');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (seal) {
      const r = seal.getBoundingClientRect();
      seal.classList.add('t8-burst');
      burst(r.left + r.width / 2, r.top + r.height / 2, 110);
    }
    if (gate) gate.classList.add('t8-open');
    later(() => burst(W / 2, H / 2, 80), 900);
    later(() => { if (hero) hero.classList.add('t8-intro'); }, 1500);
    later(() => {
      if (gate) gate.classList.add('t8-leaving');
      host.classList.remove('t8-locked');
      unlock();
    }, 1750);
    later(() => {
      if (gate) gate.remove();
      host.classList.remove('t8-locked');
      unlock(); onScroll();
    }, 2650);
  };
  on(seal, 'click', open);
  on(note, 'click', open);
  if (gate) on(gate, 'click', (e) => { if (!e.target.closest('button')) open(); });

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* progress + hero parallax */
  const bar = $('.t8-progress');
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

  /* reveals */
  const clearDelay = el => later(() => { el.style.transitionDelay = ''; }, 1400);
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t8-in'); clearDelay(e.target); io.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.t8-reveal').forEach(el => io.observe(el));
    undo.push(() => io.disconnect());
  } else $$('.t8-reveal').forEach(el => el.classList.add('t8-in'));

  /* 3D celebration rail */
  const rail = $('[data-rail]');
  if (rail) {
    const cards = $$('.t8-ev', rail);
    let rt = false;
    const upd = () => {
      rt = false;
      const rc = rail.getBoundingClientRect(), mid = rc.left + rc.width / 2;
      cards.forEach(c => {
        const b = c.getBoundingClientRect();
        const d = Math.max(-1.4, Math.min(1.4, (b.left + b.width / 2 - mid) / (rc.width / 2)));
        const a = Math.min(1, Math.abs(d));
        c.style.setProperty('--r', reduce ? '0deg' : (-d * 36).toFixed(1) + 'deg');
        c.style.setProperty('--s', (1 - a * .12).toFixed(3));
        c.style.setProperty('--o', (1 - a * .4).toFixed(2));
      });
    };
    const req = () => { if (!rt) { rt = true; win.requestAnimationFrame(upd); } };
    on(rail, 'scroll', req, { passive: true }); on(win, 'resize', req);
    later(upd, 300); later(upd, 1200);
    $$('[data-rail-nav]').forEach(b => on(b, 'click', () => {
      const step = (cards[0]?.getBoundingClientRect().width || 300) + 18;
      rail.scrollBy({ left: step * Number(b.dataset.railNav), behavior: reduce ? 'auto' : 'smooth' });
    }));
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
      count = Math.max(1, Math.min(12, count + Number(b.dataset.step)));
      if (out) out.textContent = String(count);
    }));
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form).value.trim();
      const nt = $('[name="note"]', form).value.trim();
      const status = $('.t8-status', form);
      if (!name || !att) { status.textContent = 'Please add your name and choose whether you can join.'; return; }
      const names = host.dataset.names || '';
      const dateTxt = $('.t8-datebar', host)?.textContent.replace(/\s+/g, ' ').trim() || '';
      const msg = [`Wedding RSVP — ${names}`, `Name: ${name}`, `Response: ${att}`, att !== 'Regretfully declines' && `Guests: ${count}`, nt && `Note: ${nt}`, dateTxt && `Wedding date: ${dateTxt}`, host.dataset.venue && `Venue: ${host.dataset.venue}`].filter(Boolean).join('\n');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      status.textContent = 'Thank you! Your WhatsApp reply is opening in a new tab.';
      burst(W / 2, H / 2, 70);
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

  const cleanup = () => {
    dead = true;
    if (raf) win.cancelAnimationFrame(raf);
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    closeLb();
    cv.remove();
    unlock();
    host.classList.remove('t8-js', 't8-locked');
    delete host._t8Cleanup;
  };
  host._t8Cleanup = cleanup;
  return cleanup;
}
