import { Controller, Get } from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('catalog/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  findAll() {
    return this.brandService.findAll();
  }
}
