import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  findAllBackoffice() {
    return this.prisma.product.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        category: true,
        brand: true,
        _count: {
          select: {
            variants: true,
            attributes: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: {
          orderBy: [{ score: 'desc' }, { name: 'asc' }],
        },
        attributes: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async create(data: CreateProductDto) {
    await this.ensureCategoryExists(data.categoryId);

    if (data.brandId) {
      await this.ensureBrandExists(data.brandId);
    }

    return this.prisma.product.create({
      data: {
        categoryId: data.categoryId,
        brandId: data.brandId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        datasheetUrl: data.datasheetUrl,
        active: data.active ?? true,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: {
        slug,
        active: true,
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { active: true },
          orderBy: [{ score: 'desc' }, { name: 'asc' }],
        },
        attributes: {
          where: { active: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        brandId: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Product not found');
    }

    if (data.categoryId) {
      await this.ensureCategoryExists(data.categoryId);
    }

    if (data.brandId) {
      await this.ensureBrandExists(data.brandId);
    }

    const nextCategoryId = data.categoryId ?? current.categoryId;
    const nextBrandId = data.brandId !== undefined ? data.brandId : current.brandId;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
          ...(data.brandId !== undefined ? { brandId: data.brandId } : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.datasheetUrl !== undefined ? { datasheetUrl: data.datasheetUrl } : {}),
          ...(data.active !== undefined ? { active: data.active } : {}),
        },
        include: {
          category: true,
          brand: true,
        },
      });

      if (
        nextCategoryId !== current.categoryId ||
        nextBrandId !== current.brandId
      ) {
        await tx.productVariant.updateMany({
          where: { productId: id },
          data: {
            categoryId: nextCategoryId,
            brandId: nextBrandId,
          },
        });
      }

      return product;
    });
  }

  async remove(id: string) {
    await this.ensureProductExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { active: false },
      });

      return tx.product.update({
        where: { id },
        data: { active: false },
      });
    });
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async ensureBrandExists(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
