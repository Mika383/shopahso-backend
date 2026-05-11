import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttributeDataType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryAttributeTemplateDto } from './create-category-attribute-template.dto';
import { UpdateCategoryAttributeTemplateDto } from './update-category-attribute-template.dto';
import { CreateProductAttributeDto } from './create-product-attribute.dto';
import { UpdateProductAttributeDto } from './update-product-attribute.dto';
import { VariantAttributeValueInputDto } from './upsert-variant-attribute-value.dto';

type AttributeDbClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class AttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategoryTemplate(
    categoryId: string,
    data: CreateCategoryAttributeTemplateDto,
  ) {
    await this.ensureCategoryExists(categoryId);

    return this.prisma.categoryAttributeTemplate.create({
      data: {
        categoryId,
        name: data.name,
        code: data.code,
        dataType: data.dataType,
        unit: data.unit,
        isFilterable: data.isFilterable ?? false,
        isSearchable: data.isSearchable ?? false,
        isRequired: data.isRequired ?? false,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
      },
    });
  }

  findCategoryTemplates(categoryId: string) {
    return this.prisma.categoryAttributeTemplate.findMany({
      where: { categoryId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async updateCategoryTemplate(
    id: string,
    data: UpdateCategoryAttributeTemplateDto,
  ) {
    const current = await this.prisma.categoryAttributeTemplate.findUnique({
      where: { id },
      select: { id: true, categoryId: true },
    });

    if (!current) {
      throw new NotFoundException('Category attribute template not found');
    }

    return this.prisma.categoryAttributeTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.dataType !== undefined ? { dataType: data.dataType } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.isFilterable !== undefined
          ? { isFilterable: data.isFilterable }
          : {}),
        ...(data.isSearchable !== undefined
          ? { isSearchable: data.isSearchable }
          : {}),
        ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
  }

  async removeCategoryTemplate(id: string) {
    await this.ensureCategoryTemplateExists(id);

    return this.prisma.categoryAttributeTemplate.update({
      where: { id },
      data: { active: false },
    });
  }

  async createProductAttribute(
    productId: string,
    data: CreateProductAttributeDto,
  ) {
    const product = await this.ensureProductExists(productId);
    let resolved = data;

    if (data.categoryTemplateId) {
      const template = await this.ensureCategoryTemplateExists(
        data.categoryTemplateId,
      );

      if (template.categoryId !== product.categoryId) {
        throw new BadRequestException(
          'Category template does not belong to product category',
        );
      }

      resolved = {
        ...data,
        name: data.name ?? template.name,
        code: data.code ?? template.code,
        dataType: data.dataType ?? template.dataType,
        unit: data.unit ?? template.unit ?? undefined,
        isFilterable: data.isFilterable ?? template.isFilterable,
        isSearchable: data.isSearchable ?? template.isSearchable,
        isRequired: data.isRequired ?? template.isRequired,
        sortOrder: data.sortOrder ?? template.sortOrder,
        active: data.active ?? template.active,
      };
    }

    return this.prisma.productAttributeDefinition.create({
      data: {
        productId,
        categoryTemplateId: data.categoryTemplateId,
        name: resolved.name,
        code: resolved.code,
        dataType: resolved.dataType,
        unit: resolved.unit,
        isFilterable: resolved.isFilterable ?? false,
        isSearchable: resolved.isSearchable ?? false,
        isRequired: resolved.isRequired ?? false,
        sortOrder: resolved.sortOrder ?? 0,
        active: resolved.active ?? true,
      },
      include: {
        categoryTemplate: true,
      },
    });
  }

  findProductAttributes(productId: string) {
    return this.prisma.productAttributeDefinition.findMany({
      where: {
        productId,
      },
      include: {
        categoryTemplate: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async updateProductAttribute(id: string, data: UpdateProductAttributeDto) {
    const current = await this.prisma.productAttributeDefinition.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!current) {
      throw new NotFoundException('Product attribute not found');
    }

    if (data.categoryTemplateId) {
      const template = await this.ensureCategoryTemplateExists(
        data.categoryTemplateId,
      );

      if (template.categoryId !== current.product.categoryId) {
        throw new BadRequestException(
          'Category template does not belong to product category',
        );
      }
    }

    return this.prisma.productAttributeDefinition.update({
      where: { id },
      data: {
        ...(data.categoryTemplateId !== undefined
          ? { categoryTemplateId: data.categoryTemplateId }
          : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.dataType !== undefined ? { dataType: data.dataType } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.isFilterable !== undefined
          ? { isFilterable: data.isFilterable }
          : {}),
        ...(data.isSearchable !== undefined
          ? { isSearchable: data.isSearchable }
          : {}),
        ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
      include: {
        categoryTemplate: true,
      },
    });
  }

  async removeProductAttribute(id: string) {
    const attribute = await this.ensureProductAttributeExists(id);

    await this.prisma.productAttributeDefinition.update({
      where: { id },
      data: { active: false },
    });

    const variants = await this.prisma.productVariant.findMany({
      where: { productId: attribute.productId },
      select: { id: true },
    });

    for (const variant of variants) {
      await this.syncVariantSpecSnapshot(variant.id);
    }

    return { success: true };
  }

  async findVariantAttributeValues(variantId: string) {
    await this.ensureVariantExists(variantId);

    return this.prisma.variantAttributeValue.findMany({
      where: { variantId },
      include: {
        productAttributeDefinition: true,
      },
      orderBy: {
        productAttributeDefinition: {
          sortOrder: 'asc',
        },
      },
    });
  }

  async upsertVariantAttributeValues(
    variantId: string,
    values: VariantAttributeValueInputDto[],
  ) {
    const variant = await this.ensureVariantExists(variantId);

    return this.prisma.$transaction(async (tx) => {
      for (const item of values) {
        const definition = await this.resolveProductAttributeDefinition(
          tx,
          variant.productId,
          item,
        );

        const normalized = this.normalizeValueByType(definition.dataType, item);

        await tx.variantAttributeValue.upsert({
          where: {
            variantId_productAttributeDefinitionId: {
              variantId,
              productAttributeDefinitionId: definition.id,
            },
          },
          create: {
            variantId,
            productAttributeDefinitionId: definition.id,
            ...normalized,
          },
          update: normalized,
        });
      }

      await this.syncVariantSpecSnapshot(variantId, tx);

      return tx.productVariant.findUnique({
        where: { id: variantId },
        include: {
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
    });
  }

  private normalizeValueByType(
    dataType: AttributeDataType,
    value: VariantAttributeValueInputDto,
  ) {
    const normalized = {
      valueText: null as string | null,
      valueNumber: null as Prisma.Decimal | null,
      valueBoolean: null as boolean | null,
      valueEnum: null as string | null,
    };

    switch (dataType) {
      case AttributeDataType.TEXT:
        if (value.valueText === undefined) {
          throw new BadRequestException('valueText is required for TEXT attribute');
        }
        normalized.valueText = value.valueText;
        break;
      case AttributeDataType.NUMBER:
        if (value.valueNumber === undefined) {
          throw new BadRequestException(
            'valueNumber is required for NUMBER attribute',
          );
        }
        normalized.valueNumber = new Prisma.Decimal(value.valueNumber);
        break;
      case AttributeDataType.BOOLEAN:
        if (value.valueBoolean === undefined) {
          throw new BadRequestException(
            'valueBoolean is required for BOOLEAN attribute',
          );
        }
        normalized.valueBoolean = value.valueBoolean;
        break;
      case AttributeDataType.ENUM:
        if (value.valueEnum === undefined) {
          throw new BadRequestException('valueEnum is required for ENUM attribute');
        }
        normalized.valueEnum = value.valueEnum;
        break;
      default:
        throw new BadRequestException('Unsupported attribute data type');
    }

    return normalized;
  }

  private async syncVariantSpecSnapshot(
    variantId: string,
    tx: AttributeDbClient = this.prisma,
  ) {
    const values = await tx.variantAttributeValue.findMany({
      where: { variantId },
      include: {
        productAttributeDefinition: true,
      },
    });

    const snapshot: Record<string, string | number | boolean> = {};

    for (const item of values) {
      if (!item.productAttributeDefinition.active) {
        continue;
      }

      const key = item.productAttributeDefinition.code;

      if (item.valueText !== null) {
        snapshot[key] = item.valueText;
      } else if (item.valueNumber !== null) {
        snapshot[key] = Number(item.valueNumber);
      } else if (item.valueBoolean !== null) {
        snapshot[key] = item.valueBoolean;
      } else if (item.valueEnum !== null) {
        snapshot[key] = item.valueEnum;
      }
    }

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        specSnapshot:
          Object.keys(snapshot).length > 0
            ? (snapshot as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
  }

  private async resolveProductAttributeDefinition(
    tx: Prisma.TransactionClient,
    productId: string,
    value: VariantAttributeValueInputDto,
  ) {
    if (!value.productAttributeDefinitionId && !value.code) {
      throw new BadRequestException(
        'Either productAttributeDefinitionId or code is required',
      );
    }

    const definition = value.productAttributeDefinitionId
      ? await tx.productAttributeDefinition.findUnique({
          where: { id: value.productAttributeDefinitionId },
        })
      : await tx.productAttributeDefinition.findFirst({
          where: {
            productId,
            code: value.code,
          },
        });

    if (!definition) {
      throw new NotFoundException('Product attribute definition not found');
    }

    if (definition.productId !== productId) {
      throw new BadRequestException(
        'Attribute definition does not belong to variant product',
      );
    }

    return definition;
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async ensureVariantExists(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  private async ensureCategoryTemplateExists(id: string) {
    const template = await this.prisma.categoryAttributeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Category attribute template not found');
    }

    return template;
  }

  private async ensureProductAttributeExists(id: string) {
    const attribute = await this.prisma.productAttributeDefinition.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });

    if (!attribute) {
      throw new NotFoundException('Product attribute not found');
    }

    return attribute;
  }
}
