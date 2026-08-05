import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  featuredProductTabs,
  featuredProductAssignments,
  products,
  productVariants,
  productImages,
  media,
} from '../../../drizzle/schema';

export interface FeaturedTabResponse {
  id: number;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
  queryOnSale: boolean | null;
  querySort: string | null;
  isDefault: boolean;
  productCount: number;
}

export interface FeaturedProductResponse {
  id: number;
  externalId: string | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  image: string | null;
  plu: string | null;
  barcode: string | null;
  isActive: boolean;
}

@Injectable()
export class FeaturedProductsService {
  private readonly logger = new Logger(FeaturedProductsService.name);
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  // ── Admin: Tabs ──

  async getAdminTabs(): Promise<FeaturedTabResponse[]> {
    const rows = await this.db
      .select({
        id: featuredProductTabs.id,
        name: featuredProductTabs.name,
        slug: featuredProductTabs.slug,
        position: featuredProductTabs.position,
        isActive: featuredProductTabs.isActive,
        queryOnSale: featuredProductTabs.queryOnSale,
        querySort: featuredProductTabs.querySort,
        isDefault: featuredProductTabs.isDefault,
        productCount: sql<number>`(
          SELECT COUNT(*) FROM ${featuredProductAssignments} fpa
          WHERE fpa.tab_id = ${featuredProductTabs.id} AND fpa.is_active = true
        )`,
      })
      .from(featuredProductTabs)
      .orderBy(asc(featuredProductTabs.position), asc(featuredProductTabs.id));

    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      position: Number(r.position ?? 0),
      isActive: r.isActive,
      queryOnSale: r.queryOnSale,
      querySort: r.querySort,
      isDefault: r.isDefault,
      productCount: Number(r.productCount ?? 0),
    }));
  }

  async createTab(data: {
    name: string;
    slug?: string;
    position?: number;
    queryOnSale?: boolean;
    querySort?: string;
  }) {
    const slug =
      data.slug ??
      data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const maxPos = await this.db
      .select({ max: sql<number>`COALESCE(MAX(position), -1)` })
      .from(featuredProductTabs);

    const position = data.position ?? Number(maxPos[0]?.max ?? -1) + 1;

    await this.db.insert(featuredProductTabs).values({
      name: data.name,
      slug,
      position,
      queryOnSale: data.queryOnSale ?? null,
      querySort: data.querySort ?? null,
      isActive: true,
      isDefault: false,
    });

    return this.getAdminTabs();
  }

  async updateTab(
    id: number,
    data: {
      name?: string;
      slug?: string;
      position?: number;
      isActive?: boolean;
      queryOnSale?: boolean | null;
      querySort?: string | null;
    },
  ) {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.position !== undefined) updates.position = data.position;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    if (data.queryOnSale !== undefined) updates.queryOnSale = data.queryOnSale;
    if (data.querySort !== undefined) updates.querySort = data.querySort;

    if (Object.keys(updates).length > 0) {
      await this.db
        .update(featuredProductTabs)
        .set({ ...updates, updatedAt: new Date().toISOString() } as any)
        .where(eq(featuredProductTabs.id, id as any));
    }

    return this.getAdminTabs();
  }

  async deleteTab(id: number) {
    await this.db
      .delete(featuredProductAssignments)
      .where(eq(featuredProductAssignments.tabId, id));
    await this.db
      .delete(featuredProductTabs)
      .where(eq(featuredProductTabs.id, id as any));
    return this.getAdminTabs();
  }

  // ── Admin: Product assignments ──

  async getTabProducts(tabId: number): Promise<FeaturedProductResponse[]> {
    const rows = await this.db
      .select({
        id: products.id,
        externalId: products.externalId,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        plu: products.plu,
        barcode: productVariants.barcode,
        isActive: products.isActive,
        assignmentPosition: featuredProductAssignments.position,
      })
      .from(featuredProductAssignments)
      .innerJoin(products, eq(products.id, featuredProductAssignments.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(
        and(
          eq(featuredProductAssignments.tabId, tabId),
          eq(featuredProductAssignments.isActive, true),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .orderBy(asc(featuredProductAssignments.position), asc(products.name));

    const seen = new Set<number>();
    const result: FeaturedProductResponse[] = [];
    for (const row of rows) {
      const productId = Number(row.id);
      if (seen.has(productId)) continue;
      seen.add(productId);
      const price = Number(row.price ?? 0);
      const originalPrice = row.originalPrice
        ? Number(row.originalPrice)
        : undefined;
      result.push({
        id: productId,
        externalId: row.externalId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price,
        ...(originalPrice ? { originalPrice } : {}),
        image: row.image,
        plu: row.plu,
        barcode: row.barcode,
        isActive: row.isActive,
      });
    }
    return result;
  }

  async assignProducts(tabId: number, productIds: number[]) {
    const existing = await this.db
      .select({ productId: featuredProductAssignments.productId })
      .from(featuredProductAssignments)
      .where(eq(featuredProductAssignments.tabId, tabId));

    const existingIds = new Set(existing.map((e) => Number(e.productId)));

    const maxPos = await this.db
      .select({ max: sql<number>`COALESCE(MAX(position), -1)` })
      .from(featuredProductAssignments)
      .where(eq(featuredProductAssignments.tabId, tabId));

    let nextPosition = Number(maxPos[0]?.max ?? -1) + 1;

    for (const productId of productIds) {
      if (existingIds.has(productId)) continue;
      await this.db.insert(featuredProductAssignments).values({
        tabId,
        productId,
        position: nextPosition++,
        isActive: true,
      });
    }

    return this.getTabProducts(tabId);
  }

  async removeProduct(tabId: number, productId: number) {
    await this.db
      .delete(featuredProductAssignments)
      .where(
        and(
          eq(featuredProductAssignments.tabId, tabId),
          eq(featuredProductAssignments.productId, productId),
        ),
      );
    return this.getTabProducts(tabId);
  }

  async reorderProducts(tabId: number, productIds: number[]) {
    for (let i = 0; i < productIds.length; i++) {
      await this.db
        .update(featuredProductAssignments)
        .set({ position: i, updatedAt: new Date().toISOString() } as any)
        .where(
          and(
            eq(featuredProductAssignments.tabId, tabId),
            eq(featuredProductAssignments.productId, productIds[i]),
          ),
        );
    }
    return this.getTabProducts(tabId);
  }

  // ── Admin: Product search (for the picker) ──

  async searchProducts(search: string, limit = 20) {
    const q = search?.trim();
    const rows = await this.db
      .select({
        id: products.id,
        externalId: products.externalId,
        slug: products.slug,
        name: products.name,
        price: productVariants.currentPrice,
        image: media.path,
        plu: products.plu,
        barcode: productVariants.barcode,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
          q
            ? sql`(${products.name} ILIKE ${'%' + q + '%'} OR ${products.plu} ILIKE ${'%' + q + '%'} OR ${products.externalId} ILIKE ${'%' + q + '%'} OR ${productVariants.barcode} ILIKE ${'%' + q + '%'})`
            : undefined,
        ),
      )
      .orderBy(asc(products.name))
      .limit(Math.min(limit, 50));

    const seen = new Set<number>();
    const result: FeaturedProductResponse[] = [];
    for (const row of rows) {
      const productId = Number(row.id);
      if (seen.has(productId)) continue;
      seen.add(productId);
      result.push({
        id: productId,
        externalId: row.externalId,
        slug: row.slug,
        name: row.name,
        description: null,
        price: Number(row.price ?? 0),
        image: row.image,
        plu: row.plu,
        barcode: row.barcode,
        isActive: true,
      });
    }
    return result;
  }

  // ── Public ──

  async getPublicTabs() {
    const rows = await this.db
      .select({
        id: featuredProductTabs.id,
        name: featuredProductTabs.name,
        slug: featuredProductTabs.slug,
        position: featuredProductTabs.position,
      })
      .from(featuredProductTabs)
      .where(eq(featuredProductTabs.isActive, true))
      .orderBy(asc(featuredProductTabs.position), asc(featuredProductTabs.id));

    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      slug: r.slug,
      position: Number(r.position ?? 0),
    }));
  }

  async getPublicTabProducts(
    slug: string,
    limit = 12,
  ): Promise<FeaturedProductResponse[]> {
    const [tab] = await this.db
      .select({ id: featuredProductTabs.id })
      .from(featuredProductTabs)
      .where(
        and(
          eq(featuredProductTabs.slug, slug),
          eq(featuredProductTabs.isActive, true),
        ),
      )
      .limit(1);

    if (!tab) {
      throw new NotFoundException('Pestaña no encontrada');
    }

    const rows = await this.db
      .select({
        id: products.id,
        externalId: products.externalId,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        plu: products.plu,
        barcode: productVariants.barcode,
        assignmentPosition: featuredProductAssignments.position,
      })
      .from(featuredProductAssignments)
      .innerJoin(products, eq(products.id, featuredProductAssignments.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(
        and(
          eq(featuredProductAssignments.tabId, Number(tab.id)),
          eq(featuredProductAssignments.isActive, true),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .orderBy(asc(featuredProductAssignments.position), asc(products.name))
      .limit(Math.min(limit, 24));

    const seen = new Set<number>();
    const result: FeaturedProductResponse[] = [];
    for (const row of rows) {
      const productId = Number(row.id);
      if (seen.has(productId)) continue;
      seen.add(productId);
      const price = Number(row.price ?? 0);
      const originalPrice = row.originalPrice
        ? Number(row.originalPrice)
        : undefined;
      result.push({
        id: productId,
        externalId: row.externalId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price,
        ...(originalPrice ? { originalPrice } : {}),
        image: row.image,
        plu: row.plu,
        barcode: row.barcode,
        isActive: true,
      });
    }
    return result;
  }
}
