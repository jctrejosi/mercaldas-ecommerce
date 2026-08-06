import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { and, eq, desc, isNull } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { popups, media } from '../../../drizzle/schema';
import { CreatePopupDto, UpdatePopupDto } from './dto/popup.dto';

export interface PopupResponse {
  id: number;
  title: string;
  image: string | null;
  position: string;
  filterConfig: Record<string, unknown> | null;
  durationMs: number;
  delayMs: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  status: 'activo' | 'programado' | 'inactivo' | 'expirado';
  createdAt: string;
  updatedAt: string;
}

type PopupRow = typeof popups.$inferSelect;

@Injectable()
export class PopupsService {
  private readonly logger = new Logger(PopupsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  private computeStatus(popup: {
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
  }): 'activo' | 'programado' | 'inactivo' | 'expirado' {
    if (!popup.isActive) return 'inactivo';
    const now = new Date();
    if (popup.startDate && new Date(popup.startDate) > now)
      return 'programado';
    if (popup.endDate && new Date(popup.endDate) < now) return 'expirado';
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

  private async toResponse(row: PopupRow): Promise<PopupResponse> {
    const image = await this.resolveImagePath(row.imageMediaId);

    return {
      id: Number(row.id),
      title: row.title,
      image,
      position: row.position,
      filterConfig: (row.filterConfig as Record<string, unknown>) ?? {},
      durationMs: row.durationMs,
      delayMs: row.delayMs,
      isActive: row.isActive,
      startDate: row.startDate,
      endDate: row.endDate,
      status: this.computeStatus(row),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<PopupResponse[]> {
    const rows = await this.db
      .select()
      .from(popups)
      .where(isNull(popups.deletedAt))
      .orderBy(desc(popups.createdAt));

    return Promise.all(rows.map((r) => this.toResponse(r)));
  }

  async findActive(): Promise<PopupResponse[]> {
    const all = await this.findAll();
    return all.filter((p) => p.status === 'activo');
  }

  async findOne(id: number): Promise<PopupResponse> {
    const rows = await this.db
      .select()
      .from(popups)
      .where(and(eq(popups.id, BigInt(id)), isNull(popups.deletedAt)))
      .limit(1);

    if (!rows.length) {
      throw new NotFoundException(`Popup con ID ${id} no encontrado`);
    }

    return this.toResponse(rows[0]);
  }

  async create(dto: CreatePopupDto): Promise<PopupResponse> {
    const [newPopup] = await this.db
      .insert(popups)
      .values({
        title: dto.title,
        imageMediaId: dto.imageMediaId,
        position: dto.position ?? 'header',
        filterConfig: dto.filterConfig ?? {},
        durationMs: dto.durationMs ?? 7000,
        delayMs: dto.delayMs ?? 1500,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
      })
      .returning({ id: popups.id });

    this.logger.log(`Popup creado: ID=${Number(newPopup.id)}`);
    return this.findOne(Number(newPopup.id));
  }

  async update(id: number, dto: UpdatePopupDto): Promise<PopupResponse> {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.imageMediaId !== undefined)
      updateData.imageMediaId = dto.imageMediaId;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.filterConfig !== undefined)
      updateData.filterConfig = dto.filterConfig;
    if (dto.durationMs !== undefined) updateData.durationMs = dto.durationMs;
    if (dto.delayMs !== undefined) updateData.delayMs = dto.delayMs;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate;

    if (Object.keys(updateData).length > 0) {
      await this.db
        .update(popups)
        .set(updateData)
        .where(eq(popups.id, BigInt(id)));
    }

    this.logger.log(`Popup actualizado: ID=${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    // Soft delete
    await this.db
      .update(popups)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(popups.id, BigInt(id)));
    this.logger.log(`Popup eliminado: ID=${id}`);
    return { success: true };
  }
}
