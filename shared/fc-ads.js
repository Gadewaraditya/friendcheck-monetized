/**
 * fc-ads.js  —  FriendCheck Adsterra Ad Components
 * ─────────────────────────────────────────────────
 * Lazy-loads Adsterra ad scripts only when the slot enters the viewport
 * (IntersectionObserver). Prevents CLS via reserved min-height on each slot.
 *
 * Exposes: window.FCAds
 *
 * Usage:
 *   <!-- 1. Include the script -->
 *   <script src="shared/fc-ads.js"></script>
 *
 *   <!-- 2. Place a slot container anywhere in your HTML -->
 *   <div id="ad-hero-banner"></div>
 *
 *   <!-- 3. Init each slot -->
 *   <script>
 *     FCAds.banner('ad-hero-banner', 'YOUR_ADSTERRA_BANNER_KEY');
 *     FCAds.native('ad-mid-content', 'YOUR_ADSTERRA_NATIVE_KEY');
 *     FCAds.footer('ad-footer', 'YOUR_ADSTERRA_FOOTER_KEY');
 *   </script>
 *
 * ── Placement guide ────────────────────────────────────────────────────────
 *  Homepage:      banner → after hero     | native → before footer
 *  Tool pages:    native → mid-content    | banner → before results
 *  Result pages:  native → after result card (+ affiliate below)
 * ─────────────────────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  /* ── Adsterra publisher ID — replace with your actual pub ID ── */
  var ADSTERRA_PUB = 'REPLACE_WITH_YOUR_ADSTERRA_PUBLISHER_ID';

  /* ── IntersectionObserver threshold ── */
  var IO_OPTS = { rootMargin: '200px 0px', threshold: 0 };

  /* ── Inject shared ad slot CSS once ── */
  function _injectStyles() {
    if (document.getElementById('fc-ads-css')) return;
    var s = document.createElement('style');
    s.id = 'fc-ads-css';
    s.textContent = [
      /* Shared wrapper */
      '.fc-ad-wrap{width:100%;display:flex;justify-content:center;align-items:center;',
        'overflow:hidden;position:relative;background:transparent;}',
      /* CLS prevention — height reserved before script loads */
      '.fc-ad-wrap[data-type="banner"]  { min-height:90px;  }',
      '.fc-ad-wrap[data-type="banner"].mobile-banner { min-height:50px; }',
      '.fc-ad-wrap[data-type="native"]  { min-height:250px; }',
      '.fc-ad-wrap[data-type="footer"]  { min-height:60px;  }',
      /* Subtle label */
      '.fc-ad-wrap::before{content:"Advertisement";position:absolute;top:4px;left:50%;',
        'transform:translateX(-50%);font-size:9px;letter-spacing:.1em;text-transform:uppercase;',
        'color:rgba(255,255,255,.18);pointer-events:none;white-space:nowrap;}',
      /* Sticky footer variant */
      '.fc-ad-footer-sticky{position:fixed;bottom:0;left:0;width:100%;z-index:900;',
        'background:rgba(9,6,15,.92);backdrop-filter:blur(12px);',
        '-webkit-backdrop-filter:blur(12px);',
        'border-top:1px solid rgba(255,255,255,.08);padding:4px 0;}',
      '.fc-ad-footer-sticky .fc-ad-close{position:absolute;top:4px;right:8px;',
        'background:rgba(255,255,255,.12);border:none;color:#fff;cursor:pointer;',
        'border-radius:50%;width:20px;height:20px;font-size:11px;line-height:20px;',
        'text-align:center;padding:0;transition:background .2s;}',
      '.fc-ad-footer-sticky .fc-ad-close:hover{background:rgba(255,255,255,.25);}',
      /* Section dividers */
      '.fc-ad-section{margin:2rem 0;padding:0 1rem;}',
      '.fc-ad-section-hero{margin:1.5rem 0 2.5rem;}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Build wrapper div with correct classes/data ── */
  function _makeWrapper(type, extraClass) {
    var div = document.createElement('div');
    div.className = 'fc-ad-wrap' + (extraClass ? ' ' + extraClass : '');
    div.setAttribute('data-type', type);
    div.setAttribute('aria-label', 'Advertisement');
    div.setAttribute('role', 'complementary');
    return div;
  }

  /* ── Lazy-load an Adsterra script via IntersectionObserver ── */
  function _lazyLoad(wrapper, scriptSrc, scriptAttr) {
    if (!('IntersectionObserver' in window)) {
      _loadScript(wrapper, scriptSrc, scriptAttr);
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          obs.unobserve(entry.target);
          _loadScript(wrapper, scriptSrc, scriptAttr);
        }
      });
    }, IO_OPTS);
    io.observe(wrapper);
  }

  function _loadScript(wrapper, src, attrs) {
    var sc = document.createElement('script');
    sc.async = true;
    sc.src = src;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        sc.setAttribute(k, attrs[k]);
      });
    }
    wrapper.appendChild(sc);
  }

  /* ════════════════════════════════════════════════════════════════
     FCAds.banner(containerId, adKey, options?)
     ────────────────────────────────────────────────────────────────
     Renders a display banner (728×90 desktop / 320×50 mobile).
     options.mobile  = true  → force 320×50 slot
     options.label   = false → hide "Advertisement" text
  ════════════════════════════════════════════════════════════════ */
  function banner(containerId, adKey, options) {
    _injectStyles();
    options = options || {};

    var container = document.getElementById(containerId);
    if (!container) { console.warn('[FCAds] banner: container not found:', containerId); return; }

    var isMobile = options.mobile || window.innerWidth < 768;
    var wrapper  = _makeWrapper('banner', isMobile ? 'mobile-banner' : '');
    container.appendChild(wrapper);

    /* Adsterra banner — replace REPLACE_WITH_BANNER_KEY with real key */
    var key = adKey || 'REPLACE_WITH_BANNER_KEY';
    var src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    _lazyLoad(wrapper, src, { 'data-cfasync': 'false' });
  }

  /* ════════════════════════════════════════════════════════════════
     FCAds.native(containerId, adKey, options?)
     ────────────────────────────────────────────────────────────────
     Native ad (recommended for mid-content and result page placements).
     Blends with the page's dark glass aesthetic.
  ════════════════════════════════════════════════════════════════ */
  function native(containerId, adKey, options) {
    _injectStyles();
    options = options || {};

    var container = document.getElementById(containerId);
    if (!container) { console.warn('[FCAds] native: container not found:', containerId); return; }

    var wrapper = _makeWrapper('native');
    container.appendChild(wrapper);

    var key = adKey || 'REPLACE_WITH_NATIVE_KEY';
    var src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    _lazyLoad(wrapper, src, { 'data-cfasync': 'false' });
  }

  /* ════════════════════════════════════════════════════════════════
     FCAds.footer(containerId, adKey, options?)
     ────────────────────────────────────────────────────────────────
     Footer / sticky footer banner (320×50 or 728×90).
     options.sticky  = true → fixed to bottom of viewport
     options.closeable = true → show × button (required for sticky)
  ════════════════════════════════════════════════════════════════ */
  function footer(containerId, adKey, options) {
    _injectStyles();
    options = options || {};

    var container = document.getElementById(containerId);
    if (!container) { console.warn('[FCAds] footer: container not found:', containerId); return; }

    var wrapClass = options.sticky ? 'fc-ad-footer-sticky' : '';
    var wrapper   = _makeWrapper('footer', wrapClass);

    if (options.sticky && options.closeable !== false) {
      var btn = document.createElement('button');
      btn.className   = 'fc-ad-close';
      btn.textContent = '✕';
      btn.setAttribute('aria-label', 'Close advertisement');
      btn.onclick = function () {
        var parent = wrapper.parentNode;
        if (parent) parent.removeChild(wrapper);
        /* Add bottom padding to body so content isn't hidden behind sticky */
        document.body.style.paddingBottom = '';
      };
      wrapper.appendChild(btn);

      /* Reserve space so content isn't clipped behind sticky bar */
      document.body.style.paddingBottom = '70px';
    }

    container.appendChild(wrapper);

    var key = adKey || 'REPLACE_WITH_FOOTER_KEY';
    var src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    _lazyLoad(wrapper, src, { 'data-cfasync': 'false' });
  }

  /* ── Convenience: init multiple slots from a config array ── */
  function initAll(slots) {
    slots.forEach(function (slot) {
      var fn = { banner: banner, native: native, footer: footer }[slot.type];
      if (fn) fn(slot.id, slot.key, slot.options);
    });
  }

  /* ── Expose globally ── */
  window.FCAds = { banner: banner, native: native, footer: footer, initAll: initAll };

}(window));
