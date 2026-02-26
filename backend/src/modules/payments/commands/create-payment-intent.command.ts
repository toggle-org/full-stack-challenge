export class CreatePaymentIntentCommand {
  constructor(
    public readonly planId: string,
    public readonly email: string,
  ) {}
}
