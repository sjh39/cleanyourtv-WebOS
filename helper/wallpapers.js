// Wallpapers: your own photos as the launcher's background, from two sources kept apart on disk:
//   D/wallpapers/upload/<random>.jpg   photos uploaded from a phone (the phone page scales them before sending)
//   D/wallpapers/immich/<asset id>.jpg photos from chosen Immich albums, downloaded by a sync and kept, so showing one never needs Immich
// D/wallpapers/index.json says what each file is (source, size, Immich checksum); only files listed there are ever deleted.
// The settings are the wallpapers section of config.json: {size: '4k'|'hd', immich: {url, key, albums: [ids], hidden: [asset ids]}}.
// The Immich key never leaves the service: status() shows its last four characters only, and it is not logged.
// API (loopback, our apps): GET /api/wallpapers/status, GET /api/wallpapers/list, GET /api/wallpapers/photo/<u|i>/<id>,
// POST /api/wallpapers/set {size}, POST /api/wallpapers/pair, POST /api/wallpapers/sync, POST /api/wallpapers/remove-uploads,
// POST /api/wallpapers/disconnect. The phone page (POST pair) is a short-lived server on the LAN, port 8791, that needs the code shown
// on the TV; its API is under /api/ on that port.
const fs = require('fs'),
  http = require('http'),
  path = require('path'),
  crypto = require('crypto');
const P = require('./paths'),
  web = require('./web'),
  fetch = require('./fetch'),
  nc = require('./netcompat');

const DIR = P.D + '/wallpapers',
  UP = DIR + '/upload',
  IM = DIR + '/immich',
  INDEX = DIR + '/index.json';
const LIMITS = { uploads: 100, immich: 300, bytes: 150 * 1024 * 1024, file: 12 * 1024 * 1024 };
const PAIR_PORT = 8791, // after the Share-log page's range (8768-8790)
  PAIR_MS = 15 * 60 * 1000,
  SYNC_MS = 6 * 3600 * 1000;
const ID = /^[a-f0-9]{16}$/,
  ASSET = /^[0-9a-f-]{36}$/i;

// what a file is, from its first bytes: only JPEG, PNG and WebP are kept
function imageType(b) {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 8 && b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return '';
}
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

