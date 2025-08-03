import { EventStoreService } from '../../../../cqrs/services/event-store.service';
import { AccountAggregate } from '../../../domain/aggregates/account.aggregate';

export abstract class BaseAccountCommandHandler {
  constructor(protected readonly eventStore: EventStoreService) {}

  protected async loadAggregate(accountId: string): Promise<AccountAggregate> {
    const aggregate = new AccountAggregate(accountId);
    const events = await this.eventStore.getEvents(accountId);
    aggregate.loadFromHistory(events);
    return aggregate;
  }

  protected async saveAggregate(accountId: string, aggregate: AccountAggregate): Promise<void> {
    const events = aggregate.getDomainEvents();
    await this.eventStore.saveEventsTransaction([{ aggregateId: accountId, events: [...events] }]);
    aggregate.markEventsAsCommitted();
  }
}