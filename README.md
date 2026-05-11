# ShopAHSO Backend

Backend API cho `ahso.vn`, tap trung vao:

- catalog cong nghiep va linh kien ky thuat
- filter theo thong so dong
- van hanh backoffice cho `Staff` va `Admin`
- user management rieng cho `Admin`

## Tai lieu

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PRODUCT.md](./PRODUCT.md)
- [DESIGN.md](./DESIGN.md)
- [AGENT.md](./AGENT.md)
- [FEED_ENGINE_ARCHITECTURE.md](./FEED_ENGINE_ARCHITECTURE.md)
- [plan.md](./plan.md)

## Namespaces

- Public API: `/catalog/*`, `/auth/*`
- Backoffice API: `/backoffice/*`
- Admin-only API: `/admin/*`

## Roles

- `User`: dung public API
- `Staff`: dung backoffice API
- `Admin`: dung backoffice API va admin-only API

## Setup

```bash
npm install
```

## Run

```bash
npm run start:dev
```

Swagger:

```txt
http://localhost:3001/api
```

## Auth Quick Start

Neu chua co admin dau tien:

- `POST /auth/bootstrap-admin`
- Header: `x-bootstrap-key: <BOOTSTRAP_ADMIN_KEY>`

Body:

```json
{
  "email": "admin@ahso.local",
  "password": "Admin@12345"
}
```

Dang nhap:

- `POST /auth/login`

```json
{
  "email": "admin@ahso.local",
  "password": "Admin@12345"
}
```

Su dung Swagger `Authorize`:

1. Copy `accessToken`
2. Bam `Authorize`
3. Dan **chi token**, khong them chu `Bearer`
4. Thu:
   - `GET /auth/me`
   - `GET /backoffice/categories`
   - `GET /admin/users`

## Scripts

```bash
npm run build
npm run test
npm run test:e2e
npm run db:seed
```
