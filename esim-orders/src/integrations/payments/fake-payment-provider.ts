import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PaymentIntent, PaymentProvider, Refund } from './payment-provider';

@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  private readonly intents = new Map<string, number>();
  private refunds: Refund[] = [];

  createPaymentIntent(
    amountCents: number,
    currency: string,
  ): Promise<PaymentIntent> {
    const id = `pi_${randomUUID().replaceAll('-', '')}`;
    this.intents.set(id, amountCents);
    return Promise.resolve({
      id,
      clientSecret: `${id}_secret_${currency.toLowerCase()}`,
    });
  }

  refund(
    paymentIntentId: string,
    amountCents: number,
  ): Promise<{ id: string }> {
    const refund: Refund = {
      id: `re_${randomUUID().replaceAll('-', '')}`,
      paymentIntentId,
      amountCents,
    };
    this.refunds.push(refund);
    return Promise.resolve({ id: refund.id });
  }

  findRefunds(paymentIntentId: string): Promise<Refund[]> {
    return Promise.resolve(
      this.refunds.filter(
        (refund) => refund.paymentIntentId === paymentIntentId,
      ),
    );
  }

  reset(): void {
    this.intents.clear();
    this.refunds = [];
  }
}
