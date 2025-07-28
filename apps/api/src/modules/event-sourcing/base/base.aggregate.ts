import { EventEmitter } from 'events';

export interface DomainEvent {
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly version: number;
  readonly timestamp: Date;
}

export abstract class BaseAggregate extends EventEmitter {
  protected readonly aggregateId: string;
  private version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

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

  getUncommittedEvents(): readonly DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
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
    
    // Track as uncommitted
    this.uncommittedEvents.push(event);
    this.version = nextVersion;
    
    // Emit for any listeners
    this.emit(eventType, event);
  }

  protected abstract applyEvent(event: DomainEvent, isNew: boolean): void;
}