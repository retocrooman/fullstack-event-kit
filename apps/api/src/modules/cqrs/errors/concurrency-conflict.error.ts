export class ConcurrencyConflictError extends Error {
  constructor(
    public readonly aggregateId: string,
    public readonly expectedVersion: number,
    public readonly currentVersion: number,
  ) {
    super(
      `Concurrency conflict for aggregate ${aggregateId}. Expected version: ${expectedVersion}, Current version: ${currentVersion}`,
    );
    this.name = 'ConcurrencyConflictError';
  }
}