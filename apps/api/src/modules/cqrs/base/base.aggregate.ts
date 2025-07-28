import { AbstractAggregate } from 'node-cqrs';

export abstract class BaseAggregate extends AbstractAggregate {
  protected aggregateId: string;

  constructor(options: any) {
    super(options);
    this.aggregateId = options?.aggregateId || '';
  }

  getId(): string {
    return this.aggregateId;
  }

  protected emit(eventType: string, payload: any): void {
    super.emit(eventType, {
      ...payload,
      aggregateId: this.aggregateId,
      timestamp: new Date(),
    });
  }
}