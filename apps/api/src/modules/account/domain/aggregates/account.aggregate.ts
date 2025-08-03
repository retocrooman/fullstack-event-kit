import { ConflictException } from '@nestjs/common';
import { BaseAggregate, DomainEvent } from '../../../cqrs/base/base.aggregate';
import {
  AccountDeletedError,
  AccountNotFoundError,
  InsufficientCoinsError,
  InvalidAmountError,
  InvalidTransferError,
} from '../errors';

export interface AccountState {
  id: string;
  coins: number;
  isDeleted: boolean;
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

  get isDeleted(): boolean {
    return this.accountState?.isDeleted || false;
  }

  get coins(): number {
    return this.accountState?.coins || 0;
  }

  // Command Handlers
  CreateAccount(payload: { accountId: string; initialCoins?: number }) {
    if (this.accountState) {
      throw new ConflictException(`Account ${payload.accountId} already exists`);
    }

    this.emitEvent('AccountCreated', {
      accountId: payload.accountId,
      initialCoins: payload.initialCoins || 0,
      timestamp: new Date(),
    });
  }

  AddCoins(payload: { accountId: string; amount: number }) {
    // Auto-create account if it doesn't exist
    if (!this.accountState) {
      this.emitEvent('AccountCreated', {
        accountId: payload.accountId,
        initialCoins: 0,
        timestamp: new Date(),
      });
    }

    this._ensureAccountNotDeleted();

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
    // Auto-create account if it doesn't exist
    if (!this.accountState) {
      this.emitEvent('AccountCreated', {
        accountId: payload.accountId,
        initialCoins: 100, // Default initial coins
        timestamp: new Date(),
      });
    }

    this._ensureAccountNotDeleted();

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

  SetCoins(payload: { accountId: string; coins: number }) {
    // Auto-create account if it doesn't exist
    if (!this.accountState) {
      this.emitEvent('AccountCreated', {
        accountId: payload.accountId,
        initialCoins: 0,
        timestamp: new Date(),
      });
    }

    this._ensureAccountNotDeleted();

    if (payload.coins < 0) {
      throw new InvalidAmountError(payload.coins, 'cannot be negative');
    }

    const previousBalance = this.coins;
    if (previousBalance === payload.coins) {
      return; // No change needed
    }

    this.emitEvent('CoinsSet', {
      accountId: payload.accountId,
      previousBalance,
      newBalance: payload.coins,
      timestamp: new Date(),
    });
  }

  TransferCoins(payload: { fromAccountId: string; toAccountId: string; amount: number }) {
    // For transfers, account must exist - cannot transfer from non-existent account
    if (!this.accountState || this.accountState.id !== payload.fromAccountId) {
      throw new AccountNotFoundError(payload.fromAccountId);
    }

    this._ensureAccountNotDeleted();

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

  DeleteAccount(payload: { accountId: string }) {
    // Cannot delete non-existent account
    if (!this.accountState || this.accountState.id !== payload.accountId) {
      throw new AccountNotFoundError(payload.accountId);
    }

    this._ensureAccountNotDeleted();

    const finalBalance = this.coins;
    this.emitEvent('AccountDeleted', {
      accountId: payload.accountId,
      finalBalance,
      timestamp: new Date(),
    });
  }

  // Event Handlers (State Mutations)
  AccountCreated(event: any) {
    this.state = {
      id: event.accountId,
      coins: event.initialCoins || 0,
      isDeleted: false,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
    };
  }

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

  CoinsSet(event: any) {
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

  AccountDeleted(event: any) {
    if (!this.state) return;

    this.state = {
      ...this.state,
      isDeleted: true,
      updatedAt: event.timestamp,
    };
  }

  private _ensureAccountNotDeleted() {
    if (this.isDeleted) {
      throw new AccountDeletedError();
    }
  }

  protected applyEvent(event: DomainEvent, isNew: boolean): void {
    switch (event.eventType) {
      case 'AccountCreated':
        this.AccountCreated(event.payload || event);
        break;
      case 'CoinsAdded':
        this.CoinsAdded(event.payload || event);
        break;
      case 'CoinsDeducted':
        this.CoinsDeducted(event.payload || event);
        break;
      case 'CoinsSet':
        this.CoinsSet(event.payload || event);
        break;
      case 'CoinsTransferred':
        this.CoinsTransferred(event.payload || event);
        break;
      case 'AccountDeleted':
        this.AccountDeleted(event.payload || event);
        break;
      default:
        console.warn(`Unknown event type: ${event.eventType}`);
    }
  }
}
