import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';
import { Public, MongoDBHealthIndicator } from './shared';

@ApiTags('health')
@Controller('health-check')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private mongodbHealth: MongoDBHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  check() {
    return this.health.check([() => Promise.resolve({ api: { status: 'up' } })]);
  }

  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Check database health status' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  checkDatabase() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }

  @Get('eventstore')
  @HealthCheck()
  @ApiOperation({ summary: 'Check MongoDB eventstore health status' })
  @ApiResponse({ status: 200, description: 'MongoDB eventstore is healthy' })
  checkEventStore() {
    return this.health.check([() => this.mongodbHealth.isHealthy('mongodb')]);
  }

  @Get('all')
  @HealthCheck()
  @ApiOperation({ summary: 'Check all services health status' })
  @ApiResponse({ status: 200, description: 'All services are healthy' })
  checkAll() {
    return this.health.check([
      () => Promise.resolve({ api: { status: 'up' } }),
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.mongodbHealth.isHealthy('mongodb'),
    ]);
  }
}
