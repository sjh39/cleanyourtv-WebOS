#!/bin/sh
# Run by the inputhook when the remote's Input button is pressed: show the Inputs picker over the current app.
# The service writes how in picker-mode: overlay = the picker app that was started hidden at boot (instant), ondemand = start the picker app
# now and let it close itself after use (older webOS, where a hidden overlay kept the remote), launcher = the launcher's own Inputs list.
# If the picker app is missing, open the launcher's Inputs list instead.
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
M=$(cat /media/developer/cleanyourtv/picker-mode 2>/dev/null)
HOME_INPUTS='{"id":"com.webos.app.home","params":{"inputs":true}}'
if [ "$M" = launcher ]; then
  luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch "$HOME_INPUTS" </dev/null >/dev/null 2>&1
  exit 0
fi
if [ "$M" = ondemand ]; then P='{"id":"com.cleanyourtv.picker","params":{"ondemand":true}}'; else P='{"id":"com.cleanyourtv.picker"}'; fi
r=$(luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch "$P" </dev/null 2>/dev/null)
case "$r" in *'"returnValue":true'*) exit 0 ;; esac
luna-send -n 1 -w 3000 luna://com.webos.applicationManager/launch "$HOME_INPUTS" </dev/null >/dev/null 2>&1
