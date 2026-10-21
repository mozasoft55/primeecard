/* ==========================================================================
   Royal Cinematic Wedding Invitation — render()/mount() template
   Same contract as your other templates:
     export default function render({ guest, wedding, events }) -> html string
     export function mount(root, { guest, wedding, events }) -> cleanup()
   render() alone is a complete, readable static invitation (no JS needed).
   mount() adds: entry seal, countdown, scratch card, scroll reveals, RSVP.

   wedding fields (all optional, nothing is hard-coded):
     bride_name, groom_name, date, time, venue, address, city, map_url,
     invocation, families | footer_text, poem, hero_image, venue_image,
     rsvp_number, rsvp_contacts, surprise_message, name_order ('bride_first'),
     story: [{title, text, image}]  (array or JSON string),
     travel_info, stay_info, music_url, timezone_offset (default +05:30)
   events[]: event_name, event_date, event_time, venue, address, description,
     dress_code, dress_color, local_name, image_url
   guest: name, with_family
   ========================================================================== */

/* ---------- tiny helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
const clean = v => String(v ?? '').trim();
const safeUrl = u => (/^https?:\/\//i.test(clean(u)) ? esc(clean(u)) : '');
const safeImg = u => (/^https:\/\/[^\s'"()<>\\]+$/i.test(clean(u)) ? clean(u) : '');
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const pad = n => String(n).padStart(2, '0');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORD = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Great+Vibes&family=Inter:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600&display=swap';

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

/* ---------- imagery (Unsplash; each has a fallback so nothing breaks) ---------- */
const U = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const KINDS = [
  { re: /haldi|ubtan|pithi|gaye\s*holud/i, icon: '🌼', src: './assets/haldi.jpg', img: '1606216794074-735e91aa2c92', alt: '1599661046827-dacff0c0f09a', dress: '#f4c542' },
  { re: /mehendi|mehndi|henna/i, icon: '🌿', src: './assets/mehendi.jpg', img: '1583939003579-730e3918a45a', alt: '1465495976277-4387d4b0b4c6', dress: '#187653' },
  { re: /sangeet|cocktail|music|garba|dandiya/i, icon: '🎶', img: '1469371670807-013ccf25f16a', alt: '1511795409834-ef04bbd61622', dress: '#7444a1' },
  { re: /baraat|barat|procession/i, icon: '🐎', src: './assets/baraat.jpg', img: '1519167758481-83f550bb49b3', alt: '1606216794074-735e91aa2c92', dress: '#e88aab' },
  { re: /jaimala|varmala|engagement|sagai|tilak|ring/i, icon: '💐', img: '1519225421980-715cb0215aed', alt: '1465495976277-4387d4b0b4c6', dress: '#d8b56e' },
  { re: /phere|pheras|nikah|wedding|vivah|shaadi|biye|ceremony|saptapadi/i, icon: '🔥', src: './assets/phere.jpg', img: '1465495976277-4387d4b0b4c6', alt: '1519741497674-611481863552', dress: '#8e1e32' },
  { re: /reception|walima|dinner|aashirbaad|aashirvad|blessing/i, icon: '✨', src: './assets/reception.jpg', img: '1511795409834-ef04bbd61622', alt: '1469371670807-013ccf25f16a', dress: '#e6cbd3' }
];
const DEFAULT_KIND = { icon: '✦', img: '1519741497674-611481863552', alt: '1522413452208-996ff3f3e740', dress: '#e5c07b' };
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

