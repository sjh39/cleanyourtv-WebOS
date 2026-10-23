// Checks that the service runs on the older Node.js of webOS 5 and 6 (8.x). Run with tools/node8-check.sh, or with any Node:
//   node tools/node8-check.js
// It parses every service file, loads the modules and runs the parts that used APIs Node 8 lacks (pairing code, URL and
// form handling, outgoing http requests, mkdir -p) against a local server. Nothing leaves this machine.
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), cp = require('child_process');
const root = path.join(__dirname, '..'), helper = path.join(root, 'helper');
let failed = 0;
const ok = (c, name) => { console.log((c ? 'ok   ' : 'FAIL ') + name); if (!c) failed++; };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cytv-n8-'));
process.env.CYTV_LIVE_DIR = path.join(tmp, 'live', 'deep');   // exercises mkdir -p as well
process.env.CYTV_DIR = path.join(tmp, 'cytv'); fs.mkdirSync(process.env.CYTV_DIR);
process.env.CYTV_SERVICE_DIR = path.join(tmp, 'svc'); fs.mkdirSync(process.env.CYTV_SERVICE_DIR);

// 1. syntax of everything that runs on the TV under Node
const files = fs.readdirSync(helper).filter(f => /\.js$/.test(f)).map(f => path.join(helper, f)).concat(path.join(root, 'scripts', 'jtool.js'));
for (const f of files) { const r = cp.spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' }); ok(r.status === 0, 'syntax ' + path.relative(root, f) + (r.status ? '\n' + r.stderr : '')); }

// 2. modules load (helper.js starts the service, so it is only parsed above)
for (const m of ['netcompat', 'notify', 'notifyapi', 'sharelog', 'picker', 'inputhook', 'manager', 'live', 'voice', 'theme']) { try { require(path.join(helper, m)); ok(true, 'loads ' + m); } catch (e) { ok(false, 'loads ' + m + ': ' + e.message); } }

const nc = require(path.join(helper, 'netcompat'));
const call = (fn, url, method, body) => new Promise((resolve, reject) => {
  let b = ''; const rq = nc.request(http, url, { method, headers: { 'content-type': 'application/x-www-form-urlencoded', 'content-length': Buffer.byteLength(body || '') }, timeout: 4000 }, r => { r.on('data', c => b += c); r.on('end', () => resolve({ status: r.statusCode, body: b })); });
  rq.on('error', reject); rq.end(body || '');
});
const fake = (url, method) => { const res = { code: 0, out: '', writeHead(c) { this.code = c; }, end(s) { this.out = s || ''; } }; return { req: { url, method: method || 'GET', headers: {} }, res }; };

(async () => {
  // 3. compatibility layer against a local server
  const srv = http.createServer((q, r) => { r.writeHead(200, { 'x-path': q.url, 'x-ua': q.headers['user-agent'] || '' });
    if (q.url === '/pl.m3u') return r.end('#EXTM3U\n#EXTINF:-1 group-title="G",Chan A\nhttp://127.0.0.1:1/live/u/p/1.m3u8\n');
    r.end(q.method); }).listen(0, '127.0.0.1');
  await new Promise(r => srv.on('listening', r));
  const port = srv.address().port;
  const g = await new Promise((resolve, reject) => nc.get(http, 'http://127.0.0.1:' + port + '/a/b?x=1#h', { headers: { 'User-Agent': 't' }, timeout: 3000 }, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => resolve({ r, b })); }).on('error', reject));
  ok(g.r.headers['x-path'] === '/a/b?x=1' && g.r.headers['x-ua'] === 't' && g.b === 'GET', 'http get with an address and options');
  const d = path.join(tmp, 'a', 'b', 'c'); nc.mkdirp(d); nc.mkdirp(d); ok(fs.existsSync(d), 'mkdir -p');
  ok(new nc.URLSearchParams('a=1&b=x').get('b') === 'x' && new nc.URL('http://h/p?q=1').searchParams.get('q') === '1', 'URL and URLSearchParams');
  let lo = 1e9, hi = -1, all = true; for (let i = 0; i < 3000; i++) { const n = nc.randomInt(100000, 1000000); if (n < 100000 || n >= 1000000 || n !== Math.floor(n)) all = false; lo = Math.min(lo, n); hi = Math.max(hi, n); }
  ok(all && hi - lo > 800000, 'randomInt stays in range and spreads');
  const dice = [0, 0, 0, 0, 0, 0]; for (let i = 0; i < 6000; i++) dice[nc.randomInt(0, 6)]++; ok(dice.every(c => c > 800 && c < 1200), 'randomInt is evenly spread');

  // 4. Live TV pairing end to end: code, form post, playlist fetch
  const live = require(path.join(helper, 'live'));
  let f = fake('/api/live/pair', 'POST'); await live.handle(f.req, f.res, '/api/live/pair', async () => ({}));
  const pairInfo = JSON.parse(f.res.out); ok(/^\d{6}$/.test(String(pairInfo.code)) && /^http:\/\//.test(pairInfo.url), 'live pairing gives a 6 digit code and an address');
  const pairUrl = new nc.URL(pairInfo.url);
  const wrong = await call(null, 'http://127.0.0.1:' + pairUrl.port + '/set', 'POST', 'code=000000&playlist=' + encodeURIComponent('http://127.0.0.1:' + port + '/pl.m3u'));
  ok(wrong.status === 403, 'a wrong code is refused');
  const saved = await call(null, 'http://127.0.0.1:' + pairUrl.port + '/set', 'POST', 'code=' + pairInfo.code + '&epg=&playlist=' + encodeURIComponent('http://127.0.0.1:' + port + '/pl.m3u'));
  ok(saved.status === 200, 'the right code saves the playlist address');
  let n = 0; for (let i = 0; i < 40 && !n; i++) { await new Promise(r => setTimeout(r, 150)); f = fake('/api/live/channels'); await live.handle(f.req, f.res, '/api/live/channels', async () => ({})); n = (JSON.parse(f.res.out).channels || []).length; }
  ok(n === 1, 'the playlist is fetched and parsed');
  f = fake('/api/live/reset', 'POST'); await live.handle(f.req, f.res, '/api/live/reset', async () => ({}));

  // 5. version comparison used by the updater
  const { cmp } = require(path.join(helper, 'manager')); ok(cmp('1.5.10', '1.5.9') > 0 && cmp('1.5.3', '1.5.3') === 0 && cmp('1.4.9', '1.5.0') < 0, 'version compare');

  // 6. update channels: stable release or a test build, against a mock of the GitHub API
  const rel = (tag, ver, fe, body, pre) => ({ tag_name: tag, name: pre ? 'Test build: ' + tag.replace(/^test-/, '') : tag, prerelease: !!pre, body, published_at: '2026-10-23T10:00:00Z', assets: [].concat(...['com.cleanyourtv.manager_' + ver + '_all.ipk', 'frontend-' + fe + '.tgz'].map(n => [{ name: n, browser_download_url: 'http://x/' + n }, { name: n + '.sha256', browser_download_url: 'http://x/' + n + '.sha256' }])) });
  const api = http.createServer((q, r) => {
    const send = o => { r.writeHead(o ? 200 : 404, { 'content-type': 'application/json' }); r.end(JSON.stringify(o || {})); };
    if (q.url === '/repos/o/r/releases/latest') return send(rel('v1.5.3', '1.5.3', '1.4.5', 'stable'));
    if (q.url === '/repos/o/r/releases/tags/test-foo-bar') return send(rel('test-foo-bar', '1.5.4', '1.4.6', 'build: abc1234\nbranch: foo/bar', true));
    if (q.url === '/repos/o/r/releases?per_page=40') return send([rel('test-foo-bar', '1.5.4', '1.4.6', 'build: abc1234\nbranch: foo/bar', true), rel('v1.5.3', '1.5.3', '1.4.5', 'stable'), rel('test-main', '9.9.9', '9.9.9', 'x', false)]);
    send(null); }).listen(0, '127.0.0.1');
  await new Promise(r => api.on('listening', r));
  process.env.CYTV_API = 'http://127.0.0.1:' + api.address().port;
  fs.writeFileSync(path.join(process.env.CYTV_DIR, 'source'), 'o/r main\n');
  const mgr = require(path.join(helper, 'manager'));
  let m;   // the service reads its own version when it starts, so each scenario starts one
  const start = v => { m = mgr.create({ luna: async () => ({}), readConf: () => ({}), writeConf() {}, inputhook: { status: () => ({}), ensure() {} }, VERSION: v, pickerShown: () => 0 }); };
  const ask = async (act, method, body) => { const x = fake('/api/manager/' + act, method); await m.handle(x.req, x.res, '/api/manager/' + act, async () => body || {}); return { code: x.res.code, j: JSON.parse(x.res.out) }; };
  const bf = path.join(process.env.CYTV_DIR, 'BUILD');
  start('1.5.2'); let r = await ask('check', 'POST'); ok(r.j.service.updateTo === '1.5.3' && r.j.channel === '', 'stable: offers the newer release');
  start('1.5.3'); r = await ask('check', 'POST'); ok(r.j.service.updateTo === null, 'stable: nothing to offer at the same version');
  r = await ask('tests', 'GET'); ok(r.j.builds.length === 1 && r.j.builds[0].tag === 'test-foo-bar' && r.j.builds[0].build === 'abc1234' && r.j.builds[0].service === '1.5.4', 'the list holds pre-releases named test-* only');
  r = await ask('channel', 'POST', { tag: 'test-../x' }); ok(r.code === 400, 'a bad channel name is refused');
  r = await ask('channel', 'POST', { tag: 'test-foo-bar' }); ok(r.j.channel === 'test-foo-bar' && r.j.service.updateTo === '1.5.4' && r.j.release.test === true, 'a test channel offers the test build');
  start('1.5.4'); fs.writeFileSync(bf, 'abc1234\n'); r = await ask('check', 'POST'); ok(r.j.service.updateTo === null && r.j.service.build === 'abc1234', 'the same build is not offered again');
  fs.writeFileSync(bf, 'def5678\n'); r = await ask('check', 'POST'); ok(r.j.service.updateTo === '1.5.4', 'another commit of the same version is offered');
  r = await ask('channel', 'POST', { tag: '' }); ok(r.j.channel === '' && r.j.service.updateTo === '1.5.3', 'back on stable after a test build offers the stable release, even an older one');
  fs.unlinkSync(bf); start('1.5.3'); r = await ask('check', 'POST'); ok(r.j.service.updateTo === null, 'stable without a test build installed: no offer at the same version');

  // 7. Home Assistant (Assist): a mock server for success, not understood, bad token, unreachable and slow answers
  const haLog = [], TOKEN = 'secret-ha-token-123';
  const haSrv = http.createServer((q, r) => {
    let b = ''; q.on('data', c => b += c); q.on('end', () => {
      const send = (c, o) => { r.writeHead(c, { 'content-type': 'application/json' }); r.end(JSON.stringify(o)); };
      if (q.headers.authorization !== 'Bearer ' + TOKEN) return send(401, { message: '401: Unauthorized' });
      if (q.url === '/api/config') return send(200, { location_name: 'Home', version: '2026.10.0' });
      if (q.url === '/api/states') return send(200, [{ entity_id: 'light.x', attributes: {} }, { entity_id: 'conversation.home_assistant', attributes: { friendly_name: 'Home Assistant' } }, { entity_id: 'conversation.llm', attributes: {} }]);
      if (q.url !== '/api/conversation/process') return send(404, {});
      const o = JSON.parse(b); haLog.push(o);
      const reply = (type, speech, code) => send(200, { conversation_id: 'conv-1', response: { response_type: type, data: code ? { code } : {}, speech: { plain: { speech } } } });
      if (o.text === 'turn on the light') return reply('action_done', 'Turned on the light');
      if (o.text === 'quiet') return reply('action_done', '');
      if (o.text === 'slow') return setTimeout(() => reply('query_answer', 'Finally'), 600);
      reply('error', 'Sorry, I couldn\'t understand that', 'no_intent_match');
    });
  }).listen(0, '127.0.0.1');
  const orSrv = http.createServer((q, r) => { let b = ''; q.on('data', c => b += c); q.on('end', () => { r.writeHead(200, { 'content-type': 'application/json' }); r.end(JSON.stringify({ choices: [{ message: { content: 'The AI says hello' } }] })); }); }).listen(0, '127.0.0.1');
  await Promise.all([haSrv, orSrv].map(x => new Promise(r => x.on('listening', r))));
  process.env.CYTV_OPENROUTER = 'http://127.0.0.1:' + orSrv.address().port;
  const voice = require(path.join(helper, 'voice'));
  let vconf = {}; const cards = [];
  const v = voice.create({ readConf: () => JSON.parse(JSON.stringify(vconf)), writeConf: c => { vconf = JSON.parse(JSON.stringify(c)); }, notify: { show: async o => { cards.push(o); } } });
  const vask = async (act, body, method) => { const x = fake('/api/voice/' + act, method || 'POST'); await v.handle(x.req, x.res, '/api/voice/' + act, async () => body || {}); return { code: x.res.code, j: JSON.parse(x.res.out || '{}') }; };
  const haUrl = 'http://127.0.0.1:' + haSrv.address().port;
  r = await vask('set', { ha: { url: 'ftp://x' } }); ok(r.code === 400, 'a Home Assistant address that is not http(s) is refused');
  r = await vask('set', { ha: { route: 'sideways' } }); ok(r.code === 400, 'an unknown routing is refused');
  r = await vask('set', { ha: { url: haUrl + '/', token: 'wrong' } }); ok(r.code === 200 && r.j.ha.url === haUrl && r.j.ha.route === 'ha-first', 'the address is stored without a trailing slash; the default routing is Home Assistant first');
  ok(JSON.stringify(r.j).indexOf('wrong') < 0 && r.j.ha.hasToken === true, 'the status never contains the token');
  r = await vask('ha-test'); ok(r.code === 502 && /refused the access token/.test(r.j.error), 'a bad token is reported');
  await vask('set', { ha: { token: TOKEN } });
  r = await vask('ha-test'); ok(r.j.name === 'Home' && r.j.version === '2026.10.0', 'test connection reads the name and version');
  r = await vask('ha-agents'); ok(r.j.agents.length === 2 && r.j.agents[0].id === 'conversation.home_assistant' && r.j.agents[0].name === 'Home Assistant', 'agents are the conversation.* entities');
  r = await vask('ask', { text: 'turn on the light', card: false }); ok(r.j.answer === 'Turned on the light' && r.j.via === 'ha', 'Assist answers an understood command');
  r = await vask('ask', { text: 'quiet', card: false }); ok(r.j.answer === 'Done', 'an action without speech shows Done');
  ok(haLog[1].conversation_id === 'conv-1' && !haLog[0].conversation_id, 'the conversation id is passed on to the next request');
  r = await vask('ask', { text: 'slow', card: false }); ok(r.j.answer === 'Finally', 'a slow answer is waited for');
  r = await vask('ask', { text: 'what is love', card: false }); ok(r.j.answer === 'Sorry, I couldn\'t understand that' && r.j.via === 'ha', 'not understood and no AI: Assist\'s own message is shown');
  await vask('set', { llm: { key: 'sk-test', enabled: true } });
  r = await vask('ask', { text: 'what is love', card: false }); ok(r.j.answer === 'The AI says hello' && r.j.via === 'ai', 'not understood: the same text goes to the AI');
  r = await vask('ask', { text: 'turn on the light', card: false }); ok(r.j.via === 'ha', 'understood: the AI is not asked');
  await vask('set', { ha: { route: 'ha-only' } });
  r = await vask('ask', { text: 'what is love', card: false }); ok(r.j.via === 'ha' && /couldn't understand/.test(r.j.answer), 'Home Assistant only: never the AI');
  await vask('set', { ha: { route: 'ai-only' } }); const n0 = haLog.length;
  r = await vask('ask', { text: 'turn on the light', card: false }); ok(r.j.via === 'ai' && haLog.length === n0, 'AI only: Home Assistant is not asked');
  await vask('set', { ha: { route: 'ha-first', agent: 'conversation.llm' } });
  await vask('ask', { text: 'turn on the light', card: false }); ok(haLog[haLog.length - 1].agent_id === 'conversation.llm', 'the chosen agent is sent');
  await vask('set', { ha: { agent: '' } }); await vask('forget'); await vask('ask', { text: 'turn on the light', card: false }); ok(!haLog[haLog.length - 1].conversation_id && !('agent_id' in haLog[haLog.length - 1]), 'forgetting starts a new conversation; no agent means the default');
  r = await vask('set', { ha: { url: 'http://127.0.0.1:1' } }); r = await vask('ask', { text: 'turn on the light', card: false }); ok(r.j.answer === 'The AI says hello' && r.j.via === 'ai', 'Home Assistant unreachable: the AI answers');
  await vask('set', { llm: { clearKey: true } }); r = await vask('ask', { text: 'turn on the light', card: false }); ok(!r.j.answer && /Home Assistant:/.test(r.j.error), 'Home Assistant unreachable and no AI: the error is reported');
  await vask('set', { ha: { clear: true } }); r = await vask('status', null, 'GET'); ok(r.j.ha.configured === false && r.j.ha.hasToken === false, 'removing Home Assistant clears the address and token');
  haSrv.close(); orSrv.close();
  // 8. Themes: bundled files are valid, values are whitelisted and clamped, set / revert work, wallpapers only from the bundled folder
  const themeMod = require(path.join(helper, 'theme')), tdir = path.join(helper, 'themes');
  const bundled = fs.readdirSync(tdir).filter(n => /\.json$/.test(n));
  ok(bundled.length >= 5 && bundled.indexOf('classic.json') >= 0, 'themes are bundled with the package');
  let allOk = true; for (const n of bundled) { const raw = JSON.parse(fs.readFileSync(path.join(tdir, n), 'utf8')), t = themeMod.normalize(raw, n.replace(/\.json$/, '')); if (!t || (raw.effects && raw.effects.wallpaper && t.effects.wallpaper !== raw.effects.wallpaper)) { allOk = false; console.log('  invalid theme file ' + n); } }
  ok(allOk, 'every bundled theme file is valid and its wallpaper is accepted');
  const bad = themeMod.normalize({ name: 'x'.repeat(500), colors: { night: 'red; background:url(//evil)', ink: '#12345', accent: 5 }, layout: { cols: 99, tileH: -5, fontScale: '2', clock: 'sideways', tileRadius: 1e9 }, effects: { glow: 7, speed: NaN, wallpaper: '../../etc/passwd', wallpaperDim: 5 }, css: 'body{display:none}' }, 'evil');
  ok(bad.name.length === 40 && bad.colors.night === '#07080b' && bad.colors.ink === '#f5f6f8' && bad.colors.accent === '#f5f6f8', 'colours must be #rrggbb, anything else falls back');
  ok(bad.layout.cols === 12 && bad.layout.tileH === 90 && bad.layout.fontScale === 1 && bad.layout.clock === 'left' && bad.layout.tileRadius === 80, 'layout numbers are clamped and enums checked');
  ok(bad.effects.glow === 1 && bad.effects.speed === 1 && bad.effects.wallpaper === '' && bad.effects.wallpaperDim === 0.9 && !('css' in bad), 'effects are clamped, a wallpaper path is refused and unknown keys are dropped');
  ok(themeMod.normalize({}, '../x') === null, 'a bad theme id is refused');
  let tconf = {}; const th = themeMod.create({ readConf: () => JSON.parse(JSON.stringify(tconf)), writeConf: c => { tconf = JSON.parse(JSON.stringify(c)); } });
  const tcall = async (act, body, method) => { const x = fake('/api/theme/' + act, method || 'POST'); await th.handle(x.req, x.res, '/api/theme/' + act, async () => body || {}); return { code: x.res.code, j: x.res.out && x.res.out[0] === '{' ? JSON.parse(x.res.out) : x.res.out }; };
  r = await tcall('list', null, 'GET'); ok(r.j.current.id === 'classic' && r.j.themes.length === bundled.length && r.j.previous === null, 'the default theme is classic');
  ok(th.resolved().vars['--cols'] === '10' && th.resolved().vars['--tile-h'] === '151px' && th.resolved().vars['--acc'] === '#f5f6f8', 'classic resolves to the original look');
  r = await tcall('set', { id: 'nope' }); ok(r.code === 400, 'an unknown theme is refused');
  r = await tcall('set', { id: 'compact' }); ok(r.j.current.id === 'compact' && r.j.previous.id === 'classic' && th.resolved().cols === 12, 'choosing a theme applies it and remembers the previous one');
  r = await tcall('set', { accent: 'blue' }); ok(r.code === 400, 'an accent must be a hex colour');
  r = await tcall('set', { accent: '#FF8A3D' }); ok(th.resolved().vars['--acc'] === '#ff8a3d' && th.resolved().vars['--acc-ink'] === '#0b0c10', 'an accent overrides the theme\'s own, with readable text on it');
  r = await tcall('set', { id: 'midnight' }); ok(r.j.current.accent === '' && th.resolved().wallpaper && th.resolved().wallpaper.file === 'midnight.jpg', 'a new theme brings its own accent and wallpaper');
  r = await tcall('revert'); ok(r.j.current.id === 'compact', 'revert goes back to the previous theme');
  r = await tcall('wallpaper/midnight.jpg', null, 'GET'); ok(r.code === 200, 'a bundled wallpaper is served');
  r = await tcall('wallpaper/notused.jpg', null, 'GET'); ok(r.code === 404, 'a file no theme uses is not served');
  r = await tcall('wallpaper/..%2f..%2fpasswd', null, 'GET'); ok(r.code === 404, 'a path is not served as a wallpaper');

  console.log(failed ? '\n' + failed + ' check(s) failed on Node ' + process.version : '\nall checks passed on Node ' + process.version);
  fs.rmSync ? fs.rmSync(tmp, { recursive: true, force: true }) : cp.spawnSync('rm', ['-rf', tmp]);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('error:', e); process.exit(1); });
