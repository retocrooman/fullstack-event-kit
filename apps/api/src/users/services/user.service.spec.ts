import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(IUserRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    };

    it('should create a user successfully', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age,
      });
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      repository.findAll.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          age: mockUser.age,
          createdAt: mockUser.createdAt,
        },
      ]);
    });

    it('should return empty array when no users exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('updateUser', () => {
    const updateData = { name: 'John Updated', age: 26 };

    it('should update user successfully', async () => {
      const updatedUser: User = {
        ...mockUser,
        name: 'John Updated',
        age: 26,
        updatedAt: new Date(),
      };
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, updateData);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { name: 'John Updated', age: 26 });
      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        createdAt: updatedUser.createdAt,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateUser(999, updateData)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to existing email', async () => {
      const anotherUser: User = {
        id: 2,
        name: 'Another User',
        email: 'another@example.com',
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updateDataWithEmail = { email: 'existing@example.com' };

      repository.findById.mockResolvedValue(anotherUser);
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.updateUser(2, updateDataWithEmail)).rejects.toThrow(ConflictException);
      expect(repository.findById).toHaveBeenCalledWith(2);
      expect(repository.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      const updateDataWithSameEmail = { email: mockUser.email };
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(mockUser);

      const result = await service.updateUser(1, updateDataWithSameEmail);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(1, { email: mockUser.email });
      expect(result).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue(mockUser);

      await service.deleteUser(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
