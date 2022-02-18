#!/bin/bash -xe
if test -z "$1"; then
  params=".localhost"
  simple="localhost"
  swagger=".localhost:8080"
  protocol="http"
else
  if test "$1" = "dev"; then
    params="-fgt-${1}.pharmaledger.pdmfc.com"
    simple="fgt-${1}.pharmaledger.pdmfc.com"
  else
    params="-fgt.pharmaledger.pdmfc.com"
    simple="fgt.pharmaledger.pdmfc.com"
  fi
  swagger="$params"
  protocol=https
fi

echo "Launching docker compose in $params"

SIMPLE=$simple DOMAIN=$params SWAGGER=$swagger PROTOCOL=$protocol docker-compose up -d