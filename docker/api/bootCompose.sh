#!/bin/bash -xe
if test -z "$1"; then
  params=".localhost"
  swagger=".localhost:8080"
else
  if test "$1" = "dev"; then
    params="-fgt-${1}.pharmaledger.pdmfc.com"
    swagger="$params"
  else
    params="-fgt.pharmaledger.pdmfc.com"
    swagger="$params"
  fi
fi

echo "Launching docker compose in $params"

DOMAIN=$params SWAGGER=$swagger docker-compose up &