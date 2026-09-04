# Home Detailing developer entry point. Run `make` or `make help` for the list.
# Bun is the package manager and script runner; Next itself runs on Node.

.DEFAULT_GOAL := help
SHELL := /bin/sh

COMPOSE      := docker compose -f compose.yml
COMPOSE_PROD := docker compose -f compose.prod.yml --env-file .env.production
IMAGE        ?= homedetailing/app:local
DB_USER      := homedetailing
TEST_DB      := homedetailing_test

.PHONY: help setup install dev build start lint typecheck test test-unit test-integration test-watch check \
        db-up db-down db-migrate db-generate db-studio db-reset db-test-ensure ui-build \
        docker-build docker-run prod-up prod-down prod-logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## Setup

setup: ## First run: create .env, install deps, start Postgres, apply migrations
	@test -f .env || (cp .env.example .env && echo "Created .env from .env.example. Set JWT_SECRET and ADMIN_REGISTRATION_CODE.")
	$(MAKE) install db-up db-migrate

install: ## bun install --frozen-lockfile
	bun install --frozen-lockfile

## App

dev: ## next dev on http://localhost:3000 (admin at /admin)
	bun run dev

build: ## next build (standalone output)
	bun run build

start: ## next start (after build)
	bun run start

ui-build: ## Build design-system dist (tsc + css) for the Claude Design sync
	bun run build:ui

## Quality

lint: ## eslint
	bun run lint

typecheck: ## tsc --noEmit
	bun run typecheck

test: test-unit ## Alias for test-unit

test-unit: ## Vitest project "unit" (pure logic, no database)
	bun run test:unit

test-integration: db-up db-test-ensure ## Vitest project "integration" (route handlers against homedetailing_test)
	bun run test:integration

test-watch: ## Vitest watch mode (unit)
	bun run test:watch

check: lint typecheck test-unit ## Definition of done: lint + typecheck + unit tests

## Database (dev)

db-up: ## Start dev Postgres and wait until healthy
	$(COMPOSE) up -d --wait postgres

db-down: ## Stop dev Postgres (keeps the volume)
	$(COMPOSE) down

db-test-ensure: ## Create homedetailing_test if the volume predates the init script
	@$(COMPOSE) exec -T postgres psql -U $(DB_USER) -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$(TEST_DB)'" | grep -q 1 || \
	  $(COMPOSE) exec -T postgres createdb -U $(DB_USER) $(TEST_DB)

db-migrate: ## drizzle-kit migrate against DATABASE_URL from .env
	bun run db:migrate

db-generate: ## drizzle-kit generate after editing lib/db/schema.ts
	bun run db:generate

db-studio: ## drizzle-kit studio
	bun run db:studio

db-reset: ## Destroy the dev volume, recreate and migrate
	$(COMPOSE) down -v
	$(MAKE) db-up db-migrate

## Docker / production stack

docker-build: ## Build the production image ($(IMAGE))
	docker build -t $(IMAGE) .

docker-run: ## Run the image alone on :3000 with placeholder env (smoke test)
	docker run --rm -p 3000:3000 -e DATABASE_URL=postgresql://placeholder@127.0.0.1:5432/placeholder \
	  -e JWT_SECRET=placeholder-secret-that-is-at-least-32-chars-long $(IMAGE)

prod-up: ## Build and start app + postgres + migrate from compose.prod.yml (.env.production required)
	@test -f .env.production || (echo "Missing .env.production; copy .env.production.example and fill it in." && exit 1)
	$(COMPOSE_PROD) up -d --build

prod-down: ## Stop the prod stack (keeps the volume)
	$(COMPOSE_PROD) down

prod-logs: ## Tail prod stack logs
	$(COMPOSE_PROD) logs -f

clean: ## Remove build artifacts
	rm -rf .next design-system/dist tsconfig.tsbuildinfo coverage
