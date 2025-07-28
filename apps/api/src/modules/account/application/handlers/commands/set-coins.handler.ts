import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { SetCoinsCommand } from '../../commands/account.commands';

@CommandHandler(SetCoinsCommand)
export class SetCoinsHandler implements ICommandHandler<SetCoinsCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: SetCoinsCommand): Promise<void> {
    const { accountId, coins } = command;
    
    const aggregate = new AccountAggregate(accountId);
    
    try {
      const events = await this.eventStore.getEvents(accountId);
      if (events && events.length > 0) {
        aggregate.loadFromHistory(events);
      }
    } catch (error) {
      // Aggregate doesn't exist, will be auto-created in business logic
    }
    
    aggregate.SetCoins({ accountId, coins });
    
    const uncommittedEvents = aggregate.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(accountId, [...uncommittedEvents]);
      aggregate.commit();
    }
  }
}