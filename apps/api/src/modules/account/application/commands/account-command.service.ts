import { Injectable } from '@nestjs/common';
import { CommandBusService } from '../../../cqrs/services/command-bus.service';
import { EventStoreService } from '../../../cqrs/services/event-store.service';

@Injectable()
export class AccountCommandService {
  constructor(
    private readonly commandBus: CommandBusService,
    private readonly eventStore: EventStoreService,
  ) {}

  async addCoins(accountId: string, amount: number): Promise<void> {
    await this.commandBus.commandBus.send('AddCoins', accountId, {
      payload: {
        accountId,
        amount,
      },
    });
  }

  async deductCoins(accountId: string, amount: number): Promise<void> {
    await this.commandBus.commandBus.send('DeductCoins', accountId, {
      payload: {
        accountId,
        amount,
      },
    });
  }

  async setCoins(accountId: string, coins: number): Promise<void> {
    await this.commandBus.commandBus.send('SetCoins', accountId, {
      payload: {
        accountId,
        coins,
      },
    });
  }

  async transferCoins(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer coins to the same account');
    }

    // Transfer from the FROM account
    await this.commandBus.commandBus.send('TransferCoins', fromAccountId, {
      payload: {
        fromAccountId,
        toAccountId,
        amount,
      },
    });

    // Add coins to the TO account
    await this.commandBus.commandBus.send('AddCoins', toAccountId, {
      payload: {
        accountId: toAccountId,
        amount,
      },
    });
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.commandBus.commandBus.send('DeleteAccount', accountId, {
      payload: {
        accountId,
      },
    });
  }

  // Utility methods for business decisions
  async accountExists(accountId: string): Promise<boolean> {
    try {
      const events = await this.eventStore.getEvents(accountId);
      return events && events.length > 0;
    } catch (error) {
      return false;
    }
  }
}
