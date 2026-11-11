/* ==========================================================================
   Template 10 — "JANNAT BAGH" · Living Garden Wedding Invitation
   Concept : golden gates open into a paradise garden. The sky changes from
             night -> dawn -> golden morning as the guest scrolls. A Pari
             (fairy) flies through the garden. Pataka, anaar, chakri,
             rockets, fuljhari (sparkler) and sky-lanterns are all drawn live
             on a canvas.
   Palette : Midnight Indigo · Lapis · Orchid Magenta · Peach Dawn ·
             Garden Teal · Lotus Pink · Pearl · Light Gold
   Contract (same as your other templates):90
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a readable static invitation (no JS needed).
   wedding / events / guest fields are identical to your earlier templates.
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
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Josefin+Sans:wght@300;400;600&family=Noto+Serif+Devanagari:wght@400;600&display=swap';

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

const T10_THEMES = {
  navy: { ink: '#0a0a22', lapis: '#1a1e50', orch: '#4d2a8a', peach: '#ffb38a', teal: '#1fa58f', lotus: '#8faaff', pearl: '#fffaf0', gold: '#f3c969', gold2: '#ffe9a8', line: 'rgba(243,201,105,.4)', bg: 'linear-gradient(180deg,#070a1c 0,#101940 40%,#19255a 72%,#0b1028 100%)' },
  maroon: { ink: '#1a050b', lapis: '#4a0d1b', orch: '#8a1b32', peach: '#ffd0a8', teal: '#a32840', lotus: '#ff8fa3', pearl: '#fffaf4', gold: '#f3c969', gold2: '#ffe9a8', line: 'rgba(243,201,105,.4)', bg: 'linear-gradient(180deg,#16040a 0,#330713 40%,#540d21 72%,#1c040c 100%)' },
  royal: { ink: '#1a050b', lapis: '#4a0d1b', orch: '#8a1b32', peach: '#ffd0a8', teal: '#a32840', lotus: '#ff8fa3', pearl: '#fffaf4', gold: '#f3c969', gold2: '#ffe9a8', line: 'rgba(243,201,105,.4)', bg: 'linear-gradient(180deg,#16040a 0,#330713 40%,#540d21 72%,#1c040c 100%)' },
  emerald: { ink: '#04140e', lapis: '#0c3826', orch: '#1a6b4d', peach: '#e3f5d8', teal: '#1f8f67', lotus: '#8fe6b8', pearl: '#f7fbf6', gold: '#f3c969', gold2: '#ffe9a8', line: 'rgba(243,201,105,.4)', bg: 'linear-gradient(180deg,#02100a 0,#062417 40%,#0c3d28 72%,#03140d 100%)' },
  rose: { ink: '#17040e', lapis: '#3d0c26', orch: '#7a1a4f', peach: '#ffd4e5', teal: '#8a245a', lotus: '#ff8fb8', pearl: '#fff6f9', gold: '#f3c969', gold2: '#ffe9a8', line: 'rgba(243,201,105,.4)', bg: 'linear-gradient(180deg,#12030b 0,#2c061a 40%,#4c0b2c 72%,#17030e 100%)' }
};

const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const KINDS = [
  { re: /haldi|ubtan|pithi|gaye\s*holud/i, icon: '🌼', src: './assets/haldi.jpg', img: '1606216794074-735e91aa2c92', alt: '1599661046827-dacff0c0f09a', dress: '#f4c542' },
  { re: /mehendi|mehndi|henna/i, icon: '🌿', src: './assets/mehendi.jpg', img: '1583939003579-730e3918a45a', alt: '1465495976277-4387d4b0b4c6', dress: '#1fa58f' },
  { re: /sangeet|cocktail|music|garba|dandiya/i, icon: '🎶', img: '1469371670807-013ccf25f16a', alt: '1511795409834-ef04bbd61622', dress: '#9b7bff' },
  { re: /baraat|barat|procession/i, icon: '🐎', src: './assets/baraat.jpg', img: '1519167758481-83f550bb49b3', alt: '1606216794074-735e91aa2c92', dress: '#ff8fb8' },
  { re: /jaimala|varmala|engagement|sagai|tilak|ring/i, icon: '💐', img: '1519225421980-715cb0215aed', alt: '1465495976277-4387d4b0b4c6', dress: '#ffb38a' },
  { re: /phere|pheras|nikah|wedding|vivah|shaadi|biye|ceremony|saptapadi/i, icon: '🔥', src: './assets/phere.jpg', img: '1465495976277-4387d4b0b4c6', alt: '1519741497674-611481863552', dress: '#d63a5c' },
  { re: /reception|walima|dinner|aashirbaad|aashirvad|blessing/i, icon: '✨', src: './assets/reception.jpg', img: '1511795409834-ef04bbd61622', alt: '1469371670807-013ccf25f16a', dress: '#e6d1ff' }
];
const DEFAULT_KIND = { icon: '✦', img: '1519741497674-611481863552', alt: '1522413452208-996ff3f3e740', dress: '#ffb38a' };
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

/* ---------- styles (scoped under .t10) ---------- */
const STYLE = `
html{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
body{overflow:visible!important;margin:0;padding:0;overscroll-behavior:contain}
.t10,.t10 *,.t10 *:before,.t10 *:after{box-sizing:border-box}
.t10{--ink:#0a0a22;--lapis:#2a1f6e;--orch:#b04a8a;--peach:#ffb38a;--teal:#1fa58f;--lotus:#ff8fb8;--pearl:#fffaf0;--gold:#f3c969;--gold2:#ffe9a8;--line:rgba(243,201,105,.4);--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;color:var(--pearl);font:300 15px/1.7 "Josefin Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background:linear-gradient(180deg,#0a0a22 0,#2a1a66 45%,#a8467f 80%,#ff9d86 100%)}
.t10.t10-locked{height:100vh!important;height:100dvh!important;max-height:100vh!important;overflow:hidden!important}
.t10 h1,.t10 h2,.t10 h3,.t10 p,.t10 figure{margin-top:0}
.t10 img{display:block;max-width:100%}
.t10 button{font:inherit;color:inherit;cursor:pointer}
.t10 a{color:inherit}
.t10 :focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.t10-cv{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.t10-main{position:relative;z-index:2}
.t10-shake .t10-main{animation:t10-shake .5s linear}
@keyframes t10-shake{0%,100%{transform:none}15%{transform:translate(-3px,2px)}30%{transform:translate(3px,-2px)}45%{transform:translate(-2px,-3px)}60%{transform:translate(2px,3px)}80%{transform:translate(-1px,1px)}}
.t10-progress{position:fixed;top:0;left:0;height:3px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--teal),var(--gold),var(--lotus));box-shadow:0 0 12px rgba(243,201,105,.8)}
.t10-gold{background:linear-gradient(100deg,#ffd36e 0%,#fff6d0 25%,#f3c969 45%,#ffe1ef 62%,#ffb38a 80%,#ffd36e 100%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t10-shim 8s linear infinite}
@keyframes t10-shim{0%{background-position:-220% center}100%{background-position:220% center}}
.t10-wrap{position:relative;width:100%;max-width:1060px;margin:0 auto;padding:0 20px}
.t10 section{position:relative;padding:90px 0}
.t10-lab{font:400 11px "Josefin Sans",sans-serif;letter-spacing:.34em;text-transform:uppercase;color:var(--gold2);margin-bottom:10px;text-shadow:0 1px 8px rgba(0,0,0,.5)}
.t10-head{text-align:center;margin-bottom:46px}
.t10-head h2{font:700 clamp(24px,6vw,40px)/1.2 "Cinzel Decorative",serif;margin:0 0 14px;filter:drop-shadow(0 2px 12px rgba(0,0,0,.4))}
.t10-head p{max-width:440px;margin:0 auto;color:#f6e9ff;font:italic 400 17px/1.6 Amiri,serif;text-shadow:0 1px 8px rgba(0,0,0,.55)}
.t10-orn{display:flex;align-items:center;justify-content:center;gap:14px;color:var(--gold);margin:20px auto 0}
.t10-orn:before,.t10-orn:after{content:"";height:1px;width:60px;background:linear-gradient(90deg,transparent,var(--gold))}
.t10-orn:after{transform:scaleX(-1)}
.t10-pan{position:relative;background:linear-gradient(160deg,rgba(255,255,255,.13),rgba(10,10,34,.58));border:1px solid var(--line);-webkit-backdrop-filter:blur(14px) saturate(130%);backdrop-filter:blur(14px) saturate(130%);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 24px 60px rgba(5,5,25,.5)}
.t10-ph{background:radial-gradient(circle at 30% 20%,rgba(243,201,105,.25),transparent 55%),linear-gradient(135deg,#2a1f6e,#0a0a22)}
.t10 img.t10-failed{opacity:0}
.t10-reveal{opacity:0;transform:translateY(40px) scale(.97);transition:opacity 1s var(--ease),transform 1s var(--ease)}
.t10-reveal.t10-in{opacity:1;transform:none}
.t10-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 28px;border-radius:40px;border:1px solid rgba(255,240,200,.8);text-decoration:none;color:#3a1230!important;font:600 12px "Josefin Sans",sans-serif!important;letter-spacing:.2em;text-transform:uppercase;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#e8b64a,#fff1c1 30%,#f3c969 55%,#fff6d6 78%,#e8b64a);background-size:200% auto;box-shadow:0 10px 26px rgba(5,5,25,.5),inset 0 1px 0 rgba(255,255,255,.9);transition:transform .35s var(--ease),background-position .8s}
.t10-btn:hover{transform:translateY(-3px);background-position:100% 0}
.t10-btn:after,.t10-send:after{content:"";position:absolute;top:0;bottom:0;width:36%;left:-60%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);animation:t10-sweep 4s ease-in-out infinite}
@keyframes t10-sweep{0%,55%{left:-60%}100%{left:130%}}
.t10-btn-ghost{background:rgba(10,10,34,.6)!important;border:1.5px solid var(--gold)!important;color:var(--gold2)!important}
/* ===== golden gate ===== */
.t10-gate{position:fixed;inset:0;width:100%;height:100%;height:100dvh;z-index:900;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity 1s ease}
.t10-gate.t10-gone{opacity:0;pointer-events:none}
.t10-archwin{position:relative;width:min(78vw,400px);height:min(62vh,580px);margin-top:-2vh;border-radius:999px 999px 0 0;perspective:1700px;transform-origin:50% 62%;cursor:pointer;
  box-shadow:0 0 0 4px #f3c969,0 0 0 9px rgba(243,201,105,.25),0 0 70px 14px rgba(255,214,140,.4),0 0 0 200vmax #0a0a22;transition:transform 1.7s cubic-bezier(.75,0,.95,.35) .9s}
.t10-open .t10-archwin{transform:scale(7)}
.t10-door{position:absolute;top:0;bottom:0;width:50.4%;overflow:hidden;transition:transform 2.1s cubic-bezier(.6,.05,.2,1);
  background:radial-gradient(circle at var(--hx) 56%,#fff6cf 0 5px,#b9892b 6px 10px,transparent 11px),repeating-radial-gradient(circle at 50% 100%,transparent 0 24px,rgba(70,40,5,.22) 25px 26px),repeating-linear-gradient(45deg,rgba(70,40,5,.12) 0 2px,transparent 2px 18px),linear-gradient(90deg,#8d5f17,#f3c969 20%,#c9942f 50%,#f6d98a 80%,#7d5412)}
.t10-door:before{content:"";position:absolute;inset:16px 14px;border:1px solid rgba(70,40,5,.55);border-radius:300px 300px 4px 4px;box-shadow:inset 0 0 0 5px rgba(255,240,190,.18)}
.t10-door.l{left:0;transform-origin:0 50%;--hx:92%}
.t10-door.r{right:0;transform-origin:100% 50%;--hx:8%}
.t10-open .t10-door.l{transform:rotateY(-120deg)}
.t10-open .t10-door.r{transform:rotateY(120deg)}
.t10-seam{position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;z-index:3;background:linear-gradient(transparent,#fff8d8 20%,#fff8d8 80%,transparent);box-shadow:0 0 34px 16px rgba(255,236,170,.6);animation:t10-nur 2.6s ease-in-out infinite;transition:opacity .6s}
.t10-open .t10-seam{opacity:0}
@keyframes t10-nur{50%{box-shadow:0 0 54px 26px rgba(255,236,170,.85)}}
.t10-gtop,.t10-gbot{position:absolute;left:0;right:0;text-align:center;z-index:5;padding:0 16px;transition:opacity .6s,transform .8s var(--ease)}
.t10-gtop{top:max(14px,3.2vh)}
.t10-gbot{bottom:max(14px,3.2vh);display:flex;flex-direction:column;align-items:center;gap:10px}
.t10-open .t10-gtop,.t10-open .t10-gbot{opacity:0;transform:scale(1.15);pointer-events:none}
.t10-gk{font:400 clamp(9px,1.4vh,11px) "Josefin Sans",sans-serif;letter-spacing:.4em;color:var(--gold2)}
.t10-gnames{font:700 clamp(20px,4.2vh,34px)/1.25 "Cinzel Decorative",serif;margin:6px 0 0}
.t10-gguest{font:italic 400 clamp(15px,2.3vh,19px) Amiri,serif;color:var(--gold2)}
.t10-key{min-height:48px;padding:0 26px;border-radius:40px;border:1.5px solid var(--gold);background:rgba(243,201,105,.14);color:var(--gold2);font:600 12px "Josefin Sans",sans-serif;letter-spacing:.24em;text-transform:uppercase;animation:t10-pulse 2.6s ease-in-out infinite}
@keyframes t10-pulse{50%{box-shadow:0 0 28px 4px rgba(243,201,105,.55);transform:scale(1.04)}}
.t10-flash{position:fixed;inset:0;z-index:901;background:radial-gradient(circle,rgba(255,246,214,.95),rgba(255,200,150,.4) 50%,transparent 78%);opacity:0;pointer-events:none}
.t10-flash.t10-on{animation:t10-fl 1.3s ease 1.5s forwards}
@keyframes t10-fl{0%{opacity:0}30%{opacity:.85}100%{opacity:0}}
/* ===== hero ===== */
.t10-hero{position:relative;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:clamp(40px,8vh,80px) 18px 120px}
.t10-mihrab{position:relative;width:min(94vw,540px);padding:clamp(80px,14vw,120px) 26px 40px;border-radius:999px 999px 28px 28px;border:1.5px solid var(--gold);background:radial-gradient(ellipse at 50% 20%,rgba(255,200,230,.22),transparent 60%),linear-gradient(180deg,rgba(42,31,110,.55),rgba(10,10,34,.7));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 0 0 8px rgba(243,201,105,.08),0 0 90px rgba(255,143,184,.28),0 30px 60px rgba(5,5,25,.5);overflow:hidden}
.t10-mihrab:before{content:"";position:absolute;inset:10px;border:1px solid rgba(243,201,105,.35);border-radius:999px 999px 20px 20px;pointer-events:none}
.t10-mihrab-img{position:absolute;inset:0;background-size:cover;background-position:center top;opacity:.28;mix-blend-mode:screen}
.t10-mihrab>*:not(.t10-mihrab-img){position:relative}
.t10-invoc{font:400 11px "Josefin Sans",sans-serif;letter-spacing:.36em;color:var(--gold2);margin:0 0 12px;text-transform:uppercase}
.t10-hero .t10-lab{display:block;margin-bottom:18px}
.t10-names{font:700 clamp(30px,9vw,58px)/1.18 "Cinzel Decorative",serif;margin:0 0 12px;filter:drop-shadow(0 0 22px rgba(255,200,150,.45)) drop-shadow(0 6px 14px rgba(0,0,0,.6))}
.t10-names .n{display:block}
.t10-names .and{display:block;font:italic 400 .55em/1.3 Amiri,serif;color:var(--lotus);margin:2px 0}
.t10-ch{display:inline-block;background:linear-gradient(180deg,#fff6d0,#f3c969 55%,#ffb38a);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.t10-sp{display:inline-block;width:.35em}
.t10-js:not(.t10-live) .t10-ch{opacity:0}
.t10-live .t10-ch{animation:t10-bloom 1.3s var(--ease) both;animation-delay:calc(var(--i)*55ms + .6s)}
@keyframes t10-bloom{0%{opacity:0;transform:translateY(40px) scale(.3) rotate(-12deg);filter:blur(8px)}100%{opacity:1;transform:none;filter:none}}
.t10-sub{max-width:380px;margin:6px auto 0;font:italic 400 19px/1.5 Amiri,serif;color:#fbe9f5;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.t10-gpill{display:inline-block;margin-top:22px;padding:8px 18px;border-radius:30px;border:1px solid var(--line);background:rgba(10,10,34,.5);font:400 10.5px "Josefin Sans",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--gold2)}
.t10-gboxes{display:inline-flex;align-items:center;justify-content:center;gap:12px;margin:12px auto 0;padding:6px 16px;border-radius:14px;background:rgba(10,10,34,.55);border:1px solid var(--line);cursor:pointer}
.t10-bstar{color:var(--gold);font-size:13px}
.t10-bcol{display:flex;flex-direction:column;align-items:center;gap:3px;opacity:.7;transition:opacity .2s}
.t10-bcol.active{opacity:1}
.t10-blab{font:italic 400 13px/1.2 Amiri,serif;color:var(--gold2)}
.t10-bval{min-width:44px;height:24px;padding:0 8px;border:1.2px solid rgba(243,201,105,.6);border-radius:4px;background:rgba(255,255,255,.08);color:#fff;font:600 12.5px/22px "Josefin Sans",sans-serif;display:grid;place-content:center}
.t10-bcol.active .t10-bval{border-color:var(--gold);background:rgba(243,201,105,.2)}
.t10-bdiv{width:1px;height:30px;background:rgba(243,201,105,.4)}
.t10-datebox{margin-top:26px;padding:20px clamp(14px,4vw,30px) 18px;border-radius:26px;width:min(94vw,480px)}
.t10-datebox .l{font:600 10px "Josefin Sans",sans-serif;letter-spacing:.4em;color:var(--lotus)}
.t10-datebox strong{display:block;font:700 clamp(18px,5vw,26px) "Cinzel Decorative",serif;letter-spacing:.08em;margin:4px 0 2px}
.t10-datebox em{font:italic 400 17px Amiri,serif;color:var(--gold2)}
.t10-rings{display:none;justify-content:center;gap:clamp(8px,2.6vw,16px);margin-top:16px;padding-top:16px;border-top:1px solid rgba(243,201,105,.25)}
.t10-rings.t10-live{display:flex}
.t10-ring{position:relative;width:clamp(58px,17vw,72px);aspect-ratio:1;display:grid;place-content:center;text-align:center}
.t10-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.t10-ring circle{fill:none;stroke-width:3.2}
.t10-ring .bg{stroke:rgba(255,255,255,.14)}
.t10-ring .fg{stroke:url(#t10g);stroke-linecap:round;stroke-dasharray:169.6;stroke-dashoffset:169.6;transition:stroke-dashoffset .9s ease;filter:drop-shadow(0 0 4px rgba(243,201,105,.7))}
.t10-ring b{display:block;font:700 clamp(15px,4.4vw,19px)/1.1 "Cinzel Decorative",serif;color:var(--gold2);font-variant-numeric:tabular-nums}
.t10-ring small{font:400 7.5px "Josefin Sans",sans-serif;letter-spacing:.2em;color:#fbd6e8}
.t10-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin-top:26px}
.t10-cue{margin:28px auto 0;font:400 9.5px "Josefin Sans",sans-serif;letter-spacing:.3em;color:var(--gold2);text-transform:uppercase}
.t10-cue i{display:block;width:1px;height:34px;margin:8px auto 0;background:linear-gradient(var(--gold),transparent);transform-origin:top;animation:t10-drip 2s ease-in-out infinite}
@keyframes t10-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
/* ===== dock ===== */
.t10-dock{position:fixed;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translate(-50%,120px);z-index:940;display:flex;gap:4px;padding:6px 8px;border-radius:40px;background:rgba(10,10,34,.78);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.55);transition:transform 1s var(--ease) .4s;max-width:96vw}
.t10-live .t10-dock{transform:translate(-50%,0)}
.t10-dk{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:56px;height:52px;border:0;border-radius:26px;background:transparent;color:var(--gold2);font-size:18px;line-height:1;transition:background .25s,transform .25s}
.t10-dk small{font:400 8.5px "Josefin Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f3d9ea}
.t10-dk:hover{background:rgba(243,201,105,.18);transform:translateY(-2px)}
.t10-dk[aria-pressed=true]{background:rgba(243,201,105,.28);box-shadow:inset 0 0 0 1px var(--gold)}
.t10-toast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,20px);z-index:960;padding:10px 20px;border-radius:30px;background:rgba(10,10,34,.88);border:1px solid var(--gold);color:var(--gold2);font:italic 400 16px Amiri,serif;opacity:0;pointer-events:none;transition:all .5s var(--ease);text-align:center;max-width:90vw}
.t10-toast.t10-show{opacity:1;transform:translate(-50%,0)}
/* ===== story: garden path ===== */
.t10-poem{max-width:430px;margin:0 auto 54px;text-align:center;font:italic 400 clamp(20px,4.8vw,25px)/1.75 Amiri,serif;color:#fff1f7;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.t10-path{position:relative;display:grid;gap:70px;padding:10px 0}
.t10-path:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:repeating-linear-gradient(var(--line) 0 8px,transparent 8px 16px)}
.t10-path:after{content:"";position:absolute;left:50%;top:0;width:3px;margin-left:-1.5px;height:var(--prog,0%);background:linear-gradient(var(--teal),var(--gold),var(--lotus));box-shadow:0 0 14px var(--gold);border-radius:3px}
.t10-stop{position:relative;display:grid;gap:18px;justify-items:center;text-align:center}
.t10-moon{position:relative;width:min(64vw,230px);aspect-ratio:1;border-radius:50%;padding:7px;background:var(--ink)}
.t10-moon:before{content:"";position:absolute;inset:-5px;border-radius:50%;background:conic-gradient(from 0deg,#f3c969,#ff8fb8,#1fa58f,#9b7bff,#f3c969);animation:t10-spin 9s linear infinite;z-index:-1;box-shadow:0 0 40px rgba(255,200,150,.35)}
.t10-moon img{width:100%;height:100%;object-fit:cover;border-radius:50%;filter:saturate(1.08)}
@keyframes t10-spin{to{transform:rotate(360deg)}}
.t10-card{padding:22px 24px 24px;border-radius:24px;max-width:360px}
.t10-card h3{font:700 19px "Cinzel Decorative",serif;margin:0 0 8px;color:var(--gold2)}
.t10-card p{font:400 17px/1.55 Amiri,serif;color:#fff1f7;margin:0}
/* ===== lotus date ===== */
.t10-lotus-wrap{display:grid;place-items:center;padding:20px 0}
.t10-lotus{position:relative;width:min(88vw,330px);aspect-ratio:1;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent}
.t10-pt{position:absolute;left:50%;bottom:50%;width:22%;height:46%;margin-left:-11%;transform-origin:50% 100%;border-radius:50% 50% 8% 8% / 90% 90% 10% 10%;background:linear-gradient(180deg,#fff6fb,#ff8fb8 60%,#d6407f);box-shadow:inset 0 -8px 16px rgba(150,20,80,.35),0 0 18px rgba(255,143,184,.4);transform:rotate(calc(var(--i)*45deg)) scaleY(.22);opacity:.9;transition:transform 1.5s var(--ease) calc(var(--i)*70ms)}
.t10-pt.in{width:17%;height:35%;margin-left:-8.5%;background:linear-gradient(180deg,#fffdf4,#ffd9a8 60%,#ffb38a);transform:rotate(calc(var(--i)*45deg + 22.5deg)) scaleY(.22)}
.t10-bloom .t10-pt{transform:rotate(calc(var(--i)*45deg)) scaleY(1)}
.t10-bloom .t10-pt.in{transform:rotate(calc(var(--i)*45deg + 22.5deg)) scaleY(1)}
.t10-core{position:absolute;left:50%;top:50%;width:44%;aspect-ratio:1;margin:-22% 0 0 -22%;border-radius:50%;display:grid;place-content:center;text-align:center;padding:8px;background:radial-gradient(circle at 35% 30%,#fffbe6,#ffe08a 45%,#d49a2c);box-shadow:0 0 50px 10px rgba(255,220,140,.55),inset 0 -8px 16px rgba(130,80,10,.4);color:#4a1230;transition:width 1.4s var(--ease) .5s,margin 1.4s var(--ease) .5s;animation:t10-pulse 3s ease-in-out infinite}
.t10-bloom .t10-core{width:58%;margin:-29% 0 0 -29%;animation:none}
.t10-hint{font:600 10px "Josefin Sans",sans-serif;letter-spacing:.2em;text-transform:uppercase}
.t10-bloom .t10-hint{display:none}
.t10-cdate{opacity:0;position:absolute;inset:0;display:grid;place-content:center;padding:8px;transition:opacity 1s ease 1.2s}
.t10-bloom .t10-cdate{opacity:1}
.t10-cdate small{font:600 8px "Josefin Sans",sans-serif;letter-spacing:.3em;color:#7a3a30}
.t10-cdate strong{font:700 clamp(12px,3.6vw,16px)/1.35 "Cinzel Decorative",serif;margin:3px 0}
.t10-cdate em{font:italic 400 13px Amiri,serif;color:#6a3a30}
.t10-addcal{display:block;text-align:center;margin-top:14px;font:400 12px "Josefin Sans",sans-serif;letter-spacing:.14em;color:var(--gold2)}
/* ===== events rail ===== */
.t10-railwrap{position:relative}
.t10-rail{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:20px max(20px,calc(50% - 150px)) 44px;perspective:1100px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.t10-rail::-webkit-scrollbar{display:none}
.t10-ec{flex:0 0 min(76vw,300px);scroll-snap-align:center;border-radius:150px 150px 22px 22px;overflow:hidden;transform:scale(var(--s,1)) rotateY(var(--r,0deg));opacity:var(--o,1);transition:transform .15s linear,opacity .15s linear;border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(10,10,34,.72));box-shadow:0 26px 50px rgba(5,5,25,.55);position:relative}
.t10-ec-img{position:relative;height:250px;margin:10px 10px 0;border-radius:140px 140px 10px 10px;overflow:hidden}
.t10-ec-img img{width:100%;height:100%;object-fit:cover;object-position:center top}
.t10-ec-img:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,34,.9),transparent 55%)}
.t10-ec-day{position:absolute;z-index:2;left:50%;bottom:12px;transform:translateX(-50%);padding:4px 14px;border-radius:20px;border:1px solid var(--gold);background:rgba(10,10,34,.6);font:600 9px "Josefin Sans",sans-serif;letter-spacing:.2em;color:var(--gold2);white-space:nowrap}
.t10-ec-b{padding:16px 20px 24px;text-align:center}
.t10-ec-b h3{font:700 19px/1.25 "Cinzel Decorative",serif;margin:0 0 2px;color:var(--gold2)}
.t10-ec-b .ic{font-size:24px}
.t10-ec-b small{display:block;font:400 12px "Noto Serif Devanagari",serif;color:var(--lotus);margin-bottom:8px}
.t10-meta{display:grid;gap:4px;font-size:13px;color:#fbeff6;margin:8px 0}
.t10-meta b{color:var(--gold);font-weight:600;margin-right:6px}
.t10-desc{font:400 16px/1.45 Amiri,serif;color:#f4e4ef;margin:0 0 12px}
.t10-dress{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 9px;border-radius:30px;border:1px solid var(--line);background:rgba(0,0,0,.22);font-size:11px}
.t10-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.6)}
.t10-nav{display:flex;justify-content:center;gap:14px;margin-top:-6px}
.t10-nav button{width:46px;height:46px;border-radius:50%;border:1.5px solid var(--gold);background:rgba(10,10,34,.6);color:var(--gold2);font-size:18px}
.t10-day{align-self:center;font:600 11px "Josefin Sans",sans-serif;letter-spacing:.3em;color:var(--gold2);text-transform:uppercase}
/* ===== venue ===== */
.t10-vgrid{display:grid;gap:22px;align-items:center}
.t10-vwin{position:relative;width:min(86vw,380px);height:min(110vw,480px);margin:0 auto;border-radius:999px 999px 18px 18px;overflow:hidden;border:2px solid var(--gold);box-shadow:0 0 0 8px rgba(243,201,105,.1),0 0 70px rgba(255,200,150,.25),0 30px 60px rgba(5,5,25,.55)}
.t10-vwin img{width:100%;height:100%;object-fit:cover}
.t10-vwin:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,10,34,.85),transparent 55%)}
.t10-vwin figcaption{position:absolute;z-index:1;left:20px;right:20px;bottom:20px;text-align:center;font:600 11px "Josefin Sans",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#fff1d6}
.t10-vcard{border-radius:24px;padding:28px 24px;text-align:center}
.t10-vcard h3{font:700 clamp(20px,5vw,26px)/1.3 "Cinzel Decorative",serif;margin:6px 0 10px}
.t10-vcard p{font:400 17px/1.5 Amiri,serif;color:#fbeff6;margin:0 0 18px}
.t10-trow{display:grid;grid-template-columns:30px 1fr;gap:12px;margin-top:14px;text-align:left}
.t10-trow>span{font-size:19px;color:var(--gold)}
.t10-trow p{font:400 15px/1.45 Amiri,serif;margin:0;color:#fbeff6}
/* ===== rsvp ===== */
.t10-rsvp{position:relative;max-width:480px;margin:0 auto;padding:clamp(28px,4vh,40px) clamp(20px,4vw,32px);border-radius:28px;background:linear-gradient(175deg,rgba(255,252,246,.98),rgba(255,238,232,.96));color:#2a1230;border:1.5px solid var(--gold);box-shadow:0 30px 80px rgba(5,5,25,.6),0 0 60px rgba(255,200,150,.25)}
.t10-stamp{position:absolute;top:16px;right:18px;width:40px;height:46px;background:#2a1f6e;border:2px dashed var(--gold);border-radius:4px;display:grid;place-content:center;color:var(--gold2);font:700 10px "Cinzel Decorative",serif;transform:rotate(4deg)}
.t10-rsvp h2{text-align:left;font:700 clamp(18px,4.6vw,23px)/1.35 "Cinzel Decorative",serif;color:#2a1f6e;margin:0 0 8px}
.t10-rintro{text-align:left;font:400 16px/1.5 Amiri,serif;color:#5a3f58;margin:0 0 20px}
.t10-field{margin:18px 0;text-align:left}
.t10-field label{display:block;font:600 10.5px "Josefin Sans",sans-serif;letter-spacing:.2em;color:#a03a74;margin-bottom:8px;text-transform:uppercase}
.t10-field input[type=text],.t10-field textarea{width:100%;display:block;background:#fff;border:1.5px solid #ecc9d9;border-radius:12px;padding:12px 14px;font:400 18px Amiri,serif;color:#2a1230;outline:none;transition:border-color .3s,box-shadow .3s}
.t10-field input[type=text]:focus,.t10-field textarea:focus{border-color:#b04a8a;box-shadow:0 0 0 3px rgba(255,143,184,.3)}
.t10-att{display:grid;gap:10px}
.t10-att-btn{width:100%;min-height:48px;padding:10px 16px;border-radius:14px;border:1.5px solid #ecc9d9;background:#fffafa;display:flex;align-items:center;gap:12px;color:#2a1230;font:700 17px Amiri,serif;text-align:left;transition:all .25s}
.t10-att-btn:hover{border-color:#b04a8a}
.t10-att-btn.selected{background:#2a1f6e;border-color:#2a1f6e;color:#fff8e6;box-shadow:0 6px 18px rgba(42,31,110,.4)}
.t10-radio{width:22px;height:22px;border-radius:50%;border:1.5px solid #cfa6bd;display:grid;place-content:center;font-size:13px;flex-shrink:0}
.t10-att-btn.selected .t10-radio{background:#fff;border-color:#fff;color:#2a1f6e}
.t10-stepper{display:flex;align-items:center;justify-content:space-between;background:#ffeef3;border:1.5px solid #ecc9d9;border-radius:30px;padding:4px 8px;max-width:280px}
.t10-step{width:36px;height:36px;border-radius:50%;border:0;background:#2a1f6e;color:#fff!important;font:700 22px/1 sans-serif!important;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.25);transition:transform .15s}
.t10-step:hover{transform:scale(1.1)}
.t10-step-val{font:700 17px Amiri,serif;color:#2a1f6e}
.t10-step-val strong{font-size:21px;margin-right:4px}
.t10-fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media(max-width:380px){.t10-fgrid{grid-template-columns:1fr}}
.t10-chip{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:10px 12px;border-radius:26px;border:1.5px solid #ecc9d9;background:#fff;cursor:pointer;user-select:none;position:relative;min-height:58px;text-align:center;transition:all .25s}
.t10-chip:hover{border-color:#2a1f6e}
.t10-chip.selected{background:#2a1f6e;border-color:#2a1f6e;box-shadow:0 4px 14px rgba(42,31,110,.35)}
.t10-chip input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.t10-chead{display:inline-flex;align-items:center;gap:8px;max-width:100%}
.t10-chk{width:20px;height:20px;border-radius:50%;border:1.5px solid #cfa6bd;color:transparent;display:grid;place-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.t10-chip.selected .t10-chk{background:#fff;border-color:#fff;color:#2a1f6e}
.t10-cname{font:600 12.5px "Josefin Sans",sans-serif;letter-spacing:.08em;color:#2a1f6e;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t10-chip.selected .t10-cname{color:#fff}
.t10-cdt{font:400 11px "Josefin Sans",sans-serif;letter-spacing:.08em;color:#8a6a80;text-transform:uppercase}
.t10-chip.selected .t10-cdt{color:#ffe2ef}
.t10-chip:last-child:nth-child(odd){grid-column:1/-1}
.t10-send{width:100%;margin-top:18px;min-height:54px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#3a1230!important;font:600 13px "Josefin Sans",sans-serif!important;letter-spacing:.14em;text-transform:uppercase;background:linear-gradient(120deg,#e8b64a,#fff1c1 32%,#f3c969 60%,#fff6d6 82%,#e8b64a);background-size:220% 100%;box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.8);display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:transform .35s var(--ease),background-position .8s}
.t10-send svg{width:20px;height:20px;fill:#3a1230;flex-shrink:0}
.t10-send:hover{transform:translateY(-3px);background-position:100% 0}
.t10-send:active{transform:scale(.98)}
.t10-rnote{text-align:center;font:italic 400 15px Amiri,serif;color:#7a5a74;margin:12px 0 0}
.t10-status{min-height:20px;margin:12px 0 0;font-size:12px;text-align:center;color:#2a1f6e;font-weight:600}
.t10-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.t10-contact{padding:9px 16px;border-radius:30px;border:1.5px solid #ecc9d9;background:#fff;color:#2a1f6e;text-decoration:none;font-size:12px;font-weight:600}
/* ===== finale ===== */
.t10-end{text-align:center;padding:50px 22px 150px}
.t10-seal{position:relative;width:min(70vw,230px);aspect-ratio:1;margin:0 auto 10px;display:grid;place-content:center}
.t10-seal svg{position:absolute;inset:0;width:100%;height:100%;animation:t10-spin 40s linear infinite}
.t10-seal svg text{font:600 9.5px "Josefin Sans",sans-serif;letter-spacing:.26em;fill:#ffe9a8}
.t10-mono{display:flex;align-items:center;gap:12px;font:700 clamp(34px,10vw,48px) "Cinzel Decorative",serif;filter:drop-shadow(0 0 18px rgba(255,200,150,.6))}
.t10-mono i{font:italic 400 .6em Amiri,serif;color:var(--lotus)}
.t10-blessing{font:italic 400 clamp(20px,4.6vw,26px)/1.5 Amiri,serif;color:#fff1f7;margin:14px auto 8px;max-width:380px;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.t10-love{font:400 11px "Josefin Sans",sans-serif;letter-spacing:.3em;color:var(--gold2);margin:16px auto 4px;text-transform:uppercase}
.t10-sig{font:700 clamp(12px,3vw,15px) "Cinzel Decorative",serif;letter-spacing:.14em;margin:4px auto 20px;text-transform:uppercase}
@media(min-width:760px){
  .t10 section{padding:120px 0}
  .t10-stop{grid-template-columns:1fr 1fr;gap:70px;align-items:center;text-align:left}
  .t10-stop:nth-child(even) .t10-moon{order:2;justify-self:start}
  .t10-stop:nth-child(odd) .t10-moon{justify-self:end}
  .t10-stop:nth-child(even) .t10-card{justify-self:end;text-align:right}
  .t10-stop:nth-child(odd) .t10-card{justify-self:start}
  .t10-vgrid{grid-template-columns:1fr 1fr;gap:50px}
  .t10-ec{flex-basis:310px}
}
@media(max-width:360px){.t10-wrap{padding:0 14px}.t10-dk{min-width:48px}}
@media(prefers-reduced-motion:reduce){.t10 *,.t10 *:before,.t10 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t10-js .t10-reveal{opacity:1!important;transform:none!important}.t10-js:not(.t10-live) .t10-ch{opacity:1}}
@media print{.t10-progress,.t10-gate,.t10-dock,.t10-cv,.t10-cue{display:none!important}.t10-js .t10-reveal{opacity:1!important;transform:none!important}}
`;

