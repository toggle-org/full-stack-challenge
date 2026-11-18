import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';

export type TestApp = INestApplication<App>;

export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<TestApp>({
    logger: ['error', 'warn'],
  });
  configureApp(app);
  await app.init();
  return app;
}

export async function truncate(app: TestApp, tables: string[]): Promise<void> {
  const list = tables.map((table) => `"${table}"`).join(', ');
  await app.get(DataSource).query(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}
