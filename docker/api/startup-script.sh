#!/bin/sh
# use /bin/sh to be compatible with Alpine / Busybox
# This script expects cwd to be /fgt-workspace
rm -rf apihub-root/external-volume/config
cp -r docker/api/config apihub-root/external-volume/config

echo "Starting server and building under ${ROLE}, ${FGT_API_CREDENTIALS}, ${SWAGGER_SERVER}"

npm run update-docker-apihub-config && npm run server & ( sleep 5s ; npm run build-all ; npm run build-dsu-explorer ; cd fgt-api ; npm run boot-api )