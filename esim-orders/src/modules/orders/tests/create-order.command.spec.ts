import { faker } from '@faker-js/faker';
import { QueryBus } from '@nestjs/cqrs';
import { mock } from 'vitest-mock-extended';

import { PlanView } from '../../plans/plan.view';
import { GetPlanQuery } from '../../plans/queries/get-plan.query';
import {
  CreateOrderCommand,
  CreateOrderCommandHandler,
} from '../commands/create-order.command';
import { CreatedOrder } from '../order.view';
import { OrderService } from '../services/order.service';

describe('CreateOrderCommandHandler', () => {
  it('executes GetPlanQuery then creates the order for that plan', async () => {
    const queryBus = mock<QueryBus>();
    const orderService = mock<OrderService>();
    const plan: PlanView = {
      id: 'eu-5gb',
      name: 'Europe 5 GB',
      dataGb: 5,
      validityDays: 30,
      priceCents: 1199,
      currency: 'USD',
    };
    const created: CreatedOrder = {
      orderId: faker.string.uuid(),
      paymentIntentId: 'pi_123',
      clientSecret: 'pi_123_secret_usd',
    };
    const email = faker.internet.email();
    queryBus.execute.mockResolvedValue(plan);
    orderService.create.mockResolvedValue(created);
    const handler = new CreateOrderCommandHandler(queryBus, orderService);

    const result = await handler.execute(
      new CreateOrderCommand('eu-5gb', email),
    );

    expect(result).toEqual(created);
    expect(queryBus.execute.mock.calls).toEqual([[new GetPlanQuery('eu-5gb')]]);
    expect(orderService.create.mock.calls).toEqual([[plan, email]]);
  });
});
