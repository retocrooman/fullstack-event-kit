import { Test, TestingModule } from '@nestjs/testing';
import { OutboxEventStatus } from '../../../node_modules/.prisma/auth-client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserCreatedEvent } from '../domain/user-created.event';
import { OutboxRepository } from './outbox.repository';

const mockPrismaService = {
  outboxEvent: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('OutboxRepository', () => {
  let repository: OutboxRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OutboxRepository>(OutboxRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a domain event to the outbox', async () => {
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

      const expectedOutboxEvent = {
        id: 'outbox-123',
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData,
        eventVersion: event.eventVersion,
        occurredAt: event.occurredAt,
        status: OutboxEventStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.outboxEvent.create.mockResolvedValue(expectedOutboxEvent as any);

      const result = await repository.save(event);

      expect(result).toEqual(expectedOutboxEvent);
      expect(mockPrismaService.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          occurredAt: event.occurredAt,
          status: OutboxEventStatus.PENDING,
        },
      });
    });
  });

  describe('saveMany', () => {
    it('should save multiple domain events to the outbox', async () => {
      const events = [
        new UserCreatedEvent('user-1', {
          userId: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          emailVerified: false,
          createdAt: new Date(),
        }),
        new UserCreatedEvent('user-2', {
          userId: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          emailVerified: true,
          createdAt: new Date(),
        }),
      ];

      mockPrismaService.outboxEvent.createMany.mockResolvedValue({ count: 2 });

      const result = await repository.saveMany(events);

      expect(result).toBe(2);
      expect(mockPrismaService.outboxEvent.createMany).toHaveBeenCalledWith({
        data: events.map(event => ({
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.eventData,
          eventVersion: event.eventVersion,
          occurredAt: event.occurredAt,
          status: OutboxEventStatus.PENDING,
        })),
      });
    });
  });

  describe('findPendingEvents', () => {
    it('should find pending events with retry count less than 5', async () => {
      const pendingEvents = [
        { id: '1', status: OutboxEventStatus.PENDING, retryCount: 0 },
        { id: '2', status: OutboxEventStatus.PENDING, retryCount: 2 },
      ];

      mockPrismaService.outboxEvent.findMany.mockResolvedValue(pendingEvents as any);

      const result = await repository.findPendingEvents(100);

      expect(result).toEqual(pendingEvents);
      expect(mockPrismaService.outboxEvent.findMany).toHaveBeenCalledWith({
        where: {
          status: OutboxEventStatus.PENDING,
          retryCount: { lt: 5 },
        },
        orderBy: [{ createdAt: 'asc' }],
        take: 100,
      });
    });
  });

  describe('markAsPublished', () => {
    it('should mark an event as published', async () => {
      const eventId = 'event-123';
      const publishedEvent = {
        id: eventId,
        status: OutboxEventStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      mockPrismaService.outboxEvent.update.mockResolvedValue(publishedEvent as any);

      const result = await repository.markAsPublished(eventId);

      expect(result).toEqual(publishedEvent);
      expect(mockPrismaService.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: {
          status: OutboxEventStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
      });
    });
  });

  describe('markAsFailed', () => {
    it('should mark an event as failed and increment retry count', async () => {
      const eventId = 'event-123';
      const error = 'Connection timeout';
      const failedEvent = {
        id: eventId,
        status: OutboxEventStatus.FAILED,
        lastError: error,
        retryCount: 1,
      };

      mockPrismaService.outboxEvent.update.mockResolvedValue(failedEvent as any);

      const result = await repository.markAsFailed(eventId, error);

      expect(result).toEqual(failedEvent);
      expect(mockPrismaService.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: {
          status: OutboxEventStatus.FAILED,
          lastError: error,
          retryCount: { increment: 1 },
        },
      });
    });
  });

  describe('deletePublishedEvents', () => {
    it('should delete published events older than specified date', async () => {
      const beforeDate = new Date('2024-01-01');
      mockPrismaService.outboxEvent.deleteMany.mockResolvedValue({ count: 5 });

      const result = await repository.deletePublishedEvents(beforeDate);

      expect(result).toBe(5);
      expect(mockPrismaService.outboxEvent.deleteMany).toHaveBeenCalledWith({
        where: {
          status: OutboxEventStatus.PUBLISHED,
          publishedAt: { lt: beforeDate },
        },
      });
    });
  });
});