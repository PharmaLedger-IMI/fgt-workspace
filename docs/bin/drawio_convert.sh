#!/bin/bash

include(){
  local func_name=${1##*/}
  . ${1} 2>/dev/null || { printf "could not import $func_name...\nQuitting\n"; exit 1; }
}
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

include "${SCRIPTPATH}/detect_os.sh"

function test_arguments(){
if [[ $# -gt 3 ]]; then
  echo "invalid arguments"
  exit 1;
fi
}

windows_draw_io_path=""

function test_os(){
  windows_draw_io_path=$(cat draw.io.path)
  if [[ -z "$windows_draw_io_path" ]]; then
    echo "windows"
  else
    echo "linux"
  fi
}

function run_draw_io(){
  test_arguments $#
  local output="$1"
  local input="$2"
  local os="$3"
  local page="$4"
  if [[ "$os" == "linux" ]]; then
    drawio --export --quality 300 --trasnparent --page-index "$page" --output "$output" "$input"
  else
    if [[ -z "$windows_draw_io_path" ]]; then
      input=$(wslpath "$input")
      output=$(wspath "$output")
      drawio --export --quality 300 --trasnparent --page-index "$page" --output "$output" "$input"
    else
        echo "windows draw-io path not defined"
        exit 1;
    fi
  fi
}

function exportToPng(){
  local os="$3"

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
    run_draw_io "${png_output_path}/${file_name}.png" "$file" "$os" 0
  else
    # Export each page as an PNG
    # Page index is zero based
    for ((i = 0 ; i <= $count-1; i++)); do
      run_draw_io "${png_output_path}/${file_name}-$i.png" "$file" "$os" $i
    done
  fi
}

find_drawings_and_export_to_resources(){
  local path="${PWD}/docs/drawings"
  local output_path="${PWD}/docs/resources"
  local os=$(detect_os)

  find "$path" -type f -iname "*.drawio" -print0 |
    while IFS= read -r -d '' drawing; do
        exportToPng "$drawing" "$output_path" "$os"
    done
}

find_drawings_and_export_to_resources









