install_deps:
	bun i

deploy: site worker install_deps
	bunx wrangler deploy
