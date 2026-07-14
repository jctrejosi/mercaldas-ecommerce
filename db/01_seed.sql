-- ======================================================
-- 1. LIMPIEZA Y EXTENSIONES
-- ======================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ======================================================
-- 2. TIPOS ENUM (Estados)
-- ======================================================
CREATE TYPE customer_type_enum AS ENUM ('registered', 'guest');
CREATE TYPE payment_intent_status_enum AS ENUM ('created', 'pending', 'authorized', 'failed', 'cancelled');
CREATE TYPE refund_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE inventory_movement_type_enum AS ENUM ('purchase', 'sale', 'reservation', 'release', 'adjustment', 'return', 'loss');
CREATE TYPE order_status_enum AS ENUM ('created', 'payment_pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- ======================================================
-- 3. MÓDULO 1: CONFIGURACIÓN (4 tablas)
-- ======================================================

-- 1. store
CREATE TABLE store (
    id BIGSERIAL PRIMARY KEY,
    legal_name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    theme_config JSONB DEFAULT '{}',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'COP',
    language VARCHAR(10) NOT NULL DEFAULT 'es',
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Bogota',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. branches
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    schedule JSONB, -- { "monday": "08:00-20:00", ... }
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. delivery_zones
CREATE TABLE delivery_zones (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    delivery_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    minimum_order DECIMAL(12, 2) NOT NULL DEFAULT 0,
    estimated_time_minutes INTEGER NOT NULL DEFAULT 60,
    polygon GEOGRAPHY(POLYGON, 4326), -- PostGIS, o JSONB si no usas PostGIS
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4. settings (clave-valor)
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 4. MÓDULO 2: CATÁLOGO (11 tablas)
-- ======================================================

-- 5. categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    level INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 6. brands
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT REFERENCES brands(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    sku_prefix VARCHAR(50),
    weight_grams INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 8. product_images
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. product_categories
CREATE TABLE product_categories (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 10. attributes
CREATE TABLE attributes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 11. attribute_options
CREATE TABLE attribute_options (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_attribute_options_unique ON attribute_options (attribute_id, value);

-- 12. product_attributes (Atributos del producto base)
CREATE TABLE product_attributes (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
    attribute_option_id BIGINT REFERENCES attribute_options(id) ON DELETE RESTRICT,
    custom_value VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. product_variants
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    current_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    current_compare_price DECIMAL(12, 2), -- Precio tachado
    cost_price DECIMAL(12, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 14. variant_attributes
CREATE TABLE variant_attributes (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
    attribute_option_id BIGINT NOT NULL REFERENCES attribute_options(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_variant_attributes_unique ON variant_attributes (variant_id, attribute_id);

-- 15. prices (Historial)
CREATE TABLE prices (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    cost DECIMAL(12, 2),
    price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 5. MÓDULO 3: IMPUESTOS (2 tablas)
-- ======================================================

-- 16. tax_rates
CREATE TABLE tax_rates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL, -- 19.00
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 17. product_tax_classes
CREATE TABLE product_tax_classes (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tax_rate_id BIGINT NOT NULL REFERENCES tax_rates(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, tax_rate_id)
);

-- ======================================================
-- 6. MÓDULO 4: INVENTARIO (3 tablas)
-- ======================================================

-- 18. inventory
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    maximum_stock INTEGER NOT NULL DEFAULT 999999,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_inventory_unique ON inventory (product_variant_id, branch_id);

-- 19. inventory_movements
CREATE TABLE inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    movement_type inventory_movement_type_enum NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id BIGINT, -- order_id, purchase_order_id, etc.
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. suppliers
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    legal_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50) UNIQUE,
    contact_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ======================================================
-- 7. MÓDULO 5: CLIENTES (6 tablas)
-- ======================================================

-- 21. customers
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    customer_type customer_type_enum NOT NULL DEFAULT 'registered',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_activity_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 22. customer_addresses
CREATE TABLE customer_addresses (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    alias VARCHAR(50), -- Casa, Oficina
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 23. customer_sessions
CREATE TABLE customer_sessions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    session_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. guest_sessions (CON expires_at)
CREATE TABLE guest_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. favorites
CREATE TABLE favorites (
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (customer_id, product_id)
);

-- 26. customer_tokens
CREATE TABLE customer_tokens (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    purpose VARCHAR(50) NOT NULL, -- password_reset, email_verification, magic_login
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 8. MÓDULO 6: CARRITO (2 tablas)
-- ======================================================

-- 27. carts (CON expires_at)
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    guest_session_id BIGINT REFERENCES guest_sessions(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE RESTRICT,
    delivery_zone_id BIGINT REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    coupon_code VARCHAR(50),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cart_owner_check CHECK (
        (customer_id IS NOT NULL AND guest_session_id IS NULL) OR
        (customer_id IS NULL AND guest_session_id IS NOT NULL)
    )
);

-- 28. cart_items
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL, -- Precio congelado al agregar
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 9. MÓDULO 7: PEDIDOS (9 tablas)
-- ======================================================

-- 29. orders (CON reference_code)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    reference_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE RESTRICT,
    guest_session_id BIGINT REFERENCES guest_sessions(id) ON DELETE RESTRICT,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    delivery_zone_id BIGINT REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    status order_status_enum NOT NULL DEFAULT 'created',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'COP',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    customer_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. order_items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    variant_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_net DECIMAL(12, 2) NOT NULL, -- Sin impuestos
    unit_price_gross DECIMAL(12, 2) NOT NULL, -- Con impuestos
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. delivery_time_slots
CREATE TABLE delivery_time_slots (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INTEGER DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32. shipments
CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_time_slot_id BIGINT REFERENCES delivery_time_slots(id) ON DELETE RESTRICT,
    scheduled_date DATE,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    shipping_tax_rate_id BIGINT REFERENCES tax_rates(id) ON DELETE RESTRICT,
    shipping_tax_amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, delivered
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 33. payment_intents (CON IP y User-Agent)
CREATE TABLE payment_intents (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    payment_method VARCHAR(50) NOT NULL, -- stripe, mercadopago, pse, etc.
    status payment_intent_status_enum NOT NULL DEFAULT 'created',
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    gateway_transaction_id VARCHAR(255),
    provider_response JSONB, -- Respuesta cruda de la pasarela
    customer_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 34. payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_intent_id BIGINT REFERENCES payment_intents(id) ON DELETE RESTRICT,
    gateway_transaction_id VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    payment_method VARCHAR(50) NOT NULL,
    installments INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'completed',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 35. refunds
CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    status refund_status_enum NOT NULL DEFAULT 'pending',
    gateway_refund_id VARCHAR(255),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 36. order_status_history
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_enum NOT NULL,
    note TEXT,
    created_by BIGINT, -- user_id (admin)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 37. invoices
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    xml_url TEXT,
    pdf_url TEXT,
    cufe_code VARCHAR(100), -- Facturación electrónica Colombia
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 10. MÓDULO 8: PROMOCIONES (6 tablas)
-- ======================================================

-- 38. promotions
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_auto_apply BOOLEAN NOT NULL DEFAULT false,
    requires_code BOOLEAN NOT NULL DEFAULT false,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 39. promotion_products
CREATE TABLE promotion_products (
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_value DECIMAL(12, 2) NOT NULL, -- % o monto fijo
    is_percentage BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (promotion_id, product_id)
);

-- 40. promotion_conditions (Motor único)
CREATE TABLE promotion_conditions (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- min_purchase, categories, brands, first_purchase, day_of_week
    operator VARCHAR(10) NOT NULL, -- eq, gt, lt, in, contains
    value JSONB NOT NULL, -- {"min": 50000}, {"categories": [1,2,3]}, {"days": [1,2,3,4,5]}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 41. coupons
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    max_uses_total INTEGER DEFAULT 1,
    max_uses_per_customer INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 42. coupon_redemptions
CREATE TABLE coupon_redemptions (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 11. MÓDULO 9: CMS (5 tablas)
-- ======================================================

-- 43. banners
CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100),
    image_url TEXT NOT NULL,
    link_url TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 44. pages
CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 45. menus
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(50) UNIQUE, -- header, footer, sidebar
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 46. menu_items
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES menu_items(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    link_url TEXT NOT NULL,
    target VARCHAR(20) DEFAULT '_self',
    position INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 47. footer_links
CREATE TABLE footer_links (
    id BIGSERIAL PRIMARY KEY,
    column_title VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    link_url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 12. MÓDULO 10: AUDITORÍA (2 tablas)
-- ======================================================

-- 48. audit_logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, SOFT_DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by BIGINT, -- user_id
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 49. notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- order_new, stock_low, payment_received, promotion_expired
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    target_user_id BIGINT, -- admin user id
    target_customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- ======================================================
-- 13. MÓDULO 11: INFRAESTRUCTURA (1 tabla)
-- ======================================================

-- 50. background_jobs
CREATE TABLE background_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    locked_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 14. TRIGGER: ACTUALIZACIÓN AUTOMÁTICA DE current_price
-- ======================================================

CREATE OR REPLACE FUNCTION update_variant_current_price()
RETURNS TRIGGER AS $$
DECLARE
    new_price DECIMAL(12,2);
    new_compare_price DECIMAL(12,2);
BEGIN
    -- 1. Si el nuevo precio tiene end_date NULL (es el vigente), actualizamos el current_price del variante.
    IF NEW.end_date IS NULL THEN
        -- Obtenemos el precio y compare_price del nuevo registro
        new_price := NEW.price;
        new_compare_price := NEW.compare_price;

        -- Actualizamos la variante
        UPDATE product_variants
        SET current_price = new_price,
            current_compare_price = new_compare_price,
            updated_at = NOW()
        WHERE id = NEW.product_variant_id;

        -- 2. Si este nuevo precio reemplaza a otro que estaba vigente (end_date NULL), 
        --    cerramos el anterior (le ponemos end_date = NOW() - 1 microsegundo).
        UPDATE prices
        SET end_date = (NOW() - INTERVAL '1 microsecond')
        WHERE product_variant_id = NEW.product_variant_id
          AND id != NEW.id
          AND end_date IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prices_after_insert
AFTER INSERT ON prices
FOR EACH ROW
EXECUTE FUNCTION update_variant_current_price();

-- ======================================================
-- 15. ÍNDICES CRÍTICOS (Los 5 que acordamos + soporte)
-- ======================================================

-- 1. Catálogo: ordenar por precio (filtra activos/no eliminados)
CREATE INDEX idx_product_variants_current_price ON product_variants (current_price)
WHERE is_active = true AND deleted_at IS NULL;

-- 2. Inventario: evitar duplicados (ya tiene UNIQUE) y reservas activas
CREATE INDEX idx_inventory_reserved ON inventory (branch_id, product_variant_id)
WHERE reserved_stock > 0;

-- 3. Checkout: buscar intentos de pago pendientes por carrito (ahora por order_id, ya que payment_intent tiene order_id)
--    Si quieres por cart_id, necesitas agregar cart_id a payment_intent. 
--    Sin embargo, el flujo actual crea el order antes del intent. 
--    Creamos un índice para buscar por order_id y status.
CREATE INDEX idx_payment_intents_order_status ON payment_intents (order_id, status)
WHERE status = 'pending' OR status = 'created';

-- 4. Historial de precios: trigger rápido
CREATE INDEX idx_prices_variant_dates ON prices (product_variant_id, start_date DESC)
WHERE end_date IS NULL;

-- 5. Búsqueda Full Text (GIN)
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')))
WHERE is_active = true AND deleted_at IS NULL;

-- Índices adicionales súper útiles
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_reference_code ON orders (reference_code);
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_inventory_branch_stock ON inventory (branch_id, stock) WHERE stock > 0;
CREATE INDEX idx_prices_variant_id ON prices (product_variant_id);
CREATE INDEX idx_payment_intents_gateway ON payment_intents (gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;

-- Índices para búsqueda de categorías (jerarquía)
CREATE INDEX idx_categories_parent_id ON categories (parent_id) WHERE deleted_at IS NULL;

-- Índice para sesiones expiradas (limpieza)
CREATE INDEX idx_guest_sessions_expires ON guest_sessions (expires_at) WHERE expires_at < NOW();
CREATE INDEX idx_customer_sessions_expires ON customer_sessions (expires_at) WHERE expires_at < NOW();
CREATE INDEX idx_carts_expires ON carts (expires_at) WHERE expires_at < NOW();

-- ======================================================
-- 16. COMENTARIOS (Documentación embebida)
-- ======================================================
COMMENT ON TABLE store IS 'Configuración general de la tienda. Solo existe un registro.';
COMMENT ON TABLE product_variants IS 'SKU individual. current_price mantenido por trigger desde prices.';
COMMENT ON TABLE prices IS 'Historial completo de precios. El trigger actualiza product_variants.current_price al insertar.';
COMMENT ON TABLE inventory IS 'Stock físico + reservado (reserved_stock) para control de concurrencia.';
COMMENT ON TABLE payment_intents IS 'Almacena intentos de pago (PSE, Stripe, etc.). Guarda IP y User-Agent por seguridad.';
COMMENT ON TABLE orders IS 'Pedido principal. reference_code es el número público (ej: ORD-2607-001A).';
COMMENT ON COLUMN orders.reference_code IS 'Código público del pedido. Generado por trigger o app.';
COMMENT ON COLUMN carts.expires_at IS 'Carritos abandonados se eliminan automáticamente después de esta fecha.';
COMMENT ON COLUMN guest_sessions.expires_at IS 'Sesión de invitado expira automáticamente.';

-- ======================================================
-- FIN DEL SCRIPT
-- ======================================================