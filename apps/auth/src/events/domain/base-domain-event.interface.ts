export interface BaseDomainEvent {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventVersion: number;
  occurredAt: Date;
}

export interface DomainEventMetadata {
  userId?: string;
  correlationId?: string;
  causationId?: string;
  [key: string]: any;
}

export interface DomainEvent<T = any> extends BaseDomainEvent {
  eventData: T;
  metadata?: DomainEventMetadata;
}