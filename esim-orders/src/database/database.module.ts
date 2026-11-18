import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AppConfig } from '../config/app.config';

import { databaseOptions } from './database.options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        config: ConfigService<AppConfig, true>,
      ): TypeOrmModuleOptions => ({
        ...databaseOptions((key) => config.get(key, { infer: true })),
        autoLoadEntities: true,
      }),
      dataSourceFactory: (options?: DataSourceOptions): Promise<DataSource> =>
        Promise.resolve(
          addTransactionalDataSource(
            new DataSource(options as DataSourceOptions),
          ),
        ),
    }),
  ],
})
export class DatabaseModule {}
