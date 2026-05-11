import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { BackofficeCategoryController } from './backoffice-category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategoryController, BackofficeCategoryController],
  providers: [CategoryService, PrismaService],
  exports: [CategoryService],
})
export class CategoryModule {}
