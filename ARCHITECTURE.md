# Architecture Documentation

## Technical Stack

- Framework: NestJS v11+
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma 7
- API docs: Swagger / OpenAPI
- Validation: class-validator, class-transformer
- Auth: JWT access/refresh + Argon2id

## API Segments

- Public: `/catalog/*`, `/auth/*`
- Backoffice: `/backoffice/*`
- Admin-only: `/admin/*`

## Role Model

- `User`: xem catalog, search, feed
- `Staff`: quan ly catalog backoffice
- `Admin`: toan bo quyen cua `Staff` va quan ly user/he thong

## Security Notes

- Password hash bang Argon2id
- Refresh token chi luu hash trong DB
- Access token va refresh token dung secret rieng
- Route backoffice yeu cau `Staff` hoac `Admin`
- Route admin-only yeu cau `Admin`

## Main Modules

- `src/modules/auth`: login, refresh, guards, role decorators
- `src/modules/catalog`: category, brand, product, variant, attribute
- `src/modules/users`: admin-only user management
- `src/prisma`: schema va migrations

## Runtime

- Port mac dinh: `3001`
- Swagger: `http://localhost:3001/api`
- Database config: `.env` + `prisma.config.ts`

## Development Workflow

1. Sua `prisma/schema.prisma`
2. Chay `npx prisma migrate dev`
3. Neu can du lieu mau, chay `npm run db:seed`
4. Chay `npm run start:dev`
