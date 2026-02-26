import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../plans/plan.entity';
import { StripeModule } from '../stripe/stripe.module';
import { CreatePaymentIntentHandler } from './commands/create-payment-intent.handler';
import { PaymentsController } from './payments.controller';

const commandHandlers = [CreatePaymentIntentHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Plan]), StripeModule],
  controllers: [PaymentsController],
  providers: [...commandHandlers],
})
export class PaymentsModule {}
