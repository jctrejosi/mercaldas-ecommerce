// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log('🌱 Insertando 3 slides de prueba con filtros...');

  try {
    // 1. Crear 3 filtros
    await db.execute(
      `INSERT INTO saved_filters (name, category_ids, on_sale, sort, is_active)
       VALUES ('Frutas y Verduras', '[1, 2, 3]', false, 'relevancia', true)`
    );
    const f1 = await db.execute(`SELECT id FROM saved_filters WHERE name = 'Frutas y Verduras'`);
    const filterId1 = f1.rows[0].id;
    console.log(`✅ Filtro 1: Frutas y Verduras (id=${filterId1})`);

    await db.execute(
      `INSERT INTO saved_filters (name, category_ids, on_sale, sort, is_active)
       VALUES ('Ofertas destacadas', '[]', true, 'descuento', true)`
    );
    const f2 = await db.execute(`SELECT id FROM saved_filters WHERE name = 'Ofertas destacadas'`);
    const filterId2 = f2.rows[0].id;
    console.log(`✅ Filtro 2: Ofertas destacadas (id=${filterId2})`);

    await db.execute(
      `INSERT INTO saved_filters (name, category_ids, on_sale, sort, search, is_active)
       VALUES ('Lácteos Alquería', '[]', false, 'vendidos', 'alqueria', true)`
    );
    const f3 = await db.execute(`SELECT id FROM saved_filters WHERE name = 'Lácteos Alquería'`);
    const filterId3 = f3.rows[0].id;
    console.log(`✅ Filtro 3: Lácteos Alquería (id=${filterId3})`);

    // 2. Crear media records
    const images = [
      'https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=1200&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=1200&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1533413710577-c1b62c5fc55b?w=1200&h=600&fit=crop&auto=format',
    ];

    const mobileImages = [
      'https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=600&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=600&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1533413710577-c1b62c5fc55b?w=600&h=400&fit=crop&auto=format',
    ];

    const allUrls = [...images, ...mobileImages];
    const mediaIds = [];
    for (const url of allUrls) {
      const checksum = `seed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await db.execute(
        `INSERT INTO media (path, file_name, mime_type, size_bytes, checksum, media_type)
         VALUES ('${url}', 'banner.jpg', 'image/jpeg', 0, '${checksum}', 'image')`
      );
      const r = await db.execute(`SELECT id FROM media WHERE checksum = '${checksum}'`);
      mediaIds.push(r.rows[0].id);
    }
    console.log(`✅ ${mediaIds.length} media records creados`);

    // 3. Crear 3 banners (slides hero)
    const slides = [
      {
        title: "Frutas y Verduras\\nFrescas del Día",
        subtitle: "Directo de los mejores cultivadores de la región. Frescura garantizada en cada entrega.",
        ctaText: "Ver Frutas y Verduras",
        bgColor: "#1A1A2E",
        accentColor: "#FFF200",
        mediaId: mediaIds[0],
        mobileImageId: mediaIds[3],
        filterId: filterId1,
        position: 0,
      },
      {
        title: "Hasta 30% OFF\\nen Productos Seleccionados",
        subtitle: "Aprovecha nuestras promociones de temporada. Ofertas válidas hasta agotar existencias.",
        ctaText: "Ver Todas las Ofertas",
        bgColor: "#8B0000",
        accentColor: "#FFF200",
        mediaId: mediaIds[1],
        mobileImageId: mediaIds[4],
        filterId: filterId2,
        position: 1,
      },
      {
        title: "Tu Mercado Completo\\nSin Salir de Casa",
        subtitle: "Miles de productos, domicilio en Manizales en menos de 2 horas.",
        ctaText: "Empezar a Comprar",
        bgColor: "#1A4A2E",
        accentColor: "#FFF200",
        mediaId: mediaIds[2],
        mobileImageId: mediaIds[5],
        filterId: filterId3,
        position: 2,
      },
    ];

    for (const s of slides) {
      const escapedTitle = s.title.replace(/'/g, "''");
      const escapedSubtitle = s.subtitle.replace(/'/g, "''");
      await db.execute(
        `INSERT INTO banners (title, subtitle, cta_text, bg_color, accent_color, banner_type, media_id, mobile_image_id, filter_id, position, is_active, start_date)
         VALUES ('${escapedTitle}', '${escapedSubtitle}', '${s.ctaText}', '${s.bgColor}', '${s.accentColor}', 'hero', ${s.mediaId}, ${s.mobileImageId}, ${s.filterId}, ${s.position}, true, NOW())`
      );
    }
    console.log('✅ 3 slides hero creados');

    console.log('\n🎉 Seed completado!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

seed();
