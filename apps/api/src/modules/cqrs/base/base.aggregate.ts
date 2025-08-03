import { AggregateRoot } from '@nestjs/cqrs';

export interface DomainEvent {
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly version: number;
  readonly timestamp: Date;
}

export abstract class BaseAggregate extends AggregateRoot {
  protected readonly aggregateId: string;
  private version: number = 0;

  constructor(aggregateId: string) {
    super();
    if (!aggregateId) throw new Error('Aggregate ID is required');
    this.aggregateId = aggregateId;
  }

  getId(): string {
    return this.aggregateId;
  }

  getVersion(): number {
    return this.version;
  }

  loadFromHistory(events: DomainEvent[]): void {
    if (events.length === 0) return;

    events.forEach(event => {
      // Validate event belongs to this aggregate
      if (event.aggregateId !== this.aggregateId) {
        throw new Error(
          `Event aggregate ID ${event.aggregateId} does not match current aggregate ID ${this.aggregateId}`,
        );
      }

      this.applyEvent(event, false);
      this.version = Math.max(this.version, event.version);
    });
  }

  getDomainEvents(): readonly DomainEvent[] {
    // Convert NestJS CQRS events to our DomainEvent interface
    const uncommittedEvents = super.getUncommittedEvents();
    return uncommittedEvents.map((event: any, index: number) => ({
      aggregateId: this.aggregateId,
      eventType: event.constructor.name,
      payload: event,
      version: this.version + index + 1, // Each new event gets incremental version
      timestamp: new Date(),
    }));
  }

  markEventsAsCommitted(): void {
    const uncommittedEvents = this.getDomainEvents();
    if (uncommittedEvents.length > 0) {
      // Update version to the latest event version
      this.version = uncommittedEvents[uncommittedEvents.length - 1].version;
    }
    // Clear the uncommitted events from the base AggregateRoot
    this.commit();
  }

  protected emitEvent(eventType: string, payload: Record<string, unknown>): void {
    const event: DomainEvent = {
      aggregateId: this.aggregateId,
      eventType,
      payload: {
        ...payload,
        aggregateId: this.aggregateId,
        timestamp: new Date(),
      },
      version: 0, // Will be set properly in getDomainEvents
      timestamp: new Date(),
    };

    // Apply the event to update internal state
    this.applyEvent(event, true);

    // Track as uncommitted event for persistence
    this.apply(event);
  }

  protected abstract applyEvent(event: DomainEvent, isNew: boolean): void;
}
