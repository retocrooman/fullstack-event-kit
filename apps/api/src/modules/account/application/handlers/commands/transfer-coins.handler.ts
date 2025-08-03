import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SelfTransferError } from '../../../domain/account-errors';
import { TransferCoinsCommand } from '../../commands/account.commands';
import { BaseAccountCommandHandler } from './base-account-command.handler';

@CommandHandler(TransferCoinsCommand)
export class TransferCoinsHandler extends BaseAccountCommandHandler implements ICommandHandler<TransferCoinsCommand> {
  async execute(command: TransferCoinsCommand): Promise<void> {
    const { fromAccountId, toAccountId, amount } = command;
    
    if (fromAccountId === toAccountId) throw new SelfTransferError();
    
    // Load aggregates
    const fromAggregate = await this.loadAggregate(fromAccountId);
    const toAggregate = await this.loadAggregate(toAccountId);
    
    // Execute business logic
    fromAggregate.TransferCoins({ fromAccountId, toAccountId, amount });
    toAggregate.ReceiveCoins({ accountId: toAccountId, fromAccountId, amount });
    
    // Save events atomically
    const operations = [
      { aggregateId: fromAccountId, events: [...fromAggregate.getDomainEvents()] },
      { aggregateId: toAccountId, events: [...toAggregate.getDomainEvents()] }
    ];
    
    await this.eventStore.saveEventsTransaction(operations);
    
    fromAggregate.markEventsAsCommitted();
    toAggregate.markEventsAsCommitted();
  }
}