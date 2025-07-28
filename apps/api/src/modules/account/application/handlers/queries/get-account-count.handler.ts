import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { GetAccountCountQuery } from '../../queries/account.queries';
import { QueryHelpers } from './query-helpers';

@QueryHandler(GetAccountCountQuery)
export class GetAccountCountHandler implements IQueryHandler<GetAccountCountQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: GetAccountCountQuery): Promise<number> {
    const allAccounts = await QueryHelpers.getAllAccounts(this.eventStore);
    return allAccounts.length;
  }
}