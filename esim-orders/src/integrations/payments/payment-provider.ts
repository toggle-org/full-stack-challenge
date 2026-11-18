export interface PaymentIntent {
  id: string;
  clientSecret: string;
}

export interface Refund {
  id: string;
  paymentIntentId: string;
  amountCents: number;
}

export interface PaymentProvider {
  createPaymentIntent(
    amountCents: number,
    currency: string,
  ): Promise<PaymentIntent>;
  refund(paymentIntentId: string, amountCents: number): Promise<{ id: string }>;
}
