const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to a JSON file to store orders
const ordersFile = path.join(__dirname, 'orders.json');

// Helper to read/write orders
function getOrders() {
  if (!fs.existsSync(ordersFile)) return [];
  const data = fs.readFileSync(ordersFile, 'utf-8');
  return JSON.parse(data);
}

function saveOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// POST /api/orders
router.post('/', (req, res) => {
  const { name, email, address, cart } = req.body;

  if (!name || !email || !address || !cart || cart.length === 0) {
    return res.status(400).json({ message: 'Missing order information.' });
  }

  const orders = getOrders();

  const newOrder = {
    id: orders.length + 1,
    name,
    email,
    address,
    cart,
    date: new Date().toISOString(),
  };

  orders.push(newOrder);
  saveOrders(orders);

  return res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.id });
});

module.exports = router;