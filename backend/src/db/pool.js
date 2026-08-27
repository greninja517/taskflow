const { Pool } = require('pg');

// A single shared connection pool. DATABASE_URL is provided via env in every
// environment (local .env, docker-compose, or CI service container).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
