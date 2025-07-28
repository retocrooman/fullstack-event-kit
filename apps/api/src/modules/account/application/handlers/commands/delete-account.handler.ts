import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { DeleteAccountCommand } from '../../commands/account.commands';

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler implements ICommandHandler<DeleteAccountCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: DeleteAccountCommand): Promise<void> {
    const { accountId } = command;
    
    const aggregate = new AccountAggregate(accountId);
    
    try {
      const events = await this.eventStore.getEvents(accountId);
      if (events && events.length > 0) {
        aggregate.loadFromHistory(events);
      } else {
        throw new Error(`Account ${accountId} does not exist`);
      }
    } catch (error) {
      throw new Error(`Account ${accountId} does not exist`);
    }
    
    aggregate.DeleteAccount({ accountId });
    
    const uncommittedEvents = aggregate.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(accountId, [...uncommittedEvents]);
      aggregate.commit();
    }
  }
}