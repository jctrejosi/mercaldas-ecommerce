import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, eq, desc, asc, isNull, ilike, or, sql, lt, lte } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  inventory,
  products,
  productVariants,
  branches,
} from '../../../drizzle/schema';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  async findAll(params: {
    branchId?: number;
    search?: string;
    stockFilter?: 'all' | 'low' | 'out' | 'normal';
    limit?: number;
    offset?: number;
  }) {
    const conditions: any[] = [isNull(products.deletedAt)];
    if (params.branchId) conditions.push(eq(inventory.branchId, params.branchId));
    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(
        or(
          ilike(products.name, s),
          ilike(productVariants.sku ?? sql`''`, s),
        ),
      );
    }
    if (params.stockFilter === 'low') {
      conditions.push(lte(inventory.stock, inventory.reorderPoint));
    } else if (params.stockFilter === 'out') {
      conditions.push(eq(inventory.stock, 0));
    } else if (params.stockFilter === 'normal') {
      conditions.push(lt(inventory.reorderPoint, inventory.stock));
    }

    const rows = await this.db
      .select({
        id: inventory.id,
        productId: sql<number>`${products.id}`,
        productName: products.name,
        variantId: sql<number>`${productVariants.id}`,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        price: productVariants.currentPrice,
        branchId: sql<number>`${branches.id}`,
        branchName: branches.name,
        stock: inventory.stock,
        reservedStock: inventory.reservedStock,
        reorderPoint: inventory.reorderPoint,
        minimumStock: inventory.minimumStock,
        maximumStock: inventory.maximumStock,
        targetStock: inventory.targetStock,
        lastMovementAt: inventory.lastMovementAt,
        updatedAt: inventory.updatedAt,
      })
      .from(inventory)
      .innerJoin(productVariants, eq(inventory.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(and(...conditions))
      .orderBy(asc(products.name), asc(branches.name))
      .limit(params.limit ?? 100)
      .offset(params.offset ?? 0);

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(inventory)
      .innerJoin(productVariants, eq(inventory.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(and(...conditions));

    return {
      items: rows.map((r) => ({
        id: Number(r.id),
        productId: r.productId,
        productName: r.productName,
        variantId: r.variantId,
        sku: r.sku,
        barcode: r.barcode,
        price: r.price,
        branchId: r.branchId,
        branchName: r.branchName,
        stock: r.stock ?? 0,
        reservedStock: r.reservedStock ?? 0,
        reorderPoint: r.reorderPoint ?? 0,
        minimumStock: r.minimumStock ?? 0,
        maximumStock: r.maximumStock ?? 999999,
        targetStock: r.targetStock,
        lastMovementAt: r.lastMovementAt,
        updatedAt: r.updatedAt,
      })),
      total,
    };
  }

  async getOne(id: number) {
    const [row] = await this.db
      .select({
        id: inventory.id,
        productId: sql<number>`${products.id}`,
        productName: products.name,
        variantId: sql<number>`${productVariants.id}`,
        sku: productVariants.sku,
        price: productVariants.currentPrice,
        branchId: sql<number>`${branches.id}`,
        branchName: branches.name,
        stock: inventory.stock,
        reservedStock: inventory.reservedStock,
        reorderPoint: inventory.reorderPoint,
        minimumStock: inventory.minimumStock,
        maximumStock: inventory.maximumStock,
        targetStock: inventory.targetStock,
        lastMovementAt: inventory.lastMovementAt,
        updatedAt: inventory.updatedAt,
      })
      .from(inventory)
      .innerJoin(productVariants, eq(inventory.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(eq(inventory.id, BigInt(id)));

    if (!row) throw new NotFoundException(`Inventario ${id} no encontrado`);
    return {
      id: Number(row.id),
      productId: row.productId,
      productName: row.productName,
      variantId: row.variantId,
      sku: row.sku,
      price: row.price,
      branchId: row.branchId,
      branchName: row.branchName,
      stock: row.stock ?? 0,
      reservedStock: row.reservedStock ?? 0,
      reorderPoint: row.reorderPoint ?? 0,
      minimumStock: row.minimumStock ?? 0,
      maximumStock: row.maximumStock ?? 999999,
      targetStock: row.targetStock,
      lastMovementAt: row.lastMovementAt,
      updatedAt: row.updatedAt,
    };
  }

  async update(id: number, body: {
    stock?: number;
    minimumStock?: number;
    reorderPoint?: number;
    maximumStock?: number;
    targetStock?: number;
  }) {
    const updateData: Record<string, unknown> = {};
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.minimumStock !== undefined) updateData.minimumStock = body.minimumStock;
    if (body.reorderPoint !== undefined) updateData.reorderPoint = body.reorderPoint;
    if (body.maximumStock !== undefined) updateData.maximumStock = body.maximumStock;
    if (body.targetStock !== undefined) updateData.targetStock = body.targetStock;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await this.db
        .update(inventory)
        .set(updateData)
        .where(eq(inventory.id, BigInt(id)));
    }
    return this.getOne(id);
  }

  async getBranchStats() {
    const rows = await this.db
      .select({
        branchId: sql<number>`${branches.id}`,
        branchName: branches.name,
        totalProducts: sql<number>`count(*)::int`,
        totalStock: sql<number>`coalesce(sum(${inventory.stock}), 0)`,
        lowStockCount: sql<number>`count(case when ${inventory.stock} <= ${inventory.reorderPoint} then 1 else null end)::int`,
      })
      .from(inventory)
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(eq(branches.isActive, true))
      .groupBy(branches.id, branches.name)
      .orderBy(asc(branches.name));

    return rows.map((r) => ({
      branchId: r.branchId,
      branchName: r.branchName,
      totalProducts: r.totalProducts,
      totalStock: r.totalStock,
      lowStockCount: r.lowStockCount,
    }));
  }

  async getLowStock(limit = 50) {
    return this.findAll({
      stockFilter: 'low',
      limit,
    }).then((r) => r.items);
  }
}
