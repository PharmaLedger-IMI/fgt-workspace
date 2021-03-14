#!/bin/bash

include(){
  local func_name=${1##*/}
  . ${1} 2>/dev/null || { printf "could not import $func_name...\nQuitting\n"; exit 1; }
}
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

include "${SCRIPTPATH}/detect_os.sh"

function test_arguments(){
  if [[ $# -gt 2 ]]; then
  echo "invalid arguments"
  exit 1;
fi
}

function test_os(){
  local os=$(detect_os)
  if [[ "$os" == "notset" ]]
  then
    echo "Unsupported os"
    exit 1
  elif [ "$os" == "windows" ]; then
    echo "Currently Unsupported os"
    exit 1
  fi
}

function exportToPng(){
  test_arguments $#
  local file="$1"
  local file_name=$(basename "$file")

  echo "Opening $file_name"
  local base_file_name=${file%.*}
  echo "base filename $base_file_name"

  file_name=${file_name%.*}
  echo "filename $file_name"
  local png_output_path=${2}
  echo "png: $png_output_path"

  echo "Exporting $file_name to xml for page parsing"
  drawio --export --format xml --uncompressed "$file"
  # Count pages

  local count=$(grep -o "<diagram" "$base_file_name.xml" | wc -l)

  local names=$(grep -o "name=\"(.*)\"" "$base_file_name.xml")
  echo "names: $names"
  echo "Found $count pages"
  if [[ $count -eq 1 ]]; then
    # if there's only one page
    echo "output file ${png_output_path}/${file_name}.png"
    echo "source file $file"
    drawio --export --quality 300 --trasnparent --page-index 0 --output "${png_output_path}/${file_name}.png" "$file"
  else
    # Export each page as an PNG
    # Page index is zero based
    for ((i = 0 ; i <= $count-1; i++)); do
      drawio --export --quality 300  --transparent --page-index $i --output "${png_output_path}/${file_name}-$i.png" "$file"
    done
  fi
}

find_drawings_and_export_to_resources(){
  local path="${PWD}/docs/drawings"
  local output_path="${PWD}/docs/resources"

  find "$path" -type f -iname "*.drawio" -print0 |
    while IFS= read -r -d '' drawing; do
        exportToPng "$drawing" "$output_path"
    done
}

find_drawings_and_export_to_resources









