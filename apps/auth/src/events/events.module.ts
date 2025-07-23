import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxRepository } from './infrastructure/outbox.repository';
import { EventPublisherService } from './services/event-publisher.service';
import { OutboxProcessorService } from './services/outbox-processor.service';

@Module({
  imports: [PrismaModule],
  providers: [
    OutboxRepository,
    {
      provide: EventPublisherService,
      useFactory: (outboxRepository: OutboxRepository) => {
        return new EventPublisherService(
          outboxRepository,
          {
            transport: Transport.NATS,
            options: {
              servers: [`nats://${process.env.NATS_HOST || 'localhost'}:${process.env.NATS_PORT || '4222'}`],
              queue: 'auth-events-queue',
            },
          },
        );
      },
      inject: [OutboxRepository],
    },
    OutboxProcessorService,
  ],
  exports: [EventPublisherService, OutboxRepository],
})
export class EventsModule {}