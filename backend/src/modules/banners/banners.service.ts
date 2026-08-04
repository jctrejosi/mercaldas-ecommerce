import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { and, eq, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { banners, media, savedFilters } from '../../../drizzle/schema';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannersDto,
} from './dto/banner.dto';

export interface BannerResponse {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  linkTarget: string;
  ctaText: string | null;
  altText: string | null;
  bgColor: string | null;
  accentColor: string | null;
  bannerType: string;
  position: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  filterId: number | null;
  filter: {
    id: number;
    name: string;
    categoryIds: number[];
    brandId: number | null;
    productTypeCode: string | null;
    onSale: boolean;
    search: string | null;
    sort: string | null;
    priceMin: number | null;
    priceMax: number | null;
  } | null;
  clicks: number;
  views: number;
  status: 'activo' | 'programado' | 'inactivo' | 'expirado';
  createdAt: string;
  updatedAt: string;
}

type BannerRow = typeof banners.$inferSelect;

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  private computeStatus(banner: {
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
  }): 'activo' | 'programado' | 'inactivo' | 'expirado' {
    if (!banner.isActive) return 'inactivo';
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now)
      return 'programado';
    if (banner.endDate && new Date(banner.endDate) < now) return 'expirado';
    return 'activo';
  }

  private async resolveImagePath(
    mediaId: number | null,
  ): Promise<string | null> {
    if (!mediaId) return null;
    const [m] = await this.db
      .select({ path: media.path })
      .from(media)
      .where(eq(media.id, BigInt(mediaId)))
      .limit(1);
    return m?.path ?? null;
  }

  private async toResponse(row: BannerRow): Promise<BannerResponse> {
    const [image, mobileImage] = await Promise.all([
      this.resolveImagePath(row.mediaId),
      this.resolveImagePath(row.mobileImageId),
    ]);

    let filter: BannerResponse['filter'] = null;
    if (row.filterId) {
      const rows = await this.db
        .select()
        .from(savedFilters)
        .where(eq(savedFilters.id, BigInt(row.filterId)))
        .limit(1);
      const f: any = rows[0];
      if (f) {
        filter = {
          id: Number(f.id),
          name: f.name,
          categoryIds: (f.categoryIds as number[]) ?? [],
          brandId: f.brandId,
          productTypeCode: f.productTypeCode,
          onSale: f.onSale ?? false,
          search: f.search,
          sort: f.sort,
          priceMin: f.priceMin,
          priceMax: f.priceMax,
        };
      }
    }

    return {
      id: Number(row.id),
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      image,
      mobileImage,
      linkUrl: row.linkUrl,
      linkTarget: row.linkTarget,
      ctaText: row.ctaText,
      altText: row.altText,
      bgColor: row.bgColor,
      accentColor: row.accentColor,
      bannerType: row.bannerType,
      position: row.position ?? 0,
      isActive: row.isActive,
      startDate: row.startDate,
      endDate: row.endDate,
      filterId: row.filterId ? Number(row.filterId) : null,
      filter,
      clicks: row.clicks,
      views: row.views,
      status: this.computeStatus(row),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(query: QueryBannersDto): Promise<BannerResponse[]> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (query.bannerType) {
      conditions.push(eq(banners.bannerType, query.bannerType));
    }

    const rows = await this.db
      .select()
      .from(banners)
      .where(and(...conditions))
      .orderBy(desc(banners.position), desc(banners.createdAt));

    const result = await Promise.all(rows.map((r) => this.toResponse(r)));

    if (query.status && query.status !== 'todas') {
      return result.filter((r) => r.status === query.status);
    }

    return result;
  }

  async findOne(id: number): Promise<BannerResponse> {
    const rows = await this.db
      .select()
      .from(banners)
      .where(eq(banners.id, BigInt(id)))
      .limit(1);

    if (!rows.length) {
      throw new NotFoundException(`Banner con ID ${id} no encontrado`);
    }

    return this.toResponse(rows[0]);
  }

  async create(dto: CreateBannerDto): Promise<BannerResponse> {
    const [newBanner] = await this.db
      .insert(banners)
      .values({
        title: dto.title,
        subtitle: dto.subtitle ?? null,
        description: dto.description ?? null,
        mediaId: dto.mediaId,
        mobileImageId: dto.mobileImageId ?? null,
        filterId: dto.filterId ?? null,
        linkUrl: dto.linkUrl ?? null,
        linkTarget: dto.linkTarget ?? '_self',
        altText: dto.altText ?? dto.title,
        ctaText: dto.ctaText ?? null,
        bgColor: dto.bgColor ?? null,
        accentColor: dto.accentColor ?? null,
        bannerType: dto.bannerType ?? 'promo',
        position: dto.position ?? 0,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
      })
      .returning({ id: banners.id });

    this.logger.log(`Banner creado: ID=${Number(newBanner.id)}`);
    return this.findOne(Number(newBanner.id));
  }

  async update(id: number, dto: UpdateBannerDto): Promise<BannerResponse> {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.mediaId !== undefined) updateData.mediaId = dto.mediaId;
    if (dto.mobileImageId !== undefined)
      updateData.mobileImageId = dto.mobileImageId;
    if (dto.filterId !== undefined) updateData.filterId = dto.filterId;
    if (dto.linkUrl !== undefined) updateData.linkUrl = dto.linkUrl;
    if (dto.linkTarget !== undefined) updateData.linkTarget = dto.linkTarget;
    if (dto.altText !== undefined) updateData.altText = dto.altText;
    if (dto.ctaText !== undefined) updateData.ctaText = dto.ctaText;
    if (dto.bgColor !== undefined) updateData.bgColor = dto.bgColor;
    if (dto.accentColor !== undefined) updateData.accentColor = dto.accentColor;
    if (dto.bannerType !== undefined) updateData.bannerType = dto.bannerType;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;

    if (Object.keys(updateData).length > 0) {
      await this.db
        .update(banners)
        .set(updateData)
        .where(eq(banners.id, BigInt(id)));
    }

    this.logger.log(`Banner actualizado: ID=${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.db.delete(banners).where(eq(banners.id, BigInt(id)));
    this.logger.log(`Banner eliminado: ID=${id}`);
    return { success: true };
  }

  async recordClick(id: number): Promise<void> {
    await this.drizzle.db.execute(
      sql`UPDATE banners SET clicks = clicks + 1 WHERE id = ${BigInt(id)}`,
    );
  }

  async recordView(id: number): Promise<void> {
    await this.drizzle.db.execute(
      sql`UPDATE banners SET views = views + 1 WHERE id = ${BigInt(id)}`,
    );
  }
}
