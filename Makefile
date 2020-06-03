.SHELLFLAGS := -eu -o pipefail -c
MAKEFLAGS += --warn-undefined-variables


#------

guard-%:
	powershell if ( '$($*)' -eq '' ) {\
		echo '[ERROR] $* is required!!';\
		exit 1;\
	}

.PHONY: build
build: ## Build
	npm run build

.PHONY: test
test: ## Run test
	npm run test

.PHONY: release
release: guard-version build test ## make release version=x.y.z
	@echo 1. Increment version
	@npm version $(version)

	@echo 2. Build
	@make build

	@echo 3. Deploy
	@npm run deploy

	@echo 4. push to GitHub
	@git push --tags
	@git push

	@echo "All Successed!!"
