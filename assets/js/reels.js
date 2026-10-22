/* Reel library (homepage and library page): style filters, previews that play on hover
   (or when in view on phones), and the player with sound. */
(function () {
  'use strict';
  var RK = window.RK, ICON = RK.ICON, esc = RK.esc, url = RK.url;
  var REELS = window.RK_REELS || [], STYLES = window.RK_STYLES || {};
  var POSTS = window.RK_POSTS || [];
  var byPost = {}; POSTS.forEach(function (p) { byPost[p.num] = p; });
  var byId = {}; REELS.forEach(function (r) { byId[r.id] = r; });
  var FOLDER = { 1: '1 - Animated captions, no voiceover', 2: '2 - Photos with voiceover', 3: '3 - Video with voiceover' };
  var library = document.getElementById('library');
  var tiles = [].slice.call(document.querySelectorAll('.rtile'));
  if (!tiles.length) return;

  /* ---------- filters ---------- */
  var seg = library ? library.querySelector('.seg') : null;
  function setFilter(f) {
    if (seg) seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-filter') === f ? 'true' : 'false'); });
    tiles.forEach(function (t) {
      var show = f === 'all' || t.getAttribute('data-style') === f;
      t.hidden = !show;
      if (!show) stopPreview(t);
    });
    var c = document.getElementById('reel-count');
    if (c) { var n = tiles.filter(function (t) { return !t.hidden; }).length; c.textContent = n + (n === 1 ? ' reel' : ' reels'); }
    if (!RK.fine) pickInView();
  }
  if (seg) seg.addEventListener('click', function (e) { var b = e.target.closest('button[data-filter]'); if (b) setFilter(b.getAttribute('data-filter')); });
  document.querySelectorAll('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      setFilter(b.getAttribute('data-pick'));
      if (library) library.scrollIntoView({ behavior: RK.reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- previews ---------- */
  function ensureVideo(t) {
    if (t._v) return t._v;
    var pv = t.querySelector('.pv'), v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.preload = 'auto';
    v.src = url(byId[t.getAttribute('data-id')].src);
    pv.insertBefore(v, pv.children[1]);
    t._v = v;
    return v;
  }
  function startPreview(t) {
    if (RK.reduce) return;
    var v = ensureVideo(t);
    var p = v.play();
    if (p && p.then) p.then(function () { v.classList.add('on'); t.classList.add('previewing'); }).catch(function () {});
    else { v.classList.add('on'); t.classList.add('previewing'); }
  }
  function stopPreview(t) {
    if (!t._v) return;
    t._v.pause(); t._v.classList.remove('on'); t.classList.remove('previewing');
  }
  function stopAll() { tiles.forEach(stopPreview); }

  if (RK.fine) {
    tiles.forEach(function (t) {
      var timer = null;
      t.addEventListener('pointerenter', function () {
        timer = setTimeout(function () { if (t._v) t._v.currentTime = 0; startPreview(t); }, 120);
      });
      t.addEventListener('pointerleave', function () { clearTimeout(timer); stopPreview(t); });
      t.addEventListener('focus', function () { startPreview(t); });
      t.addEventListener('blur', function () { stopPreview(t); });
    });
  }

  /* phones and tablets: the reel most in view plays silently, one at a time */
  var ratios = new Map(), paused = false;
  function pickInView() {
    if (RK.fine || RK.reduce || paused) return;
    var best = null, bestR = 0.7;
    tiles.forEach(function (t) { var r = ratios.get(t) || 0; if (!t.hidden && r >= bestR) { best = t; bestR = r; } });
    tiles.forEach(function (t) { if (t !== best) stopPreview(t); });
    if (best && !best.classList.contains('previewing')) startPreview(best);
  }
  if (!RK.fine && !RK.reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { ratios.set(e.target, e.intersectionRatio); });
      pickInView();
    }, { threshold: [0, 0.4, 0.7, 0.85, 1] });
    tiles.forEach(function (t) { io.observe(t); ratios.set(t, 0); });
  }

  /* ---------- player ---------- */
  var modal = document.getElementById('player');
  if (!modal) return;
  var mediaEl = document.getElementById('r-media'), infoEl = document.getElementById('r-info');
  var posEl = document.getElementById('r-pos'), prevBtn = document.getElementById('r-prev'), nextBtn = document.getElementById('r-next');
  var list = [], idx = 0;
  function visible() { return tiles.filter(function (t) { return !t.hidden; }).map(function (t) { return byId[t.getAttribute('data-id')]; }); }
  function show(r, autoplay) {
    mediaEl.innerHTML = '';
    var ph = document.createElement('div');
    ph.className = 'phone';
    ph.innerHTML = '<div class="notch"></div><div class="screen"></div>';
    ph.querySelector('.screen').appendChild(RK.reelPlayer({ src: r.src, poster: r.poster, caption: r.title, autoplay: autoplay }));
    mediaEl.appendChild(ph);
    var p = r.post ? byPost[r.post] : null;
    infoEl.innerHTML =
      '<div class="when">' + esc(STYLES[r.style]) + ' · ' + esc(r.duration) + '</div>' +
      '<h2 id="r-title">' + esc(r.title) + '</h2>' +
      '<div class="tags"><span class="tag t-reel">' + ICON.reel + 'Reel</span>' + (p ? '<span class="tag t-single">In November: ' + esc(p.dow) + ', Nov ' + p.day + '</span>' : '<span class="tag">Not scheduled yet</span>') + '</div>' +
      '<p class="lead" style="font-size:17px">' + esc(r.blurb) + '</p>' +
      (r.source ? '<div class="sub-block built"><div class="cap-head"><h4>Built from</h4></div><div>' + esc(r.source) + '</div></div>' : '') +
      '<div class="sub-block"><div class="cap-head"><h4>Where to find the file</h4><button class="btn btn-line btn-sm" type="button" data-copy="' + esc(r.file) + '" data-copied="File name copied">' + ICON.copy + 'Copy name</button></div>' +
      '<div class="drive-path">New Reels › ' + esc(FOLDER[r.style]) + ' › <b>' + esc(r.file) + '</b></div></div>' +
      (p ? '<div class="sub-block"><a class="btn btn-plum" href="' + url('november/#post-' + p.num) + '">See the post and captions ' + ICON.arrow + '</a></div>' : '') +
      (r.style !== 1 ? '<p class="muted" style="font-size:13.5px;margin-top:22px">The voiceover is a narrated, synthetic voice reading your own published words. The same lines can be re-recorded in your own voice and swapped in.</p>' : '');
    posEl.textContent = 'Reel ' + (idx + 1) + ' of ' + list.length;
    prevBtn.disabled = idx === 0; nextBtn.disabled = idx === list.length - 1;
    if (history.replaceState) history.replaceState(null, '', '#reel-' + r.id);
  }
  function open(id, autoplay) {
    paused = true; stopAll();
    list = visible(); if (!list.length) list = REELS.slice();
    idx = Math.max(0, list.findIndex(function (r) { return r.id === id; }));
    show(list[idx], autoplay);
    if (!modal.classList.contains('open')) RK.openModal(modal);
  }
  function step(d) { var n = idx + d; if (n < 0 || n >= list.length) return; idx = n; show(list[idx], true); }
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  modal.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  modal._onclose = function () {
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    mediaEl.innerHTML = ''; paused = false; pickInView();
  };
  tiles.forEach(function (t) { t.addEventListener('click', function () { open(t.getAttribute('data-id'), true); }); });

  var m = /^#reel-(.+)$/.exec(location.hash);
  if (m && byId[m[1]]) open(m[1], false);
  var f = /^#style-([123])$/.exec(location.hash);
  if (f) setFilter(f[1]);
})();
