// Picture notifications from the local network: POST /notify with "Authorization: Bearer <token>" on a port of the TV
// (default 8767). Off until switched on in the manager app. It exposes the notification call only, nothing else of the
// service. Wrong tokens lock an address out for ten minutes; an optional "allow" list in config.json restricts addresses.
const http = require('http'), crypto = require('crypto'), os = require('os');
const DEFAULTS = { enabled: false, port: 8767, token: '', allow: [] };
const MAX_BODY = 32 * 1024, PER_MINUTE = 20;

function create(ctx) {
  const { notify, readConf, writeConf } = ctx;
  let srv = null, port = 0;
  const fails = new Map(), hits = new Map();
  const cfg = () => Object.assign({}, DEFAULTS, readConf().notifyApi || {});
  const save = n => { const c = readConf(); c.notifyApi = n; writeConf(c); };
  function lanIp() { for (const l of Object.values(os.networkInterfaces())) for (const i of l) if (i.family === 'IPv4' && !i.internal) return i.address; return ''; }
  const ipOk = (ip, allow) => allow.some(a => {   // exact address or a /8, /16, /24 prefix such as 192.168.1.0/24
    const m = /^(\d+\.\d+\.\d+\.\d+)(?:\/(8|16|24))?$/.exec(String(a)); if (!m) return false;
    if (!m[2]) return ip === m[1];
    const k = m[2] / 8; return ip.split('.').slice(0, k).join('.') === m[1].split('.').slice(0, k).join('.');
  });
  const stop = () => { if (srv) { try { srv.close(); } catch (_) {} srv = null; port = 0; } };

  function handler(req, res) {
    const ip = (req.socket.remoteAddress || '').replace('::ffff:', '');
    const send = (c, o) => { res.writeHead(c, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    const n = cfg();
    if (n.allow.length && !ipOk(ip, n.allow)) return send(403, { error: 'address not allowed' });
    const now = Date.now(), f = fails.get(ip) || { n: 0, t: now };
    if (now - f.t > 600000) { f.n = 0; f.t = now; }
    if (f.n >= 10) return send(429, { error: 'too many wrong tokens; wait ten minutes' });
    const h = String(req.headers.authorization || ''), tok = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
    const a = Buffer.from(tok), b = Buffer.from(n.token || '');
    if (!n.token || a.length !== b.length || !crypto.timingSafeEqual(a, b)) { f.n++; fails.set(ip, f); return send(401, { error: 'bad or missing token' }); }
    const r = hits.get(ip) || { n: 0, t: now }; if (now - r.t > 60000) { r.n = 0; r.t = now; } r.n++; hits.set(ip, r);
    if (r.n > PER_MINUTE) return send(429, { error: 'too many notifications; at most ' + PER_MINUTE + ' a minute' });
    if (req.method !== 'POST' || req.url.split('?')[0] !== '/notify') return send(404, { error: 'POST /notify with a JSON body' });
    let body = '', big = false;
    req.on('data', c => { body += c; if (body.length > MAX_BODY) { big = true; req.destroy(); } });
    req.on('end', () => {
      if (big) return;
      let parsed; try { parsed = JSON.parse(body || '{}'); } catch (_) { return send(400, { error: 'the body must be JSON' }); }
      req.url = '/api/notify';
      notify.handle(req, res, '/api/notify', () => Promise.resolve(parsed)).catch(e => send(500, { error: String(e.message || e) }));
    });
  }
  function start(p) {
    srv = http.createServer(handler);
    srv.setTimeout(10000);
    srv.on('error', e => { console.error('notification api:', e.message); srv = null; port = 0; });
    srv.listen(p, '0.0.0.0'); port = p;
  }
  // make the listener match the settings: call at start and after every change
  function sync() {
    const n = cfg();
    if (!n.enabled) return stop();
    if (!n.token) { n.token = crypto.randomBytes(24).toString('hex'); save(n); }
    if (srv && port === n.port) return;
    stop(); start(n.port);
  }
  const info = () => { const n = cfg(); return { enabled: !!n.enabled, port: n.port, token: n.token, ip: lanIp(), allow: n.allow, listening: !!srv }; };
  function set(o) {
    const n = cfg();
    if (typeof o.enabled === 'boolean') n.enabled = o.enabled;
    if (o.regenerate || (n.enabled && !n.token)) n.token = crypto.randomBytes(24).toString('hex');
    save(n); sync(); return info();
  }
  return { sync, info, set };
}
module.exports = { create };
