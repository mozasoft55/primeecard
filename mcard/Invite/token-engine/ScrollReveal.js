/**
 * ============================================================================
 * ScrollReveal.js — Lightweight, Non-Blocking Scroll-Triggered Reveal Engine
 * Senior Frontend Performance & Animation Engineering
 * 
 * Performance & Architecture:
 * - Single shared IntersectionObserver instance (O(1) observation overhead)
 * - One-shot reveals: unobserves targets immediately after trigger
 * - Automatic transition-end cleanup: releases `will-change` to reclaim GPU memory
 * - Progressive Enhancement: Instant visibility if JS is off or IO unsupported
 * - Respects OS 'prefers-reduced-motion' accessibility setting
 * ============================================================================
 */

export class ScrollReveal {
  /**
   * @param {Object} options
   * @param {string} [options.selector='.reveal-up, .reveal-fade, .reveal-scale, .reveal-motif']
   * @param {string} [options.rootMargin='0px 0px -50px 0px'] - Triggers slightly before element enters view
   * @param {number|number[]} [options.threshold=0.12]
   * @param {boolean} [options.once=true] - Unobserve immediately after reveal
   * @param {HTMLElement} [options.root=null] - Scroll root container (default: viewport)
   */
  constructor({
    selector = '.reveal-up, .reveal-fade, .reveal-scale, .reveal-motif',
    rootMargin = '0px 0px -50px 0px',
    threshold = 0.12,
    once = true,
    root = null
  } = {}) {
    this.selector = selector;
    this.rootMargin = rootMargin;
    this.threshold = threshold;
    this.once = once;
    this.root = root;
    this.observer = null;
    this.observedElements = new Set();
    this.isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window;
    this.prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    this.init();
  }

  /**
   * Initialize observer and register reveal candidates
   * @param {HTMLElement|Document} [context=document]
   */
  init(context = typeof document !== 'undefined' ? document : null) {
    if (!context || !this.isSupported) return;

    // 1. Accessibility guardrail: If user prefers reduced motion, reveal everything instantly
    if (this.prefersReducedMotion) {
      this.revealAll(context);
      return;
    }

    // 2. Mark document element as JS ready for CSS transitions (avoids flash of invisible content)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('js-reveal-ready');
    }

    // 3. Create shared single IntersectionObserver instance
    this.observer = new IntersectionObserver(
      (entries) => this._handleIntersection(entries),
      {
        root: this.root,
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );

    // 4. Discover and observe all elements matching selector
    this.observeAll(context);
  }

  /**
   * Observe all elements matching the target selector within given root
   * @param {HTMLElement|Document} [rootContext=document]
   */
  observeAll(rootContext = document) {
    if (!this.observer || !rootContext) return;

    const elements = rootContext.querySelectorAll(this.selector);
    elements.forEach(el => this.observe(el));
  }

  /**
   * Observe an individual element
   * @param {HTMLElement} element
   */
  observe(element) {
    if (!element || !(element instanceof HTMLElement) || !this.observer) return;
    if (this.observedElements.has(element)) return;

    // Check if element is already revealed
    if (element.classList.contains('is-revealed')) return;

    this.observer.observe(element);
    this.observedElements.add(element);
  }

  /**
   * Intersection callback handler
   * @private
   */
  _handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.reveal(entry.target);
      }
    });
  }

  /**
   * Trigger reveal on an element
   * @param {HTMLElement} target
   */
  reveal(target) {
    if (!target) return;

    // Add revealed class to trigger hardware-accelerated CSS transition
    target.classList.add('is-revealed');

    // One-shot optimization: stop observing to free CPU/GPU cycles
    if (this.once && this.observer) {
      this.observer.unobserve(target);
      this.observedElements.delete(target);
    }

    // Settle handler: clear will-change after transition completes to reclaim GPU memory
    const onTransitionEnd = (e) => {
      if (e.target === target) {
        target.classList.add('is-settled');
        target.removeEventListener('transitionend', onTransitionEnd);
      }
    };
    target.addEventListener('transitionend', onTransitionEnd, { once: true });

    // Dispatch Custom Event for external hooks
    target.dispatchEvent(new CustomEvent('reveal', {
      bubbles: true,
      detail: { target }
    }));
  }

  /**
   * Force instant reveal on all elements (bypasses observer, useful for prints)
   * @param {HTMLElement|Document} [rootContext=document]
   */
  revealAll(rootContext = document) {
    if (!rootContext) return;
    const elements = rootContext.querySelectorAll(this.selector);
    elements.forEach(el => {
      el.classList.add('is-revealed');
      el.classList.add('is-settled');
      if (this.observer) this.observer.unobserve(el);
    });
    this.observedElements.clear();
  }

  /**
   * Teardown observer and release references
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.observedElements.clear();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('js-reveal-ready');
    }
  }
}
