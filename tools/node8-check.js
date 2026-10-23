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
for (const m of ['netcompat', 'notify', 'notifyapi', 'sharelog', 'picker', 'inputhook', 'manager', 'live']) { try { require(path.join(helper, m)); ok(true, 'loads ' + m); } catch (e) { ok(false, 'loads ' + m + ': ' + e.message); } }

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

  // 4b. playlist details: quality, country, language, flags, categories, merged streams
  const pl = live.parseM3U(['#EXTM3U',
    '#EXTINF:-1 tvg-id="CNN.us@SD" tvg-country="US" tvg-language="English" group-title="News;World",CNN (480p)', 'http://h/a1.m3u8',
    '#EXTINF:-1 tvg-id="CNN.us@HD" group-title="News;World",CNN HD', 'http://h/a2.m3u8',
    '#EXTINF:-1 tvg-id="Foo.nl" group-title="Kids",Foo [Geo-blocked]', 'http://h/b.m3u8',
    '#EXTGRP:Sport', '#EXTINF:-1,Bar 4K [Not 24/7]', '#EXTVLCOPT:http-user-agent=X', 'http://h/c.m3u8|User-Agent=Y',
    '#EXTINF:-1,#### SEPARATOR ####', 'http://h/x',
    '#EXTINF:-1 tvg-id="" group-title="",Same', 'http://h/d.m3u8', '#EXTINF:-1 tvg-id="" group-title="",Same', 'http://h/e.m3u8'].join('\n'));
  const [cnn, foo, bar, same1, same2] = pl.channels;
  ok(pl.v === 2 && pl.channels.length === 5 && pl.channels.map(c => c.num).join() === '1,2,3,4,5', 'playlist: five channels, separators skipped, numbers in order');
  ok(cnn.alt.length === 1 && cnn.alt[0].url === 'http://h/a2.m3u8' && cnn.alt[0].q === 'HD' && cnn.q === 'SD', 'playlist: the same channel id with @SD/@HD is one channel with another stream');
  ok(cnn.cc === 'US' && cnn.lang === 'English' && cnn.cats.join() === 'News,World' && pl.groups.join() === 'News,World,Kids,Sport', 'playlist: country, language and several categories');
  ok(foo.fl === 1 && foo.cc === 'NL' && bar.fl === 6 && bar.q === '4K' && bar.group === 'Sport', 'playlist: geo-blocked, part-time and header markers, quality, #EXTGRP');
  ok(new Set(pl.channels.map(c => c.key)).size === 5 && /^[0-9a-f]{10}$/.test(cnn.key), 'playlist: every channel has its own key');

  // 4c. what the viewer did is kept in the service
  const st = async (b) => { const x = fake('/api/live/state', 'POST'); await live.handle(x.req, x.res, '/api/live/state', async () => b); return x.res.code; };
  const getSt = async () => { const x = fake('/api/live/state'); await live.handle(x.req, x.res, '/api/live/state', async () => ({})); return JSON.parse(x.res.out); };
  const k1 = 'abcdef0123', k2 = 'abcdef0124';
  await st({ op: 'fav', key: k1, on: true }); await st({ op: 'fav', key: k2, on: true }); await st({ op: 'fav', key: k1, on: false });
  await st({ op: 'recent', key: k1 }); await st({ op: 'recent', key: k2 }); await st({ op: 'recent', key: k1 }); await st({ op: 'failed', key: k2, on: true });
  let sv = await getSt(); ok(sv.fav.join() === k2 && sv.recent.join() === k1 + ',' + k2 && !!sv.failed[k2], 'state: favourites, recents (newest first) and failed channels');
  ok(await st({ op: 'fav', key: '../x', on: true }) === 400 && await st({ op: 'nope', key: k1 }) === 400, 'state: bad keys and operations are refused');
  for (let i = 0; i < 40; i++) await st({ op: 'recent', key: ('0000000000' + i.toString(16)).slice(-10) }); sv = await getSt(); ok(sv.recent.length === 30, 'state: recents are capped');
  await new Promise(r => setTimeout(r, 1300)); ok(JSON.parse(fs.readFileSync(path.join(process.env.CYTV_LIVE_DIR, 'state.json'), 'utf8')).fav.join() === k2, 'state: written to the live folder');

  // 4d. why a stream does not play
  const big = Buffer.alloc(9000, 1);
  const ps = http.createServer((q, r) => {
    const t = (c, type, body) => { r.writeHead(c, type ? { 'content-type': type } : {}); r.end(body || ''); };
    if (q.url === '/ok.ts') return t(200, 'video/mp2t', big);
    if (q.url === '/hls.m3u8') return t(200, 'application/vnd.apple.mpegurl', '#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:10,\nseg.ts\n');
    if (q.url === '/drm.m3u8') return t(200, 'application/x-mpegurl', '#EXTM3U\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://x",KEYFORMAT="com.apple.streamingkeydelivery"\n#EXTINF:10,\nseg.ts\n');
    if (q.url === '/page') return t(200, 'text/html', '<!doctype html><title>login</title>');
    if (q.url === '/go') { r.writeHead(302, { location: '/ok.ts' }); return r.end(); }
    if (q.url === '/forbidden') return t(403);
    if (q.url === '/missing') return t(404);
    if (q.url === '/boom') return t(502);
    t(200, 'video/mp2t', big);
  }).listen(0, '127.0.0.1'); await new Promise(r => ps.on('listening', r));
  const pp = 'http://127.0.0.1:' + ps.address().port, why = async u => (await live.probe(u)).reason;
  const got = [await why(pp + '/ok.ts'), await why(pp + '/hls.m3u8'), await why(pp + '/drm.m3u8'), await why(pp + '/page'), await why(pp + '/go'), await why(pp + '/forbidden'), await why(pp + '/missing'), await why(pp + '/boom'), await why('http://127.0.0.1:1/x')];
  ok(got.join() === 'ok,ok,drm,notvideo,ok,refused,gone,server,unreachable', 'probe: ok, ok, drm, not a video, redirect followed, refused, gone, server error, unreachable (' + got.join() + ')');
  f = fake('/api/live/probe?key=zzzzzzzzzz&i=0'); await live.handle(f.req, f.res, '/api/live/probe', async () => ({})); ok(f.res.code === 404, 'probe: only streams of the playlist are asked about');
  ps.close();
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

  // 7. Live TV is optional: the option is stored and the key binds are refreshed
  let store = {}, ensured = 0;
  m = mgr.create({ luna: async () => ({}), readConf: () => JSON.parse(JSON.stringify(store)), writeConf: c => { store = JSON.parse(JSON.stringify(c)); }, inputhook: { status: () => ({}), ensure() { ensured++; } }, VERSION: '1.5.8', pickerShown: () => 0 });
  r = await ask('status', 'GET'); ok(r.j.options.liveTv === true && r.j.keys.guide === '', 'Live TV is on by default and no Guide key is learned');
  r = await ask('options', 'POST', { liveTv: false }); ok(r.j.options.liveTv === false && store.options.liveTv === false && ensured > 0, 'switching Live TV off is stored and refreshes the key binds');
  r = await ask('options', 'POST', { liveTv: 'no' }); ok(r.j.options.liveTv === false, 'only a boolean changes the option');
  r = await ask('options', 'POST', { liveTv: true }); ok(r.j.options.liveTv === true, 'switching Live TV on again');

  console.log(failed ? '\n' + failed + ' check(s) failed on Node ' + process.version : '\nall checks passed on Node ' + process.version);
  fs.rmSync ? fs.rmSync(tmp, { recursive: true, force: true }) : cp.spawnSync('rm', ['-rf', tmp]);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('error:', e); process.exit(1); });
