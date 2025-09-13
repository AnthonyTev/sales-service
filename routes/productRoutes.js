const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /products
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("GET /products failed:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /products
router.post("/", async (req, res) => {
  try {
    const { name, unit_price, qty, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (name, unit_price, qty, status)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (name) DO NOTHING
       RETURNING *`,
      [name, unit_price, qty, status]
    );
    if (rows.length === 0) {
      return res.status(409).json({ error: "Product already exists" });
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /products failed:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

module.exports = productRoutes;
