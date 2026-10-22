// Live TV backend for the launcher: reads an M3U playlist (and its XMLTV guide), serves them to the Live TV app,
// and runs a short-lived pairing page on the LAN so the playlist address can be entered from a phone or computer.
const http = require('http'), https = require('https'), fs = require('fs'), os = require('os'), zlib = require('zlib'), crypto = require('crypto');
const DIR = process.env.CYTV_LIVE_DIR || '/media/developer/cleanyourtv/live';
const SETTINGS = DIR + '/settings.json', PLAYLIST = DIR + '/playlist.json', EPG = DIR + '/epg.json';
const PAIR_PORT = 8766, PAIR_MS = 10 * 60 * 1000, REFRESH_MS = 12 * 3600 * 1000;
try { fs.mkdirSync(DIR, { recursive: true }); } catch (_) {}

const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const writeJson = (f, o) => { fs.writeFileSync(f + '.tmp', JSON.stringify(o), { mode: 0o600 }); fs.renameSync(f + '.tmp', f); };   // the playlist address holds an access key: owner only
let settings = readJson(SETTINGS, {}), playlist = readJson(PLAYLIST, null), epg = readJson(EPG, null);
let status = { state: 'idle', error: '' };

// ---- fetching (follows redirects, handles gzip) ----
function get(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('too many redirects'));
    let u; try { u = new URL(url); } catch (_) { return reject(new Error('not a valid address')); }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return reject(new Error('address must start with http:// or https://'));
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(u, { headers: { 'user-agent': 'cleanyourtv-live', 'accept-encoding': 'gzip' }, timeout: 20000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(get(new URL(res.headers.location, u).toString(), depth + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('server answered ' + res.statusCode)); }
      resolve(res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res);
    });
    req.on('timeout', () => req.destroy(new Error('timed out')));
    req.on('error', reject);
  });
}
const readAll = s => new Promise((res, rej) => { const b = []; s.on('data', c => b.push(c)); s.on('end', () => res(Buffer.concat(b).toString('utf8'))); s.on('error', rej); });

// ---- M3U ----
function parseM3U(text) {
  const lines = text.split(/\r?\n/), out = [], groups = [];
  let epgUrl = '', cur = null;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith('#EXTM3U')) { const m = l.match(/(?:x-tvg-url|url-tvg)="([^"]*)"/i); if (m) epgUrl = m[1].split(',')[0].trim(); continue; }
    if (l.startsWith('#EXTINF')) {
      const attrs = {}; l.replace(/([\w-]+)="([^"]*)"/g, (_, k, v) => { attrs[k.toLowerCase()] = v; return ''; });
      cur = { id: attrs['tvg-id'] || '', name: (attrs['tvg-name'] || l.slice(l.lastIndexOf(',') + 1)).trim(), group: (attrs['group-title'] || '').trim(), logo: attrs['tvg-logo'] || '' };
      const nm = l.slice(l.lastIndexOf(',') + 1).trim(); if (nm) cur.name = nm;
      continue;
    }
    if (l[0] === '#') continue;
    if (cur) {
      if (!/^#+/.test(cur.name)) {   // "#### NL ALGEMEEN ####" lines are separators, not channels
        cur.url = l; cur.num = out.length + 1; out.push(cur);
        if (cur.group && !groups.includes(cur.group)) groups.push(cur.group);
      }
      cur = null;
    }
  }
  return { epgUrl, groups, channels: out, fetchedAt: Date.now() };
}

