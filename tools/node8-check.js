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

  console.log(failed ? '\n' + failed + ' check(s) failed on Node ' + process.version : '\nall checks passed on Node ' + process.version);
  fs.rmSync ? fs.rmSync(tmp, { recursive: true, force: true }) : cp.spawnSync('rm', ['-rf', tmp]);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('error:', e); process.exit(1); });
