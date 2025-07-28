import { AccountState } from '../../domain/aggregates/account.aggregate';
import { AccountResponseDto } from '../dto/account-response.dto';

export class AccountMapper {
  static accountStateToResponseDto(accountState: AccountState): AccountResponseDto {
    return {
      id: accountState.id,
      coins: accountState.coins,
      createdAt: accountState.createdAt,
      updatedAt: accountState.updatedAt,
    };
  }

  static accountStatesToResponseDtos(accountStates: AccountState[]): AccountResponseDto[] {
    return accountStates.map(state => this.accountStateToResponseDto(state));
  }
}
