// The launcher's app list (apps.js): the first answer is waited for, later ones come from memory while the list is asked again.
// Inputs pinned to Home are listed with the apps.
const { ok, call, req, memoryConfig, run } = require('./lib');

run(async () => {
  let asked = 0,
    title = 'One';
  const luna = async uri => {
    if (/listApps/.test(uri)) {
      asked++;
      await new Promise(r => setTimeout(r, 50));
      return {
        returnValue: true,
        apps: [
          { id: 'a.one', title, folderPath: '/x', icon: 'i.png' },
          { id: 'com.webos.app.home', title: 'Home' },
        ],
      };
    }
    if (/getAllInputStatus/.test(uri))
      return {
        returnValue: true,
        devices: [
          { appId: 'com.webos.app.hdmi1', port: 1, label: 'HDMI 1', hdmiPlugIn: false },
          { appId: 'com.webos.app.hdmi2', port: 2, label: 'PlayStation', hdmiPlugIn: true },
        ],
      };
    return { returnValue: true };
  };
  const config = memoryConfig({ dock: ['a.one'] });
  const apps = req('apps').create({ config, luna, version: '1.6.0', feature: () => null });
  let r = await call(apps, '/api/apps');
  ok(
    asked === 1 && r.j.apps.length === 1 && r.j.apps[0].title === 'One' && r.j.config.dock[0] === 'a.one',
    'the first list is asked from the app manager, without LG Home'
  );
  title = 'Two';
  const t0 = Date.now();
  r = await call(apps, '/api/apps');
  ok(asked === 1 && r.j.apps[0].title === 'One' && Date.now() - t0 < 40, 'opened again soon: the list comes from memory at once');
  r = await call(apps, '/api/launch', 'POST', { id: 'bad id' });
  ok(r.code === 400, 'a bad app id is refused');

  // pinned inputs (hold OK on an input): kept by the service, listed with the apps under the input app's id
  r = await call(apps, '/api/inputs/pin', 'POST', { id: 'com.webos.app.hdmi2', on: true });
  ok(r.j.returnValue === true && config.get().pinnedInputs.length === 1, 'an input is pinned to Home');
  r = await call(apps, '/api/inputs/pin', 'POST', { id: 'com.webos.app.hdmi1', on: true });
  r = await call(apps, '/api/apps');
  const pins = r.j.apps.filter(a => a.input);
  ok(
    pins.length === 2 &&
      pins[0].id === 'com.webos.app.hdmi2' &&
      pins[0].title === 'PlayStation' &&
      pins[0].input === 2 &&
      pins[0].off === false &&
      pins[1].title === 'HDMI 1' &&
      pins[1].off === true,
    "pinned inputs are listed with the apps: the TV's name for the input, the port, and whether something is connected"
  );
  r = await call(apps, '/api/inputs/pin', 'POST', { id: 'com.webos.app.hdmi9', on: true });
  ok(r.j.returnValue === false && config.get().pinnedInputs.length === 2, 'an input the TV does not have is not pinned');
  config.update('test', c => {
    c.dock = ['a.one', 'com.webos.app.hdmi2'];
  });
  await call(apps, '/api/config', 'POST', { dock: ['a.one'], sort: 'alpha' });
  ok(config.get().pinnedInputs.length === 2, "saving the launcher's settings keeps the pinned inputs");
  await call(apps, '/api/config', 'POST', { dock: ['a.one'], runDots: true });
  const on = config.get().runDots === true;
  await call(apps, '/api/config', 'POST', { dock: ['a.one'], runDots: 'yes' });
  ok(on && config.get().runDots === undefined, 'the green dot on open apps is off by default and saved only when switched on');
  config.update('test', c => {
    c.dock = ['a.one', 'com.webos.app.hdmi2'];
  });
  r = await call(apps, '/api/inputs/pin', 'POST', { id: 'com.webos.app.hdmi2', on: false });
  ok(
    r.j.returnValue === true && config.get().pinnedInputs.length === 1 && config.get().dock.indexOf('com.webos.app.hdmi2') < 0,
    'an input taken off Home leaves the dock too'
  );
});
