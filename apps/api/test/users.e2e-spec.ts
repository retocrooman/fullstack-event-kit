import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('UsersController (e2e)', () => {
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

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const response = await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age,
        createdAt: expect.any(String),
      });
    });

    it('should return 409 when creating user with existing email', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      // Create first user
      await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      // Try to create second user with same email
      await request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, name: 'Jane Doe' })
        .expect(409);
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserDto = {
        name: '',
        email: 'invalid-email',
        age: -1,
      };

      await request(app.getHttpServer()).post('/users').send(invalidUserDto).expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', async () => {
      // Create test users
      const users = [
        { name: 'John Doe', email: 'john@example.com', age: 25 },
        { name: 'Jane Smith', email: 'jane@example.com', age: 30 },
      ];

      for (const user of users) {
        await request(app.getHttpServer()).post('/users').send(user).expect(201);
      }

      const response = await request(app.getHttpServer()).get('/users').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
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
    it('should return user by id', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      const userId = createResponse.body.id;

      const response = await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age,
        createdAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).get('/users/999').expect(404);
    });

    it('should return 400 for invalid user id', async () => {
      await request(app.getHttpServer()).get('/users/invalid').expect(400);
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should update user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      const userId = createResponse.body.id;
      const updateUserDto = {
        name: 'John Updated',
        age: 26,
      };

      const response = await request(app.getHttpServer()).put(`/users/${userId}`).send(updateUserDto).expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        name: updateUserDto.name,
        email: createUserDto.email, // email should remain unchanged
        age: updateUserDto.age,
        createdAt: expect.any(String),
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).put('/users/999').send({ name: 'Updated Name' }).expect(404);
    });

    it('should return 409 when updating to existing email', async () => {
      // Create two users
      const user1 = { name: 'John Doe', email: 'john@example.com', age: 25 };
      const user2 = { name: 'Jane Smith', email: 'jane@example.com', age: 30 };

      await request(app.getHttpServer()).post('/users').send(user1).expect(201);

      const user2Response = await request(app.getHttpServer()).post('/users').send(user2).expect(201);

      // Try to update user2's email to user1's email
      await request(app.getHttpServer())
        .put(`/users/${user2Response.body.id}`)
        .send({ email: user1.email })
        .expect(409);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const createResponse = await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      const userId = createResponse.body.id;

      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      // Verify user is deleted
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer()).delete('/users/999').expect(404);
    });
  });
});
