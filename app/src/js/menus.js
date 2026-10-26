/* ---------- menus ---------- */
var stack = [],
  ovEl = null;
/* webOS 5's Chromium (68) can leave the old text in the compositor tile when an element's content is replaced, so menu and list text shows
   twice (issue 4). There the element is swapped for a fresh one instead of rewriting its content; newer engines just set innerHTML. */
var OLDGPU = (function () {
  var m = /Chrome\/(\d+)/.exec(navigator.userAgent || '');
  return !!m && +m[1] < 79;
})();
function setHtml(el, h) {
  if (!OLDGPU || !el.parentNode) {
    el.innerHTML = h;
    return el;
  }
  var n = el.cloneNode(false);
  n.innerHTML = h;
  el.parentNode.replaceChild(n, el);
  return n;
}
function openMenu(title, items, idx) {
  stack.push({ title: title, items: items, idx: idx || 0 });
  drawMenu();
}
function closeMenus() {
  stack = [];
  if (ovEl) {
    ovEl.remove();
    ovEl = null;
  }
}
function backMenu() {
  stack.pop();
  if (stack.length) drawMenu();
  else closeMenus();
}
function drawMenu() {
  var m = stack[stack.length - 1],
    N = 8,
    start = Math.max(0, Math.min(m.idx - 3, m.items.length - N));
  if (!ovEl) {
    ovEl = document.createElement('div');
    ovEl.id = 'ov';
    document.body.appendChild(ovEl);
  }
  var h = '<div class="panel"><h2></h2><div class="more">' + (start > 0 ? '▲' : '') + '</div>';
  for (var i = start; i < Math.min(m.items.length, start + N); i++) {
    var it = m.items[i];
    if (it.sep) {
      h += '<div class="msep"></div>';
      continue;
    }
    h +=
      '<div class="row' +
      (i === m.idx ? ' f' : '') +
      (it.dim ? ' dim' : '') +
      '" data-i="' +
      i +
      '">' +
      (it.icon ? svg(it.icon) : '') +
      '<span class="lb"></span>' +
      (it.sub ? '<span class="st"></span>' : '') +
      '</div>';
  }
  h += '<div class="more">' + (start + N < m.items.length ? '▼' : '') + '</div></div>';
  ovEl = setHtml(ovEl, h);
  ovEl.querySelector('h2').textContent = m.title;
  [].forEach.call(ovEl.querySelectorAll('.row'), function (row) {
    var it = m.items[+row.getAttribute('data-i')];
    row.querySelector('.lb').textContent = it.label;
    if (it.sub) row.querySelector('.st').textContent = it.sub;
    var pt = 0,
      rowHeld = false;
    if (it.hold) {
      row.addEventListener('mousedown', function () {
        rowHeld = false;
        clearTimeout(pt);
        pt = setTimeout(function () {
          rowHeld = true;
          it.hold();
        }, 650);
      });
      row.addEventListener('mouseup', function () {
        clearTimeout(pt);
      });
    }
    row.addEventListener('click', function () {
      if (rowHeld) return void (rowHeld = false);
      m.idx = +row.getAttribute('data-i');
      pickMenu();
    });
  });
}
function pickMenu() {
  var m = stack[stack.length - 1],
    it = m.items[m.idx];
  if (it && it.fn) {
    var n = stack.length;
    it.fn();
    if (stack.length === n && !it.stay) closeMenus();
  }
}
/* the next row up or down that is not a separator, or -1 */
function menuStep(m, d) {
  for (var i = m.idx + d; i >= 0 && i < m.items.length; i += d) if (!m.items[i].sep) return i;
  return -1;
}
function menuKey(k) {
  var m = stack[stack.length - 1],
    n = k === 38 ? menuStep(m, -1) : k === 40 ? menuStep(m, 1) : -1;
  if (n >= 0) {
    m.idx = n;
    drawMenu();
  } else if (k === 38 || k === 40) {
    /* the first or last row: nothing to move to */
  } else if (k === 13) pickMenu();
  else if (k === 461 || k === 27 || k === 8) backMenu();
  else return false;
  return true;
}

