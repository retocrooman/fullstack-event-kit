import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsInt } from 'class-validator';

export class TransferCoinsDto {
  @ApiProperty({
    description: 'Destination account ID',
    example: 'auth0|987654321',
  })
  @IsString()
  toAccountId!: string;

  @ApiProperty({
    description: 'Amount to transfer',
    example: 50,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsInt({ message: 'Amount must be an integer' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount!: number;
}