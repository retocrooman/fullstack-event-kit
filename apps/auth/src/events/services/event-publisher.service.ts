import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { OutboxEvent } from '../../../node_modules/.prisma/auth-client';
import { DomainEvent } from '../domain';
import { OutboxRepository } from '../infrastructure/outbox.repository';

export interface EventPublisherConfig {
  transport: Transport;
  options: any;
}

@Injectable()
export class EventPublisherService implements OnModuleInit {
  private readonly logger = new Logger(EventPublisherService.name);
  private client!: ClientProxy;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly config: EventPublisherConfig = {
      transport: Transport.NATS,
      options: {
        servers: [`nats://${process.env.NATS_HOST || 'localhost'}:${process.env.NATS_PORT || '4222'}`],
        queue: 'auth-events-queue',
      },
    },
  ) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create(this.config);
  }

  async publishEvent(event: DomainEvent): Promise<void> {
    const outboxEvent = await this.outboxRepository.save(event);

    try {
      await this.processOutboxEvent(outboxEvent);
    } catch (error) {
      this.logger.error(`Failed to publish event ${outboxEvent.id}`, error);
    }
  }

  async publishEvents(events: DomainEvent[]): Promise<void> {
    const count = await this.outboxRepository.saveMany(events);
    this.logger.log(`Saved ${count} events to outbox`);

    // Process events asynchronously
    this.processPendingEvents().catch(error => {
      this.logger.error('Failed to process pending events', error);
    });
  }

  async processPendingEvents(): Promise<void> {
    const events = await this.outboxRepository.findPendingEvents();

    for (const event of events) {
      try {
        await this.processOutboxEvent(event);
      } catch (error) {
        this.logger.error(`Failed to process event ${event.id}`, error);
      }
    }
  }

  private async processOutboxEvent(event: OutboxEvent): Promise<void> {
    try {
      // Mark as processing
      await this.outboxRepository.markAsProcessing(event.id);

      // Emit event to message bus
      await this.client
        .emit(event.eventType, {
          id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          occurredAt: event.occurredAt,
        })
        .toPromise();

      // Mark as published
      await this.outboxRepository.markAsPublished(event.id);
      this.logger.log(`Successfully published event ${event.id} of type ${event.eventType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (event.retryCount >= 4) {
        // Max retries reached, move to dead letter
        await this.outboxRepository.markAsDeadLetter(event.id, errorMessage);
        this.logger.error(`Event ${event.id} moved to dead letter after max retries`, error);
      } else {
        // Mark as failed and increment retry count
        await this.outboxRepository.markAsFailed(event.id, errorMessage);
        this.logger.warn(`Event ${event.id} failed, will retry (attempt ${event.retryCount + 1})`, error);
      }

      throw error;
    }
  }

  async cleanupPublishedEvents(olderThanDays: number = 7): Promise<number> {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - olderThanDays);

    const deletedCount = await this.outboxRepository.deletePublishedEvents(beforeDate);
    this.logger.log(`Cleaned up ${deletedCount} published events older than ${olderThanDays} days`);

    return deletedCount;
  }

  async getDeadLetterEvents(): Promise<OutboxEvent[]> {
    return this.outboxRepository.findPendingEvents();
  }
}
