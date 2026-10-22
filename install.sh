#!/bin/sh
# CleanYourTV for LG webOS: installer. Run ON the TV, as root (see README.md). It downloads the latest release package
# (an .ipk), checks its SHA-256, installs it and runs its bootstrap. Updates later happen in the CleanYourTV manager app.
#
# Interactive (asks what to set up; needs a terminal, so use ssh -t):
#   ssh -t root@<tv-ip> 'sh -c "$(curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh)"'
# Without a terminal it sets everything up with the defaults:
#   ssh root@<tv-ip> 'curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh | sh'
#
# Options (they also skip the matching question):
#   -y, --yes        do not ask anything, use the defaults
#   --no-debloat     leave LG's ad and telemetry services and the hosts file alone
#   --no-input-key   leave the remote's Input key to LG's own picker
#   --no-start       install, but only take effect on the next reboot
#   --no-verify      skip the post-install check and the automatic rollback
#   --force          continue even if this TV looks unsupported
#
# Environment: CYTV_REPO=owner/name (default lasharor/cleanyourtv-WebOS)  CYTV_IPK=/path/to/package.ipk (use a local package)

usage() {
  cat <<'USAGE'
CleanYourTV for LG webOS: installer (run on the TV, as root)
  -y, --yes        do not ask anything, use the defaults
  --no-debloat     leave LG's ad and telemetry services and the hosts file alone
  --no-input-key   leave the remote's Input key to LG's own picker
  --no-start       install, but only take effect on the next reboot
  --no-verify      skip the post-install check and the automatic rollback
  --force          continue even if this TV looks unsupported
USAGE
}

main() {
  REPO="${CYTV_REPO:-lasharor/cleanyourtv-WebOS}"
  ID=com.cleanyourtv.manager
  SVC=/media/developer/apps/usr/palm/services/$ID.service
  DEBLOAT=""; INPUTKEY=""; START=""; VERIFY=1; FORCE=0; YES=0
  for a in "$@"; do
    case "$a" in
      -y|--yes) YES=1 ;;
      --no-debloat) DEBLOAT=0 ;;
      --no-input-key) INPUTKEY=0 ;;
      --no-start) START=0 ;;
      --no-verify) VERIFY=0 ;;
      --force) FORCE=1 ;;
      -h|--help) usage; return 0 ;;
      *) echo "unknown option: $a (try --help)"; return 1 ;;
    esac
  done
  export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
  say() { echo "[cleanyourtv] $*"; }
  warn() { echo "[cleanyourtv] WARNING: $*" >&2; }
  die() { echo "[cleanyourtv] ERROR: $*" >&2; exit 1; }
  luna() { luna-send -n 1 -w 5000 -f "luna://$1" "$2" </dev/null 2>/dev/null; }

  [ "$(id -u)" = 0 ] || die "run as root (ssh root@<tv-ip>)"
  command -v luna-send >/dev/null || die "this does not look like webOS (no luna-send)"
  [ -d /var/lib/webosbrew/init.d ] || die "/var/lib/webosbrew/init.d not found: root with the Homebrew Channel is required (https://rootmy.tv)"
  for t in curl python3 node tar; do command -v $t >/dev/null || die "missing tool: $t"; done

  # ---- what to set up (asked only when a terminal is available) ----
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
      echo "The launcher (a clean Apple TV-style Home with a built-in Live TV player for your own M3U playlist), the"
      echo "picture-notification overlay and the manager app are always installed. Enter accepts the suggestion."
      echo
    } >/dev/tty
    if [ -z "$DEBLOAT" ]; then
      echo "Debloat: stops LG's ad, recommendation and telemetry services and blocks a few ad servers." >/dev/tty
      echo "Nothing is uninstalled; a reboot without the boot script undoes it." >/dev/tty
      ask "Debloat LG's ads and telemetry?" y && DEBLOAT=1 || DEBLOAT=0; echo >/dev/tty
    fi
    if [ -z "$INPUTKEY" ]; then
      echo "Input key: the remote's Input button opens a fast Inputs list over the running app instead of LG's picker." >/dev/tty
      echo "It uses the bundled inputhook (see THIRD-PARTY.md) and is also a switch in the manager app." >/dev/tty
      ask "Take over the Input key?" y && INPUTKEY=1 || INPUTKEY=0; echo >/dev/tty
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
      echo "  Input key                 $([ "$INPUTKEY" = 1 ] && echo yes || echo no)"
      echo "  start now                 $([ "$START" = 1 ] && echo yes || echo 'no, at next reboot')"
      echo
    } >/dev/tty
    ask "Go ahead?" y || { echo "Nothing was changed." >/dev/tty; return 0; }
  fi
  [ -z "$START" ] && START=1

  # ---- get the package ----
  T=$(mktemp -d /tmp/cytv.XXXXXX) || die "mktemp failed"
  trap 'rm -rf "$T"' EXIT
  if [ -n "$CYTV_IPK" ]; then
    [ -f "$CYTV_IPK" ] || die "$CYTV_IPK not found"
    IPK="$CYTV_IPK"
  else
    say "looking for the latest release of $REPO"
    curl -fsSL -H 'User-Agent: cleanyourtv-installer' "https://api.github.com/repos/$REPO/releases/latest" > $T/release.json || die "could not read the release list"
    python3 - $T/release.json > $T/assets.txt <<'PY' || die "the release has no package (com.cleanyourtv.manager_<version>_all.ipk with a .sha256 file)"
