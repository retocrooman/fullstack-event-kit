import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsInt, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'User age', example: 25, minimum: 0, maximum: 120, required: false })
  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  age?: number;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'clxyz123abc' })
  id!: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email!: string;

  @ApiProperty({ description: 'User age', example: 25, required: false })
  age?: number;

  @ApiProperty({ description: 'Creation date', example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;
}
