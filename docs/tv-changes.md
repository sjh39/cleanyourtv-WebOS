# What it changes on the TV

Everything is applied in RAM at boot or lives in the writable partitions. Nothing under `/usr`, `/etc` (apart from the marked
debloat lines in `/etc/hosts`) or the firmware is modified, and a reboot without the boot scripts brings LG's Home back.

## Files

| Where | What |
|---|---|
| `/media/developer/cleanyourtv/` | The service (`helper.js` and modules), the launcher (`app/`), scripts, `config.json`, `usage.json`, the backup of the original state in `backup/`, Live TV data in `live/`, the optional voice download in `voice/` |
| `/media/developer/apps/usr/palm/applications/` | The apps `com.cleanyourtv.manager`, `.picker` and `.notify` |
| `/media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service/` | The installed package contents |
| `/var/lib/webosbrew/init.d/` | Boot scripts `10-cleanyourtv-home` and, with debloat on, `15-cleanyourtv-debloat` (links into the folder above) |
| `/home/root/.config/lginputhook/keybinds.json` | Our binds for the Input key (and the voice key); other binds are left alone |
| `/media/developer/cytv-setup.log` | The setup log |

## At boot

1. The Homebrew Channel runs the boot scripts in `/var/lib/webosbrew/init.d/`.
2. `10-cleanyourtv-home` starts the service and, unless `/media/developer/cleanyourtv/DISABLE` exists, **bind-mounts** a directory
   holding the launcher over LG's Home app (`/usr/palm/applications/com.webos.app.home`). The directory's `appinfo.json` is derived
   from this TV's own stock Home, so nothing of LG's is shipped.
3. About a minute later the debloat runs, if it is on.

The bind mount lives in RAM. A reboot without the boot scripts, or the Homebrew Channel's failsafe mode, leaves LG's Home as it was.

## Processes and ports

| What | Port |
|---|---|
| The service (`node helper.js`), running as root | `127.0.0.1:8765` |
| The input hook, injected into LG's input processes | none |
| Short-lived pages (Live TV pairing, share log, voice setup) and the optional notification endpoint | [Security](security.md#what-this-changes-on-a-tv) |

## What the uninstall removes

The apps, the boot scripts, the Input-key and voice-key binds, the debloat changes and the folder
`/media/developer/cleanyourtv` (with `--keep-config`, the settings and usage history stay). The TV then restarts with LG's Home.
