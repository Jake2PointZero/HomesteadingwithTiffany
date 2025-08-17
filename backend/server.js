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
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    createdAt TEXT NOT NULL,
    address TEXT NOT NULL
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

// Get all orders
app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY createdAt DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
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

  const createdAt = new Date().toISOString();

  const fullAddress = `${customerStreet}, ${customerCity}, ${customerState}, ${customerZip}`;

  db.run(
    "INSERT INTO orders (customerName, customerEmail, items, total, createdAt, address) VALUES (?, ?, ?, ?, ?, ?)",
    [customerName, customerEmail, JSON.stringify(items), total, createdAt, fullAddress],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orderId: this.lastID, message: "Order placed successfully!" });
    }
  );
});




// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
