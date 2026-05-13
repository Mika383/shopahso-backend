-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
