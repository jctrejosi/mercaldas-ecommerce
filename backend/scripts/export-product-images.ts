/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';

const LOCAL_DATABASE_URL = process.env.DATABASE_URL;
const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL;

if (!LOCAL_DATABASE_URL) {
  console.error('❌ DATABASE_URL (local) no definida');
  process.exit(1);
}

async function exportImages() {
  const pool = new Pool({ connectionString: LOCAL_DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('📤 Exportando imágenes de Cloudinary desde BD local...');

  const rows = await db
    .select({
      productId: schema.products.id,
      externalId: schema.products.externalId,
      path: schema.media.path,
      mediaId: schema.media.id,
      piId: schema.productImages.id,
    })
    .from(schema.productImages)
    .innerJoin(
      schema.products,
      eq(schema.products.id, schema.productImages.productId),
    )
    .innerJoin(schema.media, eq(schema.media.id, schema.productImages.mediaId))
    .where(
      and(
        eq(schema.productImages.isCover, true),
        eq(schema.media.provider, 'cloudinary'),
      ),
    );

  console.log(`   Encontrados ${rows.length} registros`);

  // Generate SQL statements - match by external_id
  const sqlLines: string[] = [];
  sqlLines.push('-- Product image migration');
  sqlLines.push('-- Generated from local DB - matches products by external_id');
  sqlLines.push('');

  for (const row of rows) {
    const externalId = row.externalId?.replace(/'/g, "''") || '';
    const path = row.path?.replace(/'/g, "''") || '';
    if (!externalId || !path) continue;

    sqlLines.push(`-- Product: ${externalId}`);
    sqlLines.push(`DO $$`);
    sqlLines.push(`DECLARE`);
    sqlLines.push(`  v_product_id INT;`);
    sqlLines.push(`  v_media_id INT;`);
    sqlLines.push(`BEGIN`);
    sqlLines.push(
      `  SELECT id INTO v_product_id FROM products WHERE external_id = '${externalId}' LIMIT 1;`,
    );
    sqlLines.push(`  IF v_product_id IS NULL THEN`);
    sqlLines.push(
      `    RAISE NOTICE 'Producto con external_id ${externalId} no encontrado';`,
    );
    sqlLines.push(`    RETURN;`);
    sqlLines.push(`  END IF;`);
    sqlLines.push('');
    sqlLines.push(
      `  -- Check if a media record already exists for this Cloudinary URL`,
    );
    sqlLines.push(
      `  SELECT id INTO v_media_id FROM media WHERE path = '${path}' LIMIT 1;`,
    );
    sqlLines.push('');
    sqlLines.push(`  IF v_media_id IS NULL THEN`);
    sqlLines.push(
      `    INSERT INTO media (path, file_name, mime_type, media_type, provider, size_bytes, checksum, status, is_public, created_at, updated_at)`,
    );
    sqlLines.push(
      `      VALUES ('${path}', 'prod_${externalId}', 'image/jpeg', 'image', 'cloudinary', 0, '${path.substring(0, 64)}', 'active', true, NOW(), NOW())`,
    );
    sqlLines.push(`      RETURNING id INTO v_media_id;`);
    sqlLines.push(`  ELSE`);
    sqlLines.push(
      `    UPDATE media SET path = '${path}', provider = 'cloudinary', updated_at = NOW() WHERE id = v_media_id;`,
    );
    sqlLines.push(`  END IF;`);
    sqlLines.push('');
    sqlLines.push(`  -- Upsert product_images`);
    sqlLines.push(
      `  DELETE FROM product_images WHERE product_id = v_product_id AND is_cover = true;`,
    );
    sqlLines.push(
      `  INSERT INTO product_images (product_id, media_id, is_cover, position) VALUES (v_product_id, v_media_id, true, 0);`,
    );
    sqlLines.push(`END $$;`);
    sqlLines.push('');
  }

  // Write SQL file
  const outputPath = path.resolve(
    __dirname,
    '..',
    'data',
    'product-images-migration.sql',
  );
  fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf8');
  console.log(`\n✅ Archivo SQL generado: ${outputPath}`);

  await pool.end();
}

exportImages().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
