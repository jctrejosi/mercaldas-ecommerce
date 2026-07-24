/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, inArray, isNull } from 'drizzle-orm';
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

type TidtabRow = {
  CODIGO: string;
  NOMBRE: string;
};

type TidtabFile = {
  TABLAS: TidtabRow[];
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

const dataDirectoryPath = path.join(__dirname, '..', 'data');
const catalogFilePath = path.join(dataDirectoryPath, 'CATALOGO_0.JSON');
const tidtabFilePath = path.join(dataDirectoryPath, 'TIDTAB_0.JSON');

const rawCatalogData = fs.readFileSync(catalogFilePath, 'utf8');
const rawTidtabData = fs.readFileSync(tidtabFilePath, 'utf8');

const catalog = JSON.parse(rawCatalogData) as CatalogFile;
const tidtab = JSON.parse(rawTidtabData) as TidtabFile;
const sourceProducts = catalog.PRODUCTOS ?? [];
const tidtabRows = tidtab.TABLAS ?? [];

const taxCodeByTipoImp: Record<string, string> = {
  J: 'IVA19',
  C: 'IVA5',
  E: 'EXENTO',
};

const taxMap = new Map<string, number>();
const categoryIdByCode = new Map<string, number>();
const productTypeIdByCode = new Map<string, number>();
const tidtabNameByCode = new Map<string, string>(
  tidtabRows
    .map(
      (row) => [normalizeText(row.CODIGO), normalizeText(row.NOMBRE)] as const,
    )
    .filter(([code, name]) => code.length > 0 && name.length > 0),
);

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
  type: 'departamento' | 'grupo' | 'seccion',
  code: string,
) {
  const mappedName = tidtabNameByCode.get(code);

  if (mappedName) {
    return mappedName;
  }

  const prefixMap = {
    departamento: 'Departamento',
    grupo: 'Grupo',
    seccion: 'Sección',
  } as const;

  return `${prefixMap[type]} ${code}`;
}

