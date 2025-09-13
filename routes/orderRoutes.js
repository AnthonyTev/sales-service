const express = require("express");
const {
  createOrderForUser,
  addOrderItemFromInventory,
  confirmOrder,
} = require("../models/orderModels");
const router = express.Router();

/** POST /orders/sample  → create sample order for Tester with one "pencil" qty=1 */
router.post("/sample", async (req, res) => {
  try {
    const { orderId } = await createOrderForUser("tester@gmail.com");
    const item = await addOrderItemFromInventory(orderId, "pencil", 1);
    res.status(201).json({ orderId, item });
  } catch (err) {
    console.error("POST /orders/sample", err.message);
    res.status(500).json({ error: err.message });
  }
});

/** POST /orders  { email, items:[{ name, qty }] }  */
router.post("/", async (req, res) => {
  try {
    const { email, items } = req.body;
    if (!email || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "email and items[] are required" });

    const { orderId } = await createOrderForUser(email);
    const added = [];
    for (const it of items) {
      const row = await addOrderItemFromInventory(orderId, it.name, it.qty || 1);
      added.push(row);
    }
    res.status(201).json({ orderId, items: added });
  } catch (err) {
    console.error("POST /orders", err.message);
    res.status(500).json({ error: err.message });
  }
});

/** POST /orders/:id/confirm → completes order and decrements InventoryService stock */
router.post("/:id/confirm", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const out = await confirmOrder(orderId);
    res.json(out);
  } catch (err) {
    console.error("POST /orders/:id/confirm", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const axios = require("axios");
const INVENTORY_BASE = process.env.INVENTORY_BASE || "http://localhost:5145";

router.post("/debug/adjust/:productId/:delta", async (req, res) => {
  try {
    const { productId, delta } = req.params;
    const url = `${INVENTORY_BASE}/api/inventory/${productId}/adjust-qty?delta=${delta}`;
    const r = await axios.patch(url);
    res.json({ called: url, status: r.status, data: r.data });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
  }
});
