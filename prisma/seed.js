require('dotenv/config');

const { PrismaClient, AttributeDataType, Prisma } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.variantAttributeValue.deleteMany();
  await prisma.productAttributeDefinition.deleteMany();
  await prisma.categoryAttributeTemplate.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();

  const industrialSupplies = await prisma.category.create({
    data: {
      name: 'Vat tu cong nghiep',
      slug: 'vat-tu-cong-nghiep',
      description: 'Danh muc tong cho vat tu cong nghiep va linh kien ky thuat.',
      sortOrder: 1,
    },
  });

  const mechanicalParts = await prisma.category.create({
    data: {
      name: 'Linh kien co khi',
      slug: 'linh-kien-co-khi',
      description: 'Cum danh muc co khi va chi tiet lap rap.',
      sortOrder: 2,
    },
  });

  const bolts = await prisma.category.create({
    data: {
      parentId: industrialSupplies.id,
      name: 'Bu long',
      slug: 'bu-long',
      description: 'Bu long va cac dong san pham lien quan.',
      sortOrder: 1,
    },
  });

  const anchors = await prisma.category.create({
    data: {
      parentId: bolts.id,
      name: 'Bu long no',
      slug: 'bu-long-no',
      description: 'Bu long no cho he thong treo va lien ket.',
      sortOrder: 1,
    },
  });

  const stainlessBolts = await prisma.category.create({
    data: {
      parentId: bolts.id,
      name: 'Bu long inox',
      slug: 'bu-long-inox',
      description: 'Bu long inox chong gi cho moi truong am uot.',
      sortOrder: 2,
    },
  });

  const sensors = await prisma.category.create({
    data: {
      parentId: industrialSupplies.id,
      name: 'Cam bien',
      slug: 'cam-bien',
      description: 'Cam bien cong nghiep cho tu dong hoa.',
      sortOrder: 2,
    },
  });

  const proximitySensors = await prisma.category.create({
    data: {
      parentId: sensors.id,
      name: 'Cam bien tiem can',
      slug: 'cam-bien-tiem-can',
      description: 'Cam bien tiem can dien tu cho day chuyen san xuat.',
      sortOrder: 1,
    },
  });

  const bearings = await prisma.category.create({
    data: {
      parentId: mechanicalParts.id,
      name: 'Bac dan',
      slug: 'bac-dan',
      description: 'Bac dan va phu kien truyen dong.',
      sortOrder: 1,
    },
  });

  const genericBrand = await prisma.brand.create({
    data: {
      name: 'No-Brand',
      slug: 'no-brand',
    },
  });

  const omronBrand = await prisma.brand.create({
    data: {
      name: 'Omron',
      slug: 'omron',
    },
  });

  const nskBrand = await prisma.brand.create({
    data: {
      name: 'NSK',
      slug: 'nsk',
    },
  });

  const anchorTemplates = await prisma.categoryAttributeTemplate.createManyAndReturn({
    data: [
      {
        categoryId: anchors.id,
        name: 'Duong kinh',
        code: 'diameter',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        isSearchable: true,
        sortOrder: 1,
      },
      {
        categoryId: anchors.id,
        name: 'Chieu dai',
        code: 'length',
        dataType: AttributeDataType.NUMBER,
        unit: 'mm',
        isFilterable: true,
        isSearchable: true,
        sortOrder: 2,
      },
      {
        categoryId: anchors.id,
        name: 'Vat lieu',
        code: 'material',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        sortOrder: 3,
      },
      {
        categoryId: anchors.id,
        name: 'Xu ly be mat',
        code: 'surface',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        sortOrder: 4,
      },
    ],
  });

  const proximityTemplates = await prisma.categoryAttributeTemplate.createManyAndReturn({
    data: [
      {
        categoryId: proximitySensors.id,
        name: 'Khoang cach phat hien',
        code: 'sensing_distance',
        dataType: AttributeDataType.NUMBER,
        unit: 'mm',
        isFilterable: true,
        isSearchable: true,
        sortOrder: 1,
      },
      {
        categoryId: proximitySensors.id,
        name: 'Dien ap',
        code: 'voltage',
        dataType: AttributeDataType.TEXT,
        unit: 'VDC',
        isFilterable: true,
        isSearchable: true,
        sortOrder: 2,
      },
      {
        categoryId: proximitySensors.id,
        name: 'Kieu output',
        code: 'output_type',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        sortOrder: 3,
      },
      {
        categoryId: proximitySensors.id,
        name: 'Kich thuoc than',
        code: 'body_size',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        sortOrder: 4,
      },
    ],
  });

  const bearingTemplates = await prisma.categoryAttributeTemplate.createManyAndReturn({
    data: [
      {
        categoryId: bearings.id,
        name: 'Duong kinh trong',
        code: 'inner_diameter',
        dataType: AttributeDataType.NUMBER,
        unit: 'mm',
        isFilterable: true,
        sortOrder: 1,
      },
      {
        categoryId: bearings.id,
        name: 'Duong kinh ngoai',
        code: 'outer_diameter',
        dataType: AttributeDataType.NUMBER,
        unit: 'mm',
        isFilterable: true,
        sortOrder: 2,
      },
      {
        categoryId: bearings.id,
        name: 'Do day',
        code: 'width',
        dataType: AttributeDataType.NUMBER,
        unit: 'mm',
        isFilterable: true,
        sortOrder: 3,
      },
      {
        categoryId: bearings.id,
        name: 'Kieu che chan',
        code: 'seal_type',
        dataType: AttributeDataType.TEXT,
        isFilterable: true,
        sortOrder: 4,
      },
    ],
  });

  const anchorProduct = await prisma.product.create({
    data: {
      categoryId: anchors.id,
      brandId: genericBrand.id,
      name: 'Bu long no thep ma kem',
      slug: 'bu-long-no-thep-ma-kem',
      description: 'Dong bu long no 3 canh bang thep ma kem cho ung dung treo va co dinh.',
      status: 'PUBLISHED',
    },
  });

  const proximityProduct = await prisma.product.create({
    data: {
      categoryId: proximitySensors.id,
      brandId: omronBrand.id,
      name: 'Cam bien tiem can Omron E2E',
      slug: 'cam-bien-tiem-can-omron-e2e',
      description: 'Dong cam bien tiem can Omron E2E dung trong day chuyen tu dong hoa.',
      status: 'PUBLISHED',
    },
  });

  const bearingProduct = await prisma.product.create({
    data: {
      categoryId: bearings.id,
      brandId: nskBrand.id,
      name: 'Bac dan NSK 6000 series',
      slug: 'bac-dan-nsk-6000-series',
      description: 'Dong bac dan NSK cho truyen dong va quay toc do cao.',
      status: 'PUBLISHED',
    },
  });

  const anchorAttributes = await prisma.productAttributeDefinition.createManyAndReturn({
    data: anchorTemplates.map((template) => ({
      productId: anchorProduct.id,
      categoryTemplateId: template.id,
      name: template.name,
      code: template.code,
      dataType: template.dataType,
      unit: template.unit,
      isFilterable: template.isFilterable,
      isSearchable: template.isSearchable,
      isRequired: true,
      sortOrder: template.sortOrder,
    })),
  });

  const proximityAttributes = await prisma.productAttributeDefinition.createManyAndReturn({
    data: proximityTemplates.map((template) => ({
      productId: proximityProduct.id,
      categoryTemplateId: template.id,
      name: template.name,
      code: template.code,
      dataType: template.dataType,
      unit: template.unit,
      isFilterable: template.isFilterable,
      isSearchable: template.isSearchable,
      isRequired: true,
      sortOrder: template.sortOrder,
    })),
  });

  const bearingAttributes = await prisma.productAttributeDefinition.createManyAndReturn({
    data: bearingTemplates.map((template) => ({
      productId: bearingProduct.id,
      categoryTemplateId: template.id,
      name: template.name,
      code: template.code,
      dataType: template.dataType,
      unit: template.unit,
      isFilterable: template.isFilterable,
      isSearchable: template.isSearchable,
      isRequired: true,
      sortOrder: template.sortOrder,
    })),
  });

  const anchorVariants = await Promise.all([
    prisma.productVariant.create({
      data: {
        productId: anchorProduct.id,
        categoryId: anchors.id,
        brandId: genericBrand.id,
        sku: 'BLN-M8X80',
        manufacturerPartNumber: 'BLN-M8X80',
        name: 'Bu long no thep ma kem M8x80',
        slug: 'bu-long-no-thep-ma-kem-m8x80',
        price: new Prisma.Decimal('6800.00'),
        costPrice: new Prisma.Decimal('6800.00'),
        stockQuantity: 120,
        unit: 'cai',
        score: new Prisma.Decimal('12.8500'),
        viewCount: 140,
        orderCount: 18,
        specSnapshot: {
          diameter: 'M8',
          length: 80,
          material: 'Thep ma kem',
          surface: 'Ma kem',
        },
      },
    }),
    prisma.productVariant.create({
      data: {
        productId: anchorProduct.id,
        categoryId: anchors.id,
        brandId: genericBrand.id,
        sku: 'BLN-M10X100',
        manufacturerPartNumber: 'BLN-M10X100',
        name: 'Bu long no thep ma kem M10x100',
        slug: 'bu-long-no-thep-ma-kem-m10x100',
        price: new Prisma.Decimal('9200.00'),
        costPrice: new Prisma.Decimal('9200.00'),
        stockQuantity: 90,
        unit: 'cai',
        score: new Prisma.Decimal('14.4200'),
        viewCount: 180,
        orderCount: 23,
        specSnapshot: {
          diameter: 'M10',
          length: 100,
          material: 'Thep ma kem',
          surface: 'Ma kem',
        },
      },
    }),
    prisma.productVariant.create({
      data: {
        productId: anchorProduct.id,
        categoryId: anchors.id,
        brandId: genericBrand.id,
        sku: 'BLN-M12X120',
        manufacturerPartNumber: 'BLN-M12X120',
        name: 'Bu long no thep ma kem M12x120',
        slug: 'bu-long-no-thep-ma-kem-m12x120',
        price: new Prisma.Decimal('12800.00'),
        costPrice: new Prisma.Decimal('12800.00'),
        stockQuantity: 64,
        unit: 'cai',
        score: new Prisma.Decimal('16.1100'),
        viewCount: 210,
        orderCount: 31,
        specSnapshot: {
          diameter: 'M12',
          length: 120,
          material: 'Thep ma kem',
          surface: 'Ma kem',
        },
      },
    }),
  ]);

  const proximityVariants = await Promise.all([
    prisma.productVariant.create({
      data: {
        productId: proximityProduct.id,
        categoryId: proximitySensors.id,
        brandId: omronBrand.id,
        sku: 'E2E-X5ME1',
        manufacturerPartNumber: 'E2E-X5ME1',
        name: 'Cam bien tiem can Omron E2E-X5ME1',
        slug: 'cam-bien-tiem-can-omron-e2e-x5me1',
        price: new Prisma.Decimal('425000.00'),
        costPrice: new Prisma.Decimal('425000.00'),
        stockQuantity: 16,
        unit: 'cai',
        score: new Prisma.Decimal('20.3700'),
        viewCount: 95,
        orderCount: 14,
        specSnapshot: {
          sensing_distance: 5,
          voltage: '12-24',
          output_type: 'NPN NO',
          body_size: 'M18',
        },
      },
    }),
    prisma.productVariant.create({
      data: {
        productId: proximityProduct.id,
        categoryId: proximitySensors.id,
        brandId: omronBrand.id,
        sku: 'E2E-X10ME1',
        manufacturerPartNumber: 'E2E-X10ME1',
        name: 'Cam bien tiem can Omron E2E-X10ME1',
        slug: 'cam-bien-tiem-can-omron-e2e-x10me1',
        price: new Prisma.Decimal('468000.00'),
        costPrice: new Prisma.Decimal('468000.00'),
        stockQuantity: 12,
        unit: 'cai',
        score: new Prisma.Decimal('22.1500'),
        viewCount: 115,
        orderCount: 18,
        specSnapshot: {
          sensing_distance: 10,
          voltage: '12-24',
          output_type: 'NPN NO',
          body_size: 'M18',
        },
      },
    }),
  ]);

  const bearingVariants = await Promise.all([
    prisma.productVariant.create({
      data: {
        productId: bearingProduct.id,
        categoryId: bearings.id,
        brandId: nskBrand.id,
        sku: 'NSK-6000ZZ',
        manufacturerPartNumber: '6000ZZ',
        name: 'Bac dan NSK 6000ZZ',
        slug: 'bac-dan-nsk-6000zz',
        price: new Prisma.Decimal('38000.00'),
        costPrice: new Prisma.Decimal('38000.00'),
        stockQuantity: 45,
        unit: 'cai',
        score: new Prisma.Decimal('11.9600'),
        viewCount: 84,
        orderCount: 9,
        specSnapshot: {
          inner_diameter: 10,
          outer_diameter: 26,
          width: 8,
          seal_type: 'ZZ',
        },
      },
    }),
    prisma.productVariant.create({
      data: {
        productId: bearingProduct.id,
        categoryId: bearings.id,
        brandId: nskBrand.id,
        sku: 'NSK-6001DDU',
        manufacturerPartNumber: '6001DDU',
        name: 'Bac dan NSK 6001DDU',
        slug: 'bac-dan-nsk-6001ddu',
        price: new Prisma.Decimal('46000.00'),
        costPrice: new Prisma.Decimal('46000.00'),
        stockQuantity: 38,
        unit: 'cai',
        score: new Prisma.Decimal('12.4400'),
        viewCount: 76,
        orderCount: 11,
        specSnapshot: {
          inner_diameter: 12,
          outer_diameter: 28,
          width: 8,
          seal_type: 'DDU',
        },
      },
    }),
  ]);

  const attributeMap = {
    anchor: Object.fromEntries(anchorAttributes.map((item) => [item.code, item.id])),
    proximity: Object.fromEntries(proximityAttributes.map((item) => [item.code, item.id])),
    bearing: Object.fromEntries(bearingAttributes.map((item) => [item.code, item.id])),
  };

  const variantValues = [
    {
      variantId: anchorVariants[0].id,
      values: [
        { code: 'diameter', valueText: 'M8' },
        { code: 'length', valueNumber: new Prisma.Decimal('80') },
        { code: 'material', valueText: 'Thep ma kem' },
        { code: 'surface', valueText: 'Ma kem' },
      ],
      source: 'anchor',
    },
    {
      variantId: anchorVariants[1].id,
      values: [
        { code: 'diameter', valueText: 'M10' },
        { code: 'length', valueNumber: new Prisma.Decimal('100') },
        { code: 'material', valueText: 'Thep ma kem' },
        { code: 'surface', valueText: 'Ma kem' },
      ],
      source: 'anchor',
    },
    {
      variantId: anchorVariants[2].id,
      values: [
        { code: 'diameter', valueText: 'M12' },
        { code: 'length', valueNumber: new Prisma.Decimal('120') },
        { code: 'material', valueText: 'Thep ma kem' },
        { code: 'surface', valueText: 'Ma kem' },
      ],
      source: 'anchor',
    },
    {
      variantId: proximityVariants[0].id,
      values: [
        { code: 'sensing_distance', valueNumber: new Prisma.Decimal('5') },
        { code: 'voltage', valueText: '12-24' },
        { code: 'output_type', valueText: 'NPN NO' },
        { code: 'body_size', valueText: 'M18' },
      ],
      source: 'proximity',
    },
    {
      variantId: proximityVariants[1].id,
      values: [
        { code: 'sensing_distance', valueNumber: new Prisma.Decimal('10') },
        { code: 'voltage', valueText: '12-24' },
        { code: 'output_type', valueText: 'NPN NO' },
        { code: 'body_size', valueText: 'M18' },
      ],
      source: 'proximity',
    },
    {
      variantId: bearingVariants[0].id,
      values: [
        { code: 'inner_diameter', valueNumber: new Prisma.Decimal('10') },
        { code: 'outer_diameter', valueNumber: new Prisma.Decimal('26') },
        { code: 'width', valueNumber: new Prisma.Decimal('8') },
        { code: 'seal_type', valueText: 'ZZ' },
      ],
      source: 'bearing',
    },
    {
      variantId: bearingVariants[1].id,
      values: [
        { code: 'inner_diameter', valueNumber: new Prisma.Decimal('12') },
        { code: 'outer_diameter', valueNumber: new Prisma.Decimal('28') },
        { code: 'width', valueNumber: new Prisma.Decimal('8') },
        { code: 'seal_type', valueText: 'DDU' },
      ],
      source: 'bearing',
    },
  ];

  for (const item of variantValues) {
    const definitions = attributeMap[item.source];

    await prisma.variantAttributeValue.createMany({
      data: item.values.map((value) => ({
        variantId: item.variantId,
        productAttributeDefinitionId: definitions[value.code],
        valueText: value.valueText ?? null,
        valueNumber: value.valueNumber ?? null,
        valueBoolean: value.valueBoolean ?? null,
        valueEnum: value.valueEnum ?? null,
      })),
    });
  }

  console.log('Seeded catalog core sample data');
  console.log(`Categories: 7`);
  console.log(`Brands: 3`);
  console.log(`Products: 3`);
  console.log(`Variants: 7`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
