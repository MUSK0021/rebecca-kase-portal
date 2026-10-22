/* Website check: clickable pins on the 3D screens, expandable score areas, and the action plan checklist. */
(function () {
  'use strict';
  var RK = window.RK;
  var PINS = {
    desk: [
      { n: 1, x: 91.6, y: 5.6, k: 'soon', label: 'Fix soon', title: 'The menu hides behind a small button', text: 'On a laptop, visitors see only the word "Menu" in the corner. Showing the menu items in full puts every option one click away.', area: 'mobile' },
      { n: 2, x: 63, y: 46, k: 'now', label: 'Fix now', title: 'This page weighs 6.2 MB', text: 'Photos are uploaded far larger than they are shown. A healthy page is under 2 MB, and the Speaking page is 14 MB.', area: 'speed' },
      { n: 3, x: 24, y: 31, k: 'good', label: 'Working well', title: 'A clear, confident message', text: 'The homepage says what you do in one line, backed by warm photography.', area: null },
      { n: 4, x: 64, y: 85, k: 'good', label: 'Working well', title: 'Press logos build trust', text: '"As featured in" logos such as Forbes, U.S. News and Real Simple build trust in seconds.', area: null }
    ],
    mob: [
      { n: 5, x: 34, y: 76, k: 'soon', label: 'Fix soon', title: 'On phones, text sits on the photo', text: 'The headline and intro run across your photo on a phone screen, which makes them harder to read.', area: 'mobile' }
    ]
  };
  var BADGE = { now: 'now', soon: 'soon', good: 'good-b' };

  /* open an area's details and scroll to it */
  function openArea(id) {
    var d = document.getElementById(id);
    if (!d) return false;
    d.open = true;
    RK.fire(d);
    d.scrollIntoView({ behavior: RK.reduce ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open]');
    if (a && openArea(a.getAttribute('data-open'))) { e.preventDefault(); }
  });

  /* pins */
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } document.querySelectorAll('.pin[aria-expanded="true"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); }
  function openPop(btn, d) {
    closePop();
    pop = document.createElement('div');
    pop.className = 'pin-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', d.title);
    var link = d.area ? '<a href="#area-' + d.area + '" data-open="area-' + d.area + '">See the details</a>' : '<a href="#minute">See what is working</a>';
    pop.innerHTML = '<button class="x" type="button" aria-label="Close">' + RK.ICON.close.replace('<svg', '<svg width="16" height="16"') + '</button>' +
      '<span class="badge ' + BADGE[d.k] + '">' + d.label + '</span><h4>' + RK.esc(d.title) + '</h4><p>' + RK.esc(d.text) + '</p>' + link;
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    var left = Math.min(window.innerWidth - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2));
    var top = r.bottom + 12 + window.scrollY;
    if (r.bottom + ph + 24 > window.innerHeight) top = r.top - ph - 12 + window.scrollY;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    btn.setAttribute('aria-expanded', 'true');
    pop.querySelector('.x').addEventListener('click', closePop);
    pop.querySelector('a').addEventListener('click', function () { setTimeout(closePop, 0); });
  }
  document.querySelectorAll('[data-pins]').forEach(function (wrap) {
    (PINS[wrap.getAttribute('data-pins')] || []).forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pin p-' + d.k;
      b.style.left = d.x + '%'; b.style.top = d.y + '%';
      b.setAttribute('aria-label', d.n + ': ' + d.title); b.setAttribute('aria-expanded', 'false');
      b.innerHTML = '<span>' + d.n + '</span>';
      b.addEventListener('click', function (e) { e.stopPropagation(); if (b.getAttribute('aria-expanded') === 'true') closePop(); else openPop(b, d); });
      wrap.appendChild(b);
    });
  });
  document.addEventListener('click', function (e) { if (pop && !pop.contains(e.target) && !e.target.closest('.pin')) closePop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
  window.addEventListener('resize', closePop);

  /* animate the bars inside an area when it opens */
  document.querySelectorAll('details.acc').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) d.querySelectorAll('[data-w]').forEach(function (b) { b.style.width = b.dataset.w; }); });
  });
  if (/^#area-/.test(location.hash)) openArea(location.hash.slice(1));

  /* action plan, saved in this browser */
  var KEY = 'rk-plan-v2';
  var saved = RK.store.get(KEY, {});
  var boxes = [].slice.call(document.querySelectorAll('.fix input, .later-i input'));
  var main = [].slice.call(document.querySelectorAll('.fix input'));
  boxes.forEach(function (b, i) { b.id = 'plan-' + i; if (saved[i]) b.checked = true; });
  function upd() {
    var s = {};
    boxes.forEach(function (b, i) { if (b.checked) s[i] = 1; });
    RK.store.set(KEY, s);
    var n = main.filter(function (b) { return b.checked; }).length;
    var pf = document.getElementById('pf'), pt = document.getElementById('ptxt');
    if (pf) pf.style.width = (main.length ? 100 * n / main.length : 0) + '%';
    if (pt) pt.textContent = n + ' of ' + main.length + ' done';
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); });
  upd();
})();
