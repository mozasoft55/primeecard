/* ==========================================================================
   Template 04 — Royal Shadi Card (Emerald & Antique Gold)
   Authentic Mughal & Islamic Shadi Invitation Suite
   Pure Vector SVG Design • Ultra Lightweight (~32 KB vs 1.17 MB)
   Self-Booting + Programmatic Mount • Zero Image Bloat • 100% Reliable
   ========================================================================== */

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ESC_MAP[ch]);
const clean = v => String(v ?? '').trim();
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
  const g = guest || {};
  const evs = Array.isArray(events) ? events : [];
  const bride = clean(w.bride_name) || 'Bride';
  const groom = clean(w.groom_name) || 'Groom';
  const brideFull = clean(w.bride_full) || bride;
  const groomFull = clean(w.groom_full) || groom;
  const guestName = clean(g.name) || 'Respected Guest';
  const isFamily = Boolean(g.with_family);
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
  const bridePhoto = safeUrl(w.bride_photo || w.bride_photo_url || w.bride_image);
  const groomPhoto = safeUrl(w.groom_photo || w.groom_photo_url || w.groom_image);

  const screens = [
    /* ----------------------------------------------------
       Screen 1: Dawat-e-Khas (Formal Shadi Card Welcome)
       ---------------------------------------------------- */
    `<section class="t04-screen t04-cover active" data-screen="0" aria-label="Shadi card welcome">
      <div class="t04-cover-frame">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}
        ${CORNER_ARABESQUE('bl')}
        ${CORNER_ARABESQUE('br')}

        ${BISMILLAH_SVG}
        <div class="t04-subhanallah">${esc(invocation)}</div>
        <p class="t04-blessing-text">With the blessings of Almighty Allah<br>and our respected elders</p>
        
        <div class="t04-dear-tag">Cordial Invitation To</div>
        <div class="t04-guest-badge">
          <h2 class="t04-guest-name">${esc(personalized)}</h2>
        </div>

        ${JALI_DIVIDER()}

        <h1 class="t04-shadi-title">Shadi Mubarak</h1>
        <div class="t04-couple-hero">${esc(bride)} <span>&amp;</span> ${esc(groom)}</div>
        <div class="t04-ceremony-name">${esc(ceremonyTitle)}</div>

        <button class="t04-begin-btn" type="button" data-next>Begin Invitation &nbsp;→</button>
      </div>
    </section>`,

    /* ----------------------------------------------------
       Screen 2: Dawat-Nama & Selection
       ---------------------------------------------------- */
    `<section class="t04-screen" data-screen="1" aria-label="Invitation message">
      <div class="t04-card-inner">
        ${CORNER_ARABESQUE('tl')}
        ${CORNER_ARABESQUE('tr')}

        <h2 class="t04-heading">You Are Cordially Invited</h2>
        <div class="t04-subheading">A sacred union of love, faith and togetherness</div>

        <div class="t04-ayat-quote">
          "And among His signs is this, that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
          <br><strong style="font-size:11px;color:var(--gold-d)">(Surah Ar-Rum 30:21)</strong>
        </div>

        <div class="t04-opts" role="group" aria-label="Invitation category">
          <button class="t04-opt${isFamily ? '' : ' selected'}" type="button" data-type="single" aria-pressed="${!isFamily}">
            <span class="ic">${ICONS.person}</span>
            <strong>Individual</strong>
            <small>For 1 guest</small>
          </button>
          <button class="t04-opt${isFamily ? ' selected' : ''}" type="button" data-type="family" aria-pressed="${isFamily}">
            <span class="ic">${ICONS.family}</span>
            <strong>With Family</strong>
            <small>Family invitation</small>
          </button>
        </div>

        <div class="t04-wording-box">
          <p class="t04-wording-sal">Dear ${esc(personalized)},</p>
          <p class="t04-wording-copy" data-single="${esc(copySingle)}" data-family="${esc(copyFamily)}">
            ${esc(isFamily ? copyFamily : copySingle)}
          </p>
        </div>

        ${JALI_DIVIDER()}
      </div>

      <div class="t04-nav-row">
        <button class="t04-btn-prev" type="button" data-prev>← Back</button>
        <button class="t04-btn-next" type="button" data-next>The Couple →</button>
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

  const stepsIndicators = STEP_LABELS.map((label, idx) => `
    <button class="t04-step${idx === 0 ? ' active' : ''}" type="button" data-step="${idx}" style="--i:${idx}" aria-label="${esc(label)}"${idx === 0 ? ' aria-current="step"' : ''}>
      <span>${esc(label)}</span>
    </button>
  `).join('');

  return `<style>${STYLE}</style>
<main class="t04">
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

      var clickHandler = function(e) {
        var nextBtn = e.target.closest('[data-next]');
        if (nextBtn) {
          e.preventDefault();
          goTo(current + 1);
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

  const clickHandler = e => {
    const nextBtn = e.target.closest('[data-next]');
    if (nextBtn) {
      e.preventDefault();
      goTo(current + 1);
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
