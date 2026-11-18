import { faker } from '@faker-js/faker';
import supertest from 'supertest';

import { createTestApp, TestApp, truncate } from '../../../test-utils/test-app';
import { CreatedOrder } from '../order.view';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('OrdersModule', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncate(app, ['esims', 'orders']);
  });

  it('POST /orders creates a pending_payment order priced from the plan', async () => {
    const email = faker.internet.email();

    const response = await supertest(app.getHttpServer())
      .post('/orders')
      .send({ planId: 'eu-5gb', email })
      .expect(201);
    const created = response.body as CreatedOrder;

    expect(created.orderId).toMatch(UUID);
    expect(created.paymentIntentId).toMatch(/^pi_/);
    expect(created.clientSecret).toBeTruthy();
    const order = await supertest(app.getHttpServer())
      .get(`/orders/${created.orderId}`)
      .expect(200);
    expect(order.body).toMatchObject({
      id: created.orderId,
      status: 'pending_payment',
      planId: 'eu-5gb',
      email,
      amountCents: 1199,
      currency: 'USD',
      esim: null,
    });
  });

  it('POST /orders with an unknown plan returns 404', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/orders')
      .send({ planId: 'nope', email: faker.internet.email() });

    expect(response.status).toBe(404);
  });

  it('POST /orders with an invalid email returns 400', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/orders')
      .send({ planId: 'eu-5gb', email: 'not-an-email' });

    expect(response.status).toBe(400);
  });

  it('GET /orders/:id returns 400 for a non-uuid and 404 for an unknown uuid', async () => {
    const invalid = await supertest(app.getHttpServer()).get('/orders/123');
    const unknown = await supertest(app.getHttpServer()).get(
      `/orders/${faker.string.uuid()}`,
    );

    expect(invalid.status).toBe(400);
    expect(unknown.status).toBe(404);
  });

  it('truncating order tables keeps the seeded plans', async () => {
    await truncate(app, ['esims', 'orders']);

    const response = await supertest(app.getHttpServer())
      .get('/plans')
      .expect(200);

    expect(response.body).toHaveLength(3);
  });
});
