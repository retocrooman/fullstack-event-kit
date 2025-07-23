import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { EventPublisherService } from '../events/services/event-publisher.service';
import { AuthService } from './auth.service';

// Mock Prisma Client
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

// Mock EventPublisherService
const mockEventPublisherService = {
  publishEvent: jest.fn().mockResolvedValue(undefined),
  publishEvents: jest.fn().mockResolvedValue(undefined),
};

// Mock Lucia
jest.mock('./lucia.config', () => ({
  lucia: {
    createSession: jest.fn(),
    validateSession: jest.fn(),
    invalidateSession: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
        {
          provide: EventPublisherService,
          useValue: mockEventPublisherService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    // Replace the prisma instance with our mock
    (service as any).prisma = mockPrismaClient;

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});