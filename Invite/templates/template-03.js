const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const safeUrl = value => /^https?:\/\//i.test(String(value || '').trim())
  ? esc(String(value).trim())
  : '';

const safePortrait = (value, fallback) => {
  const raw = String(value || '').trim();
  return /^https:\/\//i.test(raw) ? esc(raw) : fallback;
};

const lines = value => String(value ?? '').split(/[;\n]/).map(line => line.trim()).filter(Boolean);
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const STEP_NAMES = ['Guest Welcome', 'Invitation Type', 'Bride & Groom Details', 'Wedding Programme', 'Guest Actions'];
const STEP_LABELS = ['Welcome', 'Invitation', 'Couple', 'Programme', 'Actions'];
const PORTRAITS = {
  bride: './assets/template-03-bride.png',
  groom: './assets/template-03-groom.png'
};

function dateParts(value) {
  const raw = String(value || '').trim();
  let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T)/);
  if (match) {
    const [, year, month, day] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return parsed.getUTCFullYear() === Number(year)
      && parsed.getUTCMonth() === Number(month) - 1
      && parsed.getUTCDate() === Number(day)
      ? { year: Number(year), month: Number(month), day: Number(day) }
      : null;
  }

  match = raw.match(/^(\d{1,2})[\s/-]+([A-Za-z]{3,9})[\s/-]+(\d{4})$/);
  if (match) {
    const month = MONTHS.findIndex(value => value.toLowerCase() === match[2].slice(0, 3).toLowerCase()) + 1;
    if (month) return dateParts(`${match[3]}-${String(month).padStart(2, '0')}-${String(Number(match[1])).padStart(2, '0')}`);
  }
  match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return dateParts(`${match[3]}-${String(Number(match[2])).padStart(2, '0')}-${String(Number(match[1])).padStart(2, '0')}`);
  return null;
}

function formatDate(value, locale = 'en-IN') {
  const parts = dateParts(value);
  if (!parts) return String(value || '').trim();
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)));
}

function formatTime(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/T|1899-/.test(raw)) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).toUpperCase();
    }
  }
  return raw.toUpperCase();
}

