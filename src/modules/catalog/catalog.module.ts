import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { VariantModule } from './variant/variant.module';
import { AttributeModule } from './attribute/attribute.module';

@Module({
  imports: [
    CategoryModule,
    BrandModule,
    ProductModule,
    VariantModule,
    AttributeModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CatalogModule {}
