import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { StripeService } from '../../stripe/stripe.service';
import { Plan } from '../../plans/plan.entity';
import { User } from '../../users/user.entity';
import { Subscription } from '../subscription.entity';
import { CreateSubscriptionCommand } from './create-subscription.command';

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
  private readonly logger = new Logger(CreateSubscriptionHandler.name);

  constructor(
    @InjectRepository(Plan)
    private readonly plansRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private readonly stripeService: StripeService,
  ) {}

  async execute(command: CreateSubscriptionCommand): Promise<{ status: 'ok' }> {
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

    const paymentMethod =
      await this.stripeService.client.paymentMethods.retrieve(
        command.paymentMethodId,
      );
    const paymentMethodCustomerId = this.resolvePaymentMethodCustomerId(
      paymentMethod.customer,
    );

    if (paymentMethodCustomerId && paymentMethodCustomerId !== customer.id) {
      throw new BadRequestException(
        'Payment method belongs to a different customer',
      );
    }

    if (!paymentMethodCustomerId) {
      await this.stripeService.client.paymentMethods.attach(
        command.paymentMethodId,
        {
          customer: customer.id,
        },
      );
    }

    await this.stripeService.client.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: command.paymentMethodId,
      },
    });

    const stripeSubscription =
      await this.stripeService.client.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        default_payment_method: command.paymentMethodId,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

    let user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      const generatedPassword = this.generatePassword();
      user = this.usersRepository.create({
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(generatedPassword, 10),
        stripeCustomerId: customer.id,
      });
      await this.usersRepository.save(user);
      this.logger.log(
        `Generated password for ${normalizedEmail}: ${generatedPassword}`,
      );
    } else if (!user.stripeCustomerId) {
      user.stripeCustomerId = customer.id;
      await this.usersRepository.save(user);
    }

    const subscription = this.subscriptionsRepository.create({
      user,
      plan,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
    });
    await this.subscriptionsRepository.save(subscription);

    return { status: 'ok' };
  }

  private async findCustomerByEmail(email: string) {
    const result = await this.stripeService.client.customers.list({
      email,
      limit: 1,
    });
    return result.data[0];
  }

  private resolvePaymentMethodCustomerId(
    customer: string | { id: string } | null,
  ): string | null {
    if (!customer) {
      return null;
    }
    if (typeof customer === 'string') {
      return customer;
    }
    return customer.id;
  }

  private generatePassword(length = 12): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i += 1) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
