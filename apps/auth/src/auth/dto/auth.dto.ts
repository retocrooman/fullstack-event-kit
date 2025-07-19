import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  name?: string | null;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty({ required: false })
  image?: string | null;

  @ApiProperty({ required: false })
  age?: number | null;
}

export class SessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  expiresAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  user!: UserResponseDto;

  @ApiProperty()
  session!: SessionResponseDto;

  @ApiProperty()
  jwt!: string;
}

export class SessionValidationResponseDto {
  @ApiProperty()
  user!: UserResponseDto;

  @ApiProperty()
  session!: SessionResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  success!: boolean;
}

export class HealthCheckResponseDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  service!: string;
}