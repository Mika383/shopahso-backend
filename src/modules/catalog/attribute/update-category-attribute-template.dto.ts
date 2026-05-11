import { PartialType } from '@nestjs/swagger';
import { CreateCategoryAttributeTemplateDto } from './create-category-attribute-template.dto';

export class UpdateCategoryAttributeTemplateDto extends PartialType(
  CreateCategoryAttributeTemplateDto,
) {}
