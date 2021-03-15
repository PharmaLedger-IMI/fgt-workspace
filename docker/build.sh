#!/bin/bash

docker build -t pharmaledger/fgt "$(dirname $(readlink -f $0))" --no-cache --network host
