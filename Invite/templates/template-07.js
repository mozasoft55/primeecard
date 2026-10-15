const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const fmtDate = v => String(v || '').trim() || 'Date to be announced';
const fmtTime = v => String(v || '').trim() || 'Time to be announced';

export default function render({ guest, wedding: w, events = [] }) {
  const bride = esc(w.bride_name || 'Bride');
  const groom = esc(w.groom_name || 'Groom');
  const guestName = esc(guest?.name || 'Respected Guest');
  const guestText = guest?.with_family ? 'with Family' : 'with Love';
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
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700;800&family=Great+Vibes&family=Playfair+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
      .template7-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          linear-gradient(135deg, #f3efe9 0%, #efe4d5 40%, #e8dfd2 100%);
      }

      .template7-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 26px;
        overflow: hidden;
        background: linear-gradient(180deg, #fffdfb 0%, #f7f1ea 100%);
        border: 1px solid rgba(142, 113, 81, 0.35);
        box-shadow: 0 30px 80px rgba(32, 22, 12, 0.18), inset 0 0 0 1px rgba(255,255,255,0.8);
      }

      .template7-card::before {
        content: "";
        position: absolute;
        inset: 12px;
        border-radius: 20px;
        border: 1px solid rgba(117, 92, 62, 0.35);
        pointer-events: none;
      }

      .template7-inner {
        position: relative;
        z-index: 1;
        padding: 26px 24px 20px;
      }

      .template7-header {
        text-align: center;
        padding-top: 4px;
      }

      .template7-badge {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #7d6a4d;
      }

      .template7-monogram {
        width: 86px;
        height: 86px;
        margin: 18px auto 16px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 40%, #fff 0%, #efe1c9 100%);
        border: 1px solid rgba(126, 98, 70, 0.5);
        box-shadow: 0 10px 40px rgba(119, 96, 70, 0.12);
      }

      .template7-monogram span {
        font-family: 'Playfair Display', serif;
        font-size: 30px;
        color: #604d3f;
      }

      .template7-guest {
        display: inline-block;
        padding: 7px 16px;
        border-radius: 999px;
        border: 1px solid rgba(126, 98, 70, 0.45);
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #5b4332;
        background: rgba(255,255,255,0.55);
      }

      .template7-couple {
        text-align: center;
        margin-top: 22px;
      }

      .template7-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 60px);
        line-height: 0.92;
        color: #432d21;
      }

      .template7-and {
        margin: 8px 0 6px;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.24em;
        color: #906c43;
        text-transform: uppercase;
      }

      .template7-invite {
        margin: 20px auto 18px;
        max-width: 310px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 19px;
        line-height: 1.35;
        color: #523d31;
        font-style: italic;
      }

      .template7-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .template7-meta-box {
        background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240, 231, 218, 0.85));
        border: 1px solid rgba(121, 102, 83, 0.3);
        border-radius: 16px;
        padding: 14px 12px;
        text-align: center;
      }

      .template7-meta-label {
        display: block;
        margin-bottom: 7px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8c6e48;
      }

      .template7-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #2d1f1a;
      }

      .template7-venue {
        margin-bottom: 16px;
        padding: 16px 18px;
        text-align: center;
        border-radius: 18px;
        border: 1px solid rgba(120, 96, 72, 0.35);
        background: rgba(255,255,255,0.7);
      }

      .template7-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #472d26;
      }

      .template7-venue-address {
        margin-top: 8px;
        font-size: 13px;
        color: #695a51;
        font-style: italic;
      }

      .template7-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 18px;
      }

      .template7-btn {
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

      .template7-btn:active { transform: scale(0.98); }

      .template7-btn.primary {
        background: linear-gradient(135deg, #2d1f1a 0%, #584038 100%);
        color: #f7f0e8;
      }

      .template7-btn.secondary {
        background: linear-gradient(135deg, #d8c29a, #b89458);
        color: #2b1f18;
      }

      .template7-events {
        padding: 14px 12px 10px;
        border-radius: 18px;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(122, 95, 69, 0.32);
        margin-bottom: 16px;
      }

      .template7-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8b6c43;
        margin-bottom: 10px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(119, 96, 70, 0.28);
      }

      .event-row:last-child { border-bottom: none; }

      .event-mark {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6d4d3d, #c7a167);
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
        color: #2d1f1a;
      }

      .event-copy span {
        font-size: 12px;
        color: #65564d;
      }

      .template7-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid rgba(120, 98, 73, 0.4);
        background: rgba(255,255,255,0.7);
        color: #4a362e;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
      }

      @media (max-width: 420px) {
        .template7-meta { grid-template-columns: 1fr; }
        .template7-actions { flex-direction: column; }
        .template7-btn { width: 100%; }
      }
    </style>

    <div class="template7-wrap">
      <div class="template7-card">
        <div class="template7-inner">
          <div class="template7-header">
            <div class="template7-badge">${esc(w.invocation || 'Shree Ganeshaya Namah')}</div>
            <div class="template7-monogram"><span>ॐ</span></div>
            <div class="template7-guest">${guestName}</div>
          </div>

          <div class="template7-couple">
            <div class="template7-name">${bride}</div>
            <div class="template7-and">&amp;</div>
            <div class="template7-name">${groom}</div>
          </div>

          <div class="template7-invite">${guestText}, we invite you to celebrate the beginning of our forever together with joy, gratitude, and love.</div>

          <div class="template7-meta">
            <div class="template7-meta-box">
              <span class="template7-meta-label">Date</span>
              <span class="template7-meta-value">${esc(fmtDate(w.date))}</span>
            </div>
            <div class="template7-meta-box">
              <span class="template7-meta-label">Time</span>
              <span class="template7-meta-value">${esc(fmtTime(w.time))}</span>
            </div>
          </div>

          <div class="template7-venue">
            <div class="template7-venue-name">${venue}</div>
            <div class="template7-venue-address">${address}</div>
          </div>

          <div class="template7-actions">
            ${mapUrl ? `<a class="template7-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
            ${contacts.length ? `<a class="template7-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>

          ${events.length ? `
            <div class="template7-events">
              <div class="template7-section">Ceremony Schedule</div>
              ${eventHtml}
            </div>
          ` : ''}

          ${contacts.length ? `
            <div class="template7-contacts">
              ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
