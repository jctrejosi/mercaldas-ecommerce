-- ============================================================
-- INSERCIÓN DE DATOS DE EJEMPLO (SIN POSTGIS)
-- ============================================================

-- 0. DATOS BASE: STORE Y USUARIO ADMIN
INSERT INTO store (
    id, status, legal_name, trade_name, tax_id, tax_regime, business_name,
    invoice_provider, invoice_prefix, supported_languages, supported_currencies,
    email, phone, primary_domain, address, currency_code, language, timezone
) VALUES (
    1, 'ACTIVE', 'Mi Tienda S.A.S.', 'Mi Tienda', '900123456-7', 'RESPONSABLE_IVA',
    'Mi Tienda S.A.S.', 'LOCAL', 'FAC-', '["es"]', '["COP"]',
    'contacto@mitienda.com', '6012345678', 'mitienda.com', 'Calle Principal #123',
    'COP', 'es', 'America/Bogota'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id, email, username, password_hash, first_name, last_name, is_superuser, is_active
) VALUES (
    1, 'admin@mitienda.com', 'admin', '$2a$10$H7zPZq7Y5Z9Z8Z7Z6Z5Z4O', 'Admin', 'Principal', true, true
) ON CONFLICT (id) DO NOTHING;

-- 1. SUCURSAL PRINCIPAL
INSERT INTO branches (
    code, name, address, city, phone, store_id, email, manager_name, manager_phone,
    location, delivery_radius_km, schedule, is_active
) VALUES (
    'SUC-001',
    'Sucursal Principal',
    'Calle 123 # 45-67, Centro',
    'Manizales',
    '6012345678',
    1,
    'sucursal@mitienda.com',
    'Carlos Gómez',
    '3001234567',
    'POINT(-75.5197 5.0646)',  -- Ahora es texto
    10.0,
    '{"monday":"08:00-20:00","tuesday":"08:00-20:00","wednesday":"08:00-20:00","thursday":"08:00-20:00","friday":"08:00-20:00","saturday":"08:00-18:00","sunday":"10:00-16:00"}',
    true
) ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. CATEGORÍAS (jerárquicas)
-- ============================================================
INSERT INTO categories (name, slug, description, level, is_active) VALUES
('Electrónicos', 'electronicos', 'Productos tecnológicos y gadgets', 0, true),
('Ropa', 'ropa', 'Prendas de vestir para toda la familia', 0, true),
('Hogar', 'hogar', 'Artículos para el hogar y decoración', 0, true),
('Deportes', 'deportes', 'Equipamiento y ropa deportiva', 0, true),
('Alimentos', 'alimentos', 'Comestibles y bebidas', 0, true)
ON CONFLICT (slug) DO NOTHING;

