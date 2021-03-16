#!/bin/bash

include(){
  local func_name=${1##*/}
  . ${1} 2>/dev/null || { printf "could not import $func_name...\nQuitting\n"; exit 1; }
}
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

include "${SCRIPTPATH}/detect_os.sh"

find_and_replace(){
  local path="${1}"
  local os="${2}"
  find "${1]}" -type f -iname "*.md" -print0 | xargs -0 perl -pi.bak


  find
}

if [[ $# -gt 1 ]]; then
  echo "invalid arguments"
  exit 1;
fi

mdFolder="$1"
os=$(detect_os);

if [[ "$os" == "notset" ]]
then
  echo "Unsupported os"
  exit 1
elif [ "$os" == "windows" ]; then
  echo "Changing '/' to '\' on md include statements"
  find_and_replace "$mdFolder" "windows"
  npm run docs
  echo "Reverting compatibility changes in include statements"
  find_and_replace "$mdFolder" "linux"
else
  npm run docs
fi