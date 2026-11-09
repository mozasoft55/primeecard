/**
 * ============================================================================
 * PhotoUploadComponent.js — UI Upload Component Manager with Instant Preview
 * Handles Groom, Bride, Couple & Venue Photo Uploads + Live WebP Compression
 * ============================================================================
 */

import { compressImage, validateImageFile, formatBytes } from './image-compressor.js';

export const PHOTO_SLOTS = [
  {
    slot: 'groom',
    icon: '🤵',
    title: "Groom's Photograph",
    badge: 'Face Focus (1:1)',
    aspect: 'portrait',
    prompt: 'Upload Groom photograph',
    subtext: 'Central face focus portrait. Shows default royal groom if unuploaded.',
    defaultImg: '../assets/default-groom.webp'
  },
  {
    slot: 'bride',
    icon: '👰',
    title: "Bride's Photograph",
    badge: 'Face Focus (1:1)',
    aspect: 'portrait',
    prompt: 'Upload Bride photograph',
    subtext: 'Central face focus portrait. Shows default royal bride if unuploaded.',
    defaultImg: '../assets/default-bride.webp'
  },
  {
    slot: 'couple',
    icon: '💑',
    title: 'Couple / Story Photo',
    badge: 'Portrait (3:4)',
    aspect: 'portrait',
    prompt: 'Upload Couple photograph',
    subtext: 'High-res couple portrait. Auto-compressed to crisp WebP.',
    defaultImg: '../assets/template-06-couple.webp'
  },
  {
    slot: 'venue',
    icon: '🏛️',
    title: 'Venue / Banquet Photo',
    badge: 'Landscape (16:9)',
    aspect: 'landscape',
    prompt: 'Upload Venue photograph',
    subtext: 'Palace, Mandap, or Hall landscape photo.',
    defaultImg: '../assets/template-06-palace.jpg'
  }
];

export class PhotoUploadComponent {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - Root container element or CSS selector
   * @param {string[]} [options.slots] - Array of slots to display ['groom', 'bride', 'couple', 'venue']
   * @param {number} [options.maxWidth=1200] - Max bounding box for canvas downscaling
   * @param {number} [options.quality=0.8] - WebP quality factor (0.0 to 1.0)
   * @param {Function} [options.onPhotoReady] - Callback when photo is successfully compressed: (slot, result) => void
   * @param {Function} [options.onPhotoRemoved] - Callback when photo is removed: (slot) => void
   * @param {Function} [options.onError] - Callback on error: (slot, error) => void
   */
  constructor({
    container,
    slots = ['groom', 'bride', 'couple', 'venue'],
    maxWidth = 1200,
    quality = 0.8,
    onPhotoReady = null,
    onPhotoRemoved = null,
    onError = null
  } = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container && typeof document !== 'undefined') {
      throw new Error('[PhotoUploadComponent] Valid container element is required.');
    }

    this.slotIds = slots;
    this.slots = PHOTO_SLOTS.filter(s => slots.includes(s.slot));
    this.maxWidth = maxWidth;
    this.quality = quality;
    this.onPhotoReady = onPhotoReady;
    this.onPhotoRemoved = onPhotoRemoved;
    this.onError = onError;

    this.state = {};
    for (const s of this.slotIds) {
      this.state[s] = null;
    }

