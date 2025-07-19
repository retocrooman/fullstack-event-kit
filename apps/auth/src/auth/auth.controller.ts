import { Body, Controller, Post, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, SessionValidationResponseDto, LogoutResponseDto, HealthCheckResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiHeader({ name: 'authorization', description: 'Bearer JWT token' })
  @ApiResponse({ status: 200, type: SessionValidationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Headers('authorization') authorization: string): Promise<SessionValidationResponseDto> {
    const token = this.extractToken(authorization);
    return this.authService.getCurrentUser(token);
  }

  @Get('session')
  @ApiOperation({ summary: 'Validate session and get user info' })
  @ApiHeader({ name: 'authorization', description: 'Bearer JWT token' })
  @ApiResponse({ status: 200, type: SessionValidationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateSession(@Headers('authorization') authorization: string): Promise<SessionValidationResponseDto> {
    const token = this.extractToken(authorization);
    return this.authService.getCurrentUser(token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user and invalidate session' })
  @ApiHeader({ name: 'authorization', description: 'Bearer JWT token' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Headers('authorization') authorization: string): Promise<LogoutResponseDto> {
    const token = this.extractToken(authorization);
    return this.authService.logout(token);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, type: HealthCheckResponseDto })
  async health(): Promise<HealthCheckResponseDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-server',
    };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return token;
  }
}