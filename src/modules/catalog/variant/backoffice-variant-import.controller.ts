import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../auth/access-token.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { VariantService } from './variant.service';

type UploadedCsvFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(AppRole.STAFF, AppRole.ADMIN)
@ApiBearerAuth()
@Controller('backoffice/products/:productId/variants/import')
export class BackofficeVariantImportController {
  constructor(private readonly variantService: VariantService) {}

  @Get('template.csv')
  async downloadTemplate(
    @Param('productId') productId: string,
    @Res() res: Response,
  ) {
    const csv = await this.variantService.buildVariantImportTemplate(productId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="variant-import-template-${productId}.csv"`,
    );
    res.send(csv);
  }

  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  preview(
    @Param('productId') productId: string,
    @UploadedFile() file?: UploadedCsvFile,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.variantService.previewVariantImport(productId, file.buffer);
  }

  @Post('commit')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  commit(
    @Param('productId') productId: string,
    @UploadedFile() file?: UploadedCsvFile,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.variantService.commitVariantImport(productId, file.buffer);
  }
}
