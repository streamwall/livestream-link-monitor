# Livestream Link Monitor Makefile
# Development shortcuts for Docker Compose commands
# All commands run inside Docker containers - no local Node.js required

.PHONY: help dev up down restart logs shell test lint migrate seed reset rebuild clean npm

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target - show help
help:
	@echo "$(CYAN)Livestream Link Monitor Development Commands:$(NC)"
	@echo ""
	@echo "$(GREEN)Core Commands:$(NC)"
	@echo "  make dev        - Start in development mode with auto-reload"
	@echo "  make up         - Start in production mode"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - Show logs (follow mode)"
	@echo "  make status     - Show container status"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make shell      - Open bash shell in container"
	@echo "  make attach     - Attach to container (for debugging)"
	@echo "  make local      - Run locally with nodemon"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test       - Run unit tests with coverage"
	@echo "  make test-watch - Run tests in watch mode"
	@echo "  make test-sheets   - Test Google Sheets connection"
	@echo "  make test-source   - Test StreamSource connection"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint       - Run linter and show issues"
	@echo "  make lint-fix   - Run linter and auto-fix issues"
	@echo "  make lint-check - Run linter with zero warnings policy"
	@echo "  make format     - Format code (alias for lint-fix)"
	@echo "  make quality    - Run full quality check (lint + test)"
	@echo ""
	@echo "$(GREEN)Configuration:$(NC)"
	@echo "  make setup      - Initial setup (create .env, install deps)"
	@echo "  make env-check  - Validate environment configuration"
	@echo "  make config     - Show current configuration (sanitized)"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make rebuild    - Complete rebuild (clean + build + start)"
	@echo "  make clean      - Remove containers, volumes, and logs"
	@echo "  make install    - Install/update dependencies"
	@echo "  make security   - Run security audit"

# Core Commands
# Start development environment with auto-reload
dev:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Running setup first...$(NC)"; \
		make setup; \
	fi
	docker compose up
	@echo "$(GREEN)Livestream Monitor is running!$(NC)"
	@echo "Check logs with: make logs"

# Start production mode
up:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Running setup first...$(NC)"; \
		make setup; \
	fi
	docker compose up -d
	@echo "$(GREEN)Livestream Monitor is running in background$(NC)"

# Stop all services
down:
	docker compose down

# Restart all services
restart: down up

# Show logs in follow mode
logs:
	docker compose logs -f

# Show container status
status:
	docker compose ps

# Development Tools
# Open bash shell in container
shell:
	docker compose exec livestream-monitor sh

# Attach to container (for debugging)
attach:
	docker attach $$(docker compose ps -q livestream-monitor)

# Run locally with nodemon
local:
	npm run dev

# Testing
# Run unit tests with coverage
test:
	@echo "$(CYAN)Running unit tests with coverage...$(NC)"
	npm test

# Run tests in watch mode
test-watch:
	@echo "$(CYAN)Running tests in watch mode...$(NC)"
	npm run test:watch

# Show test coverage report
test-coverage:
	@echo "$(CYAN)Running tests with coverage report...$(NC)"
	npm test -- --coverage --coverageReporters=text

# Test Google Sheets connection
test-sheets:
	@echo "$(CYAN)Testing Google Sheets connection...$(NC)"
	node test-sheets.js

# Test StreamSource connection
test-source:
	@echo "$(CYAN)Testing StreamSource connection...$(NC)"
	node test-streamsource.js

# Code Quality
# Run linter and show issues
lint:
	@echo "$(CYAN)Running ESLint to check code quality...$(NC)"
	npm run lint

# Run linter and auto-fix issues
lint-fix:
	@echo "$(CYAN)Running ESLint with auto-fix...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)Code formatting complete!$(NC)"

# Run linter with zero warnings policy
lint-check:
	@echo "$(CYAN)Running ESLint with strict checking (no warnings allowed)...$(NC)"
	npm run lint:check
	@echo "$(GREEN)Code quality check passed!$(NC)"

# Format code (alias for lint-fix)
format: lint-fix

# Run full quality check (lint + test)
quality:
	@echo "$(CYAN)Running comprehensive quality check...$(NC)"
	@echo "$(YELLOW)Step 1: Code linting...$(NC)"
	@$(MAKE) lint-check --no-print-directory
	@echo ""
	@echo "$(YELLOW)Step 2: Running tests...$(NC)"
	@$(MAKE) test --no-print-directory
	@echo ""
	@echo "$(GREEN)✅ All quality checks passed!$(NC)"

# Configuration Management
# Initial setup for new developers
setup:
	@echo "$(CYAN)Setting up Livestream Link Monitor development environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)Created .env file - please edit with your configuration$(NC)"; \
	fi
	npm install
	@echo ""
	@echo "$(GREEN)Setup complete! Next steps:$(NC)"
	@echo "1. Edit .env with your Discord, Twitch, and backend credentials"
	@echo "2. Run 'make up' to start the application"

