import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddCardDto {
  @ApiProperty({ example: '4444333322221111' })
  @IsString()
  cardNumber!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  cvv!: string;

  @ApiProperty({ example: '12/30', description: 'MM/YY' })
  @IsString()
  expiry!: string;
}
