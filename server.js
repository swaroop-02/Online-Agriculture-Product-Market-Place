const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// STATUS / HEALTH CHECK
// -------------------------------------------------------------
app.get('/api/status', async (req, res) => {
  res.json({
    status: 'online',
    appName: 'Online Agriculture Product MarketPlace',
    storageMode: db.getStorageMode(),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// AUTH & USERS ROUTES
// -------------------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const tables = await db.getAllDatabaseTables();
    res.json({ success: true, users: tables.users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const newUser = await db.createUser({
      name,
      email,
      phone: phone || '',
      password,
      role: role.toLowerCase()
    });

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ success: true, user: userSafe, message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// PRODUCTS ROUTES
// -------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, farmer_id } = req.query;
    const products = await db.getProducts({ category, search, farmer_id });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { farmer_id, product_name, category, price, quantity, description, image_url } = req.body;
    if (!farmer_id || !product_name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields: farmer_id, product_name, category, price, quantity.' });
    }

    const newProduct = await db.createProduct({
      farmer_id,
      product_name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      description: description || '',
      image_url: image_url || ''
    });

    res.status(201).json({ success: true, product: newProduct, message: 'Product listed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: updated, message: 'Product updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Stock quantity is required.' });
    }
    const updated = await db.updateProduct(req.params.id, { quantity: parseInt(quantity, 10) });
    res.json({ success: true, product: updated, message: 'Stock updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/products/:id/price', async (req, res) => {
  try {
    const { price } = req.body;
    if (price === undefined) {
      return res.status(400).json({ success: false, message: 'Price is required.' });
    }
    const updated = await db.updateProduct(req.params.id, { price: parseFloat(price) });
    res.json({ success: true, product: updated, message: 'Price updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// ORDERS & ORDER_ITEMS ROUTES
// -------------------------------------------------------------
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, delivery_address, items } = req.body;
    if (!customer_id || !delivery_address || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'customer_id, delivery_address, and items are required.' });
    }

    const order = await db.createOrder({ customer_id, delivery_address, items });
    res.status(201).json({ success: true, order, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { customer_id, farmer_id } = req.query;
    const orders = await db.getOrders({ customer_id, farmer_id });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    const order = await db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order, message: `Order status updated to ${status}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// DATABASE LIVE INSPECTOR (Returns all 4 tables)
// -------------------------------------------------------------
app.get('/api/database/tables', async (req, res) => {
  try {
    const tables = await db.getAllDatabaseTables();
    res.json({ success: true, ...tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Page Route Shortcuts
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/categories', (req, res) => res.sendFile(path.join(__dirname, 'public', 'categories.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
async function startServer() {
  await db.initDatabase();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 Online Agriculture Product MarketPlace`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📊 Storage Engine: ${db.getStorageMode()}`);
    console.log(`=======================================================`);
  });
}

startServer();
