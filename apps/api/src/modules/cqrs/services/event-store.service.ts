import { Injectable, Inject } from '@nestjs/common';
import { EventStore } from '../types/eventstore.types';
import { InmemoryStoreService } from './inmemory-store.service';
import { MongoDbStoreService } from './mongo-db-store.service';

@Injectable()
export class EventStoreService {
  private mongoDbStore: MongoDbStoreService | null = null;
  private inmemoryStore: InmemoryStoreService | null = null;

  constructor(
    @Inject('EVENT_STORE')
    private eventStore: Promise<EventStore>,
  ) {}

  private async getStoreInstance(): Promise<MongoDbStoreService | InmemoryStoreService> {
    const eventStore = await this.eventStore;
    const client = eventStore.store?.client || eventStore.client;

    if (client) {
      if (!this.mongoDbStore) {
        this.mongoDbStore = new MongoDbStoreService(eventStore);
      }
      return this.mongoDbStore;
    } else {
      if (!this.inmemoryStore) {
        this.inmemoryStore = new InmemoryStoreService(eventStore);
      }
      return this.inmemoryStore;
    }
  }

  async getEvents(aggregateId: string): Promise<any[]> {
    const store = await this.getStoreInstance();
    return store.getEvents(aggregateId);
  }

  async saveEvents(aggregateId: string, events: any[]): Promise<void> {
    const store = await this.getStoreInstance();
    return store.saveEvents(aggregateId, events);
  }

  async saveEventsTransaction(operations: Array<{ aggregateId: string; events: any[] }>): Promise<void> {
    const validOperations = operations.filter(op => op.events.length > 0);
    if (validOperations.length === 0) return;

    const eventStore = await this.eventStore;
    const client = eventStore.store?.client || eventStore.client;
    const store = await this.getStoreInstance();

    if (client && store instanceof MongoDbStoreService) {
      await store.saveEventsWithTransaction(validOperations, client);
    } else if (store instanceof InmemoryStoreService) {
      await store.saveEventsWithTransaction(validOperations);
    }
  }

  async getEventStore(): Promise<EventStore> {
    return this.eventStore;
  }
}
