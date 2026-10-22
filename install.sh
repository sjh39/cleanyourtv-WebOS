#!/bin/sh
# CleanYourTV for LG webOS: installer. Run ON the TV, as root (see README.md).
#
# Interactive (asks what to install; needs a terminal, so use ssh -t):
#   ssh -t root@<tv-ip> 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh)"'
# Without a terminal it installs everything with the defaults:
#   ssh root@<tv-ip> 'curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh | sh'
#
# Options (they also skip the matching question):
#   -y, --yes        do not ask anything, use the defaults
#   --no-debloat     launcher only, leave LG's services and the hosts file alone
#   --no-notify      do not install the picture-notification overlay
#   --no-start       install, but only take effect on the next reboot
#   --no-verify      skip the post-install check and the automatic rollback
#   --force          continue even if this TV looks unsupported
#
# Environment: CYTV_REPO=owner/name  CYTV_REF=branch  CYTV_SRC=/path/to/repo-checkout (use a local copy instead of downloading)

usage() {
  cat <<'USAGE'
CleanYourTV for LG webOS: installer (run on the TV, as root)
  -y, --yes        do not ask anything, use the defaults
  --no-debloat     launcher only, leave LG's services and the hosts file alone
  --no-notify      do not install the picture-notification overlay
  --no-start       install, but only take effect on the next reboot
  --no-verify      skip the post-install check and the automatic rollback
  --force          continue even if this TV looks unsupported
USAGE
}

