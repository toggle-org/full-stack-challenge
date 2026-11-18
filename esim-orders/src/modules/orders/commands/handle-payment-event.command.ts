import { Logger } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderStatus } from '../order-status';
import { PaymentEventType } from '../payment-event-type';
import { EsimService } from '../services/esim.service';
import { OrderService } from '../services/order.service';

export class HandlePaymentEventCommand extends Command<void> {
  constructor(
    public readonly eventId: string,
    public readonly type: PaymentEventType,
    public readonly paymentIntentId: string,
  ) {
    super();
  }
}

@CommandHandler(HandlePaymentEventCommand)
export class HandlePaymentEventCommandHandler implements ICommandHandler<HandlePaymentEventCommand> {
  private readonly logger = new Logger(HandlePaymentEventCommandHandler.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly esimService: EsimService,
  ) {}

  async execute({
    eventId,
    type,
    paymentIntentId,
  }: HandlePaymentEventCommand): Promise<void> {
    const order = await this.orderService.getByPaymentIntentId(paymentIntentId);
    this.logger.log(
      `webhook received event=${eventId} type=${type} order=${order.id}`,
    );
    if (type === PaymentEventType.Failed) {
      await this.orderService.markFailed(order.id);
      return;
    }
    if (order.status === OrderStatus.Fulfilled) {
      return;
    }
    await this.orderService.markPaid(order.id);
    try {
      await this.esimService.provision(order.id, order.planId);
    } catch {
      await this.orderService.markFailed(order.id);
      return;
    }
    await this.orderService.markFulfilled(order.id);
  }
}
