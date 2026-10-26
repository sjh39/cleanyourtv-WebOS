/* ---------- wiggle mode: hold OK on an app and every tile wiggles. OK picks the focused app up and puts it down again; while it is
   carried the arrows move it, also into the dock (a full dock swaps the app there with it). Hold OK hides the focused app (an input:
   takes it off Home), the × on a tile does the same with the pointer, Back ends it. Moving an app in the grid switches App order to
   My order (cfg.sort 'custom', the grid's ids in cfg.order). The pointer drags: hold the button on a tile, release over another. ---------- */
var WIG = (function () {
  var on = false,
    carry = null,
    dirty = false,
    drag = null,
    hint = null;

  function gridIds() {
    var di = dockIds();
    return apps
      .filter(function (a) {
        return !isHidden(a.id) && di.indexOf(a.id) < 0;
      })
      .sort(byOrder)
      .map(function (a) {
        return a.id;
      });
  }
  function setHint() {
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'wighint';
      document.body.appendChild(hint);
    }
    hint.textContent = carry ? t('Arrows: move · OK: put down') : t('OK: pick up · Hold OK: hide · Back: done');
  }
  function badges(add) {
    for (var id in tiles) {
      var d = tiles[id],
        x = d.querySelector('.wx');
      if (add && !x && d._a && !d._a.sys) {
        x = document.createElement('i');
        x.className = 'wx';
        x.textContent = '×';
        x._id = id;
        d.appendChild(x);
      } else if (!add && x) x.remove();
    }
  }
  function mark() {
    for (var id in tiles) tiles[id].classList.toggle('carry', id === carry);
    setHint();
  }
  /* the new order is shown at once; it is saved when the app is put down or wiggle mode ends */
  function apply(di, g, gridChanged) {
    cfg.dock = di;
    if (gridChanged) {
      cfg.order = g;
      cfg.sort = 'custom';
    }
    dirty = true;
    rebuild();
    badges(true);
    mark();
  }
  function swap(a, i, j) {
    var x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  /* move the carried app one step with an arrow key */
  function step(k) {
    var id = carry,
      di = dockIds().slice(),
      g = gridIds(),
      N = TH.cols,
      p = di.indexOf(id),
      gi = g.indexOf(id);
    if (p >= 0) {
      if (k === 37 && p > 0) swap(di, p, p - 1);
      else if (k === 39 && p < di.length - 1) swap(di, p, p + 1);
      else if (k === 40) {
        di.splice(p, 1);
        g.splice(Math.min(g.length, mapCol(di.length + 1, Math.min(N, g.length + 1), p)), 0, id);
        return apply(di, g, true);
      } else return;
      return apply(di, g, false);
    }
    if (gi < 0) return;
    var row = Math.floor(gi / N),
      to = -1;
    if (k === 37 && gi > 0) to = gi - 1;
    else if (k === 39 && gi < g.length - 1) to = gi + 1;
    else if (k === 40 && gi + N < g.length) to = gi + N;
    else if (k === 40 && row < Math.floor((g.length - 1) / N)) to = g.length - 1;
    else if (k === 38 && row > 0) to = gi - N;
    else if (k === 38) {
      /* up from the grid's first row: into the dock, or swapped with the dock app above it when the dock is full */
      var rl = Math.min(N, g.length),
        col = gi % N;
      if (di.length < TH.dockN) {
        di.splice(di.length ? mapCol(rl, di.length + 1, col) : 0, 0, id);
        g.splice(gi, 1);
      } else {
        var pos = mapCol(rl, di.length, col),
          out = di[pos];
        di[pos] = id;
        g[gi] = out;
      }
      return apply(di, g, true);
    }
    if (to < 0) return;
    g.splice(gi, 1);
    g.splice(to, 0, id);
    apply(di, g, true);
  }
  /* put the carried app where another one is (the pointer) */
  function place(id, target) {
    if (!target || target === id) return;
    var di = dockIds().slice(),
      g = gridIds(),
      p = di.indexOf(id),
      gi = g.indexOf(id),
      tp = di.indexOf(target),
      tg = g.indexOf(target);
    if (tp >= 0) {
      if (p >= 0) {
        swap(di, p, tp);
        return apply(di, g, false);
      }
      if (di.length >= TH.dockN) {
        di[tp] = id;
        g[gi] = target;
      } else {
        di.splice(tp, 0, id);
        g.splice(gi, 1);
      }
      return apply(di, g, true);
    }
    if (tg < 0) return;
    if (p >= 0) di.splice(p, 1);
    else g.splice(gi, 1);
    g.splice(tg, 0, id);
    apply(di, g, true);
  }
  function remove(id) {
    var a = null;
    apps.forEach(function (x) {
      if (x.id === id) a = x;
    });
    if (!a) return;
    if (carry === id) carry = null;
    if (a.input) {
      pinInput(a.id, a.title, false);
      return;
    }
    /* hideApp saves at once; the order changed so far is saved with it */
    hideApp(id);
    dirty = false;
    toast(t('%s hidden').replace('%s', a.title));
    badges(true);
    mark();
  }

  function enter(e, ptr) {
    if (!e._a || e._a.sys) return;
    on = true;
    carry = e._a.id;
    dirty = false;
    document.body.classList.add('wiggle');
    badges(true);
    mark();
    if (ptr) drag = carry;
  }
  function exit() {
    if (!on) return;
    on = false;
    carry = null;
    drag = null;
    document.body.classList.remove('wiggle');
    badges(false);
    for (var id in tiles) tiles[id].classList.remove('carry');
    if (hint) {
      hint.remove();
      hint = null;
    }
    if (dirty) saveCfg();
    dirty = false;
  }
  /* OK (or a click) on a tile: pick it up, or put the carried one down; on a top button it ends wiggle mode */
  function ok(e) {
    if (!e._a) return exit();
    if (carry) {
      carry = null;
      if (dirty) saveCfg();
      dirty = false;
      badges(true);
    } else if (!e._a.sys) carry = e._a.id;
    mark();
  }
  /* hold OK in wiggle mode: hide the focused app; with the pointer, start dragging it */
  function hold(e, ptr) {
    if (!e._a || e._a.sys) return;
    if (ptr) {
      carry = drag = e._a.id;
      mark();
      return;
    }
    remove(e._a.id);
  }
  function key(e) {
    var k = e.keyCode;
    if (k === 461 || k === 27 || k === 8) {
      exit();
      return true;
    }
    if (carry && k >= 37 && k <= 40) {
      step(k);
      return true;
    }
    return false;
  }

  document.addEventListener('mouseup', function (ev) {
    if (!on || !drag) return;
    var el = document.elementFromPoint(ev.clientX, ev.clientY),
      tl = el && el.closest ? el.closest('.tile') : null,
      id = drag;
    drag = null;
    if (tl && tl._a) place(id, tl._a.id);
    carry = null;
    if (dirty) saveCfg();
    dirty = false;
    badges(true);
    mark();
  });
  /* the × on a tile, or a click away from the tiles, before the tile's own click handler sees it */
  document.addEventListener(
    'click',
    function (ev) {
      if (!on) return;
      var x = ev.target.closest ? ev.target.closest('.wx') : null;
      if (x) {
        ev.stopPropagation();
        remove(x._id);
        return;
      }
      if (!(ev.target.closest && ev.target.closest('.tile,.pill'))) exit();
    },
    true
  );

  return {
    get on() {
      return on;
    },
    enter: enter,
    exit: exit,
    ok: ok,
    hold: hold,
    key: key,
  };
})();
