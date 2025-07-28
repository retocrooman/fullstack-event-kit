import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountState } from '../../../domain/aggregates/account.aggregate';
import { GetAllAccountsQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsHandler implements IQueryHandler<GetAllAccountsQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetAllAccountsQuery): Promise<AccountState[]> {
    return await QueryHelpers.getAllAccounts(this.eventStore);
  }
}