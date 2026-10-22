// Input key: injects the bundled inputhook (see third-party/inputhook) into LG's input processes and binds the remote's
// Input button (id 241) to scripts/inputkey.sh, which opens the Inputs picker overlay. Removing our bind gives the key
// back to LG's own picker. Other binds in keybinds.json are left alone.
const fs = require('fs'), cp = require('child_process');
const D = '/media/developer/cleanyourtv', HOOK = D + '/inputhook', CFGDIR = '/home/root/.config/lginputhook', BINDS = CFGDIR + '/keybinds.json';
const TARGETS = ['RELEASE', 'lginput2', 'micomservice', 'tvservice', 'testapp'];
const KEY = '241', COMMAND = 'sh ' + D + '/inputkey.sh';
const ENV = Object.assign({}, process.env, { PATH: '/usr/bin:/usr/sbin:/bin:/sbin:' + (process.env.PATH || '') });

function procs() {
  const out = [];
  for (const p of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(p)) continue;
    try { const n = fs.readFileSync('/proc/' + p + '/comm', 'utf8').trim(); if (TARGETS.includes(n)) out.push({ pid: p, name: n }); } catch (_) {}
  }
  return out;
}
const hooked = pid => { try { return fs.readFileSync('/proc/' + pid + '/maps', 'utf8').includes('libinputhookpp'); } catch (_) { return false; } };

function writeBinds(on) {
  let b = {};
  try { b = JSON.parse(fs.readFileSync(BINDS, 'utf8')); } catch (_) {}
  const before = JSON.stringify(b);
  if (on) b[KEY] = { action: 'exec', command: COMMAND };
  else if (b[KEY] && b[KEY].command === COMMAND) delete b[KEY];
  if (JSON.stringify(b) === before) return;
  fs.mkdirSync(CFGDIR, { recursive: true });
  fs.writeFileSync(BINDS + '.tmp', JSON.stringify(b)); fs.renameSync(BINDS + '.tmp', BINDS);
}

let busy = false;
// Idempotent: call at start and every so often (LG's input service restarts now and then and loses the hook).
function ensure(enabled) {
  try { writeBinds(enabled); } catch (e) { console.error('inputhook: keybinds:', e.message); }
  if (!enabled || busy || !fs.existsSync(HOOK + '/ezinject')) return;
  const todo = procs().filter(p => !hooked(p.pid));
  if (!todo.length) return;
  busy = true;
  try { fs.chmodSync(HOOK + '/ezinject', 0o755); } catch (_) {}
  let left = todo.length;
  for (const p of todo) {
    const log = '/tmp/lginput-hook-' + p.name + '.log';
    try { fs.writeFileSync(log, ''); } catch (_) {}
    cp.execFile(HOOK + '/ezinject', ['-l', log, p.pid, HOOK + '/libinputhookpp.so'], { env: ENV, timeout: 20000 }, e => {
      if (e) console.error('inputhook: inject ' + p.name + ':', e.message);
      if (--left === 0) busy = false;
    });
  }
}
const status = () => ({ hooked: procs().filter(p => ['lginput2', 'micomservice'].includes(p.name)).every(p => hooked(p.pid)) && procs().length > 0,
  bound: (() => { try { const b = JSON.parse(fs.readFileSync(BINDS, 'utf8')); return !!(b[KEY] && b[KEY].command === COMMAND); } catch (_) { return false; } })() });
module.exports = { ensure, status };
