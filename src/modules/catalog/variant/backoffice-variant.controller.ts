import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VariantService } from './variant.service';
import { CreateVariantDto } from './create-variant.dto';
import { UpdateVariantDto } from './update-variant.dto';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RemoveImageDto } from '../../media/remove-image.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
};

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice/variants')
export class BackofficeVariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  create(@Body() body: CreateVariantDto) {
    return this.variantService.create(body);
  }

  @Get()
  findAll() {
    return this.variantService.findAllBackoffice();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const variant = await this.variantService.findOne(id);

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVariantDto) {
    return this.variantService.update(id, body);
  }

  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  uploadImage(@Param('id') id: string, @UploadedFile() file?: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    return this.variantService.uploadImage(id, file);
  }

  @Delete(':id/images')
  removeImage(@Param('id') id: string, @Body() body: RemoveImageDto) {
    return this.variantService.removeImage(id, body.publicId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantService.remove(id);
  }
}
