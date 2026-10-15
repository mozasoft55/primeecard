// TEMPLATE-04 · HINDU ROYAL — scratch-card reveal, mandala corners, diya ornament,
// Devanagari script, countdown, location share, add-to-calendar, swipeable pages.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const ymd = s => String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const THEMES = {
  royal:   {red:'#9c1d1d', red2:'#6b0f0f', deep:'#300606', gold:'#d4af37', iv:'#fff8e6'},
  peacock: {red:'#0f6b5c', red2:'#0a4a40', deep:'#042420', gold:'#d8b34a', iv:'#fbf6e3'},
  rani:    {red:'#a81259', red2:'#6e0d3a', deep:'#33041a', gold:'#d9a949', iv:'#fff5ea'}
};
const fmtTime = t => { if (!t) return ''; const s = String(t).trim(); if (/T|1899-/.test(s)) { const d = new Date(s); if (!isNaN(d)) return d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true}).toUpperCase(); } return s.toUpperCase(); };
const dateIn = (d, loc) => { const m = ymd(d); if (!m) return String(d || ''); try { return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString(loc, {weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}); } catch { return String(d); } };
function parseWhen(dateStr, timeStr) {
  const FB = Date.now() + 30 * 864e5, m = ymd(dateStr); if (!m) { const p = Date.parse(`${dateStr} ${timeStr || ''}`); return isNaN(p) ? FB : p; }
  let hh = 19, mi = 0; const t = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (t) { hh = +t[1]; mi = +t[2]; const ap = (t[3] || '').toUpperCase(); if (ap === 'PM' && hh !== 12) hh += 12; if (ap === 'AM' && hh === 12) hh = 0; }
  const ts = new Date(`${m[1]}-${m[2]}-${m[3]}T${String(hh).padStart(2,'0')}:${String(mi).padStart(2,'0')}:00+05:30`).getTime(); return isNaN(ts) ? FB : ts;
}
const mandala = c => `<svg class="al" viewBox="-50 -50 100 100" style="color:${c}" aria-hidden="true"><use href="#mnd"/></svg>`;
const div = (w = 11) => `<svg viewBox="0 0 160 16" style="width:${w}em;height:${w / 10}em;display:block;margin:0 auto" aria-hidden="true"><use href="#dv4"/></svg>`;
const diya = h => `<svg viewBox="0 0 100 90" style="height:${h}em;display:block;margin:0 auto" aria-hidden="true">
 <path d="M50 30C45 18 50 8 50 2C50 8 55 18 50 30Z" fill="#ffb13d"/>
 <ellipse cx="50" cy="31" rx="5.5" ry="8" fill="#ff7a1a" opacity=".75"/>
 <path d="M6 55C6 46 26 42 50 42C74 42 94 46 94 55C94 67 74 74 50 74C26 74 6 67 6 55Z" fill="var(--red)"/>
 <path d="M50 42C64 42 94 46 94 55C94 56.5 91 58.5 86 60C78 50 64 46 50 46C36 46 22 50 14 60C9 58.5 6 56.5 6 55C6 46 36 42 50 42Z" fill="var(--gold)" opacity=".9"/>
 <ellipse cx="50" cy="55" rx="32" ry="9.5" fill="none" stroke="var(--gold)" stroke-width="1.5"/>
 <circle cx="18" cy="55" r="2.1" fill="var(--iv)"/><circle cx="82" cy="55" r="2.1" fill="var(--iv)"/><circle cx="50" cy="63" r="2.1" fill="var(--iv)"/></svg>`;

