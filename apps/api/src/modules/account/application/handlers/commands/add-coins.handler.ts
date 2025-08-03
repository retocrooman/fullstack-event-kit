import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddCoinsCommand } from '../../commands/account.commands';
import { BaseAccountCommandHandler } from './base-account-command.handler';

@CommandHandler(AddCoinsCommand)
export class AddCoinsHandler extends BaseAccountCommandHandler implements ICommandHandler<AddCoinsCommand> {
  async execute(command: AddCoinsCommand): Promise<void> {
    const { accountId, amount } = command;
    
    const aggregate = await this.loadAggregate(accountId);
    aggregate.AddCoins({ accountId, amount });
    await this.saveAggregate(accountId, aggregate);
  }
}