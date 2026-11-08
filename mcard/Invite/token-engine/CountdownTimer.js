/**
 * ============================================================================
 * CountdownTimer.js — Dynamic Live Auspicious Wedding Countdown
 * Senior Creative Frontend & Real-Time Clock Engineering
 * 
 * Features:
 * - Real-time countdown updating days, hours, minutes, seconds every second
 * - Precision millisecond calculation with zero layout shift
 * - Automatic formatting with leading zero padding
 * - Graceful past-date celebration message ("TODAY IS THE BIG DAY! 🎉")
 * - Clean lifecycle controls: start(), stop(), render(container)
 * ============================================================================
 */

export class CountdownTimer {
  /**
   * @param {Object} options
   * @param {string|Date|number} options.targetDate - Target wedding date/time
   * @param {HTMLElement|string} [options.container] - Optional DOM element or selector
   * @param {string} [options.eyebrow='Auspicious Muhurat In']
   * @param {Function} [options.onComplete] - Callback fired when countdown reaches zero
   */
  constructor({
    targetDate,
    container = null,
    eyebrow = 'Auspicious Muhurat In',
    onComplete = null
  } = {}) {
    this.targetDate = targetDate ? new Date(targetDate) : null;
    this.container = typeof container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(container) : null)
      : container;
    this.eyebrow = eyebrow;
    this.onComplete = onComplete;
    this.timerId = null;
    this.isComplete = false;

    // Elements cache
    this.daysEl = null;
    this.hoursEl = null;
    this.minsEl = null;
    this.secsEl = null;

    if (this.container && this.isValidDate()) {
      this.render(this.container);
      this.start();
    }
  }

  /**
   * Check if target date is a valid date object
   * @returns {boolean}
   */
  isValidDate() {
    return this.targetDate instanceof Date && !isNaN(this.targetDate.getTime());
  }

  /**
   * Calculate difference between now and target date
   * @returns {{ days: number, hours: number, minutes: number, seconds: number, totalMs: number, isPast: boolean }}
   */
  calculateTime() {
    if (!this.isValidDate()) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
    }

    const now = Date.now();
    const targetMs = this.targetDate.getTime();
    const totalMs = targetMs - now;

    if (totalMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
    }

    const totalSecs = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    return { days, hours, minutes, seconds, totalMs, isPast: false };
  }

  /**
   * Format number with two digits (e.g. 09)
   * @param {number} n
   * @returns {string}
   */
  static pad(n) {
    return Math.max(0, Math.floor(n)).toString().padStart(2, '0');
  }

  /**
   * Render countdown markup into container
   * @param {HTMLElement} targetContainer
   */
  render(targetContainer = this.container) {
    if (!targetContainer) return;
    this.container = targetContainer;

    const time = this.calculateTime();

    if (time.isPast) {
      targetContainer.innerHTML = `
        <div class="countdown-clock-wrap">
          <p class="countdown-clock-eyebrow">
            <span>✨</span> <span>${this.eyebrow}</span> <span>✨</span>
          </p>
          <div class="countdown-grid">
            <div class="countdown-tile" style="min-width: 140px; padding: 12px;">
              <span class="countdown-digit" style="font-size: 1.15rem; color: #fae19c;">CELEBRATING TODAY! 🎉</span>
              <span class="countdown-label">The Wedding Day</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    targetContainer.innerHTML = `
      <div class="countdown-clock-wrap" role="timer" aria-label="Wedding countdown clock">
        <p class="countdown-clock-eyebrow">
          <span>✨</span> <span>${this.eyebrow}</span> <span>✨</span>
        </p>
        <div class="countdown-grid">
          <div class="countdown-tile">
            <span class="countdown-digit" data-cd="days">${CountdownTimer.pad(time.days)}</span>
            <span class="countdown-label">Days</span>
          </div>
          <span class="countdown-sep" aria-hidden="true">:</span>
          <div class="countdown-tile">
            <span class="countdown-digit" data-cd="hours">${CountdownTimer.pad(time.hours)}</span>
            <span class="countdown-label">Hours</span>
          </div>
          <span class="countdown-sep" aria-hidden="true">:</span>
          <div class="countdown-tile">
            <span class="countdown-digit" data-cd="mins">${CountdownTimer.pad(time.minutes)}</span>
            <span class="countdown-label">Mins</span>
          </div>
          <span class="countdown-sep" aria-hidden="true">:</span>
          <div class="countdown-tile">
            <span class="countdown-digit" data-cd="secs">${CountdownTimer.pad(time.seconds)}</span>
            <span class="countdown-label">Secs</span>
          </div>
        </div>
      </div>
    `;

    // Cache element references for sub-millisecond updates
    this.daysEl = targetContainer.querySelector('[data-cd="days"]');
    this.hoursEl = targetContainer.querySelector('[data-cd="hours"]');
    this.minsEl = targetContainer.querySelector('[data-cd="mins"]');
    this.secsEl = targetContainer.querySelector('[data-cd="secs"]');
  }

  /**
   * Update numbers directly in the DOM
   */
  update() {
    const time = this.calculateTime();

    if (time.isPast) {
      this.stop();
      if (!this.isComplete) {
        this.isComplete = true;
        this.render(this.container);
        if (typeof this.onComplete === 'function') {
          this.onComplete();
        }
      }
      return;
    }

    const dStr = CountdownTimer.pad(time.days);
    const hStr = CountdownTimer.pad(time.hours);
    const mStr = CountdownTimer.pad(time.minutes);
    const sStr = CountdownTimer.pad(time.seconds);

    if (this.daysEl && this.daysEl.textContent !== dStr) this.daysEl.textContent = dStr;
    if (this.hoursEl && this.hoursEl.textContent !== hStr) this.hoursEl.textContent = hStr;
    if (this.minsEl && this.minsEl.textContent !== mStr) this.minsEl.textContent = mStr;
    if (this.secsEl && this.secsEl.textContent !== sStr) this.secsEl.textContent = sStr;
  }

  /**
   * Start live 1-second interval
   */
  start() {
    if (this.timerId) return;
    this.update();
    this.timerId = setInterval(() => this.update(), 1000);
  }

  /**
   * Stop interval
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Update target date and reset clock
   * @param {string|Date|number} newDate
   */
  setTargetDate(newDate) {
    this.targetDate = newDate ? new Date(newDate) : null;
    this.isComplete = false;
    this.render(this.container);
    this.start();
  }

  /**
   * Destroy timer instance
   */
  destroy() {
    this.stop();
    this.daysEl = null;
    this.hoursEl = null;
    this.minsEl = null;
    this.secsEl = null;
  }
}

