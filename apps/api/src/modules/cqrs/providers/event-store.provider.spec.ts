import { eventStoreProvider } from './event-store.provider';

// Mock the eventstore module
const mockEventStore = {
  init: jest.fn(),
  getEventStream: jest.fn(),
  store: { client: {} },
};

const mockEventStoreConstructor = jest.fn().mockReturnValue(mockEventStore);

jest.mock('eventstore', () => mockEventStoreConstructor);

describe('EventStoreProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useFactory', () => {
    it('should create in-memory eventstore in test environment', async () => {
      mockEventStore.init.mockImplementation(callback => {
        callback(null);
      });

      const result = await eventStoreProvider.useFactory();

      expect(mockEventStoreConstructor).toHaveBeenCalledWith({
        type: 'inmemory',
      });

      expect(result).toBe(mockEventStore);
    });

    it('should create in-memory eventstore when JEST_WORKER_ID is set', async () => {
      mockEventStore.init.mockImplementation(callback => {
        callback(null);
      });

      const result = await eventStoreProvider.useFactory();

      expect(mockEventStoreConstructor).toHaveBeenCalledWith({
        type: 'inmemory',
      });

      expect(result).toBe(mockEventStore);
    });

    it('should reject promise when initialization fails', async () => {
      const initError = new Error('Failed to initialize eventstore');

      mockEventStore.init.mockImplementation(callback => {
        callback(initError);
      });

      await expect(eventStoreProvider.useFactory()).rejects.toThrow('Failed to initialize eventstore');

      expect(console.error).toHaveBeenCalledWith('[EventStore] Failed to initialize:', initError);
    });
  });

  describe('provider configuration', () => {
    it('should have correct provider token', () => {
      expect(eventStoreProvider.provide).toBe('EVENT_STORE');
    });

    it('should have useFactory method', () => {
      expect(typeof eventStoreProvider.useFactory).toBe('function');
    });
  });

  describe('environment detection', () => {
    it('should use inmemory in test environment', async () => {
      mockEventStore.init.mockImplementation(callback => {
        callback(null);
      });

      await eventStoreProvider.useFactory();

      expect(mockEventStoreConstructor).toHaveBeenCalledWith({
        type: 'inmemory',
      });
    });
  });

  describe('error handling', () => {
    it('should properly propagate initialization errors', async () => {
      const customError = new Error('Custom initialization error');

      mockEventStore.init.mockImplementation(callback => {
        callback(customError);
      });

      await expect(eventStoreProvider.useFactory()).rejects.toBe(customError);
      expect(console.error).toHaveBeenCalledWith('[EventStore] Failed to initialize:', customError);
    });

    it('should handle null error in init callback', async () => {
      mockEventStore.init.mockImplementation(callback => {
        callback(null);
      });

      const result = await eventStoreProvider.useFactory();
      expect(result).toBe(mockEventStore);
    });
  });
});
