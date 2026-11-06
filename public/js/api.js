/**
 * Online Agriculture Product MarketPlace
 * Unified Client API Service (Hybrid: Express Server + LocalStorage Fallback)
 */

class AgriApiService {
  constructor() {
    this.mode = 'detecting'; // 'server' or 'local'
    this.storageKey = 'agri_marketplace_data_v1';
    this.initLocalStore();
  }

  initLocalStore() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const existing = localStorage.getItem(this.storageKey);
    if (!existing && window.INITIAL_DATA) {
      localStorage.setItem(this.storageKey, JSON.stringify(window.INITIAL_DATA));
    }
  }

  getLocalData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading localStorage, using INITIAL_DATA', e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_DATA || { users: [], products: [], orders: [], order_items: [] }));
  }

  saveLocalData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  async detectMode() {
    try {
      // Short timeout to avoid hanging if static file://
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('/api/status', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        this.mode = 'server';
        this.storageEngine = json.storageMode || 'Express Backend';
        return { mode: 'server', storageEngine: this.storageEngine };
      }
    } catch (e) {
      // Server not reachable (static run / double click)
    }
    this.mode = 'local';
    this.storageEngine = 'Standalone Browser Engine (Pure HTML/CSS/JS)';
    return { mode: 'local', storageEngine: this.storageEngine };
  }

  // ========================================================
  // USERS & AUTH
  // ========================================================
  async getUsers() {
    if (this.mode === 'server') {
      const res = await fetch('/api/users');
      const data = await res.json();
      return data.users || [];
    } else {
      const data = this.getLocalData();
      return data.users.map(({ password, ...u }) => u);
    }
  }

  async login(email, password) {
    if (this.mode === 'server') {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data.user;
    } else {
      const data = this.getLocalData();
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      const { password: _, ...userSafe } = user;
      return userSafe;
    }
  }

  async register(userData) {
    if (this.mode === 'server') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data.user;
    } else {
      const data = this.getLocalData();
      if (data.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('A user with this email already exists.');
      }
      const user_id = data.users.length ? Math.max(...data.users.map(u => u.user_id)) + 1 : 1;
      const newUser = {
        user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        role: userData.role.toLowerCase()
      };
      data.users.push(newUser);
      this.saveLocalData(data);
      const { password: _, ...userSafe } = newUser;
      return userSafe;
    }
  }

  // ========================================================
  // PRODUCTS
  // ========================================================
  async getProducts(filters = {}) {
    if (this.mode === 'server') {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.farmer_id) params.append('farmer_id', filters.farmer_id);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      return data.products || [];
    } else {
      const data = this.getLocalData();
      let list = data.products.map(p => {
        const farmer = data.users.find(u => u.user_id === p.farmer_id) || {};
        return {
          ...p,
          farmer_name: farmer.name || 'Local Farmer',
          farmer_phone: farmer.phone || '',
          farmer_email: farmer.email || ''
        };
      });

      if (filters.category && filters.category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.farmer_id) {
        list = list.filter(p => p.farmer_id === parseInt(filters.farmer_id, 10));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(p => p.product_name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      }
      return list.sort((a, b) => b.product_id - a.product_id);
    }
  }

  async getProductById(id) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Product not found');
      return data.product;
    } else {
      const data = this.getLocalData();
      const p = data.products.find(item => item.product_id === parseInt(id, 10));
      if (!p) throw new Error('Product not found');
      const farmer = data.users.find(u => u.user_id === p.farmer_id) || {};
      return {
        ...p,
        farmer_name: farmer.name || 'Local Farmer',
        farmer_phone: farmer.phone || '',
        farmer_email: farmer.email || ''
      };
    }
  }

  async createProduct(productData) {
    if (this.mode === 'server') {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to list product');
      return data.product;
    } else {
      const data = this.getLocalData();
      const product_id = data.products.length ? Math.max(...data.products.map(p => p.product_id)) + 1 : 1;
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
      data.products.push(newProduct);
      this.saveLocalData(data);
      return this.getProductById(product_id);
    }
  }

  async updateProduct(id, updates) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');
      return data.product;
    } else {
      const data = this.getLocalData();
      const pId = parseInt(id, 10);
      const index = data.products.findIndex(p => p.product_id === pId);
      if (index === -1) throw new Error('Product not found');
      data.products[index] = {
        ...data.products[index],
        ...updates,
        price: updates.price !== undefined ? parseFloat(updates.price) : data.products[index].price,
        quantity: updates.quantity !== undefined ? parseInt(updates.quantity, 10) : data.products[index].quantity
      };
      this.saveLocalData(data);
      return this.getProductById(pId);
    }
  }

  async updateStock(id, quantity) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update stock');
      return data.product;
    } else {
      return this.updateProduct(id, { quantity: parseInt(quantity, 10) });
    }
  }

  async updatePrice(id, price) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/products/${id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update price');
      return data.product;
    } else {
      return this.updateProduct(id, { price: parseFloat(price) });
    }
  }

  async deleteProduct(id) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      return true;
    } else {
      const data = this.getLocalData();
      const pId = parseInt(id, 10);
      data.products = data.products.filter(p => p.product_id !== pId);
      this.saveLocalData(data);
      return true;
    }
  }

  // ========================================================
  // ORDERS & ORDER_ITEMS
  // ========================================================
  async getOrders(filters = {}) {
    if (this.mode === 'server') {
      const params = new URLSearchParams();
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.farmer_id) params.append('farmer_id', filters.farmer_id);
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      return data.orders || [];
    } else {
      const data = this.getLocalData();
      let orders = data.orders.map(order => {
        const customer = data.users.find(u => u.user_id === order.customer_id) || {};
        const items = data.order_items
          .filter(i => i.order_id === order.order_id)
          .map(i => {
            const prod = data.products.find(p => p.product_id === i.product_id) || {};
            const farmer = data.users.find(u => u.user_id === prod.farmer_id) || {};
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
        orders = orders.filter(o => o.items.some(i => i.farmer_id === fId));
      }
      return orders.sort((a, b) => b.order_id - a.order_id);
    }
  }

  async createOrder({ customer_id, delivery_address, items }) {
    if (this.mode === 'server') {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id, delivery_address, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      return data.order;
    } else {
      const data = this.getLocalData();
      let total_amount = 0;
      const verifiedItems = [];

      for (const item of items) {
        const prod = data.products.find(p => p.product_id === item.product_id);
        if (!prod) throw new Error(`Product ${item.product_id} not found.`);
        if (prod.quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.product_name}". Available: ${prod.quantity}`);
        }
        total_amount += Number(prod.price) * item.quantity;
        verifiedItems.push({
          product_id: prod.product_id,
          quantity: item.quantity,
          price: prod.price
        });
      }

      const order_id = data.orders.length ? Math.max(...data.orders.map(o => o.order_id)) + 1 : 1;
      const order_date = new Date().toISOString().split('T')[0];
      const newOrder = {
        order_id,
        customer_id: parseInt(customer_id, 10),
        order_date,
        total_amount: parseFloat(total_amount.toFixed(2)),
        delivery_address,
        status: 'Pending'
      };
      data.orders.unshift(newOrder);

      for (const item of verifiedItems) {
        const item_id = data.order_items.length ? Math.max(...data.order_items.map(i => i.item_id)) + 1 : 1;
        data.order_items.push({
          item_id,
          order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
        // Deduct stock
        const p = data.products.find(x => x.product_id === item.product_id);
        if (p) p.quantity = Math.max(0, p.quantity - item.quantity);
      }

      this.saveLocalData(data);
      const orders = await this.getOrders({ customer_id });
      return orders.find(o => o.order_id === order_id);
    }
  }

  async updateOrderStatus(orderId, status) {
    if (this.mode === 'server') {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order status');
      return data.order;
    } else {
      const data = this.getLocalData();
      const oId = parseInt(orderId, 10);
      const order = data.orders.find(o => o.order_id === oId);
      if (!order) throw new Error('Order not found');
      order.status = status;
      this.saveLocalData(data);
      const orders = await this.getOrders();
      return orders.find(o => o.order_id === oId);
    }
  }

  // ========================================================
  // LIVE DATABASE INSPECTOR (Returns 4 tables)
  // ========================================================
  async getDatabaseTables() {
    if (this.mode === 'server') {
      try {
        const res = await fetch('/api/database/tables');
        return await res.json();
      } catch (e) {
        // Fallback
      }
    }
    const data = this.getLocalData();
    return {
      success: true,
      isMySQL: false,
      storageEngine: this.storageEngine,
      users: data.users.map(({ password, ...u }) => u),
      products: data.products,
      orders: data.orders,
      order_items: data.order_items
    };
  }

  resetDemoData() {
    if (window.INITIAL_DATA) {
      localStorage.setItem(this.storageKey, JSON.stringify(window.INITIAL_DATA));
      return true;
    }
    return false;
  }
}

// Global instance
window.AgriAPI = new AgriApiService();
