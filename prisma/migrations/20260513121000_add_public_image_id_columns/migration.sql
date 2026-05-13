-- AlterTable
ALTER TABLE "brands"
ADD COLUMN IF NOT EXISTS "logo_public_id" TEXT;

-- AlterTable
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "image_public_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "product_variants"
ADD COLUMN IF NOT EXISTS "image_public_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
