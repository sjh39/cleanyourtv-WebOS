#!/bin/sh
# CleanYourTV for LG webOS: uninstaller. Run on the TV as root:  sh /media/developer/cleanyourtv/uninstall.sh
# Restores LG's Home and services, gives the Input key back to LG, removes the apps, the boot scripts and
# /media/developer/cleanyourtv. (The inputhook stays loaded in LG's input process until the next reboot; without
# a bind it does nothing.) Pass --keep-config to keep your settings (config.json) and usage history.
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
D=/media/developer/cleanyourtv
INITD=/var/lib/webosbrew/init.d
[ "$(id -u)" = 0 ] || { echo "run as root"; exit 1; }
rm -f $INITD/10-cleanyourtv-home $INITD/15-cleanyourtv-debloat
[ -f $D/debloat-undo.sh ] && sh $D/debloat-undo.sh </dev/null
pkill -f "[1]0-cleanyourtv-home"   # the watchdog would restart the service
pkill -f "[c]leanyourtv/helper.js"
# our Input-key bind
python3 - <<'PY'
import json
p = '/home/root/.config/lginputhook/keybinds.json'
try:
    b = json.load(open(p))
    if '241' in b and 'cleanyourtv' in b['241'].get('command', ''):
        del b['241']; json.dump(b, open(p, 'w'))
except Exception:
    pass
PY
if grep -q " /usr/palm/applications/com.webos.app.home " /proc/mounts; then sh $D/undo-home.sh temp </dev/null; fi
if [ "$1" = --keep-config ]; then mkdir -p /media/developer/cytv-keep; cp $D/config.json $D/usage.json /media/developer/cytv-keep/ 2>/dev/null; fi
for id in com.cleanyourtv.picker com.cleanyourtv.notify com.cleanyourtv.live com.cleanyourtv.manager; do
  luna-send -n 1 -w 20000 -f luna://com.webos.appInstallService/dev/remove "{\"id\":\"$id\",\"subscribe\":false}" </dev/null >/dev/null 2>&1
  rm -rf /media/developer/apps/usr/palm/packages/$id /media/developer/apps/usr/palm/applications/$id
done
rm -rf /media/developer/apps/usr/palm/services/com.cleanyourtv.manager.service
rm -rf $D
[ "$1" = --keep-config ] && { mkdir -p $D; mv /media/developer/cytv-keep/* $D/ 2>/dev/null; rmdir /media/developer/cytv-keep; }
echo "[cleanyourtv] removed. LG's Home and services are back."
