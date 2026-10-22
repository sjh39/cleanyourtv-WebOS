// Manager API (/api/manager/*): status, update checks, launcher (frontend) updates with rollback, service updates,
// options, and restoring LG's Home. Used by the CleanYourTV manager app on the TV.
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), https = require('https'), http = require('http');
const D = '/media/developer/cleanyourtv';
const SERVICE_DIR = '/media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service';
const DEFAULT_REPO = 'lasharor/cleanyourtv-WebOS';
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });

const semver = v => String(v || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
function cmp(a, b) { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? 1 : -1; return 0; }
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const sh = (cmd, ms) => new Promise(res => cp.execFile('/bin/sh', ['-c', cmd], { env: ENV, timeout: ms || 60000, maxBuffer: 8 << 20 }, (e, out, err) => res({ ok: !e, out: String(out || ''), err: String(err || '') })));

// GET a URL (follows redirects). Returns a Buffer, or with `file` streams to disk and resolves {sha256}.
const allowHttp = () => { try { return !!JSON.parse(fs.readFileSync(D + '/config.json', 'utf8')).releasesUrl; } catch (_) { return false; } };   // a custom release source, for testing
function fetch(url, file, hops) {
  return new Promise((resolve, reject) => {
    if ((hops || 0) > 6) return reject(new Error('too many redirects'));
    if (!url.startsWith('https:') && !allowHttp()) return reject(new Error('refusing a download over plain http'));
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'cleanyourtv-manager', Accept: file ? 'application/octet-stream, */*' : 'application/vnd.github+json, application/json, */*' }, timeout: 20000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return resolve(fetch(new URL(res.headers.location, url).toString(), file, (hops || 0) + 1)); }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      if (!file) { const b = []; res.on('data', c => b.push(c)); res.on('end', () => resolve(Buffer.concat(b))); return; }
      const h = crypto.createHash('sha256'), w = fs.createWriteStream(file);
      res.on('data', c => h.update(c)); res.pipe(w);
      w.on('finish', () => resolve({ sha256: h.digest('hex') })); w.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', reject);
  });
}

const LASTAPP = '/var/luna/preferences/bootd_last_foreground_app_id.json';
const restartTv = () => cp.spawn('/bin/sh', ['-c', 'sleep 3; reboot'], { env: ENV, detached: true, stdio: 'ignore' }).unref();
function fixLastApp() {   // the TV comes back to its last app; that must not be one of ours
  try { if (fs.readFileSync(LASTAPP, 'utf8').includes('cleanyourtv')) fs.writeFileSync(LASTAPP, '{"lastAppId":"com.webos.app.home"}'); } catch (_) {}
}
// Switching between LG's Home and ours needs a restart: LG's Home does not come back reliably while the system is running.
function setHome(enabled) {
  if (enabled) { try { fs.unlinkSync(D + '/DISABLE'); } catch (_) {} }
  else { fs.writeFileSync(D + '/DISABLE', ''); fixLastApp(); }
  restartTv();
}

