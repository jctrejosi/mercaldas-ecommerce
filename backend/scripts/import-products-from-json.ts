import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL missing');

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// Leer el archivo JSON
const rawData = fs.readFileSync(
  path.join(__dirname, '../CATALOGO_0.json'),
  'utf8',
);
const catalog = JSON.parse(rawData);
const products = catalog.PRODUCTOS;

// Mapeo de TIPO_IMP a tax_rate_id (crear si no existen)
const taxMap: Record<string, number> = {};

async function ensureTaxRates() {
  // Crear tasas si no existen (ej. 19%, 5%, 0%)
  const rates = [
    { code: 'IVA19', name: 'IVA 19%', rate: 19, taxType: 'VAT' },
    { code: 'IVA5', name: 'IVA 5%', rate: 5, taxType: 'VAT' },
    { code: 'EXENTO', name: 'Exento', rate: 0, taxType: 'EXEMPT' },
  ];
  for (const r of rates) {
    const exist = await db
      .select()
      .from(schema.taxRates)
      .where(eq(schema.taxRates.code, r.code));
    if (!exist.length) {
      const inserted = await db
        .insert(schema.taxRates)
        .values({
          name: r.name,
          code: r.code,
          rate: r.rate,
          taxType: r.taxType,
          isActive: true,
          // otros campos por defecto
        })
        .returning();
      taxMap[r.code] = inserted[0].id;
    } else {
      taxMap[r.code] = exist[0].id;
    }
  }
  // Mapear TIPO_IMP a código
  // J -> IVA19, C -> IVA5, E -> EXENTO
}

async function importProducts() {
  console.log(`📦 Importando ${products.length} productos...`);

  // 1. Crear categorías jerárquicas
  // Extraer valores únicos de FAMILIA, DEPARTAMENTO, GRUPO, SECCION
  const familias = new Set<string>();
  const deptos = new Set<string>();
  const grupos = new Set<string>();
  const secciones = new Set<string>();

  for (const p of products) {
    familias.add(p.FAMILIA.trim());
    deptos.add(p.DEPARTAMENTO.trim());
    grupos.add(p.GRUPO.trim());
    secciones.add(p.SECCION.trim());
  }

  // Crear categorías raíz para cada FAMILIA (si no existen)
  // Luego departamentos, grupos, secciones con parent_id apropiado.
  // Puedes usar una función recursiva o un mapa de IDs.

  // ... (implementación detallada)

  // 2. Crear marca por defecto (id=1) si no existe
  const defaultBrand = await db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.id, 1));
  if (!defaultBrand.length) {
    await db.insert(schema.brands).values({
      id: 1,
      name: 'Sin marca',
      slug: 'sin-marca',
      website: '',
      description: 'Marca por defecto',
      country: 'Desconocido',
      isActive: true,
    });
  }

  // 3. Procesar cada producto
  for (const p of products) {
    const codigo = p.CODIGO.trim();
    const nombre = p.NOMBRE.trim();
    const ean = p.EAN.trim() || null;
    const precio = parseFloat(p.VENTA1) || 0;
    const precioCompare = parseFloat(p.VENTA0) || null;
    const stock = parseInt(p.SALDO) || 0;

    // Buscar categoría hoja (por SECCION) - asumiendo que ya la creaste
    const categoria = await db
      .select()
      .from(schema.categories)
      .where(
        eq(schema.categories.slug, slugify(p.SECCION.trim(), { lower: true })),
      )
      .limit(1);
    const categoriaId = categoria.length ? categoria[0].id : null;

    // Verificar si producto ya existe por codigo (como SKU en variante)
    const existingVariant = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, codigo))
      .limit(1);
    if (existingVariant.length) {
      console.log(
        `⚠️ Producto con código ${codigo} ya existe. Actualizando...`,
      );
      // Actualizar precio y stock
      await db
        .update(schema.productVariants)
        .set({
          currentPrice: precio,
          currentComparePrice: precioCompare,
        })
        .where(eq(schema.productVariants.id, existingVariant[0].id));

      // Actualizar inventario
      const inv = await db
        .select()
        .from(schema.inventory)
        .where(eq(schema.inventory.productVariantId, existingVariant[0].id))
        .limit(1);
      if (inv.length) {
        await db
          .update(schema.inventory)
          .set({ stock })
          .where(eq(schema.inventory.id, inv[0].id));
      } else {
        await db.insert(schema.inventory).values({
          productVariantId: existingVariant[0].id,
          branchId: 1,
          stock,
          reservedStock: 0,
          reorderPoint: 5,
          minimumStock: 0,
          maximumStock: 999999,
        });
      }
      continue;
    }

    // Insertar producto
    const slug =
      slugify(nombre, { lower: true, strict: true }) + '-' + codigo.slice(-6);
    const productInsert = await db
      .insert(schema.products)
      .values({
        name: nombre,
        slug,
        brandId: 1, // marca por defecto
        productType: 'SIMPLE',
        visibility: 'PUBLIC',
        isActive: true,
        publishedAt: new Date().toISOString(),
      })
      .returning();
    const productId = productInsert[0].id;

    // Insertar variante
    const variantInsert = await db
      .insert(schema.productVariants)
      .values({
        productId,
        sku: codigo,
        barcode: ean,
        currentPrice: precio,
        currentComparePrice: precioCompare || null,
        isActive: true,
      })
      .returning();
    const variantId = variantInsert[0].id;

    // Insertar inventario
    await db.insert(schema.inventory).values({
      productVariantId: variantId,
      branchId: 1,
      stock,
      reservedStock: 0,
      reorderPoint: 5,
      minimumStock: 0,
      maximumStock: 999999,
    });

    // Insertar precio histórico
    await db.insert(schema.prices).values({
      productVariantId: variantId,
      startDate: new Date().toISOString(),
      endDate: null,
      changedBy: 1, // admin
      changeReason: 'Migración inicial',
      price: precio,
      comparePrice: precioCompare || null,
      version: 1,
    });

    // Asignar categoría
    if (categoriaId) {
      await db.insert(schema.productCategories).values({
        productId,
        categoryId: categoriaId,
      });
    }

    // Asignar impuesto según TIPO_IMP
    // ... (similar)

    console.log(`✅ Producto ${nombre} importado`);
  }

  console.log('🎉 Importación completada');
}

// Ejecutar
ensureTaxRates()
  .then(importProducts)
  .catch(console.error)
  .finally(() => pool.end());
