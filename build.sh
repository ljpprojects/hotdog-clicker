#! /opt/homebrew/bin/zsh

set -euo pipefail
mkdir -p site/dist

function createallhash {
    tar -c build.sh site/**/*.ts site/index.css worker/index.ts **/tsconfig.json | md5
}

function createtshash {
    tar -c site/**/*.ts | md5
}

function createcsshtmlhash {
    tar -c site/index.css site/index.max.html | md5
}

function finish {
    local allhash="$(createallhash)"
    local tshash="$(createtshash)"
    local csshtmlhash="$(createcsshtmlhash)"

    echo -e "$allhash\n$tshash\n$csshtmlhash" > .build

    exit 0
}

if [[ "$1" == "selective" ]]; then
    # Check if any relevant files even changed at all (.build:1)

    if [[ "$(head -n 1 .build)" == "$(createallhash)" ]]; then
        echo "Skipping build; no relevant changes."
        finish
    fi;

    # Check if typescript source has changed (.build:2)

    if [[ "$(head -n 2 .build | tail -n 1)" != "$(createtshash)" ]]; then
        bun ./node_modules/typescript/bin/tsc;
        ./node_modules/esbuild/bin/esbuild --format=iife --bundle --minify --target=es5 --outfile=site/dist/bundle.js site/dist/game.js
    else
        echo "Skipping TypeScript build; no changes."
    fi;

    # Check if css/html has changed (.build:3)

    if [[ "$(head -n 3 .build | tail -n 1)" != "$(createcsshtmlhash)" ]]; then
        bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist;
        bun ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html;
    else
        echo "Skipping CSS/HTML build; no changes."
    fi;
elif [[ "$1" == "full" ]]; then
    bun ./node_modules/typescript/bin/tsc;
    ./node_modules/esbuild/bin/esbuild --format=iife --bundle --minify --target=es5 --outfile=site/dist/bundle.js site/dist/game.js
    bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist;
    bun ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html;
fi;

finish;
