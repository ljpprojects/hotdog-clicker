#! /bin/bash

msg="$(git log -1 --pretty=%B | tail -n 1)"

if [[ "$msg" != *":no_deploy"* ]]; then
    make deploy
fi;