/* ---------- helpers for markup ---------- */
const splitName = name => [...clean(name)].map((c, i) => (c === ' ' ? '<span class="t10-sp"></span>' : `<span class="t10-ch" style="--i:${i}">${esc(c)}</span>`)).join('');
const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const evs = Array.isArray(events) ? events : [];
  const offset = clean(w.timezone_offset) || '+05:30';

  const brideRaw = clean(w.bride_name) || 'Bride';
  const groomRaw = clean(w.groom_name) || 'Groom';
  const [firstRaw, secondRaw] = clean(w.name_order) === 'bride_first' ? [brideRaw, groomRaw] : [groomRaw, brideRaw];
  const first = esc(firstRaw), second = esc(secondRaw);
  const init1 = esc(firstRaw.charAt(0) || 'R').toUpperCase();
  const init2 = esc(secondRaw.charAt(0) || 'A').toUpperCase();

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
  const signature = esc(clean(w.footer_text) || clean(w.families) || `The ${brideRaw.split(/\s+/).pop()} & ${groomRaw.split(/\s+/).pop()} Families`);
  const poem = esc(clean(w.poem) || 'Two hearts, one beautiful story, one promise, a lifetime of love. May every tomorrow shine brighter together.').replace(/(?<=[,.])\s+(?=[A-Z])/g, '<br>');

  const day = dparts(w.date);
  const dateLong = day ? longDate(day) : 'Date to be announced';
  const dateNums = day ? `${pad(day.d)} · ${pad(day.mo)} · ${day.y}` : 'To be announced';
  const dayName = day ? weekday(day) : '';
  const timeText = fmtTime(w.time);
  const t10Key = clean(w.theme || w.theme_name).toLowerCase();
  const t10Th = T10_THEMES[t10Key] || T10_THEMES.navy;
  const t10Vars = `--ink:${t10Th.ink};--lapis:${t10Th.lapis};--orch:${t10Th.orch};--peach:${t10Th.peach};--teal:${t10Th.teal};--lotus:${t10Th.lotus};--pearl:${t10Th.pearl};--gold:${t10Th.gold};--gold2:${t10Th.gold2};--line:${t10Th.line};background:${t10Th.bg};`;

  const defaultMusic = safeUrl(w.music_url) || 'invitation.mp3';
  const targetTs = parseWhen(w.date, w.time, offset) ?? parseWhen(w.date, '', offset);
  const stCal = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calDesc = encodeURIComponent(`We cordially invite you to celebrate the wedding of ${firstRaw} & ${secondRaw}.${where ? ` Venue: ${where.replace(/&amp;/g, '&')}.` : ''}`);
  const calUrl = targetTs
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding: ${firstRaw} & ${secondRaw}`)}&dates=${stCal(targetTs)}/${stCal(targetTs + 4 * 3600 * 1000)}&details=${calDesc}&location=${encodeURIComponent(where.replace(/&amp;/g, '&'))}` : '';

  const mapUrl = safeUrl(w.map_url) || (clean(w.venue) || clean(w.address)
    ? esc(`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: [w.venue, w.address].filter(Boolean).join(', ') })}`) : '');
  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || contacts[0] || '';
  const digits = phoneRaw.replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = wa.length >= 10;

  const heroImg = safeImg(w.hero_image);
  const venueImg = safeImg(w.venue_image) || U('1599661046827-dacff0c0f09a', 1000);
  const story = readStory(w.story);

  /* events: sorted, flat list for the carousel */
  const stamp = e => parseWhen(e.event_date, e.event_time, offset) ?? (dparts(e.event_date) ? Date.UTC(dparts(e.event_date).y, dparts(e.event_date).mo - 1, dparts(e.event_date).d) : Infinity);
  const sorted = [...evs].sort((a, b) => stamp(a) - stamp(b));
  const dayKeys = [];
  const cards = sorted.map(e => {
    const name = clean(e.event_name) || 'Celebration';
    const k = kindOf(name);
    const p = dparts(e.event_date);
    const key = p ? `${p.y}-${p.mo}-${p.d}` : 'tbd';
    if (!dayKeys.includes(key)) dayKeys.push(key);
    const dn = dayKeys.indexOf(key) + 1;
    const img = safeImg(e.image_url) || k.src || U(k.img);
    const loc = clean(e.venue || e.address) || clean(w.venue);
    const t = fmtTime(e.event_time);
    const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
    return `<article class="t10-ec">
      <div class="t10-ec-img t10-ph"><img src="${esc(img)}" data-fallback="${esc(U(k.alt))}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t10-ec-day">DAY ${dn}${p ? ` · ${esc(weekday(p).slice(0, 3))}, ${esc(shortDate(p))}` : ''}</span></div>
      <div class="t10-ec-b"><span class="ic" aria-hidden="true">${k.icon}</span><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}
        <div class="t10-meta">${t ? `<span><b>◷</b>${esc(t)}</span>` : ''}${loc ? `<span><b>⌖</b>${esc(loc)}</span>` : ''}</div>
        ${clean(e.description) ? `<p class="t10-desc">${esc(e.description)}</p>` : ''}
        ${clean(e.dress_code) ? `<div class="t10-dress"><span class="t10-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
      </div></article>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const fmtEventDate = e => { const p = dparts(e?.event_date) || dparts(w.date); return p ? `${p.d} ${MONTHS[p.mo - 1].slice(0, 3)}` : ''; };
  const rsvpFns = evs.length
    ? evs.map(e => ({ name: clean(e.event_name) || 'Celebration', date: fmtEventDate(e) }))
    : [{ name: 'Mehendi', date: '' }, { name: 'Sangeet', date: '' }, { name: 'Wedding', date: '' }, { name: 'Reception', date: '' }];

  const petals = (cls) => Array.from({ length: 8 }, (_, i) => `<span class="t10-pt ${cls}" style="--i:${i}"></span>`).join('');
  const ringU = (u, label) => `<div class="t10-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="27"/><circle class="fg" data-r="${u}" cx="32" cy="32" r="27"/></svg><div><b data-u="${u}">--</b><small>${label}</small></div></div>`;
  const sealTxt = `WITH LOVE &amp; BLESSINGS · ${first} &amp; ${second} · `;

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${STYLE}</style>
<noscript><style>.t10-gate,.t10-dock{display:none!important}.t10.t10-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t10-reveal{opacity:1!important;transform:none!important}.t10 .t10-pt{transform:rotate(calc(var(--i)*45deg)) scaleY(1)!important}.t10 .t10-pt.in{transform:rotate(calc(var(--i)*45deg + 22.5deg)) scaleY(1)!important}.t10-cdate{opacity:1!important}.t10-hint{display:none}.t10-ch{opacity:1!important}</style></noscript>
<div class="t10 t10-js t10-locked" style="${t10Vars}" data-when="${esc(String(targetTs ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${esc(defaultMusic)}">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="t10g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1fa58f"/><stop offset=".5" stop-color="#f3c969"/><stop offset="1" stop-color="#ff8fb8"/></linearGradient></defs></svg>
  <div class="t10-progress" aria-hidden="true"></div>
  <div class="t10-toast" role="status" aria-live="polite"></div>

  <div class="t10-gate" role="dialog" aria-label="Wedding invitation entry">
    <div class="t10-gtop"><div class="t10-gk">THE GATES OF JANNAT BAGH</div><p class="t10-gnames t10-gold">${first} &amp; ${second}</p></div>
    <div class="t10-archwin" data-open>
      <div class="t10-door l" aria-hidden="true"></div><div class="t10-door r" aria-hidden="true"></div><div class="t10-seam" aria-hidden="true"></div>
    </div>
    <div class="t10-gbot"><div class="t10-gguest">Dear ${guestLine}, the garden awaits you</div>
      <button class="t10-key" type="button" data-open aria-label="Open the gates">Open the gates</button></div>
  </div>
  <div class="t10-flash" aria-hidden="true"></div>

  <main class="t10-main">
    <header class="t10-hero" data-hero>
      <div class="t10-mihrab">
        ${heroImg ? `<div class="t10-mihrab-img" style="background-image:url('${esc(heroImg)}')" aria-hidden="true"></div>` : ''}
        <div class="t10-invoc">${invocation}</div>
        <span class="t10-lab">Together with their families</span>
        <h1 class="t10-names" aria-label="${first} and ${second}"><span class="n" aria-hidden="true">${splitName(firstRaw)}</span><span class="and" aria-hidden="true">&amp;</span><span class="n" aria-hidden="true">${splitName(secondRaw)}</span></h1>
        <p class="t10-sub">invite you to step into their garden of forever</p>
        <div class="t10-gpill" id="t10-pill">Invited: ${guestLine}</div><br>
        <div class="t10-gboxes" id="t10-gboxes" data-family="${isFamily ? 'true' : 'false'}" data-base="${esc(baseGuest)}" data-count="${personsCount}" role="group" aria-label="Guest invite category">
          <span class="t10-bstar" aria-hidden="true">✦</span>
          <div class="t10-bcol${isFamily ? '' : ' active'}"><div class="t10-blab">Person</div><div class="t10-bval" data-box="person">${isFamily ? '—' : personsCount}</div></div>
          <i class="t10-bdiv" aria-hidden="true"></i>
          <div class="t10-bcol${isFamily ? ' active' : ''}"><div class="t10-blab">Family</div><div class="t10-bval" data-box="family">${isFamily ? '✓' : '✕'}</div></div>
          <span class="t10-bstar" aria-hidden="true">✦</span>
        </div>
      </div>
      <div class="t10-datebox t10-pan" aria-label="Save the date">
        <span class="l">SAVE THE DATE</span>
        <strong>${esc(dateNums)}</strong>
        <em>${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</em>
        <div class="t10-rings" role="timer">${ringU('d', 'DAYS')}${ringU('h', 'HRS')}${ringU('m', 'MIN')}${ringU('s', 'SEC')}</div>
      </div>
      <div class="t10-cta">
        ${calUrl ? `<a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="t10-btn">📅 &nbsp;Save the date</a>` : ''}
        <a href="#" data-goto="story" class="t10-btn t10-btn-ghost">Walk the garden ↓</a>
      </div>
      <div class="t10-cue" aria-hidden="true">Tap the sky for fireworks<i></i></div>
    </header>

    <section data-sec="story">
      <div class="t10-wrap">
        <div class="t10-head t10-reveal"><div class="t10-lab">The path through the garden</div><h2 class="t10-gold">Our Journey</h2>
          <p>Every love story is special. Ours is a collection of little moments that led us here.</p><div class="t10-orn"><span>✦</span></div></div>
        <p class="t10-poem t10-reveal">${poem}</p>
        <div class="t10-path" data-path>
          ${story.map(s => `<article class="t10-stop t10-reveal">
            <div class="t10-moon t10-ph"><img src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div>
            <div class="t10-card t10-pan"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}
        </div>
      </div>
    </section>

    <section>
      <div class="t10-wrap">
        <div class="t10-head t10-reveal"><div class="t10-lab">Pari ka paigaam</div><h2 class="t10-gold">Let the Lotus Bloom</h2>
          <p>Touch the golden heart and watch the lotus open to reveal our special day.</p></div>
        <div class="t10-lotus-wrap t10-reveal">
          <button class="t10-lotus" type="button" data-lotus aria-label="Touch to bloom the lotus and reveal the wedding date">
            ${petals('')}${petals('in')}
            <span class="t10-core"><span class="t10-hint">Touch<br>to bloom</span>
              <span class="t10-cdate"><small>${clean(w.surprise_message) ? 'A MESSAGE FOR YOU' : 'OUR WEDDING DAY'}</small>
                <strong>${clean(w.surprise_message) ? esc(w.surprise_message) : `${dayName ? esc(dayName) + '<br>' : ''}${esc(dateLong)}`}</strong><em>${esc(where)}</em></span></span>
          </button>
        </div>
        ${calUrl ? `<a class="t10-addcal" href="${calUrl}" target="_blank" rel="noopener noreferrer">📅 Add wedding to Google Calendar</a>` : ''}
      </div>
    </section>

    ${cards ? `<section>
      <div class="t10-wrap">
        <div class="t10-head t10-reveal"><div class="t10-lab">The festivities</div><h2 class="t10-gold">Wedding Celebrations</h2>
          <p>Swipe through the garden windows. Each one opens to a celebration we would love to share with you.</p><div class="t10-orn"><span>✦</span></div></div>
        <div class="t10-railwrap t10-reveal"><div class="t10-rail" data-rail>${cards}</div>
          <div class="t10-nav"><button type="button" data-nav="-1" aria-label="Previous celebration">←</button><button type="button" data-nav="1" aria-label="Next celebration">→</button></div></div>
      </div>
    </section>` : ''}

    <section>
      <div class="t10-wrap">
        <div class="t10-head t10-reveal"><div class="t10-lab">Join us</div><h2 class="t10-gold">The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <div class="t10-vgrid">
          <figure class="t10-vwin t10-ph t10-reveal"><img src="${esc(venueImg)}" data-fallback="${esc(U('1477587458883-47145ed94245', 1000))}" alt="${venue}" loading="lazy" decoding="async"><figcaption>${esc(where)}</figcaption></figure>
          <div>
            <div class="t10-vcard t10-pan t10-reveal">
              <div class="t10-lab">The wedding destination</div>
              <h3 class="t10-gold">${venue}</h3>
              <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
              ${mapUrl ? `<a class="t10-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;Get directions</a>` : ''}
              ${travel.length ? travel.map(([i, t]) => `<div class="t10-trow"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('') : ''}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section style="padding-bottom:60px">
      <div class="t10-wrap">
        <div class="t10-head t10-reveal"><div class="t10-lab">Your presence is our present</div><h2 class="t10-gold">Kindly RSVP</h2></div>
        <form class="t10-rsvp t10-reveal" data-rsvp novalidate>
          <div class="t10-stamp" aria-hidden="true"><span>${init1}&amp;${init2}</span></div>
          <h2>Will you grace us<br>with your presence?</h2>
          <p class="t10-rintro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
          ${canRsvp ? `
          <div class="t10-field"><label for="t10-name">Your name</label>
            <input id="t10-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required></div>
          <div class="t10-field"><label>Will you be joining us?</label>
            <div class="t10-att" role="radiogroup" aria-label="Will you be joining us?">
              <button type="button" class="t10-att-btn selected" data-att="Yes, we'll be there" aria-checked="true"><span class="t10-radio">✓</span><strong>Yes, we'll be there</strong></button>
              <button type="button" class="t10-att-btn" data-att="Sorry, can't make it" aria-checked="false"><span class="t10-radio"></span><strong>Sorry, can't make it</strong></button>
            </div>
            <input type="hidden" name="attendance" id="t10-att-val" value="Yes, we'll be there"></div>
          <div id="t10-details">
            <div class="t10-field"><label>How many of you?</label>
              <div class="t10-stepper">
                <button type="button" class="t10-step" data-step="-1" aria-label="Decrease guest count">−</button>
                <span class="t10-step-val"><strong id="t10-pc">${esc(guest?.persons || 1)}</strong> <span id="t10-pl">${(guest?.persons || 1) > 1 ? 'persons' : 'person'}</span></span>
                <button type="button" class="t10-step" data-step="1" aria-label="Increase guest count">+</button>
              </div>
              <input type="hidden" name="persons" id="t10-pv" value="${esc(guest?.persons || 1)}"></div>
            <div class="t10-field"><label>Which functions?</label>
              <div class="t10-fgrid" role="group" aria-label="Select functions">
                ${rsvpFns.map(f => `<label class="t10-chip selected"><input type="checkbox" name="functions" value="${esc(f.name)}" checked>
                  <div class="t10-chead"><span class="t10-chk" aria-hidden="true">✓</span><span class="t10-cname">${esc(f.name)}</span></div>
                  ${f.date ? `<span class="t10-cdt">${esc(f.date)}</span>` : ''}</label>`).join('')}
              </div></div>
            <div class="t10-field"><label for="t10-note">A note for the family (optional)</label>
              <textarea id="t10-note" name="note" rows="2" placeholder="Share your wishes..."></textarea></div>
          </div>
          <button class="t10-send" type="submit">${WA_ICON}<span>Send reply on WhatsApp</span></button>
          <p class="t10-rnote">Thank you. If WhatsApp did not open, tap the button once more.</p>
          <p class="t10-status" role="status" aria-live="polite"></p>` : ''}
          ${contacts.length ? `<div class="t10-contacts">${contacts.map(c => `<a class="t10-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form>
      </div>
    </section>

    <footer class="t10-end" data-finale>
      <div class="t10-seal"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="t10c" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"/></defs><text><textPath href="#t10c">${sealTxt}${sealTxt}</textPath></text></svg>
        <div class="t10-mono t10-gold" aria-label="${init1} and ${init2}"><span>${init1}</span><i>&amp;</i><span>${init2}</span></div></div>
      <p class="t10-blessing">Your presence is the blessing<br>we are waiting for</p>
      <p class="t10-love">With love,</p>
      <p class="t10-sig t10-gold">${signature}</p>
      <button class="t10-btn t10-btn-ghost" type="button" data-replay>🎆 &nbsp;Replay the celebration</button>
    </footer>
  </main>

  <nav class="t10-dock" aria-label="Celebration controls">
    <button class="t10-dk" type="button" data-fx="show" aria-label="Fireworks show">🎆<small>Aatish</small></button>
    <button class="t10-dk" type="button" data-fx="pataka" aria-label="Pataka crackers">💥<small>Pataka</small></button>
    <button class="t10-dk" type="button" data-fx="fuljhari" aria-pressed="false" aria-label="Fuljhari sparkler">✨<small>Fuljhari</small></button>
    <button class="t10-dk" type="button" data-fx="pari" aria-label="Call the Pari">🧚<small>Pari</small></button>
    <button class="t10-dk t10-music" type="button" aria-label="Toggle music" aria-pressed="false">♫<small>Music</small></button>
  </nav>
  <audio class="t10-audio" preload="auto" src="${esc(defaultMusic)}"></audio>
</div>`;
}

/* =====================================================================
   LIVE GARDEN STAGE — canvas: sky, garden, pari, fireworks, fuljhari
   ===================================================================== */
function createStage(host, doc, win, reduce) {
  const cv = doc.createElement('canvas');
  cv.className = 't10-cv'; cv.setAttribute('aria-hidden', 'true');
  host.insertBefore(cv, host.firstChild);
  const ctx = cv.getContext('2d');
  const R = (a, b) => a + Math.random() * (b - a);
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const SKY = [['#05051a', '#1a1250', '#3b1f66'], ['#231a66', '#a8467f', '#ff9d86'], ['#3d2f8a', '#d9689a', '#ffc58f']].map(s => s.map(hex));
  const PAL = [['#ffd36e', '#fff2b8'], ['#ff7eb6', '#ffd1e6'], ['#7ee8d0', '#d5fff4'], ['#9bb0ff', '#e1e7ff'], ['#ff9d5c', '#ffe0c4'], ['#d9a6ff', '#f1dcff']];
  const TYPES = ['peony', 'ring', 'heart', 'willow', 'crackle'];

  let W = 0, H = 0, dpr = 1, prog = 0, tgt = 0, sy = 0, flash = 0, T = 0, last = 0, raf = 0, alive = true;
  const parts = [], rockets = [], emit = [], lants = [], timers = [];
  const ptr = { x: 0, y: 0, on: false, mode: false };
  const pari = { x: 0, y: 0, dir: 1, call: 0, cx: 0, cy: 0 };
  const stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random() * .62, r: R(.4, 1.6), p: R(0, 6.3), s: R(.8, 2.4) }));
  const clouds = Array.from({ length: 6 }, () => ({ x: Math.random(), y: R(.08, .45), w: R(120, 260), v: R(.006, .02) }));
  const flies = Array.from({ length: 46 }, () => ({ x: Math.random(), y: R(.66, .98), p: R(0, 6.3), s: R(.3, 1) }));
  const trees = Array.from({ length: 18 }, (_, i) => ({ x: (i + R(.1, .9)) / 18, h: R(.07, .15), w: R(.012, .022) }));
  const blooms = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), c: ['#ff8fb8', '#ffd36e', '#ffffff', '#d9a6ff', '#ff9d7a'][Math.floor(Math.random() * 5)], p: R(0, 6.3) }));

  const resize = () => {
    W = win.innerWidth || 800; H = win.innerHeight || 600; dpr = Math.min(2, win.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!pari.x) { pari.x = W * .2; pari.y = H * .3; }
  };
  resize();

  const hy = (base, amp, f, ph, x, par) => base - par + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.3 + ph * 1.7) * amp * .35;
  const hill = (base, amp, f, ph, par, col) => {
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, hy(base, amp, f, ph, x, par));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };

  /* ---- particles ---- */
  const spawn = (x, y, vx, vy, life, col, size, g = .045, d = .985, k = 0) => {
    if (parts.length < 1600) parts.push({ x, y, vx, vy, l: life, m: life, c: col, s: size, g, d, k });
  };
  const burst = (x, y, type, pal) => {
    flash = Math.min(1, flash + .45);
    const [c1, c2] = pal;
    const n = type === 'ring' ? 64 : type === 'willow' ? 72 : type === 'mini' ? 14 : 96;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, c = Math.random() > .35 ? c1 : c2;
      if (type === 'ring') { const aa = i / n * 6.283; spawn(x, y, Math.cos(aa) * 4.6, Math.sin(aa) * 4.6, 70, c, 2, .03, .985); }
      else if (type === 'heart') { const t = i / n * 6.283; spawn(x, y, 16 * Math.pow(Math.sin(t), 3) * .27, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * .27, 80, c, 2.2, .025, .985); }
      else if (type === 'willow') spawn(x, y, Math.cos(a) * R(1, 4.6), Math.sin(a) * R(1, 4.6), 130, '#ffd36e', 1.8, .035, .978);
      else if (type === 'mini') spawn(x, y, Math.cos(a) * R(1, 4), Math.sin(a) * R(1, 4), 22, c, 1.5, .08, .96);
      else spawn(x, y, Math.cos(a) * R(.8, 1) * 5.4, Math.sin(a) * R(.8, 1) * 5.4, 75, c, 2, .045, .984, type === 'crackle' ? 2 : 0);
    }
  };
  const launch = (x, ty, type, pal) => rockets.push({ x: x ?? R(W * .12, W * .88), y: H + 10, vx: R(-.6, .6), vy: -R(10, 13), ty: ty ?? R(H * .12, H * .45), type: type || TYPES[Math.floor(Math.random() * TYPES.length)], pal: pal || PAL[Math.floor(Math.random() * PAL.length)] });
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const anaar = (x, secs = 3.2) => emit.push({ k: 'anaar', x, y: H * .93, t: secs });
  const chakri = (x, y, secs = 3.6) => emit.push({ k: 'chakri', x, y, t: secs, a: 0 });

  const api = {
    rocket: (x, y) => launch(x, y),
    show(n = 12) {
      if (reduce && n > 4) n = 4;
      for (let i = 0; i < n; i++) later(() => launch(null, null), i * 430);
      later(() => anaar(W * .14), 300); later(() => anaar(W * .86), 700);
      later(() => chakri(W * .3, H * .78), 1200); later(() => chakri(W * .7, H * .78), 1700);
    },
    pataka() {
      host.classList.add('t10-shake'); later(() => host.classList.remove('t10-shake'), 700);
      for (let i = 0; i < 16; i++) later(() => burst(R(W * .1, W * .9), R(H * .2, H * .8), 'mini', PAL[i % PAL.length]), i * 85);
      later(() => launch(null, null, 'crackle'), 700); later(() => launch(null, null, 'ring'), 950);
    },
    callPari(x, y) {
      pari.call = 4.2; pari.cx = x ?? W * .5; pari.cy = y ?? H * .42;
      later(() => {
        for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, s = R(.5, 3.4); spawn(pari.x, pari.y, Math.cos(a) * s, Math.sin(a) * s - .5, R(60, 110), ['#ffd1e6', '#fff2b8', '#d5fff4', '#e1e7ff'][i % 4], R(1.2, 2.6), .02, .985, 3); }
        flash = Math.min(1, flash + .3);
      }, 2200);
    },
    lanterns(n = 12) { for (let i = 0; i < n; i++) lants.push({ x: R(W * .05, W * .95), y: H + R(20, H * .6), vy: R(.28, .65), ph: R(0, 6.3), s: R(.7, 1.25) }); },
    finale() { api.show(16); api.lanterns(16); api.callPari(W * .5, H * .4); },
    setProg(p) { tgt = Math.max(0, Math.min(1, p)); },
    setScroll(y) { sy = y; },
    setMode(m) { ptr.mode = m; },
    ptr, resize
  };

  /* ---- drawing ---- */
  const palace = (cx, by, s, col, lit) => {
    ctx.fillStyle = col;
    const rect = (x, y, w, h) => ctx.fillRect(cx + x * s, by + y * s, w * s, h * s);
    const dome = (x, y, r) => { ctx.beginPath(); ctx.ellipse(cx + x * s, by + y * s, r * s, r * 1.3 * s, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(cx + (x - .6) * s, by + (y - r * 1.3 - 12) * s, 1.2 * s, 12 * s); };
    rect(-110, -62, 220, 62); dome(0, -62, 44);
    rect(-120, -80, 14, 80); dome(-113, -80, 8); rect(106, -80, 14, 80); dome(113, -80, 8);
    rect(-170, -50, 10, 50); dome(-165, -50, 6); rect(160, -50, 10, 50); dome(165, -50, 6);
    rect(-150, -34, 40, 34); dome(-130, -34, 14); rect(110, -34, 40, 34); dome(130, -34, 14);
    ctx.fillStyle = `rgba(255,214,140,${lit})`;
    for (let i = -4; i <= 4; i++) { ctx.fillRect(cx + (i * 22 - 5) * s, by + -44 * s, 10 * s, 22 * s); ctx.beginPath(); ctx.arc(cx + i * 22 * s, by - 44 * s, 5 * s, Math.PI, 0); ctx.fill(); }
    ctx.fillRect(cx - 4 * s, by - 100 * s, 8 * s, 16 * s);
  };
  const cypress = (x, y, h, w, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - w, y - h * .5, x, y - h); ctx.quadraticCurveTo(x + w, y - h * .5, x, y); ctx.fill(); };
  const lotus = (x, y, s) => { for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(i * .42); ctx.fillStyle = i % 2 ? '#ffd1e6' : '#ff8fb8'; ctx.beginPath(); ctx.ellipse(0, -7 * s, 3.2 * s, 8 * s, 0, 0, 6.283); ctx.fill(); ctx.restore(); } ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(x, y - 3 * s, 2 * s, 0, 6.283); ctx.fill(); };
  const star4 = (x, y, r, a) => { ctx.fillStyle = `rgba(255,246,208,${a})`; ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .25 : r, ang = i * Math.PI / 4; ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } ctx.closePath(); ctx.fill(); };

  const drawPari = () => {
    const s = Math.max(.8, Math.min(W, H) / 520), flap = Math.sin(T * 11) * .45;
    ctx.save(); ctx.translate(pari.x, pari.y); ctx.scale(s * pari.dir, s);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 80); g.addColorStop(0, 'rgba(255,205,235,.4)'); g.addColorStop(1, 'rgba(255,205,235,0)');
    ctx.fillStyle = g; ctx.fillRect(-80, -80, 160, 160);
    const wing = (rot, len, wd, a) => { ctx.save(); ctx.translate(-3, -6); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, -len * .5, wd, len * .5, 0, 0, 6.283); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); ctx.strokeStyle = 'rgba(255,225,250,.85)'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore(); };
    wing(-.75 - flap, 34, 9, .3); wing(-1.35 - flap * 1.1, 24, 7, .26); wing(-.55 + flap * .6, 20, 6, .22); wing(-1.0 + flap * .5, 16, 5, .2);
    ctx.beginPath(); ctx.moveTo(-3, 4); ctx.bezierCurveTo(-22, 8 + Math.sin(T * 4) * 3, -34, 26, -46 + Math.sin(T * 3) * 4, 40); ctx.bezierCurveTo(-30, 24, -14, 20, 0, 12); ctx.fillStyle = 'rgba(255,225,245,.4)'; ctx.fill();
    const gw = ctx.createLinearGradient(0, 4, 0, 52); gw.addColorStop(0, '#ff8fb8'); gw.addColorStop(1, '#ffd7a8');
    ctx.beginPath(); ctx.moveTo(-5, 4); ctx.quadraticCurveTo(-22, 30, -28, 50 + Math.sin(T * 5) * 2); ctx.quadraticCurveTo(0, 60, 28, 50 - Math.sin(T * 5) * 2); ctx.quadraticCurveTo(22, 30, 5, 4); ctx.closePath(); ctx.fillStyle = gw; ctx.fill();
    ctx.fillStyle = '#ffb8d4'; ctx.beginPath(); ctx.ellipse(0, -2, 6, 10, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2a1233'; ctx.beginPath(); ctx.moveTo(-3, -22); ctx.bezierCurveTo(-22, -18, -26, 6, -16 + Math.sin(T * 4) * 3, 22); ctx.bezierCurveTo(-12, 6, -8, -10, 2, -14); ctx.fill();
    ctx.fillStyle = '#ffdcc4'; ctx.beginPath(); ctx.arc(1, -16, 6.5, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2a1233'; ctx.beginPath(); ctx.arc(0, -19, 6.8, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffd36e'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-4 + i * 2.6, -24.5 + Math.abs(i - 2) * 1.3, 1, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(23, -22); ctx.stroke();
    star4(23, -22, 7 + Math.sin(T * 8) * 1.5, 1);
    ctx.restore();
    if (Math.random() < .8) spawn(pari.x + pari.dir * 23 * s, pari.y - 22 * s, R(-.4, .4) - pari.dir * .4, R(-.2, .6), R(40, 90), ['#ffd1e6', '#fff2b8', '#d5fff4', '#e1e7ff'][Math.floor(Math.random() * 4)], R(1, 2.4), .015, .99, 3);
  };

  const drawLant = l => {
    const s = l.s, x = l.x + Math.sin(T * .8 + l.ph) * 14;
    ctx.save(); ctx.translate(x, l.y);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 46 * s); g.addColorStop(0, 'rgba(255,190,90,.55)'); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.fillRect(-50 * s, -50 * s, 100 * s, 100 * s);
    const b = ctx.createLinearGradient(0, -12 * s, 0, 12 * s); b.addColorStop(0, '#ffe6a0'); b.addColorStop(1, '#ff8a3c');
    ctx.beginPath(); ctx.moveTo(-8 * s, -12 * s); ctx.lineTo(8 * s, -12 * s); ctx.lineTo(12 * s, 11 * s); ctx.lineTo(-12 * s, 11 * s); ctx.closePath(); ctx.fillStyle = b; ctx.fill();
    ctx.strokeStyle = 'rgba(120,50,10,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-10 * s, -2 * s); ctx.lineTo(10 * s, -2 * s); ctx.stroke();
    ctx.restore();
  };

  const frame = now => {
    if (!alive) return;
    raf = win.requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; T += dt;
    const k = dt * 60;
    prog += (tgt - prog) * Math.min(1, .06 * k);
    const sky = (() => { const a = prog < .5 ? 0 : 1, t = prog < .5 ? prog * 2 : (prog - .5) * 2; return SKY[a].map((c, i) => mix(c, SKY[a + 1][i], t)); })();
    const par = Math.min(sy, H * 4);

    const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, rgba(sky[0])); sg.addColorStop(.55, rgba(sky[1])); sg.addColorStop(1, rgba(sky[2]));
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

    const nightA = Math.max(0, 1 - prog * 1.5);
    if (nightA > 0) {
      stars.forEach(s => { const a = nightA * (.45 + .55 * Math.sin(T * s.s + s.p)); ctx.fillStyle = `rgba(255,248,225,${a})`; ctx.beginPath(); ctx.arc(s.x * W, s.y * H - par * .01, s.r, 0, 6.283); ctx.fill(); });
      const mx = W * .78, my = H * .17, mg = ctx.createRadialGradient(mx, my, 6, mx, my, 110); mg.addColorStop(0, `rgba(255,248,225,${.5 * nightA})`); mg.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.fillStyle = mg; ctx.fillRect(mx - 110, my - 110, 220, 220);
      ctx.fillStyle = `rgba(255,250,235,${.95 * nightA})`; ctx.beginPath(); ctx.arc(mx, my, 26, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgba(sky[0], nightA); ctx.beginPath(); ctx.arc(mx + 11, my - 6, 23, 0, 6.283); ctx.fill();
    }
    if (prog > .05) {
      const sx = W * .3, sy2 = H * (.84 - prog * .36), sgr = ctx.createRadialGradient(sx, sy2, 10, sx, sy2, H * .55);
      sgr.addColorStop(0, `rgba(255,224,160,${.95 * prog})`); sgr.addColorStop(.25, `rgba(255,170,130,${.45 * prog})`); sgr.addColorStop(1, 'rgba(255,150,130,0)');
      ctx.fillStyle = sgr; ctx.fillRect(0, 0, W, H);
    }
    clouds.forEach(c => { const x = ((c.x * W + T * c.v * W * 4) % (W + 500)) - 250, y = c.y * H - par * .02; ctx.fillStyle = `rgba(255,214,236,${.12 + prog * .14})`; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x + i * c.w * .22, y + (i % 2) * 8, c.w * .3, 22, 0, 0, 6.283); ctx.fill(); } });

    const far = mix(sky[2], [30, 40, 100], .55), mid = mix(sky[2], [10, 70, 80], .72), near = mix(sky[2], [4, 34, 44], .92);
    const fb = H * .70, mb = H * .80, nb = H * .935;
    hill(fb, H * .025, .004, .6, par * .02, rgba(far));
    const pcx = W * .5;
    palace(pcx, hy(fb, H * .025, .004, .6, pcx, par * .02) + 6, Math.max(.7, Math.min(W, H) / 520), rgba(mix(sky[2], [20, 24, 70], .72)), .15 + nightA * .8);
    hill(mb, H * .03, .006, 1.2, par * .035, rgba(mid));
    trees.forEach(t => { const x = t.x * W; cypress(x, hy(mb, H * .03, .006, 1.2, x, par * .035) + 4, t.h * H, t.w * W + 3, rgba(mix(mid, [4, 40, 40], .5))); });
    const py = H * .905 - par * .04;
    const pg = ctx.createLinearGradient(0, py - 20, 0, py + 20); pg.addColorStop(0, rgba(mix(sky[1], [255, 255, 255], .25), .75)); pg.addColorStop(1, rgba(sky[2], .5));
    ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(W * .5, py, W * .36, H * .034, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const r = ((T * .35 + i / 3) % 1); ctx.globalAlpha = 1 - r; ctx.beginPath(); ctx.ellipse(W * .5, py, W * .36 * r, H * .034 * r, 0, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1;
    [.34, .44, .56, .66].forEach((fx, i) => lotus(W * fx, py + (i % 2 ? 6 : -3), Math.max(.9, W / 700)));
    hill(nb, H * .014, .01, 2.5, par * .06, rgba(near));
    blooms.forEach(b => { const x = b.x * W, y = hy(nb, H * .014, .01, 2.5, x, par * .06) + 6 + b.y * (H * .05), sw = Math.sin(T * 1.6 + b.p) * 1.6; ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(x + sw, y, 2.1, 0, 6.283); ctx.fill(); });

    ctx.globalCompositeOperation = 'lighter';
    const fa = .25 + nightA * .75;
    flies.forEach(f => { const x = (f.x * W + Math.sin(T * .5 * f.s + f.p) * 40 + W) % W, y = f.y * H + Math.cos(T * .7 * f.s + f.p) * 22, a = fa * (.4 + .6 * Math.sin(T * 2 * f.s + f.p) ** 2); const g = ctx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, `rgba(255,240,150,${a})`); g.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - 7, y - 7, 14, 14); });
    ctx.globalCompositeOperation = 'source-over';

    /* pari motion */
    let tx = W * (.5 + .36 * Math.sin(T * .32)), ty = H * (.3 + .09 * Math.sin(T * .8));
    if (pari.call > 0) { pari.call -= dt; tx = pari.cx; ty = pari.cy; }
    else if (ptr.on && !ptr.mode) { tx = ptr.x + 60; ty = ptr.y - 40; }
    if (!reduce || pari.call > 0) { const ox = pari.x; pari.x += (tx - pari.x) * .02 * k; pari.y += (ty - pari.y) * .02 * k; const dx = pari.x - ox; if (Math.abs(dx) > .15) pari.dir += ((dx > 0 ? 1 : -1) - pari.dir) * .12; }
    drawPari();
    lants.forEach(l => { l.y -= l.vy * k; drawLant(l); });
    for (let i = lants.length - 1; i >= 0; i--) if (lants[i].y < -70) lants.splice(i, 1);

    /* rockets */
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; r.x += r.vx * k; r.y += r.vy * k; r.vy *= Math.pow(.987, k);
      spawn(r.x, r.y, R(-.3, .3), R(.4, 1.2), 22, '#ffe9a8', 1.6, .02, .97);
      if (r.y <= r.ty || r.vy > -1.6) { burst(r.x, r.y, r.type, r.pal); rockets.splice(i, 1); }
    }
    /* emitters: anaar + chakri */
    for (let i = emit.length - 1; i >= 0; i--) {
      const e = emit[i]; e.t -= dt;
      if (e.k === 'anaar') for (let j = 0; j < 7; j++) spawn(e.x + R(-4, 4), e.y, R(-1.6, 1.6), -R(7, 11), 55, Math.random() > .4 ? '#ffd36e' : '#ffffff', 1.8, .16, .99);
      else { e.a += .45 * k; for (let j = 0; j < 3; j++) { const a = e.a + j * 2.09; spawn(e.x + Math.cos(a) * 14, e.y + Math.sin(a) * 14, -Math.sin(a) * 4.2 + Math.cos(a) * 1.2, Math.cos(a) * 4.2 + Math.sin(a) * 1.2, 34, j % 2 ? '#ff9d5c' : '#ffe08a', 1.8, .03, .97); } }
      if (e.t <= 0) emit.splice(i, 1);
    }
    /* fuljhari */
    if (ptr.on && ptr.mode) {
      for (let j = 0; j < 8; j++) { const a = Math.random() * 6.283, s = R(.5, 4.8); spawn(ptr.x, ptr.y, Math.cos(a) * s, Math.sin(a) * s - .6, R(14, 36), Math.random() > .5 ? '#ffffff' : '#ffd36e', 1.3, .1, .94, 1); }
      ctx.globalCompositeOperation = 'lighter'; const fg = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 36); fg.addColorStop(0, 'rgba(255,250,220,.95)'); fg.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = fg; ctx.fillRect(ptr.x - 36, ptr.y - 36, 72, 72);
    }
    /* particles */
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx * k; p.y += p.vy * k; p.vy += p.g * k; const dr = Math.pow(p.d, k); p.vx *= dr; p.vy *= dr; p.l -= k;
      if (p.l <= 0) { if (p.k === 2 && Math.random() < .5) for (let j = 0; j < 4; j++) { const a = Math.random() * 6.283; spawn(p.x, p.y, Math.cos(a) * 1.8, Math.sin(a) * 1.8, 18, '#fff2b8', 1.2, .05, .95); } parts.splice(i, 1); continue; }
      const a = p.l / p.m; ctx.globalAlpha = a > 1 ? 1 : a;
      if (p.k === 3) { star4(p.x, p.y, p.s * 1.6 * a + .5, 1); }
      else { ctx.strokeStyle = p.c; ctx.lineWidth = p.s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 1.7, p.y - p.vy * 1.7); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    if (flash > .01) { ctx.fillStyle = `rgba(255,230,200,${flash * .13})`; ctx.fillRect(0, 0, W, H); flash *= Math.pow(.9, k); }
    ctx.globalCompositeOperation = 'source-over';
  };

  const onVis = () => { if (doc.hidden) { win.cancelAnimationFrame(raf); } else { last = performance.now(); raf = win.requestAnimationFrame(frame); } };
  doc.addEventListener('visibilitychange', onVis);
  raf = win.requestAnimationFrame(frame);

  api.destroy = () => {
    alive = false; win.cancelAnimationFrame(raf); doc.removeEventListener('visibilitychange', onVis);
    timers.forEach(clearTimeout); cv.remove(); parts.length = rockets.length = emit.length = lants.length = 0;
  };
  return api;
}

