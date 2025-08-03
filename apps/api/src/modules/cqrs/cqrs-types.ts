export interface EventStoreStream {
  addEvent(event: any): void;
  commit(callback?: (err?: Error) => void): void;
  commit(options: { session?: any }, callback?: (err?: Error) => void): void;
  events: any[];
  currentRevision?: number;
  lastRevision?: number;
}

export interface EventStoreClient {
  startSession(): any;
}

export interface EventStore {
  init(callback: (err?: Error) => void): void;
  getEventStream(
    aggregateId: string, 
    callback: (err: Error | null, stream?: EventStoreStream) => void
  ): void;
  getEventStream(
    aggregateId: string,
    options: { useTransaction?: boolean; session?: any },
    callback: (err: Error | null, stream?: EventStoreStream) => void
  ): void;
  store?: {
    client?: EventStoreClient;
  };
  client?: EventStoreClient;
}