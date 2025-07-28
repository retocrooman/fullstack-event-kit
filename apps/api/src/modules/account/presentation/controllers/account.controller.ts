import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../../../../shared/decorators/user.decorator';
import { AccountCommandService } from '../../application/commands/account-command.service';
import { AccountQueryService } from '../../application/queries/account-query.service';
import { AccountResponseDto } from '../dto/account-response.dto';
import { TransferCoinsDto } from '../dto/transfer-coins.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { AccountMapper } from '../mappers/account.mapper';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly queryService: AccountQueryService,
    private readonly commandService: AccountCommandService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user account (returns default state if no events exist)' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    type: AccountResponseDto,
  })
  async getCurrentUserAccount(@User() user: any): Promise<AccountResponseDto> {
    const accountId = user.sub; // Auth0 user ID

    // Always returns account (default state if no events exist)
    const account = await this.queryService.getAccountById(accountId);

    return AccountMapper.accountStateToResponseDto(account);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
    type: [AccountResponseDto],
  })
  async getAllAccounts(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const result = await this.queryService.getAccountsWithPagination(pageNum, limitNum);
      return {
        ...result,
        accounts: AccountMapper.accountStatesToResponseDtos(result.accounts),
      };
    }

    const accounts = await this.queryService.getAllAccounts();
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search accounts by ID' })
  @ApiQuery({ name: 'q', required: true, type: 'string', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [AccountResponseDto],
  })
  async searchAccounts(@Query('q') searchTerm: string): Promise<AccountResponseDto[]> {
    const accounts = await this.queryService.searchAccountsById(searchTerm);
    return AccountMapper.accountStatesToResponseDtos(accounts);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top accounts by coins' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Number of accounts to return' })
  @ApiResponse({
    status: 200,
    description: 'Top accounts retrieved successfully',
    type: [AccountResponseDto],
  })
  async getTopAccounts(@Query('limit') limit?: string): Promise<AccountResponseDto[]> {
    const limitNum = parseInt(limit || '10', 10);
    const accounts = await this.queryService.getTopAccountsByCoins(limitNum);
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
      this.queryService.getAccountCount(),
      this.queryService.getTotalCoins(),
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
    type: AccountResponseDto,
  })
  async getAccountById(@Param('id') id: string): Promise<AccountResponseDto> {
    // Always returns account (default state if no events exist)
    const account = await this.queryService.getAccountById(id);
    return AccountMapper.accountStateToResponseDto(account);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account coins' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateAccount(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    if (updateAccountDto.coins !== undefined) {
      await this.commandService.setCoins(id, updateAccountDto.coins);
    }

    return { success: true };
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer coins from current user to another account' })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        transferId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Invalid transfer' })
  async transferCoins(@User() user: any, @Body() transferCoinsDto: TransferCoinsDto) {
    const fromAccountId = user.sub; // Current user's Auth0 ID

    if (fromAccountId === transferCoinsDto.toAccountId) {
      throw new Error('Cannot transfer coins to the same account');
    }

    await this.commandService.transferCoins(fromAccountId, transferCoinsDto.toAccountId, transferCoinsDto.amount);

    return {
      success: true,
      transferId: `transfer_${Date.now()}_${fromAccountId}_${transferCoinsDto.toAccountId}`,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(@Param('id') id: string) {
    await this.commandService.deleteAccount(id);
    return { success: true };
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
    const exists = await this.queryService.doesAccountExistInDatabase(id);
    return { exists };
  }
}
