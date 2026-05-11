import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VariantController } from './variant.controller';
import { BackofficeVariantController } from './backoffice-variant.controller';
import { VariantService } from './variant.service';
import { CategoryModule } from '../category/category.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [CategoryModule, AuthModule],
  controllers: [VariantController, BackofficeVariantController],
  providers: [VariantService, PrismaService],
  exports: [VariantService],
})
export class VariantModule {}
