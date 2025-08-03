export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InsufficientCoinsError extends DomainError {
  constructor(currentBalance: number, requestedAmount: number) {
    super(`Insufficient coins for operation. Current balance: ${currentBalance}, requested: ${requestedAmount}`);
  }
}

export class InvalidAmountError extends DomainError {
  constructor(amount: number, reason: string) {
    super(`Invalid amount ${amount}: ${reason}`);
  }
}

export class InvalidTransferError extends DomainError {
  constructor(reason: string) {
    super(`Invalid transfer: ${reason}`);
  }
}

export class AccountNotFoundError extends DomainError {
  constructor(accountId: string) {
    super(`Account ${accountId} does not exist`);
  }
}

export class SelfTransferError extends DomainError {
  constructor() {
    super('Cannot transfer coins to the same account');
  }
}

export class TransferTransactionError extends DomainError {
  constructor(reason: string) {
    super(`Transfer transaction failed: ${reason}`);
  }
}

export class ConcurrencyConflictError extends DomainError {
  constructor(aggregateId: string, expectedVersion: number, actualVersion: number) {
    super(`Concurrency conflict for aggregate ${aggregateId}: expected version ${expectedVersion}, but actual version is ${actualVersion}`);
  }
}