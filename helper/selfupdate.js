#!/usr/bin/env node
// Standalone updater for the CleanYourTV package, run as root by the manager app when the service is not running (for
// example before the setup, or when the setup failed). It does not need the service.
//   node selfupdate.js check      prints {installed, latest, updateTo} as JSON
//   node selfupdate.js install    downloads the latest package, checks its SHA-256, installs it; if the TV is already set up it
//                                 also restarts the service on the new files. Progress lines end with DONE or ERROR.
const fs = require('fs'),
  cp = require('child_process');
const { fetch, cmp } = require('./manager');
const D = '/media/developer/cleanyourtv',
  SVC = '/media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service';
const DEFAULT_REPO = 'lasharor/cleanyourtv-WebOS',
  TMP = '/tmp/cytv-self.ipk';
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });
const say = m => console.log(m);
const readJson = (f, d) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (_) {
    return d;
  }
};
const installedVersion = () => {
  try {
    return (/const VERSION = '([^']+)'/.exec(fs.readFileSync(SVC + '/helper/helper.js', 'utf8')) || [])[1] || '0';
  } catch (_) {
    return '0';
  }
};
function releaseUrl() {
  const c = readJson(D + '/config.json', {});
  if (c.releasesUrl) return c.releasesUrl;
  let src = '';
  try {
    src = fs
      .readFileSync(D + '/source', 'utf8')
      .trim()
      .split(/\s+/)[0];
  } catch (_) {}
  return 'https://api.github.com/repos/' + (/^[\w.-]+\/[\w.-]+$/.test(src) ? src : DEFAULT_REPO) + '/releases/latest';
}
async function latest() {
  const j = JSON.parse((await fetch(releaseUrl())).toString()),
    assets = {};
  for (const a of j.assets || []) assets[a.name] = a.browser_download_url;
  for (const n of Object.keys(assets)) {
    const m = /^com\.cleanyourtv\.manager_(\d+\.\d+\.\d+)_all\.ipk$/.exec(n);
    if (m && assets[n + '.sha256']) return { version: m[1], url: assets[n], shaUrl: assets[n + '.sha256'], name: n };
  }
  throw new Error('the latest release has no package with a checksum');
}
const luna = (uri, payload) =>
  new Promise(res =>
    cp.execFile('luna-send', ['-n', '1', '-w', '5000', uri, JSON.stringify(payload)], { env: ENV, timeout: 40000 }, (e, out) => {
      try {
        res(JSON.parse(out));
      } catch (_) {
        res({ returnValue: false });
      }
    })
  );

async function check() {
  const inst = installedVersion();
  try {
    const l = await latest();
    console.log(JSON.stringify({ installed: inst, latest: l.version, updateTo: cmp(l.version, inst) > 0 ? l.version : null }));
  } catch (e) {
    console.log(JSON.stringify({ installed: inst, error: String(e.message || e) }));
  }
}
async function install() {
  try {
    const inst = installedVersion(),
      l = await latest();
    say('installed ' + inst + ', latest ' + l.version);
    if (cmp(l.version, inst) <= 0) {
      say('DONE already up to date');
      return;
    }
    say('downloading ' + l.name);
    const want = (await fetch(l.shaUrl)).toString().trim().split(/\s+/)[0].toLowerCase();
    const got = (await fetch(l.url, TMP)).sha256;
    if (!/^[0-9a-f]{64}$/.test(want) || got !== want) {
      try {
        fs.unlinkSync(TMP);
      } catch (_) {}
      throw new Error('the package does not match its checksum; nothing was installed');
    }
    say('installing ' + l.version);
    const r = await luna('luna://com.webos.appInstallService/dev/install', {
      id: 'com.cleanyourtv.manager',
      ipkUrl: TMP,
      subscribe: false,
    });
    if (!r.returnValue) throw new Error('the system refused the install');
    let ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      await new Promise(r2 => setTimeout(r2, 3000));
      ok = installedVersion() === l.version && fs.existsSync(SVC + '/bootstrap.sh');
    }
    if (!ok) throw new Error('the install did not finish');
    try {
      fs.unlinkSync(TMP);
    } catch (_) {}
    if (fs.existsSync(D + '/helper.js') && fs.existsSync('/var/lib/webosbrew/init.d/10-cleanyourtv-home')) {
      say('restarting the service');
      const out = cp.spawnSync('sh', [SVC + '/bootstrap.sh', 'update', l.version], { env: ENV, encoding: 'utf8', timeout: 240000 });
      say(
        String(out.stdout || '')
          .trim()
          .split('\n')
          .slice(-3)
          .join('\n')
      );
      if (out.status !== 0) throw new Error('the new service did not start; the previous files were restored');
    }
    say('DONE updated to ' + l.version + '. Close CleanYourTV and open it again.');
  } catch (e) {
    say('ERROR ' + String(e.message || e));
    process.exitCode = 1;
  }
}
if (process.argv[2] === 'check') check();
else if (process.argv[2] === 'install') install();
else {
  console.log('usage: node selfupdate.js check|install');
  process.exit(2);
}
