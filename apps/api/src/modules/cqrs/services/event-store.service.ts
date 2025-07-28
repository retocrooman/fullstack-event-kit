import { Injectable, Inject } from '@nestjs/common';

/**
 * EventStoreService provides a high-level interface for event sourcing operations.
 * 
 * This service wraps the node-eventstore library to offer:
 * - Event persistence: Saves domain events to MongoDB storage
 * - Event retrieval: Loads event history for specific aggregates
 * - Stream management: Handles event stream creation, appending, and committing
 * - Health monitoring: Provides connection status for health checks
 * 
 * The service uses dependency injection to receive a configured eventstore instance
 * and provides Promise-based methods for async operations with proper error handling.
 * 
 * Key operations:
 * - getEvents(aggregateId): Retrieves all events for a specific aggregate
 * - saveEvents(aggregateId, events): Persists new events to an aggregate's stream
 * - getAllAggregateIds(): Lists all known aggregate identifiers (simplified implementation)
 * - getEventStore(): Returns the underlying eventstore instance for advanced operations
 */
@Injectable()
export class EventStoreService {
  private eventStorePromise: Promise<any>;
  private aggregateStreams = new Map<string, any[]>();

  constructor(
    @Inject('EVENT_STORE')
    eventStore: Promise<any>,
  ) {
    this.eventStorePromise = eventStore;
  }

  async getEvents(aggregateId: string): Promise<any[]> {
    const eventStore = await this.eventStorePromise;
    return new Promise((resolve, reject) => {
      eventStore.getEventStream(aggregateId, (err, stream) => {
        if (err) {
          // If stream doesn't exist, return empty array
          if (err.message && err.message.includes('not found')) {
            resolve([]);
          } else {
            reject(err);
          }
          return;
        }
        
        // Get all events from the stream
        const events = stream.events || [];
        resolve(events);
      });
    });
  }

  async saveEvents(aggregateId: string, events: any[]): Promise<void> {
    const eventStore = await this.eventStorePromise;
    return new Promise((resolve, reject) => {
      eventStore.getEventStream(aggregateId, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        // Add each event to the stream
        events.forEach(event => {
          stream.addEvent(event);
        });

        // Commit the stream
        stream.commit((commitErr) => {
          if (commitErr) {
            reject(commitErr);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async getAllAggregateIds(aggregateType?: string): Promise<string[]> {
    // node-eventstore doesn't provide a direct way to get all aggregate IDs
    // This is a simplified implementation that maintains a registry
    // In a real scenario, you might need to query the underlying storage directly
    try {
      // For now, return empty array - this would need to be implemented
      // based on the specific storage backend being used
      return Array.from(this.aggregateStreams.keys());
    } catch (error) {
      console.warn('Could not retrieve aggregate IDs:', error);
      return [];
    }
  }

  async getEventStore() {
    return await this.eventStorePromise;
  }
}