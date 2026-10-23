#!/bin/sh
# Runs tools/node8-check.js under Node.js 8.12.0, the version on webOS 5 TVs (downloaded once from nodejs.org, checksum
# verified, cached in ~/.cache/cleanyourtv). On an Apple-silicon Mac the x64 build runs through Rosetta.
set -e
cd "$(dirname "$0")/.."
case "$(uname -s)-$(uname -m)" in
  Darwin-*)               P=darwin-x64;   H=ca131b84dfcf2b6f653a6521d31f7a108ad7d83f4d7e781945b2eca8172064aa ;;
  Linux-x86_64)           P=linux-x64;    H=3df19b748ee2b6dfe3a03448ebc6186a3a86aeab557018d77a0f7f3314594ef6 ;;
  Linux-aarch64|Linux-arm64) P=linux-arm64; H=781ecf1ecb14b4c671ef0732988636282d6fb7071c4bd52567f663b008796bc9 ;;
  Linux-armv7l)           P=linux-armv7l; H=9c564069c5c9f0c9062cb399db02670c79fc4a2a079e67edcc5785a73a663f6e ;;
  *) echo "no Node 8.12.0 build known for $(uname -sm)"; exit 1 ;;
esac
C="${XDG_CACHE_HOME:-$HOME/.cache}/cleanyourtv"; N="$C/node-v8.12.0-$P/bin/node"
if [ ! -x "$N" ]; then
  mkdir -p "$C"; T=$(mktemp -d)
  curl -fsSL "https://nodejs.org/dist/v8.12.0/node-v8.12.0-$P.tar.gz" -o "$T/n.tgz"
  G=$( (sha256sum "$T/n.tgz" 2>/dev/null || shasum -a 256 "$T/n.tgz") | cut -d' ' -f1)
  [ "$G" = "$H" ] || { echo "checksum mismatch for the Node 8.12.0 download"; rm -rf "$T"; exit 1; }
  tar -xzf "$T/n.tgz" -C "$C"; rm -rf "$T"
fi
"$N" --version
exec "$N" tools/node8-check.js
