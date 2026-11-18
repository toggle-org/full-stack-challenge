import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateOrderCommand } from '../commands/create-order.command';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreatedOrder, OrderView } from '../order.view';
import { GetOrderQuery } from '../queries/get-order.query';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<CreatedOrder> {
    return this.commandBus.execute(
      new CreateOrderCommand(dto.planId, dto.email),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderView> {
    return this.queryBus.execute(new GetOrderQuery(id));
  }
}
