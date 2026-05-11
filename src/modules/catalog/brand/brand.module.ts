import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BrandController } from './brand.controller';
import { BackofficeBrandController } from './backoffice-brand.controller';
import { BrandService } from './brand.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BrandController, BackofficeBrandController],
  providers: [BrandService, PrismaService],
  exports: [BrandService],
})
export class BrandModule {}
