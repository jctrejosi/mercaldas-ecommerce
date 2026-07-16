docker exec -i ecommerce_postgres psql -U postgres -d ecommerce -c "
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    is_superuser,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@tienda.com',
    '$2b$10$ASps5qrnwl0GwJ5pVgffYOKzyukXgffym6jONm6Ue6TvCWbfSjsDC',
    'Admin',
    'Principal',
    '3001234567',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();
"