#!/bin/sh
# CleanYourTV service bootstrap. Runs as root on the TV, from the service folder of the installed package:
#   sh bootstrap.sh install [--no-debloat] [--no-input-key] [--no-start] [--no-verify] [--force]
#   sh bootstrap.sh update <version>      after the manager installed a newer package (restarts the service, undoes it if it fails)
# It copies the service files to /media/developer/cleanyourtv, installs the boot scripts, replaces LG's Home and
# starts the service. Idempotent: running it again repairs a broken install.
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
S=$(cd "$(dirname "$0")" && pwd)
D=/media/developer/cleanyourtv
INITD=/var/lib/webosbrew/init.d
J="node $S/scripts/jtool.js"   # JSON helper (node, not python3)
HOME_DIR=/usr/palm/applications/com.webos.app.home
TESTED_SDK="10."   # firmware this has been tried on: webOS 25 (sdkVersion 10.x)

MODE=${1:-install}; [ $# -gt 0 ] && shift
WANT=""; [ "$MODE" = update ] && { WANT=$1; shift; }
DEBLOAT=""; INPUTKEY=""; START=1; VERIFY=1; FORCE=0
for a in "$@"; do
  case "$a" in
    --no-debloat) DEBLOAT=0 ;; --debloat) DEBLOAT=1 ;;
    --no-input-key) INPUTKEY=0 ;; --input-key) INPUTKEY=1 ;;
    --no-start) START=0 ;; --no-verify) VERIFY=0 ;; --force) FORCE=1 ;;
    *) echo "unknown option: $a"; exit 1 ;;
  esac
done

say() { echo "[cleanyourtv] $*"; }
warn() { echo "[cleanyourtv] WARNING: $*" >&2; }
die() { echo "[cleanyourtv] ERROR: $*" >&2; exit 1; }
luna() { luna-send -n 1 -w 5000 -f "luna://$1" "$2" </dev/null 2>/dev/null; }
svc_version() { sed -n "s/^const VERSION = '\(.*\)';/\1/p" "$1" | head -1; }

# The picker and notification apps ship in the same package as the manager, but the system app manager only learns about
# the extra apps when it restarts. Restart it once if they are missing (the screen blinks).
ensure_apps() {
  missing=0
  for id in com.cleanyourtv.picker com.cleanyourtv.notify; do
    [ -d /media/developer/apps/usr/palm/applications/$id ] && ! luna com.webos.applicationManager/getAppInfo "{\"id\":\"$id\"}" | grep -q '"returnValue": true' && missing=1
  done
  [ $missing = 0 ] && return 0
  say "registering the overlay apps (the screen blinks once)"
  (sleep 3; pkill -9 -f /usr/palm/applications/airplay/LunaExecutable) </dev/null >/dev/null 2>&1 &
  systemctl restart sam
  for i in $(seq 1 60); do systemctl is-active sam >/dev/null && break; sleep 2; done
  sleep 10
  pkill -f "[a]pp-id=com.webos.app.home"; sleep 2
  luna-send -n 1 -w 10000 -f luna://com.webos.applicationManager/launch '{"id":"com.webos.app.home"}' </dev/null >/dev/null
}

# ---- preflight ----
[ "$(id -u)" = 0 ] || die "run as root"
command -v luna-send >/dev/null || die "this does not look like webOS (no luna-send)"
[ -d "$INITD" ] || die "$INITD not found: root with the Homebrew Channel is required (https://rootmy.tv)"
[ -w /media/developer ] || die "/media/developer is not writable"
for t in tar node; do command -v $t >/dev/null || die "missing tool: $t"; done
# hard requirements: --force does not skip these (older webOS has no systemd and an old Node that cannot run the service)
command -v systemctl >/dev/null || die "this TV has no systemd (webOS older than 5): CleanYourTV needs a newer webOS and cannot be set up here. Nothing was changed."
node -e '(()=>1)()' >/dev/null 2>&1 || die "this TV's Node.js ($(node -v 2>&1 | head -1)) is too old for the service: CleanYourTV needs a newer webOS and cannot be set up here. Nothing was changed."
[ -f $S/helper/helper.js ] && [ -f $S/scripts/10-cleanyourtv-home ] || die "the service files are incomplete in $S"
[ -f $HOME_DIR/appinfo.json ] || die "stock Home app not found at $HOME_DIR"
if grep -q " $HOME_DIR " /proc/mounts && [ ! -f $D/backup/home-appinfo.orig.json ]; then
  die "Home is already replaced but no backup exists; reboot the TV once, then run this again"
