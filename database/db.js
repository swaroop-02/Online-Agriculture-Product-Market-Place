const mysql = require('mysql2/promise');
require('dotenv').config();

// Default seed records for fallback mode
const initialData = {
  users: [
    { user_id: 1, name: 'Kisan Patel', email: 'kisan.patel@agrimarket.com', phone: '+91 9876543210', password: 'farmer123', role: 'farmer' },
    { user_id: 2, name: 'Anita Sharma', email: 'anita.sharma@agrimarket.com', phone: '+91 9876543211', password: 'farmer123', role: 'farmer' },
    { user_id: 3, name: 'Rajesh Verma', email: 'rajesh.verma@agrimarket.com', phone: '+91 9876543212', password: 'farmer123', role: 'farmer' },
    { user_id: 4, name: 'Ramesh Kumar', email: 'ramesh.kumar@gmail.com', phone: '+91 9123456780', password: 'customer123', role: 'customer' },
    { user_id: 5, name: 'Priya Reddy', email: 'priya.reddy@gmail.com', phone: '+91 9123456781', password: 'customer123', role: 'customer' },
    { user_id: 6, name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '+91 9123456782', password: 'customer123', role: 'customer' }
  ],
  products: [
    { product_id: 1, farmer_id: 1, product_name: 'Organic Vine Tomatoes', category: 'Vegetables', price: 45.00, quantity: 150, description: 'Freshly harvested, pesticide-free, vine-ripened organic red tomatoes with rich flavor and juicy texture.', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { product_id: 2, farmer_id: 1, product_name: 'Golden Sharbati Wheat Grain', category: 'Grains & Cereals', price: 38.00, quantity: 500, description: 'Premium high-protein golden wheat grain directly harvested from MP farmlands. Ideal for soft, fluffy rotis.', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
    { product_id: 3, farmer_id: 2, product_name: 'Fresh Alphonso Mangoes (Ratnagiri)', category: 'Fruits', price: 350.00, quantity: 60, description: 'Naturally tree-ripened Alphonso mangoes celebrated for intense aroma, saffron pulp, and unmatched sweetness.', image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
    { product_id: 4, farmer_id: 2, product_name: 'Crisp Mountain Spinach (Palak)', category: 'Vegetables', price: 25.00, quantity: 80, description: 'Tender, nutrient-rich emerald spinach leaves handpicked early morning. Free from chemical spray.', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80' },
    { product_id: 5, farmer_id: 3, product_name: 'Aged Traditional Basmati Rice', category: 'Grains & Cereals', price: 115.00, quantity: 300, description: 'Royal aged extra-long grain aromatic basmati rice. Non-sticky and fluffy after cooking.', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { product_id: 6, farmer_id: 1, product_name: 'Farm Fresh Orange Carrots', category: 'Vegetables', price: 32.00, quantity: 120, description: 'Crunchy, sweet farm carrots loaded with beta-carotene, washed and ready for salads, juices, or cooking.', image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80' },
    { product_id: 7, farmer_id: 3, product_name: 'Pure Raw Forest Honeycomb Honey', category: 'Dairy & Honey', price: 420.00, quantity: 45, description: 'Unprocessed, unfiltered multi-flora raw honey directly extracted from ethical bee apiaries located near orchards.', image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80' },
    { product_id: 8, farmer_id: 2, product_name: 'Red Kufri Farm Potatoes', category: 'Vegetables', price: 28.00, quantity: 250, description: 'Firm, thin-skinned hill potatoes with balanced starch content. Perfect for boiling, roasting, and curries.', image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80' },
    { product_id: 9, farmer_id: 1, product_name: 'Organic Crisp Green Capsicum', category: 'Vegetables', price: 55.00, quantity: 75, description: 'Glossy, thick-walled bell peppers with sweet flavor and satisfying crunch. Grown in modern drip-irrigated polyhouses.', image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80' },
    { product_id: 10, farmer_id: 3, product_name: 'Fresh Farm A2 Desi Cow Milk (1L)', category: 'Dairy & Honey', price: 75.00, quantity: 90, description: 'Chilled whole milk from pasture-fed Gir cows, unadulterated, pasteurized, rich in nutrients and natural butterfat.', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
    { product_id: 11, farmer_id: 2, product_name: 'Sweet Golden American Corn', category: 'Vegetables', price: 20.00, quantity: 140, description: 'Juicy, milky golden kernels on the cob, picked at peak sugar ripeness for roasting, boiling, and snacks.', image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80' },
    { product_id: 12, farmer_id: 1, product_name: 'Fresh Mahabaleshwar Strawberries', category: 'Fruits', price: 120.00, quantity: 50, description: 'Vibrant ruby-red sweet strawberries packed with antioxidants. Harvested fresh every morning.', image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80' }
  ],
  orders: [
    { order_id: 1, customer_id: 4, order_date: '2026-11-04', total_amount: 380.00, delivery_address: 'Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001', status: 'Delivered' },
    { order_id: 2, customer_id: 5, order_date: '2026-11-05', total_amount: 495.00, delivery_address: 'Villa 12, Palm Grove, Jubilee Hills, Hyderabad, Telangana - 500033', status: 'Shipped' },
    { order_id: 3, customer_id: 4, order_date: '2026-11-06', total_amount: 225.00, delivery_address: 'Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001', status: 'Pending' }
  ],
  order_items: [
    { item_id: 1, order_id: 1, product_id: 1, quantity: 2, price: 45.00 },
    { item_id: 2, order_id: 1, product_id: 3, quantity: 1, price: 350.00 },
    { item_id: 3, order_id: 2, product_id: 5, quantity: 3, price: 115.00 },
    { item_id: 4, order_id: 2, product_id: 10, quantity: 2, price: 75.00 },
    { item_id: 5, order_id: 3, product_id: 6, quantity: 2, price: 32.00 },
    { item_id: 6, order_id: 3, product_id: 9, quantity: 2, price: 55.00 },
    { item_id: 7, order_id: 3, product_id: 4, quantity: 2, price: 25.00 }
  ]
};

// In-memory clones
let memoryStore = JSON.parse(JSON.stringify(initialData));
let isMySQLConnected = false;
let pool = null;

// Configure MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agriculture_marketplace',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Initialize connection
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isMySQLConnected = true;
    console.log('[Database] Successfully connected to MySQL database: ' + dbConfig.database);
  } catch (err) {
    isMySQLConnected = false;
    console.log('[Database] MySQL connection notice: ' + err.message);
    console.log('[Database] Seamlessly activated in-memory storage fallback. All tables (users, products, orders, order_items) fully operational!');
  }
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
async function getUserByEmail(email) {
  if (isMySQLConnected) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } else {
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
}

async function getUserById(id) {
  if (isMySQLConnected) {
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows[0] || null;
  } else {
    return memoryStore.users.find(u => u.user_id === parseInt(id, 10)) || null;
  }
}

async function createUser(user) {
  if (isMySQLConnected) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [user.name, user.email, user.phone, user.password, user.role]
    );
    return { user_id: result.insertId, ...user };
  } else {
    const user_id = memoryStore.users.length ? Math.max(...memoryStore.users.map(u => u.user_id)) + 1 : 1;
    const newUser = { user_id, ...user };
    memoryStore.users.push(newUser);
    return newUser;
  }
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------
async function getProducts(filters = {}) {
  if (isMySQLConnected) {
    let sql = `
      SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email 
      FROM products p 
      JOIN users u ON p.farmer_id = u.user_id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.category && filters.category !== 'All') {
      sql += ' AND p.category = ?';
      params.push(filters.category);
    }
    if (filters.farmer_id) {
      sql += ' AND p.farmer_id = ?';
      params.push(filters.farmer_id);
    }
    if (filters.search) {
      sql += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY p.product_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  } else {
    let result = memoryStore.products.map(p => {
      const farmer = memoryStore.users.find(u => u.user_id === p.farmer_id) || {};
      return {
        ...p,
        farmer_name: farmer.name || 'Local Farmer',
        farmer_phone: farmer.phone || '',
        farmer_email: farmer.email || ''
      };
    });

    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.farmer_id) {
      result = result.filter(p => p.farmer_id === parseInt(filters.farmer_id, 10));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.product_name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    return result.sort((a, b) => b.product_id - a.product_id);
  }
}

async function getProductById(id) {
  if (isMySQLConnected) {
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email 
      FROM products p 
      JOIN users u ON p.farmer_id = u.user_id 
      WHERE p.product_id = ?
    `, [id]);
    return rows[0] || null;
  } else {
    const product = memoryStore.products.find(p => p.product_id === parseInt(id, 10));
    if (!product) return null;
    const farmer = memoryStore.users.find(u => u.user_id === product.farmer_id) || {};
    return {
      ...product,
      farmer_name: farmer.name || 'Local Farmer',
      farmer_phone: farmer.phone || '',
      farmer_email: farmer.email || ''
    };
  }
}

async function createProduct(productData) {
  if (isMySQLConnected) {
    const [result] = await pool.query(
      'INSERT INTO products (farmer_id, product_name, category, price, quantity, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        productData.farmer_id,
        productData.product_name,
        productData.category,
        productData.price,
        productData.quantity,
        productData.description,
        productData.image_url || ''
      ]
    );
    return getProductById(result.insertId);
  } else {
    const product_id = memoryStore.products.length ? Math.max(...memoryStore.products.map(p => p.product_id)) + 1 : 1;
    const newProduct = {
      product_id,
      farmer_id: parseInt(productData.farmer_id, 10),
      product_name: productData.product_name,
      category: productData.category,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity, 10),
      description: productData.description || '',
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    };
    memoryStore.products.push(newProduct);
    return getProductById(product_id);
  }
}

async function updateProduct(id, updates) {
  const productId = parseInt(id, 10);
  if (isMySQLConnected) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (['product_name', 'category', 'price', 'quantity', 'description', 'image_url'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return getProductById(productId);
    values.push(productId);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, values);
    return getProductById(productId);
  } else {
    const index = memoryStore.products.findIndex(p => p.product_id === productId);
    if (index === -1) return null;
    memoryStore.products[index] = {
      ...memoryStore.products[index],
      ...updates,
      price: updates.price !== undefined ? parseFloat(updates.price) : memoryStore.products[index].price,
      quantity: updates.quantity !== undefined ? parseInt(updates.quantity, 10) : memoryStore.products[index].quantity
    };
    return getProductById(productId);
  }
}

async function deleteProduct(id) {
  const productId = parseInt(id, 10);
  if (isMySQLConnected) {
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [productId]);
    return result.affectedRows > 0;
  } else {
    const initLen = memoryStore.products.length;
    memoryStore.products = memoryStore.products.filter(p => p.product_id !== productId);
    return memoryStore.products.length < initLen;
  }
}

// -------------------------------------------------------------
// ORDER & ORDER_ITEMS OPERATIONS
// -------------------------------------------------------------
async function createOrder({ customer_id, delivery_address, items }) {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  // Calculate total and verify stock
  let total_amount = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await getProductById(item.product_id);
    if (!product) {
      throw new Error(`Product ID ${item.product_id} not found.`);
    }
    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for "${product.product_name}". Available: ${product.quantity}, requested: ${item.quantity}`);
    }
    const itemTotal = Number(product.price) * item.quantity;
    total_amount += itemTotal;
    verifiedItems.push({
      product_id: product.product_id,
      quantity: item.quantity,
      price: product.price
    });
  }

  const order_date = new Date().toISOString().split('T')[0];
  const status = 'Pending';

  if (isMySQLConnected) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderRes] = await connection.query(
        'INSERT INTO orders (customer_id, order_date, total_amount, delivery_address, status) VALUES (?, ?, ?, ?, ?)',
        [customer_id, order_date, total_amount, delivery_address, status]
      );
      const order_id = orderRes.insertId;

      for (const item of verifiedItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [order_id, item.product_id, item.quantity, item.price]
        );
        // Deduct product stock
        await connection.query(
          'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      connection.release();
      return getOrderById(order_id);
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } else {
    // Memory store transaction
    const order_id = memoryStore.orders.length ? Math.max(...memoryStore.orders.map(o => o.order_id)) + 1 : 1;
    const newOrder = {
      order_id,
      customer_id: parseInt(customer_id, 10),
      order_date,
      total_amount: parseFloat(total_amount.toFixed(2)),
      delivery_address,
      status
    };
    memoryStore.orders.unshift(newOrder);

    for (const item of verifiedItems) {
      const item_id = memoryStore.order_items.length ? Math.max(...memoryStore.order_items.map(i => i.item_id)) + 1 : 1;
      memoryStore.order_items.push({
        item_id,
        order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      });
      // Deduct stock
      const prod = memoryStore.products.find(p => p.product_id === item.product_id);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
      }
    }

    return getOrderById(order_id);
  }
}

async function getOrderById(orderId) {
  const oId = parseInt(orderId, 10);
  if (isMySQLConnected) {
    const [orders] = await pool.query(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
      FROM orders o
      JOIN users u ON o.customer_id = u.user_id
      WHERE o.order_id = ?
    `, [oId]);

    if (!orders.length) return null;
    const order = orders[0];

    const [items] = await pool.query(`
      SELECT oi.*, p.product_name, p.image_url, p.farmer_id, u.name AS farmer_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN users u ON p.farmer_id = u.user_id
      WHERE oi.order_id = ?
    `, [oId]);

    order.items = items;
    return order;
  } else {
    const order = memoryStore.orders.find(o => o.order_id === oId);
    if (!order) return null;
    const customer = memoryStore.users.find(u => u.user_id === order.customer_id) || {};
    
    const items = memoryStore.order_items
      .filter(i => i.order_id === oId)
      .map(i => {
        const prod = memoryStore.products.find(p => p.product_id === i.product_id) || {};
        const farmer = memoryStore.users.find(u => u.user_id === prod.farmer_id) || {};
        return {
          ...i,
          product_name: prod.product_name || 'Agri Product',
          image_url: prod.image_url || '',
          farmer_id: prod.farmer_id,
          farmer_name: farmer.name || 'Local Farmer'
        };
      });

    return {
      ...order,
      customer_name: customer.name || 'Customer',
      customer_email: customer.email || '',
      customer_phone: customer.phone || '',
      items
    };
  }
}

async function getOrders(filters = {}) {
  if (isMySQLConnected) {
    let sql = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
      FROM orders o
      JOIN users u ON o.customer_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.customer_id) {
      sql += ' AND o.customer_id = ?';
      params.push(filters.customer_id);
    }
    sql += ' ORDER BY o.order_id DESC';

    const [orders] = await pool.query(sql, params);

    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.*, p.product_name, p.image_url, p.farmer_id, u.name AS farmer_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN users u ON p.farmer_id = u.user_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    if (filters.farmer_id) {
      const fId = parseInt(filters.farmer_id, 10);
      return orders.filter(order => order.items.some(item => item.farmer_id === fId));
    }

    return orders;
  } else {
    let orders = memoryStore.orders.map(order => {
      const customer = memoryStore.users.find(u => u.user_id === order.customer_id) || {};
      const items = memoryStore.order_items
        .filter(i => i.order_id === order.order_id)
        .map(i => {
          const prod = memoryStore.products.find(p => p.product_id === i.product_id) || {};
          const farmer = memoryStore.users.find(u => u.user_id === prod.farmer_id) || {};
          return {
            ...i,
            product_name: prod.product_name || 'Agri Product',
            image_url: prod.image_url || '',
            farmer_id: prod.farmer_id,
            farmer_name: farmer.name || 'Local Farmer'
          };
        });

      return {
        ...order,
        customer_name: customer.name || 'Customer',
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        items
      };
    });

    if (filters.customer_id) {
      orders = orders.filter(o => o.customer_id === parseInt(filters.customer_id, 10));
    }
    if (filters.farmer_id) {
      const fId = parseInt(filters.farmer_id, 10);
      orders = orders.filter(order => order.items.some(item => item.farmer_id === fId));
    }

    return orders.sort((a, b) => b.order_id - a.order_id);
  }
}

async function updateOrderStatus(orderId, status) {
  const oId = parseInt(orderId, 10);
  if (isMySQLConnected) {
    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, oId]);
    return getOrderById(oId);
  } else {
    const order = memoryStore.orders.find(o => o.order_id === oId);
    if (!order) return null;
    order.status = status;
    return getOrderById(oId);
  }
}

// -------------------------------------------------------------
// LIVE DATABASE INSPECTOR (Returns 4 requested raw tables)
// -------------------------------------------------------------
async function getAllDatabaseTables() {
  if (isMySQLConnected) {
    const [users] = await pool.query('SELECT user_id, name, email, phone, role FROM users');
    const [products] = await pool.query('SELECT product_id, farmer_id, product_name, category, price, quantity, description, image_url FROM products');
    const [orders] = await pool.query('SELECT order_id, customer_id, order_date, total_amount, delivery_address, status FROM orders');
    const [order_items] = await pool.query('SELECT item_id, order_id, product_id, quantity, price FROM order_items');
    return { isMySQL: true, users, products, orders, order_items };
  } else {
    return {
      isMySQL: false,
      users: memoryStore.users.map(({ password, ...u }) => u),
      products: memoryStore.products,
      orders: memoryStore.orders,
      order_items: memoryStore.order_items
    };
  }
}

module.exports = {
  initDatabase,
  getUserByEmail,
  getUserById,
  createUser,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getAllDatabaseTables,
  getStorageMode: () => (isMySQLConnected ? 'MySQL Database' : 'In-Memory Relational Engine')
};
