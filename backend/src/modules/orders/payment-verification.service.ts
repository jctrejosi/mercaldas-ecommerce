import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { orders } from '../../../drizzle/schema';
import { OrdersGateway } from './orders.gateway';
import { WompiService } from '../payments/wompi.service';

@Injectable()
export class PaymentVerificationService {
  private readonly logger = new Logger(PaymentVerificationService.name);

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly ordersGateway: OrdersGateway,
    private readonly wompiService: WompiService,
  ) {}

  async verifyAndNotify(orderId: number, referenceCode: string, cardTransaction: any) {
    this.logger.log(`Verifying payment for order ${referenceCode} (id: ${orderId})`);

    const transactionId = cardTransaction?.id;

    if (!transactionId) {
      // No Wompi transaction to verify
      return;
    }

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
          this.logger.log(`Order ${referenceCode} payment confirmed`);
          return;
        }

        if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
          await this.drizzleService.db
            .update(orders)
            .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
            .where(eq(orders.id, BigInt(orderId)));
          this.ordersGateway.notifyOrderStatus(String(orderId), 'cancelado');
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
