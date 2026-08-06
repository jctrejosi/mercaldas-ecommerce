import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Public } from '../../common/decorators/public.decorator';
import { DrizzleService } from '../../database/drizzle.service';
import { store, settings } from '../../../drizzle/schema';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  @Get('store')
  async getStore() {
    const [row] = await this.db.select().from(store).limit(1);
    if (!row) return {};
    return {
      tradeName: row.tradeName,
      primaryDomain: row.primaryDomain,
      email: row.email,
      currencyCode: row.currencyCode,
      timezone: row.timezone,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
    };
  }

  @Put('store')
  @HttpCode(HttpStatus.OK)
  async updateStore(
    @Body()
    body: {
      tradeName?: string;
      primaryDomain?: string;
      email?: string;
      currencyCode?: string;
      timezone?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
    },
  ) {
    const [row] = await this.db.select({ id: store.id }).from(store).limit(1);
    if (!row) return { error: 'No store found' };

    const data: Record<string, unknown> = {};
    if (body.tradeName !== undefined) data.tradeName = body.tradeName;
    if (body.primaryDomain !== undefined) data.primaryDomain = body.primaryDomain;
    if (body.email !== undefined) data.email = body.email;
    if (body.currencyCode !== undefined) data.currencyCode = body.currencyCode;
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp;
    if (body.address !== undefined) data.address = body.address;

    if (Object.keys(data).length > 0) {
      data.updatedAt = new Date().toISOString();
      await this.db.update(store).set(data as any).where(eq(store.id, row.id));
    }
    return this.getStore();
  }

  // ── Payment methods ──
  @Put('payment-methods')
  @HttpCode(HttpStatus.OK)
  async updatePaymentMethods(@Body() body: any) {
    const row = await this.db.select().from(settings).where(eq(settings.key, 'payment_methods')).limit(1);
    if (row.length) {
      await this.db.update(settings).set({ value: body }).where(eq(settings.key, 'payment_methods'));
    } else {
      await this.db.insert(settings).values({
        key: 'payment_methods',
        value: body,
        dataType: 'json',
        module: 'payments',
        description: 'Configuración de medios de pago habilitados',
        isPublic: true,
      } as any);
    }
    return this.getPaymentMethods();
  }

  @Get('payment-methods')
  async getPaymentMethods() {
    const [row] = await this.db.select().from(settings).where(eq(settings.key, 'payment_methods')).limit(1);
    if (!row) {
      return {
        wompi: { enabled: true, methods: { card: true, pse: true, nequi: true } },
        breb: { enabled: true },
      };
    }
    return row.value as any;
  }

  @Public()
  @Get("public-info")
  async getPublicInfo() {
    const [row] = await this.db.select().from(store).limit(1);
    if (!row) return {};
    return { phone: row.phone, whatsapp: row.whatsapp, tradeName: row.tradeName };
  }
}
