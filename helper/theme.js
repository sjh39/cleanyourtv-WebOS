// Themes for the launcher's home screen. A theme is a data file (helper/themes/<id>.json) that sets values from the table SCHEMA below:
// colours, surfaces, text, and the position and size of every part of the screen (clock, buttons, app name, dock, grid), plus effects
// and a wallpaper. There is no CSS or script in a theme. Every value is checked against SCHEMA and clamped, a value that is missing or
// invalid keeps the value of the theme it extends (or the default, the original look), and unknown keys are ignored, so a theme can change
// how Home looks but nothing else. A new setting is one row in SCHEMA plus the CSS that reads its variable; docs/themes.md is generated
// from SCHEMA (tools/theme-docs.js).
// API (loopback only): GET /api/theme/list, POST /api/theme/set {id, accent}, POST /api/theme/revert, GET /api/theme/wallpaper/<file>.
const fs = require('fs'), path = require('path');
const DIR = process.env.CYTV_THEMES || path.join(__dirname, 'themes');
const DEFAULT_ID = 'classic', MAX_WALLPAPER = 1.5 * 1024 * 1024;
const HEX = /^#[0-9a-f]{6}$/i, FILE = /^[\w-]{1,40}\.(?:jpg|png|webp)$/, ID = /^[a-z0-9-]{1,30}$/;
const ACCENTS = [['Theme default', ''], ['White', '#f5f6f8'], ['Blue', '#4c8dff'], ['Teal', '#2ec4b6'], ['Green', '#46c37b'], ['Yellow', '#f2c94c'], ['Orange', '#ff8a3d'], ['Red', '#ff5a5f'], ['Pink', '#ff6fb5'], ['Purple', '#a77bff']];
const POS = ['left', 'center', 'right'], TOPBOT = ['top', 'bottom'];

