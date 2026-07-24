import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  brands,
  categories,
  media,
  productCategories,
  productImages,
  productTypeAssignments,
  productTypes,
  products,
  productVariants,
} from '../../../drizzle/schema';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';

type CatalogCategoryResponse = {
  id: number;
  parentId: number | null;
  level: number;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  count: number;
};

type CategoryCountResponse = {
  categoryId: number;
  count: number;
};

type CatalogProductResponse = {
  id: number;
  externalId: string | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  image: string | null;
  images: string[];
  category: string;
  categoryId: number;
  productTypeCode: string | null;
  productTypeName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
};

@Injectable()
export class CatalogService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getCategories(): Promise<CatalogCategoryResponse[]> {
    const countSubquery = this.drizzleService.db
      .select({
        categoryId: productCategories.categoryId,
        count: sql<number>`count(DISTINCT ${products.id})`.as('count'),
      })
      .from(productCategories)
      .innerJoin(products, eq(products.id, productCategories.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .groupBy(productCategories.categoryId)
      .as('category_counts');

    const rows = await this.drizzleService.db
      .select({
        id: categories.id,
        parentId: categories.parentId,
        level: categories.level,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        image: media.path,
        isActive: categories.isActive,
        count: sql<number>`COALESCE(${countSubquery.count}, 0)`,
      })
      .from(categories)
      .leftJoin(media, eq(categories.imageMediaId, media.id))
      .leftJoin(countSubquery, eq(countSubquery.categoryId, categories.id))
      .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    return rows.map((row) => ({
      id: Number(row.id),
      parentId: row.parentId ? Number(row.parentId) : null,
      level: Number(row.level ?? 0),
      slug: row.slug,
      name: row.name,
      description: row.description,
      image: row.image,
      isActive: row.isActive,
      count: Number(row.count ?? 0),
    }));
  }

  async getCategoryCounts(): Promise<CategoryCountResponse[]> {
    const rows = await this.drizzleService.db
      .select({
        categoryId: categories.id,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(categories)
      .innerJoin(productCategories, eq(productCategories.categoryId, categories.id))
      .innerJoin(products, eq(products.id, productCategories.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(categories.isActive, true),
          isNull(categories.deletedAt),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .groupBy(categories.id);

    return rows.map((row) => ({
      categoryId: Number(row.categoryId),
      count: Number(row.count),
    }));
  }

  async getFeaturedBrands() {
    const rows = await this.drizzleService.db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        description: brands.description,
        image: media.path,
        website: brands.website,
      })
      .from(brands)
      .leftJoin(media, eq(brands.logoMediaId, media.id))
      .where(and(eq(brands.isActive, true), eq(brands.isFeatured, true)))
      .orderBy(asc(brands.name));

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
    }));
  }

