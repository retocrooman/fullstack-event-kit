import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../../../shared/decorators/user.decorator';
import { 
  SetCoinsCommand, 
  TransferCoinsCommand, 
  DeleteAccountCommand
} from '../../application/commands/account.commands';

@Controller('accounts')
export class AccountCommandController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Put(':id')
  async updateAccount(
    @Param('id') id: string, 
    @Body() updateAccountDto: { coins: number }
  ) {
    const command = SetCoinsCommand.fromRequest({ accountId: id, coins: updateAccountDto.coins });
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
      throw new Error('Cannot transfer coins to the same account');
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

  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    const command = DeleteAccountCommand.fromRequest({ accountId: id });
    await this.commandBus.execute(command);
    return { success: true };
  }
}