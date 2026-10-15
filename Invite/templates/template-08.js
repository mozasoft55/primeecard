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
      .template8-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at top, rgba(255, 203, 183, 0.35), transparent 26%),
          linear-gradient(180deg, #f8f1ea 0%, #f4e7dc 35%, #efe0d3 100%);
      }

      .template8-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 32px;
        overflow: hidden;
        background: linear-gradient(180deg, #fffefc 0%, #f9f1eb 100%);
        border: 1px solid rgba(184, 152, 127, 0.4);
        box-shadow: 0 30px 80px rgba(78, 56, 45, 0.18), inset 0 0 0 1px rgba(255,255,255,0.8);
      }

      .template8-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(156, 127, 101, 0.08), transparent 35%, rgba(157, 127, 101, 0.12));
        pointer-events: none;
      }

      .template8-inner {
        position: relative;
        z-index: 1;
        padding: 34px 24px 20px;
      }

      .template8-sheen {
        text-align: center;
        margin-bottom: 18px;
      }

      .template8-badge {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #8f6f57;
      }

      .template8-crest {
        width: 84px;
        height: 84px;
        margin: 18px auto 16px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle, #fffefa 0%, #f1dfc8 100%);
        border: 1px solid rgba(150, 120, 98, 0.5);
        box-shadow: 0 0 0 5px rgba(214, 181, 151, 0.6);
      }

      .template8-crest span {
        font-family: 'Playfair Display', serif;
        font-size: 30px;
        color: #6b4d40;
      }

      .template8-guest {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(255,255,255,0.75);
        border: 1px solid rgba(116, 93, 76, 0.35);
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6d5146;
      }

      .template8-couple {
        text-align: center;
        margin-top: 18px;
      }

      .template8-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 62px);
        line-height: 0.92;
        color: #704a40;
      }

      .template8-and {
        margin: 8px 0 4px;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #997d61;
      }

      .template8-invite {
        max-width: 320px;
        margin: 18px auto 20px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        line-height: 1.35;
        color: #56423b;
        font-style: italic;
      }

      .template8-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .template8-meta-box {
        padding: 14px 12px;
        border-radius: 16px;
        text-align: center;
        background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(236, 225, 213, 0.7));
        border: 1px solid rgba(151, 123, 104, 0.35);
      }

      .template8-meta-label {
        display: block;
        margin-bottom: 6px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8d6c54;
      }

      .template8-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #392926;
      }

      .template8-venue {
        margin-bottom: 16px;
        padding: 18px 16px;
        text-align: center;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(149, 119, 99, 0.35);
        border-radius: 18px;
      }

      .template8-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #5b4035;
      }

      .template8-venue-address {
        margin-top: 8px;
        font-size: 13px;
        color: #6e574f;
        font-style: italic;
      }

      .template8-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 18px;
      }

      .template8-btn {
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

      .template8-btn:active { transform: scale(0.98); }

      .template8-btn.primary {
        background: linear-gradient(135deg, #5b4035, #2b1f1d);
        color: #fff7ef;
      }

      .template8-btn.secondary {
        background: linear-gradient(135deg, #e8d2a4, #c79a59);
        color: #2a1d17;
      }

      .template8-events {
        margin-bottom: 18px;
        padding: 14px 12px 8px;
        border-radius: 18px;
        background: rgba(255,255,255,0.73);
        border: 1px solid rgba(156, 123, 101, 0.35);
      }

      .template8-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8a684d;
        margin-bottom: 10px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(142, 109, 89, 0.35);
      }

      .event-row:last-child { border-bottom: none; }

      .event-mark {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8d6550, #d9bc8d);
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
        color: #3d2b26;
      }

      .event-copy span {
        font-size: 12px;
        color: #6a5a52;
      }

      .template8-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.78);
        border: 1px solid rgba(139, 107, 87, 0.35);
        color: #583d35;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
      }

      @media (max-width: 420px) {
        .template8-meta { grid-template-columns: 1fr; }
        .template8-actions { flex-direction: column; }
        .template8-btn { width: 100%; }
      }
    </style>

    <div class="template8-wrap">
      <div class="template8-card">
        <div class="template8-inner">
          <div class="template8-sheen">
            <div class="template8-badge">${esc(w.invocation || 'Shree Ganeshaya Namah')}</div>
            <div class="template8-crest"><span>ॐ</span></div>
            <div class="template8-guest">${guestName}</div>
          </div>

          <div class="template8-couple">
            <div class="template8-name">${bride}</div>
            <div class="template8-and">&amp;</div>
            <div class="template8-name">${groom}</div>
          </div>

          <div class="template8-invite">With gratitude and joy, we invite you to celebrate a beautiful new chapter in our lives.</div>

          <div class="template8-meta">
            <div class="template8-meta-box">
              <span class="template8-meta-label">Date</span>
              <span class="template8-meta-value">${esc(fmtDate(w.date))}</span>
            </div>
            <div class="template8-meta-box">
              <span class="template8-meta-label">Time</span>
              <span class="template8-meta-value">${esc(fmtTime(w.time))}</span>
            </div>
          </div>

          <div class="template8-venue">
            <div class="template8-venue-name">${venue}</div>
            <div class="template8-venue-address">${address}</div>
          </div>

          <div class="template8-actions">
            ${mapUrl ? `<a class="template8-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
            ${contacts.length ? `<a class="template8-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>

          ${events.length ? `
            <div class="template8-events">
              <div class="template8-section">Ceremony Schedule</div>
              ${eventHtml}
            </div>
          ` : ''}

          ${contacts.length ? `
            <div class="template8-contacts">
              ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
