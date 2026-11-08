/**
 * ============================================================================
 * TemplateSelector — Responsive, High-Performance Template Selector Component
 * Features:
 *   - Instant Filtering: 'All', 'Hindu', 'Muslim', 'Sikh', 'Royal', 'Floral'
 *   - Non-Restrictive Logic: Default community pre-selected without locking
 *   - High Performance: Lightweight catalog cards, zero CLS, lazy loaded images
 *   - Event Delegation: Single click listener, zero memory leaks
 *   - Instant Token Swap: Dispatches 'template:select' and executes onSelect()
 * ============================================================================
 */

export class TemplateSelector {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.container - Mounting container or selector
   * @param {Array<Object>} options.templates - Templates catalog from templates.json
   * @param {string} [options.initialCommunity='All'] - Default community filter (non-restrictive)
   * @param {string} [options.activeTemplateId] - ID of initially selected template
   * @param {string} [options.assetBasePath=''] - Base path prefix for thumbnails if needed
   * @param {Function} [options.onSelect] - Callback when a template is selected: (template, event) => void
   * @param {boolean} [options.enableSearch=true] - Whether to show the instant search bar
   */
  constructor({
    container,
    templates = [],
    initialCommunity = 'Hindu',
    activeTemplateId = null,
    assetBasePath = '',
    onSelect = null,
    onMobilePreview = null,
    enableSearch = true
  } = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container && typeof document !== 'undefined') {
      throw new Error('[TemplateSelector] Target container element is required.');
    }

    this.templates = Array.isArray(templates) ? templates : [];
    this.categories = ['Hindu', 'Muslim', 'Sikh', 'Royal', 'Floral', 'All'];
    
    // Non-restrictive default filter: matches initialCommunity if valid, otherwise 'All'
    this.activeFilter = this._normalizeCommunity(initialCommunity);
    this.searchQuery = '';
    this.assetBasePath = assetBasePath;
    this.onSelect = onSelect;
    this.onMobilePreview = onMobilePreview;
    this.enableSearch = enableSearch;

    // Active selected template ID (defaults to first matching or first catalog entry)
    this.selectedTemplateId = activeTemplateId || (this.templates[0] ? this.templates[0].id : null);

    this.debouncedSearchTimer = null;
    this.shimmerTimer = null;
    this.boundHandleGridClick = this._handleGridClick.bind(this);
    this.boundHandleGridKeyDown = this._handleGridKeyDown.bind(this);
    this.boundHandleTabClick = this._handleTabClick.bind(this);
    this.boundHandleTabKeyDown = this._handleTabKeyDown.bind(this);
    this.boundHandleSearchInput = this._handleSearchInput.bind(this);
    this.boundHandleClearSearch = this._handleClearSearch.bind(this);

