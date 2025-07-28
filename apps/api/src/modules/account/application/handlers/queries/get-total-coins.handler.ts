import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { GetTotalCoinsQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetTotalCoinsQuery)
export class GetTotalCoinsHandler implements IQueryHandler<GetTotalCoinsQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetTotalCoinsQuery): Promise<number> {
    const allAccounts = await QueryHelpers.getAllAccounts(this.eventStore);
    return allAccounts.reduce((total, account) => total + account.coins, 0);
  }
}