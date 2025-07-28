import { z } from 'zod';

// Base user schemas
export const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().min(0).max(120).optional(),
});

export const userIdSchema = z.object({
  id: z.string().min(1),
});

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string(),
  age: z.number().optional(),
  createdAt: z.coerce.date(),
});

// User list response schema
export const userListResponseSchema = z.array(userResponseSchema);

// Combined schemas for mutations
export const updateUserByIdSchema = userIdSchema.merge(updateUserSchema);

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
export type UpdateUserByIdInput = z.infer<typeof updateUserByIdSchema>;

// Validation helpers
export const validateCreateUser = (data: unknown): CreateUserInput => {
  return createUserSchema.parse(data);
};

export const validateUpdateUser = (data: unknown): UpdateUserInput => {
  return updateUserSchema.parse(data);
};

export const validateUserId = (data: unknown): UserIdInput => {
  return userIdSchema.parse(data);
};

export const validateUserResponse = (data: unknown): UserResponse => {
  return userResponseSchema.parse(data);
};