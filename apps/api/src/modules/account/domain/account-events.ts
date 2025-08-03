// Domain Events for Account
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

export type AccountDomainEvent = 
  | CoinsAddedEvent
  | CoinsDeductedEvent
  | CoinsTransferredEvent;