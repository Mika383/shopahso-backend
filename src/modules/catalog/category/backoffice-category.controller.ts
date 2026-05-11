import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice/categories')
export class BackofficeCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get()
  findAll() {
    return this.categoryService.findAllBackoffice();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
