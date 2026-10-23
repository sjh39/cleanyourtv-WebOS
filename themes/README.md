# Themes

The bundled themes of CleanYourTV. A theme changes how the home screen looks: colours, the position and size of the clock, buttons,
app name, dock and grid, text, effects and a wallpaper. Choose one in the manager app under **Theme**.

[![Classic, Midnight, Warm and Bloom](../docs/screenshots/themes-readme.jpg)](../docs/screenshots/themes-readme.jpg)

Each `<id>.json` here is one theme; `wallpapers/` holds the images they use. They are packaged with the service. Every setting a
theme can use, with its range and default, is in the [Themes page of the documentation](https://lasharor.github.io/cleanyourtv-WebOS/themes/).
The pictures are the launcher page rendered in a browser with each theme.

## Make your own

1. Copy a theme that is close to what you want, for example `classic.json`, to `<id>.json` (lower-case letters, digits and `-`).
2. Change only what you want to change. A missing value keeps the default, or the value of the theme named in `"extends"`.
3. If it uses a wallpaper, put a `.jpg`, `.png` or `.webp` (at most 1.5 MB, 1920 x 1080) in `wallpapers/` and name it in `effects.wallpaper`.
4. Check it: `node tools/node8-check.js` validates every theme in this folder.
5. Open a pull request with the file, the wallpaper and, if you can, a screenshot. A wallpaper must be your own work or under a licence
   that allows redistribution; say which.

### Classic

The original look: near-black, white focus, ten columns.

[![Classic](../docs/screenshots/theme-classic.jpg)](../docs/screenshots/theme-classic.jpg)

File: [`classic.json`](classic.json)

### Midnight

Deep blue with a soft wallpaper and a blue focus.

[![Midnight](../docs/screenshots/theme-midnight.jpg)](../docs/screenshots/theme-midnight.jpg)

File: [`midnight.json`](midnight.json)

### OLED black

Pure black, no ambient glow: unlit pixels stay off.

[![OLED black](../docs/screenshots/theme-oled.jpg)](../docs/screenshots/theme-oled.jpg)

File: [`oled.json`](oled.json)

### Warm

Brown and amber with the glow in the accent colour.

[![Warm](../docs/screenshots/theme-warm.jpg)](../docs/screenshots/theme-warm.jpg)

File: [`warm.json`](warm.json)

### Compact

Twelve columns of smaller tiles: more apps on screen.

[![Compact](../docs/screenshots/theme-compact.jpg)](../docs/screenshots/theme-compact.jpg)

File: [`compact.json`](compact.json)

### Large print

Eight columns of big tiles and bigger text, easier to read from the sofa.

[![Large print](../docs/screenshots/theme-large.jpg)](../docs/screenshots/theme-large.jpg)

File: [`large.json`](large.json)

### Still

No animation and a quiet glow, for anyone who prefers a calm screen.

[![Still](../docs/screenshots/theme-still.jpg)](../docs/screenshots/theme-still.jpg)

File: [`still.json`](still.json)

### Bloom

A flower wallpaper with the dock at the bottom in a glass panel, round buttons and a stacked clock. Down opens all apps.

[![Bloom](../docs/screenshots/theme-bloom.jpg)](../docs/screenshots/theme-bloom.jpg)

File: [`bloom.json`](bloom.json)
