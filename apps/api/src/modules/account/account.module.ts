import { Module } from '@nestjs/common';
import { CQRSModule } from '../cqrs/cqrs.module';
import { AccountCommandService } from './application/commands/account-command.service';
import { AccountQueryService } from './application/queries/account-query.service';
import { AccountController } from './presentation/controllers/account.controller';

@Module({
  imports: [CQRSModule],
  controllers: [AccountController],
  providers: [
    // CQRS Services
    AccountCommandService,
    AccountQueryService,
  ],
  exports: [
    // Export CQRS services for other modules if needed
    AccountCommandService,
    AccountQueryService,
  ],
})
export class AccountModule {}
