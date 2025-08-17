const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Open the database
const db = new sqlite3.Database(path.join(__dirname, "shop.db"), (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  }
});

// Query all product categories
db.all("SELECT id, name, category FROM products", [], (err, rows) => {
  if (err) {
    console.error("Error fetching categories:", err.message);
  } else {
    console.log("Products and their categories:");
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Category: ${row.category}`);
    });
  }
  db.close();
});
