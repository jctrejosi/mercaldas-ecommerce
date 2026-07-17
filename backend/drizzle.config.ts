import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrate',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ['!spatial_ref_sys', '!geography_columns', '!geometry_columns'],
  verbose: true,
  strict: true,
});
