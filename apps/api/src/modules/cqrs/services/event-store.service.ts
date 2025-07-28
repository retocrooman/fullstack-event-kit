import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class EventStoreService {
  constructor(
    @Inject('CQRS_CONTAINER')
    private readonly cqrsContainer: any,
  ) {}

  async getEvents(aggregateId: string): Promise<any[]> {
    return await this.cqrsContainer.eventStore.getEvents(aggregateId);
  }

  async saveEvents(aggregateId: string, events: any[]): Promise<void> {
    return await this.cqrsContainer.eventStore.commit(events);
  }

  async getAllAggregateIds(aggregateType?: string): Promise<string[]> {
    // This is a simplified implementation - in a real scenario you might need
    // to query the underlying storage directly or extend node-cqrs
    try {
      const storage = this.cqrsContainer.eventStore._storage;
      if (storage && storage.getAllAggregateIds) {
        return await storage.getAllAggregateIds(aggregateType);
      }
      
      // Fallback: if the storage doesn't support this method
      // we'll need to implement it differently based on the storage type
      return [];
    } catch (error) {
      console.warn('Could not retrieve aggregate IDs:', error);
      return [];
    }
  }

  get eventStore() {
    return this.cqrsContainer.eventStore;
  }
}