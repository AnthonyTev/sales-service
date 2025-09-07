const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM Product');
  res.json(result.rows);
});

// Add a new product manually
router.post('/', async (req, res) => {
  const { name, unit_price, qty, status } = req.body;
  const result = await pool.query(
    'INSERT INTO Product (name, unit_price, qty, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, unit_price, qty, status]
  );
  res.status(201).json(result.rows[0]);
});

module.exports = router;