function create(ctx) {
  const { luna, readConf, writeConf, inputhook, VERSION, pickerShown, notifyApi, voice } = ctx;
  const keys = () => { const k = Object.assign({ input: '', home: '', voice: '', learned: false }, readConf().keys || {}); return Object.assign(k, { inputIsDefault: !k.input, input: k.input || '241' }); };
  let job = { state: 'idle', message: '', at: 0 }, release = null, releaseAt = 0, releaseErr = '', frontendOk = null, checking = false;
  const setJob = (state, message) => { job = { state, message, at: Date.now() }; };
  const busy = () => job.state === 'working';

  const repoUrl = () => {
    const c = readConf();
    if (c.releasesUrl) return c.releasesUrl;
    const src = (() => { try { return fs.readFileSync(D + '/source', 'utf8').trim().split(/\s+/)[0]; } catch (_) { return ''; } })();
    return 'https://api.github.com/repos/' + (/^[\w.-]+\/[\w.-]+$/.test(src) ? src : DEFAULT_REPO) + '/releases/latest';
  };
  async function check() {
    checking = true;
    try {
      const j = JSON.parse((await fetch(repoUrl())).toString());
      const ver = String(j.tag_name || '').replace(/^v/, ''), assets = {};
      for (const a of j.assets || []) assets[a.name] = a.browser_download_url;
      let fv = null, sv = null;
      for (const n of Object.keys(assets)) {   // the launcher and the package are versioned separately
        let m = /^frontend-(\d+\.\d+\.\d+)\.tgz$/.exec(n); if (m && assets[n + '.sha256']) fv = m[1];
        m = /^com\.cleanyourtv\.manager_(\d+\.\d+\.\d+)_all\.ipk$/.exec(n); if (m && assets[n + '.sha256']) sv = m[1];
      }
      release = { version: ver, frontend: fv, service: sv, assets, notes: String(j.body || '').slice(0, 600) };
      releaseErr = '';
    } catch (e) { release = null; releaseErr = e.message === 'HTTP 404' ? 'no release published yet' : String(e.message || e); }
    releaseAt = Date.now(); checking = false;
    return release;
  }
  const frontendInfo = () => readJson(D + '/app/version.json', {});
  const prevInfo = () => readJson(D + '/app.prev/version.json', null);
  const options = () => Object.assign({ debloat: true, inputKey: true }, readConf().options || {});

  function status() {
    const fe = frontendInfo(), c = readConf();
    const lat = release;
    return {
      service: { version: VERSION, updateTo: lat && lat.service && cmp(lat.service, VERSION) > 0 ? lat.service : null },
      frontend: { version: fe.version || '?', previous: prevInfo() && prevInfo().version || null,
        updateTo: lat && lat.frontend && cmp(lat.frontend, fe.version) > 0 ? lat.frontend : null },
      release: lat ? { version: lat.version, frontend: lat.frontend, service: lat.service, notes: lat.notes } : null, checkedAt: releaseAt, checking, checkError: releaseErr,
      options: options(), voice: voice ? (v => ({ installed: v.installed, enabled: v.enabled }))(voice.status()) : null, notifyApi: notifyApi ? { enabled: notifyApi.info().enabled, port: notifyApi.info().port } : { enabled: false }, home: { enabled: !fs.existsSync(D + '/DISABLE'), ours: (() => { try { return fs.readFileSync('/proc/mounts', 'utf8').includes(' /usr/palm/applications/com.webos.app.home '); } catch (_) { return false; } })() },
      inputhook: inputhook.status(keys().input), keys: keys(), job, repo: repoUrl().replace(/^https:\/\/api\.github\.com\/repos\//, '').replace(/\/releases.*$/, ''),
    };
  }

  async function download(name, ver, dest) {
    const url = release.assets[name], shaUrl = release.assets[name + '.sha256'];
    if (!url) throw new Error('release has no ' + name);
    if (!shaUrl) throw new Error('release has no ' + name + '.sha256, refusing to install an unchecked file');
    const want = (await fetch(shaUrl)).toString().trim().split(/\s+/)[0].toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(want)) throw new Error('bad checksum file');
    const got = (await fetch(url, dest)).sha256;
    if (got !== want) { try { fs.unlinkSync(dest); } catch (_) {} throw new Error('checksum mismatch'); }
  }

  async function reloadHome() {
    await sh('pkill -f "[a]pp-id=com.webos.app.home"; sleep 2');
    await luna('luna://com.webos.applicationManager/launch', { id: 'com.webos.app.home' });
  }
  async function swapIn(srcApp) {   // srcApp becomes D/app; the old one is kept as D/app.prev
    await sh('rm -rf ' + D + '/app.prev && mv ' + D + '/app ' + D + '/app.prev && mv ' + srcApp + ' ' + D + '/app && sh ' + D + '/stage-home.sh');
  }
  async function waitFrontend(ver, ms) {
    const until = Date.now() + ms;
    while (Date.now() < until) { if (frontendOk === ver) return true; await new Promise(r => setTimeout(r, 1000)); }
    return false;
  }

  async function updateFrontend(ver) {
    setJob('working', 'Downloading launcher ' + ver);
    const T = D + '/tmp-frontend';
    try {
      if (!release || release.frontend !== ver) await check();
      if (!release || release.frontend !== ver) throw new Error('launcher ' + ver + ' is not in the latest release');
      await sh('rm -rf ' + T + ' && mkdir -p ' + T);
      await download('frontend-' + ver + '.tgz', ver, T + '/f.tgz');
      setJob('working', 'Checking the download');
      const lst = await sh('tar tzf ' + T + '/f.tgz');
      const names = lst.out.split('\n').filter(Boolean);
      if (!lst.ok || !names.length || names.some(n => n.startsWith('/') || n.split('/').includes('..') || !(n === 'app' || n.startsWith('app/'))))
        throw new Error('unexpected files in the download');
      if (!(await sh('cd ' + T + ' && tar xzf f.tgz')).ok) throw new Error('could not unpack');
      const nv = readJson(T + '/app/version.json', {});
      if (nv.version !== ver || !fs.existsSync(T + '/app/index.html')) throw new Error('the download is not launcher ' + ver);
      if (nv.minService && cmp(VERSION, nv.minService) < 0) throw new Error('needs service ' + nv.minService + ' or newer; update the service first');
      setJob('working', 'Installing launcher ' + ver);
      frontendOk = null;
      await swapIn(T + '/app');
      await reloadHome();
      setJob('working', 'Checking that the new launcher starts');
      if (!(await waitFrontend(ver, 40000))) {
        setJob('working', 'The new launcher did not start; rolling back');
        await swapBack();
        throw new Error('the new launcher did not start; the previous version is back');
      }
      setJob('done', 'Launcher ' + ver + ' installed');
    } catch (e) { setJob('error', String(e.message || e)); }
    await sh('rm -rf ' + T);
  }
  async function swapBack() {
    await sh('rm -rf ' + D + '/app.next && mv ' + D + '/app ' + D + '/app.next && mv ' + D + '/app.prev ' + D + '/app && mv ' + D + '/app.next ' + D + '/app.prev && sh ' + D + '/stage-home.sh');
    await reloadHome();
  }
  async function rollbackFrontend() {
    if (!prevInfo()) return setJob('error', 'there is no previous version');
    setJob('working', 'Going back to launcher ' + prevInfo().version);
    try { await swapBack(); setJob('done', 'Launcher ' + frontendInfo().version + ' restored'); } catch (e) { setJob('error', String(e.message || e)); }
  }

  async function updateService(ver) {
    setJob('working', 'Downloading service ' + ver);
    const f = D + '/tmp-service.ipk', name = 'com.cleanyourtv.manager_' + ver + '_all.ipk';
    try {
      if (!release || release.service !== ver) await check();
      if (!release || release.service !== ver) throw new Error('service ' + ver + ' is not in the latest release');
      await download(name, ver, f);
      setJob('working', 'Installing service ' + ver);
      const r = await luna('luna://com.webos.appInstallService/dev/install', { id: 'com.cleanyourtv.manager', ipkUrl: f, subscribe: false });
      if (!r.returnValue) throw new Error('the system refused the install: ' + (r.errorText || ''));
      const until = Date.now() + 90000;
      let ok = false;
      while (Date.now() < until) {
        await new Promise(r2 => setTimeout(r2, 3000));
        const ai = await luna('luna://com.webos.applicationManager/getAppInfo', { id: 'com.cleanyourtv.manager' });
        if (ai.appInfo && ai.appInfo.version === ver) { ok = true; break; }
      }
      if (!ok) throw new Error('the install did not finish');
      setJob('working', 'Restarting the service');
      cp.spawn('/bin/sh', ['-c', 'sleep 1; sh ' + SERVICE_DIR + '/bootstrap.sh update ' + ver], { env: ENV, detached: true, stdio: 'ignore' }).unref();
    } catch (e) { setJob('error', String(e.message || e)); try { fs.unlinkSync(f); } catch (_) {} }
  }

  async function setOptions(o) {
    const c = readConf(), cur = options(), next = Object.assign({}, cur);
    if (typeof o.debloat === 'boolean') next.debloat = o.debloat;
    if (typeof o.inputKey === 'boolean') next.inputKey = o.inputKey;
    c.options = next; writeConf(c);
    if (next.debloat !== cur.debloat) {
      if (next.debloat) await sh('ln -sf ' + D + '/15-cleanyourtv-debloat /var/lib/webosbrew/init.d/15-cleanyourtv-debloat; sh ' + D + '/debloat-stop.sh', 60000);
      else await sh('rm -f /var/lib/webosbrew/init.d/15-cleanyourtv-debloat; sh ' + D + '/debloat-undo.sh', 60000);
    }
    inputhook.ensure(next.inputKey, keys().input);
    return next;
  }

  async function handle(req, res, u, body) {
    const json = (o, c) => { res.writeHead(c || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    const act = u.replace('/api/manager/', '');
    if (act === 'status') { if (!checking && Date.now() - releaseAt > 300000) check(); return json(status()); }
    if (act === 'learn-state') {   // the code of the key just pressed; saved here once it arrives
      const l = inputhook.learnState();
      if (l.state === 'got' && !l.saved) {
        const c = readConf(), k = Object.assign({ input: '241', home: '', voice: '' }, c.keys || {});
        k[l.name] = l.code; c.keys = k; writeConf(c);   // 'learned' is set when the Input flow is finished (keys-done)
        inputhook.markSaved && inputhook.markSaved();
        if (l.name === 'input') inputhook.ensure(options().inputKey, l.code); else if (l.name === 'voice') inputhook.ensure(options().inputKey, keys().input);
      }
      return json(l);
    }
    if (act === 'notify-api' && req.method === 'GET') return json(notifyApi ? notifyApi.info() : { enabled: false });
    if (act === 'test-key') return json({ pickerShownAt: pickerShown ? pickerShown() : 0, now: Date.now() });
    if (req.method !== 'POST') return json({ error: 'POST expected' }, 405);
    const b = await body(req);
    if (act === 'check') { await check(); return json(status()); }
    if (act === 'notify-api') return json(notifyApi ? notifyApi.set(b) : { enabled: false });
    if (act === 'learn-key') { inputhook.startLearn(['home', 'voice'].includes(b.name) ? b.name : 'input'); return json({ returnValue: true }); }
    if (act === 'clear-key') {   // forget a learned code: Input goes back to the default, Home to none
      const name = ['home', 'voice'].includes(b.name) ? b.name : 'input', c = readConf(), k = Object.assign({ input: '', home: '', voice: '' }, c.keys || {});
      k[name] = ''; if (name === 'input') k.learned = false; c.keys = k; writeConf(c);
      if (name !== 'home') inputhook.ensure(options().inputKey, keys().input);
      return json({ returnValue: true });
    }
    if (act === 'keys-done') { const c = readConf(); c.keys = Object.assign({ input: '241', home: '' }, c.keys || {}, { learned: true }); writeConf(c); return json({ returnValue: true }); }
    if (act === 'options') { await setOptions(b); return json(status()); }
    if (act === 'home') { setHome(b.enabled !== false); return json({ returnValue: true }); }
    if (act === 'restore') { setHome(false); return json({ returnValue: true }); }
    if (act === 'uninstall') {
      cp.spawn('/bin/sh', ['-c', 'sleep 1; sh ' + D + '/uninstall.sh'], { env: ENV, detached: true, stdio: 'ignore' }).unref();
      return json({ returnValue: true });
    }
    if (['update-frontend', 'rollback-frontend', 'update-service'].includes(act)) {
      if (busy()) return json({ error: 'busy', job }, 409);
      const ver = String(b.version || '').replace(/[^0-9.]/g, '');
      if (act === 'update-frontend') updateFrontend(ver);
      else if (act === 'update-service') updateService(ver);
      else rollbackFrontend();
      return json({ returnValue: true, job });
    }
    return json({ error: 'unknown action' }, 404);
  }
  const frontendLoaded = v => { frontendOk = v; };
  return { handle, check, frontendLoaded, status, useLgHome: () => setHome(false) };
}
module.exports = { create, cmp, fetch };
