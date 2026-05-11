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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './create-brand.dto';
import { UpdateBrandDto } from './update-brand.dto';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice/brands')
export class BackofficeBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(@Body() body: CreateBrandDto) {
    return this.brandService.create(body);
  }

  @Get()
  findAll() {
    return this.brandService.findAllBackoffice();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const brand = await this.brandService.findOne(id);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBrandDto) {
    return this.brandService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
