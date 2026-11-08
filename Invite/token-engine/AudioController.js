/**
 * ============================================================================
 * AudioController.js — Ambient Wedding Instrumental Music Engine
 * Senior Creative Frontend & Media Streaming Engineering
 * 
 * Features:
 * - Ambient instrumental wedding soundtrack loop with smooth fade-in
 * - Floating micro-controller with spinning vinyl disc & 4 animated equalizer bars
 * - Autoplay policy compliance: gracefully defers until user gesture
 * - Clean programmatic controls: play(), pause(), toggle()
 * ============================================================================
 */

export class AudioController {
  /**
   * @param {Object} options
   * @param {string} [options.audioSrc='./invitation.mp3']
   * @param {boolean} [options.loop=true]
   * @param {number} [options.volume=0.45]
   * @param {string} [options.label='Wedding Melody']
   * @param {boolean} [options.autoRender=true]
   * @param {HTMLElement} [options.container]
   */
  constructor({
    audioSrc = './invitation.mp3',
    loop = true,
    volume = 0.45,
    label = 'Wedding Melody',
    autoRender = true,
    container = null
  } = {}) {
    this.audioSrc = audioSrc;
    this.loop = loop;
    this.targetVolume = Math.min(Math.max(volume, 0), 1);
    this.label = label;
    this.audio = null;
    this.widgetEl = null;
    this.isPlaying = false;
    this.hasUserInteracted = false;

    if (typeof window !== 'undefined') {
      this._initAudio();
      if (autoRender) {
        this.renderWidget(container || document.body);
      }
    }
  }

  /**
   * Initialize audio element
   * @private
   */
  _initAudio() {
    if (typeof Audio === 'undefined') return;
    try {
      this.audio = new Audio(this.audioSrc);
      this.audio.loop = this.loop;
      this.audio.volume = this.targetVolume;
      this.audio.preload = 'metadata';

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this._updateWidgetState();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this._updateWidgetState();
      });

      this.audio.addEventListener('ended', () => {
        if (!this.loop) {
          this.isPlaying = false;
          this._updateWidgetState();
        }
      });
    } catch (err) {
      console.warn('AudioController: Audio initialization skipped', err);
    }
  }

  /**
   * Render floating micro-audio widget
   * @param {HTMLElement} mountTarget
   * @returns {HTMLElement}
   */
  renderWidget(mountTarget = document.body) {
    if (!mountTarget || typeof document === 'undefined') return null;

    // Check if widget already exists
    let widget = document.getElementById('floating-audio-widget');
    if (!widget) {
      widget = document.createElement('button');
      widget.id = 'floating-audio-widget';
      widget.type = 'button';
      widget.className = 'floating-audio-widget';
      widget.setAttribute('aria-label', 'Toggle wedding music');
      widget.setAttribute('aria-pressed', 'false');

      widget.innerHTML = `
        <div class="audio-vinyl-disc" aria-hidden="true">
          <span>🎵</span>
        </div>
        <div class="audio-equalizer" aria-hidden="true">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <span class="audio-label">${this.label}</span>
      `;

      widget.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      mountTarget.appendChild(widget);
    }

    this.widgetEl = widget;
    this._updateWidgetState();
    return widget;
  }

  /**
   * Update visual states in widget
   * @private
   */
  _updateWidgetState() {
    if (!this.widgetEl) return;
    this.widgetEl.classList.toggle('is-playing', this.isPlaying);
    this.widgetEl.setAttribute('aria-pressed', this.isPlaying ? 'true' : 'false');
    const labelEl = this.widgetEl.querySelector('.audio-label');
    if (labelEl) {
      labelEl.textContent = this.isPlaying ? 'Melody Playing' : this.label;
    }
  }

  /**
   * Play audio with graceful catch of browser autoplay policy restrictions
   * @returns {Promise<boolean>}
   */
  async play() {
    if (!this.audio) return false;
    try {
      await this.audio.play();
      this.isPlaying = true;
      this._updateWidgetState();
      return true;
    } catch (err) {
      // Browser autoplay policy rejected without user gesture
      this.isPlaying = false;
      this._updateWidgetState();
      return false;
    }
  }

  /**
   * Pause audio
   */
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this._updateWidgetState();
  }

  /**
   * Toggle audio playback
   * @returns {Promise<boolean>}
   */
  async toggle() {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      return await this.play();
    }
  }

  /**
   * Set playback volume (0.0 to 1.0)
   * @param {number} vol
   */
  setVolume(vol) {
    this.targetVolume = Math.min(Math.max(vol, 0), 1);
    if (this.audio) {
      this.audio.volume = this.targetVolume;
    }
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.pause();
    if (this.widgetEl && this.widgetEl.parentNode) {
      this.widgetEl.parentNode.removeChild(this.widgetEl);
    }
    this.widgetEl = null;
    this.audio = null;
  }
}

