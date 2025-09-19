import express from "express";

const router = express.Router();

let products = [
  { id: 1, name: "Notebook", unitPrice: 50, qty: 100, status: "available" },
  { id: 2, name: "Ballpen", unitPrice: 10, qty: 200, status: "available" },
  { id: 3, name: "Eraser", unitPrice: 5, qty: 150, status: "available" }
];

// GET /products
router.get("/", (req, res) => {
  res.json(products);
});

// POST /products
router.post("/", (req, res) => {
  const { name, unitPrice, qty, status } = req.body;
  const id = products.length + 1;
  const newProduct = { id, name, unitPrice, qty, status };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

export default router;
