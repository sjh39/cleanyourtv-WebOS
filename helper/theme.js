// Themes for the launcher's home screen. A theme is a data file (helper/themes/<id>.json) with colours, layout numbers and effects;
// there is no CSS or script in it. Every value is checked against a fixed list and clamped, anything else is ignored, so a theme
// can change how Home looks but nothing else. The service resolves the chosen theme into CSS variables for the launcher.
// API (loopback only): GET /api/theme/list, POST /api/theme/set {id, accent}, POST /api/theme/revert, GET /api/theme/wallpaper/<file>.
const fs = require('fs'), path = require('path');
const DIR = process.env.CYTV_THEMES || path.join(__dirname, 'themes');
const DEFAULT_ID = 'classic', MAX_WALLPAPER = 1.5 * 1024 * 1024;
const HEX = /^#[0-9a-f]{6}$/i, FILE = /^[\w-]{1,40}\.(?:jpg|png|webp)$/, ID = /^[a-z0-9-]{1,30}$/;
const ACCENTS = [['Theme default', ''], ['White', '#f5f6f8'], ['Blue', '#4c8dff'], ['Teal', '#2ec4b6'], ['Green', '#46c37b'], ['Yellow', '#f2c94c'], ['Orange', '#ff8a3d'], ['Red', '#ff5a5f'], ['Pink', '#ff6fb5'], ['Purple', '#a77bff']];

const num = (v, lo, hi, d) => typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
const int = (v, lo, hi, d) => Math.round(num(v, lo, hi, d));
const hex = (v, d) => typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : d;
const oneOf = (v, list, d) => list.indexOf(v) >= 0 ? v : d;
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = c => '#' + c.map(x => ('0' + Math.round(Math.min(255, Math.max(0, x))).toString(16)).slice(-2)).join('');
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

