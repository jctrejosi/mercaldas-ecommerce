import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { and, eq, desc, isNull, ilike, or, sql } from 'drizzle-orm';
import { Resend } from 'resend';
import { DrizzleService } from '../../database/drizzle.service';
import {
  newsletterCampaigns,
  newsletterSubscribers,
  settings,
} from '../../../drizzle/schema';
import {
  SubscribeDto,
  CreateCampaignDto,
  UpdateCampaignDto,
  QuerySubscribersDto,
} from './dto/newsletter.dto';

export interface SubscriberResponse {
  id: number;
  email: string;
  name: string | null;
  acceptedTerms: boolean;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export interface CampaignResponse {
  id: number;
  title: string;
  subject: string;
  content: string;
  imageUrl: string | null;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

type CampaignRow = typeof newsletterCampaigns.$inferSelect;

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly resend: Resend | null;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('resend.apiKey') || '';
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  private get db() {
    return this.drizzle.db;
  }

  private get senderEmail(): string {
    return this.config.get<string>('resend.senderEmail') || 'onboarding@resend.dev';
  }

  private get resendEnabled(): boolean {
    return !!this.resend;
  }

  // ── Subscribers ──────────────────────────────────────────

  async subscribe(dto: SubscribeDto): Promise<SubscriberResponse> {
    const email = dto.email.toLowerCase().trim();

    if (!dto.acceptedTerms) {
      throw new BadRequestException(
        'Debes aceptar los términos y condiciones del newsletter',
      );
    }

    const existing = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    let subscriber: SubscriberResponse;

    if (existing.length) {
      const sub = existing[0];
      // Reactivar si estaba inactivo
      if (!sub.isActive || sub.deletedAt) {
        await this.db
          .update(newsletterSubscribers)
          .set({
            isActive: true,
            acceptedTerms: dto.acceptedTerms,
            name: dto.name ?? sub.name,
            unsubscribedAt: null,
            deletedAt: null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(newsletterSubscribers.id, sub.id));
        subscriber = await this.getSubscriber(Number(sub.id));
      } else {
        throw new BadRequestException(
          'Este correo ya está suscrito al newsletter',
        );
      }
    } else {
      const [row] = await this.db
        .insert(newsletterSubscribers)
        .values({
          email,
          name: dto.name ?? null,
          acceptedTerms: dto.acceptedTerms,
          isActive: true,
        })
        .returning({ id: newsletterSubscribers.id });
      subscriber = await this.getSubscriber(Number(row.id));
      this.logger.log(`Nuevo suscriptor: ${email}`);

      // Enviar email de bienvenida (solo para suscripciones nuevas, no reactivaciones)
      const welcome = await this.getWelcomeConfig();
      if (welcome && this.resendEnabled) {
        try {
          const html = welcome.content
            .replace(/{{name}}/g, dto.name || 'Cliente')
            .replace(/{{email}}/g, email);
          await this.resend!.emails.send({
            from: this.senderEmail,
            to: [email],
            subject: welcome.subject,
            html,
          });
          this.logger.log(`Email de bienvenida enviado a ${email}`);
        } catch (err: any) {
          this.logger.error(`Error al enviar bienvenida a ${email}: ${err.message}`);
        }
      }
    }

    return subscriber;
  }

  async unsubscribe(email: string): Promise<{ success: boolean }> {
    const normalized = email.toLowerCase().trim();
    const existing = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalized))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('El correo no está suscrito al newsletter');
    }

    await this.db
      .update(newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(newsletterSubscribers.id, existing[0].id));

