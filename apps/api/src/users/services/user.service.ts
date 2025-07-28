import { Injectable, Inject } from '@nestjs/common';
import { DuplicateResourceException, ResourceNotFoundException } from '../../shared/exceptions/business-exception';
import { CreateUserDto, UserResponseDto } from '../dto/user.dto';
import { UserEntity, UpdateUserData } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(@Inject(IUserRepository) private readonly userRepository: IUserRepository) {}

  async createUserFromAuth0(authUserId: string, createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists with this Auth0 ID
    const existingUser = await this.userRepository.findById(authUserId);
    if (existingUser) {
      return UserMapper.toResponseDto(existingUser);
    }

    // Check if email is already in use
    const userWithEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (userWithEmail) {
      throw new DuplicateResourceException('User', 'email', createUserDto.email);
    }

    // Create new user with Auth0 ID
    const createUserData = {
      id: authUserId, // Use Auth0 sub as the user ID
      email: createUserDto.email,
      name: createUserDto.name,
      age: createUserDto.age,
    };

    const createdUser = await this.userRepository.create(createUserData);
    return UserMapper.toResponseDto(createdUser);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }
    return UserMapper.toResponseDto(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseDtoArray(users);
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ResourceNotFoundException('User', id);
    }

    // Check if email is being updated and if it conflicts with another user
    if (updateData.email && UserEntity.hasEmailChanged(existingUser, updateData.email)) {
      const userWithEmail = await this.userRepository.findByEmail(updateData.email);
      if (userWithEmail) {
        throw new DuplicateResourceException('User', 'email', updateData.email || existingUser.email);
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

}
