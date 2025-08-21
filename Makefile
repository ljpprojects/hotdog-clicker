build:
	npm i
	rm -rf site/dist/*
	node ./node_modules/typescript/bin/tsc
	node ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist
	node ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html
	node ./node_modules/webpack-cli/bin/cli.js