  async getCatalogBrands() {
    const countSub = this.drizzleService.db
      .select({
        brandId: products.brandId,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .innerJoin(productCategories, eq(productCategories.productId, products.id))
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
          eq(categories.isActive, true),
          isNull(categories.deletedAt),
        ),
      )
      .groupBy(products.brandId)
      .as('brand_counts');

    const rows = await this.drizzleService.db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        count: sql<number>`COALESCE(${countSub.count}, 0)`,
      })
      .from(brands)
      .leftJoin(countSub, eq(countSub.brandId, brands.id))
      .where(
        and(
          eq(brands.isActive, true),
          isNull(brands.deletedAt),
          sql`COALESCE(${countSub.count}, 0) > 0`,
        ),
      )
      .orderBy(asc(brands.name));

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      count: Number(row.count),
    }));
  }

  async getProducts(
    query: CatalogProductsQueryDto,
  ): Promise<CatalogProductResponse[]> {
    const normalizedCategories = query.categories?.filter(Boolean) ?? [];
    const normalizedCategoryIds = query.categoryIds?.filter((id) => Number.isFinite(id)) ?? [];
    const search = query.search?.trim();
    const sort = query.sort ?? 'relevancia';
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);

    let allowedCategoryIds: number[] = [];

    if (normalizedCategories.length > 0 || normalizedCategoryIds.length > 0) {
      const categoryRows = await this.drizzleService.db
        .select({
          id: categories.id,
          parentId: categories.parentId,
          name: categories.name,
        })
        .from(categories)
        .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)));

      const normalizedSet = new Set(normalizedCategories);
      const normalizedIdSet = new Set(normalizedCategoryIds);
      const childrenByParentId = new Map<number, number[]>();

      for (const row of categoryRows) {
        const parentId = row.parentId ? Number(row.parentId) : null;
        if (parentId === null) continue;
        const current = childrenByParentId.get(parentId) ?? [];
        current.push(Number(row.id));
        childrenByParentId.set(parentId, current);
      }

      const rootIds = categoryRows
        .filter(
          (row) => normalizedSet.has(row.name) || normalizedIdSet.has(Number(row.id)),
        )
        .map((row) => Number(row.id));

      const collectedIds = new Set<number>();
      const stack = [...rootIds];

      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (collectedIds.has(currentId)) continue;
        collectedIds.add(currentId);

        for (const childId of childrenByParentId.get(currentId) ?? []) {
          stack.push(childId);
        }
      }

      allowedCategoryIds = Array.from(collectedIds);
    }

    const allowedCategoryBigIntIds = allowedCategoryIds.map((id) => BigInt(id));

    const rows = await this.drizzleService.db
      .select({
        id: products.id,
        externalId: products.externalId,
        slug: products.slug,
        name: products.name,
        description: products.description,
        isActive: products.isActive,
        isFeatured: products.featured,
        categoryId: categories.id,
        categoryName: categories.name,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        productTypeCode: productTypes.code,
        productTypeName: productTypes.name,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .innerJoin(
        productCategories,
        eq(productCategories.productId, products.id),
      )
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(productTypes, eq(productTypes.id, productTypeAssignments.productTypeId))
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
          eq(categories.isActive, true),
          isNull(categories.deletedAt),
          allowedCategoryBigIntIds.length > 0
            ? inArray(categories.id, allowedCategoryBigIntIds)
            : normalizedCategories.length > 0 || normalizedCategoryIds.length > 0
              ? sql`1 = 0`
              : undefined,
          query.onSale
            ? sql`${productVariants.currentComparePrice} IS NOT NULL`
            : undefined,
          query.brandId
            ? eq(products.brandId, query.brandId)
            : undefined,
          search
            ? or(
                ilike(products.name, `%${search}%`),
                ilike(products.description, `%${search}%`),
                ilike(categories.name, `%${search}%`),
              )
            : undefined,
          this.buildPriceRangeCondition(query.priceRange),
        ),
      )
      .orderBy(...this.buildSort(sort))
      .limit(limit)
      .offset(offset);

    const productIds = Array.from(new Set(rows.map((row) => Number(row.id))));
    if (productIds.length === 0) {
      return [];
    }

    const imageRows = await this.drizzleService.db
      .select({
        productId: productImages.productId,
        image: media.path,
        position: productImages.position,
      })
      .from(productImages)
      .innerJoin(media, eq(media.id, productImages.mediaId))
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.productId), asc(productImages.position));

    const imagesByProduct = new Map<number, string[]>();
    for (const row of imageRows) {
      if (!row.image) continue;
      const productId = Number(row.productId);
      const current = imagesByProduct.get(productId) ?? [];
      current.push(row.image);
      imagesByProduct.set(productId, current);
    }

    const uniqueProducts = new Map<number, CatalogProductResponse>();

    for (const row of rows) {
      const productId = Number(row.id);
      if (uniqueProducts.has(productId)) continue;

      const price = Number(row.price ?? 0);
      const originalPrice = row.originalPrice
        ? Number(row.originalPrice)
        : undefined;
      const images =
        imagesByProduct.get(productId) ?? (row.image ? [row.image] : []);

      uniqueProducts.set(productId, {
        id: productId,
        externalId: row.externalId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price,
        ...(originalPrice ? { originalPrice } : {}),
        image: row.image,
        images,
        category: row.categoryName,
        categoryId: Number(row.categoryId),
        productTypeCode: row.productTypeCode,
        productTypeName: row.productTypeName,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        stock: 0,
      });
    }

    return Array.from(uniqueProducts.values());
  }

  async getBranches() {
    const rows = await this.drizzleService.db
      .select({
        id: branches.id,
        name: branches.name,
        address: branches.address,
        city: branches.city,
        phone: branches.phone,
        email: branches.email,
        schedule: branches.schedule,
        location: branches.location,
        isActive: branches.isActive,
        priority: branches.priority,
      })
      .from(branches)
      .where(
        and(eq(branches.isActive, true), isNull(branches.deletedAt)),
      )
      .orderBy(asc(branches.priority));

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
    }));
  }

  private buildPriceRangeCondition(priceRange?: string) {
    switch (priceRange) {
      case '0-10000':
        return sql`${productVariants.currentPrice} <= 10000`;
      case '10000-30000':
        return sql`${productVariants.currentPrice} > 10000 AND ${productVariants.currentPrice} <= 30000`;
      case '30000-70000':
        return sql`${productVariants.currentPrice} > 30000 AND ${productVariants.currentPrice} <= 70000`;
      case '70000+':
        return sql`${productVariants.currentPrice} > 70000`;
      default:
        return undefined;
    }
  }

  private buildSort(sort: string) {
    switch (sort) {
      case 'precio-asc':
        return [asc(productVariants.currentPrice), asc(products.name)];
      case 'precio-desc':
        return [desc(productVariants.currentPrice), asc(products.name)];
      case 'descuento':
        return [desc(productVariants.currentComparePrice), asc(products.name)];
      case 'nombre':
        return [asc(products.name)];
      case 'relevancia':
      default:
        return [desc(products.featured), asc(products.name)];
    }
  }
}
