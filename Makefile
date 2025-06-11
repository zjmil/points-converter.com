.PHONY: help dev serve install clean deploy-test

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server
	@echo "Starting Vue development server on http://localhost:5173"
	@npm run dev

serve: dev ## Alias for dev

install: ## Install dependencies
	npm install

test: ## Run tests
	@echo "Running tests..."
	@npm run test

clean: ## Clean up generated files
	rm -rf node_modules dist

build: ## Build for production
	@echo "Building Vue app for production..."
	@npm run build

deploy-test: build ## Test the build locally (simulates Cloudflare Pages)
	@echo "Testing production build..."
	@echo "Starting preview server on http://localhost:4173"
	@npm run preview

update-data: ## Open the conversions data file for editing
	@echo "Opening public/data/conversions.json for editing..."
	@echo "Remember to update the 'lastUpdated' field!"
	@$${EDITOR:-nano} public/data/conversions.json

manage-data: ## Run the comprehensive data management tool
	@echo "Starting advanced data management tool..."
	@npm run manage-data

validate-data: ## Validate data integrity and referential consistency
	@echo "Validating conversions data..."
	@npm run validate-data

backup-data: ## Create a manual backup of the data
	@echo "Creating data backup..."
	@npm run backup-data

test-integrity: ## Run data integrity tests
	@echo "Running data integrity tests..."
	@npm run test:integrity