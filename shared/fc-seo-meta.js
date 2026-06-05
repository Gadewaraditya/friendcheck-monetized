/**
 * fc-seo-meta.js  —  FriendCheck SEO Metadata Registry
 * ───────────────────────────────────────────────────────
 * Single source of truth for all page titles, descriptions,
 * Open Graph tags, Twitter Cards, and JSON-LD schemas.
 *
 * USAGE:
 *   <script src="shared/fc-seo-meta.js"></script>
 *   <script>FCSeo.apply('friendship-test');</script>
 *
 * FCSeo.apply(pageId) will:
 *   1. Set document.title
 *   2. Update/create all <meta> tags in <head>
 *   3. Inject JSON-LD <script> if not already present
 *
 * ── Dynamic titles (for result pages) ──────────────────────
 *   FCSeo.setResultTitle('friendship-test', 'Golden Friend', 84);
 *   // → "I got 🏅 Golden Friend (84%) on FriendCheck! Can you beat me?"
 * ──────────────────────────────────────────────────────────
 */

(function (window) {
  'use strict';

  var BASE_URL  = 'https://friendship-check.in';
  var SITE_NAME = 'FriendCheck';
  var TWITTER_HANDLE = '@FriendCheckApp';

  /* ── Page metadata registry ── */
  var PAGES = {
    'home': {
      title:       'FriendCheck — The #1 Friendship Test Hub | Free AI-Powered Quizzes',
      description: 'Take AI-powered friendship tests, generate roasts, run compatibility scans, and settle disputes in court. 1M+ tests taken. 100% free.',
      keywords:    'friendship test, BFF quiz, fake friend detector, friend battle, roast generator, friendship compatibility',
      url:         BASE_URL + '/',
      ogImage:     BASE_URL + '/og-hub.png',
      ogTitle:     'FriendCheck — Are You A Good Friend?',
      ogDesc:      '1M+ friendship tests. Roasts, battles, certificates & more. All free.',
      twitterTitle:'FriendCheck — Are You A Good Friend?',
      twitterDesc: '1M+ friendship tests. All free. Try it now.',
      jsonld: {
        '@context': 'https://schema.org',
        '@type':    'WebSite',
        'name':     'FriendCheck',
        'url':      BASE_URL + '/',
        'description': 'AI-powered friendship quizzes, roast generators, compatibility meters, and more.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': BASE_URL + '/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    },
    'friendship-test': {
      title:       'FriendCheck | Friendship Test — How Good Of A Friend Are You?',
      description: 'Take the ultimate friendship test! 10 hilarious questions to find out if you\'re a Soulmate BFF or a Blocked Friend. Share your results with your squad!',
      keywords:    'friendship test, BFF quiz, are you a good friend, friendship score, friend rating quiz',
      url:         BASE_URL + '/friendship-test.html',
      ogImage:     BASE_URL + '/og-friendship-test.png',
      ogTitle:     'FriendCheck | How Good Of A Friend Are You?',
      ogDesc:      'I just took the Friendship Test! 💖 10 hilarious scenarios. One brutal verdict. Can you beat my score?',
      twitterTitle:'FriendCheck | How Good Of A Friend Are You?',
      twitterDesc: '10 hilarious scenarios. 1 verdict. Find out your friendship tier 👇',
      jsonld: {
        '@context':    'https://schema.org',
        '@type':       'Quiz',
        'name':        'The Ultimate Friendship Test',
        'description': '10 scenarios that determine your friendship tier — from Soulmate BFF to Blocked Friend.',
        'url':         BASE_URL + '/friendship-test.html',
        'educationalAlignment': { '@type': 'AlignmentObject', 'alignmentType': 'educationalSubject', 'targetName': 'Social Skills' },
        'provider':    { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'friend-battle': {
      title:       'FriendCheck | Friend Battle ⚔️ — Who Wins Between You & Your Friend?',
      description: 'The ultimate AI-powered friend battle across 20 chaotic categories. Find out who wins. Viral results, rare badges, shareable cards.',
      keywords:    'friend battle, friendship comparison, who is a better friend, friend showdown, best friend quiz',
      url:         BASE_URL + '/friend-battle.html',
      ogImage:     BASE_URL + '/og-friend-battle.png',
      ogTitle:     'Friend Battle ⚔️ — Who Wins?',
      ogDesc:      '20 chaotic categories. 1 winner. Zero chill. Who\'s better — you or your friend?',
      twitterTitle:'Friend Battle ⚔️ — Who Wins?',
      twitterDesc: 'We settled it. 20 categories. 1 winner. Tag your friend 👀',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'FriendCheck Friend Battle', 'url': BASE_URL + '/friend-battle.html',
        'description': '20 chaotic categories, 1 battle, zero chill.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'fake-friend': {
      title:       'FriendCheck | Fake Friend Investigator 🔎 — Find The Snake In Your Group',
      description: 'Run an AI investigation on your friend group. Find out who the fake friend really is based on suspicious habits, betrayal patterns, and loyalty scores.',
      keywords:    'fake friend detector, find fake friend, friend loyalty test, is my friend fake, friend group investigation',
      url:         BASE_URL + '/fake-friend-investigator.html',
      ogImage:     BASE_URL + '/og-fake-friend.png',
      ogTitle:     'Fake Friend Investigator — Find The Snake 🐍',
      ogDesc:      'Enter your suspects and let AI identify the fake friend in your circle.',
      twitterTitle:'Fake Friend Investigator 🔎',
      twitterDesc: 'The results are in. One of your friends is fake. Find out who 👀',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Fake Friend Investigator', 'url': BASE_URL + '/fake-friend-investigator.html',
        'description': 'AI-powered tool to identify fake friends based on behavioral patterns.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'roast': {
      title:       'FriendCheck | Roast Generator 🔥 — 100 Savage AI Roasts For Your Friends',
      description: 'Generate savage AI-powered roasts for your friends. 100 roast templates, shareable cards, and custom roasts — all free. Warning: brutally honest.',
      keywords:    'roast generator, friend roast, AI roast, savage roast, funny roast for friends, friend jokes',
      url:         BASE_URL + '/roast_generator.html',
      ogImage:     BASE_URL + '/og-roast.png',
      ogTitle:     'Roast Generator 🔥 — Burn Your Friends (Lovingly)',
      ogDesc:      '100 savage AI roasts for your friends. Shareable cards. All free.',
      twitterTitle:'Roast Generator 🔥 — Burn Your Friends',
      twitterDesc: 'I just got roasted by AI 💀 Your turn. Tag a friend.',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'FriendCheck Roast Generator', 'url': BASE_URL + '/roast_generator.html',
        'description': '100 savage AI-generated roasts, shareable cards, custom roast builder.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'court': {
      title:       'FriendCheck | Friendship Court ⚖️ — AI Judge Settles Your Drama',
      description: 'Settle petty friend disputes in a virtual AI courtroom. Present your case, call witnesses, and let the AI judge deliver the final verdict.',
      keywords:    'friendship court, settle friend argument, AI judge, who is right in friendship, friend dispute',
      url:         BASE_URL + '/friendship_court.html',
      ogImage:     BASE_URL + '/og-court.png',
      ogTitle:     'Friendship Court ⚖️ — The AI Judge Has Spoken',
      ogDesc:      'We took our friendship drama to court. The AI judge ruled.',
      twitterTitle:'Friendship Court ⚖️ — Verdict In',
      twitterDesc: 'Court is in session. The AI judge has made a ruling 👨‍⚖️',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Friendship Court', 'url': BASE_URL + '/friendship_court.html',
        'description': 'Virtual AI courtroom to settle friend disputes with a final binding verdict.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'compatibility': {
      title:       'FriendCheck | Compatibility Scanner 🧬 — How Compatible Are You With Your Friend?',
      description: 'Scan your friendship and get scored on Trust, Loyalty, Chaos Energy, and Meme Alignment. Find out exactly how compatible your vibes really are.',
      keywords:    'friendship compatibility, are we compatible, friendship meter, friend vibe check, friendship score compatibility',
      url:         BASE_URL + '/friendship_compatibility.html',
      ogImage:     BASE_URL + '/og-compatibility.png',
      ogTitle:     'Friendship Compatibility Scanner 🧬',
      ogDesc:      'We scanned our friendship. Trust: 94%. Chaos Energy: 🔥🔥🔥. Results are in.',
      twitterTitle:'Friendship Compatibility Scanner 🧬',
      twitterDesc: 'Ran our friendship through the scanner. The results are wild 😭',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Friendship Compatibility Meter', 'url': BASE_URL + '/friendship_compatibility.html',
        'description': 'AI scanner that scores your friendship on Trust, Loyalty, Chaos, and Meme Energy.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'prediction': {
      title:       'FriendCheck | Friendship Prediction Machine 🔮 — See Your Future Together',
      description: 'AI-powered predictions about the future of your friendship. Eerily accurate prophecies about where your bond is headed. Try it free.',
      keywords:    'friendship prediction, future of friendship, will we stay friends, friendship future, friend prophecy',
      url:         BASE_URL + '/friendship_prediction.html',
      ogImage:     BASE_URL + '/og-prediction.png',
      ogTitle:     'Friendship Prediction Machine 🔮',
      ogDesc:      'The oracle has spoken about our friendship. This is lowkey creepy accurate 👀',
      twitterTitle:'Friendship Prediction Machine 🔮',
      twitterDesc: 'I asked AI to predict our friendship. I\'m scared 😳',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Friendship Prediction Machine', 'url': BASE_URL + '/friendship_prediction.html',
        'description': 'AI-generated prophecies about the future of your friendship.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    },
    'certificate': {
      title:       'FriendCheck | Certificate Generator 📜 — Make It Official',
      description: 'Generate official friendship certificates for your besties. Custom names, download as image, share instantly. The most wholesome thing on the internet.',
      keywords:    'friendship certificate, best friend certificate, BFF certificate, friendship document, printable friendship certificate',
      url:         BASE_URL + '/friendship_certificate_generator.html',
      ogImage:     BASE_URL + '/og-certificate.png',
      ogTitle:     'Friendship Certificate Generator 📜',
      ogDesc:      'We made it official. Here\'s our friendship certificate 🥹',
      twitterTitle:'Friendship Certificate Generator 📜',
      twitterDesc: 'Certified besties. Official document. Unbreakable bond. 🥹',
      jsonld: {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Friendship Certificate Generator', 'url': BASE_URL + '/friendship_certificate_generator.html',
        'description': 'Create and download custom friendship certificates for you and your best friends.',
        'applicationCategory': 'Game', 'isAccessibleForFree': true,
        'provider': { '@type': 'Organization', 'name': 'FriendCheck', 'url': BASE_URL }
      }
    }
  };

  /* ── Helper: upsert a <meta> tag ── */
  function _setMeta(attr, attrVal, content) {
    var sel = 'meta[' + attr + '="' + attrVal + '"]';
    var el  = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  /* ── Helper: upsert <link rel="canonical"> ── */
  function _setCanonical(url) {
    var el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  /* ── Helper: inject / replace JSON-LD ── */
  function _setJsonLD(obj) {
    var existing = document.querySelector('script[type="application/ld+json"]');
    if (!existing) {
      existing = document.createElement('script');
      existing.type = 'application/ld+json';
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify(obj, null, 2);
  }

  /**
   * FCSeo.apply(pageId)
   * Applies all SEO tags for the given page ID.
   */
  function apply(pageId) {
    var p = PAGES[pageId];
    if (!p) { console.warn('[FCSeo] Unknown page ID:', pageId); return; }

    /* Title */
    document.title = p.title;

    /* Basic meta */
    _setMeta('name', 'description', p.description);
    if (p.keywords) _setMeta('name', 'keywords', p.keywords);
    _setMeta('name', 'robots', 'index, follow');
    _setMeta('name', 'twitter:site', TWITTER_HANDLE);

    /* Canonical */
    _setCanonical(p.url);

    /* Open Graph */
    _setMeta('property', 'og:type',        'website');
    _setMeta('property', 'og:url',          p.url);
    _setMeta('property', 'og:title',        p.ogTitle || p.title);
    _setMeta('property', 'og:description',  p.ogDesc  || p.description);
    _setMeta('property', 'og:image',        p.ogImage);
    _setMeta('property', 'og:image:width',  '1200');
    _setMeta('property', 'og:image:height', '630');
    _setMeta('property', 'og:site_name',    SITE_NAME);

    /* Twitter Card */
    _setMeta('name', 'twitter:card',        'summary_large_image');
    _setMeta('name', 'twitter:url',         p.url);
    _setMeta('name', 'twitter:title',       p.twitterTitle || p.ogTitle || p.title);
    _setMeta('name', 'twitter:description', p.twitterDesc  || p.ogDesc  || p.description);
    _setMeta('name', 'twitter:image',       p.ogImage);

    /* JSON-LD */
    if (p.jsonld) _setJsonLD(p.jsonld);
  }

  /**
   * FCSeo.setResultTitle(pageId, tierTitle, percentage)
   * Updates og:title and twitter:title dynamically after result is shown.
   * Call this after the result renders.
   *
   * e.g. FCSeo.setResultTitle('friendship-test', '🏅 Golden Friend', 84)
   * → document.title = "I got 🏅 Golden Friend (84%) on FriendCheck! Can you beat me?"
   */
  function setResultTitle(pageId, tierTitle, percentage) {
    var dynamicTitle;
    if (percentage !== undefined) {
      dynamicTitle = 'I got ' + tierTitle + ' (' + percentage + '%) on FriendCheck! Can you beat me?';
    } else {
      dynamicTitle = 'My FriendCheck Result: ' + tierTitle + ' — Can you beat it?';
    }
    document.title = dynamicTitle;
    _setMeta('property', 'og:title',        dynamicTitle);
    _setMeta('name',     'twitter:title',   dynamicTitle);
  }

  /**
   * FCSeo.getAll()
   * Returns the full PAGES registry (useful for debugging or SSR).
   */
  function getAll() { return PAGES; }

  /* ── Expose globally ── */
  window.FCSeo = { apply: apply, setResultTitle: setResultTitle, getAll: getAll };

}(window));
