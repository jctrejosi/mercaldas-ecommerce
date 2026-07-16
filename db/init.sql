-- ======================================================
-- EXTENSIONES NECESARIAS PARA EL ECOMMERCE
-- ======================================================

-- 1. PostGIS: Para columnas GEOGRAPHY (ubicaciones, zonas de entrega)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. citext: Para emails case-insensitive (users, customers, drivers)
CREATE EXTENSION IF NOT EXISTS citext;

-- 3. uuid-ossp: Para generar UUIDs (sesiones, tokens, etc.)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================================
-- VERIFICACIÓN (opcional)
-- ======================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Extensiones instaladas correctamente:';
    RAISE NOTICE '   - postgis: %', (SELECT extversion FROM pg_extension WHERE extname = 'postgis');
    RAISE NOTICE '   - citext: %', (SELECT extversion FROM pg_extension WHERE extname = 'citext');
    RAISE NOTICE '   - uuid-ossp: %', (SELECT extversion FROM pg_extension WHERE extname = 'uuid-ossp');
END $$;