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
    if (!aggregateId) {
      throw new Error('Aggregate ID is required');
    }
    this.aggregateId = aggregateId;
  }

  getId(): string {
    return this.aggregateId;
  }

  getVersion(): number {
    return this.version;
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach(event => {
      // Validate event belongs to this aggregate
      if (event.aggregateId !== this.aggregateId) {
        throw new Error(
          `Event aggregate ID ${event.aggregateId} does not match current aggregate ID ${this.aggregateId}`
        );
      }
      
      this.applyEvent(event, false);
      this.version = Math.max(this.version, event.version);
    });
  }

  getDomainEvents(): readonly DomainEvent[] {
    // Convert NestJS CQRS events to our DomainEvent interface
    return super.getUncommittedEvents().map((event: any) => ({
      aggregateId: this.aggregateId,
      eventType: event.constructor.name,
      payload: event,
      version: this.version,
      timestamp: new Date(),
    }));
  }

  markEventsAsCommitted(): void {
    // Clear the uncommitted events from the base AggregateRoot
    this.commit();
  }

  protected emitEvent(eventType: string, payload: Record<string, unknown>): void {
    const nextVersion = this.version + 1;
    
    const event: DomainEvent = {
      aggregateId: this.aggregateId,
      eventType,
      payload: {
        ...payload,
        aggregateId: this.aggregateId,
        timestamp: new Date(),
      },
      version: nextVersion,
      timestamp: new Date(),
    };

    // Apply the event to update internal state
    this.applyEvent(event, true);
    
    // Track as uncommitted event for persistence
    this.apply(event);
    
    this.version = nextVersion;
  }

  protected abstract applyEvent(event: DomainEvent, isNew: boolean): void;
}