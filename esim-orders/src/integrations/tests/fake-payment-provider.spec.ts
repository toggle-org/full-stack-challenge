import { FakePaymentProvider } from '../payments/fake-payment-provider';

describe('FakePaymentProvider', () => {
  let provider: FakePaymentProvider;

  beforeEach(() => {
    provider = new FakePaymentProvider();
  });

  it('createPaymentIntent returns a pi_ id and a client secret', async () => {
    const intent = await provider.createPaymentIntent(1199, 'USD');

    expect(intent.id).toMatch(/^pi_/);
    expect(intent.clientSecret).toContain(intent.id);
  });

  it('refund returns a re_ id and records the refund', async () => {
    const intent = await provider.createPaymentIntent(1199, 'USD');

    const refund = await provider.refund(intent.id, 1199);

    expect(refund.id).toMatch(/^re_/);
    expect(await provider.findRefunds(intent.id)).toEqual([
      { id: refund.id, paymentIntentId: intent.id, amountCents: 1199 },
    ]);
  });
});
