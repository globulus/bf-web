# Shopfront web

The web shop: product list, order form, order list. React 19 + TypeScript + Vite.

## Getting started

Node 22 (see `.nvmrc`), npm.

```sh
npm ci
npm run dev
```

The dev server proxies `/api/v1/orders` to orders-service and the rest of `/api` to
catalog-service. By default they're expected where dev-env puts them
(`http://localhost:7081` and `http://localhost:7082`); override with `ORDERS_API_URL` and
`CATALOG_API_URL` in `.env.local`.

## Scripts

| Script | |
|---|---|
| `npm run dev` | dev server on :5173 |
| `npm run build` | type-check and build to `dist/` |
| `npm test` | Vitest unit tests (jsdom) |
| `npm run lint` | ESLint |
| `npm run api:generate` | regenerate `src/api/generated/` from `openapi/` |
| `npm run e2e` | Playwright against a running stack |

## API types

`openapi/orders.json` and `openapi/catalog.json` are copies of the backends' OpenAPI specs
(CI artifacts `orders-openapi` and `catalog-openapi`). `npm run api:generate` turns them
into types with [openapi-typescript](https://openapi-ts.dev); requests go through
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/), see `src/api/client.ts`.

The generated files are committed. CI fails if they don't match `openapi/`.

Heads-up: springdoc doesn't mark response fields as required, so every field in the
generated types is optional. Expect a lot of `?.`.

## E2E tests

Start the whole stack with dev-env and seed it, then:

```sh
npx playwright install chromium   # once
E2E_BASE_URL=http://localhost:7080 npm run e2e
```

## Docker

The image builds the app and serves it with nginx, which also proxies the APIs.
`ORDERS_API_URL` and `CATALOG_API_URL` set where (defaults:
`http://orders-service:8080`, `http://catalog-service:8080`).
