import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'User age', example: 25, minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name!: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email!: string;

  @ApiProperty({ description: 'User age', example: 25 })
  age!: number;

  @ApiProperty({ description: 'Creation date', example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;
}
