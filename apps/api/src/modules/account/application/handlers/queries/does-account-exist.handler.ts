import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { DoesAccountExistQuery } from '../../queries/account.queries';

@QueryHandler(DoesAccountExistQuery)
export class DoesAccountExistHandler implements IQueryHandler<DoesAccountExistQuery> {
  constructor(private readonly eventStore: EventStoreService) {}

  async execute(query: DoesAccountExistQuery): Promise<boolean> {
    const events = await this.eventStore.getEvents(query.accountId);
    return events && events.length > 0;
  }
}