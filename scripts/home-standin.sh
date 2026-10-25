#!/bin/sh
# Stands in for LG's Home program on TVs where LG's Home is the native app (tvprofile.js homeTakeover 'standin'). 10-cleanyourtv-home
# bind-mounts this file over that program, so the app manager (SAM) keeps LG's Home manifest and starts this script whenever Home is
# launched; it does not have to be restarted (issues 14, 23 and 24). The script asks webapp-mgr to open the launcher as
# com.webos.app.home and stays running. It also tries to register with SAM as Home: then the Home key sends it a "relaunch" and the
# launcher is shown again; without registration SAM restarts this script on the Home key, which shows the launcher the same way.
# Every step is written to /tmp/cleanyourtv-boot.log, which Share log includes.
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
L=/media/developer/cleanyourtv
LOG=/tmp/cleanyourtv-boot.log
up() { cut -d' ' -f1 /proc/uptime; }
log() { echo "$(up) home-standin[$$]: $*" >> $LOG 2>/dev/null; }

# a previous copy that SAM killed leaves its registration and reader behind
for p in $(pgrep -f "^/bin/sh $0"); do [ "$p" != $$ ] && kill "$p" 2>/dev/null; done
pkill -f "[l]una-send -i -a com.webos.app.home" 2>/dev/null

show() {
  for f in $L/wam-launch.json $L/wam-launch.json.str; do
    [ -f $f ] || continue
    r=$(luna-send -n 1 -w 8000 luna://com.palm.webappmanager/launchApp "$(cat $f)" </dev/null 2>&1 | tr -d '\n')
    if echo "$r" | grep -q '"returnValue": *true'; then log "launcher shown ($1)"; return 0; fi
    log "webapp-mgr refused ${f##*/}: $(echo "$r" | cut -c1-200)"
  done
  return 1
}

log "started as uid $(id -u), arguments: $(echo "$*" | cut -c1-200)"
show start

# the registration: SAM's events arrive one JSON line each
for m in registerApp registerNativeApp; do
  luna-send -i -a com.webos.app.home "luna://com.webos.applicationManager/$m" '{}' </dev/null 2>&1 | while read -r line; do
    case "$line" in
      *'"event"'*relaunch*) show relaunch ;;
      *'"event"'*close*) log "closed by the app manager"; kill $$ 2>/dev/null; exit 0 ;;
      *'"event"'*registered*) log "registered with the app manager ($m)" ;;
      *'"returnValue"'*false*) log "$m refused: $(echo "$line" | cut -c1-200)" ;;
    esac
  done
  log "$m ended"
done

log "running without registration: the app manager restarts this script on the Home key"
while :; do sleep 60; done
