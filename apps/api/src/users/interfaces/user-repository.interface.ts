import { User, CreateUserData, UpdateUserData } from '../entities/user.entity';

export interface IUserRepository {
  create(createUserData: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: number, data: UpdateUserData): Promise<User>;
  delete(id: number): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
