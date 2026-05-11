import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttributeService } from './attribute.service';
import { BackofficeAttributeController } from './backoffice-attribute.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BackofficeAttributeController],
  providers: [AttributeService, PrismaService],
  exports: [AttributeService],
})
export class AttributeModule {}
