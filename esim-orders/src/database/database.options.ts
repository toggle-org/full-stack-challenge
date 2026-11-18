import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { AppConfig } from '../config/app.config';

import { migrations } from './migrations';

export function databaseOptions(
  get: <K extends keyof AppConfig>(key: K) => AppConfig[K],
): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: get('DB_HOST'),
    port: get('DB_PORT'),
    username: get('DB_USER'),
    password: get('DB_PASSWORD'),
    database: get('DB_NAME'),
    migrations,
    migrationsRun: true,
    synchronize: false,
  };
}
