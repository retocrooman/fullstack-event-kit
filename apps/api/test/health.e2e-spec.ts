import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();
        expect(res.body.info.api).toBeDefined();
        expect(res.body.info.api.status).toBe('up');
      });
  });

  it('/health-check/database (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check/database')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();
        expect(res.body.info.database).toBeDefined();
      });
  });

  it('/health-check/eventstore (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check/eventstore')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();
        expect(res.body.info.mongodb).toBeDefined();
        expect(res.body.info.mongodb.status).toBe('up');
        expect(res.body.info.mongodb.message).toBeDefined();
      });
  });

  it('/health-check/all (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check/all')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info).toBeDefined();

        // Check API health
        expect(res.body.info.api).toBeDefined();
        expect(res.body.info.api.status).toBe('up');

        // Check PostgreSQL database health
        expect(res.body.info.database).toBeDefined();
        expect(res.body.info.database.status).toBe('up');

        // Check MongoDB eventstore health
        expect(res.body.info.mongodb).toBeDefined();
        expect(res.body.info.mongodb.status).toBe('up');
        expect(res.body.info.mongodb.message).toBeDefined();
      });
  });
});
