# CleanYourTV for LG webOS

A fast home screen for rooted LG webOS TVs, with Live TV from your own playlist, an Inputs list on the Input key,
picture notifications and an optional debloat of LG's ads and telemetry.

- **Launcher:** replaces LG's Home with a dock of four apps, a top shelf, an app grid sorted by use, an Inputs picker,
  a Settings shortcut and a clock.
- **Voice (optional):** speech recognition on the TV (Moonshine), answers from a language model through OpenRouter or from your own server, shown as text on screen.
- **Live TV:** plays your M3U playlist with a channel list, programme guide and number entry.
- **Input key:** the remote's Input button opens an Inputs list over the running app.
- **Picture notifications:** a card with a photo over any app, triggered from your network.
- **Manager app:** sets up, updates and removes everything from the TV.
- **Debloat:** stops LG's ad and telemetry services and blocks a few ad servers.

Everything is applied in RAM at boot. Nothing under `/usr`, `/etc` or the firmware is modified, and a reboot without
the boot scripts brings LG's Home back.

<p align="center"><img src="docs/screenshots/home.jpg" alt="Home screen" width="900"></p>

<p align="center"><img src="docs/screenshots/live.jpg" alt="Live TV guide" width="900"></p>

<table>
<tr>
<td><img src="docs/screenshots/grid.jpg" alt="App grid" width="440"></td>
<td><img src="docs/screenshots/options.jpg" alt="App options" width="440"></td>
</tr>
<tr>
<td><img src="docs/screenshots/customise.jpg" alt="Customise menu" width="440"></td>
<td><img src="docs/screenshots/inputs.jpg" alt="Inputs menu" width="440"></td>
</tr>
<tr>
<td><img src="docs/screenshots/picker.jpg" alt="Inputs picker on the Input key" width="440"></td>
<td><img src="docs/screenshots/manager.jpg" alt="Manager app" width="440"></td>
</tr>
</table>

## Requirements

