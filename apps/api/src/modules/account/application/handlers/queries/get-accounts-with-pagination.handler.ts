import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountState } from '../../../domain/aggregates/account.aggregate';
import { GetAccountsWithPaginationQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetAccountsWithPaginationQuery)
export class GetAccountsWithPaginationHandler implements IQueryHandler<GetAccountsWithPaginationQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetAccountsWithPaginationQuery): Promise<{
    accounts: AccountState[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const allAccounts = await QueryHelpers.getAllAccounts(this.eventStore);
    const total = allAccounts.length;
    const skip = (query.page - 1) * query.limit;

    const accounts = allAccounts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + query.limit);

    return {
      accounts,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}