#!/bin/bash

name="$(./util/name.sh -1)"
echo "trying to remove docker image... $name"

matching=$(docker ps -a --filter="name=$name" -q | xargs)
[[ -n $matching ]] && docker rm $matching

echo "removed: $matching"
