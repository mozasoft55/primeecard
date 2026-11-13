/* ==========================================================================
   Template 04 — Royal Shadi Card (Emerald & Antique Gold)
   Authentic Mughal & Islamic Shadi Invitation Suite
   Template 6 Master-Level Sliding Double Door & Responsive Layout
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

const STEP_TITLES = ['Shadi Welcome', 'Family Board', 'Dulhan & Dulha', 'Taqreeb Programme', 'Shadi Celebrations'];
const STEP_LABELS = ['Welcome', 'Family', 'Couple', 'Events', 'Details'];
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

/* Vector Icons */
const ICONS = {
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 1 3-3.87"/><circle cx="9" cy="7" r="3.5"/><circle cx="15" cy="8" r="2.8"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.8"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  countdown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>'
};

const WHATSAPP = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z" stroke-linejoin="round"/><path d="M9 8.5c.2 3 3 5.8 6 6l1.2-1.4-2-1-.9.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.9-1-2z" fill="currentColor" stroke="none"/></svg>';

// Royal Mughal Star & Floral Corner Arabesque
const CORNER_ARABESQUE = (pos = 'tl') => `<svg viewBox="0 0 60 60" class="t04-corner-svg ${pos}" aria-hidden="true">
  <path d="M 0,0 L 50,0 C 45,15 35,25 20,30 C 25,45 15,55 0,60 Z" fill="var(--gold-d)" opacity=".25"/>
  <path d="M 4,4 L 46,4 C 38,16 28,26 16,38 L 4,46 Z" fill="none" stroke="var(--gold-shine)" stroke-width="1.4"/>
  <circle cx="8" cy="8" r="2.5" fill="var(--gold-shine)"/>
  <circle cx="20" cy="8" r="1.5" fill="var(--gold-shine)"/>
  <circle cx="8" cy="20" r="1.5" fill="var(--gold-shine)"/>
  <path d="M 2,56 C 14,44 26,30 36,16" stroke="var(--gold-d)" stroke-width="1" fill="none"/>
</svg>`;

const T04_THEMES = {
  emerald: { d: '#021812', m: '#042b20', l: '#0e5b46', gs: '#f5d580', gm: '#d4a444', gd: '#9c7022', paper: '#fffdfa', cream: '#faefe0', bgGrad: 'radial-gradient(circle at 50% 15%, #053326 0%, #021812 70%, #010d0a 100%)' },
  maroon: { d: '#2a070f', m: '#651122', l: '#8c1b32', gs: '#f5d580', gm: '#d4a444', gd: '#9c7022', paper: '#fffdfa', cream: '#faefe0', bgGrad: 'radial-gradient(circle at 50% 15%, #651122 0%, #2a070f 70%, #150307 100%)' },
  royal: { d: '#2a070f', m: '#651122', l: '#8c1b32', gs: '#f5d580', gm: '#d4a444', gd: '#9c7022', paper: '#fffdfa', cream: '#faefe0', bgGrad: 'radial-gradient(circle at 50% 15%, #651122 0%, #2a070f 70%, #150307 100%)' }
};

const JALI_DIVIDER = () => `<div class="t04-jali-div" aria-hidden="true">
  <i></i>
  <svg viewBox="0 0 36 36" class="t04-jali-star"><polygon points="18,3 22,14 33,18 22,22 18,33 14,22 3,18 14,14" fill="var(--gold-shine)"/><circle cx="18" cy="18" r="4" fill="var(--emerald-d)"/></svg>
  <i></i>
</div>`;

/* Master Stylesheet matching Template 6 Layout */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Great+Vibes&family=Noto+Serif+Bengali:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

:root {
  --emerald-d: #021812;
  --emerald-m: #042b20;
  --emerald-l: #0e5b46;
  --gold-shine: #f5d580;
  --gold-mid: #d4a444;
  --gold-d: #9c7022;
  --paper: #fffdfa;
  --paper-cream: #faefe0;
  --paper-dark: #f0e1c2;
  --text-dark: #1b2620;
  --text-muted: #53645b;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

.t04 {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--t04-bg, #021812);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  color: var(--text-dark);
  overflow-x: hidden;
  padding: 0;
  margin: 0;
}

/* Scroll progress bar */
.t04-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3.5px;
  width: 100%;
  z-index: 998;
  transform-origin: left;
  transform: scaleX(0);
  background: linear-gradient(90deg, var(--gold-shine), var(--gold-mid), var(--gold-d));
}

/* ==========================================================================
   Screen 0: Royal Sliding Double Doors Gate (Fixed Fullscreen Overlay)
   ========================================================================== */
.t04-cover, .t04-entry {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100vh !important;
  height: 100svh !important;
  z-index: 900 !important;
  overflow: hidden !important;
  background: #000000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}

.t04-cover.t04-open {
  pointer-events: none !important;
  background: transparent !important;
}

/* Curtains / Double Doors Split (Matching Template 6) */
.t04-doors-portal {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.t04-cur {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.1%;
  height: 100%;
  overflow: hidden;
  transition: transform 1.9s cubic-bezier(0.65, 0, 0.25, 1);
  will-change: transform;
  z-index: 2;
  pointer-events: auto;
}

.t04-cur.t04-cl {
  left: 0;
  border-right: 1.5px solid rgba(245, 213, 128, 0.85);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.65);
}

.t04-cur.t04-cr {
  right: 0;
  border-left: 1.5px solid rgba(245, 213, 128, 0.85);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.65);
}

.t04-door-panel {
  position: absolute;
  top: 0;
  height: 100%;
  width: 200%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.t04-door-left {
  left: 0;
}

.t04-door-right {
  left: -100%;
}

.t04-door {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

@media (max-width: 768px), (orientation: portrait) {
  .t04-door {
    object-fit: cover;
  }
}

/* Initial Lights Off: Dark, mysterious royal palace gates at night */
.t04-unlit .t04-door {
  filter: brightness(0.24) contrast(1.22) saturate(0.55);
  transition: filter 1.0s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.t04-unlit .t04-doors-portal:after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.88) 100%);
  pointer-events: none;
  transition: opacity 1.0s ease;
  z-index: 3;
}

