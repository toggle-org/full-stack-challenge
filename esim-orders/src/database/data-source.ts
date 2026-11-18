import { join } from 'path';

import { DataSource } from 'typeorm';

import { AppConfig, appConfigSchema } from '../config/app.config';

import { databaseOptions } from './database.options';

const { value: config } = appConfigSchema.validate(process.env, {
  allowUnknown: true,
}) as { value: AppConfig };

export default new DataSource({
  ...databaseOptions((key) => config[key]),
  migrationsRun: false,
  entities: [join(__dirname, '..', '**', '*.entity.ts')],
});
