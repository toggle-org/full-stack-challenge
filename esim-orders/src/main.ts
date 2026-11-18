import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext();
  const app = configureApp(await NestFactory.create(AppModule));
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