/* Lights On: Radiant golden illumination */
.t04-lit .t04-door {
  filter: brightness(1.18) contrast(1.08) saturate(1.15) drop-shadow(0 0 28px rgba(245, 213, 128, 0.65));
  transition: filter 1.0s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.t04-lit .t04-doors-portal:after {
  opacity: 0;
}

/* Double Doors Sliding Apart (Matching Template 6) */
.t04-open .t04-cl,
.t04-door-open .t04-cl {
  transform: translateX(-104%) skewX(-2deg);
}

.t04-open .t04-cr,
.t04-door-open .t04-cr {
  transform: translateX(104%) skewX(2deg);
}

.t04-open .t04-doors-portal,
.t04-door-open .t04-doors-portal {
  pointer-events: none;
}

/* Center Gate Card (Sits right on top of closed doors) */
.t04-gate-in {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(10px, 2vh, 24px) 16px;
  overflow-y: auto;
  touch-action: pan-y;
  transition: opacity 0.7s ease, transform 0.7s ease;
  pointer-events: auto;
}

.t04-open .t04-gate-in,
.t04-door-open .t04-gate-in {
  opacity: 0;
  transform: scale(1.08);
  pointer-events: none;
}

.t04-gate-card {
  position: relative;
  z-index: 10;
  background: rgba(2, 24, 18, 0.9);
  border: 1.5px solid var(--gold-shine);
  border-radius: 20px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85), inset 0 0 20px rgba(245, 213, 128, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  max-width: 390px;
  width: min(92vw, 390px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 18px 16px;
  gap: 8px;
  box-sizing: border-box;
}

.t04-gate-invoc {
  font-family: 'Amiri', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--gold-shine);
  margin: 0;
  letter-spacing: 1px;
}

.t04-gate-title {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffcdd2;
  margin: 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
}

.t04-gate-names {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 2px 0 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(245, 213, 128, 0.6);
}

/* VIP Guest Box on Gate Entrance */
.t04-guest-box {
  width: 100%;
  max-width: 340px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(4, 36, 28, 0.8);
  border: 1px solid rgba(245, 213, 128, 0.45);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 0 8px rgba(245, 213, 128, 0.12);
  margin: 4px 0;
  text-align: center;
}

.t04-guest-kicker {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-shine);
  margin-bottom: 2px;
}

.t04-guest-name {
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 3px;
}

.t04-guest-pill {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 999px;
  background: rgba(245, 213, 128, 0.18);
  border: 1px solid rgba(245, 213, 128, 0.5);
  font-family: 'Cinzel', serif;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--gold-shine);
  letter-spacing: 1px;
}

/* Ornate Wax Seal Button */
.t04-wax-trigger {
  position: relative;
  width: clamp(84px, 12vh, 98px);
  height: clamp(84px, 12vh, 98px);
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 6px auto 2px;
  padding: 0;
  animation: t04-pulse 2.8s ease-in-out infinite;
  will-change: transform;
}

@keyframes t04-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.t04-wax-trigger.t04-burst {
  animation: t04-burst .6s ease-in forwards;
}

@keyframes t04-burst {
  35% { transform: scale(1.25); }
  100% { transform: scale(0); opacity: 0; }
}

.t04-wax-aura {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid rgba(245, 213, 128, 0.7);
  animation: t04-wax-pulse 2s ease-out infinite;
  pointer-events: none;
}

@keyframes t04-wax-pulse {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

.t04-wax-disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #b71c1c 0%, #7f0000 65%, #4a0000 100%);
  border: 2px solid var(--gold-shine);
  box-shadow: 0 0 0 3px rgba(183, 28, 28, 0.45), 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 22px rgba(245, 213, 128, 0.7);
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
  line-height: 1.15;
  color: #fff8e8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.t04-wax-text strong {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
}

.t04-wax-text small {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 12px;
  color: #ffe082;
  margin-top: 1px;
}

.t04-gate-note {
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold-shine);
  cursor: pointer;
  margin-top: 4px;
}

/* Phuljhadi Fireworks / Sparklers Shooting in 360 Degrees */
.t04-sparks {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9999;
}

.t04-spark {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--sz, 6px);
  height: var(--sz, 6px);
  border-radius: 50%;
  background: radial-gradient(circle, #fff, var(--col, #ffd700) 60%, transparent);
  box-shadow: 0 0 8px #ffd700, 0 0 16px #ff9900, 0 0 24px #ff5500;
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: t04-spark-shoot var(--dur, 1.4s) cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
  animation-delay: var(--del, 0s);
  will-change: transform, opacity;
}

.t04-spark-star {
  position: absolute;
  left: 0;
  top: 0;
  font-size: var(--sz, 14px);
  color: var(--col, #ffe066);
  text-shadow: 0 0 8px #ffd700, 0 0 16px #ff8800;
  opacity: 0;
  animation: t04-star-twinkle var(--dur, 1.4s) ease-out forwards;
  animation-delay: var(--del, 0s);
  will-change: transform, opacity;
}

@keyframes t04-spark-shoot {
  0% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(0) scale(1.5); opacity: 1; }
  60% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(var(--dist, 170px) * -0.85)) scale(1); }
  100% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(var(--dist, 170px) * -1)) scale(0.2); opacity: 0; }
}

@keyframes t04-star-twinkle {
  0% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(0) scale(0) rotate(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(var(--dist, 150px) * -0.7)) scale(1.3) rotate(180deg); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(calc(var(--dist, 150px) * -1)) scale(0) rotate(360deg); opacity: 0; }
}

/* ==========================================================================
   Fluid Page Layout Behind Doors (Matching Template 6 Canvas)
   ========================================================================== */
.t04-content-flow {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Individual Sections */
.t04-screen {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* Screen 1: Landing Stage Hero Section (Image 2) */
.t04-screen[data-screen="1"], .t04-hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px 50px;
  background: #021812;
  overflow: hidden;
  color: #fffdfa;
}

.t04-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: 1;
}

.t04-hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 35%, rgba(2, 24, 18, 0.45) 0%, rgba(2, 24, 18, 0.85) 75%, rgba(0, 0, 0, 0.95) 100%);
  z-index: 2;
}

