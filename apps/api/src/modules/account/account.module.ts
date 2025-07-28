import { Module } from '@nestjs/common';
import { EventSourcingModule } from '../event-sourcing/event-sourcing.module';
import { AccountCommandService } from './application/commands/account-command.service';
import { AccountQueryService } from './application/queries/account-query.service';
import { AccountController } from './presentation/controllers/account.controller';

@Module({
  imports: [EventSourcingModule],
  controllers: [AccountController],
  providers: [
    // Event Sourcing Services
    AccountCommandService,
    AccountQueryService,
  ],
  exports: [
    // Export Event Sourcing services for other modules if needed
    AccountCommandService,
    AccountQueryService,
  ],
})
export class AccountModule {}
