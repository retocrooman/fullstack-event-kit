import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('accounts - queries')
@ApiBearerAuth()
@Controller('accounts')
export class AccountQueryController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user account (returns default state if no events exist)' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        coins: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getCurrentUserAccount(@User() user: any): Promise<AccountResponse> {
    const accountId = user.sub; // Auth0 user ID

    // Always returns account (default state if no events exist)
    const query = GetAccountQuery.fromRequest({ accountId });
    const account = await this.queryBus.execute(query);

    return AccountMapper.accountStateToResponseDto(account);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          coins: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Search accounts by ID' })
  @ApiQuery({ name: 'q', required: true, type: 'string', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          coins: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async searchAccounts(@Query('q') searchTerm: string): Promise<AccountResponse[]> {
    const query = SearchAccountsByIdQuery.fromRequest({ searchTerm });
    const accounts = await this.queryBus.execute(query);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top accounts by coins' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Number of accounts to return' })
  @ApiResponse({
    status: 200,
    description: 'Top accounts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          coins: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getTopAccounts(@Query('limit') limit?: string): Promise<AccountResponse[]> {
    const limitNum = parseInt(limit || '10', 10);
    const query = GetTopAccountsByCoinsQuery.fromRequest({ limit: limitNum });
    const accounts = await this.queryBus.execute(query);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get account statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAccounts: { type: 'number' },
        totalCoins: { type: 'number' },
        averageCoins: { type: 'number' },
      },
    },
  })
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
  @ApiOperation({ summary: 'Get account by ID (returns default state if no events exist)' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        coins: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getAccountById(@Param('id') id: string): Promise<AccountResponse> {
    // Always returns account (default state if no events exist)
    const query = GetAccountQuery.fromRequest({ accountId: id });
    const account = await this.queryBus.execute(query);
    return AccountMapper.accountStateToResponseDto(account);
  }

  @Get(':id/exists')
  @ApiOperation({ summary: 'Check if account exists' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Account existence check result',
    schema: { type: 'object', properties: { exists: { type: 'boolean' } } },
  })
  async checkAccountExists(@Param('id') id: string): Promise<{ exists: boolean }> {
    const query = DoesAccountExistQuery.fromRequest({ accountId: id });
    const exists = await this.queryBus.execute(query);
    return { exists };
  }
}