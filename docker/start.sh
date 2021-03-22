#!/bin/bash
UCNAME="fgt"

docker run --detach \
    --hostname $UCNAME \
    --publish 8080:8080 \
    --name $UCNAME \
    --restart always \
    pharmaledger/$UCNAME
