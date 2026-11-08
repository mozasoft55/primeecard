/* ==========================================================================
   Template 09 — "Celestial Palace" · Royal 3D Wedding Invitation
   Palette: Midnight Plum · Burgundy Wine · Antique Rose-Gold · Moonstone
   Same contract as your other templates:
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a readable static invitation (no JS needed).
   mount() adds: 3D palace doors, tilt-parallax hero, flip countdown,
   3D date-unveil card, scroll reveals, tilt event cards, WhatsApp RSVP.
   Wedding / events / guest fields: identical to your earlier templates.
   ========================================================================== */

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
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&family=Jost:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600&display=swap';

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

/* ---------- imagery ---------- */

const T09_THEMES = {
  maroon: { plum: '#190408', wine: '#4a0816', rose: '#e5b66d', rose2: '#c99242', champ: '#faedd2', moon: '#ffd4a8', pearl: '#fffaf4', line: 'rgba(229,182,109,.34)', bg: 'radial-gradient(ellipse 90% 45% at 50% 0,#5c0c1e 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(201,146,66,.14),transparent 70%),linear-gradient(180deg,#1f050b 0,#100206 55%,#080103 100%)' },
  royal: { plum: '#190408', wine: '#4a0816', rose: '#e5b66d', rose2: '#c99242', champ: '#faedd2', moon: '#ffd4a8', pearl: '#fffaf4', line: 'rgba(229,182,109,.34)', bg: 'radial-gradient(ellipse 90% 45% at 50% 0,#5c0c1e 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(201,146,66,.14),transparent 70%),linear-gradient(180deg,#1f050b 0,#100206 55%,#080103 100%)' },
  emerald: { plum: '#021610', wine: '#073324', rose: '#dfba61', rose2: '#b8933b', champ: '#f5edd4', moon: '#a8e6d0', pearl: '#f9fdfa', line: 'rgba(223,186,97,.34)', bg: 'radial-gradient(ellipse 90% 45% at 50% 0,#0b4a34 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(184,147,59,.14),transparent 70%),linear-gradient(180deg,#041e15 0,#02120c 55%,#010906 100%)' },
  navy: { plum: '#040b1e', wine: '#0d1d44', rose: '#e0b95e', rose2: '#b8923a', champ: '#f5edd6', moon: '#a0c2f8', pearl: '#f8faff', line: 'rgba(224,185,94,.34)', bg: 'radial-gradient(ellipse 90% 45% at 50% 0,#13285c 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(184,146,58,.14),transparent 70%),linear-gradient(180deg,#06112c 0,#030a1c 55%,#01050f 100%)' },
  rose: { plum: '#14051a', wine: '#3d0a2c', rose: '#e8b58f', rose2: '#c7875e', champ: '#f7e7d0', moon: '#c8b8f0', pearl: '#fff7f2', line: 'rgba(232,181,143,.34)', bg: 'radial-gradient(ellipse 90% 45% at 50% 0,#4d1038 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(199,135,94,.14),transparent 70%),linear-gradient(180deg,#190621 0,#0c0310 55%,#060108 100%)' }
};

const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const KINDS = [
  { re: /haldi|ubtan|pithi|gaye\s*holud/i, icon: '🌼', src: './assets/haldi.jpg', img: '1606216794074-735e91aa2c92', alt: '1599661046827-dacff0c0f09a', dress: '#f4c542' },
  { re: /mehendi|mehndi|henna/i, icon: '🌿', src: './assets/mehendi.jpg', img: '1583939003579-730e3918a45a', alt: '1465495976277-4387d4b0b4c6', dress: '#3f8f6b' },
  { re: /sangeet|cocktail|music|garba|dandiya/i, icon: '🎶', img: '1469371670807-013ccf25f16a', alt: '1511795409834-ef04bbd61622', dress: '#8b5cf6' },
  { re: /baraat|barat|procession/i, icon: '🐎', src: './assets/baraat.jpg', img: '1519167758481-83f550bb49b3', alt: '1606216794074-735e91aa2c92', dress: '#e88aab' },
  { re: /jaimala|varmala|engagement|sagai|tilak|ring/i, icon: '💐', img: '1519225421980-715cb0215aed', alt: '1465495976277-4387d4b0b4c6', dress: '#e3b5a0' },
  { re: /phere|pheras|nikah|wedding|vivah|shaadi|biye|ceremony|saptapadi/i, icon: '🔥', src: './assets/phere.jpg', img: '1465495976277-4387d4b0b4c6', alt: '1519741497674-611481863552', dress: '#9b1d3f' },
  { re: /reception|walima|dinner|aashirbaad|aashirvad|blessing/i, icon: '✨', src: './assets/reception.jpg', img: '1511795409834-ef04bbd61622', alt: '1469371670807-013ccf25f16a', dress: '#d9c3ff' }
];
const DEFAULT_KIND = { icon: '✦', img: '1519741497674-611481863552', alt: '1522413452208-996ff3f3e740', dress: '#e3b5a0' };
const kindOf = name => KINDS.find(k => k.re.test(name)) || DEFAULT_KIND;

