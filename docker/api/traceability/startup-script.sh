#!/bin/sh
# use /bin/sh to be compatible with Alpine / Busybox
rm -rf apihub-root/external-volume/config
cp -r docker/api/config apihub-root/external-volume/config
cd /fgt-workspace ; npm run switch-to-simul-chain ; npm run server & ( sleep 5s ; npm run build-all ; tail -f /dev/null )