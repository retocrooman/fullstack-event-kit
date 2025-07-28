import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from './prisma.service';
import { Public, MongoDBHealthIndicator } from './shared';

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
  check() {
    return this.health.check([() => Promise.resolve({ api: { status: 'up' } })]);
  }

  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }

  @Get('eventstore')
  @HealthCheck()
  checkEventStore() {
    return this.health.check([() => this.mongodbHealth.isHealthy('mongodb')]);
  }

  @Get('all')
  @HealthCheck()
  checkAll() {
    return this.health.check([
      () => Promise.resolve({ api: { status: 'up' } }),
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.mongodbHealth.isHealthy('mongodb'),
    ]);
  }
}
