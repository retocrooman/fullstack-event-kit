import { DomainError } from './domain-error';

export class InvalidTransferError extends DomainError {
  constructor(reason: string) {
    super(`Invalid transfer: ${reason}`);
  }
}