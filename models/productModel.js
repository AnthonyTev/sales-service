const pool = require("../db");

async function initProductsTable() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            unit_price NUMERIC(10, 2) NOT NULL,
            qty INT NOT NULL,
            status VARCHAR(20) NOT NULL
        )
    `);
}

async function seedProducts() {
  const products = [
    { name: "Notebook", unit_price: 50, qty: 100, status: "Available" },
    { name: "Ballpen", unit_price: 10, qty: 200, status: "Available" },
    { name: "Eraser", unit_price: 5, qty: 150, status: "Available" },
  ];

  for (const p of products) {
    await pool.query(
      "INSERT INTO products (name, unit_price, qty, status) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING",
      [p.name, p.unit_price, p.qty, p.status]
    );
  }
}

module.exports = { initProductsTable, seedProducts };
