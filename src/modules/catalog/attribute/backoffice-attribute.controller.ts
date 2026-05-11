import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AttributeService } from './attribute.service';
import { CreateCategoryAttributeTemplateDto } from './create-category-attribute-template.dto';
import { UpdateCategoryAttributeTemplateDto } from './update-category-attribute-template.dto';
import { CreateProductAttributeDto } from './create-product-attribute.dto';
import { UpdateProductAttributeDto } from './update-product-attribute.dto';
import { UpsertVariantAttributeValuesDto } from './upsert-variant-attribute-value.dto';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice')
export class BackofficeAttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post('categories/:categoryId/attribute-templates')
  createCategoryTemplate(
    @Param('categoryId') categoryId: string,
    @Body() body: CreateCategoryAttributeTemplateDto,
  ) {
    return this.attributeService.createCategoryTemplate(categoryId, body);
  }

  @Get('categories/:categoryId/attribute-templates')
  findCategoryTemplates(@Param('categoryId') categoryId: string) {
    return this.attributeService.findCategoryTemplates(categoryId);
  }

  @Patch('category-attribute-templates/:id')
  updateCategoryTemplate(
    @Param('id') id: string,
    @Body() body: UpdateCategoryAttributeTemplateDto,
  ) {
    return this.attributeService.updateCategoryTemplate(id, body);
  }

  @Delete('category-attribute-templates/:id')
  removeCategoryTemplate(@Param('id') id: string) {
    return this.attributeService.removeCategoryTemplate(id);
  }

  @Post('products/:productId/attributes')
  createProductAttribute(
    @Param('productId') productId: string,
    @Body() body: CreateProductAttributeDto,
  ) {
    return this.attributeService.createProductAttribute(productId, body);
  }

  @Get('products/:productId/attributes')
  findProductAttributes(@Param('productId') productId: string) {
    return this.attributeService.findProductAttributes(productId);
  }

  @Patch('product-attributes/:id')
  updateProductAttribute(
    @Param('id') id: string,
    @Body() body: UpdateProductAttributeDto,
  ) {
    return this.attributeService.updateProductAttribute(id, body);
  }

  @Delete('product-attributes/:id')
  removeProductAttribute(@Param('id') id: string) {
    return this.attributeService.removeProductAttribute(id);
  }

  @Get('variants/:variantId/attribute-values')
  findVariantAttributeValues(@Param('variantId') variantId: string) {
    return this.attributeService.findVariantAttributeValues(variantId);
  }

  @Put('variants/:variantId/attribute-values')
  upsertVariantAttributeValues(
    @Param('variantId') variantId: string,
    @Body() body: UpsertVariantAttributeValuesDto,
  ) {
    return this.attributeService.upsertVariantAttributeValues(
      variantId,
      body.values,
    );
  }
}
