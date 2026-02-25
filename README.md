# installation

The architecture of this repository is inspired by: https://github.com/iNeoO/urlshortener/tree/feat/v2

```bash
cp .env.exemple .env
pnpm install
docker compose up 
pnpm run db:migrate
pnpm run db:generate
pnpm run db:build
pnpm run common:build
pnpm run infra:build
pnpm run backend:build
pnpm run dev
# app: http://localhost:5173
# api: http://localhost:4000
```
