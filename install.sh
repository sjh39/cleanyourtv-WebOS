#!/bin/sh
# CleanYourTV for LG webOS: installs the manager app only. Run ON the TV, as root (see README.md). It downloads the latest
# release package (an .ipk), checks its SHA-256 and installs it. The setup itself (replacing LG's Home, the Input key,
# the debloat) is done afterwards in the CleanYourTV app on the TV: open it and choose "Set up now".
#
#   ssh root@<tv-ip> 'curl -fsSL https://raw.githubusercontent.com/lasharor/cleanyourtv-WebOS/main/install.sh | sh'
#
# Environment: CYTV_REPO=owner/name (default lasharor/cleanyourtv-WebOS)  CYTV_IPK=/path/to/package.ipk (use a local package)

main() {
  REPO="${CYTV_REPO:-lasharor/cleanyourtv-WebOS}"
  ID=com.cleanyourtv.manager
  export PATH=/usr/bin:/usr/sbin:/bin:/sbin:$PATH
  say() { echo "[cleanyourtv] $*"; }
  die() { echo "[cleanyourtv] ERROR: $*" >&2; exit 1; }
  case "$1" in -h|--help) sed -n '2,8p' "$0" 2>/dev/null | sed 's/^# \{0,1\}//'; return 0 ;; "") ;; *) die "unknown option: $1" ;; esac

  [ "$(id -u)" = 0 ] || die "run as root (ssh root@<tv-ip>)"
  command -v luna-send >/dev/null || die "this does not look like webOS (no luna-send)"
  [ -d /var/lib/webosbrew/init.d ] || die "/var/lib/webosbrew/init.d not found: root with the Homebrew Channel is required (https://rootmy.tv)"
  for t in curl python3; do command -v $t >/dev/null || die "missing tool: $t"; done

  T=$(mktemp -d /tmp/cytv.XXXXXX) || die "mktemp failed"
  trap 'rm -rf "$T"' EXIT
  if [ -n "$CYTV_IPK" ]; then
    [ -f "$CYTV_IPK" ] || die "$CYTV_IPK not found"
    IPK="$CYTV_IPK"
  else
    say "looking for the latest release of $REPO"
    curl -fsSL -H 'User-Agent: cleanyourtv-installer' "https://api.github.com/repos/$REPO/releases/latest" > $T/release.json || die "could not read the release list (is there a release yet?)"
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
  fi

  # right after a system app manager restart an install can be silently dropped, so check and retry
  cp "$IPK" /tmp/cytv-manager.ipk
  n=0; ok=0
  while [ $n -lt 4 ]; do
    luna-send -n 1 -w 30000 -f luna://com.webos.appInstallService/dev/install "{\"id\":\"$ID\",\"ipkUrl\":\"/tmp/cytv-manager.ipk\",\"subscribe\":false}" </dev/null >/dev/null 2>&1
    for i in 1 2 3 4 5 6 7 8; do
      sleep 3
      [ -f /media/developer/apps/usr/palm/services/$ID.service/bootstrap.sh ] && luna-send -n 1 -w 5000 -f luna://com.webos.applicationManager/getAppInfo "{\"id\":\"$ID\"}" </dev/null 2>/dev/null | grep -q '"returnValue": true' && { ok=1; break; }
    done
    [ $ok = 1 ] && break
    n=$((n+1))
  done
  rm -f /tmp/cytv-manager.ipk
  [ $ok = 1 ] || die "the package did not install (see Troubleshooting in the README)"
  say "the CleanYourTV app is installed."
  if [ -f /media/developer/cleanyourtv/helper.js ] && [ -e /var/lib/webosbrew/init.d/10-cleanyourtv-home ]; then
    # already set up: this is an update, so bring the running service to the new version
    sh /media/developer/apps/usr/palm/services/$ID.service/bootstrap.sh update "$(sed -n "s/^const VERSION = '\(.*\)';/\1/p" /media/developer/apps/usr/palm/services/$ID.service/helper/helper.js | head -1)"
  else
    say "Next, on the TV: open CleanYourTV in the app list and choose 'Set up now'."
  fi
}
main "$@"
