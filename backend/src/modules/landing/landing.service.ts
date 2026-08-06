import { Injectable, Logger } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  brands,
  categories,
  media,
  productCategories,
  productImages,
  products,
  productTypeAssignments,
  productTypes,
  productVariants,
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

  // ── Daily Deals ──

  private async resolveCarouselProducts(ids: number[]) {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        category: categories.name,
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
      .leftJoin(productCategories, eq(productCategories.productId, products.id))
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(and(inArray(products.id, ids.map((i) => BigInt(i))), isNull(products.deletedAt)));

    const byId = new Map<number, Record<string, unknown>>();
    for (const r of rows) {
      const id = Number(r.id);
      if (byId.has(id)) continue;
      byId.set(id, {
        id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        price: Number(r.price ?? 0),
        originalPrice: r.originalPrice ? Number(r.originalPrice) : undefined,
        image: r.image,
        category: r.category,
        plu: r.plu,
        barcode: r.barcode,
      });
    }
    return ids
      .map((id) => byId.get(id))
      .filter((x): x is Record<string, unknown> => !!x);
  }

  async getDailyDeals() {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'daily_deals'))
      .limit(1);
    const config = row.length ? (row[0].value as any) : null;
    const featuredItems = Array.isArray(config?.featuredItems)
      ? config.featuredItems
      : [];
    const carouselProductIds = Array.isArray(config?.carouselProductIds)
      ? config.carouselProductIds.map(Number)
      : [];
    const carousel = await this.resolveCarouselProducts(carouselProductIds);
    return { featuredItems, carouselProductIds, carousel };
  }

  async updateDailyDeals(body: {
    featuredItems?: any[];
    carouselProductIds?: number[];
  }) {
    const value = {
      featuredItems: body.featuredItems ?? [],
      carouselProductIds: (body.carouselProductIds ?? []).map(Number),
    };
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'daily_deals'))
      .limit(1);
    if (row.length) {
      await this.db
        .update(settings)
        .set({ value: value as any })
        .where(eq(settings.key, 'daily_deals'));
    } else {
      await this.db.insert(settings).values({
        key: 'daily_deals',
        value: value as any,
        dataType: 'json',
        module: 'landing',
        description: 'Ofertas del día: display rotativo y carousel de productos',
        isPublic: true,
      } as any);
    }
    return this.getDailyDeals();
  }

  async getPublicDailyDeals() {
    const { featuredItems, carousel } = await this.getDailyDeals();
    return { featuredItems, carousel };
  }

  // ── Landing Brands ──

  async getLandingBrands() {
    const rows = await this.db
      .select({
        id: brands.id,
        code: brands.code,
        name: brands.name,
        slug: brands.slug,
        isActive: brands.isActive,
        imagePath: media.path,
      })
      .from(brands)
      .leftJoin(media, eq(brands.logoMediaId, media.id))
      .where(isNull(brands.deletedAt))
      .orderBy(asc(brands.name));

    const counts = await this.db
      .select({
        brandId: products.brandId,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(isNull(products.deletedAt))
      .groupBy(products.brandId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      if (c.brandId !== null) countMap.set(Number(c.brandId), Number(c.count));
    }

    const selected = await this.getSelectedBrandCodes();
    return rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      name: row.name,
      slug: row.slug,
      isActive: row.isActive,
      imagePath: row.imagePath,
      productCount: countMap.get(Number(row.id)) ?? 0,
      selected: row.code ? selected.includes(row.code) : false,
    }));
  }

  async updateLandingBrands(codes: string[]) {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'landing_brands'))
      .limit(1);
    if (row.length) {
      await this.db
        .update(settings)
        .set({ value: codes as any })
        .where(eq(settings.key, 'landing_brands'));
    } else {
      await this.db.insert(settings).values({
        key: 'landing_brands',
        value: codes as any,
        dataType: 'json',
        module: 'landing',
        description: 'Marcas visibles en la landing',
        isPublic: true,
      } as any);
    }
    return this.getLandingBrands();
  }

  async toggleLandingBrandActive(id: number, isActive: boolean) {
    await this.db
      .update(brands)
      .set({ isActive, updatedAt: new Date().toISOString() } as any)
      .where(eq(brands.id, id as any));
    return this.getLandingBrands();
  }

  async getSelectedBrandCodes(): Promise<string[]> {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'landing_brands'))
      .limit(1);
    if (!row.length) return [];
    return (row[0].value as string[]) ?? [];
  }

  async getPublicBrands() {
    const selected = await this.getSelectedBrandCodes();

    const selectShape = {
      id: brands.id,
      code: brands.code,
      name: brands.name,
      slug: brands.slug,
      description: brands.description,
      image: media.path,
      website: brands.website,
    };

    const base = this.db
      .select(selectShape)
      .from(brands)
      .leftJoin(media, eq(brands.logoMediaId, media.id))
      .where(and(eq(brands.isActive, true), isNull(brands.deletedAt)))
      .orderBy(asc(brands.name));

    if (selected.length > 0) {
      const all = await base;
      const byCode = new Map(all.map((r) => [r.code, r]));
      return selected
        .map((code) => byCode.get(code))
        .filter((r): r is NonNullable<typeof r> => !!r);
    }

    return this.db
      .select(selectShape)
      .from(brands)
      .leftJoin(media, eq(brands.logoMediaId, media.id))
      .where(
        and(
          eq(brands.isActive, true),
          eq(brands.isFeatured, true),
          isNull(brands.deletedAt),
        ),
      )
      .orderBy(asc(brands.name));
  }

  // ── Landing Benefits (sección ¿Por qué comprar?) ──

  async getLandingBenefits() {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'landing_benefits'))
      .limit(1);
    return row.length ? ((row[0].value as any) ?? []) : [];
  }

  async updateLandingBenefits(items: any[]) {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'landing_benefits'))
      .limit(1);
    if (row.length) {
      await this.db
        .update(settings)
        .set({ value: items as any })
        .where(eq(settings.key, 'landing_benefits'));
    } else {
      await this.db.insert(settings).values({
        key: 'landing_benefits',
        value: items as any,
        dataType: 'json',
        module: 'landing',
        description: 'Sección ¿Por qué comprar en Mercaldas?',
        isPublic: true,
      } as any);
    }
    return this.getLandingBenefits();
  }

  async getPublicBenefits() {
    const items = await this.getLandingBenefits();
    if (Array.isArray(items) && items.length > 0) return items;
    return [];
  }

  // ── General (logo) ──

  async getGeneralLogo() {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'general_logo'))
      .limit(1);
    return row.length ? ((row[0].value as any) ?? {}) : {};
  }

  async updateGeneralLogo(body: { url: string }) {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'general_logo'))
      .limit(1);
    if (row.length) {
      await this.db
        .update(settings)
        .set({ value: body as any })
        .where(eq(settings.key, 'general_logo'));
    } else {
      await this.db.insert(settings).values({
        key: 'general_logo',
        value: body as any,
        dataType: 'json',
        module: 'general',
        description: 'Logo de la empresa',
        isPublic: true,
      } as any);
    }
    return this.getGeneralLogo();
  }
}
