import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountState } from '../../../domain/aggregates/account.aggregate';
import { GetTopAccountsByCoinsQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetTopAccountsByCoinsQuery)
export class GetTopAccountsByCoinsHandler implements IQueryHandler<GetTopAccountsByCoinsQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetTopAccountsByCoinsQuery): Promise<AccountState[]> {
    const allAccounts = await QueryHelpers.getAllAccounts(this.eventStore);
    return allAccounts.sort((a, b) => b.coins - a.coins).slice(0, query.limit);
  }
}