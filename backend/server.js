// backend/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files from main folder
app.use(express.static(path.join(__dirname, "../"))); // ../ points to main project folder

// --- MongoDB Atlas Connection ---
// Replace <username>, <password>, <cluster-url> with your MongoDB Atlas credentials
mongoose.connect(
  "mongodb+srv://masterchief316:R1LTpSPUoC1s1HZv@hwt.4jkuzpt.mongodb.net/shopDB?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

// --- Mongoose Schemas ---
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
});

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  address: String,
  items: [{ name: String, quantity: Number, price: Number }],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// --- Routes ---
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Product updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place an order
app.post("/api/orders", async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerStreet,
    customerCity,
    customerState,
    customerZip,
    items,
    total,
  } = req.body;

  if (
    !customerName ||
    !customerEmail ||
    !customerStreet ||
    !customerCity ||
    !customerState ||
    !customerZip ||
    !items ||
    !Array.isArray(items)
  ) {
    return res.status(400).json({ message: "Missing order information." });
  }

  const fullAddress = `${customerStreet}, ${customerCity}, ${customerState}, ${customerZip}`;

  try {
    const newOrder = new Order({
      customerName,
      customerEmail,
      address: fullAddress,
      items,
      total,
    });
    await newOrder.save();
    res.json({ orderId: newOrder._id, message: "Order placed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
