export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AccountDeletedError extends DomainError {
  constructor() {
    super('Cannot operate on deleted account');
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