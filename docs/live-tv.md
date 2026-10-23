# Live TV

Plays an IPTV playlist (M3U) from your own provider or server. It does not use LG's tuner, and the project provides no channels
and no playlist.

![Live TV guide](screenshots/live.jpg){ width="900" }

## Setting it up

On first use the screen shows an address and a 6-digit code.

1. Open the address on a phone or computer on the same network as the TV.
2. Enter the code.
3. Paste your M3U playlist address (and the XMLTV guide address if the playlist does not carry one).

The page closes by itself. It is open for ten minutes at most and only with the code.

From a shell on the TV instead:

```sh
curl -X POST localhost:8765/api/live/settings -d '{"playlistUrl":"http://...","epgUrl":"http://..."}'
```

## Keys

| Key | Action |
|---|---|
| Up / Down, CH+ / CH- | Next / previous channel |
| Digits | Jump to a channel number (playlist order) |
| OK | Open the guide |
| Info, Left / Right | Channel banner (now and next) |
| Back, Home | Return to the launcher |

In the guide: Up/Down move through the channels, Left/Right change the group tab, CH+/CH- page, OK plays, Back closes it.

## How it plays

- The TV's own player plays **HLS** (`.m3u8`).
- Stepping through channels with Up/Down starts the new channel only when the keys have paused for 180 ms. Channels you skip
  are never requested from your provider, which matters for accounts that allow one connection.
- The player uses one video element for the whole session instead of creating one per channel.
- The guide (XMLTV) is refreshed twice a day and keeps 36 hours.

There is no recording, pause or favourites.

## Where it is stored

The playlist address, which usually contains an access key, is stored only on the TV, in
`/media/developer/cleanyourtv/live/`, readable by root only. To clear it:

```sh
curl -X POST localhost:8765/api/live/reset
```

!!! note "Test builds"
    Favourites, recent channels, filters, search, several streams per channel, failure reasons and statistics are in a test
    build (branch `live-tv-features`) and are not part of the stable release yet. See [Test builds](managing.md#test-builds).
