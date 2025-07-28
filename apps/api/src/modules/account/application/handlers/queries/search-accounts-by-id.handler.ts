import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountState } from '../../../domain/aggregates/account.aggregate';
import { SearchAccountsByIdQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(SearchAccountsByIdQuery)
export class SearchAccountsByIdHandler implements IQueryHandler<SearchAccountsByIdQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: SearchAccountsByIdQuery): Promise<AccountState[]> {
    const allAccounts = await QueryHelpers.getAllAccounts(this.eventStore);
    return allAccounts
      .filter(account => account.id.toLowerCase().includes(query.searchTerm.toLowerCase()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}