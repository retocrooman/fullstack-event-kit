import { DomainError } from './domain-error';

export class InvalidAmountError extends DomainError {
  constructor(amount: number, reason: string) {
    super(`Invalid amount ${amount}: ${reason}`);
  }
}