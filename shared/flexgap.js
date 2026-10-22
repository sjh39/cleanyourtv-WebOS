/* Flex "gap" for Chromium older than 84 (webOS 6): where flexbox ignores gap, the spacing is applied as margins.
   build.py adds this script to every page; newer Chromium returns at once. */
(function () {
  function supported() {
    var t = document.createElement('div');
    t.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute';
    t.appendChild(document.createElement('div')); t.appendChild(document.createElement('div'));
    document.body.appendChild(t);
    var ok = t.scrollHeight === 1;
    document.body.removeChild(t);
    return ok;
  }
  function apply() {
    var old = document.querySelectorAll('[data-fg]'), i, k;
    for (k = 0; k < old.length; k++) { old[k].style.marginTop = ''; old[k].style.marginLeft = ''; old[k].removeAttribute('data-fg'); }
    var all = document.querySelectorAll('*');
    for (i = 0; i < all.length; i++) {
      var e = all[i], cs = getComputedStyle(e);
      if (cs.display.indexOf('flex') < 0) continue;
      var cg = parseFloat(cs.columnGap) || 0, rg = parseFloat(cs.rowGap) || 0;
      if (!cg && !rg) continue;
      var column = cs.flexDirection.indexOf('column') === 0, first = true;
      for (var c = e.firstElementChild; c; c = c.nextElementSibling) {
        var ccs = getComputedStyle(c);
        if (ccs.position === 'absolute' || ccs.position === 'fixed' || ccs.display === 'none') continue;
        if (first) { first = false; continue; }
        if (column) { if (!c.style.marginTop) { c.style.marginTop = rg + 'px'; c.setAttribute('data-fg', ''); } }
        else if (!c.style.marginLeft) { c.style.marginLeft = cg + 'px'; c.setAttribute('data-fg', ''); }
      }
    }
  }
  function start() {
    if (supported()) return;
    apply();
    var pending = 0;
    new MutationObserver(function (list) {
      for (var j = 0; j < list.length; j++) if (list[j].type === 'childList') {
        if (!pending) pending = setTimeout(function () { pending = 0; apply(); }, 50);
        return;
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
