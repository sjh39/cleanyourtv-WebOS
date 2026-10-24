// Themes (theme.js): the repository's themes/ folder is valid, values are checked and clamped, extends works, a theme is downloaded
// from GitHub (a local stand-in here) when chosen and kept, a bad download is refused, and the service ships none.
const fs = require('fs'),
  path = require('path');
const { root, tmp, ok, call, serve, req, memoryConfig, run } = require('./lib');
const nc = req('netcompat');

run(async () => {
  const themeMod = req('theme'),
    tdir = path.join(root, 'themes');
  const folders = fs.readdirSync(tdir).filter(n => fs.statSync(path.join(tdir, n)).isDirectory());
  ok(folders.length >= 5 && folders.indexOf('classic') >= 0, 'the themes folder holds one folder per theme');
  const known = new Set(themeMod.SCHEMA.map(r => r[0])),
    unknownKeys = [];
  const walk = (o, pre) => {
    for (const k of Object.keys(o)) {
      const key = pre ? pre + '.' + k : k;
      if (o[k] && typeof o[k] === 'object') walk(o[k], key);
      else if (!known.has(key) && ['name', 'author', 'description', 'extends'].indexOf(key) < 0) unknownKeys.push(key);
    }
  };
  let allOk = true;
  const tbad = [];
  for (const id of folders) {
    const fd = path.join(tdir, id);
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(fd, 'theme.json'), 'utf8'));
    } catch (e) {
      allOk = false;
      tbad.push(id + ': theme.json');
      continue;
    }
    const t = themeMod.normalize(raw, id, null, fd);
    walk(raw, '');
    if (!t || (raw.effects && raw.effects.wallpaper && t.v['effects.wallpaper'] !== raw.effects.wallpaper)) {
      allOk = false;
      tbad.push(id + ': theme or wallpaper');
    }
    const pv = ['jpg', 'png', 'webp'].map(x => path.join(fd, 'preview.' + x)).filter(f => fs.existsSync(f))[0];
    if (!pv || !themeMod.imageOk(fs.readFileSync(pv), pv, 600 * 1024)) {
      allOk = false;
      tbad.push(id + ': screenshot (preview.jpg, an image of at most 600 KB)');
    }
  }
  ok(allOk, 'every theme folder has a valid theme.json, its wallpaper and a screenshot' + (tbad.length ? ': ' + tbad.join('; ') : ''));
  ok(unknownKeys.length === 0, 'theme files use only keys of the schema' + (unknownKeys.length ? ': ' + unknownKeys.join(', ') : ''));
  ok(
    fs.readFileSync(path.join(tdir, 'index.json'), 'utf8') === require(path.join(root, 'tools', 'theme-index.js')).build(),
    'themes/index.json is up to date (run: node tools/theme-index.js)'
  );
  ok(
    themeMod.SCHEMA.every(r => ['name', 'author', 'description', 'extends'].indexOf(r[0].split('.')[0]) < 0),
    "no setting group shares a name with the theme's own fields (name, author, description, extends)"
  );
  const bad = themeMod.normalize(
    {
      name: 'x'.repeat(500),
      colors: { night: 'red; background:url(//evil)', ink: '#12345', accent: 5 },
      grid: { cols: 99, tileH: -5, radius: 1e9, mode: 'sideways', align: 'middle' },
      type: { scale: '2', font: 'comic' },
      clock: { layout: 'sideways', scale: 50 },
      effects: { glow: 7, speed: NaN, wallpaper: '../../etc/passwd', wallpaperDim: 5 },
      css: 'body{display:none}',
    },
    'evil'
  );
  ok(
    bad.name.length === 40 &&
      bad.v['colors.night'] === '#07080b' &&
      bad.v['colors.ink'] === '#f5f6f8' &&
      bad.v['colors.accent'] === '#f5f6f8',
    'colours must be #rrggbb, anything else falls back'
  );
  ok(
    bad.v['grid.cols'] === 14 &&
      bad.v['grid.tileH'] === 80 &&
      bad.v['grid.radius'] === 100 &&
      bad.v['grid.mode'] === 'below' &&
      bad.v['grid.align'] === 'left' &&
      bad.v['type.scale'] === 1 &&
      bad.v['type.font'] === 'default' &&
      bad.v['clock.layout'] === 'inline' &&
      bad.v['clock.scale'] === 2.5,
    'numbers are clamped, enums and types are checked'
  );
  ok(
    bad.v['effects.glow'] === 1 &&
      bad.v['effects.speed'] === 1 &&
      bad.v['effects.wallpaper'] === '' &&
      bad.v['effects.wallpaperDim'] === 0.9 &&
      !('css' in bad.v),
    'effects are clamped, a wallpaper path is refused and unknown keys are dropped'
  );
  ok(themeMod.normalize({}, '../x') === null, 'a bad theme id is refused');
  const tbase = themeMod.normalize({ grid: { cols: 7 }, dock: { count: 6 } }, 'base'),
    tkid = themeMod.normalize({ grid: { cols: 'many' }, bar: { style: 'round' } }, 'kid', tbase.v);
  ok(
    tkid.v['grid.cols'] === 7 && tkid.v['dock.count'] === 6 && tkid.v['bar.style'] === 'round',
    'a theme that extends another keeps its values where its own are missing or invalid'
  );

  // a stand-in for raw.githubusercontent.com: the repository's folder, plus a few themes that are wrong on purpose
  const tWrong = {
    kid: JSON.stringify({ name: 'Kid', extends: 'bloom', bar: { style: 'flat' } }),
    notjson: '{ this is not json',
    huge: JSON.stringify({ name: 'x'.repeat(40000) }),
    badwall: JSON.stringify({ name: 'Bad wallpaper', effects: { wallpaper: 'w.jpg' } }),
    orphan: JSON.stringify({ name: 'Orphan', extends: 'missing-base' }),
  };
  let ghUp = true;
  const ghHits = [];
  const gh = await serve((q, r) => {
    const u = q.url.split('?')[0];
    ghHits.push(u);
    const send = (c, b, t) => {
      r.writeHead(c, { 'content-type': t || 'application/octet-stream' });
      r.end(b);
    };
    if (!ghUp) return q.socket.destroy();
    let m = /^\/themes\/([a-z0-9-]+)\/theme\.json$/.exec(u);
    if (m && tWrong[m[1]]) return send(200, tWrong[m[1]]);
    if (/^\/themes\/badwall\/w\.jpg$/.test(u)) return send(200, Buffer.from('this is not a jpeg at all, just text'));
    const f = path.join(root, u);
    if (!f.startsWith(tdir + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return send(404, 'no');
    send(200, fs.readFileSync(f));
  });
  const tlocal = path.join(tmp, 'themes-local');
  nc.mkdirp(path.join(tlocal, 'wallpapers'));
  fs.writeFileSync(path.join(tlocal, 'old.json'), '{}');
  fs.writeFileSync(path.join(tlocal, 'wallpapers', 'x.jpg'), 'x');
  process.env.CYTV_THEMES = tlocal;
  process.env.CYTV_THEMES_URL = gh.url + '/themes';
  const th = themeMod.create({ config: memoryConfig(), noStartup: true });
  ok(
    !fs.existsSync(path.join(tlocal, 'old.json')) && !fs.existsSync(path.join(tlocal, 'wallpapers')),
    'the files of the earlier layout (themes shipped with the service) are removed'
  );
  const tcall = (act, body, method) => call(th, '/api/theme/' + act, method || 'POST', body);
  let r = await tcall('list', null, 'GET');
  ok(
    r.j.current.id === 'classic' && r.j.themes.length === folders.length && r.j.themes[0].id === 'classic' && r.j.catalogue.ok === true,
    'the list comes from themes/index.json on GitHub, Classic first'
  );
  const rb = r.j.themes.filter(x => x.id === 'bloom')[0];
  ok(
    rb && rb.installed === false && rb.preview === true && /flower/i.test(rb.description),
    'a theme that is not on the TV is listed with its description and screenshot'
  );
  const rv = th.resolved();
  ok(
    rv.vars['--cols'] === '10' &&
      rv.vars['--tile-h'] === '151px' &&
      rv.vars['--acc'] === '#f5f6f8' &&
      rv.vars['--view-top'] === '300px' &&
      rv.vars['--dock-t'] === '60px' &&
      rv.vars['--grid-t'] === '350px' &&
      rv.cols === 10 &&
      rv.attrs.grid === 'below',
    'Classic is built in and resolves to the original positions'
  );
  const pv = await call(th, '/api/theme/preview/bloom', 'GET');
  ok(pv.code === 200 && Buffer.isBuffer(pv.out) && pv.out.length > 1000, 'the screenshot is fetched from GitHub and served');
  const hitsBefore = ghHits.length;
  await call(th, '/api/theme/preview/bloom', 'GET');
  ok(ghHits.length === hitsBefore, 'a screenshot is kept on the TV and not fetched again');
  r = await tcall('set', { id: 'bloom' });
  ok(
    r.code === 200 && r.j.current.id === 'bloom' && r.j.themes.filter(x => x.id === 'bloom')[0].installed === true,
    'choosing a theme downloads it and applies it'
  );
  ok(
    fs.existsSync(path.join(tlocal, 'bloom', 'theme.json')) && fs.existsSync(path.join(tlocal, 'bloom', 'bloom.jpg')),
    'the theme file and its wallpaper are kept on the TV'
  );
  const bl = th.resolved();
  ok(
    bl.wallpaper &&
      bl.wallpaper.id === 'bloom' &&
      bl.wallpaper.file === 'bloom.jpg' &&
      bl.attrs.grid === 'push' &&
      bl.attrs.galign === 'center' &&
      bl.push &&
      bl.push.up > 0 &&
      bl.dockN === 6 &&
      bl.vars['--dock-t'] !== 'auto' &&
      bl.vars['--dock-b'] === 'auto' &&
      bl.vars['--tile-w'] === '193px',
    'a dock at the bottom with the push layout resolves to a scrolling grid below it, centred'
  );
  r = await tcall('wallpaper/bloom/bloom.jpg', null, 'GET');
  ok(r.code === 200, 'a downloaded wallpaper is served');
  r = await tcall('wallpaper/bloom/other.jpg', null, 'GET');
  ok(r.code === 404, 'a file the theme does not name is not served');
  r = await tcall('wallpaper/..%2f..%2fpasswd', null, 'GET');
  ok(r.code === 404, 'a path is not served as a wallpaper');
  r = await tcall('set', { id: 'kid' });
  ok(
    r.code === 200 &&
      fs.existsSync(path.join(tlocal, 'kid', 'theme.json')) &&
      th.resolved().attrs.bar === 'flat' &&
      th.resolved().attrs.grid === 'push',
    'a theme that extends another one downloads and uses it'
  );
  r = await tcall('set', { id: 'nope' });
  ok(r.code === 400 && /unknown theme/.test(r.j.error), 'a theme that is not on GitHub is refused');
  r = await tcall('set', { id: 'notjson' });
  ok(r.code === 502 && !fs.existsSync(path.join(tlocal, 'notjson')), 'a theme file that is not JSON is refused and nothing is kept');
  r = await tcall('set', { id: 'huge' });
  ok(r.code === 502 && /too large/.test(r.j.error) && !fs.existsSync(path.join(tlocal, 'huge')), 'a theme file over 32 KB is refused');
  r = await tcall('set', { id: 'badwall' });
  ok(
    r.code === 502 && /not an image/.test(r.j.error) && !fs.existsSync(path.join(tlocal, 'badwall')),
    'a wallpaper that is not an image is refused and nothing is kept'
  );
  r = await tcall('set', { id: 'orphan' });
  ok(r.code === 502 && !fs.existsSync(path.join(tlocal, 'orphan', 'theme.json')), 'a theme whose base theme is missing is refused');
  r = await tcall('set', { id: '../x' });
  ok(r.code === 400, 'a bad theme id is refused');
  r = await tcall('set', { accent: 'blue' });
  ok(r.code === 400, 'an accent must be a hex colour');
  r = await tcall('set', { id: 'bloom', accent: '#FF8A3D' });
  ok(
    th.resolved().vars['--acc'] === '#ff8a3d' &&
      th.resolved().vars['--acc-ink'] === '#0b0c10' &&
      th.resolved().vars['--focus'] === '#ff8a3d',
    "an accent overrides the theme's own, with readable text on it"
  );
  r = await tcall('revert');
  ok(r.j.current.id === 'bloom' || r.j.current.id === 'kid', 'revert goes back to the previous theme');
  ghUp = false;
  await th.refreshCatalogue(true);
  r = await tcall('list', null, 'GET');
  ok(
    r.j.catalogue.ok === false && r.j.catalogue.error && r.j.themes.some(x => x.id === 'bloom' && x.installed),
    'GitHub unreachable: the list shows the themes on the TV and says why'
  );
  r = await tcall('set', { id: 'bloom' });
  ok(r.code === 200 && r.j.current.id === 'bloom', 'GitHub unreachable: a downloaded theme can still be chosen');
  r = await tcall('set', { id: 'midnight' });
  ok(
    r.code === 502 && /could not download/.test(r.j.error),
    'GitHub unreachable: a theme that was never downloaded says it could not be downloaded'
  );
  gh.server.close();

  // the documentation table is generated from the schema; the service ships no themes
  const gen = require(path.join(root, 'tools', 'theme-docs.js')),
    docs = fs.readFileSync(path.join(root, 'docs', 'themes.md'), 'utf8');
  ok(docs.indexOf(gen.table()) >= 0, 'docs/themes.md holds the table generated from the schema (run: node tools/theme-docs.js)');
  const noComments = f => fs.readFileSync(path.join(root, f), 'utf8').replace(/#.*$/gm, '');
  ok(
    !/themes/.test(noComments('ipk/build.py')) && !/themes/.test(noComments('scripts/bootstrap.sh')),
    'the package build and the setup do not ship or copy themes'
  );
});
