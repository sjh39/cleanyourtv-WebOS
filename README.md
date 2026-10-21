# CleanYourTV for LG webOS

A clean home screen for rooted LG webOS TVs, with an optional debloat of LG's ads and telemetry.

- **Launcher:** replaces LG's Home with a dock of four apps, a top shelf with the focused app's name and an ambient
  glow taken from its icon, an app grid, an Inputs picker, a Settings shortcut and a clock.
- **Live TV:** plays your own M3U playlist, with channel list, programme guide and number entry.
- **Picture notifications:** shows a card with a photo on top of any app, triggered from your network.
- **Debloat:** stops LG's ad and telemetry services and blocks a few ad servers.

Everything runs from RAM at boot. Nothing under `/usr`, `/etc` or the firmware is modified, and a reboot without
the boot scripts brings LG's Home back. Tested on an LG OLED65G26LA (G2) with webOS 25; other rooted models are
untested.

<p align="center"><img src="docs/screenshots/home.jpg" alt="Home screen with the dock, the focused app's name and the app grid" width="900"></p>

<p align="center"><img src="docs/screenshots/live.jpg" alt="Live TV guide: now and next for every channel and the selected programme's details" width="900"></p>

<table>
<tr>
<td><img src="docs/screenshots/grid.jpg" alt="Focus in the app grid" width="440"></td>
<td><img src="docs/screenshots/options.jpg" alt="Options menu for an app" width="440"></td>
</tr>
<tr>
<td><img src="docs/screenshots/customise.jpg" alt="Customise menu" width="440"></td>
<td><img src="docs/screenshots/inputs.jpg" alt="Inputs picker" width="440"></td>
</tr>
</table>

## Requirements

- An LG webOS TV that is already rooted with the [Homebrew Channel](https://webosbrew.org) ([rootmy.tv](https://rootmy.tv)).
- SSH access as `root` (`ssh root@<tv-ip>`).
- Internet access on the TV (the installer downloads this repository) and the tools webOS ships: `curl`, `tar`,
  `python3`, `node`.

## Install

Run from your computer, with your TV's IP address. The installer asks what to install:

```sh
ssh -t root@192.168.1.50 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh)"'
```

| Question | Default |
|---|---|
| Debloat LG's ads and telemetry | yes |
| Install the picture-notification overlay | yes |
| Start now (the screen blinks once) or at the next reboot | now |

The launcher with Live TV is always installed. Without a terminal (no `-t`) the installer asks nothing and uses
the defaults:

```sh
ssh root@192.168.1.50 'curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh | sh'
```

Options (each also skips its question; pass them after `sh -s --` when piping):

| Option | Effect |
|---|---|
| `-y`, `--yes` | Ask nothing, use the defaults. |
| `--no-debloat` | Do not install the debloat. |
| `--no-notify` | Do not install the picture-notification overlay. |
| `--no-start` | Install, but only take effect at the next reboot. |
| `--no-verify` | Skip the post-install check and the automatic rollback. |
| `--force` | Continue even if LG's Home app looks different from what the installer expects. |

**What the installer does**

1. Checks for root and a rooted webOS TV, prints the model and firmware, and saves the original state (stock Home
   `appinfo.json`, `/etc/hosts`, process and service lists) in `/media/developer/cleanyourtv/backup`.
2. Copies the launcher, a root helper and the scripts to `/media/developer/cleanyourtv`.
3. Adds boot scripts to `/var/lib/webosbrew/init.d/`: `10-cleanyourtv-home` starts the helper and mounts the
   launcher over LG's Home; `15-cleanyourtv-debloat` runs the debloat a minute after boot.
4. Applies everything, then checks that the new Home is registered and the helper answers with the matching
   version. If that fails within two minutes, it restores LG's Home and removes the boot scripts.

**Update:** run the install command again, or `sh /media/developer/cleanyourtv/update.sh` on the TV. Settings and
usage history are kept.

**Uninstall:** `sh /media/developer/cleanyourtv/uninstall.sh` (`--keep-config` keeps settings and usage history).

## Using the launcher

| Action | How |
|---|---|
| Open an app | OK |
| App options (dock, hide) | Hold OK on an app |
| Remove a top button | Hold OK on it |
| Customise | The Customise button, top right |
| Open Live TV | The Live TV button or tile |
| Switch input | The Inputs button |

**Customise** holds the top buttons (remove, or add Inputs, Live TV, Settings or any app), hidden apps, the app
order, the clock format and a reset.

- **Dock:** up to four apps; add, replace, move or remove them from an app's options menu.
- **App order:** the grid sorts by how often you use each app, most used first (or A to Z). Usage is counted when an
  app stays in the foreground for a few seconds, however it was started; older use counts for less (half-life 30
  days).
- **Inputs:** lists each HDMI port with the name of the connected device and whether it is connected or the active
  source.
- **Language and clock:** menus follow the TV's language (English, Dutch, German, French and Spanish are
  translated). The clock uses the 24- or 12-hour format of that language unless you choose one in Customise.

