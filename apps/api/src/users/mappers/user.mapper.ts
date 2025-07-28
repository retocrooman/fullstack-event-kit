import { type UserResponse } from '@repo/shared-schemas';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toResponseDto(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email,
      age: user.age ?? undefined,
      createdAt: user.createdAt,
    };
  }

  static toResponseDtoArray(users: User[]): UserResponse[] {
    return users.map(user => this.toResponseDto(user));
  }
}
