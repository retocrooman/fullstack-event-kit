import { DomainEvent } from './base-domain-event.interface';

export const USER_CREATED_EVENT_TYPE = 'auth.user.created';

export interface UserCreatedEventData {
  userId: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export class UserCreatedEvent implements DomainEvent<UserCreatedEventData> {
  public readonly aggregateType = 'User';
  public readonly eventType = USER_CREATED_EVENT_TYPE;
  public readonly eventVersion = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserCreatedEventData,
    public readonly metadata?: Record<string, any>,
  ) {
    this.occurredAt = new Date();
  }
}