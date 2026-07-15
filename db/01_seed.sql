-- ======================================================
-- 1. LIMPIEZA, EXTENSIONES Y ESQUEMA
-- ======================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS postgis;  -- Para GEOGRAPHY(POINT, 4326)

-- ======================================================
-- 2. TIPOS ENUM (Estados)
-- ======================================================
CREATE TYPE customer_type_enum AS ENUM ('registered', 'guest');
CREATE TYPE payment_intent_status_enum AS ENUM ('created', 'pending', 'authorized', 'failed', 'cancelled');
CREATE TYPE refund_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE inventory_movement_type_enum AS ENUM ('purchase', 'sale', 'reservation', 'release', 'adjustment', 'return', 'loss');
CREATE TYPE order_status_enum AS ENUM ('created', 'payment_pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE reservation_status_enum AS ENUM ('active', 'expired', 'released', 'converted');

-- ======================================================
-- 3. MÓDULO 1: CONFIGURACIÓN (4 tablas)
-- ======================================================

-- 1. store
CREATE TABLE store (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    legal_name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    tax_regime VARCHAR(50) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    invoice_provider VARCHAR(50) NOT NULL,
    invoice_prefix VARCHAR(10) NOT NULL,
    supported_languages JSONB,
    supported_currencies JSONB,
    invoice_resolution VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    primary_domain VARCHAR(255) NOT NULL,
    secondary_domains JSONB,
    address TEXT NOT NULL,
    logo_media_id BIGINT,
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
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    store_id UUID NOT NULL REFERENCES store(id),
    email VARCHAR(255) NOT NULL,
    priority SMALLINT DEFAULT 1,
    manager_name VARCHAR(150) NOT NULL,
    manager_phone VARCHAR(30) NOT NULL,
    max_daily_orders INTEGER,
    branch_type VARCHAR(50) DEFAULT 'STORE',
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- Coordenadas geográficas
    delivery_radius_km DECIMAL(6,2) NOT NULL DEFAULT 5.0 CHECK (delivery_radius_km > 0),
    schedule JSONB, -- { "monday": "08:00-20:00", ... }
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. delivery_zones (Sin polígonos, basado en tarifas y condiciones)
CREATE TABLE delivery_zones (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    delivery_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    display_order SMALLINT,
    schedule JSONB,
    coverage_area GEOGRAPHY(POLYGON,4326) NOT NULL,
    estimated_min_minutes SMALLINT NOT NULL,
    estimated_max_minutes SMALLINT NOT NULL,
    delivery_type VARCHAR(30) DEFAULT 'STANDARD' NOT NULL,
    minimum_order DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (minimum_order >= 0),
    estimated_time_minutes INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4. settings
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    data_type VARCHAR(20) NOT NULL,
    is_editable BOOLEAN DEFAULT TRUE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 4. MÓDULO 2: MEDIOS (1 tabla)
-- ======================================================

-- 5. media (repositorio central)
CREATE TYPE media_status_enum AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'audio', 'document', 'other');

-- Luego la tabla
CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    status media_status_enum NOT NULL DEFAULT 'active',  -- O VARCHAR con CHECK
    media_type media_type_enum NOT NULL,                 -- O VARCHAR con CHECK
    uploaded_by BIGINT,
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    width INTEGER CHECK (width IS NULL OR width > 0),
    height INTEGER CHECK (height IS NULL OR height > 0),
    checksum VARCHAR(64) NOT NULL UNIQUE,  -- O UNIQUE(checksum) como tenías
    metadata JSONB DEFAULT '{}',
    alt_text VARCHAR(255),  -- NULL permitido
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices adicionales recomendados
CREATE INDEX idx_media_uploaded_by ON media (uploaded_by);
CREATE INDEX idx_media_media_type ON media (media_type);
CREATE INDEX idx_media_status ON media (status);

-- Ahora podemos agregar la FK de store.logo_media_id
ALTER TABLE store ADD CONSTRAINT fk_store_logo_media
    FOREIGN KEY (logo_media_id) REFERENCES media(id) ON DELETE SET NULL;

-- ======================================================
-- 5. MÓDULO 3: CATÁLOGO (11 tablas)
-- ======================================================

-- 6. categories
CREATE TABLE categories (
    UNIQUE(parent_id, name),
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. brands
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    website VARCHAR(255) NOT NULL;
    description TEXT NOT NULL;
    country VARCHAR(100) NOT NULL;
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 8. products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT REFERENCES brands(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    product_type VARCHAR(20) NOT NULL DEFAULT 'SIMPLE',
    sku_prefix VARCHAR(50),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    manufacturer VARCHAR(255),
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMP;
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 9. product_images (relación con media)
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice único parcial: solo una imagen cover por producto
CREATE UNIQUE INDEX idx_product_images_unique_cover 
ON product_images (product_id) 
WHERE is_cover = true;

-- 10. product_categories
CREATE TABLE product_categories (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 11. attributes
CREATE TABLE attributes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 12. attribute_options
CREATE TABLE attribute_options (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_attribute_options_unique ON attribute_options (attribute_id, value);

-- 13. product_attributes
CREATE TABLE product_attributes (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
    attribute_option_id BIGINT REFERENCES attribute_options(id) ON DELETE RESTRICT,
    custom_value VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. product_variants
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    current_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_compare_price DECIMAL(12,2),
    length_mm INTEGER,
    width_mm INTEGER,
    height_mm INTEGER,
    cost_price DECIMAL(12,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 15. variant_attributes
CREATE TABLE variant_attributes (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
    attribute_option_id BIGINT NOT NULL REFERENCES attribute_options(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_variant_attributes_unique ON variant_attributes (variant_id, attribute_id);

-- 16. prices (historial)
CREATE TABLE prices (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    changed_by UUID NOT NULL,
    change_reason VARCHAR(100) NOT NULL,
    cost DECIMAL(12,2) CHECK (cost IS NULL OR cost >= 0),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(12,2) CHECK (compare_price IS NULL OR compare_price >= price),
    CONSTRAINT prices_date_check CHECK (end_date IS NULL OR end_date > start_date),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ÍNDICE ÚNICO PARCIAL: Solo permite UN precio activo (end_date NULL) por variante
CREATE UNIQUE INDEX idx_prices_active_unique
ON prices (product_variant_id)
WHERE end_date IS NULL;

-- ======================================================
-- 6. MÓDULO 4: IMPUESTOS (2 tablas)
-- ======================================================

-- 17. tax_rates
CREATE TABLE tax_rates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    priority SMALLINT NOT NULL DEFAULT 1,
    compound BOOLEAN NOT NULL DEFAULT FALSE,
    valid_from DATE,
    country_code CHAR(2),
    state_code VARCHAR(20),
    city_code VARCHAR(20),
    valid_to DATE,
    rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    tax_type VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (
        valid_to IS NULL
        OR valid_to >= valid_from
    )
);
-- índices
CREATE INDEX idx_tax_rates_active ON tax_rates(is_active);
CREATE INDEX idx_tax_rates_code ON tax_rates(code);
CREATE INDEX idx_tax_rates_validity ON tax_rates(valid_from, valid_to);

-- 18. product_tax_classes
CREATE TABLE product_tax_classes (
    priority SMALLINT DEFAULT 1,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by BIGINT,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tax_rate_id BIGINT NOT NULL REFERENCES tax_rates(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, tax_rate_id)
);

-- ======================================================
-- 7. MÓDULO 5: INVENTARIO (4 tablas)
-- ======================================================

-- 19. inventory
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    CHECK (reserved_stock <= stock),
    minimum_stock INTEGER DEFAULT 0 CHECK (minimum_stock >= 0),
    maximum_stock INTEGER DEFAULT 999999 CHECK (maximum_stock >= minimum_stock),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_inventory_unique ON inventory (product_variant_id, branch_id);

-- 20. inventory_reservations (reservas activas)
CREATE TABLE inventory_reservations (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    cart_id BIGINT, -- opcional, FK a carts
    order_id BIGINT, -- opcional, FK a orders
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    status reservation_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. inventory_movements
CREATE TABLE inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    movement_type inventory_movement_type_enum NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id BIGINT, -- order_id, purchase_order_id, etc.
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. suppliers
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
-- 8. MÓDULO 6: CLIENTES (6 tablas)
-- ======================================================

-- 23. customers
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    document_number VARCHAR(50),
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

ALTER TABLE price ADD CONSTRAINT fk_customer_price_id
    FOREIGN KEY (changed_by) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE media ADD CONSTRAINT fk_media_customer_id
    FOREIGN KEY (uploaded_by) REFERENCES customers(id) ON DELETE SET NULL;


-- 24. customer_addresses (con coordenadas)
CREATE TABLE customer_addresses (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    alias VARCHAR(50),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    location GEOGRAPHY(POINT, 4326), -- Coordenadas
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 25. customer_sessions
CREATE TABLE customer_sessions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    session_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. guest_sessions (con last_activity_at)
CREATE TABLE guest_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    ip_address INET,
    user_agent TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. favorites
CREATE TABLE favorites (
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (customer_id, product_id)
);

-- 28. customer_tokens
CREATE TABLE customer_tokens (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 9. MÓDULO 7: CARRITO (2 tablas)
-- ======================================================

-- 29. carts (con last_activity_at)
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    guest_session_id BIGINT REFERENCES guest_sessions(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE RESTRICT,
    delivery_zone_id BIGINT REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    coupon_code VARCHAR(50),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cart_owner_check CHECK (
        (customer_id IS NOT NULL AND guest_session_id IS NULL) OR
        (customer_id IS NULL AND guest_session_id IS NOT NULL)
    )
);

-- 30. cart_items
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 10. MÓDULO 8: PEDIDOS (9 tablas)
-- ======================================================

-- 31. orders
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    reference_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE RESTRICT,
    guest_session_id BIGINT REFERENCES guest_sessions(id) ON DELETE RESTRICT,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    delivery_zone_id BIGINT REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    status order_status_enum NOT NULL DEFAULT 'created',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'COP',
    exchange_rate DECIMAL(12,6) DEFAULT 1.0 CHECK (exchange_rate > 0),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
    tax_total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
    shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    shipping_tax DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (shipping_tax >= 0),
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
    customer_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32. order_items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    variant_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_net DECIMAL(12,2)
    NOT NULL CHECK (unit_price_net >= 0),
    unit_price_gross DECIMAL(12,2) NOT NULL CHECK (unit_price_gross >= unit_price_net),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 33. delivery_time_slots
CREATE TABLE delivery_time_slots (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INTEGER DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 34. shipments
CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    location GEOGRAPHY(POINT, 4326), -- coordenadas de entrega
    delivery_time_slot_id BIGINT REFERENCES delivery_time_slots(id) ON DELETE RESTRICT,
    scheduled_date DATE,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    shipping_tax_rate_id BIGINT REFERENCES tax_rates(id) ON DELETE RESTRICT,
    shipping_tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (shipping_tax_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 35. payment_intents (con idempotency_key)
CREATE TABLE payment_intents (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    status payment_intent_status_enum NOT NULL DEFAULT 'created',
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    provider_transaction_id VARCHAR(255),
    provider_response JSONB,
    idempotency_key VARCHAR(100) UNIQUE,
    customer_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 36. payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_intent_id BIGINT REFERENCES payment_intents(id) ON DELETE RESTRICT,
    provider_transaction_id VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    payment_method VARCHAR(50) NOT NULL,
    installments INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'completed',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 37. refunds
CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    status refund_status_enum NOT NULL DEFAULT 'pending',
    provider_refund_id VARCHAR(255),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 38. order_status_history
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_enum NOT NULL,
    note TEXT,
    created_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 39. invoices
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    xml_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
    pdf_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
    cufe_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 11. MÓDULO 9: LOGÍSTICA (4 tablas)
-- ======================================================

-- 40. delivery_drivers
CREATE TABLE delivery_drivers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 41. delivery_driver_locations (historial de posiciones)
CREATE TABLE delivery_driver_locations (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES delivery_drivers(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_kmh DECIMAL(5,2),
    heading_degrees INTEGER,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 42. delivery_assignments
CREATE TABLE delivery_assignments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES delivery_drivers(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estimated_arrival TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'assigned' -- assigned, picked_up, in_transit, delivered, cancelled
);

-- 43. delivery_events
CREATE TABLE delivery_events (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES delivery_assignments(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 12. MÓDULO 10: PROMOCIONES (5 tablas)
-- ======================================================

-- 44. promotions
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
    deleted_at TIMESTAMPTZ,
    CONSTRAINT promotion_dates_check CHECK (end_date > start_date)
);

-- 45. promotion_products
CREATE TABLE promotion_products (
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value >= 0),
    is_percentage BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (promotion_id, product_id),
    CONSTRAINT promotion_discount_check CHECK (
        (is_percentage = TRUE AND discount_value <= 100)
        OR
        (is_percentage = FALSE))
);

-- 46. promotion_conditions
CREATE TABLE promotion_conditions (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 47. coupons
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    max_uses_total INTEGER DEFAULT 1,
    max_uses_per_customer INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 48. coupon_redemptions
CREATE TABLE coupon_redemptions (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 13. MÓDULO 11: CMS (5 tablas)
-- ======================================================

-- 49. banners
CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100),
    media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    link_url TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 50. pages
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

-- 51. menus
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(50) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 52. menu_items
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

-- 53. footer_links
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
-- 14. MÓDULO 12: AUDITORÍA (2 tablas)
-- ======================================================

-- 54. audit_logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by BIGINT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 55. notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    target_user_id BIGINT,
    target_customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- ======================================================
-- 15. MÓDULO 13: INFRAESTRUCTURA (1 tabla)
-- ======================================================

-- 56. background_jobs
CREATE TABLE background_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending',
    locked_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================================================
-- 16. TRIGGER: ACTUALIZACIÓN AUTOMÁTICA DE current_price
-- ======================================================

CREATE OR REPLACE FUNCTION update_variant_current_price()
RETURNS TRIGGER AS $$
DECLARE
    new_price DECIMAL(12,2);
    new_compare_price DECIMAL(12,2);
BEGIN
    IF NEW.end_date IS NULL THEN
        new_price := NEW.price;
        new_compare_price := NEW.compare_price;

        UPDATE product_variants
        SET current_price = new_price,
            current_compare_price = new_compare_price,
            updated_at = NOW()
        WHERE id = NEW.product_variant_id;

        -- Cerrar el precio anterior que estuviera vigente (end_date NULL)
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
-- TRIGGER GENÉRICO PARA updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica el trigger a todas las tablas que tengan columna updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%I_update_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$;

-- ======================================================
-- 17. ÍNDICES CRÍTICOS
-- ======================================================
-- Para media

CREATE INDEX idx_media_provider ON media(provider);

CREATE INDEX idx_media_mime_type ON media(mime_type);

CREATE INDEX idx_media_type ON media(media_type);

-- Para catálogo: ordenar por precio (solo activos)
CREATE INDEX idx_product_variants_current_price ON product_variants (current_price)
WHERE is_active = true AND deleted_at IS NULL;

-- Para inventario: reservas activas
CREATE INDEX idx_inventory_reserved ON inventory (branch_id, product_variant_id)
WHERE reserved_stock > 0;

-- Para pagos: búsqueda por order y estado
CREATE INDEX idx_payment_intents_order_status ON payment_intents (order_id, status)
WHERE status IN ('pending', 'created');

-- Para historial de precios: trigger rápido
CREATE INDEX idx_prices_variant_dates ON prices (product_variant_id, start_date DESC)
WHERE end_date IS NULL;

-- Búsqueda full text (GIN)
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')))
WHERE is_active = true AND deleted_at IS NULL;

-- Índices adicionales
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_reference_code ON orders (reference_code);
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_inventory_branch_stock ON inventory (branch_id, stock) WHERE stock > 0;
CREATE INDEX idx_prices_variant_id ON prices (product_variant_id);
CREATE INDEX idx_payment_intents_gateway ON payment_intents (provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

-- Índices para categorías jerárquicas
CREATE INDEX idx_categories_parent_id ON categories (parent_id) WHERE deleted_at IS NULL;

-- Índices para expiración (limpieza)
CREATE INDEX idx_guest_sessions_expires ON guest_sessions (expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_customer_sessions_expires ON customer_sessions (expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_carts_expires ON carts (expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_inventory_reservations_expires ON inventory_reservations (expires_at) WHERE status = 'active';

-- Índices geográficos (PostGIS)
CREATE INDEX idx_branches_location ON branches USING GIST (location);
CREATE INDEX idx_customer_addresses_location ON customer_addresses USING GIST (location);
CREATE INDEX idx_shipments_location ON shipments USING GIST (location);
CREATE INDEX idx_delivery_driver_locations_location ON delivery_driver_locations USING GIST (location);

-- Índices faltantes
CREATE INDEX idx_notifications_user ON notifications (customer_id, is_read);
CREATE INDEX idx_audit_logs_entity ON audit_logs (table_name, record_id);
CREATE INDEX idx_delivery_assignments_driver ON delivery_assignments (driver_id);
CREATE INDEX idx_delivery_assignments_order ON delivery_assignments (order_id);
CREATE INDEX idx_driver_locations_latest ON delivery_driver_locations (driver_id, recorded_at DESC);
CREATE INDEX idx_refunds_payment ON refunds (payment_id);
CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_order_items_variant ON order_items (product_variant_id);
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);
CREATE UNIQUE INDEX idx_customers_document ON customers (document_number) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_customers_email ON customers (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_reservations_inventory ON inventory_reservations (inventory_id, status);
CREATE INDEX idx_inventory_variant ON inventory (product_variant_id);
CREATE INDEX idx_prices_current ON prices (product_variant_id, end_date);
CREATE INDEX idx_product_categories_product ON product_categories (product_id);
CREATE INDEX idx_product_categories_category ON product_categories (category_id);
CREATE INDEX idx_products_brand ON products (brand_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_brands_slug ON brands (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_categories_slug ON categories (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_products_slug ON products (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_product_variants_sku ON product_variants (sku);
CREATE UNIQUE INDEX idx_product_variants_barcode ON product_variants (barcode) WHERE barcode IS NOT NULL;

-- ======================================================
-- 18. COMENTARIOS DE DOCUMENTACIÓN
-- ======================================================
COMMENT ON TABLE store IS 'Configuración general de la tienda.';
COMMENT ON TABLE branches IS 'Sucursales con ubicación geográfica y radio de cobertura.';
COMMENT ON TABLE delivery_zones IS 'Tarifas y condiciones de envío';
COMMENT ON TABLE media IS 'Repositorio central de archivos; todas las URLs se referencian aquí.';
COMMENT ON TABLE product_variants IS 'SKU individual con current_price mantenido por trigger.';
COMMENT ON TABLE inventory IS 'Stock y reservas por sucursal.';
COMMENT ON TABLE inventory_reservations IS 'Reservas activas con expiración para liberación automática.';
COMMENT ON TABLE inventory_movements IS 'Bitácora inmutable de movimientos de inventario.';
COMMENT ON TABLE customers IS 'Clientes registrados e invitados (customer_type).';
COMMENT ON TABLE guest_sessions IS 'Sesiones anónimas con last_activity_at.';
COMMENT ON TABLE orders IS 'Pedido principal con referencia pública (reference_code).';
COMMENT ON TABLE payment_intents IS 'Intentos de pago con idempotency_key y respuesta del proveedor.';
COMMENT ON TABLE delivery_drivers IS 'Repartidores para logística de última milla.';
COMMENT ON TABLE delivery_assignments IS 'Asignación de pedidos a repartidores.';
COMMENT ON TABLE promotions IS 'Campañas promocionales con motor único de condiciones.';
COMMENT ON TABLE background_jobs IS 'Cola de trabajos asíncronos (liberación de reservas, emails, etc.).';