function create(ctx) {
  const config = ctx.config;
  const cfg = () => Object.assign({ size: '4k' }, config.get().wallpapers || {});
  const icfg = () => Object.assign({ url: '', key: '', albums: [], hidden: [] }, cfg().immich || {});
  const setCfg = fn =>
    config.update('wallpapers', c => {
      c.wallpapers = Object.assign({ size: '4k' }, c.wallpapers || {});
      fn(c.wallpapers);
    });

  // ---- the index of the files ----
  let index = null;
  function idx() {
    if (index) return index;
    try {
      index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
    } catch (_) {
      index = {};
    }
    index.upload = Array.isArray(index.upload) ? index.upload : [];
    index.immich = index.immich && typeof index.immich === 'object' ? index.immich : {};
    index.sync = index.sync || { state: 'idle', at: 0, error: '', ok: 0 };
    return index;
  }
  function saveIdx() {
    nc.mkdirp(DIR);
    fs.writeFileSync(INDEX + '.tmp', JSON.stringify(idx()));
    fs.renameSync(INDEX + '.tmp', INDEX);
  }
  const immichList = () => {
    const i = idx().immich,
      hid = icfg().hidden;
    return Object.keys(i).filter(id => hid.indexOf(id) < 0);
  };
  const usedBytes = () =>
    idx().upload.reduce((n, u) => n + (u.bytes || 0), 0) + Object.keys(idx().immich).reduce((n, k) => n + (idx().immich[k].bytes || 0), 0);
  // your photos are for root only, as the settings are
  const mkdir = d => {
    nc.mkdirp(d);
    try {
      fs.chmodSync(DIR, 0o700);
    } catch (_) {}
  };
  const unlink = f => {
    try {
      fs.unlinkSync(f);
    } catch (_) {}
  };

  // ---- uploads ----
  function addUpload(buf) {
    const type = imageType(buf);
    if (!type) return 'not a JPEG, PNG or WebP picture';
    if (buf.length > LIMITS.file) return 'the picture is larger than 12 MB';
    if (idx().upload.length >= LIMITS.uploads) return 'there are ' + LIMITS.uploads + ' uploads already: remove some first';
    if (usedBytes() + buf.length > LIMITS.bytes) return 'Wallpapers is full (150 MB): remove some photos first';
    mkdir(UP);
    const id = crypto.randomBytes(8).toString('hex'),
      file = id + '.' + type;
    fs.writeFileSync(path.join(UP, file + '.tmp'), buf, { mode: 0o600 });
    fs.renameSync(path.join(UP, file + '.tmp'), path.join(UP, file));
    idx().upload.push({ id, file, bytes: buf.length, at: Date.now() });
    saveIdx();
    return '';
  }
  function removeUpload(id) {
    const u = idx().upload.filter(x => x.id === id)[0];
    if (!u) return false;
    unlink(path.join(UP, u.file));
    idx().upload = idx().upload.filter(x => x.id !== id);
    saveIdx();
    return true;
  }
  function removeUploads() {
    for (const u of idx().upload) unlink(path.join(UP, u.file));
    idx().upload = [];
    saveIdx();
  }

  // ---- Immich (https://immich.app/docs/api): the key goes in the x-api-key header ----
  const base = u =>
    String(u || '')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api$/, '');
  function immich(pathname, ic, opts) {
    const c = ic || icfg();
    return fetch
      .read(
        base(c.url) + '/api' + pathname,
        Object.assign(
          { headers: { 'x-api-key': c.key, Accept: 'application/json' }, idleMs: 20000, maxBytes: 16 << 20, anyStatus: true },
          opts || {}
        )
      )
      .then(r => {
        if (r.status === 401 || r.status === 403) throw new Error('Immich refused the API key (needs album.read and asset.read/view)');
        if (r.status !== 200) throw new Error('Immich answered ' + r.status);
        return JSON.parse(r.body.toString('utf8'));
      });
  }
  // every album the key can read: own and shared with you
  async function albums(ic) {
    const own = await immich('/albums', ic),
      shared = await immich('/albums?shared=true', ic).catch(() => []);
    const seen = {};
    return own
      .concat(shared)
      .filter(a => a && a.id && !seen[a.id] && (seen[a.id] = 1))
      .map(a => ({ id: a.id, name: String(a.albumName || 'Album').slice(0, 80), count: a.assetCount || 0 }));
  }
  async function connect(url, key) {
    const c = { url: base(url), key: key || icfg().key };
    if (!/^https?:\/\/[^/]+/i.test(c.url)) return { error: 'the address must start with http:// or https://' };
    if (!c.key) return { error: 'enter the API key' };
    try {
      const list = await albums(c);
      setCfg(w => {
        const old = Object.assign({ albums: [], hidden: [] }, w.immich || {});
        w.immich = { url: c.url, key: c.key, albums: old.url === c.url ? old.albums : [], hidden: old.url === c.url ? old.hidden : [] };
      });
      return { ok: true, albums: list };
    } catch (e) {
      return { error: 'could not reach Immich: ' + String(e.message || e) };
    }
  }

  // ---- the sync: new or changed photos are downloaded, photos no longer wanted are deleted (only files the index lists) ----
  let syncing = null;
  function sync() {
    if (!syncing)
      syncing = doSync().then(
        () => {
          syncing = null;
        },
        () => {
          syncing = null;
        }
      );
    return syncing;
  }
  async function download(id, mime, size) {
    const ic = icfg(),
      tmp = path.join(IM, id + '.tmp'),
      hdrs = { 'x-api-key': ic.key };
    const tries =
      size === '4k'
        ? ['/assets/' + id + '/thumbnail?size=fullsize'].concat(
            /^image\/(jpeg|png|webp)$/.test(mime || '') ? ['/assets/' + id + '/original'] : [],
            ['/assets/' + id + '/thumbnail?size=preview']
          )
        : ['/assets/' + id + '/thumbnail?size=preview'];
    let last = null;
    for (const t of tries) {
      try {
        const r = await fetch.read(base(ic.url) + '/api' + t, { headers: hdrs, idleMs: 30000, maxBytes: LIMITS.file, anyStatus: true });
        if (r.status !== 200) throw new Error('Immich answered ' + r.status);
        const type = imageType(r.body);
        if (!type) throw new Error('not a picture the TV can show');
        fs.writeFileSync(tmp, r.body, { mode: 0o600 });
        const file = id + '.' + type;
        fs.renameSync(tmp, path.join(IM, file));
        return { file, bytes: r.body.length };
      } catch (e) {
        last = e;
      }
    }
    unlink(tmp);
    throw last || new Error('download failed');
  }
  async function doSync() {
    const ic = icfg(),
      st = idx().sync;
    if (!ic.url || !ic.key) return;
    st.state = 'syncing';
    st.error = '';
    st.done = 0;
    try {
      mkdir(IM);
      // the albums' photos, newest first, without videos or trashed ones (hidden ones stay on the TV, so they can be shown again)
      const want = [],
        seen = {};
      for (const a of ic.albums) {
        const al = await immich('/albums/' + encodeURIComponent(a) + '?withoutAssets=false');
        for (const x of al.assets || [])
          if (x && ASSET.test(x.id) && x.type === 'IMAGE' && !x.isTrashed && !seen[x.id]) {
            seen[x.id] = 1;
            want.push({ id: x.id, sum: x.checksum || '', mime: x.originalMimeType || '', at: Date.parse(x.fileCreatedAt || '') || 0 });
          }
      }
      want.sort((a, b) => b.at - a.at);
      const keep = want.slice(0, LIMITS.immich),
        keepIds = {};
      keep.forEach(w => (keepIds[w.id] = 1));
      // first the ones no longer wanted, so their space is free for the new ones
      const cur = idx().immich;
      for (const id of Object.keys(cur))
        if (!keepIds[id]) {
          unlink(path.join(IM, cur[id].file));
          delete cur[id];
        }
      saveIdx();
      const size = cfg().size === 'hd' ? 'hd' : '4k';
      let full = false,
        failed = 0;
      for (const w of keep) {
        const have = cur[w.id];
        if (have && have.sum === w.sum && have.size === size && fs.existsSync(path.join(IM, have.file))) continue;
        if (usedBytes() > LIMITS.bytes - 2 * 1024 * 1024) {
          full = true;
          break;
        }
        try {
          const d = await download(w.id, w.mime, size);
          if (have && have.file !== d.file) unlink(path.join(IM, have.file));
          cur[w.id] = { file: d.file, bytes: d.bytes, sum: w.sum, size };
          st.done++;
          if (st.done % 10 === 0) saveIdx();
        } catch (e) {
          failed++;
          if (failed >= 5 && !st.done) throw e; // Immich is down or the key lost a permission: stop, keep what is there
        }
      }
      st.ok = Date.now();
      st.error = full
        ? 'Wallpapers is full (150 MB): not every photo was downloaded'
        : failed
          ? failed + ' photos could not be downloaded'
          : '';
    } catch (e) {
      st.error = String(e.message || e);
    }
    st.state = 'idle';
    st.at = Date.now();
    saveIdx();
  }
  function disconnect() {
    for (const id of Object.keys(idx().immich)) unlink(path.join(IM, idx().immich[id].file));
    idx().immich = {};
    idx().sync = { state: 'idle', at: 0, error: '', ok: 0 };
    saveIdx();
    setCfg(w => {
      delete w.immich;
    });
  }

  // ---- what the TV shows ----
  function list() {
    return idx()
      .upload.map(u => 'u/' + u.id)
      .concat(immichList().map(id => 'i/' + id));
  }
  // a number that changes whenever the set of photos changes: the launcher reads the list again then
  const stamp = () => {
    const l = list();
    return l.length + ':' + crypto.createHash('md5').update(l.join(',')).digest('hex').slice(0, 8);
  };
  function status() {
    const ic = icfg(),
      s = idx().sync;
    return {
      size: cfg().size === 'hd' ? 'hd' : '4k',
      uploads: idx().upload.length,
      immich: {
        configured: !!(ic.url && ic.key),
        url: ic.url,
        keyHint: ic.key ? '…' + ic.key.slice(-4) : '',
        albums: ic.albums.length,
        photos: immichList().length,
        hidden: ic.hidden.length,
        state: s.state,
        lastSync: s.ok || 0,
        tried: s.at || 0,
        error: s.error || '',
        done: s.done || 0,
      },
      total: list().length,
      bytes: usedBytes(),
      limits: LIMITS,
      pair: pair ? { url: pair.url, code: pair.code, until: pair.until } : null,
    };
  }
  function photoFile(src, id) {
    if (src === 'u' && ID.test(id)) {
      const u = idx().upload.filter(x => x.id === id)[0];
      return u ? path.join(UP, u.file) : '';
    }
    if (src === 'i' && ASSET.test(id) && idx().immich[id]) return path.join(IM, idx().immich[id].file);
    return '';
  }
  function sendPhoto(res, src, id, cache) {
    const f = photoFile(src, id);
    if (!f || !fs.existsSync(f)) return web.notFound(res);
    res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'image/jpeg', 'cache-control': cache || 'max-age=86400' });
    fs.createReadStream(f).pipe(res);
  }

  // ---- the phone page: LAN, short-lived, the code shown on the TV in every request (header x-code) ----
  let pair = null;
  function startPair() {
    stopPair();
    const code = String(nc.randomInt(100000, 1000000));
    let bad = 0;
    const srv = http.createServer((req, res) => phone(req, res, code, () => ++bad));
    pair = { code, srv, url: 'http://' + web.lanIp() + ':' + PAIR_PORT, until: Date.now() + PAIR_MS, timer: setTimeout(stopPair, PAIR_MS) };
    const out = { url: pair.url, code, qr: pair.url + '/#' + code, seconds: PAIR_MS / 1000 };
    return new Promise(resolve => {
      srv.on('error', e => {
        stopPair();
        resolve({ error: 'the phone page could not start: ' + e.message });
      });
      srv.listen(PAIR_PORT, '0.0.0.0', () => resolve(out));
    });
  }
  // while the page is used it stays open (up to an hour after it was opened)
  function touch() {
    if (!pair) return;
    clearTimeout(pair.timer);
    pair.until = Math.min(Date.now() + PAIR_MS, (pair.opened || (pair.opened = Date.now())) + 3600 * 1000);
    pair.timer = setTimeout(stopPair, pair.until - Date.now());
  }
  function stopPair() {
    if (!pair) return;
    clearTimeout(pair.timer);
    try {
      pair.srv.close();
    } catch (_) {}
    pair = null;
  }
  function rawBody(req, max) {
    return new Promise((resolve, reject) => {
      const b = [];
      let n = 0;
      req.on('data', c => {
        n += c.length;
        if (n > max) {
          reject(new Error('the picture is larger than 12 MB'));
          req.destroy();
        } else b.push(c);
      });
      req.on('end', () => resolve(Buffer.concat(b)));
      req.on('error', reject);
    });
  }
  async function phone(req, res, code, wrong) {
    const u = req.url.split('?')[0],
      json = (o, c) => {
        res.writeHead(c || 200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(o));
      };
    if (req.method === 'GET' && u === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(PHONE_PAGE);
    }
    if (u.indexOf('/api/') !== 0) return web.notFound(res);
    if (req.headers['x-code'] !== code) {
      if (wrong() >= 8) stopPair();
      return json({ error: 'wrong code' }, 403);
    }
    touch();
    try {
      if (u === '/api/state') return json(Object.assign(status(), { pair: null, uploadsList: idx().upload.map(x => x.id) }));
      let m = /^\/api\/photo\/([ui])\/([0-9a-f-]{16,36})$/i.exec(u);
      if (m && req.method === 'GET') return sendPhoto(res, m[1], m[2], 'private, max-age=3600');
      if (req.method !== 'POST') return json({ error: 'not found' }, 404);
      if (u === '/api/upload') {
        const err = addUpload(await rawBody(req, LIMITS.file));
        return json(err ? { error: err } : { ok: true, uploads: idx().upload.length }, err ? 400 : 200);
      }
      const b = await web.body(req, 16384);
      if (u === '/api/upload/delete') return json({ ok: removeUpload(String(b.id || '')) });
      if (u === '/api/immich/connect') return json(await connect(String(b.url || ''), String(b.key || '')));
      if (u === '/api/immich/albums') {
        if (Array.isArray(b.ids)) {
          const ids = b.ids.filter(x => typeof x === 'string' && ASSET.test(x)).slice(0, 50);
          setCfg(w => {
            w.immich = Object.assign({}, w.immich, { albums: ids });
          });
          sync();
          return json({ ok: true });
        }
        const sel = icfg().albums;
        return json({ albums: (await albums()).map(a => Object.assign(a, { on: sel.indexOf(a.id) >= 0 })) });
      }
      if (u === '/api/immich/sync') {
        sync();
        return json({ ok: true });
      }
      if (u === '/api/immich/photos') {
        const hid = icfg().hidden;
        return json({ photos: Object.keys(idx().immich).map(id => ({ id, hidden: hid.indexOf(id) >= 0 })) });
      }
      if (u === '/api/immich/hide') {
        const id = String(b.id || '');
        if (!ASSET.test(id)) return json({ error: 'bad id' }, 400);
        setCfg(w => {
          const ic = Object.assign({ hidden: [] }, w.immich);
          ic.hidden = ic.hidden.filter(x => x !== id);
          if (b.hidden) ic.hidden.push(id);
          w.immich = ic;
        });
        return json({ ok: true });
      }
      if (u === '/api/immich/disconnect') {
        disconnect();
        return json({ ok: true });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 400);
    }
  }

  // ---- the service's API ----
  async function handle(req, res, u, body) {
    const json = (o, c) => web.json(res, o, c);
    const m = /^\/api\/wallpapers\/photo\/([ui])\/([0-9a-f-]{16,36})$/i.exec(u);
    if (m) return sendPhoto(res, m[1], m[2]);
    if (u === '/api/wallpapers/status') return json(status());
    if (u === '/api/wallpapers/list') return json({ photos: list(), stamp: stamp() });
    if (req.method !== 'POST') return web.notFound(res);
    const b = await body(req);
    if (u === '/api/wallpapers/set') {
      if (b.size === '4k' || b.size === 'hd')
        setCfg(w => {
          w.size = b.size;
        });
      return json(status());
    }
    if (u === '/api/wallpapers/pair') return json(b.stop ? (stopPair(), {}) : await startPair());
    if (u === '/api/wallpapers/sync') {
      sync();
      return json(status());
    }
    if (u === '/api/wallpapers/remove-uploads') {
      removeUploads();
      return json(status());
    }
    if (u === '/api/wallpapers/disconnect') {
      disconnect();
      return json(status());
    }
    return web.notFound(res);
  }

  // the automatic sync: every six hours; shortly after a start only when the last one is more than a day old
  function start() {
    if (idx().sync.state === 'syncing') idx().sync.state = 'idle'; // a sync the last run did not finish
    const t = setInterval(() => sync(), SYNC_MS);
    if (t.unref) t.unref();
    if (Date.now() - (idx().sync.ok || 0) > 24 * 3600 * 1000) {
      const t2 = setTimeout(() => sync(), 15 * 60 * 1000);
      if (t2.unref) t2.unref();
    }
  }

  return { name: 'wallpapers', prefix: '/api/wallpapers/', handle, start, status, stamp, sync, addUpload, list, phone };
}

