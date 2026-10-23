# The launcher

The launcher replaces LG's Home. It is a web page of the project that the TV's browser runs, so it starts fast and works the
same on every supported webOS version.

![Home screen](screenshots/home.jpg)

## The screen

- **Dock.** Up to four apps, large, on the first row.
- **Top shelf.** The name of the focused app and an ambient glow taken from its icon.
- **Grid.** All other apps, sorted by how often you use each one (or A to Z).
- **Top buttons.** Inputs, Live TV, Settings and Customise, and a clock. The buttons you see are yours to change.

## Keys

| Action | How |
|---|---|
| Open an app | OK |
| App options (dock, hide) | Hold OK on an app |
| Remove a top button | Hold OK on it |
| Customise | The **Customise** button |
| Live TV | The **Live TV** button or tile |
| Switch input | The **Inputs** button |

The Magic Remote pointer works too: pointing and clicking, and holding the button on an app for its options.

![App options](screenshots/options.jpg)

## Customise

![Customise menu](screenshots/customise.jpg)

**Customise** holds:

- the **top buttons** (add Inputs, Settings, Live TV or any app, or remove one),
- **hidden apps** (show them again),
- the **app order** (most used first, or A to Z),
- the **clock** format (automatic, 12 or 24 hour),
- **Reset customisation**.

The dock holds up to four apps. Hold OK on an app and choose **Add to dock**, **Move left**, **Move right** or **Remove from dock**.

## Inputs

The **Inputs** button lists HDMI inputs by the names LG shows, with what is connected and a marker on the active one. OK
switches to the input.

![Inputs menu](screenshots/inputs.jpg)

## Icons

Each tile uses the app's own icon. The tile colour is taken from the icon's edge colour, so an icon that reaches its edges blends
into the tile, and the ambient glow comes from the icon's most vivid colour. Colours are worked out once per app and remembered.

!!! note "Icons with a transparent margin"
    An icon that is an opaque square with a transparent margin around it (many LG icons) can look boxed in on its tile. A fix
    that fills the tile is available as a test build; see [Test builds](managing.md#test-builds).

## Language

Menus follow the TV's language: English, Dutch, German, French and Spanish.

## Themes

The look of the home screen (colours, tile and text size, columns, clock, glow, animation speed, wallpaper) is a [theme](themes.md),
chosen in the manager app.

## Settings file

Settings are stored on the TV in `/media/developer/cleanyourtv/config.json`:

| Key | Meaning |
|---|---|
| `dock` | App ids in the dock (up to four). |
| `topbar` | The buttons at the top. |
| `hidden` | App ids you hid. |
| `sort` | `usage` or `alpha`. |
| `clock` | `auto`, `12` or `24`. |

See [`config.example.json`](https://github.com/lasharor/cleanyourtv-WebOS/blob/main/config.example.json). Change settings in
the launcher; the file is read and written by the service.
