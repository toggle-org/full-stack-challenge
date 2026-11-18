import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentProvider } from '../../../integrations/payments/payment-provider';
import { PAYMENT_PROVIDER } from '../../../integrations/tokens';
import { PlanView } from '../../plans/plan.view';
import { Order } from '../entities/order.entity';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { OrderStatus } from '../order-status';
import { CreatedOrder } from '../order.view';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider,
  ) {}

  async create(plan: PlanView, email: string): Promise<CreatedOrder> {
    const order = await this.orders.save(
      this.orders.create({
        planId: plan.id,
        email,
        amountCents: plan.priceCents,
        currency: plan.currency,
        status: OrderStatus.PendingPayment,
      }),
    );
    const intent = await this.payments.createPaymentIntent(
      order.amountCents,
      order.currency,
    );
    await this.orders.update({ id: order.id }, { paymentIntentId: intent.id });
    return {
      orderId: order.id,
      paymentIntentId: intent.id,
      clientSecret: intent.clientSecret,
    };
  }

  async getById(orderId: string): Promise<Order> {
    const order = await this.orders.findOneBy({ id: orderId });
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }
    return order;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<Order> {
    const order = await this.orders.findOneBy({ paymentIntentId });
    if (!order) {
      throw new OrderNotFoundError(paymentIntentId);
    }
    return order;
  }

  async markPaid(orderId: string): Promise<void> {
    await this.orders.update({ id: orderId }, { status: OrderStatus.Paid });
  }

  async markFulfilled(orderId: string): Promise<void> {
    await this.orders.update(
      { id: orderId },
      { status: OrderStatus.Fulfilled },
    );
    this.logger.log(`order fulfilled order=${orderId}`);
  }

  async markFailed(orderId: string): Promise<void> {
    await this.orders.update({ id: orderId }, { status: OrderStatus.Failed });
    this.logger.log(`order failed order=${orderId}`);
  }
}
