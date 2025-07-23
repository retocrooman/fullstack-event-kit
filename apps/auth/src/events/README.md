# Event Outbox Pattern Implementation

This module implements the transactional outbox pattern for reliable event publishing in the auth service.

## Overview

The outbox pattern ensures that domain events are reliably published even in the face of failures. When a user is created, the event is first saved to an outbox table in the same database transaction, then asynchronously published to external systems.

## Architecture

### Components

1. **Domain Events** (`domain/`)
   - `UserCreatedEvent`: Published when a new user registers
   - Base interfaces for all domain events

2. **Infrastructure** (`infrastructure/`)
   - `OutboxRepository`: Handles persistence of events to the outbox table

3. **Services** (`services/`)
   - `EventPublisherService`: Publishes events to message bus (TCP by default)
   - `OutboxProcessorService`: Background job that processes pending events

### Database Schema

```prisma
model OutboxEvent {
  id            String            @id @default(cuid())
  aggregateId   String
  aggregateType String
  eventType     String
  eventData     Json
  eventVersion  Int               @default(1)
  occurredAt    DateTime
  processedAt   DateTime?
  publishedAt   DateTime?
  retryCount    Int               @default(0)
  lastError     String?
  status        OutboxEventStatus @default(PENDING)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([status, createdAt])
  @@index([aggregateId, aggregateType])
  @@map("outbox_event")
}

enum OutboxEventStatus {
  PENDING
  PROCESSING
  PUBLISHED
  FAILED
  DEAD_LETTER
}
```

## Usage

### Publishing Events

When a user registers, the auth service automatically publishes a `UserCreatedEvent`:

```typescript
const userCreatedEvent = new UserCreatedEvent(
  user.id,
  {
    userId: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  },
  {
    source: 'auth-service',
    action: 'user.register',
  },
);

await this.eventPublisher.publishEvent(userCreatedEvent);
```

### Event Processing

The `OutboxProcessorService` runs in the background and:
1. Polls for pending events every 5 seconds (configurable)
2. Attempts to publish events to the message bus
3. Retries failed events up to 5 times
4. Moves events to dead letter queue after max retries
5. Cleans up old published events periodically

### Configuration

Environment variables:
- `NATS_HOST`: NATS server host (default: localhost)
- `NATS_PORT`: NATS server port (default: 4222)
- `OUTBOX_PROCESSING_INTERVAL_MS`: How often to process events (default: 5000ms)
- `OUTBOX_CLEANUP_INTERVAL_MS`: How often to clean old events (default: 3600000ms)
- `OUTBOX_RETENTION_DAYS`: How long to keep published events (default: 7 days)

#### NATS Server

The system uses NATS as the message bus for reliable event delivery. NATS is configured with:
- **JetStream** enabled for persistence and replay
- **Queue subscription** for load balancing across consumers
- **Monitoring** available at http://localhost:8222

## Event Flow

1. User registers → Transaction begins
2. User saved to database
3. Event saved to outbox table
4. Transaction commits
5. Background processor picks up event
6. Event published to message bus
7. Event marked as published

## Reliability Guarantees

- **At-least-once delivery**: Events may be delivered multiple times
- **Ordering**: Events are processed in order of occurrence
- **Failure handling**: Automatic retries with exponential backoff
- **Dead letter queue**: Failed events are preserved for manual inspection

## Event Consumption

Other services can consume auth events by subscribing to NATS. See `examples/nats-consumer.example.ts` for a complete implementation example.

Key points for consumers:
- Use queue groups for load balancing
- Handle errors gracefully with retry logic
- Acknowledge messages after successful processing
- Implement idempotency to handle duplicate events

## Testing

The module includes comprehensive unit tests for:
- Event persistence
- Event publishing
- Failure scenarios
- Background processing

Run tests with: `pnpm test src/events`