// the phone page: two actions, Upload photos and Configure Immich. Plain script for iOS Safari and Android Chrome; photos are scaled in
// the browser (to 3840 or 1920 pixels on the long side) before they are sent, which also turns an iPhone's HEIC into JPEG.
const PHONE_PAGE = `<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Wallpapers</title>
<style>*{box-sizing:border-box}body{font:17px -apple-system,system-ui,sans-serif;background:#0d0e12;color:#eee;margin:0;padding:20px 16px 60px;max-width:640px;margin:0 auto}
h1{font-size:26px;margin:4px 0 4px}h2{font-size:20px;margin:28px 0 10px}p{color:#aaa;margin:6px 0}.m{padding:12px 14px;border-radius:12px;background:#1d2a1f;margin:12px 0}.m.e{background:#3a1717}
button,input,label.b{font:inherit;display:block;width:100%;padding:14px;border-radius:12px;border:1px solid #333;background:#1a1b21;color:#eee;margin:8px 0;text-align:center}
button.p,label.b{background:#f5f6f8;color:#111;font-weight:600;border:0}input{text-align:left}.row{display:flex;gap:10px}.row>*{flex:1}
.tabs{display:flex;gap:8px;margin:16px 0}.tabs button{margin:0}.tabs .on{background:#f5f6f8;color:#111}.hide{display:none}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ph{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#222}
.ph img{width:100%;height:100%;object-fit:cover;display:block}.ph button{position:absolute;right:4px;top:4px;width:32px;height:32px;padding:0;margin:0;border-radius:16px;background:rgba(0,0,0,.7);border:0;color:#fff}
.ph.off img{opacity:.3}.al{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#1a1b21;margin:6px 0}.al input{width:22px;height:22px;margin:0}
.bar{height:8px;border-radius:4px;background:#333;overflow:hidden;margin:8px 0}.bar i{display:block;height:100%;width:0;background:#f5f6f8}small{color:#888}</style>
<h1>Wallpapers</h1><p id=sum>Connecting to the TV…</p>
<div id=login class=hide><p>Enter the code shown on the TV.</p><input id=code inputmode=numeric autocomplete=one-time-code><button class=p id=go>Continue</button></div>
<div id=main class=hide>
<div class=tabs><button id=tu class=on>Upload photos</button><button id=ti>Configure Immich</button></div>
<div id=msg></div>
<section id=up><label class=b for=f>Choose photos</label><input id=f type=file accept="image/*" multiple class=hide>
<div id=prog class=hide><div class=bar><i id=pb></i></div><p id=pt></p></div>
<h2>Uploaded <small id=un></small></h2><div class=grid id=ug></div></section>
<section id=im class=hide>
<p>Use an API key from Immich (Account settings > API keys) with album.read and asset.read/view permissions.</p>
<input id=iu type=url placeholder="https://immich.example.com" autocomplete=off><input id=ik type=password placeholder="API key" autocomplete=off>
<button class=p id=ic>Test connection and save</button>
<div id=albox class=hide><h2>Albums</h2><div id=al></div><button class=p id=as>Save albums and sync</button></div>
<div id=ist></div>
<div id=iphb class=hide><h2>Synced photos <small>tap to hide or show one</small></h2><div class=grid id=ipg></div></div>
<button id=isy>Sync now</button><button id=idc>Disconnect Immich</button></section></div>
<script>
var code='',S={},MAX=3840,$=function(i){return document.getElementById(i)};
function api(p,b,ct){return new Promise(function(ok,no){var x=new XMLHttpRequest();x.open(b===undefined?'GET':'POST','/api/'+p);x.setRequestHeader('x-code',code);
 if(ct)x.setRequestHeader('content-type',ct);x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}if(x.status===403){showLogin('Wrong code.');no(j)}else ok(j)};x.onerror=function(){no({error:'The TV did not answer. Is the phone on the same Wi-Fi?'})};
 x.send(b===undefined?null:(ct?b:JSON.stringify(b)))})}
function msg(t,e){$('msg').innerHTML=t?'<p class="m'+(e?' e':'')+'"></p>':'';if(t)$('msg').firstChild.textContent=t}
function showLogin(t){$('login').className='';$('main').className='hide';$('sum').textContent=t||''}
function ago(t){if(!t)return 'never';var m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'}
function state(){return api('state').then(function(s){S=s;MAX=s.size==='hd'?1920:3840;$('login').className='hide';$('main').className='';
 $('sum').textContent='Local uploads: '+s.uploads+' · Immich: '+s.immich.photos+' · Total: '+s.total+' photos ('+Math.round(s.bytes/1048576)+' of 150 MB)';
 $('un').textContent=s.uploads+' of '+s.limits.uploads;var g='';(s.uploadsList||[]).forEach(function(id){g+='<div class=ph><img loading=lazy src="" data-s="u/'+id+'"><button data-d="'+id+'">×</button></div>'});$('ug').innerHTML=g;thumbs($('ug'));
 var i=s.immich;$('iu').value=$('iu').value||i.url;$('ik').placeholder=i.keyHint?'API key (saved: '+i.keyHint+'; leave empty to keep)':'API key';
 $('ist').innerHTML='';var p=document.createElement('p');p.textContent=i.configured?(i.state==='syncing'?'Syncing… '+i.done+' new':'Last sync: '+ago(i.lastSync)+' · '+i.photos+' photos from '+i.albums+' albums')+(i.error?' · '+i.error:''):'Not connected.';$('ist').appendChild(p);
 $('isy').className=$('idc').className=i.configured?'':'hide';if(i.state==='syncing')setTimeout(state,3000)})}
function thumbs(el){[].forEach.call(el.querySelectorAll('img[data-s]'),function(im){var x=new XMLHttpRequest();x.open('GET','/api/photo/'+im.getAttribute('data-s'));x.setRequestHeader('x-code',code);x.responseType='blob';
 x.onload=function(){if(x.status===200)im.src=URL.createObjectURL(x.response)};x.send()})}
/* scale in the browser: the long side to MAX pixels, JPEG; a file the browser cannot draw is sent as it is when it is small enough */
function scaled(file){return new Promise(function(ok){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,MAX/Math.max(w,h));
 var c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){ok(b||file)},'image/jpeg',0.9)};
 im.onerror=function(){URL.revokeObjectURL(u);ok(file)};im.src=u})}
function upload(files){var list=[].slice.call(files),n=0,okN=0,errs=[];$('prog').className='';msg('');
 (function next(){if(n>=list.length){$('prog').className='hide';msg(okN+' of '+list.length+' photos uploaded.'+(errs.length?' '+errs[0]:''),!!errs.length&&!okN);state();return}
  var f=list[n];$('pt').textContent='Photo '+(n+1)+' of '+list.length+' · preparing';$('pb').style.width=Math.round(n/list.length*100)+'%';
  scaled(f).then(function(b){var x=new XMLHttpRequest();x.open('POST','/api/upload');x.setRequestHeader('x-code',code);x.setRequestHeader('content-type',b.type||'application/octet-stream');
   x.upload.onprogress=function(e){if(e.lengthComputable)$('pb').style.width=Math.round((n+e.loaded/e.total)/list.length*100)+'%';$('pt').textContent='Photo '+(n+1)+' of '+list.length+' · sending'};
   x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}if(x.status===200)okN++;else errs.push((f.name||'A photo')+': '+(j.error||'refused'));n++;next()};
   x.onerror=function(){errs.push('The TV did not answer.');n++;next()};x.send(b)})})()}
$('f').onchange=function(){if(this.files.length)upload(this.files);this.value=''};
$('ug').onclick=function(e){var d=e.target.getAttribute('data-d');if(d)api('upload/delete',{id:d}).then(state)};
$('tu').onclick=function(){$('tu').className='on';$('ti').className='';$('up').className='';$('im').className='hide'};
$('ti').onclick=function(){$('ti').className='on';$('tu').className='';$('im').className='';$('up').className='hide';if(S.immich&&S.immich.configured){loadAlbums();loadPhotos()}};
function loadAlbums(){api('immich/albums',{}).then(function(r){if(r.error)return msg(r.error,1);var h='';(r.albums||[]).forEach(function(a){h+='<label class=al><input type=checkbox value="'+a.id+'"'+(a.on?' checked':'')+'><span></span><small>'+a.count+'</small></label>'});
 $('al').innerHTML=h;var sp=$('al').querySelectorAll('span');(r.albums||[]).forEach(function(a,i){sp[i].textContent=a.name});$('albox').className=''},function(e){msg(e.error||'Could not read the albums',1)})}
function loadPhotos(){api('immich/photos',{}).then(function(r){var ps=r.photos||[];$('iphb').className=ps.length?'':'hide';var g='';ps.forEach(function(p){g+='<div class="ph'+(p.hidden?' off':'')+'" data-h="'+p.id+'"><img loading=lazy src="" data-s="i/'+p.id+'"></div>'});$('ipg').innerHTML=g;thumbs($('ipg'))})}
$('ipg').onclick=function(e){var t=e.target.closest('[data-h]');if(!t)return;var off=!/off/.test(t.className);api('immich/hide',{id:t.getAttribute('data-h'),hidden:off}).then(function(){t.className='ph'+(off?' off':'');state()})};
$('ic').onclick=function(){msg('Connecting…');api('immich/connect',{url:$('iu').value,key:$('ik').value}).then(function(r){if(r.error)return msg(r.error,1);$('ik').value='';msg('Connected to Immich.');state().then(loadAlbums)})};
$('as').onclick=function(){var ids=[].map.call($('al').querySelectorAll('input:checked'),function(i){return i.value});api('immich/albums',{ids:ids}).then(function(){msg('Albums saved. Syncing…');setTimeout(state,1500);setTimeout(loadPhotos,8000)})};
$('isy').onclick=function(){api('immich/sync',{}).then(function(){msg('Syncing…');setTimeout(state,1500)})};
$('idc').onclick=function(){if(confirm('Disconnect Immich? Its photos are removed from the TV.'))api('immich/disconnect',{}).then(function(){$('albox').className='hide';$('iphb').className='hide';msg('Immich disconnected.');state()})};
$('go').onclick=function(){code=$('code').value.trim();state().catch(function(){})};
code=(location.hash||'').slice(1);if(/^\\d{6}$/.test(code))state().catch(function(){});else showLogin();
</script></html>`;

module.exports = { create, imageType, LIMITS, PAIR_PORT };
