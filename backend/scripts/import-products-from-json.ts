/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, isNull } from 'drizzle-orm';
import { Pool } from 'pg';
import slugify from 'slugify';
import * as schema from '../drizzle/schema';

type CatalogProductRow = {
  CODIGO: string;
  PLU: string;
  NOMBRE: string;
  SALDO: string;
  SALDO2: string;
  EAN: string;
  VENTA1: string;
  VENTA2: string;
  VENTA3: string;
  VENTA4: string;
  VENTA5: string;
  VENTA6: string;
  VENTA7: string;
  VENTA8: string;
  VENTA9: string;
  VENTA0: string;
  TIPO_IMP: string;
  FAMILIA: string;
  DEPARTAMENTO: string;
  GRUPO: string;
  SECCION: string;
  MARCA: string;
  CATEGORIA: string;
};

type CatalogFile = {
  PRODUCTOS: CatalogProductRow[];
};

type CategoryNodeInput = {
  code: string;
  parentCode: string | null;
  level: number;
  label: string;
};

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL missing');
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

const catalogFilePath = path.join(__dirname, 'CATALOGO_0.JSON');
const rawData = fs.readFileSync(catalogFilePath, 'utf8');
const catalog = JSON.parse(rawData) as CatalogFile;
const sourceProducts = catalog.PRODUCTOS ?? [];

const taxCodeByTipoImp: Record<string, string> = {
  J: 'IVA19',
  C: 'IVA5',
  E: 'EXENTO',
};

const taxMap = new Map<string, number>();
const categoryIdByCode = new Map<string, number>();

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim();
}

function parseNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.trim().replace(/,/g, '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseInteger(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSlug(parts: Array<string | number>) {
  return slugify(
    parts
      .map((part) => String(part).trim())
      .filter(Boolean)
      .join('-'),
    {
      lower: true,
      strict: true,
      locale: 'es',
      trim: true,
    },
  );
}

function buildCategoryLabel(
  type: 'familia' | 'departamento' | 'grupo' | 'seccion' | 'categoria',
  code: string,
) {
  const prefixMap = {
    familia: 'Familia',
    departamento: 'Departamento',
    grupo: 'Grupo',
    seccion: 'Sección',
    categoria: 'Categoría',
  } as const;

  return `${prefixMap[type]} ${code}`;
}

function collectCategoryNodes(
  products: CatalogProductRow[],
): CategoryNodeInput[] {
  const nodes = new Map<string, CategoryNodeInput>();

  for (const product of products) {
    const familia = normalizeText(product.FAMILIA);
    const departamento = normalizeText(product.DEPARTAMENTO);
    const grupo = normalizeText(product.GRUPO);
    const seccion = normalizeText(product.SECCION);
    const categoria = normalizeText(product.CATEGORIA);

    if (familia) {
      nodes.set(`familia:${familia}`, {
        code: `familia:${familia}`,
        parentCode: null,
        level: 0,
        label: buildCategoryLabel('familia', familia),
      });
    }

    if (departamento) {
      nodes.set(`departamento:${departamento}`, {
        code: `departamento:${departamento}`,
        parentCode: familia ? `familia:${familia}` : null,
        level: 1,
        label: buildCategoryLabel('departamento', departamento),
      });
    }

    if (grupo) {
      nodes.set(`grupo:${grupo}`, {
        code: `grupo:${grupo}`,
        parentCode: departamento ? `departamento:${departamento}` : null,
        level: 2,
        label: buildCategoryLabel('grupo', grupo),
      });
    }

    if (seccion) {
      nodes.set(`seccion:${seccion}`, {
        code: `seccion:${seccion}`,
        parentCode: grupo ? `grupo:${grupo}` : null,
        level: 3,
        label: buildCategoryLabel('seccion', seccion),
      });
    }

    if (categoria) {
      nodes.set(`categoria:${seccion}:${categoria}`, {
        code: `categoria:${seccion}:${categoria}`,
        parentCode: seccion ? `seccion:${seccion}` : null,
        level: 4,
        label: buildCategoryLabel('categoria', categoria),
      });
    }
  }

  return [...nodes.values()].sort(
    (a, b) => a.level - b.level || a.code.localeCompare(b.code),
  );
}

async function ensureTaxRates() {
  const rates = [
    { code: 'IVA19', name: 'IVA 19%', rate: '19.00', taxType: 'VAT' },
    { code: 'IVA5', name: 'IVA 5%', rate: '5.00', taxType: 'VAT' },
    { code: 'EXENTO', name: 'Exento', rate: '0.00', taxType: 'EXEMPT' },
  ] as const;

  for (const rate of rates) {
    const existing = await db
      .select({ id: schema.taxRates.id })
      .from(schema.taxRates)
      .where(eq(schema.taxRates.code, rate.code))
      .limit(1);

    if (existing.length > 0) {
      taxMap.set(rate.code, Number(existing[0].id));
      continue;
    }

    const inserted = await db
      .insert(schema.taxRates)
      .values({
        code: rate.code,
        name: rate.name,
        rate: rate.rate,
        taxType: rate.taxType,
        description: rate.name,
        isActive: true,
      })
      .returning({ id: schema.taxRates.id });

    taxMap.set(rate.code, Number(inserted[0].id));
  }
}