import json, sys
j = json.load(open(sys.argv[1])); a = {x['name']: x['browser_download_url'] for x in j.get('assets', [])}
for n, u in a.items():
    if n.startswith('com.cleanyourtv.manager_') and n.endswith('_all.ipk') and n + '.sha256' in a:
        print(u); print(a[n + '.sha256']); sys.exit(0)
sys.exit(1)
PY
    IPKURL=$(sed -n 1p $T/assets.txt); SHAURL=$(sed -n 2p $T/assets.txt)
    say "downloading $(basename "$IPKURL")"
    curl -fsSL "$IPKURL" -o $T/pkg.ipk || die "download failed"
    want=$(curl -fsSL "$SHAURL" | awk '{print $1}')
    got=$(python3 -c "import hashlib,sys;print(hashlib.sha256(open(sys.argv[1],'rb').read()).hexdigest())" $T/pkg.ipk)
    [ -n "$want" ] && [ "$want" = "$got" ] || die "the package does not match its checksum; nothing was installed"
    IPK=$T/pkg.ipk
    echo "$REPO" > $T/repo
  fi

  # ---- install the package (right after a system app manager restart an install can be silently dropped: check and retry) ----
  cp "$IPK" /tmp/cytv-manager.ipk
  want_ver=$(basename "$IPK" | sed -n 's/^com\.cleanyourtv\.manager_\(.*\)_all\.ipk$/\1/p')
  n=0; ok=0
  while [ $n -lt 4 ]; do
    luna-send -n 1 -w 30000 -f luna://com.webos.appInstallService/dev/install "{\"id\":\"$ID\",\"ipkUrl\":\"/tmp/cytv-manager.ipk\",\"subscribe\":false}" </dev/null >/dev/null 2>&1
    for i in 1 2 3 4 5 6 7 8; do
      sleep 3
      [ -f $SVC/bootstrap.sh ] && luna com.webos.applicationManager/getAppInfo "{\"id\":\"$ID\"}" | grep -q '"returnValue": true' && { ok=1; break; }
    done
    [ $ok = 1 ] && break
    n=$((n+1))
  done
  rm -f /tmp/cytv-manager.ipk
  [ $ok = 1 ] || die "the package did not install"
  say "package installed"

  # ---- set up ----
  set -- install
  [ "$DEBLOAT" = 0 ] && set -- "$@" --no-debloat
  [ "$DEBLOAT" = 1 ] && set -- "$@" --debloat
  [ "$INPUTKEY" = 0 ] && set -- "$@" --no-input-key
  [ "$INPUTKEY" = 1 ] && set -- "$@" --input-key
  [ $START = 0 ] && set -- "$@" --no-start
  [ $VERIFY = 0 ] && set -- "$@" --no-verify
  [ $FORCE = 1 ] && set -- "$@" --force
  CYTV_REPO="$REPO" sh $SVC/bootstrap.sh "$@"
}
main "$@"
