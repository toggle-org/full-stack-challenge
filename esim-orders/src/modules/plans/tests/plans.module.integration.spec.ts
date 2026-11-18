import { QueryBus } from '@nestjs/cqrs';
import supertest from 'supertest';

import { createTestApp, TestApp } from '../../../test-utils/test-app';
import { PlanNotFoundError } from '../errors/plan-not-found.error';
import { PlanView } from '../plan.view';
import { GetPlanQuery } from '../queries/get-plan.query';

describe('PlansModule', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /plans returns the seeded plans cheapest first', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/plans')
      .expect(200);
    const plans = response.body as PlanView[];

    expect(plans.map((plan) => plan.id)).toEqual([
      'eu-5gb',
      'global-3gb',
      'us-10gb',
    ]);
    expect(plans[0]).toEqual({
      id: 'eu-5gb',
      name: 'Europe 5 GB',
      dataGb: 5,
      validityDays: 30,
      priceCents: 1199,
      currency: 'USD',
    });
  });

  it('GetPlanQuery rejects an unknown plan', async () => {
    await expect(
      app.get(QueryBus).execute(new GetPlanQuery('nope')),
    ).rejects.toBeInstanceOf(PlanNotFoundError);
  });
});
