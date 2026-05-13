DO $$ BEGIN
  CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "product_variants"
  ADD COLUMN IF NOT EXISTS "cost_price" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "sale_price" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "discount_percent" DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS "tax_percent" DECIMAL(5,2);

UPDATE "product_variants"
SET "cost_price" = "price"
WHERE "cost_price" IS NULL;

ALTER TABLE "product_variants"
  ALTER COLUMN "cost_price" SET NOT NULL;