export default function render({ guest, wedding: w, events = [] }) {
  const th = THEMES[String(w.theme || '').toLowerCase()] || THEMES.royal;
  const bride = esc(String(w.bride_name || '').trim()), groom = esc(String(w.groom_name || '').trim());
  const ini = ((String(w.bride_name || '?')[0]) + (String(w.groom_name || '?')[0])).toUpperCase();
  const gName = esc(guest?.name || 'Respected Guest'), persons = Math.max(1, +guest?.persons || 1);
  const contacts = lines(w.rsvp_contacts), map = safeUrl(w.map_url);
  const greet = `Dear ${gName}${guest?.with_family ? ' &amp; Family' : ''}`;
  const msg = (w.message && String(w.message).trim()) ? esc(w.message) : 'With the divine blessings of our elders and the grace of the Almighty, we joyfully invite you to be a part of this sacred union.';
  const hi = dateIn(w.date, 'hi-IN'), en = dateIn(w.date, 'en-IN');
  const evs = events.map(e => { const m = ymd(e.event_date); return `<div class="ev"><div class="bg"><b>${m ? +m[3] : ''}</b><i>${m ? MON[+m[2] - 1] : ''}</i></div><div class="et"><b>${esc(e.event_name)}</b><span>${esc(fmtTime(e.event_time))}${e.note ? ' · ' + esc(e.note) : ''}</span></div></div>`; }).join('');
  const petals = [0,1,2,3,4,5,6,7].map(k => `<path d="M0-9C7-18 7-32 0-42C-7-32-7-18 0-9Z" transform="rotate(${k * 45})"/>`).join('');
  const inner = [0,1,2,3,4,5,6,7].map(k => `<path d="M0-8C4-13 4-20 0-26C-4-20-4-13 0-8Z" transform="rotate(${k * 45 + 22.5})"/>`).join('');
  const dots = Array.from({length:16}, (_, k) => `<circle cx="0" cy="-47" r="1.4" fill="currentColor" stroke="none" transform="rotate(${k * 22.5})"/>`).join('');
  const page = inner_ => `<div class="pa"><article class="cd">${mandala(th.gold).replace('class="al"', 'class="al c1"')}${mandala(th.gold).replace('class="al"', 'class="al c2"')}${inner_}</article></div>`;

  return `<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,500;0,600;1,500&family=Playfair+Display:wght@600;700&family=Tiro+Devanagari+Hindi&family=Cinzel:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--red:${th.red};--red2:${th.red2};--deep:${th.deep};--gold:${th.gold};--iv:${th.iv};--ink:#3a1a14}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.hr{position:absolute;inset:0;overflow:hidden;display:flex;justify-content:center;font-family:'Lora',Georgia,serif;color:var(--ink);
 background:radial-gradient(circle at 50% 18%,var(--red2),var(--deep) 78%)}
.hr:before{content:"";position:absolute;inset:0;opacity:.07;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cg fill='none' stroke='%23fff'%3E%3Ccircle cx='36' cy='36' r='13'/%3E%3Cpath d='M36 4v64M4 36h64'/%3E%3Ccircle cx='36' cy='36' r='26' stroke-dasharray='1 5'/%3E%3C/g%3E%3C/svg%3E")}
.vp{position:relative;width:100%;max-width:430px;height:100%}
.pg{position:absolute;inset:0 0 3.4em;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;visibility:hidden;opacity:0;transition:opacity .7s ease .1s}.pg::-webkit-scrollbar{display:none}.pg.on{visibility:visible;opacity:1}
.pa{flex:0 0 100%;scroll-snap-align:center;padding:max(8px,env(safe-area-inset-top)) 10px 4px;font-size:clamp(11px,min(2.1dvh,4.5vw),18px);line-height:1.4}
.cd{position:relative;height:100%;overflow:hidden;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;text-align:center;padding:1.6em 1.5em;
 background:radial-gradient(circle at 50% 0,#fffdf7,var(--iv));border:.55em solid var(--red);border-radius:1.2em;
 box-shadow:inset 0 0 0 .16em var(--iv),inset 0 0 0 .3em var(--gold),inset 0 0 0 .8em var(--iv),inset 0 0 0 .9em var(--red2),0 18px 50px rgba(0,0,0,.55)}
.al{position:absolute;width:6.5em;height:6.5em;fill:none;stroke:currentColor;stroke-width:1.5;opacity:.28;pointer-events:none}.c1{top:-2.2em;left:-2.2em}.c2{bottom:-2.2em;right:-2.2em;transform:rotate(180deg)}
.bn{font-family:'Tiro Devanagari Hindi','Noto Serif Devanagari',serif;color:var(--red);line-height:1.3}.cap{font:700 .78em 'Cinzel',serif;letter-spacing:.2em;text-transform:uppercase;color:var(--red2)}
.sc{font-family:'Great Vibes',cursive;color:var(--red);line-height:1.1;font-weight:400}.nm{font:700 1em/1.2 'Playfair Display',serif;color:var(--red)}
.tx{font-weight:500;line-height:1.5}.it{font-style:italic}small{display:block;font-size:.86em;opacity:.85}
.nv{position:absolute;left:0;right:0;bottom:0;height:3.4em;display:flex;align-items:center;justify-content:center;gap:.9em;font-size:16px;visibility:hidden;opacity:0;transition:opacity .7s ease .2s}.nv.on{visibility:visible;opacity:1}
.nv button{width:2.1em;height:2.1em;border-radius:50%;border:1px solid var(--gold);background:rgba(0,0,0,.25);color:#f4d896;font-size:1.1em;cursor:pointer}
.nv i{width:.6em;height:.6em;border-radius:50%;background:rgba(244,216,150,.35);transition:.3s;cursor:pointer}.nv i.on{width:1.8em;border-radius:.4em;background:var(--gold)}
.ev{display:flex;align-items:center;gap:.8em;width:100%;text-align:left;padding:.4em .6em;border-bottom:1px dashed rgba(201,150,45,.6)}.ev:last-child{border:0}
.bg{flex:0 0 3.6em;height:3.6em;border:1.5px solid var(--red);border-radius:.6em;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 .2em var(--iv),0 0 0 .3em var(--gold)}
.bg b{font:700 1.5em/1 'Playfair Display',serif;color:var(--red)}.bg i{font:700 .6em 'Cinzel',serif;letter-spacing:.1em;color:var(--red2);font-style:normal}
.et b{display:block;font:700 1.15em/1.2 'Playfair Display',serif;color:var(--red)}.et span{font-size:.88em;opacity:.85}.evs{width:100%;display:flex;flex-direction:column}
.cdn{display:flex;gap:.5em;width:100%;max-width:21em}.cdn div{flex:1;border:1px solid var(--gold);border-radius:.6em;background:#fff;padding:.45em 0}.cdn b{display:block;font:700 1.6em/1 'Playfair Display',serif;color:var(--red)}.cdn small{font:700 .6em 'Cinzel',serif;letter-spacing:.1em;margin-top:.2em}
.pills{width:100%;max-width:21em;display:flex;flex-direction:column;gap:.45em}.pill{padding:.75em 1em;border-radius:99px;font:700 .72em 'Cinzel',serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border:1px solid var(--gold);display:block;cursor:pointer}
.p1{background:var(--red);color:#fff}.p2{background:linear-gradient(135deg,#f0cf85,#c9962d);color:#3a0a10}
.aud{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:80;width:40px;height:40px;border-radius:50%;background:rgba(43,3,11,.9);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer}
.aud svg{width:17px;height:17px;fill:#f4d896}.aud.spin svg{animation:sp 5s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.sv{position:absolute;inset:0;z-index:40;touch-action:none;cursor:grab;transition:opacity .85s ease,transform .85s cubic-bezier(.6,0,.2,1)}
.sv.go{opacity:0;transform:scale(1.14)}.sv.gone{display:none}
.sv canvas{display:block;width:100%;height:100%;border-radius:1.2em}
.sc-cap{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="mnd" viewBox="-50 -50 100 100"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle r="4" fill="currentColor"/>${petals}${inner}${dots}<circle r="44" stroke-dasharray="1.5 4.5"/></g></symbol>
<g id="dv4"><path d="M6 8h58M96 8h58" stroke="var(--red)" stroke-width="1.2"/><path d="M80 1l5 7-5 7-5-7z" fill="var(--gold)"/><circle cx="68" cy="8" r="2" fill="var(--red)"/><circle cx="92" cy="8" r="2" fill="var(--red)"/></g></defs></svg>
<div class="hr">
 <button class="aud" id="aud" type="button" aria-label="Music"><svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg><audio id="au" preload="auto"><source src="${esc(w.music_url || 'invitation.mp3')}" type="audio/mpeg"></audio></button>
 <div class="vp">
  <div class="pg" id="pg">
${page(`${diya(6.4)}
   <div class="bn" style="font-size:1.1em;color:var(--red2)">${esc(w.invocation || 'ॐ श्री गणेशाय नमः')}</div>
   <div><div class="bn" style="font-size:2.9em">${esc(w.ceremony_title || 'शुभ विवाह')}</div><div class="cap" style="margin-top:.2em">Wedding Invitation</div></div>${div(12)}
   <div><div class="sc" style="font-size:3em">${bride}</div><div class="it tx" style="color:var(--red)">weds</div><div class="sc" style="font-size:3em">${groom}</div></div>
   <div><div class="nm it" style="font-size:1.35em">${greet}</div><div class="cap" style="margin-top:.5em;font-size:.65em">Swipe to read →</div></div>`)}
${page(`<div class="cap">With the blessings of</div>
   <div><div class="nm" style="font-size:1.45em">${esc(w.host_name || '')}</div><div class="it tx" style="font-size:1.05em;margin-top:.4em">${msg}</div></div>${div(10)}
   <div><div class="nm" style="font-size:1.9em">${esc(w.bride_full || w.bride_name || '')}</div><small>${esc(w.bride_parents || '')}</small>
    <div class="sc" style="font-size:2.4em">&amp;</div>
    <div class="nm" style="font-size:1.9em">${esc(w.groom_full || w.groom_name || '')}</div><small>${esc(w.groom_parents || '')}</small></div>${div(10)}
   <div>${hi ? `<div class="bn" style="font-size:1.3em">${esc(hi)}</div>` : ''}<div class="nm" style="font-size:1.1em;margin-top:.2em">${esc(en)}</div><div class="tx" style="font-weight:600">${esc(fmtTime(w.time))}</div>
    ${persons > 1 ? `<div class="cap" style="margin-top:.6em;font-size:.68em">Invitation for ${persons} guests</div>` : ''}</div>`)}
${page(`<div><div class="bn" style="font-size:1.8em">विवाह कार्यक्रम</div><div class="cap">Programme</div></div><div class="evs">${evs}</div>${div(10)}`)}
${page(`<div><div class="bn" style="font-size:1.45em">स्थान</div><div class="nm" style="font-size:1.55em">${esc(w.venue || '')}</div><div class="tx" style="font-size:.98em">${esc(w.address || '')}</div></div>
   <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:.4em"><div class="cap" style="font-size:.66em">✦ शुभ मुहूर्त में शेष समय ✦</div>
    <div class="cdn"><div><b id="d">00</b><small>Days</small></div><div><b id="h">00</b><small>Hours</small></div><div><b id="m">00</b><small>Mins</small></div><div><b id="s">00</b><small>Secs</small></div></div></div>
   <div><div class="cap" style="font-size:.7em">R.S.V.P.</div>${contacts.map(c => `<div class="tx" style="font-weight:600">${esc(c)}</div>`).join('')}</div>
   <div class="pills">${map ? `<button class="pill p2" id="loc" type="button" data-url="${map}">📍 Share Location</button>` : ''}<a class="pill p1" id="cal" href="#" target="_blank" rel="noopener noreferrer">📅 Save The Date</a><a class="pill p2" id="wa" href="#" target="_blank" rel="noopener noreferrer">💬 RSVP on WhatsApp</a></div>
   <div><div class="sc" style="font-size:2.2em">With Love &amp; Blessings</div><div class="nm" style="font-size:1.1em">${esc(w.footer_text || '')}</div></div>`)}
  </div>
  <div class="nv" id="nv"><button id="pv" type="button" aria-label="Previous">‹</button><i class="on"></i><i></i><i></i><i></i><button id="nx" type="button" aria-label="Next">›</button></div>
  <div class="sv" id="sv" role="button" tabindex="0" aria-label="Scratch the golden card to reveal your invitation">
   <canvas id="scv"></canvas>
   <div class="sc-cap">Scratch, or tap, to reveal your invitation</div>
  </div>
 </div>
</div>`;
}

