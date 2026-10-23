// Root service of CleanYourTV: bridges the launcher web app to luna, serves app icons, runs Live TV and picture
// notifications, keeps the Input-key picker alive and hosts the manager API. Listens on 127.0.0.1 only.
const http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
const VERSION = '1.5.11';
const PORT = 8765, DIR = '/media/developer/cleanyourtv', CONF = DIR + '/config.json', USAGE = DIR + '/usage.json';
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });

function luna(uri, payload) {
  return new Promise(res => {
    const sh = 'luna-send -n 1 -w 5000 -f "$1" "$2" </dev/null';
    cp.execFile('/bin/sh', ['-c', sh, 'sh', uri, JSON.stringify(payload || {})],
      { env: ENV, timeout: 8000, maxBuffer: 8 << 20 }, (e, out) => {
        try { res(JSON.parse(out)); } catch (_) { res({ returnValue: false, errorText: String(e || 'bad json') }); }
      });
  });
}
const readConf = () => { try { return JSON.parse(fs.readFileSync(CONF, 'utf8')); } catch (_) { return {}; } };
const writeConf = c => { fs.writeFileSync(CONF + '.tmp', JSON.stringify(c, null, 2), { mode: 0o600 }); fs.renameSync(CONF + '.tmp', CONF); };
let appCache = null, appCacheAt = 0;
async function apps() {
  if (appCache && Date.now() - appCacheAt < 5000) return appCache;
  const r = await luna('luna://com.webos.applicationManager/listApps', {});
  appCache = (r.apps || []).filter(a => a.visible !== false && a.id !== 'com.webos.app.home')
    .map(a => ({ id: a.id, title: a.title, icon: a.largeIcon || a.icon, folder: a.folderPath, type: a.type }));
  appCacheAt = Date.now();
  return appCache;
}

// ---- usage: count which apps get used (foreground changes), with a 30-day half-life ----
const HALF_LIFE = 30 * 24 * 3600 * 1000;
let usage = {};
try { usage = JSON.parse(fs.readFileSync(USAGE, 'utf8')); } catch (_) {}
const decayed = (u, now) => u.s * Math.pow(0.5, (now - u.t) / HALF_LIFE);
function usageScores() {
  const now = Date.now(), out = {};
  for (const id in usage) out[id] = Math.round(decayed(usage[id], now) * 1000) / 1000;
  return out;
}
let saveTimer = null;
function bump(id) {
  const now = Date.now(), u = usage[id];
  usage[id] = { s: (u ? decayed(u, now) : 0) + 1, t: now };
  if (!saveTimer) saveTimer = setTimeout(() => {
    saveTimer = null;
    try { fs.writeFileSync(USAGE + '.tmp', JSON.stringify(usage)); fs.renameSync(USAGE + '.tmp', USAGE); } catch (_) {}
  }, 15000);
}
// An app counts as "used" once it has stayed in the foreground for two polls in a row; going back to Home re-arms it.
let cand = null, streak = 0, counted = null;
async function onForeground(id) {
  if (id === 'com.webos.app.home') { counted = null; cand = id; streak = 1; return; }
  if (!id) return;
  if (id === cand) streak++; else { cand = id; streak = 1; }
  if (streak >= 2 && id !== counted) {
    counted = id;
    if ((await apps()).some(a => a.id === id)) bump(id);
  }
}
// Poll the foreground app every few seconds (a subscription's output is block-buffered by luna-send, so it would arrive late).
function pollForeground() {
  const ch = cp.spawn('luna-send', ['-n', '1', '-w', '3000', '-f', 'luna://com.webos.applicationManager/getForegroundAppInfo', '{}'],
    { env: ENV, stdio: ['ignore', 'pipe', 'ignore'] });
  let out = '';
  ch.stdout.on('data', d => out += d);
  ch.on('error', () => {});
  ch.on('close', () => { try { const o = JSON.parse(out); if (o.returnValue !== false) onForeground(o.appId || ''); } catch (_) {} });
}
let notify = null;
try { notify = require('./notify'); } catch (e) { console.error('notify module failed:', e.message); }
let live = null;
try { live = require('./live'); } catch (e) { console.error('live module failed:', e.message); }
let inputhook = { ensure() {}, status() { return {}; } };
try { inputhook = require('./inputhook'); } catch (e) { console.error('inputhook module failed:', e.message); }
const options = () => Object.assign({ debloat: true, inputKey: true }, readConf().options || {});
const keyCode = () => String(((readConf().keys || {}).input) || '241');
const voiceKey = () => { const v = readConf().voice || {}; return v.enabled && voice && voice.installed() ? String((readConf().keys || {}).voice || '') : ''; };
let pickerShownAt = 0;
let voice = null;
try { if (notify) voice = require('./voice').create({ notify, readConf, writeConf }); } catch (e) { console.error('voice module failed:', e.message); }
inputhook.setVoiceKey(voiceKey);
let theme = null;
try { theme = require('./theme').create({ readConf, writeConf }); } catch (e) { console.error('theme module failed:', e.message); }
let notifyApi = null;
try { if (notify) notifyApi = require('./notifyapi').create({ notify, readConf, writeConf }); } catch (e) { console.error('notification api module failed:', e.message); }
let manager = null;
try { manager = require('./manager').create({ luna, readConf, writeConf, inputhook, VERSION, notifyApi, voice, pickerShown: () => pickerShownAt }); } catch (e) { console.error('manager module failed:', e.message); }
const body = req => new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch (_) { r({}); } }); });

