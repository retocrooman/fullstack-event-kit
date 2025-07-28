import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { eventStoreProvider } from './providers/event-store.provider';
import { EventStoreService } from './services/event-store.service';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    eventStoreProvider,
    EventStoreService,
  ],
  exports: [
    CqrsModule,
    'EVENT_STORE',
    EventStoreService,
  ],
})
export class AppCqrsModule {}