import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { EventSourcingModule } from './modules/event-sourcing/event-sourcing.module';
import { PrismaService } from './prisma.service';
import { GlobalExceptionFilter, MongoDBHealthIndicator } from './shared';

@Module({
  imports: [
    TerminusModule,
    EventSourcingModule,
    AuthModule,
    AccountModule,
  ],
  controllers: [
    AppController,
    HealthController,
  ],
  providers: [
    AppService,
    PrismaService,
    MongoDBHealthIndicator,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}