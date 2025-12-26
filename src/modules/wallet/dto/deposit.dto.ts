import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class DepositDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cardId!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;
}
