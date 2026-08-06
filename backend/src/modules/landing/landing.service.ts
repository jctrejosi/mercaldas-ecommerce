import { Injectable, Logger } from '@nestjs/common';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  products,
  productTypeAssignments,
  productTypes,
  settings,
} from '../../../drizzle/schema';

@Injectable()
export class LandingService {
  private readonly logger = new Logger(LandingService.name);
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() { return this.drizzle.db; }

  async getProductTypes() {
    const rows = await this.db
      .select({
        id: productTypes.id,
        code: productTypes.code,
        name: productTypes.name,
        isActive: productTypes.isActive,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(productTypes)
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productTypeId, productTypes.id),
      )
      .leftJoin(
        products,
        and(
          eq(products.id, productTypeAssignments.productId),
          isNull(products.deletedAt),
        ),
      )
      .groupBy(
        productTypes.id,
        productTypes.code,
        productTypes.name,
        productTypes.isActive,
      )
      .orderBy(asc(productTypes.name));

    const selected = await this.getSelectedCodes();
    return rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      name: row.name,
      count: Number(row.count ?? 0),
      isActive: row.isActive,
      selected: selected.includes(row.code),
    }));
  }

  async updateProductTypes(codes: string[]) {
    const row = await this.db.select().from(settings).where(eq(settings.key, 'landing_product_types')).limit(1);
    if (row.length) {
      await this.db.update(settings).set({ value: codes as any }).where(eq(settings.key, 'landing_product_types'));
    } else {
      await this.db.insert(settings).values({
        key: 'landing_product_types', value: codes as any, dataType: 'json',
        module: 'landing', description: 'Tipos de producto visibles en la landing',
        isPublic: true,
      } as any);
    }
    return this.getProductTypes();
  }

  async toggleProductTypeActive(id: number, isActive: boolean) {
    await this.db
      .update(productTypes)
      .set({ isActive } as any)
      .where(eq(productTypes.id, id as any));
    return this.getProductTypes();
  }

  async getSelectedCodes(): Promise<string[]> {
    const row = await this.db.select().from(settings).where(eq(settings.key, 'landing_product_types')).limit(1);
    if (!row.length) return [];
    return (row[0].value as string[]) ?? [];
  }

  async getFeaturedProductTypes() {
    const selected = await this.getSelectedCodes();

    const all = await this.db
      .select({
        id: productTypes.id,
        code: productTypes.code,
        name: productTypes.name,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(productTypes)
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productTypeId, productTypes.id),
      )
      .leftJoin(
        products,
        and(
          eq(products.id, productTypeAssignments.productId),
          isNull(products.deletedAt),
        ),
      )
      .where(eq(productTypes.isActive, true))
      .groupBy(productTypes.id, productTypes.code, productTypes.name)
      .orderBy(asc(productTypes.name));

    const byCode = new Map(all.map((r) => [r.code, r]));
    const ordered =
      selected.length > 0
        ? selected
            .map((code) => byCode.get(code))
            .filter((r): r is NonNullable<typeof r> => !!r)
        : all;

    return ordered.map((t) => ({
      id: Number(t.id),
      code: t.code,
      name: t.name,
      count: Number(t.count ?? 0),
    }));
  }
}
