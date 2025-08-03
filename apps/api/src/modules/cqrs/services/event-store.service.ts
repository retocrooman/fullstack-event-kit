import { Injectable, Inject } from '@nestjs/common';
import { ConcurrencyConflictError } from '../../account/domain/account-errors';
import { EventStore } from '../types/eventstore.types';

@Injectable()
export class EventStoreService {
  constructor(
    @Inject('EVENT_STORE')
    private eventStore: Promise<EventStore>,
  ) {}

  async getEvents(aggregateId: string): Promise<any[]> {
    const eventStore = await this.eventStore;
    return new Promise((resolve, reject) => {
      eventStore.getEventStream(aggregateId, (err, stream) => {
        if (err?.message?.includes('not found') || !stream) {
          resolve([]);
        } else if (err) {
          reject(err);
        } else {
          resolve(stream.events || []);
        }
      });
    });
  }

  async saveEventsTransaction(operations: Array<{ aggregateId: string; events: any[] }>): Promise<void> {
    const validOperations = operations.filter(op => op.events.length > 0);
    if (validOperations.length === 0) return;

    const eventStore = await this.eventStore;
    const client = eventStore.store?.client || eventStore.client;

    if (!client) throw new Error('Client not available for transactions');

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        for (const { aggregateId, events } of validOperations) {
          await this.saveEventsWithSession(eventStore, aggregateId, events, session);
        }
      });
    } finally {
      await session.endSession();
    }
  }

  private async saveEventsWithSession(
    eventStore: EventStore,
    aggregateId: string,
    events: any[],
    session: any,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get current stream version for optimistic concurrency control
      eventStore.getEventStream(aggregateId, { useTransaction: true, session }, (err, stream) => {
        if (err || !stream) {
          reject(err || new Error('Stream not available for transaction'));
          return;
        }

        // Check version conflicts - expectedVersion should match current stream version
        const currentVersion = stream.lastRevision || stream.currentRevision || 0;
        const expectedVersion = events.length > 0 ? events[0].version - 1 : currentVersion;

        if (expectedVersion !== currentVersion) {
          reject(new ConcurrencyConflictError(aggregateId, expectedVersion, currentVersion));
          return;
        }

        events.forEach(event => stream.addEvent(event));
        stream.commit({ session }, commitErr => (commitErr ? reject(commitErr) : resolve()));
      });
    });
  }

  async getEventStore(): Promise<EventStore> {
    return this.eventStore;
  }
}
