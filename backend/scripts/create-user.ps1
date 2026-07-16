docker exec -i ecommerce_postgres psql -U postgres -d ecommerce -c "
DELETE FROM users WHERE email = 'admin@tienda.com';

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
    '$2b$10$SRCAUo/P5ReI16kFZ/oL6ufYrVTOSv73JFods9TdNDlxJY3CKlvjK',
    'Admin',
    'Principal',
    '3001234567',
    true,
    true,
    NOW(),
    NOW()
);
"