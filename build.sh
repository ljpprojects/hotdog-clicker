#! /bin/bash

set -euo pipefail
mkdir -p site/dist

function buildts {
    bun ./node_modules/typescript/bin/tsc;
    ./node_modules/esbuild/bin/esbuild --format=iife --bundle --minify --target=es5 --outfile=site/dist/bundle.js site/dist/game.js
}

function buildcsshtml {
    bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist;
    bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/alto.css -o site/dist;
    bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/empty.css -o site/dist;
    bun ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html;
}

buildts
buildcsshtml
