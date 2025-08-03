import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';
import { GetAccountCoinsQuery } from '../../queries/account.queries';

@QueryHandler(GetAccountCoinsQuery)
export class GetAccountCoinsHandler implements IQueryHandler<GetAccountCoinsQuery> {
  constructor(
    private readonly eventStoreService: EventStoreService,
  ) {}

  async execute(query: GetAccountCoinsQuery): Promise<{ accountId: string; coins: number }> {
    const events = await this.eventStoreService.getEvents(query.accountId);
    const aggregate = new AccountAggregate(query.accountId);
    
    // Replay events to rebuild state
    events.forEach(event => {
      aggregate.loadFromHistory([event]);
    });

    return {
      accountId: query.accountId,
      coins: aggregate.coins,
    };
  }
}