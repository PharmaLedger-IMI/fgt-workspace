#!/bin/sh


echo "=======> Starting APIHub in background process ..."
npm run server &
server_pid=$!
echo "=======> Application running in background with PID=$server_pid"
echo ""
echo "=======> Waiting for APIHub to be responsive ..."

trial_count=0
wget --spider localhost:8080
wget_rc=$?
while [[ $wget_rc -ne 0 && $trial_count -le 60 ]]
do
    sleep 1s
    trial_count=$(( $trial_count + 1 ))
    wget --spider localhost:8080
    wget_rc=$?
done

if [ $wget_rc -ne 0 ];
then
    echo "=======> ERROR: APIHub not responsive after 60 connection attempts"
    exit $wget_rc
fi

echo "=======> Starting Build Process ..."
# Exit on error
set -e
npm run build-all 
npm run environment-test
echo "=======> Build Process DONE"

echo "Run a blocking command to keep container alive"
tail -f /dev/null
