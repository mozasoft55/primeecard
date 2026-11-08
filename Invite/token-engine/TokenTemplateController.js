/**
 * ============================================================================
 * TokenTemplateController — Cultural Token-Driven Template Architecture
 * Features:
 *   - Grand Cover / Virtual Envelope Unfold First Impression
 *   - Real Cultural Distinction:
 *       * Hindu / Bengali (Shubho Bibaho): Jharokha Arch, Gold Kolka, Mukut/Topor, Alta Red
 *       * Muslim (Noor-e-Jannat & Mughal Jaali): Indo-Islamic Multi-Foil Arch, Bismillah, Jaali Lattice
 *       * Sikh: Royal Anand Karaj, Khanda Crest, Sapphire & Gold
 *       * Royal & Floral: Imperial Darbar & Bespoke Botanical Arch
 *   - Pixel-Perfect Padding, Line-Height, & Zero-Lag Instant Switching
 *   - Zero Scrollbar Clutter (Hardware-Accelerated Smooth Scrolling)
 * ============================================================================
 */

import { CountdownTimer } from './CountdownTimer.js';

/* ---------- Pure Vector Authentic Cultural SVG Assets ---------- */

// Bengali Peacock / Paisley Kolka Corner Flourish
const KOLKA_CORNER_SVG = (pos = 'tl') => `
<svg class="kolka-corner ${pos}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 8 C24 8, 48 16, 52 36 C55 50, 42 58, 30 52 C18 46, 20 28, 34 24 C40 22, 44 26, 42 30 C40 33, 36 33, 34 31 C32 29, 34 26, 37 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 12 C24 14, 40 22, 42 36" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2"/>
  <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
  <circle cx="26" cy="18" r="2" fill="currentColor"/>
  <circle cx="36" cy="24" r="1.8" fill="currentColor"/>
  <circle cx="10" cy="28" r="1.5" fill="currentColor"/>
  <circle cx="12" cy="40" r="1.5" fill="currentColor"/>
  <circle cx="18" cy="50" r="2" fill="currentColor"/>
  <circle cx="28" cy="56" r="2.2" fill="currentColor"/>
</svg>`;

// Traditional Bengali Shehnai & Sacred Kalash
const SHEHNAI_KALASH_SVG = `
<svg class="shehnai-kalash-icon" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Shehnai left -->
  <path d="M10 32 L42 22 L44 18 L10 28 Z" fill="currentColor" opacity="0.85"/>
  <ellipse cx="8" cy="30" rx="3" ry="5" fill="currentColor"/>
  <!-- Central Kalash with Coconut and Mango Leaves -->
  <path d="M54 28 C52 38, 68 38, 66 28 L64 24 L56 24 Z" fill="currentColor"/>
  <circle cx="60" cy="20" r="5" fill="currentColor" opacity="0.9"/>
  <path d="M56 20 C54 14, 58 10, 60 8 C62 10, 66 14, 64 20 Z" fill="currentColor" opacity="0.75"/>
  <line x1="52" y1="24" x2="68" y2="24" stroke="currentColor" stroke-width="1.5"/>
  <!-- Shehnai right -->
  <path d="M110 32 L78 22 L76 18 L110 28 Z" fill="currentColor" opacity="0.85"/>
  <ellipse cx="112" cy="30" rx="3" ry="5" fill="currentColor"/>
</svg>`;

// Traditional Bengali Alpona Divider
const BENGALI_ALPONA_SVG = `
<svg class="bengali-alpona-divider" viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M140 6 L146 16 L158 16 L148 22 L152 32 L140 25 L128 32 L132 22 L122 16 L134 16 Z" fill="currentColor" opacity="0.9"/>
  <circle cx="140" cy="18" r="3" fill="#8B0000"/>
  <path d="M20 16 C50 6, 90 26, 120 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M260 16 C230 6, 190 26, 160 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="60" cy="15" r="2" fill="currentColor"/>
  <circle cx="90" cy="17" r="2" fill="currentColor"/>
  <circle cx="190" cy="17" r="2" fill="currentColor"/>
  <circle cx="220" cy="15" r="2" fill="currentColor"/>
  <circle cx="10" cy="16" r="3" fill="currentColor"/>
  <circle cx="270" cy="16" r="3" fill="currentColor"/>
</svg>`;

// Pure Vector Bismillah Calligraphy (Authentic Arabic Script)
const BISMILLAH_SVG = `
<svg viewBox="0 0 360 84" class="mughal-bismillah-svg" aria-label="Bismillah ar-Rahman ar-Rahim" role="img">
  <path d="M180 8c-4.2 0-7.8 2.5-9.4 6.2-1.6-3.7-5.2-6.2-9.4-6.2-5.8 0-10.5 4.7-10.5 10.5 0 8.2 12.3 16.4 19.9 22.4 7.6-6 19.9-14.2 19.9-22.4 0-5.8-4.7-10.5-10.5-10.5z" fill="currentColor" opacity=".2"/>
  <text x="180" y="52" text-anchor="middle" font-family="'Amiri','Cinzel',serif" font-size="32" font-weight="700" fill="currentColor" letter-spacing="2">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</text>
  <line x1="70" y1="70" x2="150" y2="70" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <circle cx="180" cy="70" r="3.5" fill="currentColor"/>
  <polygon points="180,63 184,70 180,77 176,70" fill="currentColor"/>
  <line x1="210" y1="70" x2="290" y2="70" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
</svg>`;

// Islamic Crescent Star Crest
const CRESCENT_STAR_SVG = `
<svg class="crescent-star-crest" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 4 C11.2 4, 4 11.2, 4 20 C4 28.8, 11.2 36, 20 36 C24.5 36, 28.5 34.1, 31.4 31 C23.5 32, 16 25.5, 16 17.5 C16 11.8, 19.5 7, 24.6 5 C23.1 4.4, 21.6 4, 20 4 Z"/>
  <polygon points="28,12 30,16 34,16 31,19 32,23 28,21 24,23 25,19 22,16 26,16" opacity="0.95"/>
</svg>`;

