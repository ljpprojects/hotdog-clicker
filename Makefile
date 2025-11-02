install_deps:
	bun i

guard: guard.sh
	bash ./guard.sh

deploy-unguarded: site worker install_deps
	bunx wrangler deploy

deploy: site/ts worker/index.ts install_deps guard deploy-unguarded