// [key, type, range or choices, default, what it does]. Types: color (#rrggbb), color? (a colour, or null for "the accent"), num, int
// (range [lo, hi]), enum (choices), bool, auto (an int range, or null for "worked out from the other values"), file (a wallpaper file name).
const SCHEMA = [
  ['colors.night', 'color', null, '#07080b', 'Page background.'],
  ['colors.panel', 'color', null, '#14161b', 'Toast background; menu rows are a lighter mix of it.'],
  ['colors.ink', 'color', null, '#f5f6f8', 'Text.'],
  ['colors.accent', 'color', null, '#f5f6f8', 'Highlight: the focused button and menu row and, unless `colors.focus` is set, the focus ring.'],
  ['colors.focus', 'color?', null, null, 'Focus ring colour; empty uses the accent.'],
  ['colors.pill', 'color', null, '#ffffff', 'Colour of the translucent top buttons, with `surface.pillAlpha`.'],
  ['surface.pillAlpha', 'num', [0, 0.6], 0.09, 'Opacity of the top buttons.'],
  ['surface.pillRing', 'num', [0, 0.8], 0.1, 'Opacity of the thin outline of the top buttons.'],
  ['surface.pillRadius', 'int', [0, 60], 32, 'Corner radius of the top buttons (pill style only).'],
  ['surface.menuAlpha', 'num', [0.5, 1], 0.97, 'Opacity of the dark layer behind menus.'],
  ['surface.rowRadius', 'int', [0, 50], 30, 'Corner radius of menu rows.'],
  ['type.font', 'enum', ['default', 'serif', 'mono'], 'default', 'The typeface: the TV\'s own, a serif or a monospace.'],
  ['type.scale', 'num', [0.8, 1.3], 1, 'Scale of the text of buttons, menus and tiles.'],
  ['clock.show', 'bool', null, true, 'Show the clock.'],
  ['clock.date', 'bool', null, true, 'Show the date beside or under the time.'],
  ['clock.layout', 'enum', ['inline', 'stack'], 'inline', '`inline`: the date beside the time; `stack`: under it.'],
  ['clock.anchor', 'enum', TOPBOT, 'top', 'Which screen edge `clock.y` counts from.'],
  ['clock.align', 'enum', POS, 'left', 'Which side `clock.x` counts from; `center` centres it.'],
  ['clock.x', 'int', [0, 900], 96, 'Distance from that side, in px (on a 1920 x 1080 canvas).'],
  ['clock.y', 'int', [0, 900], 54, 'Distance from the top or bottom edge, in px.'],
  ['clock.scale', 'num', [0.6, 2.5], 1, 'Scale of the time.'],
  ['clock.dateScale', 'num', [0.6, 2], 1, 'Scale of the date.'],
  ['bar.show', 'bool', null, true, 'Show the top buttons (Inputs, Settings, Customise, ...).'],
  ['bar.style', 'enum', ['pill', 'round', 'flat'], 'pill', '`pill`: icon and label on a rounded button; `round`: icon only in a circle; `flat`: no background.'],
  ['bar.labels', 'enum', ['auto', 'show', 'hide'], 'auto', 'Button labels: `auto` shows them except in the `round` style.'],
  ['bar.anchor', 'enum', TOPBOT, 'top', 'Which screen edge `bar.y` counts from.'],
  ['bar.align', 'enum', POS, 'right', 'Which side `bar.x` counts from.'],
  ['bar.x', 'int', [0, 900], 96, 'Distance from that side, in px.'],
  ['bar.y', 'int', [0, 900], 54, 'Distance from the top or bottom edge, in px.'],
  ['bar.size', 'int', [40, 100], 64, 'Height of a button, in px.'],
  ['bar.gap', 'int', [4, 40], 16, 'Space between buttons, in px.'],
  ['name.show', 'bool', null, true, 'Show the large name of the focused app.'],
  ['name.align', 'enum', POS, 'left', 'Text alignment of the name.'],
  ['name.x', 'int', [0, 900], 96, 'Margin on both sides, in px.'],
  ['name.y', 'int', [0, 900], 150, 'Distance from the top edge, in px.'],
  ['name.scale', 'num', [0.4, 1.6], 1, 'Scale of the name.'],
  ['dock.anchor', 'enum', TOPBOT, 'top', 'Which screen edge `dock.y` counts from. A dock at the bottom makes the grid an overlay.'],
  ['dock.align', 'enum', POS, 'left', 'Which side `dock.x` counts from; `center` centres the dock.'],
  ['dock.x', 'int', [0, 900], 96, 'Distance from that side, in px.'],
  ['dock.y', 'auto', [0, 1000], null, 'Distance from the top or bottom edge, in px. Empty: 360 from the top, 68 from the bottom.'],
  ['dock.count', 'int', [3, 8], 4, 'Apps in the dock.'],
  ['dock.w', 'int', [120, 500], 408, 'Width of a dock tile, in px.'],
  ['dock.h', 'int', [100, 300], 230, 'Height of a dock tile, in px.'],
  ['dock.gap', 'int', [8, 60], 32, 'Space between dock tiles, in px.'],
  ['dock.radius', 'int', [0, 80], 36, 'Corner radius of dock tiles.'],
  ['dock.panel', 'num', [0, 0.6], 0, 'Opacity of a translucent panel behind the dock tiles; 0 for none.'],
  ['dock.panelPad', 'int', [0, 60], 24, 'Space between the panel and the tiles, in px.'],
  ['dock.lift', 'int', [0, 40], 10, 'How far the focused dock tile rises, in px.'],
  ['dock.focusScale', 'num', [1, 1.3], 1.05, 'Scale of the focused dock tile.'],
  ['grid.mode', 'enum', ['below', 'overlay'], 'below', '`below`: the grid sits under the dock and scrolls; `overlay`: it opens over the screen when the focus moves down into it. Forced to `overlay` for a dock at the bottom.'],
  ['grid.cols', 'int', [4, 14], 10, 'Columns.'],
  ['grid.tileH', 'int', [80, 240], 151, 'Height of a tile, in px; the width follows from the columns.'],
  ['grid.gapX', 'int', [6, 60], 24, 'Horizontal space between tiles, in px.'],
  ['grid.gapY', 'int', [6, 60], 26, 'Vertical space between tiles, in px.'],
  ['grid.radius', 'int', [0, 100], 34, 'Corner radius of tiles.'],
  ['grid.x', 'int', [0, 900], 96, 'Distance of the grid from the left edge, in px.'],
  ['grid.width', 'int', [600, 1920], 1728, 'Width of the grid, in px.'],
  ['grid.y', 'auto', [0, 1000], null, 'Distance of the grid from the top edge, in px. Empty: under the dock, or 290 for an overlay.'],
  ['grid.clipTop', 'int', [0, 600], 300, 'Where scrolled rows disappear at the top, in px (`below` mode).'],
  ['grid.focusScale', 'num', [1, 1.4], 1.12, 'Scale of the focused tile.'],
  ['grid.overlayDim', 'num', [0, 1], 0.95, 'Opacity of the layer behind the overlay grid.'],
  ['grid.overlayH', 'int', [200, 900], 510, 'Visible height of the overlay grid before it scrolls, in px.'],
  ['tile.gloss', 'num', [0, 1], 0, 'A light highlight on every tile.'],
  ['tile.border', 'num', [0, 0.6], 0, 'Opacity of a thin outline on every tile.'],
  ['tile.ringWidth', 'int', [0, 10], 4, 'Width of the focus ring, in px; 0 for none.'],
  ['tile.ringOffset', 'int', [0, 14], 4, 'Space between a tile and its focus ring, in px.'],
  ['effects.glow', 'num', [0, 1], 1, 'Strength of the ambient glow at the top.'],
  ['effects.glowColor', 'enum', ['app', 'accent'], 'app', '`app`: taken from the focused icon; `accent`: the accent colour.'],
  ['effects.speed', 'num', [0, 2], 1, 'Animation speed multiplier; 0 switches the animations off.'],
  ['effects.wallpaper', 'file', null, '', 'A file name in `helper/themes/wallpapers/`: `.jpg`, `.png` or `.webp`, at most 1.5 MB; drawn at 1920 x 1080.'],
  ['effects.wallpaperDim', 'num', [0, 0.9], 0.4, 'How far the wallpaper is darkened with the background colour.'],
];
const DEFAULTS = {}; for (const r of SCHEMA) DEFAULTS[r[0]] = r[3];

