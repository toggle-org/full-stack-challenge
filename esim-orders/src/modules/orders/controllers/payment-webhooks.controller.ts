import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { HandlePaymentEventCommand } from '../commands/handle-payment-event.command';
import { PaymentEventDto } from '../dto/payment-event.dto';

@Controller('webhooks/payments')
export class PaymentWebhooksController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(@Body() event: PaymentEventDto): Promise<{ received: true }> {
    await this.commandBus.execute(
      new HandlePaymentEventCommand(
        event.id,
        event.type,
        event.data.paymentIntentId,
      ),
    );
    return { received: true };
  }
}
