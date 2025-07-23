/**
 * Example NATS event consumer for processing auth domain events
 * 
 * This file demonstrates how other services (like the API server)
 * can consume events published by the auth service.
 */

import { Logger } from '@nestjs/common';
import { NatsConnection, connect, JSONCodec } from 'nats';

interface DomainEventMessage {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: any;
  eventVersion: number;
  occurredAt: string;
}

export class AuthEventConsumer {
  private readonly logger = new Logger(AuthEventConsumer.name);
  private connection!: NatsConnection;
  private readonly codec = JSONCodec<DomainEventMessage>();

  async connect(): Promise<void> {
    try {
      this.connection = await connect({
        servers: [`nats://${process.env.NATS_HOST || 'localhost'}:${process.env.NATS_PORT || '4222'}`],
      });
      
      this.logger.log('Connected to NATS server');
    } catch (error) {
      this.logger.error('Failed to connect to NATS', error);
      throw error;
    }
  }

  async subscribeToUserEvents(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not connected to NATS. Call connect() first.');
    }

    // Subscribe to user creation events with queue group for load balancing
    const subscription = this.connection.subscribe('auth.user.created', {
      queue: 'api-user-events-queue',
    });

    this.logger.log('Subscribed to auth.user.created events');

    // Process messages
    for await (const message of subscription) {
      try {
        const event = this.codec.decode(message.data);
        await this.handleUserCreatedEvent(event);
        
        // Acknowledge successful processing
        message.respond();
      } catch (error) {
        this.logger.error('Failed to process user created event', error);
        // In a real implementation, you might want to send to a dead letter queue
      }
    }
  }

  private async handleUserCreatedEvent(event: DomainEventMessage): Promise<void> {
    this.logger.log(`Processing user created event for user ${event.aggregateId}`);
    
    // Example: Create user profile in API database
    const userData = event.eventData;
    
    // This is where you would integrate with your API service
    // Example pseudo-code:
    /*
    await this.apiUserService.createUserProfile({
      authUserId: userData.userId,
      email: userData.email,
      name: userData.name,
      emailVerified: userData.emailVerified,
      createdAt: new Date(userData.createdAt),
    });
    */
    
    this.logger.log(`Successfully processed user created event for ${userData.userId}`);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('Disconnected from NATS');
    }
  }
}

/**
 * Usage example in NestJS service:
 * 
 * @Injectable()
 * export class EventConsumerService implements OnModuleInit, OnModuleDestroy {
 *   private consumer = new AuthEventConsumer();
 * 
 *   async onModuleInit() {
 *     await this.consumer.connect();
 *     this.consumer.subscribeToUserEvents();
 *   }
 * 
 *   async onModuleDestroy() {
 *     await this.consumer.disconnect();
 *   }
 * }
 */