-- Subcategorías (usamos DO NOTHING para evitar duplicados)
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
(5, 'Comida envasada', 'comida-envasada', 'Enlatados, granos, pastas', 1, true)
ON CONFLICT (slug) DO NOTHING;

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
('Coca-Cola', 'coca-cola', 'https://www.coca-cola.com', 'Bebidas refrescantes', 'EE. UU.', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
INSERT INTO products (
    brand_id, name, slug, description, product_type, sku_prefix, featured, manufacturer, visibility, is_active, published_at
) VALUES
(2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Teléfono inteligente de última generación con pantalla AMOLED 6.8"', 'SIMPLE', 'SGS24U', true, 'Samsung Electronics', 'PUBLIC', true, NOW()),
(1, 'Sony Xperia 1 VI', 'sony-xperia-1-vi', 'Smartphone con cámara profesional y pantalla 4K HDR', 'SIMPLE', 'SX1VI', false, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung Galaxy Buds3 Pro', 'samsung-galaxy-buds3-pro', 'Audífonos inalámbricos con cancelación de ruido', 'SIMPLE', 'SGB3P', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
(1, 'Sony VAIO Z', 'sony-vaio-z', 'Laptop ultraligera con pantalla OLED 4K', 'SIMPLE', 'SVZ', true, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung Galaxy Book4 Ultra', 'samsung-galaxy-book4-ultra', 'Laptop de alto rendimiento con Intel Core Ultra 9', 'SIMPLE', 'SGB4U', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
(1, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Audífonos over-ear con cancelación de ruido líder en la industria', 'SIMPLE', 'SWX5', true, 'Sony Corporation', 'PUBLIC', true, NOW()),
(2, 'Samsung HW-Q990D', 'samsung-hw-q990d', 'Barra de sonido con sonido envolvente 11.1.4', 'SIMPLE', 'SHWQ', false, 'Samsung Electronics', 'PUBLIC', true, NOW()),
(3, 'Nike Camisa Deportiva Dri-FIT', 'nike-camisa-deportiva-dri-fit', 'Camisa de entrenamiento con tecnología que absorbe el sudor', 'SIMPLE', 'NCD', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Camisa ClimaCool', 'adidas-camisa-climacool', 'Camisa con ventilación para máximo confort', 'SIMPLE', 'ACC', false, 'Adidas AG', 'PUBLIC', true, NOW()),
(3, 'Nike Camisa Polo', 'nike-camisa-polo', 'Camisa polo clásica con logo de Nike', 'SIMPLE', 'NCP', false, 'Nike Inc.', 'PUBLIC', true, NOW()),
(3, 'Nike Joggers Fleece', 'nike-joggers-fleece', 'Pantalones deportivos de felpa', 'SIMPLE', 'NJF', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Pantalón Tiro', 'adidas-pantalon-tiro', 'Pantalón de entrenamiento con corte clásico', 'SIMPLE', 'APT', false, 'Adidas AG', 'PUBLIC', true, NOW()),
(3, 'Nike Air Max 2024', 'nike-air-max-2024', 'Zapatillas con amortiguación Air Max', 'SIMPLE', 'NAM24', true, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Ultraboost Light', 'adidas-ultraboost-light', 'Zapatillas con la mejor amortiguación y ligereza', 'SIMPLE', 'AUL', false, 'Adidas AG', 'PUBLIC', true, NOW()),
(5, 'LG Refrigerador InstaView', 'lg-refrigerador-instaview', 'Refrigerador con puerta InstaView y dispensador de agua', 'SIMPLE', 'LGRIV', true, 'LG Electronics', 'PUBLIC', true, NOW()),
(6, 'Whirlpool Lavadora Carga Superior', 'whirlpool-lavadora-carga-superior', 'Lavadora con tecnología 6th Sense', 'SIMPLE', 'WLCS', false, 'Whirlpool Corp.', 'PUBLIC', true, NOW()),
(5, 'LG Microondas Smart Inverter', 'lg-microondas-smart-inverter', 'Microondas con cocción precisa', 'SIMPLE', 'LGMSI', false, 'LG Electronics', 'PUBLIC', true, NOW()),
(7, 'Nestlé Cafetera Dolce Gusto', 'nestle-cafetera-dolce-gusto', 'Cafetera de cápsulas con sistema de espuma', 'SIMPLE', 'NCDG', false, 'Nestlé', 'PUBLIC', true, NOW()),
(3, 'Nike Cuerda para Saltar', 'nike-cuerda-para-saltar', 'Cuerda de entrenamiento profesional', 'SIMPLE', 'NCS', false, 'Nike Inc.', 'PUBLIC', true, NOW()),
(4, 'Adidas Balón de Fútbol', 'adidas-balon-de-futbol', 'Balón oficial de la UEFA', 'SIMPLE', 'ABF', false, 'Adidas AG', 'PUBLIC', true, NOW()),
(8, 'Coca-Cola Original 2.5L', 'coca-cola-original-25l', 'Refresco de cola en presentación familiar', 'SIMPLE', 'CCO25', true, 'Coca-Cola Company', 'PUBLIC', true, NOW()),
(7, 'Nestlé Agua Mineral 1.5L', 'nestle-agua-mineral-15l', 'Agua mineral natural', 'SIMPLE', 'NAM15', false, 'Nestlé', 'PUBLIC', true, NOW()),
(7, 'Nestlé Cereal Fitness', 'nestle-cereal-fitness', 'Cereal de granola con frutas', 'SIMPLE', 'NCF', false, 'Nestlé', 'PUBLIC', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. VARIANTES DE PRODUCTOS
-- ============================================================
INSERT INTO product_variants (
    product_id, sku, barcode, current_price, current_compare_price, cost_price, is_active
) VALUES
(1, 'SGS24U-BK-256', '8806090543887', 1299900, 1499900, 800000, true),
(1, 'SGS24U-WH-256', '8806090543894', 1299900, 1499900, 800000, true),
(2, 'SX1VI-BK-256', '4905524972345', 899900, 999900, 600000, true),
(2, 'SX1VI-SL-256', '4905524972352', 899900, 999900, 600000, true),
(3, 'SGB3P-WH', '8806090543900', 289900, 329900, 180000, true),
(3, 'SGB3P-BK', '8806090543917', 289900, 329900, 180000, true),
(4, 'SVZ-BK-1TB', '4905524972369', 2499900, 2799900, 1600000, true),
(5, 'SGB4U-SL-1TB', '8806090543924', 2899900, 3199900, 1800000, true),
(6, 'SWX5-BK', '4905524972376', 399900, 449900, 250000, true),
(6, 'SWX5-SL', '4905524972383', 399900, 449900, 250000, true),
(7, 'SHWQ-BK', '8806090543931', 1299900, 1499900, 800000, true),
(8, 'NCD-M', '1234567890123', 89900, 109900, 50000, true),
(8, 'NCD-L', '1234567890130', 89900, 109900, 50000, true),
(8, 'NCD-XL', '1234567890147', 89900, 109900, 50000, true),
(9, 'ACC-M', '9876543210987', 79900, 99900, 45000, true),
(9, 'ACC-L', '9876543210994', 79900, 99900, 45000, true),
(10, 'NCP-M', '1234567890154', 69900, 89900, 40000, true),
(10, 'NCP-L', '1234567890161', 69900, 89900, 40000, true),
(11, 'NJF-S', '1234567890178', 119900, 149900, 70000, true),
(11, 'NJF-M', '1234567890185', 119900, 149900, 70000, true),
(11, 'NJF-L', '1234567890192', 119900, 149900, 70000, true),
(12, 'APT-M', '9876543211007', 99900, 129900, 60000, true),
(12, 'APT-L', '9876543211014', 99900, 129900, 60000, true),
(13, 'NAM24-40', '1234567890208', 199900, 249900, 120000, true),
(13, 'NAM24-42', '1234567890215', 199900, 249900, 120000, true),
(13, 'NAM24-44', '1234567890222', 199900, 249900, 120000, true),
(14, 'AUL-40', '9876543211021', 229900, 279900, 140000, true),
(14, 'AUL-42', '9876543211038', 229900, 279900, 140000, true),
(15, 'LGRIV-550', '8806090543948', 3499900, 3999900, 2200000, true),
(16, 'WLCS-18', '8806090543955', 1899900, 2199900, 1200000, true),
(17, 'LGMSI-25', '8806090543962', 599900, 699900, 350000, true),
(18, 'NCDG-100', '8806090543979', 399900, 499900, 250000, true),
(19, 'NCS-01', '1234567890239', 39900, 49900, 20000, true),
(20, 'ABF-5', '9876543211045', 89900, 109900, 50000, true),
(21, 'CCO25-1', '7501078133456', 4900, 5900, 2500, true),
(22, 'NAM15-1', '7501078133463', 2900, 3900, 1500, true),
(23, 'NCF-500', '7501078133470', 15900, 19900, 9000, true)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- 6. PRECIOS HISTÓRICOS (para algunas variantes)
-- ============================================================
INSERT INTO prices (
    product_variant_id, start_date, end_date, changed_by, change_reason, cost, price, compare_price, version
) VALUES
(1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', 1, 'Ajuste de precio', 800000, 1499900, 1699900, 1),
(1, NOW(), NULL, 1, 'Precio actual', 800000, 1299900, 1499900, 2),
(8, NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day', 1, 'Oferta especial', 50000, 109900, 129900, 1),
(8, NOW(), NULL, 1, 'Precio actual', 50000, 89900, 109900, 2),
(14, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', 1, 'Promoción', 140000, 279900, 299900, 1),
(14, NOW(), NULL, 1, 'Precio actual', 140000, 229900, 279900, 2);

-- ============================================================
-- 7. IMÁGENES (MEDIA) Y RELACIONES PRODUCTO-IMAGEN
-- ============================================================
-- Insertar registros en media con imágenes dummy
INSERT INTO media (
    status, media_type, uploaded_by, provider, path, file_name, mime_type, size_bytes, width, height, checksum, alt_text, is_public
) VALUES
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Samsung+Galaxy+S24+Ultra', 's24u-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_s24u', 'Samsung Galaxy S24 Ultra', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=S24+Ultra+2', 's24u-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_s24u_2', 'Samsung Galaxy S24 Ultra - vista trasera', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/2c3e50/fff&text=S24+Ultra+3', 's24u-3.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_s24u_3', 'Samsung Galaxy S24 Ultra - pantalla', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+Xperia+1+VI', 'xperia-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_xperia', 'Sony Xperia 1 VI', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=Xperia+VI+2', 'xperia-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_xperia_2', 'Sony Xperia 1 VI - cámara', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Galaxy+Buds3+Pro', 'buds-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_buds', 'Samsung Galaxy Buds3 Pro', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+VAIO+Z', 'vaio-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_vaio', 'Sony VAIO Z', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Galaxy+Book4+Ultra', 'book4-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_book4', 'Samsung Galaxy Book4 Ultra', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Sony+WH-1000XM5', 'xm5-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_xm5', 'Sony WH-1000XM5', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Samsung+Q990D', 'q990d-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_q990d', 'Samsung HW-Q990D', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Dri-FIT', 'nike-dri-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_dri', 'Nike Camisa Dri-FIT', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/1a1a2e/fff&text=Nike+Dri-FIT+2', 'nike-dri-2.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_nike_dri_2', 'Nike Camisa Dri-FIT - espalda', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+ClimaCool', 'adidas-clima-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_clima', 'Adidas Camisa ClimaCool', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Polo', 'nike-polo-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_polo', 'Nike Camisa Polo', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Joggers', 'nike-jog-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_jog', 'Nike Joggers Fleece', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Tiro', 'adidas-tiro-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_tiro', 'Adidas Pantalón Tiro', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Air+Max+2024', 'airmax-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_airmax', 'Nike Air Max 2024', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Ultraboost', 'ultraboost-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_ultraboost', 'Adidas Ultraboost Light', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=LG+InstaView', 'lg-fridge-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_lg_fridge', 'LG Refrigerador InstaView', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Whirlpool+Lavadora', 'whirlpool-washer-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_whirlpool_washer', 'Whirlpool Lavadora Carga Superior', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=LG+Microondas', 'lg-microwave-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_lg_microwave', 'LG Microondas Smart Inverter', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Dolce+Gusto', 'nestle-coffee-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_coffee', 'Nestlé Cafetera Dolce Gusto', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nike+Cuerda', 'nike-rope-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nike_rope', 'Nike Cuerda para Saltar', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Adidas+Balon', 'adidas-ball-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_adidas_ball', 'Adidas Balón de Fútbol', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Coca-Cola+2.5L', 'coca-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_coca', 'Coca-Cola Original 2.5L', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Agua', 'nestle-water-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_water', 'Nestlé Agua Mineral 1.5L', true),
('active', 'image', 1, 'local', 'https://dummyimage.com/600x400/000/fff&text=Nestle+Cereal', 'nestle-cereal-cover.jpg', 'image/jpeg', 102400, 600, 400, 'dummy_cover_nestle_cereal', 'Nestlé Cereal Fitness', true)
ON CONFLICT (checksum) DO NOTHING;

-- Asociar imágenes a productos (product_images)
INSERT INTO product_images (product_id, media_id, is_cover, position)
SELECT 
    p.id,
    m.id,
    CASE 
        WHEN m.checksum LIKE '%cover%' THEN true 
        ELSE false 
    END,
    0
FROM products p
JOIN media m ON m.alt_text LIKE '%' || p.name || '%'
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 8. PRODUCTOS-CATEGORÍAS - VERSIÓN SIMPLIFICADA
-- ============================================================

-- Electrónicos -> subcategorías
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE 
    (c.slug = 'celulares' AND p.slug IN ('samsung-galaxy-s24-ultra', 'sony-xperia-1-vi')) OR
    (c.slug = 'audio' AND p.slug IN ('samsung-galaxy-buds3-pro', 'sony-wh-1000xm5', 'samsung-hw-q990d')) OR
    (c.slug = 'computadoras' AND p.slug IN ('sony-vaio-z', 'samsung-galaxy-book4-ultra')) OR
    (c.slug = 'camisas' AND p.slug IN ('nike-camisa-deportiva-dri-fit', 'adidas-camisa-climacool', 'nike-camisa-polo')) OR
    (c.slug = 'pantalones' AND p.slug IN ('nike-joggers-fleece', 'adidas-pantalon-tiro')) OR
    (c.slug = 'zapatos' AND p.slug IN ('nike-air-max-2024', 'adidas-ultraboost-light')) OR
    (c.slug = 'cocina' AND p.slug IN ('lg-refrigerador-instaview', 'whirlpool-lavadora-carga-superior', 'lg-microondas-smart-inverter')) OR
    (c.slug = 'decoracion' AND p.slug = 'nestle-cafetera-dolce-gusto') OR
    (c.slug = 'fitness' AND p.slug = 'nike-cuerda-para-saltar') OR
    (c.slug = 'deportes-equipo' AND p.slug = 'adidas-balon-de-futbol') OR
    (c.slug = 'bebidas' AND p.slug = 'coca-cola-original-25l') OR
    (c.slug = 'comida-envasada' AND p.slug IN ('nestle-agua-mineral-15l', 'nestle-cereal-fitness'))
ON CONFLICT DO NOTHING;

-- Categorías principales
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN categories c
WHERE 
    (c.slug = 'electronicos' AND p.slug LIKE '%samsung%' OR p.slug LIKE '%sony%') OR
    (c.slug = 'ropa' AND p.slug LIKE '%nike%' OR p.slug LIKE '%adidas%') OR
    (c.slug = 'hogar' AND p.slug LIKE '%refrigerador%' OR p.slug LIKE '%lavadora%' OR p.slug LIKE '%microondas%' OR p.slug LIKE '%cafetera%') OR
    (c.slug = 'deportes' AND p.slug LIKE '%cuerda%' OR p.slug LIKE '%balon%') OR
    (c.slug = 'alimentos' AND p.slug LIKE '%coca-cola%' OR p.slug LIKE '%agua%' OR p.slug LIKE '%cereal%')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. INVENTARIO (stock en sucursal 1)
-- ============================================================
INSERT INTO inventory (
    product_variant_id, branch_id, stock, reserved_stock, reorder_point, target_stock,
    minimum_stock, maximum_stock
)
SELECT 
    pv.id,
    1,
    FLOOR(RANDOM() * 50 + 10)::int,
    0,
    FLOOR(RANDOM() * 10 + 2)::int,
    FLOOR(RANDOM() * 100 + 20)::int,
    FLOOR(RANDOM() * 5 + 1)::int,
    FLOOR(RANDOM() * 200 + 50)::int
FROM product_variants pv
WHERE NOT EXISTS (
    SELECT 1 FROM inventory i WHERE i.product_variant_id = pv.id AND i.branch_id = 1
);

-- ============================================================
-- 10. PROVEEDORES
-- ============================================================
INSERT INTO suppliers (
    code, legal_name, tax_id, contact_name, email, phone, address, city, country, is_active
) VALUES
('SUP-001', 'Distribuidora Tecnológica S.A.', '900123456-7', 'Ana Martínez', 'ana@distec.com', '6012345678', 'Calle 45 # 23-12', 'Bogotá', 'Colombia', true),
('SUP-002', 'Moda Deportiva Ltda.', '901234567-8', 'Luis Pérez', 'luis@modadeportiva.com', '6023456789', 'Carrera 12 # 45-67', 'Medellín', 'Colombia', true),
('SUP-003', 'Electrodomésticos del Hogar', '902345678-9', 'María Gómez', 'maria@electrohogar.com', '6034567890', 'Avenida 8 # 34-56', 'Cali', 'Colombia', true),
('SUP-004', 'Alimentos S.A.', '903456789-0', 'Carlos Rodríguez', 'carlos@alimentos.com', '6045678901', 'Calle 67 # 89-01', 'Barranquilla', 'Colombia', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 11. ATRIBUTOS Y OPCIONES
-- ============================================================
INSERT INTO attributes (name, slug, is_active) VALUES
('Color', 'color', true),
('Talla', 'talla', true),
('Capacidad', 'capacidad', true),
('Tamaño de pantalla', 'tamano-pantalla', true),
('Procesador', 'procesador', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO attribute_options (attribute_id, value)
SELECT a.id, v.value
FROM attributes a
JOIN (VALUES 
    (1, 'Negro'), (1, 'Blanco'), (1, 'Plata'), (1, 'Azul'), (1, 'Rojo'),
    (2, 'S'), (2, 'M'), (2, 'L'), (2, 'XL'), (2, '40'), (2, '42'), (2, '44'),
    (3, '128GB'), (3, '256GB'), (3, '512GB'), (3, '1TB'),
    (4, '6.8"'), (4, '6.5"'),
    (5, 'Intel Core i9'), (5, 'AMD Ryzen 7')
) AS v(attr_id, value)
WHERE a.id = v.attr_id
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. RELACIONES VARIANTE-ATRIBUTO
-- ============================================================
INSERT INTO variant_attributes (variant_id, attribute_id, attribute_option_id)
SELECT 
    pv.id,
    a.id,
    ao.id
FROM product_variants pv
CROSS JOIN LATERAL (
    VALUES 
        (1, 'Negro', '256GB'),
        (2, 'Blanco', '256GB'),
        (3, 'Negro', '256GB'),
        (4, 'Plata', '256GB'),
        (5, 'Blanco', '128GB'),
        (6, 'Negro', '128GB'),
        (8, 'M', NULL),
        (9, 'L', NULL),
        (10, 'XL', NULL),
        (11, 'M', NULL),
        (12, 'L', NULL),
        (13, '40', NULL),
        (14, '42', NULL),
        (15, 'M', NULL),
        (16, 'L', NULL),
        (17, '40', NULL),
        (18, '42', NULL),
        (19, '44', NULL)
) AS v(variant_sku, color, capacity)
JOIN attributes a ON (v.color IS NOT NULL AND a.slug = 'color') OR (v.capacity IS NOT NULL AND a.slug = 'capacidad')
JOIN attribute_options ao ON ao.attribute_id = a.id AND (ao.value = COALESCE(v.color, v.capacity))
WHERE pv.sku LIKE '%' || v.variant_sku || '%'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================