/* Back on the home screen lists the running apps to close them, as LG's Home does with its Recents on a second Back (issue 16) */
function runningMenu() {
  api('/api/running').then(
    function (x) {
      if (x.error) return toast(t('Could not read the running apps'));
      openMenu(t('Running apps'), runningItems(x.apps || []));
      stack[stack.length - 1].running = true;
    },
    function () {
      toast(t('Could not read the running apps'));
    }
  );
}
/* the list is only true for the moment it was read: it goes when Home is left, so it is never shown out of date */
function closeRunningMenu() {
  if (
    stack.some(function (m) {
      return m.running;
    })
  )
    closeMenus();
}
function runningItems(list) {
  if (!list.length) return [{ label: t('No apps are running'), dim: true }];
  var items = list.map(function (a) {
    return {
      label: a.title,
      sub: t('Close'),
      stay: true,
      fn: function () {
        closeRunning(list, [a.id]);
      },
    };
  });
  if (list.length > 1)
    items.push({
      label: t('Close all'),
      stay: true,
      fn: function () {
        closeRunning(
          list,
          list.map(function (a) {
            return a.id;
          })
        );
      },
    });
  return items;
}
/* the app manager's running list lags by seconds after a close, so the rows go at once instead of after a new reading */
function closeRunning(list, ids) {
  var m = stack[stack.length - 1],
    left = list.filter(function (a) {
      return ids.indexOf(a.id) < 0;
    });
  api('/api/running/close', ids.length > 1 ? { all: true } : { id: ids[0] }).then(
    function (x) {
      if (!x || x.returnValue !== true) toast(t('Could not close'));
    },
    function () {
      toast(t('Could not close'));
    }
  );
  ids.forEach(function (id) {
    delete running[id];
  });
  markRunning();
  m.items = runningItems(left);
  m.idx = Math.min(m.idx, m.items.length - 1);
  drawMenu();
}

function inputsMenu() {
  api('/api/inputs').then(function (x) {
    var items = (x.devices || [])
      .filter(function (d) {
        return d.appId;
      })
      .map(function (d) {
        var port = 'HDMI ' + d.port,
          named = d.label && d.label !== port && d.label !== 'HDMI ' + d.port,
          parts = [];
        if (named) parts.push(port);
        if (d.hdmiPlugIn) parts.push(t('Connected'));
        if (d.activate) parts.push(t('Active'));
        return {
          icon: 'hdmi',
          label: d.label || port,
          sub: parts.join(' \u00B7 '),
          dim: !d.hdmiPlugIn,
          fn: function () {
            launch(d.appId);
          },
          /* hold OK: pin the input to Home, where it is a tile like an app */
          hold: function () {
            inputMenu(d.appId, d.label || port);
          },
        };
      });
    openMenu(t('Inputs'), items);
  });
}
function isPinned(id) {
  return apps.some(function (a) {
    return a.id === id && a.input;
  });
}
function inputMenu(id, name) {
  var on = isPinned(id);
  openMenu(name, [
    {
      label: t('Open'),
      fn: function () {
        launch(id);
      },
    },
    {
      label: on ? t('Remove from Home') : t('Add to Home'),
      fn: function () {
        pinInput(id, name, !on);
      },
    },
  ]);
}
/* the service keeps the pinned inputs (also for the Inputs picker) and lists them with the apps */
function pinInput(id, name, on) {
  api('/api/inputs/pin', { id: id, on: on }).then(
    function (x) {
      if (!x || x.returnValue !== true) return toast(t('Could not change Home'));
      toast((on ? t('%s added to Home') : t('%s removed from Home')).replace('%s', name));
      lastSig = '';
      load();
    },
    function () {
      toast(t('Could not change Home'));
    }
  );
}

function appMenu(a) {
  var di = dockIds(),
    pos = di.indexOf(a.id),
    items = [
      {
        label: t('Open'),
        fn: function () {
          launch(a.id);
        },
      },
    ];
  if (pos >= 0) {
    if (pos > 0)
      items.push({
        label: t('Move left in dock'),
        fn: function () {
          var d = di.slice();
          d.splice(pos, 1);
          d.splice(pos - 1, 0, a.id);
          setDock(d);
        },
      });
    if (pos < di.length - 1)
      items.push({
        label: t('Move right in dock'),
        fn: function () {
          var d = di.slice();
          d.splice(pos, 1);
          d.splice(pos + 1, 0, a.id);
          setDock(d);
        },
      });
    items.push({
      label: t('Remove from dock'),
      fn: function () {
        setDock(
          di.filter(function (i) {
            return i !== a.id;
          })
        );
      },
    });
  } else if (di.length < TH.dockN)
    items.push({
      label: t('Add to dock'),
      fn: function () {
        setDock(di.concat(a.id));
      },
    });
  else
    items.push({
      label: t('Add to dock...'),
      stay: true,
      fn: function () {
        openMenu(
          t('Replace which app?'),
          di.map(function (id, i) {
            return {
              label: title(id),
              fn: function () {
                var d = di.slice();
                d[i] = a.id;
                setDock(d);
              },
            };
          })
        );
      },
    });
  if (a.input)
    items.push({
      label: t('Remove from Home'),
      fn: function () {
        pinInput(a.id, a.title, false);
      },
    });
  else
    items.push({
      label: t('Hide app'),
      fn: function () {
        hideApp(a.id);
      },
    });
  openMenu(a.title, items);
}

