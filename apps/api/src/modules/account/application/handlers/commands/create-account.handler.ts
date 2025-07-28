import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { CreateAccountCommand } from '../../commands/account.commands';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: CreateAccountCommand): Promise<void> {
    const { accountId, initialCoins } = command;
    
    // Load existing aggregate or create new one
    const aggregate = new AccountAggregate(accountId);
    
    try {
      // Try to load existing events
      const events = await this.eventStore.getEvents(accountId);
      if (events && events.length > 0) {
        aggregate.loadFromHistory(events);
      }
    } catch (error) {
      // Aggregate doesn't exist yet, which is expected for creation
    }
    
    // Execute the business logic
    aggregate.CreateAccount({ accountId, initialCoins });
    
    // Save uncommitted events
    const uncommittedEvents = aggregate.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(accountId, [...uncommittedEvents]);
      aggregate.commit();
    }
  }
}