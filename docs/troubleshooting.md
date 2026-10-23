# Troubleshooting

- **Black screen after switching or rebooting.** Wait a minute; if it stays black, restart the TV. If the new Home does not come
  up, the setup removes the boot scripts and restarts the TV with LG's Home by itself.
- **The Home button opens LG's full-screen Home, not CleanYourTV.** Some TVs have a Home Style setting. Set TV Settings > General >
  Home Settings > Home Style to Basic.
- **An app is missing from the grid.** Check **Hidden apps** in Customise. Apps without a launch icon are not listed.
- **After a firmware update removed root.** Re-root, then run the [install command](install.md#1-install-the-manager-app) and the setup again.
- **The Input key opens LG's picker.** Check the Input key switch in the manager app and run **Learn the Input key**.
- **A loading circle appears every half minute and the remote stops responding for a moment.** The Inputs list is started in the
  background so that the Input key opens it at once, and some TVs (webOS 6.5 reports) close it again. From v1.5.13 the service
  notices that the system closed it twice, stops doing it and writes that to `config.json` (`picker.prewarm: false`); the first press of
  the Input key then takes a few seconds. **Input key** > **Keep the Inputs list ready** switches it on or off by hand; switching
  the Input key off entirely stops it too.
- **The manager list does not show Share log or Uninstall.** Before v1.5.13 the list could not scroll; update, then move down: the
  list scrolls and fades where more rows are hidden.
- **The service restarts by itself.** On some TVs Node.js 8 stops with `uv_close: Assertion ... failed`. From v1.5.13 the service
  logs its last operations when it finds that the previous run ended without a clean exit; they appear in **Share log** under the
  service log, so a report names the cause.
- **`FAILED_IPKG_INSTALL`.** Remove the `com.cleanyourtv.manager` entry marked `half-installed` from
  `/media/developer/apps/var/lib/opkg/status` and install again.
- **Live TV shows the setup code again.** The playlist address was reset or never saved; run the pairing again, or send it with
  `POST /api/live/settings` ([Live TV](live-tv.md#setting-it-up)).
- **Something is broken after an update.** A launcher or service that does not start is replaced by the previous version
  automatically. **Go back to launcher** in the manager returns to the previous launcher by hand.
- **Back to LG's Home right now.** In the manager, **CleanYourTV as Home** off, or `sh /media/developer/cleanyourtv/undo-home.sh`
  over SSH.

## Reporting a problem

Open an [issue](https://github.com/lasharor/cleanyourtv-WebOS/issues) and attach the output of **Share log**
(manager app, see [The manager app](manager.md#share-log)). It is masked, so it does not contain your addresses or keys. Say which
TV and firmware you have and what you expected.
