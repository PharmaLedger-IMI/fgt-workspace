#!/bin/bash -e

function test_arguments(){
if [[ $# -gt 1 ]]; then
  echo "invalid arguments"
  exit 1;
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









