import { ApiProperty } from '@nestjs/swagger';

export class FieldErrorDto {
  @ApiProperty({ example: 'cardNumber' })
  field!: string;

  @ApiProperty({ example: 'length' })
  type!: string;

  @ApiProperty({ example: 'Card number must be exactly 16 digits' })
  message!: string;
}

export class ValidationErrorsDto {
  @ApiProperty({ type: [FieldErrorDto] })
  errors!: FieldErrorDto[];
}
