#!/bin/bash -x
# tool to help save running docker logs under $HOME/logs/fgtYYYYMMDDHHMISS/container-name.log
LOG_FOLDER_NAME=~/logs/fgt`date +%Y%m%d%H%M%S`
RUNNING_DOCKERS=`docker ps --format "{{.Names}}" | grep '^fgt-\|^mah-\|^whs\|^pha'`
mkdir -p $LOG_FOLDER_NAME
for CONTAINER_NAME in $RUNNING_DOCKERS
do
    docker logs --timestamps $CONTAINER_NAME >> $LOG_FOLDER_NAME/$CONTAINER_NAME.log 2>&1
done

