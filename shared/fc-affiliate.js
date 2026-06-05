/**
 * fc-affiliate.js  —  FriendCheck Affiliate Recommendation System
 * ─────────────────────────────────────────────────────────────────
 * Loads affiliateProducts.json and renders a product recommendation
 * strip based on the current result type.
 *
 * Usage:
 *   <!-- Include after fc-utils.js -->
 *   <script src="shared/fc-affiliate.js"></script>
 *
 *   <!-- Place container where you want the strip to appear -->
 *   <div id="fc-affiliate-strip"></div>
 *
 *   <!-- Render for a result key -->
 *   <script>
 *     FCAffiliate.render('fc-affiliate-strip', 'golden-friend');
 *   </script>
 *
 * Result key must match a top-level key in affiliateProducts.json.
 * Falls back to "default" if no match found.
 *
 * ── Result key map ────────────────────────────────────────────────
 *  Friendship Test tiers → tier title slug:
 *    "soulmate-bff" | "golden-friend" | "ride-or-die" | "emergency-friend"
 *    "bestie-material" | "food-only-friend" | "screenshot-friend"
 *    "fake-friend" | "ghost-friend" | "blocked-friend"
 *  Other pages:
 *    "roast" | "court" | "compatibility" | "prediction"
 *    "certificate" | "battle" | "fake-investigator" | "default"
 * ─────────────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  var DATA_URL = 'shared/affiliateProducts.json';
  var _cache   = null;  /* Loaded JSON data, cached after first fetch */

  /* ── Inject styles once ── */
  function _injectStyles() {
    if (document.getElementById('fc-affiliate-css')) return;
    var s = document.createElement('style');
    s.id = 'fc-affiliate-css';
    s.textContent = [
      /* Section wrapper */
      '.fc-aff-section{width:100%;max-width:900px;margin:2.5rem auto;padding:0 1rem;box-sizing:border-box;}',
      '.fc-aff-header{text-align:center;margin-bottom:1.25rem;}',
      '.fc-aff-headline{font-size:1.15rem;font-weight:800;color:var(--fc-text,#e5e2e3);',
        'font-family:var(--fc-font-body,"Plus Jakarta Sans",sans-serif);margin-bottom:.3rem;}',
      '.fc-aff-subtext{font-size:.82rem;color:var(--fc-muted,#8888aa);}',
      /* Grid */
      '.fc-aff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));',
        'gap:1rem;}',
      '@media(max-width:480px){.fc-aff-grid{grid-template-columns:1fr;}}',
      /* Card */
      '.fc-aff-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);',
        'border-radius:16px;padding:1.1rem 1.1rem 1rem;display:flex;flex-direction:column;',
        'gap:.5rem;position:relative;overflow:hidden;',
        'transition:transform .25s cubic-bezier(.25,.8,.25,1),box-shadow .25s,border-color .25s;',
        'will-change:transform;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}',
      '.fc-aff-card:hover{transform:translateY(-4px);',
        'box-shadow:0 16px 32px rgba(0,0,0,.45),0 0 16px rgba(162,89,255,.2);}',
      /* Accent bar */
      '.fc-aff-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;',
        'background:var(--fc-aff-color,#a259ff);opacity:.7;}',
      /* Badge */
      '.fc-aff-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;',
        'border-radius:99px;font-size:.65rem;font-weight:800;letter-spacing:.07em;',
        'text-transform:uppercase;background:rgba(255,255,255,.07);',
        'color:var(--fc-aff-color,#a259ff);width:fit-content;}',
      /* Product icon */
      '.fc-aff-emoji{font-size:1.6rem;line-height:1;}',
      /* Name */
      '.fc-aff-name{font-size:.92rem;font-weight:700;color:var(--fc-text,#e5e2e3);',
        'font-family:var(--fc-font-body,"Plus Jakarta Sans",sans-serif);line-height:1.3;}',
      /* Description */
      '.fc-aff-desc{font-size:.78rem;color:var(--fc-muted,#8888aa);line-height:1.5;flex-grow:1;}',
      /* Price + CTA row */
      '.fc-aff-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.3rem;}',
      '.fc-aff-price{font-size:.85rem;font-weight:800;color:var(--fc-aff-color,#a259ff);}',
      '.fc-aff-cta{display:inline-block;padding:.45rem 1rem;border-radius:10px;',
        'background:var(--fc-aff-color,#a259ff);color:#fff;font-size:.73rem;font-weight:800;',
        'text-decoration:none;letter-spacing:.06em;text-transform:uppercase;',
        'transition:opacity .18s,transform .18s;}',
      '.fc-aff-cta:hover{opacity:.85;transform:scale(1.04);}',
      /* Disclosure */
      '.fc-aff-disclosure{text-align:center;margin-top:.75rem;',
        'font-size:.68rem;color:var(--fc-muted,#8888aa);opacity:.6;}',
      /* Animate in */
      '@keyframes fc-aff-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}',
      '.fc-aff-card{animation:fc-aff-fade-up .4s cubic-bezier(.16,1,.3,1) both;}',
      '.fc-aff-card:nth-child(1){animation-delay:.05s}',
      '.fc-aff-card:nth-child(2){animation-delay:.12s}',
      '.fc-aff-card:nth-child(3){animation-delay:.19s}',
      '@media(prefers-reduced-motion:reduce){.fc-aff-card{animation:none;opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Slugify a tier title to a JSON key ── */
  function _titleToKey(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')   /* strip emoji / punctuation */
      .trim()
      .replace(/\s+/g, '-');
  }

  /* ── Load JSON (fetch with XHR fallback) ── */
  function _loadData(callback) {
    if (_cache) { callback(_cache); return; }

    if (window.fetch) {
      fetch(DATA_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) { _cache = data; callback(data); })
        .catch(function (e) { console.error('[FCAffiliate] Failed to load data:', e); });
    } else {
      /* XHR fallback for older browsers */
      var xhr = new XMLHttpRequest();
      xhr.open('GET', DATA_URL, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            _cache = JSON.parse(xhr.responseText);
            callback(_cache);
          } catch (e) { console.error('[FCAffiliate] JSON parse error:', e); }
        }
      };
      xhr.send();
    }
  }

  /* ── Build a single product card ── */
  function _buildCard(product, color) {
    var safeColor = color || '#a259ff';
    return (
      '<div class="fc-aff-card" style="--fc-aff-color:' + safeColor + '">' +
        '<div class="fc-aff-badge">' + product.badge + '</div>' +
        '<div class="fc-aff-emoji">' + product.emoji + '</div>' +
        '<div class="fc-aff-name">' + _esc(product.name) + '</div>' +
        '<div class="fc-aff-desc">'  + _esc(product.description) + '</div>' +
        '<div class="fc-aff-footer">' +
          '<span class="fc-aff-price">' + _esc(product.price) + '</span>' +
          '<a href="' + _esc(product.url) + '" class="fc-aff-cta" target="_blank" ' +
            'rel="sponsored noopener noreferrer">' + _esc(product.cta) + '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Escape HTML ── */
  function _esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Build full section HTML ── */
  function _buildSection(entry) {
    var cards = entry.products.map(function (p) {
      return _buildCard(p, p.color);
    }).join('');

    return (
      '<div class="fc-aff-section">' +
        '<div class="fc-aff-header">' +
          '<div class="fc-aff-headline">' + entry.headline + '</div>' +
          '<div class="fc-aff-subtext">'  + entry.subtext  + '</div>' +
        '</div>' +
        '<div class="fc-aff-grid">' + cards + '</div>' +
        '<p class="fc-aff-disclosure">Affiliate links — we may earn a small commission at no extra cost to you.</p>' +
      '</div>'
    );
  }

  /**
   * FCAffiliate.render(containerId, resultKey, options?)
   *
   * @param {string}  containerId  ID of the container element
   * @param {string}  resultKey    Key matching a top-level key in affiliateProducts.json
   *                               (e.g. "golden-friend", "food-only-friend", "roast")
   * @param {object}  [options]
   * @param {boolean} [options.fromTitle]  If true, resultKey is a raw tier title string
   *                                       and will be auto-slugified (e.g. "🏅 Golden Friend")
   */
  function render(containerId, resultKey, options) {
    _injectStyles();
    options = options || {};

    var container = document.getElementById(containerId);
    if (!container) { console.warn('[FCAffiliate] Container not found:', containerId); return; }

    var key = options.fromTitle ? _titleToKey(resultKey) : (resultKey || 'default');

    _loadData(function (data) {
      var entry = data[key] || data['default'];
      if (!entry) { console.warn('[FCAffiliate] No data for key:', key); return; }
      container.innerHTML = _buildSection(entry);
    });
  }

  /**
   * FCAffiliate.renderFromScore(containerId, percentage)
   * Convenience helper for friendship-test.html — pass the result percentage
   * and it auto-maps to the correct tier key.
   */
  function renderFromScore(containerId, percentage) {
    var key;
    if      (percentage >= 90) key = 'soulmate-bff';
    else if (percentage >= 80) key = 'golden-friend';
    else if (percentage >= 70) key = 'ride-or-die';
    else if (percentage >= 60) key = 'emergency-friend';
    else if (percentage >= 50) key = 'bestie-material';
    else if (percentage >= 40) key = 'food-only-friend';
    else if (percentage >= 30) key = 'screenshot-friend';
    else if (percentage >= 20) key = 'fake-friend';
    else if (percentage >= 10) key = 'ghost-friend';
    else                       key = 'blocked-friend';
    render(containerId, key);
  }

  /**
   * FCAffiliate.renderFromTitle(containerId, tierTitle)
   * Pass the raw tier title string from the allTiers array.
   * e.g. FCAffiliate.renderFromTitle('aff', '🏅 Golden Friend')
   */
  function renderFromTitle(containerId, tierTitle) {
    render(containerId, tierTitle, { fromTitle: true });
  }

  /* ── Expose globally ── */
  window.FCAffiliate = {
    render:          render,
    renderFromScore: renderFromScore,
    renderFromTitle: renderFromTitle,
  };

}(window));
