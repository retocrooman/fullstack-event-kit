import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { DeductCoinsCommand } from '../../commands/account.commands';

@CommandHandler(DeductCoinsCommand)
export class DeductCoinsHandler implements ICommandHandler<DeductCoinsCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: DeductCoinsCommand): Promise<void> {
    const { accountId, amount } = command;
    
    const aggregate = new AccountAggregate(accountId);
    const events = await this.eventStore.getEvents(accountId);
    if (events && events.length > 0) {
      aggregate.loadFromHistory(events);
    }
    
    aggregate.DeductCoins({ accountId, amount });
    
    const uncommittedEvents = aggregate.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(accountId, [...uncommittedEvents]);
      aggregate.commit();
    }
  }
}