    if (this.container) {
      this.render();
      this._attachEvents();
    }
  }

  /**
   * Normalize community string to match one of the available category pills
   * @private
   */
  _normalizeCommunity(comm) {
    if (!comm) return 'Hindu';
    const lower = comm.trim().toLowerCase();
    const match = this.categories.find(c => c.toLowerCase() === lower);
    if (match) return match;
    if (lower.includes('hindu')) return 'Hindu';
    if (lower.includes('muslim')) return 'Muslim';
    if (lower.includes('sikh')) return 'Sikh';
    if (lower.includes('royal')) return 'Royal';
    if (lower.includes('floral')) return 'Floral';
    if (lower === 'all') return 'All';
    return 'Hindu';
  }

  /**
   * Filter templates based on active category pill and search query
   * @returns {Array<Object>}
   */
  /**
   * Case-insensitive matching logic for categories and community
   * @private
   */
  _matchesCategory(t, category) {
    const activeFilter = (category || 'all').trim().toLowerCase();
    if (activeFilter === 'all') return true;
    if (Array.isArray(t.category)) {
      return t.category.some(c => String(c).trim().toLowerCase() === activeFilter);
    }
    const cat = String(t.category || t.community || '').trim().toLowerCase();
    return cat === activeFilter;
  }

  getFilteredTemplates() {
    const filter = this.activeFilter.toLowerCase();
    const query = this.searchQuery.trim().toLowerCase();

    return this.templates.filter(template => {
      // 1. Case-insensitive category filter matching
      if (!this._matchesCategory(template, this.activeFilter)) return false;

      // 2. Instant Search Matching (Title, Theme, Community, Tags)
      if (query.length > 0) {
        const title = (template.title || '').toLowerCase();
        const theme = (template.theme || '').toLowerCase();
        const comm = (template.community || '').toLowerCase();
        const tagsStr = Array.isArray(template.tags) ? template.tags.join(' ').toLowerCase() : '';

        const matchesQuery =
          title.includes(query) ||
          theme.includes(query) ||
          comm.includes(query) ||
          tagsStr.includes(query);

        if (!matchesQuery) return false;
      }

      return true;
    });
  }

  /**
   * Calculate count of templates matching a given category pill under current search query
   * @private
   */
  _getCategoryCount(category) {
    const catLower = category.toLowerCase();
    const query = this.searchQuery.trim().toLowerCase();

    return this.templates.filter(t => {
      if (!this._matchesCategory(t, category)) return false;

      if (query.length > 0) {
        const title = (t.title || '').toLowerCase();
        const theme = (t.theme || '').toLowerCase();
        const comm = (t.community || '').toLowerCase();
        const tagsStr = Array.isArray(t.tags) ? t.tags.join(' ').toLowerCase() : '';
        return title.includes(query) || theme.includes(query) || comm.includes(query) || tagsStr.includes(query);
      }
      return true;
    }).length;
  }

  /**
   * Render gold shimmer skeleton boxes (aspect ratio 3:4) during transitions
   * @param {number} [count=4]
   * @private
   */
  _renderSkeletonHtml(count = 4) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(`
        <div class="ts-card ts-card--skeleton" aria-hidden="true">
          <div class="ts-card__thumb-wrap ts-skeleton-shimmer"></div>
          <div class="ts-card__meta">
            <div class="ts-skeleton-line ts-skeleton-line--title ts-skeleton-shimmer"></div>
            <div class="ts-skeleton-line ts-skeleton-line--sub ts-skeleton-shimmer"></div>
          </div>
        </div>
      `);
    }
    return items.join('');
  }

  /**
   * Escape helper to prevent XSS
   * @static
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
   * Resolve thumbnail URL with optional assetBasePath
   * @private
   */
  _resolveThumbnailUrl(thumb) {
    if (!thumb) return '';
    if (thumb.startsWith('data:') || thumb.startsWith('http://') || thumb.startsWith('https://')) {
      return thumb;
    }
    if (this.assetBasePath) {
      const cleanPath = thumb.replace(/^(\.\/|\.\.\/)?assets\//, '');
      return `${this.assetBasePath.replace(/\/$/, '')}/${cleanPath}`;
    }
    return thumb;
  }

  /**
   * Render complete selector DOM structure
   */
  render() {
    if (!this.container) return;

    const esc = TemplateSelector.escapeHtml;
    const filtered = this.getFilteredTemplates();

    // 1. Build Filter Pills HTML
    const pillsHtml = this.categories.map(cat => {
      const isSelected = this.activeFilter.toLowerCase() === cat.toLowerCase();
      const count = this._getCategoryCount(cat);
      const icon = this._getCategoryIcon(cat);

      return `
        <button
          type="button"
          role="tab"
          class="ts-tab-pill ${isSelected ? 'is-active' : ''}"
          data-category="${esc(cat)}"
          aria-selected="${isSelected ? 'true' : 'false'}"
          tabindex="${isSelected ? '0' : '-1'}"
          id="ts-tab-${esc(cat.toLowerCase())}"
          aria-controls="ts-grid"
        >
          <span>${icon}</span>
          <span>${esc(cat)}</span>
          <span class="ts-tab-count" aria-label="${count} templates">${count}</span>
        </button>
      `;
    }).join('');

    // 2. Render Cards or Empty State
    const gridHtml = this._renderGridCardsHtml(filtered);

    // 3. Assemble Full Component HTML
    this.container.innerHTML = `
      <section class="template-selector" aria-label="Wedding Card Template Catalog">
        <header class="ts-header">
          <div class="ts-header__title-group">
            <h3 class="ts-header__title">
              <span>✦</span> Choose Template & Theme
            </h3>
            <p class="ts-header__subtitle">
              Token-driven instant preview • Explore across cultural traditions
            </p>
          </div>

          ${this.enableSearch ? `
            <div class="ts-search-wrap">
              <svg class="ts-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                class="ts-search-input"
                id="ts-search-input"
                placeholder="Search templates, styles, colors..."
                value="${esc(this.searchQuery)}"
                aria-label="Search wedding card templates"
                autocomplete="off"
                spellcheck="false"
              />
              ${this.searchQuery ? `
                <button type="button" class="ts-search-clear" id="ts-search-clear" aria-label="Clear search">✕</button>
              ` : ''}
            </div>
          ` : ''}
        </header>

        <nav class="ts-filter-bar" aria-label="Filter templates by tradition">
          <div class="ts-tablist" role="tablist" aria-label="Template traditions">
            ${pillsHtml}
          </div>
        </nav>

        <div class="ts-status-bar">
          <span class="ts-status-count">
            ${filtered.length} template${filtered.length === 1 ? '' : 's'} available
          </span>
          <span class="ts-status-hint">Click card to switch design</span>
        </div>

        <div class="ts-grid" id="ts-grid" role="region" aria-label="Templates Grid">
          ${gridHtml}
        </div>
      </section>
    `;

    this._setupImageLoaders();
  }

  /**
   * Return visual iconography for each category pill
   * @private
   */
  _getCategoryIcon(category) {
    switch (category.toLowerCase()) {
      case 'hindu': return '🕉️';
      case 'muslim': return '☪️';
      case 'sikh': return '☬';
      case 'royal': return '👑';
      case 'floral': return '🌸';
      case 'all': return '✨';
      default: return '✦';
    }
  }

  /**
   * Return luxury theme badge based on template metadata or tags
   * @param {Object} template
   * @returns {string}
   * @private
   */
  _getLuxuryBadge(template) {
    if (template.themeBadge) return template.themeBadge;
    const id = (template.id || '').toLowerCase();
    const tags = Array.isArray(template.tags) ? template.tags.map(t => t.toLowerCase()) : [];
    if (id.includes('darbar') || id.includes('crimson') || tags.includes('royal')) {
      return 'Ultra Royal';
    }
    if (id.includes('emerald') || id.includes('anand') || tags.includes('velvet')) {
      return 'Foil Shimmer';
    }
    if (id.includes('alta') || id.includes('vedic') || tags.includes('traditional')) {
      return 'Heritage';
    }
    if (id.includes('floral') || id.includes('blush') || tags.includes('floral')) {
      return 'Bespoke Floral';
    }
    return 'Imperial Edition';
  }

  /**
   * Render HTML string for the thumbnail cards grid
   * Zero heavy invitation markup or redundant CSS tokens included!
   * @private
   */
  _renderGridCardsHtml(templates) {
    const esc = TemplateSelector.escapeHtml;

    if (templates.length === 0) {
      return `
        <div class="ts-empty-state" role="status">
          <span class="ts-empty-state__icon" aria-hidden="true">⚜️</span>
          <p class="ts-empty-state__msg">No templates found matching your search.</p>
          <button type="button" class="ts-empty-state__btn" id="ts-reset-filter-btn">
            View All Templates
          </button>
        </div>
      `;
    }

    return templates.map(template => {
      const isSelected = this.selectedTemplateId === template.id;
      const thumbUrl = this._resolveThumbnailUrl(template.thumbnail);
      const community = esc(template.community || 'Universal');
      const title = esc(template.title || 'Wedding Card');
      const theme = esc(template.theme || 'Royal Design');
      const luxuryBadge = esc(this._getLuxuryBadge(template));

      return `
        <article
          class="ts-card ${isSelected ? 'is-selected' : ''}"
          data-template-id="${esc(template.id)}"
          role="button"
          tabindex="0"
          aria-selected="${isSelected ? 'true' : 'false'}"
          aria-label="${title} — ${community} wedding invitation design"
        >
          <div class="ts-card__thumb-wrap">
            <img
              class="ts-card__thumb"
              src="${esc(thumbUrl)}"
              alt="${title} preview thumbnail"
              loading="lazy"
              decoding="async"
            />
            <span class="ts-card__badge-luxury" aria-hidden="true">${luxuryBadge}</span>
            <span class="ts-card__badge">${community}</span>
            <span class="ts-card__check" aria-hidden="true">✓</span>
            <button
              type="button"
              class="ts-card__mobile-btn"
              data-action="mobile-preview"
              data-template-id="${esc(template.id)}"
              aria-label="Inspect ${title} in realistic smartphone frame"
            >
              📱 Mobile Frame
            </button>
          </div>

          <div class="ts-card__meta">
            <h4 class="ts-card__title" title="${title}">${title}</h4>
            <p class="ts-card__theme" title="${theme}">${theme}</p>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Attach image load listeners to trigger smooth fade-in and stop skeleton shimmer
   * @private
   */
  _setupImageLoaders() {
    if (!this.container) return;
    const images = this.container.querySelectorAll('.ts-card__thumb');

    images.forEach(img => {
      const wrap = img.closest('.ts-card__thumb-wrap');
      
      const onImageReady = () => {
        img.classList.add('is-loaded');
        if (wrap) wrap.classList.add('is-loaded');
      };

      if (img.complete && img.naturalWidth > 0) {
        onImageReady();
      } else {
        img.addEventListener('load', onImageReady, { once: true });
        // Graceful error fallback: inject royal gradient placeholder if 404
        img.addEventListener('error', () => {
          if (wrap) {
            wrap.classList.add('is-loaded');
            wrap.style.background = 'radial-gradient(circle at 50% 40%, #301721 0%, #120409 100%)';
          }
          img.style.display = 'none';
        }, { once: true });
      }
    });
  }

  /**
   * Wire up event listeners with event delegation for maximum performance
   * @private
   */
  _attachEvents() {
    if (!this.container) return;

    // 1. Grid delegation for Selection (Clicks)
    this.container.addEventListener('click', this.boundHandleGridClick);
    this.container.addEventListener('keydown', this.boundHandleGridKeyDown);

    // 2. Tablist delegation for Filtering
    this.container.addEventListener('click', this.boundHandleTabClick);
    this.container.addEventListener('keydown', this.boundHandleTabKeyDown);

    // 3. Search input & clear button
    this.container.addEventListener('input', this.boundHandleSearchInput);
    this.container.addEventListener('click', this.boundHandleClearSearch);
  }

  /**
   * Event Delegation: Single click listener on cards
   * @private
   */
  _handleGridClick(e) {
    // Check if empty-state reset button clicked
    if (e.target.closest('#ts-reset-filter-btn')) {
      this.resetFilters();
      return;
    }

    // Check if mobile preview action button clicked
    const mobileBtn = e.target.closest('[data-action="mobile-preview"]');
    if (mobileBtn) {
      e.stopPropagation();
      const templateId = mobileBtn.getAttribute('data-template-id');
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        this.triggerMobilePreview(template, e);
      }
      return;
    }

    const card = e.target.closest('.ts-card[data-template-id]');
    if (!card) return;

    const templateId = card.getAttribute('data-template-id');
    this.selectTemplate(templateId, e);
  }

  /**
   * Event Delegation: Keyboard Enter/Space support for cards
   * @private
   */
  _handleGridKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const mobileBtn = e.target.closest('[data-action="mobile-preview"]');
    if (mobileBtn) {
      e.preventDefault();
      e.stopPropagation();
      const templateId = mobileBtn.getAttribute('data-template-id');
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        this.triggerMobilePreview(template, e);
      }
      return;
    }

    const card = e.target.closest('.ts-card[data-template-id]');
    if (!card) return;

    e.preventDefault();
    const templateId = card.getAttribute('data-template-id');
    this.selectTemplate(templateId, e);
  }

  /**
   * Trigger the Full-Screen Mobile Smartphone Experience preview
   * @param {Object} template
   * @param {Event} [triggerEvent=null]
   */
  triggerMobilePreview(template, triggerEvent = null) {
    if (!template) return;
    this.selectTemplate(template.id, triggerEvent);

    const previewEvent = new CustomEvent('template:mobile-preview', {
      bubbles: true,
      cancelable: true,
      detail: {
        templateId: template.id,
        template,
        tokens: template.tokens,
        triggerEvent
      }
    });

    if (this.container) {
      this.container.dispatchEvent(previewEvent);
    }

    if (typeof this.onMobilePreview === 'function') {
      try {
        this.onMobilePreview(template, triggerEvent);
      } catch (err) {
        console.error('[TemplateSelector] Error inside onMobilePreview callback:', err);
      }
    }
  }

  /**
   * Filter Pill Click Delegation
   * @private
   */
  _handleTabClick(e) {
    const tab = e.target.closest('.ts-tab-pill[data-category]');
    if (!tab) return;

    const category = tab.getAttribute('data-category');
    this.setFilter(category);
  }

  /**
   * Filter Pill Arrow Navigation for Accessibility
   * @private
   */
  _handleTabKeyDown(e) {
    const tab = e.target.closest('.ts-tab-pill[data-category]');
    if (!tab) return;

    const tabs = Array.from(this.container.querySelectorAll('.ts-tab-pill'));
    const index = tabs.indexOf(tab);
    let nextIndex = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
      const category = nextTab.getAttribute('data-category');
      this.setFilter(category);
    }
  }

  /**
   * Search Input Handler with 50ms Debounce
   * @private
   */
  _handleSearchInput(e) {
    if (e.target.id !== 'ts-search-input') return;

    clearTimeout(this.debouncedSearchTimer);
    clearTimeout(this.shimmerTimer);
    const query = e.target.value;

    this.debouncedSearchTimer = setTimeout(() => {
      this.search(query);
    }, 50);
  }

  /**
   * Clear Search Button Handler
   * @private
   */
  _handleClearSearch(e) {
    if (!e.target.closest('#ts-search-clear')) return;
    this.search('');
    const input = this.container.querySelector('#ts-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  /**
   * Public API: Select a template by ID
   * Triggers lightweight token swap without DOM teardown
   *
   * @param {string} templateId
   * @param {Event} [triggerEvent=null]
   */
  selectTemplate(templateId, triggerEvent = null) {
    const template = this.templates.find(t => t.id === templateId || t.legacyId === templateId);
    if (!template) {
      console.warn(`[TemplateSelector] Template ID "${templateId}" not found in catalog.`);
      return;
    }

    // Re-entrancy guard to avoid recursive loops
    if (this._isSelecting) return;
    this._isSelecting = true;

    try {
      this.selectedTemplateId = template.id;

      // Fast In-Place DOM Update for Selection (Zero Layout Shift)
      if (this.container) {
        const allCards = this.container.querySelectorAll('.ts-card');
        allCards.forEach(card => {
          const cardId = card.getAttribute('data-template-id');
          const isMatch = cardId === template.id || cardId === template.legacyId;
          card.classList.toggle('is-selected', isMatch);
          card.setAttribute('aria-selected', isMatch ? 'true' : 'false');
          if (isMatch) {
            card.classList.remove('ts-card--pulse');
            void card.offsetWidth;
            card.classList.add('ts-card--pulse');
          }
        });
      }

      // 1. Dispatch Custom Event for decoupled architecture
      const selectEvent = new CustomEvent('template:select', {
        bubbles: true,
        cancelable: true,
        detail: {
          templateId: template.id,
          legacyId: template.legacyId,
          template: template,
          tokens: template.tokens,
          triggerEvent
        }
      });
      if (this.container) {
        this.container.dispatchEvent(selectEvent);
      }

      // 2. Invoke callback if supplied
      if (typeof this.onSelect === 'function') {
        try {
          this.onSelect(template, triggerEvent);
        } catch (err) {
          console.error('[TemplateSelector] Error inside onSelect callback:', err);
        }
      }
    } finally {
      this._isSelecting = false;
    }
  }

  /**
   * Public API: Set active category filter without locking or restricting
   * @param {string} category - 'All' | 'Hindu' | 'Muslim' | 'Sikh' | 'Royal' | 'Floral'
   */
  setFilter(category) {
    const normalized = this._normalizeCommunity(category);
    if (this.activeFilter === normalized) return;

    this.activeFilter = normalized;
    this._refreshView(true);
  }

  /**
   * Public API: Filter catalog by instant text search
   * @param {string} query
   */
  search(query) {
    this.searchQuery = String(query || '');
    this._refreshView();
  }

  /**
   * Public API: Reset all filters and search query back to 'All'
   */
  resetFilters() {
    this.activeFilter = 'All';
    this.searchQuery = '';
    this.render();
  }

  /**
   * Lightweight partial refresh: Updates tabs counts, status bar, and grid
   * Avoids full component teardown preserving input focus
   * @private
   */
  _refreshView(withShimmer = false) {
    if (!this.container) return;

    // 1. Update tab pills active state and counts
    const tabs = this.container.querySelectorAll('.ts-tab-pill');
    tabs.forEach(tab => {
      const cat = tab.getAttribute('data-category');
      const isSelected = this.activeFilter.toLowerCase() === cat.toLowerCase();
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      const countEl = tab.querySelector('.ts-tab-count');
      if (countEl) {
        const count = this._getCategoryCount(cat);
        countEl.textContent = String(count);
        countEl.setAttribute('aria-label', `${count} templates`);
      }
    });

    // 2. Update status bar count
    const filtered = this.getFilteredTemplates();
    const statusCountEl = this.container.querySelector('.ts-status-count');
    if (statusCountEl) {
      statusCountEl.textContent = `${filtered.length} template${filtered.length === 1 ? '' : 's'} available`;
    }

    // 3. Update grid inner HTML with Hard Isolation & Shimmer
    const gridEl = this.container.querySelector('#ts-grid');
    if (gridEl) {
      if (withShimmer) {
        clearTimeout(this.shimmerTimer);
        gridEl.innerHTML = this._renderSkeletonHtml(Math.min(Math.max(filtered.length, 2), 6));
        this.shimmerTimer = setTimeout(() => {
          const currentFiltered = this.getFilteredTemplates();
          gridEl.innerHTML = this._renderGridCardsHtml(currentFiltered);
          this._setupImageLoaders();
        }, 180);
      } else {
        gridEl.innerHTML = this._renderGridCardsHtml(filtered);
        this._setupImageLoaders();
      }
    }

    // 4. Update clear search button visibility
    const searchWrap = this.container.querySelector('.ts-search-wrap');
    if (searchWrap) {
      const existingClear = searchWrap.querySelector('#ts-search-clear');
      if (this.searchQuery.trim().length > 0) {
        if (!existingClear) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.className = 'ts-search-clear';
          clearBtn.id = 'ts-search-clear';
          clearBtn.setAttribute('aria-label', 'Clear search');
          clearBtn.textContent = '✕';
          searchWrap.appendChild(clearBtn);
        }
      } else if (existingClear) {
        existingClear.remove();
      }
    }
  }

  /**
   * Clean up event listeners and references
   */
  destroy() {
    clearTimeout(this.debouncedSearchTimer);
    clearTimeout(this.shimmerTimer);
    if (!this.container) return;

    this.container.removeEventListener('click', this.boundHandleGridClick);
    this.container.removeEventListener('keydown', this.boundHandleGridKeyDown);
    this.container.removeEventListener('click', this.boundHandleTabClick);
    this.container.removeEventListener('keydown', this.boundHandleTabKeyDown);
    this.container.removeEventListener('input', this.boundHandleSearchInput);
    this.container.removeEventListener('click', this.boundHandleClearSearch);
    this.container.innerHTML = '';
  }
}

