# Themes

A theme changes how the home screen looks: colours, the size of tiles and text, the number of columns, the clock, the ambient glow,
the speed of animations and a wallpaper. Themes apply to the launcher's home screen (dock, top shelf, grid, top buttons and menus).
Live TV, the Inputs picker and the notification cards keep their own look.

In the manager app, **Theme** lists the themes. Choosing one applies it; the home screen shows it the next time you open Home.
**Accent colour** changes the colour of the focus ring and of the highlighted button or menu row on top of any theme.
**Go back to the previous theme** undoes the last change.

## Bundled themes

| Theme | What it is |
|---|---|
| Classic | The original look: near-black, white focus, ten columns. The default. |
| Midnight | Deep blue with a wallpaper and a blue focus. |
| OLED black | Pure black and no ambient glow, so unlit pixels stay off. |
| Warm | Brown and amber, with the glow in the accent colour and a wallpaper. |
| Compact | Twelve columns of smaller tiles: more apps on screen. |
| Large print | Eight columns of big tiles and larger text. |
| Still | No animation and a quiet glow. |
| Sunset | A wallpaper with the dock at the bottom in a glass panel, six dock apps, round buttons and a stacked clock. Down from the dock opens all apps over the wallpaper; Back closes them. |

![Classic, Compact, Large print and Midnight](screenshots/themes-1.jpg)

![OLED black, Still, Warm and Classic with an orange accent](screenshots/themes-2.jpg)

![Sunset: the home screen and the app grid opened with Down](screenshots/themes-3.jpg)

The pictures are the launcher page rendered in a browser with each theme.

## Theme files

A theme is a JSON file in `helper/themes/` of this repository, shipped with the service. To contribute one, add
`helper/themes/<id>.json` (and a wallpaper in `helper/themes/wallpapers/` if it uses one) in a pull request. Every key is optional;
a missing or invalid value falls back to the original look.

```json
{
  "name": "Midnight",
  "author": "CleanYourTV",
  "description": "Deep blue with a soft wallpaper and a blue focus.",
  "colors": { "night": "#060a18", "panel": "#101830", "ink": "#eaf0ff", "accent": "#7aa2ff" },
  "layout": { "cols": 10, "tileH": 151, "clock": "left" },
  "effects": { "glow": 0.8, "wallpaper": "midnight.jpg", "wallpaperDim": 0.25 }
}
```

| Key | Values | Default |
|---|---|---|
| `colors.night`, `panel`, `ink`, `accent` | `#rrggbb`. Background, toast and menu surfaces, text, focus and highlight colour. | `#07080b`, `#14161b`, `#f5f6f8`, `#f5f6f8` |
| `layout.cols` | 6 to 12: columns in the app grid | 10 |
| `layout.tileH`, `tileRadius` | 90 to 200 px; 0 to 80 px: height and corner radius of grid tiles | 151, 34 |
| `layout.gapX`, `gapY` | 8 to 48 px: spacing in the grid | 24, 26 |
| `layout.dockW`, `dockH`, `dockRadius`, `dockGap` | 240 to 500, 140 to 300, 0 to 80, 8 to 60 px: the dock tiles | 408, 230, 36, 32 |
| `layout.fontScale` | 0.8 to 1.3: scale of the clock, app name, button and menu text | 1 |
| `layout.clock` | `left`, `right`, `stack` (time above the date) or `off` | `left` |
| `layout.clockScale` | 0.8 to 2: extra scale of the time | 1 |
| `layout.dock` | `top` (dock above the grid) or `bottom` (dock at the bottom of the screen; the grid opens as an overlay with Down and closes with Up or Back) | `top` |
| `layout.dockCount` | 4 to 6: apps in the dock | 4 |
| `layout.dockPanel` | 0 to 0.5: opacity of a translucent panel behind the dock tiles; 0 for none | 0 |
| `layout.bar` | `pills` (icon and label) or `round` (icon only) top buttons | `pills` |
| `layout.name` | `show` or `hide` the large name of the focused app | `show` |
| `effects.gloss` | 0 to 1: a light highlight on the tiles | 0 |
| `effects.glow` | 0 to 1: strength of the ambient glow | 1 |
| `effects.glowColor` | `app` (taken from the focused icon) or `accent` | `app` |
| `effects.speed` | 0 to 2: animation speed multiplier; 0 switches the animations off | 1 |
| `effects.wallpaper` | A file name in `helper/themes/wallpapers/`: `.jpg`, `.png` or `.webp`, at most 1.5 MB; it is drawn at 1920 x 1080 | none |
| `effects.wallpaperDim` | 0 to 0.9: how far the wallpaper is darkened with the background colour | 0.4 |

A theme file holds values only. The service checks every value against this list and clamps numbers to their range; there is no CSS
and no script, and a wallpaper path is accepted only as a plain file name from the bundled folder that is also a real image of the
right type. Anything else is ignored. The launcher draws the wallpaper once and nothing blurs or filters it, because the TV's GPU is weak.

From a shell on the TV:

```sh
curl localhost:8765/api/theme/list
curl -X POST localhost:8765/api/theme/set -d '{"id":"midnight","accent":"#ff8a3d"}'
curl -X POST localhost:8765/api/theme/revert
```