function collectCategoryNodes(
  products: CatalogProductRow[],
): CategoryNodeInput[] {
  const nodes = new Map<string, CategoryNodeInput>();

  for (const product of products) {
    const departamento = normalizeText(product.DEPARTAMENTO);
    const grupo = normalizeText(product.GRUPO);
    const seccion = normalizeText(product.SECCION);

    if (departamento && departamento.length === 3) {
      nodes.set(`departamento:${departamento}`, {
        code: `departamento:${departamento}`,
        parentCode: null,
        level: 0,
        label: buildCategoryLabel('departamento', departamento),
      });
    }

    if (grupo && grupo.length === 5) {
      nodes.set(`grupo:${grupo}`, {
        code: `grupo:${grupo}`,
        parentCode:
          departamento && departamento.length === 3
            ? `departamento:${departamento}`
            : null,
        level: 1,
        label: buildCategoryLabel('grupo', grupo),
      });
    }

    if (seccion && seccion.length === 7) {
      nodes.set(`seccion:${seccion}`, {
        code: `seccion:${seccion}`,
        parentCode: grupo && grupo.length === 5 ? `grupo:${grupo}` : null,
        level: 2,
        label: buildCategoryLabel('seccion', seccion),
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

async function ensureBrands(): Promise<Map<string, number>> {
  const brandMap = new Map<string, number>();

  // Ensure "Sin marca" fallback
  const defaultSlug = 'sin-marca';
  let [defaultBrand] = await db
    .select({ id: schema.brands.id })
    .from(schema.brands)
    .where(eq(schema.brands.slug, defaultSlug))
    .limit(1);

  if (!defaultBrand) {
    const inserted = await db
      .insert(schema.brands)
      .values({
        name: 'Sin marca',
        slug: defaultSlug,
        website: '',
        description: 'Marca por defecto para productos importados',
        country: 'CO',
        isActive: true,
      })
      .returning({ id: schema.brands.id });
    defaultBrand = inserted[0];
  }
  brandMap.set('Sin marca', Number(defaultBrand.id));

  // Extract unique brand names from MARCA field (excluding empty)
  const brandNames = [
    ...new Set(
      sourceProducts
        .map((row) => normalizeText(row.MARCA))
        .filter((name) => name.length > 0),
    ),
  ];

  if (brandNames.length === 0) return brandMap;

  // Count products per brand to determine featured ones
  const brandCounts = new Map<string, number>();
  for (const row of sourceProducts) {
    const name = normalizeText(row.MARCA);
    if (name) {
      brandCounts.set(name, (brandCounts.get(name) ?? 0) + 1);
    }
  }

  // Sort by count descending, take top 10 as featured
  const sortedBrands = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);
  const featuredSet = new Set(sortedBrands);

  // Get existing brands from DB
  const existingBrands = await db
    .select({ id: schema.brands.id, name: schema.brands.name })
    .from(schema.brands)
    .where(inArray(schema.brands.name, brandNames));

  for (const b of existingBrands) {
    brandMap.set(b.name, Number(b.id));
  }

  // Create missing brands
  const missingNames = brandNames.filter((name) => !brandMap.has(name));
  for (const name of missingNames) {
    const slug = buildSlug([name]);
    const isFeatured = featuredSet.has(name);
    const inserted = await db
      .insert(schema.brands)
      .values({
        name,
        slug,
        website: '',
        description: '',
        country: 'CO',
        isFeatured,
        isActive: true,
      })
      .returning({ id: schema.brands.id });
    brandMap.set(name, Number(inserted[0].id));
  }

  // Update featured flag for existing brands
  for (const name of featuredSet) {
    const bid = brandMap.get(name);
    if (bid && name !== 'Sin marca') {
      await db
        .update(schema.brands)
        .set({ isFeatured: true })
        .where(eq(schema.brands.id, BigInt(bid)));
    }
  }

  console.log(`🏷️ ${brandMap.size} marcas aseguradas (${featuredSet.size} destacadas)`);
  return brandMap;
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

async function ensureProductTypes(products: CatalogProductRow[]) {
  const productTypeCodes = Array.from(
    new Set(products.map((product) => normalizeText(product.CATEGORIA)).filter(Boolean)),
  );

  for (const code of productTypeCodes) {
    const existing = await db
      .select({ id: schema.productTypes.id })
      .from(schema.productTypes)
      .where(eq(schema.productTypes.code, code))
      .limit(1);

    const name = `Tipo ${code}`;

    if (existing.length > 0) {
      const productTypeId = Number(existing[0].id);

      await db
        .update(schema.productTypes)
        .set({
          name,
          description: `Clasificación transversal importada desde CATALOGO_0 (${code})`,
          isActive: true,
        })
        .where(eq(schema.productTypes.id, BigInt(productTypeId)));

      productTypeIdByCode.set(code, productTypeId);
      continue;
    }

    const inserted = await db
      .insert(schema.productTypes)
      .values({
        code,
        name,
        description: `Clasificación transversal importada desde CATALOGO_0 (${code})`,
        isActive: true,
      })
      .returning({ id: schema.productTypes.id });

    productTypeIdByCode.set(code, Number(inserted[0].id));
  }
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

    const parentId = node.parentCode
      ? (categoryIdByCode.get(node.parentCode) ?? null)
      : null;

    if (existing.length > 0) {
      const categoryId = Number(existing[0].id);

      await db
        .update(schema.categories)
        .set({
          parentId,
          name: node.label,
          description: `Importada desde catálogo JSON/TIDTAB (${node.code})`,
          displayOrder: 0,
          level: node.level,
          isActive: true,
        })
        .where(eq(schema.categories.id, BigInt(categoryId)));

      categoryIdByCode.set(node.code, categoryId);
      continue;
    }

    const inserted = await db
      .insert(schema.categories)
      .values({
        parentId,
        name: node.label,
        slug,
        description: `Importada desde catálogo JSON/TIDTAB (${node.code})`,
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
  if (seccion && seccion.length === 7) return `seccion:${seccion}`;

  const grupo = normalizeText(product.GRUPO);
  if (grupo && grupo.length === 5) return `grupo:${grupo}`;

  const departamento = normalizeText(product.DEPARTAMENTO);
  if (departamento && departamento.length === 3) {
    return `departamento:${departamento}`;
  }

  return null;
}

async function assignProductCategory(productId: number, categoryId: number) {
  const existingRelations = await db
    .select({ categoryId: schema.productCategories.categoryId })
    .from(schema.productCategories)
    .where(eq(schema.productCategories.productId, productId));

  const alreadyAssigned = existingRelations.some(
    (relation) => Number(relation.categoryId) === categoryId,
  );

  if (alreadyAssigned && existingRelations.length === 1) {
    return;
  }

  await db
    .delete(schema.productCategories)
    .where(eq(schema.productCategories.productId, productId));

  await db.insert(schema.productCategories).values({
    productId,
    categoryId,
  });
}

async function assignProductType(productId: number, productTypeId: number) {
  const existingRelations = await db
    .select({ productTypeId: schema.productTypeAssignments.productTypeId })
    .from(schema.productTypeAssignments)
    .where(eq(schema.productTypeAssignments.productId, productId));

  const alreadyAssigned = existingRelations.some(
    (relation) => Number(relation.productTypeId) === productTypeId,
  );

  if (alreadyAssigned && existingRelations.length === 1) {
    return;
  }

  await db
    .delete(schema.productTypeAssignments)
    .where(eq(schema.productTypeAssignments.productId, productId));

  await db.insert(schema.productTypeAssignments).values({
    productId,
    productTypeId,
  });
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
  // ✅ Normalizar comparePrice: solo si existe y es >= price
  let validComparePrice: string | null = null;
  if (comparePrice !== null) {
    const priceNum = Number.parseFloat(price);
    const compareNum = Number.parseFloat(comparePrice);
    if (compareNum <= priceNum) {
      validComparePrice = comparePrice;
    } else {
      // ⚠️ Si comparePrice es menor, puedes intercambiarlos o ignorarlo
      console.warn(
        `⚠️ comparePrice (${comparePrice}) es mayor que price (${price}). Se usará solo price.`,
      );
      // Opcional: si quieres intercambiarlos:
      // validComparePrice = price;
      // price = comparePrice; // pero cuidado con esta lógica
    }
  }

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
      String(active.comparePrice ?? '') === String(validComparePrice ?? '');

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
      price: price,
      comparePrice: validComparePrice,
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
    price: price,
    comparePrice: validComparePrice,
    version: 1,
  });
}

async function upsertInventory(
  variantId: number,
  branchId: number,
  stock: number,
) {
  // ✅ Asegurar que el stock no sea negativo
  const validStock = Math.max(0, stock);

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
        stock: validStock,
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
    stock: validStock,
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
  const brandMap = await ensureBrands();
  const branchId = await ensureBranchId();
  const adminUserId = await ensureAdminUserId();
  await ensureProductTypes(sourceProducts);
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
    const brandId = manufacturer && brandMap.has(manufacturer)
      ? brandMap.get(manufacturer)!
      : brandMap.get('Sin marca')!;
    const productSlug = buildSlug([nombre, codigo.slice(-6)]);
    const productTypeCode = normalizeText(row.CATEGORIA) || null;
    const productTypeId = productTypeCode
      ? (productTypeIdByCode.get(productTypeCode) ?? null)
      : null;
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
          brandId,
          externalId: codigo,
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
          brandId,
          externalId: codigo,
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

    if (productTypeId) {
      await assignProductType(productId, productTypeId);
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
