import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxEventStatus } from '../../../node_modules/.prisma/auth-client';
import { UserCreatedEvent } from '../domain/user-created.event';
import { OutboxRepository } from '../infrastructure/outbox.repository';
import { EventPublisherService } from './event-publisher.service';

const mockOutboxRepository = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findPendingEvents: jest.fn(),
  markAsProcessing: jest.fn(),
  markAsPublished: jest.fn(),
  markAsFailed: jest.fn(),
  markAsDeadLetter: jest.fn(),
  deletePublishedEvents: jest.fn(),
};

const mockClient = {
  emit: jest.fn().mockReturnValue({
    toPromise: jest.fn().mockResolvedValue(undefined),
  }),
};

jest.mock('@nestjs/microservices', () => {
  const actual = jest.requireActual('@nestjs/microservices');
  return {
    ...actual,
    ClientProxyFactory: {
      create: jest.fn(() => mockClient),
    },
  };
});

describe('EventPublisherService', () => {
  let service: EventPublisherService;
  let outboxRepository: jest.Mocked<OutboxRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventPublisherService,
          useFactory: (repo: OutboxRepository) => {
            return new EventPublisherService(repo, {
              transport: Transport.NATS,
              options: {
                servers: ['nats://localhost:4222'],
                queue: 'auth-events-queue',
              },
            });
          },
          inject: [OutboxRepository],
        },
        {
          provide: OutboxRepository,
          useValue: mockOutboxRepository,
        },
      ],
    }).compile();

    service = module.get<EventPublisherService>(EventPublisherService);
    outboxRepository = module.get(OutboxRepository);
    
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishEvent', () => {
    it('should save event to outbox and process it', async () => {
      const event = new UserCreatedEvent(
        'user-123',
        {
          userId: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: false,
          createdAt: new Date(),
        },
      );

      const outboxEvent = {
        id: 'outbox-123',
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData,
        eventVersion: event.eventVersion,
        occurredAt: event.occurredAt,
        status: OutboxEventStatus.PENDING,
        retryCount: 0,
      };

      mockOutboxRepository.save.mockResolvedValue(outboxEvent as any);
      mockOutboxRepository.markAsProcessing.mockResolvedValue({ ...outboxEvent, status: OutboxEventStatus.PROCESSING } as any);
      mockOutboxRepository.markAsPublished.mockResolvedValue({ ...outboxEvent, status: OutboxEventStatus.PUBLISHED } as any);

      await service.publishEvent(event);

      expect(mockOutboxRepository.save).toHaveBeenCalledWith(event);
      expect(mockOutboxRepository.markAsProcessing).toHaveBeenCalledWith('outbox-123');
      expect(mockClient.emit).toHaveBeenCalledWith(event.eventType, {
        id: outboxEvent.id,
        aggregateId: outboxEvent.aggregateId,
        aggregateType: outboxEvent.aggregateType,
        eventType: outboxEvent.eventType,
        eventData: outboxEvent.eventData,
        eventVersion: outboxEvent.eventVersion,
        occurredAt: outboxEvent.occurredAt,
      });
      expect(mockOutboxRepository.markAsPublished).toHaveBeenCalledWith('outbox-123');
    });

    it('should handle publish failure and mark as failed', async () => {
      const event = new UserCreatedEvent('user-123', {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date(),
      });

      const outboxEvent = {
        id: 'outbox-123',
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData,
        eventVersion: event.eventVersion,
        occurredAt: event.occurredAt,
        status: OutboxEventStatus.PENDING,
        retryCount: 0,
      };

      mockOutboxRepository.save.mockResolvedValue(outboxEvent as any);
      mockOutboxRepository.markAsProcessing.mockResolvedValue({ ...outboxEvent, status: OutboxEventStatus.PROCESSING } as any);
      
      const error = new Error('Connection failed');
      mockClient.emit.mockReturnValue({
        toPromise: jest.fn().mockRejectedValue(error),
      });

      await service.publishEvent(event);

      expect(mockOutboxRepository.markAsFailed).toHaveBeenCalledWith('outbox-123', 'Connection failed');
    });
  });

  describe('processPendingEvents', () => {
    it('should process all pending events', async () => {
      const pendingEvents = [
        {
          id: 'event-1',
          aggregateId: 'user-1',
          aggregateType: 'User',
          eventType: 'auth.user.created',
          eventData: { userId: 'user-1' },
          eventVersion: 1,
          occurredAt: new Date(),
          status: OutboxEventStatus.PENDING,
          retryCount: 0,
        },
        {
          id: 'event-2',
          aggregateId: 'user-2',
          aggregateType: 'User',
          eventType: 'auth.user.created',
          eventData: { userId: 'user-2' },
          eventVersion: 1,
          occurredAt: new Date(),
          status: OutboxEventStatus.PENDING,
          retryCount: 1,
        },
      ];

      // Reset mock to successful emit
      mockClient.emit.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(undefined),
      });

      mockOutboxRepository.findPendingEvents.mockResolvedValue(pendingEvents as any);
      mockOutboxRepository.markAsProcessing.mockImplementation((id) => 
        Promise.resolve({ ...pendingEvents.find(e => e.id === id), status: OutboxEventStatus.PROCESSING } as any)
      );
      mockOutboxRepository.markAsPublished.mockImplementation((id) => 
        Promise.resolve({ ...pendingEvents.find(e => e.id === id), status: OutboxEventStatus.PUBLISHED } as any)
      );

      await service.processPendingEvents();

      expect(mockOutboxRepository.findPendingEvents).toHaveBeenCalled();
      expect(mockOutboxRepository.markAsProcessing).toHaveBeenCalledTimes(2);
      expect(mockClient.emit).toHaveBeenCalledTimes(2);
      expect(mockOutboxRepository.markAsPublished).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanupPublishedEvents', () => {
    it('should cleanup old published events', async () => {
      mockOutboxRepository.deletePublishedEvents.mockResolvedValue(10);

      const result = await service.cleanupPublishedEvents(7);

      expect(result).toBe(10);
      expect(mockOutboxRepository.deletePublishedEvents).toHaveBeenCalledWith(
        expect.any(Date)
      );
    });
  });
});