async function ensureDefaultBrand(): Promise<number> {
  const brandName = 'Sin marca';
  const brandSlug = 'sin-marca';

  const existing = await db
    .select({ id: schema.brands.id })
    .from(schema.brands)
    .where(eq(schema.brands.slug, brandSlug))
    .limit(1);

  if (existing.length > 0) {
    return Number(existing[0].id);
  }

  const inserted = await db
    .insert(schema.brands)
    .values({
      name: brandName,
      slug: brandSlug,
      website: '',
      description: 'Marca por defecto para productos importados',
      country: 'CO',
      isActive: true,
    })
    .returning({ id: schema.brands.id });

  return Number(inserted[0].id);
}

async function ensureBranchId(): Promise<number> {
  const existing = await db
    .select({ id: schema.branches.id })
    .from(schema.branches)
    .orderBy(schema.branches.id)
    .limit(1);

  if (!existing.length) {
    throw new Error(
      'No existe ninguna sucursal en la tabla branches. Crea al menos una antes de importar productos.',
    );
  }

  return Number(existing[0].id);
}

async function ensureAdminUserId(): Promise<number> {
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .orderBy(schema.users.id)
    .limit(1);

  if (!existing.length) {
    throw new Error(
      'No existe ningún usuario en la tabla users. Crea un usuario administrador antes de importar productos.',
    );
  }

  return Number(existing[0].id);
}

async function ensureCategories(products: CatalogProductRow[]) {
  const nodes = collectCategoryNodes(products);

  for (const node of nodes) {
    const slug = buildSlug([node.code]);

    const existing = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      categoryIdByCode.set(node.code, Number(existing[0].id));
      continue;
    }

    const inserted = await db
      .insert(schema.categories)
      .values({
        parentId: node.parentCode
          ? (categoryIdByCode.get(node.parentCode) ?? null)
          : null,
        name: node.label,
        slug,
        description: `Importada desde catálogo JSON (${node.code})`,
        displayOrder: 0,
        level: node.level,
        isActive: true,
      })
      .returning({ id: schema.categories.id });

    categoryIdByCode.set(node.code, Number(inserted[0].id));
  }
}

function resolveLeafCategoryCode(product: CatalogProductRow): string | null {
  const seccion = normalizeText(product.SECCION);
  const categoria = normalizeText(product.CATEGORIA);

  if (seccion && categoria) {
    return `categoria:${seccion}:${categoria}`;
  }

  if (seccion) return `seccion:${seccion}`;

  const grupo = normalizeText(product.GRUPO);
  if (grupo) return `grupo:${grupo}`;

  const departamento = normalizeText(product.DEPARTAMENTO);
  if (departamento) return `departamento:${departamento}`;

  const familia = normalizeText(product.FAMILIA);
  if (familia) return `familia:${familia}`;

  return null;
}

async function assignProductCategory(productId: number, categoryId: number) {
  const existing = await db
    .select()
    .from(schema.productCategories)
    .where(
      and(
        eq(schema.productCategories.productId, productId),
        eq(schema.productCategories.categoryId, categoryId),
      ),
    )
    .limit(1);

  if (!existing.length) {
    await db.insert(schema.productCategories).values({
      productId,
      categoryId,
    });
  }
}

async function assignProductTax(
  productId: number,
  taxRateId: number,
  assignedBy: number,
) {
  const existing = await db
    .select()
    .from(schema.productTaxClasses)
    .where(
      and(
        eq(schema.productTaxClasses.productId, productId),
        eq(schema.productTaxClasses.taxRateId, taxRateId),
      ),
    )
    .limit(1);

  if (!existing.length) {
    await db.insert(schema.productTaxClasses).values({
      productId,
      taxRateId,
      assignedBy,
      priority: 1,
    });
  }
}

async function updateActivePrice(
  variantId: number,
  adminUserId: number,
  price: string,
  comparePrice: string | null,
) {
  const currentActivePrice = await db
    .select({
      id: schema.prices.id,
      price: schema.prices.price,
      comparePrice: schema.prices.comparePrice,
      version: schema.prices.version,
    })
    .from(schema.prices)
    .where(
      and(
        eq(schema.prices.productVariantId, variantId),
        isNull(schema.prices.endDate),
      ),
    )
    .limit(1);

  if (currentActivePrice.length > 0) {
    const active = currentActivePrice[0];
    const samePrice = String(active.price) === price;
    const sameComparePrice =
      String(active.comparePrice ?? '') === String(comparePrice ?? '');

    if (samePrice && sameComparePrice) {
      return;
    }

    await db
      .update(schema.prices)
      .set({ endDate: new Date().toISOString() })
      .where(eq(schema.prices.id, active.id));

    await db.insert(schema.prices).values({
      productVariantId: variantId,
      startDate: new Date().toISOString(),
      endDate: null,
      changedBy: adminUserId,
      changeReason: 'Actualización por importación de catálogo JSON',
      price,
      comparePrice,
      version: (active.version ?? 1) + 1,
    });

    return;
  }

  await db.insert(schema.prices).values({
    productVariantId: variantId,
    startDate: new Date().toISOString(),
    endDate: null,
    changedBy: adminUserId,
    changeReason: 'Migración inicial desde catálogo JSON',
    price,
    comparePrice,
    version: 1,
  });
}

