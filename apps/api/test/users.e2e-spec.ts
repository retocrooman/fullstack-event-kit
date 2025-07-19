import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('UsersController (e2e) - Profile Management', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable global validation pipes for e2e tests
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up the database after all tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  // Helper function to create test user directly in database
  async function createTestUser(userData: { name: string; email: string; age: number }) {
    return await prisma.user.create({
      data: userData,
    });
  }

  describe('/users (GET)', () => {
    it('should return all user profiles', async () => {
      // Create test users directly in database (simulating auth server creation)
      const users = [
        { name: 'John Doe', email: 'john@example.com', age: 25 },
        { name: 'Jane Smith', email: 'jane@example.com', age: 30 },
      ];

      for (const user of users) {
        await createTestUser(user);
      }

      const response = await request(app.getHttpServer()).get('/users').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        age: expect.any(Number),
        createdAt: expect.any(String),
      });
    });

    it('should return empty array when no users exist', async () => {
      const response = await request(app.getHttpServer()).get('/users').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return user profile by id', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const createdUser = await createTestUser(userData);

      const response = await request(app.getHttpServer()).get(`/users/${createdUser.id}`).expect(200);

      expect(response.body).toMatchObject({
        id: createdUser.id,
        name: userData.name,
        email: userData.email,
        age: userData.age,
        createdAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).get('/users/999').expect(404);
    });

    it('should return 404 for invalid user id', async () => {
      await request(app.getHttpServer()).get('/users/invalid').expect(404);
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should update user profile', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const createdUser = await createTestUser(userData);

      const updateUserDto = {
        name: 'John Updated',
        age: 26,
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${createdUser.id}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdUser.id,
        name: updateUserDto.name,
        email: userData.email, // email should remain unchanged
        age: updateUserDto.age,
        createdAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).put('/users/999').send({ name: 'Updated Name' }).expect(404);
    });

    it('should return 409 when updating to existing email', async () => {
      // Create two users directly in database
      const user1 = await createTestUser({ name: 'John Doe', email: 'john@example.com', age: 25 });
      const user2 = await createTestUser({ name: 'Jane Smith', email: 'jane@example.com', age: 30 });

      // Try to update user2's email to user1's email
      await request(app.getHttpServer())
        .put(`/users/${user2.id}`)
        .send({ email: user1.email })
        .expect(409);
    });
  });

  describe('POST /users (should not exist)', () => {
    it('should return 404 for user creation attempt', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      await request(app.getHttpServer()).post('/users').send(createUserDto).expect(404);
    });
  });

  describe('DELETE /users/:id (should not exist)', () => {
    it('should return 404 for user deletion attempt', async () => {
      const user = await createTestUser({ name: 'John Doe', email: 'john@example.com', age: 25 });

      await request(app.getHttpServer()).delete(`/users/${user.id}`).expect(404);
    });
  });
});
