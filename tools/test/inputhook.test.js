// The input hook (inputhook.js): which of LG's processes it goes into (issue 23: hooked into micomservice, HDMI-CEC control of
// other devices and eARC stopped working).
const fs = require('fs'),
  path = require('path');
const { ok, req, run } = require('./lib');

const PROC = process.env.CYTV_PROC;
const proc = (pid, name) => {
  fs.mkdirSync(path.join(PROC, String(pid)));
  fs.writeFileSync(path.join(PROC, String(pid), 'comm'), name + '\n');
};

run(async () => {
  const hook = req('inputhook');
  proc(100, 'micomservice');
  proc(200, 'lginput2');
  proc(300, 'tvservice');
  proc(400, 'bash');
  let p = hook.procs();
  ok(
    p.length === 1 && p[0].name === 'lginput2',
    "where LG's input service runs, the hook goes only into lginput2, never into micomservice"
  );
  fs.unlinkSync(path.join(PROC, '200', 'comm'));
  fs.rmdirSync(path.join(PROC, '200'));
  p = hook.procs();
  ok(
    p
      .map(x => x.name)
      .sort()
      .join() === 'micomservice,tvservice',
    'firmware without lginput2: the other input processes, as before'
  );
});
