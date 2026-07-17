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
  categories,
  media,
  productCategories,
  productImages,
  products,
  productVariants,
} from '../../../drizzle/schema';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';

type CatalogCategoryResponse = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

type CatalogProductResponse = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  image: string | null;
  images: string[];
  category: string;
  categoryId: number;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
};

@Injectable()
export class CatalogService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getCategories(): Promise<CatalogCategoryResponse[]> {
    const rows = await this.drizzleService.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        image: media.path,
        isActive: categories.isActive,
      })
      .from(categories)
      .leftJoin(media, eq(categories.imageMediaId, media.id))
      .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    return rows.map((row) => ({
      id: Number(row.id),
      slug: row.slug,
      name: row.name,
      description: row.description,
      image: row.image,
      isActive: row.isActive,
    }));
  }

  async getProducts(
    query: CatalogProductsQueryDto,
  ): Promise<CatalogProductResponse[]> {
    const normalizedCategories = query.categories?.filter(Boolean) ?? [];
    const search = query.search?.trim();
    const sort = query.sort ?? 'relevancia';
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 200);

    const rows = await this.drizzleService.db
      .select({
        id: products.id,
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
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .innerJoin(
        productCategories,
        eq(productCategories.productId, products.id),
      )
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
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
          normalizedCategories.length > 0
            ? inArray(categories.name, normalizedCategories)
            : undefined,
          query.onSale
            ? sql`${productVariants.currentComparePrice} IS NOT NULL`
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
      .limit(limit);

    const productIds = Array.from(
      new Set(rows.map((row) => Number(row.id))),
    );
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
      const images = imagesByProduct.get(productId) ?? (row.image ? [row.image] : []);

      uniqueProducts.set(productId, {
        id: productId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price,
        ...(originalPrice ? { originalPrice } : {}),
        image: row.image,
        images,
        category: row.categoryName,
        categoryId: Number(row.categoryId),
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        stock: 0,
      });
    }

    return Array.from(uniqueProducts.values());
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
