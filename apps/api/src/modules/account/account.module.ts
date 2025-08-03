import { Module } from '@nestjs/common';
import { AppCqrsModule } from '../cqrs/cqrs.module';
// Command Handlers
import { AddCoinsHandler } from './application/handlers/commands/add-coins.handler';
import { DeductCoinsHandler } from './application/handlers/commands/deduct-coins.handler';
import { TransferCoinsHandler } from './application/handlers/commands/transfer-coins.handler';
// Query Handlers
import { GetAccountCoinsHandler } from './application/handlers/queries/get-account-coins.handler';
import { GetAccountEventsHandler } from './application/handlers/queries/get-account-events.handler';
import { AccountCommandController } from './presentation/controllers/account-command.controller';
import { AccountQueryController } from './presentation/controllers/account-query.controller';

const CommandHandlers = [
  AddCoinsHandler,
  DeductCoinsHandler,
  TransferCoinsHandler,
];

const QueryHandlers = [
  GetAccountCoinsHandler,
  GetAccountEventsHandler,
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
