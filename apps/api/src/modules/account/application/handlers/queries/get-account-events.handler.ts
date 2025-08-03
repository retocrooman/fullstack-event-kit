import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { GetAccountEventsQuery } from '../../queries/account.queries';

@QueryHandler(GetAccountEventsQuery)
export class GetAccountEventsHandler implements IQueryHandler<GetAccountEventsQuery> {
  constructor(
    private readonly eventStoreService: EventStoreService,
  ) {}

  async execute(query: GetAccountEventsQuery): Promise<{ accountId: string; events: any[] }> {
    const events = await this.eventStoreService.getEvents(query.accountId);
    return {
      accountId: query.accountId,
      events,
    };
  }
}