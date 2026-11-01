/* ==========================================================================
   Rajmahal Jharokha — Royal Wedding Invitation  (template 9)
   Peacock-teal night, rani-magenta velvet, antique gold + ivory.
   Velvet curtain entry with swaying brass lamps, a 3D tunnel of cusped
   Mughal arches (pointer / gyro / scroll-driven camera), liquid-gold foil,
   petal + ember canvas, rotating date medallion, sticky stacked event cards,
   ivory RSVP letter, rotating gold ring finale.

   Contract (same as templates 7 & 8):
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a complete, readable static invitation (no JS needed).

   wedding fields (all optional): bride_name, groom_name, name_order, date, time,
     timezone_offset, venue, address, city, map_url, invocation, invite_text,
     families | footer_text, poem, hashtag, hero_image, venue_image, rsvp_number,
     rsvp_contacts, story[{title,text,image}], travel_info, stay_info, music_url,
     theme: 'peacock'(default)|'maharani'|'ruby'|'sapphire',
     accent_color (gold), accent2_color (jewel), paper_color (night bg),
     gallery: [https urls]
   ========================================================================== */

/* ---------- helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
const clean = v => String(v ?? '').trim();
const safeUrl = u => (/^https?:\/\//i.test(clean(u)) ? esc(clean(u)) : '');
const safeImg = u => (/^https:\/\/[^\s'"()<>\\]+$/i.test(clean(u)) ? clean(u) : '');
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const pad = n => String(n).padStart(2, '0');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORD = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Great+Vibes&family=Jost:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600&display=swap';

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

/* ---------- theme: night + jewel + gold ---------- */
const PRESETS = {
  peacock: { bg: '#04222a', g: '#e0b95e', j: '#b8205f' },
  maharani: { bg: '#1d0b24', g: '#e8c47d', j: '#d4486f' },
  ruby: { bg: '#240509', g: '#e2b458', j: '#c1272d' },
  sapphire: { bg: '#071230', g: '#dfb85f', j: '#3f64d8' }
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

function themeVars(w) {
  const p = PRESETS[clean(w.theme).toLowerCase()] || PRESETS.peacock;
  const g = hex6(w.accent_color) || p.g, j = hex6(w.accent2_color) || p.j, bg = hex6(w.paper_color) || p.bg;
  const rgb = h => rgbOf(h).join(',');
  return `--bg:${bg};--bg2:${mix(bg, '#ffffff', .05)};--bg3:${mix(bg, j, .16)};--g:${g};--gl:${mix(g, '#ffffff', .45)};--gx:${mix(g, '#ffffff', .8)};--gd:${scale(g, .5)};--j:${j};--jl:${mix(j, '#ffffff', .45)};--jd:${scale(j, .52)};--g-rgb:${rgb(g)};--j-rgb:${rgb(j)};--bg-rgb:${rgb(bg)};--ivory:#f7efdc`;
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
  const head = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(c => `<span class="t9-cal-h">${c}</span>`).join('');
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    cells += d === day.d
      ? `<span class="t9-cal-d t9-cal-on" aria-label="Wedding day"><b>${d}</b></span>`
      : `<span class="t9-cal-d${dots.has(d) ? ' t9-cal-dot' : ''}">${d}</span>`;
  }
  return `<div class="t9-cal-grid" role="img" aria-label="${esc(MONTHS[day.mo - 1])} ${day.y} calendar">${head}${cells}</div>`;
}

/* ---------- SVG art ---------- */
/* cusped Mughal arch in objectBoundingBox units (also used as clip-path) */
const ARCH = (() => {
  const N = 10, c = .5, r = .455, b = .028;
  const pt = k => { const f = Math.PI * k / N; return [c - r * Math.cos(f), c - r * Math.sin(f)]; };
  let d = `M${(c - r).toFixed(4)} 1L${(c - r).toFixed(4)} ${c}`;
  for (let k = 0; k < N; k++) {
    const [x0, y0] = pt(k), [x1, y1] = pt(k + 1);
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    let nx = mx - c, ny = my - c;
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    d += `Q${(mx + nx * 2 * b).toFixed(4)} ${(my + ny * 2 * b).toFixed(4)} ${x1.toFixed(4)} ${y1.toFixed(4)}`;
  }
  return `${d}L${(c + r).toFixed(4)} 1Z`;
})();
const OUTLINE = (sw = 3, fill = 'none') => `<svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${ARCH}" style="stroke:url(#t9-gold);fill:${fill}" stroke-width="${sw}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;

const mandala = (() => {
  let p = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5;
    p += `<path transform="rotate(${a})" d="M0-40C11-52 11-64 0-70C-11-64-11-52 0-40Z"/><path transform="rotate(${a + 11.25})" d="M0-72C15-82 15-90 0-95C-15-90-15-82 0-72Z"/>`;
  }
  for (let i = 0; i < 8; i++) p += `<path transform="rotate(${i * 45})" d="M0-14L0-40"/>`;
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false"><g fill="none" stroke="url(#t9-gold)" stroke-width=".55" stroke-linejoin="round"><circle r="98"/><circle r="97" stroke-dasharray="1 3"/><circle r="72"/><circle r="40"/><circle r="14"/>${p}</g></svg>`;
})();

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="t9-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--gd)"/><stop offset=".3" style="stop-color:var(--gl)"/><stop offset=".55" style="stop-color:var(--g)"/><stop offset=".8" style="stop-color:var(--gx)"/><stop offset="1" style="stop-color:var(--gd)"/></linearGradient>
<clipPath id="t9-arch" clipPathUnits="objectBoundingBox"><path d="${ARCH}"/></clipPath></defs></svg>`;

const arcBox = (cls, inner, sw = 3) => `<div class="${cls}"><div class="t9-arc-clip t9-ph">${inner}</div>${OUTLINE(sw)}</div>`;
const lamp = (x, h, sd, dl = 0) => `<div class="t9-lamp" style="--x:${x}%;--h:${h}px;--sd:${sd}s;--dl:${dl}s" aria-hidden="true"><i></i></div>`;

/* ---------- styles ---------- */
const STYLE = `
.t9,.t9 *,.t9 *:before,.t9 *:after{box-sizing:border-box}
.t9{--gold:linear-gradient(110deg,var(--gd) 0%,var(--gl) 18%,var(--g) 34%,var(--gx) 50%,var(--g) 66%,var(--gl) 82%,var(--gd) 100%);
  --jewel:linear-gradient(120deg,var(--jd),var(--j) 50%,var(--jl));
  --f-deco:"Cinzel Decorative",Cinzel,serif;--f-cinzel:Cinzel,serif;--f-serif:"Cormorant Garamond",Georgia,serif;--f-script:"Great Vibes","Pinyon Script",cursive;--f-sans:Jost,system-ui,sans-serif;--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;overflow-anchor:none;color:var(--ivory);font:300 15px/1.75 var(--f-sans);-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 90% 45% at 50% 0,rgba(var(--j-rgb),.24),transparent 70%),radial-gradient(ellipse 60% 30% at 0 50%,rgba(var(--g-rgb),.08),transparent 70%),radial-gradient(ellipse 60% 30% at 100% 80%,rgba(var(--j-rgb),.16),transparent 70%),var(--bg)}