    if (this.container) {
      this.render();
      this._attachEvents();
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="photo-upload-section" role="region" aria-label="Photo Upload & Optimization">
        ${this.slots.map(conf => `
        <!-- Slot: ${conf.slot} -->
        <article class="photo-upload-card" data-slot="${conf.slot}">
          <header class="photo-upload-head">
            <h4 class="photo-upload-title">
              <span>${conf.icon}</span> ${conf.title}
            </h4>
            <span class="photo-upload-badge">${conf.badge}</span>
          </header>

          <!-- Default Preview Avatar (Active when no custom photo uploaded) -->
          <div class="photo-default-preview" data-slot="${conf.slot}">
            <div class="photo-default-wrap">
              <img class="photo-default-img" src="${conf.defaultImg}" alt="Default ${conf.title}">
              <span class="photo-default-badge">Default Preview</span>
            </div>
            <p class="photo-default-hint">Shown automatically if no custom photo is uploaded.</p>
          </div>

          <!-- Dropzone Area -->
          <div class="photo-dropzone" data-slot="${conf.slot}" tabindex="0" role="button" aria-label="Upload ${conf.title}">
            <input
              type="file"
              class="photo-dropzone__input"
              data-slot="${conf.slot}"
              accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
              aria-label="Select ${conf.title}"
            />
            <span class="photo-dropzone__icon" aria-hidden="true">📷</span>
            <p class="photo-dropzone__prompt">${conf.prompt}</p>
            <p class="photo-dropzone__subtext">${conf.subtext}</p>
          </div>

          <!-- Preview & Compression Stats Container (Initially hidden until uploaded) -->
          <div class="photo-preview-slot" data-slot="${conf.slot}" hidden>
            <div class="photo-preview-wrap" data-aspect="${conf.aspect}">
              <span class="photo-preview-tag" id="${conf.slot}-preview-tag">
                <span>⚡</span> Compressing...
              </span>
              <img class="photo-preview-img" id="${conf.slot}-preview-img" alt="${conf.title} preview" />
              <div class="photo-processing-overlay" id="${conf.slot}-spinner">
                <div class="photo-spinner"></div>
                <span>Optimizing WebP...</span>
              </div>
            </div>

            <!-- Compression Analytics Bar -->
            <div class="photo-stats-bar" id="${conf.slot}-stats-bar">
              <div class="photo-stats-row">
                <span class="photo-stats-label">Original File:</span>
                <span class="photo-stats-value" id="${conf.slot}-orig-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Compressed WebP:</span>
                <span class="photo-stats-value" id="${conf.slot}-comp-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Status:</span>
                <span class="photo-stats-badge" id="${conf.slot}-ratio">Uploaded</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="photo-actions-row">
              <button type="button" class="photo-action-btn" data-action="replace" data-slot="${conf.slot}">
                🔄 Replace Photo
              </button>
              <button type="button" class="photo-action-btn photo-action-btn--danger" data-action="remove" data-slot="${conf.slot}">
                🗑️ Remove (Use Default)
              </button>
            </div>
          </div>

          <!-- Inline Error Banner -->
          <div class="photo-error-banner" id="${conf.slot}-error" hidden role="alert">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span class="photo-error-text"></span>
          </div>
        </article>
        `).join('')}
      </div>
    `;
  }

  _attachEvents() {
    if (!this.container) return;

    this.container.addEventListener('change', (e) => {
      const input = e.target.closest('.photo-dropzone__input');
      if (!input || !input.files || input.files.length === 0) return;

      const slot = input.getAttribute('data-slot');
      const file = input.files[0];
      this.processFile(slot, file);
    });

    this.container.addEventListener('dragover', (e) => {
      const dropzone = e.target.closest('.photo-dropzone');
      if (dropzone) {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      }
    });

    this.container.addEventListener('dragleave', (e) => {
      const dropzone = e.target.closest('.photo-dropzone');
      if (dropzone) {
        dropzone.classList.remove('is-dragover');
      }
    });

    this.container.addEventListener('drop', (e) => {
      const dropzone = e.target.closest('.photo-dropzone');
      if (dropzone) {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          const slot = dropzone.getAttribute('data-slot');
          this.processFile(slot, files[0]);
        }
      }
    });

    this.container.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-action');
      const slot = actionBtn.getAttribute('data-slot');

      if (action === 'replace') {
        const input = this.container.querySelector(`.photo-dropzone__input[data-slot="${slot}"]`);
        if (input) {
          input.value = '';
          input.click();
        }
      } else if (action === 'remove') {
        this.resetSlot(slot);
      }
    });
  }

  async processFile(slot, rawFile) {
    this._clearError(slot);

    try {
      validateImageFile(rawFile);
    } catch (err) {
      this._showError(slot, err.message);
      if (typeof this.onError === 'function') this.onError(slot, err);
      return;
    }

    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
    const defaultPreview = this.container.querySelector(`.photo-default-preview[data-slot="${slot}"]`);
    const previewSlot = this.container.querySelector(`.photo-preview-slot[data-slot="${slot}"]`);
    const previewImg = document.getElementById(`${slot}-preview-img`);
    const spinner = document.getElementById(`${slot}-spinner`);
    const tag = document.getElementById(`${slot}-preview-tag`);

    const instantLocalUrl = URL.createObjectURL(rawFile);
    if (dropzone) dropzone.hidden = true;
    if (defaultPreview) defaultPreview.hidden = true;
    if (previewSlot) previewSlot.hidden = false;
    if (previewImg) {
      previewImg.src = instantLocalUrl;
      previewImg.classList.add('is-ready');
    }
    if (spinner) spinner.style.display = 'flex';
    if (tag) {
      tag.className = 'photo-preview-tag';
      tag.innerHTML = '<span>⚡</span> Compressing...';
    }

    try {
      const result = await compressImage(rawFile, this.maxWidth, this.quality);
      URL.revokeObjectURL(instantLocalUrl);

      this.state[slot] = result;

      if (previewImg) {
        previewImg.src = result.previewUrl;
      }

      if (spinner) spinner.style.display = 'none';
      if (tag) {
        tag.className = 'photo-preview-tag is-success';
        tag.innerHTML = `<span>✓</span> WebP (${result.width}×${result.height})`;
      }

      const origEl = document.getElementById(`${slot}-orig-size`);
      const compEl = document.getElementById(`${slot}-comp-size`);
      const ratioEl = document.getElementById(`${slot}-ratio`);

      if (origEl) origEl.textContent = result.originalFormatted;
      if (compEl) compEl.textContent = `${result.compressedFormatted} (WebP)`;
      if (ratioEl) ratioEl.textContent = `${result.compressionRatio} saved`;

      if (result.blob && typeof FileReader !== 'undefined') {
        try {
          result.dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(result.blob);
          });
        } catch (_) {}
      }

      if (typeof this.onPhotoReady === 'function') {
        this.onPhotoReady(slot, result);
      }
    } catch (err) {
      URL.revokeObjectURL(instantLocalUrl);
      this.resetSlot(slot);
      this._showError(slot, err.message || 'Image compression failed.');
      if (typeof this.onError === 'function') this.onError(slot, err);
    }
  }

  resetSlot(slot) {
    if (this.state[slot]?.previewUrl) {
      URL.revokeObjectURL(this.state[slot].previewUrl);
    }
    this.state[slot] = null;

    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
    const defaultPreview = this.container.querySelector(`.photo-default-preview[data-slot="${slot}"]`);
    const previewSlot = this.container.querySelector(`.photo-preview-slot[data-slot="${slot}"]`);
    const previewImg = document.getElementById(`${slot}-preview-img`);
    const input = this.container.querySelector(`.photo-dropzone__input[data-slot="${slot}"]`);

    if (input) input.value = '';
    if (previewImg) {
      previewImg.src = '';
      previewImg.classList.remove('is-ready');
    }
    if (previewSlot) previewSlot.hidden = true;
    if (dropzone) dropzone.hidden = false;
    if (defaultPreview) defaultPreview.hidden = false;
    this._clearError(slot);
    if (typeof this.onPhotoRemoved === 'function') {
      this.onPhotoRemoved(slot);
    }
  }

  loadExisting(slot, url, label = 'Saved Photo') {
    if (!url || !this.container) return;
    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
    const defaultPreview = this.container.querySelector(`.photo-default-preview[data-slot="${slot}"]`);
    const previewSlot = this.container.querySelector(`.photo-preview-slot[data-slot="${slot}"]`);
    const previewImg = document.getElementById(`${slot}-preview-img`);
    const spinner = document.getElementById(`${slot}-spinner`);
    const tag = document.getElementById(`${slot}-preview-tag`);

    if (dropzone) dropzone.hidden = true;
    if (defaultPreview) defaultPreview.hidden = true;
    if (previewSlot) previewSlot.hidden = false;
    if (previewImg) {
      previewImg.src = url;
      previewImg.classList.add('is-ready');
    }
    if (spinner) spinner.style.display = 'none';
    if (tag) {
      tag.className = 'photo-preview-tag is-success';
      tag.innerHTML = `<span>✓</span> Ready (${label})`;
    }
    this.state[slot] = {
      previewUrl: url,
      dataUrl: url,
      fileName: `${slot}-uploaded.webp`
    };
  }

  getFile(slot) {
    return this.state[slot]?.file ?? null;
  }

  getResult(slot) {
    return this.state[slot] ?? null;
  }

  _showError(slot, message) {
    const errorBanner = document.getElementById(`${slot}-error`);
    if (errorBanner) {
      const textEl = errorBanner.querySelector('.photo-error-text');
      if (textEl) textEl.textContent = message;
      errorBanner.hidden = false;
    }
  }

  _clearError(slot) {
    const errorBanner = document.getElementById(`${slot}-error`);
    if (errorBanner) {
      errorBanner.hidden = true;
    }
  }
}
