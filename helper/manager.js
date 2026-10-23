// Manager API (/api/manager/*): status, update checks, launcher (frontend) updates with rollback, service updates,
// options, and restoring LG's Home. Used by the CleanYourTV manager app on the TV.
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), https = require('https'), http = require('http');
const nc = require('./netcompat'), { URL, URLSearchParams } = nc;
const D = process.env.CYTV_DIR || '/media/developer/cleanyourtv';   // the environment variables are for tools/node8-check.js
const SERVICE_DIR = process.env.CYTV_SERVICE_DIR || '/media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service';
const apiBase = () => process.env.CYTV_API || 'https://api.github.com';
const DEFAULT_REPO = 'lasharor/cleanyourtv-WebOS';
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });

const semver = v => String(v || '0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
function cmp(a, b) { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? 1 : -1; return 0; }
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const sh = (cmd, ms) => new Promise(res => require('./diag').execFile('/bin/sh', ['-c', cmd], { env: ENV, timeout: ms || 60000, maxBuffer: 8 << 20 }, (e, out, err) => res({ ok: !e, out: String(out || ''), err: String(err || '') })));

// GET a URL (follows redirects). Returns a Buffer, or with `file` streams to disk and resolves {sha256}.
const allowHttp = () => { if (process.env.CYTV_API) return true; try { return !!JSON.parse(fs.readFileSync(D + '/config.json', 'utf8')).releasesUrl; } catch (_) { return false; } };   // a custom release source, for testing
function fetch(url, file, hops) {
  return new Promise((resolve, reject) => {
    if ((hops || 0) > 6) return reject(new Error('too many redirects'));
    if (!url.startsWith('https:') && !allowHttp()) return reject(new Error('refusing a download over plain http'));
    const mod = url.startsWith('https:') ? https : http;
    const req = nc.get(mod, url, { headers: { 'User-Agent': 'cleanyourtv-manager', Accept: file ? 'application/octet-stream, */*' : 'application/vnd.github+json, application/json, */*' }, timeout: 20000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return resolve(fetch(new URL(res.headers.location, url).toString(), file, (hops || 0) + 1)); }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      // a connection that drops after the headers emits 'aborted' on the response, not an error on the request: without these the promise never settles
      let ended = false; res.on('aborted', () => reject(new Error('the connection was lost'))); res.on('error', reject); res.on('close', () => { if (!ended) reject(new Error('the connection was closed')); });
      if (!file) { const b = []; res.on('data', c => b.push(c)); res.on('end', () => { ended = true; resolve(Buffer.concat(b)); }); return; }
      const h = crypto.createHash('sha256'), w = fs.createWriteStream(file);
      res.on('data', c => h.update(c)); res.on('end', () => { ended = true; }); res.pipe(w);
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
  const { luna, readConf, writeConf, inputhook, VERSION, pickerShown, notifyApi, voice } = ctx, pickerMode = ctx.pickerMode || (() => 'overlay'), syncPickerMode = ctx.syncPickerMode || (() => {});
  const inputKeyOn = ctx.inputKeyOn || (() => options().inputKey);
  const keys = () => { const k = Object.assign({ input: '', home: '', voice: '', guide: '', learned: false }, readConf().keys || {}); return Object.assign(k, { inputIsDefault: !k.input, input: k.input || '241' }); };
  let job = { state: 'idle', message: '', at: 0 }, release = null, releaseAt = 0, releaseErr = '', frontendOk = null, checking = false;
  const setJob = (state, message) => { job = { state, message, at: Date.now() }; };
  const busy = () => job.state === 'working';

  // Update channel: stable (the latest release) or a test build, a pre-release tagged test-<branch> that the repository's workflow
  // publishes for a branch. The choice is the file D/channel, so install.sh can set it too.
  const TEST_TAG = /^test-[a-z0-9-]{1,60}$/;
  const channel = () => { try { const t = fs.readFileSync(D + '/channel', 'utf8').trim(); return TEST_TAG.test(t) ? t : ''; } catch (_) { return ''; } };
  const baseRepo = () => {
    const src = (() => { try { return fs.readFileSync(D + '/source', 'utf8').trim().split(/\s+/)[0]; } catch (_) { return ''; } })();
    return apiBase() + '/repos/' + (/^[\w.-]+\/[\w.-]+$/.test(src) ? src : DEFAULT_REPO);
  };
  const repoUrl = () => {
    const c = readConf();
    if (c.releasesUrl) return c.releasesUrl;
    return baseRepo() + (channel() ? '/releases/tags/' + channel() : '/releases/latest');
  };
  // the commit a build was made from (test builds only; a stable install has no BUILD file)
  const buildOf = f => { try { const b = fs.readFileSync(f, 'utf8').trim(); return /^[0-9a-f]{7,40}$/.test(b) ? b : ''; } catch (_) { return ''; } };
  const serviceBuild = () => buildOf(D + '/BUILD'), frontendBuild = () => buildOf(D + '/app/BUILD');
  const buildInBody = body => { const m = /^build:\s*([0-9a-f]{7,40})\s*$/m.exec(String(body || '')); return m ? m[1] : ''; };
  // is the offered file different from what is installed? A newer version always is; a test build also when it is another commit
  // of the same version; and a test build installed with the channel back on stable offers the stable release, even an older one.
  const differs = (offered, installed, offeredBuild, installedBuild) => {
    if (!offered) return false;
    if (cmp(offered, installed) > 0) return true;
    if (offeredBuild) return offeredBuild !== installedBuild;
    return !!installedBuild && offered !== installed;
  };
  // a hard limit, so the "Checking..." state can never last: whatever the network does, the check ends
  const within = (p, ms, msg) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error(msg)), ms); p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); }); });
  async function check() {
    checking = true;
    try {
      const j = JSON.parse((await within(fetch(repoUrl()), 45000, 'no answer from GitHub in time')).toString());
      const ver = String(j.tag_name || '').replace(/^(v|test-)/, ''), assets = {};
      for (const a of j.assets || []) assets[a.name] = a.browser_download_url;
      let fv = null, sv = null;
      for (const n of Object.keys(assets)) {   // the launcher and the package are versioned separately
        let m = /^frontend-(\d+\.\d+\.\d+)\.tgz$/.exec(n); if (m && assets[n + '.sha256']) fv = m[1];
        m = /^com\.cleanyourtv\.manager_(\d+\.\d+\.\d+)_all\.ipk$/.exec(n); if (m && assets[n + '.sha256']) sv = m[1];
      }
      release = { version: ver, frontend: fv, service: sv, assets, build: buildInBody(j.body), test: !!channel(), notes: String(j.body || '').slice(0, 600) };
      releaseErr = '';
    } catch (e) { release = null; releaseErr = e.message === 'HTTP 404' ? 'no release published yet' : String(e.message || e); }
    releaseAt = Date.now(); checking = false;
    return release;
  }
  const frontendInfo = () => readJson(D + '/app/version.json', {});
  const prevInfo = () => readJson(D + '/app.prev/version.json', null);
  const options = () => Object.assign({ debloat: true, inputKey: true, liveTv: true }, readConf().options || {});

  function status() {
    const fe = frontendInfo(), c = readConf();
    const lat = release;
    return {
      service: { version: VERSION, build: serviceBuild(), updateTo: lat && differs(lat.service, VERSION, lat.build, serviceBuild()) ? lat.service : null },
      frontend: { version: fe.version || '?', build: frontendBuild(), previous: prevInfo() && prevInfo().version || null,
        updateTo: lat && differs(lat.frontend, fe.version, lat.build, frontendBuild()) ? lat.frontend : null },
      channel: channel(), release: lat ? { version: lat.version, frontend: lat.frontend, service: lat.service, build: lat.build, test: lat.test, notes: lat.notes } : null, checkedAt: releaseAt, checking, checkError: releaseErr,
      options: options(), picker: Object.assign({}, readConf().picker || {}, { mode: pickerMode(), released: !!options().inputKey && !inputKeyOn() }), voice: voice ? (v => ({ installed: v.installed, enabled: v.enabled }))(voice.status()) : null, notifyApi: notifyApi ? { enabled: notifyApi.info().enabled, port: notifyApi.info().port } : { enabled: false }, home: { enabled: !fs.existsSync(D + '/DISABLE'), fullhome: fs.existsSync('/usr/palm/applications/com.webos.app.fullhome'), ours: (() => { try { return fs.readFileSync('/proc/mounts', 'utf8').includes(' /usr/palm/applications/com.webos.app.home '); } catch (_) { return false; } })() },
      inputhook: inputhook.status(keys().input), keys: keys(), job, repo: repoUrl().replace(/^https?:\/\/[^/]+\/repos\//, '').replace(/\/releases.*$/, ''),
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
      const until = Date.now() + 90000, before = buildOf(SERVICE_DIR + '/BUILD');
      let ok = false, seen = 0;
      while (Date.now() < until) {
        await new Promise(r2 => setTimeout(r2, 3000));
        const ai = await luna('luna://com.webos.applicationManager/getAppInfo', { id: 'com.cleanyourtv.manager' });
        if (!(ai.appInfo && ai.appInfo.version === ver)) continue;
        // the same version number can be a different build: wait until the package's BUILD file is the offered one
        // (or gone, for stable after a test build); a package that does not touch it is accepted after 30 s
        if (!seen) seen = Date.now();
        const now = buildOf(SERVICE_DIR + '/BUILD');
        if (release.build ? now === release.build : (!before || !now || Date.now() - seen > 30000)) { ok = true; break; }
        if (Date.now() - seen > 30000) { ok = true; break; }
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
    if (typeof o.liveTv === 'boolean') next.liveTv = o.liveTv;
    if (typeof o.pickerPrewarm === 'boolean') c.picker = Object.assign({}, c.picker, o.pickerPrewarm ? { prewarm: true } : { prewarm: false, reason: 'switched off in the manager', at: Date.now() });
    if (['overlay', 'ondemand', 'launcher'].indexOf(o.pickerMode) >= 0) c.picker = Object.assign({}, c.picker, { mode: o.pickerMode, prewarm: o.pickerMode === 'overlay' ? true : (c.picker || {}).prewarm, reason: 'chosen in the manager', at: Date.now() });
    c.options = next; writeConf(c); syncPickerMode();
    if (next.debloat !== cur.debloat) {
      if (next.debloat) await sh('ln -sf ' + D + '/15-cleanyourtv-debloat /var/lib/webosbrew/init.d/15-cleanyourtv-debloat; sh ' + D + '/debloat-stop.sh', 60000);
      else await sh('rm -f /var/lib/webosbrew/init.d/15-cleanyourtv-debloat; sh ' + D + '/debloat-undo.sh', 60000);
    }
    inputhook.ensure(inputKeyOn(), keys().input);
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
        if (l.name === 'input') inputhook.ensure(inputKeyOn(), l.code); else if (l.name === 'voice' || l.name === 'guide') inputhook.ensure(inputKeyOn(), keys().input);
      }
      return json(l);
    }
    if (act === 'notify-api' && req.method === 'GET') return json(notifyApi ? notifyApi.info() : { enabled: false });
    if (act === 'test-key') return json({ pickerShownAt: pickerShown ? pickerShown() : 0, now: Date.now() });
    if (act === 'tests') {   // the test builds on offer: one pre-release per branch
      try {
        const list = JSON.parse((await fetch(baseRepo() + '/releases?per_page=40')).toString()).filter(r => r.prerelease && TEST_TAG.test(r.tag_name || '')).slice(0, 20).map(r => {
          let sv = null, fv = null;
          for (const a of r.assets || []) { let m = /^com\.cleanyourtv\.manager_(\d+\.\d+\.\d+)_all\.ipk$/.exec(a.name); if (m) sv = m[1]; m = /^frontend-(\d+\.\d+\.\d+)\.tgz$/.exec(a.name); if (m) fv = m[1]; }
          return { tag: r.tag_name, branch: String(r.name || r.tag_name).replace(/^Test build:\s*/, '').slice(0, 60), build: buildInBody(r.body), published: r.published_at, service: sv, frontend: fv };
        });
        return json({ channel: channel(), builds: list });
      } catch (e) { return json({ channel: channel(), builds: [], error: String(e.message || e) }); }
    }
    if (req.method !== 'POST') return json({ error: 'POST expected' }, 405);
    const b = await body(req);
    if (act === 'check') { await check(); return json(status()); }
    if (act === 'channel') {   // { tag: "test-<branch>" } or { tag: "" } for the stable releases
      const t = String(b.tag || '');
      if (t && !TEST_TAG.test(t)) return json({ error: 'not a test build' }, 400);
      if (busy()) return json({ error: 'an update is running' }, 409);
      try { if (t) fs.writeFileSync(D + '/channel', t + '\n'); else fs.unlinkSync(D + '/channel'); } catch (_) {}
      release = null; releaseAt = 0; await check();
      return json(status());
    }
    if (act === 'notify-api') return json(notifyApi ? notifyApi.set(b) : { enabled: false });
    if (act === 'learn-key') { inputhook.startLearn(['home', 'voice', 'guide'].includes(b.name) ? b.name : 'input'); return json({ returnValue: true }); }
    if (act === 'clear-key') {   // forget a learned code: Input goes back to the default, Home to none
      const name = ['home', 'voice', 'guide'].includes(b.name) ? b.name : 'input', c = readConf(), k = Object.assign({ input: '', home: '', voice: '', guide: '' }, c.keys || {});
      k[name] = ''; if (name === 'input') k.learned = false; c.keys = k; writeConf(c);
      if (name !== 'home') inputhook.ensure(inputKeyOn(), keys().input);
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
