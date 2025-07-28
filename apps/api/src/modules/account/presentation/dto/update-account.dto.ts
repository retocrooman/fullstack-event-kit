import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsInt } from 'class-validator';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    description: 'New coin amount',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Coins must be a number' })
  @IsInt({ message: 'Coins must be an integer' })
  @Min(0, { message: 'Coins cannot be negative' })
  coins?: number;
}