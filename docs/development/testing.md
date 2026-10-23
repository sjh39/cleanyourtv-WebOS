# Testing and CI

## Service checks under Node 8

webOS 5 TVs ship Node.js 8.12. `tools/node8-check.sh` downloads that exact version (from nodejs.org, checksum verified, cached in
`~/.cache/cleanyourtv`) and runs `tools/node8-check.js` with it:

```sh
sh tools/node8-check.sh
```

The checks:

- parse every service file;
- load every module;
- run the compatibility layer against a local server (`http` requests, `mkdir -p`, `URL`, `randomInt`);
- run the Live TV pairing end to end: the code, a wrong code, saving the playlist, fetching and parsing it;
- run the update logic of the manager against a mock of the GitHub API: the stable and test channels, equal versions with different
  commits, and going back to stable.

Nothing leaves your machine. The script also runs on current Node: `node tools/node8-check.js`.

## Pages

The pages are plain HTML with no build step, so they can be opened in a desktop Chrome with a small mock of the service on
`127.0.0.1:8765` and driven with scripted key events. That is how the launcher, Live TV and manager screens are checked before they
go to a TV. The mock needs to answer `/api/apps`, `/api/live/*` and `/api/manager/*` with the shapes in [Service API](../api.md).

!!! note "What cannot be checked on a computer"
    Playback of real streams, the TV's remote and pointer, the on-screen keyboard and anything that depends on LG's compositor
    need a TV.

## Continuous integration

| Workflow | When | What |
|---|---|---|
| `test-build.yml` | Every push to a branch other than `main` | Runs the Node 8 checks, builds the package with the commit in a `BUILD` file and publishes it as the pre-release `test-<branch>` |
| `docs.yml` | Pushes that touch the documentation | Builds this site; deploys it to GitHub Pages from `main` |

A test build appears in the manager app's **Update channel** list; see [Test builds](../managing.md#test-builds).

## Documentation

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install zensical
zensical serve      # http://localhost:8000, rebuilds on change
zensical build --clean
```