// ---- XMLTV (streamed: the guide can be tens of MB) ----
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'");
function xmltvTime(s) {
  const m = s.match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\s*([+-]\d{4})?/); if (!m) return 0;
  let t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  if (m[7]) { const sign = m[7][0] === '-' ? -1 : 1; t -= sign * (+m[7].slice(1, 3) * 60 + +m[7].slice(3, 5)) * 60000; }
  return Math.floor(t / 1000);
}
async function loadEpg(url, wantedIds) {
  const stream = await get(url), want = new Set(wantedIds), byId = {};
  const now = Math.floor(Date.now() / 1000), from = now - 3600, to = now + 36 * 3600;
  let buf = '', cur = null, count = 0;
  const handle = line => {
    let m;
    if ((m = line.match(/<programme\b[^>]*\bchannel="([^"]*)"[^>]*\bstart="([^"]*)"[^>]*\bstop="([^"]*)"/))) cur = want.has(m[1]) ? { id: m[1], s: xmltvTime(m[2]), e: xmltvTime(m[3]), t: '', d: '' } : null;
    else if (cur && !cur.t && (m = line.match(/<title[^>]*>([^<]*)<\/title>/))) cur.t = decode(m[1]);
    else if (cur && !cur.d && (m = line.match(/<desc[^>]*>([^<]*)<\/desc>/))) cur.d = decode(m[1]).slice(0, 220);
    if (cur && line.includes('</programme>')) {
      if (cur.e > from && cur.s < to && !/^no data$/i.test(cur.t.trim())) { (byId[cur.id] = byId[cur.id] || []).push(cur.d ? [cur.s, cur.e, cur.t, cur.d] : [cur.s, cur.e, cur.t]); count++; }
      cur = null;
    }
  };
  await new Promise((resolve, reject) => {
    let n = 0;
    stream.on('data', chunk => {
      buf += chunk; let i;
      while ((i = buf.indexOf('\n')) >= 0) { handle(buf.slice(0, i)); buf = buf.slice(i + 1); }
      if (++n % 40 === 0) { stream.pause(); setImmediate(() => stream.resume()); }   // leave CPU for the UI
    });
    stream.on('end', resolve); stream.on('error', reject);
  });
  for (const id in byId) byId[id].sort((a, b) => a[0] - b[0]);
  return { v: 3, fetchedAt: Date.now(), count, byId };
}

let refreshing = false;
async function refresh(force) {
  if (refreshing || !settings.playlistUrl) return;
  refreshing = true; status = { state: 'loading playlist', error: '' };
  try {
    if (force || !playlist || Date.now() - playlist.fetchedAt > REFRESH_MS) {
      playlist = parseM3U(await readAll(await get(settings.playlistUrl)));
      if (!playlist.channels.length) throw new Error('no channels found in that playlist');
      writeJson(PLAYLIST, playlist);
    }
    status = { state: 'idle', error: '' };
    const epgUrl = settings.epgUrl || playlist.epgUrl;
    if (epgUrl && (force || !epg || epg.v !== 3 || Date.now() - epg.fetchedAt > REFRESH_MS)) {
      status = { state: 'loading guide', error: '' };
      try { epg = await loadEpg(epgUrl, playlist.channels.map(c => c.id).filter(Boolean)); writeJson(EPG, epg); }
      catch (e) { status = { state: 'idle', error: 'guide: ' + e.message }; }
    }
    if (status.state !== 'idle') status = { state: 'idle', error: status.error };
  } catch (e) { status = { state: 'idle', error: e.message }; }
  refreshing = false;
}

// ---- pairing page (LAN, short-lived, needs the code shown on the TV) ----
let pair = null;
function lanIp() {
  for (const list of Object.values(os.networkInterfaces())) for (const i of list) if (i.family === 'IPv4' && !i.internal) return i.address;
  return '';
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const page = (msg, ok) => `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Live TV setup</title>
<style>body{font:18px system-ui,sans-serif;background:#111;color:#eee;max-width:560px;margin:40px auto;padding:0 18px}input,button{font:inherit;width:100%;box-sizing:border-box;padding:12px;margin:6px 0 14px;border-radius:10px;border:1px solid #444;background:#1b1b1b;color:#eee}button{background:#f5f6f8;color:#111;font-weight:600;border:0}.m{padding:12px;border-radius:10px;background:${ok ? '#14361f' : '#3a1717'}}</style>
<h2>Live TV setup</h2>${msg ? `<p class=m>${esc(msg)}</p>` : ''}${ok ? '' : `<form method=post action=/set>
<label>Code shown on the TV</label><input name=code inputmode=numeric autocomplete=off required>
<label>Playlist address (M3U)</label><input name=playlist type=url placeholder="http://..." required>
<label>Guide address (XMLTV, optional)</label><input name=epg type=url placeholder="leave empty to use the playlist's">
<button>Save</button></form>`}`;
function startPairing() {
  stopPairing();
  const code = String(crypto.randomInt(100000, 1000000)); let bad = 0;
  const srv = http.createServer((req, res) => {
    const send = (c, html) => { res.writeHead(c, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); };
    if (req.method === 'GET') return send(200, page('', false));
    if (req.method === 'POST' && req.url === '/set') {
      let b = ''; req.on('data', c => { b += c; if (b.length > 8192) req.destroy(); });
      req.on('end', () => {
        const f = new URLSearchParams(b);
        if (f.get('code') !== code) { if (++bad >= 5) stopPairing(); return send(403, page('Wrong code.', false)); }
        const url = (f.get('playlist') || '').trim(), epgUrl = (f.get('epg') || '').trim();
        if (!/^https?:\/\//i.test(url)) return send(400, page('The playlist address must start with http:// or https://', false));
        settings = { playlistUrl: url, epgUrl: /^https?:\/\//i.test(epgUrl) ? epgUrl : '' }; writeJson(SETTINGS, settings);
        playlist = null; epg = null; refresh(true);
        send(200, page('Saved. The TV is loading your channels now; you can close this page.', true));
        setTimeout(stopPairing, 2000);
      });
      return;
    }
    send(404, page('Not found', false));
  });
  srv.on('error', () => { pair = null; });
  srv.listen(PAIR_PORT, '0.0.0.0');
  pair = { code, srv, url: 'http://' + lanIp() + ':' + PAIR_PORT, until: Date.now() + PAIR_MS, timer: setTimeout(stopPairing, PAIR_MS) };
  return { url: pair.url, code, seconds: PAIR_MS / 1000 };
}
function stopPairing() { if (pair) { clearTimeout(pair.timer); try { pair.srv.close(); } catch (_) {} pair = null; } }

// ---- HTTP API (mounted under /api/live by the helper) ----
async function handle(req, res, u, body) {
  const json = (o, c) => { res.writeHead(c || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
  const q = new URL(req.url, 'http://x').searchParams;
  if (u === '/api/live/status') return json({ configured: !!settings.playlistUrl, channels: playlist ? playlist.channels.length : 0, epg: epg ? epg.count : 0,
    state: status.state, error: status.error, pairing: pair ? { url: pair.url, code: pair.code } : null });
  if (u === '/api/live/channels') {
    if (settings.playlistUrl && !playlist) refresh(false);
    return json(playlist ? { groups: playlist.groups, channels: playlist.channels.map(c => [c.num, c.id, c.name, c.group, c.logo, c.url]) } : { groups: [], channels: [] });
  }
  if (u === '/api/live/epg') {
    const out = {}, now = Math.floor(Date.now() / 1000);
    for (const id of (q.get('ids') || '').split(',').filter(Boolean).slice(0, 60)) {
      const list = epg && epg.byId[id]; if (!list) continue;
      const i = list.findIndex(p => p[1] > now);
      if (i < 0) continue;
      if (q.get('full')) out[id] = { list: list.slice(i, i + 8) };
      else out[id] = { now: list[i][0] <= now ? list[i] : null, next: list[list[i][0] <= now ? i + 1 : i] || null };
    }
    return json(out);
  }
  if (u === '/api/live/pair' && req.method === 'POST') return json(startPairing());
  if (u === '/api/live/refresh' && req.method === 'POST') { refresh(true); return json({ returnValue: true }); }
  if (u === '/api/live/settings' && req.method === 'POST') {
    const b = await body(req);
    if (typeof b.playlistUrl !== 'string' || !/^https?:\/\//i.test(b.playlistUrl)) return json({ error: 'bad playlist address' }, 400);
    settings = { playlistUrl: b.playlistUrl, epgUrl: /^https?:\/\//i.test(b.epgUrl || '') ? b.epgUrl : '' }; writeJson(SETTINGS, settings);
    playlist = null; epg = null; refresh(true);
    return json({ returnValue: true });
  }
  if (u === '/api/live/reset' && req.method === 'POST') { settings = {}; playlist = null; epg = null; for (const f of [SETTINGS, PLAYLIST, EPG]) try { fs.unlinkSync(f); } catch (_) {} return json({ returnValue: true }); }
  res.writeHead(404); res.end();
}

// refresh once shortly after start (low priority), then twice a day
if (settings.playlistUrl) setTimeout(() => refresh(false), 20000);
setInterval(() => refresh(false), 6 * 3600 * 1000).unref();

module.exports = { handle };
