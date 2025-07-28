import { AccountResponse } from '@repo/shared-schemas';
import { AccountState } from '../../domain/aggregates/account.aggregate';

export class AccountMapper {
  static accountStateToResponseDto(accountState: AccountState): AccountResponse {
    return {
      id: accountState.id,
      coins: accountState.coins,
      createdAt: accountState.createdAt,
      updatedAt: accountState.updatedAt,
    };
  }

  static accountStatesToResponseDtos(accountStates: AccountState[]): AccountResponse[] {
    return accountStates.map(state => this.accountStateToResponseDto(state));
  }
}
