#!/bin/bash -xe
if test -z "$1"; then
  params=".localhost"
else
  if test "$1" = "dev"; then
    params="-fgt-${1}.pharmaledger.pdmfc.com"
  else
    params="-fgt.pharmaledger.pdmfc.com"
  fi
fi

echo "Launching docker compose in $params"

DOMAIN=$params docker-compose up -d &
docker-compose logs -f -t --tail="all"