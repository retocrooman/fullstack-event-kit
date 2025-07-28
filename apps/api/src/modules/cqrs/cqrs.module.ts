import { Module, Global } from '@nestjs/common';
import { ContainerBuilder, InMemoryEventStorage } from 'node-cqrs';
import { PrismaService } from '../../prisma.service';
import { AccountAggregate } from '../account/domain/aggregates/account.aggregate';
import { CommandBusService } from './services/command-bus.service';
import { EventStoreService } from './services/event-store.service';
import { QueryBusService } from './services/query-bus.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'CQRS_CONTAINER',
      useFactory: (prismaService: PrismaService) => {
        console.log('[Shared CQRS] Building global container...');
        const containerBuilder = new ContainerBuilder();

        // Register event storage - node-cqrs automatically registers EventStore and CommandBus
        (containerBuilder as any).register(InMemoryEventStorage).as('storage');

        // Register aggregates
        containerBuilder.registerAggregate(AccountAggregate);

        // Build and return the container
        const container = (containerBuilder as any).container();
        console.log('[Shared CQRS] Global container built successfully');
        console.log('[Shared CQRS] Container has eventStore:', !!container.eventStore);
        console.log('[Shared CQRS] Container has commandBus:', !!container.commandBus);

        return container;
      },
      inject: [PrismaService],
    },
    CommandBusService,
    QueryBusService,
    EventStoreService,
  ],
  exports: ['CQRS_CONTAINER', CommandBusService, QueryBusService, EventStoreService, PrismaService],
})
export class CQRSModule {}
