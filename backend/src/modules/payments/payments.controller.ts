import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePaymentIntentCommand } from './commands/create-payment-intent.command';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create-intent')
  @ApiOkResponse({
    schema: {
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
      },
    },
  })
  async createIntent(@Body() dto: CreatePaymentIntentDto): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    return this.commandBus.execute(
      new CreatePaymentIntentCommand(dto.planId, dto.email),
    );
  }
}
