# Backend Long-Term Plan

## 1. Muc tieu

Tai lieu nay la ban ke hoach dai hoi de thiet ke va trien khai backend NestJS cho ShopAHSO theo mo hinh:

- `Product` = product family / nhom san pham
- `ProductVariant` = SKU that / don vi ban hang
- `Dynamic Attribute` = thong so ky thuat dong
- public listing, search, feed, tracking deu xoay quanh `ProductVariant`

Muc tieu cua ban ke hoach:

- thong nhat mo hinh du lieu truoc khi code lon
- chia phase ro rang de lam dan
- giam rui ro doi schema nhieu lan
- dam bao backend phu hop voi bai toan hang cong nghiep, linh kien, vat tu ky thuat

---

## 2. Dinh huong nghiep vu

Dac diem cua he thong:

- khach thuong tim san pham rat cu the theo ma, kich thuoc, dien ap, vat lieu
- moi dong san pham co nhieu variant rat giong nhau, chi khac thong so
- can import catalog so luong lon tu CSV/Excel
- listing nen hien thi variant nhu mot san pham doc lap
- product chi dong vai tro nhom logic de gom variant cung dong

He qua kien truc:

- `ProductVariant` la read model chinh cho catalog listing
- `Product` la lop trung gian cho grouping, SEO va detail theo dong san pham
- attribute phai ho tro du lieu ky thuat da dang, thay doi theo tung dong hang

---

## 2.1 Mo hinh role

He thong can co 3 role chinh:

- `User`
- `Staff`
- `Admin`

Y nghia nghiep vu:

- `User`
  - xem catalog
  - tim kiem
  - xem feed
  - tao cac hanh vi public nhu search, click, add to cart, quote request
- `Staff`
  - quan ly catalog
  - tao/sua category, brand, product, variant
  - quan ly attribute, import du lieu, cap nhat ton kho co ban
  - xem dashboard van hanh
- `Admin`
  - co toan bo quyen cua `Staff`
  - quan ly tai khoan noi bo
  - quan ly role/permission
  - cau hinh he thong, cache, search, feed, import policy, audit

Nguyen tac quan trong:

- phan lon cac thao tac backend da lam den luc nay la thao tac `backoffice`
- ve nghiep vu, ca `Staff` va `Admin` deu duoc phep dung
- `Admin` la role cao hon, khong phai role duy nhat duoc thao tac catalog
- chi nhung API quan ly he thong va user noi bo moi dung namespace `admin`

Ket luan cho codebase hien tai:

- namespace chuan cho thao tac noi bo la `/backoffice/*`
- nhom route nay phai cho phep:
  - `Staff`
  - `Admin`
- khong dung `/admin/*` lam route chinh nua vi gay hieu nham rang chi `Admin` duoc phep

---

## 3. Quyet dinh mo hinh attribute

### 3.1 Co the de attribute theo product khong?

Co. Day la mo hinh hop ly neu muon:

- tat ca variant trong cung product dung cung mot danh sach attribute
- backoffice de quan ly vi pham vi attribute hep hon category
- tranh tinh trang category qua rong dan den qua nhieu attribute khong lien quan

Vi du:

- product: `Cam bien tiem can Omron E2E`
- variants:
  - `E2E-X5ME1`
  - `E2E-X10ME1`
  - `E2E-X5MF1`

Tat ca co the dung chung bo attribute:

- sensing_distance
- output_type
- voltage
- body_size
- cable_length

### 3.2 Uu diem cua attribute theo product

- dung hon voi cac dong san pham co spec dac thu
- de bao dam moi variant co cung "khung thong so"
- de render bang so sanh variant cung dong
- import CSV theo tung product family de map cot de hon

### 3.3 Nhuoc diem

- kho tai su dung dinh nghia attribute giua nhieu product cung loai
- bo loc category-level se phuc tap hon neu moi product tu dinh nghia mot kieu
- de sinh rac schema logic neu cung mot y nghia nhung tao nhieu attribute khac ten
- search/filter toan category can chuan hoa code attribute rat ky

### 3.4 Khuyen nghi cuoi cung

Khong nen chi chon "theo category" hoac "theo product" mot cach cuc doan. Nen dung mo hinh lai:

