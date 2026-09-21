import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Function to create a new connection pool.
export const createPool = () => {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
    });
  }

  // Handle Cloud SQL Unix domain socket on Cloud Run (/cloudsql/INSTANCE_CONNECTION_NAME)
  // node-postgres expects `host` to be the DIRECTORY containing the socket, or the full path.
  let host = process.env.SQL_HOST;
  if (host && host.startsWith('/cloudsql/')) {
    // Both '/cloudsql' or the full path can be used; passing host: '/cloudsql/PROJECT:REGION:INSTANCE'
    // in node-postgres connects to '/cloudsql/PROJECT:REGION:INSTANCE/.s.PGSQL.5432'
    // Standard Cloud Run mounts sockets directly at /cloudsql/INSTANCE_CONNECTION_NAME
  }

  return new Pool({
    host: host,
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : (host?.startsWith('/') ? undefined : 5432),
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err: any) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