// Royal Mughal Star & Floral Corner Arabesque
const CORNER_ARABESQUE = (pos = 'tl') => `
<svg viewBox="0 0 60 60" class="mughal-corner-arabesque ${pos}" aria-hidden="true">
  <path d="M 0,0 L 50,0 C 45,15 35,25 20,30 C 25,45 15,55 0,60 Z" fill="currentColor" opacity=".2"/>
  <path d="M 4,4 L 46,4 C 38,16 28,26 16,38 L 4,46 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
  <circle cx="20" cy="8" r="1.5" fill="currentColor"/>
  <circle cx="8" cy="20" r="1.5" fill="currentColor"/>
  <path d="M 2,56 C 14,44 26,30 36,16" stroke="currentColor" stroke-width="1" fill="none"/>
</svg>`;

// Mughal Repeating Geometric Jaali Screen
const MUGHAL_JAALI_SVG = `
<svg class="mughal-jaali-pattern" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <pattern id="mughal-jaali-pat" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.45"/>
      <path d="M20 8 L32 20 L20 32 L8 20 Z" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
      <polygon points="20,14 24,20 20,26 16,20" fill="currentColor" opacity="0.3"/>
      <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.4"/>
      <circle cx="40" cy="0" r="3" fill="currentColor" opacity="0.4"/>
      <circle cx="0" cy="40" r="3" fill="currentColor" opacity="0.4"/>
      <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#mughal-jaali-pat)"/>
</svg>`;

// Islamic 8-Pointed Star Geometrical Divider
const ISLAMIC_STAR_DIVIDER_SVG = `
<svg class="islamic-star-divider" viewBox="0 0 280 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="20" y1="14" x2="120" y2="14" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
  <g transform="translate(140, 14)">
    <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="currentColor"/>
    <circle cx="0" cy="0" r="3" fill="#0B3C2D"/>
  </g>
  <line x1="160" y1="14" x2="260" y2="14" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
</svg>`;

export class TokenTemplateController {
  /**
   * @param {Object} options
   * @param {Array} options.templates - Template catalog array from templates.json
   * @param {string} [options.defaultTemplateId] - Initial template ID to activate
   */
  constructor({ templates = [], defaultTemplateId = null } = {}) {
    if (!Array.isArray(templates) || templates.length === 0) {
      throw new Error('[TokenTemplateController] Template catalog must contain at least one valid entry.');
    }
    this.templates = new Map(templates.map(t => [t.id, t]));
    this.activeTemplateId = defaultTemplateId || templates[0].id;
    this.loadedFontHrefs = new Set();
    this._lastState = null;
    this.hasUnfoldedEnvelope = false;
  }

  /**
   * Returns current active template configuration
   * @returns {Object}
   */
  get activeTemplate() {
    return this.templates.get(this.activeTemplateId);
  }

  /**
   * Dynamic Font Loader: Inject Google Font <link> elements without duplicates
   * @param {Array<string>} fontUrls
   */
  loadFonts(fontUrls = []) {
    if (typeof document === 'undefined') return;
    fontUrls.forEach(url => {
      if (!url || this.loadedFontHrefs.has(url)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      this.loadedFontHrefs.add(url);
    });
  }

  /**
   * Directly apply CSS Custom Properties (Tokens) onto a DOM element
   * @param {HTMLElement} mountElement - Target container element
   * @param {string|Object} templateIdOrTokens - Template ID string or tokens key-value map
   */
  applyTokens(mountElement, templateIdOrTokens = this.activeTemplateId) {
    if (!mountElement || typeof mountElement.style?.setProperty !== 'function') {
      return;
    }

    let tokens = {};
    let fonts = [];

    if (typeof templateIdOrTokens === 'string') {
      const template = this.templates.get(templateIdOrTokens);
      if (!template) {
        console.warn(`[TokenTemplateController] Template "${templateIdOrTokens}" not found.`);
        return;
      }
      this.activeTemplateId = templateIdOrTokens;
      tokens = template.tokens || {};
      fonts = template.fonts || [];
    } else if (typeof templateIdOrTokens === 'object' && templateIdOrTokens !== null) {
      tokens = templateIdOrTokens;
    }

    if (fonts.length > 0) {
      this.loadFonts(fonts);
    }

    // High-performance DOM property mutation
    Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
      if (tokenKey.startsWith('--')) {
        mountElement.style.setProperty(tokenKey, tokenValue);
      }
    });

    const bg = tokens['--card-bg'] || tokens.bg;
    if (bg) {
      mountElement.style.setProperty('--card-bg', bg);
    }