- `AttributeTemplate` theo `Category`
  - dung de tao bo khung chung
  - quy dinh `code`, `data_type`, `unit`, `is_filterable`, `is_searchable`
- `ProductAttributeDefinition` theo `Product`
  - la bo attribute thuc te cua product
  - co the tao moi hoac copy/inherit tu template cua category
- `VariantAttributeValue` theo `ProductVariant`
  - luu gia tri thuc te cua tung variant

Mo hinh nay giu duoc ca hai:

- category van co chuan chung de filter/search
- product van co quyen tuy bien de phu hop dong hang cu the

### 3.5 Nguyen tac chuan hoa quan trong

Du attribute theo product, van can:

- `code` duoc chuan hoa, vi du: `voltage`, `length`, `diameter`, `material`
- khong cho tao trung nghia khac chinh ta nhu `length`, `lenght`, `chieu_dai`
- nen co co che map tu template category sang product attribute

Quyet dinh ap dung cho project:

- source of truth cho gia tri thong so van nam o `VariantAttributeValue`
- danh sach attribute thuc te cua variant duoc rang buoc theo `Product`
- category giu vai tro template/chuan hoa, khong bat buoc la noi luu attribute duy nhat

---

## 4. Mo hinh du lieu muc tieu

### 4.1 Category

Dung de to chuc catalog theo cay danh muc nhieu cap.

Truong co ban:

- `id`
- `parentId`
- `name`
- `slug`
- `description`
- `active`
- `createdAt`
- `updatedAt`

Nguyen tac:

- category goc co `parentId = null`
- category co the co nhieu cap, khong hard-code so tang
- `Product` nen gan vao category la hoac category gan la nhat
- khi query theo category cha, he thong phai lay du tat ca category con

Vi du cay:

```text
Vat tu cong nghiep
└── Bu long
    ├── Bu long no
    ├── Bu long inox
    └── Bu long thep cuong luc
```

Vi du mapping nghiep vu:

- Category cap 1: `Vat tu cong nghiep`
- Category cap 2: `Bu long`
- Category cap 3: `Bu long no`
- Product: `Bu long no thep ma kem`
- Variant: `Bu long no thep ma kem M8x80`

`Product type` tam thoi khong tach thanh bang rieng. Vai tro nay duoc bieu dien bang category cap trung gian trong cay.

### 4.2 Brand

Dung cho thuong hieu, hang san xuat.

Truong co ban:

- `id`
- `name`
- `slug`
- `logoUrl`
- `active`
- `createdAt`
- `updatedAt`

### 4.3 Product

La product family / nhom logic.

Truong co ban:

- `id`
- `categoryId`
- `brandId`
- `name`
- `slug`
- `description`
- `datasheetUrl`
- `active`
- `createdAt`
- `updatedAt`

### 4.4 ProductVariant

La SKU that, don vi ban va hien thi chinh.

Truong co ban:

- `id`
- `productId`
- `categoryId`
- `brandId`
- `sku`
- `manufacturerPartNumber`
- `name`
- `slug`
- `price`
- `stockQuantity`
- `unit`
- `minOrderQuantity`
- `score`
- `viewCount`
- `orderCount`
- `specSnapshot`
- `active`
- `createdAt`
- `updatedAt`

Ghi chu:

- `categoryId` va `brandId` duoc copy vao variant de query nhanh
- `price` nen dung decimal
- `specSnapshot` la read model phuc vu detail/listing nhanh

### 4.5 CategoryAttributeTemplate

Bo attribute mau theo category.

Truong co ban:

- `id`
- `categoryId`
- `name`
- `code`
- `dataType`
- `unit`
- `isFilterable`
- `isSearchable`
- `isRequired`
- `sortOrder`
- `active`
- `createdAt`
- `updatedAt`

### 4.6 ProductAttributeDefinition

Bo attribute thuc te cua tung product.

Truong co ban:

- `id`
- `productId`
- `categoryTemplateId` nullable
- `name`
- `code`
- `dataType`
- `unit`
- `isFilterable`
- `isSearchable`
- `isRequired`
- `sortOrder`
- `active`
- `createdAt`
- `updatedAt`

