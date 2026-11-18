import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntegrationsModule } from '../../integrations/integrations.module';

import { CreateOrderCommandHandler } from './commands/create-order.command';
import { HandlePaymentEventCommandHandler } from './commands/handle-payment-event.command';
import { OrdersController } from './controllers/orders.controller';
import { PaymentWebhooksController } from './controllers/payment-webhooks.controller';
import { Esim } from './entities/esim.entity';
import { Order } from './entities/order.entity';
import { GetOrderQueryHandler } from './queries/get-order.query';
import { EsimService } from './services/esim.service';
import { OrderService } from './services/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Esim]), IntegrationsModule],
  controllers: [OrdersController, PaymentWebhooksController],
  providers: [
    OrderService,
    EsimService,
    CreateOrderCommandHandler,
    HandlePaymentEventCommandHandler,
    GetOrderQueryHandler,
  ],
})
export class OrdersModule {}
