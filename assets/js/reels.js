/* Reel library: style filters, hover previews and the player. */
(function () {
  'use strict';
  var RK = window.RK, ICON = RK.ICON, esc = RK.esc, url = RK.url;
  var REELS = window.RK_REELS || [], STYLES = window.RK_STYLES || {};
  var POSTS = window.RK_POSTS || [];
  var byPost = {}; POSTS.forEach(function (p) { byPost[p.num] = p; });
  var byId = {}; REELS.forEach(function (r) { byId[r.id] = r; });
  var FOLDER = { 1: '1 - Animated captions, no voiceover', 2: '2 - Photos with voiceover', 3: '3 - Video with voiceover' };
  var grid = document.getElementById('reel-grid');
  var tiles = [].slice.call(grid.querySelectorAll('.rtile'));

  /* ---------- filters ---------- */
  var seg = document.querySelector('#library .seg');
  function setFilter(f) {
    seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-filter') === f ? 'true' : 'false'); });
    tiles.forEach(function (t) { t.hidden = f !== 'all' && t.getAttribute('data-style') !== f; });
  }
  seg.addEventListener('click', function (e) { var b = e.target.closest('button[data-filter]'); if (b) setFilter(b.getAttribute('data-filter')); });
  document.querySelectorAll('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      setFilter(b.getAttribute('data-pick'));
      document.getElementById('library').scrollIntoView({ behavior: RK.reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- hover previews (desktop) ---------- */
  if (RK.fine && !RK.reduce) {
    tiles.forEach(function (t) {
      var pv = t.querySelector('.pv'), v = null, timer = null;
      t.addEventListener('pointerenter', function () {
        timer = setTimeout(function () {
          if (!v) {
            v = document.createElement('video');
            v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
            v.src = url(byId[t.getAttribute('data-id')].src);
            pv.insertBefore(v, pv.children[1]);
          }
          v.currentTime = 0;
          v.play().then(function () { v.classList.add('on'); }).catch(function () {});
        }, 180);
      });
      t.addEventListener('pointerleave', function () { clearTimeout(timer); if (v) { v.pause(); v.classList.remove('on'); } });
    });
  }

  /* ---------- player ---------- */
  var modal = document.getElementById('player');
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
      (p ? '<div class="sub-block"><a class="btn btn-plum" href="../november/#post-' + p.num + '">See the post and captions ' + ICON.arrow + '</a></div>' : '') +
      (r.style !== 1 ? '<p class="muted" style="font-size:13.5px;margin-top:22px">The voiceover is a narrated, synthetic voice reading your own published words. The same lines can be re-recorded in your own voice and swapped in.</p>' : '');
    posEl.textContent = 'Reel ' + (idx + 1) + ' of ' + list.length;
    prevBtn.disabled = idx === 0; nextBtn.disabled = idx === list.length - 1;
    if (history.replaceState) history.replaceState(null, '', '#reel-' + r.id);
  }
  function open(id, autoplay) {
    list = visible(); if (!list.length) list = REELS.slice();
    idx = Math.max(0, list.findIndex(function (r) { return r.id === id; }));
    show(list[idx], autoplay);
    if (!modal.classList.contains('open')) RK.openModal(modal);
  }
  function step(d) { var n = idx + d; if (n < 0 || n >= list.length) return; idx = n; show(list[idx], true); }
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  modal.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  modal._onclose = function () { if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); mediaEl.innerHTML = ''; };
  grid.addEventListener('click', function (e) { var t = e.target.closest('.rtile'); if (t) open(t.getAttribute('data-id'), true); });

  var m = /^#reel-(.+)$/.exec(location.hash);
  if (m && byId[m[1]]) open(m[1], false);
})();
