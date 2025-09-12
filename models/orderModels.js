const pool = require("../db");
const axios = require("axios");
require("dotenv").config();

const INVENTORY_BASE = process.env.INVENTORY_BASE || "http://localhost:5145";

/** Create tables if missing */
async function initOrderTables() {
  // users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL
    );
  `);

  // orders
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    );
  `);

  // order_items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INT NOT NULL,                       -- external InventoryService ID
      product_name VARCHAR(100) NOT NULL,            -- cached name for convenience
      unit_price NUMERIC(10,2) NOT NULL,             -- copied from InventoryService
      qty INT NOT NULL,
      total_price NUMERIC(12,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    );
  `);

  // helpful index
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);
}

/** Seed the default user once */
async function seedDefaultUser() {
  const email = "tester@gmail.com";
  const display = "Tester";
  const password = "password"; // demo only
  await pool.query(
    `INSERT INTO users (email, password, display_name)
     VALUES ($1,$2,$3)
     ON CONFLICT (email) DO NOTHING`,
    [email, password, display]
  );
}

/** Fetch a product from InventoryService by name (e.g., "pencil") */
async function fetchInventoryProductByName(name) {
  const url = `${INVENTORY_BASE}/api/inventory/byname/${encodeURIComponent(name)}`;
  const { data } = await axios.get(url);
  return data; // { id, name, price, qty, status, ... }
}

/** Create an empty order for a given user email; returns {orderId, userId} */
async function createOrderForUser(email) {
  const { rows: urows } = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
  if (urows.length === 0) throw new Error("User not found");
  const userId = urows[0].id;
  const { rows: orows } = await pool.query(
    `INSERT INTO orders (user_id) VALUES ($1) RETURNING id`,
    [userId]
  );
  return { orderId: orows[0].id, userId };
}

/** Add one item to an order, pulling price/status from InventoryService product */
async function addOrderItemFromInventory(orderId, productName, qty) {
  const p = await fetchInventoryProductByName(productName); // throws 404 if not found
  const unitPrice = Number(p.price);
  const total = unitPrice * qty;

  const { rows } = await pool.query(
    `INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty, total_price, status)
     VALUES ($1,$2,$3,$4,$5,$6,'Pending')
     RETURNING *`,
    [orderId, p.id, p.name, unitPrice, qty, total]
  );

  // update order total
  await pool.query(
    `UPDATE orders SET total_price = COALESCE(total_price,0) + $1 WHERE id = $2`,
    [total, orderId]
  );

  return rows[0];
}

/** Confirm an order: mark as Completed and decrement stock in InventoryService atomically */
async function confirmOrder(orderId) {
  // transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // get items
    const { rows: items } = await client.query(
      `SELECT product_id, qty FROM order_items WHERE order_id = $1`, [orderId]
    );

    // mark items and order as completed
    await client.query(
      `UPDATE order_items SET status='Completed' WHERE order_id=$1`,
      [orderId]
    );
    await client.query(
      `UPDATE orders SET status='Completed' WHERE id=$1`,
      [orderId]
    );

    await client.query("COMMIT");

    // decrement stock in InventoryService (after DB commit)
    for (const it of items) {
      const url = `${INVENTORY_BASE}/api/inventory/${it.product_id}/adjust-qty?delta=${-it.qty}`;
      console.log("Adjusting inventory via:", url);

      try {
        const resp = await axios.patch(url);
        console.log("Inventory response:", resp.status, resp.data);
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data || err.message;
        console.error("Inventory adjust failed:", status, data);

        // Optional: revert order state if decrement failed
        await pool.query(`UPDATE orders SET status='Pending' WHERE id=$1`, [orderId]);
        await pool.query(`UPDATE order_items SET status='Pending' WHERE order_id=$1`, [orderId]);

        throw new Error(`Inventory adjust failed (HTTP ${status})`);
      }
    }


    return { ok: true, updated: items.length };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  initOrderTables,
  seedDefaultUser,
  createOrderForUser,
  addOrderItemFromInventory,
  confirmOrder,
};
