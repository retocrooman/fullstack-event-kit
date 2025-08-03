import { BaseAggregate, DomainEvent } from '../../../cqrs/base/base.aggregate';
import {
  AccountNotFoundError,
  InsufficientCoinsError,
  InvalidAmountError,
  InvalidTransferError,
} from '../account-errors';

export interface AccountState {
  id: string;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AccountAggregate extends BaseAggregate {
  private state: AccountState | null = null;

  constructor(id: string) {
    super(id);
  }

  get accountState(): AccountState | null {
    return this.state;
  }


  get coins(): number {
    return this.accountState?.coins || 0;
  }

  private _ensureAccountExists(accountId: string): void {
    if (!this.accountState) {
      this.state = {
        id: accountId,
        coins: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // Command Handlers
  AddCoins(payload: { accountId: string; amount: number }) {
    this._ensureAccountExists(payload.accountId);

    if (payload.amount <= 0) {
      throw new InvalidAmountError(payload.amount, 'must be positive');
    }

    const previousBalance = this.coins;
    this.emitEvent('CoinsAdded', {
      accountId: payload.accountId,
      amount: payload.amount,
      previousBalance,
      newBalance: previousBalance + payload.amount,
      timestamp: new Date(),
    });
  }

  DeductCoins(payload: { accountId: string; amount: number }) {
    this._ensureAccountExists(payload.accountId);

    if (payload.amount <= 0) {
      throw new InvalidAmountError(payload.amount, 'must be positive');
    }

    const previousBalance = this.coins;
    if (previousBalance < payload.amount) {
      throw new InsufficientCoinsError(previousBalance, payload.amount);
    }

    this.emitEvent('CoinsDeducted', {
      accountId: payload.accountId,
      amount: payload.amount,
      previousBalance,
      newBalance: previousBalance - payload.amount,
      timestamp: new Date(),
    });
  }

  TransferCoins(payload: { fromAccountId: string; toAccountId: string; amount: number }) {
    // For transfers, FROM account must exist - cannot transfer from non-existent account
    if (!this.accountState) {
      throw new AccountNotFoundError(payload.fromAccountId);
    }

    if (payload.amount <= 0) {
      throw new InvalidTransferError('amount must be positive');
    }

    const currentBalance = this.coins;
    if (currentBalance < payload.amount) {
      throw new InsufficientCoinsError(currentBalance, payload.amount);
    }

    this.emitEvent('CoinsTransferred', {
      fromAccountId: payload.fromAccountId,
      toAccountId: payload.toAccountId,
      amount: payload.amount,
      timestamp: new Date(),
    });
  }

  // Event Handlers (State Mutations)
  CoinsAdded(event: any) {
    if (!this.state) return;

    this.state = {
      ...this.state,
      coins: event.newBalance,
      updatedAt: event.timestamp,
    };
  }

  CoinsDeducted(event: any) {
    if (!this.state) return;

    this.state = {
      ...this.state,
      coins: event.newBalance,
      updatedAt: event.timestamp,
    };
  }

  CoinsTransferred(event: any) {
    if (!this.state) return;

    // Only update the FROM account state in this aggregate
    if (this.state.id === event.fromAccountId) {
      this.state = {
        ...this.state,
        coins: this.state.coins - event.amount,
        updatedAt: event.timestamp,
      };
    }
  }


  protected applyEvent(event: DomainEvent, isNew: boolean): void {
    switch (event.eventType) {
      case 'CoinsAdded':
        this.CoinsAdded(event.payload || event);
        break;
      case 'CoinsDeducted':
        this.CoinsDeducted(event.payload || event);
        break;
      case 'CoinsTransferred':
        this.CoinsTransferred(event.payload || event);
        break;
      default:
        console.warn(`Unknown event type: ${event.eventType}`);
    }
  }
}
