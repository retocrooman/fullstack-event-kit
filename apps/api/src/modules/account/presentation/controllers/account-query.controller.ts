import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { User } from '../../../../shared/decorators/user.decorator';
import { 
  GetAccountCoinsQuery,
  GetAccountEventsQuery
} from '../../application/queries/account.queries';

@Controller('accounts')
export class AccountQueryController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me/coins')
  async getCurrentUserCoins(@User() user: any) {
    const accountId = user.sub; // Auth0 user ID
    const query = GetAccountCoinsQuery.fromRequest({ accountId });
    return await this.queryBus.execute(query);
  }

  @Get('me/events')
  async getCurrentUserEvents(@User() user: any) {
    const accountId = user.sub; // Auth0 user ID
    const query = GetAccountEventsQuery.fromRequest({ accountId });
    return await this.queryBus.execute(query);
  }

  @Get(':id/coins')
  async getAccountCoins(@Param('id') id: string) {
    const query = GetAccountCoinsQuery.fromRequest({ accountId: id });
    return await this.queryBus.execute(query);
  }

  @Get(':id/events')
  async getAccountEvents(@Param('id') id: string) {
    const query = GetAccountEventsQuery.fromRequest({ accountId: id });
    return await this.queryBus.execute(query);
  }
}