import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { Plan } from './modules/plans/plan.entity';
import { PlansModule } from './modules/plans/plans.module';
import { Subscription } from './modules/subscriptions/subscription.entity';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { User } from './modules/users/user.entity';
import { VpnConfig } from './modules/vpn-configs/vpn-config.entity';
import { VpnConfigsModule } from './modules/vpn-configs/vpn-configs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'vpn_app'),
        entities: [User, VpnConfig, Plan, Subscription],
        synchronize: true,
      }),
    }),
    PlansModule,
    PaymentsModule,
    SubscriptionsModule,
    AuthModule,
    VpnConfigsModule,
  ],
})
export class AppModule {}
