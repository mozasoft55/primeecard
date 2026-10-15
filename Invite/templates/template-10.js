const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const fmtDate = v => String(v || '').trim() || 'Date to be announced';
const fmtTime = v => String(v || '').trim() || 'Time to be announced';

export default function render({ guest, wedding: w, events = [] }) {
  const bride = esc(w.bride_name || 'Bride');
  const groom = esc(w.groom_name || 'Groom');
  const guestName = esc(guest?.name || 'Respected Guest');
  const venue = esc(w.venue || 'Wedding Venue');
  const address = esc(w.address || '');
  const mapUrl = safeUrl(w.map_url);
  const contacts = lines(w.rsvp_contacts);
  const eventHtml = (events || []).map(ev => `
    <div class="event-row">
      <div class="event-mark"></div>
      <div class="event-copy">
        <strong>${esc(ev.event_name || 'Ceremony')}</strong>
        <span>${esc(ev.event_date || '')}${ev.event_date && ev.event_time ? ' • ' : ''}${esc(ev.event_time || '')}</span>
      </div>
    </div>
  `).join('');

  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700;800&family=Great+Vibes&family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">

    <style>
      .template10-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at top, rgba(214, 177, 109, 0.16), transparent 24%),
          linear-gradient(180deg, #fdf7ee 0%, #f0e5d7 45%, #e9dccc 100%);
      }

      .template10-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 30px;
        overflow: hidden;
        background: linear-gradient(180deg, #fffdf9 0%, #f8f1e7 100%);
        border: 1px solid rgba(163, 122, 68, 0.5);
        box-shadow: 0 30px 80px rgba(35, 24, 18, 0.18), inset 0 0 0 1px rgba(255,255,255,0.8);
      }

      .template10-card::before,
      .template10-card::after {
        content: "";
        position: absolute;
        inset: 12px;
        border-radius: 22px;
        pointer-events: none;
      }

      .template10-card::before {
        border: 1px solid rgba(169, 127, 53, 0.7);
      }

      .template10-card::after {
        inset: 20px;
        border: 1px solid rgba(94, 64, 36, 0.35);
      }

      .template10-inner {
        position: relative;
        z-index: 1;
        padding: 28px 22px 20px;
      }

      .template10-header {
        text-align: center;
      }

      .template10-badge {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #7d6037;
      }

      .template10-crest {
        width: 88px;
        height: 88px;
        margin: 16px auto 14px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 30% 30%, #fffef9 0%, #f2dfaf 100%);
        border: 2px solid rgba(89, 71, 43, 0.75);
        box-shadow: 0 0 0 5px rgba(200, 166, 91, 0.72);
      }

      .template10-crest span {
        font-family: 'Playfair Display', serif;
        font-size: 34px;
        color: #5a4028;
      }

      .template10-guest {
        display: inline-block;
        padding: 8px 18px;
        border-radius: 999px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(151, 115, 62, 0.45);
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #5d422b;
      }

      .template10-couple {
        text-align: center;
        margin-top: 20px;
      }

      .template10-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 62px);
        line-height: 0.9;
        color: #4b2c29;
      }

      .template10-and {
        margin: 8px 0 6px;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #a07742;
      }

      .template10-invite {
        max-width: 330px;
        margin: 18px auto 22px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        line-height: 1.35;
        color: #4a312d;
        font-style: italic;
      }

      .template10-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }

      .template10-meta-box {
        padding: 14px 12px;
        border-radius: 16px;
        text-align: center;
        background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(238, 225, 201, 0.72));
        border: 1px solid rgba(148, 112, 66, 0.4);
      }

      .template10-meta-label {
        display: block;
        margin-bottom: 6px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #876c3e;
      }

      .template10-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #2e211d;
      }

      .template10-venue {
        margin-bottom: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        text-align: center;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(154, 119, 66, 0.4);
      }

      .template10-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #4a2d28;
      }

      .template10-venue-address {
        margin-top: 8px;
        font-size: 13px;
        color: #5d4b43;
        font-style: italic;
      }

      .template10-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 18px;
      }

      .template10-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 10px 16px;
        border-radius: 999px;
        text-decoration: none;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        transition: transform 0.2s ease;
      }

      .template10-btn:active { transform: scale(0.98); }

      .template10-btn.primary {
        background: linear-gradient(135deg, #3b2b2a 0%, #1d1413 100%);
        color: #f4ead8;
        box-shadow: 0 12px 28px rgba(34, 22, 19, 0.18);
      }

      .template10-btn.secondary {
        background: linear-gradient(135deg, #d9b16a, #b7893c);
        color: #241912;
        box-shadow: 0 12px 28px rgba(183, 137, 60, 0.2);
      }

      .template10-events {
        margin-bottom: 18px;
        padding: 14px 12px 10px;
        border-radius: 18px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(165, 126, 69, 0.4);
      }

      .template10-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8d6939;
        margin-bottom: 12px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(140, 101, 55, 0.35);
      }

      .event-row:last-child { border-bottom: none; }

      .event-mark {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: linear-gradient(135deg, #533d2f, #d2ad60);
        flex-shrink: 0;
      }

      .event-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .event-copy strong {
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #2f2220;
      }

      .event-copy span {
        font-size: 12px;
        color: #5f4c45;
      }

      .template10-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.77);
        border: 1px solid rgba(119, 93, 72, 0.35);
        color: #4e3935;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
      }

      @media (max-width: 420px) {
        .template10-meta { grid-template-columns: 1fr; }
        .template10-actions { flex-direction: column; }
        .template10-btn { width: 100%; }
      }
    </style>

    <div class="template10-wrap">
      <div class="template10-card">
        <div class="template10-inner">
          <div class="template10-header">
            <div class="template10-badge">${esc(w.invocation || 'Bismillah')}</div>
            <div class="template10-crest"><span>♡</span></div>
            <div class="template10-guest">${guestName}</div>
          </div>

          <div class="template10-couple">
            <div class="template10-name">${bride}</div>
            <div class="template10-and">&amp;</div>
            <div class="template10-name">${groom}</div>
          </div>

          <div class="template10-invite">We seek your gracious presence as we celebrate the beginning of a beautiful journey together in love, faith, and family.</div>

          <div class="template10-meta">
            <div class="template10-meta-box">
              <span class="template10-meta-label">Date</span>
              <span class="template10-meta-value">${esc(fmtDate(w.date))}</span>
            </div>
            <div class="template10-meta-box">
              <span class="template10-meta-label">Time</span>
              <span class="template10-meta-value">${esc(fmtTime(w.time))}</span>
            </div>
          </div>

          <div class="template10-venue">
            <div class="template10-venue-name">${venue}</div>
            <div class="template10-venue-address">${address}</div>
          </div>

          <div class="template10-actions">
            ${mapUrl ? `<a class="template10-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
            ${contacts.length ? `<a class="template10-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>

          ${events.length ? `
            <div class="template10-events">
              <div class="template10-section">Event Schedule</div>
              ${eventHtml}
            </div>
          ` : ''}

          ${contacts.length ? `
            <div class="template10-contacts">
              ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
