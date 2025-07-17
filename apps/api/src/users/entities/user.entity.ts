// Immutable User state as JSON object
export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateUserData {
  readonly name: string;
  readonly email: string;
  readonly age: number;
}

export interface UpdateUserData {
  readonly name?: string;
  readonly email?: string;
  readonly age?: number;
}

// Pure functions for User operations
export const UserEntity = {
  // Factory function to create User from Prisma data
  fromPrisma: (prismaUser: any): User => ({
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    age: prismaUser.age,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  }),

  // Pure function to create new User with updated data
  update: (user: User, updateData: UpdateUserData): User => ({
    ...user,
    ...updateData,
    updatedAt: new Date(),
  }),

  // Pure function to check if email is different
  hasEmailChanged: (user: User, newEmail: string): boolean => user.email !== newEmail,

  // Pure function to convert to JSON (for serialization)
  toJSON: (user: User): Record<string, any> => ({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }),

  // Pure function to convert to string
  toString: (user: User): string => JSON.stringify(UserEntity.toJSON(user), null, 2),
} as const;
