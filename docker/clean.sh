#!/bin/bash

PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`

"$PRG_DIR/stop.sh"
"$PRG_DIR/remove.sh"
