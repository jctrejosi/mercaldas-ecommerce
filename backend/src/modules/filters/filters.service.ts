import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { savedFilters } from '../../../drizzle/schema';
import { CreateFilterDto, UpdateFilterDto } from './dto/filter.dto';

export type FilterConfig = {
  id: number;
  name: string;
  description: string | null;
  categoryIds: number[];
  brandId: number | null;
  productTypeCode: string | null;
  onSale: boolean;
  search: string | null;
  sort: string | null;
  priceMin: number | null;
  priceMax: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class FiltersService {
  private readonly logger = new Logger(FiltersService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  private toResponse(row: any): FilterConfig {
    return {
      id: Number(row.id),
      name: row.name,
      description: row.description,
      categoryIds: (row.categoryIds as number[]) ?? [],
      brandId: row.brandId,
      productTypeCode: row.productTypeCode,
      onSale: row.onSale ?? false,
      search: row.search,
      sort: row.sort,
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<FilterConfig[]> {
    const rows = await this.db
      .select()
      .from(savedFilters)
      .orderBy(desc(savedFilters.createdAt));
    return rows.map((r) => this.toResponse(r));
  }

  async findOne(id: number): Promise<FilterConfig> {
    const rows = await this.db
      .select()
      .from(savedFilters)
      .where(eq(savedFilters.id, BigInt(id)))
      .limit(1);
    if (!rows.length) throw new NotFoundException(`Filtro ${id} no encontrado`);
    return this.toResponse(rows[0]);
  }

  async create(dto: CreateFilterDto): Promise<FilterConfig> {
    const [row] = await this.db
      .insert(savedFilters)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        categoryIds: dto.categoryIds ?? [],
        brandId: dto.brandId ?? null,
        productTypeCode: dto.productTypeCode ?? null,
        onSale: dto.onSale ?? false,
        search: dto.search ?? null,
        sort: dto.sort ?? null,
        priceMin: dto.priceMin ?? null,
        priceMax: dto.priceMax ?? null,
        isActive: dto.isActive ?? true,
      })
      .returning();
    return this.toResponse(row);
  }

  async update(id: number, dto: UpdateFilterDto): Promise<FilterConfig> {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.categoryIds !== undefined) data.categoryIds = dto.categoryIds;
    if (dto.brandId !== undefined) data.brandId = dto.brandId;
    if (dto.productTypeCode !== undefined)
      data.productTypeCode = dto.productTypeCode;
    if (dto.onSale !== undefined) data.onSale = dto.onSale;
    if (dto.search !== undefined) data.search = dto.search;
    if (dto.sort !== undefined) data.sort = dto.sort;
    if (dto.priceMin !== undefined) data.priceMin = dto.priceMin;
    if (dto.priceMax !== undefined) data.priceMax = dto.priceMax;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (Object.keys(data).length > 0) {
      await this.db
        .update(savedFilters)
        .set(data)
        .where(eq(savedFilters.id, BigInt(id)));
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.db.delete(savedFilters).where(eq(savedFilters.id, BigInt(id)));
    return { success: true };
  }
}
