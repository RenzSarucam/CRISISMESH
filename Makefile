.PHONY: up down build logs seed migrate test-backend test-frontend fresh

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

migrate:
	docker compose exec backend php artisan migrate

seed:
	docker compose exec backend php artisan db:seed

fresh:
	docker compose exec backend php artisan migrate:fresh --seed

test-backend:
	docker compose exec backend php artisan test

test-frontend:
	cd frontend && npm test
