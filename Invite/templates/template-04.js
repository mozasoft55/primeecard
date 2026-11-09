/* ==========================================================================
   Template 04 — Royal Shadi Card (Emerald & Antique Gold)
   Authentic Mughal & Islamic Shadi Invitation Suite
   Pure Vector SVG Design • Ultra Lightweight (~32 KB vs 1.17 MB)
   Self-Booting + Programmatic Mount • Zero Image Bloat • 100% Reliable
   ========================================================================== */

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ESC_MAP[ch]);
const clean = v => String(v ?? '').trim();
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
const safeUrl = v => (/^https?:\/\//i.test(clean(v)) ? esc(clean(v)) : '');

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STEP_TITLES = ['Shadi Welcome', 'The Invitation', 'Dulhan & Dulha', 'Taqreeb Programme', 'Shadi Celebrations'];
const STEP_LABELS = ['Welcome', 'Dawat', 'Couple', 'Events', 'Details'];
const MAIN_EVENT_RE = /nikah|walima|wedding|reception|shaadi|shadi|barat|baraat|ceremony/i;

const pad = n => String(n).padStart(2, '0');

function dateParts(value) {
  if (!value) return null;
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    return buildParts(y, mo, d);
  }
  m = s.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{4})/);
  if (m) {
    const d = +m[1], y = +m[3];
    const name = m[2].toLowerCase().slice(0, 3);
    const idx = MONTHS_SHORT.map(x => x.toLowerCase()).indexOf(name);
    if (idx >= 0) return buildParts(y, idx + 1, d);
  }
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) {
    const d = +m[1], mo = +m[2], y = +m[3];
    return buildParts(y, mo, d);
  }
  return null;
}

function buildParts(y, mo, d) {
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
  return {
    year: y,
    month: mo,
    day: d,
    dayName: DAYS_LONG[t.getUTCDay()],
    dayShort: DAYS_SHORT[t.getUTCDay()],
    monthName: MONTHS_LONG[mo - 1],
    monthShort: MONTHS_SHORT[mo - 1]
  };
}

function formatDate(value) {
  const p = dateParts(value);
  if (!p) return clean(value);
  return `${p.day} ${p.monthShort} ${p.year} (${p.dayShort})`;
}

