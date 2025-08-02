build:
	rm -rf site/dist/*
	tsc
	uglifyjs-folder site/dist -e -o site/dist
	cleancss -O3 -b site/index.css -o site/dist
	html-minifier --collapse-whitespace site/index.html -o site/index.min.html
