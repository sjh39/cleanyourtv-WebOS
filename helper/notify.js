// Notifications with pictures: the TV's own toasts are text-only, so this shows a card in a small transparent
// overlay window (the notify app) on top of whatever is running. POST /api/notify {title, text, image, seconds, position}
const http = require('http'),
  https = require('https'),
  cp = require('child_process');
const nc = require('./netcompat'),
  { URL, URLSearchParams } = nc;
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });
const images = new Map(); // id -> {type, buf}; kept in memory, newest few only
let seq = 0;

function fetchImage(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 4) return reject(new Error('too many redirects'));
    let u;
    try {
      u = new URL(url);
    } catch (_) {
      return reject(new Error('bad image address'));
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return reject(new Error('image address must be http(s)'));
    if (/^(localhost|127\.|0\.0\.0\.0|\[?::1\]?$)/i.test(u.hostname))
      return reject(new Error('image address must not point at the TV itself')); // not a way to read the service's own pages
    const lib = u.protocol === 'https:' ? https : http;
    const req = nc.get(lib, u, { timeout: 8000, rejectUnauthorized: false }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchImage(new URL(res.headers.location, u).toString(), depth + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('image server answered ' + res.statusCode));
      }
      const b = [];
      let n = 0;
      res.on('data', c => {
        n += c.length;
        if (n > 6 << 20) req.destroy(new Error('image too large'));
        else b.push(c);
      });
      res.on('end', () => resolve({ type: res.headers['content-type'] || 'image/jpeg', buf: Buffer.concat(b) }));
    });
    req.on('timeout', () => req.destroy(new Error('image timed out')));
    req.on('error', reject);
  });
}
function luna(uri, payload) {
  return new Promise(res => {
    const sh = 'luna-send -n 1 -w 5000 -f "$1" "$2" </dev/null';
    require('./diag').execFile('/bin/sh', ['-c', sh, 'sh', uri, JSON.stringify(payload)], { env: ENV, timeout: 8000 }, (e, out) => {
      try {
        res(JSON.parse(out));
      } catch (_) {
        res({ returnValue: false, errorText: String(e || 'bad json') });
      }
    });
  });
}
// "topui" windows sit above every app and, unlike "overlay" ones, leave the remote with the app underneath.
async function launch(params) {
  return luna('luna://com.webos.applicationManager/launch', { id: 'com.cleanyourtv.notify', params });
}

async function show(b, internal) {
  const kind = internal && /^(listening|thinking|answer)$/.test(b.kind) ? b.kind : ''; // the voice function's own look; not available to network senders
  const p = {
    title: String(b.title || '').slice(0, 120),
    text: String(b.text || '').slice(0, kind ? 1500 : 400),
    seconds: Math.max(2, Math.min(120, +b.seconds || 8)),
    position: /^(top|middle|bottom)-(left|center|right)$/.test(b.position) ? b.position : kind ? 'bottom-center' : 'top-right',
  };
  if (kind) {
    p.kind = kind;
    p.question = String(b.question || '').slice(0, 300);
  }
  if (b.image) {
    try {
      const id = String(++seq);
      images.set(id, await fetchImage(String(b.image)));
      if (images.size > 5) images.delete(images.keys().next().value);
      p.image = 'http://127.0.0.1:8765/api/notify/img?id=' + id;
    } catch (e) {
      p.text = (p.text ? p.text + '\n' : '') + '(image: ' + e.message + ')';
    }
  }
  if (!p.title && !p.text && !p.image && !kind) return { error: 'nothing to show' };
  return launch(p);
}

async function handle(req, res, u, body) {
  const json = (o, c) => {
    res.writeHead(c || 200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(o));
  };
  if (u === '/api/notify/img') {
    const e = images.get(new URL(req.url, 'http://x').searchParams.get('id'));
    if (!e) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'content-type': e.type, 'cache-control': 'no-store' });
    return res.end(e.buf);
  }
  if (u === '/api/notify' && req.method === 'POST') {
    const r = await show(await body(req));
    return json(r.error ? { error: r.error } : r, r.error ? 400 : 200);
  }
  res.writeHead(404);
  res.end();
}
module.exports = { handle, show };
