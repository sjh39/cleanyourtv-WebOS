# Internals

## The pieces

| Piece | Runs as | Notes |
|---|---|---|
| The **service** (`helper.js` and modules) | Node.js, root, started by the boot script | Listens on `127.0.0.1:8765`; bridges the web pages to `luna-send` (LG's service bus), serves app icons, runs Live TV, notifications, voice, the manager API and the input hook. |
| The **launcher** (`app/index.html`) | A web app in LG's web runtime, mounted as LG's Home | Reads apps and settings from the service. |
| **Manager**, **picker**, **notify** | Web apps installed from the package | The picker and notify apps are hidden; the service starts them. |
| The **input hook** | Injected into LG's input processes | Runs a command when a bound remote key is pressed. |

## How the launcher becomes Home

1. `10-cleanyourtv-home` runs at boot and starts the service.
2. `stage-home.sh` builds a directory holding the launcher plus an `appinfo.json` derived from this TV's own stock Home (saved in
   `backup/home-appinfo.orig.json` the first time), switched to the web type.
3. The script **bind-mounts** that directory over `/usr/palm/applications/com.webos.app.home`, restarts the system app manager
   (`sam`) so it reads the new Home, and launches Home again.
4. A **watchdog** keeps checking that the service answers. If it stays unreachable for about a minute, it restores LG's Home until
   the next reboot.

Nothing is written under `/usr`: the mount disappears at reboot. `DISABLE` in `/media/developer/cleanyourtv` makes the script skip it.

## Updates and rollback

- **Launcher.** The manager downloads `frontend-<version>.tgz` and its `.sha256`, checks the list of files in the archive (only
  `app/...`), unpacks, checks `version.json`, swaps it in (the old one becomes `app.prev`), reloads Home and waits up to 40 seconds
  for the new launcher to report that it started. If it does not, the previous launcher is swapped back.
- **Service.** The manager downloads the package, installs it with the system's app installer and runs `bootstrap.sh update`,
  which keeps the running files in `backup/service-prev.tgz`, copies the new ones, restarts the service and waits for it to answer
  with the new version. If it does not, the previous files are restored.
- **Test builds.** Same flows, from a pre-release; the commit in a `BUILD` file is how two builds with one version number are told apart.

## Older webOS versions

webOS 5 and 6 ship Node.js 8, and webOS 6 has Chromium 79.

- `helper/netcompat.js` supplies `URL`, `URLSearchParams`, `crypto.randomInt`, `mkdir -p` and the `http(s).get(url, options)` form.
- `shared/flexgap.js` is added to every page by the build; where flex `gap` is ignored it applies the spacing as margins.
- The service accepts the `file://<appId>-webos` origin that webOS 6 apps send, for our own apps and the Home slot only.
- `scripts/reload-home.sh` restarts `webapp-mgr` on webOS 6, where a relaunch alone keeps the old page.

!!! note "Not yet tried on a webOS 5 or 6 TV"
    These changes follow a community fork for webOS 6 and a report from a webOS 5.6.2 TV. The service is tested under Node 8.12.0
    (`tools/node8-check.sh`) and the pages in a current Chrome with the detection switched off, but not on a TV of those versions.

## Things that were tried

!!! info "A native launcher"
    A launcher written in C with SDL2 (so it draws on the GPU without the web runtime) was built and run as LG's Home on a
    webOS 25 TV. It worked, started quickly and used about as much memory and CPU as the web launcher, but LG's compositor shows
    "Do you want to exit the app?" when Back is pressed in a native app, and setting a key mask on the window did not stop it. It
    is kept on the `native-launcher` branch for reference and is not part of the project.
