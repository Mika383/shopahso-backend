-- CreateEnum
CREATE TYPE "AttributeDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'ENUM');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "datasheet_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "sku" TEXT NOT NULL,
    "manufacturer_part_number" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "min_order_quantity" INTEGER NOT NULL DEFAULT 1,
    "score" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "spec_snapshot" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_attribute_templates" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "data_type" "AttributeDataType" NOT NULL,
    "unit" TEXT,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "is_searchable" BOOLEAN NOT NULL DEFAULT false,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_attribute_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_definitions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "category_template_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "data_type" "AttributeDataType" NOT NULL,
    "unit" TEXT,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "is_searchable" BOOLEAN NOT NULL DEFAULT false,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_attribute_values" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "product_attribute_definition_id" TEXT NOT NULL,
    "value_text" TEXT,
    "value_number" DECIMAL(18,4),
    "value_boolean" BOOLEAN,
    "value_enum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "idx_categories_parent_id" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "idx_categories_active_sort_order" ON "categories"("active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "idx_brands_active" ON "brands"("active");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "idx_products_category_active" ON "products"("category_id", "active");

-- CreateIndex
CREATE INDEX "idx_products_brand_active" ON "products"("brand_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_slug_key" ON "product_variants"("slug");

-- CreateIndex
CREATE INDEX "idx_variants_active_score" ON "product_variants"("active", "score" DESC);

-- CreateIndex
CREATE INDEX "idx_variants_category_score" ON "product_variants"("category_id", "score" DESC);

-- CreateIndex
CREATE INDEX "idx_variants_brand_score" ON "product_variants"("brand_id", "score" DESC);

-- CreateIndex
CREATE INDEX "idx_variants_product_id" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "idx_variants_mpn" ON "product_variants"("manufacturer_part_number");

-- CreateIndex
CREATE INDEX "idx_category_attribute_templates_category_active_sort" ON "category_attribute_templates"("category_id", "active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_category_attribute_templates_category_id_code" ON "category_attribute_templates"("category_id", "code");

-- CreateIndex
CREATE INDEX "idx_product_attribute_definitions_product_active_sort" ON "product_attribute_definitions"("product_id", "active", "sort_order");

-- CreateIndex
CREATE INDEX "idx_product_attribute_definitions_code" ON "product_attribute_definitions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_product_attribute_definitions_product_id_code" ON "product_attribute_definitions"("product_id", "code");

-- CreateIndex
CREATE INDEX "idx_variant_attribute_values_variant_id" ON "variant_attribute_values"("variant_id");

-- CreateIndex
CREATE INDEX "idx_variant_attribute_values_attr_text" ON "variant_attribute_values"("product_attribute_definition_id", "value_text");

-- CreateIndex
CREATE INDEX "idx_variant_attribute_values_attr_number" ON "variant_attribute_values"("product_attribute_definition_id", "value_number");

-- CreateIndex
CREATE UNIQUE INDEX "uq_variant_attribute_values_variant_id_attribute_id" ON "variant_attribute_values"("variant_id", "product_attribute_definition_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute_templates" ADD CONSTRAINT "category_attribute_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_definitions" ADD CONSTRAINT "product_attribute_definitions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_definitions" ADD CONSTRAINT "product_attribute_definitions_category_template_id_fkey" FOREIGN KEY ("category_template_id") REFERENCES "category_attribute_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_product_attribute_definition_id_fkey" FOREIGN KEY ("product_attribute_definition_id") REFERENCES "product_attribute_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
