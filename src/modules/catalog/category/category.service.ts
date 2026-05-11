import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

export type CategoryTreeNode = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  children: CategoryTreeNode[];
};

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAllBackoffice() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            active: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async create(data: CreateCategoryDto) {
    if (data.parentId) {
      await this.ensureCategoryExists(data.parentId, 'Parent category not found');
    }

    return this.prisma.category.create({
      data: {
        parentId: data.parentId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        active: data.active ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.ensureCategoryExists(id, 'Category not found');

    if (data.parentId) {
      if (data.parentId === id) {
        throw new NotFoundException('Category cannot be its own parent');
      }

      await this.ensureCategoryExists(data.parentId, 'Parent category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureCategoryExists(id, 'Category not found');

    return this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
      },
    });

    const nodes = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const category of categories) {
      nodes.set(category.id, {
        ...category,
        parentId: category.parentId ?? null,
        description: category.description ?? null,
        children: [],
      });
    }

    for (const node of nodes.values()) {
      if (!node.parentId) {
        roots.push(node);
        continue;
      }

      const parent = nodes.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getDescendantIds(categoryId: string): Promise<string[]> {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        parentId: true,
      },
    });

    const childrenMap = new Map<string, string[]>();
    for (const category of categories) {
      if (!category.parentId) {
        continue;
      }

      const siblings = childrenMap.get(category.parentId) ?? [];
      siblings.push(category.id);
      childrenMap.set(category.parentId, siblings);
    }

    const visited = new Set<string>();
    const stack = [categoryId];

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (!currentId || visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      for (const childId of childrenMap.get(currentId) ?? []) {
        stack.push(childId);
      }
    }

    return [...visited];
  }

  private async ensureCategoryExists(id: string, message: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(message);
    }
  }
}
