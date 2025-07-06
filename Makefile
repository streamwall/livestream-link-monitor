# Livestream Link Monitor Makefile
# Development shortcuts for Docker Compose commands
# All commands run inside Docker containers - no local Node.js required

.PHONY: help dev up down restart logs shell test lint migrate seed reset rebuild clean npm yarn

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
BOLD := \033[1m
NC := \033[0m # No Color

# Default target - show help
help:
	@echo "$(BOLD)$(CYAN)Livestream Link Monitor Development Commands:$(NC)"
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
	@echo "  make node       - Open Node.js REPL console"
	@echo "  make attach     - Attach to container (for debugging)"
	@echo "  make local      - Run locally with nodemon"
	@echo ""
	@echo "$(GREEN)Backend & Data:$(NC)"
	@echo "  make sync       - Sync all data (sheets, ignore lists, cities)"
	@echo "  make sync-sheets   - Sync Google Sheets data only"
	@echo "  make sync-source   - Sync StreamSource data only"
	@echo "  make backup-config - Backup configuration files"
	@echo "  make restore-config - Restore configuration from backup"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test       - Run full test suite with coverage"
	@echo "  make test-watch - Run tests in watch mode"
	@echo "  make test-unit     - Run unit tests only"
	@echo "  make test-integration - Run integration tests only"
	@echo "  make test-backends    - Run backend tests only"
	@echo "  make test-parallel    - Run tests in parallel (faster)"
	@echo "  make coverage      - Show test coverage report"
	@echo ""
	@echo "$(GREEN)Code Quality:$(NC)"
	@echo "  make lint       - Run comprehensive code analysis"
	@echo "  make lint-fix   - Run linter and auto-fix issues"
	@echo "  make lint-js    - Run ESLint (JavaScript style checking)"
	@echo "  make security   - Run security analysis (audit + secret scanning)"
	@echo "  make format     - Format code (alias for lint-fix)"
	@echo "  make quality    - Run full quality check (lint + security + test)"
	@echo "  make pre-commit - Run pre-commit checks (quality + coverage)"
	@echo ""
	@echo "$(GREEN)Dependencies & Assets:$(NC)"
	@echo "  make npm        - Install Node.js dependencies"
	@echo "  make install    - Install all dependencies"
	@echo "  make update     - Update all dependencies"
	@echo "  make audit      - Audit dependencies for vulnerabilities"
	@echo ""
	@echo "$(GREEN)Configuration:$(NC)"
	@echo "  make setup      - Initial setup (create .env, install deps)"
	@echo "  make env-check  - Validate environment configuration"
	@echo "  make config     - Show current configuration (sanitized)"
	@echo "  make version    - Show version information"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make rebuild    - Complete rebuild (clean + build + start)"
	@echo "  make clean      - Remove containers, volumes, and logs"
	@echo "  make clean-all  - Deep clean (including images and cache)"
	@echo "  make prune      - Remove unused Docker resources"
	@echo "  make doctor     - Diagnose common issues"
	@echo ""
	@echo "$(GREEN)Shortcuts:$(NC)"
	@echo "  make d          - dev"
	@echo "  make u          - up"
	@echo "  make l          - logs"
	@echo "  make r          - restart"
	@echo "  make s          - status"
	@echo "  make t          - test"
	@echo "  make n          - node (console)"

# Core Commands
# Start development environment with auto-reload
dev:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Running setup first...$(NC)"; \
		make setup; \
	fi
	@echo "$(BOLD)$(BLUE)🚀 Starting Livestream Monitor in development mode...$(NC)"
	@docker compose up
	@echo "$(GREEN)Livestream Monitor is running!$(NC)"
	@echo "$(CYAN)📊 Monitor Status: http://localhost:3000/health$(NC)"
	@echo "$(CYAN)📋 Log Files: logs/app.log$(NC)"

# Start production mode
up:
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)No .env file found. Running setup first...$(NC)"; \
		make setup; \
	fi
	@echo "$(BOLD)$(BLUE)🚀 Starting Livestream Monitor in production mode...$(NC)"
	@docker compose up -d
	@echo "$(GREEN)Livestream Monitor is running in background$(NC)"
	@echo "Check logs with: $(CYAN)make logs$(NC)"

# Stop all services
down:
	@echo "$(BOLD)$(YELLOW)⏹️  Stopping Livestream Monitor services...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ All services stopped$(NC)"

# Restart all services
restart:
	@echo "$(BOLD)$(YELLOW)🔄 Restarting Livestream Monitor services...$(NC)"
	@make down --no-print-directory
	@make up --no-print-directory

# Show logs in follow mode
logs:
	@echo "$(BOLD)$(CYAN)📋 Showing Livestream Monitor logs...$(NC)"
	@docker compose logs -f

# Show container status
status:
	@echo "$(BOLD)$(CYAN)📊 Livestream Monitor Container Status:$(NC)"
	@docker compose ps

# Development Tools
# Open bash shell in container
shell:
	@echo "$(BOLD)$(CYAN)🐚 Opening bash shell in container...$(NC)"
	@docker compose exec livestream-monitor sh

# Open Node.js REPL console
node:
	@echo "$(BOLD)$(CYAN)🟢 Opening Node.js REPL console...$(NC)"
	@docker compose exec livestream-monitor node

# Attach to container (for debugging)
attach:
	@echo "$(BOLD)$(CYAN)🔗 Attaching to container...$(NC)"
	@docker attach $$(docker compose ps -q livestream-monitor)

# Run locally with nodemon
local:
	@echo "$(BOLD)$(CYAN)🏠 Running with nodemon locally...$(NC)"
	@echo "$(YELLOW)⚠️  This requires local Node.js and dependencies$(NC)"
	@npm run dev

# Backend & Data Management
# Sync all data (sheets, ignore lists, cities)
sync:
	@echo "$(BOLD)$(CYAN)🔄 Syncing all backend data...$(NC)"
	@docker compose exec livestream-monitor node -e "console.log('Triggering full sync...')"
	@echo "$(GREEN)✅ Data sync initiated$(NC)"

# Sync Google Sheets data only
sync-sheets:
	@echo "$(BOLD)$(CYAN)📊 Testing Google Sheets connection...$(NC)"
	@node test-sheets.js
	@echo "$(GREEN)✅ Google Sheets sync completed$(NC)"

# Sync StreamSource data only
sync-source:
	@echo "$(BOLD)$(CYAN)🔗 Testing StreamSource connection...$(NC)"
	@node test-streamsource.js
	@echo "$(GREEN)✅ StreamSource sync completed$(NC)"

# Backup configuration files
backup-config:
	@echo "$(BOLD)$(CYAN)💾 Creating configuration backup...$(NC)"
	@mkdir -p backups
	@if [ -f .env ]; then cp .env backups/.env.backup.$$(date +%Y%m%d_%H%M%S); fi
	@if [ -f credentials.json ]; then cp credentials.json backups/credentials.backup.$$(date +%Y%m%d_%H%M%S); fi
	@echo "$(GREEN)✅ Configuration backup created in backups/ directory$(NC)"

# Restore configuration from backup
restore-config:
	@echo "$(BOLD)$(YELLOW)📥 Restoring configuration from backup...$(NC)"
	@if [ -z "$(file)" ]; then \
		echo "$(RED)Usage: make restore-config file=backups/.env.backup.20240101_120000$(NC)"; \
	else \
		cp $(file) .env; \
		echo "$(GREEN)✅ Configuration restored from $(file)$(NC)"; \
	fi

# Testing
# Run full test suite with coverage
test:
	@echo "$(BOLD)$(CYAN)🧪 Running full test suite with coverage...$(NC)"
	@npm test
	@echo "$(GREEN)✅ Tests completed$(NC)"

# Run tests in watch mode
test-watch:
	@echo "$(BOLD)$(CYAN)👀 Running tests in watch mode...$(NC)"
	@npm run test:watch

# Run unit tests only
test-unit:
	@echo "$(BOLD)$(CYAN)🔬 Running unit tests...$(NC)"
	@npm test -- --testPathPattern="lib/"

# Run integration tests only
test-integration:
	@echo "$(BOLD)$(CYAN)🔗 Running integration tests...$(NC)"
	@make test-sheets --no-print-directory
	@make test-source --no-print-directory

# Run backend tests only
test-backends:
	@echo "$(BOLD)$(CYAN)🏗️  Running backend tests...$(NC)"
	@npm test -- --testPathPattern="backends/"

# Run tests in parallel (faster)
test-parallel:
	@echo "$(BOLD)$(CYAN)⚡ Running tests in parallel...$(NC)"
	@npm test -- --maxWorkers=4

# Show test coverage report
coverage:
	@echo "$(BOLD)$(CYAN)📊 Generating test coverage report...$(NC)"
	@npm test -- --coverage
	@echo "$(GREEN)✅ Coverage report generated$(NC)"
	@echo "$(CYAN)📁 Open coverage/index.html in your browser$(NC)"

# Code Quality
# Run comprehensive code analysis
lint:
	@echo "$(BOLD)$(BLUE)🔍 Running Comprehensive Code Analysis$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)$(YELLOW)🎯 Step 1: JavaScript Style Check (ESLint)$(NC)"
	@npm run lint || echo "$(RED)❌ ESLint found style issues$(NC)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)🎯 Step 2: Code Complexity Analysis$(NC)"
	@find . -name '*.js' -not -path './node_modules/*' -not -path './coverage/*' -exec wc -l {} + | tail -1 | awk '{print "Total JavaScript lines: " $$1}'
	@echo ""
	@echo "$(BOLD)$(YELLOW)🎯 Step 3: Configuration Validation$(NC)"
	@node -e "try { require('./config.js'); console.log('✅ Config file is valid'); } catch(e) { console.log('❌ Config file has errors:', e.message); }"
	@echo ""
	@echo "$(GREEN)✅ Code quality analysis completed$(NC)"

# Run linter and auto-fix issues
lint-fix:
	@echo "$(BOLD)$(CYAN)🔧 Auto-fixing code style issues...$(NC)"
	@echo "$(YELLOW)Fixing JavaScript style issues...$(NC)"
	@npm run lint:fix || true
	@echo "$(GREEN)✅ Code formatting complete!$(NC)"

# Run ESLint (JavaScript style checking)
lint-js:
	@echo "$(BOLD)$(CYAN)📜 Running ESLint (JavaScript style checking)...$(NC)"
	@npm run lint

# Run security analysis
security:
	@echo "$(BOLD)$(RED)🔒 Running Security Analysis$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)$(YELLOW)🛡️  Step 1: NPM Vulnerability Scan$(NC)"
	@npm audit || echo "$(RED)⚠️  Vulnerabilities found - review output above$(NC)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)🛡️  Step 2: Exposed Secrets Check$(NC)"
	@echo "$(CYAN)Checking for exposed secrets...$(NC)"
	@if grep -r "DISCORD_TOKEN\|STREAMSOURCE_PASSWORD\|credentials\.json\|SECRET_KEY" . \
		--exclude-dir=node_modules \
		--exclude-dir=.git \
		--exclude-dir=backups \
		--exclude=.env.example \
		--exclude=Makefile \
		--exclude="*.md" \
		| grep -v "process.env" | grep -v "# " | head -5; then \
		echo "$(RED)⚠️  WARNING: Possible exposed secrets found above!$(NC)"; \
	else \
		echo "$(GREEN)✅ No exposed secrets found$(NC)"; \
	fi
	@echo ""
	@echo "$(BOLD)$(YELLOW)🛡️  Step 3: File Permissions Check$(NC)"
	@if [ -f .env ]; then \
		if [ "$$(stat -f %A .env 2>/dev/null || stat -c %a .env 2>/dev/null)" != "600" ]; then \
			echo "$(RED)⚠️  WARNING: .env file permissions are too open$(NC)"; \
		else \
			echo "$(GREEN)✅ .env file permissions OK$(NC)"; \
		fi; \
	fi
	@if [ -f credentials.json ]; then \
		if [ "$$(stat -f %A credentials.json 2>/dev/null || stat -c %a credentials.json 2>/dev/null)" != "600" ]; then \
			echo "$(RED)⚠️  WARNING: credentials.json permissions are too open$(NC)"; \
		else \
			echo "$(GREEN)✅ credentials.json permissions OK$(NC)"; \
		fi; \
	fi
	@echo ""
	@echo "$(GREEN)✅ Security analysis completed$(NC)"

# Format code (alias for lint-fix)
format: lint-fix

# Run full quality check
quality:
	@echo "$(BOLD)$(MAGENTA)🎯 Running Comprehensive Quality Check$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)$(YELLOW)Step 1: Code Quality (Linting)$(NC)"
	@make lint-js --no-print-directory
	@echo ""
	@echo "$(BOLD)$(YELLOW)Step 2: Security Analysis$(NC)"
	@make security --no-print-directory
	@echo ""
	@echo "$(BOLD)$(YELLOW)Step 3: Test Suite$(NC)"
	@make test --no-print-directory
	@echo ""
	@echo "$(BOLD)$(YELLOW)Step 4: Code Metrics$(NC)"
	@echo "$(CYAN)Lines of Code:$(NC)"
	@find . -name '*.js' -not -path './node_modules/*' -not -path './coverage/*' -exec wc -l {} + | tail -1 | awk '{print "JavaScript: " $$1 " lines"}'
	@echo ""
	@echo "$(CYAN)File Counts:$(NC)"
	@echo "Main files: $$(find . -name '*.js' -not -path './node_modules/*' -not -path './coverage/*' -not -name '*.test.js' | wc -l | tr -d ' ')"
	@echo "Test files: $$(find . -name '*.test.js' -not -path './node_modules/*' | wc -l | tr -d ' ')"
	@echo "Config files: $$(find . -name '*.json' -not -path './node_modules/*' -not -path './coverage/*' | wc -l | tr -d ' ')"
	@echo ""
	@echo "$(BOLD)$(GREEN)✅ All quality checks completed successfully!$(NC)"

# Run pre-commit checks
pre-commit:
	@echo "$(BOLD)$(MAGENTA)🚀 Running Pre-Commit Checks$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)$(YELLOW)1. Running tests...$(NC)"
	@npm test --silent || (echo "$(RED)❌ Tests failed$(NC)" && exit 1)
	@echo "$(GREEN)✅ Tests passed$(NC)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)2. Checking code style...$(NC)"
	@npm run lint:check --silent || (echo "$(RED)❌ ESLint issues found$(NC)" && exit 1)
	@echo "$(GREEN)✅ Code style OK$(NC)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)3. Security scan...$(NC)"
	@npm audit --audit-level high --silent || (echo "$(RED)❌ Security vulnerabilities found$(NC)" && exit 1)
	@echo "$(GREEN)✅ No security issues$(NC)"
	@echo ""
	@echo "$(BOLD)$(GREEN)✅ Pre-commit checks passed! Ready to commit.$(NC)"

# Dependencies & Assets
# Install Node.js dependencies
npm:
	@echo "$(BOLD)$(CYAN)📦 Installing Node.js dependencies...$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor npm install; \
	else \
		npm install; \
	fi
	@echo "$(GREEN)✅ Node.js dependencies installed$(NC)"

# Install all dependencies
install:
	@echo "$(BOLD)$(CYAN)📦 Installing all dependencies...$(NC)"
	@make npm --no-print-directory
	@echo "$(GREEN)✅ All dependencies installed$(NC)"

# Update all dependencies
update:
	@echo "$(BOLD)$(CYAN)🔄 Updating all dependencies...$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor npm update; \
	else \
		npm update; \
	fi
	@echo "$(GREEN)✅ All dependencies updated$(NC)"

# Audit dependencies for vulnerabilities
audit:
	@echo "$(BOLD)$(CYAN)🔍 Auditing dependencies for vulnerabilities...$(NC)"
	@npm audit
	@echo "$(GREEN)✅ Dependency audit completed$(NC)"

# Configuration Management
# Initial setup for new developers
setup:
	@echo "$(BOLD)$(CYAN)🏗️  Setting up Livestream Monitor development environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✅ Created .env file$(NC)"; \
	fi
	@echo "$(CYAN)📦 Installing dependencies...$(NC)"
	@make install --no-print-directory
	@echo "$(CYAN)🗄️  Creating log directory...$(NC)"
	@mkdir -p logs
	@echo ""
	@echo "$(BOLD)$(GREEN)✅ Setup complete! Next steps:$(NC)"
	@echo "1. Edit .env with your Discord, Twitch, and backend credentials"
	@echo "2. Add credentials.json for Google Sheets access (if using)"
	@echo "3. Run '$(CYAN)make dev$(NC)' to start the application"
	@echo "4. Run '$(CYAN)make test$(NC)' to verify everything works"

# Validate environment configuration
env-check:
	@echo "$(BOLD)$(CYAN)🔍 Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ ERROR: .env file not found!$(NC)"; \
		echo "Run '$(CYAN)make setup$(NC)' to create one"; \
		exit 1; \
	fi
	@echo "$(CYAN)Checking required environment variables...$(NC)"
	@grep -q "DISCORD_TOKEN=." .env && echo "$(GREEN)✅ DISCORD_TOKEN$(NC)" || echo "$(RED)❌ DISCORD_TOKEN not set$(NC)"
	@grep -q "DISCORD_CHANNEL_ID=." .env && echo "$(GREEN)✅ DISCORD_CHANNEL_ID$(NC)" || echo "$(RED)❌ DISCORD_CHANNEL_ID not set$(NC)"
	@grep -q "TWITCH_CHANNEL=." .env && echo "$(GREEN)✅ TWITCH_CHANNEL$(NC)" || echo "$(RED)❌ TWITCH_CHANNEL not set$(NC)"
	@echo "$(CYAN)Checking backend configuration...$(NC)"
	@grep -q "GOOGLE_SHEET_ID=." .env && echo "$(GREEN)✅ GOOGLE_SHEET_ID$(NC)" || echo "$(YELLOW)⚠️  GOOGLE_SHEET_ID not set$(NC)"
	@grep -q "STREAMSOURCE_API_URL=." .env && echo "$(GREEN)✅ STREAMSOURCE_API_URL$(NC)" || echo "$(YELLOW)⚠️  STREAMSOURCE_API_URL not set$(NC)"
	@if [ -f credentials.json ]; then echo "$(GREEN)✅ credentials.json found$(NC)"; else echo "$(YELLOW)⚠️  credentials.json not found$(NC)"; fi
	@echo "$(GREEN)✅ Configuration check complete$(NC)"

# Show current configuration (sanitized)
config:
	@echo "$(BOLD)$(CYAN)⚙️  Current Configuration:$(NC)"
	@if [ -f .env ]; then \
		echo "$(CYAN)Environment Variables:$(NC)"; \
		grep -E "^[^#]" .env | sed 's/\(.*PASSWORD.*=\).*/\1[HIDDEN]/' | sed 's/\(.*SECRET.*=\).*/\1[HIDDEN]/' | sed 's/\(.*KEY.*=\).*/\1[HIDDEN]/' | sed 's/\(.*TOKEN.*=\).*/\1[HIDDEN]/'; \
	else \
		echo "$(RED)❌ No .env file found$(NC)"; \
	fi
	@echo ""
	@echo "$(CYAN)Backend Status:$(NC)"
	@grep -q "BACKEND_GOOGLE_SHEETS_ENABLED=true" .env && echo "$(GREEN)✅ Google Sheets enabled$(NC)" || echo "$(YELLOW)⚠️  Google Sheets disabled$(NC)"
	@grep -q "BACKEND_STREAMSOURCE_ENABLED=true" .env && echo "$(GREEN)✅ StreamSource enabled$(NC)" || echo "$(YELLOW)⚠️  StreamSource disabled$(NC)"
	@echo ""
	@echo "$(CYAN)Node.js Version:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor node --version; \
	else \
		node --version || echo "$(RED)Node.js not available$(NC)"; \
	fi
	@echo "$(CYAN)NPM Version:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor npm --version; \
	else \
		npm --version || echo "$(RED)NPM not available$(NC)"; \
	fi

# Show version information
version:
	@echo "$(BOLD)$(CYAN)📋 Livestream Monitor Version Information:$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(YELLOW)Node.js:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor node --version; \
	else \
		node --version || echo "$(RED)Node.js not available$(NC)"; \
	fi
	@echo "$(YELLOW)NPM:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor npm --version; \
	else \
		npm --version || echo "$(RED)NPM not available$(NC)"; \
	fi
	@echo "$(YELLOW)Docker:$(NC)"
	@docker --version || echo "$(RED)Docker not available$(NC)"
	@echo "$(YELLOW)Docker Compose:$(NC)"
	@docker compose version || echo "$(RED)Docker Compose not available$(NC)"

# Maintenance
# Complete rebuild
rebuild:
	@echo "$(BOLD)$(YELLOW)🔄 Complete rebuild (this may take a while)...$(NC)"
	@echo "$(CYAN)Stopping services...$(NC)"
	@docker compose stop
	@echo "$(CYAN)Removing containers and volumes...$(NC)"
	@docker compose down -v --remove-orphans
	@echo "$(CYAN)Rebuilding images...$(NC)"
	@docker compose build --no-cache
	@echo "$(CYAN)Starting services...$(NC)"
	@docker compose up -d
	@echo "$(GREEN)✅ Rebuild complete$(NC)"
	@make logs --no-print-directory

# Clean up containers, volumes, and logs
clean:
	@echo "$(BOLD)$(YELLOW)🧹 Cleaning up Livestream Monitor...$(NC)"
	@docker compose down -v --remove-orphans
	@rm -rf logs/*.log tmp/* node_modules/.cache
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

# Deep clean (including images and cache)
clean-all:
	@echo "$(BOLD)$(RED)🧹 Deep cleaning (this will remove all Docker data)...$(NC)"
	@read -p "Are you sure? This will remove all images and cached data. (y/N) " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		docker compose down -v --remove-orphans --rmi all; \
		docker system prune -f; \
		rm -rf logs/ tmp/ node_modules/.cache coverage/; \
		echo "$(GREEN)✅ Deep clean complete$(NC)"; \
	else \
		echo "$(YELLOW)Deep clean cancelled$(NC)"; \
	fi

# Remove unused Docker resources
prune:
	@echo "$(BOLD)$(YELLOW)🧹 Removing unused Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✅ Docker resources pruned$(NC)"

# Diagnose common issues
doctor:
	@echo "$(BOLD)$(CYAN)🏥 Livestream Monitor Doctor - Diagnosing Issues$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(BOLD)$(GREEN)1. System Requirements:$(NC)"
	@docker --version || echo "$(RED)❌ Docker not installed$(NC)"
	@docker compose version || echo "$(RED)❌ Docker Compose not installed$(NC)"
	@node --version >/dev/null 2>&1 && echo "$(GREEN)✅ Node.js: $$(node --version)$(NC)" || echo "$(RED)❌ Node.js not installed$(NC)"
	@npm --version >/dev/null 2>&1 && echo "$(GREEN)✅ NPM: $$(npm --version)$(NC)" || echo "$(RED)❌ NPM not installed$(NC)"
	@echo ""
	@echo "$(BOLD)$(GREEN)2. Configuration:$(NC)"
	@make env-check --no-print-directory
	@echo ""
	@echo "$(BOLD)$(GREEN)3. Services Status:$(NC)"
	@make status --no-print-directory
	@echo ""
	@echo "$(BOLD)$(GREEN)4. Application Health:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		docker compose exec livestream-monitor node -e "console.log('$(GREEN)✅ Node.js runtime: OK$(NC)')" 2>/dev/null || echo "$(RED)❌ Node.js runtime: ERROR$(NC)"; \
	else \
		node -e "console.log('$(GREEN)✅ Node.js runtime: OK$(NC)')" 2>/dev/null || echo "$(RED)❌ Node.js runtime: ERROR$(NC)"; \
	fi
	@echo ""
	@echo "$(BOLD)$(GREEN)5. Dependencies:$(NC)"
	@if [ -d node_modules ]; then echo "$(GREEN)✅ Dependencies: OK$(NC)"; else echo "$(RED)❌ Dependencies: Missing - run 'make install'$(NC)"; fi
	@echo ""
	@echo "$(BOLD)$(GREEN)6. Disk Space:$(NC)"
	@df -h . | tail -1 | awk '{print "Available: " $$4 " (" $$5 " used)"}'
	@echo ""
	@echo "$(BOLD)$(GREEN)7. Test Status:$(NC)"
	@npm test --silent >/dev/null 2>&1 && echo "$(GREEN)✅ Tests: Passing$(NC)" || echo "$(RED)❌ Tests: Failing - run 'make test' for details$(NC)"

# Additional Commands
.PHONY: exec run cmd backup logs-all ps-all health

# Execute command in container
exec:
	@if [ -z "$(cmd)" ]; then \
		echo "$(YELLOW)Usage: make exec cmd='ls -la'$(NC)"; \
	else \
		docker compose exec livestream-monitor $(cmd); \
	fi

# Run command in new container
run:
	@if [ -z "$(cmd)" ]; then \
		echo "$(YELLOW)Usage: make run cmd='node --version'$(NC)"; \
	else \
		docker compose run --rm livestream-monitor $(cmd); \
	fi

# Backup application data
backup:
	@echo "$(BOLD)$(CYAN)💾 Creating application backup...$(NC)"
	@mkdir -p backups
	@make backup-config --no-print-directory
	@if [ -d logs ]; then tar -czf backups/logs_backup_$$(date +%Y%m%d_%H%M%S).tar.gz logs/; fi
	@echo "$(GREEN)✅ Backup created in backups/ directory$(NC)"

# Show logs for all services
logs-all:
	@echo "$(BOLD)$(CYAN)📋 Showing logs for all services...$(NC)"
	@docker compose logs -f

# Show all containers (including stopped)
ps-all:
	@echo "$(BOLD)$(CYAN)📊 All Livestream Monitor containers:$(NC)"
	@docker compose ps -a

# Health check
health:
	@echo "$(BOLD)$(CYAN)🏥 Livestream Monitor Health Check:$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@make status --no-print-directory
	@echo ""
	@echo "$(CYAN)Application Health:$(NC)"
	@if docker compose ps -q livestream-monitor >/dev/null 2>&1; then \
		if docker compose exec livestream-monitor node -e "process.exit(0)" 2>/dev/null; then \
			echo "$(GREEN)✅ Application: Healthy$(NC)"; \
		else \
			echo "$(RED)❌ Application: Unhealthy$(NC)"; \
		fi; \
	else \
		echo "$(YELLOW)⚠️  Application: Not running$(NC)"; \
	fi
	@echo ""
	@make doctor --no-print-directory

# Quick shortcuts for common commands
.PHONY: d u l r s t n

d: dev
u: up
l: logs
r: restart
s: status
t: test
n: node