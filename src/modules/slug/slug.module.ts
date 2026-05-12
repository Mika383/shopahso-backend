import { Module } from '@nestjs/common';
import { SlugController } from './slug.controller';
import { SlugService } from './slug.service';

@Module({
  controllers: [SlugController],
  providers: [SlugService],
  exports: [SlugService],
})
export class SlugModule {}