Y nghia:

- neu `categoryTemplateId` co gia tri, attribute nay duoc sinh ra tu template category
- neu `categoryTemplateId` null, day la attribute rieng cua product

### 4.7 VariantAttributeValue

Gia tri thong so cua tung variant.

Truong co ban:

- `id`
- `variantId`
- `productAttributeDefinitionId`
- `valueText`
- `valueNumber`
- `valueBoolean`
- `valueEnum`
- `createdAt`
- `updatedAt`

Rang buoc:

- unique `(variantId, productAttributeDefinitionId)`

---

## 5. Quy tac du lieu

### 5.0 Quy tac ve category tree

- khong gan `Product` vao category qua tong quat neu da co category con phu hop
- uu tien gan `Product` vao category la de filter va breadcrumb chinh xac
- `ProductVariant.categoryId` duoc copy tu `Product.categoryId` de query nhanh
- khi category cua product thay doi, can sync lai `categoryId` tren variant
- can co API ho tro:
  - lay toan bo category tree
  - lay children theo `parentId`
  - lay breadcrumb theo `categoryId`
  - lay descendant ids cua mot category

Phase dau dung mo hinh adjacency list:

- moi category luu `parentId`
- query tree va breadcrumb o service layer
- khi quy mo lon hon, co the bo sung `path`, `level` hoac closure table

### 5.1 Quy tac ve slug

- `categories.slug` unique
- `brands.slug` unique
- `products.slug` unique
- `product_variants.slug` unique

### 5.2 Quy tac ve SKU

- `sku` unique toan cuc
- `manufacturerPartNumber` co the unique neu nghiep vu dam bao, neu khong thi chi index

### 5.3 Quy tac ve price

- dung decimal, khong dung float

### 5.4 Quy tac ve inventory

- phase dau cho phep luu `stockQuantity` tren variant
- phase sau tach inventory service / transaction ledger

### 5.5 Quy tac ve xoa du lieu

- uu tien soft delete thong qua `active = false`
- tranh hard delete voi entity catalog da phat sinh event, search index, tracking

---

## 6. Kien truc module NestJS muc tieu

```text
src/
 ├── modules/
 │    ├── catalog/
 │    │    ├── category/
 │    │    ├── brand/
 │    │    ├── product/
 │    │    ├── variant/
 │    │    ├── attribute/
 │    │    ├── import/
 │    │    └── catalog.module.ts
 │    │
 │    ├── feed/
 │    │    ├── feed.controller.ts
 │    │    ├── feed.service.ts
 │    │    └── diversity.service.ts
 │    │
 │    ├── ranking/
 │    │    ├── ranking.module.ts
 │    │    ├── variant-ranking.service.ts
 │    │    └── ranking-cron.service.ts
 │    │
 │    ├── search/
 │    │    ├── search.module.ts
 │    │    ├── search.service.ts
 │    │    └── search-indexer.service.ts
 │    │
 │    ├── tracking/
 │    │    ├── tracking.module.ts
 │    │    ├── tracking.controller.ts
 │    │    └── tracking.service.ts
 │    │
 │    ├── cache/
 │    │    └── redis.module.ts
 │    │
 │    ├── inventory/
 │    │    └── inventory.module.ts
 │    │
 │    └── recommendation/
 │         └── recommendation.module.ts
 │
 ├── prisma/
 └── common/
```

---

## 7. API muc tieu

### 7.1 Backoffice catalog

Category:

- `POST /backoffice/categories`
- `GET /backoffice/categories`
- `GET /backoffice/categories/:id`
- `PATCH /backoffice/categories/:id`
- `DELETE /backoffice/categories/:id`

Brand:

- `POST /backoffice/brands`
- `GET /backoffice/brands`
- `GET /backoffice/brands/:id`
- `PATCH /backoffice/brands/:id`
- `DELETE /backoffice/brands/:id`

Product:

- `POST /backoffice/products`
- `GET /backoffice/products`
- `GET /backoffice/products/:id`
- `PATCH /backoffice/products/:id`
- `DELETE /backoffice/products/:id`

Variant:

