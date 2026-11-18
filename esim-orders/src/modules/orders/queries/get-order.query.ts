import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { OrderView } from '../order.view';
import { EsimService } from '../services/esim.service';
import { OrderService } from '../services/order.service';

export class GetOrderQuery extends Query<OrderView> {
  constructor(public readonly orderId: string) {
    super();
  }
}

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery> {
  constructor(
    private readonly orderService: OrderService,
    private readonly esimService: EsimService,
  ) {}

  async execute(query: GetOrderQuery): Promise<OrderView> {
    const order = await this.orderService.getById(query.orderId);
    const esim = await this.esimService.findByOrderId(order.id);
    return {
      id: order.id,
      status: order.status,
      planId: order.planId,
      email: order.email,
      amountCents: order.amountCents,
      currency: order.currency,
      esim: esim
        ? { iccid: esim.iccid, activationCode: esim.activationCode }
        : null,
    };
  }
}
