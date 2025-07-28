import { z } from 'zod';

// Account schemas - focused on coin management
export const updateAccountSchema = z.object({
  coins: z.number().int().min(0).optional(),
});

// Transfer coins schema
export const transferCoinsSchema = z.object({
  toAccountId: z.string().min(1),
  amount: z.number().int().min(1),
});

export const accountIdSchema = z.object({
  id: z.string().min(1),
});

export const accountResponseSchema = z.object({
  id: z.string(), // Auth0 user ID
  coins: z.number().min(0).default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Account list response schema
export const accountListResponseSchema = z.array(accountResponseSchema);

// Combined schemas for mutations
export const updateAccountByIdSchema = accountIdSchema.merge(updateAccountSchema);

// Type exports
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type TransferCoinsInput = z.infer<typeof transferCoinsSchema>;
export type AccountIdInput = z.infer<typeof accountIdSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
export type AccountListResponse = z.infer<typeof accountListResponseSchema>;
export type UpdateAccountByIdInput = z.infer<typeof updateAccountByIdSchema>;

// Validation helpers
export const validateUpdateAccount = (data: unknown): UpdateAccountInput => {
  return updateAccountSchema.parse(data);
};

export const validateTransferCoins = (data: unknown): TransferCoinsInput => {
  return transferCoinsSchema.parse(data);
};

export const validateAccountId = (data: unknown): AccountIdInput => {
  return accountIdSchema.parse(data);
};

export const validateAccountResponse = (data: unknown): AccountResponse => {
  return accountResponseSchema.parse(data);
};