.t9:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.08;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.t9 main{position:relative;z-index:1}
.t9.t9-locked{height:100vh!important;height:100svh!important;max-height:100svh!important;overflow:hidden!important}
.t9 h1,.t9 h2,.t9 h3,.t9 p,.t9 figure{margin-top:0}
.t9 img{display:block;max-width:100%}
.t9 :where(button){font:inherit;color:inherit;cursor:pointer}
.t9 a{color:inherit}
.t9 :focus-visible{outline:2px solid var(--gl);outline-offset:3px}
.t9-gt{background:var(--gold);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t9-shine 8s linear infinite}
.t9-jt{background:var(--jewel);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
@keyframes t9-shine{from{background-position:200% 0}to{background-position:-50% 0}}
@keyframes t9-spin{to{transform:rotate(360deg)}}
@keyframes t9-fadein{from{opacity:0}}
.t9-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:var(--gold)}
.t9-fx{position:fixed;inset:0;width:100%;height:100%;z-index:950;pointer-events:none}
.t9-wrap{position:relative;width:100%;max-width:1080px;margin:0 auto;padding:0 22px}
.t9 section{position:relative;padding:92px 0}
.t9-eyebrow{font:500 10.5px var(--f-sans);letter-spacing:.38em;text-transform:uppercase;color:var(--jl);margin-bottom:12px}
.t9-head{text-align:center;margin-bottom:46px}
.t9-head h2{font:400 clamp(24px,5.6vw,42px)/1.2 var(--f-deco);letter-spacing:.1em;margin:0 0 12px;text-transform:uppercase}
.t9-head p{max-width:440px;margin:0 auto;color:rgba(247,239,220,.68);font-size:14px}
.t9-orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--g);margin:18px auto 0;font-size:11px}
.t9-orn:before,.t9-orn:after{content:"";height:1px;width:64px;background:linear-gradient(90deg,transparent,var(--g))}
.t9-orn:after{transform:scaleX(-1)}
.t9-ph{background:linear-gradient(135deg,var(--bg3),var(--bg2))}
.t9 img.t9-fi{opacity:0;transition:opacity .9s ease}
.t9 img.t9-fi.t9-loaded{opacity:1}
.t9 img.t9-failed{opacity:0!important}
.t9-reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t9-reveal.t9-in{opacity:1;transform:none}
.t9-foil{border:1px solid transparent;background:linear-gradient(165deg,var(--bg3),var(--bg)) padding-box,var(--gold) border-box;background-size:100% 100%,250% 100%}
.t9-shine{position:relative}
.t9-shine:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.16),transparent 55%);mix-blend-mode:overlay}
[data-tilt]{transition:transform .25s ease;will-change:transform}
.t9-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 28px;border-radius:40px;border:0;text-decoration:none;font:600 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;position:relative;overflow:hidden;color:#1d1304;background:var(--gold);background-size:250% 100%;box-shadow:0 10px 28px rgba(var(--g-rgb),.35),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .35s var(--ease),box-shadow .35s;animation:t9-shine 6s linear infinite}
.t9-btn:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(var(--g-rgb),.5),inset 0 1px 0 rgba(255,255,255,.5)}
.t9-btn.t9-ghost{background:transparent;color:var(--gl);box-shadow:inset 0 0 0 1px var(--g);animation:none}
.t9-btn.t9-ghost:hover{background:rgba(var(--g-rgb),.14)}
/* arch frames (clip + gold outline) */
.t9-arc-clip{position:absolute;inset:0;overflow:hidden;clip-path:url(#t9-arch)}
.t9-arch>svg,.t9-photo>svg,.t9-frame>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
/* lamps */
.t9-lamp{position:absolute;top:0;left:var(--x);width:34px;height:var(--h);transform-origin:50% 0;animation:t9-swing var(--sd,6s) ease-in-out infinite alternate;animation-delay:var(--dl,0s);pointer-events:none;z-index:4}
.t9-lamp:before{content:"";position:absolute;left:50%;top:0;bottom:44px;width:1px;background:linear-gradient(var(--gd),var(--gl))}
.t9-lamp i{position:absolute;left:0;bottom:0;width:34px;height:52px;background:radial-gradient(circle at 50% 62%,#fff6cf 0,#ffd36b 22%,var(--g) 55%,var(--gd) 100%);clip-path:polygon(50% 0,100% 28%,86% 100%,14% 100%,0 28%)}
.t9-lamp:after{content:"";position:absolute;left:50%;bottom:-34px;width:120px;height:120px;margin-left:-60px;border-radius:50%;background:radial-gradient(circle,rgba(var(--g-rgb),.5),transparent 68%);animation:t9-flick 2.8s ease-in-out infinite alternate;z-index:-1}
@keyframes t9-swing{from{transform:rotate(-4.5deg)}to{transform:rotate(4.5deg)}}
@keyframes t9-flick{0%{opacity:.55;transform:scale(.92)}50%{opacity:1}100%{opacity:.7;transform:scale(1.06)}}
/* gate: velvet curtains */
.t9-gate{position:fixed;inset:0;z-index:900;overflow:hidden;background:radial-gradient(ellipse at 50% 46%,rgba(var(--g-rgb),.6) 0,rgba(var(--j-rgb),.3) 30%,var(--bg) 72%),var(--bg);transition:opacity .9s ease .1s}
.t9-gate.t9-leaving{opacity:0;pointer-events:none}
.t9-sun{position:absolute;left:50%;top:50%;width:200vmax;height:200vmax;margin:-100vmax 0 0 -100vmax;background:repeating-conic-gradient(from 0deg,rgba(var(--g-rgb),.3) 0 5deg,transparent 5deg 12deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 30%);mask:radial-gradient(circle,#000 0,transparent 30%);animation:t9-spin 90s linear infinite}
.t9-cur{position:absolute;top:0;bottom:0;width:50.6%;z-index:2;will-change:transform;transition:transform 2.2s cubic-bezier(.65,0,.2,1);
  background:repeating-linear-gradient(90deg,rgba(0,0,0,.4) 0,rgba(0,0,0,0) 3.2%,rgba(255,255,255,.08) 6.2%,rgba(0,0,0,.36) 9.5%),linear-gradient(180deg,var(--j),var(--jd) 85%)}
.t9-cur:after{content:"";position:absolute;left:0;right:0;bottom:0;height:38px;background:repeating-linear-gradient(90deg,var(--g) 0 2px,transparent 2px 8px);-webkit-mask:linear-gradient(0deg,#000,transparent);mask:linear-gradient(0deg,#000,transparent)}
.t9-cur-l{left:0;transform-origin:0 50%;border-right:3px solid var(--g);box-shadow:inset -34px 0 50px rgba(0,0,0,.5)}
.t9-cur-r{right:0;transform-origin:100% 50%;border-left:3px solid var(--g);box-shadow:inset 34px 0 50px rgba(0,0,0,.5)}
.t9-open .t9-cur{transform:scaleX(.15)}
.t9-val{position:absolute;top:0;left:0;right:0;height:46px;z-index:3;background:linear-gradient(180deg,var(--jd),var(--j));border-bottom:2px solid var(--g);box-shadow:0 10px 24px rgba(0,0,0,.4)}
.t9-val:after{content:"";position:absolute;left:0;right:0;top:100%;height:24px;background:radial-gradient(circle at 50% 0,var(--j) 0 18px,var(--g) 19px 21px,transparent 22px) 0 0/44px 24px repeat-x}
.t9-gate-ui{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,1.8vh,18px);text-align:center;padding:60px 20px 20px;transition:opacity .7s ease,transform .9s var(--ease)}
.t9-boot .t9-gate-ui{opacity:1;transform:none}
.t9-open .t9-gate-ui{opacity:0;pointer-events:none;transform:scale(.94)}
.t9-kicker{font:500 10px var(--f-sans);letter-spacing:.44em;color:var(--gx)}
.t9-gate-names{font:400 clamp(44px,12vw,78px)/1.05 var(--f-script);margin:0;padding:0 .1em .1em;filter:drop-shadow(0 4px 14px rgba(0,0,0,.6))}
.t9-gate-date{font:500 11px var(--f-cinzel);letter-spacing:.3em;color:var(--gx)}
.t9-medal{position:relative;width:clamp(118px,30vw,156px);aspect-ratio:1;margin:clamp(6px,2vh,16px) 0;perspective:700px}
.t9-ring{position:absolute;inset:0;border-radius:50%;border:2px solid var(--gl);box-shadow:0 0 14px rgba(var(--g-rgb),.65),inset 0 0 14px rgba(var(--g-rgb),.4);animation:t9-r1 9s linear infinite;pointer-events:none}
.t9-ring:nth-child(2){inset:9%;border-color:var(--jl);box-shadow:0 0 12px rgba(var(--j-rgb),.6);animation:t9-r2 11s linear infinite}
.t9-ring:nth-child(3){inset:-9%;border-color:var(--g);animation:t9-r3 14s linear infinite}
@keyframes t9-r1{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}
@keyframes t9-r2{from{transform:rotateX(0) rotateZ(35deg)}to{transform:rotateX(360deg) rotateZ(35deg)}}
@keyframes t9-r3{from{transform:rotateZ(-50deg) rotateY(0)}to{transform:rotateZ(-50deg) rotateY(360deg)}}
.t9-seal{position:absolute;inset:27%;border:0;border-radius:50%;display:grid;place-content:center;color:#1d1304;background:radial-gradient(circle at 32% 26%,var(--gx),var(--g) 45%,var(--gd) 95%);box-shadow:inset 0 2px 3px rgba(255,255,255,.6),inset 0 -6px 10px rgba(0,0,0,.35),0 0 30px rgba(var(--g-rgb),.8);animation:t9-pulse 2.6s ease-in-out infinite}
.t9-seal b{font:700 clamp(14px,3.8vw,20px)/1 var(--f-deco);letter-spacing:.02em}
.t9-seal.t9-burst{animation:t9-burst .6s ease-in forwards}
@keyframes t9-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes t9-burst{40%{transform:scale(1.4)}100%{transform:scale(0);opacity:0}}
.t9-guest-line{font:italic 500 clamp(17px,2.6vh,21px) var(--f-serif);color:var(--ivory)}
.t9-entry-note{font:500 10px var(--f-sans);letter-spacing:.32em;text-transform:uppercase;color:var(--gx);cursor:pointer;animation:t9-blink 2.4s ease-in-out infinite}
@keyframes t9-blink{50%{opacity:.35}}
/* hero */
.t9-hero{position:relative;min-height:100vh;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:clamp(132px,17vh,172px) 20px clamp(70px,10vh,100px);text-align:center;isolation:isolate}
.t9-hero .t9-lamp{z-index:1}
.t9-hero:after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle 340px at var(--sx,50%) var(--sy,35%),rgba(var(--g-rgb),.16),transparent 70%)}
.t9-mand{position:absolute;left:50%;top:40%;width:min(160vw,1000px);aspect-ratio:1;margin:calc(min(160vw,1000px)/-2) 0 0 calc(min(160vw,1000px)/-2);z-index:0;pointer-events:none;opacity:.3;animation:t9-spin 140s linear infinite}
.t9-mand svg{width:100%;height:100%;display:block}
.t9-hero-in{position:relative;z-index:2;max-width:640px;width:100%}
.t9-invoc{font:500 12px var(--f-cinzel);letter-spacing:.3em;color:var(--gl);margin-bottom:4px}
.t9-stage{--aw:min(58vw,250px);position:relative;width:100%;height:calc(var(--aw)*1.95);margin:clamp(10px,2vh,22px) auto 0;perspective:1100px;perspective-origin:50% 60%}
.t9-scene{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.t9-frame,.t9-photo{position:absolute;bottom:0;left:50%;aspect-ratio:3/4;transform:translateZ(calc(var(--z,0)*1px))}
.t9-frame{width:calc(var(--aw)*var(--w));margin-left:calc(var(--aw)*var(--w)/-2);pointer-events:none;opacity:calc(.95 - var(--k)*.17)}
.t9-photo{width:var(--aw);margin-left:calc(var(--aw)/-2);filter:drop-shadow(0 30px 34px rgba(0,0,0,.6)) drop-shadow(0 0 36px rgba(var(--g-rgb),.28))}
.t9-hero-img{position:absolute;inset:-6% 0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.6s ease;transform:translate3d(0,0,0) scale(1.08);will-change:transform}
.t9-hero-img.t9-on{opacity:1}
.t9-photo .t9-arc-clip:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%);background-size:250% 100%;animation:t9-gloss 6s ease-in-out infinite;pointer-events:none}
@keyframes t9-gloss{0%{background-position:150% 0}60%,100%{background-position:-60% 0}}
.t9-floor{position:absolute;left:50%;bottom:-16px;width:calc(var(--aw)*1.9);height:40px;margin-left:calc(var(--aw)*-.95);background:radial-gradient(ellipse,rgba(var(--g-rgb),.5),transparent 70%);filter:blur(7px);pointer-events:none}
.t9-intro .t9-frame{animation:t9-frame 1.7s var(--ease) both;animation-delay:calc(.2s + var(--k)*.1s)}
.t9-intro .t9-photo{animation:t9-photo 1.4s var(--ease) both}
@keyframes t9-frame{from{opacity:0;transform:translateZ(calc(var(--z)*1px - 420px))}}
@keyframes t9-photo{from{opacity:0;transform:translateZ(260px) scale(.9)}}
.t9-names{margin:clamp(12px,2.2vh,24px) 0 0;font-weight:400}
.t9-n{display:block;font:400 clamp(50px,14vw,100px)/1.08 var(--f-script);padding:0 .1em .08em;filter:drop-shadow(0 6px 18px rgba(var(--g-rgb),.22))}
.t9-amp{display:flex;align-items:center;justify-content:center;gap:14px;font:400 15px var(--f-cinzel);letter-spacing:.3em;color:var(--jl);margin:0}
.t9-amp:before,.t9-amp:after{content:"";height:1px;width:clamp(50px,16vw,90px);background:linear-gradient(90deg,transparent,var(--jl))}
.t9-amp:after{transform:scaleX(-1)}
.t9-hero-copy{max-width:420px;margin:12px auto 0;font:italic 500 17px/1.6 var(--f-serif);color:rgba(247,239,220,.84)}
.t9-datebar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;max-width:430px;margin:clamp(16px,3vh,26px) auto 0}
.t9-datebar>div{font:500 11px var(--f-cinzel);letter-spacing:.28em;text-transform:uppercase;color:var(--gl);border-top:1px solid var(--g);border-bottom:1px solid var(--g);padding:9px 0}
.t9-datebar strong{font:700 clamp(44px,11vw,64px)/1 var(--f-deco)}
.t9-where{font:italic 500 16px var(--f-serif);margin-top:12px;color:rgba(247,239,220,.78)}
.t9-cd{display:none;justify-content:center;gap:10px;margin-top:18px}
.t9-cd.t9-live{display:flex}
.t9-cd div{min-width:64px;padding:10px 6px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:1px solid rgba(var(--g-rgb),.5);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 10px 24px rgba(0,0,0,.4);perspective:300px}
.t9-cd b{display:block;font:500 26px/1.1 var(--f-cinzel);color:var(--gl);font-variant-numeric:tabular-nums}
.t9-cd b.t9-tick{animation:t9-tick .6s var(--ease)}
@keyframes t9-tick{from{transform:rotateX(-90deg);opacity:0}to{transform:none;opacity:1}}
.t9-cd small{font:500 8px var(--f-sans);letter-spacing:.22em;color:var(--jl)}
.t9-cd-done{font:italic 500 17px var(--f-serif);color:var(--gl)}
.t9-pill{display:inline-block;margin-top:16px;padding:8px 20px;border-radius:30px;border:1px solid rgba(var(--j-rgb),.7);background:rgba(var(--j-rgb),.14);font:500 10px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;color:var(--gx)}
.t9-cta{margin-top:clamp(16px,3vh,28px)}
.t9-cue{position:absolute;bottom:18px;left:0;right:0;z-index:2;font:500 9px var(--f-sans);letter-spacing:.3em;color:var(--jl);text-transform:uppercase}
.t9-cue i{display:block;width:1px;height:34px;margin:8px auto 0;background:linear-gradient(var(--g),transparent);transform-origin:top;animation:t9-drip 2s ease-in-out infinite}
@keyframes t9-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.t9-intro .t9-hero-in>*:not(.t9-stage){animation:t9-up 1.2s var(--ease) both;animation-delay:calc(var(--i,0)*.1s)}
@keyframes t9-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
/* marquee */
.t9-marq{position:relative;overflow:hidden;padding:14px 0;margin:34px -12px 0;border-top:1px solid var(--g);border-bottom:1px solid var(--g);background:linear-gradient(90deg,var(--jd),var(--j),var(--jd));transform:rotate(-1.3deg);box-shadow:0 14px 40px rgba(0,0,0,.45)}
.t9-marq-t{display:flex;width:max-content;animation:t9-marq 36s linear infinite}
.t9-marq-t span{white-space:nowrap;padding-right:3em;font:500 13px var(--f-cinzel);letter-spacing:.34em;text-transform:uppercase;color:var(--gx)}
@keyframes t9-marq{to{transform:translateX(-50%)}}
/* quote */
.t9-quote{position:relative;text-align:center;max-width:640px;margin:0 auto}
.t9-quote .t9-mand{top:50%;opacity:.16;width:min(120vw,560px);margin:calc(min(120vw,560px)/-2) 0 0 calc(min(120vw,560px)/-2);animation-duration:200s}
.t9-quote:before{content:"“";position:relative;display:block;font:400 96px/.6 var(--f-script);color:var(--g);height:46px}
.t9-quote p{position:relative;font:italic 500 clamp(21px,4.6vw,30px)/1.6 var(--f-serif);margin:0 0 18px}
.t9-quote small{position:relative;display:block;font:500 11px var(--f-cinzel);letter-spacing:.3em;color:var(--jl);text-transform:uppercase}
.t9-quote .t9-orn{position:relative}
/* story */
.t9-chap{display:grid;gap:26px;align-items:center;justify-items:center;margin-bottom:78px;text-align:center}
.t9-chap:last-child{margin-bottom:0}
.t9-arch{--aw:min(66vw,250px);position:relative;width:var(--aw);aspect-ratio:3/4;filter:drop-shadow(0 26px 30px rgba(0,0,0,.55)) drop-shadow(0 0 30px rgba(var(--g-rgb),.16))}
.t9-arch .t9-arc-clip img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:translate3d(0,0,0) scale(1.18);will-change:transform}
.t9-num{font:700 clamp(60px,15vw,96px)/1 var(--f-deco);color:transparent;-webkit-text-stroke:1px var(--jl);display:block;opacity:.8}
.t9-chap h3{font:400 clamp(38px,8vw,50px)/1.1 var(--f-script);margin:-6px 0 10px;padding-bottom:.08em}
.t9-chap p{max-width:390px;margin:0 auto;color:rgba(247,239,220,.76);font-size:14.5px}
/* date medallion + calendar */
.t9-medal-d{position:relative;width:min(70vw,230px);aspect-ratio:1;margin:0 auto 30px}
.t9-medal-d>svg{position:absolute;inset:0;width:100%;height:100%;animation:t9-spin 40s linear infinite;overflow:visible}
.t9-medal-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.t9-medal-in small{font:500 10px var(--f-cinzel);letter-spacing:.3em;text-transform:uppercase;color:var(--jl)}
.t9-medal-in b{font:700 clamp(54px,16vw,74px)/1.05 var(--f-deco)}
.t9-calwrap{max-width:420px;margin:0 auto}
.t9-calcard{padding:34px 26px 30px;border-radius:26px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.55),0 0 60px rgba(var(--j-rgb),.18)}
.t9-calcard h3{font:700 22px var(--f-deco);letter-spacing:.2em;text-transform:uppercase;margin:0 0 4px}
.t9-calcard small{display:block;font:500 11px var(--f-sans);letter-spacing:.32em;color:var(--jl);margin-bottom:20px}
.t9-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px 0;justify-items:center}
.t9-cal-h{font:500 10px var(--f-sans);letter-spacing:.1em;color:var(--jl);padding-bottom:6px}
.t9-cal-d{position:relative;width:34px;height:34px;display:grid;place-items:center;font:400 14px var(--f-sans);font-variant-numeric:tabular-nums;color:rgba(247,239,220,.84)}
.t9-cal-dot:after{content:"";position:absolute;bottom:2px;width:4px;height:4px;border-radius:50%;background:var(--jl)}
.t9-cal-on{color:#1d1304}
.t9-cal-on b{position:relative;z-index:1;font-weight:600}
.t9-cal-on:before{content:"";position:absolute;inset:-3px;border-radius:50%;background:radial-gradient(circle at 32% 26%,var(--gx),var(--g) 55%,var(--gd));box-shadow:0 0 22px rgba(var(--g-rgb),.8);animation:t9-pulse 2.4s ease-in-out infinite}
.t9-cal-on:after{content:"♥";position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--jl)}
.t9-calcard .t9-btn{margin-top:26px}
/* events: sticky stacked cards */
.t9-stack{position:relative;max-width:760px;margin:0 auto;padding:0 22px 40px}
.t9-evw{position:sticky;top:calc(64px + var(--i)*16px);margin-bottom:30px}
.t9-evw:last-child{margin-bottom:0}
.t9-ev{position:relative;border-radius:24px;overflow:hidden;transform:scale(var(--sc,1));filter:brightness(var(--br,1));transform-origin:50% 0;box-shadow:0 -10px 40px rgba(0,0,0,.4),0 30px 60px rgba(0,0,0,.5)}
.t9-ev:before{content:"";position:absolute;left:12%;right:12%;top:0;height:1px;z-index:3;background:linear-gradient(90deg,transparent,var(--gx),transparent)}
.t9-ev-img{position:relative;height:132px;overflow:hidden}
.t9-ev-img img{width:100%;height:100%;object-fit:cover}
.t9-ev-img:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(var(--bg-rgb),.1) 20%,var(--bg3))}
.t9-ev-day{position:absolute;left:14px;top:14px;z-index:2;padding:5px 12px;border-radius:20px;background:rgba(var(--bg-rgb),.78);border:1px solid rgba(var(--g-rgb),.6);font:500 9.5px var(--f-sans);letter-spacing:.2em;text-transform:uppercase;color:var(--gl)}
.t9-ev-b{position:relative;padding:4px 22px 24px;text-align:center}
.t9-ev-n{position:absolute;right:18px;top:-4px;font:700 54px/1 var(--f-deco);color:transparent;-webkit-text-stroke:1px rgba(var(--g-rgb),.4);pointer-events:none}
.t9-ev-ic{display:inline-grid;place-items:center;width:40px;height:40px;margin-bottom:6px;border-radius:50%;background:var(--bg);border:1px solid var(--g);font-size:18px}
.t9-ev-time{font:700 20px var(--f-deco);letter-spacing:.1em;margin-bottom:4px}
.t9-ev-b h3{font:500 21px/1.2 var(--f-cinzel);letter-spacing:.1em;margin:0;text-transform:uppercase}
.t9-ev-b small{display:block;font:400 13px "Noto Serif Devanagari",serif;color:var(--jl);margin:3px 0 8px}
.t9-ev-meta{font-size:12.5px;color:rgba(247,239,220,.72);margin:8px 0}
.t9-ev-meta b{color:var(--gl);font-weight:500;margin-right:5px}
.t9-ev-b p{font-size:13px;color:rgba(247,239,220,.68);margin:0 0 12px}
.t9-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 8px;border-radius:30px;border:1px solid rgba(var(--j-rgb),.7);font-size:11px;letter-spacing:.04em}
.t9-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.4)}
/* moments */
.t9-masonry{column-count:2;column-gap:12px}
.t9-masonry figure{position:relative;margin:0 0 12px;break-inside:avoid;overflow:hidden;border-radius:18px;cursor:zoom-in;box-shadow:0 16px 34px rgba(0,0,0,.5);border:1px solid rgba(var(--g-rgb),.4)}
.t9-masonry figure:nth-child(3n+1){aspect-ratio:4/5}.t9-masonry figure:nth-child(3n+2){aspect-ratio:1/1}.t9-masonry figure:nth-child(3n){aspect-ratio:3/4}
.t9-masonry img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease)}
.t9-masonry figure:hover img{transform:scale(1.07)}
.t9-lb{position:fixed;inset:0;z-index:960;display:grid;place-items:center;padding:20px;background:rgba(var(--bg-rgb),.95);cursor:zoom-out;animation:t9-fadein .3s ease}
.t9-lb img{max-width:min(94vw,900px);max-height:88vh;border-radius:10px;border:1px solid var(--g);box-shadow:0 30px 80px rgba(0,0,0,.7)}
/* venue */
.t9-venue-grid{display:grid;gap:26px}
.t9-venue-arch{--aw:min(78vw,340px);margin:0 auto}
.t9-vcard{position:relative;overflow:hidden;padding:34px 26px;border-radius:24px;text-align:center;box-shadow:0 26px 60px rgba(0,0,0,.45)}
.t9-vcard .t9-mand{top:50%;opacity:.12;width:420px;margin:-210px 0 0 -210px;animation-duration:180s}
.t9-vcard>*{position:relative}
.t9-vcard>.t9-mand{position:absolute}
.t9-vcard h3{font:700 clamp(20px,5vw,28px)/1.25 var(--f-deco);letter-spacing:.08em;margin:4px 0 10px;text-transform:uppercase}
.t9-vcard p{font-size:14px;color:rgba(247,239,220,.74);margin:0 0 22px}
.t9-vbtns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.t9-chips{display:grid;gap:12px;margin-top:16px}
.t9-chip{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:16px 18px;border-radius:18px;background:rgba(var(--j-rgb),.12);border:1px solid rgba(var(--j-rgb),.4);font-size:13px;color:rgba(247,239,220,.84)}
.t9-chip span{font-size:20px;color:var(--gl)}
.t9-chip p{margin:0}
/* finale: ivory RSVP letter + ring */
.t9-finale{background:radial-gradient(ellipse 70% 40% at 50% 0,rgba(var(--j-rgb),.3),transparent 70%),linear-gradient(180deg,transparent,rgba(0,0,0,.5))}
.t9-rsvp{position:relative;max-width:540px;margin:0 auto;padding:46px 28px 34px;border-radius:26px;color:var(--bg);border:2px solid transparent;background:linear-gradient(var(--ivory),#efe4cc) padding-box,var(--gold) border-box;box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 70px rgba(var(--g-rgb),.2)}
.t9-rsvp:before{content:"";position:absolute;inset:8px;border:1px solid rgba(var(--j-rgb),.35);border-radius:19px;pointer-events:none}
.t9-rsvp h2{text-align:center;font:700 clamp(18px,4.6vw,23px)/1.4 var(--f-deco);letter-spacing:.06em;margin:0 0 10px;text-transform:uppercase}
.t9-rsvp-intro{text-align:center;font-size:13.5px;color:rgba(var(--bg-rgb),.78);margin:0 0 26px}
.t9-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:40px;background:rgba(var(--j-rgb),.1);border:1px solid rgba(var(--j-rgb),.3)}
.t9-seg button{min-height:46px;border:0;border-radius:36px;background:transparent;font:500 10.5px var(--f-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--jd);transition:background .35s,color .35s,box-shadow .35s}
.t9-seg button[aria-pressed="true"]{background:var(--jewel);color:#fff;box-shadow:0 8px 20px rgba(var(--j-rgb),.45)}
.t9-field{position:relative;margin:22px 0}
.t9-field label{display:block;font:500 10px var(--f-sans);letter-spacing:.24em;color:var(--jd);margin-bottom:4px}
.t9-field input,.t9-field textarea{width:100%;display:block;background:transparent;border:0;border-bottom:1px solid rgba(var(--j-rgb),.45);border-radius:0;padding:9px 0 10px;font:inherit;font-size:15px;color:var(--bg);outline:none;-webkit-appearance:none;appearance:none}
.t9-field textarea{resize:none;min-height:60px}
.t9-field input::placeholder,.t9-field textarea::placeholder{color:rgba(var(--bg-rgb),.4)}
.t9-field:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--jewel);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease);pointer-events:none}
.t9-field:focus-within:after{transform:scaleX(1)}
.t9-stepper{display:flex;align-items:center;justify-content:space-between;gap:12px}
.t9-stepper>div{display:flex;align-items:center;gap:6px}
.t9-stepper button{width:40px;height:40px;border-radius:50%;border:1px solid var(--j);background:transparent;color:var(--jd);font-size:20px;line-height:1;transition:background .3s,color .3s}
.t9-stepper button:hover{background:var(--j);color:#fff}
.t9-stepper output{min-width:34px;text-align:center;font:700 22px var(--f-deco);color:var(--bg)}
.t9-send{width:100%;margin-top:10px;min-height:56px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#fff4d6;font:600 11px var(--f-sans);letter-spacing:.22em;text-transform:uppercase;background:var(--jewel);box-shadow:0 14px 30px rgba(var(--j-rgb),.45);transition:transform .35s var(--ease)}
.t9-send:hover{transform:translateY(-3px)}
.t9-send:active{transform:scale(.98)}
.t9-send:after{content:"";position:absolute;top:0;bottom:0;width:34%;left:-50%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);animation:t9-sweep 4s ease-in-out infinite}
@keyframes t9-sweep{0%,55%{transform:skewX(-22deg) translateX(0)}100%{transform:skewX(-22deg) translateX(600%)}}
.t9-status{min-height:20px;margin:14px 0 0;font-size:12px;text-align:center;color:var(--jd)}
.t9-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.t9-contact{display:inline-block;padding:9px 16px;border-radius:30px;border:1px solid rgba(var(--j-rgb),.5);text-decoration:none;font-size:12px;color:var(--jd)}
.t9-end{text-align:center;padding:70px 22px 80px}
.t9-ringwrap{position:relative;width:170px;height:170px;margin:0 auto 20px}
.t9-ringwrap>svg{position:absolute;inset:0;width:100%;height:100%;animation:t9-spin 36s linear infinite;overflow:visible}
.t9-ringwrap>svg.t9-rev{animation-direction:reverse;animation-duration:60s}
.t9-ringwrap b{position:absolute;inset:0;display:grid;place-items:center;font:400 40px var(--f-script);padding-bottom:6px}
.t9-end h3{font:400 clamp(34px,7vw,48px)/1.2 var(--f-script);margin:0 0 8px;padding-bottom:.08em}
.t9-end p{font:500 10px var(--f-sans);letter-spacing:.3em;color:rgba(247,239,220,.62);margin:8px 0 0;text-transform:uppercase}
.t9-end .t9-tag{font:italic 500 18px var(--f-serif);letter-spacing:.02em;text-transform:none;color:var(--gl)}
.t9-music{display:none;position:fixed;z-index:60;right:16px;bottom:16px;width:46px;height:46px;border-radius:50%;border:1px solid var(--g);background:rgba(var(--bg-rgb),.9);color:var(--gl);font-size:17px;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.t9-js .t9-music.t9-has{display:block}
.t9-music[aria-pressed="true"]{background:var(--gold);color:#1d1304}
@media(min-width:820px){
  .t9 section{padding:120px 0}
  .t9-chap{grid-template-columns:1fr 1fr;gap:64px;text-align:left;justify-items:stretch}
  .t9-chap .t9-arch{justify-self:center}
  .t9-chap .t9-chap-txt{max-width:400px}
  .t9-chap:nth-child(even) .t9-arch{order:2}
  .t9-chap:nth-child(even) .t9-chap-txt{justify-self:end}
  .t9-chap p{margin:0}
  .t9-ev{display:grid;grid-template-columns:40% 1fr}
  .t9-ev-img{height:auto;min-height:100%}
  .t9-ev-img:after{background:linear-gradient(90deg,rgba(var(--bg-rgb),.1) 30%,var(--bg3))}
  .t9-ev-b{padding:26px 26px 26px 8px;text-align:left;align-self:center}
  .t9-masonry{column-count:3;column-gap:16px}
  .t9-masonry figure{margin-bottom:16px}
  .t9-venue-grid{grid-template-columns:1fr 1fr;align-items:center;gap:44px}
  .t9-rsvp{padding:54px 48px 42px}
}
@media(max-width:360px){.t9-wrap{padding:0 16px}.t9-cd div{min-width:54px}.t9-cd{gap:6px}}
@media(prefers-reduced-motion:reduce){.t9 *,.t9 *:before,.t9 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t9-js .t9-reveal{opacity:1!important;transform:none!important}.t9-marq-t{animation:none!important}}
@media print{.t9-progress,.t9-gate,.t9-music,.t9-cue,.t9-fx,.t9:before{display:none!important}.t9-js .t9-reveal{opacity:1!important;transform:none!important}.t9-js img.t9-fi{opacity:1!important}.t9-evw{position:static!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
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
  const eventsHtml = sorted.map((e, idx) => {
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
    return `<article class="t9-evw" style="--i:${idx}"><div class="t9-ev t9-foil">
      <div class="t9-ev-img t9-ph"><img class="t9-fi" src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t9-ev-day">${esc(label)}</span></div>
      <div class="t9-ev-b"><span class="t9-ev-n" aria-hidden="true">${pad(idx + 1)}</span><span class="t9-ev-ic" aria-hidden="true">${k.icon}</span>
        <div class="t9-ev-time t9-gt">${t ? esc(t) : '✦'}</div><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}
        ${loc ? `<div class="t9-ev-meta"><b>⌖</b>${esc(loc)}</div>` : ''}
        ${clean(e.description) ? `<p>${esc(e.description)}</p>` : ''}
        ${clean(e.dress_code) ? `<div class="t9-dress"><span class="t9-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
      </div></div></article>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';

  /* marquee + footer ring text */
  const mqItems = [`${rawFirst} & ${rawSecond}`, day ? shortDate(day) : '', clean(w.city) || clean(w.venue), clean(w.hashtag) ? (clean(w.hashtag).startsWith('#') ? clean(w.hashtag) : '#' + clean(w.hashtag)) : ''].filter(Boolean);
  const mqText = esc(mqItems.join(' ✦ ') + ' ✦ ').repeat(4);
  const ringStr = `WITH LOVE & BLESSINGS ✦ ${rawFirst} & ${rawSecond} ✦ ${day ? shortDate(day) : ''} ✦ `.toUpperCase();
  const ringFs = Math.max(5.5, Math.min(9.5, 470 / (ringStr.length * .8))).toFixed(1);

  const frames = [4, 3, 2, 1].map(k => `<div class="t9-frame" style="--k:${k};--z:${-70 * k};--w:${(1 + .16 * k).toFixed(2)}">${OUTLINE(k % 2 ? 1.2 : 1.8, k % 2 ? 'rgba(var(--j-rgb),.06)' : 'rgba(var(--g-rgb),.04)')}</div>`).join('');

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet" data-t9-fonts>
<style>${STYLE}</style>
<noscript><style>.t9-gate{display:none!important}.t9.t9-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t9-reveal{opacity:1!important;transform:none!important}.t9 img.t9-fi{opacity:1!important}.t9-hero-img{opacity:1}</style></noscript>
<div class="t9 t9-js t9-locked t9-boot" style="${themeVars(w)}" data-when="${esc(String(whenTs ?? parseWhen(w.date, '', offset) ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${safeUrl(w.music_url)}" data-hero-imgs="${esc(JSON.stringify(heroList))}" data-names="${esc(`${rawGroom} & ${rawBride}`)}" data-venue="${esc(clean(w.venue))}">
  ${DEFS}
  <div class="t9-progress" aria-hidden="true"></div>

  <div class="t9-gate" role="dialog" aria-label="Wedding invitation curtains">
    <div class="t9-sun" aria-hidden="true"></div>
    <div class="t9-cur t9-cur-l" aria-hidden="true"></div>
    <div class="t9-cur t9-cur-r" aria-hidden="true"></div>
    <div class="t9-val" aria-hidden="true"></div>
    ${lamp(8, 120, 6.2)}${lamp(88, 170, 7.4, -2)}${lamp(26, 80, 5.6, -1)}${lamp(70, 100, 6.8, -3.5)}
    <div class="t9-gate-ui">
      <div class="t9-kicker">YOU ARE INVITED</div>
      <h2 class="t9-gate-names t9-gt">${first} &amp; ${second}</h2>
      <div class="t9-gate-date">${esc(day ? longDate(day) : city)}</div>
      <div class="t9-medal"><i class="t9-ring"></i><i class="t9-ring"></i><i class="t9-ring"></i>
        <button class="t9-seal" type="button" data-open aria-label="Open wedding invitation"><b>${esc(rawFirst.charAt(0).toUpperCase())}${esc(rawSecond.charAt(0).toUpperCase())}</b></button></div>
      <div class="t9-guest-line">Dear ${guestLine}</div>
      <div class="t9-entry-note">Tap the seal to part the curtains</div>
    </div>
  </div>

  <main>
    <header class="t9-hero" data-hero>
      <div class="t9-mand" aria-hidden="true">${mandala}</div>
      ${lamp(6, 100, 6.5)}${lamp(86, 130, 7.5, -2)}${lamp(21, 70, 5.8, -1)}${lamp(72, 90, 6.9, -3)}
      <div class="t9-hero-in">
        <div class="t9-invoc" style="--i:0">${invocation}</div>
        <div class="t9-eyebrow" style="--i:1">Together with their families</div>
        <div class="t9-stage" data-stage>
          <div class="t9-scene" data-scene>
            ${frames}
            <div class="t9-photo" style="--z:0">
              <div class="t9-arc-clip t9-ph"><i class="t9-hero-img"></i></div>${OUTLINE(4)}
            </div>
          </div>
          <i class="t9-floor" aria-hidden="true"></i>
        </div>
        <h1 class="t9-names" style="--i:3"><span class="t9-n t9-gt">${first}</span><span class="t9-amp">&amp;</span><span class="t9-n t9-gt">${second}</span></h1>
        <p class="t9-hero-copy" style="--i:4">${inviteText}</p>
        <div class="t9-datebar" style="--i:5" aria-label="Wedding date">
          <div>${esc(dayName || 'Save the date')}</div>
          <strong class="t9-gt">${day ? pad(day.d) : '--'}</strong>
          <div>${day ? esc(MONTHS[day.mo - 1].slice(0, 3)) + ' ' + day.y : 'TBA'}</div>
        </div>
        <p class="t9-where" style="--i:6">${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</p>
        <div class="t9-cd" style="--i:6" role="timer"><div><b data-u="d">--</b><small>DAYS</small></div><div><b data-u="h">--</b><small>HRS</small></div><div><b data-u="m">--</b><small>MIN</small></div><div><b data-u="s">--</b><small>SEC</small></div></div>
        <div class="t9-pill" style="--i:7">Invited: ${guestLine}</div><br>
        <div class="t9-cta" style="--i:8"><a href="#" data-goto="story" class="t9-btn">Discover our story <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="t9-cue" aria-hidden="true">Scroll<i></i></div>
    </header>

    <div class="t9-marq" aria-hidden="true"><div class="t9-marq-t"><span>${mqText}</span><span>${mqText}</span></div></div>

    <section data-sec="story">
      <div class="t9-wrap">
        <div class="t9-quote t9-reveal"><div class="t9-mand" aria-hidden="true">${mandala}</div><p>${poem}</p>${families ? `<small>${esc(families)}</small>` : ''}<div class="t9-orn"><span>✦</span></div></div>
      </div>
      <div class="t9-wrap" style="margin-top:84px">
        ${story.map((s, i) => `<article class="t9-chap t9-reveal">
          <div class="t9-arch" data-tilt="8"><div class="t9-arc-clip t9-ph"><img class="t9-fi" data-par src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div>${OUTLINE(3)}</div>
          <div class="t9-chap-txt"><span class="t9-num" aria-hidden="true">${pad(i + 1)}</span><h3 class="t9-gt">${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}
      </div>
    </section>

    ${day ? `<section style="padding-top:20px">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-eyebrow">Mark your calendar</div><h2 class="t9-gt">Save the Date</h2><div class="t9-orn"><span>✦</span></div></div>
        <div class="t9-medal-d t9-reveal">
          <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false"><defs><path id="t9-ring-p" d="M110 110m-88 0a88 88 0 1 1 176 0a88 88 0 1 1 -176 0"/></defs>
            <circle cx="110" cy="110" r="106" fill="none" style="stroke:url(#t9-gold)" stroke-width=".8"/><circle cx="110" cy="110" r="70" fill="none" style="stroke:url(#t9-gold)" stroke-width=".6" stroke-dasharray="2 4"/>
            <text style="fill:url(#t9-gold);font:500 10.5px Cinzel,serif"><textPath href="#t9-ring-p" textLength="546" lengthAdjust="spacing">SAVE THE DATE ✦ SAVE THE DATE ✦ SAVE THE DATE ✦ </textPath></text></svg>
          <div class="t9-medal-in"><small>${esc(dayName.slice(0, 3))}</small><b class="t9-gt">${pad(day.d)}</b><small>${esc(MONTHS[day.mo - 1].slice(0, 3))} ${day.y}</small></div>
        </div>
        <div class="t9-calwrap t9-reveal"><div class="t9-calcard t9-foil t9-shine" data-tilt="7">
          <h3 class="t9-gt">${esc(MONTHS[day.mo - 1])}</h3><small>${day.y}</small>
          ${calendarHtml(day, evs.map(e => e.event_date))}
          <p style="margin:22px 0 0;font:italic 500 17px var(--f-serif)">${esc(dayName)}${timeText ? `, ${esc(timeText)}` : ''}</p>
          ${calUrl ? `<a class="t9-btn" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Add to calendar</a>` : ''}
        </div></div>
      </div>
    </section>` : ''}

    ${sorted.length ? `<section style="padding-bottom:60px">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-eyebrow">The festivities</div><h2 class="t9-gt">Celebrations</h2>
          <p>Traditions, laughter, music and memories. Keep scrolling as each celebration unfolds.</p><div class="t9-orn"><span>✦</span></div></div>
      </div>
      <div class="t9-stack" data-stack>${eventsHtml}</div>
    </section>` : ''}

    ${gallery.length ? `<section style="padding-top:20px">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-eyebrow">Glimpses of us</div><h2 class="t9-gt">Moments</h2><div class="t9-orn"><span>✦</span></div></div>
        <div class="t9-masonry">${gallery.map((g, i) => `<figure class="t9-ph t9-reveal" data-lb="${esc(g)}"><img class="t9-fi" src="${esc(g)}" alt="Moment ${i + 1}" loading="lazy" decoding="async"></figure>`).join('')}</div>
      </div>
    </section>` : ''}

    <section>
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-eyebrow">Join us</div><h2 class="t9-gt">The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <div class="t9-venue-grid">
          <div class="t9-reveal"><div class="t9-arch t9-venue-arch" data-tilt="8"><div class="t9-arc-clip t9-ph"><img class="t9-fi" data-par src="${esc(venueImg)}" data-fallback="${esc(U('1519741497674-611481863552', 1200))}" alt="${venue}" loading="lazy" decoding="async"></div>${OUTLINE(3)}</div></div>
          <div class="t9-reveal">
            <div class="t9-vcard t9-foil t9-shine" data-tilt="6">
              <div class="t9-mand" aria-hidden="true">${mandala}</div>
              <div class="t9-eyebrow">The wedding destination</div>
              <h3 class="t9-gt">${venue}</h3>
              <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
              <div class="t9-vbtns">
                ${mapUrl ? `<a class="t9-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">⌖ &nbsp;Directions</a>` : ''}
                ${calUrl ? `<a class="t9-btn t9-ghost" href="${calUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Calendar</a>` : ''}
              </div>
            </div>
            ${travel.length ? `<div class="t9-chips">${travel.map(([i, t]) => `<div class="t9-chip"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="t9-finale">
      <section style="padding-bottom:40px">
        <div class="t9-wrap">
          <div class="t9-head t9-reveal"><div class="t9-eyebrow">Your presence is our present</div><h2 class="t9-gt">Kindly RSVP</h2></div>
          <form class="t9-rsvp t9-reveal" data-rsvp novalidate>
            <h2 class="t9-jt">Will you grace us<br>with your presence?</h2>
            <p class="t9-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
            ${canRsvp ? `
            <div class="t9-seg" role="group" aria-label="Attendance"><button type="button" data-att="Joyfully accepts" aria-pressed="false">Joyfully accepts</button><button type="button" data-att="Regretfully declines" aria-pressed="false">Regretfully declines</button></div>
            <div class="t9-field"><label for="t9-name">YOUR NAME</label><input id="t9-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
            <div class="t9-field t9-stepper" data-guests><label style="margin:0">NUMBER OF GUESTS</label><div><button type="button" data-step="-1" aria-label="Fewer guests">−</button><output data-count aria-live="polite">${guest?.with_family ? 2 : 1}</output><button type="button" data-step="1" aria-label="More guests">+</button></div></div>
            <div class="t9-field"><label for="t9-note">A NOTE FOR THE COUPLE (OPTIONAL)</label><textarea id="t9-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
            <button class="t9-send" type="submit">Send reply via WhatsApp &nbsp;↗</button>
            <p class="t9-status" role="status" aria-live="polite"></p>` : ''}
            ${contacts.length ? `<div class="t9-contacts">${contacts.map(c => `<a class="t9-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
          </form>
        </div>
      </section>
      <footer class="t9-end">
        <div class="t9-ringwrap t9-reveal" aria-hidden="true">
          <svg viewBox="0 0 200 200" focusable="false"><defs><path id="t9-foot-p" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1 -160 0"/></defs>
            <text style="fill:url(#t9-gold);font:500 ${ringFs}px Cinzel,serif"><textPath href="#t9-foot-p" textLength="498" lengthAdjust="spacing">${esc(ringStr)}</textPath></text></svg>
          <svg class="t9-rev" viewBox="0 0 200 200" focusable="false"><circle cx="100" cy="100" r="66" fill="none" style="stroke:url(#t9-gold)" stroke-width=".8" stroke-dasharray="1.5 5"/><circle cx="100" cy="100" r="92" fill="none" style="stroke:url(#t9-gold)" stroke-width=".6"/></svg>
          <b class="t9-gt">${monoInit}</b>
        </div>
        <h3 class="t9-gt t9-reveal">With love &amp; gratitude</h3>
        ${hashtag ? `<p class="t9-tag">${hashtag.startsWith('#') ? hashtag : '#' + hashtag}</p>` : ''}
        <p>${signature}</p>
        <p style="margin-top:14px">${esc(dateNums)}${city ? ` &nbsp;|&nbsp; ${city}` : ''}</p>
      </footer>
    </div>
  </main>

  <button class="t9-music" type="button" aria-label="Toggle music" aria-pressed="false">♫</button>
</div>`;
}

/* ---------- mount ---------- */
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
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const undo = [];
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  let dead = false;

  /* scroll lock while the curtains are closed */
  const html = doc.documentElement, body = doc.body;
  let locked = false;
  const lock = () => {
    if (locked) return;
    locked = true;
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  };
  const unlock = () => {
    if (!locked) return;
    locked = false;
    html.style.overflow = '';
    body.style.overflow = '';
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
  };
  host.classList.add('t9-js');
  host.classList.remove('t9-boot');
  lock();

  /* boot: show curtain UI once fonts are ready */
  (() => {
    const f = doc.fonts;
    const ready = (!f || typeof f.load !== 'function') ? Promise.resolve()
      : Promise.all([f.load('40px "Great Vibes"'), f.load('700 20px "Cinzel Decorative"'), f.load('500 14px Cinzel'), f.load('300 15px Jost'), f.load('italic 500 16px "Cormorant Garamond"')]).catch(() => {});
    Promise.race([ready, new Promise(r => later(r, 1600))]).then(() => { if (!dead) win.requestAnimationFrame(() => host.classList.remove('t9-boot')); });
  })();

  /* hero image: one candidate at a time */
  const heroImgEl = $('.t9-hero-img');
  let heroList = [];
  try { heroList = JSON.parse(host.dataset.heroImgs || '[]'); } catch { heroList = []; }
  const tryHero = i => {
    if (dead || !heroImgEl || i >= heroList.length) return;
    const im = new Image();
    im.onload = () => {
      if (dead) return;
      const show = () => { heroImgEl.style.backgroundImage = `url("${heroList[i]}")`; win.requestAnimationFrame(() => heroImgEl.classList.add('t9-on')); };
      (typeof im.decode === 'function' ? im.decode().catch(() => {}) : Promise.resolve()).then(show);
    };
    im.onerror = () => tryHero(i + 1);
    im.src = heroList[i];
  };
  tryHero(0);

  /* images: fade in, one fallback */
  $$('img').forEach(img => {
    const ok = () => img.classList.add('t9-loaded');
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t9-failed');
    };
    on(img, 'load', ok); on(img, 'error', fail);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else if (img.currentSrc) fail(); }
  });
  later(() => $$('img.t9-fi').forEach(i => i.classList.add('t9-loaded')), 5000);

  /* canvas: embers, drifting petals, sparks, petal shower */
  const cv = doc.createElement('canvas');
  cv.className = 't9-fx'; cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);
  const ctx = cv.getContext && cv.getContext('2d');
  const cs = win.getComputedStyle(host);
  const GOLD = cs.getPropertyValue('--gl').trim() || '#f1d98a';
  const JEWEL = cs.getPropertyValue('--jl').trim() || '#e58aaa';
  const IVORY = '#f7efdc';
  let W = 0, H = 0, raf = 0;
  const P = [];
  const fit = () => {
    const dpr = Math.min(2, win.devicePixelRatio || 1);
    W = win.innerWidth || 800; H = win.innerHeight || 600;
    cv.width = W * dpr; cv.height = H * dpr;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit(); on(win, 'resize', fit);
  const ember = () => ({ k: 'e', x: rand(0, W), y: rand(0, H), vx: rand(-.15, .15), vy: -rand(.15, .6), r: rand(.7, 2.2), a: rand(0, 6.28), sp: rand(.02, .05), c: Math.random() < .8 ? GOLD : IVORY });
  const petal = (x, y, shower) => ({ k: 'p', x, y, vx: rand(-.4, .4), vy: shower ? rand(1.2, 3.2) : rand(.35, .9), w: rand(5, 10), h: rand(9, 15), rot: rand(0, 6.28), vr: rand(-.04, .04), ph: rand(0, 6.28), sw: rand(.01, .03), c: Math.random() < .55 ? JEWEL : GOLD, al: rand(.55, .9), once: shower });
  const sparkle = (x, y, r) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 4); ctx.quadraticCurveTo(x, y, x + r * 4, y); ctx.quadraticCurveTo(x, y, x, y + r * 4); ctx.quadraticCurveTo(x, y, x - r * 4, y); ctx.quadraticCurveTo(x, y, x, y - r * 4);
    ctx.fill();
  };
  const burst = (x, y, n = 90) => {
    if (reduce || !ctx) return;
    for (let i = 0; i < n; i++) {
      const ang = rand(0, 6.28), sp = rand(1.5, 9);
      P.push({ k: 's', x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, r: rand(.8, 2.6), life: rand(50, 110), c: Math.random() < .75 ? GOLD : IVORY, star: Math.random() < .3 });
    }
  };
  const shower = n => {
    if (reduce || !ctx) return;
    for (let i = 0; i < n; i++) P.push(petal(rand(0, W), -rand(10, H * .6), true));
  };
  /* hero 3D camera state */
  const scene = $('[data-scene]');
  const hero = $('[data-hero]');
  const cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
  let pz = 0;

  if (ctx && !reduce) {
    const ne = W < 600 ? 30 : 56, np = W < 600 ? 7 : 12;
    for (let i = 0; i < ne; i++) P.push(ember());
    for (let i = 0; i < np; i++) P.push(petal(rand(0, W), rand(0, H), false));
    const frame = () => {
      if (dead) return;
      ctx.clearRect(0, 0, W, H);
      if (!doc.hidden) {
        for (let i = P.length - 1; i >= 0; i--) {
          const p = P[i];
          p.x += p.vx; p.y += p.vy;
          if (p.k === 's') {
            p.vx *= .96; p.vy = p.vy * .96 + .06; p.life--;
            if (p.life <= 0) { P.splice(i, 1); continue; }
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.min(1, p.life / 50); ctx.fillStyle = p.c;
            if (p.star) sparkle(p.x, p.y, p.r); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
            ctx.globalCompositeOperation = 'source-over';
          } else if (p.k === 'e') {
            p.a += p.sp;
            if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
            if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = .15 + .6 * Math.abs(Math.sin(p.a)); ctx.fillStyle = p.c;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
          } else {
            p.ph += p.sw * 6; p.rot += p.vr; p.x += Math.sin(p.ph) * .6;
            if (p.y > H + 24) {
              if (p.once) { P.splice(i, 1); continue; }
              p.y = -20; p.x = rand(0, W);
            }
            ctx.save();
            ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, .55 + .45 * Math.abs(Math.cos(p.ph)));
            ctx.globalAlpha = p.al; ctx.fillStyle = p.c;
            ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, 6.283); ctx.fill();
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;
      }
      /* smooth 3D camera for the arch tunnel */
      if (scene && !locked) {
        cur.x += (tgt.x - cur.x) * .07; cur.y += (tgt.y - cur.y) * .07;
        scene.style.transform = `translate3d(0,0,${pz.toFixed(1)}px) rotateX(${cur.y.toFixed(2)}deg) rotateY(${cur.x.toFixed(2)}deg)`;
      }
      raf = win.requestAnimationFrame(frame);
    };
    raf = win.requestAnimationFrame(frame);
  }

  /* pointer: camera + spotlight + card tilt; gyro on mobile */
  on(host, 'pointermove', e => {
    if (reduce || locked) return;
    tgt.x = ((e.clientX / (W || 1)) - .5) * 2 * 11;
    tgt.y = -((e.clientY / (H || 1)) - .5) * 2 * 7;
    if (hero) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < H) { hero.style.setProperty('--sx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }
    }
  });
  if (!reduce) {
    on(win, 'deviceorientation', e => {
      if (e.gamma == null || e.beta == null || locked) return;
      tgt.x = clamp(e.gamma * .45, -12, 12);
      tgt.y = clamp((e.beta - 45) * .25, -8, 8);
    });
  }
  $$('[data-tilt]').forEach(el => {
    const max = Number(el.dataset.tilt) || 8;
    on(el, 'pointermove', e => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      el.style.transform = `perspective(900px) rotateX(${((.5 - py) * max).toFixed(2)}deg) rotateY(${((px - .5) * max).toFixed(2)}deg)`;
    });
    on(el, 'pointerleave', () => { el.style.transform = ''; });
  });

  /* curtain open sequence */
  const gate = $('.t9-gate'), seal = $('[data-open]'), note = $('.t9-entry-note');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (seal) {
      const r = seal.getBoundingClientRect();
      seal.classList.add('t9-burst');
      burst(r.left + r.width / 2, r.top + r.height / 2, 110);
    }
    if (gate) gate.classList.add('t9-open');
    later(() => shower(W < 600 ? 40 : 70), 500);
    later(() => burst(W / 2, H * .45, 70), 1100);
    later(() => { if (hero) hero.classList.add('t9-intro'); }, 1500);
    later(() => { if (gate) gate.classList.add('t9-leaving'); }, 1800);
    later(() => {
      if (gate) gate.remove();
      host.classList.remove('t9-locked');
      unlock(); onScroll();
    }, 2700);
  };
  on(seal, 'click', open);
  on(note, 'click', open);

  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    $(`[data-sec="${a.dataset.goto}"]`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* scroll: progress, camera push, parallax, stacked cards */
  const bar = $('.t9-progress');
  const parImgs = $$('[data-par]');
  const stackCards = $$('.t9-evw');
  let tick = false;
  function onScroll() {
    if (tick || locked) return; tick = true;
    win.requestAnimationFrame(() => {
      tick = false;
      const scY = win.scrollY ?? html.scrollTop ?? 0;
      const vh = win.innerHeight || html.clientHeight || 800;
      const max = (html.scrollHeight || body.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scY / max) : 0})`;
      if (hero && !reduce) {
        const top = hero.getBoundingClientRect().top;
        pz = top < 0 ? clamp(-top / vh, 0, 1) * 150 : 0;
        if (heroImgEl) {
          if (top < 0 && -top < vh * 1.3) heroImgEl.style.transform = `translate3d(0,${-top * .1}px,0) scale(1.08)`;
          else if (top >= 0) heroImgEl.style.transform = '';
        }
      }
      if (!reduce) {
        parImgs.forEach(im => {
          const r = im.parentElement.getBoundingClientRect();
          if (r.bottom < -40 || r.top > vh + 40) return;
          const d = (r.top + r.height / 2 - vh / 2) / vh;
          im.style.transform = `translate3d(0,${(-d * 30).toFixed(1)}px,0) scale(1.18)`;
        });
        stackCards.forEach((w, i) => {
          const card = w.firstElementChild, nxt = stackCards[i + 1];
          if (!card) return;
          if (!nxt) { card.style.setProperty('--sc', '1'); card.style.setProperty('--br', '1'); return; }
          const stick = 64 + (i + 1) * 16;
          const h = w.offsetHeight || 300;
          const p = clamp(1 - (nxt.getBoundingClientRect().top - stick) / (h * .9), 0, 1);
          card.style.setProperty('--sc', (1 - p * .05).toFixed(3));
          card.style.setProperty('--br', (1 - p * .38).toFixed(3));
        });
      }
    });
  }
  on(win, 'scroll', onScroll, { passive: true });
  on(win, 'resize', onScroll);

  /* reveals */
  const clearDelay = el => later(() => { el.style.transitionDelay = ''; }, 1400);
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t9-in'); clearDelay(e.target); io.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.t9-reveal').forEach(el => io.observe(el));
    undo.push(() => io.disconnect());
  } else $$('.t9-reveal').forEach(el => el.classList.add('t9-in'));

  /* countdown */
  const when = Number(host.dataset.when);
  const cdBox = $('.t9-cd');
  if (when && cdBox) {
    const set = (k, v) => {
      const el = $(`[data-u="${k}"]`, cdBox); if (!el) return;
      const t = pad(v);
      if (el.textContent !== t) { el.textContent = t; if (!reduce) { el.classList.remove('t9-tick'); void el.offsetWidth; el.classList.add('t9-tick'); } }
    };
    let id;
    const step = () => {
      const left = when - Date.now();
      if (left <= 0) { cdBox.innerHTML = '<span class="t9-cd-done">The celebration has begun ✦</span>'; clearInterval(id); return; }
      const s = Math.floor(left / 1000);
      set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
    };
    cdBox.classList.add('t9-live'); step();
    id = setInterval(step, 1000); timers.push(id);
  }

  /* lightbox */
  const closeLb = () => { $('.t9-lb')?.remove(); };
  $$('[data-lb]').forEach(f => on(f, 'click', () => {
    const src = f.dataset.lb; if (!src) return;
    closeLb();
    const lb = doc.createElement('div'); lb.className = 't9-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
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
      const status = $('.t9-status', form);
      if (!name || !att) { status.textContent = 'Please add your name and choose whether you can join.'; return; }
      const names = host.dataset.names || '';
      const dateTxt = $('.t9-datebar', host)?.textContent.replace(/\s+/g, ' ').trim() || '';
      const msg = [`Wedding RSVP — ${names}`, `Name: ${name}`, `Response: ${att}`, att !== 'Regretfully declines' && `Guests: ${count}`, nt && `Note: ${nt}`, dateTxt && `Wedding date: ${dateTxt}`, host.dataset.venue && `Venue: ${host.dataset.venue}`].filter(Boolean).join('\n');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      status.textContent = 'Thank you! Your WhatsApp reply is opening in a new tab.';
      shower(40); burst(W / 2, H / 2, 60);
    });
  }

  /* optional music */
  const musicBtn = $('.t9-music'), musicUrl = host.dataset.music;
  if (musicBtn && musicUrl) {
    const audio = new Audio(musicUrl); audio.loop = true; audio.preload = 'none';
    musicBtn.classList.add('t9-has');
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
    host.classList.remove('t9-js', 't9-locked');
    delete host._t9Cleanup;
  };
  host._t9Cleanup = cleanup;
  return cleanup;
}
