import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { EventStoreService } from '../../modules/cqrs/services/event-store.service';

@Injectable()
export class MongoDBHealthIndicator extends HealthIndicator {
  constructor(private readonly eventStoreService: EventStoreService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test MongoDB connection by attempting to get an event store instance
      const eventStore = await this.eventStoreService.getEventStore();
      
      if (!eventStore) {
        throw new Error('EventStore is not available');
      }

      // Test by trying to create a health check event stream
      await new Promise<void>((resolve, reject) => {
        eventStore.getEventStream('health-check-test', (err, stream) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return this.getStatus(key, true, { message: 'MongoDB eventstore is available' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = this.getStatus(key, false, { message: errorMessage });
      throw new HealthCheckError('MongoDB eventstore check failed', status);
    }
  }
}