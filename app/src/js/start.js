/* first paint straight from the last known layout, then refresh from the helper */
try {
  var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cached && cached.apps && cached.apps.length) {
    apps = cached.apps;
    cfg = cached.cfg || {};
    applyTheme(cfg.theme);
    usage = cached.usage || {};
    colors = cached.colors || {};
    rebuild();
  }
} catch (e) {}
load();
wantInputs();
api('/api/frontend-ok', { version: VERSION }).catch(function () {}); // lets the manager know an updated launcher started
