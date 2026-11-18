import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { appConfigSchema } from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PlansModule } from './modules/plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: appConfigSchema }),
    CqrsModule.forRoot(),
    DatabaseModule,
    PlansModule,
    OrdersModule,
  ],
})
export class AppModule {}