Settings are stored in `/media/developer/cleanyourtv/config.json` and survive reboots and reinstalls. The file
holds `dock` (up to four app ids), `topbar` (buttons with `label`, `icon` and `app` or `action`), `hidden` and
`sort` (`usage` or `alpha`). `config.example.json` shows the format.

## Live TV

Plays an IPTV playlist (M3U) from your own provider or media server. It does not use LG's tuner or channel list.

**Setup (first use):** the screen shows an address and a 4-digit code. Open the address on a phone or computer on
the same network, enter the code and paste the playlist address (and the XMLTV guide address if the playlist does
not name one). The page closes after saving or after ten minutes. From a shell on the TV:

```sh
curl -X POST localhost:8765/api/live/settings -d '{"playlistUrl":"http://...","epgUrl":"http://..."}'
```

**Remote**

| Key | Action |
|---|---|
| Up / Down, CH+ / CH- | Next / previous channel |
| Digits | Jump to a channel number (numbers follow the playlist order, 1 to N) |
| OK | Open the guide |
| Info, Left / Right | Show the channel banner (now and next) |
| Back, Home | Return to the launcher and stop the picture |

**Guide screen (OK):** group tabs across the top (Left / Right), the channels as rows with logo, what is on now and a
progress bar, and a panel for the selected channel with the current programme (time, title, description) and what
follows.

**Notes**

- The TV's own player plays HLS (`.m3u8`). For `…/live/<user>/<pass>/<id>.ts` links the launcher requests the
  `.m3u8` version first. Plain MPEG-TS streams that are not HLS may not play.
- The XMLTV guide is downloaded in the background (compressed) and refreshed twice a day. The next 36 hours are kept.
  Programmes titled "No Data" are ignored.
- No recording, pause or favourites.
- The playlist address is stored only on the TV, in `/media/developer/cleanyourtv/live/`. `curl -X POST
  localhost:8765/api/live/reset` clears it; the uninstaller removes it.

## Picture notifications

LG's toast notifications cannot show pictures on this TV. The optional `com.cleanyourtv.notify` app shows a card
(picture, title, text) in a transparent window above whatever is on screen. It does not take the remote: the app
underneath keeps working. Checked over Plex, Prime Video (DRM video) and an HDMI input.

```sh
ssh root@192.168.1.50 "curl -s -X POST localhost:8765/api/notify -d '{\"title\":\"Front door\",\"text\":\"Someone is at the door\",\"image\":\"http://192.168.1.20/snapshot.jpg\",\"seconds\":15,\"position\":\"top-right\"}'"
```

| Field | Meaning |
|---|---|
| `title`, `text` | Up to 120 and 400 characters; either may be empty. |
| `image` | `http(s)` address of a picture, up to 6 MB (self-signed certificates are accepted). The helper downloads it first, so the card appears complete. |
| `seconds` | Display time, 2 to 120 (default 8). |
| `position` | `top`, `middle` or `bottom` plus `left`, `center` or `right`, for example `bottom-center` (default `top-right`). |

The helper listens on the TV only, so other machines send the request over SSH as above. Home Assistant example:

