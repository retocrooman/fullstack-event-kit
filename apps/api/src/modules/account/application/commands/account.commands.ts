import { z } from 'zod';

export class AddCoinsCommand {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
    amount: z.number().int().min(1, 'Amount must be at least 1'),
  });

  constructor(
    public readonly accountId: string,
    public readonly amount: number,
  ) {}

  static fromRequest(data: unknown): AddCoinsCommand {
    const { accountId, amount } = this.schema.parse(data);
    return new AddCoinsCommand(accountId, amount);
  }
}

export class DeductCoinsCommand {
  private static schema = z.object({
    accountId: z.string().min(1, 'Account ID is required'),
    amount: z.number().int().min(1, 'Amount must be at least 1'),
  });

  constructor(
    public readonly accountId: string,
    public readonly amount: number,
  ) {}

  static fromRequest(data: unknown): DeductCoinsCommand {
    const { accountId, amount } = this.schema.parse(data);
    return new DeductCoinsCommand(accountId, amount);
  }
}

export class TransferCoinsCommand {
  private static schema = z.object({
    fromAccountId: z.string().min(1, 'From Account ID is required'),
    toAccountId: z.string().min(1, 'To Account ID is required'),
    amount: z.number().int().min(1, 'Amount must be at least 1'),
  });

  constructor(
    public readonly fromAccountId: string,
    public readonly toAccountId: string,
    public readonly amount: number,
  ) {}

  static fromRequest(data: unknown): TransferCoinsCommand {
    const { fromAccountId, toAccountId, amount } = this.schema.parse(data);
    return new TransferCoinsCommand(fromAccountId, toAccountId, amount);
  }
}