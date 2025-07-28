import { z } from 'zod';

export class GetAccountQuery {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
  });

  constructor(
    public readonly accountId: string,
  ) {}

  static fromRequest(data: unknown): GetAccountQuery {
    const { accountId } = this.schema.parse(data);
    return new GetAccountQuery(accountId);
  }
}

export class GetAllAccountsQuery {
  private static schema = z.object({});

  constructor() {}

  static fromRequest(data: unknown): GetAllAccountsQuery {
    this.schema.parse(data);
    return new GetAllAccountsQuery();
  }
}

export class GetAccountsWithPaginationQuery {
  private static schema = z.object({
    page: z.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  });

  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}

  static fromRequest(data: unknown): GetAccountsWithPaginationQuery {
    const { page, limit } = this.schema.parse(data);
    return new GetAccountsWithPaginationQuery(page, limit);
  }
}

export class GetAccountsByCoinsRangeQuery {
  private static schema = z.object({
    minCoins: z.number().int().min(0, 'Minimum coins cannot be negative'),
    maxCoins: z.number().int().min(0, 'Maximum coins cannot be negative').optional(),
  }).refine((data) => {
    if (data.maxCoins !== undefined) {
      return data.minCoins <= data.maxCoins;
    }
    return true;
  }, {
    message: 'Minimum coins must be less than or equal to maximum coins',
  });

  constructor(
    public readonly minCoins: number,
    public readonly maxCoins?: number,
  ) {}

  static fromRequest(data: unknown): GetAccountsByCoinsRangeQuery {
    const { minCoins, maxCoins } = this.schema.parse(data);
    return new GetAccountsByCoinsRangeQuery(minCoins, maxCoins);
  }
}

export class GetTotalCoinsQuery {
  private static schema = z.object({});

  constructor() {}

  static fromRequest(data: unknown): GetTotalCoinsQuery {
    this.schema.parse(data);
    return new GetTotalCoinsQuery();
  }
}

export class GetAccountCountQuery {
  private static schema = z.object({});

  constructor() {}

  static fromRequest(data: unknown): GetAccountCountQuery {
    this.schema.parse(data);
    return new GetAccountCountQuery();
  }
}

export class GetTopAccountsByCoinsQuery {
  private static schema = z.object({
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  });

  constructor(
    public readonly limit: number = 10,
  ) {}

  static fromRequest(data: unknown): GetTopAccountsByCoinsQuery {
    const { limit } = this.schema.parse(data);
    return new GetTopAccountsByCoinsQuery(limit);
  }
}

export class SearchAccountsByIdQuery {
  private static schema = z.object({
    searchTerm: z.string().min(1, 'Search term is required'),
  });

  constructor(
    public readonly searchTerm: string,
  ) {}

  static fromRequest(data: unknown): SearchAccountsByIdQuery {
    const { searchTerm } = this.schema.parse(data);
    return new SearchAccountsByIdQuery(searchTerm);
  }
}

export class DoesAccountExistQuery {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
  });

  constructor(
    public readonly accountId: string,
  ) {}

  static fromRequest(data: unknown): DoesAccountExistQuery {
    const { accountId } = this.schema.parse(data);
    return new DoesAccountExistQuery(accountId);
  }
}