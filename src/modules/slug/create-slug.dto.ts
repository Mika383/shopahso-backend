import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSlugDto {
  @ApiProperty()
  @IsString()
  text: string;
}
