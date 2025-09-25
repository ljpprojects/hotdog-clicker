mkdir -ErrorAction SilentlyContinue ./site/dist/
mkdir -ErrorAction SilentlyContinue ./site/dist/lib/

bun ./node_modules/typescript/bin/tsc;
cp ./site/ts/lib/bignumber.min.js ./site/dist/lib/bignumber.js;
bun ./node_modules/esbuild/bin/esbuild --format=iife --bundle --minify --target=es6 --outfile=site/dist/bundle.js site/dist/game.js

bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist;
bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/alto.css -o site/dist;
bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/empty.css -o site/dist;
bun ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html;