function parseWhen(dateValue, timeValue) {
  const date = dateParts(dateValue);
  if (!date) return null;
  const rawTime = String(timeValue || '').trim();
  const time = rawTime.match(/^(\d{1,2})(?::([0-5]\d))?\s*([AaPp][Mm])?$/);
  if (rawTime && !time) return null;
  let hour = time ? Number(time[1]) : 0;
  const minute = time ? Number(time[2] || 0) : 0;
  const meridiem = time ? String(time[3] || '').toUpperCase() : '';
  if (time && ((meridiem && (hour < 1 || hour > 12)) || (!meridiem && hour > 23))) return null;
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  const timestamp = new Date(`${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function eventGroup(event) {
  const category = String(event?.category || event?.event_category || '').toLowerCase();
  if (/post|reception|bou bhaat|bou-bhaat/.test(category)) return 'post';
  if (/pre|aiburo|holud|ashirbaad|dodhi/.test(category)) return 'pre';
  if (/main|wedding|ceremony/.test(category)) return 'main';
  const name = String(event?.event_name || '').toLowerCase();
  if (/reception|bou bhaat|bou-bhaat/.test(name)) return 'post';
  if (/wedding|shubho bibaho|bibaho|main ceremony/.test(name)) return 'main';
  if (/aiburo|holud|ashirbaad|dodhi/.test(name)) return 'pre';
  return 'other';
}

function lotus() {
  return `<svg class="t03-lotus" viewBox="0 0 160 52" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M80 44C65 32 66 17 80 5c14 12 15 27 0 39ZM74 44C57 37 49 26 51 14c14 4 23 14 29 30m6 0c17-7 25-18 23-30-14 4-23 14-29 30M68 44c-17-1-29-7-34-20 14 0 25 7 34 20m24 0c17-1 29-7 34-20-14 0-25 7-34 20M12 47h50m36 0h50"/>
      <path d="m80 1 3 4-3 4-3-4z" fill="currentColor"/>
    </g>
  </svg>`;
}

function floralFrame() {
  return `<svg class="t03-floral-art" viewBox="0 0 500 700" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke="#bd7a25" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 124V8h104M492 124V8H388M8 576v116h104m380-116v116H388"/>
      <path d="M8 74q18-4 22-24 8 19 21 12 7-14 17-27 0 24 16 25 8-14 22-22-2 25-19 37M492 74q-18-4-22-24-8 19-21 12-7-14-17-27 0 24-16 25-8-14-22-22 2 25 19 37"/>
      <path d="M8 626q18 4 22 24 8-19 21-12 7 14 17 27 0-24 16-25 8 14 22 22-2-25-19-37M492 626q-18 4-22 24-8-19-21-12-7 14-17 27 0-24-16-25-8 14-22 22 2-25 19-37"/>
      <path d="M30 36q-4-13 6-21 7 13 1 23m21 13q-3-15 10-22 6 14-4 26m15-2q4-16 19-16 1 17-14 23m-47 586q-4 13 6 21 7-13 1-23m21-13q-3 15 10 22 6-14-4-26m15 2q4 16 19 16 1-17-14-23"/>
      <path d="M16 8v64m468-64v64M16 628v64m468-64v64"/>
      <path d="M15 80c16 3 12 17 22 20m-22 8c16 3 12 17 22 20m448-48c-16 3-12 17-22 20m22 8c-16 3-12 17-22 20"/>
    </g>
    <g stroke="#bd7a25" stroke-width="1">
      <path d="M27 18c-10-8-12 6-1 10 11-4 9-18 1-10Zm37 26c-11-8-13 7-1 10 11-4 9-18 1-10Zm31-11c-11-8-13 7-1 10 11-4 9-18 1-10Zm-68 620c-10 8-12-6-1-10 11 4 9 18 1 10Zm37-26c-11 8-13-7-1-10 11 4 9 18 1 10Zm31 11c-11 8-13-7-1-10 11 4 9 18 1 10Z" fill="#a91f2d"/>
      <path d="M46 34c-10-8-12 6-1 10 11-4 9-18 1-10Zm38-4c-10-8-12 6-1 10 11-4 9-18 1-10Zm-38 636c-10 8-12-6-1-10 11 4 9 18 1 10Zm38 4c-10 8-12-6-1-10 11 4 9 18 1 10Z" fill="#cf8b25"/>
      <path d="M16 38c-10-6-12 6-1 9 11-4 9-16 1-9Zm468 0c10-6 12 6 1 9-11-4-9-16-1-9ZM16 662c-10 6-12-6-1-9 11 4 9 16 1 9Zm468 0c10 6 12-6 1-9-11 4-9 16-1 9Z" fill="#567339"/>
    </g>
    <g fill="#bd7a25"><circle cx="27" cy="28" r="2.5"/><circle cx="64" cy="48" r="2.5"/><circle cx="95" cy="37" r="2.5"/><circle cx="27" cy="672" r="2.5"/><circle cx="64" cy="652" r="2.5"/><circle cx="95" cy="663" r="2.5"/></g>
  </svg>`;
}

function hangingGarlands() {
  return `<svg class="t03-hanging-garlands" viewBox="0 0 500 120" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke="#b77824" stroke-width="2">
      <path d="M18 0v91m18-91v71m18-71v50m428-50v91m-18-91v71m-18-71v50"/>
      <path d="M12 4h12m6 4h12m-6 9h12m-6 9h12m-6 9h12m-6 9h12m-6 9h12m-6 9h12m-6 9h12m-6 9h12"/>
      <path d="M488 4h-12m-6 4h-12m6 9h-12m6 9h-12m6 9h-12m6 9h-12m6 9h-12m6 9h-12m6 9h-12m6 9h-12"/>
    </g>
    <g fill="#9d1828"><path d="m18 93-8 18 8-4 8 4zM36 74l-8 18 8-4 8 4zM54 53l-8 18 8-4 8 4zM482 93l-8 18 8-4 8 4zM464 74l-8 18 8-4 8 4zM446 53l-8 18 8-4 8 4z"/></g>
    <g fill="#587440"><ellipse cx="27" cy="31" rx="4" ry="8" transform="rotate(-40 27 31)"/><ellipse cx="43" cy="51" rx="4" ry="8" transform="rotate(40 43 51)"/><ellipse cx="473" cy="31" rx="4" ry="8" transform="rotate(40 473 31)"/><ellipse cx="457" cy="51" rx="4" ry="8" transform="rotate(-40 457 51)"/></g>
  </svg>`;
}

function weddingEmblem() {
  return `<svg class="t03-wedding-emblem" viewBox="0 0 180 145" role="img" aria-label="Bengali wedding emblem">
    <g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M31 131q3-35 28-47 14-6 31 0 26 12 29 47M59 87q-2-29 17-39 19 10 17 39M57 69q19-17 38 0M61 50q15-18 30 0m-38 81h63"/>
      <path d="M91 131q3-35 28-47 14-6 31 0 26 12 29 47M119 87q-2-29 17-39 19 10 17 39M117 69q19-17 38 0M121 50q15-18 30 0"/>
      <path d="M43 89q-9-15 2-26 11 10 4 24m-7 4q-14 2-17-12 14-3 21 7m106 3q9-15-2-26-11 10-4 24m7 4q14 2 17-12-14-3-21 7"/>
      <path d="M76 110h28m-14-15v30"/>
    </g>
    <text x="90" y="142" text-anchor="middle">শুভ বিবাহ</text>
  </svg>`;
}

function palaceArt() {
  return `<svg class="t03-palace-art" viewBox="0 0 700 180" preserveAspectRatio="xMidYMax meet">
    <g fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 164h660M44 151h612M70 138h560M105 138V75h46v63m398 0V75h46v63M151 138V60h58v78m282 0V60h58v78M209 138V48h54v90m174 0V48h54v90M263 138V36h174v102"/>
      <path d="M28 75h114l-15-17H43zm430 0h114l-15-17H473zM197 48h306l-19-17H216zM253 36q97-40 194 0"/>
      <path d="M330 138V91q20-28 40 0v47m-70 0V76q16-23 32 0v62m76 0V76q16-23 32 0v62"/>
      <path d="M246 138v-14m24 14v-14m160 14v-14m24 14v-14M117 138v-17m24 17v-17m418 17v-17m24 17v-17"/>
      <path d="M20 164q45-20 90 0 45-20 90 0 45-20 90 0 45-20 90 0 45-20 90 0 45-20 90 0 45-20 90 0"/>
    </g>
    <g fill="currentColor"><circle cx="350" cy="11" r="4"/><circle cx="30" cy="47" r="3"/><circle cx="670" cy="47" r="3"/></g>
  </svg>`;
}

function profileFallback(kind) {
  if (kind === 'bride') {
    return `<svg viewBox="0 0 180 210" aria-hidden="true">
      <defs><linearGradient id="t03-bride-fabric" x2="0" y2="1"><stop stop-color="#e7b95c"/><stop offset="1" stop-color="#8e1020"/></linearGradient></defs>
      <path d="M32 204c3-43 17-68 45-78h26c28 10 42 35 45 78" fill="url(#t03-bride-fabric)"/>
      <path d="M31 204c17-30 35-53 59-69 25 14 42 39 60 69M40 123c8-51 24-82 50-82s42 31 50 82c-20-19-34-27-50-27s-30 8-50 27Z" fill="#8f1021" stroke="#e2b451" stroke-width="4"/>
      <path d="M63 78c5-27 15-40 27-40s22 13 27 40c-10-6-18-9-27-9s-17 3-27 9" fill="#d9a74e"/>
      <ellipse cx="90" cy="82" rx="25" ry="32" fill="#d99c70"/>
      <path d="M65 80c2-34 12-53 25-53s23 19 25 53c-8-13-17-19-25-19S73 67 65 80Z" fill="#24130f"/>
      <path d="M78 83h4m16 0h4M84 98q6 5 12 0" stroke="#4b231c" stroke-width="2" stroke-linecap="round"/>
      <path d="M83 72h14" stroke="#c1222c" stroke-width="3"/><circle cx="90" cy="68" r="3" fill="#d8ae55"/>
      <path d="M53 117h74M60 131h60M44 145h92M35 160h110M28 177h124M22 194h136" stroke="#e8c66f" stroke-width="2" opacity=".9"/>
      <path d="M42 119 90 164l48-45" fill="none" stroke="#f1d581" stroke-width="3"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 180 210" aria-hidden="true">
    <defs><linearGradient id="t03-groom-coat" x2="0" y2="1"><stop stop-color="#fff1cf"/><stop offset="1" stop-color="#d8b76b"/></linearGradient></defs>
    <path d="M34 204c3-45 20-70 56-78 36 8 53 33 56 78" fill="url(#t03-groom-coat)" stroke="#d6ad5d" stroke-width="3"/>
    <path d="M68 131 90 154l22-23 14 73H54z" fill="#f5e7c8" stroke="#b99149" stroke-width="2"/>
    <ellipse cx="90" cy="79" rx="28" ry="35" fill="#c98861"/>
    <path d="M61 77V47h58v30l-9-8H70z" fill="#f7ead1" stroke="#d4ac5a" stroke-width="3"/>
    <path d="M68 48q22-12 44 0l-6-17H74z" fill="#fff2d2" stroke="#d4ac5a" stroke-width="3"/>
    <path d="M74 77h5m22 0h5m-22 15q6 4 12 0" stroke="#47251c" stroke-width="2" stroke-linecap="round"/>
    <path d="M90 48v91m-9-1 9 13 9-13M69 113q21 13 42 0" fill="none" stroke="#a61a28" stroke-width="3"/>
    <path d="m90 9 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#d1a54c"/>
  </svg>`;
}

function profilePhoto(url, name, kind) {
  const image = safePortrait(url, PORTRAITS[kind]);
  return `<div class="t03-portrait ${kind}-portrait"><div class="t03-portrait-art">${profileFallback(kind)}</div><img src="${image}" alt="${esc(kind === 'bride' ? 'Bride' : 'Groom')} ${esc(name)}"><span class="t03-portrait-frame" aria-hidden="true"></span></div>`;
}

function formatEvent(event, index) {
  const date = formatDate(event.event_date);
  const time = formatTime(event.event_time);
  const venue = event.venue ? `Venue: ${esc(event.venue)}` : '';
  const address = event.address ? ` · ${esc(event.address)}` : '';
  const dateTime = [date, time].filter(Boolean).map(esc);
  const eventName = String(event.event_name || '').toLowerCase();
  const portrait = /bride|holud|mehendi|gaye|bou bhaat/.test(eventName) ? PORTRAITS.bride : PORTRAITS[index % 2 ? 'groom' : 'bride'];
  return `<article class="t03-event-card${/wedding|bibaho/i.test(event.event_name || '') ? ' main-event' : ''}">
    <img class="t03-event-portrait" src="${portrait}" alt="" aria-hidden="true">
    <div class="t03-event-copy"><h3>${esc(event.event_name || 'Wedding celebration')}</h3>
      ${dateTime.length ? `<p>${dateTime.join(' <i>·</i> ')}</p>` : ''}
      ${venue || address ? `<small>${venue}${address}</small>` : ''}
      ${event.note ? `<small>${esc(event.note)}</small>` : ''}
    </div><span class="t03-event-chevron" aria-hidden="true">›</span>
  </article>`;
}

export default function render({ guest, wedding: w = {}, events = [] }) {
  const bride = String(w.bride_name || 'Bride').trim();
  const groom = String(w.groom_name || 'Groom').trim();
  const brideFull = String(w.bride_full || bride).trim();
  const groomFull = String(w.groom_full || groom).trim();
  const guestName = String(guest?.name || 'Respected Guest').trim();
  const isFamily = Boolean(guest?.with_family);
  const names = { bride: esc(bride), groom: esc(groom), brideFull: esc(brideFull), groomFull: esc(groomFull), guest: esc(guestName) };
  const mapUrl = safeUrl(w.map_url);
  const weddingDate = dateParts(w.date);
  const weddingTime = String(w.time || '').trim();
  const target = parseWhen(w.date, weddingTime);
  const theme = w.theme_colors && typeof w.theme_colors === 'object' ? w.theme_colors : {};
  const colors = {
    red: /^#[\da-f]{6}$/i.test(String(theme.primary || '')) ? theme.primary : '#8f1724',
    deep: /^#[\da-f]{6}$/i.test(String(theme.primary_dark || '')) ? theme.primary_dark : '#3b080d',
    gold: /^#[\da-f]{6}$/i.test(String(theme.accent || '')) ? theme.accent : '#d9a83e',
    cream: /^#[\da-f]{6}$/i.test(String(theme.paper_top || '')) ? theme.paper_top : '#fff4dc',
    paper: /^#[\da-f]{6}$/i.test(String(theme.paper_bottom || '')) ? theme.paper_bottom : '#f5e2bc',
    ink: /^#[\da-f]{6}$/i.test(String(theme.text || '')) ? theme.text : '#4a2118'
  };
  const message = String(w.message || '').trim();
  const individualMessage = message || 'With immense joy, we invite you to join us in celebrating the auspicious wedding ceremony of our beloved children. Your presence and blessings will mean the world to us.';
  const familyMessage = message || 'With immense joy and heartfelt affection, we invite you and your family to bless the auspicious union of our beloved children and join us in celebrating this beautiful beginning.';
  const initialMessage = isFamily ? familyMessage : individualMessage;
  const invocation = lines(w.invocation).map(esc).join('<br>') || 'With the blessings of the Almighty and our elders';
  const familyName = /\bfamily\b/i.test(guestName) ? '' : ' Family';
  const familySignature = w.footer_text || w.compliments || w.host_name || 'The Families';

  const validEvents = (Array.isArray(events) ? events : []).filter(event => event && typeof event === 'object');
  const eventGroups = [
    ['pre', 'Pre-Wedding Ceremonies'],
    ['main', 'Main Wedding Ceremony'],
    ['post', 'Post-Wedding Functions'],
    ['other', 'Wedding Celebrations']
  ];
  const groupMarkup = eventGroups.map(([key, label]) => {
    const items = validEvents.filter(event => eventGroup(event) === key);
    if (!items.length) return '';
    return `<section class="t03-event-group" style="--event-count:${items.length}"><h3>${label}</h3>${items.map(formatEvent).join('')}</section>`;
  }).join('');

  const mapsCard = mapUrl
    ? `<article class="t03-action-card"><span class="t03-action-icon" aria-hidden="true">⌖</span><h3>Find Venue</h3><p>Get directions to the venue.</p><a class="t03-small-button" href="${mapUrl}" target="_blank" rel="noopener noreferrer">View on Maps</a></article>`
    : `<article class="t03-action-card"><span class="t03-action-icon" aria-hidden="true">⌖</span><h3>Find Venue</h3><p>Venue directions will be shared by the family.</p><span class="t03-small-button unavailable">Details to follow</span></article>`;
  const rsvpDigits = String(w.rsvp_number || '').replace(/\D/g, '');
  const rsvpCard = rsvpDigits.length >= 8
    ? `<article class="t03-action-card"><span class="t03-action-icon whatsapp-icon" aria-hidden="true">◉</span><h3>Confirm on WhatsApp</h3><p>Confirm if you can attend.</p><a class="t03-small-button" id="t03-whatsapp" href="#" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></article>`
    : `<article class="t03-action-card"><span class="t03-action-icon whatsapp-icon" aria-hidden="true">◉</span><h3>Confirm on WhatsApp</h3><p>Confirm if you can attend.</p><span class="t03-small-button unavailable">RSVP details to follow</span></article>`;

  const screens = [
    `<section class="t03-screen t03-cover active" data-screen="0" aria-label="Guest welcome">
      <div class="t03-cover-arch"></div><div class="t03-cover-corner top-left" aria-hidden="true">✦ ❧ ✿</div><div class="t03-cover-corner top-right" aria-hidden="true">✦ ❧ ✿</div>
      <div class="t03-cover-content">
        <div class="t03-ganesh" aria-hidden="true">ॐ</div>
        <p class="t03-eyebrow">${invocation}</p>
        <h1 class="t03-bengali t03-hero-title">${esc(w.ceremony_title_bn || 'শুভ বিবাহ')}</h1>
        <div class="t03-gold-rule"><span>❧</span></div>
        <p class="t03-invited-label">Dear</p><h2 class="t03-guest-name">${names.guest}${isFamily && !familyName ? '' : isFamily ? ' Family' : ''}</h2>
        <p class="t03-cover-copy">Your presence would make our<br>celebration truly special.</p>
        <div class="t03-cover-palace" aria-hidden="true">${palaceArt()}</div>
        <div class="t03-cover-couple">${names.bride}<i>✦</i>${names.groom}</div>
        <div class="t03-cover-bottom bengali">শুভ পরিণয় · শুভ হোক</div>
      </div>
      <button class="t03-button gold-button" type="button" data-next>Begin Invitation <span>→</span></button>
      <div class="t03-cover-corner bottom-left" aria-hidden="true">✿ ❧ ✦</div><div class="t03-cover-corner bottom-right" aria-hidden="true">✿ ❧ ✦</div>
    </section>`,
    `<section class="t03-screen t03-paper" data-screen="1" aria-label="Invitation type">
      <div class="t03-floral-frame" aria-hidden="true">${floralFrame()}</div>
      <div class="t03-paper-ornament top">❧ ❦ ❧</div>
      <p class="t03-eyebrow red">You are cordially invited</p>
      <h2 class="t03-bengali t03-section-bengali">${esc(w.ceremony_title_bn || 'শুভ বিবাহ')}</h2>
      ${lotus()}
      <p class="t03-section-subtitle">Please select your invitation type</p>
      <div class="t03-invite-options" role="group" aria-label="Invitation type">
        <button type="button" class="t03-invite-option${isFamily ? '' : ' selected'}" data-type="single" aria-pressed="${!isFamily}">
          <span class="option-icon" aria-hidden="true">♙</span><strong>Single / Individual</strong><small>For one person</small><span class="radio-dot"></span>
        </button>
        <button type="button" class="t03-invite-option${isFamily ? ' selected' : ''}" data-type="family" aria-pressed="${isFamily}">
          <span class="option-icon family-icon" aria-hidden="true">♧</span><strong>Family Invitation</strong><small>For you and your family</small><span class="radio-dot"></span>
        </button>
      </div>
      <article class="t03-wording"><span class="mini-flower" aria-hidden="true">✿</span>
        <p class="salutation">Dear ${names.guest}${isFamily ? familyName : ''},</p>
        <p class="invitation-copy" data-single="${esc(individualMessage)}" data-family="${esc(familyMessage)}">${esc(initialMessage)}</p>
        <div class="t03-gold-rule"><span>❧</span></div>
      </article>
      <div class="t03-screen-actions"><button class="t03-button outline-button" type="button" data-prev>← Back</button><button class="t03-button red-button" type="button" data-next>Next →</button></div>
      <div class="t03-paper-ornament bottom">❧ ❦ ❧</div>
    </section>`,
    `<section class="t03-screen t03-paper t03-couple-screen" data-screen="2" aria-label="Bride and groom details">
      <div class="t03-floral-frame" aria-hidden="true">${floralFrame()}</div>${hangingGarlands()}
      <p class="t03-eyebrow red">Two Hearts · Two Families</p>
      <h2 class="t03-section-title">One Beautiful Beginning</h2>
      <div class="t03-couple-grid">
        <article class="t03-person">${profilePhoto(w.bride_photo || w.bride_photo_url || w.bride_image, brideFull, 'bride')}
          <p class="person-role">Bride</p><h3>${names.brideFull}</h3><div class="tiny-rule"></div>
          ${w.bride_parents ? `<p class="parent-label">Daughter of</p><p class="parents">${esc(w.bride_parents)}</p>` : ''}
        </article>
        <div class="t03-ampersand" aria-hidden="true">&amp;</div>
        <article class="t03-person">${profilePhoto(w.groom_photo || w.groom_photo_url || w.groom_image, groomFull, 'groom')}
          <p class="person-role">Groom</p><h3>${names.groomFull}</h3><div class="tiny-rule"></div>
          ${w.groom_parents ? `<p class="parent-label">Son of</p><p class="parents">${esc(w.groom_parents)}</p>` : ''}
        </article>
      </div>
      <div class="t03-couple-flourish" aria-hidden="true">${weddingEmblem()}</div>
      <div class="t03-screen-actions"><button class="t03-button outline-button" type="button" data-prev>← Back</button><button class="t03-button red-button" type="button" data-next>Next →</button></div>
    </section>`,
    `<section class="t03-screen t03-paper t03-programme-screen" data-screen="3" aria-label="Wedding programme">
      <div class="t03-floral-frame" aria-hidden="true">${floralFrame()}</div>
      <p class="t03-eyebrow red">Join us for the celebrations</p>
      <h2 class="t03-section-title">Wedding Programme</h2>
      <p class="t03-bengali t03-programme-bengali">বিবাহের অনুষ্ঠানসূচি</p>
      <div class="t03-programme-list">${groupMarkup || '<p class="t03-empty-events">Programme details will be shared by the family.</p>'}</div>
      <div class="t03-screen-actions"><button class="t03-button outline-button" type="button" data-prev>← Back</button><button class="t03-button red-button" type="button" data-next>Next →</button></div>
    </section>`,
    `<section class="t03-screen t03-actions-screen" data-screen="4" aria-label="Guest actions and wedding experience">
      <p class="t03-eyebrow">Your presence is our greatest gift</p><h2>Celebrate With Us</h2>
      <p class="t03-action-intro">A few thoughtful ways to be part of our special day.</p>
      ${target !== null ? `<div class="t03-countdown-wrap"><p class="t03-countdown-title">✦ The auspicious moment arrives in ✦</p>
        <div class="t03-countdown" id="t03-countdown"><div><b id="t03-days">00</b><small>Days</small></div><div><b id="t03-hours">00</b><small>Hours</small></div><div><b id="t03-minutes">00</b><small>Mins</small></div><div><b id="t03-seconds">00</b><small>Secs</small></div></div>
      </div>` : ''}
      <div class="t03-action-grid">
        <article class="t03-action-card"><span class="t03-action-icon" aria-hidden="true">▦</span><h3>Save the Date</h3><p>Add our wedding to your calendar.</p>
          ${weddingDate ? '<a class="t03-small-button" id="t03-calendar" href="#" target="_blank" rel="noopener noreferrer">Add to Calendar</a>' : '<span class="t03-small-button unavailable">Date to be announced</span>'}
        </article>
        <article class="t03-action-card"><span class="t03-action-icon" aria-hidden="true">✧</span><h3>Scratch &amp; Reveal</h3><p>Scratch to reveal your message.</p>
          <div class="t03-scratch-wrap"><div class="t03-scratch-message">${esc(w.surprise_message || 'Your blessings are our greatest gift.')}</div><canvas class="t03-scratch-canvas" id="t03-scratch" aria-label="Scratch to reveal a wedding message"></canvas></div>
          <button class="t03-small-button" type="button" id="t03-reveal">Reveal Message</button>
        </article>
        ${mapsCard}${rsvpCard}
        <article class="t03-action-card t03-emblem-card">${weddingEmblem()}</article>
      </div>
      <footer class="t03-closing"><span>With love and best wishes</span><p>${esc(familySignature)}</p><div class="bengali">শুভ বিবাহ</div></footer>
      <div class="t03-screen-actions"><button class="t03-button outline-button light-outline" type="button" data-prev>← Back</button><button class="t03-button red-button" type="button" data-restart>Start Again ↻</button></div>
    </section>`
  ];

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
<style>
:root{--t03-wine:${esc(colors.deep)};--t03-wine2:#5c1018;--t03-red:${esc(colors.red)};--t03-gold:${esc(colors.gold)};--t03-gold-light:#f4d98a;--t03-cream:${esc(colors.cream)};--t03-paper:${esc(colors.paper)};--t03-ink:${esc(colors.ink)}}
*{box-sizing:border-box}
.t03{position:absolute;inset:0;overflow:auto;color:var(--t03-ink);font:16px 'Cormorant Garamond',Georgia,serif;background:radial-gradient(ellipse at top,#6a2024 0,#28070b 62%,#160407 100%);padding:clamp(8px,2vh,20px) 10px}
.t03-shell{width:min(100%,480px);min-height:min(94vh,980px);margin:auto;padding:8px;background:#2d080c;border:1px solid var(--t03-gold);box-shadow:0 18px 60px #0008;position:relative}
.t03-shell:before{content:"";position:absolute;inset:4px;border:1px solid #9d702b;pointer-events:none}
.t03-step-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;padding:5px 5px 12px;position:relative;z-index:1}
.t03-step{min-width:0;padding:5px 3px 8px;border:0;border-bottom:1px solid #8d6b3b;color:#bba27b;background:transparent;text-align:left;cursor:pointer}
.t03-step-label{display:flex;justify-content:space-between;gap:3px;margin-bottom:7px;font:10px Arial,sans-serif;white-space:nowrap}
.t03-step-line{position:relative;height:2px;background:#704c2c}
.t03-step-line:before{content:"";position:absolute;top:50%;left:0;width:100%;height:1px;background:radial-gradient(circle,#be944d 2px,transparent 3px) left center/20% 4px repeat-x;transform:translateY(-50%)}
.t03-step-progress{position:absolute;top:0;left:0;width:0;height:3px;background:var(--t03-gold);transition:width .3s}
.t03-step.active{color:var(--t03-gold-light)}
.t03-step.active .t03-step-progress{width:var(--progress)}
.t03-step.active .t03-step-line{border-bottom:1px solid var(--t03-gold)}
.t03-screen{display:none;position:relative;min-height:540px;height:min(90vh,700px);overflow:hidden}
.t03-screen.active{display:flex;flex-direction:column;align-items:center;animation:t03-fade .35s ease}
@keyframes t03-fade{from{opacity:.35;transform:translateY(5px)}to{opacity:1;transform:none}}
.t03-cover,.t03-actions-screen{color:var(--t03-cream);border:1px solid var(--t03-gold);outline:1px solid #7d5220;outline-offset:-7px;text-align:center;padding:clamp(24px,5vh,48px) clamp(14px,4vw,34px) 18px;background:radial-gradient(ellipse at 50% 34%,#66121b 0,#450b12 58%,#2d060b 100%)}
.t03-cover:before,.t03-cover:after,.t03-actions-screen:before,.t03-actions-screen:after{content:"✦ ❧ ✿ ❧ ✦";position:absolute;color:var(--t03-gold);font-size:18px;letter-spacing:6px;opacity:.9}
.t03-cover:before,.t03-actions-screen:before{top:10px;left:12px;right:12px;text-align:left}
.t03-cover:after,.t03-actions-screen:after{bottom:8px;right:12px;left:12px;text-align:right}
.t03-cover-arch{position:absolute;inset:22px;border:1px solid #bb8a37;border-radius:150px 150px 0 0;opacity:.38;pointer-events:none}
.t03-cover-corner{position:absolute;color:#e5bf66;font-size:20px;letter-spacing:3px;opacity:.8}
.t03-cover-corner.top-left{left:20px;top:36px}.t03-cover-corner.top-right{right:20px;top:36px;transform:scaleX(-1)}
.t03-cover-corner.bottom-left{left:20px;bottom:16px}.t03-cover-corner.bottom-right{right:20px;bottom:16px;transform:scaleX(-1)}
.t03-cover-content{position:relative;z-index:1;width:min(100%,540px);height:100%;display:flex;flex-direction:column;align-items:center;margin:auto}
.t03-ganesh{color:var(--t03-gold-light);font-size:34px;line-height:1;margin-bottom:7px}
.t03-eyebrow{margin:0 0 8px;color:#e4c98c;font:600 9px/1.6 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}
.t03-eyebrow.red{color:#8b4a25}
.t03-bengali{font-family:'Noto Serif Bengali',serif}
.t03-hero-title{margin:2px 0;color:#f2cf72;font-size:clamp(38px,9vw,68px);line-height:1.35;text-shadow:0 2px 0 #7e4518,0 6px 20px #0006}
.t03-gold-rule{position:relative;width:min(260px,76%);height:1px;margin:13px auto;background:linear-gradient(90deg,transparent,var(--t03-gold),transparent)}
.t03-gold-rule span{position:absolute;left:50%;top:50%;padding:0 10px;background:var(--t03-cream);color:#a56c21;font-size:18px;transform:translate(-50%,-50%)}
.t03-cover .t03-gold-rule span{background:#4b0b12}
.t03-invited-label{margin:4px 0;color:#e5d2b0;font-size:16px}
.t03-guest-name{margin:4px 0;color:#f3d67f;font-size:clamp(23px,5vw,34px);font-weight:600}
.t03-cover-copy{margin:0;color:#f5e7cf;font-size:17px;line-height:1.35}
.t03-cover-palace{position:absolute;inset:auto 0 25px;z-index:-1;height:27%;overflow:hidden;opacity:.36}
.t03-palace-art{position:absolute;inset:auto 0 0;width:100%;height:100%;color:#d8a83e}
.t03-cover-couple{display:flex;align-items:center;gap:12px;margin:12px 0 0;color:#f2d17c;font-size:20px;font-weight:700}
.t03-cover-couple i{color:var(--t03-gold);font-style:normal;font-size:13px}
.t03-cover-bottom{margin-top:auto;padding-top:10px;color:#e5bf66;font-family:'Noto Serif Bengali',serif;font-size:14px}
.t03-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:9px 17px;border:1px solid var(--t03-gold);border-radius:999px;font:700 14px 'Cormorant Garamond',Georgia,serif;cursor:pointer;transition:transform .2s,filter .2s}
.t03-button:hover{transform:translateY(-1px);filter:brightness(1.06)}
.t03-button:focus-visible,.t03-step:focus-visible,.t03-invite-option:focus-visible,.t03-small-button:focus-visible{outline:3px solid #e4c16d;outline-offset:2px}
.t03-cover>.gold-button{position:relative;z-index:2;min-width:190px;margin:8px 0 8px;background:linear-gradient(180deg,#f5d77d,#c58a24);color:#35100c;box-shadow:inset 0 1px #fff6,0 3px 9px #0003}
.t03-paper{position:relative;isolation:isolate;text-align:center;padding:clamp(20px,4vh,38px) clamp(14px,5vw,48px) 18px;border:1px solid #bd8b3b;outline:1px solid #e6c26e;outline-offset:-7px;background:linear-gradient(145deg,#fffaf0,var(--t03-paper))}
.t03-paper:before,.t03-paper:after{position:absolute;z-index:-1;color:#a36d28;font-size:25px;opacity:.86}
.t03-paper:before{content:"❧";top:4px;left:10px}.t03-paper:after{content:"❧";right:10px;bottom:2px;transform:rotate(180deg)}
.t03-paper-ornament{color:#b9802c;font-size:20px;letter-spacing:8px}
.t03-paper-ornament.top{margin:0 0 5px}.t03-paper-ornament.bottom{position:absolute;left:0;right:0;bottom:5px}
.t03-section-bengali{margin:0;color:#8c1724;font-size:clamp(31px,5vw,44px)}
.t03-lotus{display:block;width:120px;height:40px;margin:0 auto;color:#b9802c}
.t03-section-subtitle{margin:3px 0 12px;color:#80603e;font-size:16px}
.t03-invite-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:min(100%,510px);margin:0 auto 12px}
.t03-invite-option{position:relative;min-height:112px;padding:11px 7px 17px;border:1px solid #d9c4a1;border-radius:8px;background:#fff8e9;color:var(--t03-ink);display:flex;align-items:center;flex-direction:column;justify-content:center;gap:4px;text-align:center}
.t03-invite-option.selected{border:2px solid #a52c2a;box-shadow:0 0 0 3px #a52c2a12}
.option-icon{font-size:27px;color:#971c2a}.family-icon{font-size:24px}
.t03-invite-option strong{font-size:15px}.t03-invite-option small{font-size:12px;color:#7e674e}
.radio-dot{width:13px;height:13px;margin-top:2px;border:1px solid #977d58;border-radius:50%}
.selected .radio-dot{border:4px solid #a52c2a}
.t03-wording{position:relative;width:min(100%,650px);margin:auto;padding:18px 20px 7px;border:1px solid #e2c99d;border-radius:8px;background:#fff8e9ad;text-align:left;font-size:16px;line-height:1.45}
.t03-wording p{margin:0 0 7px}.t03-wording .salutation{font-weight:700;color:#603024}
.t03-wording .invitation-copy{max-height:120px;overflow:auto}
.t03-wording .t03-gold-rule{margin:13px auto}
.t03-wording .t03-gold-rule span{background:#fff7e8}
.mini-flower{position:absolute;top:-14px;left:calc(50% - 15px);padding:0 6px;background:#fff4dc;color:#a86d21;font-size:24px}
.t03-screen-actions{position:relative;z-index:2;display:flex;justify-content:space-between;gap:12px;width:100%;margin-top:auto;padding-top:10px}
.outline-button{background:transparent;color:#6e281f;border-color:#9e6d43}
.red-button{background:linear-gradient(180deg,#9f1e2b,#760d1b);color:#fff2d5;border-color:#c18a3c}
.t03-floral-frame{position:absolute;z-index:-1;inset:0;pointer-events:none}
.t03-floral-art{position:absolute;inset:0;width:100%;height:100%;opacity:.95}
.t03-couple-screen{padding-top:clamp(48px,8vh,76px)}
.t03-hanging-garlands{position:absolute;inset:0 0 auto;width:100%;height:100px;pointer-events:none}
.t03-section-title{max-width:90%;margin:0 auto 14px;color:#761621;font-size:clamp(25px,5vw,36px);font-weight:600;line-height:1.1}
.t03-couple-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 30px 1fr;gap:7px;align-items:center;width:min(100%,600px);margin:auto}
.t03-person{min-width:0}
.t03-portrait{position:relative;width:clamp(104px,28vw,132px);height:clamp(104px,28vw,132px);margin:auto;overflow:hidden;border:2px solid #c18c36;padding:3px;background:#fff0d0;border-radius:50%;box-shadow:0 0 0 5px #d5ae6330}
.t03-portrait:before{content:"";position:absolute;inset:4px;z-index:2;border:1px solid #d4aa5c;border-radius:inherit;pointer-events:none}
.t03-portrait-art{position:absolute;inset:6px;display:grid;place-items:center;overflow:hidden;border-radius:inherit}
.t03-portrait-art svg{width:100%;height:100%}
.t03-portrait img{position:absolute;inset:3px;z-index:1;width:calc(100% - 6px);height:calc(100% - 6px);border-radius:inherit;object-fit:cover}
.t03-portrait-frame{position:absolute;inset:0;z-index:3;border-radius:inherit;pointer-events:none}
.bride-portrait{background:radial-gradient(circle at 50% 30%,#ffe9c8,#b41d31)}
.groom-portrait{background:radial-gradient(circle at 50% 30%,#fff0d5,#9e783f)}
.person-role{margin:10px 0 1px;color:#8b5b2a;font-size:14px}
.t03-person h3{margin:0;color:#861825;font-size:clamp(15px,3vw,20px);line-height:1.18}
.tiny-rule{width:56px;height:1px;margin:8px auto;background:#c39343}
.parent-label{margin:0 0 2px;color:#967450;font-size:12px}
.parents{margin:0;color:#644b38;font-size:13px;line-height:1.25}
.t03-ampersand{color:#bd8b36;font-size:30px;font-style:italic}
.t03-couple-flourish{color:#bc862f;font-size:22px;letter-spacing:3px}
.t03-couple-quote{margin:0;color:#96652d;font-size:15px;font-style:italic}
.t03-programme-screen{padding:clamp(20px,4vh,34px) clamp(10px,2.5vw,25px) 16px}
.t03-programme-screen .t03-section-title{margin:0}
.t03-programme-bengali{margin:0 0 10px;color:#8d1824;font-size:20px}
.t03-programme-list{width:100%;max-width:700px;min-height:0;flex:1;overflow:auto;display:flex;flex-direction:column;gap:7px;text-align:left;scrollbar-color:#bc8b3d transparent}
.t03-event-group{position:relative;display:grid;grid-template-columns:minmax(92px,27%) minmax(0,1fr);grid-template-rows:repeat(var(--event-count),minmax(48px,auto));gap:6px;align-items:stretch}
.t03-event-group:before{content:"";position:absolute;left:calc(27% + 3px);top:50%;bottom:0;width:1px;background:#a51b2c55}
.t03-event-group>h3{grid-column:1;grid-row:1 / span var(--event-count);display:flex;align-items:center;justify-content:center;margin:0;padding:8px;background:linear-gradient(145deg,#991b29,#670d19);border:1px solid #d4a44b;border-radius:5px;color:#fff0cb;text-align:center;font-size:13px;line-height:1.2}
.t03-event-group:nth-child(2)>h3{background:linear-gradient(145deg,#315a32,#1f3d24)}
.t03-event-group:nth-child(3)>h3{background:linear-gradient(145deg,#a36a18,#72420d)}
.t03-event-group:nth-child(n+4)>h3{background:linear-gradient(145deg,#806126,#554015)}
.t03-event-group>.t03-event-card{grid-column:2}
.t03-event-card{position:relative;grid-column:2;display:grid;grid-template-columns:38px minmax(0,1fr) 10px;gap:7px;align-items:center;padding:5px 7px;border:1px solid #dfc89f;border-radius:6px;background:#fff8e9c9;box-shadow:0 2px 5px #6b3b1010}
.t03-event-card.main-event{border-color:#c58c35;background:#fff1d3}
.t03-event-portrait{width:36px;height:36px;border:1px solid #c39035;border-radius:50%;object-fit:cover}
.t03-event-copy{min-width:0}
.t03-event-copy h3{margin:0 0 2px;color:#8a1924;font-size:16px}
.t03-event-copy p{margin:0;color:#5d4630;font-size:12px;line-height:1.15}
.t03-event-copy p i{padding:0 3px;color:#b98a40;font-style:normal}
.t03-event-copy small{display:block;color:#806b52;font-size:11px;line-height:1.15}
.t03-event-chevron{color:#9c6929;font-size:22px}
.t03-empty-events{margin:auto;color:#806b52;text-align:center;font-size:16px}
.t03-actions-screen{height:min(72vh,760px);min-height:540px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#bc8b3d transparent;padding:clamp(19px,3.5vh,34px) clamp(10px,3vw,28px) 16px}
.t03-actions-screen h2{margin:0 0 4px;color:#f1d17b;font-size:clamp(29px,5vw,42px)}
.t03-action-intro{margin:0 auto 6px;color:#e6d4b8;font-size:15px}
.t03-countdown-wrap{width:min(100%,390px);margin:0 auto 7px}
.t03-countdown-title{margin:0 0 6px;color:#f0d18b;font:700 10px Arial,sans-serif;letter-spacing:.15em;text-transform:uppercase}
.t03-countdown{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.t03-countdown>div{padding:5px 2px 4px;border:1px solid #c18b36;border-radius:8px;background:#fffaf0;color:#8c1724}
.t03-countdown b{display:block;font:700 25px/1 'Playfair Display',Georgia,serif}
.t03-countdown small{display:block;margin-top:3px;color:#9b783c;font:700 9px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.t03-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:min(100%,780px);margin:auto}
.t03-action-card{min-width:0;min-height:112px;display:flex;flex-direction:column;align-items:center;padding:9px 8px 8px;border:1px solid #b78331;border-radius:9px;background:linear-gradient(150deg,#571018,#3b080d);box-shadow:inset 0 0 0 3px #6e2a1a44;text-align:center}
.t03-action-icon{margin-bottom:3px;color:#edc45b;font-size:23px;line-height:1}
.t03-action-icon.whatsapp-icon{color:#65d69a}
.t03-action-card h3{margin:0 0 3px;color:#fff0cc;font-size:15px;line-height:1.1}
.t03-action-card p{flex:1;margin:0 0 6px;color:#e2cfb0;font-size:11px;line-height:1.22}
.t03-small-button{width:100%;max-width:160px;min-height:27px;display:inline-flex;align-items:center;justify-content:center;padding:4px 7px;border:1px solid #dfb958;border-radius:999px;background:linear-gradient(180deg,#f5d77d,#c58a24);color:#35100c;font:700 11px 'Cormorant Garamond',Georgia,serif;text-decoration:none;cursor:pointer}
.t03-small-button.unavailable{border-color:#8f7140;background:#594322;color:#e0cfab;cursor:default}
.t03-emblem-card{justify-content:center;padding:5px}
.t03-wedding-emblem{width:min(100%,150px);height:100px;max-width:100%;color:#e4bc5d}
.t03-wedding-emblem text{font:700 12px 'Noto Serif Bengali',serif;fill:#f0c75f}
.t03-closing{margin:7px auto 0;color:#e6c785;text-align:center}
.t03-closing span{font:8px Arial,sans-serif;letter-spacing:.19em;text-transform:uppercase}
.t03-closing p{margin:2px 0;font-size:16px}
.t03-closing .bengali{color:#f0c75f;font-family:'Noto Serif Bengali',serif;font-size:17px}
.t03-actions-screen .light-outline{color:#f7e5bf;border-color:#b58b48}
.t03-actions-screen .t03-screen-actions{padding-top:7px}
.t03-scratch-wrap{position:relative;width:100%;max-width:170px;height:48px;margin:4px 0;overflow:hidden;border:1px solid #bd8b3b;border-radius:6px;background:#fff0ce}
.t03-scratch-message{position:absolute;inset:0;display:grid;place-items:center;padding:8px;color:#7a1622;font-size:16px;font-weight:700}
.t03-scratch-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
@media(max-width:620px){.t03{padding:5px}.t03-shell{width:min(100%,480px);padding:5px;min-height:calc(94dvh - 10px)}.t03-step-nav{gap:2px;padding:5px 2px 8px}.t03-step{padding:5px 2px 7px}.t03-step-label{font-size:8px;letter-spacing:-.02em}.t03-screen{height:min(82vh,720px);min-height:490px}.t03-cover{padding:26px 12px 12px}.t03-cover-arch{inset:18px}.t03-cover-corner{font-size:15px}.t03-cover-corner.top-left,.t03-cover-corner.bottom-left{left:12px}.t03-cover-corner.top-right,.t03-cover-corner.bottom-right{right:12px}.t03-hero-title{font-size:clamp(36px,11vw,54px)}.t03-paper{padding:22px 12px 13px}.t03-invite-options{gap:7px}.t03-invite-option{min-height:96px}.t03-wording{padding:15px 13px 5px;font-size:14px}.t03-couple-grid{grid-template-columns:1fr 18px 1fr;gap:2px}.t03-portrait{width:clamp(88px,28vw,118px);height:clamp(88px,28vw,118px)}.t03-person h3{font-size:clamp(14px,4vw,19px)}.t03-ampersand{font-size:22px}.t03-couple-flourish .t03-wedding-emblem{height:85px}.t03-programme-screen{padding:20px 8px 12px}.t03-event-group{grid-template-columns:minmax(70px,25%) minmax(0,1fr);grid-template-rows:repeat(var(--event-count),minmax(44px,auto));gap:5px}.t03-event-group:before{left:calc(25% + 2px)}.t03-event-group>h3{padding:5px;font-size:10px}.t03-event-card{grid-template-columns:30px minmax(0,1fr) 7px;gap:5px;padding:5px 4px}.t03-event-portrait{width:28px;height:28px}.t03-event-copy h3{font-size:12px}.t03-event-copy p{font-size:9px}.t03-event-copy small{font-size:8px}.t03-actions-screen{height:min(82vh,720px);padding:14px 8px 8px}.t03-actions-screen h2{font-size:27px}.t03-action-intro{font-size:12px}.t03-countdown{gap:5px}.t03-countdown b{font-size:22px}.t03-countdown small{font-size:8px}.t03-action-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.t03-action-card{min-height:100px;padding:5px 4px}.t03-action-icon{font-size:19px}.t03-action-card h3{font-size:12px;line-height:1}.t03-action-card p{font-size:9px;line-height:1.12}.t03-small-button{min-height:22px;padding:3px 4px;font-size:9px}.t03-emblem-card .t03-wedding-emblem{height:72px}.t03-closing{margin-top:4px}.t03-closing p{font-size:14px}.t03-closing .bengali{font-size:15px}.t03-actions-screen .t03-screen-actions{padding-top:4px}}
@media(max-width:370px){.t03-step-label{font-size:7px}.t03-step{padding-inline:1px}.t03-cover-copy{font-size:15px}.t03-action-card{min-height:96px}.t03-action-card p{font-size:9px}.t03-countdown b{font-size:19px}}
@media(max-height:680px){.t03{padding:4px}.t03-shell{min-height:calc(100dvh - 8px)}.t03-screen{height:calc(100dvh - 80px);min-height:465px}.t03-cover{padding-top:20px}.t03-ganesh{font-size:27px;margin-bottom:3px}.t03-hero-title{font-size:42px}.t03-gold-rule{margin:8px auto}.t03-cover-copy{font-size:15px}.t03-cover-couple{margin-top:7px}.t03-actions-screen{padding-top:15px}.t03-action-card{min-height:92px}.t03-countdown b{font-size:20px}}
@media(prefers-reduced-motion:reduce){.t03 *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
@media print{.t03{position:relative!important;inset:auto!important;overflow:visible!important;padding:0!important}.t03-shell{width:100%!important;min-height:0!important;padding:0!important}.t03-step-nav,.t03-screen-actions{display:none!important}.t03-screen,.t03-screen.active,.t03-actions-screen{display:flex!important;position:relative!important;width:100%!important;height:100vh!important;min-height:100vh!important;overflow:visible!important;break-after:page}.t03-cover,.t03-actions-screen{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
<div class="t03" style="--t03-wine:${esc(colors.deep)};--t03-red:${esc(colors.red)};--t03-gold:${esc(colors.gold)};--t03-cream:${esc(colors.cream)};--t03-paper:${esc(colors.paper)};--t03-ink:${esc(colors.ink)}">
  <main class="t03-shell">
    <nav class="t03-step-nav" aria-label="Invitation sections">
      ${STEP_NAMES.map((step, index) => `<button class="t03-step${index === 0 ? ' active' : ''}" type="button" data-step="${index}" aria-label="Go to ${step}" aria-current="${index === 0 ? 'step' : 'false'}" style="--progress:${index === 0 ? '100%' : '0%'}"><span class="t03-step-label"><span>${index + 1}. ${esc(STEP_LABELS[index])}</span><span>${index + 1}/5</span></span><span class="t03-step-line"><span class="t03-step-progress"></span></span></button>`).join('')}
    </nav>
    ${screens.join('')}
  </main>
</div>`;
}

export function mount(root, { guest, wedding = {} } = {}) {
  const screens = [...root.querySelectorAll('[data-screen]')];
  const steps = [...root.querySelectorAll('.t03-step')];
  if (!screens.length || !steps.length) return;
  root.style.touchAction = 'pan-y';
  document.body.style.touchAction = 'pan-y';
  document.documentElement.style.touchAction = 'pan-y';
  let currentStep = 0;
  let scratchInitialized = false;
  let toast = null;

  const goToStep = requested => {
    currentStep = Math.max(0, Math.min(screens.length - 1, requested));
    screens.forEach((screen, index) => screen.classList.toggle('active', index === currentStep));
    steps.forEach((button, index) => {
      const active = index === currentStep;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
      button.style.setProperty('--progress', active ? '100%' : index < currentStep ? '100%' : '0%');
    });
    if (currentStep === 4 && !scratchInitialized) {
      const canvas = root.querySelector('#t03-scratch');
      initializeScratch(canvas, () => { canvas.style.pointerEvents = 'none'; });
      scratchInitialized = canvas?.dataset.initialized === 'true';
    }
  };

  root.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => goToStep(currentStep + 1)));
  root.querySelectorAll('[data-prev]').forEach(button => button.addEventListener('click', () => goToStep(currentStep - 1)));
  root.querySelectorAll('[data-restart]').forEach(button => button.addEventListener('click', () => goToStep(0)));
  steps.forEach(button => button.addEventListener('click', () => goToStep(Number(button.dataset.step))));
  root.querySelectorAll('.t03-invite-option').forEach(button => button.addEventListener('click', () => {
    const family = button.dataset.type === 'family';
    root.querySelectorAll('.t03-invite-option').forEach(option => {
      const selected = option === button;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    const suffix = family && !/\bfamily\b/i.test(String(guest?.name || '')) ? ' Family' : '';
    const name = String(guest?.name || 'Respected Guest');
    const greeting = root.querySelector('.t03-guest-name');
    const salutation = root.querySelector('.t03-wording .salutation');
    const copy = root.querySelector('.t03-wording .invitation-copy');
    if (greeting) greeting.textContent = `${name}${suffix}`;
    if (salutation) salutation.textContent = `Dear ${name}${suffix},`;
    if (copy) copy.textContent = family ? copy.dataset.family : copy.dataset.single;
  }));

  const target = parseWhen(wedding.date, wedding.time);
  if (target !== null) {
    const countdown = () => {
      const remaining = Math.max(0, target - Date.now());
      const values = [
        Math.floor(remaining / 86400000),
        Math.floor(remaining % 86400000 / 3600000),
        Math.floor(remaining % 3600000 / 60000),
        Math.floor(remaining % 60000 / 1000)
      ];
      ['days', 'hours', 'minutes', 'seconds'].forEach((unit, index) => {
        const element = root.querySelector(`#t03-${unit}`);
        if (element) element.textContent = String(values[index]).padStart(2, '0');
      });
    };
    countdown();
    const timer = window.setInterval(() => {
      if (!root.isConnected) window.clearInterval(timer);
      else countdown();
    }, 1000);
  }

  const calendar = root.querySelector('#t03-calendar');
  if (calendar && target !== null) {
    const utcStamp = milliseconds => new Date(milliseconds).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const location = [wedding.venue, wedding.address].filter(Boolean).join(', ');
    const query = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Wedding of ${wedding.bride_name || 'Bride'} & ${wedding.groom_name || 'Groom'} — Shubho Bibaho`,
      dates: `${utcStamp(target)}/${utcStamp(target + 2 * 60 * 60 * 1000)}`,
      ctz: 'Asia/Kolkata',
      location,
      details: `We look forward to celebrating with ${guest?.name || 'you'}.`
    });
    calendar.href = `https://calendar.google.com/calendar/render?${query}`;
  }

  const whatsapp = root.querySelector('#t03-whatsapp');
  if (whatsapp) {
    const message = `Namaskar! I am ${guest?.name || 'your guest'}. Thank you for the wedding invitation. I would like to confirm my attendance for ${wedding.bride_name || 'the couple'} and ${wedding.groom_name || ''}'s wedding on ${formatDate(wedding.date) || 'the wedding day'}. Looking forward to joining the celebration.`;
    whatsapp.href = `https://wa.me/${String(wedding.rsvp_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }

  const scratch = root.querySelector('#t03-scratch');
  root.querySelector('#t03-reveal')?.addEventListener('click', () => revealScratch(scratch));
  root.querySelectorAll('.t03-portrait img').forEach(image => image.addEventListener('error', () => { image.hidden = true; }));
  window.addEventListener('resize', () => {
    if (currentStep === 4 && scratchInitialized && scratch?.style.pointerEvents !== 'none') initializeScratch(scratch, () => {});
  });
  goToStep(0);
}

function revealScratch(canvas) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.pointerEvents = 'none';
}

function initializeScratch(canvas, reveal) {
  if (!canvas || canvas.dataset.initialized === 'true') return;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const gradient = context.createLinearGradient(0, 0, bounds.width, bounds.height);
  gradient.addColorStop(0, '#f4d77d');
  gradient.addColorStop(.5, '#c18a2b');
  gradient.addColorStop(1, '#f7e8b0');
  context.fillStyle = gradient;
  context.fillRect(0, 0, bounds.width, bounds.height);
  context.strokeStyle = '#8d5b1a';
  context.strokeRect(4, 4, bounds.width - 8, bounds.height - 8);
  context.fillStyle = '#4a2118';
  context.font = '700 12px Georgia';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('✧ SCRATCH HERE ✧', bounds.width / 2, bounds.height / 2);
  context.globalCompositeOperation = 'destination-out';
  canvas.dataset.initialized = 'true';
  let scratching = false;
  const scratchAt = event => {
    if (!scratching) return;
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.arc(event.clientX - rect.left, event.clientY - rect.top, 15, 0, Math.PI * 2);
    context.fill();
    if (event.cancelable) event.preventDefault();
  };
  canvas.addEventListener('pointerdown', event => {
    scratching = true;
    canvas.setPointerCapture?.(event.pointerId);
    scratchAt(event);
  });
  canvas.addEventListener('pointermove', scratchAt);
  canvas.addEventListener('pointerup', () => { scratching = false; });
  canvas.addEventListener('pointercancel', () => { scratching = false; });
  canvas.addEventListener('lostpointercapture', () => { scratching = false; });
  canvas.addEventListener('pointerup', () => {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let index = 3; index < pixels.length; index += 48) {
      total += 1;
      if (pixels[index] < 30) clear += 1;
    }
    if (total && clear / total > .42) {
      revealScratch(canvas);
      if (typeof reveal === 'function') reveal();
    }
  });
}
