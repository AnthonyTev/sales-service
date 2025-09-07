const express = require('express');
const { initProductTable, seedProducts } = require('./models/productModel');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

app.use('/products', productRoutes);

// Initialize DB and seed predefined products
(async () => {
  await initProductTable();
  await seedProducts();
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sales Service running on port ${PORT}`));