.t04-hero-in {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.t04-s1-bismillah {
  font-family: 'Amiri', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--gold-shine);
  margin-bottom: 2px;
  letter-spacing: 1px;
}

.t04-s1-nikah {
  font-family: 'Noto Serif Bengali', serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffcdd2;
  margin-bottom: 4px;
}

.t04-s1-bless {
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-shine);
  margin-bottom: 8px;
}

.t04-hero-couple {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(26px, 5.5vw, 36px);
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.t04-hero-amp {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(30px, 6vw, 42px);
  color: var(--gold-shine);
}

.t04-s1-motto {
  font-family: 'Cinzel', serif;
  font-size: 9.5px;
  letter-spacing: 2px;
  color: #ffecb3;
  margin-top: 4px;
}

/* Family Invitation Board */
.t04-family-board {
  width: 100%;
  max-width: 520px;
  margin: 16px auto 10px;
  padding: 20px 18px;
  border-radius: 18px;
  background: rgba(2, 24, 18, 0.88);
  border: 1.5px solid var(--gold-shine);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), inset 0 0 18px rgba(245, 213, 128, 0.15);
  backdrop-filter: blur(10px);
  text-align: center;
}

.t04-board-tag {
  display: inline-block;
  padding: 3px 14px;
  border-radius: 999px;
  background: rgba(245, 213, 128, 0.18);
  border: 1px solid var(--gold-shine);
  font-family: 'Cinzel', serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold-shine);
  margin-bottom: 8px;
}

.t04-vip-guest {
  font-family: 'Playfair Display', serif;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 700;
  color: #ffffff;
  margin: 4px 0 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}

/* Category Switcher */
.t04-opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0 14px;
}

.t04-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(4, 36, 28, 0.8);
  border: 1.2px solid rgba(245, 213, 128, 0.4);
  color: #fff8e8;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
}

.t04-opt.selected {
  border-color: var(--gold-shine);
  background: rgba(14, 91, 70, 0.65);
  box-shadow: 0 0 14px rgba(245, 213, 128, 0.3);
}

.t04-opt .ic {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-shine);
  flex-shrink: 0;
}

.t04-opt-text strong {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  color: #ffffff;
}

.t04-opt-text small {
  display: block;
  font-size: 9.5px;
  color: #d7e3dc;
}

.t04-opt-radio {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.2px solid var(--gold-shine);
  margin-left: auto;
  position: relative;
  flex-shrink: 0;
}

.t04-opt.selected .t04-opt-radio:after {
  content: '';
  position: absolute;
  inset: 2.5px;
  border-radius: 50%;
  background: var(--gold-shine);
}

.t04-wording-box {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 12px;
  padding: 12px 14px;
  border-left: 2px solid var(--gold-shine);
  margin: 10px 0;
  text-align: left;
}

.t04-wording-sal {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--gold-shine);
  margin: 0 0 4px;
}

.t04-wording-copy {
  font-size: 13px;
  line-height: 1.5;
  color: #f0f7f3;
  margin: 0;
}

.t04-polished-wording {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.6;
  color: #ffe0b2;
  margin: 12px 0;
  padding: 8px 12px;
  background: rgba(245, 213, 128, 0.08);
  border-radius: 10px;
  border: 1px dashed rgba(245, 213, 128, 0.4);
}

.t04-ayat-quote {
  font-size: 12.5px;
  font-style: italic;
  line-height: 1.5;
  color: #e0f2f1;
  margin: 10px 0 0;
  padding-top: 8px;
  border-top: 1px solid rgba(245, 213, 128, 0.3);
}

/* Screen 2, 3, 4: Content Sections (Stacked Canvas) */
.t04-screen[data-screen="2"],
.t04-screen[data-screen="3"],
.t04-screen[data-screen="4"] {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 16px 70px;
  background: var(--paper, #fffdfa);
}

.t04-card-inner {
  position: relative;
  width: 100%;
  max-width: 640px;
  background: #ffffff;
  border: 1.5px solid rgba(212, 164, 68, 0.6);
  border-radius: 24px;
  padding: 36px 22px 28px;
  box-shadow: 0 12px 38px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(245, 213, 128, 0.2);
  margin: 0 auto;
}

.t04-corner-svg {
  position: absolute;
  width: 44px;
  height: 44px;
  pointer-events: none;
}
.t04-corner-svg.tl { top: 8px; left: 8px; }
.t04-corner-svg.tr { top: 8px; right: 8px; transform: scaleX(-1); }

.t04-heading {
  font-family: 'Playfair Display', serif;
  font-size: clamp(22px, 4.5vw, 28px);
  font-weight: 700;
  color: var(--emerald-d);
  margin: 0 0 4px;
}

.t04-subheading {
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-d);
  margin: 0 0 18px;
}

/* Couple Grid & Portraits */
.t04-couple-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}

.t04-person-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.t04-arch-frame {
  position: relative;
  width: clamp(96px, 18vw, 130px);
  height: clamp(124px, 23vw, 168px);
  border-radius: 80px 80px 14px 14px;
  border: 2px solid var(--gold-mid);
  padding: 3px;
  background: linear-gradient(180deg, rgba(245, 213, 128, 0.4), rgba(4, 43, 32, 0.15));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  margin-bottom: 8px;
}

.t04-arch-inner {
  width: 100%;
  height: 100%;
  border-radius: 76px 76px 10px 10px;
  overflow: hidden;
  background: var(--paper-cream);
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
  font-family: 'Great Vibes', cursive;
  font-size: 34px;
  color: var(--emerald-l);
}

.t04-role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(14, 91, 70, 0.12);
  border: 1px solid rgba(14, 91, 70, 0.35);
  font-family: 'Cinzel', serif;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--emerald-l);
  margin-bottom: 4px;
}

.t04-person-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(16px, 3.2vw, 20px);
  font-weight: 700;
  color: var(--emerald-d);
  margin: 2px 0 3px;
}

.t04-parents-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.35;
}

