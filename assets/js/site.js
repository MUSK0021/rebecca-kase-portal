/* Shared behaviour: menu, scroll reveals, 3D tilt, score rings, counters, copy, modal and reel player. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var BASE = doc.getAttribute('data-base') || '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  var ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4.5 6.8 4.5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.2 0 5.4 2.9 4.1 6.3C19.5 15.4 12 20 12 20z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10.2 13.8M21 3l-6.8 18-4-7.2L3 9.8 21 3z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5h12v17l-6-4.2-6 4.2v-17z"/></svg>',
    reel: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 7.5v9l7.5-4.5L9 7.5z"/></svg>',
    stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="m4 17 5-5 4 4 3-3 4 4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.3 8.8h3v10H5.3zM6.8 4.3a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10.3 8.8h2.9v1.4c.4-.8 1.4-1.6 3-1.6 3.1 0 3.7 2 3.7 4.7v5.5h-3v-4.9c0-1.2 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5v5h-3z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3H13.5V8.7c0-.9.3-1.5 1.5-1.5h1.6V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3z"/></svg>',
    script: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    thumb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(p) { return BASE + p; }

  /* ---------- storage (best effort) ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- menu ---------- */
  var mb = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = ICON.check + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- copy ---------- */
  function copyText(text, label) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      toast(ok ? (label || 'Copied') : 'Select the text and copy it');
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(label || 'Copied'); }, fallback);
    } else { fallback(); }
  }

  /* ---------- score rings ---------- */
  function buildRing(el) {
    if (el._built) return; el._built = true;
    var s = +el.dataset.score, size = +el.dataset.size || 64, sw = +el.dataset.stroke || 6, r = (size - sw) / 2, c = 2 * Math.PI * r;
    var col = el.dataset.color || '#3E9091', tr = el.dataset.track || '#EFE6EC';
    var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle class="track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + sw + '" style="stroke:' + tr + '"/><circle class="val" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + sw + '" style="stroke:' + col + ';stroke-dasharray:' + c + ';stroke-dashoffset:' + c + '"/></svg>';
    el.insertAdjacentHTML('afterbegin', svg); el.style.width = size + 'px'; el.style.height = size + 'px';
    el._fin = function () { el.querySelector('.val').style.strokeDashoffset = c * (1 - s / 100); };
  }
  function countUp(el) {
    if (el._counted) return; el._counted = true;
    var to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), t0 = null, dur = 1400;
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }
    el.textContent = (0).toFixed(dec); requestAnimationFrame(step);
  }
  function fire(el) {
    if (el._done) return; el._done = true;
    el.classList.add('in');
    el.querySelectorAll('.ring').forEach(function (r) { buildRing(r); r._fin && r._fin(); });
    if (el.classList.contains('ring')) { buildRing(el); el._fin && el._fin(); }
    el.querySelectorAll('.count').forEach(countUp);
    if (el.classList.contains('count')) countUp(el);
    el.querySelectorAll('[data-w]').forEach(function (b) { b.style.width = b.dataset.w; });
  }
  function initReveal(root) {
    root = root || document;
    root.querySelectorAll('.ring').forEach(buildRing);
    var items = [].slice.call(root.querySelectorAll('.rv, [data-fire]'));
    if (!('IntersectionObserver' in window) || reduce) { items.forEach(fire); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    items.forEach(function (e) { io.observe(e); });
    // Safety net: anything already scrolled past or on screen is shown, even if an observer event is missed.
    var pending = items.slice(), ticking = false;
    function sweep() {
      ticking = false;
      var lim = window.innerHeight * 0.95;
      pending = pending.filter(function (el) {
        if (el._done) return false;
        if (el.getBoundingClientRect().top < lim) { fire(el); io.unobserve(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onScroll);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', sweep);
    setTimeout(sweep, 1200);
  }

  /* ---------- 3D tilt on cards ---------- */
  function initTilt(root) {
    if (!fine || reduce) return;
    (root || document).querySelectorAll('.tilt').forEach(function (el) {
      if (el._tilt) return; el._tilt = true;
      var max = +el.dataset.tilt || 8;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.transform = 'rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) translateZ(0)';
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
  }

  /* ---------- 3D scene parallax ---------- */
  function initScenes() {
    document.querySelectorAll('.scene, .a-scene').forEach(function (sc) {
      var st = sc.querySelector('.stage'); if (!st) return;
      var bx = parseFloat(sc.dataset.rx || 8), by = parseFloat(sc.dataset.ry || -16);
      st.style.setProperty('--rx', bx + 'deg'); st.style.setProperty('--ry', by + 'deg');
      if (!fine || reduce) return;
      var host = sc.closest('.hero') || sc;
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        sc.classList.add('live');
        st.style.setProperty('--rx', (bx - y * 10).toFixed(2) + 'deg');
        st.style.setProperty('--ry', (by + x * 18).toFixed(2) + 'deg');
      });
      host.addEventListener('pointerleave', function () {
        sc.classList.remove('live');
        st.style.setProperty('--rx', bx + 'deg'); st.style.setProperty('--ry', by + 'deg');
      });
    });
  }

  /* ---------- modal ---------- */
  var lastFocus = null, openModalEl = null;
  function openModal(m) {
    lastFocus = document.activeElement; openModalEl = m;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add('show'); }); });
    var f = m.querySelector('[data-autofocus]') || m.querySelector('button, [href], textarea');
    if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
  }
  function closeModal(m) {
    m = m || openModalEl; if (!m) return;
    m.classList.remove('show'); m.setAttribute('aria-hidden', 'true');
    m.querySelectorAll('video').forEach(function (v) { try { v.pause(); } catch (e) {} });
    setTimeout(function () { m.classList.remove('open'); }, 300);
    document.body.style.overflow = '';
    openModalEl = null;
    if (m._onclose) m._onclose();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) {
    if (!openModalEl) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var f = [].slice.call(openModalEl.querySelectorAll('button:not([disabled]), [href], textarea, input, [tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-close]');
    if (t) closeModal(t.closest('.modal'));
    var c = e.target.closest('[data-copy]');
    if (c) copyText(c.getAttribute('data-copy'), c.getAttribute('data-copied') || 'Copied');
  });

  /* ---------- reel player inside a phone screen ---------- */
  function reelPlayer(opts) {
    // opts: src, poster, caption, autoplay
    var wrap = document.createElement('div');
    wrap.className = 'reel';
    wrap.innerHTML =
      '<video playsinline preload="metadata" poster="' + esc(url(opts.poster)) + '" src="' + esc(url(opts.src)) + '"></video>' +
      '<button class="tap" type="button" aria-label="Play or pause the reel"></button>' +
      '<div class="big-play">' + ICON.play + '</div>' +
      '<button class="mute" type="button" aria-label="Mute">' + ICON.soundOn + '</button>' +
      '<div class="side">' + ICON.heart + ICON.comment + ICON.send + '</div>' +
      '<div class="foot"><div class="u"><img src="' + esc(url('assets/img/avatar.webp')) + '" alt="">therebeccakase</div>' +
      (opts.caption ? '<p>' + esc(opts.caption) + '</p>' : '') +
      '<div class="bar" role="slider" aria-label="Seek" tabindex="0"><i></i></div></div>';
    var v = wrap.querySelector('video'), bar = wrap.querySelector('.bar'), fill = bar.querySelector('i'), mute = wrap.querySelector('.mute');
    function sync() { wrap.classList.toggle('playing', !v.paused); }
    wrap.querySelector('.tap').addEventListener('click', function () { if (v.paused) { v.play().catch(function () {}); } else { v.pause(); } });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); v.addEventListener('ended', sync);
    v.addEventListener('timeupdate', function () { if (v.duration) fill.style.width = (100 * v.currentTime / v.duration) + '%'; });
    mute.addEventListener('click', function () {
      v.muted = !v.muted; mute.innerHTML = v.muted ? ICON.soundOff : ICON.soundOn; mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
    });
    function seek(e) { var r = bar.getBoundingClientRect(); if (v.duration) v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * v.duration; }
    bar.addEventListener('click', seek);
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
      if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
    });
    if (opts.autoplay) { v.play().catch(function () {}); }
    return wrap;
  }

  /* ---------- waves (her contour motif) ---------- */
  function wavePaths(n, W, y0, gap, amp, cols, widths, seed) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var yb = y0 + i * gap, A1 = amp + 10 * Math.sin(i * 1.7 + seed), k = 0.0042 + 0.0009 * (i % 3), ph = i * 1.3 + seed, A2 = 8 + 5 * (i % 2), d = '';
      for (var x = -100; x <= W + 100; x += 30) {
        var y = yb + A1 * Math.sin(x * k + ph) + A2 * Math.sin(x * k * 2.3 - ph * 0.7);
        d += (x === -100 ? 'M' : 'L') + x + ' ' + y.toFixed(1) + ' ';
      }
      out += '<path pathLength="1" d="' + d + '" stroke="' + cols[i % cols.length] + '" stroke-width="' + widths[i % widths.length] + '" style="animation-delay:' + (0.15 * i).toFixed(2) + 's"/>';
    }
    return out;
  }
  function initWaves() {
    document.querySelectorAll('svg.waves[data-waves]').forEach(function (s) {
      var kind = s.getAttribute('data-waves');
      if (kind === 'foot') s.innerHTML = wavePaths(4, 1440, 30, 52, 16, ['rgba(226,182,214,.16)', 'rgba(214,168,124,.18)'], [1.4, 2], 0.6);
      else s.innerHTML = '<g>' + wavePaths(9, 1440, 60, 88, 30, ['rgba(226,182,214,.20)', 'rgba(214,168,124,.22)', 'rgba(124,201,190,.16)'], [1.6, 2.4, 1.2], +(s.getAttribute('data-seed') || 0)) + '</g>';
    });
  }

  initWaves();
  initReveal();
  initTilt();
  initScenes();

  window.RK = { ICON: ICON, esc: esc, url: url, store: store, toast: toast, copyText: copyText, openModal: openModal, closeModal: closeModal, reelPlayer: reelPlayer, initReveal: initReveal, initTilt: initTilt, fire: fire, reduce: reduce, fine: fine };
})();
