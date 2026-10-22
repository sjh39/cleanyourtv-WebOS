// Keeps the Inputs picker overlay app (com.cleanyourtv.picker) running hidden. A cold start takes ~8 s before the app
// gets the remote; once running, every press only wakes it. Starts it after boot and again if the system closes it.
const PICKER = 'com.cleanyourtv.picker';
function start(luna, enabled) {
  let fails = 0;
  async function tick() {
    try {
      if (!enabled()) return true;
      const pw = await luna('luna://com.webos.service.tvpower/power/getPowerState', {});
      if (pw.state && !['Active', 'Screen Saver'].includes(pw.state)) return true;   // not while in standby
      const run = await luna('luna://com.webos.applicationManager/running', {});
      if (!Array.isArray(run.running)) return false;
      if (run.running.some(a => a.id === PICKER)) { fails = 0; return true; }
      if (!(await luna('luna://com.webos.applicationManager/getAppInfo', { id: PICKER })).returnValue) return false;   // not installed (yet)
      if (fails++ > 5) return true;   // something keeps killing it; stop trying until restart
      await luna('luna://com.webos.applicationManager/launch', { id: PICKER, params: { prewarm: true } });
      return false;
    } catch (e) { console.error('picker keepalive:', e.message); return false; }
  }
  // quickly after boot until it is up, then now and then
  let fast = 0;
  const loop = async () => { const up = await tick(); if (up) fast = 0; setTimeout(loop, up || fast++ > 40 ? 30000 : 4000); };
  setTimeout(loop, 2000);
}
module.exports = { start };
