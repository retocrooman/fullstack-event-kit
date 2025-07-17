import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User, UserEntity, CreateUserData, UpdateUserData } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/interfaces/user-repository.interface';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserData: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: createUserData,
    });
    return UserEntity.fromPrisma(user);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map(user => UserEntity.fromPrisma(user));
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return UserEntity.fromPrisma(user);
  }

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return UserEntity.fromPrisma(user);
  }
}