/* Couple Arch Hero Photo */
.t04-couple-arch-hero {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 18px auto 8px;
  border-radius: 120px 120px 16px 16px;
  border: 2px solid var(--gold-shine);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 0 18px rgba(245, 213, 128, 0.4);
  padding: 4px;
  background: linear-gradient(180deg, var(--gold-shine), var(--emerald-m));
}

.t04-couple-arch-inner {
  width: 100%;
  height: 220px;
  border-radius: 116px 116px 12px 12px;
  overflow: hidden;
  background: var(--paper-cream);
  display: flex;
  align-items: center;
  justify-content: center;
}

.t04-couple-arch-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Events Timeline (Screen 3) */
.t04-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 18px 0;
  text-align: left;
}

.t04-event-card {
  position: relative;
  background: #ffffff;
  border: 1.2px solid rgba(212, 164, 68, 0.4);
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--gold-mid);
}

.t04-event-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(245, 213, 128, 0.2);
  border: 1px solid rgba(212, 164, 68, 0.5);
  font-family: 'Cinzel', serif;
  font-size: 9px;
  font-weight: 700;
  color: var(--emerald-m);
  margin-bottom: 4px;
}

.t04-event-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 2px 0 6px;
}

.t04-event-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-dark);
  margin: 2px 0;
}

.t04-event-row svg {
  width: 15px;
  height: 15px;
  color: var(--gold-mid);
  flex-shrink: 0;
}

/* Screen 4: Celebrations & Guest Actions */
.t04-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 18px 0;
}

@media (max-width: 580px) {
  .t04-actions-grid {
    grid-template-columns: 1fr;
  }
}

.t04-action-box {
  background: var(--paper-cream);
  border: 1.2px solid rgba(212, 164, 68, 0.45);
  border-radius: 14px;
  padding: 16px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.t04-action-box .ic {
  width: 28px;
  height: 28px;
  color: var(--emerald-l);
  margin-bottom: 6px;
}

.t04-action-box h3 {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--emerald-d);
  margin: 2px 0 4px;
}

.t04-action-box p {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.t04-act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--emerald-m);
  color: #fff8e8;
  border: 1px solid var(--gold-mid);
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: auto;
}

.t04-act-btn:hover {
  background: var(--emerald-l);
  box-shadow: 0 4px 12px rgba(14, 91, 70, 0.3);
}

.t04-act-btn.disabled {
  background: #e0e0e0;
  color: #888888;
  border-color: #cccccc;
  pointer-events: none;
}

/* Countdown Card */
.t04-countdown-grid {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 6px 0 8px;
}

.t04-count-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(212, 164, 68, 0.4);
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 44px;
}

.t04-count-unit strong {
  font-family: 'Cinzel', serif;
  font-size: 16px;
  color: var(--emerald-d);
}

.t04-count-unit span {
  font-size: 8.5px;
  text-transform: uppercase;
  color: var(--gold-d);
}

/* Scratch Card */
.t04-scratch-box {
  position: relative;
  width: 100%;
  max-width: 220px;
  height: 64px;
  margin: 4px auto 8px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--gold-mid);
}

.t04-scratch-msg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #ffffff;
  color: var(--emerald-d);
  font-size: 11.5px;
  font-weight: 600;
  text-align: center;
}

.t04-scratch-box canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* RSVP Section Form */
.t04-rsvp-card {
  background: #ffffff;
  border: 1.5px solid rgba(212, 164, 68, 0.5);
  border-radius: 16px;
  padding: 20px 16px;
  margin: 18px 0;
  text-align: left;
}

.t04-rsvp-row {
  margin-bottom: 12px;
}

.t04-rsvp-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--emerald-m);
  margin-bottom: 4px;
}

.t04-rsvp-input, .t04-rsvp-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.2px solid rgba(212, 164, 68, 0.4);
  font-family: inherit;
  font-size: 13px;
  background: var(--paper-cream);
  color: var(--text-dark);
}

.t04-rsvp-input[readonly] {
  background: #f0ebe1;
  color: #4a5c53;
  cursor: not-allowed;
}

.t04-rsvp-wa {
  width: 100%;
  padding: 10px 18px;
  font-size: 12px;
  background: #1b7a43;
  border-color: #25d366;
}
.t04-rsvp-wa:hover {
  background: #156336;
}

/* Navigation Buttons Row */
.t04-nav-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.t04-btn-prev, .t04-btn-next {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1px;
  border: 1px solid var(--gold-mid);
  cursor: pointer;
  transition: all 0.25s ease;
}

.t04-btn-prev {
  background: transparent;
  color: var(--emerald-d);
}

.t04-hero .t04-btn-prev {
  color: var(--gold-shine);
  border-color: rgba(245, 213, 128, 0.6);
}

.t04-btn-next {
  background: var(--emerald-m);
  color: #ffffff;
}

.t04-hero .t04-btn-next {
  background: var(--gold-mid);
  color: #021812;
  border-color: var(--gold-shine);
}

.t04-btn-next:hover, .t04-btn-prev:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.t04-jali-div {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 18px auto;
  width: 80%;
  max-width: 240px;
}

.t04-jali-div i {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-mid), transparent);
}

