#!/bin/bash -e

# for windows needs a file called 'draw.io.path' containing a single line with the full path for the windows dra.io executable

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

function test_os(){
  if [[ -f "$SCRIPTPATH/draw.io.path" ]]; then
    local windows_path="$SCRIPTPATH/draw.io.path"
    local windows_draw_io_path="$(cat "$windows_path")"
    echo "$windows_draw_io_path"
  else
    echo "linux"
  fi
}

function run_draw_io(){
  local output="$1"
  local input="$2"
  local os="$3"
  local page="$4"
  local windows_path="$5"
  if [[ "$os" == "linux" ]]; then
    drawio --export --quality 300 --transparent --page-index "$page" --output "$output" "$input"
  else
    if [[ "$windows_path" != "" ]]; then 
	  touch "$output"
      input=$(wslpath -w "$input")
      output=$(wslpath -w "$output")
      "$windows_path" --export --quality 300 --transparent --page-index "$page" --output "$output" "$input"
    else
        echo "windows draw-io path not defined"
        exit 1;
    fi
  fi
}

function run_draw_io_extract(){
  local input="$1"
  local os="$2"
  local windows_path="$3"
  if [[ "$os" == "linux" ]]; then
    drawio --export --format xml --uncompressed "$input"
  else
    if [[ "$windows_path" != "" ]]; then
      input=$(wslpath -w "$input")
      "$windows_path" --export --format xml --uncompressed "$input"
    else
        echo "windows draw-io path not defined"
        exit 1;
    fi
  fi
}

function exportToPng(){
  local os="$3"
  local windows_path="$4"

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
  run_draw_io_extract "$file" "$os" "$windows_path"

  local names=$(grep -oP "name=\"\K(.*?)(?=\")" "$base_file_name.xml")
  echo "Page Names: $names"

  # Count pages
  local count=$(echo "$names" | wc -l)

  echo "Found $count pages"
  if [[ $count -eq 1 ]]; then
    # if there's only one page
    echo "output file ${png_output_path}/${file_name}.png"
    echo "source file $file"
    run_draw_io "${png_output_path}/${file_name}.png" "$file" "$os" 0 "$windows_path"
  else
    # Export each page as an PNG
    # Page index is zero based
    local i=0;
    while read -r name; do
      echo "Processing page $i named $name"
      run_draw_io "${png_output_path}/${file_name}-$name.png" "$file" "$os" $i "$windows_path"
      i=$((i+1))
    done < <(echo "$names")
  fi
}

find_drawings_and_export_to_resources(){
  local path="${PWD}/docs/drawings"
  local output_path="${PWD}/docs/resources/drawings"
  local os=$(test_os)
  local window_path=""

  if [[ "$os" != "linux" ]]; then
    windows_path="$os"
    os="windows"
  fi

  echo "working in os $os"

  local files=$(find "$path" -type f -iname "*.drawio")
  echo "Found the following files:"
  echo "$files"
  find "$path" -type f -iname "*.drawio" -print0 |
    while IFS= read -r -d '' drawing; do
        exportToPng "$drawing" "$output_path" "$os" "$windows_path"
    done
}

find_drawings_and_export_to_resources