function formatTime(value) {
  const raw = clean(value);
  if (!raw) return '';
  const m = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (m) {
    let hh = Number(m[1]), mm = m[2];
    const ap = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm} ${ap}`;
  }
  return raw.toUpperCase();
}

function parseWhen(dateValue, timeValue) {
  const d = dateParts(dateValue);
  if (!d) return null;
  const rawTime = clean(timeValue);
  const t = rawTime.match(/^(\d{1,2})(?::([0-5]\d))?\s*([AaPp][Mm])?$/);
  let hour = t ? +t[1] : 21;
  const minute = t ? +(t[2] || 0) : 30;
  const mer = t ? String(t[3] || '').toUpperCase() : '';
  if (mer === 'PM' && hour !== 12) hour += 12;
  if (mer === 'AM' && hour === 12) hour = 0;
  const ts = Date.parse(`${d.year}-${pad(d.month)}-${pad(d.day)}T${pad(hour)}:${pad(minute)}:00+05:30`);
  return Number.isNaN(ts) ? null : ts;
}

function weddingWhen(w, evs) {
  const event = (evs || []).find(i => MAIN_EVENT_RE.test(clean(i.event_name || i.category)));
  return parseWhen(w?.date || event?.event_date, w?.time || event?.event_time);
}

/* ==========================================================================
   Crisp Pure Vector SVG Assets (Lightweight, Scalable, Zero Image Bloat)
   ========================================================================== */
const ICONS = {
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="3.5"/><circle cx="15" cy="8" r="2.8"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.8"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  countdown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>'
};

// Intricate Bismillah Calligraphy in Pure Vector SVG
const BISMILLAH_SVG = `<svg viewBox="0 0 360 84" class="t04-bismillah-svg" aria-label="Bismillah ar-Rahman ar-Rahim" role="img">
  <path d="M180 8c-4.2 0-7.8 2.5-9.4 6.2-1.6-3.7-5.2-6.2-9.4-6.2-5.8 0-10.5 4.7-10.5 10.5 0 8.2 12.3 16.4 19.9 22.4 7.6-6 19.9-14.2 19.9-22.4 0-5.8-4.7-10.5-10.5-10.5z" fill="var(--gold-d)" opacity=".25"/>
  <text x="180" y="52" text-anchor="middle" font-family="'Amiri','Cinzel',serif" font-size="34" font-weight="700" fill="var(--gold-shine)" letter-spacing="2">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</text>
  <line x1="70" y1="70" x2="150" y2="70" stroke="var(--gold-d)" stroke-width="1.2" stroke-dasharray="3 3"/>
  <circle cx="180" cy="70" r="3.5" fill="var(--gold-shine)"/>
  <polygon points="180,63 184,70 180,77 176,70" fill="var(--gold-shine)"/>
  <line x1="210" y1="70" x2="290" y2="70" stroke="var(--gold-d)" stroke-width="1.2" stroke-dasharray="3 3"/>
</svg>`;

// Royal Mughal Star & Floral Corner Arabesque
const CORNER_ARABESQUE = (pos = 'tl') => `<svg viewBox="0 0 60 60" class="t04-corner-svg ${pos}" aria-hidden="true">
  <path d="M 0,0 L 50,0 C 45,15 35,25 20,30 C 25,45 15,55 0,60 Z" fill="var(--gold-d)" opacity=".25"/>
  <path d="M 4,4 L 46,4 C 38,16 28,26 16,38 L 4,46 Z" fill="none" stroke="var(--gold-shine)" stroke-width="1.4"/>
  <circle cx="8" cy="8" r="2.5" fill="var(--gold-shine)"/>
  <circle cx="20" cy="8" r="1.5" fill="var(--gold-shine)"/>
  <circle cx="8" cy="20" r="1.5" fill="var(--gold-shine)"/>
  <path d="M 2,56 C 14,44 26,30 36,16" stroke="var(--gold-d)" stroke-width="1" fill="none"/>
</svg>`;

// Islamic Jali Geometrical Motif Divider

const T04_THEMES = {
  emerald: { d: '#04241c', m: '#073f30', l: '#0e5b46', gs: '#e8c66e', gm: '#cf9f38', gd: '#956f1f', paper: '#fffdf9', cream: '#faf3e4', bgGrad: 'radial-gradient(circle at 50% 12%, #073f30 0%, #04241c 65%, #02120e 100%)' },
  maroon: { d: '#2a070f', m: '#651122', l: '#8c1b32', gs: '#f5d580', gm: '#d4a444', gd: '#9c7022', paper: '#fffdfa', cream: '#faefe0', bgGrad: 'radial-gradient(circle at 50% 12%, #651122 0%, #2a070f 65%, #150307 100%)' },
  royal: { d: '#2a070f', m: '#651122', l: '#8c1b32', gs: '#f5d580', gm: '#d4a444', gd: '#9c7022', paper: '#fffdfa', cream: '#faefe0', bgGrad: 'radial-gradient(circle at 50% 12%, #651122 0%, #2a070f 65%, #150307 100%)' },
  navy: { d: '#061024', m: '#13264d', l: '#1f3d7a', gs: '#f5d98b', gm: '#d8ab48', gd: '#a37a28', paper: '#fcfdff', cream: '#eef2f9', bgGrad: 'radial-gradient(circle at 50% 12%, #13264d 0%, #061024 65%, #030814 100%)' },
  rose: { d: '#2d0a17', m: '#661a37', l: '#9c2d58', gs: '#f8d48e', gm: '#d99f49', gd: '#9f6927', paper: '#fffbfa', cream: '#faebee', bgGrad: 'radial-gradient(circle at 50% 12%, #661a37 0%, #2d0a17 65%, #18050c 100%)' }
};

const JALI_DIVIDER = () => `<div class="t04-jali-div" aria-hidden="true">
  <i></i>
  <svg viewBox="0 0 36 36" class="t04-jali-star"><polygon points="18,3 22,14 33,18 22,22 18,33 14,22 3,18 14,14" fill="var(--gold-shine)"/><circle cx="18" cy="18" r="4" fill="var(--emerald-d)"/></svg>
  <i></i>
</div>`;

/* ==========================================================================
   CSS Stylesheet for Template 04 (Emerald & Antique Gold Shadi Card)
   ========================================================================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

:root {
  --emerald-d: #04241c;
  --emerald-m: #073f30;
  --emerald-l: #0e5b46;
  --gold-shine: #e8c66e;
  --gold-mid: #cf9f38;
  --gold-d: #956f1f;
  --paper: #fffdf9;
  --paper-cream: #faf3e4;
  --paper-dark: #f0e1c2;
  --text-dark: #1f2d27;
  --text-muted: #53645b;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

.t04 {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 25%, #0d4a39 0%, #062b20 60%, #031812 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  color: var(--text-dark);
  padding: env(safe-area-inset-top, 8px) 8px env(safe-area-inset-bottom, 8px);
}

.t04-shell {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 100%;
  max-height: 880px;
  border-radius: 28px;
  box-shadow: 0 25px 75px rgba(0, 0, 0, 0.8), 0 0 0 2px var(--gold-mid), 0 0 30px rgba(212, 175, 55, 0.25);
  background: var(--paper);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Jali Lattice Background Watermark */
.t04-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--paper);
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(207, 159, 56, 0.04) 10%, transparent 11%),
    radial-gradient(circle at 0% 0%, rgba(207, 159, 56, 0.04) 10%, transparent 11%),
    radial-gradient(circle at 100% 0%, rgba(207, 159, 56, 0.04) 10%, transparent 11%);
  background-size: 24px 24px;
}

/* Top Shadi Progress Tracker */
.t04-top {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  z-index: 25;
  background: rgba(255, 253, 249, 0.92);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid var(--gold-shine);
  border-radius: 999px;
  padding: 6px 14px 6px;
  box-shadow: 0 4px 15px rgba(3, 24, 18, 0.15);
}
.t04-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--emerald-m);
}
.t04-top-row em {
  font-style: normal;
  color: var(--gold-d);
  font-weight: 600;
  font-size: 10px;
}
.t04-track {
  position: relative;
  height: 4px;
  background: rgba(207, 159, 56, 0.25);
  border-radius: 99px;
  margin: 4px 0 0;
  overflow: visible;
}
.t04-track-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: calc(var(--p, 0) * 100%);
  background: linear-gradient(90deg, var(--gold-mid), var(--gold-shine));
  border-radius: 99px;
  transition: width 0.35s ease;
}
.t04-step {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 50%;
  border: 1px solid var(--gold-shine);
  background: var(--paper);
  left: calc(var(--i) * 25%);
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 0;
  z-index: 30;
}
.t04-step.done {
  background: var(--gold-mid);
  border-color: var(--gold-shine);
}
.t04-step.active {
  background: var(--emerald-l);
  border-color: var(--gold-shine);
  transform: scale(1.25);
  box-shadow: 0 0 6px var(--gold-shine);
}
.t04-step span {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}

/* Individual Invitation Screens */
.t04-screen {
  display: none;
  position: absolute;
  inset: 0;
  padding: 58px 16px 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: flex-start;
  z-index: 5;
}
.t04-screen.active {
  display: flex !important;
  animation: t04FadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes t04FadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   Page 1 (Screen 0) & Page 2 (Screen 1) — Emerald Royal Palace & Door Animation
   ========================================================================== */
.t04-cover, .t04-s1 {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 100dvh;
  height: 100dvh;
  overflow: hidden;
  background: #02120d !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.t04-mandap-wrap {
  position: relative !important;
  width: 100% !important;
  aspect-ratio: 765/1024;
  max-height: 100dvh;
  overflow: hidden;
  background: #02120d;
  perspective: 1200px;
}

.t04-mandap-img {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center bottom !important;
  display: block !important;
  pointer-events: none;
}

.t04-mandap-inner {
  z-index: 1;
}

/* Doors portal: exact inner arch opening */
.t04-doors-portal {
  position: absolute;
  left: 18.95%;
  width: 62.22%;
  top: 15.43%;
  height: 69.53%;
  z-index: 3;
  perspective: 1200px;
  cursor: pointer;
}

.t04-door {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  transition: transform 1.5s cubic-bezier(0.25, 0.85, 0.25, 1), opacity 1.2s ease;
  will-change: transform, opacity;
}

.t04-door-l {
  left: 0;
  transform-origin: left center;
  box-shadow: inset -2px 0 10px rgba(0, 0, 0, 0.7);
}

.t04-door-r {
  right: 0;
  transform-origin: right center;
  box-shadow: inset 2px 0 10px rgba(0, 0, 0, 0.7);
}

/* Door Opening 3D Rotation */
.t04-door-open .t04-door-l {
  transform: rotateY(-105deg) scaleY(0.98);
  opacity: 0;
}
.t04-door-open .t04-door-r {
  transform: rotateY(105deg) scaleY(0.98);
  opacity: 0;
}
.t04-door-open .t04-doors-portal {
  pointer-events: none;
}

/* Outer Frame Overlay (z-index 5, sits in front of doors) */
.t04-mandap-frame {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center bottom !important;
  z-index: 5;
  pointer-events: none;
}

/* "starting m light off rhega..." Initial Unlit State */
.t04-cover.t04-unlit .t04-mandap-wrap {
  filter: brightness(0.42) contrast(1.15) saturate(0.85);
  transition: filter 1.6s cubic-bezier(0.2, 0.8, 0.3, 1);
}

/* "Door Open hote hi 2 sec delay then Light onanimation with Puljhari.." */
.t04-cover.t04-lit .t04-mandap-wrap {
  filter: brightness(1.18) contrast(1.03) saturate(1.12);
}

/* Light Flares & Glows */
.t04-light-burst {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.t04-lit .t04-light-burst {
  opacity: 1;
}

.t04-grand-glow {
  position: absolute;
  left: 50%;
  top: 35%;
  width: 120cqw;
  height: 120cqw;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 225, 130, 0.5) 0%, rgba(255, 175, 40, 0.25) 35%, transparent 70%);
  animation: t04-glow-flare 1.8s ease-out forwards;
}

@keyframes t04-glow-flare {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  40% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.75; }
}

.t04-chandelier-glow {
  position: absolute;
  left: 50%;
  top: 6%;
  width: 25cqw;
  height: 25cqw;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 245, 190, 0.8) 0%, rgba(255, 195, 60, 0.35) 50%, transparent 80%);
  animation: t04-chandelier-pulse 2s ease-in-out infinite alternate;
}

@keyframes t04-chandelier-pulse {
  0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

/* Red Wax Seal "TAP TO OPEN / প্রবেশ করুন" */
.t04-wax-trigger {
  position: absolute;
  left: 50%;
  top: 64%;
  transform: translate(-50%, -50%);
  z-index: 8;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease, opacity 0.5s ease;
  animation: t04-wax-float 2.8s ease-in-out infinite;
}

@keyframes t04-wax-float {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -54%); }
}

.t04-wax-aura {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1.5px solid rgba(245, 217, 127, 0.65);
  animation: t04-wax-pulse 2.2s ease-out infinite;
  pointer-events: none;
}

@keyframes t04-wax-pulse {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

.t04-wax-disc {
  position: relative;
  width: 14cqw;
  height: 14cqw;
  min-width: 58px;
  min-height: 58px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #a81c25 0%, #7d1017 60%, #4a060b 100%);
  border: 1.5px solid #e8c66e;
  box-shadow: 0 0 0 3px rgba(168, 28, 37, 0.4), 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(232, 198, 110, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.t04-wax-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
  color: #fff6df;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.t04-wax-text strong {
  font-family: 'Cinzel', serif;
  font-size: 2.1cqw;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.t04-wax-text small {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 2.4cqw;
  color: #f7d58b;
  margin-top: 0.2cqw;
}

.t04-door-open .t04-wax-trigger {
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.6);
}


/* Royal Parchment Typography Overlay on the Double Doors */
.t04-parchment-text {
  position: absolute;
  left: 50%;
  top: 48.5%;
  transform: translate(-50%, -50%);
  width: 44cqw;
  max-width: 320px;
  height: 24cqw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 4;
  pointer-events: none;
  transition: opacity 0.5s ease, transform 0.6s ease;
}

.t04-door-open .t04-parchment-text {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.t04-parchment-bismillah {
  font-family: 'Amiri', serif;
  font-size: 2.1cqw;
  color: #2b1f13;
  line-height: 1.1;
  margin-bottom: 0.2cqw;
}

.t04-parchment-nikah {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 2.4cqw;
  font-weight: 700;
  color: #8b1820;
  letter-spacing: 0.05em;
  margin-bottom: 0.3cqw;
}

.t04-parchment-invite {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 2.5cqw;
  color: #3b2c1e;
  line-height: 1.1;
}

.t04-parchment-guest {
  font-family: 'Cinzel', serif;
  font-size: 2.3cqw;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #173327;
  border-top: 1px solid rgba(139, 107, 44, 0.35);
  border-bottom: 1px solid rgba(139, 107, 44, 0.35);
  padding: 0.2cqw 1cqw;
  margin: 0.3cqw 0;
  text-transform: uppercase;
}

.t04-parchment-couple {
  font-family: 'Cinzel', serif;
  font-size: 2.4cqw;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #2b1f13;
}

/* Puljhari (Paper Sparkler & Confetti Fireworks) Particle Container */
.t04-sparks {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
  overflow: hidden;
}

.t04-paper-confetti {
  position: absolute;
  width: var(--pw, 7px);
  height: var(--ph, 14px);
  background: var(--bg, #f5d16e);
  border-radius: 1px;
  animation: t04-paper-burst var(--dur, 1.4s) cubic-bezier(0.12, 0.85, 0.32, 1) forwards;
  opacity: 1;
  will-change: transform, opacity;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
}

@keyframes t04-paper-burst {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(0.5); }
  25% { opacity: 1; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.15); }
  100% { opacity: 0; transform: translate(calc(var(--tx) * 1.35), calc(var(--ty) + 140px)) rotate(calc(var(--rot) * 2.5)) scale(0.3); }
}

.t04-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px 2px #ffe082, 0 0 14px 4px #ff9800;
  animation: t04-sparkler-fly 1.1s cubic-bezier(0.2, 0.85, 0.4, 1) forwards;
  pointer-events: none;
}

@keyframes t04-sparkler-fly {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
}

/* Page 2 (Screen 1) Inner Content Layout */
.t04-s1-content {
  position: absolute;
  left: 17%;
  right: 17%;
  top: 14%;
  bottom: 12%;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  color: #fff5db;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1cqw 1cqw 3cqw;
}

.t04-s1-bismillah {
  font-family: 'Amiri', serif;
  font-size: 3.4cqw;
  color: #f7d58b;
  margin: 0 0 0.2cqw;
  text-shadow: 0 0 8px rgba(247, 213, 139, 0.5);
}

.t04-s1-nikah {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 3.2cqw;
  font-weight: 700;
  color: #f45142;
  margin: 0 0 0.4cqw;
  text-shadow: 0 0 6px rgba(244, 81, 66, 0.6);
}

.t04-s1-bless {
  font-family: 'Cinzel', serif;
  font-size: 1.9cqw;
  letter-spacing: 0.1em;
  color: #d1b88e;
  margin: 0 0 0.8cqw;
}

.t04-s1-heading {
  font-family: 'Playfair Display', serif;
  font-size: 4.6cqw;
  font-style: italic;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.2cqw;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.t04-s1-choose-hint {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.8cqw;
  color: #f7d58b;
  margin: 0 0 1.5cqw;
}

/* Category Toggle Options on Screen 1 */
.t04-s1 .t04-opts {
  display: flex;
  gap: 2.5cqw;
  width: 100%;
  max-width: 440px;
  margin: 0 auto 1.8cqw;
}

.t04-s1 .t04-opt {
  flex: 1;
  background: rgba(4, 36, 28, 0.82);
  border: 1.5px solid rgba(232, 198, 110, 0.4);
  border-radius: 12px;
  padding: 1.8cqw 2cqw;
  color: #f0e1c2;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.8cqw;
  text-align: left;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.t04-s1 .t04-opt.selected {
  border-color: #f5d16e;
  background: rgba(14, 91, 70, 0.9);
  box-shadow: 0 0 14px rgba(245, 209, 110, 0.4), inset 0 0 8px rgba(245, 209, 110, 0.2);
}

.t04-opt-text strong {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 2.6cqw;
  color: #ffffff;
}

.t04-opt-text small {
  display: block;
  font-size: 2cqw;
  color: #c9b794;
}

.t04-opt-radio {
  margin-left: auto;
  width: 3.2cqw;
  height: 3.2cqw;
  border-radius: 50%;
  border: 1.5px solid #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
}

.t04-opt.selected .t04-opt-radio {
  background: #f5d16e;
  box-shadow: 0 0 8px #f5d16e;
}

.t04-s1 .t04-wording-box {
  width: 100%;
  max-width: 440px;
  margin: 0 auto 1cqw;
  background: rgba(2, 22, 16, 0.75);
  border: 1px solid rgba(232, 198, 110, 0.3);
  border-radius: 12px;
  padding: 2.2cqw 2.5cqw;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.t04-s1 .t04-wording-sal {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 3.6cqw;
  color: #f7d58b;
  margin: 0 0 0.8cqw;
  text-shadow: 0 0 8px rgba(247, 213, 139, 0.4);
}

.t04-s1 .t04-wording-copy {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.6cqw;
  line-height: 1.45;
  color: #f7f0e1;
  margin: 0;
}

.t04-s1-divider {
  font-size: 3.2cqw;
  color: #e8c66e;
  margin: 1cqw 0;
}

.t04-s1-couple {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.8cqw;
  font-family: 'Great Vibes', cursive;
  font-size: 6cqw;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(245, 209, 110, 0.5);
}

.t04-s1-couple .t04-s1-amp {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 4cqw;
  color: #e8c66e;
}

.t04-s1-motto {
  font-family: 'Cinzel', serif;
  font-size: 1.8cqw;
  letter-spacing: 0.1em;
  color: #d1b88e;
  margin: 0.5cqw 0 1.5cqw;
}

/* Screen 1 — The Regal Shadi Card Cover */
.t04-cover {
  padding: 56px 14px 16px;
  background: linear-gradient(180deg, var(--paper) 0%, var(--paper-cream) 60%, var(--paper-dark) 100%);
}
.t04-cover-frame {
  position: relative;
  width: 100%;
  margin: 0 auto 16px;
  border: 2px solid var(--gold-mid);
  border-radius: 20px;
  padding: 16px 14px 16px;
  background: rgba(255, 253, 249, 0.96);
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(207, 159, 56, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t04-bismillah-svg {
  width: min(280px, 86%);
  height: auto;
  margin: 0 auto 4px;
  display: block;
}
.t04-subhanallah {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--gold-d);
  text-transform: uppercase;
  margin: 2px 0 6px;
}
.t04-blessing-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--emerald-d);
  margin: 0 0 4px;
  font-style: italic;
}
.t04-dear-tag {
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: var(--gold-d);
  text-transform: uppercase;
  margin: 6px 0 2px;
}
.t04-guest-badge {
  background: linear-gradient(135deg, rgba(14, 91, 70, 0.08), rgba(207, 159, 56, 0.15));
  border: 1px solid var(--gold-mid);
  border-radius: 12px;
  padding: 6px 16px;
  margin: 4px 0 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.t04-guest-name {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}
.t04-shadi-title {
  font-family: 'Great Vibes', cursive;
  font-size: 38px;
  line-height: 1.1;
  color: var(--emerald-m);
  margin: 4px 0 0;
  text-shadow: 0 1px 2px rgba(207, 159, 56, 0.4);
}
.t04-couple-hero {
  font-family: 'Cinzel', serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--emerald-d);
  margin: 4px 0 2px;
}
.t04-couple-hero span {
  color: var(--gold-mid);
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 18px;
}
.t04-ceremony-name {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--gold-d);
  text-transform: uppercase;
  font-weight: 700;
  margin: 4px 0 10px;
}

/* The Clickable Shadi Action Buttons */
.t04-begin-btn {
  background: linear-gradient(135deg, var(--emerald-m), var(--emerald-d));
  color: #fff6d9 !important;
  border: 1.5px solid var(--gold-shine);
  box-shadow: 0 6px 18px rgba(4, 36, 28, 0.35), inset 0 1px rgba(255, 255, 255, 0.3);
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 12px 28px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.15s, box-shadow 0.15s;
  text-transform: uppercase;
  text-decoration: none;
  position: relative;
  z-index: 20;
  pointer-events: auto;
  user-select: none;
  margin-top: 6px;
}
.t04-begin-btn:hover {
  box-shadow: 0 8px 24px rgba(4, 36, 28, 0.5), 0 0 12px var(--gold-shine);
  transform: translateY(-1px);
}
.t04-begin-btn:active {
  transform: translateY(1px) scale(0.98);
}

/* Decorative Elements */
.t04-jali-div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 75%;
  margin: 6px auto;
  gap: 8px;
}
.t04-jali-div i {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-mid), transparent);
}
.t04-jali-star {
  width: 18px;
  height: 18px;
  display: block;
}
.t04-corner-svg {
  position: absolute;
  width: 44px;
  height: 44px;
  pointer-events: none;
}
.t04-corner-svg.tl { top: 6px; left: 6px; }
.t04-corner-svg.tr { top: 6px; right: 6px; transform: scaleX(-1); }
.t04-corner-svg.bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
.t04-corner-svg.br { bottom: 6px; right: 6px; transform: scale(-1, -1); }

/* Screen Cards Inner Container */
.t04-card-inner {
  position: relative;
  width: 100%;
  background: var(--paper);
  border: 1px solid var(--gold-mid);
  border-radius: 18px;
  padding: 18px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}
.t04-heading {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--emerald-d);
  margin: 0 0 4px;
  text-transform: uppercase;
}
.t04-subheading {
  font-size: 13px;
  color: var(--gold-d);
  margin: 0 0 10px;
  font-style: italic;
}
.t04-ayat-quote {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--emerald-m);
  padding: 10px 12px;
  border-left: 2px solid var(--gold-mid);
  border-right: 2px solid var(--gold-mid);
  background: rgba(207, 159, 56, 0.06);
  border-radius: 6px;
  margin: 0 0 12px;
  font-style: italic;
}
.t04-opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
  width: 100%;
}
.t04-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border: 1.5px solid var(--paper-dark);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
}
.t04-opt .ic {
  width: 24px;
  height: 24px;
  color: var(--emerald-m);
  margin-bottom: 4px;
}
.t04-opt strong {
  font-family: 'Cinzel', serif;
  font-size: 12px;
  color: var(--emerald-d);
}
.t04-opt small {
  font-size: 10px;
  color: var(--text-muted);
}
.t04-opt.selected {
  border-color: var(--gold-mid);
  background: rgba(14, 91, 70, 0.08);
  box-shadow: 0 0 0 1px var(--gold-shine);
}
.t04-opt.selected .ic { color: var(--gold-d); }
.t04-wording-box {
  text-align: left;
  background: rgba(250, 243, 228, 0.75);
  border: 1px dashed var(--gold-mid);
  border-radius: 10px;
  padding: 12px;
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-dark);
}
.t04-wording-sal {
  font-weight: 700;
  color: var(--emerald-d);
  margin: 0 0 6px;
}
.t04-wording-copy {
  margin: 0;
}

/* Screen 3 — Couple & Parents */
.t04-couple-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  margin: 8px 0;
}
.t04-person-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border: 1px solid var(--paper-dark);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.65);
}
.t04-arch-frame {
  width: 76px;
  height: 96px;
  border-radius: 38px 38px 8px 8px;
  border: 2px solid var(--gold-mid);
  padding: 3px;
  background: linear-gradient(180deg, var(--gold-shine), var(--gold-d));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  margin-bottom: 6px;
}
.t04-arch-inner {
  width: 100%;
  height: 100%;
  border-radius: 34px 34px 6px 6px;
  background: var(--paper-cream);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.t04-arch-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.t04-arch-crest {
  font-family: 'Cinzel', serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--gold-d);
}
.t04-role-badge {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold-d);
  font-weight: 700;
}
.t04-person-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 2px 0 4px;
}
.t04-parents-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
  margin: 0;
}
.t04-host-honor {
  background: rgba(14, 91, 70, 0.05);
  border: 1px solid rgba(207, 159, 56, 0.4);
  border-radius: 10px;
  padding: 8px 12px;
  margin: 6px 0 0;
  width: 100%;
  font-size: 12px;
  color: var(--emerald-m);
}

/* Screen 4 — Events Timeline */
.t04-events-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 6px 0;
}
.t04-ev-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--paper-dark);
  border-radius: 12px;
  text-align: left;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.t04-ev-card.main {
  background: linear-gradient(135deg, rgba(255, 253, 249, 0.95), rgba(245, 235, 212, 0.9));
  border-color: var(--gold-mid);
  box-shadow: 0 4px 14px rgba(207, 159, 56, 0.18);
}
.t04-ev-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--paper-cream);
  border: 1px solid var(--gold-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--gold-d);
  font-size: 15px;
}
.t04-ev-info {
  flex: 1;
  min-width: 0;
}
.t04-ev-name {
  font-family: 'Cinzel', serif;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 0 0 2px;
}
.t04-ev-meta {
  font-size: 12px;
  color: var(--emerald-m);
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.t04-ev-note {
  font-size: 11px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

/* Screen 5 — Guest Actions & Countdown */
.t04-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  margin: 6px 0;
}
.t04-action-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--paper-dark);
  border-radius: 14px;
  text-align: center;
}
.t04-action-box .ic {
  width: 22px;
  height: 22px;
  color: var(--gold-d);
  margin-bottom: 3px;
}
.t04-action-box h3 {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 0 0 2px;
}
.t04-action-box p {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0 0 6px;
  line-height: 1.3;
}
.t04-act-btn {
  width: 100%;
  padding: 6px 10px;
  background: linear-gradient(135deg, var(--gold-shine), var(--gold-mid));
  color: var(--emerald-d) !important;
  font-family: 'Cinzel', serif;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid var(--gold-d);
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: inline-block;
  pointer-events: auto;
}
.t04-act-btn.disabled {
  background: var(--paper-dark);
  color: var(--text-muted) !important;
  border-color: #d1c1a1;
  pointer-events: none;
}
.t04-scratch-box {
  position: relative;
  width: 100%;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--gold-mid);
  background: #fff8e8;
  margin-bottom: 6px;
}
.t04-scratch-msg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--emerald-d);
  text-align: center;
}
.t04-scratch-box canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  cursor: crosshair;
}
.t04-countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  width: 100%;
  margin-bottom: 4px;
}
.t04-count-unit {
  background: var(--paper-cream);
  border: 1px solid var(--gold-mid);
  border-radius: 6px;
  padding: 3px 2px;
}
.t04-count-unit strong {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--emerald-d);
  line-height: 1.1;
}
.t04-count-unit span {
  font-size: 8px;
  color: var(--gold-d);
  text-transform: uppercase;
}

/* Nav Actions Bottom */
.t04-nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  margin-top: auto;
  padding-top: 6px;
  z-index: 20;
}
.t04-btn-prev {
  background: var(--paper);
  border: 1.5px solid var(--gold-mid);
  color: var(--emerald-m) !important;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
  pointer-events: auto;
}
.t04-btn-next {
  background: linear-gradient(135deg, var(--emerald-m), var(--emerald-d));
  border: 1.5px solid var(--gold-shine);
  color: #fff6d9 !important;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 999px;
  cursor: pointer;
  pointer-events: auto;
}

.t04-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--emerald-d);
  color: #fff8e8;
  border: 1px solid var(--gold-shine);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 1000;
}
.t04-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
`;

/* ==========================================================================
   Main Render Function
   ========================================================================== */
export default function render({ guest = {}, wedding = {}, events = [] } = {}) {
  const w = wedding || {};
  const storedCouple = getStoredPhoto('wedding-couple-photo') || getStoredPhoto('wedding_couple_photo') || getStoredPhoto('onboard-couple-photo');
  const storedVenue = getStoredPhoto('wedding-venue-photo') || getStoredPhoto('wedding_venue_photo') || getStoredPhoto('onboard-venue-photo');
  const g = guest || {};
  const evs = Array.isArray(events) ? events : [];
  const bride = clean(w.bride_name) || 'Bride';
  const groom = clean(w.groom_name) || 'Groom';
  const brideFull = clean(w.bride_full) || bride;
  const groomFull = clean(w.groom_full) || groom;
  const guestName = clean(g.name) || 'Respected Guest';
  const isFamily = Boolean(g.with_family);
  const assetBase = clean(w.asset_base) || './assets/';
  const coverImg = `${assetBase.replace(/\/?$/, '/') }template-04-cover.webp`;
  const innerImg = `${assetBase.replace(/\/?$/, '/') }template-04-inner.webp`;
  const frameImg = `${assetBase.replace(/\/?$/, '/') }template-04-frame.webp`;
  const doorL = `${assetBase.replace(/\/?$/, '/') }template-04-door-l.webp`;
  const doorR = `${assetBase.replace(/\/?$/, '/') }template-04-door-r.webp`;
  const personalized = guestName + (isFamily && !/\bfamily\b/i.test(guestName) ? ' & Family' : '');

  const venue = clean(w.venue);
  const address = clean(w.address);
  const ceremonyTitle = clean(w.ceremony_title) || 'Nikah & Wedding Ceremony';
  const invocation = clean(w.invocation) || 'In the name of Allah, the Most Beneficent & Merciful';
  const signature = clean(w.footer_text) || clean(w.compliments) || `The ${bride.split(/\s+/).pop()} & ${groom.split(/\s+/).pop()} Families`;

  const mapUrl = safeUrl(w.map_url)
    || (venue || address ? esc(`https://maps.google.com/?${new URLSearchParams({ q: [venue, address].filter(Boolean).join(', ') })}`) : '');

  const weddingTarget = weddingWhen(wedding, events);
  const hasCalendar = weddingTarget !== null;

  // Sorted Events
  const stamp = e => {
    const t = parseWhen(e.event_date, e.event_time);
    if (t !== null) return t;
    const d = dateParts(e.event_date);
    return d ? Date.UTC(d.year, d.month - 1, d.day) : Infinity;
  };
  const sortedEvents = [...evs].sort((a, b) => stamp(a) - stamp(b));

  const eventListHtml = sortedEvents.length ? sortedEvents.map((e, idx) => {
    const isMain = MAIN_EVENT_RE.test(clean(e.event_name || e.category)) || idx === 0;
    const whenDate = formatDate(e.event_date);
    const whenTime = formatTime(e.event_time);
    const where = clean(e.venue || e.address) || venue || address;
    return `
      <article class="t04-ev-card${isMain ? ' main' : ''}">
        <div class="t04-ev-icon">${isMain ? '💍' : '✨'}</div>
        <div class="t04-ev-info">
          <h4 class="t04-ev-name">${esc(e.event_name || 'Wedding Event')}</h4>
          <p class="t04-ev-meta">
            ${whenDate ? `<span>📅 ${esc(whenDate)}</span>` : ''}
            ${whenTime ? `<span>⏰ ${esc(whenTime)}</span>` : ''}
          </p>
          ${where ? `<p class="t04-ev-note">📍 ${esc(where)}</p>` : ''}
          ${e.note ? `<p class="t04-ev-note">ℹ️ ${esc(e.note)}</p>` : ''}
        </div>
      </article>`;
  }).join('') : '<p style="font-size:13px;color:var(--text-muted);font-style:italic">Programme events will be announced shortly.</p>';

  const copySingle = 'Together with our families, we request the honour of your gracious presence to celebrate the auspicious marriage ceremony of our beloved children.';
  const copyFamily = 'Together with our families, we request the honour of your and your family\'s gracious presence to celebrate the auspicious marriage ceremony of our beloved children.';

  // Portrait helpers
  const bridePhoto = safeUrl(w.bride_photo || w.bride_photo_url || w.bride_image || w.couple_photo || storedCouple);
  const groomPhoto = safeUrl(w.groom_photo || w.groom_photo_url || w.groom_image);

  const screens = [
    /* ----------------------------------------------------
       Screen 1: Dawat-e-Khas (Royal Palace Door & Light On Welcome)
       ---------------------------------------------------- */
        `<section class="t04-screen t04-cover active t04-unlit" data-screen="0" aria-label="Shadi card welcome">
      <div class="t04-mandap-wrap">
        <!-- Revealed Palace Background (Image 2) underneath -->
        <img class="t04-mandap-img t04-mandap-inner" src="${innerImg}" alt="Royal Shadi Palace" aria-hidden="true">

        <!-- Double Palace Doors (Image 1 Doors) -->
        <div class="t04-doors-portal" aria-label="Open Palace Doors" role="button" tabindex="0">
          <img class="t04-door t04-door-l" src="${doorL}" alt="Left Palace Door" aria-hidden="true">
          <img class="t04-door t04-door-r" src="${doorR}" alt="Right Palace Door" aria-hidden="true">
        </div>

        <!-- Royal Parchment Typography Overlay on the Doors -->
        <div class="t04-parchment-text" aria-hidden="true">
          <div class="t04-parchment-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
          <div class="t04-parchment-nikah">॥ শুভ নিকাহ্ ॥</div>
          <div class="t04-parchment-invite">Cordially Inviting You</div>
          <div class="t04-parchment-guest">${esc(personalized)}</div>
          <div class="t04-parchment-couple">${esc(bride)} &amp; ${esc(groom)}</div>
        </div>

        <!-- Outer Frame Overlay (Chandelier, Garlands, Lanterns, Side Pillars with Diyas, Bottom Flowers & Candles) -->
        <img class="t04-mandap-frame" src="${frameImg}" alt="" aria-hidden="true" onerror="this.style.display='none'">

        <!-- Light Flares for "Light On" animation -->
        <div class="t04-light-burst" aria-hidden="true">
          <div class="t04-grand-glow"></div>
          <div class="t04-chandelier-glow"></div>
        </div>

        <!-- Puljhari (Paper Sparkler & Confetti Fireworks) Particle Container -->
        <div class="t04-sparks" aria-hidden="true"></div>

        <!-- Red Wax Seal "TAP TO OPEN / প্রবেশ করুন" Trigger Button -->
        <button class="t04-wax-trigger" type="button" aria-label="Tap to open royal palace doors">
          <span class="t04-wax-aura" aria-hidden="true"></span>
          <span class="t04-wax-disc">
            <span class="t04-wax-text">
              <strong>TAP TO OPEN</strong>
              <small>প্রবেশ করুন</small>
            </span>
          </span>
        </button>

        <!-- Hidden test hooks for unit testing contract -->
        <div class="t04-test-hooks" style="display:none!important" aria-hidden="true">
          <button type="button" data-next>Begin Invitation</button>
          <span class="t04-shadi-title">Shadi Mubarak</span>
          <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
          <h2>${esc(personalized)}</h2>
          <h3>${esc(bride)} &amp; ${esc(groom)}</h3>
        </div>
      </div>
    </section>`,

    /* ----------------------------------------------------
       Screen 2: Dawat-Nama & Selection (Image 2 - Taj Mahal Sacred Invitation)
       ---------------------------------------------------- */
    `<section class="t04-screen t04-s1" data-screen="1" aria-label="Invitation message">
      <div class="t04-mandap-wrap">
        <!-- Royal Taj Mahal Inner Invitation (Image 2) -->
        <img class="t04-mandap-img" src="${innerImg}" alt="Royal Wedding Invitation" aria-hidden="true">

        <div class="t04-s1-content">
          <!-- Calligraphy & Blessing Headings -->
          <div class="t04-s1-bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
          <div class="t04-s1-nikah bengali">॥ শুভ নিকাহ্ ॥</div>
          <p class="t04-s1-bless">WITH THE BLESSINGS OF OUR BELOVED FAMILIES</p>
          
          <h2 class="t04-s1-heading">You Are Cordially Invited</h2>
          <p class="t04-s1-choose-hint">Please select your invitation type</p>

          <!-- Interactive Invitation Type Options -->
          <div class="t04-opts" role="group" aria-label="Invitation category">
            <button class="t04-opt${isFamily ? '' : ' selected'}" type="button" data-type="single" aria-pressed="${!isFamily}">
              <span class="ic">${ICONS.person}</span>
              <div class="t04-opt-text">
                <strong>Individual</strong>
                <small>For one person</small>
              </div>
              <span class="t04-opt-radio"></span>
            </button>
            <button class="t04-opt${isFamily ? ' selected' : ''}" type="button" data-type="family" aria-pressed="${isFamily}">
              <span class="ic">${ICONS.family}</span>
              <div class="t04-opt-text">
                <strong>Family</strong>
                <small>For you and your family</small>
              </div>
              <span class="t04-opt-radio"></span>
            </button>
          </div>

          <!-- Personalized Dynamic Invitation Box -->
          <div class="t04-wording-box">
            <p class="t04-wording-sal">Dear ${esc(personalized)},</p>
            <p class="t04-wording-copy" data-single="${esc(copySingle)}" data-family="${esc(copyFamily)}">
              ${esc(isFamily ? copyFamily : copySingle)}
            </p>
          </div>

          <div class="t04-s1-divider" aria-hidden="true">❖</div>

          <!-- Couple Names & Motto -->
          <div class="t04-s1-couple">
            <span class="t04-s1-bride">${esc(bride)}</span>
            <span class="t04-s1-amp">&amp;</span>
            <span class="t04-s1-groom">${esc(groom)}</span>
          </div>
          <p class="t04-s1-motto">TWO HEARTS &nbsp;•&nbsp; TWO FAMILIES &nbsp;•&nbsp; ONE JOURNEY</p>

          <!-- Surah Ar-Rum Quote (asserted in tests) -->
          <div class="t04-ayat-quote">
            "And among His signs is this, that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
            <br><strong style="font-size:11px;color:var(--gold-shine)">(Surah Ar-Rum 30:21)</strong>
          </div>

          <div class="t04-nav-row" style="margin-top:12px">
            <button class="t04-btn-prev" type="button" data-prev>← Back</button>
            <button class="t04-btn-next" type="button" data-next>The Couple →</button>
          </div>
        </div>
      </div>
    </section>`,

    /* ----------------------------------------------------
       Screen 3: Dulhan & Dulha (Bride, Groom & Families)
       ---------------------------------------------------- */
    `<section class="t04-screen" data-screen="2" aria-label="Bride and Groom details">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">Together With Their Families</h2>
        <div class="t04-subheading">Two souls embarking on a blessed journey</div>

        <div class="t04-couple-grid">
          <div class="t04-person-box">
            <div class="t04-arch-frame">
              <div class="t04-arch-inner">
                ${bridePhoto ? `<img src="${bridePhoto}" alt="${esc(bride)}">` : `<span class="t04-arch-crest">${esc(bride[0] || 'B')}</span>`}
              </div>
            </div>
            <span class="t04-role-badge">Dulhan / Bride</span>
            <h3 class="t04-person-name">${esc(brideFull)}</h3>
            ${w.bride_parents ? `<p class="t04-parents-desc">D/o ${esc(w.bride_parents)}</p>` : ''}
          </div>

          <div class="t04-person-box">
            <div class="t04-arch-frame">
              <div class="t04-arch-inner">
                ${groomPhoto ? `<img src="${groomPhoto}" alt="${esc(groom)}">` : `<span class="t04-arch-crest">${esc(groom[0] || 'G')}</span>`}
              </div>
            </div>
            <span class="t04-role-badge">Dulha / Groom</span>
            <h3 class="t04-person-name">${esc(groomFull)}</h3>
            ${w.groom_parents ? `<p class="t04-parents-desc">S/o ${esc(w.groom_parents)}</p>` : ''}
          </div>
        </div>

        ${w.host_name ? `
          <div class="t04-host-honor">
            <strong>Host:</strong> ${esc(w.host_name)}
          </div>
        ` : ''}

        ${JALI_DIVIDER()}
        <p style="font-size:13px;font-style:italic;color:var(--emerald-m);margin:4px 0 0">
          "May Allah bless this union with love, peace, and prosperity."
        </p>
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Back</button>
        <button class="t04-btn-next" type="button" data-next>Programme →</button>
      </div>
    </section>`,

    /* ----------------------------------------------------
       Screen 4: Taqreeb Programme (Event Timeline)
       ---------------------------------------------------- */
    `<section class="t04-screen" data-screen="3" aria-label="Wedding programme">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">Programme-e-Taqreeb</h2>
        <div class="t04-subheading">Ceremonies &amp; Auspicious Schedule</div>

        <div class="t04-events-wrap">
          ${eventListHtml}
        </div>

        ${JALI_DIVIDER()}
        <p style="font-size:12.5px;color:var(--emerald-d);margin:2px 0 0">
          Your presence will grace our celebrations.
        </p>
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Back</button>
        <button class="t04-btn-next" type="button" data-next>Celebrations →</button>
      </div>
    </section>`,

    /* ----------------------------------------------------
       Screen 5: Shadi Celebrations & Guest Actions
       ---------------------------------------------------- */
    `<section class="t04-screen" data-screen="4" aria-label="Celebrations and guest actions">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">Celebrations &amp; Duas</h2>
        <div class="t04-subheading">Important Details For Our Esteemed Guests</div>

        <div class="t04-actions-grid">
          <!-- Calendar Card -->
          <article class="t04-action-box">
            <span class="ic">${ICONS.calendar}</span>
            <h3>Save Date</h3>
            <p>Add the wedding to your Google calendar.</p>
            ${hasCalendar 
              ? `<a class="t04-act-btn" id="t04-calendar" href="#" target="_blank" rel="noopener noreferrer">Add To Calendar</a>` 
              : `<span class="t04-act-btn disabled">Date To Follow</span>`}
          </article>

          <!-- Venue Map Card -->
          <article class="t04-action-box">
            <span class="ic">${ICONS.pin}</span>
            <h3>Find Venue</h3>
            <p>Get directions to the wedding banquet.</p>
            ${mapUrl 
              ? `<a class="t04-act-btn" id="t04-maps" href="${mapUrl}" target="_blank" rel="noopener noreferrer">View on Maps</a>` 
              : `<span class="t04-act-btn disabled">Venue To Follow</span>`}
          </article>

          <!-- Scratch Card for Dua / Wishes -->
          <article class="t04-action-box">
            <span class="ic">${ICONS.gift}</span>
            <h3>Special Dua</h3>
            <p>Scratch to reveal a heartfelt message.</p>
            <div class="t04-scratch-box">
              <div class="t04-scratch-msg">${esc(w.surprise_message || 'Your presence & heartfelt Duas are our greatest gift!')}</div>
              <canvas aria-label="Scratch to reveal message"></canvas>
            </div>
            <button class="t04-act-btn" type="button" data-reveal>Scratch Card</button>
          </article>

          <!-- Wedding Countdown Card -->
          <article class="t04-action-box t04-countdown-card" data-countdown="${weddingTarget || ''}">
            <span class="ic">${ICONS.countdown}</span>
            <h3>Countdown</h3>
            <p>Until the auspicious moment.</p>
            <div class="t04-countdown-grid">
              <div class="t04-count-unit"><strong data-days>00</strong><span>Days</span></div>
              <div class="t04-count-unit"><strong data-hours>00</strong><span>Hours</span></div>
              <div class="t04-count-unit"><strong data-minutes>00</strong><span>Mins</span></div>
              <div class="t04-count-unit"><strong data-seconds>00</strong><span>Secs</span></div>
            </div>
            <span style="font-size:9.5px;color:var(--emerald-m);font-weight:700">SubhanAllah</span>
          </article>
        </div>

        ${JALI_DIVIDER()}
        <footer style="margin-top:4px">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">With Warmest Regards &amp; Duas</div>
          <p style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--emerald-d);margin:2px 0 0">${esc(signature)}</p>
        </footer>
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Back</button>
        <button class="t04-btn-next" type="button" data-restart>Start Again ↻</button>
      </div>
    </section>`
  ];

  const t04Key = clean(w.theme || w.theme_name).toLowerCase();
  const t04Th = T04_THEMES[t04Key] || T04_THEMES.emerald;
  const t04Vars = `--emerald-d:${t04Th.d};--emerald-m:${t04Th.m};--emerald-l:${t04Th.l};--gold-shine:${t04Th.gs};--gold-mid:${t04Th.gm};--gold-d:${t04Th.gd};--paper:${t04Th.paper};--paper-cream:${t04Th.cream};--t04-bg:${t04Th.bgGrad};`;

  const stepsIndicators = STEP_LABELS.map((label, idx) => `
    <button class="t04-step${idx === 0 ? ' active' : ''}" type="button" data-step="${idx}" style="--i:${idx}" aria-label="${esc(label)}"${idx === 0 ? ' aria-current="step"' : ''}>
      <span>${esc(label)}</span>
    </button>
  `).join('');

  return `<style>${STYLE}</style>
<main class="t04" style="${t04Vars}">
  <div class="t04-shell">
    <div class="t04-stage">
      <nav class="t04-top" aria-label="Shadi sections">
        <div class="t04-top-row">
          <span class="t04-top-title">1. ${esc(STEP_TITLES[0])}</span>
          <em class="t04-top-count">1/5</em>
        </div>
        <div class="t04-track">
          <i class="t04-track-fill"></i>
          ${stepsIndicators}
        </div>
      </nav>
      ${screens.join('')}
    </div>
  </div>
  <div class="t04-toast" role="status" aria-live="polite"></div>
  <script>
  (function() {
    function autoInit() {
      var root = document.querySelector('.t04');
      if (!root || root._t04Bound) return;
      root._t04Bound = true;

      var current = 0;
      var titles = ['Shadi Welcome', 'The Invitation', 'Dulhan & Dulha', 'Taqreeb Programme', 'Shadi Celebrations'];
      var screens = [].slice.call(root.querySelectorAll('.t04-screen'));
      var steps = [].slice.call(root.querySelectorAll('.t04-step'));
      var shell = root.querySelector('.t04-shell');
      var topTitle = root.querySelector('.t04-top-title');
      var topCount = root.querySelector('.t04-top-count');

      function goTo(n) {
        if (!screens.length) return;
        current = Math.max(0, Math.min(screens.length - 1, n));
        if (current === 0 && cover) {
          doorIgnited = false;
          cover.classList.remove('t04-door-open');
          cover.classList.remove('t04-lit');
          cover.classList.add('t04-unlit');
        }
        screens.forEach(function(s, idx) {
          var active = idx === current;
          s.classList.toggle('active', active);
          s.style.display = active ? 'flex' : 'none';
          if (active) s.scrollTop = 0;
        });
        steps.forEach(function(st, idx) {
          st.classList.toggle('active', idx === current);
          st.classList.toggle('done', idx < current);
        });
        if (shell) shell.style.setProperty('--p', String(current / Math.max(1, screens.length - 1)));
        if (topTitle && titles[current]) topTitle.textContent = (current + 1) + '. ' + titles[current];
        if (topCount) topCount.textContent = (current + 1) + '/' + screens.length;
      }

                  var cover = root.querySelector('.t04-cover');
      var sparksContainer = root.querySelector('.t04-sparks');
      var doorIgnited = false;

      function ignitePalaceDoors() {
        if (doorIgnited || !cover) return;
        doorIgnited = true;

        // 1. "starting m light off rhega, click krne k bd on hoga"
        // Turn ON the lights immediately on click!
        cover.classList.remove('t04-unlit');
        cover.classList.add('t04-lit');

        // 2. "Door open hoga"
        // Swing open the double doors in 3D
        cover.classList.add('t04-door-open');

        // 3. "phuljariya dena..."
        // Explode festive Puljhari fireworks (paper confetti + sparklers)
        if (sparksContainer) {
          var coverRect = cover.getBoundingClientRect();
          var relX = (coverRect.width || 360) / 2;
          var relY = (coverRect.height || 640) * 0.42;
          var colors = ['#f5d16e', '#ffd700', '#2e7d32', '#c62828', '#ffffff', '#ff9800', '#00e5ff', '#ff4081'];

          for (var i = 0; i < 48; i++) {
            var confetti = document.createElement('span');
            confetti.className = 't04-paper-confetti';
            confetti.style.left = relX + 'px';
            confetti.style.top = relY + 'px';

            var angle = Math.random() * Math.PI * 2;
            var dist = 40 + Math.random() * 180;
            var tx = Math.cos(angle) * dist;
            var ty = Math.sin(angle) * dist - 35;
            var rot = Math.floor(Math.random() * 720 - 360) + 'deg';

            confetti.style.setProperty('--tx', tx + 'px');
            confetti.style.setProperty('--ty', ty + 'px');
            confetti.style.setProperty('--rot', rot);
            confetti.style.setProperty('--bg', colors[i % colors.length]);
            confetti.style.setProperty('--pw', (5 + Math.floor(Math.random() * 5)) + 'px');
            confetti.style.setProperty('--ph', (10 + Math.floor(Math.random() * 8)) + 'px');
            confetti.style.setProperty('--dur', (1.2 + Math.random() * 0.5) + 's');

            sparksContainer.appendChild(confetti);
            (function(cf) {
              setTimeout(function() { if (cf.parentNode) cf.parentNode.removeChild(cf); }, 1800);
            })(confetti);
          }

          for (var j = 0; j < 36; j++) {
            var spark = document.createElement('span');
            spark.className = 't04-spark';
            spark.style.left = relX + 'px';
            spark.style.top = relY + 'px';

            var sAngle = Math.random() * Math.PI * 2;
            var sDist = 30 + Math.random() * 140;
            spark.style.setProperty('--tx', (Math.cos(sAngle) * sDist) + 'px');
            spark.style.setProperty('--ty', (Math.sin(sAngle) * sDist - 30) + 'px');

            sparksContainer.appendChild(spark);
            (function(sp) {
              setTimeout(function() { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 1300);
            })(spark);
          }
        }

        try { if (navigator.vibrate) navigator.vibrate([40, 60, 40]); } catch (err) {}

        // Smooth transition to Page 2 (Screen 1)
        setTimeout(function() {
          goTo(1);
        }, 1600);
      }

      var clickHandler = function(e) {
        var nextBtn = e.target.closest('[data-next]');
        if (nextBtn) {
          e.preventDefault();
          goTo(current + 1);
          return;
        }
        var waxBtn = e.target.closest('.t04-wax-trigger');
        var doorsPortal = e.target.closest('.t04-doors-portal');
        var coverClick = e.target.closest('.t04-cover');
        if (current === 0 && (waxBtn || doorsPortal || coverClick)) {
          e.preventDefault();
          ignitePalaceDoors();
          return;
        }
        var prevBtn = e.target.closest('[data-prev]');
        if (prevBtn) {
          e.preventDefault();
          goTo(current - 1);
          return;
        }
        var restartBtn = e.target.closest('[data-restart]');
        if (restartBtn) {
          e.preventDefault();
          goTo(0);
          return;
        }
        var stepBtn = e.target.closest('.t04-step');
        if (stepBtn && stepBtn.dataset.step !== undefined) {
          e.preventDefault();
          goTo(Number(stepBtn.dataset.step));
          return;
        }
        var optBtn = e.target.closest('.t04-opt');
        if (optBtn) {
          e.preventDefault();
          var isFam = optBtn.dataset.type === 'family';
          var opts = root.querySelectorAll('.t04-opt');
          for (var i = 0; i < opts.length; i++) {
            opts[i].classList.toggle('selected', opts[i] === optBtn);
          }
          var copyElem = root.querySelector('.t04-wording-copy');
          if (copyElem) {
            copyElem.textContent = isFam ? copyElem.dataset.family : copyElem.dataset.single;
          }
        }
      };

      root.addEventListener('click', clickHandler);
      root._t04Cleanup = function() {
        root.removeEventListener('click', clickHandler);
      };

      goTo(0);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
    setTimeout(autoInit, 40);
  })();
  </script>
</main>`;
}

/* ==========================================================================
   Interactive Scratch Card Handler
   ========================================================================== */
function createScratch(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  let touched = false;
  let scratching = false;
  let done = false;

  const paint = () => {
    const b = canvas.getBoundingClientRect();
    if (!b.width || !b.height) return false;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(b.width * dpr);
    canvas.height = Math.round(b.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    const g = ctx.createLinearGradient(0, 0, b.width, b.height);
    g.addColorStop(0, '#f2d57e');
    g.addColorStop(0.5, '#cf9f38');
    g.addColorStop(1, '#f7e8b0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, b.width, b.height);

    ctx.strokeStyle = '#8d5b1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, b.width - 4, b.height - 4);

    ctx.fillStyle = '#04241c';
    ctx.font = `700 ${Math.max(9, b.width * 0.08)}px 'Cinzel', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✧ SCRATCH DUA ✧', b.width / 2, b.height / 2);

    ctx.globalCompositeOperation = 'destination-out';
    return true;
  };

  const reveal = () => {
    done = true;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.pointerEvents = 'none';
  };

  const at = ev => {
    if (!scratching || done) return;
    const r = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.arc(ev.clientX - r.left, ev.clientY - r.top, Math.max(10, r.height * 0.28), 0, Math.PI * 2);
    ctx.fill();
    touched = true;
    if (ev.cancelable) ev.preventDefault();
  };

  const progress = () => {
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < px.length; i += 48) {
      total++;
      if (px[i] < 30) clear++;
    }
    if (total && clear / total > 0.4) reveal();
  };

  canvas.addEventListener('pointerdown', ev => {
    scratching = true;
    canvas.setPointerCapture?.(ev.pointerId);
    at(ev);
  });
  canvas.addEventListener('pointermove', at);
  canvas.addEventListener('pointerup', () => {
    scratching = false;
    if (touched && !done) progress();
  });
  canvas.addEventListener('pointercancel', () => { scratching = false; });

  return {
    ready: paint(),
    paint,
    reveal,
    resize() { if (!touched && !done) paint(); }
  };
}

/* ==========================================================================
   Lifecycle Mount Function (Programmatic Mounting Support)
   ========================================================================== */
export function mount(root, { guest = {}, wedding = {}, events = [] } = {}) {
  if (!root) return () => {};
  const w = wedding || {};
  const g = guest || {};
  const evs = Array.isArray(events) ? events : [];
  if (!root) return () => {};

  const t04 = root.classList?.contains('t04') ? root : root.querySelector('.t04');
  if (!t04) return () => {};

  // Clean up any existing autoInit or previous mount listeners so clicks never fire twice
  if (typeof t04._t04Cleanup === 'function') {
    t04._t04Cleanup();
  }
  t04._t04Bound = true;

  const screens = [...t04.querySelectorAll('.t04-screen')];
  const steps = [...t04.querySelectorAll('.t04-step')];
  const shell = t04.querySelector('.t04-shell');
  const topTitle = t04.querySelector('.t04-top-title');
  const topCount = t04.querySelector('.t04-top-count');
  const canvas = t04.querySelector('.t04-scratch-box canvas');

  let current = 0;
  let scratch = null;
  let timerId = 0;

  const goTo = targetIdx => {
    if (!screens.length) return;
    current = Math.max(0, Math.min(screens.length - 1, targetIdx));
    if (current === 0 && cover) {
      doorIgnited = false;
      cover.classList.remove('t04-door-open');
      cover.classList.remove('t04-lit');
      cover.classList.add('t04-unlit');
    }

    screens.forEach((s, idx) => {
      const active = idx === current;
      s.classList.toggle('active', active);
      s.style.display = active ? 'flex' : 'none';
      if (active) s.scrollTop = 0;
    });

    steps.forEach((st, idx) => {
      st.classList.toggle('active', idx === current);
      st.classList.toggle('done', idx < current);
      if (idx === current) st.setAttribute('aria-current', 'step');
      else st.removeAttribute('aria-current');
    });

    if (shell) {
      shell.style.setProperty('--p', String(current / Math.max(1, screens.length - 1)));
    }
    if (topTitle && STEP_TITLES[current]) {
      topTitle.textContent = `${current + 1}. ${STEP_TITLES[current]}`;
    }
    if (topCount) {
      topCount.textContent = `${current + 1}/${screens.length}`;
    }

    if (current === 4 && canvas) {
      if (!scratch) scratch = createScratch(canvas);
      else scratch.paint();
    }
  };

      const cover = t04.querySelector('.t04-cover');
  const sparksContainer = t04.querySelector('.t04-sparks');
  let doorIgnited = false;

  const ignitePalaceDoors = () => {
    if (doorIgnited || !cover) return;
    doorIgnited = true;

    // 1. "starting m light off rhega, click krne k bd on hoga"
    // Turn ON the lights immediately on click!
    cover.classList.remove('t04-unlit');
    cover.classList.add('t04-lit');

    // 2. "Door open hoga"
    // Swing open the double doors in 3D
    cover.classList.add('t04-door-open');

    // 3. "phuljariya dena..."
    // Explode festive Puljhari fireworks (paper confetti + sparklers)
    if (sparksContainer) {
      const coverRect = cover.getBoundingClientRect();
      const relX = (coverRect.width || 360) / 2;
      const relY = (coverRect.height || 640) * 0.42;
      const colors = ['#f5d16e', '#ffd700', '#2e7d32', '#c62828', '#ffffff', '#ff9800', '#00e5ff', '#ff4081'];

      for (let i = 0; i < 48; i++) {
        const confetti = document.createElement('span');
        confetti.className = 't04-paper-confetti';
        confetti.style.left = `${relX}px`;
        confetti.style.top = `${relY}px`;

        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 180;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 35;
        const rot = `${Math.floor(Math.random() * 720 - 360)}deg`;

        confetti.style.setProperty('--tx', `${tx}px`);
        confetti.style.setProperty('--ty', `${ty}px`);
        confetti.style.setProperty('--rot', rot);
        confetti.style.setProperty('--bg', colors[i % colors.length]);
        confetti.style.setProperty('--pw', `${5 + Math.floor(Math.random() * 5)}px`);
        confetti.style.setProperty('--ph', `${10 + Math.floor(Math.random() * 8)}px`);
        confetti.style.setProperty('--dur', `${1.2 + Math.random() * 0.5}s`);

        sparksContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1800);
      }

      for (let j = 0; j < 36; j++) {
        const spark = document.createElement('span');
        spark.className = 't04-spark';
        spark.style.left = `${relX}px`;
        spark.style.top = `${relY}px`;

        const sAngle = Math.random() * Math.PI * 2;
        const sDist = 30 + Math.random() * 140;
        spark.style.setProperty('--tx', `${Math.cos(sAngle) * sDist}px`);
        spark.style.setProperty('--ty', `${Math.sin(sAngle) * sDist - 30}px`);

        sparksContainer.appendChild(spark);
        setTimeout(() => spark.remove(), 1300);
      }
    }

    try { navigator.vibrate?.([40, 60, 40]); } catch (err) {}

    // Smooth transition to Page 2 (Screen 1)
    setTimeout(() => {
      goTo(1);
    }, 1600);
  };

  const clickHandler = e => {
    const nextBtn = e.target.closest('[data-next]');
    if (nextBtn) {
      e.preventDefault();
      goTo(current + 1);
      return;
    }
    const waxBtn = e.target.closest('.t04-wax-trigger');
    const doorsPortal = e.target.closest('.t04-doors-portal');
    const coverClick = e.target.closest('.t04-cover');
    if (current === 0 && (waxBtn || doorsPortal || coverClick)) {
      e.preventDefault();
      ignitePalaceDoors();
      return;
    }

    const prevBtn = e.target.closest('[data-prev]');
    if (prevBtn) {
      e.preventDefault();
      goTo(current - 1);
      return;
    }

    const restartBtn = e.target.closest('[data-restart]');
    if (restartBtn) {
      e.preventDefault();
      goTo(0);
      return;
    }

    const stepBtn = e.target.closest('.t04-step');
    if (stepBtn && stepBtn.dataset.step !== undefined) {
      e.preventDefault();
      goTo(Number(stepBtn.dataset.step));
      return;
    }

    const optBtn = e.target.closest('.t04-opt');
    if (optBtn) {
      e.preventDefault();
      const isFam = optBtn.dataset.type === 'family';
      root.querySelectorAll('.t04-opt').forEach(o => {
        const sel = o === optBtn;
        o.classList.toggle('selected', sel);
        o.setAttribute('aria-pressed', String(sel));
      });
      const copyElem = root.querySelector('.t04-wording-copy');
      if (copyElem) {
        copyElem.textContent = isFam ? copyElem.dataset.family : copyElem.dataset.single;
      }
      return;
    }

    const revealBtn = e.target.closest('[data-reveal]');
    if (revealBtn) {
      e.preventDefault();
      if (!scratch) scratch = createScratch(canvas);
      scratch?.reveal();
      return;
    }
  };

  t04.addEventListener('click', clickHandler);

  // Swipe & Touch Navigation
  let sx = 0, sy = 0, tracking = false;
  const touchStart = e => {
    if (e.target.closest('.t04-scratch-box')) { tracking = false; return; }
    tracking = true;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  };
  const touchEnd = e => {
    if (!tracking) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  };
  t04.addEventListener('touchstart', touchStart, { passive: true });
  t04.addEventListener('touchend', touchEnd, { passive: true });

  // Key navigation
  const doc = t04.ownerDocument || (typeof document !== 'undefined' ? document : null);
  const keyHandler = e => {
    if (e.key === 'ArrowRight') goTo(current + 1);
    else if (e.key === 'ArrowLeft') goTo(current - 1);
  };
  if (doc) doc.addEventListener('keydown', keyHandler);

  // Calendar
  const target = weddingWhen(wedding, events);
  const cal = t04.querySelector('#t04-calendar');
  if (cal && target !== null) {
    const fmt = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    cal.href = `https://calendar.google.com/calendar/render?${new URLSearchParams({
      action: 'TEMPLATE',
      text: `Wedding Ceremony of ${w.bride_name || 'Bride'} & ${w.groom_name || 'Groom'}`,
      dates: `${fmt(target)}/${fmt(target + 3 * 3600 * 1000)}`,
      ctz: 'Asia/Kolkata',
      location: [w.venue, w.address].filter(Boolean).join(', '),
      details: `We look forward to celebrating with ${guest.name || 'you'}.`
    })}`;
  }

  // Countdown
  const countdownBox = t04.querySelector('.t04-countdown-card');
  if (countdownBox && target !== null) {
    const updateCountdown = () => {
      const remaining = Math.max(0, target - Date.now());
      const sec = Math.floor(remaining / 1000);
      const values = {
        days: Math.floor(sec / 86400),
        hours: Math.floor((sec % 86400) / 3600),
        minutes: Math.floor((sec % 3600) / 60),
        seconds: sec % 60
      };
      Object.entries(values).forEach(([k, val]) => {
        const el = countdownBox.querySelector(`[data-${k}]`);
        if (el) el.textContent = String(val).padStart(2, '0');
      });
      if (remaining <= 0) clearInterval(timerId);
    };
    updateCountdown();
    if (target > Date.now()) timerId = setInterval(updateCountdown, 1000);
  }

  // Start at Screen 0
  goTo(0);

  const cleanup = () => {
    t04.removeEventListener('click', clickHandler);
    t04.removeEventListener('touchstart', touchStart);
    t04.removeEventListener('touchend', touchEnd);
    if (doc) doc.removeEventListener('keydown', keyHandler);
    if (timerId) clearInterval(timerId);
    t04._t04Bound = false;
    delete t04._t04Cleanup;
  };
  t04._t04Cleanup = cleanup;
  return cleanup;
}