- `POST /backoffice/variants`
- `GET /backoffice/variants`
- `GET /backoffice/variants/:id`
- `PATCH /backoffice/variants/:id`
- `DELETE /backoffice/variants/:id`
- `POST /backoffice/variants/bulk-upsert`

Attribute:

- `POST /backoffice/products/:productId/attributes`
- `GET /backoffice/products/:productId/attributes`
- `PATCH /backoffice/product-attributes/:id`
- `DELETE /backoffice/product-attributes/:id`

Category attribute template:

- `POST /backoffice/categories/:categoryId/attribute-templates`
- `GET /backoffice/categories/:categoryId/attribute-templates`
- `PATCH /backoffice/category-attribute-templates/:id`
- `DELETE /backoffice/category-attribute-templates/:id`

Ghi chu role:

- nhom API nay la `backoffice catalog API`
- khi auth duoc them vao, quyen truy cap mac dinh:
  - `Staff`: duoc phep
  - `Admin`: duoc phep
  - `User`: khong duoc phep

### 7.1.1 Admin-only user management

- `GET /admin/users`
- `GET /admin/users/:id`
- `POST /admin/users`
- `PATCH /admin/users/:id/role`
- `PATCH /admin/users/:id/status`
- `POST /admin/users/:id/reset-password`

Ghi chu role:

- nhom API nay chi danh cho `Admin`
- khong mo cho `Staff`

### 7.2 Public catalog

- `GET /catalog/variants`
- `GET /catalog/variants/:slug`
- `GET /catalog/products/:slug`
- `GET /catalog/categories/tree`
- `GET /catalog/categories/:slug`

Nguyen tac:

- listing, search, filter chay tren `ProductVariant`
- product detail dung de gom variant cung dong
- category detail dung de phuc vu menu, breadcrumb va landing page theo nganh/nhom hang

### 7.3 Feed

- `GET /feed?cursor=xxx`

### 7.4 Tracking

- `POST /tracking/events`

---

## 8. Search va filter

Search va filter phai xoay quanh variant.

Can ho tro:

- search theo `sku`
- search theo `manufacturerPartNumber`
- search theo `name`
- search theo attribute nhu `voltage`, `length`, `material`
- filter theo `category`, `brand`, `price`

Query vi du:

```text
/catalog/variants?categoryId=...&brandId=...
/catalog/variants?attr.length.gte=100&attr.length.lte=150
/catalog/variants?attr.material=thep-ma-kem
```

Nguyen tac:

- phase dau cho phep query bang PostgreSQL
- phase sau dua sang Meilisearch de tang toc do va chat luong search

---

## 9. Import san pham

Import la nang luc cot loi, khong phai tinh nang phu.

### 9.1 Input

- CSV
- Excel

### 9.2 Flow tong quat

```text
Upload file
  ↓
Parse rows
  ↓
Detect system fields
  ↓
Detect attribute columns
  ↓
Backoffice mapping
  ↓
Validate
  ↓
Preview
  ↓
Commit
  ↓
Upsert category/brand/product/variant
  ↓
Upsert product attributes
  ↓
Upsert variant attribute values
  ↓
Build spec_snapshot
  ↓
Sync search index
```

### 9.3 Nguyen tac import

- moi dong import = mot variant
- khong auto tao attribute 100 phan tram neu chua duyet
- cho phep map cot vao:
  - field he thong
  - attribute co san
  - tao attribute moi
  - bo qua cot

---

## 10. Feed, ranking, tracking

### 10.1 Feed

Feed su dung variant, khong su dung product.

Can tranh spam:

- cung category
- cung brand
- cung product family

Cursor nen chua:

```json
{
  "seed": "abc",
  "seenVariantIds": [],
  "seenProductIds": [],
  "categoryState": {},
  "lastScore": 0
}
```

### 10.2 Ranking

`score` nam tren `ProductVariant`.

Cong thuc khoi dau:

```text
score =
  order_count * 0.4
  + view_count * 0.2
  + freshness * 0.2
  + stock_score * 0.1
  + ctr * 0.1
```

Update score bang cron, khong reorder thu cong.

### 10.3 Tracking

Track theo variant.

Cac event can co:

