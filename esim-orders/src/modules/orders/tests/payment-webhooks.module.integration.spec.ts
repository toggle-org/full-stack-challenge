import { faker } from '@faker-js/faker';
import supertest from 'supertest';

import { FakeEsimProvider } from '../../../integrations/esim-provider/fake-esim-provider';
import { ESIM_PROVIDER } from '../../../integrations/tokens';
import { createTestApp, TestApp, truncate } from '../../../test-utils/test-app';
import { CreatedOrder, OrderView } from '../order.view';

interface PaymentEvent {
  id: string;
  type: string;
  data: unknown;
}

describe('Payment webhooks', () => {
  let app: TestApp;
  let esimProvider: FakeEsimProvider;

  beforeAll(async () => {
    app = await createTestApp();
    esimProvider = app.get<FakeEsimProvider>(ESIM_PROVIDER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncate(app, ['esims', 'orders']);
    esimProvider.reset();
    esimProvider.configure({ latencyMs: 0 });
  });

  async function createOrder(): Promise<CreatedOrder> {
    const response = await supertest(app.getHttpServer())
      .post('/orders')
      .send({ planId: 'eu-5gb', email: faker.internet.email() });
    return response.body as CreatedOrder;
  }

  function postEvent(event: PaymentEvent): supertest.Test {
    return supertest(app.getHttpServer())
      .post('/webhooks/payments')
      .send(event);
  }

  function succeeded(paymentIntentId: string): PaymentEvent {
    return {
      id: `evt_${faker.string.alphanumeric(12)}`,
      type: 'payment_intent.succeeded',
      data: { paymentIntentId },
    };
  }

  async function getOrder(orderId: string): Promise<OrderView> {
    const response = await supertest(app.getHttpServer()).get(
      `/orders/${orderId}`,
    );
    return response.body as OrderView;
  }

  it('payment succeeded fulfils the order with one eSIM', async () => {
    const order = await createOrder();

    const response = await postEvent(succeeded(order.paymentIntentId));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
    const view = await getOrder(order.orderId);
    expect(view.status).toBe('fulfilled');
    expect(view.esim?.iccid).toMatch(/^8901260\d{12}$/);
    expect(await esimProvider.findByReference(order.orderId)).toHaveLength(1);
  });

  it('payment failed marks the order failed and provisions nothing', async () => {
    const order = await createOrder();

    const response = await postEvent({
      id: `evt_${faker.string.alphanumeric(12)}`,
      type: 'payment_intent.payment_failed',
      data: { paymentIntentId: order.paymentIntentId },
    });

    expect(response.status).toBe(200);
    expect(await getOrder(order.orderId)).toMatchObject({
      status: 'failed',
      esim: null,
    });
    expect(await esimProvider.findByReference(order.orderId)).toHaveLength(0);
  });

  it('a repeated event after fulfilment is ignored', async () => {
    const order = await createOrder();
    const event = succeeded(order.paymentIntentId);

    await postEvent(event);
    const repeated = await postEvent(event);

    expect(repeated.status).toBe(200);
    expect((await getOrder(order.orderId)).status).toBe('fulfilled');
    expect(await esimProvider.findByReference(order.orderId)).toHaveLength(1);
  });

  it('a provider error marks the order failed', async () => {
    esimProvider.configure({ mode: 'fail' });
    const order = await createOrder();

    const response = await postEvent(succeeded(order.paymentIntentId));

    expect(response.status).toBe(200);
    expect(await getOrder(order.orderId)).toMatchObject({
      status: 'failed',
      esim: null,
    });
  });

  it('an unknown payment intent returns 404', async () => {
    const response = await postEvent(succeeded('pi_unknown'));

    expect(response.status).toBe(404);
  });

  it('an unknown event type returns 400', async () => {
    const order = await createOrder();

    const response = await postEvent({
      id: `evt_${faker.string.alphanumeric(12)}`,
      type: 'charge.dispute.created',
      data: { paymentIntentId: order.paymentIntentId },
    });

    expect(response.status).toBe(400);
  });

  it('a body whose data is not an object returns 400', async () => {
    const order = await createOrder();

    const response = await postEvent({
      id: `evt_${faker.string.alphanumeric(12)}`,
      type: 'payment_intent.succeeded',
      data: [{ paymentIntentId: order.paymentIntentId }],
    });

    expect(response.status).toBe(400);
    expect((await getOrder(order.orderId)).status).toBe('pending_payment');
  });

  it('a body without data.paymentIntentId returns 400', async () => {
    const response = await postEvent({
      id: `evt_${faker.string.alphanumeric(12)}`,
      type: 'payment_intent.succeeded',
      data: {},
    });

    expect(response.status).toBe(400);
  });
});
