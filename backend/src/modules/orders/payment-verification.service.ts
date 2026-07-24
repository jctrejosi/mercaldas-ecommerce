import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { orders } from '../../../drizzle/schema';
import { OrdersGateway } from './orders.gateway';
import { WompiService } from '../payments/wompi.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentVerificationService {
  private readonly logger = new Logger(PaymentVerificationService.name);

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly ordersGateway: OrdersGateway,
    private readonly wompiService: WompiService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async verifyAndNotify(orderId: number, referenceCode: string, cardTransaction: any) {
    this.logger.log(`Verifying payment for order ${referenceCode} (id: ${orderId})`);

    const transactionId = cardTransaction?.id;

    if (!transactionId) return;

    // Look up customer for notifications
    const orderRow = await this.drizzleService.db
      .select({ customerId: orders.customerId })
      .from(orders)
      .where(eq(orders.id, BigInt(orderId)))
      .limit(1);
    const customerId = orderRow[0]?.customerId;

    let attempts = 0;
    const maxAttempts = 10;

    const check = async () => {
      attempts++;
      try {
        const response = await this.wompiService.getTransaction(String(transactionId));
        const status = response?.data?.status ?? response?.status;

        this.logger.log(`Attempt ${attempts}: Wompi status = ${status}`);

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
              message: `Tu pedido ${referenceCode} ha sido aprobado y está siendo preparado.`,
              targetCustomerId: customerId,
              linkUrl: `/account?tab=orders`,
            });
          }
          this.logger.log(`Order ${referenceCode} payment confirmed`);
          return;
        }

        if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
          await this.drizzleService.db
            .update(orders)
            .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
            .where(eq(orders.id, BigInt(orderId)));
          this.ordersGateway.notifyOrderStatus(String(orderId), 'cancelado');
          if (customerId) {
            await this.notificationsService.create({
              type: 'ORDER',
              title: 'Pago rechazado',
              message: `El pago de tu pedido ${referenceCode} fue rechazado. Intenta de nuevo.`,
              targetCustomerId: customerId,
              linkUrl: '/catalog',
            });
          }
          this.logger.log(`Order ${referenceCode} payment declined`);
          return;
        }
      } catch (err) {
        this.logger.warn(`Attempt ${attempts} failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      if (attempts < maxAttempts) {
        setTimeout(check, 3000);
      }
    };

    setTimeout(check, 2000);
  }
}
