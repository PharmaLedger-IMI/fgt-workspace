#!/bin/bash

detect_os(){
  local os=notset
  case $(uname | tr '[:upper:]' '[:lower:]') in
    linux*)
      os=linux
      ;;
    darwin*)
      os=osx
      ;;
    msys*)
      os=windows
      ;;
    *)
      os=notset
      ;;
  esac
  echo "$os"
}