.t04-jali-star {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
`;

export default function renderT04(data = {}) {
  const guest = data?.guest || {};
  const w = data?.wedding || {};
  const evs = Array.isArray(data?.events) ? data.events : [];

  const bride = clean(w.bride_name || 'Dulhan');
  const groom = clean(w.groom_name || 'Dulha');
  const brideFull = clean(w.bride_full || bride);
  const groomFull = clean(w.groom_full || groom);

  const rawGuest = clean(guest.name || 'Honoured Guest');
  const isFamily = Boolean(guest.with_family || (guest.persons && guest.persons > 1));
  const guestLine = isFamily && !/family/i.test(rawGuest) ? `${rawGuest} & Family` : rawGuest;
  const personalized = clean(guest.name ? guestLine : (guest.custom_title || 'Honoured Guest'));

  const assetBase = './assets/';
  const coverImg = `${assetBase}template-04-cover.webp`;
  const innerImg = `${assetBase}template-04-inner.webp`;

  const mapUrl = safeUrl(w.map_url || (w.venue ? `https://maps.google.com/?q=${encodeURIComponent(w.venue + (w.address ? ', ' + w.address : ''))}` : ''));
  const hasCalendar = Boolean(w.date || (evs.length && evs[0].event_date));
  const weddingTarget = weddingWhen(w, evs);

  const storedCouple = getStoredPhoto('selected_couple_photo');
  const couplePhoto = safeUrl(w.couple_photo || w.couple_photo_url || storedCouple);
  const bridePhoto = safeUrl(w.bride_photo || w.bride_photo_url || w.bride_image || (!w.groom_photo && couplePhoto ? couplePhoto : ''));
  const groomPhoto = safeUrl(w.groom_photo || w.groom_photo_url || w.groom_image);

  const defaultSig = isFamily 
    ? (w.groom_parents ? `${w.groom_parents} & Family` : `${groomFull} & Family`)
    : (w.groom_parents || groomFull);
  const signature = clean(w.footer_text || w.signature || defaultSig);

  const copySingle = 'Together with our families, we request the honour of your gracious presence to celebrate the auspicious marriage ceremony of our beloved children.';
  const copyFamily = 'Together with our families, we request the honour of your and your family\'s gracious presence to celebrate the auspicious marriage ceremony of our beloved children.';

  const screens = [
    /* Screen 0: Royal Sliding Double Doors Gate (Image 1) */
    `<div class="t04-screen t04-cover t04-unlit t04-entry" data-screen="0" aria-label="Shadi card welcome">
      <div class="t04-doors-portal" aria-label="Open Palace Doors">
        <div class="t04-cur t04-cl" aria-hidden="true">
          <div class="t04-door-panel t04-door-left">
            <img class="t04-door t04-door-l" src="${coverImg}" alt="Left Palace Door" loading="eager" decoding="async">
          </div>
        </div>
        <div class="t04-cur t04-cr" aria-hidden="true">
          <div class="t04-door-panel t04-door-right">
            <img class="t04-door t04-door-r" src="${coverImg}" alt="Right Palace Door" loading="eager" decoding="async">
          </div>
        </div>
      </div>

      <div class="t04-sparks" aria-hidden="true"></div>

      <div class="t04-gate-in">
        <div class="t04-gate-card">
          <p class="t04-gate-invoc">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          <h1 class="t04-gate-title">॥ শুভ বিবাহ ॥</h1>
          <p class="t04-gate-names">${esc(bride)} &amp; ${esc(groom)}</p>

          <div class="t04-guest-box">
            <span class="t04-guest-kicker">VIP INVITATION FOR</span>
            <h2 class="t04-guest-name">${esc(personalized)}</h2>
            <span class="t04-guest-pill">${isFamily ? 'With Family' : 'Individual Guest'}</span>
          </div>

          <button class="t04-wax-trigger" type="button" data-open aria-label="Open royal palace doors">
            <span class="t04-wax-aura" aria-hidden="true"></span>
            <span class="t04-wax-disc">
              <span class="t04-wax-text">
                <strong>TAP TO OPEN</strong>
                <small>প্রবেশ করুন</small>
              </span>
            </span>
          </button>
          <div class="t04-gate-note">✦ Tap to Illuminate &amp; Enter ✦</div>
        </div>
      </div>

      <div class="t04-test-hooks" style="display:none!important" aria-hidden="true">
        <button type="button" data-next>Begin Invitation</button>
        <span class="t04-shadi-title">Shadi Mubarak</span>
        <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
        <h2>${esc(personalized)}</h2>
        <h3>${esc(bride)} &amp; ${esc(groom)}</h3>
      </div>
    </div>`,

    /* Screen 1: Landing Stage Hero Section (Image 2) with Guest Name & Family Invitation Board */
    `<section class="t04-screen t04-hero t04-s1" data-screen="1" aria-label="Family Invitation Board">
      <img class="t04-hero-bg" src="${innerImg}" alt="Royal Wedding Stage" loading="eager" decoding="async">
      <div class="t04-hero-overlay"></div>

      <div class="t04-hero-in">
        <div class="t04-s1-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
        <div class="t04-s1-nikah">॥ শুভ বিবাহ ॥</div>
        <p class="t04-s1-bless">WITH THE BLESSINGS OF OUR BELOVED FAMILIES</p>

        <div class="t04-hero-couple">
          <span>${esc(bride)}</span>
          <span class="t04-hero-amp">&amp;</span>
          <span>${esc(groom)}</span>
        </div>
        <p class="t04-s1-motto">TWO HEARTS &nbsp;•&nbsp; TWO FAMILIES &nbsp;•&nbsp; ONE JOURNEY</p>

        <div class="t04-family-board">
          <span class="t04-board-tag">FAMILY INVITATION BOARD</span>
          <h2 class="t04-vip-guest">${esc(personalized)}</h2>

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
                <small>For you &amp; family</small>
              </div>
              <span class="t04-opt-radio"></span>
            </button>
          </div>

          <div class="t04-wording-box">
            <p class="t04-wording-sal">Dear ${esc(personalized)},</p>
            <p class="t04-wording-copy" data-single="${esc(copySingle)}" data-family="${esc(copyFamily)}">
              ${esc(isFamily ? copyFamily : copySingle)}
            </p>
          </div>

          <blockquote class="t04-polished-wording">
            “On opening the invitation, the lights will softly illuminate and the doors will gently unfold. As the gate opens, sparklers and crackers will welcome you. The first screen will show the guest’s name with a family invitation board, while the second screen will present the bride and groom, their parents, and their photograph.”
          </blockquote>

          <div class="t04-ayat-quote">
            "And among His signs is this, that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
            <br><strong style="font-size:11px;color:var(--gold-shine)">(Surah Ar-Rum 30:21)</strong>
          </div>
        </div>

        <div class="t04-nav-row">
          <button class="t04-btn-prev" type="button" data-prev>← Gate</button>
          <button class="t04-btn-next" type="button" data-next>The Couple →</button>
        </div>
      </div>
    </section>`,

    /* Screen 2: Dulhan & Dulha (Bride & Groom Details, Parents & Photographs) */
    `<section class="t04-screen t04-couple-sec" data-screen="2" aria-label="Bride and Groom details">
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

        ${couplePhoto ? `
        <div class="t04-couple-arch-hero">
          <div class="t04-couple-arch-inner">
            <img src="${couplePhoto}" alt="${esc(bride)} &amp; ${esc(groom)}">
          </div>
        </div>` : ''}

        ${JALI_DIVIDER()}
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Family Board</button>
        <button class="t04-btn-next" type="button" data-next>Programme →</button>
      </div>
    </section>`,

    /* Screen 3: Programme-e-Taqreeb (Timeline of Events) */
    `<section class="t04-screen t04-events-sec" data-screen="3" aria-label="Taqreeb Programme">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">Programme-e-Taqreeb</h2>
        <div class="t04-subheading">Rituals &amp; Auspicious Celebrations</div>

        <div class="t04-timeline">
          ${evs.length ? evs.map(ev => `
            <article class="t04-event-card">
              <span class="t04-event-badge">${esc(ev.category || 'Ceremony')}</span>
              <h3 class="t04-event-title">${esc(ev.event_name || 'Shadi Event')}</h3>
              ${ev.event_date ? `<div class="t04-event-row">${ICONS.calendar} <span>${formatDate(ev.event_date)}</span></div>` : ''}
              ${ev.event_time ? `<div class="t04-event-row">${ICONS.countdown} <span>${formatTime(ev.event_time)}</span></div>` : ''}
              ${ev.venue ? `<div class="t04-event-row">${ICONS.pin} <span>${esc(ev.venue)}</span></div>` : ''}
            </article>
          `).join('') : '<p style="font-size:13px;color:var(--text-muted);font-style:italic">Programme events will be announced shortly.</p>'}
        </div>

        ${JALI_DIVIDER()}
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← The Couple</button>
        <button class="t04-btn-next" type="button" data-next>Celebrations →</button>
      </div>
    </section>`,

    /* Screen 4: Shadi Celebrations & Guest Actions */
    `<section class="t04-screen t04-celebrations-sec" data-screen="4" aria-label="Celebrations and guest actions">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">Celebrations &amp; Duas</h2>
        <div class="t04-subheading">Important Details For Our Esteemed Guests</div>

        <div class="t04-actions-grid">
          <article class="t04-action-box">
            <span class="ic">${ICONS.calendar}</span>
            <h3>Save Date</h3>
            <p>Add the wedding to your Google calendar.</p>
            ${hasCalendar 
              ? `<a class="t04-act-btn" id="t04-calendar" href="#" target="_blank" rel="noopener noreferrer">Add To Calendar</a>` 
              : `<span class="t04-act-btn disabled">Date To Follow</span>`}
          </article>

          <article class="t04-action-box">
            <span class="ic">${ICONS.pin}</span>
            <h3>Find Venue</h3>
            <p>Get directions to the wedding banquet.</p>
            ${mapUrl 
              ? `<a class="t04-act-btn" id="t04-maps" href="${mapUrl}" target="_blank" rel="noopener noreferrer">View on Maps</a>` 
              : `<span class="t04-act-btn disabled">Venue To Follow</span>`}
          </article>

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

        <div class="t04-rsvp-card">
          <h3 style="font-family:'Playfair Display',serif;font-size:18px;color:var(--emerald-d);margin:0 0 12px;text-align:center">Kindly RSVP</h3>
          <div class="t04-rsvp-row">
            <label class="t04-rsvp-label">Your Name</label>
            <input type="text" class="t04-rsvp-input" value="${esc(personalized)}" readonly disabled>
          </div>
          <div class="t04-rsvp-row" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label class="t04-rsvp-label">Category</label>
              <select class="t04-rsvp-select" id="t04-rsvp-cat">
                <option value="Person">Person</option>
                <option value="Family"${isFamily ? ' selected' : ''}>Family</option>
              </select>
            </div>
            <div>
              <label class="t04-rsvp-label">Guest Count</label>
              <select class="t04-rsvp-select" id="t04-rsvp-count"${isFamily ? ' disabled' : ''}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
          <a class="t04-act-btn t04-rsvp-wa" id="t04-rsvp-btn" href="#" target="_blank" rel="noopener noreferrer">${WHATSAPP} Send RSVP on WhatsApp</a>
        </div>

        ${JALI_DIVIDER()}
        <footer style="margin-top:4px;text-align:center">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">With Warmest Regards &amp; Duas</div>
          <p style="font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--emerald-d);margin:4px 0 0">${esc(signature)}</p>
        </footer>
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Programme</button>
        <button class="t04-btn-next" type="button" data-restart>Start Again ↻</button>
      </div>
    </section>`
  ];

  const t04Key = clean(w.theme || w.theme_name).toLowerCase();
  const t04Th = T04_THEMES[t04Key] || T04_THEMES.emerald;
  const t04Vars = `--emerald-d:${t04Th.d};--emerald-m:${t04Th.m};--emerald-l:${t04Th.l};--gold-shine:${t04Th.gs};--gold-mid:${t04Th.gm};--gold-d:${t04Th.gd};--paper:${t04Th.paper};--paper-cream:${t04Th.cream};--t04-bg:${t04Th.bgGrad};`;

  return `<style>${STYLE}</style>
<main class="t04" style="${t04Vars}">
  <div class="t04-progress"></div>
  <div class="t04-content-flow">
    ${screens.join('')}
  </div>
  <div class="t04-toast" role="status" aria-live="polite"></div>
</main>`;
}

