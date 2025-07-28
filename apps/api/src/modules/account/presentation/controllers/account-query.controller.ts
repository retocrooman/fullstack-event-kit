import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AccountResponse } from '@repo/shared-schemas';
import { User } from '../../../../shared/decorators/user.decorator';
import { 
  GetAccountQuery, 
  GetAllAccountsQuery, 
  GetAccountsWithPaginationQuery,
  SearchAccountsByIdQuery,
  GetTopAccountsByCoinsQuery,
  GetAccountCountQuery,
  GetTotalCoinsQuery,
  DoesAccountExistQuery
} from '../../application/queries/account.queries';
import { AccountMapper } from '../mappers/account.mapper';

@Controller('accounts')
export class AccountQueryController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  async getCurrentUserAccount(@User() user: any): Promise<AccountResponse> {
    const accountId = user.sub; // Auth0 user ID

    // Always returns account (default state if no events exist)
    const query = GetAccountQuery.fromRequest({ accountId });
    const account = await this.queryBus.execute(query);

    return AccountMapper.accountStateToResponseDto(account);
  }

  @Get()
  async getAllAccounts(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const query = GetAccountsWithPaginationQuery.fromRequest({ page: pageNum, limit: limitNum });
      const result = await this.queryBus.execute(query);
      return {
        ...result,
        accounts: AccountMapper.accountStatesToResponseDtos(result.accounts),
      };
    }

    const query = GetAllAccountsQuery.fromRequest({});
    const accounts = await this.queryBus.execute(query);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('search')
  async searchAccounts(@Query('q') searchTerm: string): Promise<AccountResponse[]> {
    const query = SearchAccountsByIdQuery.fromRequest({ searchTerm });
    const accounts = await this.queryBus.execute(query);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('top')
  async getTopAccounts(@Query('limit') limit?: string): Promise<AccountResponse[]> {
    const limitNum = parseInt(limit || '10', 10);
    const query = GetTopAccountsByCoinsQuery.fromRequest({ limit: limitNum });
    const accounts = await this.queryBus.execute(query);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('stats')
  async getAccountStats() {
    const [totalAccounts, totalCoins] = await Promise.all([
      this.queryBus.execute(GetAccountCountQuery.fromRequest({})),
      this.queryBus.execute(GetTotalCoinsQuery.fromRequest({})),
    ]);

    return {
      totalAccounts,
      totalCoins,
      averageCoins: totalAccounts > 0 ? Math.round(totalCoins / totalAccounts) : 0,
    };
  }

  @Get(':id')
  async getAccountById(@Param('id') id: string): Promise<AccountResponse> {
    // Always returns account (default state if no events exist)
    const query = GetAccountQuery.fromRequest({ accountId: id });
    const account = await this.queryBus.execute(query);
    return AccountMapper.accountStateToResponseDto(account);
  }

  @Get(':id/exists')
  async checkAccountExists(@Param('id') id: string): Promise<{ exists: boolean }> {
    const query = DoesAccountExistQuery.fromRequest({ accountId: id });
    const exists = await this.queryBus.execute(query);
    return { exists };
  }
}