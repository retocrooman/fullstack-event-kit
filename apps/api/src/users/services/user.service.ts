import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CreateUserDto, UserResponseDto } from '../dto/user.dto';
import { UserEntity, CreateUserData, UpdateUserData } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(@Inject(IUserRepository) private readonly userRepository: IUserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Convert DTO to domain data using pure function
    const createUserData: CreateUserData = {
      name: createUserDto.name,
      email: createUserDto.email,
      age: createUserDto.age,
    };

    const user = await this.userRepository.create(createUserData);
    return UserMapper.toResponseDto(user);
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserMapper.toResponseDto(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseDtoArray(users);
  }

  async updateUser(id: number, updateData: Partial<CreateUserDto>): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it conflicts with another user
    if (updateData.email && UserEntity.hasEmailChanged(existingUser, updateData.email)) {
      const userWithEmail = await this.userRepository.findByEmail(updateData.email);
      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Convert DTO to domain data using immutable approach
    const updateUserData: UpdateUserData = {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.email !== undefined && { email: updateData.email }),
      ...(updateData.age !== undefined && { age: updateData.age }),
    };

    const updatedUser = await this.userRepository.update(id, updateUserData);
    return UserMapper.toResponseDto(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
  }
}
