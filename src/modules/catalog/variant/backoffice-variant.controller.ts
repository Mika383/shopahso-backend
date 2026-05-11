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
import { VariantService } from './variant.service';
import { CreateVariantDto } from './create-variant.dto';
import { UpdateVariantDto } from './update-variant.dto';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice/variants')
export class BackofficeVariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  create(@Body() body: CreateVariantDto) {
    return this.variantService.create(body);
  }

  @Get()
  findAll() {
    return this.variantService.findAllBackoffice();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const variant = await this.variantService.findOne(id);

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVariantDto) {
    return this.variantService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantService.remove(id);
  }
}
