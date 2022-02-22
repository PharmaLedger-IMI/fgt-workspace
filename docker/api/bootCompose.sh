#!/bin/bash -xe
command="startup-script.sh"
params=".localhost"
simple="localhost"
swagger=".localhost:8080"
protocol="http"
if [[ "$1" = *"dev"* ]]; then
  params="-fgt-dev.pharmaledger.pdmfc.com"
  simple="fgt-dev.pharmaledger.pdmfc.com"
  swagger="$params"
  protocol=https
elif [[ "$1" = *"tst"* ]]; then
  params="-fgt.pharmaledger.pdmfc.com"
  simple="fgt.pharmaledger.pdmfc.com"
  swagger="$params"
  protocol=https
fi
if [[ "$1" = *"eth"* ]]; then
    command="startup-eth-script.sh"
fi

echo "Launching docker compose in $params"

SIMPLE=$simple DOMAIN=$params SWAGGER=$swagger PROTOCOL=$protocol COMMAND=$command docker-compose up -d