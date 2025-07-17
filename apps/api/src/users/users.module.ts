import { Module } from '@nestjs/common';
import { UserRepositoryImpl } from '../infrastructure/repositories/user.repository.impl';
import { PrismaService } from '../prisma.service';
import { IUserRepository } from './interfaces/user-repository.interface';
import { UserService } from './services/user.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    UserService,
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
