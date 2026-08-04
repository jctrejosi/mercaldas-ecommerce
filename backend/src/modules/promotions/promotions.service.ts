import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  and,
  eq,
  ilike,
  gte,
  lt,
  desc,
  sql,
  count,
  or,
  isNull,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  promotions,
  coupons,
  couponRedemptions,
  orders,
  customers,
} from '../../../drizzle/schema';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  QueryPromotionsDto,
} from './dto/promotion.dto';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  private computeStatus(promo: {
    isActive: boolean;
    startDate: string;
    endDate: string;
  }): 'activo' | 'programado' | 'expirado' | 'inactivo' {
    if (!promo.isActive) return 'inactivo';
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (now < start) return 'programado';
    if (now > end) return 'expirado';
    return 'activo';
  }

  async findAll(query: QueryPromotionsDto) {
    const conditions: ReturnType<typeof and>[] = [isNull(promotions.deletedAt)];

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        or(
          ilike(promotions.name, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM ${coupons}
            WHERE ${coupons.promotionId} = ${promotions.id}
            AND ${ilike(coupons.code, searchTerm)}
          )`,
        ),
      );
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const rows = await this.db
      .select({
        id: promotions.id,
        name: promotions.name,
        description: promotions.description,
        isAutoApply: promotions.isAutoApply,
        requiresCode: promotions.requiresCode,
        priority: promotions.priority,
        stackable: promotions.stackable,
        exclusive: promotions.exclusive,
        usageLimit: promotions.usageLimit,
        timesUsed: promotions.timesUsed,
        startDate: promotions.startDate,
        endDate: promotions.endDate,
        isActive: promotions.isActive,
        createdAt: promotions.createdAt,
        updatedAt: promotions.updatedAt,
        couponCode: coupons.code,
        couponMaxUsesTotal: coupons.maxUsesTotal,
        couponTimesUsed: coupons.timesUsed,
        couponMaxUsesPerCustomer: coupons.maxUsesPerCustomer,
      })
      .from(promotions)
      .leftJoin(coupons, eq(coupons.promotionId, promotions.id))
      .where(and(...conditions))
      .orderBy(desc(promotions.priority), desc(promotions.createdAt))
      .limit(limit)
      .offset(offset);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Promise.all(
      rows.map(async (row) => {
        const usagesToday = await this.getPromotionUsagesToday(Number(row.id));

        const status = this.computeStatus({
          isActive: row.isActive,
          startDate: row.startDate,
          endDate: row.endDate,
        });

        return {
          id: Number(row.id),
          name: row.name,
          description: row.description,
          discountType: row.couponCode ? 'cupon' : 'porcentaje',
          discountValue: '',
          couponCode: row.couponCode,
          couponMaxUsesTotal: row.couponMaxUsesTotal,
          couponTimesUsed: row.couponTimesUsed,
          couponMaxUsesPerCustomer: row.couponMaxUsesPerCustomer,
          isAutoApply: row.isAutoApply,
          requiresCode: row.requiresCode,
          priority: row.priority,
          stackable: row.stackable,
          exclusive: row.exclusive,
          usageLimit: row.usageLimit,
          timesUsed: row.timesUsed,
          startDate: row.startDate,
          endDate: row.endDate,
          isActive: row.isActive,
          status,
          usagesToday,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }),
    );

    if (query.status && query.status !== 'todas') {
      return result.filter((r) => r.status === query.status);
    }

    if (query.usagesToday === 'true') {
      return result.filter((r) => r.usagesToday > 0);
    }

    return result;
  }

  async getStats() {
    const allRows = await this.db
      .select({
        id: promotions.id,
        isActive: promotions.isActive,
        startDate: promotions.startDate,
        endDate: promotions.endDate,
      })
      .from(promotions)
      .where(isNull(promotions.deletedAt));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let activas = 0;
    let programadas = 0;
    let usosHoy = 0;

    for (const p of allRows) {
      const status = this.computeStatus({
        isActive: p.isActive,
        startDate: p.startDate,
        endDate: p.endDate,
      });
      if (status === 'activo') activas++;
      if (status === 'programado') programadas++;

      const todayCount = await this.getPromotionUsagesToday(Number(p.id));
      usosHoy += todayCount;
    }

    const discountResult = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${couponRedemptions.discountAmount}), 0)`,
      })
      .from(couponRedemptions)
      .where(
        and(
          gte(couponRedemptions.usedAt, today.toISOString()),
          lt(couponRedemptions.usedAt, tomorrow.toISOString()),
        ),
      );

    const descuentoAplicado = discountResult[0]?.total
      ? parseInt(discountResult[0].total, 10)
      : 0;

    return { activas, programadas, usosHoy, descuentoAplicado };
  }

  async findOne(id: number) {
    const row = await this.db
      .select({
        id: promotions.id,
        name: promotions.name,
        description: promotions.description,
        isAutoApply: promotions.isAutoApply,
        requiresCode: promotions.requiresCode,
        priority: promotions.priority,
        stackable: promotions.stackable,
        exclusive: promotions.exclusive,
        usageLimit: promotions.usageLimit,
        timesUsed: promotions.timesUsed,
        startDate: promotions.startDate,
        endDate: promotions.endDate,
        isActive: promotions.isActive,
        createdAt: promotions.createdAt,
        updatedAt: promotions.updatedAt,
        couponId: coupons.id,
        couponCode: coupons.code,
        couponMaxUsesTotal: coupons.maxUsesTotal,
        couponTimesUsed: coupons.timesUsed,
        couponMaxUsesPerCustomer: coupons.maxUsesPerCustomer,
        couponStartsAt: coupons.startsAt,
        couponExpiresAt: coupons.expiresAt,
        couponIsActive: coupons.isActive,
      })
      .from(promotions)
      .leftJoin(coupons, eq(coupons.promotionId, promotions.id))
      .where(and(eq(promotions.id, BigInt(id)), isNull(promotions.deletedAt)))
      .limit(1);

    if (!row.length) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }

    const promo = row[0];
    const status = this.computeStatus({
      isActive: promo.isActive,
      startDate: promo.startDate,
      endDate: promo.endDate,
    });

    const usagesToday = await this.getPromotionUsagesToday(id);

    return {
      id: Number(promo.id),
      name: promo.name,
      description: promo.description,
      discountType: promo.couponCode ? 'cupon' : 'porcentaje',
      discountValue: '',
      couponId: promo.couponId ? Number(promo.couponId) : null,
      couponCode: promo.couponCode,
      couponMaxUsesTotal: promo.couponMaxUsesTotal,
      couponTimesUsed: promo.couponTimesUsed,
      couponMaxUsesPerCustomer: promo.couponMaxUsesPerCustomer,
      couponStartsAt: promo.couponStartsAt,
      couponExpiresAt: promo.couponExpiresAt,
      couponIsActive: promo.couponIsActive,
      isAutoApply: promo.isAutoApply,
      requiresCode: promo.requiresCode,
      priority: promo.priority,
      stackable: promo.stackable,
      exclusive: promo.exclusive,
      usageLimit: promo.usageLimit,
      timesUsed: promo.timesUsed,
      startDate: promo.startDate,
      endDate: promo.endDate,
      isActive: promo.isActive,
      status,
      usagesToday,
      createdAt: promo.createdAt,
      updatedAt: promo.updatedAt,
    };
  }

  async getPromotionUsages(id: number, dateFilter?: 'today' | 'all') {
    const redemptions = await this.db
      .select({
        redemptionId: couponRedemptions.id,
        discountAmount: couponRedemptions.discountAmount,
        usedAt: couponRedemptions.usedAt,
        orderId: couponRedemptions.orderId,
        customerId: couponRedemptions.customerId,
        couponCode: coupons.code,
      })
      .from(couponRedemptions)
      .innerJoin(coupons, eq(coupons.id, couponRedemptions.couponId))
      .where(eq(coupons.promotionId, id))
      .orderBy(desc(couponRedemptions.usedAt));

    let filtered = redemptions;
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = redemptions.filter((r) => {
        const used = new Date(r.usedAt);
        return used >= today && used < tomorrow;
      });
    }

    const result = await Promise.all(
      filtered.map(async (r) => {
        let orderInfo: {
          id: number;
          orderNumber: string;
          total: string;
          status: string;
          createdAt: string;
        } | null = null;
        let customerInfo: {
          id: number;
          name: string;
          email: string;
        } | null = null;

        if (r.orderId) {
          const orderRows = await this.db
            .select({
              id: orders.id,
              referenceCode: orders.referenceCode,
              grandTotal: orders.grandTotal,
              status: orders.status,
              createdAt: orders.createdAt,
            })
            .from(orders)
            .where(eq(orders.id, BigInt(r.orderId)))
            .limit(1);
          if (orderRows.length) {
            orderInfo = {
              id: Number(orderRows[0].id),
              orderNumber: orderRows[0].referenceCode,
              total: orderRows[0].grandTotal,
              status: orderRows[0].status,
              createdAt: orderRows[0].createdAt,
            };
          }
        }

        if (r.customerId) {
          const customerRows = await this.db
            .select({
              id: customers.id,
              firstName: customers.firstName,
              lastName: customers.lastName,
              email: customers.email,
            })
            .from(customers)
            .where(eq(customers.id, BigInt(r.customerId)))
            .limit(1);
          if (customerRows.length) {
            customerInfo = {
              id: Number(customerRows[0].id),
              name: [customerRows[0].firstName, customerRows[0].lastName]
                .filter(Boolean)
                .join(' '),
              email: customerRows[0].email,
            };
          }
        }

        return {
          redemptionId: Number(r.redemptionId),
          discountAmount: r.discountAmount,
          usedAt: r.usedAt,
          couponCode: r.couponCode,
          order: orderInfo,
          customer: customerInfo,
        };
      }),
    );

    return result;
  }

  private async getPromotionUsagesToday(promotionId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.db
      .select({ cnt: count(couponRedemptions.id) })
      .from(couponRedemptions)
      .innerJoin(coupons, eq(coupons.id, couponRedemptions.couponId))
      .where(
        and(
          eq(coupons.promotionId, promotionId),
          gte(couponRedemptions.usedAt, today.toISOString()),
          lt(couponRedemptions.usedAt, tomorrow.toISOString()),
        ),
      );

    return result[0]?.cnt ?? 0;
  }

  async create(dto: CreatePromotionDto) {
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    if ((dto.discountType as string) === 'cupon' && !dto.couponCode) {
      throw new BadRequestException(
        'El código de cupón es requerido para promociones tipo cupón',
      );
    }

    if (dto.couponCode) {
      const existing = await this.db
        .select({ id: coupons.id })
        .from(coupons)
        .where(eq(coupons.code, dto.couponCode.toUpperCase()))
        .limit(1);
      if (existing.length) {
        throw new BadRequestException(
          `El código de cupón "${dto.couponCode}" ya existe`,
        );
      }
    }

    const requiresCode =
      (dto.discountType as string) === 'cupon' || !!dto.couponCode;

    const [newPromo] = await this.db
      .insert(promotions)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        isAutoApply: dto.isAutoApply ?? false,
        requiresCode,
        priority: dto.priority ?? 0,
        stackable: dto.stackable ?? false,
        exclusive: dto.exclusive ?? false,
        usageLimit: dto.usageLimit ?? null,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive ?? true,
      })
      .returning({ id: promotions.id });

    const promoId = Number(newPromo.id);

    if (dto.couponCode) {
      await this.db.insert(coupons).values({
        promotionId: promoId,
        code: dto.couponCode.toUpperCase(),
        maxUsesTotal: dto.maxUsesTotal ?? null,
        maxUsesPerCustomer: dto.maxUsesPerCustomer ?? 1,
        startsAt: dto.startDate,
        expiresAt: dto.endDate,
        isActive: true,
      });
    }

    this.logger.log(`Promoción creada: ID=${promoId}, nombre="${dto.name}"`);
    return this.findOne(promoId);
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const existing = await this.findOne(id);

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.endDate) <= new Date(dto.startDate)) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
    } else if (dto.startDate && !dto.endDate) {
      if (new Date(existing.endDate) <= new Date(dto.startDate)) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin actual',
        );
      }
    } else if (!dto.startDate && dto.endDate) {
      if (new Date(dto.endDate) <= new Date(existing.startDate)) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio actual',
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isAutoApply !== undefined) updateData.isAutoApply = dto.isAutoApply;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.stackable !== undefined) updateData.stackable = dto.stackable;
    if (dto.exclusive !== undefined) updateData.exclusive = dto.exclusive;
    if (dto.usageLimit !== undefined) updateData.usageLimit = dto.usageLimit;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const dt = dto.discountType as string | undefined;
    if (dt === 'cupon' || dto.couponCode) {
      updateData.requiresCode = true;
    } else if (dt && dt !== 'cupon') {
      updateData.requiresCode = false;
    }

    if (Object.keys(updateData).length > 0) {
      await this.db
        .update(promotions)
        .set(updateData)
        .where(eq(promotions.id, BigInt(id)));
    }

    // Update coupon
    if (dto.couponCode !== undefined) {
      if (dto.couponCode) {
        const existingCoupon = await this.db
          .select({ id: coupons.id })
          .from(coupons)
          .where(
            and(
              eq(coupons.code, dto.couponCode.toUpperCase()),
              sql`${coupons.promotionId} != ${id}`,
            ),
          )
          .limit(1);
        if (existingCoupon.length) {
          throw new BadRequestException(
            `El código de cupón "${dto.couponCode}" ya existe`,
          );
        }

        const currentCoupon = await this.db
          .select({ id: coupons.id })
          .from(coupons)
          .where(eq(coupons.promotionId, id))
          .limit(1);

        if (currentCoupon.length) {
          await this.db
            .update(coupons)
            .set({
              code: dto.couponCode.toUpperCase(),
              maxUsesTotal: dto.maxUsesTotal,
              maxUsesPerCustomer: dto.maxUsesPerCustomer,
              startsAt: dto.startDate ?? existing.startDate,
              expiresAt: dto.endDate ?? existing.endDate,
            })
            .where(eq(coupons.id, currentCoupon[0].id));
        } else {
          await this.db.insert(coupons).values({
            promotionId: id,
            code: dto.couponCode.toUpperCase(),
            maxUsesTotal: dto.maxUsesTotal ?? null,
            maxUsesPerCustomer: dto.maxUsesPerCustomer ?? 1,
            startsAt: dto.startDate ?? existing.startDate,
            expiresAt: dto.endDate ?? existing.endDate,
            isActive: true,
          });
        }
      }
    } else if (
      dto.maxUsesTotal !== undefined ||
      dto.maxUsesPerCustomer !== undefined
    ) {
      const couponUpdate: Record<string, unknown> = {};
      if (dto.maxUsesTotal !== undefined)
        couponUpdate.maxUsesTotal = dto.maxUsesTotal;
      if (dto.maxUsesPerCustomer !== undefined)
        couponUpdate.maxUsesPerCustomer = dto.maxUsesPerCustomer;
      await this.db
        .update(coupons)
        .set(couponUpdate)
        .where(eq(coupons.promotionId, id));
    }

    this.logger.log(`Promoción actualizada: ID=${id}`);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.db
      .update(promotions)
      .set({
        deletedAt: new Date().toISOString(),
        isActive: false,
      })
      .where(eq(promotions.id, BigInt(id)));

    await this.db
      .update(coupons)
      .set({ isActive: false })
      .where(eq(coupons.promotionId, id));

    this.logger.log(`Promoción eliminada (soft): ID=${id}`);
    return { success: true, message: 'Promoción eliminada exitosamente' };
  }
}
