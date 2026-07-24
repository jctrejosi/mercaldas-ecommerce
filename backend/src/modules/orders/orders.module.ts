import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { PaymentVerificationService } from './payment-verification.service';
import { WebhookController } from './webhook.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [OrdersController, WebhookController],
  providers: [OrdersService, OrdersGateway, PaymentVerificationService],
  exports: [OrdersService],
})
export class OrdersModule {}
