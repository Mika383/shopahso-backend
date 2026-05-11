import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class VariantAttributeValueInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productAttributeDefinitionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valueNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valueEnum?: string;
}

export class UpsertVariantAttributeValuesDto {
  @ApiPropertyOptional({ type: [VariantAttributeValueInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeValueInputDto)
  values: VariantAttributeValueInputDto[];
}
