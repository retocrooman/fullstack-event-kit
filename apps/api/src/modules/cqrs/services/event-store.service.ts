import { Injectable, Inject } from '@nestjs/common';
import { ConcurrencyConflictError } from '../errors/concurrency-conflict.error';
import { EventStore } from '../types/eventstore.types';

@Injectable()
export class EventStoreService {
  constructor(
    @Inject('EVENT_STORE')
    private eventStore: Promise<EventStore>,
  ) {}

  async getEvents(aggregateId: string): Promise<any[]> {
    const eventStore = await this.eventStore;
    return new Promise(resolve => {
      eventStore.getEventStream(aggregateId, (err, stream) => {
        resolve(stream?.events || []);
      });
    });
  }

  async saveEvents(aggregateId: string, events: any[]): Promise<void> {
    if (events.length === 0) return;

    const eventStore = await this.eventStore;
    return new Promise((resolve, reject) => {
      eventStore.getEventStream(aggregateId, (err, stream) => {
        if (err && !err.message?.includes('not found')) {
          reject(err);
          return;
        }

        // Use existing stream or create new one by calling again
        if (stream) {
          try {
            this.checkVersionConflict(aggregateId, events, stream);
            events.forEach(event => stream.addEvent(event));
            stream.commit(commitErr => (commitErr ? reject(commitErr) : resolve()));
          } catch (error) {
            reject(error);
          }
        } else {
          // For new streams, get a fresh stream
          eventStore.getEventStream(aggregateId, (newErr, newStream) => {
            if (newErr) {
              reject(newErr);
              return;
            }
            if (newStream) {
              try {
                this.checkVersionConflict(aggregateId, events, newStream);
                events.forEach(event => newStream.addEvent(event));
                newStream.commit(commitErr => (commitErr ? reject(commitErr) : resolve()));
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Failed to create stream'));
            }
          });
        }
      });
    });
  }

  async saveEventsTransaction(operations: Array<{ aggregateId: string; events: any[] }>): Promise<void> {
    const validOperations = operations.filter(op => op.events.length > 0);
    if (validOperations.length === 0) return;

    const eventStore = await this.eventStore;
    const client = eventStore.store?.client || eventStore.client;

    if (client) {
      await this.saveEventsWithMongoTransaction(validOperations, client);
    } else {
      await this.saveEventsWithInmemoryTransaction(validOperations);
    }
  }

  private async saveEventsWithMongoTransaction(
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

  private async saveEventsWithInmemoryTransaction(
    operations: Array<{ aggregateId: string; events: any[] }>,
  ): Promise<void> {
    const savedStates: Array<{ aggregateId: string; originalEvents: any[] }> = [];

    try {
      // Collect original states for rollback
      for (const { aggregateId } of operations) {
        const originalEvents = await this.getEvents(aggregateId);
        savedStates.push({ aggregateId, originalEvents });
      }

      // Execute all operations
      for (const { aggregateId, events } of operations) {
        await this.saveEvents(aggregateId, events);
      }
    } catch (error) {
      // Rollback: restore original states
      for (const { aggregateId, originalEvents } of savedStates) {
        try {
          await this.restoreEvents(aggregateId, originalEvents);
        } catch (rollbackError) {
          console.error(`Failed to rollback ${aggregateId}:`, rollbackError);
        }
      }
      throw error;
    }
  }

  private async restoreEvents(aggregateId: string, events: any[]): Promise<void> {
    // This is a simplified rollback - in production you'd need more sophisticated logic
    const eventStore = await this.eventStore;
    return new Promise((resolve, reject) => {
      eventStore.getEventStream(aggregateId, (err: any, stream: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (stream) {
          // Clear existing events (simplified approach)
          stream.events = events;
          resolve();
        } else {
          resolve();
        }
      });
    });
  }

  async getEventStore(): Promise<EventStore> {
    return this.eventStore;
  }

  private getCurrentVersion(stream: any): number {
    // EventStore uses different properties for stream version:
    // - lastRevision: final committed revision (preferred)
    // - currentRevision: current working revision  
    // - fallback to -1 for new streams
    return stream.lastRevision ?? stream.currentRevision ?? -1;
  }

  private checkVersionConflict(aggregateId: string, events: any[], stream: any): void {
    if (events.length > 0 && events[0].version !== undefined) {
      const currentVersion = this.getCurrentVersion(stream);
      const expectedVersion = events[0].version - 1;

      if (expectedVersion !== currentVersion) {
        throw new ConcurrencyConflictError(aggregateId, expectedVersion, currentVersion);
      }
    }
  }
}
