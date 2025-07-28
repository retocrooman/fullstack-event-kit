import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { TransferCoinsCommand } from '../../commands/account.commands';

@CommandHandler(TransferCoinsCommand)
export class TransferCoinsHandler implements ICommandHandler<TransferCoinsCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: TransferCoinsCommand): Promise<void> {
    const { fromAccountId, toAccountId, amount } = command;
    
    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer coins to the same account');
    }
    
    // Load FROM account aggregate
    const fromAggregate = new AccountAggregate(fromAccountId);
    try {
      const fromEvents = await this.eventStore.getEvents(fromAccountId);
      if (fromEvents && fromEvents.length > 0) {
        fromAggregate.loadFromHistory(fromEvents);
      }
    } catch (error) {
      // FROM account must exist for transfers
      throw new Error(`Account ${fromAccountId} does not exist`);
    }
    
    // Execute transfer from FROM account
    fromAggregate.TransferCoins({ fromAccountId, toAccountId, amount });
    
    // Save FROM account events
    const fromUncommittedEvents = fromAggregate.getDomainEvents();
    if (fromUncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(fromAccountId, [...fromUncommittedEvents]);
      fromAggregate.commit();
    }
    
    // Load TO account aggregate
    const toAggregate = new AccountAggregate(toAccountId);
    try {
      const toEvents = await this.eventStore.getEvents(toAccountId);
      if (toEvents && toEvents.length > 0) {
        toAggregate.loadFromHistory(toEvents);
      }
    } catch (error) {
      // TO account can be auto-created
    }
    
    // Add coins to TO account
    toAggregate.AddCoins({ accountId: toAccountId, amount });
    
    // Save TO account events
    const toUncommittedEvents = toAggregate.getDomainEvents();
    if (toUncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(toAccountId, [...toUncommittedEvents]);
      toAggregate.commit();
    }
  }
}