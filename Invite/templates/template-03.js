// TEMPLATE-03 · BENGALI RAJBARI — carved door entrance, garad-saree border, alpona & kalash, Bengali script, swipeable pages.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const ymd = s => String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const THEMES = {
  sindoor: {red:'#b3121f', red2:'#7d0b14', deep:'#3d040a', gold:'#c9962d', iv:'#fff6e3'},
  haldi:   {red:'#b45309', red2:'#7a3606', deep:'#3a1a03', gold:'#d4a017', iv:'#fffbe8'},
  maroon:  {red:'#7a1426', red2:'#4d0a18', deep:'#240510', gold:'#c9a24a', iv:'#fdf6e8'}
};
const fmtTime = t => { if (!t) return ''; const s = String(t).trim(); if (/T|1899-/.test(s)) { const d = new Date(s); if (!isNaN(d)) return d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true}).toUpperCase(); } return s.toUpperCase(); };
const dateIn = (d, loc) => { const m = ymd(d); if (!m) return String(d || ''); try { return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString(loc, {weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}); } catch { return String(d); } };
function parseWhen(dateStr, timeStr) {
  const FB = Date.now() + 30 * 864e5, m = ymd(dateStr); if (!m) { const p = Date.parse(`${dateStr} ${timeStr || ''}`); return isNaN(p) ? FB : p; }
  let hh = 19, mi = 0; const t = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (t) { hh = +t[1]; mi = +t[2]; const ap = (t[3] || '').toUpperCase(); if (ap === 'PM' && hh !== 12) hh += 12; if (ap === 'AM' && hh === 12) hh = 0; }
  const ts = new Date(`${m[1]}-${m[2]}-${m[3]}T${String(hh).padStart(2,'0')}:${String(mi).padStart(2,'0')}:00+05:30`).getTime(); return isNaN(ts) ? FB : ts;
}
const alp = c => `<svg class="al" viewBox="-50 -50 100 100" style="color:${c}" aria-hidden="true"><use href="#alp"/></svg>`;
const div = (w = 11) => `<svg viewBox="0 0 160 16" style="width:${w}em;height:${w / 10}em;display:block;margin:0 auto" aria-hidden="true"><use href="#dv"/></svg>`;
const kalash = h => `<svg viewBox="0 0 100 112" style="height:${h}em;display:block;margin:0 auto" aria-hidden="true">
 ${[-52,-26,0,26,52].map(a => `<path d="M50 58C41 42 43 22 50 6C57 22 59 42 50 58Z" fill="#2f6b3a" transform="rotate(${a} 50 58)"/>`).join('')}
 <circle cx="50" cy="36" r="12" fill="#8a5a2b"/><circle cx="46" cy="32" r="4" fill="#c9962d" opacity=".6"/>
 <rect x="38" y="56" width="24" height="8" rx="3" fill="var(--gold)"/>
 <path d="M32 64Q18 84 34 102Q50 110 66 102Q82 84 68 64Z" fill="var(--red)"/><path d="M26 82Q50 92 74 82" stroke="var(--gold)" stroke-width="3" fill="none"/>
 <circle cx="50" cy="94" r="5" fill="none" stroke="var(--gold)" stroke-width="1.5"/></svg>`;

