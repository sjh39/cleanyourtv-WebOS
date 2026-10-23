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

## What the key shows

The Input button can show the Inputs list in two ways. **Over the running app** (webOS 25 and newer): a small app, `com.cleanyourtv.picker`,
is started hidden in the background after boot and the key only wakes it; a cold start takes about eight seconds. **The launcher's own
list**: the TV goes to Home with the Inputs list open; nothing runs in the background. On older webOS (6.5 reports) the hidden app
kept the remote and showed a loading circle, so webOS before 10 uses the launcher's list by default, and on any TV the service switches
to it when it has to start the background app three times in ten minutes (`picker.mode: launcher` in `config.json`).
**Input key** > **Input key shows** in the manager app chooses; **Keep the Inputs list ready** switches the background start on or off.

## How it works

It uses the bundled [inputhook](credits.md#inputhook) library, which injects a small hook into LG's input process so that a remote
button can run a command. The Input button's code is **241** by default. The command opens the picker app
(`com.cleanyourtv.picker`) over whatever is on screen.

## Learning your remote's code

Remotes differ. In the manager app, **Input key** > **Learn the Input key** reads the code of the button you press and tests that
the picker opens. **Clear** restores the default.

The switch in the same menu removes the bind and gives the button back to LG's own picker. **Learn the Home key** is optional.

The Guide button can be bound the same way; that is part of [Live TV](live-tv.md#the-guide-button) (manager app > **Live TV** > **Learn the Guide key**).

!!! note "When the hook is not attached"
    On some firmware the hook cannot attach. The manager then shows the Input key as not available and LG's picker is used.
