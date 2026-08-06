import { Injectable } from '@nestjs/common';
import { and, desc, eq, like, or, sql, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  customers,
  orders,
  payments,
} from '../../../drizzle/schema';

@Injectable()
export class CustomersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.db;
  }

  async getAllCustomers(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    // Subquery: total spent per customer
    const spentSubquery = this.db
      .select({
        customerId: orders.customerId,
        total: sql<number>`COALESCE(SUM(${orders.grandTotal}), 0)`.as('total'),
        orderCount: sql<number>`COUNT(${orders.id})::int`.as('orderCount'),
      })
      .from(orders)
      .groupBy(orders.customerId)
      .as('spent_sq');

    const conditions: any[] = [];
    if (filters?.search) {
      const s = `%${filters.search}%`;
      conditions.push(
        or(
          like(customers.firstName, s),
          like(customers.lastName, s),
          like(customers.email, s),
          like(customers.phone, s),
        ),
      );
    }

    const query = this.db
      .select({
        id: customers.id,
        email: customers.email,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        isActive: customers.isActive,
        createdAt: customers.createdAt,
        lastLoginAt: customers.lastLoginAt,
        totalSpent: spentSubquery.total,
        orderCount: spentSubquery.orderCount,
      })
      .from(customers)
      .leftJoin(spentSubquery, eq(spentSubquery.customerId, customers.id));

    if (conditions.length > 0) {
      query.where(and(...conditions) as any);
    }

    query.orderBy(desc(customers.createdAt));

    if (filters?.limit) query.limit(filters.limit);
    if (filters?.offset) query.offset(filters.offset);

    const rows = await query;

    // Get last order date per customer
    const customerIds = rows.map((r) => Number(r.id)).filter(Boolean);
    const lastOrderMap = new Map<number, string>();
    if (customerIds.length > 0) {
      const lastOrders = await this.db
        .select({
          customerId: orders.customerId,
          lastOrder: orders.createdAt,
        })
        .from(orders)
        .where(inArray(orders.customerId!, customerIds as any[]))
        .orderBy(desc(orders.createdAt));

      for (const lo of lastOrders) {
        const cid = lo.customerId;
        if (cid !== null && !lastOrderMap.has(cid)) {
          lastOrderMap.set(cid, lo.lastOrder ?? '');
        }
      }
    }

    return rows.map((row) => {
      const spent = Number(row.totalSpent ?? 0);
      const ordersCount = Number(row.orderCount ?? 0);
      const loyalty = computeLoyalty(spent, ordersCount);

      return {
        id: `C${String(row.id).padStart(3, '0')}`,
        rawId: Number(row.id),
        name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email,
        email: row.email,
        phone: row.phone ?? '',
        orders: ordersCount,
        spent,
        loyalty,
        joined: row.createdAt
          ? new Date(row.createdAt).toISOString().split('T')[0]
          : '',
        lastOrder: lastOrderMap.get(Number(row.id))
          ? new Date(lastOrderMap.get(Number(row.id))!).toISOString().split('T')[0]
          : '',
        avatar: [row.firstName?.[0], row.lastName?.[0]].filter(Boolean).join('') || '?',
        isActive: row.isActive,
      };
    });
  }

  async getCustomerById(id: number) {
    const spentRow = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.grandTotal}), 0)`,
        orderCount: sql<number>`COUNT(${orders.id})::int`,
        lastOrder: sql<string>`MAX(${orders.createdAt})`,
      })
      .from(orders)
      .where(eq(orders.customerId, id));

    const spent = Number(spentRow[0]?.total ?? 0);
    const orderCount = Number(spentRow[0]?.orderCount ?? 0);

    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, BigInt(id)))
      .limit(1);

    if (!customer) return null;

    const recentOrders = await this.db
      .select({
        id: orders.referenceCode,
        total: orders.grandTotal,
        createdAt: orders.createdAt,
        itemCount: sql<number>`0`,
      })
      .from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return {
      id: `C${String(id).padStart(3, '0')}`,
      name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email,
      email: customer.email,
      phone: customer.phone ?? '',
      loyalty: computeLoyalty(spent, orderCount),
      orders: orderCount,
      spent,
      joined: customer.createdAt
        ? new Date(customer.createdAt).toISOString().split('T')[0]
        : '',
      lastOrder: spentRow[0]?.lastOrder
        ? new Date(spentRow[0].lastOrder).toISOString().split('T')[0]
        : '',
      avatar: [customer.firstName?.[0], customer.lastName?.[0]].filter(Boolean).join('') || '?',
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        date: o.createdAt
          ? new Date(o.createdAt).toISOString().split('T')[0]
          : '',
        total: Number(o.total ?? 0),
      })),
    };
  }

  async getLoyaltyStats() {
    // Aggregate spend per customer WITH orders
    const spentRows = await this.db
      .select({
        customerId: orders.customerId,
        total: sql<number>`COALESCE(SUM(${orders.grandTotal}), 0)`.as('total'),
        orderCount: sql<number>`COUNT(${orders.id})::int`.as('orderCount'),
      })
      .from(orders)
      .where(sql`${orders.status} != 'cancelled'`)
      .groupBy(orders.customerId);

    const spentMap = new Map<number, { total: number; count: number }>();
    for (const row of spentRows) {
      if (row.customerId !== null) {
        spentMap.set(row.customerId, {
          total: Number(row.total ?? 0),
          count: Number(row.orderCount ?? 0),
        });
      }
    }

    // All active customers (those without orders count as bronce)
    const allCustomers = await this.db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.isActive, true), sql`${customers.deletedAt} is null`));

    const tiers = { platino: 0, oro: 0, plata: 0, bronce: 0 };

    for (const c of allCustomers) {
      const s = spentMap.get(Number(c.id)) ?? { total: 0, count: 0 };
      const tier = computeLoyalty(s.total, s.count);
      tiers[tier]++;
    }

    return tiers;
  }

  async getLoyaltyTiers(): Promise<LoyaltyTierConfig[]> {
    return LOYALTY_TIERS;
  }
}

function computeLoyalty(
  totalSpent: number,
  orderCount: number,
): 'bronce' | 'plata' | 'oro' | 'platino' {
  if (totalSpent >= 2000000 || orderCount >= 50) return 'platino';
  if (totalSpent >= 1000000 || orderCount >= 20) return 'oro';
  if (totalSpent >= 300000 || orderCount >= 8) return 'plata';
  return 'bronce';
}

export interface LoyaltyTierConfig {
  tier: 'bronce' | 'plata' | 'oro' | 'platino';
  label: string;
  icon: string;
  minSpent: number;
  minOrders: number;
  benefit: string;
}

export const LOYALTY_TIERS: LoyaltyTierConfig[] = [
  {
    tier: 'platino',
    label: 'Platino',
    icon: '💎',
    minSpent: 2000000,
    minOrders: 50,
    benefit: 'Envío gratis + 10% dto. permanente',
  },
  {
    tier: 'oro',
    label: 'Oro',
    icon: '🥇',
    minSpent: 1000000,
    minOrders: 20,
    benefit: 'Envío gratis + 7% dto. permanente',
  },
  {
    tier: 'plata',
    label: 'Plata',
    icon: '🥈',
    minSpent: 300000,
    minOrders: 8,
    benefit: 'Envío gratis en compras +$80.000',
  },
  {
    tier: 'bronce',
    label: 'Bronce',
    icon: '🥉',
    minSpent: 0,
    minOrders: 0,
    benefit: 'Acceso a ofertas exclusivas',
  },
];
