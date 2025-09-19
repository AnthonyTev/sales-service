// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/auth", authRoutes);

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Sales Service running on http://localhost:${PORT}`)
);
