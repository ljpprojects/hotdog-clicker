build:
	rm -rf site/dist/*
	tsc
	cleancss -O3 -b site/index.css -o site/dist
	html-minifier --collapse-whitespace site/index.max.html -o site/index.html
	webpack