- An LG webOS TV rooted with the [Homebrew Channel](https://webosbrew.org) ([rootmy.tv](https://rootmy.tv)).
- Internet access on the TV, and SSH access as `root` for the install command.
- Firmware from the [compatibility list](#compatibility). Other firmware may work; see there.
- webOS 5 or newer (2020 models and later). webOS 4 and older (2018 models and before) are not supported: they have no systemd and an old Node.js, and the setup stops before changing anything.

## Install

**1. Install the manager app.** From your computer, with your TV's IP address:

```sh
ssh root@192.168.1.50 'curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh | sh'
```

It downloads the latest release package, checks its SHA-256 and installs it. The package can also be downloaded from
[Releases](https://github.com/lasharor/cleanyourtv-WebOS/releases) and installed with the Homebrew Channel or
`ares-install`. Nothing on the TV changes until step 2.

**2. Set up, on the TV.** Open **CleanYourTV**, choose the options and **Set up now**. It takes about a minute and the
screen blinks once.

| Option | Default |
|---|---|
| Debloat LG's ads and telemetry | on |
| Take over the Input key | on |

The setup saves the original state in `/media/developer/cleanyourtv/backup`, installs the launcher, adds boot scripts
to `/var/lib/webosbrew/init.d/`, replaces LG's Home at boot and starts the service. If the new Home does not come up,
it removes the boot scripts and restarts the TV with LG's Home. Its log is `/media/developer/cytv-setup.log` (kept across the restart), with the service log in `cytv-setup.log.service`.

The same setup over SSH: `sh /media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service/bootstrap.sh install`
(options `--no-debloat`, `--no-input-key`, `--no-start`, `--no-verify`, `--force`).

## Update

Open **CleanYourTV**. The launcher and the service update separately from the latest GitHub release, each checked
against its SHA-256 file. A launcher that does not start is replaced by the previous one, a service that does not start
by the previous files, and **Go back to launcher** returns to the previous launcher. Before the setup the app offers a
newer package by itself. Running the install command again also updates.

## Uninstall

**Uninstall** in the manager app, or `sh /media/developer/cleanyourtv/uninstall.sh` (`--keep-config` keeps settings
and usage history). It removes the apps, boot scripts and Input-key bind and restarts the TV.

## Manager app

| Row | Function |
|---|---|
| Launcher, Service | Installed version; offers an update when the latest release is newer. |
| Check for updates | Asks GitHub for the latest release. |
| Go back to launcher | Appears after a launcher update. |
| CleanYourTV as Home | Choose LG's Home or ours. The TV restarts. |
| Debloat | Turns the debloat on or off. |
| Network notifications | Switch, address, token and example for sending picture notifications from other devices. |
| Voice | Optional. Installs the speech recogniser (about 80 MB), learns the voice button, tries it, sets where the text goes. |
| Input key | The takeover switch, **Learn the Input key**, and the optional **Learn the Home key**. |
| Share log | A QR code that opens a masked diagnostic report on a phone, with a **Copy** button. |
| Uninstall | Removes everything and restarts the TV. |

The left side of the screen explains the focused row.

## Compatibility

The setup matches the TV's firmware against `compat.json` (the setup fetches the newest copy from this repository and
falls back to the one in the package). A listed firmware is set up directly.

| Firmware | Status |
|---|---|
| 33.23.05 (OLED65G26LA, webOS 25) | tested |
| 23.25.55 | reported working on two models |

For an unlisted firmware the setup continues when LG's Home app is the flutter or web kind, and otherwise stops and
offers **Set up anyway**. To add a firmware, open an issue with the output of **Share log**.

## Using the launcher

| Action | How |
|---|---|
| Open an app | OK |
| App options (dock, hide) | Hold OK on an app |
| Remove a top button | Hold OK on it |
| Customise | The Customise button |
| Live TV | The Live TV button or tile |
| Switch input | The Inputs button |

**Customise** holds the top buttons, hidden apps, app order, clock format and a reset. The dock holds up to four
apps. The grid sorts by how often you use each app (or A to Z). Menus follow the TV's language (English, Dutch,
German, French, Spanish).

Settings are in `/media/developer/cleanyourtv/config.json`: `dock`, `topbar`, `hidden`, `sort`. See
`config.example.json`.

## Live TV

Plays an IPTV playlist (M3U) from your own provider or server; it does not use LG's tuner. On first use the screen
shows an address and a 6-digit code: open the address on a phone on the same network, enter the code and paste the
playlist address (and the XMLTV guide address if the playlist has none). From a shell on the TV:

```sh
curl -X POST localhost:8765/api/live/settings -d '{"playlistUrl":"http://...","epgUrl":"http://..."}'
```

| Key | Action |
|---|---|
| Up / Down, CH+ / CH- | Next / previous channel |
| Digits | Jump to a channel number (playlist order) |
| OK | Open the guide |
| Info, Left / Right | Channel banner (now and next) |
| Back, Home | Return to the launcher |

The TV's player plays HLS (`.m3u8`). The guide (XMLTV) is refreshed twice a day and keeps 36 hours. There is no
recording, pause or favourites. The playlist address is stored only on the TV, in `/media/developer/cleanyourtv/live/`;
`curl -X POST localhost:8765/api/live/reset` clears it.

## Input key

The Input button opens the Inputs picker over the running app: the dock apps in a row, the inputs below (each showing
the port and what is connected, a green dot on the active one) and **Live TV**. Left/Right move, Up/Down switch rows,
OK opens, Back or Input closes it; the pointer works too.

It uses the bundled inputhook ([`THIRD-PARTY.md`](THIRD-PARTY.md)). The Input button's code is 241 by default; **Learn
the Input key** in the manager app reads the code of your remote and tests that the picker opens. **Clear** restores
the default. The switch in the manager removes the bind and gives the button back to LG's picker.

## Picture notifications

The `com.cleanyourtv.notify` app shows a card (picture, title, text) over whatever is on screen without taking the
remote. Other devices send it with a POST request.

**Enable it:** in the manager app, **Network notifications** > **Accept notifications from the network**. **How to
send** shows the address, the token and an example. The token is a secret: anyone who has it and can reach the TV can
show cards on its screen. **New token** replaces it.

```sh
curl -X POST http://192.168.1.50:8767/notify \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Front door","text":"Someone is at the door","image":"http://192.168.1.20/snapshot.jpg","seconds":15,"position":"top-right"}'
```

| Field | Meaning |
|---|---|
| `title`, `text` | Up to 120 and 400 characters; either may be empty. |
| `image` | `http(s)` address of a picture, up to 6 MB. |
| `seconds` | Display time, 2 to 120 (default 8). |
| `position` | `top`, `middle` or `bottom` plus `left`, `center` or `right` (default `top-right`). |

Home Assistant:

```yaml
rest_command:
  tv_notify:
    url: "http://192.168.1.50:8767/notify"
    method: POST
    headers:
      Authorization: "Bearer <token>"
      Content-Type: "application/json"
    payload: '{"title":"{{ title }}","text":"{{ text }}","image":"{{ image }}","seconds":15}'
```

The port (default 8767) and an allow list of addresses are in `config.json` under `notifyApi`
(`{"enabled":true,"port":8767,"allow":["192.168.1.0/24"]}`; prefixes /8, /16 and /24 are supported). Requests use plain
HTTP, so the token is visible to anyone who can watch your network traffic; keep the TV on a network you trust. Ten
wrong tokens lock an address out for ten minutes, and at most 20 notifications a minute are accepted. From a shell on
the TV, `POST localhost:8765/api/notify` accepts the same body without a token.

## Voice (optional)

Recognises speech from the remote's microphone on the TV. The text is shown on screen and can be sent to a server you
run, to a language model through OpenRouter, or both; the answer is shown as text on screen. Answers are not spoken.
No audio is recorded or sent anywhere.

It is off and not installed by default. **Voice** in the manager app downloads about 80 MB into
`/media/developer/cleanyourtv/voice` (checksums are pinned; **Remove voice** deletes it):

| Part | From |
|---|---|
| Speech engine `libmoonshine.so` and ONNX Runtime | the `moonshine-voice` 0.1.5 package on PyPI (MIT) |
| 64-bit C library | `ubuntu-base` 22.04.5 for arm64 (this TV has a 32-bit userland on a 64-bit kernel, so the 64-bit recogniser brings its own) |
| Model `tiny-streaming-en` (34 million parameters, int8) | download.moonshine.ai (MIT) |
| `cytv-asr`, a small program that feeds audio to the engine | this repository (`voice/asr.c`, built with `voice/build.sh`) |

How it works: the voice button starts a microphone stream of LG's voice service (`voiceinput`, 16 kHz audio). The
service stops after a short silence, runs the recogniser for the speech it heard and shows the result. The recogniser
runs only while recognising: about 190 MB of memory for one to two seconds. A three second phrase took about 1.4 s on
the G2.

| Step | How |
|---|---|
| Choose the button | **Voice** > **Learn the voice button**. Try the remote's microphone button; if the hook does not see it, any spare button works. Then switch **Listen on the voice button** on. |
| Try without a button | **Voice** > **Try it now**, or `curl -X POST localhost:8765/api/voice/listen` |
| Send the text to a server | `curl -X POST localhost:8765/api/voice/set -d '{"url":"http://server:port/path","token":"optional"}'` |
| Pause LG's voice assistant | **Voice** > **Switch off LG's voice assistant**. It pauses LG's `voiceconductor` process while voice is on, so LG's own screen and its cloud recognition do not start on the same button. A reboot or turning the switch off undoes it. |

The TV sends `POST` with the JSON body `{"text":"...","source":"cleanyourtv","language":"en","time":"..."}` and, when a
token is set, `Authorization: Bearer <token>`. If the server answers with JSON (`{"title","text","image","seconds"}`)
or plain text, the answer is shown as a card. The address and token are stored in `config.json` on the TV only.

**AI chat (OpenRouter).** In **Voice**, **Set up from your phone** shows a QR code. Scan it with a phone on the same
Wi-Fi and enter your OpenRouter key, choose a model (the list is read from OpenRouter; any model name can be typed),
write instructions and, if you like, the address of your own server. The page is open for ten minutes or until you
save, at a random address; it is plain HTTP, so use it on a network you trust. **Model** on the TV chooses among the
newest models of the main providers, with their price. **AI chat (OpenRouter)** switches the answers on and off.

The same from a shell:

```
curl -X POST localhost:8765/api/voice/set -d '{"llm":{"key":"sk-or-...","model":"openrouter/auto"}}'
curl -X POST localhost:8765/api/voice/set -d '{"llm":{"enabled":true}}'
```

What you say is sent as text to `openrouter.ai` with the model you chose (a short instruction asks for one to three
plain sentences; change it with `"system"`), and the answer appears on screen. The model remembers the last six
exchanges for ten minutes (**Forget the conversation** clears them). The key is stored in `config.json` on the TV only.
With a server address set as well, the server also receives the text and the model's answer (`{"text","answer"}`).
You can also ask by text, with the same result: `curl -X POST localhost:8765/api/voice/ask -d '{"text":"..."}'` answers
`{"text","answer","error"}`; add `"card":false` to skip the screen. This works without the speech download.

On screen, a card changes in place while you speak: Listening (moving bars), Recognising or Thinking (dots), then your
question in small type above the answer. Reading time follows the length of the answer.

### The speech model

[Moonshine](https://github.com/moonshine-ai/moonshine) (Moonshine AI, MIT licence) runs on the TV; there is no cloud recogniser.

| | |
|---|---|
| Model | `tiny-streaming-en`: about 34 million parameters, encoder and decoder, int8 weights, 45 MB. |
| Runtime | ONNX Runtime on the CPU (two ARM cores on the G2). |
| Segmentation | The engine's voice-activity detection splits the audio into phrases. The service stops recording after 1.2 s of silence, after 7 s without speech, or after 15 s. |
| Cost on the G2 | Load 0.3 s; a 3 s phrase takes about 1.4 s; about 190 MB of memory while recognising, none when idle. |
| Reported accuracy | 12.0 % average word error rate on the Open ASR Leaderboard datasets, 4.8 % on LibriSpeech test-clean (figures from the Moonshine project; not measured through the remote's microphone). |
| Language | English. Moonshine also publishes German, Spanish, Arabic, Japanese, Mandarin, Tagalog and Vietnamese models and larger English ones (small 123 M, medium 245 M parameters). |
| Audio | 16 kHz mono from the microphone stream of LG's `voiceinput` service. Held in memory while recognising, then discarded; not written to disk or sent anywhere. |

The TV's programs are 32-bit ARM on a 64-bit kernel and the recogniser is a 64-bit program, so `cytv-asr` runs through
the 64-bit loader and libraries that the download places in the same folder. Nothing in the system folders is changed;
**Remove voice** deletes all of it.

Only text goes further: to your server, to OpenRouter, or nowhere. LG's own assistant is a separate path with its own
cloud recognition; **Switch off LG's voice assistant** pauses it while voice is on.

### Planned: Home Assistant

Sending recognised text to Home Assistant's conversation (Assist) API and showing its answer. Until then, the server
address and `/api/voice/ask` can forward text to a Home Assistant webhook or any other service.

## Debloat

About a minute after every boot, the debloat stops `remotelogger`, `service-logger`, `contentminer` and `nudge`,
prevents `acr2`, `admanager`, `sportsalarm` and `adoverlay-service` from starting, and adds `eic.ads.lgtvcommon.com`,
`nl.ad.lgsmartad.com` and `nl.info.lgsmartad.com` to `/etc/hosts` (marked `# cleanyourtv-debloat`; other entries are
untouched). Nothing is uninstalled. It applies only while the launcher is Home. Turn it off with the switch in the
manager app.

## LG's Home and the launcher

Switching restarts the TV (about a minute).

| Action | How |
|---|---|
| Use LG's Home | **CleanYourTV as Home** off in the manager app, or the **LG Home** tile at the end of the app grid. |
| Use the launcher again | **CleanYourTV as Home** on, from LG's app list. |
| Over SSH | `touch /media/developer/cleanyourtv/DISABLE; reboot` for LG's Home, `rm /media/developer/cleanyourtv/DISABLE; reboot` for ours. |
| Failed boot | The Homebrew Channel's failsafe mode skips all boot scripts; reboot again. |

While LG's Home is selected, the service still runs, so the manager app and the Input key work.

## Service API

The service runs as root on `127.0.0.1:8765` (JSON).

| Endpoint | Purpose |
|---|---|
| `GET /api/apps` | Installed apps, config, usage, version |
| `POST /api/launch` `{id, params}` | Launch an app |
| `GET /api/inputs` | HDMI inputs and their state |
| `POST /api/notify` | Picture notification (on the network: `POST :8767/notify` with the token) |
| `GET /api/voice/status`, `POST /api/voice/install`, `/uninstall`, `/set`, `/listen`, `/ask`, `/forget` | Optional voice function and AI chat |
| `GET /api/live/status`, `/api/live/channels`, `/api/live/epg` | Live TV data |
| `POST /api/live/settings`, `/api/live/refresh`, `/api/live/reset` | Live TV setup |
| `GET /api/manager/status` | Versions, updates, options, hook state |

## Troubleshooting

- **Black screen after switching or rebooting:** wait a minute; if it stays black, restart the TV.
- **An app is missing from the grid:** check **Hidden apps** in Customise. Apps without a launch icon are not listed.
- **After a firmware update removed root:** re-root, then run the install command and the setup again.
- **The Input key opens LG's picker:** check the Input key switch in the manager app and run **Learn the Input key**.
- **`FAILED_IPKG_INSTALL`:** remove the `com.cleanyourtv.manager` entry marked `half-installed` from
  `/media/developer/apps/var/lib/opkg/status` and install again.
- **Bug reports:** attach the output of **Share log**.

## Development

`python3 ipk/build.py` writes the release files to `dist/`: `com.cleanyourtv.manager_<version>_all.ipk`,
`frontend-<version>.tgz` and a `.sha256` file for each; attach all four to a GitHub release tagged `v<version>`. The
service version is `VERSION` in `helper/helper.js`; the launcher version is `app/version.json` and `VERSION` in
`app/index.html`.

Layout: `app/` launcher, `manager/`, `picker/`, `notify/` apps, `helper/` service, `scripts/` boot, setup and
restore scripts, `voice/` source of the speech program, `third-party/` bundled inputhook and QR library, `compat.json`, `install.sh`, `uninstall.sh`.

## Credits and licence

The home-screen design follows [CleanYourTV](https://github.com/Gathin23/cleanyourtv) (Android TV, MIT). MIT licence,
see `LICENSE`; bundled components are listed in [`THIRD-PARTY.md`](THIRD-PARTY.md). This modifies a running TV with
root access; read `install.sh` and `scripts/` before running them, and use it at your own risk.