# Validate environment configuration
env-check:
	@echo "$(CYAN)Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)ERROR: .env file not found!$(NC)"; \
		echo "Run '$(CYAN)make setup$(NC)' to create one"; \
		exit 1; \
	fi
	@grep -q "DISCORD_TOKEN=." .env || echo "$(YELLOW)WARNING: DISCORD_TOKEN not set$(NC)"
	@grep -q "DISCORD_CHANNEL_ID=." .env || echo "$(YELLOW)WARNING: DISCORD_CHANNEL_ID not set$(NC)"
	@grep -q "TWITCH_CHANNEL=." .env || echo "$(YELLOW)WARNING: TWITCH_CHANNEL not set$(NC)"
	@grep -q "GOOGLE_SHEET_ID=." .env || echo "$(YELLOW)WARNING: GOOGLE_SHEET_ID not set$(NC)"
	@echo "$(GREEN)Configuration check complete$(NC)"

# Show current configuration (sanitized)
config:
	@echo "$(CYAN)Current Configuration:$(NC)"
	@if [ -f .env ]; then \
		grep -E "^[^#]" .env | sed 's/\(TOKEN=\).*/\1[HIDDEN]/' | sed 's/\(PASSWORD=\).*/\1[HIDDEN]/'; \
	else \
		echo "$(RED)No .env file found$(NC)"; \
	fi

# Maintenance
# Complete rebuild
rebuild:
	docker compose stop
	docker compose down -v --remove-orphans
	docker compose build --no-cache
	docker compose up -d
	docker compose logs -f

# Clean up everything (containers, volumes, logs)
clean:
	docker compose down -v --remove-orphans
	rm -rf logs/*.log
	find . -name "*.log" -type f -delete

# Install/update dependencies
install:
	docker compose exec livestream-monitor npm install

# Run security audit
security:
	npm audit
	@echo ""
	@echo "$(CYAN)Checking for exposed secrets...$(NC)"
	@if grep -r "DISCORD_TOKEN\|STREAMSOURCE_PASSWORD" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.example --exclude=Makefile | grep -v "process.env"; then \
		echo "$(RED)WARNING: Possible exposed secrets found!$(NC)"; \
	else \
		echo "$(GREEN)No exposed secrets found$(NC)"; \
	fi

# Additional Commands
.PHONY: exec run npm debug backup

# Execute command in container
exec:
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make exec cmd='ls -la'"; \
	else \
		docker compose exec livestream-monitor $(cmd); \
	fi

# Run command in new container
run:
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make run cmd='node --version'"; \
	else \
		docker compose run --rm livestream-monitor $(cmd); \
	fi

# Run npm commands
npm:
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make npm cmd='install lodash'"; \
	else \
		docker compose exec livestream-monitor npm $(cmd); \
	fi

# Start with debug logging
debug:
	LOG_LEVEL=debug docker compose up

# Backup configuration
backup:
	@mkdir -p backups
	@cp .env backups/.env.backup.$$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
	@cp credentials.json backups/credentials.backup.$$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
	@echo "$(GREEN)Backup created in backups/ directory$(NC)"

# Troubleshooting
.PHONY: logs-all logs-file ps-all health doctor

# Show logs for all services
logs-all:
	docker compose logs -f

# Show log file contents
logs-file:
	@if [ -f logs/app.log ]; then \
		tail -f logs/app.log; \
	else \
		echo "$(YELLOW)No log file found at logs/app.log$(NC)"; \
	fi

# Show all containers (including stopped)
ps-all:
	docker compose ps -a

# Health check
health:
	@echo "$(CYAN)Checking Livestream Monitor health...$(NC)"
	@docker compose ps
	@echo ""
	@echo "$(CYAN)Node.js status:$(NC)"
	@docker compose exec livestream-monitor node -e "console.log('$(GREEN)Node.js: OK$(NC)')" 2>/dev/null || echo "$(RED)Node.js: ERROR$(NC)"
	@echo ""
	@echo "$(CYAN)Backend status:$(NC)"
	@make test --no-print-directory 2>/dev/null || true

# Doctor - diagnose common issues
doctor:
	@echo "$(CYAN)Running diagnostics...$(NC)"
	@echo ""
	@echo "$(GREEN)1. Docker:$(NC)"
	@docker --version || echo "$(RED)Docker not installed$(NC)"
	@docker compose version || echo "$(RED)Docker Compose not installed$(NC)"
	@echo ""
	@echo "$(GREEN)2. Configuration:$(NC)"
	@make env-check --no-print-directory
	@echo ""
	@echo "$(GREEN)3. Services:$(NC)"
	@make status --no-print-directory
	@echo ""
	@echo "$(GREEN)4. Backends:$(NC)"
	@make test --no-print-directory 2>/dev/null || true

# Shortcuts
.PHONY: d u l r s

# Quick shortcuts for common commands
d: dev
u: up
l: logs
r: restart
s: status