    mountElement.setAttribute('data-active-template', this.activeTemplateId);
  }

  /**
   * Escape helper to prevent XSS in client-rendered string templates
   */
  static escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Render universal state markup with distinct Cultural Architecture
   *
   * @param {HTMLElement} mountElement
   * @param {Object} state - Universal Wedding State object
   */
  render(mountElement, state) {
    if (!mountElement) {
      throw new Error('[TokenTemplateController] Valid DOM mountElement is required.');
    }
    if (!state || typeof state !== 'object') {
      throw new Error('[TokenTemplateController] Valid universal wedding state is required.');
    }

    this._lastState = state;
    this.applyTokens(mountElement, this.activeTemplateId);

    const template = this.activeTemplate || this.templates.get(this.activeTemplateId) || {};
    const templateId = String(template.id || this.activeTemplateId || '').toLowerCase();
    const community = String(template.community || '').toLowerCase();

    const isHindu = community.includes('hindu') || templateId.includes('hindu') || templateId.includes('vedic') || templateId.includes('alta') || templateId === 'template-06' || templateId === 'template-03';
    const isMuslim = community.includes('muslim') || templateId.includes('muslim') || templateId.includes('noor') || templateId.includes('jaali') || templateId === 'template-04' || templateId === 'template-02';

    const esc = TokenTemplateController.escapeHtml;
    const getStored = (k) => {
      try {
        return (typeof localStorage !== 'undefined' && localStorage.getItem(k))
          || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(k))
          || '';
      } catch { return ''; }
    };
    const storedCouple = getStored('wedding-couple-photo') || getStored('wedding_couple_photo') || getStored('onboard-couple-photo');
    const storedVenue = getStored('wedding-venue-photo') || getStored('wedding_venue_photo') || getStored('onboard-venue-photo');

    const couplePhoto = esc(state.couple?.photo || state.couple_photo || state.story?.image || storedCouple || '');
    const venuePhoto = esc(state.venue?.image || state.venue_photo || state.venue_image || storedVenue || '');

    if (couplePhoto) {
      if (!state.couple) state.couple = {};
      state.couple.photo = couplePhoto;
      state.couple_photo = couplePhoto;
      if (state.story) state.story.image = couplePhoto;
    }
    if (venuePhoto) {
      if (!state.venue) state.venue = {};
      state.venue.image = venuePhoto;
      state.venue_photo = venuePhoto;
      state.venue_image = venuePhoto;
    }

    const couple = state.couple || {};
    const bride = esc(couple.bride || 'Bride');
    const groom = esc(couple.groom || 'Groom');
    const isBrideFirst = couple.name_order !== 'groom_first';

    const first = isBrideFirst ? bride : groom;
    const second = isBrideFirst ? groom : bride;
    const monogram = `${first.charAt(0)} & ${second.charAt(0)}`;

    const dateStr = esc(state.date || 'December 05, 2026');
    const timeStr = esc(state.time || '7:00 PM');
    const venue = state.venue || {};
    const venueName = esc(venue.name || 'Royal Heritage Palace');
    const venueLoc = esc([venue.address, venue.city].filter(Boolean).join(', ') || 'Kolkata, India');

    const events = Array.isArray(state.events) ? state.events : [];
    const eventsHtml = events.map(ev => `
      <div class="token-card__event-row">
        <div class="token-card__event-info">
          <strong>${esc(ev.name)}</strong>
          <span>${esc(ev.venue || venueName)}</span>
        </div>
        <div class="token-card__event-time">
          ${esc(ev.date || dateStr)}<br>
          <small>${esc(ev.time || timeStr)}</small>
        </div>
      </div>
    `).join('');

    const rawRsvp = String(state.rsvp?.phone || '9477929927').replace(/[^0-9]/g, '');
    const waPhone = rawRsvp.length === 10 ? `91${rawRsvp}` : (rawRsvp || '919477929927');
    const rsvpPhone = esc(waPhone);
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Greetings! Confirming attendance for ${first} & ${second}'s wedding.`)}`;

    let cardHtml = '';

    if (isHindu) {
      // =========================================================================
      // 5 DEDICATED BENGALI HINDU ARCHITECTURES (EXPERT LEVEL 20+ LUXURY)
      // 1. Rajbari Heritage: Banana Tree Toran, Alta Crimson & 24K Antique Gold
      // 2. Shantiniketan Alpona: Terracotta Rust, Sacred Lotus Mandala & Paan Pata
      // 3. Banarasi Zari Darbar: Royal Jamdani Indigo, Scalloped Jharokha Arch & Zari
      // 4. Kunjavan Tuberose: Sandalwood Ivory, Cascading Rajnigandha Garlands
      // 5. Swarna Mukut Noir: Haute Couture Obsidian Noir, 24K Gold Leaf Sholapith
      // =========================================================================
      const isBengaliAlpona = templateId.includes('alta') || templateId.includes('alpona') || templateId === 'template-03';
      const isBengaliBanarasi = templateId.includes('banarasi') || templateId.includes('zari') || templateId === 'template-01';
      const isBengaliKunjavan = templateId.includes('kunjavan') || templateId.includes('tuberose') || templateId === 'template-05';
      const isBengaliSwarna = templateId.includes('swarna') || templateId.includes('topor-noir') || templateId === 'template-07';
      const isBengaliRajbari = !isBengaliAlpona && !isBengaliBanarasi && !isBengaliKunjavan && !isBengaliSwarna;

      // Theme CSS modifier class
      const themeClass = isBengaliAlpona ? 'bengali-theme-alpona'
        : isBengaliBanarasi ? 'bengali-theme-banarasi'
        : isBengaliKunjavan ? 'bengali-theme-kunjavan'
        : isBengaliSwarna ? 'bengali-theme-swarna'
        : 'bengali-theme-rajbari';

      // Default Invocations & Traditional Calligraphy
      const hinduInvocation = esc(state.invocation || (
        isBengaliAlpona ? '॥ ওঁ শ্রী গণেশায় নমঃ ॥'
        : isBengaliBanarasi ? '॥ শ্রী শ্রী রাধাকৃষ্ণায় নমঃ ॥'
        : isBengaliKunjavan ? '॥ ওঁ প্রজাপতয়ে নমঃ ॥'
        : isBengaliSwarna ? '॥ যদেতদ্ হৃদয়ং তব তদেতদ্ হৃদয়ং মম ॥'
        : '॥ শ্রী শ্রী প্রজাপতয়ে নমঃ ॥'
      ));

      const bengaliCalligraphy = isBengaliAlpona ? 'শুভদৃষ্টি ও মালাবদল'
        : isBengaliBanarasi ? 'সাতপাকে বাঁধা শুভ বিবাহ'
        : isBengaliKunjavan ? 'গায়ে হলুদ ও শুভ পরিণয়'
        : isBengaliSwarna ? 'শুভ বিবাহ ও প্রীতিভোজ'
        : 'শুভ বিবাহ';

      const coupleCenterpieceHtml = couplePhoto ? `
        <div class="bengali-artwork-card reveal-scale">
          <div class="bengali-artwork-frame bengali-jharokha-frame">
            <img class="bengali-artwork-img" src="${couplePhoto}" alt="${first} &amp; ${second}" loading="eager" decoding="async">
            <div class="bengali-artwork-ribbon">
              <span>${first} &amp; ${second} · ${bengaliCalligraphy}</span>
            </div>
          </div>
          <div class="bengali-ornament-caption">
            <span>Subho Drishti · Sacred Union · Eternally Together</span>
          </div>
        </div>
      ` : null;

      const hinduCeremony = esc(state.ceremony_title || (
        isBengaliAlpona ? 'Shantiniketan Alpona · Auspicious Folk Vivah'
        : isBengaliBanarasi ? 'Banarasi Zari · North Kolkata Darbar'
        : isBengaliKunjavan ? 'Kunjavan Tuberose · Botanical Romance'
        : isBengaliSwarna ? 'Swarna Mukut & Topor Noir · Haute Couture'
        : 'Shubho Bibaho · Sacred Royal Heritage'
      ));

      // Specific Entrance Header & Animation Layer
      let entranceArchHtml = '';
      let animationLayerHtml = '';
      let centerpieceArtworkHtml = '';

      if (isBengaliAlpona) {
        // Alpona Animation & Entrance
        animationLayerHtml = `
          <div class="alpona-mandala-wrap" aria-hidden="true" style="position:absolute;top:60px;left:50%;margin-left:-110px;width:220px;height:220px;pointer-events:none;z-index:0;">
            <svg class="alpona-mandala-pulse" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" stroke="#E6A117" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
              <circle cx="100" cy="100" r="70" stroke="#9E381A" stroke-width="1.2" opacity="0.7"/>
              <circle cx="100" cy="100" r="45" stroke="#E6A117" stroke-width="1" stroke-dasharray="2 3"/>
              <polygon points="100,30 115,75 160,85 125,115 135,160 100,135 65,160 75,115 40,85 85,75" stroke="#9E381A" stroke-width="1" fill="#E6A117" fill-opacity="0.12"/>
            </svg>
          </div>
        `;
        entranceArchHtml = `
          <div class="paan-pata-top-wrap" style="width:min(200px, 70%);margin:12px auto 0;text-align:center;" aria-hidden="true">
            <img src="./assets/motifs/paan-pata-alpona-clean.png" alt="Alpona Folk Arch" style="width:100%;height:auto;filter:drop-shadow(0 2px 6px rgba(158,56,26,0.3));" />
          </div>
          <img src="./assets/motifs/paan-pata-alpona.png" class="card-corner-motif bl paan-pata-flourish" alt="" aria-hidden="true" />
          <img src="./assets/motifs/paan-pata-alpona.png" class="card-corner-motif br paan-pata-flourish" alt="" aria-hidden="true" />
        `;
        centerpieceArtworkHtml = coupleCenterpieceHtml || `
          <div class="bengali-artwork-card reveal-scale">
            <div class="bengali-artwork-frame">
              <img class="bengali-artwork-img" src="./assets/motifs/topor-mukut-kula.jpg" alt="Bengali Topor Mukut &amp; Boran Kula" loading="lazy" decoding="async">
              <div class="bengali-artwork-ribbon">
                <span>Subho Drishti · শুভদৃষ্টি ও মালাবদল</span>
              </div>
            </div>
            <div class="bengali-ornament-caption">
              <span>Sacred Boran Dala · Shankha Pola · Dhan &amp; Durba</span>
            </div>
          </div>
        `;
      } else if (isBengaliBanarasi) {
        // Banarasi Zari Animation & Entrance
        animationLayerHtml = `<div class="zari-gleam-beam" aria-hidden="true"></div>`;
        entranceArchHtml = `
          ${KOLKA_CORNER_SVG('tl')}
          ${KOLKA_CORNER_SVG('tr')}
          ${KOLKA_CORNER_SVG('bl')}
          ${KOLKA_CORNER_SVG('br')}
          <div class="banarasi-jharokha-top" style="text-align:center;padding-top:14px;" aria-hidden="true">
            <svg viewBox="0 0 280 40" width="220" height="32" fill="none" stroke="#E5C158" stroke-width="1.4">
              <path d="M10 32 C40 8, 100 8, 140 32 C180 8, 240 8, 270 32" stroke-linecap="round"/>
              <circle cx="140" cy="14" r="5" fill="#E5C158"/>
              <circle cx="140" cy="22" r="2.5" fill="#FAF4E8"/>
            </svg>
          </div>
        `;
        centerpieceArtworkHtml = coupleCenterpieceHtml || `
          <div class="bengali-artwork-card reveal-scale">
            <div class="bengali-artwork-frame" style="background:#081329;">
              <img class="bengali-artwork-img" src="./assets/motifs/mandap-palki.png" alt="Royal Bengali Mandap &amp; Palki" style="object-fit:contain;padding:14px;" loading="lazy" decoding="async">
              <div class="bengali-artwork-ribbon">
                <span>Saat Paak · সাতপাকে বাঁধা শুভ বিবাহ</span>
              </div>
            </div>
            <div class="bengali-ornament-caption" style="color:#d8c49e;">
              <span>Royal Palki · Sacred Agni Mandap · 24K Gold Zari Silk</span>
            </div>
          </div>
        `;
      } else if (isBengaliKunjavan) {
        // Kunjavan Tuberose Animation & Entrance
        animationLayerHtml = `
          <div class="floating-petals-layer" aria-hidden="true">
            <span class="floating-petal petal-1">🌸</span>
            <span class="floating-petal petal-2">🌿</span>
            <span class="floating-petal petal-3">✨</span>
            <span class="floating-petal petal-4">🌸</span>
          </div>
        `;
        entranceArchHtml = `
          <div class="kunjavan-garland-canopy garland-breeze-sway" aria-hidden="true">
            <img src="./assets/template-06-arch.jpg" alt="Cascading Tuberose Garlands" loading="eager" />
          </div>
        `;
        centerpieceArtworkHtml = coupleCenterpieceHtml || `
          <div class="bengali-artwork-card reveal-scale">
            <div class="bengali-artwork-frame">
              <img class="bengali-artwork-img" src="./assets/template-06-palace.jpg" alt="Riverfront Rajbari Mandap Grounds" loading="lazy" decoding="async">
              <div class="bengali-artwork-ribbon">
                <span>Gaye Holud &amp; Utsav · গায়ে হলুদ</span>
              </div>
            </div>
            <div class="bengali-ornament-caption">
              <span>Fresh Rajnigandha Garlands · Shehnai Utsav · Coral Silk</span>
            </div>
          </div>
        `;
      } else if (isBengaliSwarna) {
        // Swarna Mukut Noir Animation & Entrance
        animationLayerHtml = `<div class="gold-foil-laser-sweep" style="position:absolute;inset:0;pointer-events:none;z-index:1;"></div>`;
        entranceArchHtml = `
          <div class="swarna-zenith-crest" style="padding-top:14px;" aria-hidden="true">
            <svg viewBox="0 0 100 44" width="70" height="32" fill="#FFE680" stroke="#D4AF37" stroke-width="0.8">
              <polygon points="50,4 58,26 42,26"/>
              <circle cx="50" cy="2" r="3"/>
              <path d="M25,32 C38,24 62,24 75,32 L70,38 L30,38 Z"/>
              <circle cx="34" cy="28" r="2.5"/>
              <circle cx="50" cy="26" r="3"/>
              <circle cx="66" cy="28" r="2.5"/>
            </svg>
          </div>
          ${KOLKA_CORNER_SVG('tl')}
          ${KOLKA_CORNER_SVG('tr')}
        `;
        centerpieceArtworkHtml = coupleCenterpieceHtml || `
          <div class="bengali-artwork-card reveal-scale">
            <div class="bengali-artwork-frame" style="background:#0f070c;">
              <img class="bengali-artwork-img" src="./assets/motifs/topor-mukut-kula.jpg" alt="24K Swarna Sholapith Mukut &amp; Topor" style="border:1.5px solid #D4AF37;filter:contrast(1.08) brightness(0.95);" loading="lazy" decoding="async">
              <div class="bengali-artwork-ribbon">
                <span>Boubhat &amp; Preeti Bhoj · প্রীতিভোজ</span>
              </div>
            </div>
            <div class="bengali-ornament-caption" style="color:#dfcebf;">
              <span>24K Sholapith Topor &amp; Mukut · Obsidian Noir · Haute Couture</span>
            </div>
          </div>
        `;
      } else {
        // Rajbari Heritage (Template-06 standard)
        animationLayerHtml = `
          <div class="petal-cascade-layer" aria-hidden="true">
            <span class="petal-cascade-item">🌸</span>
            <span class="petal-cascade-item">🌺</span>
            <span class="petal-cascade-item">✨</span>
            <span class="petal-cascade-item">🌸</span>
            <span class="petal-cascade-item">🌺</span>
          </div>
        `;
        entranceArchHtml = `
          <div class="card-arch-frame" aria-hidden="true"></div>
          <img src="./assets/motifs/kolar-gach-toran-clean.png" class="card-toran-banner" alt="Kolar Gach Toran" loading="eager" />
          <img src="./assets/motifs/paan-pata-alpona.png" class="card-corner-motif bl paan-pata-flourish" alt="" aria-hidden="true" />
          <img src="./assets/motifs/paan-pata-alpona.png" class="card-corner-motif br paan-pata-flourish" alt="" aria-hidden="true" />
        `;
        centerpieceArtworkHtml = coupleCenterpieceHtml || `
          <div class="bengali-artwork-card reveal-scale">
            <div class="bengali-artwork-frame bengali-jharokha-frame">
              <img class="bengali-artwork-img" src="./assets/template-06-couple.webp" alt="Bengali Bride &amp; Groom in Banarasi Silk &amp; Topor-Mukut" loading="lazy" decoding="async">
              <div class="bengali-artwork-ribbon">
                <span>Shubho Bibaho · শুভ বিবাহ</span>
              </div>
            </div>
            <div class="bengali-ornament-caption">
              <span>Topor &amp; Mukut · Boran Dala / Kula · Alta Red Banarasi</span>
            </div>
          </div>
        `;
      }

      cardHtml = `
        <div class="token-card-stage cultural-layout-hindu ${themeClass}" data-cultural="hindu">
          <!-- Cultural Animation Layer -->
          ${animationLayerHtml}

          <!-- Background Motif Layer -->
          <div class="token-card-motif-layer hindu-motif-layer" aria-hidden="true"></div>

          <!-- Card Arch Frame & Corner Motifs -->
          ${entranceArchHtml}

          <!-- SCREEN 1: Front Cover / Main Invitation Presentation -->
          <section class="card-front-cover hindu-cover-arch" id="card-cover" role="region" aria-label="Wedding Invitation Front Cover">
            <div class="bengali-pacing-wrap">
              <!-- Auspicious Inscription -->
              <div class="bengali-top-inscription">${hinduInvocation}</div>

              <!-- Traditional Calligraphy Header with subtle glowing gold shadow -->
              <div class="bengali-calligraphy-header">${bengaliCalligraphy}</div>

              <!-- Subtitle -->
              <div class="bengali-ceremony-subtitle">${hinduCeremony}</div>

              <!-- Monogram Crest with couple initials and gold shimmer effect -->
              <div class="bengali-monogram-seal gold-sheen-sweep" id="card-monogram-seal" aria-label="Couple Monogram">
                <span class="monogram-text">${monogram}</span>
              </div>

              <!-- Bride & Groom names with balanced letter-spacing -->
              <h1 class="bengali-couple-names">
                <span class="couple-name-first">${first}</span>
                <span class="cover-ampersand">&amp;</span>
                <span class="couple-name-second">${second}</span>
              </h1>

              <!-- Auspicious Date Pill -->
              <div class="cover-date-pill">
                <span>${dateStr}</span>
                ${timeStr ? ` · <span>${timeStr}</span>` : ''}
              </div>

              <!-- Shehnai/Dholak musicians illustration -->
              <div class="shehnai-musicians-crest" aria-hidden="true">
                <img src="./assets/motifs/shehnai-dholak-musicians.svg" alt="Auspicious Wedding Music" class="shehnai-musicians-img" style="mix-blend-mode: multiply;" />
              </div>
            </div>

            <!-- Single gold "Open Invitation →" CTA button -->
            <div class="cover-actions">
              <button type="button" class="btn-open-invitation" data-action="open-invitation" aria-label="Open wedding invitation">
                <span>Open Invitation →</span>
              </button>
            </div>
          </section>

          <!-- SCREEN 2: Centerpiece Celebration Details (Revealed After Envelope Unfold) -->
          <main class="token-card-canvas hindu-card-canvas" id="celebration-details" role="article" aria-label="Celebration Details">
            
            <!-- Centerpiece Authentic Bengali Artwork Frame -->
            ${centerpieceArtworkHtml}

            <!-- Paan Pata Alpona Section Divider -->
            <div class="paan-pata-divider-wrap" aria-hidden="true">
              <img src="./assets/motifs/paan-pata-alpona-clean.png" class="paan-pata-divider-img" alt="Alpona Divider" />
            </div>

            <!-- Auspicious Muhurat Countdown -->
            <section class="token-card__date-badge reveal-up">
              <span class="token-card__date-day">${dateStr}</span>
              <span class="token-card__date-sub">${timeStr} · Auspicious Lagna (শুভ লগ্ন)</span>
            </section>

            <div class="card-countdown-slot" data-countdown-date="${dateStr}"></div>

            <!-- Sacred Journey / Editorial Story -->
            ${state.story ? TokenTemplateController.renderStorySection(state.story, couple) : ''}

            <!-- Venue & Banquet Showcase -->
            ${state.show_venue_showcase || state.venue?.image ? TokenTemplateController.renderVenueShowcase(state.venue, timeStr) : `
              <section class="token-card__venue reveal-up">
                <h4>${venueName}</h4>
                <p>${venueLoc}</p>
              </section>
            `}

            <!-- Wedding Itinerary Events -->
            ${eventsHtml ? `<section class="token-card__events reveal-up reveal-stagger-parent" aria-label="Wedding Itinerary">${eventsHtml}</section>` : ''}

            <!-- Auspicious Shehnai & Dholak Musicians Footer Motif -->
            <div class="bengali-footer-musicians" aria-hidden="true">
              <img src="./assets/motifs/shehnai-dholak-musicians.svg" alt="Auspicious Wedding Music" class="footer-musicians-img" />
            </div>

            <!-- Replay Unbox Control -->
            <div class="replay-envelope-wrap">
              <button type="button" class="btn-replay-envelope" data-action="replay-unboxing" aria-label="Replay Unboxing Animation">
                <span>↺</span> <span>Replay Grand Unfolding</span>
              </button>
            </div>

            <!-- WhatsApp RSVP Action -->
            <footer class="token-card__footer reveal-up">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="token-card__cta btn-royal-interactive btn-foil-sweep">
                <span>Send RSVP via WhatsApp ↗</span>
              </a>
            </footer>
          </main>
        </div>
      `;
    } else if (isMuslim) {
      // =========================================================================
      // MUSLIM ARCHITECTURE (Noor-e-Jannat & Mughal Jaali)
      // Indo-Islamic Multi-Foil Arch, Bismillah, Crescent Star, Mughal Jaali Screen
      // =========================================================================
      const muslimCeremony = esc(state.ceremony_title || 'Dawat-e-Nikah & Walima');

      cardHtml = `
        <div class="token-card-stage cultural-layout-muslim" data-cultural="muslim">
          <!-- Repeating Mughal Lattice Jaali Screen Background Layer -->
          <div class="token-card-motif-layer mughal-jaali-layer" aria-hidden="true">${MUGHAL_JAALI_SVG}</div>

          <!-- SCREEN 1: Grand Cover / Virtual Envelope Unfold -->
          <section class="card-front-cover muslim-cover-arch" id="card-cover" role="region" aria-label="Islamic Shadi Invitation Front Cover">
            <div class="cover-flourish-top">
              ${CRESCENT_STAR_SVG}
              <div class="cover-bismillah-wrap">
                ${BISMILLAH_SVG}
              </div>
              <div class="cover-subhanallah">DAWAT-E-NIKAH &amp; WALIMA</div>
            </div>

            <div class="cover-centerpiece">
              <!-- Indo-Islamic Multi-Foil Arch Frame with Moroccan Corners -->
              <div class="muslim-multifoil-frame">
                ${CORNER_ARABESQUE('tl')}
                ${CORNER_ARABESQUE('tr')}
                ${CORNER_ARABESQUE('bl')}
                ${CORNER_ARABESQUE('br')}

                <div class="cover-monogram-medallion champagne-gold-glow gold-sheen-sweep" aria-label="Couple Monogram">
                  <span class="monogram-text">${monogram}</span>
                </div>

                <div class="cover-kicker">IN THE NAME OF ALLAH, THE MOST BENEFICENT</div>
                <div class="cover-ceremony-title">${muslimCeremony}</div>

                <h1 class="cover-couple-names token-foil-text gold-foil-sheen">
                  <span>${first}</span>
                  <span class="cover-ampersand">&amp;</span>
                  <span>${second}</span>
                </h1>

                <div class="cover-quran-verse">
                  “And We created you in pairs” · Surah An-Naba (78:8)
                </div>

                <div class="cover-date-pill">
                  <span>${dateStr}</span>
                  ${timeStr ? ` · <span>${timeStr}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- The Grand "Open Invitation" Gold Button -->
            <div class="cover-actions">
              <button type="button" class="royal-envelope-seal btn-open-card" data-action="open-invitation" aria-label="Open the royal invitation">
                <span class="seal-icon">☪️</span>
                <span class="seal-label">✦ Open Invitation ✦</span>
                <small class="seal-hint">Tap to Unfold Dawat-e-Nikah ↓</small>
              </button>
            </div>
          </section>

          <!-- SCREEN 2: Centerpiece Celebration Details (Revealed After Envelope Unfold) -->
          <main class="token-card-canvas muslim-card-canvas" id="celebration-details" role="article" aria-label="Nikah Celebrations">
            
            <!-- Multi-Foil Mihrab Header -->
            <header class="muslim-mihrab-header reveal-up">
              <h2 class="muslim-dawat-heading">Nikah Celebrations</h2>
              <p class="muslim-dawat-sub">Soliciting your gracious presence &amp; du'as</p>
            </header>

            <div class="token-card__divider gold-glimmer" aria-hidden="true">${ISLAMIC_STAR_DIVIDER_SVG}</div>

            <!-- Auspicious Taqreeb Countdown -->
            <section class="token-card__date-badge reveal-up">
              <span class="token-card__date-day">${dateStr}</span>
              <span class="token-card__date-sub">${timeStr} · Nikah &amp; Walima Ceremony</span>
            </section>

            <div class="card-countdown-slot" data-countdown-date="${dateStr}"></div>

            <!-- Nikah Journey / Editorial Story -->
            ${state.story ? TokenTemplateController.renderStorySection(state.story, couple) : ''}

            <!-- Venue & Banquet Showcase -->
            ${state.show_venue_showcase || state.venue?.image ? TokenTemplateController.renderVenueShowcase(state.venue, timeStr) : `
              <section class="token-card__venue reveal-up">
                <h4>${venueName}</h4>
                <p>${venueLoc}</p>
              </section>
            `}

            <!-- Taqreeb Itinerary Events -->
            ${eventsHtml ? `<section class="token-card__events reveal-up reveal-stagger-parent" aria-label="Taqreeb Events">${eventsHtml}</section>` : ''}

            <!-- WhatsApp RSVP Action -->
            <footer class="token-card__footer reveal-up">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="token-card__cta btn-royal-interactive btn-foil-sweep">
                <span>Send RSVP via WhatsApp ↗</span>
              </a>
            </footer>
          </main>
        </div>
      `;
    } else {
      // =========================================================================
      // UNIVERSAL / SIKH / ROYAL / FLORAL ARCHITECTURE
      // With Grand Cover & Virtual Envelope Unfold
      // =========================================================================
      const invoc = esc(state.invocation || 'Wedding Invitation');
      const ceremony = esc(state.ceremony_title || 'Celebration of Love');

      cardHtml = `
        <div class="token-card-stage cultural-layout-universal">
          <div class="token-card-motif-layer motif-pulse" aria-hidden="true"></div>

          <!-- SCREEN 1: Grand Cover / Virtual Envelope Unfold -->
          <section class="card-front-cover" id="card-cover" role="region" aria-label="Wedding Invitation Front Cover">
            <div class="cover-flourish-top">
              <div class="cover-invocation">${invoc}</div>
            </div>

            <div class="cover-centerpiece">
              <div class="token-card-canvas" style="padding: 24px 18px;">
                <div class="cover-monogram-medallion gold-foil-glow" aria-label="Couple Monogram">
                  <span class="monogram-text">${monogram}</span>
                </div>
                <div class="cover-kicker">CELEBRATION OF A LIFETIME</div>
                <div class="cover-ceremony-title">${ceremony}</div>
                <h1 class="cover-couple-names token-foil-text gold-foil-sheen">
                  <span>${first}</span>
                  <span class="cover-ampersand">&amp;</span>
                  <span>${second}</span>
                </h1>
                <div class="cover-date-pill">
                  <span>${dateStr}</span>
                  ${timeStr ? ` · <span>${timeStr}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="cover-actions">
              <button type="button" class="royal-envelope-seal btn-open-card" data-action="open-invitation" aria-label="Open the royal invitation">
                <span class="seal-icon">✦</span>
                <span class="seal-label">✦ Open Invitation ✦</span>
                <small class="seal-hint">Tap to Unfold Details ↓</small>
              </button>
            </div>
          </section>

          <!-- SCREEN 2: Celebration Details -->
          <main class="token-card-canvas" id="celebration-details" role="article" aria-label="Wedding Invitation">
            <header class="token-card__header reveal-up">
              <div class="token-card__invocation">${invoc}</div>
              <div class="token-card__ceremony">${ceremony}</div>
            </header>

            <section class="token-card__couple reveal-scale" aria-label="Couple Names">
              <span class="token-foil-text gold-foil-sheen">${first}</span>
              <span class="token-card__ampersand">&amp;</span>
              <span class="token-foil-text gold-foil-sheen">${second}</span>
            </section>

            <div class="token-card__divider reveal-motif gold-glimmer" aria-hidden="true">✦ ✧ ✦</div>

            <section class="token-card__date-badge reveal-up">
              <span class="token-card__date-day">${dateStr}</span>
              <span class="token-card__date-sub">${timeStr} · Auspicious Ceremony</span>
            </section>

            <div class="card-countdown-slot" data-countdown-date="${dateStr}"></div>

            ${state.story ? TokenTemplateController.renderStorySection(state.story, couple) : ''}

            ${state.show_venue_showcase || state.venue?.image ? TokenTemplateController.renderVenueShowcase(state.venue, timeStr) : `
              <section class="token-card__venue reveal-up">
                <h4>${venueName}</h4>
                <p>${venueLoc}</p>
              </section>
            `}

            ${eventsHtml ? `<section class="token-card__events reveal-up reveal-stagger-parent" aria-label="Wedding Itinerary">${eventsHtml}</section>` : ''}

            <footer class="token-card__footer reveal-up">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="token-card__cta btn-royal-interactive btn-foil-sweep">
                <span>Send RSVP via WhatsApp ↗</span>
              </a>
            </footer>
          </main>
        </div>
      `;
    }

    mountElement.innerHTML = cardHtml;

    // Attach Interactive 3D Wax Seal & Flap Opening Transition
    const openBtn = mountElement.querySelector('[data-action="open-invitation"]');
    const flapEl = mountElement.querySelector('#envelope-flap');
    const celebrationCanvas = mountElement.querySelector('#celebration-details');
    const replayBtn = mountElement.querySelector('[data-action="replay-unboxing"]');
    const monogramSeal = mountElement.querySelector('#card-monogram-seal');

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 1. Flip flap up 180deg (rotateX(180deg))
        if (flapEl) {
          flapEl.classList.add('is-flipped');
        }

        // 2. Animate wax seal button
        openBtn.classList.add('seal-unfolded');

        // 3. Smooth slide transition into phone frame
        if (celebrationCanvas) {
          celebrationCanvas.classList.add('is-unveiled');
          setTimeout(() => {
            if (typeof celebrationCanvas.scrollIntoView === 'function') {
              celebrationCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 350);
        }

        // 4. Subtle gold shimmer sweep across couple monogram after card settles (~850ms)
        setTimeout(() => {
          if (monogramSeal) {
            monogramSeal.classList.remove('gold-sheen-sweep');
            void monogramSeal.offsetWidth; // trigger reflow
            monogramSeal.classList.add('gold-sheen-sweep');
          }
        }, 850);
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (flapEl) flapEl.classList.remove('is-flipped');
        if (openBtn) openBtn.classList.remove('seal-unfolded');
        if (celebrationCanvas) celebrationCanvas.classList.remove('is-unveiled');
        const coverEl = mountElement.querySelector('#card-cover');
        if (coverEl && typeof coverEl.scrollIntoView === 'function') {
          coverEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Initialize Auspicious Live Countdown Clock if running in browser
    if (typeof mountElement.querySelector === 'function' && state.date) {
      const cdSlot = mountElement.querySelector('.card-countdown-slot');
      if (cdSlot) {
        try {
          new CountdownTimer({
            targetDate: state.date,
            container: cdSlot,
            eyebrow: isHindu ? 'Auspicious Muhurat In' : isMuslim ? 'Nikah Mubarak In' : 'Celebration Begins In'
          });
        } catch (err) {
          // Graceful fallback
        }
      }
    }
  }

  /**
   * Render Editorial 'Our Story' (How We Met) Section
   * Features graceful fallback medallion if no photo uploaded
   * @param {Object} [story={}]
   * @param {Object} [couple={}]
   * @returns {string} HTML markup
   */
  static renderStorySection(story = {}, couple = {}) {
    const esc = TokenTemplateController.escapeHtml;
    const bride = esc(couple.bride || 'Bride');
    const groom = esc(couple.groom || 'Groom');
    const initials = `${bride.charAt(0)} &amp; ${groom.charAt(0)}`;
    const dateStr = esc(story.date || 'October 18, 2023');
    const quote = esc(story.quote || '“One serendipitous afternoon over hot chai blossomed into shared dreams, unending laughter, and a love that feels like home.”');
    const narrative = esc(story.text || 'What began as a quiet conversation along the promenade soon unfolded into thousands of shared memories. Today, surrounded by our loved ones, we step together into our forever.');
    const storedCouple = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' ? (localStorage.getItem('wedding-couple-photo') || localStorage.getItem('wedding_couple_photo')) : '') || (typeof sessionStorage !== 'undefined' && typeof sessionStorage.getItem === 'function' ? (sessionStorage.getItem('wedding-couple-photo') || sessionStorage.getItem('onboard-couple-photo')) : '') || '';
    const photoUrl = esc(story.image || couple.photo || storedCouple || '');

    const photoHtml = photoUrl ? `
      <figure class="story-photo-frame">
        <img class="story-photo-img" src="${photoUrl}" alt="${bride} &amp; ${groom}" loading="lazy" decoding="async">
      </figure>
    ` : `
      <figure class="story-photo-frame">
        <div class="story-photo-fallback">
          <div class="story-fallback-monogram">${initials}</div>
          <p class="story-fallback-text">United by Destiny</p>
        </div>
      </figure>
    `;

    return `
      <section class="token-story-editorial reveal-up" aria-label="Our Story">
        <header class="story-editorial-header">
          <span class="story-pretitle">✦ Chapter One ✦</span>
          <h3 class="story-title">How We Met</h3>
          <span class="story-date-badge">${dateStr}</span>
        </header>

        <div class="story-layout-grid">
          ${photoHtml}
          <div class="story-content-wrap">
            <blockquote class="story-pull-quote">${quote}</blockquote>
            <p class="story-narrative">${narrative}</p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render Editorial 'Venue & Banquet' Showcase
   * Features architectural arch fallback when no photo uploaded
   * @param {Object} [venue={}]
   * @param {string} [timeStr='7:00 PM']
   * @returns {string} HTML markup
   */
  static renderVenueShowcase(venue = {}, timeStr = '7:00 PM') {
    const esc = TokenTemplateController.escapeHtml;
    const venueName = esc(venue.name || 'Royal Heritage Palace');
    const hallName = esc(venue.hall || 'Grand Ballroom & Courtyard');
    const address = esc(venue.address || 'Riverfront Heritage Estate');
    const city = esc(venue.city || 'Kolkata, India');
    const mapUrl = venue.map_url ? esc(venue.map_url) : `https://maps.google.com/?q=${encodeURIComponent(`${venueName}, ${address}, ${city}`)}`;
    const storedVenue = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' ? (localStorage.getItem('wedding-venue-photo') || localStorage.getItem('wedding_venue_photo')) : '') || (typeof sessionStorage !== 'undefined' && typeof sessionStorage.getItem === 'function' ? (sessionStorage.getItem('wedding-venue-photo') || sessionStorage.getItem('onboard-venue-photo')) : '') || '';
    const photoUrl = esc(venue.image || venue.photo || storedVenue || '');

    const photoHtml = photoUrl ? `
      <figure class="venue-photo-frame">
        <img class="venue-photo-img" src="${photoUrl}" alt="${venueName}" loading="lazy" decoding="async">
        <div class="venue-timing-ribbon">
          <span class="venue-timing-badge">${esc(timeStr)} Onwards</span>
        </div>
      </figure>
    ` : `
      <figure class="venue-photo-frame">
        <div class="venue-photo-fallback">
          <div class="venue-fallback-arch"></div>
          <h4 class="venue-fallback-title">${venueName}</h4>
          <span class="venue-timing-badge">${esc(timeStr)} Onwards</span>
        </div>
      </figure>
    `;

    return `
      <section class="token-venue-showcase reveal-up" aria-label="Venue and Banquet">
        <header class="venue-header">
          <span class="venue-pretitle">✦ Location &amp; Banquet ✦</span>
          <h3 class="venue-title">Venue &amp; Celebration Grounds</h3>
        </header>

        <article class="venue-card">
          ${photoHtml}
          <div class="venue-details-body">
            <h4 class="venue-name">${venueName}</h4>
            <p class="venue-hall">${hallName}</p>
            <p class="venue-address">${address}, ${city}</p>
            <div class="venue-actions">
              <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="btn-venue-directions">
                <span>Get Driving Directions ↗</span>
              </a>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  /**
   * Switch template with zero DOM re-render: modifies CSS variables smoothly in place
   * @param {HTMLElement} mountElement
   * @param {string} templateId
   * @param {Object} [state=null]
   */
  switchTemplate(mountElement, templateId, state = null) {
    if (!this.templates.has(templateId)) {
      console.warn(`[TokenTemplateController] Cannot switch to unknown template ID: "${templateId}"`);
      return;
    }
    this.activeTemplateId = templateId;
    this.applyTokens(mountElement, templateId);

    const activeState = state || this._lastState;
    if (activeState && mountElement) {
      this.render(mountElement, activeState);
    }
  }
}
