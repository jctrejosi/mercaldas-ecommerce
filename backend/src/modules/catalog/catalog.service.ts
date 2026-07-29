import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
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
  ne,
  or,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  brands,
  categories,
  favorites,
  inventory,
  media,
  productCategories,
  productImages,
  productTypeAssignments,
  productTypes,
  products,
  productVariants,
  shoppingLists,
  shoppingListItems,
  suppliers,
  supplierProducts,
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
  brandId: number | null;
  brandName: string | null;
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
      .innerJoin(
        productCategories,
        eq(productCategories.categoryId, categories.id),
      )
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

  // ── Admin Category CRUD ──

  async getAllCategoriesAdmin() {
    // Get all categories with their direct product counts via a simpler LEFT JOIN approach
    const rows = await this.drizzleService.db
      .select({
        id: categories.id,
        parentId: categories.parentId,
        name: categories.name,
        slug: categories.slug,
        code: categories.code,
        displayOrder: categories.displayOrder,
        description: categories.description,
        isActive: categories.isActive,
        level: categories.level,
        metaTitle: categories.metaTitle,
        metaDescription: categories.metaDescription,
        createdAt: categories.createdAt,
        imagePath: media.path,
      })
      .from(categories)
      .leftJoin(media, eq(categories.imageMediaId, media.id))
      .where(isNull(categories.deletedAt))
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    const list = rows.map((row) => ({
      id: Number(row.id),
      parentId: row.parentId ? Number(row.parentId) : null,
      name: row.name,
      slug: row.slug,
      code: row.code,
      displayOrder: row.displayOrder ?? 0,
      description: row.description,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      isActive: row.isActive,
      level: row.level ?? 0,
      createdAt: row.createdAt,
      imagePath: row.imagePath,
      productCount: 0,
    }));

    // Get product counts per category
    const counts = await this.drizzleService.db
      .select({
        categoryId: productCategories.categoryId,
        count: sql<number>`count(DISTINCT ${products.id})`,
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
      .groupBy(productCategories.categoryId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      countMap.set(Number(c.categoryId), Number(c.count));
    }

    for (const cat of list) {
      cat.productCount = countMap.get(cat.id) ?? 0;
    }

    // Propagate counts upward: a parent's count = its own + all descendants
    const childrenByParent = new Map<number, number[]>();
    for (const c of list) {
      if (c.parentId !== null) {
        const arr = childrenByParent.get(c.parentId) ?? [];
        arr.push(c.id);
        childrenByParent.set(c.parentId, arr);
      }
    }

    const getSubtreeCount = (catId: number, visited: Set<number>): number => {
      if (visited.has(catId)) return 0;
      visited.add(catId);
      const cat = list.find((c) => c.id === catId);
      if (!cat) return 0;
      let total = cat.productCount;
      for (const childId of childrenByParent.get(catId) ?? []) {
        total += getSubtreeCount(childId, visited);
      }
      return total;
    };

    return list.map((c) => ({
      ...c,
      productCount: getSubtreeCount(c.id, new Set()),
    }));
  }

  async createCategory(data: {
    name: string;
    code?: string;
    parentId?: number;
  }) {
    let slug = slugify(data.name, { lower: true, strict: true });
    let level = 0;

    if (data.parentId) {
      const [parent] = await this.drizzleService.db
        .select({ level: categories.level })
        .from(categories)
        .where(eq(categories.id, BigInt(data.parentId)));
      if (!parent) throw new NotFoundException('Categoría padre no encontrada');
      level = (parent.level ?? 0) + 1;
    }

    // Ensure unique slug
    const existing = await this.drizzleService.db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.slug, slug));
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    const [inserted] = await this.drizzleService.db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        code: data.code ?? null,
        parentId: data.parentId ?? null,
        level,
        displayOrder: 0,
        isActive: true,
      })
      .returning({ id: categories.id });

    return { id: Number(inserted.id) };
  }

  async updateCategory(
    id: number,
    data: {
      name?: string;
      code?: string;
      parentId?: number | null;
      description?: string | null;
      displayOrder?: number;
      metaTitle?: string | null;
      metaDescription?: string | null;
      isActive?: boolean;
      imageUrl?: string;
    },
  ) {
    const updates: Record<string, any> = {};

    if (data.name !== undefined) {
      let slug = slugify(data.name, { lower: true, strict: true });
      const existing = await this.drizzleService.db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.slug, slug), ne(categories.id, BigInt(id))));
      if (existing.length > 0) slug = `${slug}-${Date.now()}`;
      updates.name = data.name;
      updates.slug = slug;
    }

    if (data.parentId !== undefined) {
      let level = 0;
      if (data.parentId !== null) {
        const [parent] = await this.drizzleService.db
          .select({ level: categories.level })
          .from(categories)
          .where(eq(categories.id, BigInt(data.parentId)));
        if (parent) level = (parent.level ?? 0) + 1;
      }
      updates.parentId = data.parentId;
      updates.level = level;
    }

    if (data.code !== undefined) updates.code = data.code;
    if (data.description !== undefined) updates.description = data.description;
    if (data.displayOrder !== undefined)
      updates.displayOrder = data.displayOrder;
    if (data.metaTitle !== undefined) updates.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      updates.metaDescription = data.metaDescription;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    if (data.imageUrl) {
      const [inserted] = await this.drizzleService.db
        .insert(media)
        .values({
          path: data.imageUrl,
          fileName:
            data.imageUrl.split('/').pop()?.substring(0, 50) ??
            'category_image',
          mimeType: 'image/jpeg',
          mediaType: 'image',
          provider: 'cloudinary',
          sizeBytes: 0,
          checksum: data.imageUrl.substring(0, 64),
          status: 'active',
          isPublic: true,
        })
        .returning({ id: media.id });
      updates.imageMediaId = Number(inserted.id);
    }

    if (Object.keys(updates).length === 0) return { id };

    const [updated] = await this.drizzleService.db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, BigInt(id)))
      .returning({ id: categories.id });

    if (!updated) throw new NotFoundException('Categoría no encontrada');
    return { id };
  }

  async deleteCategory(id: number) {
    // Promote children to root level
    await this.drizzleService.db
      .update(categories)
      .set({ parentId: null, level: 0 })
      .where(eq(categories.parentId, id));

    // Soft delete the category
    const [deleted] = await this.drizzleService.db
      .update(categories)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(categories.id, BigInt(id)))
      .returning({ id: categories.id });

    if (!deleted) throw new NotFoundException('Categoría no encontrada');
  }

  // ── Category-Product relations ──

  async getCategoryProducts(categoryId: number) {
    // Gather all descendant category IDs
    const allCats = await this.drizzleService.db
      .select({ id: categories.id, parentId: categories.parentId })
      .from(categories)
      .where(isNull(categories.deletedAt));

    const childrenByParent = new Map<number, number[]>();
    for (const c of allCats) {
      if (c.parentId !== null) {
        const pid = Number(c.parentId);
        const arr = childrenByParent.get(pid) ?? [];
        arr.push(Number(c.id));
        childrenByParent.set(pid, arr);
      }
    }

    const collectDescendants = (id: number, visited: Set<number>): number[] => {
      if (visited.has(id)) return [];
      visited.add(id);
      const ids = [id];
      for (const childId of childrenByParent.get(id) ?? []) {
        ids.push(...collectDescendants(childId, visited));
      }
      return ids;
    };

    const categoryIds = collectDescendants(categoryId, new Set());

    const rows = await this.drizzleService.db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: productVariants.currentPrice,
        image: media.path,
        productTypeCode: productTypes.code,
      })
      .from(productCategories)
      .innerJoin(products, eq(products.id, productCategories.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(
        productTypes,
        eq(productTypes.id, productTypeAssignments.productTypeId),
      )
      .where(
        and(
          inArray(productCategories.categoryId, categoryIds),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .orderBy(asc(products.name));

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      price: Number(row.price ?? 0),
      image: row.image,
      productTypeCode: row.productTypeCode,
    }));
  }

  async addProductToCategory(categoryId: number, productId: number) {
    await this.drizzleService.db
      .insert(productCategories)
      .values({
        categoryId,
        productId,
      })
      .onConflictDoNothing();
  }

  async removeProductFromCategory(categoryId: number, productId: number) {
    await this.drizzleService.db
      .delete(productCategories)
      .where(
        and(
          eq(productCategories.categoryId, categoryId),
          eq(productCategories.productId, productId),
        ),
      );
  }

  async replaceProductCategory(productId: number, newCategoryId: number) {
    // Remove all existing category assignments for this product
    await this.drizzleService.db
      .delete(productCategories)
      .where(eq(productCategories.productId, productId));

    // Assign the new category
    await this.drizzleService.db.insert(productCategories).values({
      categoryId: newCategoryId,
      productId,
    });
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
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      website: row.website,
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
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      count: Number(row.count),
    }));
  }

  // ── Admin Brands ──

  async getAllBrandsAdmin() {
    const rows = await this.drizzleService.db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        code: brands.code,
        description: brands.description,
        image: media.path,
        website: brands.website,
        country: brands.country,
        isFeatured: brands.isFeatured,
        isActive: brands.isActive,
        createdAt: brands.createdAt,
        productCount: sql<number>`count(DISTINCT ${products.id})`,
      })
      .from(brands)
      .leftJoin(media, eq(brands.logoMediaId, media.id))
      .leftJoin(products, eq(products.brandId, brands.id))
      .where(isNull(brands.deletedAt))
      .groupBy(
        brands.id,
        brands.name,
        brands.slug,
        brands.code,
        brands.description,
        media.path,
        brands.website,
        brands.country,
        brands.isFeatured,
        brands.isActive,
        brands.createdAt,
      )
      .orderBy(asc(brands.name));

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      code: row.code,
      description: row.description,
      image: row.image,
      website: row.website,
      country: row.country,
      isFeatured: row.isFeatured,
      isActive: row.isActive,
      createdAt: row.createdAt,
      productCount: Number(row.productCount),
    }));
  }

  async createBrand(body: {
    name: string;
    code?: string;
    website?: string;
    description?: string;
    country?: string;
    isFeatured?: boolean;
    imageUrl?: string;
  }) {
    const slug = slugify(body.name, { lower: true, strict: true });

    let logoMediaId: number | null = null;
    if (body.imageUrl) {
      const [mediaRow] = await this.drizzleService.db
        .insert(media)
        .values({
          path: body.imageUrl,
          fileName:
            body.imageUrl.split('/').pop()?.substring(0, 50) ?? 'brand_logo',
          mimeType: 'image/jpeg',
          mediaType: 'image',
          provider: 'cloudinary',
          sizeBytes: 0,
          checksum: body.imageUrl.substring(0, 64),
          status: 'active',
        })
        .returning({ id: media.id });
      logoMediaId = Number(mediaRow.id);
    }

    const [result] = await this.drizzleService.db
      .insert(brands)
      .values({
        name: body.name,
        slug,
        code: body.code ?? null,
        website: body.website ?? '',
        description: body.description ?? '',
        country: body.country ?? '',
        logoMediaId,
        isFeatured: body.isFeatured ?? false,
        isActive: true,
      })
      .returning({ id: brands.id });

    return { id: Number(result.id) };
  }

  async updateBrand(
    id: number,
    body: {
      name?: string;
      code?: string;
      website?: string;
      description?: string;
      country?: string;
      isFeatured?: boolean;
      isActive?: boolean;
      imageUrl?: string;
    },
  ) {
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
      updateData.slug = slugify(body.name, { lower: true, strict: true });
    }
    if (body.code !== undefined) updateData.code = body.code;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (body.imageUrl) {
      const [mediaRow] = await this.drizzleService.db
        .insert(media)
        .values({
          path: body.imageUrl,
          fileName:
            body.imageUrl.split('/').pop()?.substring(0, 50) ?? 'brand_logo',
          mimeType: 'image/jpeg',
          mediaType: 'image',
          provider: 'cloudinary',
          sizeBytes: 0,
          checksum: body.imageUrl.substring(0, 64),
          status: 'active',
        })
        .returning({ id: media.id });
      updateData.logoMediaId = Number(mediaRow.id);
    }

    updateData.updatedAt = new Date().toISOString();

    await this.drizzleService.db
      .update(brands)
      .set(updateData)
      .where(eq(brands.id, BigInt(id)));

    return { id };
  }

  async deleteBrand(id: number) {
    await this.drizzleService.db
      .update(brands)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(brands.id, BigInt(id)));
  }

  // ── Brand-Product relations ──

  async getBrandProducts(brandId: number) {
    const rows = await this.drizzleService.db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: productVariants.currentPrice,
        image: media.path,
        productTypeCode: productTypes.code,
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
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(
        productTypes,
        eq(productTypes.id, productTypeAssignments.productTypeId),
      )
      .where(
        and(
          eq(products.brandId, brandId),
          eq(products.isActive, true),
          isNull(products.deletedAt),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      )
      .orderBy(asc(products.name));

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      price: Number(row.price ?? 0),
      image: row.image,
      productTypeCode: row.productTypeCode,
    }));
  }

  async addProductToBrand(brandId: number, productId: number) {
    await this.drizzleService.db
      .update(products)
      .set({ brandId })
      .where(eq(products.id, BigInt(productId)));
  }

  async removeProductFromBrand(productId: number) {
    await this.drizzleService.db
      .update(products)
      .set({ brandId: null })
      .where(eq(products.id, BigInt(productId)));
  }

  // ── Admin Suppliers ──

  async getAllSuppliersAdmin() {
    const rows = await this.drizzleService.db
      .select({
        id: suppliers.id,
        code: suppliers.code,
        legalName: suppliers.legalName,
        taxId: suppliers.taxId,
        contactName: suppliers.contactName,
        email: suppliers.email,
        phone: suppliers.phone,
        address: suppliers.address,
        city: suppliers.city,
        country: suppliers.country,
        website: suppliers.website,
        paymentTermsDays: suppliers.paymentTermsDays,
        currencyCode: suppliers.currencyCode,
        notes: suppliers.notes,
        isActive: suppliers.isActive,
        createdAt: suppliers.createdAt,
        productCount: sql<number>`count(DISTINCT ${supplierProducts.productVariantId})`,
      })
      .from(suppliers)
      .leftJoin(supplierProducts, eq(supplierProducts.supplierId, suppliers.id))
      .where(isNull(suppliers.deletedAt))
      .groupBy(
        suppliers.id,
        suppliers.code,
        suppliers.legalName,
        suppliers.taxId,
        suppliers.contactName,
        suppliers.email,
        suppliers.phone,
        suppliers.address,
        suppliers.city,
        suppliers.country,
        suppliers.website,
        suppliers.paymentTermsDays,
        suppliers.currencyCode,
        suppliers.notes,
        suppliers.isActive,
        suppliers.createdAt,
      )
      .orderBy(asc(suppliers.legalName));

    return rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      legalName: row.legalName,
      taxId: row.taxId,
      contactName: row.contactName,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
      website: row.website,
      paymentTermsDays: row.paymentTermsDays,
      currencyCode: row.currencyCode,
      notes: row.notes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      productCount: Number(row.productCount),
    }));
  }

  async createSupplier(body: {
    legalName: string;
    code?: string;
    taxId?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    website?: string;
    paymentTermsDays?: number;
    currencyCode?: string;
    notes?: string;
  }) {
    const [result] = await this.drizzleService.db
      .insert(suppliers)
      .values({
        legalName: body.legalName,
        code: body.code ?? null,
        taxId: body.taxId ?? null,
        contactName: body.contactName ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        country: body.country ?? null,
        website: body.website ?? null,
        paymentTermsDays: body.paymentTermsDays ?? null,
        currencyCode: body.currencyCode ?? null,
        notes: body.notes ?? null,
        isActive: true,
      })
      .returning({ id: suppliers.id });

    return { id: Number(result.id) };
  }

  async updateSupplier(
    id: number,
    body: {
      legalName?: string;
      code?: string | null;
      taxId?: string | null;
      contactName?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      website?: string | null;
      paymentTermsDays?: number | null;
      currencyCode?: string | null;
      notes?: string | null;
      isActive?: boolean;
    },
  ) {
    const updateData: Record<string, any> = {};
    if (body.legalName !== undefined) updateData.legalName = body.legalName;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.taxId !== undefined) updateData.taxId = body.taxId;
    if (body.contactName !== undefined)
      updateData.contactName = body.contactName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.paymentTermsDays !== undefined)
      updateData.paymentTermsDays = body.paymentTermsDays;
    if (body.currencyCode !== undefined)
      updateData.currencyCode = body.currencyCode;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    updateData.updatedAt = new Date().toISOString();

    await this.drizzleService.db
      .update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, BigInt(id)));

    return { id };
  }

  async deleteSupplier(id: number) {
    await this.drizzleService.db
      .update(suppliers)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(suppliers.id, BigInt(id)));
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
      .innerJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productTypeId, productTypes.id),
      )
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
      .groupBy(
        productTypes.id,
        productTypes.code,
        productTypes.name,
        productTypes.description,
      )
      .having(sql`count(DISTINCT ${products.id}) > 0`)
      .orderBy(asc(productTypes.name));

    return rows.map((row) => ({
      id: Number(row.id),
      code: row.code,
      name: row.name,
      description: row.description,
      count: Number(row.count),
    }));
  }

  async getProductsCount(unbranded?: boolean): Promise<{ total: number }> {
    const conditions: any[] = [
      eq(products.isActive, true),
      isNull(products.deletedAt),
      eq(productVariants.isActive, true),
      isNull(productVariants.deletedAt),
    ];

    if (unbranded) {
      conditions.push(sql`${products.brandId} IS NULL`);
    }

    const rows = await this.drizzleService.db
      .select({
        count: sql<number>`count(DISTINCT ${products.id})`.as('count'),
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(and(...conditions));
    return { total: Number(rows[0]?.count ?? 0) };
  }

  async createProduct(dto: CreateProductDto) {
    const slug =
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

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
        currentComparePrice: dto.originalPrice
          ? String(dto.originalPrice)
          : null,
        isActive: true,
      });

      // Save image if provided
      if (dto.image) {
        const insertedMedia = await tx
          .insert(media)
          .values({
            path: dto.image,
            fileName:
              dto.image.split('/').pop()?.substring(0, 50) ?? 'uploaded_image',
            mimeType: dto.image.startsWith('data:')
              ? dto.image.split(';')[0].split(':')[1]
              : 'image/jpeg',
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

      // Assign category if provided
      if (dto.categoryId) {
        await tx.insert(productCategories).values({
          productId,
          categoryId: dto.categoryId,
        });
      }

      return { id: productId, slug, sku };
    });

    return result;
  }

  async updateProduct(id: number, dto: CreateProductDto) {
    const pid = id;

    await this.drizzleService.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          name: dto.name,
          description: dto.description ?? null,
          brandId: dto.brandId ?? null,
          isActive: dto.isActive ?? true,
          featured: dto.isFeatured ?? false,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, BigInt(pid)));

      const variants = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, pid))
        .limit(1);

      if (variants.length > 0) {
        await tx
          .update(productVariants)
          .set({
            sku: dto.sku ?? productVariants.sku,
            barcode: dto.barcode ?? null,
            currentPrice: String(dto.price),
            currentComparePrice: dto.originalPrice
              ? String(dto.originalPrice)
              : null,
          })
          .where(eq(productVariants.id, BigInt(variants[0].id)));
      }

      if (dto.image) {
        const existingImage = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, pid),
              eq(productImages.isCover, true),
            ),
          )
          .limit(1);

        const insertedMedia = await tx
          .insert(media)
          .values({
            path: dto.image,
            fileName:
              dto.image.split('/').pop()?.substring(0, 50) ?? 'updated_image',
            mimeType: dto.image.startsWith('data:')
              ? dto.image.split(';')[0].split(':')[1]
              : 'image/jpeg',
            mediaType: 'image',
            sizeBytes: 0,
            checksum: '',
          })
          .returning({ id: media.id });

        const mediaId = Number(insertedMedia[0].id);

        if (existingImage.length > 0) {
          await tx
            .update(productImages)
            .set({ mediaId, updatedAt: new Date().toISOString() })
            .where(eq(productImages.id, BigInt(existingImage[0].id)));
        } else {
          await tx.insert(productImages).values({
            productId: pid,
            mediaId,
            isCover: true,
            position: 0,
          });
        }
      }

      // Update category if provided
      if (dto.categoryId !== undefined) {
        await tx
          .delete(productCategories)
          .where(eq(productCategories.productId, pid));
        if (dto.categoryId) {
          await tx.insert(productCategories).values({
            productId: pid,
            categoryId: dto.categoryId,
          });
        }
      }
    });

    return { id };
  }

  async getProducts(
    query: CatalogProductsQueryDto,
  ): Promise<CatalogProductResponse[]> {
    const normalizedCategories = query.categories?.filter(Boolean) ?? [];
    const normalizedCategoryIds =
      query.categoryIds?.filter((id) => Number.isFinite(id)) ?? [];
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
        .where(
          and(eq(categories.isActive, true), isNull(categories.deletedAt)),
        );

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
          (row) =>
            normalizedSet.has(row.name) || normalizedIdSet.has(Number(row.id)),
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
        brandId: products.brandId,
        brandName: brands.name,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        productTypeCode: productTypes.code,
        productTypeName: productTypes.name,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productCategories, eq(productCategories.productId, products.id))
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(
        productTypes,
        eq(productTypes.id, productTypeAssignments.productTypeId),
      )
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
            : normalizedCategories.length > 0 ||
                normalizedCategoryIds.length > 0
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
          query.brandId ? eq(products.brandId, query.brandId) : undefined,
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
          query.uncategorized
            ? sql`NOT EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = ${products.id})`
            : undefined,
          query.unbranded ? sql`${products.brandId} IS NULL` : undefined,
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
        brandId: row.brandId ? Number(row.brandId) : null,
        brandName: row.brandName ?? null,
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
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(
        productTypes,
        eq(productTypes.id, productTypeAssignments.productTypeId),
      )
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

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=productos_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
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

    if (!branchId)
      throw new BadRequestException(
        'No hay sucursal activa para asignar inventario',
      );

    for (const row of sourceProducts) {
      const codigo = (row.CODIGO as string)?.trim();
      const nombre = (row.NOMBRE as string)?.trim();
      const ean = (row.EAN as string)?.trim();
      const stock = parseInt(row.SALDO as string, 10) || 0;
      const currentPrice = parseInt(row.VENTA1 as string, 10) || 0;
      const comparePrice = parseInt(row.VENTA2 as string, 10) || undefined;
      const manufacturer = (row.MARCA as string)?.trim();

      if (!nombre || !codigo) continue;

      const slug = nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Upsert product
      const existingVariant = await this.drizzleService.db
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
        })
        .from(productVariants)
        .where(eq(productVariants.sku, codigo))
        .limit(1);

      let productId: number;
      let variantId: number;

      if (existingVariant.length > 0) {
        variantId = Number(existingVariant[0].id);
        productId = Number(existingVariant[0].productId);

        await this.drizzleService.db
          .update(products)
          .set({
            name: nombre,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(products.id, BigInt(productId)));

        await this.drizzleService.db
          .update(productVariants)
          .set({
            currentPrice: String(currentPrice),
            currentComparePrice: comparePrice ? String(comparePrice) : null,
            barcode: ean || null,
          })
          .where(eq(productVariants.id, BigInt(variantId)));

        updated++;
      } else {
        const insertedProduct = await this.drizzleService.db
          .insert(products)
          .values({
            name: nombre,
            slug,
            externalId: codigo,
            isActive: true,
            featured: false,
            visibility: 'PUBLIC',
          })
          .returning({ id: products.id });

        productId = Number(insertedProduct[0].id);

        const insertedVariant = await this.drizzleService.db
          .insert(productVariants)
          .values({
            productId,
            sku: codigo,
            barcode: ean || null,
            currentPrice: String(currentPrice),
            currentComparePrice: comparePrice ? String(comparePrice) : null,
            isActive: true,
          })
          .returning({ id: productVariants.id });

        variantId = Number(insertedVariant[0].id);

        created++;
      }

      // Upsert inventory
      const existingInv = await this.drizzleService.db
        .select({ id: inventory.id })
        .from(inventory)
        .where(
          and(
            eq(inventory.productVariantId, variantId),
            eq(inventory.branchId, Number(branchId)),
          ),
        )
        .limit(1);

      if (existingInv.length > 0) {
        await this.drizzleService.db
          .update(inventory)
          .set({ stock })
          .where(eq(inventory.id, BigInt(existingInv[0].id)));
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
      .where(and(eq(branches.isActive, true), isNull(branches.deletedAt)))
      .orderBy(asc(branches.priority));

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      address: row.address,
      city: row.city,
      phone: row.phone,
      email: row.email,
      schedule: row.schedule,
      location: row.location,
      isActive: row.isActive,
      priority: Number(row.priority ?? 0),
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

  private buildSort(sort: string | undefined): ReturnType<typeof asc>[] {
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

  // ── Favorites ──

  async getFavorites(customerId: number): Promise<CatalogProductResponse[]> {
    const rows = await this.drizzleService.db
      .select({
        id: products.id,
        externalId: products.externalId,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: productVariants.currentPrice,
        comparePrice: productVariants.currentComparePrice,
        image: media.path,
        categoryName: sql<string>`COALESCE(LEAF_CAT.cat_name, ROOT_CAT.name, 'Sin categoría')`,
        categoryId: sql<number>`COALESCE(LEAF_CAT.cat_id, ROOT_CAT.id, 0)`,
        brandId: products.brandId,
        brandName: brands.name,
        productTypeCode: productTypes.code,
        productTypeName: productTypes.name,
        isActive: products.isActive,
        isFeatured: products.featured,
        stock: inventory.stock,
      })
      .from(favorites)
      .innerJoin(products, eq(products.id, favorites.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productCategories, eq(productCategories.productId, products.id))
      .leftJoin(
        sql`(
          SELECT pc.*, c.id AS cat_id, c.name AS cat_name, c.parent_id AS cat_parent_id
          FROM product_categories pc
          INNER JOIN categories c ON c.id = pc.category_id
          WHERE c.parent_id IS NOT NULL
        ) AS LEAF_CAT`,
        sql`LEAF_CAT.product_id = ${products.id}`,
      )
      .leftJoin(categories, eq(categories.id, productCategories.categoryId))
      .leftJoin(
        sql`categories AS ROOT_CAT`,
        sql`ROOT_CAT.id = COALESCE(LEAF_CAT.cat_parent_id, ${productCategories.categoryId})`,
      )
      .leftJoin(
        productTypeAssignments,
        eq(productTypeAssignments.productId, products.id),
      )
      .leftJoin(
        productTypes,
        eq(productTypes.id, productTypeAssignments.productTypeId),
      )
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(inventory, eq(inventory.productVariantId, productVariants.id))
      .where(
        and(
          eq(favorites.customerId, customerId),
          eq(products.isActive, true),
          isNull(products.deletedAt),
        ),
      )
      .orderBy(desc(favorites.createdAt), asc(products.name));

    return rows.map((row: any) => ({
      id: Number(row.id),
      externalId: row.externalId,
      slug: row.slug,
      name: row.name,
      description: row.description,
      price: Number(row.price ?? 0),
      originalPrice: row.comparePrice ? Number(row.comparePrice) : undefined,
      image: row.image,
      images: row.image ? [row.image] : [],
      category: row.categoryName,
      categoryId: Number(row.categoryId ?? 0),
      brandId: row.brandId ? Number(row.brandId) : null,
      brandName: row.brandName ?? null,
      productTypeCode: row.productTypeCode,
      productTypeName: row.productTypeName,
      isActive: row.isActive,
      isFeatured: Boolean(row.isFeatured),
      stock: Number(row.stock ?? 0),
    }));
  }

  async addFavorite(customerId: number, productId: number) {
    await this.drizzleService.db
      .insert(favorites)
      .values({ customerId, productId })
      .onConflictDoNothing();
  }

  async removeFavorite(customerId: number, productId: number) {
    await this.drizzleService.db
      .delete(favorites)
      .where(
        and(
          eq(favorites.customerId, customerId),
          eq(favorites.productId, productId),
        ),
      );
  }

  // ── Shopping Lists ──

  async getShoppingLists(customerId: number) {
    const lists = await this.drizzleService.db
      .select({
        id: shoppingLists.id,
        name: shoppingLists.name,
        createdAt: shoppingLists.createdAt,
      })
      .from(shoppingLists)
      .where(eq(shoppingLists.customerId, customerId))
      .orderBy(desc(shoppingLists.createdAt));

    // Get items for all lists
    const listIds = lists.map((l) => Number(l.id));
    if (listIds.length === 0) return [];

    const items = await this.drizzleService.db
      .select({
        listId: shoppingListItems.listId,
        productId: shoppingListItems.productId,
        quantity: shoppingListItems.quantity,
        productName: products.name,
        productPrice: productVariants.currentPrice,
        productImage: media.path,
        unit: sql<string>`${productVariants.sku}`,
      })
      .from(shoppingListItems)
      .innerJoin(products, eq(products.id, shoppingListItems.productId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isCover, true),
        ),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(inArray(shoppingListItems.listId, listIds))
      .orderBy(asc(shoppingListItems.addedAt));

    return lists.map((list) => ({
      id: Number(list.id),
      name: list.name,
      createdAt: list.createdAt,
      items: items
        .filter((i) => Number(i.listId) === Number(list.id))
        .map((i) => ({
          productId: Number(i.productId),
          productName: i.productName,
          productPrice: Number(i.productPrice ?? 0),
          productImage: i.productImage,
          quantity: i.quantity,
        })),
    }));
  }

  async createShoppingList(customerId: number, name: string) {
    const [inserted] = await this.drizzleService.db
      .insert(shoppingLists)
      .values({ customerId, name })
      .returning({ id: shoppingLists.id });
    return { id: Number(inserted.id) };
  }

  async updateShoppingList(customerId: number, listId: number, name: string) {
    await this.drizzleService.db
      .update(shoppingLists)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(shoppingLists.id, BigInt(listId)),
          eq(shoppingLists.customerId, customerId),
        ),
      );
  }

  async deleteShoppingList(customerId: number, listId: number) {
    await this.drizzleService.db
      .delete(shoppingLists)
      .where(
        and(
          eq(shoppingLists.id, BigInt(listId)),
          eq(shoppingLists.customerId, customerId),
        ),
      );
  }

  async addToShoppingList(
    customerId: number,
    listId: number,
    productId: number,
    quantity = 1,
  ) {
    // Verify list ownership
    const [list] = await this.drizzleService.db
      .select({ id: shoppingLists.id })
      .from(shoppingLists)
      .where(
        and(
          eq(shoppingLists.id, BigInt(listId)),
          eq(shoppingLists.customerId, customerId),
        ),
      );

    if (!list) throw new Error('Lista no encontrada');

    // Check if product already in list
    const [existing] = await this.drizzleService.db
      .select({ id: shoppingListItems.id })
      .from(shoppingListItems)
      .where(
        and(
          eq(shoppingListItems.listId, listId),
          eq(shoppingListItems.productId, productId),
        ),
      );

    if (existing) {
      await this.drizzleService.db
        .update(shoppingListItems)
        .set({ quantity: sql`${shoppingListItems.quantity} + ${quantity}` })
        .where(
          and(
            eq(shoppingListItems.listId, listId),
            eq(shoppingListItems.productId, productId),
          ),
        );
    } else {
      await this.drizzleService.db
        .insert(shoppingListItems)
        .values({ listId, productId, quantity });
    }
  }

  async updateShoppingListItem(
    listId: number,
    productId: number,
    quantity: number,
  ) {
    if (quantity <= 0) {
      await this.drizzleService.db
        .delete(shoppingListItems)
        .where(
          and(
            eq(shoppingListItems.listId, listId),
            eq(shoppingListItems.productId, productId),
          ),
        );
    } else {
      await this.drizzleService.db
        .update(shoppingListItems)
        .set({ quantity })
        .where(
          and(
            eq(shoppingListItems.listId, listId),
            eq(shoppingListItems.productId, productId),
          ),
        );
    }
  }

  async removeShoppingListItem(listId: number, productId: number) {
    await this.drizzleService.db
      .delete(shoppingListItems)
      .where(
        and(
          eq(shoppingListItems.listId, listId),
          eq(shoppingListItems.productId, productId),
        ),
      );
  }
}
