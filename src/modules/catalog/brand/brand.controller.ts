import { Controller, Get } from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('catalog/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('featured')
  findFeatured() {
    return this.brandService.findFeatured();
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }
}
