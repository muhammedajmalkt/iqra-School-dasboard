#Production - Up docker containers with detached mode for production
.PHONY: compose-up-build
compose-up-build:
	docker compose up -d --build

# Development - it's for the development
.PHONY: compose-up-build-dev
compose-up-build-dev:
	docker compose -f docker-compose.dev.yml up --build

# Stop and remove all containers
.PHONY: compose-down
compose-down:
	docker compose down

# Rebuild dev setup
.PHONY: compose-rebuild-dev
compose-rebuild-dev:
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml up --build
