#!/bin/bash -ex

# for windows needs a file called 'draw.io.path' containing a single line with the full path for the windows dra.io executable

include(){
  local func_name=${1##*/}
  . ${1} 2>/dev/null || { printf "could not import $func_name...\nQuitting\n"; exit 1; }
}
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

include "${SCRIPTPATH}/detect_os.sh"

function test_arguments(){
if [[ $# -gt 1 ]]; then
  echo "invalid arguments"
  exit 1;
fi
}

function test_os(){
  if [[ -f "$SCRIPTPATH/draw.io.path" ]]; then
    local windows_path="$SCRIPTPATH/draw.io.path"
    local windows_draw_io_path="$(cat "$windows_path")"
    echo "$windows_draw_io_path"
  else
    echo "linux"
  fi
}

function correct_files(){
  for file in $(find "$1" -type f -name '*html#*:*'); do
    local corrected_name=$(echo "$file" | sed -E 's/(.*?)\.html#\.(.*?):(.*)/\1.\2.\3.html/')
    mv "$file" "$corrected_name"
    local file_without_path=${file:2}
    local corrected_without_path=${corrected_name:2}
    grep -rlIZPi "$file_without_path" | xargs -0r perl -pi -e "s/${file_without_path}/${corrected_without_path}/gi;"
  done
}

test_arguments
correct_files "$1"









