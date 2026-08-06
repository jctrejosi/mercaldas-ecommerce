import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { and, eq, desc, asc, isNull, sql, count, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  deliveryZones,
  inventory,
  productVariants,
  products,
  productCategories,
  categories,
  brands,
  orders,
  media,
} from '../../../drizzle/schema';
import { CreateBranchDto, UpdateBranchDto, CreateDeliveryZoneDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  // ── Branches CRUD ──

  async findAll() {
    const rows = await this.db
      .select()
      .from(branches)
      .where(isNull(branches.deletedAt))
      .orderBy(asc(branches.priority), asc(branches.name));

    const mediaIds = rows
      .map((r: any) => r.imageMediaId)
      .filter((x) => x != null);
    const mediaMap = new Map<number, string>();
    if (mediaIds.length > 0) {
      const mediaRows = await this.db
        .select({ id: media.id, path: media.path })
        .from(media)
        .where(inArray(media.id, mediaIds));
      for (const m of mediaRows) mediaMap.set(Number(m.id), m.path);
    }

    return Promise.all(
      rows.map(async (r: any) => {
        const [stats] = await this.db
          .select({ cnt: count(inventory.id) })
          .from(inventory)
          .where(
            and(eq(inventory.branchId, Number(r.id)), sql`${inventory.stock} > 0`),
          );
        return {
          id: Number(r.id),
          code: r.code,
          name: r.name,
          address: r.address,
          city: r.city,
          phone: r.phone,
          email: r.email,
          storeId: r.storeId,
          managerName: r.managerName,
          managerPhone: r.managerPhone,
          location: r.location,
          priority: r.priority,
          branchType: r.branchType,
          deliveryRadiusKm: r.deliveryRadiusKm,
          maxDailyOrders: r.maxDailyOrders,
          schedule: r.schedule,
          isActive: r.isActive,
          imagePath:
            r.imageMediaId != null ? (mediaMap.get(Number(r.imageMediaId)) ?? null) : null,
          productCount: stats?.cnt ?? 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
    );
  }

  async findOne(id: number) {
    const rows = await this.db
      .select()
      .from(branches)
      .where(and(eq(branches.id, BigInt(id)), isNull(branches.deletedAt)))
      .limit(1);
    if (!rows.length) throw new NotFoundException(`Sucursal ${id} no encontrada`);
    const r: any = rows[0];
    const [stats] = await this.db
      .select({ cnt: count(inventory.id) })
      .from(inventory)
      .where(and(eq(inventory.branchId, id), sql`${inventory.stock} > 0`));
    const [orderCount] = await this.db
      .select({ cnt: count(orders.id) })
      .from(orders)
      .where(eq(orders.branchId, id));
    let imagePath: string | null = null;
    if (r.imageMediaId != null) {
      const [img] = await this.db
        .select({ path: media.path })
        .from(media)
        .where(eq(media.id, r.imageMediaId));
      imagePath = img?.path ?? null;
    }
    return {
      id: Number(r.id),
      code: r.code,
      name: r.name,
      address: r.address,
      city: r.city,
      phone: r.phone,
      email: r.email,
      storeId: r.storeId,
      managerName: r.managerName,
      managerPhone: r.managerPhone,
      location: r.location,
      priority: r.priority,
      branchType: r.branchType,
      deliveryRadiusKm: r.deliveryRadiusKm,
      maxDailyOrders: r.maxDailyOrders,
      schedule: r.schedule,
      isActive: r.isActive,
      imagePath,
      productCount: stats?.cnt ?? 0,
      orderCount: orderCount?.cnt ?? 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async create(dto: CreateBranchDto) {
    const existing = await this.db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.code, dto.code))
      .limit(1);
    if (existing.length) throw new BadRequestException(`El código ${dto.code} ya existe`);
    const [row] = await this.db
      .insert(branches)
      .values({
        code: dto.code,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        phone: dto.phone,
        email: dto.email,
        storeId: dto.storeId,
        managerName: dto.managerName,
        managerPhone: dto.managerPhone,
        location: dto.location,
        priority: dto.priority ?? 1,
        branchType: dto.branchType ?? 'STORE',
        deliveryRadiusKm: String(dto.deliveryRadiusKm ?? 5),
        maxDailyOrders: dto.maxDailyOrders ?? null,
        schedule: dto.schedule ?? null,
        isActive: dto.isActive ?? true,
      })
      .returning({ id: branches.id });
    return this.findOne(Number(row.id));
  }

  async update(id: number, dto: UpdateBranchDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dto)) {
      if (v !== undefined && k !== 'imageUrl') data[k] = v;
    }
    if (dto.deliveryRadiusKm !== undefined) data.deliveryRadiusKm = String(dto.deliveryRadiusKm);
    if (dto.imageUrl) {
      const [inserted] = await this.db
        .insert(media)
        .values({
          path: dto.imageUrl,
          fileName:
            dto.imageUrl.split('/').pop()?.substring(0, 50) ?? 'branch_image',
          mimeType: 'image/jpeg',
          mediaType: 'image',
          provider: 'cloudinary',
          sizeBytes: 0,
          checksum: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          status: 'active',
          isPublic: true,
        })
        .returning({ id: media.id });
      data.imageMediaId = Number(inserted.id);
    }
    if (Object.keys(data).length > 0) {
      await this.db.update(branches).set(data).where(eq(branches.id, BigInt(id)));
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db
      .update(branches)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(eq(branches.id, BigInt(id)));
    return { success: true };
  }

  // ── Products in branch ──

  async getProducts(branchId: number) {
    const rows = await this.db
      .select({
        inventoryId: inventory.id,
        stock: inventory.stock,
        reservedStock: inventory.reservedStock,
        reorderPoint: inventory.reorderPoint,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        price: productVariants.currentPrice,
        variantSku: productVariants.sku,
      })
      .from(inventory)
      .innerJoin(productVariants, eq(productVariants.id, inventory.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(and(eq(inventory.branchId, branchId), sql`${inventory.stock} > 0`))
      .orderBy(desc(inventory.stock));

    return rows.map((r: any) => ({
      inventoryId: Number(r.inventoryId),
      stock: r.stock,
      reservedStock: r.reservedStock,
      reorderPoint: r.reorderPoint,
      productId: Number(r.productId),
      productName: r.productName,
      productSlug: r.productSlug,
      price: r.price,
      variantSku: r.variantSku,
    }));
  }

  // ── Categories in branch ──

  async getCategories(branchId: number) {
    const rows = await this.db
      .selectDistinct({
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        cnt: count(products.id),
      })
      .from(inventory)
      .innerJoin(productVariants, eq(productVariants.id, inventory.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(productCategories, eq(productCategories.productId, products.id))
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .where(and(eq(inventory.branchId, branchId), sql`${inventory.stock} > 0`))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(count(products.id)));

    return rows.map((r: any) => ({
      categoryId: Number(r.categoryId),
      categoryName: r.categoryName,
      categorySlug: r.categorySlug,
      productCount: Number(r.cnt),
    }));
  }

  // ── Brands in branch ──

  async getBrands(branchId: number) {
    const rows = await this.db
      .selectDistinct({
        brandId: brands.id,
        brandName: brands.name,
        brandSlug: brands.slug,
        cnt: count(products.id),
      })
      .from(inventory)
      .innerJoin(productVariants, eq(productVariants.id, inventory.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(brands, eq(brands.id, products.brandId))
      .where(and(eq(inventory.branchId, branchId), sql`${inventory.stock} > 0`))
      .groupBy(brands.id, brands.name, brands.slug)
      .orderBy(desc(count(products.id)));

    return rows.map((r: any) => ({
      brandId: Number(r.brandId),
      brandName: r.brandName,
      brandSlug: r.brandSlug,
      productCount: Number(r.cnt),
    }));
  }

  // ── Delivery Zones ──

  async getDeliveryZones(branchId: number) {
    const rows = await this.db
      .select()
      .from(deliveryZones)
      .where(
        and(eq(deliveryZones.branchId, branchId), isNull(deliveryZones.deletedAt)),
      )
      .orderBy(asc(deliveryZones.displayOrder));

    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      deliveryPrice: r.deliveryPrice,
      coverageArea: r.coverageArea,
      displayOrder: r.displayOrder,
      estimatedMinMinutes: r.estimatedMinMinutes,
      estimatedMaxMinutes: r.estimatedMaxMinutes,
      deliveryType: r.deliveryType,
      minimumOrder: r.minimumOrder,
      isActive: r.isActive,
    }));
  }

  async createDeliveryZone(branchId: number, dto: CreateDeliveryZoneDto) {
    const [row] = await this.db
      .insert(deliveryZones)
      .values({
        branchId,
        name: dto.name,
        deliveryPrice: String(dto.deliveryPrice),
        coverageArea: dto.coverageArea,
        estimatedMinMinutes: dto.estimatedMinMinutes,
        estimatedMaxMinutes: dto.estimatedMaxMinutes,
        deliveryType: dto.deliveryType ?? 'STANDARD',
        minimumOrder: String(dto.minimumOrder ?? 0),
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      })
      .returning({ id: deliveryZones.id });
    return { id: Number(row.id), ...dto };
  }

  async removeDeliveryZone(branchId: number, zoneId: number) {
    await this.db
      .update(deliveryZones)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(
        and(eq(deliveryZones.id, BigInt(zoneId)), eq(deliveryZones.branchId, branchId)),
      );
    return { success: true };
  }
}
