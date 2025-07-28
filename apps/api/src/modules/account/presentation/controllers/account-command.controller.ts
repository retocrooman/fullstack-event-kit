import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from '../../../../shared/decorators/user.decorator';
import { 
  SetCoinsCommand, 
  TransferCoinsCommand, 
  DeleteAccountCommand
} from '../../application/commands/account.commands';

@ApiTags('accounts - commands')
@ApiBearerAuth()
@Controller('accounts')
export class AccountCommandController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update account coins' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coins: { type: 'number', minimum: 0, description: 'New coin amount' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateAccount(
    @Param('id') id: string, 
    @Body() updateAccountDto: { coins: number }
  ) {
    const command = SetCoinsCommand.fromRequest({ accountId: id, coins: updateAccountDto.coins });
    await this.commandBus.execute(command);

    return { success: true };
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer coins from current user to another account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        toAccountId: { type: 'string', description: 'Destination account ID' },
        amount: { type: 'number', minimum: 1, description: 'Amount to transfer' },
      },
      required: ['toAccountId', 'amount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        transferId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Invalid transfer' })
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
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(@Param('id') id: string) {
    const command = DeleteAccountCommand.fromRequest({ accountId: id });
    await this.commandBus.execute(command);
    return { success: true };
  }
}