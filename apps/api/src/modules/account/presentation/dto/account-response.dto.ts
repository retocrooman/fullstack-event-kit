import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'auth0|123456789',
  })
  id!: string;

  @ApiProperty({
    description: 'Current coin amount',
    example: 100,
    minimum: 0,
  })
  coins!: number;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}