export function mount(root, { guest, wedding: w }) {
  const $ = s => root.querySelector(s), pg = $('#pg'), nv = $('#nv'), dots = [...nv.querySelectorAll('i')], au = $('#au'), ab = $('#aud');
  const sv = $('#sv'), cv = $('#scv');
  const to = n => pg.scrollTo({left: Math.max(0, Math.min(3, n)) * pg.clientWidth, behavior: 'smooth'});
  let played = false;
  const playMusic = () => { if (au && !played) { played = true; au.play().then(() => ab.classList.add('spin')).catch(() => {}); } };
  if (au) { au.addEventListener('ended', () => ab.classList.remove('spin')); ab.onclick = () => au.paused ? au.play().then(() => ab.classList.add('spin')).catch(() => {}) : (au.pause(), ab.classList.remove('spin')); }

  pg.addEventListener('scroll', () => { const i = Math.round(pg.scrollLeft / pg.clientWidth); dots.forEach((d, j) => d.classList.toggle('on', j === i)); }, {passive: true});
  dots.forEach((d, j) => d.onclick = () => to(j));
  $('#pv').onclick = () => to(Math.round(pg.scrollLeft / pg.clientWidth) - 1);
  $('#nx').onclick = () => to(Math.round(pg.scrollLeft / pg.clientWidth) + 1);

  // countdown to the wedding moment
  const t = parseWhen(w.date, w.time), E = ['d','h','m','s'].map(i => $('#' + i)), pad = n => String(n).padStart(2, '0');
  const tick = () => { const ms = Math.max(0, t - Date.now()), v = [Math.floor(ms / 864e5), Math.floor(ms % 864e5 / 36e5), Math.floor(ms % 36e5 / 6e4), Math.floor(ms % 6e4 / 1e3)]; E.forEach((el, i) => el && (el.textContent = pad(v[i]))); };
  tick(); const iv = setInterval(() => root.isConnected ? tick() : clearInterval(iv), 1000);

  // add to calendar
  const cal = $('#cal'); if (cal) { const st = ms => new Date(ms).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding: ${w.bride_name} & ${w.groom_name}`)}&dates=${st(t)}/${st(t + 108e5)}&location=${encodeURIComponent(`${w.venue || ''}, ${w.address || ''}`)}`; }

  // whatsapp rsvp
  const wa = $('#wa'); if (wa) wa.href = `https://wa.me/${String(w.rsvp_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste, I will be attending the wedding of ${w.bride_name} & ${w.groom_name}. Guest: ${guest?.name || ''}`)}`;

  // location share — uses the native share sheet where available, else opens the map
  const loc = $('#loc'); if (loc) loc.onclick = async () => {
    const url = loc.dataset.url;
    if (navigator.share) { try { await navigator.share({title: `${w.bride_name} & ${w.groom_name} — Wedding Venue`, text: w.venue || '', url}); return; } catch (e) {} }
    window.open(url, '_blank', 'noopener');
  };

  // ---- scratch card reveal ----
  if (sv && cv) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;
    const sampleCv = document.createElement('canvas'); sampleCv.width = 42; sampleCv.height = 60;
    const sctx = sampleCv.getContext('2d');

    function paintFoil() {
      W = sv.clientWidth; H = sv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#f3d98a'); g.addColorStop(.5, '#caa23c'); g.addColorStop(1, '#f3d98a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = .15;
      for (let y = 0; y < H; y += 26) for (let x = 0; x < W; x += 26) { ctx.beginPath(); ctx.arc(x + 13, y + 13, 3, 0, Math.PI * 2); ctx.fillStyle = '#7a1414'; ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#5a0f10'; ctx.textAlign = 'center';
      ctx.font = `700 ${Math.round(W * .09)}px Cinzel, serif`;
      ctx.fillText('✦', W / 2, H * .4);
      ctx.font = `700 ${Math.round(W * .062)}px Cinzel, serif`;
      ctx.fillText('SCRATCH HERE', W / 2, H * .48);
      ctx.font = `400 ${Math.round(W * .05)}px 'Tiro Devanagari Hindi', serif`;
      ctx.fillText('कार्ड खुरचें', W / 2, H * .55);
      sctx.clearRect(0, 0, 42, 60); sctx.drawImage(cv, 0, 0, 42, 60);
    }
    paintFoil();
    window.addEventListener('resize', paintFoil);

    let drawing = false, moved = false, startX = 0, startY = 0, startT = 0, lastX = 0, lastY = 0, done = false, raf = null;
    function erase(x, y) { ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, Math.max(18, W * .055), 0, Math.PI * 2); ctx.fill(); }
    function eraseLine(x0, y0, x1, y1) { const d = Math.hypot(x1 - x0, y1 - y0), steps = Math.max(1, Math.ceil(d / 6)); for (let i = 0; i <= steps; i++) erase(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); }
    function checkPercent() {
      if (done) return;
      sctx.clearRect(0, 0, 42, 60); sctx.drawImage(cv, 0, 0, 42, 60);
      const d = sctx.getImageData(0, 0, 42, 60).data; let clear = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 60) clear++;
      if (clear / (42 * 60) > .42) finish();
    }
    function finish() {
      if (done) return; done = true;
      playMusic();
      pg.classList.add('on');
      nv.classList.add('on');
      sv.classList.add('go');
      setTimeout(() => sv.classList.add('gone'), 850);
    }
    function pos(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

    sv.addEventListener('pointerdown', e => {
      if (done) return; drawing = true; moved = false; startT = Date.now();
      const [x, y] = pos(e); startX = lastX = x; startY = lastY = y; erase(x, y);
      sv.setPointerCapture?.(e.pointerId);
    });
    sv.addEventListener('pointermove', e => {
      if (!drawing || done) return;
      const [x, y] = pos(e);
      if (Math.hypot(x - startX, y - startY) > 6) moved = true;
      eraseLine(lastX, lastY, x, y); lastX = x; lastY = y;
      if (!raf) raf = requestAnimationFrame(() => { checkPercent(); raf = null; });
    });
    const endDrag = () => {
      if (!drawing || done) return; drawing = false;
      if (!moved && (Date.now() - startT) < 320) finish(); // a quick tap also opens the card
    };
    sv.addEventListener('pointerup', endDrag);
    sv.addEventListener('pointercancel', endDrag);
    sv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } });
  }
}