/* ---------- styles (all scoped under .t8) ---------- */
const STYLE = `
html{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
body{overflow:visible!important;margin:0;padding:0;overscroll-behavior:contain}
.t8,.t8 *,.t8 *:before,.t8 *:after{box-sizing:border-box}
.t8{--gold:#e5c07b;--bright:#fdf1c6;--pearl:#fdfbf7;--line:rgba(229,192,123,.34);--ease:cubic-bezier(.22,1,.36,1);
  position:relative;width:100%;min-height:100vh;overflow-x:clip;color:var(--pearl);font:300 15px/1.7 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 80% 40% at 50% 0,#1b5a45 0,transparent 70%),linear-gradient(180deg,#0f2c23 0,#05120f 55%,#030a08 100%)}
.t8.t8-locked{height:100vh!important;height:100dvh!important;max-height:100vh!important;overflow:hidden!important}
.t8 h1,.t8 h2,.t8 h3,.t8 p,.t8 figure{margin-top:0}
.t8 img{display:block;max-width:100%}
.t8 button{font:inherit;color:inherit;cursor:pointer}
.t8 a{color:inherit}
.t8 :focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.t8-noise{position:fixed;inset:0;z-index:999;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:t8-grain 1.2s steps(6) infinite}
@keyframes t8-grain{0%{transform:translate(0,0)}20%{transform:translate(-2%,1%)}40%{transform:translate(1%,-2%)}60%{transform:translate(-1%,2%)}80%{transform:translate(2%,-1%)}100%{transform:translate(0,0)}}
.t8-progress{position:fixed;top:0;left:0;height:2px;width:100%;z-index:998;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#b8873b,#fff1b8,#d9a84f);box-shadow:0 0 12px rgba(229,192,123,.8)}
.t8-gold{background:linear-gradient(110deg,#a67a2e 0%,#fff1b8 22%,#d9a84f 42%,#fff7d6 58%,#b8863a 78%,#f0cf7e 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t8-shimmer 6s linear infinite}
@keyframes t8-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
.t8-wrap{position:relative;width:100%;max-width:1120px;margin:0 auto;padding:0 22px}
.t8 section{position:relative;padding:96px 0}
.t8-eyebrow{font:500 11px Cinzel,serif;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.t8-head{text-align:center;margin-bottom:54px}
.t8-head h2{font:500 clamp(28px,6vw,46px)/1.15 Cinzel,serif;letter-spacing:.08em;margin:0 0 14px}
.t8-head p{max-width:460px;margin:0 auto;color:#d6ddd5;font-size:14px}
.t8-rule{display:flex;align-items:center;justify-content:center;gap:14px;color:var(--gold);margin:22px auto 0}
.t8-rule:before,.t8-rule:after{content:"";height:1px;width:64px;background:linear-gradient(90deg,transparent,var(--gold))}
.t8-rule:after{transform:scaleX(-1)}
.t8-glass{position:relative;background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(255,255,255,.03));border:1px solid var(--line);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 24px 60px rgba(0,0,0,.35)}
.t8-ph{background:radial-gradient(circle at 30% 20%,rgba(229,192,123,.22),transparent 55%),linear-gradient(135deg,#17493a,#0a1f18)}
.t8 img.t8-failed{opacity:0}
.t8-reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.t8-reveal.t8-in{opacity:1;transform:none}
.t8-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 32px;border-radius:40px;border:1px solid rgba(255,245,210,.7);text-decoration:none;color:#04140e!important;font:800 12px Cinzel,serif!important;letter-spacing:.16em;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#b8862d 0%,#fef3c7 26%,#d9a441 50%,#fff7d6 74%,#b8862d 100%);background-size:200% auto;box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -2px 0 rgba(145,95,20,.4);transition:transform .35s var(--ease),background-position .8s ease,box-shadow .35s;text-shadow:none!important}
.t8-btn:hover{transform:translateY(-3px);background-position:100% 0}
.t8-btn:after,.t8-send:after{content:"";position:absolute;top:0;bottom:0;width:38%;left:-60%;transform:skewX(-22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:t8-sweep 4s ease-in-out infinite}
@keyframes t8-sweep{0%,55%{left:-60%}100%{left:130%}}
/* entry */
.t8-entry{position:fixed;inset:0;width:100%;height:100%;height:100dvh;z-index:900;display:flex;align-items:center;justify-content:center;padding:clamp(12px,2.5vh,24px);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:radial-gradient(ellipse at 50% 42%,#1b5943 0,#0f2c23 43%,#05120f 100%);transition:transform .9s var(--ease),opacity .9s var(--ease)}
.t8-entry:before,.t8-entry:after{content:"";position:absolute;width:min(86vw,70vh,440px);height:min(86vw,70vh,440px);border:1px solid rgba(229,192,123,.22);border-radius:50%;box-shadow:0 0 0 18px rgba(229,192,123,.03),0 0 0 42px rgba(229,192,123,.02);pointer-events:none}
.t8-entry:after{width:min(68vw,54vh,320px);height:min(68vw,54vh,320px);border-style:dashed;animation:t8-spin 70s linear infinite}
.t8-entry.t8-leaving{transform:scale(1.15);opacity:0;pointer-events:none}
.t8-entry-in{position:relative;z-index:2;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,1.6vh,16px);max-height:100%;max-width:min(92vw,480px);margin:auto;padding:12px 0}
.t8-kicker{font:500 clamp(9px,1.4vh,10.5px) Cinzel,serif;letter-spacing:.34em;color:#e7d8b5}
.t8-entry-names{font:clamp(34px,6.8vh,62px)/1.25 "Great Vibes",cursive;margin:clamp(4px,1vh,10px) 0;padding:2px 12px;filter:drop-shadow(0 0 18px rgba(229,192,123,.45))}
.t8-entry-names span{font-size:.7em;margin:0 4px}
.t8-entry-sub{font:500 clamp(8.5px,1.3vh,10px) Cinzel,serif;letter-spacing:.2em;color:var(--gold)}
.t8-guest-line{font:italic 400 clamp(14px,2.2vh,17px)/1.4 "Cormorant Garamond",serif;color:#f2e6c4;margin:clamp(2px,.8vh,6px) 0}
.t8-seal{width:clamp(110px,18vh,146px);height:clamp(110px,18vh,146px);border-radius:50%;border:0;position:relative;color:#6d491a;display:grid;place-content:center;gap:2px;
  background:radial-gradient(circle at 34% 25%,#fff0b9 0,#e8c16b 20%,#b98435 48%,#f6db8c 67%,#986323 83%,#f9e5a3 91%,#986323 100%);
  box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -8px 12px rgba(110,69,27,.55),0 14px 26px rgba(0,0,0,.55),0 0 38px rgba(229,192,123,.35);animation:t8-pulseseal 3s ease-in-out infinite}
.t8-seal:before{content:"";position:absolute;inset:8px;border:1px solid rgba(128,85,30,.6);border-radius:50%;box-shadow:inset 0 0 0 4px rgba(249,230,160,.27)}
.t8-seal b{font:500 clamp(24px,4vh,32px) Cinzel,serif;letter-spacing:-.06em;text-shadow:0 1px rgba(255,255,255,.55),0 -1px rgba(125,83,28,.5)}
.t8-seal small{font:600 clamp(7px,1.1vh,8.5px) Cinzel,serif;letter-spacing:.2em}
.t8-seal.t8-burst{animation:t8-burst .5s ease-in forwards}
.t8-entry-note{font-size:clamp(9.5px,1.4vh,11px);letter-spacing:.2em;text-transform:uppercase;color:#e9dfc7;cursor:pointer}
.t8-flash{position:fixed;inset:0;z-index:901;background:radial-gradient(circle at 50% 50%,rgba(255,246,214,.85) 0%,rgba(229,192,123,.4) 45%,transparent 75%);opacity:0;pointer-events:none}
.t8-flash.t8-on{animation:t8-flash .8s ease forwards}
.t8-particles{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.t8-pt{position:absolute;bottom:-12px;border-radius:50%;background:var(--bright);box-shadow:0 0 10px 2px rgba(229,192,123,.55);opacity:0;animation:t8-rise var(--d,9s) linear infinite;animation-delay:var(--dl,0s);left:var(--l,50%)}
@keyframes t8-rise{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:.85}90%{opacity:.85}100%{transform:translateY(-105vh) scale(1.6);opacity:0}}
@keyframes t8-pulseseal{0%,100%{transform:scale(1)}50%{transform:scale(1.05);box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -8px 12px rgba(110,69,27,.55),0 14px 26px rgba(0,0,0,.55),0 0 58px rgba(229,192,123,.7)}}
@keyframes t8-burst{45%{transform:scale(1.22)}100%{transform:scale(0);opacity:0}}
@keyframes t8-flash{0%{opacity:0}25%{opacity:.65}100%{opacity:0}}
@keyframes t8-spin{to{transform:rotate(360deg)}}
/* hero */
.t8-hero{position:relative;min-height:100vh;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:clamp(65px,11vh,105px) 20px clamp(60px,11vh,100px);text-align:center;isolation:isolate}
.t8-hero-bg{position:absolute;inset:-8% 0;z-index:-2;will-change:transform;background-size:cover;background-position:center}
.t8-hero:before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 38%,transparent 25%,rgba(5,18,15,.65) 100%)}
.t8-frame{position:absolute;inset:14px;border:1px solid rgba(229,192,123,.3);pointer-events:none;z-index:1}
.t8-frame:before,.t8-frame:after{content:"✦";position:absolute;color:var(--gold);font-size:12px;background:#07160f;padding:0 8px;left:50%;transform:translateX(-50%)}
.t8-frame:before{top:-9px}.t8-frame:after{bottom:-9px}
.t8-hero-in{position:relative;z-index:2;max-width:760px;padding:8px 0}
.t8-invoc{font:500 11px Cinzel,serif;letter-spacing:.32em;color:#e7d8b5;margin:0 0 10px;text-transform:uppercase}
.t8-eyebrow{font:500 11px Cinzel,serif;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin:0 auto clamp(20px,3.5vh,36px);display:inline-block}
.t8-hero h1{font:clamp(46px,12vw,128px)/1.22 "Great Vibes",cursive;margin:0 0 clamp(8px,2vh,18px);padding-top:clamp(12px,2.5vh,24px);filter:drop-shadow(0 0 22px rgba(229,192,123,.55)) drop-shadow(0 6px 18px rgba(0,0,0,.6))}
.t8-hero h1 span{display:block;font-size:.42em;line-height:1.4;margin:clamp(2px,0.8vh,8px) 0}
.t8-hero-copy{max-width:420px;margin:clamp(10px,2vh,18px) auto 0;font-size:14px;color:#f1eadb;text-shadow:0 2px 12px rgba(0,0,0,.7)}
.t8-guest-pill{display:inline-block;margin-top:clamp(12px,2vh,18px);padding:8px 18px;border-radius:30px;border:1px solid rgba(229,192,123,.5);background:rgba(5,18,15,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:500 10px Cinzel,serif;letter-spacing:.2em;text-transform:uppercase;color:var(--bright)}
/* guest person / family box */
.t8-guest-boxes{display:inline-flex;align-items:center;justify-content:center;gap:clamp(8px,2vw,14px);margin:clamp(8px,1.5vh,14px) auto 0;padding:6px 16px;border-radius:14px;background:rgba(5,18,15,.55);border:1px solid rgba(229,192,123,.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,.35);cursor:pointer;transition:transform .2s}
.t8-guest-boxes:hover{transform:scale(1.03)}
.t8-box-star{color:var(--gold);font-size:13px;line-height:1}
.t8-box-col{display:flex;flex-direction:column;align-items:center;gap:3px;opacity:.78;transition:opacity .2s}
.t8-box-col.active{opacity:1}
.t8-box-label{font:500 12px/1.2 "Cormorant Garamond",Georgia,serif;letter-spacing:.06em;color:#f2e6c4}
.t8-box-val{min-width:44px;height:24px;padding:0 8px;border:1.2px solid rgba(229,192,123,.65);border-radius:4px;background:rgba(255,255,255,.08);color:var(--bright);font:700 12.5px/22px Cinzel,serif;display:grid;place-content:center;text-align:center}
.t8-box-col.active .t8-box-val{border-color:var(--gold);background:rgba(229,192,123,.18);color:#fff}
.t8-box-div{width:1px;height:30px;background:rgba(229,192,123,.38)}
.t8-badge{position:relative;display:inline-grid;gap:2px;margin-top:clamp(18px,3vh,30px);padding:clamp(14px,2.2vh,20px) clamp(18px,4vw,32px) clamp(12px,2vh,18px);border-radius:120px;border:1px solid rgba(229,192,123,.55);background:linear-gradient(135deg,rgba(15,44,35,.72),rgba(5,18,15,.55));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 0 6px rgba(229,192,123,.07),0 18px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2);animation:t8-float 5s ease-in-out infinite}
@keyframes t8-float{50%{transform:translateY(-8px)}}
.t8-badge .l{font:600 9.5px Cinzel,serif;letter-spacing:.34em;color:var(--gold)}
.t8-badge strong{font:500 clamp(18px,4.5vw,26px) Cinzel,serif;letter-spacing:.14em}
.t8-badge em{font:italic 400 14px "Cormorant Garamond",serif;color:#f2e6c4}
.t8-cd{display:none;justify-content:center;gap:14px;margin-top:8px;padding-top:10px;border-top:1px solid rgba(229,192,123,.25)}
.t8-cd.t8-live{display:flex}
.t8-cd div{min-width:38px}
.t8-cd b{display:block;font:500 17px Cinzel,serif;color:var(--bright);font-variant-numeric:tabular-nums}
.t8-cd small{font:500 7.5px Cinzel,serif;letter-spacing:.18em;color:#cdbd93}
.t8-cal-badge{display:inline-flex;align-items:center;justify-content:center;gap:6px;margin:10px auto 0;padding:6px 18px;border-radius:20px;border:1px solid rgba(229,192,123,.6);background:rgba(229,192,123,.14);color:var(--bright);text-decoration:none;font:600 9.5px Cinzel,serif;letter-spacing:.18em;text-transform:uppercase;transition:all .3s ease}
.t8-cal-badge:hover{background:rgba(229,192,123,.32);border-color:var(--gold);transform:scale(1.05)}
.t8-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin-top:clamp(18px,3vh,32px)}
.t8-btn-cal{color:#04140e!important;font:800 12px Cinzel,serif!important;letter-spacing:.16em;background:linear-gradient(135deg,#b8862d 0%,#fef3c7 26%,#d9a441 50%,#fff7d6 74%,#b8862d 100%);background-size:200% auto;border:1px solid rgba(255,245,210,.7);box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -2px 0 rgba(145,95,20,.4);text-shadow:none!important}
.t8-btn-ghost{background:rgba(15,44,35,.82)!important;border:1.5px solid rgba(229,192,123,.9)!important;color:#fff6db!important;font:800 12.5px Cinzel,serif!important;letter-spacing:.18em!important;box-shadow:0 8px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.15)!important;text-shadow:0 1px 4px rgba(0,0,0,.8)!important}
.t8-btn-ghost span{color:#fff6db!important;font-weight:800!important}
.t8-btn-ghost:hover{background:rgba(229,192,123,.28)!important;border-color:var(--gold)!important;color:#ffffff!important;transform:translateY(-3px)}
.t8-btn-ghost:hover span{color:#ffffff!important}
.t8-cue{position:relative;margin:clamp(28px,4.5vh,44px) auto 0;z-index:2;font:500 9.5px Cinzel,serif;letter-spacing:.28em;color:#d8bd7e;text-transform:uppercase;text-align:center}
.t8-cue i{display:block;width:1px;height:36px;margin:8px auto 0;background:linear-gradient(var(--gold),transparent);transform-origin:top;animation:t8-drip 2s ease-in-out infinite}
@keyframes t8-drip{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.t8-dust{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
/* polaroids */
.t8-poem{max-width:420px;margin:0 auto 54px;text-align:center;font:italic 400 clamp(18px,4.4vw,22px)/1.8 "Cormorant Garamond",Georgia,serif;color:#f4e8ca}
.t8-polaroids{display:grid;gap:56px;justify-items:center;padding:10px 0 20px}
.t8-pol{--rot:-2deg;position:relative;width:min(100%,310px);margin:0;padding:13px 13px 0;background:linear-gradient(180deg,#fffefa,#f6f0e2);color:#12342a;border-radius:3px;transform:rotate(var(--rot));transition:transform .6s var(--ease),box-shadow .6s var(--ease),opacity .9s var(--ease);
  box-shadow:0 1px 2px rgba(0,0,0,.35),0 14px 28px rgba(0,0,0,.4),0 38px 60px rgba(0,0,0,.35)}
.t8-pol:nth-child(2){--rot:2.2deg}.t8-pol:nth-child(3){--rot:-1.4deg}
.t8-pol:before{content:"";position:absolute;top:-15px;left:50%;width:98px;height:30px;transform:translateX(-50%) rotate(-3deg);background:repeating-linear-gradient(45deg,rgba(229,192,123,.78) 0 6px,rgba(244,216,150,.78) 6px 12px);box-shadow:0 2px 6px rgba(0,0,0,.25)}
.t8-pol:nth-child(2):before{transform:translateX(-50%) rotate(4deg)}
.t8-js .t8-pol.t8-reveal{transform:translateY(34px) rotate(var(--rot))}
.t8-js .t8-pol.t8-reveal.t8-in{transform:rotate(var(--rot))}
.t8-photo{aspect-ratio:1/1;overflow:hidden;position:relative;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.t8-photo:after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,214,140,.16),transparent 45%,rgba(15,44,35,.22));mix-blend-mode:multiply;pointer-events:none}
.t8-photo img{width:100%;height:100%;object-fit:cover;filter:sepia(.18) contrast(1.06) saturate(1.05);transition:transform 1.2s var(--ease)}
.t8-pol figcaption{padding:20px 8px 26px;min-height:132px;text-align:center}
.t8-pol h3{font:400 34px/1 "Great Vibes",cursive;margin:0 0 8px;color:#0f2c23}
.t8-pol p{font:400 12.5px/1.7 Inter,sans-serif;color:#4b5f55;margin:0}
.t8-pol:hover,.t8-pol:focus-within,.t8-js .t8-pol.t8-in:hover{transform:rotate(0) scale(1.06) translateY(-8px);z-index:3;box-shadow:0 2px 4px rgba(0,0,0,.3),0 26px 46px rgba(0,0,0,.5),0 0 40px rgba(229,192,123,.25)}
.t8-pol:hover img{transform:scale(1.07)}
/* ticket */
.t8-ticket-wrap{max-width:420px;margin:0 auto;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55)) drop-shadow(0 0 30px rgba(229,192,123,.12))}
.t8-ticket{--top:150px;--r:16px;position:relative;color:#12342a;border-radius:14px;background:radial-gradient(ellipse at 20% 0,#fffdf6,transparent 60%),linear-gradient(160deg,#fffdf7,#f3ead6 70%,#e9dcbc);
  -webkit-mask:radial-gradient(circle var(--r) at 0 var(--top),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle var(--r) at 100% var(--top),#0000 97%,#000) right/51% 100% no-repeat;
  mask:radial-gradient(circle var(--r) at 0 var(--top),#0000 97%,#000) left/51% 100% no-repeat,radial-gradient(circle var(--r) at 100% var(--top),#0000 97%,#000) right/51% 100% no-repeat}
.t8-ticket:before{content:"";position:absolute;inset:8px;border:1px solid rgba(184,135,59,.5);border-radius:8px;pointer-events:none}
.t8-ticket-top{height:var(--top);padding:26px 24px 0;text-align:center}
.t8-ticket-top .t8-eyebrow{color:#8c6b32;font-size:9.5px}
.t8-ticket-top h3{font:400 clamp(28px,7.4vw,36px)/1.05 "Great Vibes",cursive;margin:8px 0 6px;color:#0f2c23}
.t8-ticket-top p{font:500 9.5px Cinzel,serif;letter-spacing:.22em;color:#6b7c72;margin:0;text-transform:uppercase}
.t8-perf{position:absolute;left:var(--r);right:var(--r);top:var(--top);border-top:2px dashed rgba(140,107,50,.45)}
.t8-ticket-main{padding:26px 24px 22px}
.t8-hint{text-align:center;font:500 10px Cinzel,serif;letter-spacing:.14em;color:#6b7c72;margin:0 0 14px}
.t8-scratch{position:relative;height:122px;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,#0f2c23,#164838);box-shadow:inset 0 0 0 1px rgba(184,135,59,.55),inset 0 6px 14px rgba(0,0,0,.5)}
.t8-reveal-date{position:absolute;inset:0;display:grid;place-content:center;text-align:center;color:var(--bright);padding:0 10px}
.t8-reveal-date small{font:500 8.5px Cinzel,serif;letter-spacing:.34em;color:var(--gold)}
.t8-reveal-date strong{font:500 20px/1.35 Cinzel,serif;letter-spacing:.08em;margin:4px 0}
.t8-reveal-date em{font:italic 400 14px "Cormorant Garamond",serif;color:#e8d9ae}
.t8-scratch canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;transition:opacity .9s ease}
.t8-scratch canvas.t8-cleared{opacity:0;pointer-events:none}
.t8-foot{display:flex;justify-content:space-between;align-items:center;margin-top:16px;font:500 8.5px Cinzel,serif;letter-spacing:.2em;color:#8c6b32}
.t8-barcode{width:96px;height:22px;background:repeating-linear-gradient(90deg,#12342a 0 2px,transparent 2px 4px,#12342a 4px 5px,transparent 5px 8px,#12342a 8px 11px,transparent 11px 13px)}
.t8-skip{display:block;margin:12px auto 0;background:none;border:0;color:#7a6a45;font:500 10px Inter,sans-serif;letter-spacing:.08em;text-decoration:underline;text-underline-offset:3px}
.t8-ticket.t8-revealed .t8-scratch{animation:t8-glowreveal 1.6s ease}
@keyframes t8-glowreveal{40%{box-shadow:inset 0 0 0 1px #f0cf7e,0 0 44px rgba(229,192,123,.9)}}
.t8-spark{position:fixed;z-index:997;width:6px;height:6px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff6d2,#e5c07b 60%,transparent);animation:t8-spark .9s ease-out forwards}
@keyframes t8-spark{to{transform:translate(var(--x,0),var(--y,-40px)) scale(.2);opacity:0}}
/* zig-zag events */
.t8-day{display:flex;align-items:center;gap:14px;margin:70px 0 30px;color:var(--gold);font:500 11px Cinzel,serif;letter-spacing:.26em;text-transform:uppercase}
.t8-day:first-of-type{margin-top:0}
.t8-day:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(229,192,123,.5),transparent)}
.t8-zig{display:flex;flex-direction:column;gap:34px}
.t8-ev{width:86%;overflow:hidden;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));border:1px solid var(--line);box-shadow:0 26px 50px rgba(0,0,0,.45);transition:opacity .9s var(--ease),transform .9s var(--ease),box-shadow .5s,border-color .5s;opacity:0;transform:translateY(50px)}
.t8-ev.t8-in{opacity:1;transform:none}
.t8-ev.t8-l{margin-right:auto}.t8-ev.t8-r{margin-left:auto}
.t8-ev:hover{border-color:rgba(229,192,123,.7);box-shadow:0 30px 60px rgba(0,0,0,.55),0 0 40px rgba(229,192,123,.16)}
.t8-ev-img{position:relative;height:clamp(195px,50vw,240px);overflow:hidden}
.t8-ev-img img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform 1.4s var(--ease)}
.t8-ev:hover .t8-ev-img img{transform:scale(1.05)}
.t8-ev-img:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(5,18,15,.95) 0%,rgba(5,18,15,.45) 24%,transparent 55%)}
.t8-ev-t{position:absolute;z-index:2;left:18px;right:18px;bottom:14px;display:flex;align-items:flex-end;gap:12px}
.t8-ev-t .ic{font-size:26px;filter:drop-shadow(0 0 10px rgba(229,192,123,.5))}
.t8-ev-t h3{font:500 21px/1.15 Cinzel,serif;letter-spacing:.06em;margin:0}
.t8-ev-t small{display:block;font:400 12px "Noto Serif Devanagari",serif;color:#e1c88c;margin-top:3px}
.t8-ev-day{position:absolute;z-index:2;top:12px;right:12px;padding:5px 12px;border-radius:20px;border:1px solid rgba(229,192,123,.55);background:rgba(5,18,15,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:600 8.5px Cinzel,serif;letter-spacing:.2em;color:var(--bright)}
.t8-ev-b{padding:18px 20px 20px}
.t8-meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;color:#f2ead9;margin-bottom:10px}
.t8-meta b{color:var(--gold);font-weight:500;margin-right:5px}
.t8-desc{font-size:13px;color:#c9d3cb;margin:0 0 14px}
.t8-dress{display:inline-flex;align-items:center;gap:9px;padding:7px 14px 7px 9px;border-radius:30px;border:1px solid rgba(229,192,123,.3);background:rgba(0,0,0,.18);font-size:11px;color:#eadfc6}
.t8-sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(255,255,255,.55);box-shadow:0 0 10px rgba(0,0,0,.4)}
/* venue */
.t8-venue-photo{position:relative;height:clamp(240px,52vw,420px);border-radius:22px;overflow:hidden;border:1px solid rgba(229,192,123,.5);box-shadow:0 30px 70px rgba(0,0,0,.55);margin:0}
.t8-venue-photo img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--ease)}
.t8-venue-photo:hover img{transform:scale(1.07)}
.t8-venue-photo:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,18,15,.85),transparent 60%)}
.t8-venue-photo figcaption{position:absolute;z-index:1;left:22px;right:22px;bottom:18px;font:500 11px Cinzel,serif;letter-spacing:.14em;color:#fff4d6;text-transform:uppercase}
.t8-vgrid{display:grid;gap:18px;margin-top:22px}
.t8-vcard{border-radius:20px;padding:30px 26px;text-align:center}
.t8-vcard h3{font:500 clamp(20px,5vw,26px)/1.25 Cinzel,serif;letter-spacing:.06em;margin:6px 0 10px}
.t8-vcard p{font-size:13.5px;color:#d3dcd4;margin:0 0 20px}
.t8-travel{border-radius:20px;padding:28px 26px}
.t8-travel h3{font:500 16px Cinzel,serif;letter-spacing:.1em;color:var(--bright);margin:0 0 6px}
.t8-trow{display:grid;grid-template-columns:30px 1fr;gap:12px;margin-top:16px}
.t8-trow>span{font-size:19px;color:var(--gold)}
.t8-trow p{font-size:12.5px;color:#d3dcd4;margin:0}
/* rsvp */
/* upgraded RSVP matching user mockup */
.t8-rsvp{position:relative;max-width:480px;margin:0 auto;padding:clamp(28px,4vh,40px) clamp(20px,4vw,32px);border-radius:24px;background:linear-gradient(175deg,rgba(255,253,247,.97),rgba(247,239,223,.95));color:#2a1b12;border:1.5px solid rgba(229,192,123,.75);box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 50px rgba(229,192,123,.18)}
.t8-rsvp-stamp{position:absolute;top:16px;right:18px;width:38px;height:44px;background:#1a4d3b;border:2px dashed #e5c07b;border-radius:4px;display:grid;place-content:center;color:#fff2cf;font:700 11px Cinzel,serif;box-shadow:0 4px 10px rgba(0,0,0,.25);transform:rotate(4deg)}
.t8-rsvp h2{text-align:left;font:600 clamp(20px,4.5vw,26px)/1.25 Cinzel,serif;letter-spacing:.04em;color:#0f2c23;margin:0 0 8px}
.t8-rsvp-intro{text-align:left;font-size:13px;line-height:1.6;color:#534638;margin:0 0 24px}
.t8-field{margin:18px 0;text-align:left}
.t8-field label{display:block;font:600 10.5px Cinzel,serif;letter-spacing:.18em;color:#7a5a22;margin-bottom:8px;text-transform:uppercase}
.t8-field input[type="text"],.t8-field textarea{width:100%;display:block;background:#fffdf9;border:1.5px solid #d5c39e;border-radius:10px;padding:12px 14px;font:500 15px "Cormorant Garamond",Georgia,serif;color:#1a2b22;outline:none;transition:border-color .3s,box-shadow .3s}
.t8-field input[type="text"]:focus,.t8-field textarea:focus{border-color:#b8873b;box-shadow:0 0 0 3px rgba(229,192,123,.25)}
.t8-att-options{display:grid;grid-template-columns:1fr;gap:10px}
.t8-att-btn{width:100%;min-height:48px;padding:10px 16px;border-radius:12px;border:1.5px solid #d5c39e;background:#fffcf5;display:flex;align-items:center;gap:12px;cursor:pointer;color:#2a1b12;font:600 14px "Cormorant Garamond",Georgia,serif;transition:all .25s ease;text-align:left}
.t8-att-btn:hover{border-color:#b8873b;background:#fdf9ed}
.t8-att-btn.selected{background:#164535;border-color:#164535;color:#fffdf7;box-shadow:0 6px 18px rgba(22,69,53,.35)}
.t8-att-radio{width:22px;height:22px;border-radius:50%;border:1.5px solid #c2b08a;display:grid;place-content:center;font-size:13px;flex-shrink:0;transition:all .2s}
.t8-att-btn.selected .t8-att-radio{background:#fff;border-color:#fff;color:#164535;font-weight:bold}
.t8-stepper{display:flex;align-items:center;justify-content:space-between;background:#f7eedb;border:1.5px solid #d8c6a0;border-radius:30px;padding:4px 8px;max-width:280px}
.t8-step-btn{width:36px;height:36px;border-radius:50%;border:0;background:#0d3326;color:#ffffff!important;font:700 22px/1 sans-serif!important;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,background .2s;box-shadow:0 3px 8px rgba(0,0,0,.25)}
.t8-step-btn:hover{background:#164e3c;transform:scale(1.08)}
.t8-step-val{font:600 16px "Cormorant Garamond",Georgia,serif;color:#10382b}
.t8-step-val strong{font-size:20px;margin-right:4px;color:#10382b}
.t8-func-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media(max-width:380px){.t8-func-grid{grid-template-columns:1fr}}
.t8-func-chip{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:10px 12px;border-radius:26px;border:1.5px solid #d5c39e;background:#ffffff;cursor:pointer;user-select:none;transition:all .25s ease;position:relative;min-height:58px;box-sizing:border-box;text-align:center}
.t8-func-chip:hover{border-color:#10382b}
.t8-func-chip.selected{background:#10382b;border-color:#10382b;box-shadow:0 4px 14px rgba(16,56,43,.3)}
.t8-func-chip input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.t8-func-head{display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%}
.t8-func-check{width:20px;height:20px;border-radius:50%;border:1.5px solid #bdae95;background:transparent;color:transparent;display:grid;place-content:center;font-size:11px;font-weight:800;flex-shrink:0;transition:all .2s ease}
.t8-func-chip.selected .t8-func-check{background:#ffffff;border-color:#ffffff;color:#10382b}
.t8-func-name{font:700 13px Cinzel,serif;letter-spacing:.05em;color:#10382b;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .2s ease}
.t8-func-chip.selected .t8-func-name{color:#ffffff}
.t8-func-date{font:500 11px Cinzel,serif;letter-spacing:.08em;color:#7d6b52;text-align:center;text-transform:uppercase;line-height:1.2;margin:0 auto;transition:color .2s ease}
.t8-func-chip.selected .t8-func-date{color:#f3e5c0}
.t8-func-chip:last-child:nth-child(odd){grid-column:1/-1}
.t8-send{width:100%;margin-top:18px;min-height:54px;border:0;border-radius:40px;position:relative;overflow:hidden;color:#04120c!important;font:800 13px Cinzel,sans-serif!important;letter-spacing:.14em;text-transform:uppercase;background:linear-gradient(120deg,#d4a34b,#fff0b8 32%,#e2b763 60%,#fde49e 82%,#d4a34b);background-size:220% 100%;box-shadow:0 10px 30px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.8);display:inline-flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:transform .35s var(--ease),background-position .8s}
.t8-send svg{width:20px;height:20px;fill:#04120c;flex-shrink:0}
.t8-send span{color:#04120c!important;font-weight:800!important;text-shadow:none!important}
.t8-send:hover{transform:translateY(-3px);background-position:100% 0}
.t8-send:active{transform:scale(.98)}
.t8-rsvp-note{text-align:center;font:italic 400 12px "Cormorant Garamond",Georgia,serif;color:#6b5a45;margin:12px 0 0}
.t8-status{min-height:20px;margin:16px 0 0;font-size:12px;line-height:1.6;text-align:center;color:#0f2c23;font-weight:600}
.t8-contacts{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
.t8-contact{display:inline-block;padding:9px 16px;border-radius:30px;border:1.5px solid #d5c39e;background:#fffdf9;color:#0f2c23;text-decoration:none;font-size:12px;letter-spacing:.04em;font-weight:600}
/* footer + music */
.t8-end{text-align:center;padding:36px 22px clamp(60px,10vh,90px)}
.t8-mono{display:inline-flex;align-items:center;justify-content:center;gap:clamp(16px,4.5vw,30px);margin:4px auto;font-family:"Great Vibes",cursive}
.t8-mono-init{font:400 clamp(48px,12vw,72px)/1.2 "Great Vibes",cursive;display:inline-block}
.t8-mono-amp{font:italic 400 clamp(24px,6vw,38px)/1 "Cormorant Garamond",Georgia,serif;color:var(--gold);display:inline-block;opacity:.95}
.t8-end-blessing{font:italic 400 clamp(16px,3.8vw,21px)/1.5 "Cormorant Garamond",Georgia,serif;color:#f7edd4;margin:16px auto 10px;max-width:380px}
.t8-end-love{font:500 11px Cinzel,serif;letter-spacing:.25em;color:var(--gold);margin:18px auto 4px;text-transform:uppercase}
.t8-end-sig{font:600 clamp(12px,2.6vw,14.5px) Cinzel,serif;letter-spacing:.18em;color:#fffdf8;margin:4px auto 0;text-transform:uppercase}
.t8-music{position:fixed;z-index:950;right:16px;top:16px;width:44px;height:44px;border-radius:50%;border:1.5px solid var(--gold);background:rgba(15,44,35,.9);color:var(--bright);font-size:18px;display:inline-flex!important;align-items:center;justify-content:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer;transition:transform .3s var(--ease),background .3s,box-shadow .3s}
.t8-music:hover{transform:scale(1.08)}
.t8-music.t8-playing{animation:t8-musicglow 2s ease-in-out infinite;background:#d4ad60!important;color:#143a2b!important}
@keyframes t8-musicglow{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 0 0 rgba(229,192,123,.6)}50%{box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 16px 4px rgba(229,192,123,.6)}}
.t8-music[aria-pressed="true"]{background:#d4ad60;color:#143a2b}
@media(min-width:760px){
  .t8 section{padding:130px 0}
  .t8-polaroids{grid-template-columns:repeat(3,1fr);gap:40px;align-items:start}
  .t8-pol:nth-child(2){margin-top:46px}
  .t8-ev{width:46%}.t8-ev-img{height:225px}
  .t8-vgrid.t8-two{grid-template-columns:1fr 1fr}
  .t8-rsvp{padding:56px 52px 46px}
}
@media(max-width:360px){.t8-wrap{padding:0 16px}.t8-ev{width:92%}.t8-cd{gap:9px}.t8-badge{padding:16px 20px}}
@media(prefers-reduced-motion:reduce){.t8 *,.t8 *:before,.t8 *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.t8-js .t8-reveal,.t8-js .t8-ev{opacity:1!important;transform:none!important}}
@media print{.t8-noise,.t8-progress,.t8-entry,.t8-music,.t8-cue{display:none!important}.t8-js .t8-reveal,.t8-js .t8-ev{opacity:1!important;transform:none!important}}
`;

