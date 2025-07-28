import { DomainError } from './domain-error';

export class AccountDeletedError extends DomainError {
  constructor() {
    super('Cannot operate on deleted account');
  }
}