fi
if [ "$MODE" = install ]; then
  info=$(luna com.webos.service.tv.systemproperty/getSystemInfo '{"keys":["modelName","firmwareVersion","sdkVersion"]}')
  model=$(echo "$info" | sed -n 's/.*"modelName": *"\([^"]*\)".*/\1/p')
  fw=$(echo "$info" | sed -n 's/.*"firmwareVersion": *"\([^"]*\)".*/\1/p')
  sdk=$(echo "$info" | sed -n 's/.*"sdkVersion": *"\([^"]*\)".*/\1/p')
  say "TV: ${model:-unknown model}, firmware ${fw:-?}, webOS SDK ${sdk:-?}"
  # the compatibility list: firmware known to work is set up without --force (a newer copy is fetched from the repository when possible)
  mkdir -p $D
  COMPATREPO=$(cut -d' ' -f1 $D/source 2>/dev/null); [ -n "$COMPATREPO" ] || COMPATREPO=lasharor/cleanyourtv-WebOS
  curl -fsSL -m 6 "https://raw.githubusercontent.com/$COMPATREPO/main/compat.json" -o /tmp/cytv-compat.json 2>/dev/null && node -e 'JSON.parse(require("fs").readFileSync("/tmp/cytv-compat.json","utf8"))' 2>/dev/null && cp /tmp/cytv-compat.json $D/compat.json
  COMPATNOTE=$($J compat "$fw" "$sdk" $D/compat.json $S/compat.json)

  SRCINFO=$D/backup/home-appinfo.orig.json; [ -f "$SRCINFO" ] || SRCINFO=$HOME_DIR/appinfo.json
  HOMEKIND=$($J kind "$SRCINFO" 2>/dev/null)
  case "$HOMEKIND" in com.webos.app.home*) HOMEID=1 ;; *) HOMEID=0 ;; esac
  if [ -n "$COMPATNOTE" ] && [ $HOMEID = 1 ]; then
    say "this firmware is in the compatibility list ($COMPATNOTE); LG's Home app is '${HOMEKIND#com.webos.app.home }'"
  else
    case "$HOMEKIND" in
      "com.webos.app.home flutter"|"com.webos.app.home web") warn "firmware ${fw:-?} is not in the compatibility list; continuing because LG's Home is the flutter or web kind this was written for. The original state is saved and a failed start restarts the TV with LG's Home." ;;
      *) if [ $FORCE = 1 ]; then warn "firmware ${fw:-?} is not in the compatibility list and LG's Home app is '${HOMEKIND:-unreadable}', not the flutter or web app this was tested with; continuing because of --force"
         else die "LG's Home app looks different from what this expects (found: ${HOMEKIND:-unreadable}; firmware ${fw:-?} is not in the compatibility list). To try anyway use 'Set up anyway' in the app, or run bootstrap.sh install --force. The original is saved and a failed start is rolled back with a restart." ; fi ;;
    esac
  fi
fi

# ---- back up the original state (first run only) ----
mkdir -p $D/backup
[ -f $D/backup/home-appinfo.orig.json ] || cp $HOME_DIR/appinfo.json $D/backup/home-appinfo.orig.json
[ -f $D/backup/hosts.orig ] || cp /etc/hosts $D/backup/hosts.orig
[ -f $D/backup/processes.orig.txt ] || { ps > $D/backup/processes.orig.txt 2>&1; systemctl list-units --no-legend > $D/backup/units.orig.txt 2>&1; date > $D/backup/date.txt; }

# ---- for an update: keep the running version's files so a failed start can be undone ----
if [ "$MODE" = update ]; then
  (cd $D && tar czf backup/service-prev.tgz $(ls *.js *.sh 10-cleanyourtv-home 15-cleanyourtv-debloat 2>/dev/null) inputhook 2>/dev/null)
fi