const hex = v => typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : undefined;
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = c => '#' + c.map(x => ('0' + Math.round(Math.min(255, Math.max(0, x))).toString(16)).slice(-2)).join('');
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const getPath = (o, p) => p.split('.').reduce((x, k) => x && typeof x === 'object' ? x[k] : undefined, o);
// the checked value for a row, or undefined when the raw value is missing or invalid
function check(row, v) {
  const type = row[1], spec = row[2];
  if (v === undefined) return undefined;
  if (type === 'color') return hex(v);
  if (type === 'color?') return v === '' || v === null ? null : hex(v);
  if (type === 'bool') return typeof v === 'boolean' ? v : undefined;
  if (type === 'enum') return spec.indexOf(v) >= 0 ? v : undefined;
  if (type === 'num' || type === 'int' || type === 'auto') {
    if (type === 'auto' && (v === null || v === '')) return null;
    if (typeof v !== 'number' || !isFinite(v)) return undefined;
    const c = Math.min(spec[1], Math.max(spec[0], v)); return type === 'num' ? c : Math.round(c);
  }
  return undefined;
}

// A theme: its description and a flat map of every SCHEMA key; `base` is the values of the theme it extends (or the defaults).
function normalize(raw, id, base) {
  if (!raw || typeof raw !== 'object' || !ID.test(id)) return null;
  const v = Object.assign({}, base || DEFAULTS);
  for (const row of SCHEMA) {
    if (row[1] === 'file') continue;
    const c = check(row, getPath(raw, row[0])); if (c !== undefined) v[row[0]] = c;
  }
  const w = getPath(raw, 'effects.wallpaper');
  if (typeof w === 'string' && FILE.test(w)) {
    try {
      const p = path.join(DIR, 'wallpapers', w), st = fs.statSync(p), fd = fs.openSync(p, 'r'), b = Buffer.alloc(12); fs.readSync(fd, b, 0, 12, 0); fs.closeSync(fd);
      const ok = (/\.jpg$/.test(w) && b[0] === 0xff && b[1] === 0xd8) || (/\.png$/.test(w) && b.slice(1, 4).toString() === 'PNG') || (/\.webp$/.test(w) && b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP');
      if (st.isFile() && st.size <= MAX_WALLPAPER && ok) v['effects.wallpaper'] = w;
    } catch (_) {}
  } else if (w === '') v['effects.wallpaper'] = '';
  return { id, name: String(raw.name || id).slice(0, 40), author: String(raw.author || '').slice(0, 60), description: String(raw.description || '').slice(0, 160), v };
}

let cache = null;
function load() {
  if (cache) return cache;
  const raws = {};
  let names = []; try { names = fs.readdirSync(DIR); } catch (_) {}
  for (const f of names.sort()) {
    const m = /^([a-z0-9-]{1,30})\.json$/.exec(f); if (!m) continue;
    try { raws[m[1]] = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (_) {}
  }
  const out = {};
  const build = (id, stack) => {   // "extends": another theme's values are the starting point
    if (out[id]) return out[id];
    const raw = raws[id]; if (!raw || stack.indexOf(id) >= 0 || stack.length > 4) return null;
    const baseId = typeof raw.extends === 'string' && ID.test(raw.extends) ? raw.extends : '', base = baseId ? build(baseId, stack.concat(id)) : null;
    return out[id] = normalize(raw, id, base ? base.v : null);
  };
  for (const id of Object.keys(raws)) build(id, []);
  if (!out[DEFAULT_ID]) out[DEFAULT_ID] = normalize({ name: 'Classic', description: 'The original look.' }, DEFAULT_ID);
  for (const id of Object.keys(out)) if (!out[id]) delete out[id];
  return cache = out;
}

// What the launcher applies: CSS variables, attributes for the few layouts that need more than a variable, and the numbers its scrolling needs.
const px = n => n + 'px';
function place(anchor, align, x, y) {   // the four edges and the transform of a box anchored to a side, a corner or the centre
  const o = { l: 'auto', r: 'auto', t: 'auto', b: 'auto', tx: 'none' };
  if (align === 'left') o.l = px(x); else if (align === 'right') o.r = px(x); else { o.l = 'calc(50% + ' + x + 'px)'; o.tx = 'translateX(-50%)'; }
  if (anchor === 'top') o.t = px(y); else o.b = px(y);
  return o;
}
function resolve(t, accent) {
  const v = t.v, A = hex(accent) || v['colors.accent'], night = rgb(v['colors.night']), ink = rgb(v['colors.ink']), pill = rgb(v['colors.pill']);
  const dockBottom = v['dock.anchor'] === 'bottom', overlay = v['grid.mode'] === 'overlay' || dockBottom;
  const panel = v['dock.panel'] > 0, pad = panel ? v['dock.panelPad'] : 0, dockH = v['dock.h'] + 2 * pad;
  const dockY = v['dock.y'] !== null ? v['dock.y'] : (dockBottom ? 68 : 360);
  const viewTop = overlay ? 0 : Math.min(v['grid.clipTop'], dockY);
  const gridY = v['grid.y'] !== null ? v['grid.y'] : (overlay ? 290 : dockY + dockH + 60);
  const dock = place(v['dock.anchor'], v['dock.align'], v['dock.x'], dockBottom ? dockY : dockY - viewTop);
  const clock = place(v['clock.anchor'], v['clock.align'], v['clock.x'], v['clock.y']), bar = place(v['bar.anchor'], v['bar.align'], v['bar.x'], v['bar.y']);
  const labels = v['bar.labels'] === 'auto' ? (v['bar.style'] === 'round' ? 'hide' : 'show') : v['bar.labels'];
  const FONT = { default: '"LG Smart UI","Helvetica Neue",Helvetica,Arial,sans-serif', serif: 'Georgia,"Times New Roman",Times,serif', mono: 'Menlo,Consolas,"DejaVu Sans Mono",monospace' };
  const vars = {
    '--night': v['colors.night'], '--night-rgb': night.join(','), '--panel': v['colors.panel'], '--panel2': mix(v['colors.panel'], v['colors.ink'], 0.06), '--ink': v['colors.ink'], '--ink2': 'rgba(' + ink.join(',') + ',.62)',
    '--acc': A, '--acc-ink': lum(A) > 0.35 ? '#0b0c10' : '#ffffff', '--focus': v['colors.focus'] || A, '--font': FONT[v['type.font']], '--fs': String(v['type.scale']),
    '--pill-bg': 'rgba(' + pill.join(',') + ',' + v['surface.pillAlpha'] + ')', '--pill-ring': 'rgba(' + pill.join(',') + ',' + v['surface.pillRing'] + ')', '--pill-r': v['bar.style'] === 'round' ? '50%' : px(v['surface.pillRadius']),
    '--pill-h': px(v['bar.size']), '--bar-gap': px(v['bar.gap']), '--menu-bg': 'rgba(' + night.join(',') + ',' + v['surface.menuAlpha'] + ')', '--row-r': px(v['surface.rowRadius']),
    '--clock-l': clock.l, '--clock-r': clock.r, '--clock-t': clock.t, '--clock-b': clock.b, '--clock-tx': clock.tx, '--clock-ai': { left: 'flex-start', center: 'center', right: 'flex-end' }[v['clock.align']], '--clock-s': String(v['clock.scale']), '--date-s': String(v['clock.dateScale']),
    '--clock-d': v['clock.show'] ? 'flex' : 'none', '--date-d': v['clock.date'] ? 'block' : 'none', '--bar-l': bar.l, '--bar-r': bar.r, '--bar-t': bar.t, '--bar-b': bar.b, '--bar-tx': bar.tx, '--bar-d': v['bar.show'] ? 'flex' : 'none',
    '--name-d': v['name.show'] ? 'block' : 'none', '--name-x': px(v['name.x']), '--name-y': px(v['name.y']), '--name-a': v['name.align'], '--name-s': String(v['name.scale']),
    '--view-top': px(viewTop), '--dock-l': dock.l, '--dock-r': dock.r, '--dock-t': dock.t, '--dock-b': dock.b, '--dock-tx': dock.tx, '--dock-w': px(v['dock.w']), '--dock-h': px(v['dock.h']), '--dock-gap': px(v['dock.gap']), '--dock-rad': px(v['dock.radius']),
    '--dock-panel': String(v['dock.panel']), '--dock-pad': px(pad), '--dock-lift': px(-v['dock.lift']), '--dock-fs': String(v['dock.focusScale']),
    '--cols': String(v['grid.cols']), '--tile-h': px(v['grid.tileH']), '--gap-x': px(v['grid.gapX']), '--gap-y': px(v['grid.gapY']), '--tile-r': px(v['grid.radius']), '--grid-l': px(v['grid.x']), '--grid-w': px(v['grid.width']),
    '--grid-t': px(gridY - viewTop), '--grid-fs': String(v['grid.focusScale']), '--ov-dim': String(v['grid.overlayDim']),
    '--gloss': String(v['tile.gloss']), '--tile-border': String(v['tile.border']), '--ring-w': px(v['tile.ringWidth']), '--ring-off': px(v['tile.ringOffset']),
    '--glow-op': String(v['effects.glow']), '--spd': String(v['effects.speed']),
  };
  const w = v['effects.wallpaper'];
  return {
    id: t.id, name: t.name, vars,
    attrs: { bar: v['bar.style'], labels, clock: v['clock.layout'], grid: overlay ? 'overlay' : 'below' },
    cols: v['grid.cols'], tileH: v['grid.tileH'], gapY: v['grid.gapY'], gt: gridY - viewTop, viewH: 1080 - viewTop, dockN: v['dock.count'], overlay, overlayH: v['grid.overlayH'],
    glowRgb: v['effects.glowColor'] === 'accent' ? rgb(A).join(',') : '', nightRgb: night.join(','), wallpaper: w ? { file: w, dim: v['effects.wallpaperDim'] } : null,
  };
}

function create(ctx) {
  const cur = () => { const c = (ctx.readConf().theme || {}); const all = load(); return { id: all[c.id] ? c.id : DEFAULT_ID, accent: hex(c.accent) || '', prev: c.prev && all[c.prev.id] ? { id: c.prev.id, accent: hex(c.prev.accent) || '' } : null }; };
  const resolved = () => { const c = cur(); return resolve(load()[c.id], c.accent); };
  const save = o => { const conf = ctx.readConf(); conf.theme = o; ctx.writeConf(conf); };
  function list() {
    const c = cur(), all = load();
    return { current: { id: c.id, accent: c.accent }, previous: c.prev, accents: ACCENTS.map(x => ({ name: x[0], hex: x[1] })),
      themes: Object.keys(all).map(id => ({ id, name: all[id].name, author: all[id].author, description: all[id].description, night: all[id].v['colors.night'], accent: all[id].v['colors.accent'] })) };
  }
  async function handle(req, res, u, body) {
    const json = (o, code) => { res.writeHead(code || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    const act = u.replace('/api/theme/', '');
    if (act === 'list') return json(list());
    let m = /^wallpaper\/([\w-]{1,40}\.(?:jpg|png|webp))$/.exec(act);
    if (m) {
      const used = Object.keys(load()).some(id => load()[id].v['effects.wallpaper'] === m[1]);
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
module.exports = { create, normalize, SCHEMA, DEFAULTS, DIR };
