build:
	bun i
	rm -rf site/dist/*
	bun ./node_modules/typescript/bin/tsc
	bun ./node_modules/clean-css-cli/bin/cleancss -O3 -b site/index.css -o site/dist
	bun ./node_modules/html-minifier/cli.js site/index.max.html --collapse-whitespace -o site/index.html
	bunx webpack

deploy: build
	bunx wrangler deploy
