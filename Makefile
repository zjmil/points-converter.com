.PHONY: help dev dev-logs dev-stop api-dev api-logs api-stop install clean deploy-test

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server (only if not already running)
	@if lsof -ti:5173 > /dev/null 2>&1; then \
		echo "Development server already running on port 5173"; \
		echo "Logs available at: dev.log"; \
		echo "To view logs: tail -f dev.log"; \
	else \
		echo "Starting development server..."; \
		echo "Logs will be written to: dev.log"; \
		npm run dev > dev.log 2>&1 & \
		echo "Server started in background. View logs with: tail -f dev.log"; \
	fi

dev-logs: ## View development server logs
	@if [ -f dev.log ]; then \
		tail -f dev.log; \
	else \
		echo "No dev.log file found. Start the dev server first with: make dev"; \
	fi

dev-stop: ## Stop development server
	@if lsof -ti:5173 > /dev/null 2>&1; then \
		echo "Stopping development server..."; \
		lsof -ti:5173 | xargs kill; \
		echo "Development server stopped."; \
	else \
		echo "Development server is not running on port 5173."; \
	fi

api-dev: ## Start API server (only if not already running)
	@if lsof -ti:8080 > /dev/null 2>&1; then \
		echo "API server already running on port 8080"; \
		echo "Logs available at: api/api.log"; \
		echo "To view logs: tail -f api/api.log"; \
	else \
		echo "Starting API server..."; \
		echo "Logs will be written to: api/api.log"; \
		cd api && go run . > api.log 2>&1 & \
		echo "API server started in background. View logs with: make api-logs"; \
	fi

api-logs: ## View API server logs
	@if [ -f api/api.log ]; then \
		tail -f api/api.log; \
	else \
		echo "No api/api.log file found. Start the API server first with: make api-dev"; \
	fi

api-stop: ## Stop API server
	@if lsof -ti:8080 > /dev/null 2>&1; then \
		echo "Stopping API server..."; \
		lsof -ti:8080 | xargs kill; \
		echo "API server stopped."; \
	else \
		echo "API server is not running on port 8080."; \
	fi

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
