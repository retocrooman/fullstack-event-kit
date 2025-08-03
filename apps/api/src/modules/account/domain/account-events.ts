// Domain Events for Account
export interface AccountCreatedEvent {
  type: 'AccountCreated';
  aggregateId: string;
  payload: {
    accountId: string;
    initialCoins: number;
    timestamp: Date;
  };
}

export interface CoinsAddedEvent {
  type: 'CoinsAdded';
  aggregateId: string;
  payload: {
    accountId: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    timestamp: Date;
  };
}

export interface CoinsDeductedEvent {
  type: 'CoinsDeducted';
  aggregateId: string;
  payload: {
    accountId: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    timestamp: Date;
  };
}

export interface CoinsSetEvent {
  type: 'CoinsSet';
  aggregateId: string;
  payload: {
    accountId: string;
    previousBalance: number;
    newBalance: number;
    timestamp: Date;
  };
}

export interface CoinsTransferredEvent {
  type: 'CoinsTransferred';
  aggregateId: string;
  payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    timestamp: Date;
  };
}

export interface AccountDeletedEvent {
  type: 'AccountDeleted';
  aggregateId: string;
  payload: {
    accountId: string;
    finalBalance: number;
    timestamp: Date;
  };
}

export type AccountDomainEvent = 
  | AccountCreatedEvent
  | CoinsAddedEvent
  | CoinsDeductedEvent
  | CoinsSetEvent
  | CoinsTransferredEvent
  | AccountDeletedEvent;