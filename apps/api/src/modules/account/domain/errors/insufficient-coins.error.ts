import { DomainError } from './domain-error';

export class InsufficientCoinsError extends DomainError {
  constructor(currentBalance: number, requestedAmount: number) {
    super(`Insufficient coins for operation. Current balance: ${currentBalance}, requested: ${requestedAmount}`);
  }
}