http.createServer(async (req, res) => {
  // Our apps are local files (their requests carry Origin "null"); curl and scripts send no Origin. A web page opened in the
  // TV's browser has an http(s) origin and is refused, so it cannot drive this root service.
  let origin = req.headers.origin;
  const rawOrigin = origin;
  // webOS 6 sends "file://<appId>-webos" for local apps instead of "null": accept that for our own apps and the Home slot only
  if (/^file:\/\/(com\.webos\.app\.home|com\.cleanyourtv\.(manager|picker|notify|live))-webos$/.test(origin || '')) origin = 'null';
  if (origin !== undefined && origin !== 'null') { console.log('refused origin ' + origin + ' ' + req.method + ' ' + req.url.slice(0, 60)); res.writeHead(403, { 'content-type': 'application/json' }); return res.end('{"error":"origin not allowed"}'); }
  // Chromium 79 (webOS 6) compares the answer with its own serialisation of a file origin, so for those origins echoing fails CORS: answer * there.
  // Only origins accepted above get this far.
  if (origin === 'null') { res.setHeader('Access-Control-Allow-Origin', rawOrigin === 'null' ? 'null' : '*'); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const json = (o, c) => { res.writeHead(c || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
  const u = req.url.split('?')[0];
  try {
    if (notify && u.startsWith('/api/notify')) return notify.handle(req, res, u, body);
    if (voice && u.startsWith('/api/voice/')) return voice.handle(req, res, u, body);
    if (live && u.startsWith('/api/live/')) return live.handle(req, res, u, body);
    if (theme && u.startsWith('/api/theme/')) return theme.handle(req, res, u, body);
    if (u === '/api/log') { if (/picker show/.test(decodeURIComponent(req.url.split('m=')[1] || ''))) pickerShownAt = Date.now(); console.log(fs.readFileSync('/proc/uptime', 'utf8').split(' ')[0] + ' ' + decodeURIComponent((req.url.split('m=')[1] || '')).slice(0, 300)); return json({}); }   // small diagnostics from the overlay apps
    if (manager && u.startsWith('/api/manager/')) return manager.handle(req, res, u, body);
    if (u === '/api/frontend-ok' && req.method === 'POST') { const b = await body(req); if (manager) manager.frontendLoaded(String(b.version || '')); return json({ returnValue: true }); }
    if (u === '/api/version') return json({ version: VERSION });
    if (u === '/api/apps') return json({ apps: await apps(), config: Object.assign((({ voice, notifyApi, theme: _t, ...rest }) => rest)(readConf()), theme ? { theme: theme.resolved() } : {}), usage: usageScores(), version: VERSION });
    if (u === '/api/inputs') return json(await luna('luna://com.webos.service.eim/getAllInputStatus', {}));
    if (u === '/api/foreground') return json(await luna('luna://com.webos.applicationManager/getForegroundAppInfo', {}));
    if (u === '/api/launch' && req.method === 'POST') {
      const b = await body(req);
      if (!/^[\w.\-]+$/.test(b.id || '')) return json({ error: 'bad id' }, 400);
      return json(await luna('luna://com.webos.applicationManager/launch', { id: b.id, params: b.params || {} }));
    }
    if (u === '/api/config' && req.method === 'POST') {
      const b = await body(req), strs = v => Array.isArray(v) ? v.filter(x => typeof x === 'string').slice(0, 200) : undefined;
      const out = {};
      if (strs(b.dock)) out.dock = strs(b.dock).slice(0, 8);
      if (strs(b.hidden)) out.hidden = strs(b.hidden);
      if (b.sort === 'usage' || b.sort === 'alpha') out.sort = b.sort;
      if (['auto', '24', '12'].includes(b.clock)) out.clock = b.clock;
      if (Array.isArray(b.topbar)) out.topbar = b.topbar.slice(0, 12).filter(o => o && typeof o.label === 'string').map(o => {
        const t = { label: o.label.slice(0, 40), icon: String(o.icon || 'grid').slice(0, 20) };
        if (typeof o.action === 'string') t.action = o.action; if (typeof o.app === 'string') t.app = o.app;
        if (o.params && typeof o.params === 'object') t.params = o.params; return t; });
      const old = readConf();   // settings the launcher does not own (options, updates source) stay as they are
      for (const k of Object.keys(old)) if (!(k in out) && !['dock', 'hidden', 'sort', 'clock', 'topbar'].includes(k)) out[k] = old[k];
      writeConf(out);
      return json({ returnValue: true });
    }
    if (u === '/api/undo' && req.method === 'POST') {   // LG's Home, kept until switched back on in the manager; restarts the TV
      if (manager) manager.useLgHome(); return json({ returnValue: true });
    }
    const m = u.match(/^\/icon\/([\w.\-]+)$/);
    if (m) {
      const a = (await apps()).find(x => x.id === m[1]);
      const f = a && a.icon && path.join(a.folder, a.icon);
      if (!f || !path.resolve(f).startsWith(path.resolve(a.folder)) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'max-age=3600' });
      return fs.createReadStream(f).pipe(res);
    }
    res.writeHead(404); res.end();
  } catch (e) { json({ error: String(e) }, 500); }
}).listen(PORT, '127.0.0.1', () => {
  try { fs.chmodSync(DIR + '/live', 0o700); } catch (_) {} try { fs.chmodSync(CONF, 0o600); } catch (_) {} try { fs.chmodSync(USAGE, 0o600); } catch (_) {}
  if (notifyApi) notifyApi.sync();
  setInterval(pollForeground, 4000);
  // Input key: bind it and keep the hook in LG's input processes (they restart now and then)
  setTimeout(() => inputhook.ensure(options().inputKey, keyCode()), 500);
  setInterval(() => inputhook.ensure(options().inputKey, keyCode()), 30000);
  try { require('./picker').start(luna, () => options().inputKey); } catch (e) { console.error('picker module failed:', e.message); }
  if (manager) setTimeout(() => manager.check(), 60000);
});
