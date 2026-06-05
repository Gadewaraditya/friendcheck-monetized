/**
 * fc-utils.js  —  FriendCheck Shared Utilities
 * ──────────────────────────────────────────────
 * Replaces the duplicated share/copy/capture/toast code that existed
 * independently in every page. Include once, use everywhere.
 *
 * Exposes three global namespaces:
 *   FCToast   — toast notifications
 *   FCShare   — WhatsApp / Twitter / clipboard / Web Share API
 *   FCCapture — html2canvas image download helpers
 *
 * Usage:
 *   <script src="shared/fc-utils.js"></script>
 *   FCToast.show('Copied! 🔗');
 *   FCShare.whatsapp('Check this out!\nhttps://friendcheck.app');
 *   FCCapture.download(document.getElementById('card'), 'result.png');
 */

(function (window) {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     FCToast
  ══════════════════════════════════════════════════════════════ */
  var FCToast = (function () {
    var TOAST_ID = 'fc-toast-global';

    /* Ensure toast element exists */
    function _el() {
      var el = document.getElementById(TOAST_ID);
      if (!el) {
        el = document.createElement('div');
        el.id = TOAST_ID;
        el.className = 'fc-toast';
        document.body.appendChild(el);
      }
      return el;
    }

    /**
     * show(message, durationMs?)
     * Shows a pill-shaped toast at bottom-center of screen.
     */
    function show(msg, duration) {
      duration = duration || 2600;
      var el = _el();
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(el._timer);
      el._timer = setTimeout(function () {
        el.classList.remove('show');
      }, duration);
    }

    return { show: show };
  }());


  /* ══════════════════════════════════════════════════════════════
     FCShare
  ══════════════════════════════════════════════════════════════ */
  var FCShare = (function () {

    /**
     * whatsapp(text)
     * Opens WhatsApp share on mobile (native app) or web on desktop.
     */
    function whatsapp(text) {
      var enc = encodeURIComponent(text);
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'whatsapp://send?text=' + enc;
      } else {
        window.open('https://api.whatsapp.com/send?text=' + enc, '_blank', 'noopener,noreferrer');
      }
    }

    /**
     * twitter(text, url?)
     * Opens Twitter/X compose window.
     */
    function twitter(text, url) {
      var tweetUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
      if (url) tweetUrl += '&url=' + encodeURIComponent(url);
      window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    }

    /**
     * copy(text)
     * Copies text to clipboard. Falls back to textarea execCommand.
     */
    function copy(text) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(function () { FCToast.show('Copied to clipboard! 🔗'); })
          .catch(function () { _fallbackCopy(text); });
      } else {
        _fallbackCopy(text);
      }
    }

    function _fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        FCToast.show('Copied! 🔗');
      } catch (e) {
        FCToast.show('Copy failed — long-press to copy');
      }
      document.body.removeChild(ta);
    }

    /**
     * native(title, text, url, imageEl?)
     * Uses the Web Share API (mobile). Tries to share a captured image file first.
     * Falls back to text+URL share, then to copy().
     * Returns a Promise<boolean> — true if share succeeded.
     */
    function native(title, text, url, imageEl) {
      if (!navigator.share) {
        copy(text + '\n' + url);
        return Promise.resolve(false);
      }

      var sharePromise;

      if (imageEl && typeof html2canvas === 'function') {
        sharePromise = html2canvas(imageEl, { scale: 2, backgroundColor: null, useCORS: true, logging: false })
          .then(function (canvas) {
            return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
          })
          .then(function (blob) {
            var file = new File([blob], 'friendcheck-result.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              return navigator.share({ title: title, text: text, files: [file] });
            }
            return navigator.share({ title: title, text: text, url: url });
          })
          .catch(function () {
            return navigator.share({ title: title, text: text, url: url });
          });
      } else {
        sharePromise = navigator.share({ title: title, text: text, url: url });
      }

      return sharePromise
        .then(function () { return true; })
        .catch(function (e) {
          if (e.name !== 'AbortError') copy(text + '\n' + url);
          return false;
        });
    }

    return { whatsapp: whatsapp, twitter: twitter, copy: copy, native: native };
  }());


  /* ══════════════════════════════════════════════════════════════
     FCCapture  (requires html2canvas loaded separately)
  ══════════════════════════════════════════════════════════════ */
  var FCCapture = (function () {

    function _require2canvas() {
      if (typeof html2canvas !== 'function') {
        FCToast.show('Image library not loaded', 2400);
        return false;
      }
      return true;
    }

    /**
     * _capture(el, scale) → Promise<HTMLCanvasElement|null>
     */
    function _capture(el, scale) {
      if (!el || !_require2canvas()) return Promise.resolve(null);
      return html2canvas(el, {
        scale:           scale || 2,
        backgroundColor: null,
        useCORS:         true,
        logging:         false,
        allowTaint:      true,
      }).catch(function (err) {
        console.error('[FCCapture]', err);
        return null;
      });
    }

    /**
     * download(el, filename?, scale?)
     * Saves element as PNG to the user's device.
     */
    function download(el, filename, scale) {
      filename = filename || 'friendcheck-result.png';
      FCToast.show('Generating image… ⏳');
      return _capture(el, scale || 3).then(function (canvas) {
        if (!canvas) { FCToast.show('Could not generate image ❌'); return; }
        var a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png');
        a.click();
        FCToast.show('Image saved! 📸');
      });
    }

    /**
     * downloadStory(el, filename?)
     * Saves a 9:16 story-ratio PNG (scale=2 keeps file size reasonable).
     */
    function downloadStory(el, filename) {
      filename = filename || 'friendcheck-story.png';
      FCToast.show('Creating story image… ⏳');
      return _capture(el, 2).then(function (canvas) {
        if (!canvas) { FCToast.show('Could not generate story ❌'); return; }
        var a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png');
        a.click();
        FCToast.show('Story saved! Post it on Instagram 📲');
      });
    }

    return { download: download, downloadStory: downloadStory };
  }());


  /* ── Expose globally ── */
  window.FCToast   = FCToast;
  window.FCShare   = FCShare;
  window.FCCapture = FCCapture;

}(window));
