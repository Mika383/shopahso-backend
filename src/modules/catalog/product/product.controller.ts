import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('catalog/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('featured')
  findFeatured() {
    return this.productService.findFeatured();
  }

  @Get('newest')
  findNewest() {
    return this.productService.findNewest();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productService.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
