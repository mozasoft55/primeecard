const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const fmtDate = v => String(v || '').trim() || 'Date to be announced';
const fmtTime = v => String(v || '').trim() || 'Time to be announced';

export default function render({ guest, wedding: w, events = [] }) {
  const bride = esc(w.bride_name || 'Bride');
  const groom = esc(w.groom_name || 'Groom');
  const guestName = esc(guest?.name || 'Respected Guest');
  const guestText = guest?.with_family ? 'With Family' : 'With Love';
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
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">

    <style>
      .template6-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at 50% 10%, rgba(210, 170, 90, 0.18), transparent 20%),
          linear-gradient(180deg, #0f1220 0%, #1c1726 38%, #120a12 100%);
      }

      .template6-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 30px;
        overflow: hidden;
        background: linear-gradient(180deg, #fdf7ef 0%, #f5ead6 100%);
        box-shadow: 0 30px 80px rgba(0,0,0,0.52), inset 0 0 0 2px rgba(255,255,255,0.8);
        border: 1px solid rgba(180, 135, 53, 0.7);
      }

      .template6-card::before,
      .template6-card::after {
        content: "";
        position: absolute;
        inset: 14px;
        border-radius: 22px;
        pointer-events: none;
      }

      .template6-card::before {
        border: 1px solid rgba(192, 152, 64, 0.75);
      }

      .template6-card::after {
        inset: 22px;
        border: 1px solid rgba(116, 67, 38, 0.42);
      }

      .template6-top {
        position: relative;
        padding: 26px 20px 10px;
        text-align: center;
        background: linear-gradient(180deg, rgba(119, 32, 47, 0.08), rgba(255,255,255,0));
      }

      .template6-badge {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #8d6627;
      }

      .template6-crest {
        width: 84px;
        height: 84px;
        margin: 18px auto 14px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 50% 30%, #fffefc 0%, #f6e5ba 100%);
        border: 2px solid rgba(121, 42, 52, 0.85);
        box-shadow: 0 0 0 5px rgba(190, 147, 52, 0.8);
      }

      .template6-crest span {
        font-size: 32px;
        font-family: 'Playfair Display', serif;
        color: #771f2e;
      }

      .template6-guest {
        display: inline-block;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(148, 112, 31, 0.45);
        border-radius: 999px;
        padding: 8px 18px;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6e2330;
      }

      .template6-couple {
        margin-top: 20px;
        text-align: center;
        padding: 12px 0 8px;
      }

      .template6-couple-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 60px);
        line-height: 0.9;
        color: #6b0f1e;
      }

      .template6-and {
        margin: 6px 0;
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: #9a7b2f;
      }

      .template6-invite {
        margin: 0 auto 22px;
        max-width: 320px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 20px;
        line-height: 1.4;
        color: #4d1d1d;
        font-style: italic;
      }

      .template6-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding: 0 18px 14px;
      }

      .template6-meta-box {
        padding: 14px 10px;
        text-align: center;
        border-radius: 18px;
        border: 1px solid rgba(160, 115, 29, 0.5);
        background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(243, 230, 182, 0.52));
        box-shadow: 0 12px 20px rgba(32,25,16,0.06);
      }

      .template6-meta-label {
        display: block;
        margin-bottom: 6px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8c6320;
      }

      .template6-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #2d1619;
      }

      .template6-venue {
        margin: 0 18px 16px;
        padding: 16px 18px;
        border-radius: 18px;
        text-align: center;
        background: linear-gradient(180deg, rgba(54, 28, 32, 0.06), rgba(255,255,255,0.2));
        border: 1px solid rgba(147, 117, 26, 0.3);
      }

      .template6-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 23px;
        color: #6d1421;
      }

      .template6-venue-address {
        margin-top: 8px;
        font-size: 13px;
        color: #604349;
        font-style: italic;
      }

      .template6-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 0 18px 16px;
      }

      .template6-btn {
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

      .template6-btn:active { transform: scale(0.98); }

      .template6-btn.primary {
        background: linear-gradient(135deg, #1f1b2d, #3a1d2a);
        color: #f5e7bf;
        box-shadow: 0 12px 24px rgba(30, 20, 27, 0.18);
      }

      .template6-btn.secondary {
        background: linear-gradient(135deg, #d8b266, #b98a2f);
        color: #24140d;
        box-shadow: 0 12px 24px rgba(167, 119, 34, 0.22);
      }

      .template6-events {
        margin: 0 18px 18px;
        padding: 16px 14px 10px;
        border-radius: 18px;
        background: rgba(255,255,255,0.6);
        border: 1px solid rgba(176, 136, 58, 0.46);
      }

      .template6-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8a6625;
        margin-bottom: 12px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(160, 116, 32, 0.4);
      }

      .event-row:last-child { border-bottom: none; }

      .event-mark {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b2136, #d0b15f);
        box-shadow: 0 0 0 3px rgba(214, 176, 88, 0.18);
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
        color: #321619;
      }

      .event-copy span {
        font-size: 12px;
        color: #5b3d3f;
      }

      .template6-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 0 18px 22px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid rgba(120, 46, 59, 0.4);
        background: rgba(255,255,255,0.65);
        color: #542328;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
      }

      @media (max-width: 420px) {
        .template6-meta { grid-template-columns: 1fr; }
        .template6-actions { flex-direction: column; }
        .template6-btn { width: 100%; }
      }
    </style>

    <div class="template6-wrap">
      <div class="template6-card">
        <div class="template6-top">
          <div class="template6-badge">${esc(w.invocation || 'Shree Ganeshaya Namah')}</div>
          <div class="template6-crest"><span>ॐ</span></div>
          <div class="template6-guest">${guestName}</div>
        </div>

        <div class="template6-couple">
          <div class="template6-couple-name">${bride}</div>
          <div class="template6-and">&amp;</div>
          <div class="template6-couple-name">${groom}</div>
        </div>

        <div class="template6-invite">Together with their families, we invite you to celebrate a beautiful beginning filled with warmth, love, and blessings.</div>

        <div class="template6-meta">
          <div class="template6-meta-box">
            <span class="template6-meta-label">Date</span>
            <span class="template6-meta-value">${esc(fmtDate(w.date))}</span>
          </div>
          <div class="template6-meta-box">
            <span class="template6-meta-label">Time</span>
            <span class="template6-meta-value">${esc(fmtTime(w.time))}</span>
          </div>
        </div>

        <div class="template6-venue">
          <div class="template6-venue-name">${venue}</div>
          <div class="template6-venue-address">${address}</div>
        </div>

        <div class="template6-actions">
          ${mapUrl ? `<a class="template6-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
          ${contacts.length ? `<a class="template6-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
        </div>

        ${events.length ? `
          <div class="template6-events">
            <div class="template6-section">Ceremony Schedule</div>
            ${eventHtml}
          </div>
        ` : ''}

        ${contacts.length ? `
          <div class="template6-contacts">
            ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