# ---- copy the service files ----
cp $S/helper/*.js $D/
cp $S/scripts/* $D/
mkdir -p $D/inputhook && cp $S/inputhook/* $D/inputhook/ && chmod 755 $D/inputhook/ezinject
[ -d $S/licenses ] && { mkdir -p $D/licenses; cp $S/licenses/* $D/licenses/; }
chmod +x $D/*.sh $D/10-cleanyourtv-home $D/15-cleanyourtv-debloat
# root runs these files at boot and from the Input-key hook: nobody else may write them (the dev partition is world-writable)
chmod -R go-w $D $S 2>/dev/null
mkdir -p $D/live; chmod 700 $D/live 2>/dev/null; chmod 600 $D/config.json $D/usage.json $D/live/* 2>/dev/null
[ -f $D/config.json ] || cp $S/config.example.json $D/config.json
[ -f $D/compat.json ] || cp $S/compat.json $D/compat.json

# the launcher that ships with the package, unless a newer one is already installed
newer() { $J newer "$1" "$2"; }
if [ ! -f $D/app/index.html ] || newer $S/payload/app/version.json $D/app/version.json; then
  rm -rf $D/app.prev; [ -d $D/app ] && mv $D/app $D/app.prev
  mkdir -p $D/app && cp $S/payload/app/* $D/app/
  say "launcher $(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' $D/app/version.json) in place"
  FRONTEND_NEW=1
fi

# ---- options (stored in config.json, changed later in the manager) ----
$J options "$D/config.json" "$DEBLOAT" "$INPUTKEY"
opt() { $J opt "$D/config.json" "$1"; }
[ -n "$CYTV_REPO" ] && echo "$CYTV_REPO ${CYTV_REF:-main}" > $D/source
[ "$MODE" = install ] && rm -f $D/DISABLE $D/DISABLE-DEBLOAT   # setting up selects our Home; an update keeps the choice

# ---- boot scripts ----
ln -sf $D/10-cleanyourtv-home $INITD/10-cleanyourtv-home
if [ "$(opt debloat)" = 1 ]; then ln -sf $D/15-cleanyourtv-debloat $INITD/15-cleanyourtv-debloat; else rm -f $INITD/15-cleanyourtv-debloat; fi
VERSION=$(svc_version $D/helper.js)
say "service $VERSION installed in $D; boot scripts in $INITD"

# ---- go live ----
if [ $START = 0 ]; then say "done. Everything takes effect at the next reboot."; exit 0; fi
if [ "$MODE" = update ]; then
  say "restarting the service"
  pkill -f "[c]leanyourtv/helper.js"; sleep 1
  sh $D/10-cleanyourtv-home keep </dev/null
  ok=0
  for i in $(seq 1 15); do
    sleep 3
    hv=$(curl -s -m 3 http://127.0.0.1:8765/api/version | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')
    [ "$hv" = "$WANT" ] && { ok=1; break; }
  done
  if [ $ok = 0 ]; then
    warn "the new service (${hv:-not answering}) did not come up; going back to the previous files"
    pkill -f "[c]leanyourtv/helper.js"; sleep 1
    [ -f $D/backup/service-prev.tgz ] && (cd $D && tar xzf backup/service-prev.tgz)
    echo "update to $WANT failed at $(date)" > $D/last-error.txt
    sh $D/10-cleanyourtv-home keep </dev/null
    exit 1
  fi
  say "service $WANT is running"
  ensure_apps
  # the overlay apps and the launcher may have new pages: restart the hidden picker (the service starts it again) and reload Home
  luna-send -n 1 -w 3000 luna://com.webos.applicationManager/closeByAppId '{"id":"com.cleanyourtv.picker"}' </dev/null >/dev/null 2>&1
  if [ "$FRONTEND_NEW" = 1 ] && grep -q " $HOME_DIR " /proc/mounts; then
    sh $D/reload-home.sh </dev/null
  fi
  exit 0
fi
say "starting (the screen blinks once while the system app manager restarts)"
pkill -f "[c]leanyourtv/helper.js"; pkill -f "[l]una-send -i -f"; sleep 1
sh $D/10-cleanyourtv-home </dev/null
[ "$(opt debloat)" = 1 ] && sh $D/debloat-stop.sh </dev/null

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
    warn "the new Home did not come up (app type: ${type:-none}, service: ${hv:-not answering}); rolling back"
    # restoring LG's Home live does not always work; without the boot scripts a restart brings it back
    cp /tmp/cleanyourtv-helper.log /media/developer/cytv-setup.log.service 2>/dev/null
    rm -f $INITD/10-cleanyourtv-home $INITD/15-cleanyourtv-debloat
    echo '{"lastAppId":"com.webos.app.home"}' > /var/luna/preferences/bootd_last_foreground_app_id.json 2>/dev/null
    (sleep 4; reboot) </dev/null >/dev/null 2>&1 &
    die "rolled back: the boot scripts are removed and the TV restarts with LG's Home. Details: /media/developer/cytv-setup.log and cytv-setup.log.service"
  fi
fi
ensure_apps
say "done. Hold OK on an app to customise the dock, or use the Customise button at the top right."
say "Back to LG's Home any time: switch off 'CleanYourTV as Home' in the manager app, or run: sh $D/undo-home.sh"
