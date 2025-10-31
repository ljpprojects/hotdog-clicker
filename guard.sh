msg="$(git log -1 --pretty=%B | tail -n 2)"

if [[ "$msg" == *":no_deploy"* ]]; then
    echo '":no_deploy" was specified, exiting...'

    exit 0
fi;
