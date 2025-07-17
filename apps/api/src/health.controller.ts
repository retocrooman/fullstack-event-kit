import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';

@ApiTags('health')
@Controller('health-check')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  check() {
    return this.health.check([() => Promise.resolve({ api: { status: 'up' } })]);
  }

  @Get('db')
  @HealthCheck()
  @ApiOperation({ summary: 'Check database health status' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  checkDatabase() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }
}
