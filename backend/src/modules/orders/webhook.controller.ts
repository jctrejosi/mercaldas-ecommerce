import {
  Controller,
  Post,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { createHash } from 'crypto';
import { Public } from '../../common/decorators/public.decorator';
import { DrizzleService } from '../../database/drizzle.service';
import { orders } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { OrdersGateway } from './orders.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly ordersGateway: OrdersGateway,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Public()
  @Post('wompi')
  @HttpCode(HttpStatus.OK)
  async handleWompiWebhook(
    @Headers('x-event-checksum') checksum: string,
    @Body() body: any,
  ) {
    const integrityKey = this.configService.get<string>('wompi.integrityKey') ?? '';

    const event = body?.event;
    const transaction = body?.data?.transaction;

    if (!event || !transaction?.reference) {
      return { ok: true };
    }

    this.logger.log(`Webhook received: ${event} for ${transaction.reference}`);

    if (event === 'transaction.updated') {
      const status = transaction.status;
      const reference = transaction.reference;

      const result = await this.drizzleService.db
        .select({ id: orders.id, status: orders.status, customerId: orders.customerId })
        .from(orders)
        .where(eq(orders.referenceCode, reference))
        .limit(1);

      if (result.length === 0) {
        this.logger.warn(`Order not found for reference: ${reference}`);
        return { ok: true };
      }

      const order = result[0];
      const orderId = Number(order.id);
      const customerId = order.customerId;

      if (status === 'APPROVED') {
        await this.drizzleService.db
          .update(orders)
          .set({ status: 'paid', updatedAt: new Date().toISOString() })
          .where(eq(orders.id, BigInt(orderId)));
        this.ordersGateway.notifyOrderStatus(String(orderId), 'preparando');
        if (customerId) {
          await this.notificationsService.create({
            type: 'ORDER',
            title: 'Pago confirmado',
            message: `Tu pedido ${reference} ha sido aprobado y está siendo preparado.`,
            targetCustomerId: customerId,
            linkUrl: `/account?tab=orders`,
          });
        }
        this.logger.log(`Order ${reference} payment approved`);
      } else if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
        await this.drizzleService.db
          .update(orders)
          .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
          .where(eq(orders.id, BigInt(orderId)));
        this.ordersGateway.notifyOrderStatus(String(orderId), 'cancelado');
        if (customerId) {
          await this.notificationsService.create({
            type: 'ORDER',
            title: 'Pago rechazado',
            message: `El pago de tu pedido ${reference} fue rechazado. Intenta de nuevo.`,
            targetCustomerId: customerId,
            linkUrl: '/catalog',
          });
        }
        this.logger.log(`Order ${reference} payment declined`);
      } else {
        this.logger.log(`Ignoring status: ${status}`);
      }
    }

    return { ok: true };
  }
}
