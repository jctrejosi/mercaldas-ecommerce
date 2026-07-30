/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';

// __dirname is available at runtime in CommonJS output
declare var __dirname: string;
const JPG_DIR = path.resolve(process.cwd(), '..', 'JPG');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no definida');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// Configurar Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary credentials no configuradas');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

async function uploadToCloudinary(
  filePath: string,
  plu: string,
  productName: string,
  productCode: string,
): Promise<string | null> {
  const folderCode = `prod_${(productName || 'product').replace(/[^a-z0-9]/gi, '_').substring(0, 30)}_${productCode}`;

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `products/${plu}`,
          public_id: `prod_${productCode}`,
          use_filename: true,
          unique_filename: false,
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error('Cloudinary no devolvió resultado'));
            return;
          }
          resolve(result);
        },
      );

      const stream = fs.createReadStream(filePath);
      stream.pipe(uploadStream);
    });

    console.log(`  ✅ Subida exitosa: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(
      `  ❌ Error subiendo ${filePath}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function main() {
  console.log('📁 Escaneando carpeta JPG...');

  if (!fs.existsSync(JPG_DIR)) {
    console.error(`❌ La carpeta ${JPG_DIR} no existe`);
    await pool.end();
    process.exit(1);
  }

  const files = fs
    .readdirSync(JPG_DIR)
    .filter((f) => f.toLowerCase().endsWith('.jpg'));
  console.log(`   Encontrados ${files.length} archivos JPG\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const plu = path.basename(file, '.jpg');
    const filePath = path.join(JPG_DIR, file);

    // Buscar producto por PLU
    const [product] = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        externalId: schema.products.externalId,
        plu: schema.products.plu,
      })
      .from(schema.products)
      .where(
        and(eq(schema.products.plu, plu), isNull(schema.products.deletedAt)),
      )
      .limit(1);

    if (!product) {
      console.log(`  ⏭️  PLU ${plu}: producto no encontrado, omitiendo`);
      skipped++;
      continue;
    }

    const productId = Number(product.id);
    const productCode = product.externalId || product.plu || plu;
    console.log(`📸 Procesando PLU ${plu} → ${product.name} (${productCode})`);

    const url = await uploadToCloudinary(
      filePath,
      plu,
      product.name,
      productCode,
    );
    if (!url) {
      errors++;
      continue;
    }

    // Skip if product already has a cover image
    const [existingCover] = await db
      .select({ id: schema.productImages.id })
      .from(schema.productImages)
      .where(
        and(
          eq(schema.productImages.productId, productId),
          eq(schema.productImages.isCover, true),
        ),
      )
      .limit(1);

    if (existingCover) {
      console.log(`  ⏭️  ${product.name}: ya tiene imagen de portada`);
      skipped++;
      continue;
    }

    // Buscar media existente o crear nueva
    const existingImages = await db
      .select({
        id: schema.productImages.id,
        mediaId: schema.productImages.mediaId,
      })
      .from(schema.productImages)
      .innerJoin(
        schema.media,
        eq(schema.media.id, schema.productImages.mediaId),
      )
      .where(
        and(
          eq(schema.productImages.productId, productId),
          eq(schema.productImages.isCover, true),
        ),
      )
      .limit(1);

    if (existingImages.length > 0) {
      // Actualizar media existente
      await db
        .update(schema.media)
        .set({
          path: url,
          fileName: `prod_${productCode}`,
          provider: 'cloudinary',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.media.id, BigInt(existingImages[0].mediaId)));
      console.log(`  ✅ Imagen actualizada para ${product.name}`);
    } else {
      // Insertar nueva media
      const [insertedMedia] = await db
        .insert(schema.media)
        .values({
          path: url,
          fileName: `prod_${productCode}`,
          mimeType: 'image/jpeg',
          mediaType: 'image',
          provider: 'cloudinary',
          sizeBytes: 0,
          checksum: `${productId}_${plu}_${Date.now()}`.substring(0, 64),
          status: 'active',
          isPublic: true,
        })
        .returning({ id: schema.media.id });

      // Insertar product_images
      await db.insert(schema.productImages).values({
        productId,
        mediaId: Number(insertedMedia.id),
        isCover: true,
        position: 0,
      });
      console.log(`  ✅ Imagen creada para ${product.name}`);
    }

    uploaded++;
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Subidas: ${uploaded}`);
  console.log(`   Omitidas: ${skipped}`);
  console.log(`   Errores: ${errors}`);

  await pool.end();
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
