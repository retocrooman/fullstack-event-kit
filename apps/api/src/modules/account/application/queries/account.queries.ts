import { z } from 'zod';

export class GetAccountCoinsQuery {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
  });

  constructor(
    public readonly accountId: string,
  ) {}

  static fromRequest(data: unknown): GetAccountCoinsQuery {
    const { accountId } = this.schema.parse(data);
    return new GetAccountCoinsQuery(accountId);
  }
}

export class GetAccountEventsQuery {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
  });

  constructor(
    public readonly accountId: string,
  ) {}

  static fromRequest(data: unknown): GetAccountEventsQuery {
    const { accountId } = this.schema.parse(data);
    return new GetAccountEventsQuery(accountId);
  }
}