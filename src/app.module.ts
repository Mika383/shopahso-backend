import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SlugModule } from './modules/slug/slug.module';

@Module({
  imports: [CatalogModule, AuthModule, UsersModule, SlugModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
