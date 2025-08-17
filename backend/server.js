// backend/server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files from main folder
app.use(express.static(path.join(__dirname, "../"))); // ../ points to main project folder

// Database setup (SQLite file stored in backend folder)
const db = new sqlite3.Database(path.join(__dirname, "shop.db"), (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        category TEXT,
        image TEXT
      )
    `);

    // Create orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT,
        customerEmail TEXT,
        items TEXT,
        total REAL,
        createdAt TEXT
      )
    `);
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Get all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add a new product
app.post("/api/products", (req, res) => {
  const { name, description, price, category, image } = req.body;
  db.run(
    "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, category, image],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, description, price, category, image });
      }
    }
  );
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image } = req.body;
  db.run(
    "UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?",
    [name, description, price, category, image, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Product updated successfully!" });
      }
    }
  );
});


// Place an order
app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, items, total } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    "INSERT INTO orders (customerName, customerEmail, items, total, createdAt) VALUES (?, ?, ?, ?, ?)",
    [customerName, customerEmail, JSON.stringify(items), total, createdAt],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ orderId: this.lastID, message: "Order placed successfully!" });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