export default function render({ guest, wedding: w, events = [] }) {
  const th = THEMES[String(w.theme || '').toLowerCase()] || THEMES.sindoor;
  const bride = esc(String(w.bride_name || '').trim()), groom = esc(String(w.groom_name || '').trim());
  const ini = ((String(w.bride_name || '?')[0]) + (String(w.groom_name || '?')[0])).toUpperCase();
  const gName = esc(guest?.name || 'Respected Guest'), persons = Math.max(1, +guest?.persons || 1);
  const contacts = lines(w.rsvp_contacts), map = safeUrl(w.map_url);
  const greet = `Dear ${gName}${guest?.with_family ? ' &amp; Family' : ''}`;
  const msg = (w.message && String(w.message).trim()) ? esc(w.message) : 'With the blessings of the Almighty and our elders, we joyfully invite you to bless the newly-weds with your presence.';
  const bn = dateIn(w.date, 'bn-IN'), en = dateIn(w.date, 'en-IN');
  const evs = events.map(e => { const m = ymd(e.event_date); return `<div class="ev"><div class="bg"><b>${m ? +m[3] : ''}</b><i>${m ? MON[+m[2] - 1] : ''}</i></div><div class="et"><b>${esc(e.event_name)}</b><span>${esc(fmtTime(e.event_time))}${e.note ? ' · ' + esc(e.note) : ''}</span></div></div>`; }).join('');
  const petals = [0,1,2,3,4,5,6,7].map(k => `<path d="M0-9C7-18 7-32 0-42C-7-32-7-18 0-9Z" transform="rotate(${k * 45})"/>`).join('');
  const inner = [0,1,2,3,4,5,6,7].map(k => `<path d="M0-8C4-13 4-20 0-26C-4-20-4-13 0-8Z" transform="rotate(${k * 45 + 22.5})"/>`).join('');
  const dots = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(k => `<circle cx="0" cy="-47" r="1.4" fill="currentColor" stroke="none" transform="rotate(${k * 22.5})"/>`).join('');
  const page = (inner_, i) => `<div class="pa"><article class="cd">${alp(th.gold).replace('class="al"', 'class="al c1"')}${alp(th.gold).replace('class="al"', 'class="al c2"')}${inner_}</article></div>`;

  return `<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,500;0,600;1,500&family=Playfair+Display:wght@600;700&family=Tiro+Bangla:ital@0;1&family=Cinzel:wght@600;700&display=swap" rel="stylesheet">
<style>
:root{--red:${th.red};--red2:${th.red2};--deep:${th.deep};--gold:${th.gold};--iv:${th.iv};--ink:#3a1a14}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.rj{position:absolute;inset:0;overflow:hidden;display:flex;justify-content:center;font-family:'Lora',Georgia,serif;color:var(--ink);
 background:radial-gradient(circle at 50% 20%,var(--red2),var(--deep) 75%)}
.rj:before{content:"";position:absolute;inset:0;opacity:.07;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Cg fill='none' stroke='%23fff'%3E%3Ccircle cx='35' cy='35' r='12'/%3E%3Cpath d='M35 5v60M5 35h60'/%3E%3C/g%3E%3C/svg%3E")}
.vp{position:relative;width:100%;max-width:430px;height:100%}
.pg{position:absolute;inset:0 0 3.4em;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;visibility:hidden}.pg::-webkit-scrollbar{display:none}.pg.on{visibility:visible}
.pa{flex:0 0 100%;scroll-snap-align:center;padding:max(8px,env(safe-area-inset-top)) 10px 4px;font-size:clamp(11px,min(2.1dvh,4.5vw),18px);line-height:1.4}
.cd{position:relative;height:100%;overflow:hidden;display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;text-align:center;padding:1.6em 1.5em;
 background:radial-gradient(circle at 50% 0,#fffdf7,var(--iv));border:.55em solid var(--red);border-radius:1.2em;
 box-shadow:inset 0 0 0 .16em var(--iv),inset 0 0 0 .3em var(--gold),inset 0 0 0 .8em var(--iv),inset 0 0 0 .9em var(--red2),0 18px 50px rgba(0,0,0,.55)}
.al{position:absolute;width:6.5em;height:6.5em;fill:none;stroke:currentColor;stroke-width:1.5;opacity:.28;pointer-events:none}.c1{top:-2.2em;left:-2.2em}.c2{bottom:-2.2em;right:-2.2em}
.bn{font-family:'Tiro Bangla','Noto Serif Bengali',serif;color:var(--red);line-height:1.25}.cap{font:700 .78em 'Cinzel',serif;letter-spacing:.2em;text-transform:uppercase;color:var(--red2)}
.sc{font-family:'Great Vibes',cursive;color:var(--red);line-height:1.1;font-weight:400}.nm{font:700 1em/1.2 'Playfair Display',serif;color:var(--red)}
.tx{font-weight:500;line-height:1.5}.it{font-style:italic}small{display:block;font-size:.86em;opacity:.85}
.nv{position:absolute;left:0;right:0;bottom:0;height:3.4em;display:flex;align-items:center;justify-content:center;gap:.9em;font-size:16px;visibility:hidden}.nv.on{visibility:visible}
.nv button{width:2.1em;height:2.1em;border-radius:50%;border:1px solid var(--gold);background:rgba(0,0,0,.25);color:#f4d896;font-size:1.1em;cursor:pointer}
.nv i{width:.6em;height:.6em;border-radius:50%;background:rgba(244,216,150,.35);transition:.3s;cursor:pointer}.nv i.on{width:1.8em;border-radius:.4em;background:var(--gold)}
.ev{display:flex;align-items:center;gap:.8em;width:100%;text-align:left;padding:.4em .6em;border-bottom:1px dashed rgba(201,150,45,.6)}.ev:last-child{border:0}
.bg{flex:0 0 3.6em;height:3.6em;border:1.5px solid var(--red);border-radius:.6em;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 .2em var(--iv),0 0 0 .3em var(--gold)}
.bg b{font:700 1.5em/1 'Playfair Display',serif;color:var(--red)}.bg i{font:700 .6em 'Cinzel',serif;letter-spacing:.1em;color:var(--red2);font-style:normal}
.et b{display:block;font:700 1.15em/1.2 'Playfair Display',serif;color:var(--red)}.et span{font-size:.88em;opacity:.85}.evs{width:100%;display:flex;flex-direction:column}
.cdn{display:flex;gap:.5em;width:100%;max-width:21em}.cdn div{flex:1;border:1px solid var(--gold);border-radius:.6em;background:#fff;padding:.45em 0}.cdn b{display:block;font:700 1.6em/1 'Playfair Display',serif;color:var(--red)}.cdn small{font:700 .6em 'Cinzel',serif;letter-spacing:.1em;margin-top:.2em}
.pills{width:100%;max-width:21em;display:flex;flex-direction:column;gap:.45em}.pill{padding:.75em 1em;border-radius:99px;font:700 .72em 'Cinzel',serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border:1px solid var(--gold);display:block}
.p1{background:var(--red);color:#fff}.p2{background:linear-gradient(135deg,#f0cf85,#c9962d);color:#3a0a10}
.dr{position:absolute;inset:0;z-index:40;overflow:hidden}.dr.go{pointer-events:none}.dr.gone{display:none}
.lf{position:absolute;top:0;bottom:0;width:50.2%;background:linear-gradient(90deg,#5a0a12,var(--red2) 50%,#5a0a12);transition:transform 1.2s cubic-bezier(.7,0,.2,1)}.lf.l{left:0}.lf.r{right:0}.dr.go .l{transform:translateX(-102%)}.dr.go .r{transform:translateX(102%)}
.lf:before{content:"";position:absolute;inset:3.2em .9em;border:2px solid var(--gold);border-radius:.8em;background:radial-gradient(circle,#e6c36a 0 1.6px,transparent 2.2px) 0 0/20px 20px;opacity:.8}
.lf:after{content:"";position:absolute;inset:4.6em 2.2em;border:1px solid rgba(244,216,150,.6);border-radius:.5em}
.dc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:max(2.2em,env(safe-area-inset-top)) 1em 2.4em;text-align:center;pointer-events:none;transition:opacity .5s;color:#f4d896;font-size:16px}.dr.go .dc{opacity:0}
.md{pointer-events:auto;position:absolute;top:50%;left:50%;width:7.4em;height:7.4em;margin:-3.7em;border-radius:50%;border:2px solid var(--gold);background:radial-gradient(circle,#7d0b14,#3d040a);color:#f4d896;cursor:pointer;box-shadow:0 0 0 .4em rgba(201,150,45,.35),0 10px 30px rgba(0,0,0,.6);font:700 2em 'Playfair Display',serif;transition:opacity .4s;animation:pl 2s ease-in-out infinite}.dr.go .md{opacity:0}
@keyframes pl{50%{box-shadow:0 0 0 .9em rgba(201,150,45,.12),0 10px 30px rgba(0,0,0,.6)}}
.aud{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:80;width:40px;height:40px;border-radius:50%;background:rgba(43,3,11,.9);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer}
.aud svg{width:17px;height:17px;fill:#f4d896}.aud.spin svg{animation:sp 5s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="alp" viewBox="-50 -50 100 100"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle r="5" fill="currentColor"/>${petals}${inner}${dots}</g></symbol>
<g id="dv"><path d="M6 8h58M96 8h58" stroke="var(--red)" stroke-width="1.2"/><path d="M80 1l5 7-5 7-5-7z" fill="var(--gold)"/><circle cx="68" cy="8" r="2" fill="var(--red)"/><circle cx="92" cy="8" r="2" fill="var(--red)"/></g></defs></svg>
<div class="rj">
 <button class="aud" id="aud" type="button" aria-label="Music"><svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg><audio id="au" preload="auto"><source src="${esc(w.music_url || 'invitation.mp3')}" type="audio/mpeg"></audio></button>
 <div class="vp">
  <div class="pg" id="pg">
${page(`${kalash(6.6)}
   <div class="bn" style="font-size:1.15em;color:var(--red2)">${esc(w.invocation || 'শ্রী শ্রী প্রজাপতয়ে নমঃ')}</div>
   <div><div class="bn" style="font-size:3.4em">${esc(w.ceremony_title || 'শুভ বিবাহ')}</div><div class="cap" style="margin-top:.2em">Shubho Bibaho</div></div>${div(12)}
   <div><div class="sc" style="font-size:3em">${bride}</div><div class="it tx" style="color:var(--red)">weds</div><div class="sc" style="font-size:3em">${groom}</div></div>
   <div><div class="nm it" style="font-size:1.35em">${greet}</div><div class="cap" style="margin-top:.5em;font-size:.65em">Swipe to read →</div></div>`)}
${page(`<div class="cap">With the blessings of</div>
   <div><div class="nm" style="font-size:1.45em">${esc(w.host_name || '')}</div><div class="it tx" style="font-size:1.05em;margin-top:.4em">${msg}</div></div>${div(10)}
   <div><div class="nm" style="font-size:1.9em">${esc(w.bride_full || w.bride_name || '')}</div><small>${esc(w.bride_parents || '')}</small>
    <div class="sc" style="font-size:2.4em">&amp;</div>
    <div class="nm" style="font-size:1.9em">${esc(w.groom_full || w.groom_name || '')}</div><small>${esc(w.groom_parents || '')}</small></div>${div(10)}
   <div>${bn ? `<div class="bn" style="font-size:1.45em">${esc(bn)}</div>` : ''}<div class="nm" style="font-size:1.1em;margin-top:.2em">${esc(en)}</div><div class="tx" style="font-weight:600">${esc(fmtTime(w.time))}</div>
    ${persons > 1 ? `<div class="cap" style="margin-top:.6em;font-size:.68em">Invitation for ${persons} guests</div>` : ''}</div>`)}
${page(`<div><div class="bn" style="font-size:2em">অনুষ্ঠান সূচি</div><div class="cap">Programme</div></div><div class="evs">${evs}</div>${div(10)}`)}
${page(`<div><div class="bn" style="font-size:1.6em">স্থান</div><div class="nm" style="font-size:1.55em">${esc(w.venue || '')}</div><div class="tx" style="font-size:.98em">${esc(w.address || '')}</div></div>
   <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:.4em"><div class="cap" style="font-size:.66em">✦ The auspicious moment arrives in ✦</div>
    <div class="cdn"><div><b id="d">00</b><small>Days</small></div><div><b id="h">00</b><small>Hours</small></div><div><b id="m">00</b><small>Mins</small></div><div><b id="s">00</b><small>Secs</small></div></div></div>
   <div><div class="cap" style="font-size:.7em">R.S.V.P.</div>${contacts.map(c => `<div class="tx" style="font-weight:600">${esc(c)}</div>`).join('')}</div>
   <div class="pills">${map ? `<a class="pill p2" href="${map}" target="_blank" rel="noopener noreferrer">📍 View Location</a>` : ''}<a class="pill p1" id="cal" href="#" target="_blank" rel="noopener noreferrer">📅 Save The Date</a><a class="pill p2" id="wa" href="#" target="_blank" rel="noopener noreferrer">💬 RSVP on WhatsApp</a></div>
   <div><div class="sc" style="font-size:2.2em">With Love &amp; Blessings</div><div class="nm" style="font-size:1.1em">${esc(w.footer_text || '')}</div></div>`)}
  </div>
  <div class="nv" id="nv"><button id="pv" type="button" aria-label="Previous">‹</button><i class="on"></i><i></i><i></i><i></i><button id="nx" type="button" aria-label="Next">›</button></div>
  <div class="dr" id="dr"><div class="lf l"></div><div class="lf r"></div>
   <div class="dc"><div style="font-family:'Tiro Bangla',serif;font-size:1.3em">${esc(w.invocation || 'শ্রী শ্রী প্রজাপতয়ে নমঃ')}</div>
    <div style="font:700 .7em 'Cinzel',serif;letter-spacing:.25em">TAP THE EMBLEM TO ENTER</div></div>
   <button class="md" id="md" type="button" aria-label="Open invitation">${esc(ini)}</button></div>
 </div>
</div>`;
}

