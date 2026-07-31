import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  like,
  or,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  customerAddresses,
  customers,
  media,
  orderItems,
  orders,
  orderStatusHistory,
  paymentIntents,
  payments,
  productImages,
  productVariants,
  products,
  shipments,
} from '../../../drizzle/schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentVerificationService } from './payment-verification.service';
import { WompiService } from '../payments/wompi.service';
import { EpaycoService } from '../payments/epayco.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly wompiService: WompiService,
    private readonly epaycoService: EpaycoService,
    private readonly paymentVerification: PaymentVerificationService,
    private readonly notificationsService: NotificationsService,
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

    const cardProvider = dto.paymentDetails?.card?.provider ?? 'epayco';

    const cardTransaction =
      dto.paymentMethod === 'tarjeta'
        ? cardProvider === 'wompi'
          ? await this.wompiService.createCardTransaction({
              amountInCents,
              customerEmail: customer.email,
              reference: referenceCode,
              acceptanceToken: dto.paymentDetails!.card!.acceptanceToken!,
              acceptPersonalAuth: dto.paymentDetails!.card!.acceptPersonalAuth!,
              cardToken: dto.paymentDetails!.card!.cardToken,
              installments: dto.paymentDetails!.card!.installments ?? 1,
              customerData: {
                phone_number: dto.address.phone,
                full_name: dto.address.name,
              },
            })
          : await this.epaycoService.createCardCharge({
              tokenCard: dto.paymentDetails!.card!.cardToken,
              customerEmail: customer.email,
              amount: grandTotal,
              tax: 0,
              taxBase: grandTotal,
              description: `Pedido ${referenceCode}`,
              invoice: referenceCode,
              installments: dto.paymentDetails!.card!.installments ?? 1,
              name: dto.address.name,
              address: dto.address.address,
              phone: dto.address.phone,
              city: dto.address.city,
            })
        : null;

    const isApprovedCardPayment =
      cardProvider === 'wompi'
        ? cardTransaction?.status === 'APPROVED'
        : ['Aceptada', 'Aprobada', 'APPROVED', 'approved'].includes(
            String(cardTransaction?.status ?? cardTransaction?.respuesta ?? ''),
          );
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
            cardTransaction?.id?.toString() ??
            cardTransaction?.ref_payco?.toString() ??
            `pi_${referenceCode}`,
          providerResponse: {
            paymentMethod: dto.paymentMethod,
            simulated: dto.paymentMethod !== 'tarjeta',
            provider:
              dto.paymentMethod === 'tarjeta'
                ? cardProvider
                : this.mapPaymentProvider(dto.paymentMethod),
            shippingType: dto.shippingType,
            paymentDetails: this.buildPaymentResponse(dto),
            cardTransaction,
          },
          idempotencyKey: `checkout-${referenceCode}`,
        })
        .returning({ id: paymentIntents.id });

      await tx.insert(payments).values({
        orderId,
        paymentIntentId: Number(insertedPaymentIntent[0].id),
        providerTransactionId:
          cardTransaction?.id?.toString() ??
          cardTransaction?.ref_payco?.toString() ??
          `pay_${referenceCode}`,
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
        cardTransaction,
      };
    });

    if (dto.paymentMethod === 'tarjeta' && orderStatus === 'payment_pending') {
      this.paymentVerification.verifyAndNotify(
        result.orderId,
        result.referenceCode,
        result.cardTransaction,
      );
    }

    // Notify customer about order creation
    await this.notificationsService.create({
      type: 'ORDER',
      title:
        orderStatus === 'payment_pending'
          ? 'Pedido recibido - Pago pendiente'
          : 'Pedido confirmado',
      message:
        orderStatus === 'payment_pending'
          ? `Tu pedido ${result.referenceCode} está pendiente de confirmación de pago. Te notificaremos cuando se apruebe.`
          : `Tu pedido ${result.referenceCode} ha sido registrado y será procesado pronto.`,
      targetCustomerId: customerId,
      linkUrl: `/account?tab=orders`,
    });

    return result;
  }

  async getOrders(customerId: number) {
    const orderRows = await this.db
      .select({
        id: orders.id,
        referenceCode: orders.referenceCode,
        status: orders.status,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        grandTotal: orders.grandTotal,
        createdAt: orders.createdAt,
        addressLine1: customerAddresses.addressLine1,
        addressLine2: customerAddresses.addressLine2,
        city: customerAddresses.city,
        paymentMethod: payments.paymentMethod,
      })
      .from(orders)
      .leftJoin(
        customerAddresses,
        eq(customerAddresses.id, orders.customerAddressId),
      )
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    if (!orderRows.length) return [];

    const orderIds = orderRows.map((r) => Number(r.id));

    const itemRows = await this.db
      .select({
        orderId: orderItems.orderId,
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPriceNet,
        total: orderItems.total,
        variantSku: orderItems.variantSku,
        productVariantId: orderItems.productVariantId,
        image: media.path,
      })
      .from(orderItems)
      .leftJoin(
        productVariants,
        eq(productVariants.id, orderItems.productVariantId),
      )
      .leftJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(inArray(orderItems.orderId, orderIds))
      .orderBy(asc(orderItems.id));

    const itemsByOrderId = new Map<number, typeof itemRows>();
    for (const item of itemRows) {
      const oid = Number(item.orderId);
      const list = itemsByOrderId.get(oid) ?? [];
      list.push(item);
      itemsByOrderId.set(oid, list);
    }

    return orderRows.map((row) => {
      const items = (itemsByOrderId.get(Number(row.id)) ?? []).map((item) => ({
        name: item.productName,
        price: Number(item.unitPrice ?? 0),
        quantity: Number(item.quantity ?? 1),
        total: Number(item.total ?? 0),
        image: item.image ?? null,
        unit: 'unidad',
        category: '',
      }));

      const address = [row.addressLine1, row.addressLine2, row.city]
        .filter(Boolean)
        .join(', ');

      return {
        id: row.referenceCode,
        date: row.createdAt ?? '',
        items,
        total: Number(row.grandTotal ?? 0),
        shipping: Number(row.shippingCost ?? 0),
        address,
        paymentMethod: this.reverseMapPaymentMethod(row.paymentMethod),
        status: this.mapOrderStatus(row.status),
      };
    });
  }

  private reverseMapPaymentMethod(method: string | null) {
    switch (method) {
      case 'CARD':
        return 'tarjeta';
      case 'PSE':
        return 'pse';
      case 'CASH':
        return 'efectivo';
      case 'NEQUI':
        return 'nequi';
      case 'DAVIPLATA':
        return 'daviplata';
      case 'BANK_TRANSFER':
        return 'efectivo';
      default:
        return 'efectivo';
    }
  }

  private mapOrderStatus(status: string | null) {
    switch (status) {
      case 'created':
        return 'preparando';
      case 'confirmed':
        return 'preparando';
      case 'payment_pending':
        return 'pendiente';
      case 'paid':
        return 'preparando';
      case 'preparing':
        return 'preparando';
      case 'shipped':
        return 'en camino';
      case 'delivered':
        return 'entregado';
      case 'cancelled':
        return 'cancelado';
      default:
        return 'preparando';
    }
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
        !card.last4 ||
        !card.brand ||
        (card.provider === 'wompi' &&
          (!card.acceptanceToken || !card.acceptPersonalAuth))
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
        provider: card?.provider ?? 'epayco',
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
        return 'card_gateway';
      case 'pse':
        return 'pse';
      case 'nequi':
        return 'nequi';
      case 'efectivo':
      default:
        return 'cash_on_delivery';
    }
  }

  // ── Admin methods ──

  async getAllOrders(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: any[] = [];

    if (filters?.status) {
      const dbStatus = this.adminMapStatusToDb(filters.status);
      if (dbStatus) {
        conditions.push(
          eq(
            orders.status,
            dbStatus as (typeof orders.status.enumValues)[number],
          ),
        );
      }
    }

    if (filters?.search) {
      const s = `%${filters.search}%`;
      conditions.push(
        or(
          like(orders.referenceCode, s),
          like(customers.firstName, s),
          like(customers.lastName, s),
          like(customers.email, s),
        ),
      );
    }

    const query = this.db
      .select({
        id: orders.id,
        referenceCode: orders.referenceCode,
        status: orders.status,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        grandTotal: orders.grandTotal,
        notes: orders.notes,
        createdAt: orders.createdAt,
        customerId: orders.customerId,
        customerName: sql<string>`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        addressLine1: customerAddresses.addressLine1,
        addressLine2: customerAddresses.addressLine2,
        city: customerAddresses.city,
        paymentMethod: payments.paymentMethod,
        paymentStatus: payments.status,
      })
      .from(orders)
      .leftJoin(customers, eq(customers.id, orders.customerId))
      .leftJoin(
        customerAddresses,
        eq(customerAddresses.id, orders.customerAddressId),
      )
      .leftJoin(payments, eq(payments.orderId, orders.id));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    query.orderBy(desc(orders.createdAt));

    if (filters?.limit) {
      query.limit(filters.limit);
    }
    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const rows = await query;

    // Get item counts per order
    const orderIds = rows.map((r) => Number(r.id));
    const itemCounts = new Map<number, number>();
    if (orderIds.length > 0) {
      const countRows = await this.db
        .select({
          orderId: orderItems.orderId,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
        .groupBy(orderItems.orderId);
      for (const cr of countRows) {
        itemCounts.set(Number(cr.orderId), Number(cr.count));
      }
    }

    return rows.map((row) => ({
      id: row.referenceCode,
      orderId: Number(row.id),
      customer: row.customerName ?? row.customerEmail ?? 'Cliente',
      phone: row.customerPhone ?? '',
      address: [row.addressLine1, row.addressLine2, row.city]
        .filter(Boolean)
        .join(', '),
      total: Number(row.grandTotal ?? 0),
      payment: this.reverseMapPaymentMethod(row.paymentMethod),
      status: this.mapOrderStatus(row.status),
      itemsCount: itemCounts.get(Number(row.id)) ?? 0,
      date: row.createdAt
        ? new Date(row.createdAt).toISOString().split('T')[0]
        : '',
      time: row.createdAt
        ? new Date(row.createdAt).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      note: row.notes ?? undefined,
    }));
  }

  async getOrderById(orderId: number) {
    const row = await this.db
      .select({
        id: orders.id,
        referenceCode: orders.referenceCode,
        status: orders.status,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        grandTotal: orders.grandTotal,
        notes: orders.notes,
        createdAt: orders.createdAt,
        customerId: orders.customerId,
        customerName: sql<string>`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        addressLine1: customerAddresses.addressLine1,
        addressLine2: customerAddresses.addressLine2,
        city: customerAddresses.city,
        paymentMethod: payments.paymentMethod,
      })
      .from(orders)
      .leftJoin(customers, eq(customers.id, orders.customerId))
      .leftJoin(
        customerAddresses,
        eq(customerAddresses.id, orders.customerAddressId),
      )
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.id, BigInt(orderId)))
      .limit(1);

    if (!row.length) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const o = row[0];

    // Get items
    const items = await this.db
      .select({
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPriceNet,
        total: orderItems.total,
        variantSku: orderItems.variantSku,
        image: media.path,
      })
      .from(orderItems)
      .leftJoin(
        productVariants,
        eq(productVariants.id, orderItems.productVariantId),
      )
      .leftJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(eq(orderItems.orderId, Number(orderId)))
      .orderBy(asc(orderItems.id));

    // Get status history
    const history = await this.db
      .select({
        status: orderStatusHistory.status,
        note: orderStatusHistory.note,
        createdAt: orderStatusHistory.createdAt,
      })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, Number(orderId)))
      .orderBy(asc(orderStatusHistory.createdAt));

    return {
      id: o.referenceCode,
      customer: o.customerName ?? o.customerEmail ?? 'Cliente',
      phone: o.customerPhone ?? '',
      address: [o.addressLine1, o.addressLine2, o.city]
        .filter(Boolean)
        .join(', '),
      items: items.map((item) => ({
        name: item.productName,
        qty: Number(item.quantity ?? 1),
        price: Number(item.unitPrice ?? 0),
      })),
      total: Number(o.grandTotal ?? 0),
      payment: this.reverseMapPaymentMethod(o.paymentMethod),
      status: this.mapOrderStatus(o.status),
      date: o.createdAt
        ? new Date(o.createdAt).toISOString().split('T')[0]
        : '',
      time: o.createdAt
        ? new Date(o.createdAt).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      note: o.notes ?? undefined,
      statusHistory: history.map((h) => ({
        status: this.mapOrderStatus(h.status),
        note: h.note ?? undefined,
        time: h.createdAt
          ? new Date(h.createdAt).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      })),
    };
  }

  async updateOrderStatus(orderId: number, newStatus: string) {
    const dbStatus = this.adminMapStatusToDb(newStatus);
    if (!dbStatus) {
      throw new BadRequestException(`Estado inválido: ${newStatus}`);
    }

    const [existing] = await this.db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, BigInt(orderId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Pedido no encontrado');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          status: dbStatus as (typeof orders.status.enumValues)[number],
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, BigInt(orderId)));

      await tx.insert(orderStatusHistory).values({
        orderId,
        status: dbStatus as (typeof orders.status.enumValues)[number],
        oldStatus: existing.status,
        createdAt: new Date().toISOString(),
      });
    });

    return {
      success: true,
      status: this.mapOrderStatus(dbStatus),
      orderId,
    };
  }

  private adminMapStatusToDb(status: string): string | null {
    switch (status) {
      case 'pendiente':
        return 'payment_pending';
      case 'confirmado':
        return 'paid';
      case 'preparando':
        return 'preparing';
      case 'listo':
        return 'shipped';
      case 'en camino':
        return 'shipped';
      case 'entregado':
        return 'delivered';
      case 'cancelado':
        return 'cancelled';
      default:
        return null;
    }
  }
}
