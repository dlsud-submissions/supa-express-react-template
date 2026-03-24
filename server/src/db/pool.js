import pkg from 'pg';
const { Pool } = pkg;

/**
 * PostgreSQL Connection Pool.
 * - Manages reusable database connections.
 * - Dynamically switches between Main and Test databases based on environment.
 * @type {Pool}
 */
const pool = new Pool({
  // Use TEST_DATABASE_URL if Vitest is running, otherwise use standard DATABASE_URL
  connectionString:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
});

export default pool;
