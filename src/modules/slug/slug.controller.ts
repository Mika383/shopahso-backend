import { Body, Controller, Post } from '@nestjs/common';
import { CreateSlugDto } from './create-slug.dto';
import { SlugService } from './slug.service';

@Controller('slug')
export class SlugController {
  constructor(private readonly slugService: SlugService) {}

  @Post()
  create(@Body() body: CreateSlugDto) {
    return { slug: this.slugService.buildSlug(body.text) };
  }
}
