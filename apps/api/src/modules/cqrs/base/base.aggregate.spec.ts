import { BaseAggregate, DomainEvent } from './base.aggregate';

// Test event classes
class ValueChangedEvent {
  public readonly newValue: string;

  constructor(newValue: string) {
    this.newValue = newValue;
  }
}

// Test implementation of BaseAggregate
class TestAggregate extends BaseAggregate {
  private testValue: string = '';

  constructor(id: string) {
    super(id);
  }

  // Test methods
  changeValue(newValue: string): void {
    this.emitEvent('ValueChangedEvent', { newValue });
  }

  getValue(): string {
    return this.testValue;
  }

  // Required abstract method implementation
  protected applyEvent(event: DomainEvent, isNew: boolean): void {
    switch (event.eventType) {
      case 'ValueChangedEvent':
        this.testValue = (event.payload as any).newValue;
        break;
      default:
        // Ignore unknown events
        break;
    }
  }
}

describe('BaseAggregate', () => {
  let aggregate: TestAggregate;
  const aggregateId = 'test-aggregate-123';

  beforeEach(() => {
    aggregate = new TestAggregate(aggregateId);
  });

  describe('constructor', () => {
    it('should create aggregate with valid ID', () => {
      expect(aggregate.getId()).toBe(aggregateId);
      expect(aggregate.getVersion()).toBe(0);
    });

    it('should throw error for empty aggregate ID', () => {
      expect(() => new TestAggregate('')).toThrow('Aggregate ID is required');
    });
  });

  describe('emitEvent', () => {
    it('should emit event and update state', () => {
      const newValue = 'test-value';

      aggregate.changeValue(newValue);

      expect(aggregate.getValue()).toBe(newValue);
      expect(aggregate.getVersion()).toBe(0); // Version not updated until commit

      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('Object');
      expect(events[0].aggregateId).toBe(aggregateId);
      expect(events[0].version).toBe(1); // First event gets version 1
      expect((events[0].payload as any).payload.newValue).toBe(newValue);
    });

    it('should increment version for multiple events', () => {
      aggregate.changeValue('value1');
      aggregate.changeValue('value2');
      aggregate.changeValue('value3');

      expect(aggregate.getVersion()).toBe(0); // Version not updated until commit
      expect(aggregate.getValue()).toBe('value3');

      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(3);
      expect(events[0].version).toBe(1); // version 0 + 0 + 1
      expect(events[1].version).toBe(2); // version 0 + 1 + 1
      expect(events[2].version).toBe(3); // version 0 + 2 + 1
    });
  });

  describe('loadFromHistory', () => {
    it('should load events and update state', () => {
      const historyEvents: DomainEvent[] = [
        {
          aggregateId,
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'historic-value-1' },
          version: 1,
          timestamp: new Date(),
        },
        {
          aggregateId,
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'historic-value-2' },
          version: 2,
          timestamp: new Date(),
        },
      ];

      aggregate.loadFromHistory(historyEvents);

      expect(aggregate.getValue()).toBe('historic-value-2');
      expect(aggregate.getVersion()).toBe(2);
    });

    it('should handle empty events array', () => {
      aggregate.loadFromHistory([]);

      expect(aggregate.getValue()).toBe('');
      expect(aggregate.getVersion()).toBe(0);
    });

    it('should throw error for mismatched aggregate ID', () => {
      const invalidEvents: DomainEvent[] = [
        {
          aggregateId: 'different-id',
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'test' },
          version: 1,
          timestamp: new Date(),
        },
      ];

      expect(() => aggregate.loadFromHistory(invalidEvents)).toThrow(
        'Event aggregate ID different-id does not match current aggregate ID test-aggregate-123',
      );
    });

    it('should update version to highest event version', () => {
      const historyEvents: DomainEvent[] = [
        {
          aggregateId,
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'test' },
          version: 5,
          timestamp: new Date(),
        },
        {
          aggregateId,
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'test2' },
          version: 3,
          timestamp: new Date(),
        },
      ];

      aggregate.loadFromHistory(historyEvents);

      expect(aggregate.getVersion()).toBe(5);
    });
  });

  describe('getDomainEvents', () => {
    it('should return uncommitted events with proper versioning', () => {
      aggregate.changeValue('value1');
      aggregate.changeValue('value2');

      const events = aggregate.getDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0].version).toBe(1);
      expect(events[1].version).toBe(2);
      expect(events[0].aggregateId).toBe(aggregateId);
      expect(events[1].aggregateId).toBe(aggregateId);
    });

    it('should return empty array when no events', () => {
      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe('markEventsAsCommitted', () => {
    it('should clear uncommitted events and update version', () => {
      aggregate.changeValue('test-value');

      expect(aggregate.getDomainEvents()).toHaveLength(1);

      aggregate.markEventsAsCommitted();

      expect(aggregate.getDomainEvents()).toHaveLength(0);
      expect(aggregate.getVersion()).toBe(1); // Version updated after commit
    });

    it('should handle no events to commit', () => {
      const initialVersion = aggregate.getVersion();

      aggregate.markEventsAsCommitted();

      expect(aggregate.getVersion()).toBe(initialVersion);
      expect(aggregate.getDomainEvents()).toHaveLength(0);
    });

    it('should update version to latest event version', () => {
      aggregate.changeValue('value1');
      aggregate.changeValue('value2');
      aggregate.changeValue('value3');

      expect(aggregate.getVersion()).toBe(0); // Version not updated until commit

      aggregate.markEventsAsCommitted();

      expect(aggregate.getVersion()).toBe(3); // Now updated to latest event version
      expect(aggregate.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('event versioning with history', () => {
    it('should continue versioning after loading history', () => {
      // Load some history
      const historyEvents: DomainEvent[] = [
        {
          aggregateId,
          eventType: 'ValueChangedEvent',
          payload: { newValue: 'historic' },
          version: 5,
          timestamp: new Date(),
        },
      ];

      aggregate.loadFromHistory(historyEvents);
      expect(aggregate.getVersion()).toBe(5);

      // Add new events
      aggregate.changeValue('new-value');

      const newEvents = aggregate.getDomainEvents();
      expect(newEvents).toHaveLength(1);
      expect(newEvents[0].version).toBe(6); // version 5 + 0 + 1
      expect(aggregate.getVersion()).toBe(5); // Still 5 until commit
    });
  });
});
