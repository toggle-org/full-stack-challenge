export class CreateSubscriptionCommand {
  constructor(
    public readonly planId: string,
    public readonly paymentMethodId: string,
    public readonly email: string,
  ) {}
}
