import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  @ApiOkResponse({
    schema: {
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  async createSubscription(@Body() dto: CreateSubscriptionDto): Promise<{
    status: 'ok';
  }> {
    return this.commandBus.execute(
      new CreateSubscriptionCommand(dto.planId, dto.paymentMethodId, dto.email),
    );
  }
}
