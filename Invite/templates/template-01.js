const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? esc(String(u).trim()) : '';
const lines = s => String(s ?? '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const fmtDate = value => String(value || '').trim() || 'Date to be confirmed';
const fmtTime = value => String(value || '').trim() || 'Timing to be announced';

export default function render({ guest, wedding: w, events = [] }) {
  const bride = esc(w.bride_name || 'Bride');
  const groom = esc(w.groom_name || 'Groom');
  const guestName = esc(guest?.name || 'Respected Guest');
  const guestTitle = guest?.with_family ? 'with Family' : 'with Warm Wishes';
  const dateText = fmtDate(w.date);
  const timeText = fmtTime(w.time);
  const venueText = esc(w.venue || 'Wedding Venue');
  const addressText = esc(w.address || '');
  const mapUrl = safeUrl(w.map_url);
  const contacts = lines(w.rsvp_contacts);
  const eventList = (events || []).map(ev => `
    <div class="event-row">
      <div class="event-dot"></div>
      <div class="event-copy">
        <strong>${esc(ev.event_name || 'Ceremony')}</strong>
        <span>${esc(ev.event_date || '')}${ev.event_date && ev.event_time ? ' • ' : ''}${esc(ev.event_time || '')}</span>
      </div>
    </div>
  `).join('');

  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">

    <style>
      .bengali-card-wrap {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px 12px;
        background:
          radial-gradient(circle at top, rgba(203, 121, 38, 0.2), transparent 32%),
          linear-gradient(180deg, #3d080c 0%, #180306 100%);
        color: #3a1a1d;
      }

      .bengali-card {
        position: relative;
        width: min(430px, 100%);
        min-height: min(92vh, 860px);
        background: linear-gradient(180deg, #fffaf3 0%, #f8f1df 100%);
        border: 3px solid #c6a14b;
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35), inset 0 0 0 8px rgba(140, 37, 47, 0.18);
      }

      .bengali-card::before,
      .bengali-card::after {
        content: "";
        position: absolute;
        inset: 12px;
        border: 1px solid rgba(124, 34, 46, 0.5);
        border-radius: 20px;
        pointer-events: none;
      }

      .bengali-card::after {
        inset: 22px;
        border-color: rgba(198, 161, 75, 0.65);
      }

      .bengali-pattern {
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(circle at 50% 10%, rgba(198, 161, 75, 0.14), transparent 18%),
          linear-gradient(transparent 0 0);
        opacity: 0.9;
        pointer-events: none;
      }

      .bengali-pattern::before,
      .bengali-pattern::after {
        content: "";
        position: absolute;
        width: 170px;
        height: 170px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23b2832c' stroke-width='1.4' opacity='0.55'%3E%3Ccircle cx='100' cy='100' r='68'/%3E%3Ccircle cx='100' cy='100' r='54'/%3E%3Ccircle cx='100' cy='100' r='38'/%3E%3Cpath d='M100 10v180M10 100h180M39 39l122 122M161 39L39 161'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat;
        opacity: 0.42;
      }

      .bengali-pattern::before {
        top: -22px;
        left: -36px;
      }

      .bengali-pattern::after {
        right: -28px;
        bottom: -30px;
        transform: rotate(180deg);
      }

      .card-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        padding: 30px 26px 26px;
      }

      .header-strip {
        text-align: center;
        margin-top: 8px;
      }

      .top-verse {
        font-family: 'Noto Serif Bengali', serif;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8b3d42;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .crest {
        width: 73px;
        height: 73px;
        margin: 0 auto 18px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: radial-gradient(circle, #fffef8 0%, #f6e3b0 100%);
        border: 2px solid #8b3d42;
        box-shadow: 0 0 0 3px rgba(198, 161, 75, 0.75);
        font-family: 'Cinzel', serif;
        font-size: 28px;
        color: #7b1624;
        font-weight: 700;
      }

      .guest-box {
        text-align: center;
        margin-bottom: 8px;
      }

      .guest-label {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #a97b29;
      }

      .guest-name {
        margin-top: 8px;
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(24px, 4vw, 32px);
        color: #3d1215;
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .family-tag {
        margin-top: 6px;
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #7b1624;
        font-family: 'Cinzel', serif;
      }

      .invitation-text {
        margin: 18px 0 8px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 18px;
        color: #5b2c2d;
        font-style: italic;
      }

      .couple-block {
        text-align: center;
        margin: 14px 0 18px;
      }

      .couple-name {
        font-family: 'Great Vibes', cursive;
        font-size: clamp(40px, 8vw, 58px);
        color: #7b1624;
        line-height: 0.98;
        letter-spacing: 0.02em;
      }

      .and-separator {
        font-family: 'Cinzel', serif;
        font-size: 12px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #aa7f2c;
        margin: 8px 0;
      }

      .wedding-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin: 12px auto 16px;
        color: #7d3c26;
      }

      .wedding-badge::before,
      .wedding-badge::after {
        content: "";
        width: 52px;
        height: 1px;
        background: rgba(125, 60, 38, 0.6);
      }

      .wedding-badge span {
        font-family: 'Cinzel', serif;
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 18px;
      }

      .detail-card {
        background: rgba(255,255,255,0.68);
        border: 1px solid rgba(164, 126, 31, 0.7);
        border-radius: 14px;
        padding: 12px 10px;
        text-align: center;
      }

      .detail-label {
        display: block;
        font-family: 'Cinzel', serif;
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #8e7034;
        margin-bottom: 6px;
      }

      .detail-value {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 15px;
        color: #3b1d1f;
        line-height: 1.35;
      }

      .venue-panel {
        margin: 0 0 18px;
        padding: 14px 14px 10px;
        border-radius: 16px;
        border: 1px solid rgba(162, 80, 82, 0.4);
        background: rgba(255,255,255,0.5);
        text-align: center;
      }

      .venue-name {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        color: #6a101c;
        margin: 0 0 6px;
      }

      .venue-address {
        font-size: 13px;
        line-height: 1.5;
        color: #593036;
        font-style: italic;
      }

      .cta-row {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 4px;
        margin-bottom: 16px;
      }

      .gold-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 10px 16px;
        border-radius: 999px;
        text-decoration: none;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        transition: transform 0.2s ease;
      }

      .gold-btn:active {
        transform: scale(0.98);
      }

      .gold-btn.primary {
        background: linear-gradient(135deg, #7a1426, #4d0a18);
        color: #fffaf3;
        box-shadow: 0 7px 18px rgba(122, 20, 38, 0.22);
      }

      .gold-btn.secondary {
        background: linear-gradient(135deg, #d8b34a, #b98a2f);
        color: #2d120d;
      }

      .events-box {
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(186, 145, 39, 0.75);
        border-radius: 16px;
        padding: 14px 12px 10px;
        margin-top: 4px;
      }

      .section-title {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: #8a6527;
        text-align: center;
        margin-bottom: 10px;
      }

      .event-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px dashed rgba(151, 102, 20, 0.4);
      }

      .event-row:last-child {
        border-bottom: none;
      }

      .event-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b3d42, #c7a14d);
        flex-shrink: 0;
      }

      .event-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .event-copy strong {
        font-family: 'Playfair Display', serif;
        font-size: 14px;
        color: #4a0f15;
      }

      .event-copy span {
        font-size: 12px;
        color: #6d3e42;
      }

      .footer-note {
        margin-top: 18px;
        text-align: center;
        font-family: 'Cinzel', serif;
        font-size: 10px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #8c6130;
      }

      .contacts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
      }

      .contact-pill {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(120, 39, 49, 0.5);
        background: rgba(255,255,255,0.5);
        font-size: 11px;
        font-family: 'Cinzel', serif;
        color: #5b191d;
      }

      @media (max-width: 420px) {
        .card-inner { padding-left: 18px; padding-right: 18px; }
        .details-grid { grid-template-columns: 1fr; }
      }
    </style>

    <div class="bengali-card-wrap">
      <div class="bengali-card">
        <div class="bengali-pattern"></div>

        <div class="card-inner">
          <div class="header-strip">
            <div class="top-verse">${esc(w.invocation || 'শ্রী শ্রী গণেশায় নমঃ')}</div>
            <div class="crest">ॐ</div>
          </div>

          <div class="guest-box">
            <div class="guest-label">Wedding Invitation</div>
            <div class="guest-name">${guestName}</div>
            <div class="family-tag">${guestTitle}</div>
          </div>

          <div class="invitation-text">With the blessings of our family and elders, we invite you to join us in celebrating the sacred union of</div>

          <div class="couple-block">
            <div class="couple-name">${bride}</div>
            <div class="and-separator">&amp;</div>
            <div class="couple-name">${groom}</div>
          </div>

          <div class="wedding-badge"><span>Shubho Bibaho</span></div>

          <div class="details-grid">
            <div class="detail-card">
              <span class="detail-label">Date</span>
              <span class="detail-value">${esc(dateText)}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Time</span>
              <span class="detail-value">${esc(timeText)}</span>
            </div>
          </div>

          <div class="venue-panel">
            <div class="venue-name">${venueText}</div>
            <div class="venue-address">${addressText}</div>
          </div>

          <div class="cta-row">
            ${mapUrl ? `<a class="gold-btn primary" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Get Directions</a>` : ''}
            ${contacts.length ? `<a class="gold-btn secondary" href="tel:${esc(String(contacts[0] || '')).replace(/[^\d+]/g, '')}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>

          ${events.length ? `
            <div class="events-box">
              <div class="section-title">Ceremony Schedule</div>
              ${eventList}
            </div>
          ` : ''}

          ${contacts.length ? `
            <div class="footer-note">With Love</div>
            <div class="contacts">
              ${contacts.map(c => `<span class="contact-pill">${esc(c)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
