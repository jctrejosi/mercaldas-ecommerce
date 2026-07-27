import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  brands,
  categories,
  inventory,
  media,
  productCategories,
  productImages,
  productTypeAssignments,
  productTypes,
  products,
  productVariants,
} from '../../../drizzle/schema';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';

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
    const rows = await this.drizzleService.db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(brands)
      .innerJoin(products, eq(products.brandId, brands.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productCategories, eq(productCategories.productId, products.id))
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(
        and(
          eq(brands.isActive, true),
          isNull(brands.deletedAt),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .groupBy(brands.id, brands.name, brands.slug)
      .orderBy(asc(brands.name));

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      count: Number(row.count),
    }));
  }

  async getProductTypes() {
    const rows = await this.drizzleService.db
      .select({
        id: productTypes.id,
        code: productTypes.code,
        name: productTypes.name,
        description: productTypes.description,
        count: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(productTypes)
      .innerJoin(productTypeAssignments, eq(productTypeAssignments.productTypeId, productTypes.id))
      .innerJoin(products, eq(products.id, productTypeAssignments.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(productTypes.isActive, true),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .groupBy(productTypes.id, productTypes.code, productTypes.name, productTypes.description)
      .having(sql`count(DISTINCT ${products.id}) > 0`)
      .orderBy(asc(productTypes.name));

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      count: Number(row.count),
    }));
  }

  async getProductsCount(): Promise<{ total: number }> {
    const rows = await this.drizzleService.db
      .select({ count: sql<number>`count(DISTINCT ${products.id})`.as('count') })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      );
    return { total: Number(rows[0]?.count ?? 0) };
  }

  async createProduct(dto: CreateProductDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const sku = dto.sku || `SKU-${Date.now().toString(36).toUpperCase()}`;

    const result = await this.drizzleService.transaction(async (tx) => {
      const insertedProduct = await tx
        .insert(products)
        .values({
          name: dto.name,
          slug,
          description: dto.description ?? null,
          brandId: dto.brandId ?? null,
          isActive: dto.isActive ?? true,
          featured: dto.isFeatured ?? false,
        })
        .returning({ id: products.id });

      const productId = Number(insertedProduct[0].id);

      await tx.insert(productVariants).values({
        productId,
        sku,
        barcode: dto.barcode ?? null,
        currentPrice: String(dto.price),
        currentComparePrice: dto.originalPrice ? String(dto.originalPrice) : null,
        isActive: true,
      });

      // Save image if provided
      if (dto.image) {
        const insertedMedia = await tx
          .insert(media)
          .values({
            path: dto.image,
            fileName: dto.image.split('/').pop()?.substring(0, 50) ?? 'uploaded_image',
            mimeType: dto.image.startsWith('data:') ? dto.image.split(';')[0].split(':')[1] : 'image/jpeg',
            mediaType: 'image',
            sizeBytes: 0,
            checksum: '',
          })
          .returning({ id: media.id });

        const mediaId = Number(insertedMedia[0].id);

        await tx.insert(productImages).values({
          productId,
          mediaId,
          isCover: true,
          position: 0,
        });
      }

      return { id: productId, slug, sku };
    });

    return result;
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
      .leftJoin(
        productCategories,
        eq(productCategories.productId, products.id),
      )
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
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
          allowedCategoryBigIntIds.length > 0
            ? inArray(categories.id, allowedCategoryBigIntIds)
            : normalizedCategories.length > 0 || normalizedCategoryIds.length > 0
              ? sql`1 = 0`
              : undefined,
          query.isActive !== undefined
            ? eq(products.isActive, query.isActive)
            : undefined,
          query.priceMin !== undefined
            ? gte(productVariants.currentPrice, String(query.priceMin))
            : undefined,
          query.priceMax !== undefined
            ? lte(productVariants.currentPrice, String(query.priceMax))
            : undefined,
          query.onSale
            ? sql`${productVariants.currentComparePrice} IS NOT NULL`
            : undefined,
          query.brandId
            ? eq(products.brandId, query.brandId)
            : undefined,
          query.productTypeCode
            ? eq(productTypes.code, query.productTypeCode)
            : undefined,
          search
            ? or(
                ilike(products.name, `%${search}%`),
                ilike(products.description, `%${search}%`),
                ilike(productVariants.sku, `%${search}%`),
              )
            : undefined,
          this.buildPriceRangeCondition(query.priceRange),
        ),
      )
      .orderBy(...this.buildSort(sort))
      .limit(limit * 3)
      .offset(offset);

    // Deduplicate by product ID (LEFT JOINs on categories/type can duplicate rows)
    const uniqueProducts = new Map<number, CatalogProductResponse>();
    const productIds: number[] = [];

    for (const row of rows) {
      const productId = Number(row.id);
      if (uniqueProducts.has(productId)) continue;

      const price = Number(row.price ?? 0);
      const originalPrice = row.originalPrice
        ? Number(row.originalPrice)
        : undefined;

      uniqueProducts.set(productId, {
        id: productId,
        externalId: row.externalId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price,
        ...(originalPrice ? { originalPrice } : {}),
        image: row.image,
        images: row.image ? [row.image] : [],
        category: row.categoryName ?? '',
        categoryId: row.categoryId ? Number(row.categoryId) : 0,
        productTypeCode: row.productTypeCode,
        productTypeName: row.productTypeName,
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        stock: 0,
      });
      productIds.push(productId);

      // Stop when we have enough unique products for the original limit
      if (productIds.length >= limit) break;
    }

    if (productIds.length === 0) {
      return [];
    }

    // Load images for all returned products

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

    // Merge images into already-deduplicated products
    for (const [pid, product] of uniqueProducts) {
      const imgs = imagesByProduct.get(pid);
      if (imgs && imgs.length > 0) {
        product.images = imgs;
      }
    }

    return Array.from(uniqueProducts.values());
  }

  async exportProducts(res: Response) {
    const allProducts = await this.drizzleService.db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        isActive: products.isActive,
        isFeatured: products.featured,
        productType: productTypes.name,
        category: categories.name,
        brand: brands.name,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productCategories, eq(productCategories.productId, products.id))
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
      .leftJoin(productTypeAssignments, eq(productTypeAssignments.productId, products.id))
      .leftJoin(productTypes, eq(productTypes.id, productTypeAssignments.productTypeId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(products.isActive, true), isNull(products.deletedAt)))
      .orderBy(asc(products.name));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Productos');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 40 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Código de Barras', key: 'barcode', width: 18 },
      { header: 'Precio', key: 'price', width: 12 },
      { header: 'Precio Original', key: 'originalPrice', width: 14 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Marca', key: 'brand', width: 20 },
      { header: 'Tipo', key: 'productType', width: 20 },
      { header: 'Activo', key: 'isActive', width: 10 },
      { header: 'Destacado', key: 'isFeatured', width: 12 },
      { header: 'Descripción', key: 'description', width: 50 },
    ];

    for (const p of allProducts) {
      sheet.addRow({
        id: Number(p.id),
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        brand: p.brand,
        productType: p.productType,
        isActive: p.isActive ? 'Sí' : 'No',
        isFeatured: p.isFeatured ? 'Sí' : 'No',
        description: p.description,
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=productos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }

  async importProducts(file: any) {
    const raw = file.buffer.toString('utf-8');
    const catalog = JSON.parse(raw) as { PRODUCTOS?: any[] };
    const sourceProducts = catalog.PRODUCTOS ?? [];

    let created = 0;
    let updated = 0;

    // Get default branch
    const branchRows = await this.drizzleService.db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.isActive, true), isNull(branches.deletedAt)))
      .limit(1);
    const branchId = branchRows[0]?.id ?? null;

    if (!branchId) throw new BadRequestException('No hay sucursal activa para asignar inventario');

    for (const row of sourceProducts) {
      const codigo = (row.CODIGO as string)?.trim();
      const nombre = (row.NOMBRE as string)?.trim();
      const ean = (row.EAN as string)?.trim();
      const stock = parseInt(row.SALDO as string, 10) || 0;
      const currentPrice = parseInt(row.VENTA1 as string, 10) || 0;
      const comparePrice = parseInt(row.VENTA2 as string, 10) || undefined;
      const manufacturer = (row.MARCA as string)?.trim();

      if (!nombre || !codigo) continue;

      const slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Upsert product
      const existingVariant = await this.drizzleService.db
        .select({ id: productVariants.id, productId: productVariants.productId })
        .from(productVariants)
        .where(eq(productVariants.sku, codigo))
        .limit(1);

      let productId: number;
      let variantId: number;

      if (existingVariant.length > 0) {
        variantId = Number(existingVariant[0].id);
        productId = Number(existingVariant[0].productId);

        await this.drizzleService.db.update(products).set({
          name: nombre,
          updatedAt: new Date().toISOString(),
        }).where(eq(products.id, BigInt(productId)));

        await this.drizzleService.db.update(productVariants).set({
          currentPrice: String(currentPrice),
          currentComparePrice: comparePrice ? String(comparePrice) : null,
          barcode: ean || null,
        }).where(eq(productVariants.id, BigInt(variantId)));

        updated++;
      } else {
        const insertedProduct = await this.drizzleService.db.insert(products).values({
          name: nombre,
          slug,
          externalId: codigo,
          isActive: true,
          featured: false,
          visibility: 'PUBLIC',
        }).returning({ id: products.id });

        productId = Number(insertedProduct[0].id);

        const insertedVariant = await this.drizzleService.db.insert(productVariants).values({
          productId,
          sku: codigo,
          barcode: ean || null,
          currentPrice: String(currentPrice),
          currentComparePrice: comparePrice ? String(comparePrice) : null,
          isActive: true,
        }).returning({ id: productVariants.id });

        variantId = Number(insertedVariant[0].id);

        created++;
      }

      // Upsert inventory
      const existingInv = await this.drizzleService.db
        .select({ id: inventory.id })
        .from(inventory)
        .where(and(
          eq(inventory.productVariantId, variantId),
          eq(inventory.branchId, Number(branchId)),
        ))
        .limit(1);

      if (existingInv.length > 0) {
        await this.drizzleService.db.update(inventory).set({ stock }).where(eq(inventory.id, BigInt(existingInv[0].id)));
      } else {
        await this.drizzleService.db.insert(inventory).values({
          productVariantId: variantId,
          branchId: Number(branchId),
          stock,
          reservedStock: 0,
          reorderPoint: 0,
          minimumStock: 0,
          maximumStock: 999999,
        });
      }
    }

    return { created, updated };
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
      case 'nombre-desc':
        return [desc(products.name)];
      case 'sku':
        return [asc(productVariants.sku)];
      case 'relevancia':
      default:
        return [desc(products.featured), asc(products.name)];
    }
  }
}