// the values of a theme file, checked and clamped; the defaults are the original look of the launcher
function normalize(raw, id) {
  if (!raw || typeof raw !== 'object' || !ID.test(id)) return null;
  const c = raw.colors || {}, l = raw.layout || {}, e = raw.effects || {};
  const t = {
    id, name: String(raw.name || id).slice(0, 40), author: String(raw.author || '').slice(0, 60), description: String(raw.description || '').slice(0, 140),
    colors: { night: hex(c.night, '#07080b'), panel: hex(c.panel, '#14161b'), ink: hex(c.ink, '#f5f6f8'), accent: hex(c.accent, '#f5f6f8') },
    layout: { cols: int(l.cols, 6, 12, 10), tileH: int(l.tileH, 90, 200, 151), tileRadius: int(l.tileRadius, 0, 80, 34), gapX: int(l.gapX, 8, 48, 24), gapY: int(l.gapY, 8, 48, 26),
      dockW: int(l.dockW, 240, 500, 408), dockH: int(l.dockH, 140, 300, 230), dockRadius: int(l.dockRadius, 0, 80, 36), dockGap: int(l.dockGap, 8, 60, 32),
      fontScale: num(l.fontScale, 0.8, 1.3, 1), clock: oneOf(l.clock, ['left', 'right', 'stack', 'off'], 'left'), clockScale: num(l.clockScale, 0.8, 2, 1),
      dock: oneOf(l.dock, ['top', 'bottom'], 'top'), dockCount: int(l.dockCount, 4, 6, 4), dockPanel: num(l.dockPanel, 0, 0.5, 0), bar: oneOf(l.bar, ['pills', 'round'], 'pills'), name: oneOf(l.name, ['show', 'hide'], 'show') },
    effects: { gloss: num(e.gloss, 0, 1, 0), glow: num(e.glow, 0, 1, 1), glowColor: oneOf(e.glowColor, ['app', 'accent'], 'app'), speed: num(e.speed, 0, 2, 1), wallpaper: '', wallpaperDim: num(e.wallpaperDim, 0, 0.9, 0.4) },
  };
  if (typeof e.wallpaper === 'string' && FILE.test(e.wallpaper)) {
    try {
      const p = path.join(DIR, 'wallpapers', e.wallpaper), st = fs.statSync(p), fd = fs.openSync(p, 'r'), b = Buffer.alloc(12); fs.readSync(fd, b, 0, 12, 0); fs.closeSync(fd);
      const ok = (/\.jpg$/.test(e.wallpaper) && b[0] === 0xff && b[1] === 0xd8) || (/\.png$/.test(e.wallpaper) && b.slice(1, 4).toString() === 'PNG') || (/\.webp$/.test(e.wallpaper) && b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP');
      if (st.isFile() && st.size <= MAX_WALLPAPER && ok) t.effects.wallpaper = e.wallpaper;
    } catch (_) {}
  }
  return t;
}

let cache = null;
function load() {
  if (cache) return cache;
  const out = {};
  let names = []; try { names = fs.readdirSync(DIR); } catch (_) {}
  for (const f of names.sort()) {
    const m = /^([a-z0-9-]{1,30})\.json$/.exec(f); if (!m) continue;
    try { const t = normalize(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')), m[1]); if (t) out[t.id] = t; } catch (_) {}
  }
  if (!out[DEFAULT_ID]) out[DEFAULT_ID] = normalize({ name: 'Classic', description: 'The original look.' }, DEFAULT_ID);
  return cache = out;
}

// what the launcher applies: CSS variables, the numbers its scrolling needs, and the wallpaper
function resolve(t, accent) {
  const a = hex(accent, t.colors.accent), k = t.colors, l = t.layout, e = t.effects;
  const night = rgb(k.night), ink = rgb(k.ink);
  return {
    id: t.id, name: t.name,
    vars: {
      '--night': k.night, '--panel': k.panel, '--panel2': mix(k.panel, k.ink, 0.06), '--ink': k.ink, '--ink2': 'rgba(' + ink.join(',') + ',.62)',
      '--acc': a, '--acc-ink': lum(a) > 0.35 ? '#0b0c10' : '#ffffff', '--glow-op': String(e.glow), '--spd': String(e.speed), '--fs': String(l.fontScale),
      '--night-rgb': night.join(','), '--panel-a': String(l.dockPanel), '--gloss': String(e.gloss), '--clock-s': String(l.clockScale), '--cols': String(l.cols), '--tile-h': l.tileH + 'px', '--tile-r': l.tileRadius + 'px', '--gap-x': l.gapX + 'px', '--gap-y': l.gapY + 'px',
      '--dock-w': l.dockW + 'px', '--dock-h': l.dockH + 'px', '--dock-r': l.dockRadius + 'px', '--dock-gap': l.dockGap + 'px',
    },
    cols: l.cols, tileH: l.tileH, gapY: l.gapY, dockH: l.dockH, clock: l.clock, bottom: l.dock === 'bottom', dockN: l.dockCount, panel: l.dockPanel > 0, round: l.bar === 'round', hideName: l.name === 'hide',
    glowRgb: e.glowColor === 'accent' ? rgb(a).join(',') : '',
    nightRgb: night.join(','), wallpaper: e.wallpaper ? { file: e.wallpaper, dim: e.wallpaperDim } : null,
  };
}

function create(ctx) {
  const cur = () => { const c = (ctx.readConf().theme || {}); const all = load(); return { id: all[c.id] ? c.id : DEFAULT_ID, accent: hex(c.accent, ''), prev: c.prev && all[c.prev.id] ? { id: c.prev.id, accent: hex(c.prev.accent, '') } : null }; };
  const resolved = () => { const c = cur(); return resolve(load()[c.id], c.accent); };
  const save = o => { const conf = ctx.readConf(); conf.theme = o; ctx.writeConf(conf); };
  function list() {
    const c = cur(), all = load();
    return { current: { id: c.id, accent: c.accent }, previous: c.prev, accents: ACCENTS.map(x => ({ name: x[0], hex: x[1] })),
      themes: Object.keys(all).map(id => ({ id, name: all[id].name, author: all[id].author, description: all[id].description, night: all[id].colors.night, accent: all[id].colors.accent })) };
  }
  async function handle(req, res, u, body) {
    const json = (o, code) => { res.writeHead(code || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    const act = u.replace('/api/theme/', '');
    if (act === 'list') return json(list());
    let m = /^wallpaper\/([\w-]{1,40}\.(?:jpg|png|webp))$/.exec(act);
    if (m) {
      const used = Object.keys(load()).some(id => load()[id].effects.wallpaper === m[1]);
      if (!used) { res.writeHead(404); return res.end(); }
      try { const b = fs.readFileSync(path.join(DIR, 'wallpapers', m[1])); res.writeHead(200, { 'content-type': /\.jpg$/.test(m[1]) ? 'image/jpeg' : /\.png$/.test(m[1]) ? 'image/png' : 'image/webp', 'cache-control': 'max-age=3600' }); return res.end(b); }
      catch (_) { res.writeHead(404); return res.end(); }
    }
    if (req.method !== 'POST') { res.writeHead(404); return res.end(); }
    const b = await body(req), c = cur(), all = load();
    if (act === 'set') {
      const id = b.id === undefined ? c.id : String(b.id);
      if (!all[id]) return json({ error: 'unknown theme' }, 400);
      let accent = c.accent;
      if (b.accent !== undefined) { if (b.accent !== '' && !HEX.test(String(b.accent))) return json({ error: 'the accent must be a colour like #4c8dff' }, 400); accent = String(b.accent).toLowerCase(); }
      else if (id !== c.id) accent = '';   // a new theme brings its own accent
      if (id !== c.id || accent !== c.accent) save({ id, accent, prev: { id: c.id, accent: c.accent } });
      return json(list());
    }
    if (act === 'revert') { if (!c.prev) return json({ error: 'nothing to go back to' }, 400); save({ id: c.prev.id, accent: c.prev.accent, prev: { id: c.id, accent: c.accent } }); return json(list()); }
    res.writeHead(404); res.end();
  }
  return { handle, resolved, list };
}
module.exports = { create, normalize, DIR };
