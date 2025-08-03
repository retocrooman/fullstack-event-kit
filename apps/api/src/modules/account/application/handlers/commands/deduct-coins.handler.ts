import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeductCoinsCommand } from '../../commands/account.commands';
import { BaseAccountCommandHandler } from './base-account-command.handler';

@CommandHandler(DeductCoinsCommand)
export class DeductCoinsHandler extends BaseAccountCommandHandler implements ICommandHandler<DeductCoinsCommand> {
  async execute(command: DeductCoinsCommand): Promise<void> {
    const { accountId, amount } = command;
    
    const aggregate = await this.loadAggregate(accountId);
    aggregate.DeductCoins({ accountId, amount });
    await this.saveAggregate(accountId, aggregate);
  }
}