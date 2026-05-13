-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "products"
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "product_variants"
ADD COLUMN "cost_price" DECIMAL(12,2),
ADD COLUMN "sale_price" DECIMAL(12,2),
ADD COLUMN "discount_percent" DECIMAL(5,2),
ADD COLUMN "tax_percent" DECIMAL(5,2);

-- Backfill
UPDATE "product_variants"
SET "cost_price" = "price"
WHERE "cost_price" IS NULL;

-- Enforce not null after backfill
ALTER TABLE "product_variants"
ALTER COLUMN "cost_price" SET NOT NULL;
