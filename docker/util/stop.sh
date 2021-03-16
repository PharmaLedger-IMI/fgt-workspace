#!/bin/bash

name="$(./util/name.sh -1)"
echo "trying to stop... $name"

matchingStarted=$(docker ps --filter="name=$name" -q | xargs)
[[ -n $matchingStarted ]] && docker stop $matchingStarted

echo "stoped: $matchingStarted"
