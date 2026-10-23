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

## Keeping it ready

The Inputs list is a small app. A cold start takes about eight seconds, so the service starts it hidden in the background after boot
and the key only wakes it. Some TVs close a hidden app again straight away, which shows a loading circle each time. The service
counts the starts; if it has to start the picker three times in ten minutes, the system keeps closing it, and the service stops starting it (saved in `config.json` as
`picker.prewarm: false`) and the first press of the Input key takes a few seconds instead. **Input key** > **Keep the Inputs list
ready** in the manager app shows the state and switches it on or off.

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