- `view_variant`
- `click_variant`
- `add_to_cart`
- `quote_request`
- `search`
- `filter_apply`
- `category_click`

---

## 11. Caching va hieu nang

Redis key du kien:

- `feed:guest:{seed}:{cursorHash}`
- `catalog:variant:{slug}`
- `catalog:filters:{categoryId}`
- `search:q:{hash}`

TTL goi y:

- feed: 5 phut
- variant detail: 10-30 phut
- filters: 10 phut
- search: 1-5 phut

---

## 12. Index va constraint quan trong

Can co it nhat:

- index `product_variants(active, score desc)`
- index `product_variants(category_id, score desc)`
- index `product_variants(brand_id, score desc)`
- index `product_variants(product_id)`
- unique index `product_variants(sku)`
- unique index `product_variants(slug)`
- index `variant_attribute_values(variant_id)`
- unique index `(variant_id, product_attribute_definition_id)`
- index theo attribute text/number de phuc vu filter

Neu dung product-level attribute:

- nen index `product_attribute_definitions(code, product_id)`
- neu can filter toan category, can strategy map code chuan hoa de query nhat quan

---

## 13. Cac phase trien khai

### Phase 0 - Chot nen tang ky thuat

Muc tieu:

- don dep scaffold hien tai
- chot convention ten bang, DTO, response
- fix test config, path alias, setup Prisma
- chot mo hinh `Category tree -> Product -> Variant`

Deliverables:

- test chay duoc
- cau truc module ro rang
- prisma migration dau tien sach
- plan va architecture docs dong bo

### Phase 1 - Catalog core

Muc tieu:

- tao duoc category, brand, product, variant
- tao duoc product-level attribute
- luu duoc variant attribute values

Deliverables:

- schema Prisma day du
- CRUD backoffice co ban
- public read API co ban
- category tree API + breadcrumb logic

### Phase 2 - Listing va filter co ban

Muc tieu:

- `GET /catalog/variants`
- `GET /catalog/variants/:slug`
- `GET /catalog/products/:slug`
- filter theo category, brand, price, attribute

Deliverables:

- bo query DTO on dinh
- phan trang cursor hoac page-size tam thoi cho catalog
- response shape ro rang

### Phase 2.5 - Auth va role nen tang

Muc tieu:

- bo sung authentication
- bo sung role guard cho `User`, `Staff`, `Admin`
- tach ro public API va backoffice API

Deliverables:

- `auth` module
- `roles` enum va role decorator
- `jwt` hoac session strategy
- guard cho nhom route backoffice
- quy dinh:
  - public API: `User`, `Staff`, `Admin` deu co the truy cap neu phu hop
  - backoffice catalog API: `Staff`, `Admin`
  - system settings / user management: chi `Admin`

### Phase 3 - Import du lieu

Muc tieu:

- upload file
- mapping cot
- preview loi
- bulk upsert variant va attribute values

Deliverables:

- import pipeline
- preview report
- job commit import

### Phase 4 - Search engine

Muc tieu:

- index variant
- tim theo sku/mpn/name/spec

Deliverables:

- search service
- search indexer
- sync khi create/update/import

### Phase 5 - Feed engine

Muc tieu:

- feed runtime cho variant
- diversity theo category/brand/product
- cursor pagination
- Redis cache

Deliverables:

- `GET /feed`
- cursor encoder/decoder
- diversity service

### Phase 6 - Tracking va ranking

Muc tieu:

- luu event
- aggregate metrics
- recompute score dinh ky

Deliverables:

- tracking API
- aggregate jobs
- ranking cron

### Phase 7 - Inventory nang cao

Muc tieu:

- tach ton kho khoi variant snapshot
- ho tro update ton kho co lich su

Deliverables:

- inventory module
- transaction ledger
- sync stock snapshot

### Phase 8 - Recommendation

Muc tieu:

- related variants
- same product family
- same category
- also viewed / also bought

Deliverables:

- recommendation module
- recommendation endpoint

---

## 14. Rui ro va quyet dinh can theo doi

Can theo doi sat cac diem sau:

