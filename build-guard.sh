#! /bin/bash

msg="$(git log -1 --pretty=%B | tail -n 1)"

if [[ "$msg" != *":no_deploy"* || -e .dev ]]; then
    bash ./build.sh
fi;
