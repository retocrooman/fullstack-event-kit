import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate, AccountState } from '../../../domain/aggregates/account.aggregate';

export class QueryHelpers {
  static async loadAggregate(eventStore: EventStoreService, id: string): Promise<AccountAggregate> {
    try {
      // Load events from the event store
      const events = await eventStore.getEvents(id);
      const aggregate = new AccountAggregate(id);
      
      // Load the aggregate from its event history
      if (events && events.length > 0) {
        aggregate.loadFromHistory(events);
      }
      
      return aggregate;
    } catch (error) {
      // If aggregate doesn't exist or no events, return empty aggregate
      console.log(`No events found for aggregate ${id}, returning empty aggregate`);
      return new AccountAggregate(id);
    }
  }

  static createDefaultAccount(id: string): AccountState {
    const now = new Date();
    return {
      id,
      coins: 100, // Default initial coins
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async getAllAccounts(eventStore: EventStoreService): Promise<AccountState[]> {
    // Get all unique aggregate IDs from event store
    const aggregateIds = await eventStore.getAllAggregateIds('AccountAggregate');

    const accounts: AccountState[] = [];
    for (const aggregateId of aggregateIds) {
      const aggregate = await this.loadAggregate(eventStore, aggregateId);
      if (aggregate.accountState && !aggregate.isDeleted) {
        accounts.push(aggregate.accountState);
      }
    }

    return accounts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}