/* ---------- render ---------- */
export default function render({ guest, wedding, events = [] } = {}) {
  const w = wedding || {};
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
  const defaultMusic = safeUrl(w.music_url) || 'invitation.mp3';
  const targetTs = parseWhen(w.date, w.time, offset) ?? parseWhen(w.date, '', offset);
  const stCal = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calTitle = encodeURIComponent(`Wedding: ${first.replace(/&amp;/g, '&')} & ${second.replace(/&amp;/g, '&')}`);
  const calLoc = encodeURIComponent(where.replace(/&amp;/g, '&'));
  const calDesc = encodeURIComponent(`We cordially invite you to celebrate the wedding of ${first.replace(/&amp;/g, '&')} & ${second.replace(/&amp;/g, '&')}.${where ? ` Venue: ${where.replace(/&amp;/g, '&')}.` : ''}`);
  const calDates = targetTs ? `${stCal(targetTs)}/${stCal(targetTs + 4 * 3600 * 1000)}` : '';
  const calUrl = targetTs ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calDates}&details=${calDesc}&location=${calLoc}` : '';

  const mapUrl = safeUrl(w.map_url) || (clean(w.venue) || clean(w.address)
    ? esc(`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: [w.venue, w.address].filter(Boolean).join(', ') })}`) : '');
  const contacts = lines(w.rsvp_contacts);
  const phoneRaw = clean(w.rsvp_number) || contacts[0] || '';
  const digits = phoneRaw.replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const canRsvp = wa.length >= 10;

  const heroImg = safeImg(w.hero_image);
  const heroBg = [
    'linear-gradient(to bottom,rgba(15,44,35,.6),rgba(5,18,15,1))',
    heroImg && `url('${heroImg}')`,
    `url('${U('1477587458883-47145ed94245', 1800)}')`,
    `url('${U('1599661046827-dacff0c0f09a', 1800)}')`,
    `url('${U('1606216794074-735e91aa2c92', 1800)}')`,
    'radial-gradient(ellipse at 50% 30%,#2a6b55,#0f2c23 60%,#05120f)'
  ].filter(Boolean).join(',');

  const venueImg = safeImg(w.venue_image) || U('1599661046827-dacff0c0f09a', 1400);
  const story = readStory(w.story);

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
    const label = `DAY ${ORD[gi] || gi + 1}${g.p ? ` · ${weekday(g.p)}, ${shortDate(g.p)}` : ''}`;
    const cards = g.items.map(e => {
      const name = clean(e.event_name) || 'Celebration';
      const k = kindOf(name);
      const side = n++ % 2 === 0 ? 't8-l' : 't8-r';
      const img = safeImg(e.image_url) || k.src || U(k.img);
      const alt = U(k.alt);
      const loc = clean(e.venue || e.address) || clean(w.venue);
      const t = fmtTime(e.event_time);
      const color = /^#[0-9a-f]{3,8}$/i.test(clean(e.dress_color)) ? clean(e.dress_color) : k.dress;
      return `<article class="t8-ev ${side}">
        <div class="t8-ev-img t8-ph"><img src="${esc(img)}" data-fallback="${esc(alt)}" alt="${esc(name)}" loading="lazy" decoding="async"><span class="t8-ev-day">DAY ${gi + 1}</span>
          <div class="t8-ev-t"><span class="ic" aria-hidden="true">${k.icon}</span><div><h3>${esc(name)}</h3>${clean(e.local_name) ? `<small>${esc(e.local_name)}</small>` : ''}</div></div></div>
        <div class="t8-ev-b">
          <div class="t8-meta">${t ? `<span><b>◷</b>${esc(t)}</span>` : ''}${loc ? `<span><b>⌖</b>${esc(loc)}</span>` : ''}</div>
          ${clean(e.description) ? `<p class="t8-desc">${esc(e.description)}</p>` : ''}
          ${clean(e.dress_code) ? `<div class="t8-dress"><span class="t8-sw" style="background:${color}"></span>Dress code: ${esc(e.dress_code)}</div>` : ''}
        </div></article>`;
    }).join('');
    return `<div class="t8-day t8-reveal">${esc(label)}</div><div class="t8-zig">${cards}</div>`;
  }).join('');

  const travel = [clean(w.travel_info) && ['✈', w.travel_info], clean(w.stay_info) && ['⌂', w.stay_info]].filter(Boolean);
  const hasTravel = travel.length > 0;

  const fmtEventDate = e => {
    const p = dparts(e?.event_date);
    if (p) return `${p.d} ${MONTHS[p.mo - 1].slice(0, 3)}`;
    if (e?.event_date) return String(e.event_date);
    if (w.date && dparts(w.date)) {
      const wp = dparts(w.date);
      return `${wp.d} ${MONTHS[wp.mo - 1].slice(0, 3)}`;
    }
    return '';
  };

  const rsvpFunctions = evs.length > 0
    ? evs.map(e => ({
        name: clean(e.event_name) || 'Celebration',
        date: fmtEventDate(e)
      }))
    : [
        { name: 'Haldi', date: '4 Dec' },
        { name: 'Mehendi', date: '4 Dec' },
        { name: 'Sangeet', date: '4 Dec' },
        { name: 'Baarat', date: '5 Dec' },
        { name: 'Jaimala', date: '5 Dec' },
        { name: 'Phere', date: '5 Dec' },
        { name: 'Reception', date: '6 Dec' }
      ];

  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${STYLE}</style>
<noscript><style>.t8-entry{display:none!important}.t8.t8-locked{height:auto!important;max-height:none!important;overflow:visible!important}.t8-reveal,.t8-ev{opacity:1!important;transform:none!important}</style></noscript>
<div class="t8 t8-js t8-locked" data-when="${esc(String(parseWhen(w.date, w.time, offset) ?? parseWhen(w.date, '', offset) ?? ''))}" data-wa="${esc(canRsvp ? wa : '')}" data-music="${esc(defaultMusic)}">
  <div class="t8-noise" aria-hidden="true"></div>
  <div class="t8-progress" aria-hidden="true"></div>

  <div class="t8-entry" role="dialog" aria-label="Wedding invitation entry">
    <div class="t8-particles" aria-hidden="true"></div>
    <div class="t8-entry-in">
      <div class="t8-kicker">A CELEBRATION OF LOVE</div>
      <p class="t8-entry-names t8-gold">${first} <span>&amp;</span> ${second}</p>
      <div class="t8-entry-sub">${[city, day ? longDate(day) : ''].filter(Boolean).join(' · ').toUpperCase()}</div>
      <div class="t8-guest-line">Dear ${guestLine}</div>
      <button class="t8-seal" type="button" data-open aria-label="Open wedding invitation"><b>${initials}</b><small>OPEN INVITATION</small></button>
      <div class="t8-entry-note">Tap the seal to begin</div>
    </div>
  </div>
  <div class="t8-flash" aria-hidden="true"></div>

  <main>
    <header class="t8-hero" data-hero>
      <div class="t8-hero-bg" style="background-image:${heroBg}" aria-hidden="true"></div>
      <div class="t8-dust" aria-hidden="true"></div>
      <div class="t8-frame" aria-hidden="true"></div>
      <div class="t8-hero-in">
        <div class="t8-invoc">${invocation}</div>
        <div class="t8-eyebrow">Together with their families</div>
        <h1 class="t8-gold">${first} <span>&amp;</span> ${second}</h1>
        <p class="t8-hero-copy">Request the pleasure of your company as they begin their beautiful journey together.</p>
        <div class="t8-guest-pill" id="t8-guest-pill">Invited: ${guestLine}</div><br>
        <div class="t8-guest-boxes" id="t8-guest-boxes" data-family="${isFamily ? 'true' : 'false'}" data-base="${esc(baseGuest)}" data-count="${personsCount}" role="group" aria-label="Guest invite category">
          <span class="t8-box-star" aria-hidden="true">✦</span>
          <div class="t8-box-col${isFamily ? '' : ' active'}">
            <div class="t8-box-label">Person</div>
            <div class="t8-box-val" data-box="person">${isFamily ? '—' : personsCount}</div>
          </div>
          <i class="t8-box-div" aria-hidden="true"></i>
          <div class="t8-box-col${isFamily ? ' active' : ''}">
            <div class="t8-box-label">Family</div>
            <div class="t8-box-val" data-box="family">${isFamily ? '✓' : '✕'}</div>
          </div>
          <span class="t8-box-star" aria-hidden="true">✦</span>
        </div><br>
        <div class="t8-badge" aria-label="Save the date">
          <span class="l">SAVE THE DATE</span>
          <strong>${esc(dateNums)}</strong>
          <em>${esc(where)}${timeText ? ` · ${esc(timeText)}` : ''}</em>
          <div class="t8-cd" role="timer"><div><b data-u="d">--</b><small>DAYS</small></div><div><b data-u="h">--</b><small>HRS</small></div><div><b data-u="m">--</b><small>MIN</small></div><div><b data-u="s">--</b><small>SEC</small></div></div>
        </div>
        <div class="t8-cta">
          ${calUrl ? `<a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="t8-btn t8-btn-cal" id="t8-cal-cta">📅 &nbsp;SAVE THE DATE</a>` : ''}
          <a href="#" data-goto="story" class="t8-btn t8-btn-ghost">DISCOVER OUR STORY <span aria-hidden="true">↓</span></a>
        </div>
        <div class="t8-cue" aria-hidden="true">A new chapter begins<i></i></div>
      </div>
    </header>

    <section data-sec="story">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">A little bit of forever</div><h2 class="t8-gold">Our Journey</h2>
          <p>Every love story is special. Ours is a collection of little moments that led us here.</p><div class="t8-rule"><span>✦</span></div></div>
        <p class="t8-poem t8-reveal">${poem}</p>
        <div class="t8-polaroids">
          ${story.map(s => `<figure class="t8-pol t8-reveal" tabindex="0">
            <div class="t8-photo t8-ph"><img src="${esc(s.image)}" data-fallback="${esc(s.alt)}" alt="${esc(s.title)}" loading="lazy" decoding="async"></div>
            <figcaption><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></figcaption></figure>`).join('')}
        </div>
      </div>
    </section>

    <section style="padding-top:40px">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">A little surprise</div><h2 class="t8-gold">Reveal the Date</h2>
          <p>Make a wish, then gently scratch away the golden foil to reveal our special day.</p></div>
        <div class="t8-ticket-wrap t8-reveal">
          <div class="t8-ticket">
            <div class="t8-ticket-top"><div class="t8-eyebrow">✦ ADMIT TWO HEARTS ✦</div><h3>The Wedding of ${first} &amp; ${second}</h3><p>${esc(clean(w.city) || clean(w.venue))}</p></div>
            <div class="t8-perf" aria-hidden="true"></div>
            <div class="t8-ticket-main">
              <p class="t8-hint">SCRATCH THE GOLD FOIL BELOW</p>
              <div class="t8-scratch">
                <div class="t8-reveal-date"><small>${esc(clean(w.surprise_message) ? 'A MESSAGE FOR YOU' : 'OUR WEDDING DAY')}</small>
                  <strong>${clean(w.surprise_message) ? esc(w.surprise_message) : `${dayName ? esc(dayName) + '<br>' : ''}${esc(dateLong)}`}</strong>
                  <em>${esc(where)}</em></div>
                <canvas aria-label="Gold foil. Scratch to reveal."></canvas>
              </div>
              <button class="t8-skip" type="button" data-skip>Reveal without scratching</button>
              ${calUrl ? `<div style="text-align:center;margin-top:10px;"><a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="t8-skip" style="display:inline-block;color:#8c6b32;font-weight:600;">📅 Add wedding to Google Calendar</a></div>` : ''}
              <div class="t8-foot"><span>NO. ${day ? `${pad(day.d)}${pad(day.mo)}${String(day.y).slice(2)}` : '000000'}</span><span class="t8-barcode" aria-hidden="true"></span><span>ADMIT ALL</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${groups.length ? `<section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">The festivities</div><h2 class="t8-gold">Wedding Celebrations</h2>
          <p>Traditions, laughter, music, and memories. We would be delighted to have you with us.</p><div class="t8-rule"><span>✦</span></div></div>
        ${eventsHtml}
      </div>
    </section>` : ''}

    <section>
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Join us</div><h2 class="t8-gold">The Venue</h2><p>A beautiful setting for a celebration close to our hearts.</p></div>
        <figure class="t8-venue-photo t8-ph t8-reveal"><img src="${esc(venueImg)}" data-fallback="${esc(U('1477587458883-47145ed94245', 1400))}" alt="${venue}" loading="lazy" decoding="async"><figcaption>${esc(where)}</figcaption></figure>
        <div class="t8-vgrid${hasTravel ? ' t8-two' : ''}">
          <div class="t8-vcard t8-glass t8-reveal">
            <div class="t8-eyebrow">The wedding destination</div>
            <h3 class="t8-gold">${venue}</h3>
            <p>${address || city || ''}${dayName ? `<br>${esc(dayName)}, ${esc(dateLong)}${timeText ? ` · ${esc(timeText)}` : ''}` : ''}</p>
            ${mapUrl ? `<a class="t8-btn" href="${mapUrl}" target="_blank" rel="noopener noreferrer">✦ &nbsp;GET DIRECTIONS</a>` : ''}
          </div>
          ${hasTravel ? `<div class="t8-travel t8-glass t8-reveal"><h3>Travel &amp; Stay</h3>${travel.map(([i, t]) => `<div class="t8-trow"><span aria-hidden="true">${i}</span><p>${esc(t)}</p></div>`).join('')}</div>` : ''}
        </div>
      </div>
    </section>

    <section style="padding-bottom:70px">
      <div class="t8-wrap">
        <div class="t8-head t8-reveal"><div class="t8-eyebrow">Your presence is our present</div><h2 class="t8-gold">Kindly RSVP</h2></div>
        <form class="t8-rsvp t8-reveal" data-rsvp novalidate>
          <div class="t8-rsvp-stamp" aria-hidden="true"><span>${initials}</span></div>
          <h2>Will you grace us<br>with your presence?</h2>
          <p class="t8-rsvp-intro">Please let us know if you can join our celebration. We cannot wait to share this special day with you.</p>
          ${canRsvp ? `
          <div class="t8-field">
            <label for="t8-name">YOUR NAME</label>
            <input id="t8-name" name="name" type="text" placeholder="Enter your full name" autocomplete="name" value="${clean(guest?.name) ? esc(guest.name) : ''}" required>
          </div>
          <div class="t8-field">
            <label>WILL YOU BE JOINING US?</label>
            <div class="t8-att-options" role="radiogroup" aria-label="Will you be joining us?">
              <button type="button" class="t8-att-btn selected" data-att="Yes, we'll be there" aria-checked="true">
                <span class="t8-att-radio">✓</span>
                <strong>Yes, we'll be there</strong>
              </button>
              <button type="button" class="t8-att-btn" data-att="Sorry, can't make it" aria-checked="false">
                <span class="t8-att-radio"></span>
                <strong>Sorry, can't make it</strong>
              </button>
            </div>
            <input type="hidden" name="attendance" id="t8-att-val" value="Yes, we'll be there">
          </div>

          <div id="t8-rsvp-details">
            <div class="t8-field">
              <label>HOW MANY OF YOU?</label>
              <div class="t8-stepper">
                <button type="button" class="t8-step-btn" data-step="-1" aria-label="Decrease guest count">−</button>
                <span class="t8-step-val"><strong id="t8-person-count">${esc(guest?.persons || 1)}</strong> <span id="t8-person-label">${(guest?.persons || 1) > 1 ? 'persons' : 'person'}</span></span>
                <button type="button" class="t8-step-btn" data-step="1" aria-label="Increase guest count">+</button>
              </div>
              <input type="hidden" name="persons" id="t8-persons-val" value="${esc(guest?.persons || 1)}">
            </div>

            <div class="t8-field">
              <label>WHICH FUNCTIONS?</label>
              <div class="t8-func-grid" role="group" aria-label="Select functions">
                ${rsvpFunctions.map((f, i) => `
                  <label class="t8-func-chip selected" data-fn="${esc(f.name)}">
                    <input type="checkbox" name="functions" value="${esc(f.name)}" checked>
                    <div class="t8-func-head">
                      <span class="t8-func-check" aria-hidden="true">✓</span>
                      <span class="t8-func-name">${esc(f.name)}</span>
                    </div>
                    ${f.date ? `<span class="t8-func-date">${esc(f.date)}</span>` : ''}
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="t8-field">
              <label for="t8-note">A NOTE FOR THE FAMILY (OPTIONAL)</label>
              <textarea id="t8-note" name="note" rows="2" placeholder="Share your wishes..."></textarea>
            </div>
          </div>

          <button class="t8-send" type="submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span>Send reply on WhatsApp</span>
          </button>
          <p class="t8-rsvp-note">Thank you. If WhatsApp did not open, tap the button once more.</p>
          <p class="t8-status" role="status" aria-live="polite"></p>` : ''}
          ${contacts.length ? `<div class="t8-contacts">${contacts.map(c => `<a class="t8-contact" href="tel:${esc(c.replace(/[^\d+]/g, ''))}">${esc(c)}</a>`).join('')}</div>` : ''}
        </form>
      </div>
    </section>

    <footer class="t8-end">
      <div class="t8-rule"><span>❦</span></div>
      <div class="t8-mono t8-gold" aria-label="${init1} and ${init2}">
        <span class="t8-mono-init">${init1}</span>
        <span class="t8-mono-amp">&amp;</span>
        <span class="t8-mono-init">${init2}</span>
      </div>
      <p class="t8-end-blessing">Your presence is the blessing<br>we are waiting for</p>
      <p class="t8-end-love">With love,</p>
      <p class="t8-end-sig">${signature}</p>
    </footer>
  </main>

  <audio class="t8-audio" preload="auto" src="${esc(defaultMusic)}"></audio>
  <button class="t8-music" type="button" aria-label="Toggle music" aria-pressed="false" title="Toggle music">♫</button>
</div>`;
}

/* ---------- mount: interactivity ---------- */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  const host = root?.classList?.contains('t8') ? root : root?.querySelector?.('.t8');
  if (!host) return () => {};

  if (typeof host._t8Cleanup === 'function') {
    host._t8Cleanup();
  }

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

  host.classList.add('t8-js');
  const prevDocOverflow = doc.documentElement.style.overflow;
  const prevBodyOverflow = doc.body.style.overflow;
  doc.documentElement.style.overflow = 'hidden';
  doc.body.style.overflow = 'hidden';
  if (typeof win.scrollTo === 'function') {
    win.scrollTo(0, 0);
  }

  /* image fallbacks */
  $$('img').forEach(img => {
    const fail = () => {
      if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; }
      else img.classList.add('t8-failed');
    };
    on(img, 'error', fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  });

  /* particles */
  const dots = (hostEl, n, big) => {
    if (!hostEl) return;
    for (let i = 0; i < n; i++) {
      const p = doc.createElement('span'); p.className = 't8-pt';
      const s = rand(1, big ? 4 : 3);
      p.style.cssText = `--l:${rand(0, 100)}%;--d:${rand(7, 15)}s;--dl:${-rand(0, 14)}s;width:${s}px;height:${s}px`;
      hostEl.appendChild(p);
    }
  };
  dots($('.t8-particles'), 30, true);
  dots($('.t8-dust'), 18, false);

  /* audio & music */
  const musicBtn = $('.t8-music');
  const audioEl = $('.t8-audio') || new Audio(host.dataset.music || 'invitation.mp3');
  audioEl.loop = false;

  if (win.__t8Audio && win.__t8Audio !== audioEl) {
    try { win.__t8Audio.pause(); } catch (_) {}
  }
  win.__t8Audio = audioEl;

  const setMusicState = playing => {
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', String(playing));
    if (playing) {
      musicBtn.classList.add('t8-playing');
      musicBtn.textContent = '♪';
      musicBtn.title = 'Stop music';
      musicBtn.setAttribute('aria-label', 'Stop music');
    } else {
      musicBtn.classList.remove('t8-playing');
      musicBtn.textContent = '♫';
      musicBtn.title = 'Play music';
      musicBtn.setAttribute('aria-label', 'Play music');
    }
  };

  const toggleMusic = () => {
    if (audioEl.paused) {
      audioEl.play().then(() => setMusicState(true)).catch(() => {});
    } else {
      audioEl.pause();
      setMusicState(false);
    }
  };
  if (musicBtn) on(musicBtn, 'click', toggleMusic);
  on(audioEl, 'ended', () => setMusicState(false));
  undo.push(() => {
    try { audioEl.pause(); } catch (_) {}
    setMusicState(false);
    if (win.__t8Audio === audioEl) win.__t8Audio = null;
  });

  /* entry seal */
  const entry = $('.t8-entry'), seal = $('[data-open]'), flash = $('.t8-flash'), note = $('.t8-entry-note');
  let opened = false;
  let audioTriggered = false;
  const open = () => {
    if (opened) return;
    opened = true;
    if (seal) seal.classList.add('t8-burst');
    if (flash) flash.classList.add('t8-on');
    // Start music on user interaction (seal tap) - only one time
    if (audioEl && audioEl.paused && !audioTriggered) {
      audioTriggered = true;
      audioEl.play().then(() => setMusicState(true)).catch(() => {});
    }
    timers.push(setTimeout(() => { if (entry) entry.classList.add('t8-leaving'); }, 180));
    timers.push(setTimeout(() => {
      if (entry) entry.remove();
      if (flash) flash.remove();
      host.classList.remove('t8-locked');
      doc.documentElement.style.overflow = 'auto';
      doc.body.style.overflow = 'visible';
      if (typeof win.scrollTo === 'function') {
        win.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        doc.documentElement.scrollTop = 0;
        doc.body.scrollTop = 0;
      }
    }, 900));
  };
  if (seal) on(seal, 'click', open);
  if (note) on(note, 'click', open);

  /* smooth anchor */
  $$('[data-goto]').forEach(a => on(a, 'click', e => {
    e.preventDefault();
    const target = $(`[data-sec="${a.dataset.goto}"]`);
    if (target) {
      const top = target.getBoundingClientRect().top + (win.scrollY ?? doc.documentElement.scrollTop ?? 0);
      if (typeof win.scrollTo === 'function') {
        win.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      } else {
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }));

  /* guest person / family toggle */
  const guestBoxes = $('#t8-guest-boxes');
  const guestPill = $('#t8-guest-pill');
  if (guestBoxes) {
    on(guestBoxes, 'click', () => {
      const isFam = guestBoxes.dataset.family === 'true';
      const nextFam = !isFam;
      guestBoxes.dataset.family = String(nextFam);
      const base = guestBoxes.dataset.base || 'Respected Guest';
      const count = guestBoxes.dataset.count || '1';
      const colPerson = $('.t8-box-col:first-of-type', guestBoxes);
      const colFamily = $('.t8-box-col:last-of-type', guestBoxes);
      const valPerson = $('[data-box="person"]', guestBoxes);
      const valFamily = $('[data-box="family"]', guestBoxes);

      if (nextFam) {
        colPerson?.classList.remove('active');
        colFamily?.classList.add('active');
        if (valPerson) valPerson.textContent = '—';
        if (valFamily) valFamily.textContent = '✓';
        if (guestPill) guestPill.textContent = `Invited: ${base} & Family`;
      } else {
        colPerson?.classList.add('active');
        colFamily?.classList.remove('active');
        if (valPerson) valPerson.textContent = count;
        if (valFamily) valFamily.textContent = '✕';
        if (guestPill) guestPill.textContent = `Invited: ${base}`;
      }
    });
  }

  /* progress + parallax */
  const bar = $('.t8-progress'), heroBg = $('.t8-hero-bg'), hero = $('[data-hero]');
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    win.requestAnimationFrame(() => {
      const scY = win.scrollY ?? doc.documentElement.scrollTop ?? 0;
      const vh = win.innerHeight || doc.documentElement.clientHeight || 800;
      const max = (doc.documentElement.scrollHeight || doc.body.scrollHeight || vh) - vh;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scY / max) : 0})`;
      if (hero && heroBg) {
        const top = hero.getBoundingClientRect().top;
        if (!reduce && top < 0 && -top < vh * 1.3) heroBg.style.transform = `translate3d(0,${-top * .3}px,0) scale(1.08)`;
      }
      tick = false;
    });
  };
  on(win, 'scroll', onScroll, { passive: true });
  onScroll();

  /* reveals + zig-zag (100ms stagger) */
  if (typeof IntersectionObserver !== 'undefined') {
    const mkObs = (delayStep, opts) => new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, k) => { e.target.style.transitionDelay = `${k * delayStep}ms`; e.target.classList.add('t8-in'); obsOf.get(e.target)?.unobserve(e.target); });
    }, opts);
    const obsOf = new WeakMap();
    const revObs = mkObs(90, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    const evObs = mkObs(100, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    $$('.t8-reveal').forEach(el => { obsOf.set(el, revObs); revObs.observe(el); });
    $$('.t8-ev').forEach(el => { obsOf.set(el, evObs); evObs.observe(el); });
    undo.push(() => { revObs.disconnect(); evObs.disconnect(); });
  } else {
    $$('.t8-reveal').forEach(el => el.classList.add('t8-in'));
    $$('.t8-ev').forEach(el => el.classList.add('t8-in'));
  }

  /* countdown */
  const when = Number(host.dataset.when);
  const cdBox = $('.t8-cd');
  if (when && cdBox) {
    const set = (k, v) => { const el = $(`[data-u="${k}"]`, cdBox); if (el) el.textContent = pad(v); };
    const step = () => {
      const s = Math.max(0, Math.floor((when - Date.now()) / 1000));
      set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
    };
    cdBox.classList.add('t8-live'); step();
    const id = setInterval(step, 1000); timers.push(id);
  }

  /* realistic gold-foil scratch card */
  const box = $('.t8-scratch'), canvas = $('.t8-scratch canvas'), ticket = $('.t8-ticket');
  if (box && canvas && ticket) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let scratching = false, cleared = false, last = null, lastCheck = 0, lastSpark = 0;
    const paintFoil = () => {
      const r = box.getBoundingClientRect(); if (!r.width) return;
      const dpr = Math.min(2.5, win.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      const w = r.width, h = r.height;
      ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, h);
      [[0, '#8f6420'], [.14, '#e9c776'], [.3, '#b98532'], [.46, '#fff0b5'], [.6, '#c79a45'], [.78, '#f4d88a'], [1, '#9a6c24']].forEach(([o, c]) => g.addColorStop(o, c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < h * 2.2; i++) {
        ctx.fillStyle = Math.random() > .5 ? `rgba(255,248,205,${rand(.03, .2)})` : `rgba(88,52,10,${rand(.03, .16)})`;
        ctx.fillRect(Math.random() * w * .3, Math.random() * h, rand(w * .25, w), rand(.3, 1.3));
      }
      const sh = ctx.createLinearGradient(w * .12, 0, w * .62, h);
      sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,255,255,.38)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * .2, w / 2, h / 2, w * .7);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,40,5,.38)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 46; d[i] += n; d[i + 1] += n * .92; d[i + 2] += n * .62; }
      ctx.putImageData(img, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,235,${rand(.35, .9)})`; const s = rand(.4, 1.5); ctx.fillRect(Math.random() * w, Math.random() * h, s, s); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 12px Cinzel, serif';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      const t = '✦ SCRATCH TO REVEAL ✦';
      ctx.fillStyle = 'rgba(255,247,205,.85)'; ctx.fillText(t, w / 2 + 1, h / 2 + 1.5);
      ctx.fillStyle = 'rgba(70,40,5,.6)'; ctx.fillText(t, w / 2 - .8, h / 2 - 1);
      ctx.fillStyle = '#7b5216'; ctx.fillText(t, w / 2, h / 2);
      ctx.strokeStyle = 'rgba(255,240,180,.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
      ctx.strokeStyle = 'rgba(90,55,10,.5)'; ctx.strokeRect(3.5, 3.5, w - 7, h - 7);
      ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 38;
    };
    const pt = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const sparkle = (x, y) => {
      const now = performance.now();
      if (now - lastSpark < 45 || reduce) return; lastSpark = now;
      const s = doc.createElement('span'); s.className = 't8-spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--x', rand(-24, 24) + 'px'); s.style.setProperty('--y', rand(-44, -10) + 'px');
      (host || doc.body).appendChild(s); timers.push(setTimeout(() => s.remove(), 900));
    };
    const progress = () => {
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data; let c = 0, t = 0;
      for (let i = 3; i < px.length; i += 64) { t++; if (px[i] < 40) c++; }
      if (t && c / t > .42) reveal();
    };
    const reveal = () => {
      if (cleared) return; cleared = true;
      canvas.classList.add('t8-cleared'); ticket.classList.add('t8-revealed');
      const r = box.getBoundingClientRect();
      if (!reduce) for (let i = 0; i < 46; i++) {
        const s = doc.createElement('span'); s.className = 't8-spark';
        s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + r.height / 2 + 'px';
        s.style.setProperty('--x', rand(-170, 170) + 'px'); s.style.setProperty('--y', rand(-120, 90) + 'px');
        s.style.width = s.style.height = rand(4, 9) + 'px';
        (host || doc.body).appendChild(s); timers.push(setTimeout(() => s.remove(), 950));
      }
    };
    const stroke = e => {
      if (!scratching || cleared) return;
      const p = pt(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x + .01, p.y + .01); ctx.stroke(); last = p;
      sparkle(e.clientX, e.clientY);
      const now = performance.now(); if (now - lastCheck > 140) { lastCheck = now; progress(); }
      if (e.cancelable) e.preventDefault();
    };
    on(canvas, 'pointerdown', e => { if (cleared) return; scratching = true; last = pt(e); canvas.setPointerCapture?.(e.pointerId); stroke(e); });
    on(canvas, 'pointermove', stroke);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => on(canvas, t, () => { scratching = false; if (!cleared) progress(); }));
    on($('[data-skip]'), 'click', reveal);
    (doc.fonts?.ready || Promise.resolve()).then(paintFoil);
    let rz; on(win, 'resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (!cleared && Math.round(box.getBoundingClientRect().width) !== paintedW) paintFoil(); }, 200); });
  }

  /* RSVP via WhatsApp & Interactive controls */
  const form = $('[data-rsvp]');
  const waNum = host.dataset.wa || '919876543210';
  if (form) {
    // Attendance buttons toggle
    const attButtons = $$('.t8-att-btn', form);
    const attVal = $('#t8-att-val', form);
    const rsvpDetails = $('#t8-rsvp-details', form);

    attButtons.forEach(btn => {
      on(btn, 'click', () => {
        attButtons.forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
          const r = $('.t8-att-radio', b);
          if (r) r.textContent = '';
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        const r = $('.t8-att-radio', btn);
        if (r) r.textContent = '✓';
        const choice = btn.dataset.att;
        if (attVal) attVal.value = choice;
        if (rsvpDetails) {
          rsvpDetails.style.display = choice.startsWith('Yes') ? 'block' : 'none';
        }
      });
    });

    // Stepper for persons count
    const stepBtns = $$('.t8-step-btn', form);
    const pCountEl = $('#t8-person-count', form);
    const pLblEl = $('#t8-person-label', form);
    const pInput = $('#t8-persons-val', form);
    let count = Number(pInput?.value || 1);

    stepBtns.forEach(btn => {
      on(btn, 'click', () => {
        const delta = Number(btn.dataset.step || 0);
        count = Math.max(1, Math.min(20, count + delta));
        if (pCountEl) pCountEl.textContent = String(count);
        if (pLblEl) pLblEl.textContent = count > 1 ? 'persons' : 'person';
        if (pInput) pInput.value = String(count);
      });
    });

    // Function selection chips toggle
    const funcChips = $$('.t8-func-chip', form);
    funcChips.forEach(chip => {
      const cb = $('input[type="checkbox"]', chip);
      const chk = $('.t8-func-check', chip);
      if (!cb) return;
      const sync = () => {
        if (cb.checked) {
          chip.classList.add('selected');
          if (chk) chk.textContent = '✓';
        } else {
          chip.classList.remove('selected');
          if (chk) chk.textContent = '';
        }
      };
      on(cb, 'change', sync);
      on(chip, 'click', () => setTimeout(sync, 0));
    });

    // Submit handler matching Image 2 WhatsApp format
    on(form, 'submit', e => {
      e.preventDefault();
      const name = $('[name="name"]', form)?.value.trim() || 'Guest';
      const att = attVal?.value || "Yes, we'll be there";
      const isComing = att.startsWith('Yes');
      const persons = isComing ? (pInput?.value || '1') : '0';
      const checkedFuncs = isComing
        ? $$('[name="functions"]:checked', form).map(c => c.value)
        : [];
      const note = $('[name="note"]', form)?.value.trim();
      const status = $('.t8-status', form);

      const groom = wedding.groom_name || 'Groom';
      const bride = wedding.bride_name || 'Bride';
      let greeting = 'Namaste! ';
      if (clean(wedding.invocation) && /allah|bismillah|insha/i.test(wedding.invocation)) {
        greeting = 'Salam! ';
      }

      const lines = [
        `${greeting}Reply for ${groom} weds ${bride}.`,
        `Name: ${name}`,
        `Coming: ${isComing ? `Yes, ${persons} ${Number(persons) > 1 ? 'persons' : 'person'}` : "Sorry, can't make it"}`
      ];
      if (isComing && checkedFuncs.length) {
        lines.push(`Functions: - ${checkedFuncs.join(' - ')}`);
      }
      if (note) {
        lines.push(`Note: ${note}`);
      }
      const msg = lines.join(' ');
      win.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
      if (status) status.textContent = 'Thank you! Your WhatsApp reply is opening now.';
    });
  }



  const cleanup = () => {
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    undo.forEach(f => f());
    doc.documentElement.style.overflow = prevDocOverflow;
    doc.body.style.overflow = prevBodyOverflow;
    host.classList.remove('t8-js');
    host.classList.remove('t8-locked');
    delete host._t8Cleanup;
  };
  host._t8Cleanup = cleanup;
  return cleanup;
}
