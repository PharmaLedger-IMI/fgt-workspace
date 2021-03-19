#!/bin/bash -xe
# deploy docker image to DEV environment

PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`

# pharmaledger at fgt-dev-pl
USERATHOST="pharmaledger@192.168.13.102"

cd $PRG_DIR/..

UCNAME="$(./util/name.sh -1)"

if test -z `which docker`
then
    echo 1>&2 "$PRG_NAME: docker must be in PATH"
    exit 1
fi

if test -z `which xz`
then
    echo 1>&2 "$PRG_NAME: xz must be in PATH"
    exit 1
fi

if test -z `which ssh`
then
    echo 1>&2 "$PRG_NAME: ssh must be in PATH"
    exit 1
fi

# Image .tar name based on current date and time
#IMG_NAME=fgtYYYYMMDDHHMISS
IMG_NAME=${UCNAME}$(date +%Y%m%d%H%M%S).tar.xz

# Remove tmp file on exit
trap "rm -f /tmp/$IMG_NAME" EXIT

# Saving and compressimg docker $UCNAME to /tmp/$IMG_NAME.xz. (Use all CPU threads when compressing).
docker save pharmaledger/$UCNAME | xz -T0 > /tmp/$IMG_NAME

# uploading /tmp/$IMG_NAME.xz to $USERATHOST:images/
scp -p /tmp/$IMG_NAME $USERATHOST:images/

# stop and delete all running images. Then load and start the new one.
ssh $USERATHOST <<EOF
set -e
docker stop \$(docker ps -aq)
docker rm \$(docker ps -aq)
docker rmi \$(docker images -q)
( xz -d < images/$IMG_NAME | docker load )
docker run --detach --hostname fgt --publish 8080:8080 --name $UCNAME --restart always pharmaledger/fgt
docker logs -f fgt
EOF


