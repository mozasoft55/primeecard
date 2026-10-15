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
      <div class="event-bullet"></div>
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
      .template5-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at top, rgba(255, 210, 145, 0.18), transparent 25%),
          linear-gradient(160deg, #1f0d17 0%, #370d19 28%, #11060b 100%);
      }

      .template5-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        border-radius: 32px;
        overflow: hidden;
        background: linear-gradient(180deg, #fffaf5 0%, #f5ece1 100%);
        border: 1px solid rgba(234, 191, 103, 0.8);
        box-shadow:
          0 28px 80px rgba(0, 0, 0, 0.52),
          inset 0 0 0 2px rgba(255,255,255,0.7),
          inset 0 0 0 10px rgba(141, 44, 62, 0.07);
      }

      .template5-card::before {
        content: "";
        position: absolute;
        inset: 14px;
        border-radius: 26px;
        border: 1px solid rgba(164, 127, 29, 0.76);
        pointer-events: none;
      }

      .template5-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.18), transparent 25%, transparent 75%, rgba(108, 35, 59, 0.12));
        pointer-events: none;
      }

      .template5-hero {
        position: relative;
        padding: 26px 26px 14px;
        text-align: center;
        background:
          radial-gradient(circle at 50% 22%, rgba(197, 141, 62, 0.18), transparent 20%),
          linear-gradient(180deg, rgba(116, 19, 32, 0.08), rgba(255,255,255,0));
      }

      .template5-topline {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #9b742d;
        margin-bottom: 14px;
      }

      .template5-crest {
        width: 80px;
        height: 80px;
        margin: 0 auto 16px;
        border-radius: 50%;
        position: relative;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #fffaf0 0%, #f4e2b3 100%);
        border: 2px solid rgba(120, 42, 55, 0.8);
        box-shadow: 0 0 0 4px rgba(196, 154, 63, 0.8);
      }

      .template5-crest::before,
      .template5-crest::after {
        content: "";
        position: absolute;
        inset: 7px;
        border: 1px solid rgba(108, 35, 59, 0.4);
        border-radius: 50%;
      }

      .template5-crest span {
        font-size: 28px;
        color: #7d1f2c;
        font-weight: 700;
        font-family: 'Playfair Display', serif;
      }

      .template5-guest {
        display: inline-block;
        background: rgba(255,255,255,0.56);
        border: 1px solid rgba(153, 109, 34, 0.45);
        border-radius: 999px;
        padding: 8px 18px;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #7f2d37;
      }

      .template5-name {
        margin-top: 22px;
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
        font-size: clamp(28px, 5vw, 40px);
        color: #3d0e14;
      }

      .template5-tag {
        margin-top: 7px;
        color: #8b5b15;
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .template5-couple {
        position: relative;
        margin: 12px 0 24px;
        padding: 18px 0 10px;
        text-align: center;
      }

      .template5-couple::before,
      .template5-couple::after {
        content: "";
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 160px;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(126, 52, 61, 0.5), transparent);
      }

      .template5-couple::before { top: 0; }
      .template5-couple::after { bottom: 0; }

      .template5-couple-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(42px, 8vw, 62px);
        line-height: 0.9;
        color: #7c1624;
        text-shadow: 0 2px 0 rgba(255,255,255,0.7);
      }

      .template5-and {
        margin: 2px 0 6px;
        font-family: 'Cinzel', serif;
        font-size: 12px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #af7e26;
      }

      .template5-invite {
        margin: 0 auto 20px;
        max-width: 300px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 18px;
        line-height: 1.35;
        color: #5c2b2d;
        font-style: italic;
      }

      .template5-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding: 0 20px 18px;
      }

      .template5-meta-box {
        position: relative;
        background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(246, 232, 204, 0.72));
        border: 1px solid rgba(158, 117, 30, 0.35);
        border-radius: 18px;
        padding: 14px 12px;
        text-align: center;
        box-shadow: 0 8px 18px rgba(69, 25, 31, 0.08);
      }

      .template5-meta-label {
        display: block;
        margin-bottom: 6px;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #94722c;
      }

      .template5-meta-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #3a1c1c;
        line-height: 1.3;
      }

      .template5-venue {
        margin: 0 20px 16px;
        padding: 18px 18px 14px;
        text-align: center;
        border-radius: 22px;
        background: linear-gradient(180deg, #fffdf9 0%, #f7efdd 100%);
        border: 1px solid rgba(165, 126, 39, 0.45);
      }

      .template5-venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #6c1421;
      }

      .template5-venue-address {
        margin-top: 8px;
        color: #614148;
        font-size: 13px;
        line-height: 1.5;
        font-style: italic;
      }

      .template5-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 0 20px 18px;
      }

      .template5-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 10px 16px;
        border-radius: 999px;
        text-decoration: none;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        transition: transform 0.2s ease;
      }

      .template5-btn:active { transform: scale(0.98); }

      .template5-btn.primary {
        background: linear-gradient(135deg, #7a1426 0%, #4b0f1a 100%);
        color: #fff;
        box-shadow: 0 10px 20px rgba(122, 20, 38, 0.28);
      }

      .template5-btn.secondary {
        background: linear-gradient(135deg, #e8c46d, #b88b2c);
        color: #2a120f;
        box-shadow: 0 10px 20px rgba(184, 139, 44, 0.28);
      }

      .template5-events {
        margin: 0 20px 18px;
        padding: 16px 14px 10px;
        border-radius: 20px;
        background: rgba(255,255,255,0.62);
        border: 1px solid rgba(175, 130, 38, 0.55);
      }

      .template5-section {
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #906926;
        margin-bottom: 12px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(158, 116, 38, 0.38);
      }

      .event-row:last-child {
        border-bottom: none;
      }

      .event-bullet {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7a1426, #d7b05d);
        flex-shrink: 0;
      }

      .event-copy {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .event-copy strong {
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #3d0d15;
      }

      .event-copy span {
        font-size: 12px;
        color: #6c4d50;
      }

      .template5-contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 0 20px 24px;
      }

      .contact-pill {
        display: inline-block;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(115, 48, 57, 0.4);
        font-family: 'Manrope', sans-serif;
        font-size: 11px;
        color: #51232c;
      }

      @media (max-width: 420px) {
        .template5-meta { grid-template-columns: 1fr; }
        .template5-actions { flex-direction: column; }
        .template5-btn { width: 100%; }
      }
    </style>

    <div class="template5-wrap">
      <div class="template5-card">
        <div class="template5-hero">
          <div class="template5-topline">${esc(w.invocation || 'Shree Ganeshaya Namah')}</div>
          <div class="template5-crest"><span>ॐ</span></div>
          <div class="template5-guest">${guestName}</div>
          <div class="template5-name">${guestText}</div>
          <div class="template5-tag">You are warmly invited</div>
        </div>

        <div class="template5-couple">
          <div class="template5-couple-name">${bride}</div>
          <div class="template5-and">&amp;</div>
          <div class="template5-couple-name">${groom}</div>
        </div>

        <div class="template5-invite">Together with their families, we invite you to witness and celebrate their sacred union.</div>

        <div class="template5-meta">
          <div class="template5-meta-box">
            <span class="template5-meta-label">Date</span>
            <span class="template5-meta-value">${esc(fmtDate(w.date))}</span>
          </div>
          <div class="template5-meta-box">
            <span class="template5-meta-label">Time</span>
            <span class="template5-meta-value">${esc(fmtTime(w.time))}</span>
          </div>
        </div>

        <div class="template5-venue">
          <div class="template5-venue-name">${venue}</div>
          <div class="template5-venue-address">${address}</div>
        </div>

        <div class="template5-actions">
          ${mapUrl ? `<a class="template5-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
          ${contacts.length ? `<a class="template5-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
        </div>

        ${events.length ? `
          <div class="template5-events">
            <div class="template5-section">Ceremony Schedule</div>
            ${eventHtml}
          </div>
        ` : ''}

        ${contacts.length ? `
          <div class="template5-contacts">
            ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
