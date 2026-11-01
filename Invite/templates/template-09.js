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
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">

    <style>
      .template9-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at top, rgba(186, 148, 82, 0.15), transparent 23%),
          linear-gradient(180deg, #160b0d 0%, #261517 38%, #0f090a 100%);
      }

      .template9-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 30px;
        overflow: hidden;
        background: linear-gradient(180deg, #f9f3e5 0%, #f3e8d5 100%);
        border: 1px solid rgba(176, 134, 59, 0.65);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255,255,255,0.75);
      }

      .template9-card::before,
      .template9-card::after {
        content: "";
        position: absolute;
        inset: 12px;
        border-radius: 22px;
        pointer-events: none;
      }

      .template9-card::before {
        border: 1px solid rgba(152, 123, 62, 0.9);
      }

      .template9-card::after {
        inset: 20px;
        border: 1px solid rgba(105, 42, 50, 0.45);
      }

      .template9-inner {
        position: relative;
        z-index: 1;
        padding: 28px 22px 20px;
      }

      .template9-header {
        text-align: center;
      }

      .template9-badge {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #8b6b2f;
      }

      .template9-crest {
        width: 88px;
        height: 88px;
        margin: 18px auto 16px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 30% 30%, #fffef9 0%, #f2dfae 100%);
        border: 2px solid rgba(109, 34, 41, 0.85);
        box-shadow: 0 0 0 5px rgba(186, 149, 73, 0.8);
      }

      .template9-crest span {
        font-family: 'Playfair Display', serif;
        font-size: 32px;
        color: #731d2b;
      }

      .template9-guest {
        display: inline-block;
        padding: 8px 18px;
        border-radius: 999px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(153, 117, 46, 0.5);
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6d2a35;
      }

      .template9-couple {
        text-align: center;
        margin-top: 20px;
      }

      .template9-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 62px);
        line-height: 0.9;
        color: #661a24;
      }

      .template9-and {
        margin: 6px 0;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #a47b2f;
      }

      .template9-invite {
        max-width: 330px;
        margin: 18px auto 20px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        line-height: 1.35;
        color: #4d2125;
        font-style: italic;
      }

      .template9-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .template9-meta-box {
        padding: 14px 10px;
        border-radius: 16px;
        text-align: center;
        background: linear-gradient(180deg, rgba(255,255,255,0.76), rgba(244, 235, 209, 0.7));
        border: 1px solid rgba(155, 117, 42, 0.4);
      }

      .template9-meta-label {
        display: block;
        margin-bottom: 7px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8a6223;
      }

      .template9-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #2d1d1d;
      }

      .template9-venue {
        margin-bottom: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        text-align: center;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(150, 119, 42, 0.4);
      }

      .template9-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #5f1621;
      }

      .template9-venue-address {
        margin-top: 8px;
        font-size: 13px;
        color: #654b4d;
        font-style: italic;
      }

      .template9-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 18px;
      }

      .template9-btn {
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

      .template9-btn:active { transform: scale(0.98); }

      .template9-btn.primary {
        background: linear-gradient(135deg, #5d0f1a, #2d0d12);
        color: #f3e6c0;
        box-shadow: 0 12px 28px rgba(72, 19, 28, 0.20);
      }

      .template9-btn.secondary {
        background: linear-gradient(135deg, #d8b366, #ba8e2d);
        color: #2a1813;
        box-shadow: 0 12px 28px rgba(186, 142, 45, 0.20);
      }

      .template9-events {
        margin-bottom: 18px;
        padding: 14px 12px 10px;
        border-radius: 18px;
        background: rgba(255,255,255,0.68);
        border: 1px solid rgba(169, 132, 48, 0.42);
      }

      .template9-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8a6531;
        margin-bottom: 12px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(137, 100, 41, 0.36);
      }

      .event-row:last-child { border-bottom: none; }

      .event-mark {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6a1220, #d8b15a);
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
        color: #33191d;
      }

      .event-copy span {
        font-size: 12px;
        color: #614a4d;
      }

      .template9-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(120, 52, 58, 0.4);
        color: #4f2026;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
      }

      @media (max-width: 420px) {
        .template9-meta { grid-template-columns: 1fr; }
        .template9-actions { flex-direction: column; }
        .template9-btn { width: 100%; }
      }
    </style>

    <div class="template9-wrap">
      <div class="template9-card">
        <div class="template9-inner">
          <div class="template9-header">
            <div class="template9-badge">${esc(w.invocation || 'Shree Ganeshaya Namah')}</div>
            <div class="template9-crest"><span>ॐ</span></div>
            <div class="template9-guest">${guestName}</div>
          </div>

          <div class="template9-couple">
            <div class="template9-name">${bride}</div>
            <div class="template9-and">&amp;</div>
            <div class="template9-name">${groom}</div>
          </div>

          <div class="template9-invite">With the blessings of our family and elders, we invite you to celebrate the sacred union of our beloved children.</div>

          <div class="template9-meta">
            <div class="template9-meta-box">
              <span class="template9-meta-label">Date</span>
              <span class="template9-meta-value">${esc(fmtDate(w.date))}</span>
            </div>
            <div class="template9-meta-box">
              <span class="template9-meta-label">Time</span>
              <span class="template9-meta-value">${esc(fmtTime(w.time))}</span>
            </div>
          </div>

          <div class="template9-venue">
            <div class="template9-venue-name">${venue}</div>
            <div class="template9-venue-address">${address}</div>
          </div>

          <div class="template9-actions">
            ${mapUrl ? `<a class="template9-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
            ${contacts.length ? `<a class="template9-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>

          ${events.length ? `
            <div class="template9-events">
              <div class="template9-section">Family Event Schedule</div>
              ${eventHtml}
            </div>
          ` : ''}

          ${contacts.length ? `
            <div class="template9-contacts">
              ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
