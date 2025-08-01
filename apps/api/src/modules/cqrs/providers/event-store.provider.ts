import { EnvConfig } from '../../../config/env.config';

export const eventStoreProvider = {
  provide: 'EVENT_STORE',
  useFactory: async () => {
    console.log('[EventStore] Initializing eventstore with MongoDB...');
    
    // Create eventstore instance with MongoDB storage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const eventstore = require('eventstore');
    
    // Check if we're in test environment and use in-memory for tests
    const isTest = EnvConfig.isTest || process.env.JEST_WORKER_ID;
    
    const es = isTest ? eventstore({
      type: 'inmemory',
    }) : eventstore({
      type: 'mongodb',
      host: EnvConfig.eventstoreMongodbHost,
      port: EnvConfig.eventstoreMongodbPort,
      dbName: EnvConfig.eventstoreMongodbDbName,
      username: EnvConfig.eventstoreMongodbUsername,
      password: EnvConfig.eventstoreMongodbPassword,
      authSource: 'admin',
      eventsCollectionName: 'events',
      snapshotsCollectionName: 'snapshots',
      transactionsCollectionName: 'transactions',
      timeout: 10000,
    });

    // Initialize the eventstore
    return new Promise((resolve, reject) => {
      es.init((err) => {
        if (err) {
          console.error('[EventStore] Failed to initialize:', err);
          reject(err);
        } else {
          console.log('[EventStore] Successfully initialized');
          resolve(es);
        }
      });
    });
  },
};