.PHONY: help dev serve install clean deploy-test

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server on port 8000
	@echo "Starting development server on http://localhost:8000"
	@npx serve -p 8000 || python -m http.server 8000

serve: dev ## Alias for dev

install: ## Install dependencies
	npm install

clean: ## Clean up generated files
	rm -rf node_modules

deploy-test: ## Test the build locally (simulates Cloudflare Pages)
	@echo "Testing static site build..."
	@echo "Site is static - no build needed"
	@echo "Starting preview server on http://localhost:3000"
	@npx serve -p 3000

update-data: ## Open the conversions data file for editing
	@echo "Opening data/conversions.json for editing..."
	@echo "Remember to update the 'lastUpdated' field!"
	@$${EDITOR:-nano} data/conversions.json