main() {
  REPO="${CYTV_REPO:-lasharor/cleanyourtv-WebOS}"
  REF="${CYTV_REF:-main}"
  D=/media/developer/cleanyourtv
  INITD=/var/lib/webosbrew/init.d
  TESTED_SDK="10."          # firmware this has been tried on: webOS 25 (sdkVersion 10.x)
  DEBLOAT=""; START=""; NOTIFY=""; VERIFY=1; FORCE=0; YES=0
  for a in "$@"; do
    case "$a" in
      -y|--yes) YES=1 ;;
      --no-debloat) DEBLOAT=0 ;;
      --no-start) START=0 ;;
      --no-verify) VERIFY=0 ;;
      --force) FORCE=1 ;;
      --no-notify) NOTIFY=0 ;;
      -h|--help) usage; return 0 ;;
      *) echo "unknown option: $a (try --help)"; return 1 ;;
    esac
  done
  export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH

  say() { echo "[cleanyourtv] $*"; }
  warn() { echo "[cleanyourtv] WARNING: $*" >&2; }
  die() { echo "[cleanyourtv] ERROR: $*" >&2; exit 1; }
  install_notify() {
    python3 $D/build-ipk.py $D/notify-app /tmp/cytv-notify.ipk || { warn "could not build the notification app"; return; }
    # right after the system app manager restarts an install can be silently dropped, so check and retry
    n=0
    while [ $n -lt 4 ]; do
      luna-send -n 1 -w 30000 -f luna://com.webos.appInstallService/dev/install '{"id":"com.cleanyourtv.notify","ipkUrl":"/tmp/cytv-notify.ipk","subscribe":false}' </dev/null >/dev/null 2>&1
      sleep 6
      luna-send -n 1 -w 5000 -f luna://com.webos.applicationManager/getAppInfo '{"id":"com.cleanyourtv.notify"}' </dev/null 2>/dev/null | grep -q '"returnValue": true' && { say "notification overlay installed"; rm -f /tmp/cytv-notify.ipk; return; }
      n=$((n+1)); sleep 5
    done
    warn "could not install the notification overlay"; rm -f /tmp/cytv-notify.ipk
  }
  luna() { luna-send -n 1 -w 5000 -f "luna://$1" "$2" </dev/null 2>/dev/null; }

  # ---- preflight ----
  [ "$(id -u)" = 0 ] || die "run as root (ssh root@<tv-ip>)"
  command -v luna-send >/dev/null || die "this does not look like webOS (no luna-send)"
  [ -d "$INITD" ] || die "$INITD not found: root with the Homebrew Channel is required (https://rootmy.tv)"
  [ -w /media/developer ] || die "/media/developer is not writable"
  for t in curl tar python3 node; do command -v $t >/dev/null || die "missing tool: $t"; done
  HOME_DIR=/usr/palm/applications/com.webos.app.home
  [ -f $HOME_DIR/appinfo.json ] || die "stock Home app not found at $HOME_DIR"
  if grep -q " $HOME_DIR " /proc/mounts && [ ! -f $D/backup/home-appinfo.orig.json ]; then
    die "Home is already replaced but no backup exists; reboot the TV once, then run this again"
  fi

  # ---- what to install (asked only when a terminal is available) ----
  INTERACTIVE=0
  if [ $YES = 0 ] && ( : </dev/tty ) 2>/dev/null; then INTERACTIVE=1; fi
  ask() {   # ask "question" default(y|n)  ->  0 = yes, 1 = no
    while :; do
      if [ "$2" = y ]; then printf '%s [Y/n] ' "$1" >/dev/tty; else printf '%s [y/N] ' "$1" >/dev/tty; fi
      read -r ans </dev/tty || return 1
      case "$ans" in "") [ "$2" = y ]; return ;; y|Y|yes|YES|Yes) return 0 ;; n|N|no|NO|No) return 1 ;; *) echo "please answer y or n" >/dev/tty ;; esac
    done
  }
  if [ $INTERACTIVE = 1 ]; then
    {
      echo
      echo "CleanYourTV for LG webOS"
      echo "------------------------"
      echo "The launcher (a clean Apple TV-style Home with a built-in Live TV player for your own M3U playlist)"
      echo "is always installed. Everything else is optional; Enter accepts the suggestion."
      echo
    } >/dev/tty
    if [ -z "$DEBLOAT" ]; then
      echo "Debloat: stops LG's ad, recommendation and telemetry services and blocks a few ad servers." >/dev/tty
      echo "Nothing is uninstalled; a reboot without the boot script undoes it." >/dev/tty
      ask "Debloat LG's ads and telemetry?" y && DEBLOAT=1 || DEBLOAT=0; echo >/dev/tty
    fi
    if [ -z "$NOTIFY" ]; then
      echo "Notifications with a picture: a small hidden app that shows a card with a photo (for example a camera" >/dev/tty
      echo "snapshot) on top of any app when you send it a message from your network." >/dev/tty
      ask "Install the picture-notification overlay?" y && NOTIFY=1 || NOTIFY=0; echo >/dev/tty
    fi
    if [ -z "$START" ]; then
      echo "Starting now restarts the system app manager (the screen blinks once). Otherwise everything" >/dev/tty
      echo "takes effect at the next reboot." >/dev/tty
      ask "Start now?" y && START=1 || START=0; echo >/dev/tty
    fi
    {
      echo "Summary:"
      echo "  launcher + Live TV        yes"
      echo "  debloat                   $([ "$DEBLOAT" = 1 ] && echo yes || echo no)"
      echo "  picture notifications     $([ "$NOTIFY" = 1 ] && echo yes || echo no)"
      echo "  start now                 $([ "$START" = 1 ] && echo yes || echo 'no, at next reboot')"
      echo
    } >/dev/tty
    ask "Go ahead?" y || { echo "Nothing was changed." >/dev/tty; return 0; }
  fi
  [ -z "$DEBLOAT" ] && DEBLOAT=1
  [ -z "$NOTIFY" ] && NOTIFY=1
  [ -z "$START" ] && START=1

  # ---- is this a TV we know? (a warning, not a block, unless the Home app looks different) ----
  info=$(luna com.webos.service.tv.systemproperty/getSystemInfo '{"keys":["modelName","firmwareVersion","sdkVersion"]}')
  model=$(echo "$info" | sed -n 's/.*"modelName": *"\([^"]*\)".*/\1/p')
  fw=$(echo "$info" | sed -n 's/.*"firmwareVersion": *"\([^"]*\)".*/\1/p')
  sdk=$(echo "$info" | sed -n 's/.*"sdkVersion": *"\([^"]*\)".*/\1/p')
  say "TV: ${model:-unknown model}, firmware ${fw:-?}, webOS SDK ${sdk:-?}"
  case "$sdk" in
    $TESTED_SDK*) ;;
    *) warn "only webOS SDK $TESTED_SDK* (webOS 25) has been tested; other versions may behave differently. The original state is backed up and 'undo-home.sh' restores LG's Home." ;;
  esac
  SRCINFO=$D/backup/home-appinfo.orig.json
  [ -f "$SRCINFO" ] || SRCINFO=$HOME_DIR/appinfo.json
  python3 - "$SRCINFO" <<'PY' || { [ $FORCE = 1 ] && warn "continuing because of --force" || die "LG's Home app looks different from what this installer expects (use --force to try anyway)"; }
