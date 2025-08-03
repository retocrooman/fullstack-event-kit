import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../../../shared/decorators/user.decorator';
import { 
  AddCoinsCommand,
  DeductCoinsCommand,
  TransferCoinsCommand
} from '../../application/commands/account.commands';
import { SelfTransferError } from '../../domain/account-errors';

@Controller('accounts')
export class AccountCommandController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Post('add-coins')
  async addCoins(
    @User() user: any, 
    @Body() addCoinsDto: { amount: number }
  ) {
    const accountId = user.sub; // Current user's Auth0 ID
    const command = AddCoinsCommand.fromRequest({ accountId, amount: addCoinsDto.amount });
    await this.commandBus.execute(command);

    return { success: true };
  }

  @Post('deduct-coins')
  async deductCoins(
    @User() user: any, 
    @Body() deductCoinsDto: { amount: number }
  ) {
    const accountId = user.sub; // Current user's Auth0 ID
    const command = DeductCoinsCommand.fromRequest({ accountId, amount: deductCoinsDto.amount });
    await this.commandBus.execute(command);

    return { success: true };
  }

  @Post('transfer')
  async transferCoins(
    @User() user: any, 
    @Body() transferCoinsDto: { toAccountId: string; amount: number }
  ) {
    const fromAccountId = user.sub; // Current user's Auth0 ID

    if (fromAccountId === transferCoinsDto.toAccountId) {
      throw new SelfTransferError();
    }

    const command = TransferCoinsCommand.fromRequest({
      fromAccountId,
      toAccountId: transferCoinsDto.toAccountId,
      amount: transferCoinsDto.amount
    });
    await this.commandBus.execute(command);

    return {
      success: true,
      transferId: `transfer_${Date.now()}_${fromAccountId}_${transferCoinsDto.toAccountId}`,
    };
  }
}