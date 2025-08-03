import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { AddCoinsCommand } from '../../commands/account.commands';

@CommandHandler(AddCoinsCommand)
export class AddCoinsHandler implements ICommandHandler<AddCoinsCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: AddCoinsCommand): Promise<void> {
    const { accountId, amount } = command;
    
    // Load existing aggregate
    const aggregate = new AccountAggregate(accountId);
    const events = await this.eventStore.getEvents(accountId);
    if (events && events.length > 0) {
      aggregate.loadFromHistory(events);
    }
    
    // Execute the business logic
    aggregate.AddCoins({ accountId, amount });
    
    // Save uncommitted events
    const uncommittedEvents = aggregate.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(accountId, [...uncommittedEvents]);
      aggregate.commit();
    }
  }
}