import json, sys
o = json.load(open(sys.argv[1]))
sys.exit(0 if o.get('id') == 'com.webos.app.home' and o.get('type') in ('flutter', 'web') else 1)
PY

  # ---- fetch ----
  if [ -n "$CYTV_SRC" ]; then
    SRC="$CYTV_SRC"
  else
    T=$(mktemp -d /tmp/cytv.XXXXXX) || die "mktemp failed"
    say "downloading $REPO ($REF)"
    curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/$REF" | tar xz -C "$T" || die "download failed"
    SRC=$(ls -d "$T"/*/ 2>/dev/null | head -1)
  fi
  [ -f "$SRC/app/index.html" ] || die "launcher files not found in the download"
  trap '[ -n "$T" ] && rm -rf "$T"' EXIT
  VERSION=$(sed -n "s/^const VERSION = '\(.*\)';/\1/p" "$SRC/helper/helper.js" | head -1)

  # ---- back up the original state (first run only) ----
  mkdir -p $D/backup
  [ -f $D/backup/home-appinfo.orig.json ] || cp $HOME_DIR/appinfo.json $D/backup/home-appinfo.orig.json
  [ -f $D/backup/hosts.orig ] || cp /etc/hosts $D/backup/hosts.orig
  [ -f $D/backup/processes.orig.txt ] || { ps > $D/backup/processes.orig.txt 2>&1; systemctl list-units --no-legend > $D/backup/units.orig.txt 2>&1; date > $D/backup/date.txt; }
  say "original state saved in $D/backup"

  # ---- install files ----
  mkdir -p $D/app
  cp "$SRC"/app/* $D/app/
  cp "$SRC"/helper/*.js $D/
  mkdir -p $D/notify-app && cp "$SRC"/notify/app/* $D/notify-app/
  cp "$SRC"/scripts/* "$SRC"/uninstall.sh $D/
  chmod +x $D/*.sh $D/10-cleanyourtv-home $D/15-cleanyourtv-debloat
  [ -f $D/config.json ] || cp "$SRC/config.example.json" $D/config.json
  echo "$REPO $REF" > $D/source
  rm -f $D/DISABLE $D/DISABLE-DEBLOAT

  ln -sf $D/10-cleanyourtv-home $INITD/10-cleanyourtv-home
  if [ $DEBLOAT = 1 ]; then
    ln -sf $D/15-cleanyourtv-debloat $INITD/15-cleanyourtv-debloat
  else
    rm -f $INITD/15-cleanyourtv-debloat
  fi
  say "version ${VERSION:-?}; boot scripts installed in $INITD"

  # ---- go live ----
  if [ $START = 0 ]; then
    say "done. Everything takes effect at the next reboot."
    return 0
  fi
  say "starting (the screen blinks once while the system app manager restarts)"
  pkill -f "[c]leanyourtv/helper.js"; pkill -f "[l]una-send -i -f"; sleep 1   # an older helper (and its leftovers) must not keep running
  sh $D/10-cleanyourtv-home </dev/null
  [ $DEBLOAT = 1 ] && sh $D/debloat-stop.sh </dev/null

  # ---- verify, and roll back if the new Home did not come up ----
  if [ $VERIFY = 1 ]; then
    say "checking that the new Home came up..."
    ok=0
    for i in $(seq 1 40); do
      sleep 3
      type=$(luna com.webos.applicationManager/getAppInfo '{"id":"com.webos.app.home"}' | sed -n 's/.*"type": *"\([^"]*\)".*/\1/p' | head -1)
      hv=$(curl -s -m 3 http://127.0.0.1:8765/api/version | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')
      if [ "$type" = web ] && [ "$hv" = "$VERSION" ]; then ok=1; break; fi
    done
    if [ $ok = 0 ]; then
      warn "the new Home did not come up (app type: ${type:-none}, helper: ${hv:-not answering}); rolling back"
      sh $D/undo-home.sh temp </dev/null
      rm -f $INITD/10-cleanyourtv-home $INITD/15-cleanyourtv-debloat
      die "rolled back: LG's Home is restored and the boot scripts are removed. Nothing else was changed. Details: /tmp/cleanyourtv-helper.log"
    fi
  fi
  # earlier test builds installed Live TV as a separate app; it is part of the launcher now
  luna-send -n 1 -w 20000 -f luna://com.webos.appInstallService/dev/remove '{"id":"com.cleanyourtv.live","subscribe":false}' </dev/null >/dev/null 2>&1; rm -rf /media/developer/apps/usr/palm/packages/com.cleanyourtv.live /media/developer/apps/usr/palm/applications/com.cleanyourtv.live
  [ $NOTIFY = 1 ] && install_notify
  say "done. Hold OK on an app to customise the dock, or use the Customise button at the top right."
  say "Back to LG's Home any time: pick 'Restore LG Home' at the end of the app grid,"
  say "or run: sh $D/undo-home.sh      Update: sh $D/update.sh      Remove everything: sh $D/uninstall.sh"
}
main "$@"
