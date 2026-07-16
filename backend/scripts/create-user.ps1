DELETE FROM users WHERE email = 'admin@tienda.com';

INSERT INTO users (
    email,
    username,
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
    'admin',
    '$2b$10$ASps5qrnwl0GwJ5pVgffYOKzyukXgffym6jONm6Ue6TvCWbfSjsDC',
    'Admin',
    'Principal',
    '3001234567',
    true,
    true,
    NOW(),
    NOW()
);