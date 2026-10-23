# Contributing

The code is on [GitHub](https://github.com/lasharor/cleanyourtv-WebOS). Issues and pull requests are welcome, especially
reports from TVs that are not in the [tested list](../tested-tvs.md).

## Layout

| Folder or file | What it is |
|---|---|
| `app/` | The launcher: one HTML file of plain JavaScript, with `version.json`. |
| `manager/`, `picker/`, `notify/` | The three apps of the package (manager, Inputs picker, picture notification card). |
| `helper/` | The root service (Node.js): API, Live TV, notifications, voice, manager, input hook, share log, self-update. |
| `scripts/` | Boot, setup and restore scripts: `bootstrap.sh`, `10-cleanyourtv-home`, `stage-home.sh`, `undo-home.sh`, the debloat scripts. |
| `shared/` | `flexgap.js`, added to every page by the build for older Chromium. |
| `voice/` | Source of the small speech program `cytv-asr` and its build script. |
| `third-party/` | The bundled inputhook files and the QR library. |
| `tools/` | `node8-check.sh`: service checks under Node 8.12.0. |
| `ipk/build.py` | Builds the release files. |
| `compat.json` | The list of tested firmware the setup reads. |
| `install.sh`, `uninstall.sh` | The installer and uninstaller. |
| `docs/`, `zensical.toml` | This documentation. |

## Building

```sh
python3 ipk/build.py
```

writes the release files to `dist/`: `com.cleanyourtv.manager_<version>_all.ipk`, `frontend-<version>.tgz` and a `.sha256` file for
each. Attach them to a GitHub release tagged `v<version>`. The **service** version is `VERSION` in `helper/helper.js`; the
**launcher** version is `app/version.json` and `VERSION` in `app/index.html` (the build refuses to run when they differ).

## Rules of the road

- **Support webOS 5.** The service must run on Node.js 8: no `crypto.randomInt`, no `fs.promises`, no `URL` as a global,
  no `mkdirSync({recursive})`, no `http.get(url, options)`. Use `helper/netcompat.js`. `tools/node8-check.sh` catches regressions.
- **The pages run in Chromium 79 and newer.** The launcher is written in plain ES5 style without a framework, and only transform
  and opacity are animated, because the TV's GPU is weak. No flex `gap` without the polyfill the build adds.
- **Do not store private data in the repository.** No playlist addresses, access keys, IP addresses or names.
- **Documentation must match the code.** When a feature changes, change its page here and the README.
- **Licence.** The project is MIT. Do not copy code from GPL projects into it; describe behaviour and write your own.

## Adding a TV to the tested list

Open an issue with the output of **Share log** and say whether it worked. A pull request that adds an entry to `compat.json` is
welcome too: `firmware`, optionally `sdk`, `homeType`, `status` and a `note`.

## Test builds

Push a branch and the workflow publishes a [test build](../managing.md#test-builds) that people can install from the manager app.
See [Testing and CI](testing.md).
