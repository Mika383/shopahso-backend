import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { CloudinaryService } from '../../media/cloudinary.service';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  findFeatured() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: [{ variants: { _count: 'desc' } }, { createdAt: 'desc' }],
      take: 10,
      include: {
        category: true,
        brand: true,
        variants: {
          where: { active: true },
          orderBy: [
            { score: 'desc' },
            { orderCount: 'desc' },
            { viewCount: 'desc' },
            { name: 'asc' },
          ],
          take: 1,
        },
      },
    }).then((products) => {
      const normalized = products.map((product) => ({
        ...product,
        featuredScore: product.variants[0]?.score ?? 0,
        effectiveImageUrls:
          product.imageUrls.length > 0
            ? product.imageUrls
            : (product.variants[0]?.imageUrls ?? []),
      }));

      if (normalized.length > 0) {
        return normalized;
      }

      return this.findNewest();
    });
  }

  findNewest() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 10,
      include: {
        category: true,
        brand: true,
        variants: {
          where: { active: true },
          orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
          take: 1,
        },
      },
    }).then((products) => {
      const normalized = products.map((product) => ({
        ...product,
        effectiveImageUrls:
          product.imageUrls.length > 0
            ? product.imageUrls
            : (product.variants[0]?.imageUrls ?? []),
      }));

      if (normalized.length > 0) {
        return normalized;
      }

      return this.prisma.product.findMany({
        orderBy: [{ createdAt: 'desc' }],
        take: 10,
        include: {
          category: true,
          brand: true,
          variants: {
            orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
            take: 1,
          },
        },
      }).then((fallbackProducts) =>
        fallbackProducts.map((product) => ({
          ...product,
          effectiveImageUrls:
            product.imageUrls.length > 0
              ? product.imageUrls
              : (product.variants[0]?.imageUrls ?? []),
        })),
      );
    });
  }

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
        imageUrls: data.imageUrls ?? [],
        imagePublicIds: [],
        active: data.active ?? true,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
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

    if (!product) {
      return null;
    }

    return {
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        effectiveImageUrls:
          variant.imageUrls.length > 0 ? variant.imageUrls : product.imageUrls,
      })),
    };
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
          ...(data.imageUrls !== undefined ? { imageUrls: data.imageUrls } : {}),
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

  async uploadImage(id: string, file: UploadedImageFile) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        imageUrls: true,
        imagePublicIds: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const uploaded = await this.cloudinaryService.uploadBuffer({
      buffer: file.buffer,
      folder: 'products',
      publicId: `${product.slug}-${Date.now()}`,
    });

    return this.prisma.product.update({
      where: { id },
      data: {
        imageUrls: [...product.imageUrls, uploaded.secureUrl],
        imagePublicIds: [...product.imagePublicIds, uploaded.publicId],
      },
    });
  }

  async removeImage(id: string, publicId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrls: true,
        imagePublicIds: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const index = product.imagePublicIds.findIndex((value) => value === publicId);
    if (index === -1) {
      throw new NotFoundException('Image not found');
    }

    await this.cloudinaryService.destroy(publicId);

    const nextUrls = product.imageUrls.filter((_, idx) => idx !== index);
    const nextPublicIds = product.imagePublicIds.filter((_, idx) => idx !== index);

    return this.prisma.product.update({
      where: { id },
      data: {
        imageUrls: nextUrls,
        imagePublicIds: nextPublicIds,
      },
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
