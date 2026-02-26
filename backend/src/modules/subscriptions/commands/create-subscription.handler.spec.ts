import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StripeService } from '../../stripe/stripe.service';
import { Plan } from '../../plans/plan.entity';
import { User } from '../../users/user.entity';
import { Subscription } from '../subscription.entity';
import { CreateSubscriptionCommand } from './create-subscription.command';
import { CreateSubscriptionHandler } from './create-subscription.handler';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('CreateSubscriptionHandler', () => {
  const customersListMock = jest.fn();
  const customersCreateMock = jest.fn();
  const customersUpdateMock = jest.fn();
  const paymentMethodRetrieveMock = jest.fn();
  const paymentMethodAttachMock = jest.fn();
  const subscriptionCreateMock = jest.fn();
  const subscriptionsCreateMock = jest.fn();
  const subscriptionsSaveMock = jest.fn();

  const plansRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Plan>;

  const usersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as Repository<User>;

  const subscriptionsRepository = {
    create: subscriptionsCreateMock,
    save: subscriptionsSaveMock,
  } as unknown as Repository<Subscription>;

  const stripeService = {
    client: {
      customers: {
        list: customersListMock,
        create: customersCreateMock,
        update: customersUpdateMock,
      },
      paymentMethods: {
        retrieve: paymentMethodRetrieveMock,
        attach: paymentMethodAttachMock,
      },
      subscriptions: {
        create: subscriptionCreateMock,
      },
    },
  } as unknown as StripeService;

  const handler = new CreateSubscriptionHandler(
    plansRepository,
    usersRepository,
    subscriptionsRepository,
    stripeService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates stripe and local subscription and user when email is new', async () => {
    const plan: Plan = {
      id: 'plan-1',
      name: 'Pro',
      description: 'desc',
      priceCents: 1999,
      currency: 'usd',
      stripePriceId: 'price_pro',
      createdAt: new Date(),
      subscriptions: [],
    };

    plansRepository.findOne = jest.fn().mockResolvedValue(plan);
    customersListMock.mockResolvedValue({
      data: [],
    });
    customersCreateMock.mockResolvedValue({
      id: 'cus_123',
    });
    paymentMethodRetrieveMock.mockResolvedValue({
      customer: null,
    });
    subscriptionCreateMock.mockResolvedValue({
      id: 'sub_123',
      status: 'active',
    });

    usersRepository.findOne = jest.fn().mockResolvedValue(null);
    usersRepository.create = jest
      .fn()
      .mockImplementation((input: User) => input);
    usersRepository.save = jest.fn().mockImplementation((input: User) => ({
      ...input,
      id: 'user-1',
    }));

    subscriptionsCreateMock.mockImplementation((input: Subscription) => input);
    subscriptionsSaveMock.mockResolvedValue({ id: 'local-sub-1' });

    const result = await handler.execute(
      new CreateSubscriptionCommand('plan-1', 'pm_123', 'user@example.com'),
    );

    expect(result).toEqual({ status: 'ok' });
    expect(customersCreateMock).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(subscriptionCreateMock).toHaveBeenCalled();
    expect(subscriptionsSaveMock).toHaveBeenCalled();
  });

  it('throws when plan does not exist', async () => {
    plansRepository.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      handler.execute(
        new CreateSubscriptionCommand(
          'missing-plan',
          'pm_123',
          'user@example.com',
        ),
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
