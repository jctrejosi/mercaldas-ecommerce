-- ============================================================
-- INSERCIÓN MASIVA DE DATOS DE EJEMPLO PARA EL ECOMMERCE
-- ============================================================

-- 1. SUCURSAL PRINCIPAL (para inventario)
INSERT INTO branches (
    code, name, address, city, phone, store_id, email, manager_name, manager_phone,
    location, delivery_radius_km, schedule, is_active, created_at, updated_at
) VALUES (
    'SUC-001',
    'Sucursal Principal',
    'Calle 123 # 45-67, Centro',
    'Manizales',
    '6012345678',
    1,  -- store_id (asumiendo que existe un store con id=1)
    'sucursal@tienda.com',
    'Carlos Gómez',
    '3001234567',
    ST_GeomFromText('POINT(-75.5197 5.0646)', 4326),
    10.0,
    '{"monday":"08:00-20:00","tuesday":"08:00-20:00","wednesday":"08:00-20:00","thursday":"08:00-20:00","friday":"08:00-20:00","saturday":"08:00-18:00","sunday":"10:00-16:00"}',
    true,
    NOW(),
    NOW()
);

-- ============================================================
-- 2. CATEGORÍAS (jerárquicas)
-- ============================================================
INSERT INTO categories (name, slug, description, level, is_active) VALUES
('Electrónicos', 'electronicos', 'Productos tecnológicos y gadgets', 0, true),
('Ropa', 'ropa', 'Prendas de vestir para toda la familia', 0, true),
('Hogar', 'hogar', 'Artículos para el hogar y decoración', 0, true),
('Deportes', 'deportes', 'Equipamiento y ropa deportiva', 0, true),
('Alimentos', 'alimentos', 'Comestibles y bebidas', 0, true);

-- Subcategorías
INSERT INTO categories (parent_id, name, slug, description, level, is_active) VALUES
(1, 'Celulares', 'celulares', 'Teléfonos inteligentes y accesorios', 1, true),
(1, 'Computadoras', 'computadoras', 'Laptops, desktops y tablets', 1, true),
(1, 'Audio', 'audio', 'Auriculares, parlantes y equipos de sonido', 1, true),
(2, 'Camisas', 'camisas', 'Camisas formales e informales', 1, true),
(2, 'Pantalones', 'pantalones', 'Jeans, chinos y joggers', 1, true),
(2, 'Zapatos', 'zapatos', 'Calzado para hombre y mujer', 1, true),
(3, 'Cocina', 'cocina', 'Utensilios y electrodomésticos de cocina', 1, true),
(3, 'Decoración', 'decoracion', 'Artículos decorativos para el hogar', 1, true),
(4, 'Fitness', 'fitness', 'Equipo para entrenamiento', 1, true),
(4, 'Deportes de equipo', 'deportes-equipo', 'Balones, raquetas, etc.', 1, true),
(5, 'Bebidas', 'bebidas', 'Refrescos, jugos y licores', 1, true),
(5, 'Comida envasada', 'comida-envasada', 'Enlatados, granos, pastas', 1, true);

-- ============================================================
-- 3. MARCAS
-- ============================================================
INSERT INTO brands (name, slug, website, description, country, is_active) VALUES
('Sony', 'sony', 'https://www.sony.com', 'Electrónica de alta calidad', 'Japón', true),
('Samsung', 'samsung', 'https://www.samsung.com', 'Innovación en tecnología', 'Corea del Sur', true),
('Nike', 'nike', 'https://www.nike.com', 'Ropa y calzado deportivo', 'EE. UU.', true),
('Adidas', 'adidas', 'https://www.adidas.com', 'Deporte y estilo de vida', 'Alemania', true),
('LG', 'lg', 'https://www.lg.com', 'Electrodomésticos y electrónica', 'Corea del Sur', true),
('Whirlpool', 'whirlpool', 'https://www.whirlpool.com', 'Electrodomésticos para el hogar', 'EE. UU.', true),
('Nestlé', 'nestle', 'https://www.nestle.com', 'Alimentos y bebidas', 'Suiza', true),
('Coca-Cola', 'coca-cola', 'https://www.coca-cola.com', 'Bebidas refrescantes', 'EE. UU.', true);

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
-- Nota: Los slugs deben ser únicos, uso nombres en minúscula con guiones.

