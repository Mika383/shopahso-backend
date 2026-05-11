import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('catalog/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('tree')
  getTree() {
    return this.categoryService.getTree();
  }
}