async function upsertInventory(
  variantId: number,
  branchId: number,
  stock: number,
) {
  const existing = await db
    .select({ id: schema.inventory.id })
    .from(schema.inventory)
    .where(
      and(
        eq(schema.inventory.productVariantId, variantId),
        eq(schema.inventory.branchId, branchId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.inventory)
      .set({
        stock,
        reservedStock: 0,
        reorderPoint: 5,
        minimumStock: 0,
        maximumStock: 999999,
      })
      .where(eq(schema.inventory.id, existing[0].id));

    return;
  }

  await db.insert(schema.inventory).values({
    productVariantId: variantId,
    branchId,
    stock,
    reservedStock: 0,
    reorderPoint: 5,
    minimumStock: 0,
    maximumStock: 999999,
  });
}

async function importProducts() {
  console.log(
    `📦 Importando ${sourceProducts.length} productos desde ${catalogFilePath}...`,
  );

  await ensureTaxRates();
  const defaultBrandId = await ensureDefaultBrand();
  const branchId = await ensureBranchId();
  const adminUserId = await ensureAdminUserId();
  await ensureCategories(sourceProducts);

  let createdCount = 0;
  let updatedCount = 0;

  for (const row of sourceProducts) {
    const codigo = normalizeText(row.CODIGO);
    const nombre = normalizeText(row.NOMBRE);
    const ean = normalizeText(row.EAN) || null;
    const stock = parseInteger(row.SALDO);
    const currentPriceNumber = parseNumber(row.VENTA1);
    const comparePriceNumber = parseNumber(row.VENTA0);
    const currentPrice = currentPriceNumber.toFixed(2);
    const comparePrice =
      comparePriceNumber > 0 ? comparePriceNumber.toFixed(2) : null;
    const manufacturer = normalizeText(row.MARCA) || null;
    const productSlug = buildSlug([nombre, codigo.slice(-6)]);
    const leafCategoryCode = resolveLeafCategoryCode(row);
    const categoryId = leafCategoryCode
      ? (categoryIdByCode.get(leafCategoryCode) ?? null)
      : null;
    const taxRateCode =
      taxCodeByTipoImp[normalizeText(row.TIPO_IMP)] ?? 'IVA19';
    const taxRateId = taxMap.get(taxRateCode);

    if (!codigo || !nombre) {
      console.warn('⚠️ Producto omitido por datos incompletos:', row);
      continue;
    }

    if (!taxRateId) {
      throw new Error(`No se encontró taxRateId para el código ${taxRateCode}`);
    }

    const existingVariant = await db
      .select({
        id: schema.productVariants.id,
        productId: schema.productVariants.productId,
      })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, codigo))
      .limit(1);

    let productId: number;
    let variantId: number;

    if (existingVariant.length > 0) {
      variantId = Number(existingVariant[0].id);
      productId = existingVariant[0].productId;

      await db
        .update(schema.products)
        .set({
          name: nombre,
          slug: productSlug,
          brandId: defaultBrandId,
          manufacturer,
          isActive: true,
        })
        .where(eq(schema.products.id, BigInt(productId)));

      await db
        .update(schema.productVariants)
        .set({
          barcode: ean,
          currentPrice,
          currentComparePrice: comparePrice,
          isActive: true,
        })
        .where(eq(schema.productVariants.id, BigInt(variantId)));

      updatedCount += 1;
    } else {
      const insertedProduct = await db
        .insert(schema.products)
        .values({
          brandId: defaultBrandId,
          name: nombre,
          slug: productSlug,
          description: `Producto importado desde catálogo JSON. Código: ${codigo}`,
          productType: 'SIMPLE',
          skuPrefix: codigo.slice(0, 6),
          featured: false,
          manufacturer,
          visibility: 'PUBLIC',
          isActive: true,
          publishedAt: new Date().toISOString(),
        })
        .returning({ id: schema.products.id });

      productId = Number(insertedProduct[0].id);

      const insertedVariant = await db
        .insert(schema.productVariants)
        .values({
          productId,
          sku: codigo,
          barcode: ean,
          currentPrice,
          currentComparePrice: comparePrice,
          isActive: true,
        })
        .returning({ id: schema.productVariants.id });

      variantId = Number(insertedVariant[0].id);
      createdCount += 1;
    }

    await upsertInventory(variantId, branchId, stock);
    await updateActivePrice(variantId, adminUserId, currentPrice, comparePrice);

    if (categoryId) {
      await assignProductCategory(productId, categoryId);
    }

    await assignProductTax(productId, taxRateId, adminUserId);
  }

  console.log(`✅ Productos creados: ${createdCount}`);
  console.log(`♻️ Productos actualizados: ${updatedCount}`);
  console.log('🎉 Importación completada');
}

void importProducts()
  .catch((error) => {
    console.error('❌ Error importando productos:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
