/**
 * fc-guide.js  —  FriendCheck Page Guide / Onboarding
 * ─────────────────────────────────────────────────────
 * Shows a first-visit instruction card for each page.
 * Persists dismissed state in localStorage per page.
 * A floating "?" button lets users re-open the guide anytime.
 *
 * Usage (add after fc-nav.js on each page):
 *   <script src="shared/fc-guide.js"></script>
 *   <script>FCGuide.init({ page: 'roast' });</script>
 */

(function (window) {
  'use strict';

  /* ── Per-page guide content ── */
  var GUIDES = {
    'home': {
      title: '👋 Welcome to Friendship Hub!',
      subtitle: 'Here\'s how to get the most fun:',
      steps: [
        '🎯 Pick any tool from the cards below',
        '🔥 Start with <strong>₹100 Challenge</strong> for the most viral experience',
        '📤 Share results with friends to see their reactions',
        '💬 Try Fake Chat to create hilarious prank screenshots',
      ],
      cta: 'Let\'s Go! 🚀',
    },
    'challenge': {
      title: '🎯 How to Complete the Challenge',
      subtitle: '3 simple steps to claim your reward:',
      steps: [
        '✏️ Enter your name to start the challenge',
        '📤 Complete all <strong>3 share missions</strong> — send to friends on any platform',
        '🎁 After all missions done, hit <strong>"Claim ₹100"</strong> to reveal your surprise',
        '😂 Watch your friends\' reactions — that\'s the real reward!',
      ],
      cta: 'Start the Challenge! 🎯',
    },
    'fake-chat': {
      title: '💬 How to Create a Fake Chat',
      subtitle: 'Build a realistic prank in seconds:',
      steps: [
        '📱 Choose a <strong>platform</strong> (WhatsApp, iMessage, Telegram, etc.)',
        '✏️ Set contact name and add messages from both sides',
        '🎨 Customize time, status, battery, and more details',
        '📸 Hit <strong>"Generate Screenshot"</strong> to download your prank!',
      ],
      cta: 'Create My Fake Chat! 💬',
    },
    'fake-screenshot': {
      title: '📱 How to Make a Fake Screenshot',
      subtitle: 'Create a convincing screenshot prank:',
      steps: [
        '📲 Pick your <strong>device style</strong> and messaging app',
        '✏️ Enter contact name, messages and adjust the details',
        '🕐 Set time, signal bars, and other realistic details',
        '💾 Click <strong>"Generate"</strong> then download your screenshot!',
      ],
      cta: 'Create Screenshot! 📱',
    },
    'roast': {
      title: '🔥 How to Roast Your Friend',
      subtitle: 'Get savage AI roasts in 3 steps:',
      steps: [
        '✍️ Type your friend\'s name and a few traits about them',
        '🎰 Hit <strong>"Generate Roast"</strong> to get brutal AI-powered burns',
        '🔁 Don\'t like it? Click again for a fresh roast',
        '📤 Copy the roast or share the card directly!',
      ],
      cta: 'Start Roasting! 🔥',
    },
    'fake-friend': {
      title: '🔎 How to Expose a Fake Friend',
      subtitle: 'Let AI analyze the red flags:',
      steps: [
        '✍️ Enter your friend\'s name and describe their behaviour',
        '🚩 Add specific incidents or red flags you\'ve noticed',
        '🤖 Hit <strong>"Investigate"</strong> — AI analyzes the evidence',
        '📤 Share the verdict with your squad!',
      ],
      cta: 'Start Investigation! 🔎',
    },
    'friend-battle': {
      title: '⚔️ How to Start a Friend Battle',
      subtitle: 'Find out who\'s the better friend:',
      steps: [
        '✏️ Enter <strong>your name</strong> and <strong>your friend\'s name</strong>',
        '🎯 Choose battle categories that matter to you',
        '⚡ Hit <strong>"Start Battle"</strong> to get the verdict',
        '🏆 Share the results and let your friend react!',
      ],
      cta: 'Battle Time! ⚔️',
    },
    'friendship-test': {
      title: '📝 How to Take the Friendship Test',
      subtitle: 'Find your real friendship score:',
      steps: [
        '🤔 Answer all <strong>10 scenario questions</strong> honestly',
        '⚡ No skipping — each answer shapes your final verdict',
        '🏅 Get your friendship tier from Soulmate BFF to Blocked Friend',
        '📤 <strong>Share your score</strong> and challenge friends to beat it!',
      ],
      cta: 'Take the Test! 📝',
    },
    'court': {
      title: '⚖️ How to Use Friendship Court',
      subtitle: 'Settle drama with an AI judge:',
      steps: [
        '✍️ Describe the friendship drama or conflict clearly',
        '👥 Add both sides of the story for a fair verdict',
        '⚖️ Hit <strong>"Submit to Court"</strong> for the AI judge\'s ruling',
        '📤 Share the verdict — no arguing with the judge!',
      ],
      cta: 'Enter the Court! ⚖️',
    },
    'compatibility': {
      title: '🧬 How to Check Compatibility',
      subtitle: 'Scan your friendship DNA:',
      steps: [
        '✏️ Enter <strong>your name</strong> and <strong>your friend\'s name</strong>',
        '🧬 Hit <strong>"Scan Compatibility"</strong> to run the analysis',
        '📊 See your scores across Trust, Loyalty, Chaos Energy & more',
        '📤 Share your compatibility report with your friend!',
      ],
      cta: 'Scan Now! 🧬',
    },
    'prediction': {
      title: '🔮 How to Get a Friendship Prediction',
      subtitle: 'See what the future holds:',
      steps: [
        '✏️ Enter your name and your friend\'s name',
        '🔮 Hit <strong>"Reveal Prediction"</strong> for AI prophecies',
        '😱 Discover what AI predicts for your friendship\'s future',
        '📤 Tag your friend in the prediction and watch them panic!',
      ],
      cta: 'See My Future! 🔮',
    },
    'certificate': {
      title: '📜 How to Create a Certificate',
      subtitle: 'Make your friendship official:',
      steps: [
        '✏️ Fill in <strong>your name</strong> and <strong>your friend\'s name</strong>',
        '🏅 Choose a friendship tier / award type',
        '🎨 Customize the look and any extra details',
        '💾 Hit <strong>"Generate"</strong> then download your certificate!',
      ],
      cta: 'Make Certificate! 📜',
    },
  };

  /* ── Styles ── */
  var STYLES = [
    /* Guide card */
    '#fc-guide-wrap{position:fixed;bottom:0;left:0;right:0;z-index:9999;display:flex;justify-content:center;padding:0 12px 12px;pointer-events:none;}',
    '#fc-guide-card{background:rgba(14,12,22,.97);border:1px solid rgba(162,89,255,.35);border-radius:20px;padding:20px 22px 18px;max-width:480px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.7),0 0 0 1px rgba(162,89,255,.15);pointer-events:all;transform:translateY(110%);transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .45s ease;opacity:0;backdrop-filter:blur(24px);}',
    '#fc-guide-card.fc-guide-visible{transform:translateY(0);opacity:1;}',
    '#fc-guide-card.fc-guide-hiding{transform:translateY(110%);opacity:0;}',
    '.fc-guide-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px;}',
    '.fc-guide-title{font-size:1rem;font-weight:800;color:#fff;line-height:1.3;font-family:\'Outfit\',\'Plus Jakarta Sans\',sans-serif;}',
    '.fc-guide-close{background:rgba(255,255,255,.08);border:none;color:#aaa;cursor:pointer;border-radius:8px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0;transition:background .2s,color .2s;margin-top:1px;}',
    '.fc-guide-close:hover{background:rgba(255,255,255,.15);color:#fff;}',
    '.fc-guide-subtitle{font-size:.75rem;color:#8888aa;margin-bottom:12px;font-family:\'Outfit\',\'Plus Jakarta Sans\',sans-serif;}',
    '.fc-guide-steps{list-style:none;padding:0;margin:0 0 14px;display:flex;flex-direction:column;gap:7px;}',
    '.fc-guide-steps li{font-size:.82rem;color:#d0cde8;line-height:1.45;padding:7px 10px;background:rgba(255,255,255,.04);border-radius:10px;border-left:2px solid rgba(162,89,255,.5);font-family:\'Outfit\',\'Plus Jakarta Sans\',sans-serif;}',
    '.fc-guide-steps li strong{color:#fface8;}',
    '.fc-guide-cta{width:100%;padding:10px;background:linear-gradient(135deg,#a259ff,#7c3aed);border:none;border-radius:12px;color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;transition:opacity .2s,transform .15s;font-family:\'Outfit\',\'Plus Jakarta Sans\',sans-serif;}',
    '.fc-guide-cta:hover{opacity:.88;transform:scale(1.01);}',
    /* Help button */
    '#fc-guide-help{position:fixed;bottom:18px;right:18px;z-index:9998;width:40px;height:40px;border-radius:50%;background:rgba(14,12,22,.92);border:1px solid rgba(162,89,255,.5);color:#a259ff;font-size:1.1rem;font-weight:800;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(162,89,255,.3);transition:transform .2s,background .2s;backdrop-filter:blur(10px);}',
    '#fc-guide-help:hover{transform:scale(1.1);background:rgba(162,89,255,.2);}',
    '#fc-guide-help.fc-guide-help-visible{display:flex;}',
    /* Pulse ring on help btn */
    '#fc-guide-help::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(162,89,255,.4);animation:fc-guide-pulse 2.5s ease-out infinite;}',
    '@keyframes fc-guide-pulse{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}',
    /* Mobile tweak */
    '@media(max-width:480px){#fc-guide-card{border-radius:16px 16px 12px 12px;padding:16px 16px 14px;}.fc-guide-steps li{font-size:.79rem;}.fc-guide-title{font-size:.92rem;}}',
  ].join('');

  /* ── Helpers ── */
  function storageKey(page) { return 'fc_guide_seen_' + page; }
  function hasSeen(page)    { try { return localStorage.getItem(storageKey(page)) === '1'; } catch(e) { return false; } }
  function markSeen(page)   { try { localStorage.setItem(storageKey(page), '1'); } catch(e) {} }

  /* ── Build DOM ── */
  function buildCard(guide) {
    var stepsHtml = guide.steps.map(function(s) {
      return '<li>' + s + '</li>';
    }).join('');

    return (
      '<div class="fc-guide-header">' +
        '<div class="fc-guide-title">' + guide.title + '</div>' +
        '<button class="fc-guide-close" id="fc-guide-x" aria-label="Close guide">✕</button>' +
      '</div>' +
      '<div class="fc-guide-subtitle">' + guide.subtitle + '</div>' +
      '<ul class="fc-guide-steps">' + stepsHtml + '</ul>' +
      '<button class="fc-guide-cta" id="fc-guide-cta">' + guide.cta + '</button>'
    );
  }

  /* ── Init ── */
  function init(config) {
    config = config || {};
    var page = config.page || 'home';
    var guide = GUIDES[page] || GUIDES['home'];

    /* Inject styles once */
    if (!document.getElementById('fc-guide-styles')) {
      var st = document.createElement('style');
      st.id = 'fc-guide-styles';
      st.textContent = STYLES;
      document.head.appendChild(st);
    }

    /* Build wrapper + card */
    var wrap = document.createElement('div');
    wrap.id = 'fc-guide-wrap';

    var card = document.createElement('div');
    card.id = 'fc-guide-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Page guide');
    card.innerHTML = buildCard(guide);
    wrap.appendChild(card);
    document.body.appendChild(wrap);

    /* Build help "?" button */
    var helpBtn = document.createElement('button');
    helpBtn.id = 'fc-guide-help';
    helpBtn.setAttribute('aria-label', 'Show guide');
    helpBtn.innerHTML = '?';
    document.body.appendChild(helpBtn);

    /* ── Show/hide logic ── */
    function showCard() {
      card.classList.remove('fc-guide-hiding');
      card.classList.add('fc-guide-visible');
      helpBtn.classList.remove('fc-guide-help-visible');
    }

    function hideCard(save) {
      card.classList.add('fc-guide-hiding');
      card.classList.remove('fc-guide-visible');
      if (save) markSeen(page);
      setTimeout(function() {
        helpBtn.classList.add('fc-guide-help-visible');
      }, 300);
    }

    /* Show on first visit, else show help btn */
    if (!hasSeen(page)) {
      setTimeout(function() { showCard(); }, 600);
    } else {
      helpBtn.classList.add('fc-guide-help-visible');
    }

    /* Wire buttons */
    card.addEventListener('click', function(e) {
      var t = e.target;
      if (t.id === 'fc-guide-x' || t.id === 'fc-guide-cta') {
        hideCard(true);
      }
    });

    helpBtn.addEventListener('click', function() { showCard(); });
  }

  window.FCGuide = { init: init };

}(window));