    this.logger.log(`Suscriptor dado de baja: ${normalized}`);
    return { success: true };
  }

  async getSubscriber(id: number): Promise<SubscriberResponse> {
    const [row] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, BigInt(id)))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`Suscriptor ${id} no encontrado`);
    }

    return {
      id: Number(row.id),
      email: row.email,
      name: row.name,
      acceptedTerms: row.acceptedTerms,
      isActive: row.isActive,
      subscribedAt: row.subscribedAt,
      unsubscribedAt: row.unsubscribedAt,
    };
  }

  async listSubscribers(
    query: QuerySubscribersDto,
  ): Promise<{ items: SubscriberResponse[]; total: number }> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (query.status === 'activo') {
      conditions.push(eq(newsletterSubscribers.isActive, true));
    } else if (query.status === 'inactivo') {
      conditions.push(eq(newsletterSubscribers.isActive, false));
    }

    const where = conditions.length
      ? and(...conditions)
      : isNull(newsletterSubscribers.deletedAt);

    const rows = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(where)
      .orderBy(desc(newsletterSubscribers.subscribedAt))
      .limit(query.limit ?? 50)
      .offset(((query.page ?? 1) - 1) * (query.limit ?? 50));

    const items = rows.map((r) => ({
      id: Number(r.id),
      email: r.email,
      name: r.name,
      acceptedTerms: r.acceptedTerms,
      isActive: r.isActive,
      subscribedAt: r.subscribedAt,
      unsubscribedAt: r.unsubscribedAt,
    }));

    let total = items.length;
    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;
      const [{ count }] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers)
        .where(
          and(
            where,
            or(
              ilike(newsletterSubscribers.email, search),
              ilike(newsletterSubscribers.name ?? sql`''`, search),
            ),
          ),
        );
      total = count;
    }

    return { items, total };
  }

  async removeSubscriber(id: number): Promise<{ success: boolean }> {
    await this.db
      .update(newsletterSubscribers)
      .set({
        isActive: false,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(newsletterSubscribers.id, BigInt(id)));
    return { success: true };
  }

  async countActiveSubscribers(): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.isActive, true));
    return count;
  }

  // ── Campaigns ────────────────────────────────────────────

  private toCampaignResponse(row: CampaignRow): CampaignResponse {
    return {
      id: Number(row.id),
      title: row.title,
      subject: row.subject,
      content: row.content,
      imageUrl: row.imageUrl,
      status: row.status,
      scheduledAt: row.scheduledAt,
      sentAt: row.sentAt,
      sentCount: row.sentCount ?? 0,
      failedCount: row.failedCount ?? 0,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async listCampaigns(): Promise<CampaignResponse[]> {
    const rows = await this.db
      .select()
      .from(newsletterCampaigns)
      .where(isNull(newsletterCampaigns.deletedAt))
      .orderBy(desc(newsletterCampaigns.createdAt));
    return rows.map((r) => this.toCampaignResponse(r));
  }

  async findCampaign(id: number): Promise<CampaignResponse> {
    const [row] = await this.db
      .select()
      .from(newsletterCampaigns)
      .where(
        and(
          eq(newsletterCampaigns.id, BigInt(id)),
          isNull(newsletterCampaigns.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException(`Campaña ${id} no encontrada`);
    }
    return this.toCampaignResponse(row);
  }

  async createCampaign(dto: CreateCampaignDto): Promise<CampaignResponse> {
    const scheduled = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const status = scheduled && scheduled > new Date() ? 'programada' : 'borrador';

    const [row] = await this.db
      .insert(newsletterCampaigns)
      .values({
        title: dto.title,
        subject: dto.subject,
        content: dto.content,
        imageUrl: dto.imageUrl ?? null,
        status,
        scheduledAt: scheduled ? scheduled.toISOString() : null,
      })
      .returning({ id: newsletterCampaigns.id });

    this.logger.log(`Campaña creada: ID=${Number(row.id)} status=${status}`);
    return this.findCampaign(Number(row.id));
  }

  async updateCampaign(
    id: number,
    dto: UpdateCampaignDto,
  ): Promise<CampaignResponse> {
    const campaign = await this.findCampaign(id);

    if (campaign.status === 'enviada' || campaign.status === 'enviando') {
      throw new BadRequestException(
        'No se puede editar una campaña ya enviada',
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.subject !== undefined) updateData.subject = dto.subject;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.scheduledAt !== undefined) {
      const scheduled = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
      updateData.scheduledAt = scheduled ? scheduled.toISOString() : null;
      updateData.status =
        scheduled && scheduled > new Date() ? 'programada' : 'borrador';
    }

    await this.db
      .update(newsletterCampaigns)
      .set(updateData)
      .where(eq(newsletterCampaigns.id, BigInt(id)));

    return this.findCampaign(id);
  }

  async deleteCampaign(id: number): Promise<{ success: boolean }> {
    await this.findCampaign(id);
    await this.db
      .update(newsletterCampaigns)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(newsletterCampaigns.id, BigInt(id)));
    return { success: true };
  }

  async sendCampaignNow(id: number): Promise<CampaignResponse> {
    const campaign = await this.findCampaign(id);
    if (campaign.status === 'enviada' || campaign.status === 'enviando') {
      throw new BadRequestException('La campaña ya fue enviada');
    }
    await this.executeCampaign(Number(id));
    return this.findCampaign(id);
  }

  private async executeCampaign(id: number): Promise<void> {
    const campaign = await this.findCampaign(id);

    if (!this.resendEnabled) {
      this.logger.warn(
        'RESEND_API_KEY no configurado — marcando campaña como fallida',
      );
      await this.db
        .update(newsletterCampaigns)
        .set({
          status: 'fallida',
          errorMessage: 'RESEND_API_KEY no configurado en el servidor',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(newsletterCampaigns.id, BigInt(id)));
      return;
    }

    // Marcar como enviando
    await this.db
      .update(newsletterCampaigns)
      .set({ status: 'enviando', updatedAt: new Date().toISOString() })
      .where(eq(newsletterCampaigns.id, BigInt(id)));

    const subscribers = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.isActive, true));

    if (!subscribers.length) {
      await this.db
        .update(newsletterCampaigns)
        .set({
          status: 'enviada',
          sentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(newsletterCampaigns.id, BigInt(id)));
      return;
    }

    // Construir HTML base
    const html = this.buildEmailHtml(campaign);

    let sent = 0;
    let failed = 0;
    let lastError: string | null = null;

    // Enviar en lotes de 50 para no saturar
    for (let i = 0; i < subscribers.length; i += 50) {
      const batch = subscribers.slice(i, i + 50);
      await Promise.all(
        batch.map(async (sub) => {
          try {
            await this.resend!.emails.send({
              from: this.senderEmail,
              to: [sub.email],
              subject: campaign.subject,
              html,
            });
            sent += 1;
          } catch (err: any) {
            failed += 1;
            lastError = err?.message || 'Error al enviar';
          }
        }),
      );
    }

    const status: any = failed > 0 && sent === 0 ? 'fallida' : 'enviada';
    await this.db
      .update(newsletterCampaigns)
      .set({
        status,
        sentAt: new Date().toISOString(),
        sentCount: sent,
        failedCount: failed,
        errorMessage: lastError,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(newsletterCampaigns.id, BigInt(id)));

    this.logger.log(
      `Campaña ${id} enviada: ${sent} ok / ${failed} fallidos`,
    );
  }

  private buildEmailHtml(campaign: {
    imageUrl: string | null;
    subject: string;
    content: string;
  }): string {
    const headerImage = campaign.imageUrl
      ? `<img src="${campaign.imageUrl}" alt="" style="width:100%; max-width:600px; border-radius:12px; display:block; margin:0 auto 24px;" />`
      : '';

    return `
      <div style="font-family:Arial,Helvetica,sans-serif; background:#f7f7f8; padding:32px 16px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <div style="background:#1A1A2E; padding:24px; text-align:center;">
            <span style="color:#FFF200; font-size:24px; font-weight:bold; letter-spacing:1px;">Merc<span style="color:#ffffff;">Aldas</span></span>
          </div>
          <div style="padding:32px 24px;">
            ${headerImage}
            <h1 style="font-size:22px; color:#1A1A2E; margin:0 0 16px; line-height:1.3;">${campaign.subject}</h1>
            ${campaign.content}
            <div style="margin-top:32px; padding-top:16px; border-top:1px solid #eee; font-size:12px; color:#888;">
              <p>Estás recibiendo este correo porque te suscribiste al newsletter de MercAldas.</p>
              <p><a href="${this.getFrontendUrl()}/?unsubscribe=${encodeURIComponent('')}" style="color:#888; text-decoration:underline;">Cancelar suscripción</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  // ── Scheduler: revisar campañas programadas cada 30s ─────
  @Interval(30000)
  async checkScheduledCampaigns(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const rows = await this.db
        .select()
        .from(newsletterCampaigns)
        .where(
          and(
            eq(newsletterCampaigns.status, 'programada'),
            sql`${newsletterCampaigns.scheduledAt} <= ${now}`,
            isNull(newsletterCampaigns.deletedAt),
          ),
        );

      for (const row of rows) {
        this.logger.log(`Ejecutando campaña programada: ${row.title}`);
        await this.executeCampaign(Number(row.id));
      }
    } catch (err: any) {
      this.logger.error(`Error en scheduler de campañas: ${err.message}`);
    }
  }

  // ── Welcome email config ─────────────────────────────────

  async getWelcomeConfig(): Promise<WelcomeConfig | null> {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'newsletter_welcome'))
      .limit(1);
    if (!row.length) return null;
    return (row[0].value as WelcomeConfig) ?? null;
  }

  async updateWelcomeConfig(data: WelcomeConfig): Promise<WelcomeConfig> {
    const row = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, 'newsletter_welcome'))
      .limit(1);
    const value = data as any;
    if (row.length) {
      await this.db
        .update(settings)
        .set({ value, updatedAt: new Date().toISOString() } as any)
        .where(eq(settings.key, 'newsletter_welcome'));
    } else {
      await this.db.insert(settings).values({
        key: 'newsletter_welcome',
        value,
        dataType: 'json',
        module: 'newsletter',
        description: 'Configuración del email de bienvenida para nuevos suscriptores',
        isPublic: false,
      } as any);
    }
    return data;
  }
}

export interface WelcomeConfig {
  subject: string;
  content: string;
}