# The Input key

The remote's **Input** button opens an Inputs picker over the running app.

![Inputs picker on the Input key](screenshots/picker.jpg)

The picker shows the dock apps in a row, the inputs below (each with its port and what is connected, and a green dot on the
active one) and, when [Live TV](live-tv.md) is on, **Live TV**.

| Key | Action |
|---|---|
| Left / Right | Move |
| Up / Down | Switch rows |
| OK | Open |
| Back or Input | Close |

The pointer works too.

## How it works

It uses the bundled [inputhook](credits.md#inputhook) library, which injects a small hook into LG's input process so that a remote
button can run a command. The Input button's code is **241** by default. The command opens the picker app
(`com.cleanyourtv.picker`) over whatever is on screen.

## Learning your remote's code

Remotes differ. In the manager app, **Input key** > **Learn the Input key** reads the code of the button you press and tests that
the picker opens. **Clear** restores the default.

The switch in the same menu removes the bind and gives the button back to LG's own picker. **Learn the Home key** is optional.

**Learn the Guide key** binds the Guide button to the [Live TV](live-tv.md#the-guide-button) channel guide. It is off until you learn a code and
while Live TV is switched off.

!!! note "When the hook is not attached"
    On some firmware the hook cannot attach. The manager then shows the Input key as not available and LG's picker is used.
