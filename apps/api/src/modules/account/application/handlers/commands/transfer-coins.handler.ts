import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { SelfTransferError } from '../../../domain/account-errors';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { TransferCoinsCommand } from '../../commands/account.commands';

@CommandHandler(TransferCoinsCommand)
export class TransferCoinsHandler implements ICommandHandler<TransferCoinsCommand> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(command: TransferCoinsCommand): Promise<void> {
    const { fromAccountId, toAccountId, amount } = command;
    
    if (fromAccountId === toAccountId) {
      throw new SelfTransferError();
    }
    
    // Load FROM account aggregate
    const fromAggregate = new AccountAggregate(fromAccountId);
    const fromEvents = await this.eventStore.getEvents(fromAccountId);
    if (fromEvents && fromEvents.length > 0) {
      fromAggregate.loadFromHistory(fromEvents);
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
    const toEvents = await this.eventStore.getEvents(toAccountId);
    if (toEvents && toEvents.length > 0) {
      toAggregate.loadFromHistory(toEvents);
    }
    
    // Receive coins to TO account
    toAggregate.ReceiveCoins({ accountId: toAccountId, fromAccountId, amount });
    
    // Save TO account events
    const toUncommittedEvents = toAggregate.getDomainEvents();
    if (toUncommittedEvents.length > 0) {
      await this.eventStore.saveEvents(toAccountId, [...toUncommittedEvents]);
      toAggregate.commit();
    }
  }
}