import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBrandDto } from './create-brand.dto';
import { UpdateBrandDto } from './update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  findAllBackoffice() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findAll() {
    return this.prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
    });
  }

  create(data: CreateBrandDto) {
    return this.prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        active: data.active ?? true,
      },
    });
  }

  async update(id: string, data: UpdateBrandDto) {
    await this.ensureBrandExists(id);

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureBrandExists(id);

    return this.prisma.brand.update({
      where: { id },
      data: { active: false },
    });
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
}
