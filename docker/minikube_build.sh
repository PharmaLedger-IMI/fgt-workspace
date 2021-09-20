#!/bin/bash
eval $(minikube docker-env)
docker build -t pharmaledger/fgt "$(dirname $(readlink -f $0))" --no-cache --network host