```yaml
shell_command:
  tv_notify: >-
    ssh -i /config/tv_key -o StrictHostKeyChecking=no root@192.168.1.50
    "curl -s -X POST localhost:8765/api/notify -d '{\"title\":\"{{ title }}\",\"text\":\"{{ text }}\",\"image\":\"{{ image }}\"}'"
```

## Debloat

About a minute after every boot, the debloat:

- stops `remotelogger`, `service-logger`, `contentminer` and `nudge`;
- keeps `acr2`, `admanager`, `sportsalarm` and `adoverlay-service` from starting by mounting an empty stub over
  their binaries (they start on demand);
- adds `eic.ads.lgtvcommon.com`, `nl.ad.lgsmartad.com` and `nl.info.lgsmartad.com` to `/etc/hosts`, marked
  `# cleanyourtv-debloat`. Existing entries, such as update blocking, are untouched.

Nothing is uninstalled. `debloat-undo.sh` or a reboot without the boot script reverts it. It runs only while the
launcher replaces Home, because LG's own Home does not start with those services blocked; *Restore LG Home* lifts it
first. To turn it off: `touch /media/developer/cleanyourtv/DISABLE-DEBLOAT` and reboot.

## Back to LG's Home

| Situation | Action |
|---|---|
| From the launcher | Select **Restore LG Home**, the last tile in the grid (about 15 s, until the next reboot). |
| Over SSH, until the next reboot | `sh /media/developer/cleanyourtv/undo-home.sh temp` |
| Over SSH, permanently | `sh /media/developer/cleanyourtv/undo-home.sh`; delete the `DISABLE` file to switch back on. |
| Remove everything | `sh /media/developer/cleanyourtv/uninstall.sh` |
| Boot crashed | The Homebrew Channel's failsafe mode skips all boot scripts; reboot again. |

If the helper stops responding for about a minute, a watchdog restores LG's Home until the next reboot.

## Helper API

The helper runs as root on `127.0.0.1:8765` (JSON). The launcher uses it; scripts can too.

| Endpoint | Purpose |
|---|---|
| `GET /api/apps` | Installed apps, config, usage scores, version |
| `POST /api/launch` `{id, params}` | Launch an app |
| `GET /api/inputs` | HDMI inputs and their state |
| `POST /api/config` | Save dock, top buttons, hidden apps, sort, clock |
| `POST /api/undo` | Restore LG's Home until the next reboot |
| `GET /api/live/status`, `/api/live/channels`, `/api/live/epg` | Live TV data |
| `POST /api/live/settings`, `/api/live/pair`, `/api/live/refresh`, `/api/live/reset` | Live TV setup |
| `POST /api/notify` | Picture notification |

## How it works

- LG's Home (`com.webos.app.home`) is a read-only system app. At boot the launcher is bind-mounted over its folder;
  `stage-home.sh` builds the mounted folder from the launcher page and an `appinfo.json` derived from the TV's own
  stock one (nothing of LG's is stored in this repository). The system app manager (`sam`) reads app definitions
  only at startup, so it is restarted after the mount.
- The launcher is a plain web page. The helper (Node) wraps `luna-send` to list apps, serve icons, launch apps and
  read input status.
- Picture notifications use a hidden web app with window type `topui`; `overlay` and `popup` windows take the
  remote's focus, `topui` and `floating` do not.
- Layout: `app/` launcher page and icons, `helper/` helper modules, `notify/` notification app, `scripts/` boot,
  debloat and restore scripts, `install.sh`, `uninstall.sh`.

## Troubleshooting

- **Black screen after installing or rebooting:** wait a minute and press Home. If it stays black, run
  `sh /media/developer/cleanyourtv/undo-home.sh temp` over SSH.
- **An app is missing from the grid:** check it is not under `hidden` in Customise. Apps without a launch icon are not
  listed.
- **After a firmware update that removes root:** re-root the TV, then run the installer again.

## Credits and licence

The home-screen design follows [CleanYourTV](https://github.com/Gathin23/cleanyourtv) (Android TV, MIT).
MIT licence, see `LICENSE`. This modifies a running TV with root access; read `install.sh` and `scripts/` before
running them, and use it at your own risk.
