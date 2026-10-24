# Testing and CI

## All checks in one command

```sh
sh tools/check.sh
```

runs everything a push or a release needs:

1. the tests in `tools/test` under **Node.js 8.12.0**, the version webOS 5 and 6 ship (downloaded once from nodejs.org, checksum
   verified, cached in `~/.cache/cleanyourtv`);
2. the same tests under the Node.js of your computer, when it is another version;
3. a check that the launcher and the manager pages are built from their sources (`node tools/build-pages.js --check`).

With `--chromium` it also runs the launcher, the manager and the Inputs picker in **Chromium 68 and 79**, the browser engines of
webOS 5 and 6 (`tools/oldchrome.js`, headless, against a stand-in service): a page that throws a script error there or does not draw
its tiles, rows or inputs fails the check. The engines are Chromium snapshots from Google's storage, checked against pinned SHA-256
sums (about 100 MB each, downloaded once). `CYTV_SHOTS=<folder>` keeps a screenshot of every page per engine; CI keeps them as an
artifact of each run.

Nothing leaves your machine apart from the downloads. One area of tests on its own: `node tools/test.js live` (the names are
the files in `tools/test` without `.test.js`), or `node tools/test/live.test.js`.

## The tests

Each file in `tools/test` is a small program that prints one line per check (`ok` or `FAIL`) and runs in a fresh process with its own
temporary folder; `helper/paths.js` points the service's folders there. Local servers stand in for GitHub, playlists, Home Assistant
and the TV's own services.

| File | What it checks |
|---|---|
| `api.test.js` | Starts the real service (`helper/helper.js`) with a stand-in for `luna-send` and calls every route of the [service API](../api.md). The replies must equal `tools/test/golden/api.json`, recorded from version 1.5.16: a change inside the service cannot change what the launcher, the manager and the scripts see. Record again (`--record`) only when a change of the API is intended. |
| `service.test.js` | Every service file parses and loads; nothing needs a Node newer than 8.12 (optional chaining, `fs.rmSync`, the `timeout` option of an asynchronous child process, ...); TV paths only in `paths.js`. |
| `pages.test.js` | The page scripts are ES5 (parsed with a vendored copy of acorn), nothing in the pages is newer than Chromium 68, and the built pages match their sources. |
| `tvprofile.test.js` | The per-TV decisions for webOS 5, 6.5, 25 and 26 and an unknown TV, from the service and from the shell. |
| `scripts.test.js` | The shell scripts parse; an update keeps the options the user chose; the setup asks `tvprofile.js`; the debloat's `/etc/hosts` fallback. |
| `manager.test.js` | Options, keys and the Input-key modes in the manager API; the settings store and its change log. |
| `updates.test.js` | Update checks against a stand-in for the GitHub API: stable and test channels, builds of one version, a dropped connection. |
| `fetch.test.js`, `netcompat.test.js`, `diag.test.js` | The HTTP client (redirects, gzip, limits, dropped connections, time limits), the Node 8 compatibility layer, starting programs. |
| `live.test.js`, `theme.test.js`, `voice.test.js`, `notifyapi.test.js`, `picker.test.js` | One feature each. |

A fix needs a test that fails without it, whenever the bug can be reproduced without a TV.

## Pages

The built pages are plain HTML files, so they can be opened in a desktop Chrome with a small mock of the service on
`127.0.0.1:8765` and driven with scripted key events (`tools/theme-preview.mjs` does this for the home screen). That is how the launcher, Live TV and manager screens are checked before they
go to a TV. The mock needs to answer `/api/apps`, `/api/live/*` and `/api/manager/*` with the shapes in [Service API](../api.md).

!!! note "What cannot be checked on a computer"
    Playback of real streams, the TV's remote and pointer, the on-screen keyboard and anything that depends on LG's compositor
    need a TV.

## Continuous integration

| Workflow | When | What |
|---|---|---|
| `test-build.yml` | Every push to a branch other than `main` | Runs `tools/check.sh --chromium`, builds the package with the commit in a `BUILD` file and publishes it as the pre-release `test-<branch>` |
| `checks.yml` | Pull requests and pushes to `main` | Runs `tools/check.sh --chromium` and builds the package |
| `docs.yml` | Pushes that touch the documentation | Builds this site; deploys it to GitHub Pages from `main` |

A test build appears in the manager app's **Update channel** list; see [Test builds](../managing.md#test-builds).

## Documentation

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install zensical
zensical serve      # http://localhost:8000, rebuilds on change
zensical build --clean
```
