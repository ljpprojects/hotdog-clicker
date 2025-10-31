#! /bin/bash

msg="$(git log -1 --pretty=%B | tail -n 2)"

if [[ "$msg" != *":no_deploy"* ]]; then
    make deploy-unguarded
fi;