export function mount(root, { guest, wedding: w }) {
  const $ = s => root.querySelector(s), pg = $('#pg'), nv = $('#nv'), dots = [...nv.querySelectorAll('i')], au = $('#au'), ab = $('#aud'), dr = $('#dr');
  const to = n => pg.scrollTo({left: Math.max(0, Math.min(3, n)) * pg.clientWidth, behavior: 'smooth'});
  let played = false;
  $('#md').onclick = () => { dr.classList.add('go'); pg.classList.add('on'); nv.classList.add('on'); setTimeout(() => dr.classList.add('gone'), 1300);
    if (au && !played) { played = true; au.play().then(() => ab.classList.add('spin')).catch(() => {}); } };
  if (au) { au.addEventListener('ended', () => ab.classList.remove('spin')); ab.onclick = () => au.paused ? au.play().then(() => ab.classList.add('spin')).catch(() => {}) : (au.pause(), ab.classList.remove('spin')); }
  pg.addEventListener('scroll', () => { const i = Math.round(pg.scrollLeft / pg.clientWidth); dots.forEach((d, j) => d.classList.toggle('on', j === i)); }, {passive: true});
  dots.forEach((d, j) => d.onclick = () => to(j)); $('#pv').onclick = () => to(Math.round(pg.scrollLeft / pg.clientWidth) - 1); $('#nx').onclick = () => to(Math.round(pg.scrollLeft / pg.clientWidth) + 1);
  const t = parseWhen(w.date, w.time), E = ['d','h','m','s'].map(i => $('#' + i)), pad = n => String(n).padStart(2, '0');
  const tick = () => { const ms = Math.max(0, t - Date.now()), v = [Math.floor(ms / 864e5), Math.floor(ms % 864e5 / 36e5), Math.floor(ms % 36e5 / 6e4), Math.floor(ms % 6e4 / 1e3)]; E.forEach((el, i) => el && (el.textContent = pad(v[i]))); };
  tick(); const iv = setInterval(() => root.isConnected ? tick() : clearInterval(iv), 1000);
  const cal = $('#cal'); if (cal) { const st = ms => new Date(ms).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding: ${w.bride_name} & ${w.groom_name}`)}&dates=${st(t)}/${st(t + 108e5)}&location=${encodeURIComponent(`${w.venue || ''}, ${w.address || ''}`)}`; }
  const wa = $('#wa'); if (wa) wa.href = `https://wa.me/${String(w.rsvp_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Nomoshkar, I will be attending the wedding of ${w.bride_name} & ${w.groom_name}. Guest: ${guest?.name || ''}`)}`;
}