function removeButton(o) {
  cfg.topbar = topbar().filter(function (b) {
    return b !== o;
  });
  saveCfg();
}
/* moves a button one place among the shown ones (a hidden Live TV button keeps its place in the saved list) */
function moveButton(o, d) {
  var tb = topbar().slice(),
    i = tb.indexOf(o),
    j = i + d;
  while (j >= 0 && j < tb.length && !liveOn() && tb[j].action === 'live') j += d;
  if (i < 0 || j < 0 || j >= tb.length) return;
  tb[i] = tb[j];
  tb[j] = o;
  cfg.topbar = tb;
  saveCfg();
}
function barMenu(o) {
  var sb = shownBar(),
    pos = sb.indexOf(o),
    items = [];
  if (pos > 0)
    items.push({
      label: t('Move left'),
      fn: function () {
        moveButton(o, -1);
      },
    });
  if (pos >= 0 && pos < sb.length - 1)
    items.push({
      label: t('Move right'),
      fn: function () {
        moveButton(o, 1);
      },
    });
  items.push({
    label: t('Remove this button'),
    fn: function () {
      removeButton(o);
    },
  });
  openMenu(barLabel(o), items);
}
/* Customise: how Home looks. What the TV and the service do is in the manager app (More settings...) */
function customizeMenu() {
  var nh = hiddenIds().length;
  openMenu(t('Customise'), [
    { label: t('Dock'), stay: true, fn: dockMenu },
    { label: t('Top buttons'), stay: true, fn: topButtonsMenu },
    { label: t('Hidden apps'), sub: nh ? String(nh) : '', stay: true, fn: hiddenMenu },
    {
      label: t('App order'),
      sub: cfg.sort === 'alpha' ? t('A to Z') : t('Most used first'),
      fn: function () {
        cfg.sort = cfg.sort === 'alpha' ? 'usage' : 'alpha';
        saveCfg();
      },
    },
    {
      label: t('Mark running apps'),
      sub: cfg.runDots === true ? t('Green dot') : t('No dot'),
      fn: function () {
        if (cfg.runDots === true) delete cfg.runDots;
        else cfg.runDots = true;
        saveCfg();
      },
    },
    {
      label: t('Clock'),
      sub: cfg.clock === '24' ? t('24-hour') : cfg.clock === '12' ? t('12-hour') : t('Automatic'),
      fn: function () {
        cfg.clock = cfg.clock === '24' ? '12' : cfg.clock === '12' ? 'auto' : '24';
        saveCfg();
        tick();
      },
    },
    { sep: true },
    { label: t('Theme'), stay: true, fn: themeMenu },
    { label: t('Accent colour'), stay: true, fn: accentMenu },
    { sep: true },
    {
      label: t('More settings...'),
      sub: 'CleanYourTV',
      fn: function () {
        launch('com.cleanyourtv.manager');
      },
    },
  ]);
}
/* the apps that can go in the dock or on a button: not hidden, not Live TV, A to Z */
function pickApp(heading, skip, cb) {
  var list = apps
    .filter(function (a) {
      return a.id !== '__live' && !isHidden(a.id) && skip.indexOf(a.id) < 0;
    })
    .sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  openMenu(
    heading,
    list.map(function (a) {
      return {
        label: a.title,
        fn: function () {
          cb(a);
        },
      };
    })
  );
}
function dockMenu() {
  var di = dockIds(),
    items = di.map(function (id, i) {
      return {
        label: title(id),
        stay: true,
        fn: function () {
          dockSlotMenu(i);
        },
      };
    });
  if (di.length < TH.dockN)
    items.push({
      label: t('Add an app...'),
      stay: true,
      fn: function () {
        pickApp(t('Add to dock'), di, function (a) {
          setDock(dockIds().concat(a.id));
        });
      },
    });
  openMenu(t('Dock'), items);
}
function dockSlotMenu(i) {
  var di = dockIds(),
    id = di[i],
    move = function (d) {
      var x = di.slice();
      x[i] = x[i + d];
      x[i + d] = id;
      setDock(x);
    },
    items = [
      {
        label: t('Replace with...'),
        stay: true,
        fn: function () {
          pickApp(title(id), [id], function (a) {
            /* an app that is in the dock already swaps places with this one */
            var x = di.slice(),
              j = x.indexOf(a.id);
            if (j >= 0) x[j] = id;
            x[i] = a.id;
            setDock(x);
          });
        },
      },
    ];
  if (i > 0)
    items.push({
      label: t('Move left'),
      fn: function () {
        move(-1);
      },
    });
  if (i < di.length - 1)
    items.push({
      label: t('Move right'),
      fn: function () {
        move(1);
      },
    });
  items.push({
    label: t('Remove from dock'),
    fn: function () {
      setDock(
        di.filter(function (x) {
          return x !== id;
        })
      );
    },
  });
  openMenu(title(id), items);
}
function topButtonsMenu() {
  var items = shownBar().map(function (o) {
    return {
      icon: o.icon,
      label: barLabel(o),
      stay: true,
      fn: function () {
        barMenu(o);
      },
    };
  });
  items.push({ label: t('Add a button...'), stay: true, fn: addButtonMenu });
  openMenu(t('Top buttons'), items);
}
/* themes come from the service (GET /api/theme/list); choosing one applies it, a theme not on the TV is downloaded first */
function themeList(then) {
  api('/api/theme/list').then(
    function (r) {
      if (r.error) return toast(r.error);
      then(r);
    },
    function () {
      toast(t('Could not load the themes'));
    }
  );
}
function themeCall(path, b) {
  api(path, b).then(
    function (r) {
      if (r.error) return toast(r.error);
      lastSig = '';
      load();
    },
    function () {
      toast(t('Could not load the themes'));
    }
  );
}
function themeMenu() {
  themeList(function (r) {
    var cur = (r.current && r.current.id) || 'classic',
      at = 0,
      name = function (id) {
        var n = id;
        (r.themes || []).forEach(function (x) {
          if (x.id === id) n = x.name;
        });
        return n;
      },
      items = (r.themes || []).map(function (x, i) {
        if (x.id === cur) at = i;
        return {
          label: x.name,
          sub: x.id === cur ? t('Selected') : x.installed || x.id === 'classic' ? '' : t('Downloads when chosen'),
          fn: function () {
            if (x.id === cur) return;
            if (!x.installed) toast(t('Getting the theme...'));
            themeCall('/api/theme/set', { id: x.id });
          },
        };
      });
    if (r.previous && r.previous.id) {
      items.push({ sep: true });
      items.push({
        icon: 'restore',
        label: t('Go back to the previous theme'),
        sub: name(r.previous.id),
        fn: function () {
          themeCall('/api/theme/revert', {});
        },
      });
    }
    if (r.catalogue && !r.catalogue.ok) toast(t('Could not reach GitHub: showing the themes on this TV'));
    openMenu(t('Theme'), items, at);
  });
}
function accentMenu() {
  themeList(function (r) {
    var cur = (r.current && r.current.accent) || '',
      at = 0,
      items = (r.accents || []).map(function (a, i) {
        if (a.hex === cur) at = i;
        return {
          label: t(a.name),
          sub: a.hex === cur ? t('Selected') : '',
          fn: function () {
            themeCall('/api/theme/set', { accent: a.hex });
          },
        };
      });
    openMenu(t('Accent colour'), items, at);
  });
}
function addButtonMenu() {
  var items = PRESETS.filter(function (p) {
    return liveOn() || p.action !== 'live';
  }).map(function (p) {
    return {
      icon: p.icon,
      label: barLabel(p),
      fn: function () {
        cfg.topbar = topbar().concat([p]);
        saveCfg();
      },
    };
  });
  items.push({
    label: t('An app...'),
    stay: true,
    fn: function () {
      pickApp(t('Pick an app'), [], function (a) {
        cfg.topbar = topbar().concat([{ label: a.title, icon: 'grid', app: a.id }]);
        saveCfg();
      });
    },
  });
  openMenu(t('Add a button'), items);
}
function hiddenIds() {
  return (cfg.hidden || []).filter(function (id) {
    return apps.some(function (a) {
      return a.id === id;
    });
  });
}
function hiddenMenu() {
  var h = hiddenIds();
  openMenu(
    h.length ? t('Hidden apps (OK to show again)') : t('Hidden apps'),
    h.length
      ? h.map(function (id) {
          return {
            label: title(id),
            fn: function () {
              unhideApp(id);
            },
          };
        })
      : [{ label: t('No hidden apps'), dim: true }]
  );
}
