import { User, CreateUserData, UpdateUserData } from '../entities/user.entity';

export interface IUserRepository {
  create(createUserData: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
