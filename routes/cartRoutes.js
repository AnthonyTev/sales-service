import express from "express";

const router = express.Router();

let cart = [];

// GET /cart
router.get("/", (req, res) => {
  res.json(cart);
});

// POST /cart/add
router.post("/add", (req, res) => {
  const { productId, qty } = req.body;
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
  res.json(cart);
});

// POST /cart/checkout
router.post("/checkout", (req, res) => {
  cart = [];
  res.json({ message: "Checkout successful, cart cleared" });
});

export default router;
