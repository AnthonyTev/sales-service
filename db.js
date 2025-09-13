const { Pool } = require("pg");
require("dotenv").config();

// Read from .env
const connectionString = process.env.DATABASE_URL;

// Fail fast if missing
if (!connectionString) {
  console.error("❌ Missing DATABASE_URL in .env");
  console.error('Example: DATABASE_URL=postgres://postgres:yourpass@localhost:5432/salesdb');
  process.exit(1);
}

// Some hosts require SSL (e.g., Render/Heroku). Detect via url or env.
const needsSSL =
  /sslmode=require/i.test(connectionString) || String(process.env.PGSSLMODE).toLowerCase() === "require";

const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