const DEFAULT_STORY = [
  { title: 'How We Met', text: 'One unexpected hello became a thousand conversations, shared dreams, and a friendship that felt like home.', image: U('1529636798458-92182e662485', 700), alt: U('1519741497674-611481863552', 700) },
  { title: 'The Proposal', text: 'With happy tears and hearts full of hope, we chose each other and all the beautiful tomorrows to come.', image: U('1519741497674-611481863552', 700), alt: U('1522413452208-996ff3f3e740', 700) },
  { title: 'The Big Day', text: 'Surrounded by the people we love, we cannot wait to celebrate the beginning of our forever with you.', image: U('1520854221256-17451cc331bf', 700), alt: U('1606216794074-735e91aa2c92', 700) }
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

/* ---------- styles (scoped under .t9) ---------- */
const STYLE = `
html{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
body{overflow:visible!important;margin:0;padding:0;overscroll-behavior:contain}
.t9,.t9 *,.t9 *:before,.t9 *:after{box-sizing:border-box}
.t9{--plum:#12061c;--wine:#3d0a26;--rose:#e8b9a0;--rose2:#c98a73;--champ:#f7e6c8;--moon:#b9c3ff;--pearl:#fff8ef;--line:rgba(232,185,160,.34);--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;color:var(--pearl);font:300 15px/1.7 Jost,system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 90% 45% at 50% 0,#4a1238 0,transparent 70%),radial-gradient(ellipse 60% 30% at 90% 60%,rgba(120,110,230,.14),transparent 70%),linear-gradient(180deg,#1a0a2a 0,#0d0416 55%,#07020d 100%)}
.t9.t9-locked{height:100vh!important;height:100dvh!important;max-height:100vh!important;overflow:hidden!important}
.t9 h1,.t9 h2,.t9 h3,.t9 p,.t9 figure{margin-top:0}
.t9 img{display:block;max-width:100%}
.t9 button{font:inherit;color:inherit;cursor:pointer}
.t9 a{color:inherit}
.t9 :focus-visible{outline:2px solid var(--rose);outline-offset:3px}
.t9-progress{position:fixed;top:0;left:0;height:2px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--rose2),var(--champ),var(--moon));box-shadow:0 0 12px rgba(232,185,160,.8)}
.t9-rg{background:linear-gradient(110deg,#c98a73 0%,#ffe9d6 24%,#e8b9a0 46%,#fff6e8 60%,#c98a73 80%,#f3cdb5 100%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t9-shim 7s linear infinite}
@keyframes t9-shim{0%{background-position:-220% center}100%{background-position:220% center}}
.t9-wrap{position:relative;width:100%;max-width:1100px;margin:0 auto;padding:0 22px}
.t9 section{position:relative;padding:96px 0}
.t9-lab{font:400 11px Marcellus,serif;letter-spacing:.3em;text-transform:uppercase;color:var(--rose);margin-bottom:10px}
.t9-head{text-align:center;margin-bottom:54px}
.t9-head h2{font:400 clamp(30px,6.4vw,50px)/1.15 "Cormorant Garamond",serif;font-style:italic;letter-spacing:.02em;margin:0 0 14px}
.t9-head p{max-width:440px;margin:0 auto;color:#d9cfe3;font-size:14px}
.t9-orn{display:flex;align-items:center;justify-content:center;gap:14px;color:var(--rose);margin:22px auto 0}
.t9-orn:before,.t9-orn:after{content:"";height:1px;width:64px;background:linear-gradient(90deg,transparent,var(--rose))}
.t9-orn:after{transform:scaleX(-1)}
.t9-glass{position:relative;background:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.03));border:1px solid var(--line);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 24px 60px rgba(0,0,0,.4)}
.t9-ph{background:radial-gradient(circle at 30% 20%,rgba(232,185,160,.22),transparent 55%),linear-gradient(135deg,#3d0a26,#12061c)}
.t9 img.t9-failed{opacity:0}
.t9-reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t9-reveal.t9-in{opacity:1;transform:none}
.t9-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 30px;border-radius:40px;border:1px solid rgba(255,230,210,.7);text-decoration:none;color:#2a0a1e!important;font:400 12.5px Marcellus,serif!important;letter-spacing:.18em;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#c98a73 0%,#ffe9d6 28%,#e8b9a0 52%,#fff3e6 76%,#c98a73 100%);background-size:200% auto;box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -2px 0 rgba(130,70,50,.35);transition:transform .35s var(--ease),background-position .8s}
.t9-btn:hover{transform:translateY(-3px);background-position:100% 0}
.t9-btn:after,.t9-send:after{content:"";position:absolute;top:0;bottom:0;width:38%;left:-60%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:t9-sweep 4s ease-in-out infinite}
@keyframes t9-sweep{0%,55%{left:-60%}100%{left:130%}}
.t9-btn-ghost{background:rgba(61,10,38,.7)!important;border:1.5px solid var(--rose)!important;color:var(--champ)!important;text-shadow:0 1px 4px rgba(0,0,0,.8)}
.t9-btn-ghost:hover{background:rgba(232,185,160,.25)!important}
/* ===== palace gate (3D doors) ===== */
.t9-gate{position:fixed;inset:0;width:100%;height:100%;height:100dvh;z-index:900;perspective:1500px;background:radial-gradient(ellipse at 50% 50%,#5a1a46 0,#1a0a2a 55%,#07020d 100%);overflow:hidden;transition:opacity .9s ease}
.t9-gate.t9-gone{opacity:0;pointer-events:none}
.t9-door{position:absolute;top:0;bottom:0;width:50.2%;z-index:2;transition:transform 1.7s var(--ease);backface-visibility:hidden;
  background:radial-gradient(circle at 100% 50%,rgba(232,185,160,.16),transparent 55%),repeating-linear-gradient(45deg,rgba(232,185,160,.07) 0 1px,transparent 1px 22px),repeating-linear-gradient(-45deg,rgba(232,185,160,.07) 0 1px,transparent 1px 22px),linear-gradient(160deg,#4a1238,#220a30 70%,#12061c)}
.t9-door:before{content:"";position:absolute;inset:clamp(14px,3vh,28px);border:1px solid rgba(232,185,160,.5);box-shadow:inset 0 0 0 6px rgba(232,185,160,.06),inset 0 0 0 7px rgba(232,185,160,.3)}
.t9-door.l{left:0;transform-origin:0 50%;border-right:1px solid rgba(232,185,160,.6)}
.t9-door.r{right:0;transform-origin:100% 50%;border-left:1px solid rgba(232,185,160,.6)}
.t9-door.l:after,.t9-door.r:after{content:"";position:absolute;top:50%;width:14px;height:14px;margin-top:-7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3e6,#e8b9a0 50%,#8a4a38);box-shadow:0 0 14px rgba(232,185,160,.8)}
.t9-door.l:after{right:16px}.t9-door.r:after{left:16px}
.t9-open .t9-door.l{transform:rotateY(-112deg)}
.t9-open .t9-door.r{transform:rotateY(112deg)}
.t9-gate-in{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,1.6vh,16px);text-align:center;padding:20px;transition:opacity .5s,transform .8s var(--ease)}
.t9-open .t9-gate-in{opacity:0;transform:scale(1.2);pointer-events:none}
.t9-gate-k{font:400 clamp(9px,1.4vh,10.5px) Marcellus,serif;letter-spacing:.38em;color:var(--champ)}
.t9-gate-names{font:clamp(40px,8vh,72px)/1.2 "Pinyon Script",cursive;margin:4px 0;padding:2px 14px;filter:drop-shadow(0 0 20px rgba(232,185,160,.45))}
.t9-gate-names span{font-size:.62em;margin:0 6px}
.t9-gate-sub{font:400 clamp(9px,1.3vh,10.5px) Marcellus,serif;letter-spacing:.22em;color:var(--rose)}
.t9-gate-guest{font:italic 400 clamp(15px,2.3vh,18px)/1.4 "Cormorant Garamond",serif;color:var(--champ)}
.t9-seal{width:clamp(108px,17vh,140px);height:clamp(108px,17vh,140px);border-radius:50%;border:0;position:relative;color:#4a1a2c;display:grid;place-content:center;gap:2px;margin-top:6px;
  background:radial-gradient(circle at 34% 25%,#fff3e6 0,#f1c9b0 22%,#c98a73 50%,#f7d9c3 68%,#9a5a46 84%,#f7d9c3 92%,#9a5a46 100%);
  box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -8px 12px rgba(110,50,40,.5),0 16px 30px rgba(0,0,0,.6),0 0 40px rgba(232,185,160,.4);animation:t9-pulse 3s ease-in-out infinite}
.t9-seal:before{content:"";position:absolute;inset:8px;border:1px solid rgba(110,50,40,.55);border-radius:50%}
.t9-seal b{font:400 clamp(24px,4vh,32px) "Cormorant Garamond",serif;font-style:italic}
.t9-seal small{font:400 clamp(7px,1.1vh,8.5px) Marcellus,serif;letter-spacing:.22em}
@keyframes t9-pulse{50%{transform:scale(1.06);box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -8px 12px rgba(110,50,40,.5),0 16px 30px rgba(0,0,0,.6),0 0 60px rgba(232,185,160,.75)}}
.t9-gate-note{font-size:clamp(9.5px,1.4vh,11px);letter-spacing:.22em;text-transform:uppercase;color:#e4d6ea;cursor:pointer}
.t9-flash{position:fixed;inset:0;z-index:901;background:radial-gradient(circle,rgba(255,236,220,.85),rgba(232,185,160,.35) 45%,transparent 75%);opacity:0;pointer-events:none}
.t9-flash.t9-on{animation:t9-fl .9s ease forwards}
@keyframes t9-fl{0%{opacity:0}30%{opacity:.7}100%{opacity:0}}
.t9-lant{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
.t9-lt{position:absolute;bottom:-20px;left:var(--l,50%);width:var(--s,6px);height:var(--s,6px);border-radius:50%;background:#ffe9d6;box-shadow:0 0 12px 3px rgba(232,185,160,.6);opacity:0;animation:t9-rise var(--d,10s) linear infinite;animation-delay:var(--dl,0s)}
@keyframes t9-rise{0%{transform:translate(0,0) scale(1);opacity:0}10%{opacity:.9}90%{opacity:.8}100%{transform:translate(var(--x,20px),-108vh) scale(1.5);opacity:0}}
/* ===== hero ===== */
.t9-hero{position:relative;min-height:100vh;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:clamp(70px,11vh,110px) 20px clamp(60px,10vh,100px);text-align:center;isolation:isolate;perspective:1300px}
.t9-hero-bg{position:absolute;inset:-8% 0;z-index:-3;background-size:cover;background-position:center;opacity:.55;will-change:transform}
.t9-hero:before{content:"";position:absolute;inset:0;z-index:-2;background:radial-gradient(ellipse at 50% 40%,rgba(74,18,56,.35),rgba(13,4,22,.92) 85%)}
.t9-orb{position:absolute;left:50%;top:44%;width:min(88vw,520px);aspect-ratio:1;margin:calc(min(88vw,520px)/-2) 0 0 calc(min(88vw,520px)/-2);transform-style:preserve-3d;z-index:-1;animation:t9-orbit 36s linear infinite;pointer-events:none}
.t9-orb i{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(232,185,160,.5);box-shadow:0 0 22px rgba(232,185,160,.15),inset 0 0 22px rgba(232,185,160,.1)}
.t9-orb i:nth-child(1){transform:rotateX(72deg)}
.t9-orb i:nth-child(2){transform:rotateY(72deg);border-color:rgba(185,195,255,.45)}
.t9-orb i:nth-child(3){transform:rotateX(72deg) rotateY(45deg) scale(.82);border-style:dashed}
.t9-orb i:nth-child(4){transform:rotateY(72deg) rotateX(45deg) scale(.66);border-color:rgba(185,195,255,.4)}
.t9-orb b{position:absolute;left:50%;top:50%;width:26%;aspect-ratio:1;margin:-13% 0 0 -13%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3e6,#e8b9a0 40%,#7a2a4a 90%);box-shadow:0 0 90px 26px rgba(232,185,160,.28)}
@keyframes t9-orbit{from{transform:rotateX(-16deg) rotateY(0)}to{transform:rotateX(-16deg) rotateY(360deg)}}
.t9-frame{position:absolute;inset:14px;border:1px solid rgba(232,185,160,.28);pointer-events:none;z-index:1}
.t9-frame:before,.t9-frame:after{content:"✦";position:absolute;color:var(--rose);font-size:12px;background:#12061c;padding:0 8px;left:50%;transform:translateX(-50%)}
.t9-frame:before{top:-9px}.t9-frame:after{bottom:-9px}
.t9-tilt{position:relative;z-index:2;max-width:760px;transform-style:preserve-3d;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out}
.t9-tilt>*{transform:translateZ(var(--z,0px))}
.t9-invoc{font:400 11px Marcellus,serif;letter-spacing:.34em;color:var(--champ);margin:0 0 10px;text-transform:uppercase;--z:30px}
.t9-hero .t9-lab{display:inline-block;margin:0 auto clamp(14px,3vh,30px);--z:20px}
.t9-hero h1{font:clamp(54px,14vw,140px)/1.18 "Pinyon Script",cursive;margin:0 0 clamp(8px,2vh,16px);filter:drop-shadow(0 0 24px rgba(232,185,160,.5)) drop-shadow(0 10px 20px rgba(0,0,0,.65));--z:80px}
.t9-hero h1 span{display:block;font-size:.4em;line-height:1.4;margin:2px 0}
.t9-hero-copy{max-width:420px;margin:clamp(8px,2vh,16px) auto 0;font:italic 400 18px/1.55 "Cormorant Garamond",serif;color:#f4e8e0;text-shadow:0 2px 12px rgba(0,0,0,.7);--z:40px}
.t9-guest-pill{display:inline-block;margin-top:clamp(12px,2vh,18px);padding:8px 18px;border-radius:30px;border:1px solid rgba(232,185,160,.5);background:rgba(18,6,28,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:400 10.5px Marcellus,serif;letter-spacing:.2em;text-transform:uppercase;color:var(--champ);--z:30px}
.t9-gboxes{display:inline-flex;align-items:center;justify-content:center;gap:clamp(8px,2vw,14px);margin:clamp(8px,1.5vh,14px) auto 0;padding:6px 16px;border-radius:14px;background:rgba(18,6,28,.55);border:1px solid rgba(232,185,160,.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;transition:transform .2s;--z:30px}
.t9-gboxes:hover{transform:translateZ(30px) scale(1.04)}
.t9-bstar{color:var(--rose);font-size:13px}
.t9-bcol{display:flex;flex-direction:column;align-items:center;gap:3px;opacity:.75;transition:opacity .2s}
.t9-bcol.active{opacity:1}
.t9-blab{font:500 12px/1.2 "Cormorant Garamond",serif;letter-spacing:.06em;color:var(--champ)}
.t9-bval{min-width:44px;height:24px;padding:0 8px;border:1.2px solid rgba(232,185,160,.6);border-radius:4px;background:rgba(255,255,255,.07);color:#fff;font:400 13px/22px Marcellus,serif;display:grid;place-content:center}
.t9-bcol.active .t9-bval{border-color:var(--rose);background:rgba(232,185,160,.2)}
.t9-bdiv{width:1px;height:30px;background:rgba(232,185,160,.38)}
.t9-badge{position:relative;display:inline-grid;gap:2px;margin-top:clamp(16px,3vh,28px);padding:clamp(14px,2.2vh,20px) clamp(18px,4vw,34px);border-radius:26px;border:1px solid rgba(232,185,160,.55);background:linear-gradient(135deg,rgba(61,10,38,.7),rgba(18,6,28,.55));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 0 6px rgba(232,185,160,.06),0 20px 44px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18);--z:60px}
.t9-badge .l{font:400 9.5px Marcellus,serif;letter-spacing:.36em;color:var(--rose)}
.t9-badge strong{font:500 clamp(18px,4.5vw,26px) Marcellus,serif;letter-spacing:.14em}
.t9-badge em{font:italic 400 15px "Cormorant Garamond",serif;color:var(--champ)}
.t9-cd{display:none;justify-content:center;gap:10px;margin-top:10px;padding-top:12px;border-top:1px solid rgba(232,185,160,.25);perspective:600px}
.t9-cd.t9-live{display:flex}
.t9-tile{min-width:48px;padding:6px 4px 5px;border-radius:8px;background:linear-gradient(180deg,#4a1238 0,#4a1238 49%,#2a0a28 50%,#2a0a28 100%);border:1px solid rgba(232,185,160,.4);box-shadow:0 6px 14px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.15);transform:rotateX(14deg)}
.t9-tile b{display:block;font:500 19px/1.2 Marcellus,serif;color:var(--champ);font-variant-numeric:tabular-nums}
.t9-tile b.t9-tick{animation:t9-flip .5s ease}
@keyframes t9-flip{0%{transform:rotateX(90deg);opacity:.2}100%{transform:rotateX(0);opacity:1}}
.t9-tile small{font:400 7.5px Marcellus,serif;letter-spacing:.2em;color:var(--rose)}
.t9-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin-top:clamp(18px,3vh,30px);--z:50px}
.t9-cue{position:relative;margin:clamp(26px,4.5vh,42px) auto 0;font:400 9.5px Marcellus,serif;letter-spacing:.3em;color:var(--rose);text-transform:uppercase;text-align:center}
.t9-cue i{display:block;width:1px;height:36px;margin:8px auto 0;background:linear-gradient(var(--rose),transparent);transform-origin:top;animation:t9-drip 2s ease-in-out infinite}
@keyframes t9-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
/* ===== story: arch frames ===== */
.t9-poem{max-width:430px;margin:0 auto 60px;text-align:center;font:italic 400 clamp(19px,4.6vw,24px)/1.8 "Cormorant Garamond",serif;color:#f7e9e0}
.t9-arches{display:grid;gap:64px;justify-items:center;perspective:1200px}
.t9-arch{width:min(100%,300px);text-align:center;transform-style:preserve-3d;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out,opacity .9s var(--ease)}
.t9-arch-img{position:relative;height:380px;border-radius:150px 150px 10px 10px;overflow:hidden;border:1px solid var(--rose);padding:9px;background:linear-gradient(160deg,rgba(232,185,160,.35),rgba(61,10,38,.6));box-shadow:0 30px 50px rgba(0,0,0,.55),0 0 0 6px rgba(232,185,160,.07)}
.t9-arch-img img{width:100%;height:100%;object-fit:cover;border-radius:142px 142px 4px 4px;filter:saturate(1.05) contrast(1.04);transition:transform 1.3s var(--ease)}
.t9-arch:hover .t9-arch-img img{transform:scale(1.07)}
.t9-arch h3{font:400 38px/1 "Pinyon Script",cursive;margin:22px 0 8px;color:var(--champ);transform:translateZ(40px)}
.t9-arch p{font-size:13px;color:#d9cfe3;margin:0 auto;max-width:270px}
/* ===== 3D unveil card ===== */
.t9-flip{max-width:390px;height:270px;margin:0 auto;perspective:1400px;cursor:pointer;outline-offset:6px}
.t9-flip-in{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 1.3s var(--ease)}
.t9-flip.t9-flipped .t9-flip-in{transform:rotateY(180deg)}
.t9-face{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-content:center;text-align:center;padding:22px;overflow:hidden;box-shadow:0 30px 50px rgba(0,0,0,.55)}
.t9-face:before{content:"";position:absolute;inset:9px;border:1px solid rgba(232,185,160,.55);border-radius:12px;pointer-events:none}
.t9-front{background:radial-gradient(circle at 30% 20%,rgba(232,185,160,.25),transparent 55%),linear-gradient(150deg,#5a1a46,#2a0a28 70%,#12061c);border:1px solid var(--rose)}
.t9-front .wax{width:84px;height:84px;margin:0 auto 14px;border-radius:50%;display:grid;place-content:center;font:italic 500 30px "Cormorant Garamond",serif;color:#4a1a2c;background:radial-gradient(circle at 34% 28%,#fff3e6,#e8b9a0 45%,#a8624e);box-shadow:inset 0 -6px 10px rgba(110,50,40,.5),0 10px 20px rgba(0,0,0,.5),0 0 30px rgba(232,185,160,.4);animation:t9-pulse 3s ease-in-out infinite}
.t9-front small{font:400 10px Marcellus,serif;letter-spacing:.32em;color:var(--champ)}
.t9-back{transform:rotateY(180deg);background:linear-gradient(160deg,#fff8ef,#f4e3d3 70%,#ead2bf);color:#3a0f26}
.t9-back small{font:400 9px Marcellus,serif;letter-spacing:.36em;color:#8a4a38}
.t9-back strong{display:block;font:500 clamp(18px,5.2vw,23px)/1.4 Marcellus,serif;letter-spacing:.07em;margin:6px 0}
.t9-back em{font:italic 400 16px "Cormorant Garamond",serif;color:#6a3a30}
.t9-addcal{display:block;text-align:center;margin-top:20px;font:400 11px Marcellus,serif;letter-spacing:.14em;color:var(--rose)}
/* ===== events timeline ===== */
.t9-day{display:flex;align-items:center;gap:14px;margin:64px 0 30px;color:var(--rose);font:400 11px Marcellus,serif;letter-spacing:.26em;text-transform:uppercase}
.t9-day:first-of-type{margin-top:0}
.t9-day:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(232,185,160,.5),transparent)}
.t9-tl{position:relative;display:flex;flex-direction:column;gap:34px;padding-left:34px;perspective:1200px}
.t9-tl:before{content:"";position:absolute;left:11px;top:6px;bottom:6px;width:1px;background:linear-gradient(var(--rose),rgba(232,185,160,.1))}
.t9-ev{position:relative;border-radius:20px;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));border:1px solid var(--line);box-shadow:0 26px 50px rgba(0,0,0,.5);opacity:0;transform:translateY(50px) rotateX(10deg);transition:opacity .9s var(--ease),transform .9s var(--ease),border-color .4s}
.t9-ev.t9-in{opacity:1;transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out,border-color .4s}
.t9-ev:hover{border-color:rgba(232,185,160,.75)}
.t9-ev:before{content:"";position:absolute;z-index:3;left:-33px;top:22px;width:11px;height:11px;border-radius:50%;background:var(--rose);box-shadow:0 0 0 5px rgba(232,185,160,.18),0 0 16px var(--rose)}
.t9-ev-img{position:relative;height:clamp(190px,50vw,240px);overflow:hidden}
.t9-ev-img img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform 1.4s var(--ease)}
.t9-ev:hover .t9-ev-img img{transform:scale(1.06)}
.t9-ev-img:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(18,6,28,.96) 0%,rgba(18,6,28,.45) 28%,transparent 58%)}
.t9-ev-t{position:absolute;z-index:2;left:18px;right:18px;bottom:14px;display:flex;align-items:flex-end;gap:12px}
.t9-ev-t .ic{font-size:26px;filter:drop-shadow(0 0 10px rgba(232,185,160,.5))}
.t9-ev-t h3{font:400 24px/1.15 "Cormorant Garamond",serif;font-style:italic;letter-spacing:.03em;margin:0}
.t9-ev-t small{display:block;font:400 12px "Noto Serif Devanagari",serif;color:var(--rose);margin-top:3px}
.t9-ev-day{position:absolute;z-index:2;top:12px;right:12px;padding:5px 12px;border-radius:20px;border:1px solid rgba(232,185,160,.55);background:rgba(18,6,28,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:400 9px Marcellus,serif;letter-spacing:.2em;color:var(--champ)}
.t9-ev-b{padding:18px 20px 20px}
.t9-meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;color:#f4eaf0;margin-bottom:10px}
.t9-meta b{color:var(--rose);font-weight:500;margin-right:5px}
.t9-desc{font-size:13px;color:#d0c6da;margin:0 0 14px}
.t9-dress{display:inline-flex;align-items:center;gap:9px;padding:7px 14px 7px 9px;border-radius:30px;border:1px solid rgba(232,185,160,.3);background:rgba(0,0,0,.2);font-size:11px;color:#f0e2dc}
.t9-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.55)}
/* ===== venue ===== */
.t9-vphoto{position:relative;height:clamp(240px,52vw,420px);border-radius:22px;overflow:hidden;border:1px solid rgba(232,185,160,.5);box-shadow:0 30px 70px rgba(0,0,0,.6);margin:0}
.t9-vphoto img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--ease)}
.t9-vphoto:hover img{transform:scale(1.07)}
.t9-vphoto:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(18,6,28,.88),transparent 60%)}
.t9-vphoto figcaption{position:absolute;z-index:1;left:22px;right:22px;bottom:18px;font:400 11px Marcellus,serif;letter-spacing:.16em;color:#fff1e6;text-transform:uppercase}
.t9-vgrid{display:grid;gap:18px;margin-top:22px}
.t9-vcard{border-radius:20px;padding:30px 26px;text-align:center}
.t9-vcard h3{font:italic 400 clamp(24px,5.5vw,32px)/1.25 "Cormorant Garamond",serif;margin:6px 0 10px}
.t9-vcard p{font-size:13.5px;color:#d9cfe3;margin:0 0 20px}
.t9-travel{border-radius:20px;padding:28px 26px}
.t9-travel h3{font:400 16px Marcellus,serif;letter-spacing:.12em;color:var(--champ);margin:0 0 6px}
.t9-trow{display:grid;grid-template-columns:30px 1fr;gap:12px;margin-top:16px}
.t9-trow>span{font-size:19px;color:var(--rose)}
.t9-trow p{font-size:12.5px;color:#d9cfe3;margin:0}
/* ===== rsvp ===== */
.t9-rsvp{position:relative;max-width:480px;margin:0 auto;padding:clamp(28px,4vh,40px) clamp(20px,4vw,32px);border-radius:24px;background:linear-gradient(175deg,rgba(255,250,244,.98),rgba(246,232,220,.96));color:#2a1020;border:1.5px solid rgba(232,185,160,.8);box-shadow:0 30px 80px rgba(0,0,0,.65),0 0 50px rgba(232,185,160,.18)}
.t9-stamp{position:absolute;top:16px;right:18px;width:40px;height:46px;background:#3d0a26;border:2px dashed var(--rose);border-radius:4px;display:grid;place-content:center;color:var(--champ);font:400 11px Marcellus,serif;transform:rotate(4deg);box-shadow:0 4px 10px rgba(0,0,0,.25)}
.t9-rsvp h2{text-align:left;font:italic 500 clamp(24px,5.4vw,30px)/1.2 "Cormorant Garamond",serif;color:#3d0a26;margin:0 0 8px}
.t9-rsvp-intro{text-align:left;font-size:13px;line-height:1.6;color:#5a4048;margin:0 0 22px}
.t9-field{margin:18px 0;text-align:left}
.t9-field label{display:block;font:400 10.5px Marcellus,serif;letter-spacing:.18em;color:#8a4a38;margin-bottom:8px;text-transform:uppercase}
.t9-field input[type=text],.t9-field textarea{width:100%;display:block;background:#fffdf9;border:1.5px solid #e2c5b6;border-radius:10px;padding:12px 14px;font:500 16px "Cormorant Garamond",serif;color:#2a1020;outline:none;transition:border-color .3s,box-shadow .3s}
.t9-field input[type=text]:focus,.t9-field textarea:focus{border-color:#c98a73;box-shadow:0 0 0 3px rgba(232,185,160,.3)}
.t9-att{display:grid;gap:10px}
.t9-att-btn{width:100%;min-height:48px;padding:10px 16px;border-radius:12px;border:1.5px solid #e2c5b6;background:#fffcf8;display:flex;align-items:center;gap:12px;color:#2a1020;font:600 15px "Cormorant Garamond",serif;transition:all .25s;text-align:left}
.t9-att-btn:hover{border-color:#c98a73}
.t9-att-btn.selected{background:#3d0a26;border-color:#3d0a26;color:#fff8ef;box-shadow:0 6px 18px rgba(61,10,38,.35)}
.t9-radio{width:22px;height:22px;border-radius:50%;border:1.5px solid #c9a796;display:grid;place-content:center;font-size:13px;flex-shrink:0}
.t9-att-btn.selected .t9-radio{background:#fff;border-color:#fff;color:#3d0a26}
.t9-stepper{display:flex;align-items:center;justify-content:space-between;background:#f8e9dd;border:1.5px solid #e2c5b6;border-radius:30px;padding:4px 8px;max-width:280px}
.t9-step{width:36px;height:36px;border-radius:50%;border:0;background:#3d0a26;color:#fff!important;font:700 22px/1 sans-serif!important;display:flex;align-items:center;justify-content:center;transition:transform .15s;box-shadow:0 3px 8px rgba(0,0,0,.25)}
.t9-step:hover{transform:scale(1.08)}
.t9-step-val{font:600 16px "Cormorant Garamond",serif;color:#3d0a26}
.t9-step-val strong{font-size:20px;margin-right:4px}
.t9-fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media(max-width:380px){.t9-fgrid{grid-template-columns:1fr}}
.t9-chip{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 12px;border-radius:26px;border:1.5px solid #e2c5b6;background:#fff;cursor:pointer;user-select:none;transition:all .25s;position:relative;min-height:58px;text-align:center}
.t9-chip:hover{border-color:#3d0a26}
.t9-chip.selected{background:#3d0a26;border-color:#3d0a26;box-shadow:0 4px 14px rgba(61,10,38,.3)}
.t9-chip input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.t9-chead{display:inline-flex;align-items:center;gap:8px;max-width:100%}
.t9-chk{width:20px;height:20px;border-radius:50%;border:1.5px solid #c9a796;color:transparent;display:grid;place-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.t9-chip.selected .t9-chk{background:#fff;border-color:#fff;color:#3d0a26}
.t9-cname{font:400 13px Marcellus,serif;letter-spacing:.05em;color:#3d0a26;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t9-chip.selected .t9-cname{color:#fff}
.t9-cdate{font:400 11px Marcellus,serif;letter-spacing:.08em;color:#8a6a60;text-transform:uppercase}
.t9-chip.selected .t9-cdate{color:#f4d9c8}
.t9-chip:last-child:nth-child(odd){grid-column:1/-1}
.t9-send{width:100%;margin-top:18px;min-height:54px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#2a0a1e!important;font:400 13px Marcellus,serif!important;letter-spacing:.14em;text-transform:uppercase;background:linear-gradient(120deg,#c98a73,#ffe9d6 32%,#e8b9a0 60%,#fff0e0 82%,#c98a73);background-size:220% 100%;box-shadow:0 10px 30px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.8);display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:transform .35s var(--ease),background-position .8s}
.t9-send svg{width:20px;height:20px;fill:#2a0a1e;flex-shrink:0}
.t9-send:hover{transform:translateY(-3px);background-position:100% 0}
.t9-send:active{transform:scale(.98)}
.t9-rnote{text-align:center;font:italic 400 13px "Cormorant Garamond",serif;color:#7a5a60;margin:12px 0 0}
.t9-status{min-height:20px;margin:14px 0 0;font-size:12px;text-align:center;color:#3d0a26;font-weight:500}
.t9-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
.t9-contact{padding:9px 16px;border-radius:30px;border:1.5px solid #e2c5b6;background:#fffdf9;color:#3d0a26;text-decoration:none;font-size:12px;font-weight:500}
/* ===== footer + music ===== */
.t9-end{text-align:center;padding:36px 22px clamp(60px,10vh,90px)}
.t9-mono{display:inline-flex;align-items:center;justify-content:center;gap:clamp(16px,4.5vw,30px);margin:4px auto}
.t9-mono-i{font:400 clamp(54px,13vw,80px)/1.2 "Pinyon Script",cursive;display:inline-block;transform:perspective(500px) rotateY(var(--ry,0deg));transition:transform .3s}
.t9-mono-a{font:italic 400 clamp(24px,6vw,38px)/1 "Cormorant Garamond",serif;color:var(--rose)}
.t9-blessing{font:italic 400 clamp(17px,4vw,22px)/1.5 "Cormorant Garamond",serif;color:#f7e9e0;margin:16px auto 10px;max-width:380px}
.t9-love{font:400 11px Marcellus,serif;letter-spacing:.26em;color:var(--rose);margin:18px auto 4px;text-transform:uppercase}
.t9-sig{font:400 clamp(12px,2.6vw,14.5px) Marcellus,serif;letter-spacing:.18em;color:#fffaf4;margin:4px auto 0;text-transform:uppercase}
.t9-music{position:fixed;z-index:950;right:16px;top:16px;width:44px;height:44px;border-radius:50%;border:1.5px solid var(--rose);background:rgba(18,6,28,.88);color:var(--champ);font-size:18px;display:inline-flex!important;align-items:center;justify-content:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.5);transition:transform .3s var(--ease)}
.t9-music:hover{transform:scale(1.08)}
.t9-music.t9-playing{animation:t9-mg 2s ease-in-out infinite;background:var(--rose)!important;color:#3d0a26!important}
@keyframes t9-mg{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 0 0 rgba(232,185,160,.6)}50%{box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 16px 4px rgba(232,185,160,.6)}}
@media(min-width:760px){
  .t9 section{padding:130px 0}
  .t9-arches{grid-template-columns:repeat(3,1fr);gap:40px;align-items:start}
  .t9-arch:nth-child(2){margin-top:56px}
  .t9-tl{padding-left:0}
  .t9-tl:before{left:50%}
  .t9-ev{width:calc(50% - 38px)}
  .t9-ev:nth-child(odd){margin-right:auto}
  .t9-ev:nth-child(even){margin-left:auto}
  .t9-ev:before{top:26px}
  .t9-ev:nth-child(odd):before{left:auto;right:-44px}
  .t9-ev:nth-child(even):before{left:-44px}
  .t9-vgrid.t9-two{grid-template-columns:1fr 1fr}
  .t9-rsvp{padding:56px 52px 46px}
}
@media(max-width:360px){.t9-wrap{padding:0 16px}.t9-tile{min-width:42px}}
@media(prefers-reduced-motion:reduce){.t9 *,.t9 *:before,.t9 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t9-js .t9-reveal,.t9-js .t9-ev{opacity:1!important;transform:none!important}}
@media print{.t9-progress,.t9-gate,.t9-music,.t9-cue{display:none!important}.t9-js .t9-reveal,.t9-js .t9-ev{opacity:1!important;transform:none!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const evs = Array.isArray(events) ? events : [];
  const offset = clean(w.timezone_offset) || '+05:30';

  const bride = esc(clean(w.bride_name) || 'Bride');
  const groom = esc(clean(w.groom_name) || 'Groom');
  const [first, second] = clean(w.name_order) === 'bride_first' ? [bride, groom] : [groom, bride];
  const init1 = esc(first.replace(/&[^;]+;/g, '').trim().charAt(0) || 'R').toUpperCase();
  const init2 = esc(second.replace(/&[^;]+;/g, '').trim().charAt(0) || 'A').toUpperCase();
  const initials = `${init1} &amp; ${init2}`;

  const rawGuest = clean(guest?.name) || 'Respected Guest';
  const baseGuest = rawGuest.replace(/\s*(?:&|and)?\s*Family\s*$/i, '').trim() || 'Respected Guest';
  const isFamily = Boolean(guest?.with_family);
  const guestLine = isFamily ? `${esc(baseGuest)} &amp; Family` : esc(baseGuest);
  const personsCount = esc(guest?.persons || 1);
  const invocation = esc(clean(w.invocation) || 'Shree Ganeshaya Namah');
  const venue = esc(clean(w.venue) || 'Wedding Venue');
  const address = esc(clean(w.address));
  const city = esc(clean(w.city));
  const where = [venue, city].filter(Boolean).join(', ');
  const signature = esc(clean(w.footer_text) || clean(w.families) || `The ${clean(w.bride_name).split(/\s+/).pop() || 'Bride'} & ${clean(w.groom_name).split(/\s+/).pop() || 'Groom'} Families`);
  const poem = esc(clean(w.poem) || 'Two hearts, one beautiful story, one promise, a lifetime of love. May every tomorrow shine brighter together.').replace(/(?<=[,.])\s+(?=[A-Z])/g, '<br>');

  const day = dparts(w.date);
  const dateLong = day ? longDate(day) : 'Date to be announced';
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';
  const dayName = day ? weekday(day) : '';
  const timeText = fmtTime(w.time);
  const t09Key = clean(w.theme || w.theme_name).toLowerCase();
  const t09Th = T09_THEMES[t09Key] || T09_THEMES.rose;
  const t09Vars = `--plum:${t09Th.plum};--wine:${t09Th.wine};--rose:${t09Th.rose};--rose2:${t09Th.rose2};--champ:${t09Th.champ};--moon:${t09Th.moon};--pearl:${t09Th.pearl};--line:${t09Th.line};background:${t09Th.bg};`;

  const defaultMusic = safeUrl(w.music_url) || 'invitation.mp3';
  const targetTs = parseWhen(w.date, w.time, offset) ?? parseWhen(w.date, '', offset);
  const stCal = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const plain = s => s.replace(/&amp;/g, '&');
  const calTitle = encodeURIComponent(`Wedding: ${plain(first)} & ${plain(second)}`);
  const calLoc = encodeURIComponent(plain(where));
  const calDesc = encodeURIComponent(`We cordially invite you to celebrate the wedding of ${plain(first)} & ${plain(second)}.${where ? ` Venue: ${plain(where)}.` : ''}`);
  const calUrl = targetTs ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${stCal(targetTs)}/${stCal(targetTs + 4 * 3600 * 1000)}&details=${calDesc}&location=${calLoc}` : '';

  const mapUrl = safeUrl(w.map_url) || (clean(w.venue) || clean(w.address)
    ? esc(`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: [w.venue, w.address].filter(Boolean).join(', ') })}`) : '');
  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || contacts[0] || '';
  const digits = phoneRaw.replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = wa.length >= 10;

  const heroImg = safeImg(w.hero_image);
  const heroBg = [
    heroImg && `url('${heroImg}')`,
    `url('${U('1477587458883-47145ed94245', 1800)}')`,
    'radial-gradient(ellipse at 50% 30%,#4a1238,#12061c 70%)'
  ].filter(Boolean).join(',');
  const venueImg = safeImg(w.venue_image) || U('1599661046827-dacff0c0f09a', 1400);
  const story = readStory(w.story);

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
    const label = `DAY ${ORD[gi] || gi + 1}${g.p ? ` · ${weekday(g.p)}, ${shortDate(g.p)}` : ''}`;
    const cards = g.items.map(e => {
      const name = clean(e.event_name) || 'Celebration';
      const k = kindOf(name);
      const img = safeImg(e.image_url) || k.src || U(k.img);
      const loc = clean(e.venue || e.address) || clean(w.venue);
      const t = fmtTime(e.event_time);
      const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
      return `<article class="t9-ev" data-tilt="6">
        <div class="t9-ev-img t9-ph"><img src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t9-ev-day">DAY ${gi + 1}</span>
          <div class="t9-ev-t"><span class="ic" aria-hidden="true">${k.icon}</span><div><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}</div></div></div>
        <div class="t9-ev-b">
          <div class="t9-meta">${t ? `<span><b>◷</b>${esc(t)}</span>` : ''}${loc ? `<span><b>⌖</b>${esc(loc)}</span>` : ''}</div>
          ${clean(e.description) ? `<p class="t9-desc">${esc(e.description)}</p>` : ''}
          ${clean(e.dress_code) ? `<div class="t9-dress"><span class="t9-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
        </div></article>`;
    }).join('');
    return `<div class="t9-day t9-reveal">${esc(label)}</div><div class="t9-tl">${cards}</div>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const hasTravel = travel.length > 0;

  const fmtEventDate = e => {
    const p = dparts(e?.event_date) || dparts(w.date);
    return p ? `${p.d} ${MONTHS[p.mo - 1].slice(0, 3)}` : '';
  };
  const rsvpFns = evs.length
    ? evs.map(e => ({ name: clean(e.event_name) || 'Celebration', date: fmtEventDate(e) }))
    : [{ name: 'Mehendi', date: '' }, { name: 'Sangeet', date: '' }, { name: 'Wedding', date: '' }, { name: 'Reception', date: '' }];

  const waIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${STYLE}</style>
<noscript><style>.t9-gate{display:none!important}.t9.t9-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t9-reveal,.t9-ev{opacity:1!important;transform:none!important}.t9-flip-in{transform:rotateY(180deg)!important}</style></noscript>
<div class="t9 t9-js t9-locked" style="${t09Vars}" data-when="${esc(String(targetTs ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${esc(defaultMusic)}">
  <div class="t9-progress" aria-hidden="true"></div>

  <div class="t9-gate" role="dialog" aria-label="Wedding invitation entry">
    <div class="t9-lant" aria-hidden="true"></div>
    <div class="t9-door l" aria-hidden="true"></div>
    <div class="t9-door r" aria-hidden="true"></div>
    <div class="t9-gate-in">
      <div class="t9-gate-k">A ROYAL INVITATION</div>
      <p class="t9-gate-names t9-rg">${first} <span>&amp;</span> ${second}</p>
      <div class="t9-gate-sub">${[city, day ? longDate(day) : ''].filter(Boolean).join(' · ').toUpperCase()}</div>
      <div class="t9-gate-guest">Dear ${guestLine}</div>
      <button class="t9-seal" type="button" data-open aria-label="Open wedding invitation"><b>${initials}</b><small>OPEN THE DOORS</small></button>
      <div class="t9-gate-note">Tap the seal to enter</div>
    </div>
  </div>
  <div class="t9-flash" aria-hidden="true"></div>

  <main>
    <header class="t9-hero" data-hero>
      <div class="t9-hero-bg" style="background-image:${heroBg}" aria-hidden="true"></div>
      <div class="t9-orb" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
      <div class="t9-lant t9-dust" aria-hidden="true"></div>
      <div class="t9-frame" aria-hidden="true"></div>
      <div class="t9-tilt" data-herotilt>
        <div class="t9-invoc">${invocation}</div>
        <div class="t9-lab">Together with their families</div>
        <h1 class="t9-rg">${first} <span>&amp;</span> ${second}</h1>
        <p class="t9-hero-copy">Request the pleasure of your company as they begin their beautiful journey together.</p>
        <div class="t9-guest-pill" id="t9-pill">Invited: ${guestLine}</div><br>
        <div class="t9-gboxes" id="t9-gboxes" data-family="${isFamily ? 'true' : 'false'}" data-base="${esc(baseGuest)}" data-count="${personsCount}" role="group" aria-label="Guest invite category">
          <span class="t9-bstar" aria-hidden="true">✦</span>
          <div class="t9-bcol${isFamily ? '' : ' active'}"><div class="t9-blab">Person</div><div class="t9-bval" data-box="person">${isFamily ? '—' : personsCount}</div></div>
          <i class="t9-bdiv" aria-hidden="true"></i>
          <div class="t9-bcol${isFamily ? ' active' : ''}"><div class="t9-blab">Family</div><div class="t9-bval" data-box="family">${isFamily ? '✓' : '✕'}</div></div>
          <span class="t9-bstar" aria-hidden="true">✦</span>
        </div><br>
        <div class="t9-badge" aria-label="Save the date">
          <span class="l">SAVE THE DATE</span>
          <strong>${esc(dateNums)}</strong>
          <em>${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</em>
          <div class="t9-cd" role="timer"><div class="t9-tile"><b data-u="d">--</b><small>DAYS</small></div><div class="t9-tile"><b data-u="h">--</b><small>HRS</small></div><div class="t9-tile"><b data-u="m">--</b><small>MIN</small></div><div class="t9-tile"><b data-u="s">--</b><small>SEC</small></div></div>
        </div>
        <div class="t9-cta">
          ${calUrl ? `<a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="t9-btn">📅 &nbsp;SAVE THE DATE</a>` : ''}
          <a href="#" data-goto="story" class="t9-btn t9-btn-ghost">OUR STORY ↓</a>
        </div>
        <div class="t9-cue" aria-hidden="true">A new chapter begins<i></i></div>
      </div>
    </header>

    <section data-sec="story">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-lab">A little bit of forever</div><h2 class="t9-rg">Our Journey</h2>
          <p>Every love story is special. Ours is a collection of little moments that led us here.</p><div class="t9-orn"><span>✦</span></div></div>
        <p class="t9-poem t9-reveal">${poem}</p>
        <div class="t9-arches">
          ${story.map(s => `<figure class="t9-arch t9-reveal" data-tilt="9" tabindex="0">
            <div class="t9-arch-img t9-ph"><img src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div>
            <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></figure>`).join('')}
        </div>
      </div>
    </section>

    <section style="padding-top:40px">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-lab">A little surprise</div><h2 class="t9-rg">Unveil the Date</h2>
          <p>Touch the royal seal to turn the card and reveal our special day.</p></div>
        <div class="t9-flip t9-reveal" role="button" tabindex="0" aria-label="Tap to reveal the wedding date" data-flip>
          <div class="t9-flip-in">
            <div class="t9-face t9-front"><div><div class="wax">${initials}</div><small>TAP TO UNVEIL</small></div></div>
            <div class="t9-face t9-back"><div><small>${clean(w.surprise_message) ? 'A MESSAGE FOR YOU' : 'OUR WEDDING DAY'}</small>
              <strong>${clean(w.surprise_message) ? esc(w.surprise_message) : `${dayName ? esc(dayName) + '<br>' : ''}${esc(dateLong)}`}</strong>
              <em>${esc(where)}</em></div></div>
          </div>
        </div>
        ${calUrl ? `<a class="t9-addcal" href="${calUrl}" target="_blank" rel="noopener noreferrer">📅 Add wedding to Google Calendar</a>` : ''}
      </div>
    </section>

    ${groups.length ? `<section>
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-lab">The festivities</div><h2 class="t9-rg">Wedding Celebrations</h2>
          <p>Traditions, laughter, music, and memories. We would be delighted to have you with us.</p><div class="t9-orn"><span>✦</span></div></div>
        ${eventsHtml}
      </div>
    </section>` : ''}

    <section>
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-lab">Join us</div><h2 class="t9-rg">The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <figure class="t9-vphoto t9-ph t9-reveal"><img src="${esc(venueImg)}" data-fallback="${esc(U('1477587458883-47145ed94245', 1400))}" alt="${venue}" loading="lazy" decoding="async"><figcaption>${esc(where)}</figcaption></figure>
        <div class="t9-vgrid${hasTravel ? ' t9-two' : ''}">
          <div class="t9-vcard t9-glass t9-reveal">
            <div class="t9-lab">The wedding destination</div>
            <h3 class="t9-rg">${venue}</h3>
            <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
            ${mapUrl ? `<a class="t9-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;GET DIRECTIONS</a>` : ''}
          </div>
          ${hasTravel ? `<div class="t9-travel t9-glass t9-reveal"><h3>Travel &amp; Stay</h3>${travel.map(([i, t]) => `<div class="t9-trow"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
        </div>
      </div>
    </section>

    <section style="padding-bottom:70px">
      <div class="t9-wrap">
        <div class="t9-head t9-reveal"><div class="t9-lab">Your presence is our present</div><h2 class="t9-rg">Kindly RSVP</h2></div>
        <form class="t9-rsvp t9-reveal" data-rsvp novalidate>
          <div class="t9-stamp" aria-hidden="true"><span>${initials}</span></div>
          <h2>Will you grace us<br>with your presence?</h2>
          <p class="t9-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
          ${canRsvp ? `
          <div class="t9-field"><label for="t9-name">Your name</label>
            <input id="t9-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
          <div class="t9-field"><label>Will you be joining us?</label>
            <div class="t9-att" role="radiogroup" aria-label="Will you be joining us?">
              <button type="button" class="t9-att-btn selected" data-att="Yes, we'll be there" aria-checked="true"><span class="t9-radio">✓</span><strong>Yes, we'll be there</strong></button>
              <button type="button" class="t9-att-btn" data-att="Sorry, can't make it" aria-checked="false"><span class="t9-radio"></span><strong>Sorry, can't make it</strong></button>
            </div>
            <input type="hidden" name="attendance" id="t9-att-val" value="Yes, we'll be there"></div>
          <div id="t9-details">
            <div class="t9-field"><label>How many of you?</label>
              <div class="t9-stepper">
                <button type="button" class="t9-step" data-step="-1" aria-label="Decrease guest count">−</button>
                <span class="t9-step-val"><strong id="t9-pc">${esc(guest?.persons || 1)}</strong> <span id="t9-pl">${(guest?.persons || 1) > 1 ? 'persons' : 'person'}</span></span>
                <button type="button" class="t9-step" data-step="1" aria-label="Increase guest count">+</button>
              </div>
              <input type="hidden" name="persons" id="t9-pv" value="${esc(guest?.persons || 1)}"></div>
            <div class="t9-field"><label>Which functions?</label>
              <div class="t9-fgrid" role="group" aria-label="Select functions">
                ${rsvpFns.map(f => `<label class="t9-chip selected"><input type="checkbox" name="functions" value="${esc(f.name)}" checked>
                  <div class="t9-chead"><span class="t9-chk" aria-hidden="true">✓</span><span class="t9-cname">${esc(f.name)}</span></div>
                  ${f.date ? `<span class="t9-cdate">${esc(f.date)}</span>` : ''}</label>`).join('')}
              </div></div>
            <div class="t9-field"><label for="t9-note">A note for the family (optional)</label>
              <textarea id="t9-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
          </div>
          <button class="t9-send" type="submit">${waIcon}<span>Send reply on WhatsApp</span></button>
          <p class="t9-rnote">Thank you. If WhatsApp did not open, tap the button once more.</p>
          <p class="t9-status" role="status" aria-live="polite"></p>` : ''}
          ${contacts.length ? `<div class="t9-contacts">${contacts.map(c => `<a class="t9-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form>
      </div>
    </section>

    <footer class="t9-end">
      <div class="t9-orn"><span>❦</span></div>
      <div class="t9-mono t9-rg" aria-label="${init1} and ${init2}" data-mono>
        <span class="t9-mono-i">${init1}</span><span class="t9-mono-a">&amp;</span><span class="t9-mono-i">${init2}</span>
      </div>
      <p class="t9-blessing">Your presence is the blessing<br>we are waiting for</p>
      <p class="t9-love">With love,</p>
      <p class="t9-sig">${signature}</p>
    </footer>
  </main>

  <audio class="t9-audio" preload="auto" src="${esc(defaultMusic)}"></audio>
  <button class="t9-music" type="button" aria-label="Toggle music" aria-pressed="false" title="Toggle music">♫</button>
</div>`;
}

/* ---------- mount: interactivity ---------- */
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
  const timers = [];
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };

  host.classList.add('t9-js');
  const prevHtml = doc.documentElement.style.overflow, prevBody = doc.body.style.overflow;
  doc.documentElement.style.overflow = 'hidden';
  doc.body.style.overflow = 'hidden';
  if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);

  /* image fallbacks */
  $$('img').forEach(img => {
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t9-failed');
    };
    on(img, 'error', fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  });

  /* floating lanterns */
  $$('.t9-lant').forEach(box => {
    const n = box.closest('.t9-gate') ? 28 : 16;
    for (let i = 0; i < n; i++) {
      const p = doc.createElement('span'); p.className = 't9-lt';
      p.style.cssText = `--l:${rand(0, 100)}%;--d:${rand(8, 16)}s;--dl:${-rand(0, 16)}s;--s:${rand(2, 6)}px;--x:${rand(-40, 40)}px`;
      box.appendChild(p);
    }
  });

  /* music */
  const musicBtn = $('.t9-music');
  const audioEl = $('.t9-audio') || new Audio(host.dataset.music || 'invitation.mp3');
  audioEl.loop = false;
  if (win.__t9Audio && win.__t9Audio !== audioEl) { try { win.__t9Audio.pause(); } catch (_) {} }
  win.__t9Audio = audioEl;
  const setMusic = p => {
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', String(p));
    musicBtn.classList.toggle('t9-playing', p);
    musicBtn.textContent = p ? '♪' : '♫';
    musicBtn.title = p ? 'Stop music' : 'Play music';
    musicBtn.setAttribute('aria-label', p ? 'Stop music' : 'Play music');
  };
  on(musicBtn, 'click', () => {
    if (audioEl.paused) audioEl.play().then(() => setMusic(true)).catch(() => {});
    else { audioEl.pause(); setMusic(false); }
  });
  on(audioEl, 'ended', () => setMusic(false));
  undo.push(() => { try { audioEl.pause(); } catch (_) {} setMusic(false); if (win.__t9Audio === audioEl) win.__t9Audio = null; });

  /* palace doors */
  const gate = $('.t9-gate'), flash = $('.t9-flash');
  let opened = false;
  const open = () => {
    if (opened || !gate) return;
    opened = true;
    gate.classList.add('t9-open');
    if (flash) flash.classList.add('t9-on');
    if (audioEl.paused) audioEl.play().then(() => setMusic(true)).catch(() => {});
    timers.push(setTimeout(() => gate.classList.add('t9-gone'), 900));
    timers.push(setTimeout(() => {
      gate.remove(); flash?.remove();
      host.classList.remove('t9-locked');
      doc.documentElement.style.overflow = 'auto';
      doc.body.style.overflow = 'visible';
      if (typeof win.scrollTo === 'function') win.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 1800));
  };
  on($('[data-open]'), 'click', open);
  on($('.t9-gate-note'), 'click', open);

  /* smooth anchor */
  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    const t = $(`[data-sec="${a.dataset.goto}"]`);
    if (t) {
      const top = t.getBoundingClientRect().top + (win.scrollY ?? doc.documentElement.scrollTop ?? 0);
      win.scrollTo?.({ top, behavior: reduce ? 'auto' : 'smooth' });
    }
  }));

  /* guest person / family toggle */
  const gb = $('#t9-gboxes'), pill = $('#t9-pill');
  on(gb, 'click', () => {
    const fam = gb.dataset.family !== 'true';
    gb.dataset.family = String(fam);
    const base = gb.dataset.base || 'Respected Guest', count = gb.dataset.count || '1';
    const [cp, cf] = $$('.t9-bcol', gb);
    cp?.classList.toggle('active', !fam); cf?.classList.toggle('active', fam);
    $('[data-box="person"]', gb).textContent = fam ? '—' : count;
    $('[data-box="family"]', gb).textContent = fam ? '✓' : '✕';
    if (pill) pill.textContent = `Invited: ${base}${fam ? ' & Family' : ''}`;
  });

  /* 3D tilt: hero (pointer + device) and cards */
  const hero = $('[data-hero]'), htilt = $('[data-herotilt]');
  if (!reduce && hero && htilt) {
    on(hero, 'pointermove', e => {
      const r = hero.getBoundingClientRect();
      htilt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg');
      htilt.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 10 + 'deg');
    });
    on(hero, 'pointerleave', () => { htilt.style.setProperty('--rx', '0deg'); htilt.style.setProperty('--ry', '0deg'); });
    on(win, 'deviceorientation', e => {
      if (e.gamma == null) return;
      htilt.style.setProperty('--ry', Math.max(-12, Math.min(12, e.gamma / 3)) + 'deg');
      htilt.style.setProperty('--rx', Math.max(-9, Math.min(9, -((e.beta || 45) - 45) / 4)) + 'deg');
    });
  }
  if (!reduce) $$('[data-tilt]').forEach(el => {
    const max = Number(el.dataset.tilt) || 6;
    on(el, 'pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * max * 2 + 'deg');
      el.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * max * 2 + 'deg');
    });
    on(el, 'pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* progress + parallax */
  const bar = $('.t9-progress'), heroBg = $('.t9-hero-bg'), mono = $('[data-mono]');
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    win.requestAnimationFrame(() => {
      const y = win.scrollY ?? doc.documentElement.scrollTop ?? 0;
      const vh = win.innerHeight || 800;
      const max = (doc.documentElement.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (!reduce && hero && heroBg) {
        const top = hero.getBoundingClientRect().top;
        if (top < 0 && -top < vh * 1.3) heroBg.style.transform = `translate3d(0,${-top * .3}px,0) scale(1.08)`;
      }
      if (!reduce && mono) {
        const r = mono.getBoundingClientRect();
        const k = (r.top / vh - .5) * 40;
        $$('.t9-mono-i', mono).forEach((m, i) => m.style.setProperty('--ry', (i ? -k : k) + 'deg'));
      }
      tick = false;
    });
  };
  on(win, 'scroll', onScroll, { passive: true });
  onScroll();

  /* reveals */
  if (typeof IntersectionObserver !== 'undefined') {
    const obs = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t9-in'); obs.unobserve(e.target); });
    }, { threshold: .14, rootMargin: '0px 0px -5% 0px' });
    $$('.t9-reveal, .t9-ev').forEach(el => obs.observe(el));
    undo.push(() => obs.disconnect());
  } else $$('.t9-reveal, .t9-ev').forEach(el => el.classList.add('t9-in'));

  /* flip countdown */
  const when = Number(host.dataset.when), cd = $('.t9-cd');
  if (when && cd) {
    const prev = {};
    const set = (k, v) => {
      const el = $(`[data-u="${k}"]`, cd), t = pad(v);
      if (el && prev[k] !== t) { el.textContent = t; if (prev[k] !== undefined && !reduce) { el.classList.remove('t9-tick'); void el.offsetWidth; el.classList.add('t9-tick'); } prev[k] = t; }
    };
    const step = () => {
      const s = Math.max(0, Math.floor((when - Date.now()) / 1000));
      set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
    };
    cd.classList.add('t9-live'); step();
    timers.push(setInterval(step, 1000));
  }

  /* 3D unveil card */
  const flip = $('[data-flip]');
  if (flip) {
    const doFlip = () => {
      const f = flip.classList.toggle('t9-flipped');
      flip.setAttribute('aria-label', f ? 'Wedding date revealed' : 'Tap to reveal the wedding date');
    };
    on(flip, 'click', doFlip);
    on(flip, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doFlip(); } });
  }

  /* RSVP via WhatsApp */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa || '';
  if (form) {
    const attBtns = $$('.t9-att-btn', form), attVal = $('#t9-att-val', form), details = $('#t9-details', form);
    attBtns.forEach(btn => on(btn, 'click', () => {
      attBtns.forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-checked', 'false'); const r = $('.t9-radio', b); if (r) r.textContent = ''; });
      btn.classList.add('selected'); btn.setAttribute('aria-checked', 'true');
      const r = $('.t9-radio', btn); if (r) r.textContent = '✓';
      if (attVal) attVal.value = btn.dataset.att;
      if (details) details.style.display = btn.dataset.att.startsWith('Yes') ? 'block' : 'none';
    }));

    const pc = $('#t9-pc', form), pl = $('#t9-pl', form), pv = $('#t9-pv', form);
    let count = Number(pv?.value || 1);
    $$('.t9-step', form).forEach(b => on(b, 'click', () => {
      count = Math.max(1, Math.min(20, count + Number(b.dataset.step || 0)));
      if (pc) pc.textContent = String(count);
      if (pl) pl.textContent = count > 1 ? 'persons' : 'person';
      if (pv) pv.value = String(count);
    }));

    $$('.t9-chip', form).forEach(chip => {
      const cb = $('input', chip), chk = $('.t9-chk', chip);
      if (!cb) return;
      const sync = () => { chip.classList.toggle('selected', cb.checked); if (chk) chk.textContent = cb.checked ? '✓' : ''; };
      on(cb, 'change', sync);
      on(chip, 'click', () => setTimeout(sync, 0));
    });

    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form)?.value.trim() || 'Guest';
      const coming = (attVal?.value || '').startsWith('Yes');
      const persons = coming ? (pv?.value || '1') : '0';
      const fns = coming ? $$('[name="functions"]:checked', form).map(c => c.value) : [];
      const note = $('[name="note"]', form)?.value.trim();
      const status = $('.t9-status', form);
      const groom = wedding.groom_name || 'Groom', bride = wedding.bride_name || 'Bride';
      const greet = /allah|bismillah|insha/i.test(String(wedding.invocation || '')) ? 'Salam! ' : 'Namaste! ';
      const msg = [
        `${greet}Reply for ${groom} weds ${bride}.`,
        `Name: ${name}`,
        `Coming: ${coming ? `Yes, ${persons} ${Number(persons) > 1 ? 'persons' : 'person'}` : "Sorry, can't make it"}`
      ];
      if (coming && fns.length) msg.push(`Functions: - ${fns.join(' - ')}`);
      if (note) msg.push(`Note: ${note}`);
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg.join(' '))}`, '_blank', 'noopener,noreferrer');
      if (status) status.textContent = 'Thank you! Your WhatsApp reply is opening now.';
    });
  }

  const cleanup = () => {
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    doc.documentElement.style.overflow = prevHtml;
    doc.body.style.overflow = prevBody;
    host.classList.remove('t9-js', 't9-locked');
    delete host._t9Cleanup;
  };
  host._t9Cleanup = cleanup;
  return cleanup;
}