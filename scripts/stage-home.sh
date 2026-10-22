#!/bin/sh
# Build the directory that gets bind-mounted over LG's Home: the launcher page plus an appinfo.json derived
# from this TV's own stock Home (nothing of LG's is shipped in the repo). Safe to re-run while mounted.
L=/media/developer/cleanyourtv
S=$L/home-overlay
mkdir -p $S
cp $L/app/* $S/
python3 - "$L/backup/home-appinfo.orig.json" "$S/appinfo.json" <<'PY'
import json, sys
o = json.load(open(sys.argv[1]))
if o.get('type') not in ('web', 'flutter'):   # another kind of Home app (e.g. native or QML): drop what only applies to that kind
    for k in ('nativeLifeCycleInterfaceVersion', 'containerBasedApp', 'supportQuickStart', 'windowGroup', 'qmlIncludePath', 'qtModules'):
        o.pop(k, None)
o['type'] = 'web'
o['main'] = 'index.html'
for k in ('splashBackground', 'noSplashOnLaunch'):
    o.pop(k, None)
o['bgColor'] = '#000000'
o['transparent'] = False
json.dump(o, open(sys.argv[2], 'w'), indent=1)
PY
