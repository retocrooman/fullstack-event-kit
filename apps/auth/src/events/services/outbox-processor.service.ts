import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventPublisherService } from './event-publisher.service';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private processingInterval!: NodeJS.Timeout;
  private cleanupInterval!: NodeJS.Timeout;
  private isProcessing = false;

  constructor(private readonly eventPublisher: EventPublisherService) {}

  onModuleInit() {
    this.startProcessing();
    this.startCleanup();
  }

  onModuleDestroy() {
    this.stopProcessing();
    this.stopCleanup();
  }

  private startProcessing() {
    const intervalMs = parseInt(process.env.OUTBOX_PROCESSING_INTERVAL_MS || '5000', 10);
    
    this.processingInterval = setInterval(async () => {
      if (this.isProcessing) {
        this.logger.debug('Previous processing still in progress, skipping...');
        return;
      }

      this.isProcessing = true;
      
      try {
        await this.eventPublisher.processPendingEvents();
      } catch (error) {
        this.logger.error('Error processing outbox events', error);
      } finally {
        this.isProcessing = false;
      }
    }, intervalMs);
    
    this.logger.log(`Started outbox processing with ${intervalMs}ms interval`);
  }

  private stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.logger.log('Stopped outbox processing');
    }
  }

  private startCleanup() {
    const intervalMs = parseInt(process.env.OUTBOX_CLEANUP_INTERVAL_MS || '3600000', 10); // 1 hour default
    const retentionDays = parseInt(process.env.OUTBOX_RETENTION_DAYS || '7', 10);
    
    this.cleanupInterval = setInterval(async () => {
      try {
        const deletedCount = await this.eventPublisher.cleanupPublishedEvents(retentionDays);
        this.logger.log(`Cleaned up ${deletedCount} old published events`);
      } catch (error) {
        this.logger.error('Error cleaning up outbox events', error);
      }
    }, intervalMs);
    
    this.logger.log(`Started outbox cleanup with ${intervalMs}ms interval (retention: ${retentionDays} days)`);
  }

  private stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.logger.log('Stopped outbox cleanup');
    }
  }

  async processNow(): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Processing already in progress');
    }

    this.isProcessing = true;
    
    try {
      await this.eventPublisher.processPendingEvents();
    } finally {
      this.isProcessing = false;
    }
  }
}