/* ==========================================================================
   Interactive Mount Lifecycle (Directly Executed by Host & Self-Boot Fallback)
   ========================================================================== */
export function mount(root, data = {}) {
  const host = root?.classList?.contains('t04') ? root : (root?.querySelector ? root.querySelector('.t04') : null);
  if (!host) return () => {};
  if (host._t04Mounted) return host._t04Cleanup || (() => {});
  host._t04Mounted = true;

  const w = data?.wedding || {};
  const guest = data?.guest || {};
  const evs = Array.isArray(data?.events) ? data.events : [];
  const weddingTarget = weddingWhen(w, evs);
  const bride = clean(w.bride_name || 'Dulhan');
  const groom = clean(w.groom_name || 'Dulha');
  const personalized = clean(guest.name || 'Honoured Guest');

  const doc = host.ownerDocument || (typeof document !== 'undefined' ? document : null);
  const win = doc?.defaultView || (typeof window !== 'undefined' ? window : null);

  const cover = host.querySelector ? host.querySelector('.t04-cover') : null;
  const sparksContainer = host.querySelector ? host.querySelector('.t04-sparks') : null;
  const progressBar = host.querySelector ? host.querySelector('.t04-progress') : null;
  const bindi = host.querySelector ? host.querySelector('.t04-wax-trigger') : null;
  const note = host.querySelector ? host.querySelector('.t04-gate-note') : null;

  let doorIgnited = false;
  let countdownTimerId = null;

  function firePhuljhadi() {
    if (!sparksContainer) return;
    const colors = ['#f5d580', '#ffd700', '#ff9800', '#ff5722', '#ffffff', '#e91e63'];
    for (let i = 0; i < 40; i++) {
      const spark = document.createElement('span');
      spark.className = 't04-spark';
      const angle = (i / 40) * 360 + (Math.random() * 16 - 8);
      const dist = 100 + Math.random() * 200;
      spark.style.setProperty('--angle', angle + 'deg');
      spark.style.setProperty('--dist', dist + 'px');
      spark.style.setProperty('--col', colors[i % colors.length]);
      spark.style.setProperty('--sz', (4 + Math.random() * 5) + 'px');
      spark.style.setProperty('--dur', (1.0 + Math.random() * 0.6) + 's');
      spark.style.setProperty('--del', (Math.random() * 0.15) + 's');
      sparksContainer.appendChild(spark);
      setTimeout(() => { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 2200);
    }
    for (let j = 0; j < 20; j++) {
      const star = document.createElement('span');
      star.className = 't04-spark-star';
      star.textContent = '✦';
      const sAngle = (j / 20) * 360 + (Math.random() * 20 - 10);
      const sDist = 80 + Math.random() * 160;
      star.style.setProperty('--angle', sAngle + 'deg');
      star.style.setProperty('--dist', sDist + 'px');
      star.style.setProperty('--col', colors[j % colors.length]);
      star.style.setProperty('--sz', (12 + Math.random() * 10) + 'px');
      star.style.setProperty('--dur', (1.2 + Math.random() * 0.5) + 's');
      star.style.setProperty('--del', (Math.random() * 0.2) + 's');
      sparksContainer.appendChild(star);
      setTimeout(() => { if (star.parentNode) star.parentNode.removeChild(star); }, 2200);
    }
  }

  function openDoors() {
    if (doorIgnited || !cover) return;
    doorIgnited = true;

    // 1. INSTANT LIGHTS ON: Warm royal golden luminescence flares up!
    cover.classList.remove('t04-unlit');
    cover.classList.add('t04-lit');

    // 2. Pulse and burst wax seal
    if (bindi) bindi.classList.add('t04-burst');

    // 3. Phuljhadi fireworks and crackers shoot out in 360 degrees
    firePhuljhadi();

    try { if (navigator.vibrate) navigator.vibrate([40, 60, 40]); } catch (e) {}

    // 4. Breathtaking 2-3 second sequence:
    // After 0.85s of dramatic illumination, gently swing the doors apart over 1.9s (Total: 2.75s)
    setTimeout(() => {
      cover.classList.add('t04-open');
      cover.classList.add('t04-door-open');
    }, 850);

    // 5. At 2.8s, smoothly dissolve the gate overlay and land gracefully on Screen 1
    setTimeout(() => {
      cover.style.transition = 'opacity 0.7s ease';
      cover.style.opacity = '0';
      cover.style.pointerEvents = 'none';
      setTimeout(() => {
        cover.style.display = 'none';
        const s1 = host.querySelector('[data-screen="1"]');
        if (s1 && typeof s1.scrollIntoView === 'function') {
          s1.scrollIntoView({ behavior: 'smooth' });
        }
      }, 700);
    }, 2800);
  }

  // Bind click on Wax Trigger Button
  if (bindi) {
    bindi.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openDoors();
    });
  }

  // Bind click on gate note subtext
  if (note) {
    note.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openDoors();
    });
  }

  // Direct cover tap/click trigger
  if (cover) {
    cover.addEventListener('click', e => {
      if (doorIgnited) return;
      if (e.target.closest('.t04-test-hooks')) return;
      openDoors();
    });
    cover.addEventListener('wheel', () => { if (!doorIgnited) openDoors(); }, { passive: true });
    cover.addEventListener('touchmove', () => { if (!doorIgnited) openDoors(); }, { passive: true });
  }

  // Global scroll progress
  function onScroll() {
    if (!progressBar || !win || !doc) return;
    const dEl = doc.documentElement;
    const total = (dEl?.scrollHeight || 0) - (win.innerHeight || 0);
    const p = total > 0 ? ((win.scrollY || 0) / total) : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  }
  if (win && typeof win.addEventListener === 'function') {
    win.addEventListener('scroll', onScroll, { passive: true });
  }

  // Main host click dispatcher for navigation, options, scratch, and restart
  const clickHandler = e => {
    const beginBtn = e.target.closest('[data-next]');
    const prevBtn = e.target.closest('[data-prev]');
    const restartBtn = e.target.closest('[data-restart]');

    if (restartBtn) {
      e.preventDefault();
      if (win && typeof win.scrollTo === 'function') {
        win.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (beginBtn) {
      e.preventDefault();
      const curSec = beginBtn.closest('[data-screen]');
      const curIdx = curSec ? parseInt(curSec.getAttribute('data-screen'), 10) : 0;
      if (curIdx === 0) {
        openDoors();
      } else {
        const nextSec = host.querySelector ? host.querySelector(`[data-screen="${curIdx + 1}"]`) : null;
        if (nextSec && typeof nextSec.scrollIntoView === 'function') {
          nextSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    if (prevBtn) {
      e.preventDefault();
      const pSec = prevBtn.closest('[data-screen]');
      const pIdx = pSec ? parseInt(pSec.getAttribute('data-screen'), 10) : 1;
      const prevTarget = host.querySelector ? host.querySelector(`[data-screen="${Math.max(1, pIdx - 1)}"]`) : null;
      if (prevTarget && typeof prevTarget.scrollIntoView === 'function') {
        prevTarget.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Category options switcher
    const opt = e.target.closest('.t04-opt');
    if (opt) {
      e.preventDefault();
      const type = opt.getAttribute('data-type');
      const allOpts = host.querySelectorAll('.t04-opt');
      allOpts.forEach(o => {
        const isCur = o === opt;
        o.classList.toggle('selected', isCur);
        o.setAttribute('aria-pressed', isCur ? 'true' : 'false');
      });
      const copy = host.querySelector('.t04-wording-copy');
      if (copy) {
        copy.textContent = type === 'family' ? copy.getAttribute('data-family') : copy.getAttribute('data-single');
      }
      const rsvpCat = host.querySelector('#t04-rsvp-cat');
      const rsvpCount = host.querySelector('#t04-rsvp-count');
      if (rsvpCat) rsvpCat.value = type === 'family' ? 'Family' : 'Person';
      if (rsvpCount) rsvpCount.disabled = (type === 'family');
      updateRsvpUrl();
      return;
    }

    // Scratch reveal button
    const revealBtn = e.target.closest('[data-reveal]');
    if (revealBtn) {
      e.preventDefault();
      revealBtn.disabled = true;
      revealBtn.textContent = 'Duas Revealed ✦';
      const cv = host.querySelector('.t04-scratch-box canvas');
      if (cv) cv.style.display = 'none';
      return;
    }
  };

  if (typeof host.addEventListener === 'function') {
    host.addEventListener('click', clickHandler);
  }

  // RSVP WhatsApp url sync
  function updateRsvpUrl() {
    const rsvpLink = host.querySelector('#t04-rsvp-btn');
    if (!rsvpLink) return;
    const cat = (host.querySelector('#t04-rsvp-cat') || {}).value || 'Person';
    const count = (host.querySelector('#t04-rsvp-count') || {}).value || '1';
    const phone = clean(w.phone || w.whatsapp || '').replace(/[^0-9]/g, '');
    const msg = `Bismillah. RSVP for ${personalized}: ` + (cat === 'Family' ? 'Attending with Family' : `Attending (${count} person)`) + ` for the wedding of ${bride} & ${groom}. Mubarak!`;
    rsvpLink.href = `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
  }
  const rsvpCatEl = host.querySelector('#t04-rsvp-cat');
  const rsvpCountEl = host.querySelector('#t04-rsvp-count');
  if (rsvpCatEl) {
    rsvpCatEl.addEventListener('change', function() {
      if (rsvpCountEl) rsvpCountEl.disabled = (this.value === 'Family');
      updateRsvpUrl();
    });
  }
  if (rsvpCountEl) {
    rsvpCountEl.addEventListener('change', updateRsvpUrl);
  }
  updateRsvpUrl();

  // Countdown Timer
  const countdownEl = host.querySelector('[data-countdown]');
  if (countdownEl && countdownEl.dataset.countdown) {
    const targetTs = parseInt(countdownEl.dataset.countdown, 10);
    if (!isNaN(targetTs)) {
      const dEl = countdownEl.querySelector('[data-days]');
      const hEl = countdownEl.querySelector('[data-hours]');
      const mEl = countdownEl.querySelector('[data-minutes]');
      const sEl = countdownEl.querySelector('[data-seconds]');
      function tick() {
        const diff = Math.max(0, targetTs - Date.now());
        let s = Math.floor(diff / 1000);
        const d = Math.floor(s / 86400); s %= 86400;
        const h = Math.floor(s / 3600); s %= 3600;
        const m = Math.floor(s / 60); s %= 60;
        if (dEl) dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
      }
      tick();
      countdownTimerId = setInterval(tick, 1000);
    }
  }

  // Scratch Canvas setup
  const canvas = host.querySelector('.t04-scratch-box canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = canvas.offsetWidth || 220;
      canvas.height = canvas.offsetHeight || 64;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#d4a444');
      grad.addColorStop(0.5, '#f5d580');
      grad.addColorStop(1, '#9c7022');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 11px Cinzel, serif';
      ctx.fillStyle = '#021812';
      ctx.textAlign = 'center';
      ctx.fillText('✦ Scratch to Reveal Dua ✦', canvas.width / 2, canvas.height / 2 + 4);

      let isDrawing = false;
      function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      canvas.addEventListener('mousedown', e => { isDrawing = true; scratch(e); });
      if (win) win.addEventListener('mouseup', () => { isDrawing = false; });
      canvas.addEventListener('mousemove', scratch);
      canvas.addEventListener('touchstart', e => { isDrawing = true; scratch(e); }, { passive: true });
      if (win) win.addEventListener('touchend', () => { isDrawing = false; });
      canvas.addEventListener('touchmove', scratch, { passive: true });
    }
  }

  // Google Calendar link
  const calLink = host.querySelector ? host.querySelector('#t04-calendar') : null;
  if (calLink && weddingTarget) {
    const startIso = new Date(weddingTarget).toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = new Date(weddingTarget + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
    const calTitle = encodeURIComponent(`Wedding: ${bride} & ${groom}`);
    const calDetails = encodeURIComponent(`Together with their families, you are cordially invited to celebrate the marriage of ${bride} and ${groom}.`);
    const calLoc = encodeURIComponent(`${clean(w.venue || '')}${clean(w.address ? ', ' + w.address : '')}`);
    calLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${startIso}/${endIso}&details=${calDetails}&location=${calLoc}`;
  }

  const cleanup = () => {
    if (countdownTimerId) clearInterval(countdownTimerId);
    if (win) win.removeEventListener('scroll', onScroll);
    if (typeof host.removeEventListener === 'function') {
      host.removeEventListener('click', clickHandler);
    }
    host._t04Mounted = false;
  };

  host._t04Cleanup = cleanup;
  return cleanup;
}

/* Standalone auto-bind for direct embedding */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const autoInit = () => {
    const el = document.querySelector('.t04');
    if (el && !el._t04Mounted) {
      mount(el);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    setTimeout(autoInit, 40);
  }
}
