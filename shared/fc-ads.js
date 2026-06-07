/**
 * fc-ads.js  —  FriendCheck Adsterra Ad Components
 * Handles mobile/desktop banner switching, lazy loading, sticky footer.
 * Exposes: window.FCAds
 */
(function (window) {
  'use strict';

  var IO_OPTS = { rootMargin: '200px 0px', threshold: 0 };

  function _injectStyles() {
    if (document.getElementById('fc-ads-css')) return;
    var s = document.createElement('style');
    s.id = 'fc-ads-css';
    s.textContent = [
      '.fc-ad-wrap{width:100%;display:flex;justify-content:center;align-items:center;',
        'overflow:hidden;position:relative;background:transparent;}',
      '.fc-ad-wrap[data-type="banner"]{min-height:90px;}',
      '.fc-ad-wrap[data-type="banner"].mobile-banner{min-height:50px;}',
      '.fc-ad-wrap[data-type="native"]{min-height:250px;}',
      '.fc-ad-wrap[data-type="footer"]{min-height:60px;}',
      '.fc-ad-wrap::before{content:"Advertisement";position:absolute;top:4px;left:50%;',
        'transform:translateX(-50%);font-size:9px;letter-spacing:.1em;text-transform:uppercase;',
        'color:rgba(255,255,255,.18);pointer-events:none;white-space:nowrap;}',
      '.fc-ad-footer-sticky{position:fixed;bottom:0;left:0;width:100%;z-index:900;',
        'background:rgba(9,6,15,.92);backdrop-filter:blur(12px);',
        '-webkit-backdrop-filter:blur(12px);',
        'border-top:1px solid rgba(255,255,255,.08);padding:4px 0;}',
      '.fc-ad-footer-sticky .fc-ad-close{position:absolute;top:4px;right:8px;',
        'background:rgba(255,255,255,.12);border:none;color:#fff;cursor:pointer;',
        'border-radius:50%;width:20px;height:20px;font-size:11px;line-height:20px;',
        'text-align:center;padding:0;transition:background .2s;}',
      '.fc-ad-footer-sticky .fc-ad-close:hover{background:rgba(255,255,255,.25);}',
    ].join('');
    document.head.appendChild(s);
  }

  function _makeWrapper(type, extraClass) {
    var div = document.createElement('div');
    div.className = 'fc-ad-wrap' + (extraClass ? ' ' + extraClass : '');
    div.setAttribute('data-type', type);
    div.setAttribute('aria-label', 'Advertisement');
    div.setAttribute('role', 'complementary');
    return div;
  }

  function _lazyLoad(target, loadFn) {
    if (!('IntersectionObserver' in window)) { loadFn(); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { obs.unobserve(e.target); loadFn(); }
      });
    }, IO_OPTS);
    io.observe(target);
  }

  /* Load a display banner — inlines atOptions then loads invoke.js */
  function _loadDisplayBanner(wrapper, key, width, height) {
    var sc1 = document.createElement('script');
    sc1.textContent = [
      'var atOptions = {',
      "  'key': '" + key + "',",
      "  'format': 'iframe',",
      '  height: ' + height + ',',
      '  width: '  + width  + ',',
      "  'params': {}",
      '};'
    ].join('\n');
    wrapper.appendChild(sc1);

    var sc2 = document.createElement('script');
    sc2.async = true;
    sc2.setAttribute('data-cfasync', 'false');
    sc2.src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    wrapper.appendChild(sc2);
  }

  /* ── banner: desktop 728x90 / mobile 320x50 ─────────────────────────────
     key can be a string (same key for both sizes) or
     { desktop: '728x90key', mobile: '320x50key' }
  ── */
  function banner(containerId, keys, options) {
    _injectStyles();
    var container = document.getElementById(containerId);
    if (!container) return;

    var isMobile = window.innerWidth < 768;
    var key = (keys && typeof keys === 'object' && keys.desktop)
      ? (isMobile ? keys.mobile : keys.desktop)
      : keys;
    var w = isMobile ? 320 : 728;
    var h = isMobile ? 50  : 90;

    var wrapper = _makeWrapper('banner', isMobile ? 'mobile-banner' : '');
    container.appendChild(wrapper);
    _lazyLoad(wrapper, function () { _loadDisplayBanner(wrapper, key, w, h); });
  }

  /* ── native: effectivecpmnetwork format (script + container div) ── */
  function native(containerId, src, opts) {
    _injectStyles();
    opts = (opts && typeof opts === 'object') ? opts : {};
    var container = document.getElementById(containerId);
    if (!container) return;

    var wrapper = _makeWrapper('native');
    container.appendChild(wrapper);
    _lazyLoad(wrapper, function () {
      var sc = document.createElement('script');
      sc.async = true;
      sc.setAttribute('data-cfasync', 'false');
      sc.src = src;
      wrapper.appendChild(sc);
      if (opts.containerId) {
        var div = document.createElement('div');
        div.id = opts.containerId;
        wrapper.appendChild(div);
      }
    });
  }

  /* ── box: fixed 300x250 display banner (post-result placement) ── */
  function box(containerId, key) {
    _injectStyles();
    var container = document.getElementById(containerId);
    if (!container) return;

    var wrapper = _makeWrapper('banner');
    container.appendChild(wrapper);
    _lazyLoad(wrapper, function () { _loadDisplayBanner(wrapper, key, 300, 250); });
  }

  /* ── footer: 320x50, optionally sticky ── */
  function footer(containerId, key, options) {
    _injectStyles();
    options = options || {};
    var container = document.getElementById(containerId);
    if (!container) return;

    var wrapClass = options.sticky ? 'fc-ad-footer-sticky' : '';
    var wrapper   = _makeWrapper('footer', wrapClass);

    if (options.sticky && options.closeable !== false) {
      var btn = document.createElement('button');
      btn.className   = 'fc-ad-close';
      btn.textContent = '✕';
      btn.setAttribute('aria-label', 'Close advertisement');
      btn.onclick = function () {
        var p = wrapper.parentNode;
        if (p) p.removeChild(wrapper);
        document.body.style.paddingBottom = '';
      };
      wrapper.appendChild(btn);
      document.body.style.paddingBottom = '70px';
    }

    container.appendChild(wrapper);
    _lazyLoad(wrapper, function () { _loadDisplayBanner(wrapper, key, 320, 50); });
  }

  /* ── initAll convenience ── */
  function initAll(slots) {
    slots.forEach(function (slot) {
      var fn = { banner: banner, native: native, box: box, footer: footer }[slot.type];
      if (fn) fn(slot.id, slot.key, slot.options || slot);
    });
  }

  window.FCAds = { banner: banner, native: native, box: box, footer: footer, initAll: initAll };

}(window));
