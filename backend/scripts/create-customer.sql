INSERT INTO customers (
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    customer_type,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'juan@ejemplo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.x6g8kCg.oAeFvk4QoM7.m7yLqZq',
    'Juan',
    'Pérez',
    '3001234567',
    'registered',
    true,
    NOW(),
    NOW()
),
(
    'maria@ejemplo.com',
    '$2b$10$ASps5qrnwl0GwJ5pVgffYOKzyukXgffym6jONm6Ue6TvCWbfSjsDC',
    'María',
    'Gómez',
    '3007654321',
    'registered',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;