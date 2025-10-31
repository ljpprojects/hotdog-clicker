install_deps:
	bun i

guard:
	bash ./guard.sh

deploy-unguarded: site worker install_deps
	bunx wrangler deploy

deploy: site worker install_deps guard deploy-unguarded
