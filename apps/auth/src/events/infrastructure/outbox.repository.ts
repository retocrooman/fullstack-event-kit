import { Injectable } from '@nestjs/common';
import { OutboxEvent, OutboxEventStatus, Prisma } from '../../../node_modules/.prisma/auth-client';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainEvent } from '../domain';

@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: DomainEvent): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.create({
      data: {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData as Prisma.JsonObject,
        eventVersion: event.eventVersion,
        occurredAt: event.occurredAt,
        status: OutboxEventStatus.PENDING,
      },
    });
  }

  async saveMany(events: DomainEvent[]): Promise<number> {
    const result = await this.prisma.outboxEvent.createMany({
      data: events.map(event => ({
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        eventData: event.eventData as Prisma.JsonObject,
        eventVersion: event.eventVersion,
        occurredAt: event.occurredAt,
        status: OutboxEventStatus.PENDING,
      })),
    });
    return result.count;
  }

  async findPendingEvents(limit = 100): Promise<OutboxEvent[]> {
    return this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxEventStatus.PENDING,
        retryCount: { lt: 5 },
      },
      orderBy: [{ createdAt: 'asc' }],
      take: limit,
    });
  }

  async markAsProcessing(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.PROCESSING,
        processedAt: new Date(),
      },
    });
  }

  async markAsPublished(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async markAsFailed(id: string, error: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.FAILED,
        lastError: error,
        retryCount: { increment: 1 },
      },
    });
  }

  async markAsDeadLetter(id: string, error: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxEventStatus.DEAD_LETTER,
        lastError: error,
      },
    });
  }

  async findByAggregateId(
    aggregateId: string,
    aggregateType?: string,
  ): Promise<OutboxEvent[]> {
    return this.prisma.outboxEvent.findMany({
      where: {
        aggregateId,
        ...(aggregateType && { aggregateType }),
      },
      orderBy: [{ occurredAt: 'asc' }],
    });
  }

  async deletePublishedEvents(beforeDate: Date): Promise<number> {
    const result = await this.prisma.outboxEvent.deleteMany({
      where: {
        status: OutboxEventStatus.PUBLISHED,
        publishedAt: { lt: beforeDate },
      },
    });
    return result.count;
  }
}