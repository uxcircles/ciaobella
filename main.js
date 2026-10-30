/* Ciao Bella — small, dependency-free interactions */
(function () {
  document.documentElement.classList.remove('no-js');

  /* ---------- Opening hours (Europe/London) ----------
     0 = Sunday. Times are minutes after midnight. Keep in sync with the hours tables in the HTML. */
  var HOURS = {
    0: [720, 1320], 1: [720, 1320], 2: [720, 1320],
    3: [720, 1335], 4: [720, 1335], 5: [720, 1335], 6: [720, 1335]
  };
  // Annual Christmas closure: last service 23 Dec 2026, reopening 4 Jan 2027.
  var CLOSED = [['2026-12-24', '2027-01-03']];

  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], mins: (+o.hour % 24) * 60 + +o.minute, date: o.year + '-' + o.month + '-' + o.day };
  }
  var IT = document.documentElement.lang === 'it';
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    if (IT) return h + ':' + String(mm).padStart(2, '0');
    var suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (mm ? '.' + String(mm).padStart(2, '0') : '') + suffix;
  }

  var now = londonNow();
  var holiday = CLOSED.some(function (r) { return now.date >= r[0] && now.date <= r[1]; });

  document.querySelectorAll('[data-hours-day]').forEach(function (row) {
    if (+row.getAttribute('data-hours-day') === now.day) row.classList.add('is-today');
  });

  var status = document.querySelector('[data-status]');
  if (status) {
    var text = status.querySelector('[data-status-text]');
    var h = HOURS[now.day];
    if (holiday) {
      text.innerHTML = IT ? '<strong>Chiuso per le feste</strong> · riapriamo il 4 gennaio' : '<strong>Closed for Christmas</strong> · back on 4 January';
    } else if (now.mins >= h[0] && now.mins < h[1]) {
      status.setAttribute('data-state', 'open');
      text.innerHTML = IT
        ? '<strong>Aperto</strong> · fino alle ' + fmt(h[1]) + (now.mins >= 1140 ? ', il piano sta suonando' : '')
        : '<strong>Aperto</strong> · open now until ' + fmt(h[1]) + (now.mins >= 1140 ? ', piano playing' : '');
    } else if (now.mins < h[0]) {
      text.innerHTML = IT ? '<strong>Apre alle ' + fmt(h[0]) + '</strong> oggi' : '<strong>Opens at ' + fmt(h[0]) + '</strong> today';
    } else {
      text.innerHTML = '<strong>Chiuso</strong> · ' + (IT ? 'domani apre alle ' : 'opens tomorrow at ') + fmt(HOURS[(now.day + 1) % 7][0]);
    }
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Phones: bottom bar appears once you've scrolled past the hero ---------- */
  var bar = document.querySelector('.mobile-bar');
  var hero = document.querySelector('[data-hero]');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-visible', !entries[0].isIntersecting);
    }).observe(hero);
  } else if (bar) {
    bar.classList.add('is-visible');
  }

  /* ---------- Menu: diet filter + scrollspy ---------- */
  var filter = document.querySelector('[data-diet-filter]');
  if (filter) {
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      filter.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var want = btn.getAttribute('data-diet');
      document.querySelectorAll('.course').forEach(function (course) {
        var shown = 0;
        course.querySelectorAll('.dish').forEach(function (d) {
          var diet = d.getAttribute('data-diet') || '';
          var ok = want === 'all' || (want === 'v' ? diet !== '' : diet.indexOf('vg') === 0);
          d.hidden = !ok;
          if (ok) shown++;
        });
        course.classList.toggle('is-empty', shown === 0);
      });
    });
  }
  var indexLinks = document.querySelectorAll('.menu-index a');
  if (indexLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    indexLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        indexLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var a = byId[en.target.id];
        if (a) {
          a.classList.add('is-active');
          if (a.parentElement.parentElement.scrollWidth > a.parentElement.parentElement.clientWidth) {
            a.parentElement.parentElement.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.course').forEach(function (c) { spy.observe(c); });
  }

  /* ---------- Neon: flicker on once, when it scrolls into view ---------- */
  var neon = document.querySelector('.neon');
  if (neon && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { neon.classList.add('flicker'); nio.disconnect(); }
    }, { threshold: .6 });
    nio.observe(neon);
  }

  /* ---------- The piano: a playable octave and a bit ---------- */
  var keys = document.querySelector('[data-keys]');
  if (keys) {
    var ctx;
    var map = {};
    keys.querySelectorAll('.key').forEach(function (k) { map[k.getAttribute('data-kb')] = k; });

    function play(key) {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var f = +key.getAttribute('data-freq');
      var t = ctx.currentTime;
      var out = ctx.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(.32, t + .008);
      out.gain.exponentialRampToValueAtTime(.08, t + .35);
      out.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      out.connect(ctx.destination);
      // a felt-hammer-ish tone: fundamental + a couple of soft partials
      [[1, 'triangle', 1], [2, 'sine', .35], [3, 'sine', .12], [1.002, 'sine', .4]].forEach(function (p) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = p[1]; o.frequency.value = f * p[0]; g.gain.value = p[2];
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.3);
      });
      key.classList.add('is-down');
      setTimeout(function () { key.classList.remove('is-down'); }, 180);
    }

    keys.addEventListener('pointerdown', function (e) {
      var k = e.target.closest('.key');
      if (k) { e.preventDefault(); play(k); }
    });
    keys.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('key')) { e.preventDefault(); play(e.target); }
    });
    var section = keys.closest('section');
    document.addEventListener('keydown', function (e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      var r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var k = map[e.key.toLowerCase()];
      if (k) play(k);
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var box = document.querySelector('.lightbox');
  if (box && box.showModal) {
    var img = box.querySelector('img'), cap = box.querySelector('p');
    document.querySelectorAll('[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        img.src = b.getAttribute('data-full');
        img.alt = b.querySelector('img').alt;
        cap.textContent = b.getAttribute('data-caption') || '';
        box.showModal();
      });
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.lightbox-close')) box.close(); });
  }

  /* ---------- Cantina: filter the wine list ---------- */
  var tools = document.querySelector('[data-wine-tools]');
  if (tools) {
    var styleBtns = tools.querySelectorAll('[data-style]');
    var regionSel = tools.querySelector('[data-region]');
    var price = tools.querySelector('[data-price]');
    var priceOut = tools.querySelector('[data-price-out]');
    var count = tools.querySelector('[data-count]');
    var empty = document.querySelector('.no-wines');
    var wines = document.querySelectorAll('.wine');
    var regions = document.querySelectorAll('.region');
    var style = 'all';

    function apply() {
      var max = +price.value, region = regionSel.value, n = 0;
      priceOut.textContent = max >= +price.max ? (IT ? 'Qualsiasi prezzo' : 'Any price') : (IT ? 'Fino a £' : 'Up to £') + max;
      wines.forEach(function (w) {
        var ok = (style === 'all' || w.getAttribute('data-style') === style) && +w.getAttribute('data-price') <= max;
        w.hidden = !ok;
      });
      regions.forEach(function (r) {
        var visible = r.querySelectorAll('.wine:not([hidden])').length;
        var ok = visible > 0 && (region === 'all' || r.id === region);
        r.hidden = !ok;
        if (ok) n += visible;
      });
      count.textContent = IT ? n + ' di ' + wines.length + ' vini' : n + ' of ' + wines.length + ' wines';
      empty.classList.toggle('is-shown', n === 0);
    }
    styleBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        style = b.getAttribute('data-style');
        styleBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    regionSel.addEventListener('change', apply);
    price.addEventListener('input', apply);

    // arriving from a bottle on the home page shelf
    var hash = location.hash.slice(1);
    if (hash && regionSel.querySelector('option[value="' + hash + '"]')) regionSel.value = hash;
    apply();
  }
})();
