import { Injectable, Inject } from '@nestjs/common';
import { EventStoreService } from '../../../cqrs/services/event-store.service';
import { AccountAggregate, AccountState } from '../../domain/aggregates/account.aggregate';

@Injectable()
export class AccountQueryService {
  constructor(
    private readonly eventStore: EventStoreService,
    @Inject('CQRS_CONTAINER')
    private readonly cqrsContainer: any,
  ) {}

  async getAccountById(id: string): Promise<AccountState> {
    const aggregate = await this.loadAggregate(id);

    // If no events exist for this account, return default initial state
    if (!aggregate.accountState) {
      return this.createDefaultAccount(id);
    }

    return aggregate.accountState;
  }

  async doesAccountExistInDatabase(id: string): Promise<boolean> {
    const events = await this.eventStore.getEvents(id);
    return events && events.length > 0;
  }

  async getAllAccounts(): Promise<AccountState[]> {
    // Get all unique aggregate IDs from event store
    const aggregateIds = await this.eventStore.getAllAggregateIds('AccountAggregate');

    const accounts: AccountState[] = [];
    for (const aggregateId of aggregateIds) {
      const aggregate = await this.loadAggregate(aggregateId);
      if (aggregate.accountState && !aggregate.isDeleted) {
        accounts.push(aggregate.accountState);
      }
    }

    return accounts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAccountsByCoinsRange(minCoins: number, maxCoins?: number): Promise<AccountState[]> {
    const allAccounts = await this.getAllAccounts();

    return allAccounts
      .filter(account => {
        const hasMinCoins = account.coins >= minCoins;
        const hasMaxCoins = maxCoins === undefined || account.coins <= maxCoins;
        return hasMinCoins && hasMaxCoins;
      })
      .sort((a, b) => b.coins - a.coins);
  }

  async getTotalCoins(): Promise<number> {
    const allAccounts = await this.getAllAccounts();
    return allAccounts.reduce((total, account) => total + account.coins, 0);
  }

  async getAccountCount(): Promise<number> {
    const allAccounts = await this.getAllAccounts();
    return allAccounts.length;
  }

  async getTopAccountsByCoins(limit: number = 10): Promise<AccountState[]> {
    const allAccounts = await this.getAllAccounts();
    return allAccounts.sort((a, b) => b.coins - a.coins).slice(0, limit);
  }

  async searchAccountsById(searchTerm: string): Promise<AccountState[]> {
    const allAccounts = await this.getAllAccounts();
    return allAccounts
      .filter(account => account.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAccountsWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    accounts: AccountState[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const allAccounts = await this.getAllAccounts();
    const total = allAccounts.length;
    const skip = (page - 1) * limit;

    const accounts = allAccounts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return {
      accounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async loadAggregate(id: string): Promise<AccountAggregate> {
    // Use node-cqrs built-in aggregate loading mechanism
    try {
      // node-cqrs provides aggregate loading through the container
      const aggregate = await this.cqrsContainer.eventStore.getAggregate(AccountAggregate, id);
      return aggregate;
    } catch (error) {
      // If aggregate doesn't exist or no events, return empty aggregate
      console.log(`No events found for aggregate ${id}, returning empty aggregate`);
      return new AccountAggregate({ id });
    }
  }

  private createDefaultAccount(id: string): AccountState {
    const now = new Date();
    return {
      id,
      coins: 100, // Default initial coins
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
  }
}