/* ---------- mount: interactivity ---------- */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  const host = root?.classList?.contains('t10') ? root : root?.querySelector?.('.t10');
  if (!host) return () => {};
  if (typeof host._t10Cleanup === 'function') host._t10Cleanup();

  const doc = host.ownerDocument || document;
  const win = doc.defaultView || window;
  if (!doc.querySelector('link[data-t10-fonts]')) {
    const l = doc.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-t10-fonts', '');
    (doc.head || doc.body).appendChild(l);
  }

  const $ = (s, r = host) => r.querySelector(s);
  const $$ = (s, r = host) => [...r.querySelectorAll(s)];
  const reduce = typeof win.matchMedia === 'function' ? win.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const undo = [], timers = [];
  const on = (t, e, f, o) => { if (t) { t.addEventListener(e, f, o); undo.push(() => t.removeEventListener(e, f, o)); } };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

  host.classList.add('t10-js');
  const prevHtml = doc.documentElement.style.overflow, prevBody = doc.body.style.overflow;
  doc.documentElement.style.overflow = 'hidden';
  doc.body.style.overflow = 'hidden';
  win.scrollTo?.(0, 0);

  /* image fallbacks */
  $$('img').forEach(img => {
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t10-failed');
    };
    on(img, 'error', fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  });

  /* live garden */
  const stage = createStage(host, doc, win, reduce);
  on(win, 'resize', () => stage.resize());

  /* toast */
  const toast = $('.t10-toast');
  let tId = 0;
  const say = msg => { if (!toast) return; toast.textContent = msg; toast.classList.add('t10-show'); clearTimeout(tId); tId = setTimeout(() => toast.classList.remove('t10-show'), 2600); timers.push(tId); };

  /* music */
  const musicBtn = $('.t10-music');
  const audioEl = $('.t10-audio') || new Audio(host.dataset.music || 'invitation.mp3');
  audioEl.loop = false;
  if (win.__t10Audio && win.__t10Audio !== audioEl) { try { win.__t10Audio.pause(); } catch (_) {} }
  win.__t10Audio = audioEl;
  const setMusic = p => {
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', String(p));
    musicBtn.setAttribute('aria-label', p ? 'Stop music' : 'Play music');
    musicBtn.firstChild.textContent = p ? '♪' : '♫';
  };
  on(musicBtn, 'click', () => {
    if (audioEl.paused) audioEl.play().then(() => setMusic(true)).catch(() => {});
    else { audioEl.pause(); setMusic(false); }
  });
  on(audioEl, 'ended', () => setMusic(false));
  undo.push(() => { try { audioEl.pause(); } catch (_) {} setMusic(false); if (win.__t10Audio === audioEl) win.__t10Audio = null; });

  /* golden gate */
  const gate = $('.t10-gate'), flashEl = $('.t10-flash');
  let opened = false;
  const open = () => {
    if (opened || !gate) return;
    opened = true;
    gate.classList.add('t10-open');
    host.classList.add('t10-open');
    flashEl?.classList.add('t10-on');
    if (audioEl.paused) audioEl.play().then(() => setMusic(true)).catch(() => {});
    later(() => { stage.callPari(win.innerWidth * .5, win.innerHeight * .34); stage.show(reduce ? 3 : 9); stage.lanterns(8); }, 1500);
    later(() => gate.classList.add('t10-gone'), 2700);
    later(() => {
      gate.remove(); flashEl?.remove();
      host.classList.remove('t10-locked', 't10-open');
      host.classList.add('t10-live');
      doc.documentElement.style.overflow = 'auto';
      doc.body.style.overflow = 'visible';
      win.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
      onScroll();
    }, 3500);
  };
  $$('[data-open]').forEach(el => on(el, 'click', open));

  /* dock */
  const fuj = $('[data-fx="fuljhari"]');
  $$('[data-fx]').forEach(b => on(b, 'click', e => {
    e.stopPropagation();
    const fx = b.dataset.fx;
    if (fx === 'show') { stage.show(12); say('Aatishbazi shuru! 🎆'); }
    else if (fx === 'pataka') { stage.pataka(); say('Dhoom dhadaka! 💥'); }
    else if (fx === 'pari') {
      stage.callPari(); say(['Pari blesses the couple ✦', 'A little magic for your forever ✦', 'Pari ne dua di ✦'][Math.floor(Math.random() * 3)]);
    } else if (fx === 'fuljhari') {
      const m = fuj.getAttribute('aria-pressed') !== 'true';
      fuj.setAttribute('aria-pressed', String(m)); stage.setMode(m);
      say(m ? 'Fuljhari ON: move your finger or cursor ✨' : 'Fuljhari off');
    }
  }));

  /* pointer: fuljhari + tap for rockets */
  const setPtr = (x, y, onFlag) => { stage.ptr.x = x; stage.ptr.y = y; stage.ptr.on = onFlag; };
  on(win, 'pointermove', e => { if (e.pointerType !== 'touch') setPtr(e.clientX, e.clientY, true); });
  on(doc.documentElement, 'mouseleave', () => { stage.ptr.on = false; });
  const touch = e => { const t = e.touches[0]; if (t) setPtr(t.clientX, t.clientY, true); };
  on(win, 'touchstart', touch, { passive: true });
  on(win, 'touchmove', touch, { passive: true });
  on(win, 'touchend', () => { stage.ptr.on = false; }, { passive: true });
  on(win, 'touchcancel', () => { stage.ptr.on = false; }, { passive: true });
  on(host, 'click', e => {
    if (!opened || e.target.closest('a,button,input,textarea,label,form,.t10-pan,.t10-rail,.t10-dock,.t10-gate')) return;
    stage.rocket(e.clientX, e.clientY);
  });

  /* smooth anchor */
  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    const t = $(`[data-sec="${a.dataset.goto}"]`);
    if (t) win.scrollTo?.({ top: t.getBoundingClientRect().top + (win.scrollY ?? doc.documentElement.scrollTop ?? 0), behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* guest person / family toggle */
  const gb = $('#t10-gboxes'), pill = $('#t10-pill');
  on(gb, 'click', () => {
    const fam = gb.dataset.family !== 'true';
    gb.dataset.family = String(fam);
    const base = gb.dataset.base || 'Respected Guest', count = gb.dataset.count || '1';
    const [cp, cf] = $$('.t10-bcol', gb);
    cp?.classList.toggle('active', !fam); cf?.classList.toggle('active', fam);
    $('[data-box="person"]', gb).textContent = fam ? '—' : count;
    $('[data-box="family"]', gb).textContent = fam ? '✓' : '✕';
    if (pill) pill.textContent = `Invited: ${base}${fam ? ' & Family' : ''}`;
  });

  /* scroll: sky progress, path growth, bar */
  const bar = $('.t10-progress'), pathEl = $('[data-path]');
  let tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    win.requestAnimationFrame(() => {
      const y = win.scrollY ?? doc.documentElement.scrollTop ?? 0, vh = win.innerHeight || 800;
      const max = (doc.documentElement.scrollHeight || vh) - vh, p = max > 0 ? Math.min(1, y / max) : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      stage.setProg(opened ? p : 0); stage.setScroll(y);
      if (pathEl) { const r = pathEl.getBoundingClientRect(); pathEl.style.setProperty('--prog', Math.max(0, Math.min(100, (vh * .65 - r.top) / r.height * 100)) + '%'); }
      tick = false;
    });
  }
  on(win, 'scroll', onScroll, { passive: true });
  onScroll();

  /* reveals */
  if (typeof IntersectionObserver !== 'undefined') {
    const obs = new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * 90}ms`; e.target.classList.add('t10-in'); obs.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.t10-reveal').forEach(el => obs.observe(el));
    undo.push(() => obs.disconnect());
  } else $$('.t10-reveal').forEach(el => el.classList.add('t10-in'));

  /* grand finale when the footer is reached */
  const finale = $('[data-finale]');
  let finaleDone = false;
  if (finale && typeof IntersectionObserver !== 'undefined') {
    const fo = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting) && opened && !finaleDone) { finaleDone = true; stage.finale(); say('Aap sabhi ka intezaar rahega ✦'); }
    }, { threshold: .55 });
    fo.observe(finale); undo.push(() => fo.disconnect());
  }
  on($('[data-replay]'), 'click', () => stage.finale());

  /* ring countdown */
  const when = Number(host.dataset.when), rings = $('.t10-rings');
  if (when && rings) {
    const C = 169.6;
    const set = (k, v, frac) => {
      const el = $(`[data-u="${k}"]`, rings), fg = $(`[data-r="${k}"]`, rings);
      if (el) el.textContent = pad(v);
      if (fg) fg.style.strokeDashoffset = String(C * (1 - Math.max(0, Math.min(1, frac))));
    };
    const step = () => {
      const s = Math.max(0, Math.floor((when - Date.now()) / 1000)), d = Math.floor(s / 86400);
      set('d', d, Math.min(d, 365) / 365); set('h', Math.floor(s % 86400 / 3600), (s % 86400 / 3600) / 24);
      set('m', Math.floor(s % 3600 / 60), (s % 3600 / 60) / 60); set('s', s % 60, (s % 60) / 60);
    };
    rings.classList.add('t10-live'); step();
    timers.push(setInterval(step, 1000));
  }

  /* lotus bloom */
  const lotus = $('[data-lotus]');
  on(lotus, 'click', () => {
    if (lotus.classList.contains('t10-bloom')) { stage.show(5); return; }
    lotus.classList.add('t10-bloom');
    const r = lotus.getBoundingClientRect();
    stage.rocket(r.left + r.width / 2, Math.max(60, r.top - 40));
    later(() => stage.show(7), 500);
    stage.callPari(r.left + r.width / 2 + 70, Math.max(80, r.top));
    stage.lanterns(5);
  });

  /* events rail: coverflow */
  const rail = $('[data-rail]');
  if (rail) {
    const cardsEl = $$('.t10-ec', rail);
    let rt = false;
    const layout = () => {
      const rr = rail.getBoundingClientRect(), c = rr.left + rr.width / 2;
      cardsEl.forEach(el => {
        const r = el.getBoundingClientRect(), d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - c) / (rr.width * .55)));
        el.style.setProperty('--s', String(1 - Math.abs(d) * .12)); el.style.setProperty('--r', (-d * 16) + 'deg'); el.style.setProperty('--o', String(1 - Math.abs(d) * .4));
      });
      rt = false;
    };
    on(rail, 'scroll', () => { if (!rt) { rt = true; win.requestAnimationFrame(layout); } }, { passive: true });
    on(win, 'resize', layout);
    later(layout, 400);
    $$('[data-nav]').forEach(b => on(b, 'click', () => {
      const w1 = (cardsEl[0]?.getBoundingClientRect().width || 300) + 18;
      rail.scrollBy({ left: Number(b.dataset.nav) * w1, behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  /* RSVP via WhatsApp */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa || '';
  if (form) {
    const attBtns = $$('.t10-att-btn', form), attVal = $('#t10-att-val', form), details = $('#t10-details', form);
    attBtns.forEach(btn => on(btn, 'click', () => {
      attBtns.forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-checked', 'false'); const r = $('.t10-radio', b); if (r) r.textContent = ''; });
      btn.classList.add('selected'); btn.setAttribute('aria-checked', 'true');
      const r = $('.t10-radio', btn); if (r) r.textContent = '✓';
      if (attVal) attVal.value = btn.dataset.att;
      if (details) details.style.display = btn.dataset.att.startsWith('Yes') ? 'block' : 'none';
    }));

    const pc = $('#t10-pc', form), pl = $('#t10-pl', form), pv = $('#t10-pv', form);
    let count = Number(pv?.value || 1);
    $$('.t10-step', form).forEach(b => on(b, 'click', () => {
      count = Math.max(1, Math.min(20, count + Number(b.dataset.step || 0)));
      if (pc) pc.textContent = String(count);
      if (pl) pl.textContent = count > 1 ? 'persons' : 'person';
      if (pv) pv.value = String(count);
    }));

    $$('.t10-chip', form).forEach(chip => {
      const cb = $('input', chip), chk = $('.t10-chk', chip);
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
      const status = $('.t10-status', form);
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
      if (coming) { stage.show(6); stage.callPari(); }
    });
  }

  const cleanup = () => {
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    stage.destroy();
    doc.documentElement.style.overflow = prevHtml;
    doc.body.style.overflow = prevBody;
    host.classList.remove('t10-js', 't10-locked', 't10-live', 't10-open', 't10-shake');
    delete host._t10Cleanup;
  };
  host._t10Cleanup = cleanup;
  return cleanup;
}
