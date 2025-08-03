import { Injectable } from '@nestjs/common';
import { ConcurrencyConflictError } from '../cqrs-errors';
import { EventStore } from '../cqrs-types';

@Injectable()
export class MongoDbStoreService {
  constructor(private eventStore: EventStore) {}

  async getEvents(aggregateId: string): Promise<any[]> {
    return new Promise(resolve => {
      this.eventStore.getEventStream(aggregateId, (err, stream) => {
        resolve(stream?.events || []);
      });
    });
  }

  async saveEvents(aggregateId: string, events: any[]): Promise<void> {
    if (events.length === 0) return;

    return new Promise((resolve, reject) => {
      this.eventStore.getEventStream(aggregateId, (err, stream) => {
        if (err && !err.message?.includes('not found')) return reject(err);

        if (stream) {
          const versionError = this.checkVersionConflict(aggregateId, events, stream);
          if (versionError) return reject(versionError);
          
          events.forEach(event => stream.addEvent(event));
          stream.commit(commitErr => (commitErr ? reject(commitErr) : resolve()));
        } else {
          this.eventStore.getEventStream(aggregateId, (newErr, newStream) => {
            if (newErr) return reject(newErr);
            if (!newStream) return reject(new Error('Failed to create stream'));
            
            const versionError = this.checkVersionConflict(aggregateId, events, newStream);
            if (versionError) return reject(versionError);
            
            events.forEach(event => newStream.addEvent(event));
            newStream.commit(commitErr => (commitErr ? reject(commitErr) : resolve()));
          });
        }
      });
    });
  }

  async saveEventsWithTransaction(
    operations: Array<{ aggregateId: string; events: any[] }>,
    client: any,
  ): Promise<void> {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        for (const { aggregateId, events } of operations) {
          await this.saveEvents(aggregateId, events);
        }
      });
    } finally {
      await session.endSession();
    }
  }

  private getCurrentVersion(stream: any): number {
    return stream.lastRevision ?? stream.currentRevision ?? -1;
  }

  private checkVersionConflict(aggregateId: string, events: any[], stream: any): ConcurrencyConflictError | null {
    if (events.length > 0 && events[0].version !== undefined) {
      const currentVersion = this.getCurrentVersion(stream);
      const expectedVersion = events[0].version - 1;

      if (expectedVersion !== currentVersion) {
        return new ConcurrencyConflictError(aggregateId, expectedVersion, currentVersion);
      }
    }
    return null;
  }
}