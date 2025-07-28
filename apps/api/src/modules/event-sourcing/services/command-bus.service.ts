import { Injectable } from '@nestjs/common';
import { AccountAggregate } from '../../account/domain/aggregates/account.aggregate';
import { EventStoreService } from './event-store.service';

@Injectable()
export class CommandBusService {
  constructor(
    private readonly eventStore: EventStoreService,
  ) {}

  async execute(command: any): Promise<any> {
    // Simple command handling - in a real implementation you might want
    // a more sophisticated command routing system
    const { aggregateId, type, payload } = command;
    
    // Load the aggregate
    const events = await this.eventStore.getEvents(aggregateId);
    const aggregate = new AccountAggregate(aggregateId);
    
    // Load from history
    if (events && events.length > 0) {
      aggregate.loadFromHistory(events);
    }
    
    // Execute the command
    switch (type) {
      case 'CreateAccount':
        aggregate.CreateAccount(payload);
        break;
      case 'AddCoins':
        aggregate.AddCoins(payload);
        break;
      case 'DeductCoins':
        aggregate.DeductCoins(payload);
        break;
      case 'SetCoins':
        aggregate.SetCoins(payload);
        break;
      case 'TransferCoins':
        aggregate.TransferCoins(payload);
        break;
      case 'DeleteAccount':
        aggregate.DeleteAccount(payload);
        break;
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
    
    // Save uncommitted events
    const uncommittedEvents = aggregate.getUncommittedEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(aggregateId, [...uncommittedEvents]);
      aggregate.markEventsAsCommitted();
    }
    
    return { success: true };
  }
}