import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { settings, productTypes } from '../../../drizzle/schema';

@Injectable()
export class LandingService {
  private readonly logger = new Logger(LandingService.name);
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() { return this.drizzle.db; }

  async getProductTypes() {
    const allTypes = await this.db.select().from(productTypes).orderBy(productTypes.name as any);
    const selected = await this.getSelectedCodes();
    return allTypes.map((t: any) => ({
      id: Number(t.id), code: t.code, name: t.name, count: t.productCount ?? 0,
      selected: selected.includes(t.code),
    }));
  }

  async updateProductTypes(codes: string[]) {
    const row = await this.db.select().from(settings).where(eq(settings.key, 'landing_product_types')).limit(1);
    if (row.length) {
      await this.db.update(settings).set({ value: codes as any }).where(eq(settings.key, 'landing_product_types'));
    } else {
      await this.db.insert(settings).values({
        key: 'landing_product_types', value: codes as any, dataType: 'json',
        module: 'landing', description: 'Tipos de producto visibles en la landing',
        isPublic: true,
      } as any);
    }
    return this.getProductTypes();
  }

  async getSelectedCodes(): Promise<string[]> {
    const row = await this.db.select().from(settings).where(eq(settings.key, 'landing_product_types')).limit(1);
    if (!row.length) return [];
    return (row[0].value as string[]) ?? [];
  }

  async getFeaturedProductTypes() {
    const selected = await this.getSelectedCodes();
    if (selected.length === 0) {
      return this.db.select().from(productTypes).orderBy(productTypes.name as any).then((rows: any[]) =>
        rows.map((t) => ({ id: Number(t.id), code: t.code, name: t.name, count: t.productCount ?? 0 }))
      );
    }
    const types: any[] = [];
    for (const code of selected) {
      const rows = await this.db.select().from(productTypes).where(eq(productTypes.code, code) as any).limit(1);
      if (rows.length) {
        const t = rows[0] as any;
        types.push({ id: Number(t.id), code: t.code, name: t.name, count: t.productCount ?? 0 });
      }
    }
    return types;
  }
}
