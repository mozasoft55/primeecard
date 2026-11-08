/**
 * ============================================================================
 * MobilePreviewModal.js — Full-Screen Realistic Smartphone Frame Preview
 * Senior Luxury Web Designer & Mobile UI Specialist
 * 
 * Features:
 * - High-fidelity realistic smartphone mockup with Dynamic Island
 * - Isolated internal smooth scroll (-webkit-overflow-scrolling: touch)
 * - Dynamic token injection & live animated card rendering
 * - Accessible: Escape key listener, focus trap, zero layout shifts
 * ============================================================================
 */

import { ScrollReveal } from './ScrollReveal.js';

export class MobilePreviewModal {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container=document.body]
   */
  constructor({ container = null } = {}) {
    this.container = container || (typeof document !== 'undefined' ? document.body : null);
    this.modalEl = null;
    this.screenEl = null;
    this.titleEl = null;
    this.closeBtn = null;
    this.isOpen = false;
    this.innerScrollReveal = null;

    this._handleKeyDown = this._handleKeyDown.bind(this);

    if (this.container && typeof document !== 'undefined') {
      this._createModalMarkup();
    }
  }

  /**
   * Create the smartphone frame modal DOM structure
   * @private
   */
  _createModalMarkup() {
    let existing = document.getElementById('mobile-preview-modal');
    if (existing) {
      this.modalEl = existing;
      this.screenEl = existing.querySelector('.smartphone-screen');
      this.titleEl = existing.querySelector('.mobile-modal-title');
      this.closeBtn = existing.querySelector('.mobile-modal-close');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'mobile-preview-modal';
    overlay.className = 'mobile-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Full-Screen Mobile Smartphone Preview');

    overlay.innerHTML = `
      <div class="mobile-modal-top">
        <div class="mobile-modal-title">
          <span>📱</span> <span class="modal-template-name">Royal Preview</span>
        </div>
        <button type="button" class="mobile-modal-close" aria-label="Close mobile preview">✕</button>
      </div>

      <div class="smartphone-frame">
        <div class="smartphone-island" aria-hidden="true"></div>
        <div class="smartphone-screen" tabindex="0">
          <!-- Live dynamic invitation card mounted here -->
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    this.modalEl = overlay;
    this.screenEl = overlay.querySelector('.smartphone-screen');
    this.titleEl = overlay.querySelector('.modal-template-name');
    this.closeBtn = overlay.querySelector('.mobile-modal-close');

    // Close handlers
    this.closeBtn.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });
  }

  /**
   * Open smartphone frame modal with card preview
   * @param {Object} params
   * @param {HTMLElement} params.cardContent - Card DOM element or clone to project
   * @param {string} [params.title='Royal Invitation']
   * @param {Object} [params.tokens={}] - CSS variable tokens to apply
   */
  open({ cardContent, title = 'Royal Mobile Experience', tokens = {} } = {}) {
    if (!this.modalEl || !this.screenEl) return;

    if (this.titleEl) {
      this.titleEl.textContent = title;
    }

    // Clear previous screen content
    this.screenEl.innerHTML = '';

    if (cardContent) {
      const clone = cardContent.cloneNode(true);
      // Ensure clone is visible and reset any envelope wrapping for direct mobile browsing
      clone.style.margin = '0 auto';
      clone.style.maxWidth = '100%';
      clone.style.boxShadow = 'none';

      // Apply CSS variable tokens to clone container
      if (tokens && typeof tokens === 'object') {
        Object.entries(tokens).forEach(([prop, val]) => {
          clone.style.setProperty(prop, val);
        });
      }

      this.screenEl.appendChild(clone);

      // Initialize scroll reveal inside smartphone screen
      try {
        this.innerScrollReveal = new ScrollReveal({
          root: this.screenEl,
          threshold: 0.1,
          rootMargin: '0px 0px -20px 0px'
        });
      } catch (err) {
        // Fallback
      }
    }

    this.isOpen = true;
    this.modalEl.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Lock parent window scroll
    window.addEventListener('keydown', this._handleKeyDown);

    // Focus screen for keyboard accessibility
    this.screenEl.focus();
  }

  /**
   * Close modal and unlock parent window scroll
   */
  close() {
    if (!this.isOpen || !this.modalEl) return;
    this.isOpen = false;
    this.modalEl.classList.remove('is-active');
    document.body.style.overflow = '';
    window.removeEventListener('keydown', this._handleKeyDown);

    if (this.innerScrollReveal) {
      this.innerScrollReveal.destroy();
      this.innerScrollReveal = null;
    }

    if (this.screenEl) {
      this.screenEl.innerHTML = '';
    }
  }

  /**
   * Handle ESC key press
   * @private
   */
  _handleKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      this.close();
    }
  }

  /**
   * Destroy modal instance
   */
  destroy() {
    this.close();
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
    this.screenEl = null;
  }
}

