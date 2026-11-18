import { OrderStatus } from './order-status';

export interface CreatedOrder {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
}

export interface OrderView {
  id: string;
  status: OrderStatus;
  planId: string;
  email: string;
  amountCents: number;
  currency: string;
  esim: { iccid: string; activationCode: string } | null;
}
