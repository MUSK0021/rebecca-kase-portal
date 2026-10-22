/* November calendar: filters, the post viewer (phone preview, captions, copy), and notes. */
(function () {
  'use strict';
  var RK = window.RK, ICON = RK.ICON, esc = RK.esc, url = RK.url;
  var POSTS = window.RK_POSTS || [];
  var CFG = window.RK_CONFIG || {};
  var byNum = {}; POSTS.forEach(function (p, i) { p._i = i; byNum[p.num] = p; });
  var TYPE = { reel: 'Reel', carousel: 'Carousel', single: 'Single image' };
  var TYPE_IC = { reel: ICON.reel, carousel: ICON.stack, single: ICON.image };
  var NOTES_KEY = 'rk-notes-v1';
  var notes = RK.store.get(NOTES_KEY, {});

  /* ---------- filters ---------- */
  var seg = document.querySelector('.cal-tools .seg');
  if (seg) seg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-filter]'); if (!b) return;
    seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var f = b.getAttribute('data-filter');
    document.querySelectorAll('.day').forEach(function (d) { d.classList.toggle('dim', f !== 'all' && d.getAttribute('data-type') !== f); });
  });

  /* ---------- helpers ---------- */
  function paras(list) {
    return list.map(function (p) {
      var isTags = /^#\S/.test(p.trim());
      var h = esc(p).replace(/\n/g, '<br>');
      if (isTags) return '<p class="ht">' + h + '</p>';
      return '<p>' + h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>') + '</p>';
    }).join('');
  }
  function plain(list) { return list.join('\n\n'); }
  function capBlock(title, list, copyLabel) {
    return '<div class="cap-head"><h4>' + title + '</h4><button class="btn btn-line btn-sm" type="button" data-copy="' + esc(plain(list)) + '" data-copied="' + esc(copyLabel) + '">' + ICON.copy + 'Copy</button></div><div class="cap">' + paras(list) + '</div>';
  }
  function short(list) {
    var first = (list[0] || '').replace(/\s+/g, ' ');
    return first.length > 110 ? first.slice(0, 108).replace(/\s\S*$/, '') + '…' : first;
  }

  /* ---------- phone preview ---------- */
  function igPost(p) {
    var slides = p.slides || [];
    var el = document.createElement('div');
    el.className = 'ig';
    el.innerHTML =
      '<div class="hd"><img src="' + url('assets/img/avatar.webp') + '" alt=""><div><b>therebeccakase</b><small>' + esc(p.dow) + ', Nov ' + p.day + ' · ' + esc(p.time) + '</small></div></div>' +
      '<div class="sl-wrap"><div class="slides" tabindex="0" aria-label="Post images">' +
      slides.map(function (s, i) { return '<img src="' + url(s) + '" alt="' + (i === 0 ? esc(p.alt) : 'Slide ' + (i + 1)) + '"' + (i > 1 ? ' loading="lazy"' : '') + ' width="864" height="1080">'; }).join('') + '</div>' +
      (slides.length > 1 ? '<span class="sl-count">1/' + slides.length + '</span><button class="sl-btn prev" type="button" aria-label="Previous slide" hidden>' + ICON.left + '</button><button class="sl-btn next" type="button" aria-label="Next slide">' + ICON.right + '</button>' : '') + '</div>' +
      '<div class="row" style="position:relative">' + ICON.heart + ICON.comment + ICON.send + '<span class="sp"></span>' + ICON.save +
      (slides.length > 1 ? '<span class="dots">' + slides.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' : '') + '</div>' +
      '<div class="capt"><b>therebeccakase</b>' + esc(short(p.ig)) + ' <span class="more">more</span></div>';
    if (slides.length > 1) {
      var sc = el.querySelector('.slides'), prev = el.querySelector('.prev'), next = el.querySelector('.next'), cnt = el.querySelector('.sl-count'), dots = el.querySelectorAll('.dots i');
      function idx() { return Math.round(sc.scrollLeft / sc.clientWidth); }
      function upd() {
        var i = idx(); cnt.textContent = (i + 1) + '/' + slides.length;
        prev.hidden = i === 0; next.hidden = i === slides.length - 1;
        dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
      }
      sc.addEventListener('scroll', function () { clearTimeout(sc._t); sc._t = setTimeout(upd, 60); }, { passive: true });
      prev.addEventListener('click', function () { sc.scrollTo({ left: (idx() - 1) * sc.clientWidth, behavior: 'smooth' }); });
      next.addEventListener('click', function () { sc.scrollTo({ left: (idx() + 1) * sc.clientWidth, behavior: 'smooth' }); });
      sc.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.stopPropagation(); next.click(); } if (e.key === 'ArrowLeft') { e.stopPropagation(); prev.click(); } });
    }
    return el;
  }
  function phone(inner) {
    var ph = document.createElement('div');
    ph.className = 'phone';
    ph.innerHTML = '<div class="notch"></div><div class="screen"></div>';
    ph.querySelector('.screen').appendChild(inner);
    return ph;
  }

  /* ---------- info panel ---------- */
  function noteFor(num) { return notes[num] || null; }
  function saveNotes() {
    RK.store.set(NOTES_KEY, notes);
    paintFlags(); paintFab();
  }
  function infoHTML(p) {
    var tabs = [['ig', ICON.ig + 'Instagram'], ['li', ICON.li + 'LinkedIn'], ['fb', ICON.fb + 'Facebook']];
    if (p.script) tabs.push(['script', ICON.script + 'On-screen script']);
    tabs.push(['alt', ICON.eye + 'Alt text']);
    var n = noteFor(p.num) || {};
    var builtLinks = (p.built.links || []).map(function (l) { return '<div><a href="' + esc(l) + '" target="_blank" rel="noopener">' + esc(l.replace('https://', '').replace('www.', '')) + '</a></div>'; }).join('');
    var tagList = '<span class="tag t-' + p.type + '">' + TYPE_IC[p.type] + esc(p.format) + '</span>' +
      (p.audience ? '<span class="tag">For: ' + esc(p.audience) + '</span>' : '') +
      (p.extra ? '<span class="tag t-single">' + esc(p.extra) + '</span>' : '') +
      (p.seconds ? '<span class="tag">About ' + p.seconds + ' sec</span>' : '');
    return '' +
      '<div class="when">' + esc(p.dateLong) + ' · ' + esc(p.time) + ' (' + esc(p.timePT) + ')</div>' +
      '<h2 id="v-title">' + esc(p.title) + '</h2>' +
      '<div class="tags">' + tagList + '</div>' +
      '<div class="tabs" role="tablist">' + tabs.map(function (t, i) { return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-controls="pan-' + t[0] + '" aria-selected="' + (i === 0) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div role="tabpanel" id="pan-ig" aria-labelledby="tab-ig">' + capBlock('Instagram caption', p.ig, 'Instagram caption copied') + '</div>' +
      '<div role="tabpanel" id="pan-li" aria-labelledby="tab-li" hidden>' + capBlock('LinkedIn post', p.li, 'LinkedIn post copied') +
        (p.firstComment ? '<div class="sub-block">' + capBlock('First comment', [p.firstComment], 'First comment copied') + '</div>' : '') + '</div>' +
      '<div role="tabpanel" id="pan-fb" aria-labelledby="tab-fb" hidden>' + capBlock('Facebook caption', p.fb, 'Facebook caption copied') + '</div>' +
      (p.script ? '<div role="tabpanel" id="pan-script" aria-labelledby="tab-script" hidden><div class="cap-head"><h4>What happens on screen</h4></div><div class="script">' +
        p.script.map(function (r) { return '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1] || '') + '</span></div>'; }).join('') + '</div></div>' : '') +
      '<div role="tabpanel" id="pan-alt" aria-labelledby="tab-alt" hidden>' + capBlock('Alt text', [p.alt], 'Alt text copied') + '<p class="muted" style="font-size:13.5px;margin-top:10px">On Instagram: Advanced settings, then Accessibility.</p></div>' +
      '<div class="sub-block"><div class="cap-head"><h4>How to post</h4></div><ul class="how">' + p.how.map(function (h) { return '<li><span>' + esc(h) + '</span></li>'; }).join('') +
        (p.file ? '<li><span>File in Drive: <b>' + esc(p.file) + '</b></span></li>' : '') + '</ul></div>' +
      '<div class="sub-block built"><div class="cap-head"><h4>Built from</h4></div><div>' + esc(p.built.label) + '</div>' + builtLinks + '</div>' +
      '<div class="fb-box"><h4>How does this one look?</h4><div class="fb-btns">' +
        '<button type="button" class="ok" data-fb="ok" aria-pressed="' + (n.status === 'ok') + '">' + ICON.thumb + 'Looks good</button>' +
        '<button type="button" class="chg" data-fb="change" aria-pressed="' + (n.status === 'change') + '">' + ICON.edit + 'Needs a change</button></div>' +
        '<label class="sr-only" for="fb-note">Your note on this post</label>' +
        '<textarea id="fb-note" placeholder="Add a note, for example a different time, a word to change or a different image.">' + esc(n.note || '') + '</textarea>' +
        '<div class="saved" id="fb-saved">' + (n.status || n.note ? 'Saved in this browser.' : 'Notes save automatically in this browser.') + '</div></div>';
  }

  /* ---------- viewer ---------- */
  var modal = document.getElementById('viewer');
  var mediaEl = document.getElementById('v-media'), infoEl = document.getElementById('v-info');
  var posEl = document.getElementById('v-pos'), prevBtn = document.getElementById('v-prev'), nextBtn = document.getElementById('v-next');
  var current = null;

  function show(p, fromNav) {
    current = p;
    mediaEl.innerHTML = '';
    var inner = p.type === 'reel' ? RK.reelPlayer({ src: p.video, poster: p.poster, caption: short(p.ig), autoplay: !!fromNav }) : igPost(p);
    mediaEl.appendChild(phone(inner));
    infoEl.innerHTML = infoHTML(p);
    infoEl.scrollTop = 0; infoEl.parentElement.scrollTop = 0;
    posEl.textContent = 'Post ' + (p._i + 1) + ' of ' + POSTS.length + ' · ' + TYPE[p.type];
    prevBtn.disabled = p._i === 0; nextBtn.disabled = p._i === POSTS.length - 1;
    wireInfo(p);
    if (history.replaceState) history.replaceState(null, '', '#post-' + p.num);
  }
  function wireInfo(p) {
    var tabs = infoEl.querySelectorAll('[data-tab]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        infoEl.querySelectorAll('[role="tabpanel"]').forEach(function (pn) { pn.hidden = pn.id !== 'pan-' + t.getAttribute('data-tab'); });
      });
    });
    var fbBtns = infoEl.querySelectorAll('[data-fb]'), ta = infoEl.querySelector('#fb-note'), saved = infoEl.querySelector('#fb-saved');
    function commit(msg) {
      var pressed = infoEl.querySelector('[data-fb][aria-pressed="true"]');
      var st = pressed ? pressed.getAttribute('data-fb') : null;
      var note = ta.value.trim();
      if (!st && !note) delete notes[p.num]; else notes[p.num] = { status: st, note: note };
      saveNotes();
      saved.textContent = msg || 'Saved in this browser.';
    }
    fbBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        fbBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        commit();
        if (on && b.getAttribute('data-fb') === 'change') ta.focus();
        if (on) RK.toast(b.getAttribute('data-fb') === 'ok' ? 'Marked as looking good' : 'Marked as needing a change');
      });
    });
    ta.addEventListener('input', function () { clearTimeout(ta._t); ta._t = setTimeout(function () { commit(); }, 400); });
  }
  function open(num, autoplay) {
    var p = byNum[num]; if (!p) return;
    show(p, autoplay);
    if (!modal.classList.contains('open')) RK.openModal(modal);
    requestAnimationFrame(function () { infoEl.scrollTop = 0; infoEl.parentElement.scrollTop = 0; });
  }
  function step(d) {
    if (!current) return;
    var n = POSTS[current._i + d]; if (n) show(n, false);
  }
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  modal.addEventListener('keydown', function (e) {
    if (e.target.matches('textarea, input')) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  modal._onclose = function () { if (history.replaceState) history.replaceState(null, '', location.pathname + location.search); mediaEl.innerHTML = ''; };

  document.getElementById('cal').addEventListener('click', function (e) {
    var d = e.target.closest('.day'); if (d) open(d.getAttribute('data-num'), true);
  });

  /* ---------- flags and notes ---------- */
  function paintFlags() {
    document.querySelectorAll('.day').forEach(function (d) {
      var n = notes[d.getAttribute('data-num')];
      d.classList.toggle('flag', !!(n && (n.status || n.note)));
      d.classList.toggle('change', !!(n && n.status === 'change'));
    });
  }
  var fab = document.getElementById('notes-fab'), fabCount = document.getElementById('notes-count');
  function noteCount() { return Object.keys(notes).length; }
  function paintFab() { var c = noteCount(); fabCount.textContent = c; fab.classList.toggle('show', c > 0); }
  function notesText() {
    var lines = ['My notes on the November 2026 content:', ''];
    POSTS.forEach(function (p) {
      var n = notes[p.num]; if (!n) return;
      var st = n.status === 'ok' ? 'Looks good' : n.status === 'change' ? 'Needs a change' : 'Note';
      lines.push(p.dow + ', Nov ' + p.day + ' · ' + TYPE[p.type] + ' · ' + p.title);
      lines.push(st + (n.note ? ': ' + n.note : ''));
      lines.push('');
    });
    return lines.join('\n').trim();
  }
  var notesModal = document.getElementById('notes'), notesBody = document.getElementById('n-body');
  function openNotes() {
    var c = noteCount();
    var items = POSTS.filter(function (p) { return notes[p.num]; }).map(function (p) {
      var n = notes[p.num];
      var st = n.status === 'ok' ? '<span class="st ok">Looks good</span>' : n.status === 'change' ? '<span class="st change">Needs a change</span>' : '<span class="st">Note</span>';
      return '<li>' + st + '<div><b>' + esc(p.dow) + ', Nov ' + p.day + ' · ' + esc(p.title) + '</b></div>' + (n.note ? '<div>' + esc(n.note) + '</div>' : '') + '</li>';
    }).join('');
    var email = (CFG.feedbackEmail || '').trim();
    notesBody.innerHTML = c ?
      '<p>These notes are saved in this browser. Copy them into an email or message when you are ready.</p><ul class="notes-list">' + items + '</ul>' +
      '<div class="hero-actions" style="margin-top:18px"><button class="btn btn-plum" type="button" id="copy-notes">' + ICON.copy + 'Copy my notes</button>' +
      (email ? '<a class="btn btn-line" href="mailto:' + esc(email) + '?subject=' + encodeURIComponent('Notes on the November content') + '&body=' + encodeURIComponent(notesText()) + '">Email my notes</a>' : '') +
      '<button class="btn btn-line" type="button" id="clear-notes">Clear all</button></div>' :
      '<p>No notes yet. Open any post and choose <b>Looks good</b> or <b>Needs a change</b>, or add a note. Everything you mark shows up here, ready to copy.</p>';
    var cp = notesBody.querySelector('#copy-notes'); if (cp) cp.addEventListener('click', function () { RK.copyText(notesText(), 'Notes copied'); });
    var cl = notesBody.querySelector('#clear-notes'); if (cl) cl.addEventListener('click', function () {
      if (cl.dataset.armed) { notes = {}; saveNotes(); openNotes(); RK.toast('Notes cleared'); }
      else { cl.dataset.armed = '1'; cl.textContent = 'Tap again to clear'; }
    });
    if (!notesModal.classList.contains('open')) RK.openModal(notesModal);
  }
  fab.addEventListener('click', openNotes);
  var on = document.getElementById('open-notes'); if (on) on.addEventListener('click', openNotes);

  paintFlags(); paintFab();

  /* ---------- deep link: #post-02 ---------- */
  function fromHash() {
    var m = /^#post-(\d{2})$/.exec(location.hash);
    if (m && byNum[m[1]]) open(m[1]);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
