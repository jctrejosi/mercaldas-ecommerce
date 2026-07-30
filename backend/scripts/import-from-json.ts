import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import slugify from 'slugify';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/ecommerce';

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

const DATA_DIR = 'data/JSON';

interface CatalogRow {
  CODIGO: string;
  PLU: string;
  NOMBRE: string;
  SALDO: string;
  EAN: string;
  VENTA1: string;
  VENTA2: string;
  TIPO_IMP: string;
  NIVEL_1: string;
  NIVEL_2: string;
  NIVEL_3: string;
  MARCA: string;
  CATEGORIA: string;
}

interface CategoryRow {
  CODIGO: string;
  NOMBRE: string;
}

interface BrandRow {
  CODIGO: string;
  NOMBRE: string;
}

interface ProductTypeRow {
  CODIGO: string;
  NOMBRE: string;
  PUBLICA: string;
}

const trim = (s: string) => s.trim();
const parseNum = (s: string) => {
  const n = Number(s.trim());
  return Number.isFinite(n) ? n : 0;
};

function buildSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

async function main() {
  console.log('📦 Cargando archivos JSON...');

  const catalog: { PRODUCTOS: CatalogRow[] } = JSON.parse(
    readFileSync(`${DATA_DIR}/CATALOGO.JSON`, 'utf-8'),
  );
  const categorias: { CATEGORIAS: CategoryRow[] } = JSON.parse(
    readFileSync(`${DATA_DIR}/CATEGORIAS.JSON`, 'utf-8'),
  );
  const marcas: { MARCAS: BrandRow[] } = JSON.parse(
    readFileSync(`${DATA_DIR}/MARCAS.JSON`, 'utf-8'),
  );
  const tipos: { TIPOS_PRODUCTOS: ProductTypeRow[] } = JSON.parse(
    readFileSync(`${DATA_DIR}/TIPOS_PRODUCTOS.JSON`, 'utf-8'),
  );

  console.log(
    `✅ ${catalog.PRODUCTOS.length} productos, ${categorias.CATEGORIAS.length} categorías, ${marcas.MARCAS.length} marcas, ${tipos.TIPOS_PRODUCTOS.length} tipos`,
  );

  // 1. Soft-delete existing products
  console.log('🗑️  Eliminando productos existentes...');
  await db
    .update(schema.products)
    .set({ deletedAt: new Date().toISOString() })
    .where(isNull(schema.products.deletedAt));

  // 2. Soft-delete existing brands (except maybe keep them for reference)
  console.log('🗑️  Eliminando marcas existentes...');
  await db
    .update(schema.brands)
    .set({ deletedAt: new Date().toISOString() })
    .where(isNull(schema.brands.deletedAt));

  // 3. Soft-delete existing categories
  console.log('🗑️  Eliminando categorías existentes...');
  await db.delete(schema.productCategories).where(sql`true`);
  await db
    .update(schema.categories)
    .set({ deletedAt: new Date().toISOString() })
    .where(isNull(schema.categories.deletedAt));

  // 4. Import categories
  console.log('📁 Importando categorías...');
  const catIdByCode = new Map<string, number>();

  for (const cat of categorias.CATEGORIAS) {
    const code = trim(cat.CODIGO);
    const name = trim(cat.NOMBRE);

    // Determine parent
    let parentId: number | null = null;
    const level = code.length >= 7 ? 3 : code.length >= 5 ? 2 : 1;
    if (level === 2) {
      const parentCode = code.substring(0, 2);
      parentId = catIdByCode.get(parentCode) ?? null;
    } else if (level === 3) {
      const parentCode = code.substring(0, 4);
      parentId = catIdByCode.get(parentCode) ?? null;
    }

    const slug = buildSlug(name);
    const [result] = await db
      .insert(schema.categories)
      .values({
        name,
        slug,
        code,
        parentId,
        level,
        isActive: true,
        displayOrder: 0,
        description: null,
      })
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name, code, parentId, level, deletedAt: null as any },
      })
      .returning({ id: schema.categories.id });

    catIdByCode.set(code, Number(result.id));
  }
  console.log(`   ${catIdByCode.size} categorías importadas`);

  // 5. Import brands
  console.log('🏷️  Importando marcas...');
  const brandIdByCode = new Map<string, number>();

  for (const brand of marcas.MARCAS) {
    const code = trim(brand.CODIGO);
    const name = trim(brand.NOMBRE);
    const slug = buildSlug(name);

    const [result] = await db
      .insert(schema.brands)
      .values({
        name,
        slug,
        code,
        website: '',
        description: '',
        country: '',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.brands.slug,
        set: { name, code, deletedAt: null as any },
      })
      .returning({ id: schema.brands.id });

    brandIdByCode.set(code, Number(result.id));
  }
  console.log(`   ${brandIdByCode.size} marcas importadas`);

  // 6. Update product types (set isActive based on PUBLICA)
  console.log('🔧 Actualizando tipos de producto...');
  const typeIdByCode = new Map<string, number>();

  for (const t of tipos.TIPOS_PRODUCTOS) {
    const code = trim(t.CODIGO);
    const name = trim(t.NOMBRE);
    const isActive = trim(t.PUBLICA) === '1';

    const [result] = await db
      .insert(schema.productTypes)
      .values({
        code,
        name,
        isActive,
        description: `Tipo de producto: ${name}`,
      })
      .onConflictDoUpdate({
        target: schema.productTypes.code, // uses the unique "product_types_code_key" constraint
        set: { name, isActive },
      })
      .returning({ id: schema.productTypes.id });

    typeIdByCode.set(code, Number(result.id));
  }
  console.log(`   ${typeIdByCode.size} tipos actualizados`);

  // 7. Import products
  console.log('📦 Importando productos...');
  let count = 0;

  for (const p of catalog.PRODUCTOS) {
    const code = trim(p.CODIGO);
    const name = trim(p.NOMBRE);
    const ean = trim(p.EAN);
    const plu = trim(p.PLU);
    const price = parseNum(p.VENTA1);
    const comparePrice = parseNum(p.VENTA2);
    const stock = parseNum(p.SALDO);
    const marcaCode = trim(p.MARCA);
    const categoriaCode = trim(p.CATEGORIA);
    const nivel3 = trim(p.NIVEL_3);

    const slug = buildSlug(name);
    const brandId = marcaCode ? (brandIdByCode.get(marcaCode) ?? null) : null;
    const categoryId = nivel3 ? (catIdByCode.get(nivel3) ?? null) : null;
    const productTypeId = categoriaCode
      ? (typeIdByCode.get(categoriaCode) ?? null)
      : null;

    // Upsert product
    const [product] = await db
      .insert(schema.products)
      .values({
        name,
        slug,
        externalId: code || null,
        plu: plu || null,
        description: `Importado desde JSON. Código: ${code}`,
        brandId,
        isActive: true,
        featured: false,
        productType: 'SIMPLE',
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: { name, externalId: code, plu, brandId, deletedAt: null as any },
      })
      .returning({ id: schema.products.id });

    const productId = Number(product.id);

    // Upsert variant
    await db
      .insert(schema.productVariants)
      .values({
        productId,
        sku: code || `SKU-${plu || productId}`,
        barcode: ean || null,
        currentPrice: String(price),
        currentComparePrice: comparePrice > 0 ? String(comparePrice) : null,
        isActive: true,
      })
      .onConflictDoNothing();

    // Assign product type
    if (productTypeId) {
      await db
        .insert(schema.productTypeAssignments)
        .values({ productId, productTypeId })
        .onConflictDoNothing();
    }

    // Assign category
    if (categoryId) {
      await db
        .insert(schema.productCategories)
        .values({ productId, categoryId })
        .onConflictDoNothing();
    }

    // Upsert inventory
    if (stock > 0) {
      await db
        .insert(schema.inventory)
        .values({
          productVariantId: productId,
          branchId: 1,
          stock,
          reservedStock: 0,
          reorderPoint: 10,
          minimumStock: 5,
          maximumStock: 999,
        })
        .onConflictDoNothing();
    }

    count++;
    if (count % 100 === 0) {
      console.log(`   ${count}/${catalog.PRODUCTOS.length} productos...`);
    }
  }

  console.log(`   ${count} productos importados`);
  console.log('✅ Importación completada');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