- co nen dung product-level attribute thuần hay hybrid voi category template
- co can attribute option table som cho enum hay chua
- public listing dung cursor hay page-number trong phase dau
- inventory snapshot co du xai tam hay phai tach som
- search Postgres co du den phase 4 hay can Meilisearch som hon
- import xu ly sync hay bat buoc queue ngay tu dau

---

## 15. Quyet dinh tam thoi de trien khai

Tam thoi chot cac quyet dinh sau:

- listing/search/feed su dung `ProductVariant`
- `Product` chi dung de nhom variant
- attribute thuc te duoc gan theo `Product`
- category giu vai tro template/chuan hoa attribute
- source of truth cua spec nam o `VariantAttributeValue`
- `specSnapshot` chi la read model
- phase dau uu tien catalog core truoc feed
- nhom route noi bo dung namespace `/backoffice/*`
- khi them auth, `Staff` va `Admin` deu duoc thao tac catalog
- nhom route `/admin/*` chi dung cho API rieng cua `Admin`

---

## 16. Buoc tiep theo ngay sau tai lieu nay

Cong viec nen lam tiep:

1. cap nhat `ARCHITECTURE.md` theo mo hinh moi
2. cap nhat `FEED_ENGINE_ARCHITECTURE.md` de chuyen tu `product` sang `variant`
3. thiet ke Prisma schema chi tiet cho phase 1
4. dinh nghia DTO va response contract cho backoffice/public API
5. fix test va cau truc module hien tai truoc khi mo rong codebase

---

## 17. Ke hoach bat dau phat trien

De bat dau code co thu tu va tranh vo schema nhieu lan, nen di theo checklist sau.

### Buoc 1 - Don dep project nen

Can lam ngay:

- sua Jest config hoac alias import de test chay duoc
- chuan hoa import path, uu tien relative path hoac tsconfig path map ro rang
- tao cau truc `src/modules/catalog/*`
- quyet dinh naming convention:
  - code: camelCase
  - database field: snake_case
  - DTO response: camelCase

### Buoc 2 - Chot Prisma schema phase 1

Can thiet ke:

- `Category`
- `Brand`
- `Product`
- `ProductVariant`
- `CategoryAttributeTemplate`
- `ProductAttributeDefinition`
- `VariantAttributeValue`

Can chot ngay tu dau:

- relation
- unique constraint
- index
- enum cho `dataType`
- decimal cho `price`

### Buoc 3 - Tao migration dau tien dung

Muc tieu:

- bo schema `Product` don hien tai
- tao migration catalog core hoan chinh hon
- regenerate Prisma client

Luu y:

- vi project dang o giai doan dau, co the chap nhan reset migration neu chua co production data

### Buoc 4 - Dung module catalog

Thu tu hop ly:

1. `category`
2. `brand`
3. `product`
4. `variant`
5. `attribute`

Moi module nen co:

- controller
- service
- dto
- spec co ban

### Buoc 5 - Public catalog read API

Can ra som:

- `GET /catalog/categories/tree`
- `GET /catalog/variants`
- `GET /catalog/variants/:slug`
- `GET /catalog/products/:slug`

Muc tieu:

- cho frontend co data that de test som
- khoa som response shape truoc khi di tiep search/feed

### Buoc 6 - Chuan bi du lieu mau

Nen tao seed data nho gom:

- 2-3 category cap 1
- 5-10 category con
- 2-3 brand
- vai product family
- moi product co 3-10 variant

Muc dich:

- test tree category
- test listing theo variant
- test attribute theo product

### Buoc 7 - Chot backlog gan han

Backlog de bat dau sprint dau:

1. fix test + clean scaffold
2. redesign Prisma schema
3. create migration
4. build category module
5. build brand module
6. build product module
7. build variant module
8. build attribute module
9. build public catalog read endpoints

---

## 18. Definition of Done cho phase dau

Phase dau duoc xem la xong khi dat du cac dieu kien sau:

- tao duoc category tree nhieu cap
- tao duoc product gan vao category phu hop
- tao duoc variant thuoc product
- variant co the luu va doc thong so dong
- public API tra ra listing theo variant
- co the xem product detail + danh sach variant cung dong
- test co ban chay duoc
- Swagger hien day du endpoint core
