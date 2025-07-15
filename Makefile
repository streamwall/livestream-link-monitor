# Livestream Link Monitor
# Usage: make [command]

.PHONY: help up down shell test logs

help:
	@echo "Commands:"
	@echo "  up      - Start monitor"
	@echo "  down    - Stop monitor"
	@echo "  shell   - Container shell"
	@echo "  test    - Run tests"
	@echo "  logs    - View logs"

up:
	docker compose up -d

down:
	docker compose down

shell:
	docker compose exec livestream-monitor sh

test:
	npm test

logs:
	docker compose logs -f