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