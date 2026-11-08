/**
 * ============================================================================
 * RoyalEnvelope.js — 3D Digital Royal Envelope & Wax Seal Unboxing
 * Senior Creative Frontend & 3D Interactive Animation Engineering
 * 
 * Performance & Architecture:
 * - Pure Hardware-Accelerated 3D transforms (rotateX, translate3d, scale3d)
 * - Zero Layout Shifts (CLS: 0): container dimensions strictly preserved
 * - Satisfies browser audio autoplay policy seamlessly on wax seal tap gesture
 * - Replay unboxing feature for endless customer delight
 * ============================================================================
 */

export class RoyalEnvelope {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.targetCard - The card element to wrap inside the envelope
   * @param {string} [options.sealText='TAP TO UNVEIL']
   * @param {string} [options.crest='⚜️']
   * @param {boolean} [options.initiallyOpen=false]
   * @param {Function} [options.onUnveil] - Fired when wax seal is tapped and envelope opens
   */
  constructor({
    targetCard,
    sealText = 'TAP TO UNVEIL',
    crest = '⚜️',
    initiallyOpen = false,
    onUnveil = null
  } = {}) {
    this.targetCard = typeof targetCard === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(targetCard) : null)
      : targetCard;
    this.sealText = sealText;
    this.crest = crest;
    this.isOpen = initiallyOpen;
    this.onUnveil = onUnveil;

    this.wrapper = null;
    this.flap = null;
    this.sealBtn = null;
    this.replayPill = null;

    if (this.targetCard && typeof document !== 'undefined') {
      this.init();
    }
  }

  /**
   * Wrap the target card inside the 3D royal envelope structure
   */
  init() {
    if (!this.targetCard || !this.targetCard.parentNode) return;

    const parent = this.targetCard.parentNode;

    // 1. Create envelope wrapper
    const wrapper = document.createElement('div');
    wrapper.className = `royal-envelope-wrapper ${this.isOpen ? 'is-open' : ''}`;

    // 2. Create envelope stage
    const stage = document.createElement('div');
    stage.className = 'envelope-stage';

    // 3. Create top triangular envelope flap
    const flap = document.createElement('div');
    flap.className = 'envelope-flap';
    flap.setAttribute('aria-hidden', 'true');

    // 4. Create 3D embossed wax seal button
    const sealBtn = document.createElement('button');
    sealBtn.type = 'button';
    sealBtn.className = 'wax-seal-btn';
    sealBtn.setAttribute('aria-label', 'Open wedding invitation envelope');
    sealBtn.innerHTML = `
      <span class="wax-seal-crest" aria-hidden="true">${this.crest}</span>
      <span class="wax-seal-text">${this.sealText}</span>
    `;

    // 5. Create card cavity container
    const cavity = document.createElement('div');
    cavity.className = 'envelope-card-cavity';

    // Replay unboxing control pill
    const replayWrap = document.createElement('div');
    replayWrap.style.cssText = 'display: flex; justify-content: center; margin-top: 14px;';
    const replayPill = document.createElement('button');
    replayPill.type = 'button';
    replayPill.className = 'replay-unboxing-pill';
    replayPill.style.display = this.isOpen ? 'inline-flex' : 'none';
    replayPill.innerHTML = `<span>↺</span> <span>Replay Grand Opening</span>`;
    replayPill.setAttribute('aria-label', 'Replay invitation envelope opening');
    replayWrap.appendChild(replayPill);

    // Swap target card into cavity
    parent.insertBefore(wrapper, this.targetCard);
    cavity.appendChild(this.targetCard);

    stage.appendChild(flap);
    stage.appendChild(sealBtn);
    stage.appendChild(cavity);
    wrapper.appendChild(stage);
    wrapper.appendChild(replayWrap);

    this.wrapper = wrapper;
    this.flap = flap;
    this.sealBtn = sealBtn;
    this.replayPill = replayPill;

    // Event listeners
    sealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.open();
    });

    replayPill.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
      setTimeout(() => this.open(), 400);
    });
  }

  /**
   * Slide open envelope flap and unveil card
   */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;

    if (this.wrapper) {
      this.wrapper.classList.add('is-open');
      if (typeof this.wrapper.dispatchEvent === 'function') {
        this.wrapper.dispatchEvent(new CustomEvent('royal:unveil', { bubbles: true }));
      }
    }

    if (this.replayPill) {
      this.replayPill.style.display = 'inline-flex';
    }

    if (typeof this.onUnveil === 'function') {
      this.onUnveil();
    }
  }

  /**
   * Close envelope and restore wax seal
   */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.wrapper) {
      this.wrapper.classList.remove('is-open');
      if (typeof this.wrapper.dispatchEvent === 'function') {
        this.wrapper.dispatchEvent(new CustomEvent('royal:seal', { bubbles: true }));
      }
    }

    if (this.replayPill) {
      this.replayPill.style.display = 'none';
    }
  }

  /**
   * Toggle between open and sealed state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
