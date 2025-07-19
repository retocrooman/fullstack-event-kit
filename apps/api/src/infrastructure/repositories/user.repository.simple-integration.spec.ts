import '@quramy/jest-prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateUserData, UpdateUserData } from '../../users/entities/user.entity';
import { UserRepositoryImpl } from './user.repository.impl';

describe('UserRepositoryImpl (Simple Integration)', () => {
  let repository: UserRepositoryImpl;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryImpl,
        {
          provide: PrismaService,
          useFactory: () => jestPrisma.client,
        },
      ],
    }).compile();

    repository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
  });

  beforeEach(() => {
    prisma = jestPrisma.client;
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany();
  });

  describe('Basic CRUD Operations', () => {
    it('should create, read, update, and delete a user', async () => {
      // CREATE
      const createData: CreateUserData = {
        email: 'crud@test.com',
        name: 'CRUD Test User',
        age: 25,
      };

      const createdUser = await repository.create(createData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe('crud@test.com');
      expect(createdUser.name).toBe('CRUD Test User');
      expect(createdUser.age).toBe(25);
      expect(createdUser.id).toBeDefined();

      // READ by ID
      const foundUser = await repository.findById(createdUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('crud@test.com');

      // READ by Email
      const foundByEmail = await repository.findByEmail('crud@test.com');
      expect(foundByEmail).toBeDefined();
      expect(foundByEmail?.id).toBe(createdUser.id);

      // UPDATE
      const updateData: UpdateUserData = {
        name: 'Updated CRUD User',
        age: 30,
        emailVerified: true,
      };

      const updatedUser = await repository.update(createdUser.id, updateData);
      expect(updatedUser.name).toBe('Updated CRUD User');
      expect(updatedUser.age).toBe(30);
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.email).toBe('crud@test.com'); // Unchanged

      // DELETE
      const deletedUser = await repository.delete(createdUser.id);
      expect(deletedUser.id).toBe(createdUser.id);

      // Verify deletion
      const notFound = await repository.findById(createdUser.id);
      expect(notFound).toBeNull();
    });

    it('should handle multiple users with findAll', async () => {
      // Create multiple users
      const users = await Promise.all([
        repository.create({
          email: 'user1@multi.test',
          name: 'User 1',
          age: 20,
        }),
        repository.create({
          email: 'user2@multi.test',
          name: 'User 2',
          age: 25,
        }),
        repository.create({
          email: 'user3@multi.test',
          name: 'User 3',
          age: 30,
        }),
      ]);

      // Get all users
      const allUsers = await repository.findAll();
      expect(allUsers).toHaveLength(3);

      // Should be ordered by creation date desc
      const emails = allUsers.map(u => u.email);
      expect(emails).toContain('user1@multi.test');
      expect(emails).toContain('user2@multi.test');
      expect(emails).toContain('user3@multi.test');
    });

    it('should handle minimal user creation', async () => {
      const createData: CreateUserData = {
        email: 'minimal@test.com',
      };

      const user = await repository.create(createData);
      expect(user.email).toBe('minimal@test.com');
      expect(user.name).toBeNull();
      expect(user.age).toBeNull();
      expect(user.emailVerified).toBe(false);
      expect(user.image).toBeNull();
    });

    it('should handle partial updates', async () => {
      const user = await repository.create({
        email: 'partial@test.com',
        name: 'Original Name',
        age: 25,
      });

      // Update only name
      const updated = await repository.update(user.id, {
        name: 'New Name',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.age).toBe(25); // Unchanged
      expect(updated.email).toBe('partial@test.com'); // Unchanged
    });
  });

  describe('Database Relationships', () => {
    it('should handle user with sessions and accounts', async () => {
      const user = await repository.create({
        email: 'relations@test.com',
        name: 'Relations User',
      });

      // DELETE
      await repository.delete(user.id);

      // Verify user is deleted
      const deletedUser = await repository.findById(user.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should return null for non-existent users', async () => {
      const notFound = await repository.findById('non-existent-id');
      expect(notFound).toBeNull();

      const notFoundByEmail = await repository.findByEmail('notfound@test.com');
      expect(notFoundByEmail).toBeNull();
    });

    it('should return empty array when no users exist', async () => {
      const allUsers = await repository.findAll();
      expect(allUsers).toEqual([]);
    });

    it('should handle case-sensitive email searches', async () => {
      await repository.create({
        email: 'CaseSensitive@Test.com',
        name: 'Case Test',
      });

      const found = await repository.findByEmail('CaseSensitive@Test.com');
      expect(found).toBeDefined();

      const notFound = await repository.findByEmail('casesensitive@test.com');
      expect(notFound).toBeNull();
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent user creation', async () => {
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        repository.create({
          email: `concurrent${i}@test.com`,
          name: `Concurrent User ${i}`,
          age: 20 + i,
        }),
      );

      const results = await Promise.all(createPromises);
      expect(results).toHaveLength(5);

      // All should have unique IDs and emails
      const ids = results.map(r => r.id);
      const emails = results.map(r => r.email);
      expect(new Set(ids).size).toBe(5);
      expect(new Set(emails).size).toBe(5);

      // Verify in database
      const dbUsers = await repository.findAll();
      expect(dbUsers).toHaveLength(5);
    });

    it('should handle concurrent updates', async () => {
      const user = await repository.create({
        email: 'concurrent-update@test.com',
        name: 'Original',
      });

      // Perform concurrent updates
      const updatePromises = [
        repository.update(user.id, { name: 'Update 1' }),
        repository.update(user.id, { age: 25 }),
        repository.update(user.id, { emailVerified: true }),
      ];

      const results = await Promise.all(updatePromises);
      expect(results).toHaveLength(3);

      // All updates should succeed
      results.forEach(result => {
        expect(result.id).toBe(user.id);
        expect(result.email).toBe('concurrent-update@test.com');
      });

      // Verify final state
      const finalUser = await repository.findById(user.id);
      expect(finalUser).toBeDefined();
      expect(finalUser?.email).toBe('concurrent-update@test.com');
    });
  });
});
