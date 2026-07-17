import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  customerAddresses,
  customers,
  orderItems,
  orders,
  orderStatusHistory,
  paymentIntents,
  payments,
  productVariants,
  products,
  shipments,
} from '../../../drizzle/schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { WompiService } from '../payments/wompi.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly wompiService: WompiService,
  ) {}

  private get db() {
    return this.drizzleService.db;
  }

  async checkout(customerId: number, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('El carrito no puede estar vacío');
    }

    this.validatePaymentDetails(dto);

    const customer = await this.getCustomer(customerId);
    const branch = await this.getDefaultBranch();
    const shippingCost = dto.shippingType === 'express' ? 9900 : 4900;

    const productIds = dto.items.map((item) => item.productId);
    const variants = await this.db
      .select({
        variantId: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        price: productVariants.currentPrice,
        productName: products.name,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(
        and(
          inArray(productVariants.productId, productIds),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
          eq(products.isActive, true),
          isNull(products.deletedAt),
        ),
      )
      .orderBy(asc(productVariants.productId), asc(productVariants.id));

    const variantByProductId = new Map<number, (typeof variants)[number]>();
    for (const variant of variants) {
      const productId = Number(variant.productId);
      if (!variantByProductId.has(productId)) {
        variantByProductId.set(productId, variant);
      }
    }

    const missingProductIds = productIds.filter(
      (productId) => !variantByProductId.has(productId),
    );

    if (missingProductIds.length) {
      throw new NotFoundException(
        `No se encontraron variantes activas para los productos: ${missingProductIds.join(', ')}`,
      );
    }

    const normalizedItems = dto.items.map((item) => {
      const variant = variantByProductId.get(item.productId)!;
      const unitPrice = Number(variant.price);
      const subtotal = unitPrice * item.quantity;

      return {
        productId: item.productId,
        productVariantId: Number(variant.variantId),
        productName: variant.productName,
        variantSku: variant.sku,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const grandTotal = subtotal + shippingCost;
    const amountInCents = grandTotal * 100;
    const referenceCode = this.buildReferenceCode();

    const wompiTransaction =
      dto.paymentMethod === 'tarjeta'
        ? await this.wompiService.createCardTransaction({
            amountInCents,
            customerEmail: customer.email,
            reference: referenceCode,
            acceptanceToken: dto.paymentDetails!.card!.acceptanceToken,
            acceptPersonalAuth: dto.paymentDetails!.card!.acceptPersonalAuth,
            cardToken: dto.paymentDetails!.card!.cardToken,
            installments: dto.paymentDetails!.card!.installments ?? 1,
            customerData: {
              phone_number: dto.address.phone,
              full_name: dto.address.name,
            },
          })
        : null;

    const isApprovedCardPayment = wompiTransaction?.status === 'APPROVED';
    const orderStatus =
      dto.paymentMethod === 'efectivo'
        ? 'created'
        : isApprovedCardPayment
          ? 'paid'
          : 'payment_pending';
    const paymentIntentStatus =
      dto.paymentMethod === 'efectivo'
        ? 'pending'
        : isApprovedCardPayment
          ? 'authorized'
          : 'pending';
    const paymentStatus =
      dto.paymentMethod === 'efectivo'
        ? 'PENDING'
        : isApprovedCardPayment
          ? 'COMPLETED'
          : 'PENDING';

    const result = await this.drizzleService.transaction(async (tx) => {
      const insertedAddresses = await tx
        .insert(customerAddresses)
        .values({
          customerId,
          addressLine1: dto.address.address,
          city: dto.address.city,
          country: 'Colombia',
          reference: dto.address.name,
          deliveryInstructions: dto.address.notes,
        })
        .returning({ id: customerAddresses.id });

      const customerAddressId = Number(insertedAddresses[0].id);

      const insertedOrders = await tx
        .insert(orders)
        .values({
          referenceCode,
          customerId,
          branchId: Number(branch.id),
          customerAddressId,
          status: orderStatus,
          currencyCode: 'COP',
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          grandTotal: String(grandTotal),
          notes: dto.address.notes,
        })
        .returning({ id: orders.id, referenceCode: orders.referenceCode });

      const orderId = Number(insertedOrders[0].id);

      await tx.insert(orderItems).values(
        normalizedItems.map((item) => ({
          orderId,
          productVariantId: item.productVariantId,
          productName: item.productName,
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPriceNet: String(item.unitPrice),
          unitPriceGross: String(item.unitPrice),
          subtotal: String(item.subtotal),
          total: String(item.subtotal),
        })),
      );

      await tx.insert(shipments).values({
        orderId,
        addressLine1: dto.address.address,
        city: dto.address.city,
        recipientName: dto.address.name,
        recipientPhone: dto.address.phone,
        status: 'PENDING',
      });

      const insertedPaymentIntent = await tx
        .insert(paymentIntents)
        .values({
          orderId,
          paymentMethod: this.mapPaymentMethod(dto.paymentMethod),
          status: paymentIntentStatus,
          amount: String(grandTotal),
          currency: 'COP',
          providerName: this.mapPaymentProvider(dto.paymentMethod),
          providerTransactionId:
            wompiTransaction?.id?.toString() ?? `pi_${referenceCode}`,
          providerResponse: {
            paymentMethod: dto.paymentMethod,
            simulated: dto.paymentMethod !== 'tarjeta',
            shippingType: dto.shippingType,
            paymentDetails: this.buildPaymentResponse(dto),
            wompiTransaction,
          },
          idempotencyKey: `checkout-${referenceCode}`,
        })
        .returning({ id: paymentIntents.id });

      await tx.insert(payments).values({
        orderId,
        paymentIntentId: Number(insertedPaymentIntent[0].id),
        providerTransactionId:
          wompiTransaction?.id?.toString() ?? `pay_${referenceCode}`,
        providerName: this.mapPaymentProvider(dto.paymentMethod),
        amount: String(grandTotal),
        currency: 'COP',
        paymentMethod: this.mapPaymentMethod(dto.paymentMethod),
        status: paymentStatus,
      });

      await tx.insert(orderStatusHistory).values({
        orderId,
        status: orderStatus,
        note: `Pedido creado desde ecommerce con pago ${dto.paymentMethod}`,
        createdBy: customerId,
      });

      return {
        orderId,
        referenceCode: insertedOrders[0].referenceCode,
        subtotal,
        shippingCost,
        grandTotal,
        paymentMethod: dto.paymentMethod,
        shippingType: dto.shippingType,
        address: dto.address,
        status: orderStatus,
        wompiTransaction,
      };
    });

    return result;
  }

  private async getCustomer(customerId: number) {
    const result = await this.db
      .select({
        id: customers.id,
        email: customers.email,
      })
      .from(customers)
      .where(eq(customers.id, BigInt(customerId)))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException(`Cliente con ID ${customerId} no encontrado`);
    }

    return result[0];
  }

  private validatePaymentDetails(dto: CreateOrderDto) {
    if (dto.paymentMethod === 'tarjeta') {
      const card = dto.paymentDetails?.card;
      if (
        !card?.cardholderName ||
        !card.cardToken ||
        !card.acceptanceToken ||
        !card.acceptPersonalAuth ||
        !card.last4 ||
        !card.brand
      ) {
        throw new BadRequestException(
          'Debes completar y tokenizar los datos de la tarjeta',
        );
      }
    }

    if (dto.paymentMethod === 'pse') {
      const pse = dto.paymentDetails?.pse;
      if (!pse?.bank || !pse.personType) {
        throw new BadRequestException(
          'Debes seleccionar banco y tipo de persona para PSE',
        );
      }
    }

    if (dto.paymentMethod === 'nequi') {
      const nequi = dto.paymentDetails?.nequi;
      if (!nequi?.phone) {
        throw new BadRequestException(
          'Debes ingresar el número asociado a Nequi',
        );
      }
    }
  }

  private buildPaymentResponse(dto: CreateOrderDto) {
    if (dto.paymentMethod === 'tarjeta') {
      const card = dto.paymentDetails?.card;
      return {
        cardholderName: card?.cardholderName,
        last4: card?.last4,
        brand: card?.brand,
        installments: card?.installments ?? 1,
      };
    }

    if (dto.paymentMethod === 'pse') {
      return dto.paymentDetails?.pse;
    }

    if (dto.paymentMethod === 'nequi') {
      return {
        phone: dto.paymentDetails?.nequi?.phone,
      };
    }

    return null;
  }

  private async getDefaultBranch() {
    const result = await this.db
      .select({ id: branches.id, name: branches.name })
      .from(branches)
      .where(and(eq(branches.isActive, true), isNull(branches.deletedAt)))
      .orderBy(asc(branches.priority), asc(branches.id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('No hay sucursales activas configuradas');
    }

    return result[0];
  }

  private buildReferenceCode() {
    return `MER-${Date.now().toString().slice(-8)}`;
  }

  private mapPaymentMethod(method: CreateOrderDto['paymentMethod']) {
    switch (method) {
      case 'tarjeta':
        return 'CARD';
      case 'pse':
        return 'PSE';
      case 'nequi':
        return 'NEQUI';
      case 'efectivo':
      default:
        return 'CASH';
    }
  }

  private mapPaymentProvider(method: CreateOrderDto['paymentMethod']) {
    switch (method) {
      case 'tarjeta':
        return 'wompi';
      case 'pse':
        return 'pse';
      case 'nequi':
        return 'nequi';
      case 'efectivo':
      default:
        return 'cash_on_delivery';
    }
  }
}
