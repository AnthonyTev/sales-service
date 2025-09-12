const express = require('express');
const { initProductsTable, seedProducts } = require('./models/productModel');
const {
  initOrderTables,
  seedDefaultUser,
} = require('./models/orderModels');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json());

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

(async () => {
  await initProductsTable();
  await seedProducts();
  await initOrderTables();
  await seedDefaultUser();
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sales Service running on port ${PORT}`));
