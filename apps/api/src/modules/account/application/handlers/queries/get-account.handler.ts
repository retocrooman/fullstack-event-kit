import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountState } from '../../../domain/aggregates/account.aggregate';
import { GetAccountQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetAccountQuery)
export class GetAccountHandler implements IQueryHandler<GetAccountQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetAccountQuery): Promise<AccountState> {
    const aggregate = await QueryHelpers.loadAggregate(this.eventStore, query.accountId);

    // If no events exist for this account, return default initial state
    if (!aggregate.accountState) {
      return QueryHelpers.createDefaultAccount(query.accountId);
    }

    return aggregate.accountState;
  }
}