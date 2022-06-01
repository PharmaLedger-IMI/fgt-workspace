#!/bin/sh
# use /bin/sh to be compatible with Alpine / Busybox
# This script expects cwd to be /fgt-workspace
rm -rf apihub-root/external-volume/config
cp -r docker/api/traceability/config apihub-root/external-volume/config
npm run switch-to-simul-chain ; npm run server & ( sleep 5s ; npm run build-all ; tail -f /dev/null )