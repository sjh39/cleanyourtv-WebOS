// Keeps the Inputs picker overlay app (com.cleanyourtv.picker) running hidden. A cold start takes ~8 s before the app
// gets the remote; once running, every press only wakes it. Starts it after boot and again if the system closes it.
// Some firmware (webOS 6.5 reports) closes a hidden app straight away, which made every attempt show the loading circle and
// grab the remote. So the start is checked: when the system closed the picker twice, prewarming is switched off for good (saved in
// config.json as picker.prewarm: false, with the reason) and the Input key starts the picker only when pressed.
const PICKER = 'com.cleanyourtv.picker';
const CHECK_MS = 20000, STRIKES = 2;
// store: { get() -> the saved {prewarm, reason, at}, set(obj) }
function make(luna, enabled, store, now) {
  now = now || Date.now;
  let strikes = 0, launchedAt = 0, awaiting = false;
  const st = () => { try { return (store && store.get()) || {}; } catch (_) { return {}; } };
  async function tick() {
    try {
      if (!enabled()) return true;
      if (st().prewarm === false) return true;   // switched off, by the user or after the system kept closing it
      const pw = await luna('luna://com.webos.service.tvpower/power/getPowerState', {});
      if (pw.state && !['Active', 'Screen Saver'].includes(pw.state)) return true;   // not while in standby
      const run = await luna('luna://com.webos.applicationManager/running', {});
      if (!Array.isArray(run.running)) return false;
      if (run.running.some(a => (a.id || a.appId) === PICKER)) { strikes = 0; awaiting = false; return true; }
      if (awaiting && now() - launchedAt < CHECK_MS) return false;   // still starting
      if (awaiting) {   // it was started and is gone again: the system closed it
        awaiting = false;
        if (++strikes >= STRIKES) {
          if (store) store.set({ prewarm: false, reason: 'the TV closes the hidden picker', at: now() });
          console.error('picker: the system closed the hidden picker ' + strikes + ' times; keeping it ready is switched off (the Input key starts it when pressed)');
          return true;
        }
      }
      if (!(await luna('luna://com.webos.applicationManager/getAppInfo', { id: PICKER })).returnValue) return false;   // not installed (yet)
      launchedAt = now(); awaiting = true;
      await luna('luna://com.webos.applicationManager/launch', { id: PICKER, params: { prewarm: true } });
      return false;
    } catch (e) { console.error('picker keepalive:', e.message); return false; }
  }
  return tick;
}
function start(luna, enabled, store) {
  const tick = make(luna, enabled, store);
  // quickly after boot until it is up, then now and then
  let fast = 0;
  const loop = async () => { const up = await tick(); if (up) fast = 0; setTimeout(loop, up || fast++ > 40 ? 30000 : 4000); };
  setTimeout(loop, 2000);
}
module.exports = { start, make };
