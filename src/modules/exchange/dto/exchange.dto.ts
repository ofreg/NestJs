import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class ExchangeDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}
