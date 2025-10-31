install_deps:
	bun i

deploy-unguarded: site worker install_deps
	bunx wrangler deploy

deploy: site worker install_deps
	bash ./deploy-guard.sh
