import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeService } from '../../stripe/stripe.service';
import { Plan } from '../../plans/plan.entity';
import { CreatePaymentIntentCommand } from './create-payment-intent.command';

@CommandHandler(CreatePaymentIntentCommand)
export class CreatePaymentIntentHandler implements ICommandHandler<CreatePaymentIntentCommand> {
  constructor(
    @InjectRepository(Plan)
    private readonly plansRepository: Repository<Plan>,
    private readonly stripeService: StripeService,
  ) {}

  async execute(command: CreatePaymentIntentCommand): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const normalizedEmail = command.email.toLowerCase();

    const plan = await this.plansRepository.findOne({
      where: { id: command.planId },
    });

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    let customer = await this.findCustomerByEmail(normalizedEmail);
    if (!customer) {
      customer = await this.stripeService.client.customers.create({
        email: normalizedEmail,
      });
    }

    const paymentIntent = await this.stripeService.client.paymentIntents.create(
      {
        amount: plan.priceCents,
        currency: plan.currency,
        customer: customer.id,
        receipt_email: normalizedEmail,
        setup_future_usage: 'off_session',
        metadata: {
          planId: plan.id,
          customerId: customer.id,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
    );

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Unable to create Stripe Payment Intent');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  private async findCustomerByEmail(email: string) {
    const result = await this.stripeService.client.customers.list({
      email,
      limit: 1,
    });
    return result.data[0];
  }
}
