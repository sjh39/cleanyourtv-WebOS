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
for t in tar python3 node; do command -v $t >/dev/null || die "missing tool: $t"; done
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
  case "$sdk" in
    $TESTED_SDK*) ;;
    *) warn "only webOS SDK $TESTED_SDK* (webOS 25) has been tested; other versions may behave differently. The original state is backed up and 'undo-home.sh' restores LG's Home." ;;
  esac
  SRCINFO=$D/backup/home-appinfo.orig.json; [ -f "$SRCINFO" ] || SRCINFO=$HOME_DIR/appinfo.json
  python3 - "$SRCINFO" <<'PY' || { [ $FORCE = 1 ] && warn "continuing because of --force" || die "LG's Home app looks different from what this expects (use --force to try anyway)"; }
import json, sys
o = json.load(open(sys.argv[1]))
sys.exit(0 if o.get('id') == 'com.webos.app.home' and o.get('type') in ('flutter', 'web') else 1)
PY
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
[ -f $D/config.json ] || cp $S/config.example.json $D/config.json

# the launcher that ships with the package, unless a newer one is already installed
newer() { python3 - "$1" "$2" <<'PY'
import json, sys
def v(f):
    try: return [int(x) for x in json.load(open(f)).get('version', '0').split('.')]
    except Exception: return [0]
sys.exit(0 if v(sys.argv[1]) > v(sys.argv[2]) else 1)
PY
}
if [ ! -f $D/app/index.html ] || newer $S/payload/app/version.json $D/app/version.json; then
  rm -rf $D/app.prev; [ -d $D/app ] && mv $D/app $D/app.prev
  mkdir -p $D/app && cp $S/payload/app/* $D/app/
  say "launcher $(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' $D/app/version.json) in place"
fi

# ---- options (stored in config.json, changed later in the manager) ----
python3 - "$D/config.json" "$DEBLOAT" "$INPUTKEY" <<'PY'
import json, sys
p, deb, key = sys.argv[1:4]
try: c = json.load(open(p))
except Exception: c = {}
o = c.setdefault('options', {})
o.setdefault('debloat', True); o.setdefault('inputKey', True)
if deb != '': o['debloat'] = deb == '1'
if key != '': o['inputKey'] = key == '1'
json.dump(c, open(p, 'w'), indent=2)
PY
opt() { python3 -c "import json;print(1 if json.load(open('$D/config.json'))['options']['$1'] else 0)"; }
echo "$CYTV_REPO ${CYTV_REF:-main}" | grep -q '[a-z]' && echo "$CYTV_REPO ${CYTV_REF:-main}" > $D/source
rm -f $D/DISABLE $D/DISABLE-DEBLOAT

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
    sh $D/undo-home.sh temp </dev/null
    rm -f $INITD/10-cleanyourtv-home $INITD/15-cleanyourtv-debloat
    die "rolled back: LG's Home is restored and the boot scripts are removed. Details: /tmp/cleanyourtv-helper.log"
  fi
fi
ensure_apps
say "done. Hold OK on an app to customise the dock, or use the Customise button at the top right."
say "Back to LG's Home any time: pick 'Restore LG Home' at the end of the app grid, or run: sh $D/undo-home.sh"
