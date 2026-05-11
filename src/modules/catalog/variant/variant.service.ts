import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVariantDto } from './create-variant.dto';
import { UpdateVariantDto } from './update-variant.dto';
import { CategoryService } from '../category/category.service';
import { ListVariantsQuery, ParsedAttributeFilter } from './list-variants.query';

@Injectable()
export class VariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
  ) {}

  findAllBackoffice() {
    return this.prisma.productVariant.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        category: true,
        brand: true,
        product: true,
        _count: {
          select: {
            attributeValues: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        product: true,
        attributeValues: {
          include: {
            productAttributeDefinition: true,
          },
          orderBy: {
            productAttributeDefinition: {
              sortOrder: 'asc',
            },
          },
        },
      },
    });
  }

  async create(data: CreateVariantDto) {
    const product = await this.ensureProductExists(data.productId);

    const createData: Prisma.ProductVariantUncheckedCreateInput = {
      productId: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId,
      sku: data.sku,
      manufacturerPartNumber: data.manufacturerPartNumber,
      name: data.name,
      slug: data.slug,
      price: new Prisma.Decimal(data.price),
      stockQuantity: data.stockQuantity ?? 0,
      unit: data.unit,
      minOrderQuantity: data.minOrderQuantity ?? 1,
      score: new Prisma.Decimal(data.score ?? 0),
      viewCount: data.viewCount ?? 0,
      orderCount: data.orderCount ?? 0,
      active: data.active ?? true,
    };

    if (data.specSnapshot !== undefined) {
      createData.specSnapshot = data.specSnapshot as Prisma.InputJsonValue;
    }

    return this.prisma.productVariant.create({
      data: createData,
      include: {
        category: true,
        brand: true,
        product: true,
      },
    });
  }

  async findAll(query: ListVariantsQuery) {
    const where = await this.buildPublicWhere(query);
    const take = this.resolveTake(query.limit);

    return this.prisma.productVariant.findMany({
      where,
      include: {
        category: true,
        brand: true,
        product: true,
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        slug,
        active: true,
      },
      include: {
        category: true,
        brand: true,
        product: true,
        attributeValues: {
          include: {
            productAttributeDefinition: true,
          },
          orderBy: {
            productAttributeDefinition: {
              sortOrder: 'asc',
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateVariantDto) {
    await this.ensureVariantExists(id);

    let productMeta;
    if (data.productId) {
      productMeta = await this.ensureProductExists(data.productId);
    }

    const updateData: Prisma.ProductVariantUncheckedUpdateInput = {
      ...(data.productId !== undefined ? { productId: data.productId } : {}),
      ...(productMeta
        ? { categoryId: productMeta.categoryId, brandId: productMeta.brandId }
        : {}),
      ...(data.sku !== undefined ? { sku: data.sku } : {}),
      ...(data.manufacturerPartNumber !== undefined
        ? { manufacturerPartNumber: data.manufacturerPartNumber }
        : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.price !== undefined ? { price: new Prisma.Decimal(data.price) } : {}),
      ...(data.stockQuantity !== undefined ? { stockQuantity: data.stockQuantity } : {}),
      ...(data.unit !== undefined ? { unit: data.unit } : {}),
      ...(data.minOrderQuantity !== undefined
        ? { minOrderQuantity: data.minOrderQuantity }
        : {}),
      ...(data.score !== undefined ? { score: new Prisma.Decimal(data.score) } : {}),
      ...(data.viewCount !== undefined ? { viewCount: data.viewCount } : {}),
      ...(data.orderCount !== undefined ? { orderCount: data.orderCount } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    };

    if (data.specSnapshot !== undefined) {
      updateData.specSnapshot = data.specSnapshot as Prisma.InputJsonValue;
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        product: true,
      },
    });
  }

  async remove(id: string) {
    await this.ensureVariantExists(id);

    return this.prisma.productVariant.update({
      where: { id },
      data: { active: false },
    });
  }

  private async ensureVariantExists(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        brandId: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async buildPublicWhere(
    query: ListVariantsQuery,
  ): Promise<Prisma.ProductVariantWhereInput> {
    const andConditions: Prisma.ProductVariantWhereInput[] = [{ active: true }];

    if (query.categoryId) {
      const categoryIds = await this.categoryService.getDescendantIds(
        query.categoryId,
      );
      andConditions.push({
        categoryId: {
          in: categoryIds,
        },
      });
    }

    if (query.brandId) {
      andConditions.push({
        brandId: query.brandId,
      });
    }

    if (query.priceMin || query.priceMax) {
      andConditions.push({
        price: {
          ...(query.priceMin !== undefined
            ? { gte: new Prisma.Decimal(query.priceMin) }
            : {}),
          ...(query.priceMax !== undefined
            ? { lte: new Prisma.Decimal(query.priceMax) }
            : {}),
        },
      });
    }

    for (const filter of query.attrFilters) {
      andConditions.push(this.buildAttributeFilter(filter));
    }

    return andConditions.length === 1 ? andConditions[0] : { AND: andConditions };
  }

  private buildAttributeFilter(
    filter: ParsedAttributeFilter,
  ): Prisma.ProductVariantWhereInput {
    const definitionFilter = {
      productAttributeDefinition: {
        code: filter.code,
        active: true,
      },
    };

    switch (filter.operator) {
      case 'eq': {
        const numericValue = this.tryParseDecimal(filter.value);
        const orConditions: Prisma.VariantAttributeValueWhereInput[] = [
          { valueText: filter.value },
          { valueEnum: filter.value },
        ];

        if (numericValue) {
          orConditions.push({
            valueNumber: numericValue,
          });
        }

        return {
          attributeValues: {
            some: {
              ...definitionFilter,
              OR: orConditions,
            },
          },
        };
      }
      case 'gte':
        return this.buildNumericAttributeFilter(definitionFilter, 'gte', filter.value);
      case 'lte':
        return this.buildNumericAttributeFilter(definitionFilter, 'lte', filter.value);
      case 'gt':
        return this.buildNumericAttributeFilter(definitionFilter, 'gt', filter.value);
      case 'lt':
        return this.buildNumericAttributeFilter(definitionFilter, 'lt', filter.value);
      default:
        return {};
    }
  }

  private buildNumericAttributeFilter(
    definitionFilter: {
      productAttributeDefinition: {
        code: string;
        active: boolean;
      };
    },
    operator: 'gte' | 'lte' | 'gt' | 'lt',
    rawValue: string,
  ): Prisma.ProductVariantWhereInput {
    const value = this.tryParseDecimal(rawValue);

    if (!value) {
      return {
        id: '__invalid_numeric_filter__',
      };
    }

    return {
      attributeValues: {
        some: {
          ...definitionFilter,
          valueNumber: {
            [operator]: value,
          },
        },
      },
    };
  }

  private tryParseDecimal(rawValue: string) {
    const numericValue = Number(rawValue);
    if (Number.isNaN(numericValue)) {
      return null;
    }

    return new Prisma.Decimal(numericValue);
  }

  private resolveTake(limit?: string) {
    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return 24;
    }

    return Math.min(parsed, 100);
  }
}
