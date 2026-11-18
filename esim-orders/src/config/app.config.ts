import * as Joi from 'joi';

const DEFAULT_PORT = 3100;
const DEFAULT_DB_PORT = 5434;

export interface AppConfig {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export const appConfigSchema = Joi.object<AppConfig>({
  PORT: Joi.number().default(DEFAULT_PORT),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(DEFAULT_DB_PORT),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('esim_orders'),
});
