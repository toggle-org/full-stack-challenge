import {
  Command,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';

import { GetPlanQuery } from '../../plans/queries/get-plan.query';
import { CreatedOrder } from '../order.view';
import { OrderService } from '../services/order.service';

export class CreateOrderCommand extends Command<CreatedOrder> {
  constructor(
    public readonly planId: string,
    public readonly email: string,
  ) {
    super();
  }
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly orderService: OrderService,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreatedOrder> {
    const plan = await this.queryBus.execute(new GetPlanQuery(command.planId));
    return this.orderService.create(plan, command.email);
  }
}
