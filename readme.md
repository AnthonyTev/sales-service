9/13/2025 
- I installed axios, dependency used for contact with InventoryService

npm install axios
npm install express pg dotenv

- Added the InventoryService hosting port to .env
DATABASE_URL=postgres://postgres:password@localhost:5432/salesdb
INVENTORY_BASE=http://localhost:5145

CURRENT PROCEDURE:
1. Run InventoryService
- dotnet run
2. Run sales-service
- node index.js
3. Check if items are ready and in stock
- GET http://localhost:5145/api/inventory
4. Create the sample order
- POST http://localhost:3000/orders/sample
5. Confirm the sample order
- POST http://localhost:3000/orders/<orderId>/confirm