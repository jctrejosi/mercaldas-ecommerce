import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import {
  branches,
  cartItems,
  carts,
  categories,
  media,
  productCategories,
  productImages,
  products,
  productVariants,
} from '../../../drizzle/schema';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.db;
  }

  async getCart(customerId: number) {
    const cart = await this.getOrCreateActiveCart(customerId);
    return this.buildCartResponse(Number(cart.id));
  }

  async updateCart(customerId: number, dto: UpdateCartDto) {
    const cart = await this.getOrCreateActiveCart(customerId);
    const cartId = Number(cart.id);

    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    if (dto.items.length > 0) {
      const productIds = dto.items.map((item) => item.productId);
      const variants = await this.db
        .select({
          variantId: productVariants.id,
          productId: productVariants.productId,
          price: productVariants.currentPrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(
          and(
            inArray(productVariants.productId, productIds),
            eq(productVariants.isActive, true),
            isNull(productVariants.deletedAt),
            eq(products.isActive, true),
            isNull(products.deletedAt),
          ),
        )
        .orderBy(asc(productVariants.productId), asc(productVariants.id));

      const variantByProductId = new Map<number, (typeof variants)[number]>();
      for (const variant of variants) {
        const productId = Number(variant.productId);
        if (!variantByProductId.has(productId)) {
          variantByProductId.set(productId, variant);
        }
      }

      const payload = dto.items
        .map((item) => {
          const variant = variantByProductId.get(item.productId);
          if (!variant) return null;

          const unitPrice = Number(variant.price);
          return {
            cartId,
            productVariantId: Number(variant.variantId),
            quantity: item.quantity,
            unitPrice: String(unitPrice),
            subtotal: String(unitPrice * item.quantity),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (payload.length > 0) {
        await this.db.insert(cartItems).values(payload);
      }
    }

    await this.db
      .update(carts)
      .set({ lastActivityAt: new Date().toISOString() })
      .where(eq(carts.id, BigInt(cartId)));

    return this.buildCartResponse(cartId);
  }

  private async getOrCreateActiveCart(customerId: number) {
    const existing = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.customerId, customerId), eq(carts.status, 'ACTIVE')))
      .limit(1);

    if (existing.length) {
      return existing[0];
    }

    const branch = await this.db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.isActive, true), isNull(branches.deletedAt)))
      .orderBy(asc(branches.priority), asc(branches.id))
      .limit(1);

    if (!branch.length) {
      throw new NotFoundException('No hay sucursales activas para crear carrito');
    }

    const inserted = await this.db
      .insert(carts)
      .values({
        customerId,
        guestSessionId: null,
        branchId: Number(branch[0].id),
        status: 'ACTIVE',
        lastActivityAt: new Date().toISOString(),
      })
      .returning({ id: carts.id });

    return inserted[0];
  }

  private async buildCartResponse(cartId: number) {
    const rows = await this.db
      .select({
        productId: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: productVariants.currentPrice,
        originalPrice: productVariants.currentComparePrice,
        image: media.path,
        category: categories.name,
        categoryId: categories.id,
        quantity: cartItems.quantity,
        isFeatured: products.featured,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(productCategories, eq(productCategories.productId, products.id))
      .innerJoin(categories, eq(categories.id, productCategories.categoryId))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isCover, true)),
      )
      .leftJoin(media, eq(media.id, productImages.mediaId))
      .where(eq(cartItems.cartId, cartId))
      .orderBy(asc(cartItems.createdAt));

    const items = new Map<number, {
      id: number;
      slug: string;
      name: string;
      description: string | null;
      price: number;
      originalPrice?: number;
      image: string | null;
      category: string;
      categoryId: number;
      quantity: number;
      isFeatured: boolean;
    }>();

    for (const row of rows) {
      const productId = Number(row.productId);
      if (items.has(productId)) continue;

      items.set(productId, {
        id: productId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
        image: row.image,
        category: row.category,
        categoryId: Number(row.categoryId),
        quantity: row.quantity,
        isFeatured: row.isFeatured,
      });
    }

    return {
      items: Array.from(items.values()),
    };
  }
}
