#!/bin/sh
# Run by the inputhook when the remote's Input button is pressed: show the Inputs picker over the current app.
# If the picker app is missing, or the service chose the launcher mode (older webOS, where the hidden picker keeps the remote), open the
# launcher's Inputs list instead.
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
if [ "$(cat /media/developer/cleanyourtv/picker-mode 2>/dev/null)" = launcher ]; then
  luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch '{"id":"com.webos.app.home","params":{"inputs":true}}' </dev/null >/dev/null 2>&1
  exit 0
fi
r=$(luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch '{"id":"com.cleanyourtv.picker"}' </dev/null 2>/dev/null)
case "$r" in *'"returnValue":true'*) exit 0 ;; esac
luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch '{"id":"com.webos.app.home","params":{"inputs":true}}' </dev/null >/dev/null 2>&1
