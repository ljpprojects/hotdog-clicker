build:
	rm -rf site/dist/*
	tsc
	cleancss --batch-suffix "" -O3 -b site/index.css -o site/dist
	html-minifier --collapse-whitespace site/index.max.html -o site/index.html
	uglifyjs-folder site/dist -e -o site/dist
