import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../plans/plan.entity';
import { StripeModule } from '../stripe/stripe.module';
import { User } from '../users/user.entity';
import { CreateSubscriptionHandler } from './commands/create-subscription.handler';
import { Subscription } from './subscription.entity';
import { SubscriptionsController } from './subscriptions.controller';

const commandHandlers = [CreateSubscriptionHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Plan, User, Subscription]),
    StripeModule,
  ],
  controllers: [SubscriptionsController],
  providers: [...commandHandlers],
})
export class SubscriptionsModule {}
