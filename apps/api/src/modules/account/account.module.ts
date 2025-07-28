import { Module } from '@nestjs/common';
import { AppCqrsModule } from '../cqrs/cqrs.module';
// Command Handlers
import { AddCoinsHandler } from './application/handlers/commands/add-coins.handler';
import { CreateAccountHandler } from './application/handlers/commands/create-account.handler';
import { DeductCoinsHandler } from './application/handlers/commands/deduct-coins.handler';
import { DeleteAccountHandler } from './application/handlers/commands/delete-account.handler';
import { SetCoinsHandler } from './application/handlers/commands/set-coins.handler';
import { TransferCoinsHandler } from './application/handlers/commands/transfer-coins.handler';
// Query Handlers
import { DoesAccountExistHandler } from './application/handlers/queries/does-account-exist.handler';
import { GetAccountCountHandler } from './application/handlers/queries/get-account-count.handler';
import { GetAccountHandler } from './application/handlers/queries/get-account.handler';
import { GetAccountsWithPaginationHandler } from './application/handlers/queries/get-accounts-with-pagination.handler';
import { GetAllAccountsHandler } from './application/handlers/queries/get-all-accounts.handler';
import { GetTopAccountsByCoinsHandler } from './application/handlers/queries/get-top-accounts-by-coins.handler';
import { GetTotalCoinsHandler } from './application/handlers/queries/get-total-coins.handler';
import { SearchAccountsByIdHandler } from './application/handlers/queries/search-accounts-by-id.handler';
import { AccountCommandController } from './presentation/controllers/account-command.controller';
import { AccountQueryController } from './presentation/controllers/account-query.controller';

const CommandHandlers = [
  CreateAccountHandler,
  AddCoinsHandler,
  DeductCoinsHandler,
  SetCoinsHandler,
  TransferCoinsHandler,
  DeleteAccountHandler,
];

const QueryHandlers = [
  GetAccountHandler,
  GetAllAccountsHandler,
  GetAccountsWithPaginationHandler,
  SearchAccountsByIdHandler,
  GetTopAccountsByCoinsHandler,
  GetAccountCountHandler,
  GetTotalCoinsHandler,
  DoesAccountExistHandler,
];

@Module({
  imports: [AppCqrsModule],
  controllers: [AccountQueryController, AccountCommandController],
  providers: [
    // Command and Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class AccountModule {}
