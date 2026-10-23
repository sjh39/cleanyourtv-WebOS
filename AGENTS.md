# CleanYourTV for LG webOS: briefing for AI assistants

Read this first when you help someone with this project, either to find out what is wrong on their TV or to fix a bug in the code.
The full documentation is in `docs/` (published at https://lasharor.github.io/cleanyourtv-WebOS/); the page for you is `docs/ai.md`.

## What it is

A launcher that replaces LG's Home on a **rooted** LG webOS TV, plus a root service on the TV: Live TV from the user's own playlist, an Inputs
list on the remote's Input key, picture notifications, optional voice, themes, a debloat of LG's ads, and a manager app that sets up,
updates and removes everything. Everything is applied at boot with mounts in RAM; nothing under `/usr`, `/etc` or the firmware is changed on
disk, and a reboot without the boot scripts brings LG's Home back.

## Where things are

| Symptom or feature | Look at |
|---|---|
| The launcher page (home screen, menus, Live TV player) | `app/index.html` (one file, ES5 style, no framework) |
| The root service: API, usage, foreground tracking | `helper/helper.js` (port 8765, loopback only) |
| The manager app and its API (updates, options, keys) | `manager/app/index.html`, `helper/manager.js`, `helper/selfupdate.js` |
| The Input key, the Inputs list over the running app | `helper/inputhook.js`, `helper/picker.js`, `picker/app/`, `scripts/inputkey.sh` |
| Home takeover at boot, rollback, undo | `scripts/10-cleanyourtv-home`, `scripts/stage-home.sh`, `scripts/undo-home.sh`, `scripts/bootstrap.sh` |
| Live TV: playlist, guide, favourites | `helper/live.js` and the Live TV part of `app/index.html` |
| Picture notifications | `notify/app/`, `helper/notify.js`, `helper/notifyapi.js` |
| Voice (Moonshine, OpenRouter, Home Assistant) | `helper/voice.js`, `voice/` |
| Themes | `helper/theme.js` (the schema), `themes/` (read from GitHub), `docs/themes.md` |
| The report people attach to issues | `helper/sharelog.js` (`node sharelog.js --print` prints it) |
| Node 8 compatibility helpers, diagnostics | `helper/netcompat.js`, `helper/diag.js` |
| Build and checks | `ipk/build.py`, `tools/node8-check.js`, `tools/node8-check.sh` |

## Facts about the TV that matter

- Test TV: LG OLED65G26LA, webOS 25 (SDK 10), Node.js 16. **webOS 5 and 6 have Node.js 8.12** and an older Chromium (68 on webOS 5, 79 on
  webOS 6). The userland is 32-bit ARM on a 64-bit kernel.
- The root filesystem, `/usr` and `/etc` are read-only. Writable: `/media/developer`, `/var`, `/tmp`. Use bind mounts, never write into `/usr`.
- Where things are on the TV: `/media/developer/cleanyourtv/` (service files, `config.json`, `app/`, `live/`, `themes/`, `backup/`),
  `/var/lib/webosbrew/init.d/` (boot scripts, run by the Homebrew Channel), `/media/developer/cytv-setup.log` (setup log),
  `/tmp/cleanyourtv-helper.log` (service log), `/tmp/lginput-hook-lginput2.log` (input hook).
- Root SSH works with a key (`ssh root@<tv-ip>`). `luna-send` must have stdin redirected: `luna-send -n 1 -w 5000 -f <uri> '<json>' </dev/null`.
- The service listens on `127.0.0.1:8765` (use `curl` on the TV). Other ports: 8766 Live TV pairing, 8767 network notifications (opt-in),
  8768+ share log, 8769 voice setup. The last four are short-lived or off by default.
- Going back to LG's Home: manager app > CleanYourTV as Home off, or `sh /media/developer/cleanyourtv/undo-home.sh`. If a boot crashes,
  the Homebrew Channel's failsafe mode skips the boot scripts.
- A TV's own state can be the problem: a stuck media pipeline (black video, no sound) is cleared by a reboot; check
  `luna://com.webos.media/getActivePipelines` before blaming the code.

## Rules

1. **Do not touch the user's TV without being asked.** Start read-only (`tools/diagnose.sh`, the report, `ps`, `cat`, `luna-send` queries).
   Propose every change (restart, edit, install, delete) and wait for a yes, and name the command that undoes it. Never reboot, uninstall,
   delete files or change boot scripts on your own.
2. **Never put private data in the repository, an issue or a pull request:** no playlist addresses, access keys, tokens, IP addresses,
   user or device names, webhook addresses. Mask them. `tools/diagnose.sh` and Share log already mask what they can; read the output.
3. **The service must run on Node.js 8.12** (webOS 5/6): no `??`, `?.`, `fs.rmSync`, `fs.cpSync`, `mkdirSync({recursive})`, `crypto.randomInt`,
   `fs.promises`, global `URL`, `http.get(url, options)`, and no `timeout` option on child processes (use `diag.execFile`). Use
   `helper/netcompat.js`. **The pages are written for Chromium 68 and up**: ES5 style, only transform and opacity animate (the GPU is weak),
   no flex `gap` without the polyfill the build adds.
4. **A fix needs a test** in `tools/node8-check.js` when it can be tested without a TV, and it must pass under Node 8.12:
   `sh tools/node8-check.sh` (downloads Node 8.12.0 once, checksum pinned). Say plainly what was checked on a real TV and what was not.
5. **Documentation must match the code.** Change the page in `docs/` when behaviour changes, and the README if it is mentioned there.
6. **Licence:** the project is MIT. Do not copy code from GPL projects; describe behaviour and write your own.
7. **Do not release, tag, force-push or change repository settings.** The maintainer does that. Work on a branch; every branch push publishes a
   test build (a pre-release named `test-<branch>`) that people can install from the manager app (Update channel).

## Commands

```sh
sh tools/node8-check.sh            # the service under Node 8.12.0 (also: node tools/node8-check.js)
python3 ipk/build.py               # writes dist/: the package and the launcher bundle with .sha256 files
node tools/theme-docs.js           # regenerates the settings table in docs/themes.md from helper/theme.js
node tools/theme-index.js          # writes themes/index.json
node tools/theme-preview.mjs <id>  # renders a theme in headless Chrome (Node 22+)
sh tools/diagnose.sh <tv-ip> > cytv-diagnose.txt   # read-only report from a TV over SSH
```

## Things that have gone wrong before (check these first)

- A hidden overlay app can keep the remote (webOS 6.5); the Input key then starts the picker on demand and closes it. The `running` list of
  the app manager lags by seconds after a start or close: do not make decisions from one reading.
- Closing from the page (`window.close`, `PalmSystem.hide`) does nothing on some builds: the service closes apps with
  `applicationManager/closeByAppId`.
- Node's `timeout` option on child processes is avoided on purpose (a `uv_close` assertion on Node 8); use `diag.execFile`. After an abnormal
  exit the next start logs the last operations (`/tmp/cytv-run.json`); they appear in the report.
- `bootstrap.sh` copies only `helper/*.js` and `scripts/*` to the TV. Anything else the service needs must be copied there too, or be read
  from somewhere else (themes are read from GitHub for that reason).
- Update checks and downloads must always end: a dropped connection emits `aborted` on the response, not an error on the request.
- webOS 5's Chromium can leave old text in the compositor when a list is redrawn: the launcher swaps elements instead of rewriting them.
- Themes are data; a theme must never contain CSS or script. The schema in `helper/theme.js` is the only source of what a theme can set.