INSERT INTO products (
    brand_id, name, slug, description, product_type, sku_prefix, featured, manufacturer, visibility, is_active, published_at
) VALUES
-- Electrónicos - Celulares
(2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Teléfono inteligente de última generación con pantalla AMOLED 6.8"', 'SIMPLE', 'SGS24U', true, 'Samsung Electronics', 'PUBLIC', true, NOW()),
(1, 'Sony Xperia 1 VI', 'sony-xperia-1-vi', 'Smartphone con cámara profesional y pantalla 4K HDR', 'SIMPLE', 'SX1VI', false, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung Galaxy Buds3 Pro', 'samsung-galaxy-buds3-pro', 'Audífonos inalámbricos con cancelación de ruido', 'SIMPLE', 'SGB3P', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
-- Electrónicos - Computadoras
(1, 'Sony VAIO Z', 'sony-vaio-z', 'Laptop ultraligera con pantalla OLED 4K', 'SIMPLE', 'SVZ', true, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung Galaxy Book4 Ultra', 'samsung-galaxy-book4-ultra', 'Laptop de alto rendimiento con Intel Core Ultra 9', 'SIMPLE', 'SGB4U', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
-- Electrónicos - Audio
(1, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Audífonos over-ear con cancelación de ruido líder en la industria', 'SIMPLE', 'SWX5', true, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung HW-Q990D', 'samsung-hw-q990d', 'Barra de sonido con sonido envolvente 11.1.4', 'SIMPLE', 'SHWQ', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
-- Ropa - Camisas
(3, 'Nike Camisa Deportiva Dri-FIT', 'nike-camisa-deportiva-dri-fit', 'Camisa de entrenamiento con tecnología que absorbe el sudor', 'SIMPLE', 'NCD', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Camisa ClimaCool', 'adidas-camisa-climacool', 'Camisa con ventilación para máximo confort', 'SIMPLE', 'ACC', false, 'Adidas AG', 'PUBLIC', true, NOW()),
(3, 'Nike Camisa Polo', 'nike-camisa-polo', 'Camisa polo clásica con logo de Nike', 'SIMPLE', 'NCP', false, 'Nike Inc.', 'PUBLIC', true, NOW()),
-- Ropa - Pantalones
(3, 'Nike Joggers Fleece', 'nike-joggers-fleece', 'Pantalones deportivos de felpa', 'SIMPLE', 'NJF', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Pantalón Tiro', 'adidas-pantalon-tiro', 'Pantalón de entrenamiento con corte clásico', 'SIMPLE', 'APT', false, 'Adidas AG', 'PUBLIC', true, NOW()),
-- Ropa - Zapatos
(3, 'Nike Air Max 2024', 'nike-air-max-2024', 'Zapatillas con amortiguación Air Max', 'SIMPLE', 'NAM24', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Ultraboost Light', 'adidas-ultraboost-light', 'Zapatillas con la mejor amortiguación y ligereza', 'SIMPLE', 'AUL', false, 'Adidas AG', 'PUBLIC', true, NOW()),
-- Hogar - Cocina
(5, 'LG Refrigerador InstaView', 'lg-refrigerador-instaview', 'Refrigerador con puerta InstaView y dispensador de agua', 'SIMPLE', 'LGRIV', true, 'LG Electronics', 'PUBLIC', true, NOW()),
(6, 'Whirlpool Lavadora Carga Superior', 'whirlpool-lavadora-carga-superior', 'Lavadora con tecnología 6th Sense', 'SIMPLE', 'WLCS', false, 'Whirlpool Corp.', 'PUBLIC', true, NOW()),
(5, 'LG Microondas Smart Inverter', 'lg-microondas-smart-inverter', 'Microondas con cocción precisa', 'SIMPLE', 'LGMSI', false, 'LG Electronics', 'PUBLIC', true, NOW()),
-- Hogar - Decoración
(7, 'Nestlé Cafetera Dolce Gusto', 'nestle-cafetera-dolce-gusto', 'Cafetera de cápsulas con sistema de espuma', 'SIMPLE', 'NCDG', false, 'Nestlé', 'PUBLIC', true, NOW()),
-- Deportes - Fitness
(3, 'Nike Cuerda para Saltar', 'nike-cuerda-para-saltar', 'Cuerda de entrenamiento profesional', 'SIMPLE', 'NCS', false, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Balón de Fútbol', 'adidas-balon-de-futbol', 'Balón oficial de la UEFA', 'SIMPLE', 'ABF', false, 'Adidas AG', 'PUBLIC', true, NOW()),
-- Alimentos - Bebidas
(8, 'Coca-Cola Original 2.5L', 'coca-cola-original-25l', 'Refresco de cola en presentación familiar', 'SIMPLE', 'CCO25', true, 'Coca-Cola Company', 'PUBLIC', true, NOW()),
(7, 'Nestlé Agua Mineral 1.5L', 'nestle-agua-mineral-15l', 'Agua mineral natural', 'SIMPLE', 'NAM15', false, 'Nestlé', 'PUBLIC', true, NOW()),
-- Alimentos - Comida envasada
(7, 'Nestlé Cereal Fitness', 'nestle-cereal-fitness', 'Cereal de granola con frutas', 'SIMPLE', 'NCF', false, 'Nestlé', 'PUBLIC', true, NOW());

-- ============================================================
-- 5. VARIANTES DE PRODUCTOS (SKU, PRECIOS)
-- ============================================================
-- Para cada producto inserto una o dos variantes (color, talla)
-- Nota: Los SKU deben ser únicos.

INSERT INTO product_variants (
    product_id, sku, barcode, current_price, current_compare_price, cost_price, is_active
) VALUES
-- Samsung Galaxy S24 Ultra (product_id = 1)
(1, 'SGS24U-BK-256', '8806090543887', 1299900, 1499900, 800000, true),
(1, 'SGS24U-WH-256', '8806090543894', 1299900, 1499900, 800000, true),
-- Sony Xperia 1 VI (product_id = 2)
(2, 'SX1VI-BK-256', '4905524972345', 899900, 999900, 600000, true),
(2, 'SX1VI-SL-256', '4905524972352', 899900, 999900, 600000, true),
-- Samsung Galaxy Buds3 Pro (product_id = 3)
(3, 'SGB3P-WH', '8806090543900', 289900, 329900, 180000, true),
(3, 'SGB3P-BK', '8806090543917', 289900, 329900, 180000, true),
-- Sony VAIO Z (product_id = 4)
(4, 'SVZ-BK-1TB', '4905524972369', 2499900, 2799900, 1600000, true),
-- Samsung Galaxy Book4 Ultra (product_id = 5)
(5, 'SGB4U-SL-1TB', '8806090543924', 2899900, 3199900, 1800000, true),
-- Sony WH-1000XM5 (product_id = 6)
(6, 'SWX5-BK', '4905524972376', 399900, 449900, 250000, true),
(6, 'SWX5-SL', '4905524972383', 399900, 449900, 250000, true),
-- Samsung HW-Q990D (product_id = 7)
(7, 'SHWQ-BK', '8806090543931', 1299900, 1499900, 800000, true),
-- Nike Camisa Deportiva Dri-FIT (product_id = 8)
(8, 'NCD-M', '1234567890123', 89900, 109900, 50000, true),
(8, 'NCD-L', '1234567890130', 89900, 109900, 50000, true),
(8, 'NCD-XL', '1234567890147', 89900, 109900, 50000, true),
-- Adidas Camisa ClimaCool (product_id = 9)
(9, 'ACC-M', '9876543210987', 79900, 99900, 45000, true),
(9, 'ACC-L', '9876543210994', 79900, 99900, 45000, true),
-- Nike Camisa Polo (product_id = 10)
(10, 'NCP-M', '1234567890154', 69900, 89900, 40000, true),
(10, 'NCP-L', '1234567890161', 69900, 89900, 40000, true),
-- Nike Joggers Fleece (product_id = 11)
(11, 'NJF-S', '1234567890178', 119900, 149900, 70000, true),
(11, 'NJF-M', '1234567890185', 119900, 149900, 70000, true),
(11, 'NJF-L', '1234567890192', 119900, 149900, 70000, true),
-- Adidas Pantalón Tiro (product_id = 12)
(12, 'APT-M', '9876543211007', 99900, 129900, 60000, true),
(12, 'APT-L', '9876543211014', 99900, 129900, 60000, true),
-- Nike Air Max 2024 (product_id = 13)
(13, 'NAM24-40', '1234567890208', 199900, 249900, 120000, true),
(13, 'NAM24-42', '1234567890215', 199900, 249900, 120000, true),
(13, 'NAM24-44', '1234567890222', 199900, 249900, 120000, true),
-- Adidas Ultraboost Light (product_id = 14)
(14, 'AUL-40', '9876543211021', 229900, 279900, 140000, true),
(14, 'AUL-42', '9876543211038', 229900, 279900, 140000, true),
-- LG Refrigerador InstaView (product_id = 15)
(15, 'LGRIV-550', '8806090543948', 3499900, 3999900, 2200000, true),
-- Whirlpool Lavadora (product_id = 16)
(16, 'WLCS-18', '8806090543955', 1899900, 2199900, 1200000, true),
-- LG Microondas (product_id = 17)
(17, 'LGMSI-25', '8806090543962', 599900, 699900, 350000, true),
-- Nestlé Cafetera (product_id = 18)
(18, 'NCDG-100', '8806090543979', 399900, 499900, 250000, true),
-- Nike Cuerda (product_id = 19)
(19, 'NCS-01', '1234567890239', 39900, 49900, 20000, true),
-- Adidas Balón (product_id = 20)
(20, 'ABF-5', '9876543211045', 89900, 109900, 50000, true),
-- Coca-Cola 2.5L (product_id = 21)
(21, 'CCO25-1', '7501078133456', 4900, 5900, 2500, true),
-- Nestlé Agua 1.5L (product_id = 22)
(22, 'NAM15-1', '7501078133463', 2900, 3900, 1500, true),
-- Nestlé Cereal (product_id = 23)
(23, 'NCF-500', '7501078133470', 15900, 19900, 9000, true);

-- ============================================================
-- 6. PRECIOS HISTÓRICOS (para algunas variantes)
-- ============================================================
INSERT INTO prices (
    product_variant_id, start_date, end_date, changed_by, change_reason, cost, price, compare_price, version
) VALUES
-- Samsung Galaxy S24 Ultra (variante 1) - precio anterior
(1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', 1, 'Ajuste de precio', 800000, 1499900, 1699900, 1),
(1, NOW(), NULL, 1, 'Precio actual', 800000, 1299900, 1499900, 2),
-- Nike Camisa Dri-FIT talla M (variante 8) - precio anterior
(8, NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day', 1, 'Oferta especial', 50000, 109900, 129900, 1),
(8, NOW(), NULL, 1, 'Precio actual', 50000, 89900, 109900, 2),
-- Adidas Ultraboost Light talla 42 (variante 14) - precio anterior
(14, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', 1, 'Promoción', 140000, 279900, 299900, 1),
(14, NOW(), NULL, 1, 'Precio actual', 140000, 229900, 279900, 2);

-- ============================================================
-- 7. IMÁGENES DE PRODUCTOS (usando dummyimage.com)
-- ============================================================
-- Para cada producto inserto una o más imágenes, una de ellas como cover.

-- Samsung Galaxy S24 Ultra
INSERT INTO product_images (product_id, media_id, is_cover, position) VALUES
(1, (SELECT id FROM media WHERE checksum = 'dummy_cover_s24u' LIMIT 1), true, 0);
-- Insertamos registros en media para las imágenes (simulamos URLs con dummyimage)
-- Como la tabla media requiere un registro existente, creamos registros dummy.
-- Nota: En un entorno real, primero se subirían las imágenes a un almacenamiento y se insertarían en media.
-- Para este ejemplo, insertamos registros en media con rutas dummy.

INSERT INTO media (
    status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public
) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Samsung+Galaxy+S24+Ultra', 's24u-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_s24u', '{"source":"dummyimage"}', 'Samsung Galaxy S24 Ultra', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=S24+Ultra+2', 's24u-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_s24u_2', '{}', 'Samsung Galaxy S24 Ultra - vista trasera', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/2c3e50/fff&text=S24+Ultra+3', 's24u-3.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_s24u_3', '{}', 'Samsung Galaxy S24 Ultra - pantalla', true);

-- Sony Xperia 1 VI
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+Xperia+1+VI', 'xperia-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_xperia', '{"source":"dummyimage"}', 'Sony Xperia 1 VI', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=Xperia+VI+2', 'xperia-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_xperia_2', '{}', 'Sony Xperia 1 VI - cámara', true);

-- Samsung Galaxy Buds3 Pro
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Galaxy+Buds3+Pro', 'buds-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_buds', '{"source":"dummyimage"}', 'Samsung Galaxy Buds3 Pro', true);

-- Sony VAIO Z
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+VAIO+Z', 'vaio-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_vaio', '{"source":"dummyimage"}', 'Sony VAIO Z', true);

-- Samsung Galaxy Book4 Ultra
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Galaxy+Book4+Ultra', 'book4-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_book4', '{"source":"dummyimage"}', 'Samsung Galaxy Book4 Ultra', true);

-- Sony WH-1000XM5
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+WH-1000XM5', 'xm5-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_xm5', '{"source":"dummyimage"}', 'Sony WH-1000XM5', true);

-- Samsung HW-Q990D
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Samsung+Q990D', 'q990d-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_q990d', '{"source":"dummyimage"}', 'Samsung HW-Q990D', true);

-- Nike Camisa Dri-FIT (producto 8) - varias imágenes
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Dri-FIT', 'nike-dri-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_dri', '{"source":"dummyimage"}', 'Nike Camisa Dri-FIT', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=Nike+Dri-FIT+2', 'nike-dri-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_nike_dri_2', '{}', 'Nike Camisa Dri-FIT - espalda', true);

-- Adidas Camisa ClimaCool
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+ClimaCool', 'adidas-clima-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_clima', '{"source":"dummyimage"}', 'Adidas Camisa ClimaCool', true);

-- Nike Camisa Polo
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Polo', 'nike-polo-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_polo', '{"source":"dummyimage"}', 'Nike Camisa Polo', true);

-- Nike Joggers
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Joggers', 'nike-jog-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_jog', '{"source":"dummyimage"}', 'Nike Joggers Fleece', true);

-- Adidas Pantalón Tiro
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Tiro', 'adidas-tiro-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_tiro', '{"source":"dummyimage"}', 'Adidas Pantalón Tiro', true);

-- Nike Air Max 2024
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Air+Max+2024', 'airmax-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_airmax', '{"source":"dummyimage"}', 'Nike Air Max 2024', true);

-- Adidas Ultraboost Light
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Ultraboost', 'ultraboost-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_ultraboost', '{"source":"dummyimage"}', 'Adidas Ultraboost Light', true);

-- LG Refrigerador
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=LG+InstaView', 'lg-fridge-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_lg_fridge', '{"source":"dummyimage"}', 'LG Refrigerador InstaView', true);

-- Whirlpool Lavadora
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Whirlpool+Lavadora', 'whirlpool-washer-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_whirlpool_washer', '{"source":"dummyimage"}', 'Whirlpool Lavadora Carga Superior', true);

-- LG Microondas
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=LG+Microondas', 'lg-microwave-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_lg_microwave', '{"source":"dummyimage"}', 'LG Microondas Smart Inverter', true);

-- Nestlé Cafetera
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Dolce+Gusto', 'nestle-coffee-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_coffee', '{"source":"dummyimage"}', 'Nestlé Cafetera Dolce Gusto', true);

-- Nike Cuerda
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Cuerda', 'nike-rope-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_rope', '{"source":"dummyimage"}', 'Nike Cuerda para Saltar', true);

-- Adidas Balón
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Balon', 'adidas-ball-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_ball', '{"source":"dummyimage"}', 'Adidas Balón de Fútbol', true);

-- Coca-Cola
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Coca-Cola+2.5L', 'coca-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_coca', '{"source":"dummyimage"}', 'Coca-Cola Original 2.5L', true);

-- Nestlé Agua
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Agua', 'nestle-water-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_water', '{"source":"dummyimage"}', 'Nestlé Agua Mineral 1.5L', true);

-- Nestlé Cereal
INSERT INTO media (status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, metadata, alt_text, is_public) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Cereal', 'nestle-cereal-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_cereal', '{"source":"dummyimage"}', 'Nestlé Cereal Fitness', true);

-- Ahora asociamos las imágenes a los productos. Cada producto tendrá al menos una imagen cover.
-- Nota: Los media_id se deben obtener de las inserciones anteriores. Como los IDs son autoincrementales, podemos obtenerlos mediante subconsultas con checksum.
-- Si no confiamos en los IDs, podemos usar los checksum para obtener el id.

INSERT INTO product_images (product_id, media_id, is_cover, position) VALUES
(1, (SELECT id FROM media WHERE checksum = 'dummy_cover_s24u'), true, 0),
(1, (SELECT id FROM media WHERE checksum = 'dummy_s24u_2'), false, 1),
(1, (SELECT id FROM media WHERE checksum = 'dummy_s24u_3'), false, 2),
(2, (SELECT id FROM media WHERE checksum = 'dummy_cover_xperia'), true, 0),
(2, (SELECT id FROM media WHERE checksum = 'dummy_xperia_2'), false, 1),
(3, (SELECT id FROM media WHERE checksum = 'dummy_cover_buds'), true, 0),
(4, (SELECT id FROM media WHERE checksum = 'dummy_cover_vaio'), true, 0),
(5, (SELECT id FROM media WHERE checksum = 'dummy_cover_book4'), true, 0),
(6, (SELECT id FROM media WHERE checksum = 'dummy_cover_xm5'), true, 0),
(7, (SELECT id FROM media WHERE checksum = 'dummy_cover_q990d'), true, 0),
(8, (SELECT id FROM media WHERE checksum = 'dummy_cover_nike_dri'), true, 0),
(8, (SELECT id FROM media WHERE checksum = 'dummy_nike_dri_2'), false, 1),
(9, (SELECT id FROM media WHERE checksum = 'dummy_cover_adidas_clima'), true, 0),
(10, (SELECT id FROM media WHERE checksum = 'dummy_cover_nike_polo'), true, 0),
(11, (SELECT id FROM media WHERE checksum = 'dummy_cover_nike_jog'), true, 0),
(12, (SELECT id FROM media WHERE checksum = 'dummy_cover_adidas_tiro'), true, 0),
(13, (SELECT id FROM media WHERE checksum = 'dummy_cover_airmax'), true, 0),
(14, (SELECT id FROM media WHERE checksum = 'dummy_cover_ultraboost'), true, 0),
(15, (SELECT id FROM media WHERE checksum = 'dummy_cover_lg_fridge'), true, 0),
(16, (SELECT id FROM media WHERE checksum = 'dummy_cover_whirlpool_washer'), true, 0),
(17, (SELECT id FROM media WHERE checksum = 'dummy_cover_lg_microwave'), true, 0),
(18, (SELECT id FROM media WHERE checksum = 'dummy_cover_nestle_coffee'), true, 0),
(19, (SELECT id FROM media WHERE checksum = 'dummy_cover_nike_rope'), true, 0),
(20, (SELECT id FROM media WHERE checksum = 'dummy_cover_adidas_ball'), true, 0),
(21, (SELECT id FROM media WHERE checksum = 'dummy_cover_coca'), true, 0),
(22, (SELECT id FROM media WHERE checksum = 'dummy_cover_nestle_water'), true, 0),
(23, (SELECT id FROM media WHERE checksum = 'dummy_cover_nestle_cereal'), true, 0);

-- ============================================================
-- 8. RELACIONES PRODUCTO-CATEGORÍA
-- ============================================================
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 6),  -- Samsung S24 Ultra -> Celulares
(2, 6),  -- Sony Xperia -> Celulares
(3, 8),  -- Galaxy Buds -> Audio
(4, 7),  -- VAIO Z -> Computadoras
(5, 7),  -- Galaxy Book -> Computadoras
(6, 8),  -- WH-1000XM5 -> Audio
(7, 8),  -- Q990D -> Audio
(8, 10), -- Nike Camisa Dri-FIT -> Camisas
(9, 10), -- Adidas ClimaCool -> Camisas
(10, 10),-- Nike Polo -> Camisas
(11, 11),-- Nike Joggers -> Pantalones
(12, 11),-- Adidas Tiro -> Pantalones
(13, 12),-- Nike Air Max -> Zapatos
(14, 12),-- Adidas Ultraboost -> Zapatos
(15, 13),-- LG Refrigerador -> Cocina
(16, 13),-- Whirlpool Lavadora -> Cocina
(17, 13),-- LG Microondas -> Cocina
(18, 14),-- Nestlé Cafetera -> Decoración (aunque también podría ser cocina, pero lo pongo en decoración)
(19, 15),-- Nike Cuerda -> Fitness
(20, 16),-- Adidas Balón -> Deportes de equipo
(21, 17),-- Coca-Cola -> Bebidas
(22, 17),-- Nestlé Agua -> Bebidas
(23, 18);-- Nestlé Cereal -> Comida envasada

-- También podríamos añadir categorías adicionales para algunos productos (ej. electrónicos)
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1),
(8, 2), (9, 2), (10, 2), (11, 2), (12, 2), (13, 2), (14, 2),
(15, 3), (16, 3), (17, 3), (18, 3),
(19, 4), (20, 4),
(21, 5), (22, 5), (23, 5);

-- ============================================================
-- 9. INVENTARIO (stock en la sucursal principal)
-- ============================================================
-- Obtenemos branch_id = 1 (la sucursal insertada arriba) y variamos cantidades.

INSERT INTO inventory (
    product_variant_id, branch_id, stock, reserved_stock, reorder_point, target_stock,
    minimum_stock, maximum_stock, created_at, updated_at
) VALUES
(1, 1, 50, 0, 10, 100, 5, 200, NOW(), NOW()),
(2, 1, 30, 0, 5, 80, 3, 150, NOW(), NOW()),
(3, 1, 25, 0, 5, 60, 3, 120, NOW(), NOW()),
(4, 1, 20, 0, 4, 50, 2, 100, NOW(), NOW()),
(5, 1, 100, 0, 20, 200, 10, 400, NOW(), NOW()),
(6, 1, 80, 0, 15, 150, 8, 300, NOW(), NOW()),
(7, 1, 40, 0, 8, 90, 4, 180, NOW(), NOW()),
(8, 1, 15, 0, 3, 40, 2, 80, NOW(), NOW()),
(9, 1, 25, 0, 5, 60, 3, 120, NOW(), NOW()),
(10, 1, 12, 0, 2, 30, 1, 60, NOW(), NOW()),
(11, 1, 35, 0, 7, 80, 4, 150, NOW(), NOW()),
(12, 1, 40, 0, 8, 90, 5, 180, NOW(), NOW()),
(13, 1, 20, 0, 4, 50, 2, 100, NOW(), NOW()),
(14, 1, 30, 0, 6, 70, 3, 140, NOW(), NOW()),
(15, 1, 15, 0, 3, 40, 2, 80, NOW(), NOW()),
(16, 1, 10, 0, 2, 30, 1, 60, NOW(), NOW()),
(17, 1, 8, 0, 2, 25, 1, 50, NOW(), NOW()),
(18, 1, 5, 0, 1, 15, 1, 30, NOW(), NOW()),
(19, 1, 22, 0, 5, 55, 3, 110, NOW(), NOW()),
(20, 1, 18, 0, 4, 45, 2, 90, NOW(), NOW()),
(21, 1, 60, 0, 12, 150, 6, 300, NOW(), NOW()),
(22, 1, 45, 0, 10, 120, 5, 200, NOW(), NOW()),
(23, 1, 35, 0, 8, 90, 4, 180, NOW(), NOW()),
(24, 1, 20, 0, 4, 50, 2, 100, NOW(), NOW()),
(25, 1, 15, 0, 3, 40, 2, 80, NOW(), NOW()),
(26, 1, 10, 0, 2, 30, 1, 60, NOW(), NOW()),
(27, 1, 25, 0, 5, 60, 3, 120, NOW(), NOW()),
(28, 1, 30, 0, 6, 70, 3, 140, NOW(), NOW()),
(29, 1, 40, 0, 8, 100, 4, 200, NOW(), NOW()),
(30, 1, 50, 0, 10, 120, 5, 250, NOW(), NOW()),
(31, 1, 100, 0, 20, 200, 10, 400, NOW(), NOW()),
(32, 1, 80, 0, 15, 160, 8, 320, NOW(), NOW()),
(33, 1, 60, 0, 12, 140, 6, 280, NOW(), NOW()),
(34, 1, 45, 0, 9, 100, 4, 200, NOW(), NOW()),
(35, 1, 30, 0, 6, 70, 3, 140, NOW(), NOW()),
(36, 1, 20, 0, 4, 50, 2, 100, NOW(), NOW()),
(37, 1, 15, 0, 3, 40, 2, 80, NOW(), NOW()),
(38, 1, 10, 0, 2, 30, 1, 60, NOW(), NOW()),
(39, 1, 25, 0, 5, 60, 3, 120, NOW(), NOW()),
(40, 1, 30, 0, 6, 70, 3, 140, NOW(), NOW()),
(41, 1, 40, 0, 8, 100, 4, 200, NOW(), NOW()),
(42, 1, 50, 0, 10, 120, 5, 250, NOW(), NOW()),
(43, 1, 60, 0, 12, 150, 6, 300, NOW(), NOW()),
(44, 1, 70, 0, 14, 170, 7, 340, NOW(), NOW()),
(45, 1, 80, 0, 16, 200, 8, 400, NOW(), NOW()),
(46, 1, 90, 0, 18, 220, 9, 450, NOW(), NOW());

-- ============================================================
-- 10. PROVEEDORES Y PRODUCTOS DE PROVEEDORES
-- ============================================================
INSERT INTO suppliers (
    code, legal_name, tax_id, contact_name, email, phone, address, city, country, is_active
) VALUES
('SUP-001', 'Distribuidora Tecnológica S.A.', '900123456-7', 'Ana Martínez', 'ana@distec.com', '6012345678', 'Calle 45 # 23-12', 'Bogotá', 'Colombia', true),
('SUP-002', 'Moda Deportiva Ltda.', '901234567-8', 'Luis Pérez', 'luis@modadeportiva.com', '6023456789', 'Carrera 12 # 45-67', 'Medellín', 'Colombia', true),
('SUP-003', 'Electrodomésticos del Hogar', '902345678-9', 'María Gómez', 'maria@electrohogar.com', '6034567890', 'Avenida 8 # 34-56', 'Cali', 'Colombia', true),
('SUP-004', 'Alimentos S.A.', '903456789-0', 'Carlos Rodríguez', 'carlos@alimentos.com', '6045678901', 'Calle 67 # 89-01', 'Barranquilla', 'Colombia', true);

INSERT INTO supplier_products (
    supplier_id, product_variant_id, supplier_sku, purchase_price, lead_time_days, is_preferred
) VALUES
(1, 1, 'SUP-SGS24U-BK', 750000, 7, true),
(1, 2, 'SUP-SGS24U-WH', 750000, 7, false),
(1, 3, 'SUP-SX1VI-BK', 550000, 5, true),
(1, 5, 'SUP-SGB3P-WH', 160000, 4, true),
(2, 8, 'SUP-NCD-M', 45000, 3, true),
(2, 9, 'SUP-NCD-L', 45000, 3, false),
(2, 11, 'SUP-NCP-M', 38000, 3, true),
(3, 15, 'SUP-LGRIV', 2000000, 10, true),
(3, 16, 'SUP-WLCS', 1100000, 8, false),
(3, 17, 'SUP-LGMSI', 320000, 6, true),
(4, 21, 'SUP-CCO25', 2200, 2, true),
(4, 22, 'SUP-NAM15', 1300, 2, true),
(4, 23, 'SUP-NCF', 8000, 3, true);

-- ============================================================
-- 11. ATRIBUTOS Y OPCIONES (para filtrar productos)
-- ============================================================
INSERT INTO attributes (name, slug, is_active) VALUES
('Color', 'color', true),
('Talla', 'talla', true),
('Capacidad', 'capacidad', true),
('Tamaño de pantalla', 'tamano-pantalla', true),
('Procesador', 'procesador', true);

INSERT INTO attribute_options (attribute_id, value) VALUES
(1, 'Negro'),
(1, 'Blanco'),
(1, 'Plata'),
(1, 'Azul'),
(1, 'Rojo'),
(2, 'S'),
(2, 'M'),
(2, 'L'),
(2, 'XL'),
(2, '40'),
(2, '42'),
(2, '44'),
(3, '128GB'),
(3, '256GB'),
(3, '512GB'),
(3, '1TB'),
(4, '6.8"'),
(4, '6.5"'),
(5, 'Intel Core i9'),
(5, 'AMD Ryzen 7');

-- Asignar atributos a productos (product_attributes) y a variantes (variant_attributes)
-- Ejemplo: Samsung Galaxy S24 Ultra (product_id=1) tiene atributos: Color y Capacidad
-- Pero ya tenemos variantes con diferentes colores, así que asociamos los atributos a las variantes.

INSERT INTO variant_attributes (variant_id, attribute_id, attribute_option_id) VALUES
(1, 1, 1),  -- Negro
(1, 3, 14), -- 256GB
(2, 1, 2),  -- Blanco
(2, 3, 14), -- 256GB
(3, 1, 1),  -- Negro
(3, 3, 14), -- 256GB
(4, 1, 3),  -- Plata
(4, 3, 14), -- 256GB
(5, 1, 2),  -- Blanco
(5, 3, 13), -- 128GB? (no, en realidad Buds no tiene capacidad de almacenamiento, pero lo asignamos como ejemplo)
(6, 1, 1),  -- Negro
(8, 2, 7),  -- M
(9, 2, 8),  -- L
(10, 2, 9), -- XL
(11, 2, 7), -- M
(12, 2, 8), -- L
(13, 2, 5), -- 40 (calzado)
(14, 2, 6), -- 42
(15, 2, 7), -- M (pantalón)
(16, 2, 8), -- L
(17, 2, 5), -- 40
(18, 2, 6), -- 42
(19, 2, 7); -- 44? (pero no tenemos opción 44, la agregamos manualmente)

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================