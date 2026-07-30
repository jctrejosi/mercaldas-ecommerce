import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { readFileSync } from 'fs';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/ecommerce';

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// ── Types ──

type CatalogRow = {
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
};

type CategoryRow = { CODIGO: string; NOMBRE: string };
type BrandRow = { CODIGO: string; NOMBRE: string };
type ProductTypeRow = { CODIGO: string; NOMBRE: string; PUBLICA: string };

// ── Helpers ──

function trim(text: string): string {
  return (text ?? '').trim();
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseNum(value: string | null | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(value.trim().replace(/,/g, '.'));
  return Number.isFinite(n) ? n : 0;
}

// ── Main ──

async function main() {
  console.log('🚀 Iniciando importación de nuevo catálogo...\n');

  // ── Load JSON files ──
  const catalog = JSON.parse(readFileSync('data/JSON/CATALOGO.JSON', 'utf-8'));
  const categoriesData = JSON.parse(
    readFileSync('data/JSON/CATEGORIAS.JSON', 'utf-8'),
  );
  const brandsData = JSON.parse(readFileSync('data/JSON/MARCAS.JSON', 'utf-8'));
  const typesData = JSON.parse(
    readFileSync('data/JSON/TIPOS_PRODUCTOS.JSON', 'utf-8'),
  );

  const products: CatalogRow[] = catalog.PRODUCTOS;
  const catRows: CategoryRow[] = categoriesData.CATEGORIAS;
  const brandRows: BrandRow[] = brandsData.MARCAS;
  const typeRows: ProductTypeRow[] = typesData.TIPOS_PRODUCTOS;

  console.log(
    `📦 ${products.length} productos, ${catRows.length} categorías, ${brandRows.length} marcas, ${typeRows.length} tipos`,
  );

  // ── Clear all existing data ──
  console.log('\n🧹 Limpiando datos existentes...');
  console.log('🧹 Limpiando datos relacionados...');
  await db.execute(`DELETE FROM cart_items`);
  await db.execute(`DELETE FROM order_items`);
  await db.execute(`DELETE FROM favorites`);
  await db.execute(`DELETE FROM prices`);
  await db.execute(`DELETE FROM inventory`);
  await db.execute(`DELETE FROM product_categories`);
  await db.execute(`DELETE FROM product_type_assignments`);
  await db.execute(`DELETE FROM product_tax_classes`);
  await db.execute(`DELETE FROM product_images`);
  await db.execute(`DELETE FROM product_attributes`);
  await db.execute(`DELETE FROM supplier_products`);
  await db.execute(`DELETE FROM product_variants`);
  await db.execute(`DELETE FROM products`);
  console.log('✅ Datos relacionados limpiados');

  // ── Clear brand assignments and delete brands ──
  await db.execute(`UPDATE products SET brand_id = NULL`);
  await db.execute(`DELETE FROM brands`);

  // ── 1. Import Brands ──
  console.log('\n🏷️  Importando marcas...');
  const brandMap = new Map<string, number>();

  for (const b of brandRows) {
    const code = trim(b.CODIGO);
    const name = trim(b.NOMBRE);
    if (!code || !name) continue;

    const [existing] = await db
      .select({ id: schema.brands.id })
      .from(schema.brands)
      .where(eq(schema.brands.name, name))
      .limit(1);

    if (existing) {
      // Reactivate
      await db
        .update(schema.brands)
        .set({
          deletedAt: null,
          isActive: true,
          code,
          slug: slug(name) + '-' + code,
        })
        .where(eq(schema.brands.id, existing.id));
      brandMap.set(code, Number(existing.id));
    } else {
      const [row] = await db
        .insert(schema.brands)
        .values({
          name,
          slug: slug(name) + '-' + code,
          code,
          website: '',
          description: '',
          country: '',
          isActive: true,
        })
        .returning({ id: schema.brands.id });
      brandMap.set(code, Number(row.id));
    }
  }
  console.log(`✅ ${brandMap.size} marcas procesadas`);

  // ── 2. Import Categories ──
  console.log('\n📁 Importando categorías...');

  // Delete existing categories
  await db.execute(`DELETE FROM product_categories`);
  await db.execute(`DELETE FROM categories`);

  const catIdByCode = new Map<string, number>();

  // Build hierarchical map
  for (const c of catRows) {
    const code = trim(c.CODIGO);
    const name = trim(c.NOMBRE);
    if (!code || !name) continue;

    let parentId: number | null = null;
    const level = code.length - 1; // 1, 2, or 3 digit groups

    if (code.length > 2) {
      // Child category
      const parentCode = code.substring(0, code.length - 2).trim();
      parentId = catIdByCode.get(parentCode) ?? null;
    }

    const [existing] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.name, name))
      .limit(1);

    let catId: number;
    if (existing) {
      await db
        .update(schema.categories)
        .set({
          deletedAt: null,
          isActive: true,
          parentId,
          level,
          displayOrder: 0,
        })
        .where(eq(schema.categories.id, existing.id));
      catId = Number(existing.id);
    } else {
      const [row] = await db
        .insert(schema.categories)
        .values({
          name,
          slug: slug(name) + '-' + code,
          code,
          parentId,
          level,
          description: null,
          isActive: true,
          displayOrder: 0,
        })
        .returning({ id: schema.categories.id });
      catId = Number(row.id);
    }

    catIdByCode.set(code, catId);
  }
  console.log(`✅ ${catIdByCode.size} categorías procesadas`);

  // ── 3. Import Product Types ──
  console.log('\n📋 Importando tipos de producto...');
  const typeIdByCode = new Map<string, number>();

  for (const t of typeRows) {
    const code = trim(t.CODIGO);
    const name = trim(t.NOMBRE);
    const isActive = trim(t.PUBLICA) === '1';
    if (!code || !name) continue;

    const [existing] = await db
      .select({ id: schema.productTypes.id })
      .from(schema.productTypes)
      .where(eq(schema.productTypes.code, code))
      .limit(1);

    if (existing) {
      await db
        .update(schema.productTypes)
        .set({ name, isActive, description: name })
        .where(eq(schema.productTypes.id, existing.id));
      typeIdByCode.set(code, Number(existing.id));
    } else {
      const [row] = await db
        .insert(schema.productTypes)
        .values({
          code,
          name,
          isActive,
          description: name,
        })
        .returning({ id: schema.productTypes.id });
      typeIdByCode.set(code, Number(row.id));
    }
  }
  console.log(`✅ ${typeIdByCode.size} tipos de producto procesados`);

  // ── Ensure default branch and admin user ──
  const [branch] = await db
    .select({ id: schema.branches.id })
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true))
    .limit(1);

  const branchId = branch?.id ? Number(branch.id) : 1;

  const [admin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);

  const adminUserId = admin?.id ? Number(admin.id) : 1;

  // ── 4. Import Products ──
  console.log('\n🛒 Importando productos...');

  let created = 0;
  let errors = 0;

  for (const p of products) {
    try {
      const codigo = trim(p.CODIGO);
      const nombre = trim(p.NOMBRE);
      const ean = trim(p.EAN);
      const plu = trim(p.PLU);
      const venta1 = parseNum(p.VENTA1);
      const venta2 = parseNum(p.VENTA2);
      const stock = parseNum(p.SALDO);
      const tipoImp = trim(p.TIPO_IMP);
      const marcaCode = trim(p.MARCA);
      const categoriaCode = trim(p.CATEGORIA);
      const nivel1 = trim(p.NIVEL_1);
      const nivel2 = trim(p.NIVEL_2);
      const nivel3 = trim(p.NIVEL_3);

      if (!nombre || !codigo) continue;

      const productSlug = slug(nombre) + '-' + Date.now().toString(36);

      // Find the most specific category
      const catId =
        catIdByCode.get(nivel3) ||
        catIdByCode.get(nivel2) ||
        catIdByCode.get(nivel1);

      const brandId = brandMap.get(marcaCode) ?? null;
      const typeId = typeIdByCode.get(categoriaCode);

      // Tax rate mapping
      const taxRateMap: Record<string, string> = {
        J: 'IVA_19',
        C: 'IVA_5',
        E: 'EXENTO',
      };
      const taxCode = taxRateMap[tipoImp] || 'IVA_19';

      // Insert product
      const [insertedProduct] = await db
        .insert(schema.products)
        .values({
          name: nombre,
          slug: productSlug,
          externalId: codigo,
          plu,
          description: `Producto importado del catálogo JSON. Código: ${codigo}`,
          productType: 'SIMPLE',
          isActive: true,
          featured: false,
          visibility: 'visible',
          publishedAt: new Date().toISOString(),
          brandId,
        })
        .returning({ id: schema.products.id });

      const productId = Number(insertedProduct.id);

      // Insert variant — VENTA1=precio original, VENTA2=precio con descuento
      const [insertedVariant] = await db
        .insert(schema.productVariants)
        .values(
          venta2 > 0
            ? {
                productId,
                sku: codigo,
                barcode: ean || undefined,
                currentPrice: String(venta2),
                currentComparePrice: String(venta1),
                isActive: true,
              }
            : {
                productId,
                sku: codigo,
                barcode: ean || undefined,
                currentPrice: String(venta1),
                isActive: true,
              },
        )
        .returning({ id: schema.productVariants.id });

      const variantId = Number(insertedVariant.id);

      // Assign category
      if (catId) {
        await db.insert(schema.productCategories).values({
          productId,
          categoryId: catId,
        });
      }

      // Assign product type
      if (typeId) {
        await db.insert(schema.productTypeAssignments).values({
          productId,
          productTypeId: typeId,
        });
      }

      // Assign tax
      const [taxRate] = await db
        .select({ id: schema.taxRates.id })
        .from(schema.taxRates)
        .where(eq(schema.taxRates.code, taxCode))
        .limit(1);

      if (taxRate) {
        await db.insert(schema.productTaxClasses).values({
          productId,
          taxRateId: Number(taxRate.id),
          priority: 1,
        });
      }

      // Create price history — VENTA1=precio original, VENTA2=precio descuento
      await db.insert(schema.prices).values(
        venta2 > 0
          ? {
              productVariantId: variantId,
              price: String(venta2),
              comparePrice: String(venta1),
              version: 1,
              changedBy: adminUserId,
              changeReason: 'Importación catálogo',
            }
          : {
              productVariantId: variantId,
              price: String(venta1),
              version: 1,
              changedBy: adminUserId,
              changeReason: 'Importación catálogo',
            },
      );

      // Create inventory
      await db.insert(schema.inventory).values({
        productVariantId: variantId,
        branchId: branchId,
        stock: Math.max(0, stock),
        reservedStock: 0,
        reorderPoint: 10,
        minimumStock: 0,
        maximumStock: 9999,
      });

      created++;
      if (created % 200 === 0) {
        console.log(`   ${created}/${products.length} productos...`);
      }
    } catch (e: any) {
      errors++;
      if (errors <= 5) {
        console.error(`   ❌ Error en ${trim(p.CODIGO)}: ${e.message}`);
      }
    }
  }

  console.log(`\n✅ ${created} productos creados, ${errors} errores`);
  console.log('🏁 Importación completada');

  await pool.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
