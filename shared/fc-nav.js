/**
 * fc-nav.js  —  FriendCheck Unified Navigation
 * ─────────────────────────────────────────────
 * Injects a sticky top navbar + mobile drawer into every page.
 * Zero dependencies. ~2 KB minified.
 *
 * Usage (add just before </body> on every page):
 *   <script src="shared/fc-nav.js"></script>
 *   <script>FCNav.init({ active: 'friend-battle' });</script>
 *
 * `active` must match one of the `id` values in TOOLS below.
 */

(function (window) {
  'use strict';

  /* ── Tool registry ── */
  var TOOLS = [
    { id: 'home',            label: '🏠 Home',               href: 'index.html' },
    { id: 'friendship-test', label: '📝 Friendship Test',    href: 'friendship-test.html' },
    { id: 'friend-battle',   label: '⚔️ Friend Battle',      href: 'friend-battle.html' },
    { id: 'fake-friend',     label: '🔎 Fake Friend',        href: 'fake-friend-investigator.html' },
    { id: 'roast',           label: '🔥 Roast Generator',    href: 'roast_generator.html' },
    { id: 'compatibility',   label: '🧬 Compatibility',      href: 'friendship_compatibility.html' },
    { id: 'court',           label: '⚖️ Court',              href: 'friendship_court.html' },
    { id: 'prediction',      label: '🔮 Prediction',         href: 'friendship_prediction.html' },
    { id: 'certificate',     label: '📜 Certificate',        href: 'friendship_certificate_generator.html' },
  ];

  /* ── Desktop nav: show first 5 items + "More" dropdown ── */
  var PRIMARY   = TOOLS.slice(0, 5);   // always visible
  var SECONDARY = TOOLS.slice(5);      // in "More" dropdown

  /* ── HTML builder helpers ── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildNavHTML(activeId) {
    var primaryLinks = PRIMARY.map(function (t) {
      var cls = t.id === activeId ? ' fc-nav-active' : '';
      return '<li><a href="' + esc(t.href) + '" class="' + cls.trim() + '">' + t.label + '</a></li>';
    }).join('');

    var dropdownItems = SECONDARY.map(function (t) {
      var cls = t.id === activeId ? ' fc-nav-active' : '';
      return '<a href="' + esc(t.href) + '" class="fc-drop-item' + cls + '">' + t.label + '</a>';
    }).join('');

    var mobileLinks = TOOLS.map(function (t) {
      var cls = t.id === activeId ? ' fc-nav-active' : '';
      return '<a href="' + esc(t.href) + '" class="' + cls.trim() + '">' + t.label + '</a>';
    }).join('');

    return (
      /* ── Navbar ── */
      '<nav class="fc-nav" role="navigation" aria-label="Main navigation">' +
        '<a class="fc-nav-brand" href="index.html" aria-label="FriendCheck home">FriendCheck</a>' +
        '<ul class="fc-nav-links" role="list">' + primaryLinks +
          /* More dropdown */
          '<li class="fc-more-wrap">' +
            '<button class="fc-more-btn" aria-haspopup="true" aria-expanded="false" aria-label="More tools">More ▾</button>' +
            '<div class="fc-dropdown" role="menu">' + dropdownItems + '</div>' +
          '</li>' +
        '</ul>' +
        '<button class="fc-hamburger" id="fc-hamburger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="fc-mobile-nav">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</nav>' +
      /* ── Mobile drawer ── */
      '<div class="fc-mobile-nav" id="fc-mobile-nav" role="navigation" aria-label="Mobile navigation">' +
        mobileLinks +
      '</div>'
    );
  }

  /* ── Inline styles scoped to nav + dropdown ── */
  var NAV_STYLES = [
    '.fc-more-wrap{position:relative;list-style:none}',
    '.fc-more-btn{background:none;border:none;color:var(--fc-muted,#8888aa);font-size:.82rem;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:8px;transition:color .2s;font-family:inherit}',
    '.fc-more-btn:hover{color:var(--fc-text,#e5e2e3)}',
    '.fc-dropdown{display:none;position:absolute;top:calc(100% + 10px);right:0;min-width:210px;background:rgba(14,12,22,.97);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:8px;z-index:1001;backdrop-filter:blur(20px);box-shadow:0 20px 50px rgba(0,0,0,.6)}',
    '.fc-more-wrap:hover .fc-dropdown,.fc-more-wrap:focus-within .fc-dropdown{display:flex;flex-direction:column;gap:2px}',
    '.fc-drop-item{padding:9px 14px;border-radius:10px;text-decoration:none;color:var(--fc-muted,#8888aa);font-size:.82rem;font-weight:600;transition:background .18s,color .18s;white-space:nowrap}',
    '.fc-drop-item:hover,.fc-drop-item.fc-nav-active{background:rgba(255,255,255,.07);color:var(--fc-text,#e5e2e3)}',
    '.fc-drop-item.fc-nav-active{color:var(--fc-primary,#fface8)}',
  ].join('');

  /* ── Init ── */
  function init(config) {
    config = config || {};
    var activeId = config.active || 'home';

    /* Inject CSS if not already present */
    if (!document.getElementById('fc-nav-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'fc-nav-styles';
      styleEl.textContent = NAV_STYLES;
      document.head.appendChild(styleEl);
    }

    /* Inject HTML at top of <body> */
    var wrapper = document.createElement('div');
    wrapper.id = 'fc-nav-root';
    wrapper.innerHTML = buildNavHTML(activeId);
    document.body.insertBefore(wrapper, document.body.firstChild);

    /* Push page content below navbar */
    _applyNavOffset();

    /* Wire hamburger */
    var hamburger = document.getElementById('fc-hamburger');
    var mobileNav = document.getElementById('fc-mobile-nav');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      });

      /* Close drawer on link click */
      mobileNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileNav.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* Close dropdown on outside click */
    document.addEventListener('click', function (e) {
      var moreWrap = document.querySelector('.fc-more-wrap');
      if (moreWrap && !moreWrap.contains(e.target)) {
        var drop = moreWrap.querySelector('.fc-dropdown');
        if (drop) drop.style.display = '';
      }
    });
  }

  /* ── Push main content below the fixed navbar ── */
  function _applyNavOffset() {
    var NAV_H = 60; // px — matches --fc-nav-h

    /* Strategy 1: body has padding-top already? add to it */
    var body = document.body;
    var existingPT = parseInt(window.getComputedStyle(body).paddingTop, 10) || 0;

    /* Strategy 2: look for the first child that is NOT our nav wrapper */
    var children = Array.prototype.slice.call(body.children);
    children.forEach(function (el) {
      if (el.id === 'fc-nav-root') return;
      var tag = el.tagName.toLowerCase();
      /* Only offset block-level direct children that are likely the page shell */
      if (['main','div','section','article','header'].indexOf(tag) !== -1) {
        var current = parseInt(el.style.paddingTop, 10) || 0;
        if (current < NAV_H) {
          el.style.paddingTop = (current + NAV_H) + 'px';
        }
      }
    });
  }

  /* ── Expose globally ── */
  window.FCNav = { init: init };

}(window));
