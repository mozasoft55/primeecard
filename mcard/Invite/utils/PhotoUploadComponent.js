/**
 * ============================================================================
 * PhotoUploadComponent.js — UI Upload Component Manager with Instant Preview
 * Handles Couple/Story & Venue/Banquet Photo Uploads + Live WebP Compression
 * ============================================================================
 */

import { compressImage, validateImageFile, formatBytes } from './image-compressor.js';

export class PhotoUploadComponent {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - Root container element or CSS selector
   * @param {number} [options.maxWidth=1200] - Max bounding box for canvas downscaling
   * @param {number} [options.quality=0.8] - WebP quality factor (0.0 to 1.0)
   * @param {Function} [options.onPhotoReady] - Callback when photo is successfully compressed: (type, result) => void
   * @param {Function} [options.onError] - Callback on error: (type, error) => void
   */
  constructor({
    container,
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

    this.maxWidth = maxWidth;
    this.quality = quality;
    this.onPhotoReady = onPhotoReady;
    this.onPhotoRemoved = onPhotoRemoved;
    this.onError = onError;

    // Stores compressed result payloads per slot: 'couple' | 'venue'
    this.state = {
      couple: null,
      venue: null
    };

    if (this.container) {
      this.render();
      this._attachEvents();
    }
  }

  /**
   * Render HTML Structure for both Couple and Venue photo upload slots
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="photo-upload-section" role="region" aria-label="Photo Upload & Optimization">
        
        <!-- Slot 1: Couple / Story Photo -->
        <article class="photo-upload-card" data-slot="couple">
          <header class="photo-upload-head">
            <h4 class="photo-upload-title">
              <span>💑</span> Couple / Story Photo
            </h4>
            <span class="photo-upload-badge">Portrait (3:4)</span>
          </header>

          <!-- Dropzone Area -->
          <div class="photo-dropzone" data-slot="couple" tabindex="0" role="button" aria-label="Upload Couple Photo">
            <input
              type="file"
              class="photo-dropzone__input"
              data-slot="couple"
              accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
              aria-label="Select couple or story photograph"
            />
            <span class="photo-dropzone__icon" aria-hidden="true">📷</span>
            <p class="photo-dropzone__prompt">Drag & drop or browse photo</p>
            <p class="photo-dropzone__subtext">High-res portrait photos (JPG, PNG, WebP up to 25MB). Auto-compressed to ~180KB.</p>
          </div>

          <!-- Preview & Compression Stats Container (Initially hidden) -->
          <div class="photo-preview-slot" data-slot="couple" hidden>
            <div class="photo-preview-wrap" data-aspect="portrait">
              <span class="photo-preview-tag" id="couple-preview-tag">
                <span>⚡</span> Compressing...
              </span>
              <img class="photo-preview-img" id="couple-preview-img" alt="Couple photo preview" />
              <div class="photo-processing-overlay" id="couple-spinner">
                <div class="photo-spinner"></div>
                <span>Optimizing WebP...</span>
              </div>
            </div>

            <!-- Compression Analytics Bar -->
            <div class="photo-stats-bar" id="couple-stats-bar">
              <div class="photo-stats-row">
                <span class="photo-stats-label">Original File:</span>
                <span class="photo-stats-value" id="couple-orig-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Compressed WebP:</span>
                <span class="photo-stats-value" id="couple-comp-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Optimization:</span>
                <span class="photo-stats-badge" id="couple-ratio">—</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="photo-actions-row">
              <button type="button" class="photo-action-btn" data-action="replace" data-slot="couple">
                🔄 Replace Photo
              </button>
              <button type="button" class="photo-action-btn photo-action-btn--danger" data-action="remove" data-slot="couple">
                🗑️ Remove
              </button>
            </div>
          </div>

          <!-- Inline Error Banner -->
          <div class="photo-error-banner" id="couple-error" hidden role="alert">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span class="photo-error-text"></span>
          </div>
        </article>

        <!-- Slot 2: Venue / Banquet Photo -->
        <article class="photo-upload-card" data-slot="venue">
          <header class="photo-upload-head">
            <h4 class="photo-upload-title">
              <span>🏛️</span> Venue / Banquet Photo
            </h4>
            <span class="photo-upload-badge">Landscape (16:9)</span>
          </header>

          <!-- Dropzone Area -->
          <div class="photo-dropzone" data-slot="venue" tabindex="0" role="button" aria-label="Upload Venue Photo">
            <input
              type="file"
              class="photo-dropzone__input"
              data-slot="venue"
              accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
              aria-label="Select venue or banquet photograph"
            />
            <span class="photo-dropzone__icon" aria-hidden="true">🏰</span>
            <p class="photo-dropzone__prompt">Drag & drop or browse photo</p>
            <p class="photo-dropzone__subtext">Palace, Mandap, or Hall landscape photo. Auto-optimized to crisp 1200px WebP.</p>
          </div>

          <!-- Preview & Compression Stats Container (Initially hidden) -->
          <div class="photo-preview-slot" data-slot="venue" hidden>
            <div class="photo-preview-wrap" data-aspect="landscape">
              <span class="photo-preview-tag" id="venue-preview-tag">
                <span>⚡</span> Compressing...
              </span>
              <img class="photo-preview-img" id="venue-preview-img" alt="Venue photo preview" />
              <div class="photo-processing-overlay" id="venue-spinner">
                <div class="photo-spinner"></div>
                <span>Optimizing WebP...</span>
              </div>
            </div>

            <!-- Compression Analytics Bar -->
            <div class="photo-stats-bar" id="venue-stats-bar">
              <div class="photo-stats-row">
                <span class="photo-stats-label">Original File:</span>
                <span class="photo-stats-value" id="venue-orig-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Compressed WebP:</span>
                <span class="photo-stats-value" id="venue-comp-size">—</span>
              </div>
              <div class="photo-stats-row">
                <span class="photo-stats-label">Optimization:</span>
                <span class="photo-stats-badge" id="venue-ratio">—</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="photo-actions-row">
              <button type="button" class="photo-action-btn" data-action="replace" data-slot="venue">
                🔄 Replace Photo
              </button>
              <button type="button" class="photo-action-btn photo-action-btn--danger" data-action="remove" data-slot="venue">
                🗑️ Remove
              </button>
            </div>
          </div>

          <!-- Inline Error Banner -->
          <div class="photo-error-banner" id="venue-error" hidden role="alert">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span class="photo-error-text"></span>
          </div>
        </article>

      </div>
    `;
  }

  /**
   * Bind DOM event listeners with drag and drop delegation
   * @private
   */
  _attachEvents() {
    if (!this.container) return;

    // 1. File change listener
    this.container.addEventListener('change', (e) => {
      const input = e.target.closest('.photo-dropzone__input');
      if (!input || !input.files || input.files.length === 0) return;

      const slot = input.getAttribute('data-slot');
      const file = input.files[0];
      this.processFile(slot, file);
    });

    // 2. Drag & Drop visual states
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

    // 3. Action Buttons (Replace / Remove)
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

  /**
   * Process a selected file: instant local preview + background canvas compression
   * 
   * @param {string} slot - 'couple' | 'venue'
   * @param {File} rawFile
   */
  async processFile(slot, rawFile) {
    this._clearError(slot);

    // 1. Fast Validation
    try {
      validateImageFile(rawFile);
    } catch (err) {
      this._showError(slot, err.message);
      if (typeof this.onError === 'function') this.onError(slot, err);
      return;
    }

    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
    const previewSlot = this.container.querySelector(`.photo-preview-slot[data-slot="${slot}"]`);
    const previewImg = document.getElementById(`${slot}-preview-img`);
    const spinner = document.getElementById(`${slot}-spinner`);
    const tag = document.getElementById(`${slot}-preview-tag`);

    // 2. Instant Local Preview (0ms latency via raw Object URL before compression)
    const instantLocalUrl = URL.createObjectURL(rawFile);
    if (dropzone) dropzone.hidden = true;
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

    // 3. Run HTML5 Canvas Downscale & WebP Compression
    try {
      const result = await compressImage(rawFile, this.maxWidth, this.quality);

      // Clean up preliminary raw object URL
      URL.revokeObjectURL(instantLocalUrl);

      // Store in component state
      this.state[slot] = result;

      // Update image src to the final compressed WebP blob URL
      if (previewImg) {
        previewImg.src = result.previewUrl;
      }

      // Hide spinner & set success tag
      if (spinner) spinner.style.display = 'none';
      if (tag) {
        tag.className = 'photo-preview-tag is-success';
        tag.innerHTML = `<span>✓</span> WebP (${result.width}×${result.height})`;
      }

      // Populate live compression analytics
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
      // Clean up preliminary URL
      URL.revokeObjectURL(instantLocalUrl);
      this.resetSlot(slot);
      this._showError(slot, err.message || 'Image compression failed.');
      if (typeof this.onError === 'function') this.onError(slot, err);
    }
  }

  /**
   * Reset slot back to clean dropzone state
   * @param {string} slot - 'couple' | 'venue'
   */
  resetSlot(slot) {
    if (this.state[slot]?.previewUrl) {
      URL.revokeObjectURL(this.state[slot].previewUrl);
    }
    this.state[slot] = null;

    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
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
    this._clearError(slot);
    if (typeof this.onPhotoRemoved === 'function') {
      this.onPhotoRemoved(slot);
    }
  }

  /**
   * Populate an existing saved photo (e.g. from localStorage/sessionStorage)
   * @param {string} slot - 'couple' | 'venue'
   * @param {string} url - Image data URL or source URL
   * @param {string} [label='Saved Photo']
   */
  loadExisting(slot, url, label = 'Saved Photo') {
    if (!url || !this.container) return;
    const dropzone = this.container.querySelector(`.photo-dropzone[data-slot="${slot}"]`);
    const previewSlot = this.container.querySelector(`.photo-preview-slot[data-slot="${slot}"]`);
    const previewImg = document.getElementById(`${slot}-preview-img`);
    const spinner = document.getElementById(`${slot}-spinner`);
    const tag = document.getElementById(`${slot}-preview-tag`);

    if (dropzone) dropzone.hidden = true;
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

  /**
   * Get compressed file ready for FormData append
   * @param {string} slot - 'couple' | 'venue'
   * @returns {File|null}
   */
  getFile(slot) {
    return this.state[slot]?.file ?? null;
  }

  /**
   * Get full compression report payload
   * @param {string} slot
   * @returns {Object|null}
   */
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

  /**
   * Clean up all generated Object URLs and DOM listeners
   */
  destroy() {
    ['couple', 'venue'].forEach(slot => {
      if (this.state[slot]?.previewUrl) {
        URL.revokeObjectURL(this.state[slot].previewUrl);
      }
    });
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

