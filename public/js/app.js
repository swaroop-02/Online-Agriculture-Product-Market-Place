/**
 * Online Agriculture Product MarketPlace
 * Universal Multi-Page Application Logic (Vanilla JavaScript - No frameworks)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Determine current page
  const page = document.body.dataset.page || 'home';
  const urlParams = new URLSearchParams(window.location.search);

  // ========================================================
  // STATE MANAGEMENT
  // ========================================================
  const state = {
    currentUser: null,
    products: [],
    categories: ['All', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Dairy & Honey', 'Tubers & Roots'],
    selectedCategory: urlParams.get('category') || urlParams.get('cat') || 'All',
    searchQuery: '',
    sortOption: 'default',
    onlyInStock: false,
    cart: [],
    orders: [],
    dbTables: null
  };

  // Shared DOM Elements
  const cartCountBadge = document.getElementById('cart-count-badge');
  const userModal = document.getElementById('modal-user');
  const dbInspectorModal = document.getElementById('modal-db-inspector');
  const productDetailModal = document.getElementById('modal-product-detail');
  const addProductModal = document.getElementById('modal-add-product');
  const updateStockModal = document.getElementById('modal-update-stock');
  const updatePriceModal = document.getElementById('modal-update-price');
  const orderSuccessModal = document.getElementById('modal-order-success');

  // ========================================================
  // INITIALIZATION
  // ========================================================
  async function init() {
    // 1. Detect API Mode (Server vs LocalStorage)
    const status = await window.AgriAPI.detectMode();
    updateStorageEngineUI(status);

    // 2. Load Cart from Storage & Update Badge
    loadCartFromStorage();

    // 3. Load or Default User Profile
    await initUser();

    // 4. Load Products
    await loadProducts();

    // 5. Initialize Page Specific Logic
    if (page === 'home') {
      initHomePage();
    } else if (page === 'products') {
      initProductsPage();
    } else if (page === 'categories') {
      initCategoriesPage();
    } else if (page === 'cart') {
      initCartPage();
    }

    // 6. Bind Global Shared Events
    bindSharedEvents();
  }

  function updateStorageEngineUI(status) {
    const statusTag = document.getElementById('engine-status-tag');
    if (statusTag) {
      if (status.mode === 'server') {
        statusTag.innerHTML = `<span class="status-dot"></span> Mode: Express Server API (${status.storageEngine})`;
        statusTag.title = 'Connected to Express backend. MySQL / In-memory active.';
      } else {
        statusTag.innerHTML = `<span class="status-dot" style="background:#f59e0b"></span> Mode: Pure Front-End (LocalStorage Engine)`;
        statusTag.title = 'Running standalone in browser using HTML5 LocalStorage.';
      }
    }
  }

  async function initUser() {
    const savedUser = localStorage.getItem('agri_current_user');
    if (savedUser) {
      try {
        state.currentUser = JSON.parse(savedUser);
      } catch (e) {
        state.currentUser = null;
      }
    }
    if (!state.currentUser) {
      // Default to Kisan Patel (Farmer) for rich initial demo
      const users = await window.AgriAPI.getUsers();
      state.currentUser = users.find(u => u.role === 'farmer') || {
        user_id: 1,
        name: 'Kisan Patel',
        email: 'kisan.patel@agrimarket.com',
        phone: '+91 9876543210',
        role: 'farmer'
      };
      localStorage.setItem('agri_current_user', JSON.stringify(state.currentUser));
    }
    updateUserUI();
  }

  function updateUserUI() {
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');

    if (state.currentUser) {
      if (nameEl) nameEl.textContent = state.currentUser.name;
      if (roleEl) roleEl.textContent = state.currentUser.role.toUpperCase();
      if (avatarEl) {
        avatarEl.textContent = state.currentUser.name.charAt(0);
        avatarEl.style.background = state.currentUser.role === 'farmer' ? '#15803d' : '#d97706';
      }
    }

    // Farmer Hub link visibility
    const navFarmerToggle = document.getElementById('nav-farmer-toggle');
    const viewFarmer = document.getElementById('view-farmer');
    if (navFarmerToggle) {
      if (state.currentUser?.role === 'farmer') {
        navFarmerToggle.style.display = 'flex';
        navFarmerToggle.onclick = () => {
          if (viewFarmer) {
            viewFarmer.style.display = viewFarmer.style.display === 'none' ? 'block' : 'none';
            if (viewFarmer.style.display === 'block') {
              viewFarmer.scrollIntoView({ behavior: 'smooth' });
              loadFarmerDashboard();
            }
          }
        };
      } else {
        navFarmerToggle.style.display = 'none';
        if (viewFarmer) viewFarmer.style.display = 'none';
      }
    }

    // Auto-load farmer dashboard if visible on home page
    if (viewFarmer && state.currentUser?.role === 'farmer' && page === 'home') {
      viewFarmer.style.display = 'block';
      loadFarmerDashboard();
    }
  }

  async function loadProducts() {
    try {
      state.products = await window.AgriAPI.getProducts();
    } catch (err) {
      console.warn('Could not load products:', err);
    }
  }

  // ========================================================
  // CART HELPERS (Shared Across All Pages)
  // ========================================================
  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('agri_cart_items');
      if (saved) state.cart = JSON.parse(saved);
    } catch (e) {
      state.cart = [];
    }
    updateCartBadge();
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('agri_cart_items', JSON.stringify(state.cart));
    } catch (e) {}
    updateCartBadge();
  }

  function updateCartBadge() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = totalCount;
      cartCountBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  }

  function addToCart(productId) {
    const product = state.products.find(p => p.product_id === productId);
    if (!product) return;

    if (product.quantity <= 0) {
      showToast('This agricultural product is currently out of stock.', 'warning');
      return;
    }

    const existingIndex = state.cart.findIndex(item => item.product_id === productId);
    if (existingIndex > -1) {
      if (state.cart[existingIndex].quantity + 1 > product.quantity) {
        showToast(`Cannot add more. Only ${product.quantity} ${getUnitLabel(product.category)} available in farmer's stock.`, 'warning');
        return;
      }
      state.cart[existingIndex].quantity += 1;
    } else {
      state.cart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: parseFloat(product.price),
        image_url: product.image_url,
        category: product.category,
        farmer_id: product.farmer_id,
        farmer_name: product.farmer_name,
        max_stock: product.quantity,
        quantity: 1
      });
    }

    saveCartToStorage();
    showToast(`Added "${product.product_name}" to your basket!`, 'success');
  }

  function getUnitLabel(category) {
    if (category === 'Dairy & Honey') return 'L / Jar';
    if (category === 'Fruits') return 'kg / Box';
    return 'kg';
  }

  // ========================================================
  // PAGE 1: HOME PAGE (index.html)
  // ========================================================
  function initHomePage() {
    const featuredGrid = document.getElementById('home-featured-products-grid');
    if (!featuredGrid) return;

    const featured = state.products.slice(0, 4);
    featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');

    attachProductCardEvents(featuredGrid);
  }

  // ========================================================
  // PAGE 2: PRODUCTS PAGE (products.html)
  // ========================================================
  function initProductsPage() {
    const categoryTabsContainer = document.getElementById('category-tabs');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const inStockCheckbox = document.getElementById('in-stock-only');

    // Render Category tabs
    if (categoryTabsContainer) {
      categoryTabsContainer.innerHTML = state.categories.map(cat => `
        <button class="category-pill ${cat.toLowerCase() === state.selectedCategory.toLowerCase() ? 'active' : ''}" data-category="${cat}">
          ${getCategoryIcon(cat)} ${cat}
        </button>
      `).join('');

      categoryTabsContainer.querySelectorAll('.category-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          state.selectedCategory = btn.dataset.category;
          categoryTabsContainer.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderFilteredProducts();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderFilteredProducts();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortOption = e.target.value;
        renderFilteredProducts();
      });
    }

    if (inStockCheckbox) {
      inStockCheckbox.addEventListener('change', (e) => {
        state.onlyInStock = e.target.checked;
        renderFilteredProducts();
      });
    }

    renderFilteredProducts();
  }

  function renderFilteredProducts() {
    const productsContainer = document.getElementById('products-grid');
    const countDisplay = document.getElementById('product-count-display');
    if (!productsContainer) return;

    let filtered = [...state.products];

    // Category filter
    if (state.selectedCategory && state.selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === state.selectedCategory.toLowerCase());
    }

    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.farmer_name && p.farmer_name.toLowerCase().includes(q))
      );
    }

    // In-stock only
    if (state.onlyInStock) {
      filtered = filtered.filter(p => p.quantity > 0);
    }

    // Sorting
    switch (state.sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'stock-desc':
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        filtered.sort((a, b) => b.product_id - a.product_id);
    }

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} agricultural produce items`;
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">No Produce Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try clearing your search query or selecting a different produce category.</p>
          <button class="btn-secondary" id="btn-clear-product-filters">Reset Filters</button>
        </div>
      `;
      const btnClear = document.getElementById('btn-clear-product-filters');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          state.selectedCategory = 'All';
          state.searchQuery = '';
          state.onlyInStock = false;
          const searchInput = document.getElementById('search-input');
          const inStockCheckbox = document.getElementById('in-stock-only');
          if (searchInput) searchInput.value = '';
          if (inStockCheckbox) inStockCheckbox.checked = false;
          const categoryTabs = document.getElementById('category-tabs');
          if (categoryTabs) {
            categoryTabs.querySelectorAll('.category-pill').forEach(b => {
              b.classList.toggle('active', b.dataset.category === 'All');
            });
          }
          renderFilteredProducts();
        });
      }
      return;
    }

    productsContainer.innerHTML = filtered.map(p => renderProductCard(p)).join('');
    attachProductCardEvents(productsContainer);
  }

  // ========================================================
  // PAGE 3: CATEGORIES PAGE (categories.html)
  // ========================================================
  function initCategoriesPage() {
    const categoryCards = document.querySelectorAll('.category-card');
    const selectedTitle = document.getElementById('selected-category-title');
    const selectedSubtitle = document.getElementById('selected-category-subtitle');
    const catProductsGrid = document.getElementById('category-products-grid');

    function selectCategory(catName) {
      state.selectedCategory = catName;

      // Update card active classes
      categoryCards.forEach(card => {
        card.classList.toggle('active', card.dataset.category.toLowerCase() === catName.toLowerCase());
      });

      if (selectedTitle) {
        selectedTitle.textContent = catName === 'All' ? 'All Agricultural Produce' : `${getCategoryIcon(catName)} ${catName} Harvest`;
      }
      if (selectedSubtitle) {
        selectedSubtitle.textContent = catName === 'All'
          ? 'Showing all farm-fresh produce available for doorstep dispatch'
          : `Showing fresh ${catName.toLowerCase()} harvested directly by our local partner growers`;
      }

      // Filter products
      let list = state.products;
      if (catName !== 'All') {
        list = state.products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
      }

      if (catProductsGrid) {
        if (list.length === 0) {
          catProductsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-lg);">
              <p style="color: var(--text-muted);">No produce currently listed under ${catName}.</p>
            </div>
          `;
        } else {
          catProductsGrid.innerHTML = list.map(p => renderProductCard(p)).join('');
          attachProductCardEvents(catProductsGrid);
        }
      }
    }

    // Attach click to each category card
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.category;
        selectCategory(cat);
        document.getElementById('category-products-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Check URL parameter e.g. ?cat=Vegetables
    const initialCat = urlParams.get('cat') || urlParams.get('category') || 'All';
    selectCategory(initialCat);
  }

  // ========================================================
  // PAGE 4: CART & CHECKOUT PAGE (cart.html)
  // ========================================================
  function initCartPage() {
    renderCartPageItems();
    renderCustomerOrdersHistory();

    // Auto-fill customer details from active session
    const nameInput = document.getElementById('cart-customer-name');
    const phoneInput = document.getElementById('cart-customer-phone');
    if (state.currentUser) {
      if (nameInput) nameInput.value = state.currentUser.name;
      if (phoneInput) phoneInput.value = state.currentUser.phone || '';
    }

    // Clear cart button
    const btnClearCart = document.getElementById('btn-clear-cart');
    if (btnClearCart) {
      btnClearCart.addEventListener('click', () => {
        if (state.cart.length === 0) return;
        if (confirm('Are you sure you want to empty your produce basket?')) {
          state.cart = [];
          saveCartToStorage();
          renderCartPageItems();
          showToast('Basket cleared.', 'info');
        }
      });
    }

    // Submit Order Form
    const formCheckout = document.getElementById('form-cart-checkout');
    if (formCheckout) {
      formCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (state.cart.length === 0) {
          showToast('Your basket is empty. Please add agricultural products first!', 'warning');
          return;
        }

        const address = document.getElementById('cart-delivery-address').value.trim();
        if (!address) {
          showToast('Please provide your complete delivery address.', 'warning');
          return;
        }

        const customer_id = state.currentUser ? state.currentUser.user_id : 4;
        const items = state.cart.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price
        }));

        try {
          const btnSubmit = document.getElementById('btn-submit-cart-order');
          if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Transmitting Order to Farmers...';
          }

          const order = await window.AgriAPI.createOrder({
            customer_id,
            delivery_address: address,
            items
          });

          // Empty cart
          state.cart = [];
          saveCartToStorage();

          // Refresh products stock & page
          await loadProducts();
          renderCartPageItems();
          renderCustomerOrdersHistory();

          // Show Order Confirmation Receipt Modal
          const orderIdEl = document.getElementById('success-order-id');
          const orderAmtEl = document.getElementById('success-order-amount');
          const orderAddrEl = document.getElementById('success-delivery-addr');

          if (orderIdEl) orderIdEl.textContent = `#AGRI-${order.order_id}`;
          if (orderAmtEl) orderAmtEl.textContent = `₹${parseFloat(order.total_amount).toFixed(2)}`;
          if (orderAddrEl) orderAddrEl.textContent = order.delivery_address;

          openModal(orderSuccessModal);
          showToast('Farm order confirmed successfully!', 'success');
        } catch (err) {
          showToast('Order placement failed: ' + err.message, 'error');
        } finally {
          const btnSubmit = document.getElementById('btn-submit-cart-order');
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirm & Place Farm Order →';
          }
        }
      });
    }
  }

  function renderCartPageItems() {
    const container = document.getElementById('cart-page-items-container');
    const countText = document.getElementById('cart-items-count-text');
    const subtotalEl = document.getElementById('cart-page-subtotal');
    const totalEl = document.getElementById('cart-page-total');
    const btnSubmit = document.getElementById('btn-submit-cart-order');

    const totalCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    if (countText) countText.textContent = totalCount;
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${subtotal.toFixed(2)}`;

    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🧺</div>
          <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">Your Basket is Empty</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
            Discover fresh organic crops, grains, and dairy direct from verified local growers.
          </p>
          <a href="products.html" class="btn-primary" style="display: inline-flex; margin: 0 auto;">
            Explore Fresh Harvest
          </a>
        </div>
      `;
      if (btnSubmit) btnSubmit.disabled = true;
    } else {
      if (btnSubmit) btnSubmit.disabled = false;
      container.innerHTML = `
        <div style="display: flex; flex-direction: column;">
          ${state.cart.map(item => `
            <div class="cart-row-item">
              <img src="${item.image_url}" alt="${item.product_name}" class="cart-row-thumb" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark);">${item.product_name}</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                  Farmer: <strong style="color: var(--primary);">${item.farmer_name || 'Local Farmer'}</strong> • Category: ${item.category}
                </div>
                <div style="font-size: 0.9rem; font-weight: 700; color: #14532d; margin-top: 0.35rem;">
                  ₹${item.price.toFixed(2)} / ${getUnitLabel(item.category)}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn-qty btn-cart-page-minus" data-id="${item.product_id}">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="btn-qty btn-cart-page-plus" data-id="${item.product_id}">+</button>
              </div>
              <div style="text-align: right; min-width: 90px;">
                <div style="font-size: 1.15rem; font-weight: 800; color: #14532d;">
                  ₹${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="btn-remove-cart btn-cart-page-remove" data-id="${item.product_id}" style="margin-top: 0.4rem; font-size: 0.85rem;" title="Remove produce">
                  🗑️ Remove
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.btn-cart-page-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = parseInt(btn.dataset.id, 10);
          updateCartQty(pId, -1);
          renderCartPageItems();
        });
      });

      container.querySelectorAll('.btn-cart-page-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = parseInt(btn.dataset.id, 10);
          updateCartQty(pId, 1);
          renderCartPageItems();
        });
      });

      container.querySelectorAll('.btn-cart-page-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = parseInt(btn.dataset.id, 10);
          state.cart = state.cart.filter(i => i.product_id !== pId);
          saveCartToStorage();
          renderCartPageItems();
          showToast('Item removed from basket.', 'info');
        });
      });
    }
  }

  function updateCartQty(productId, delta) {
    const index = state.cart.findIndex(i => i.product_id === productId);
    if (index === -1) return;

    const newQty = state.cart[index].quantity + delta;
    if (newQty <= 0) {
      state.cart.splice(index, 1);
    } else {
      const prod = state.products.find(p => p.product_id === productId);
      const maxStock = prod ? prod.quantity : state.cart[index].max_stock;
      if (newQty > maxStock) {
        showToast(`Farmer only has ${maxStock} units currently in stock.`, 'warning');
        return;
      }
      state.cart[index].quantity = newQty;
    }
    saveCartToStorage();
  }

  async function renderCustomerOrdersHistory() {
    const container = document.getElementById('cart-orders-container');
    if (!container) return;

    try {
      const customerId = state.currentUser ? state.currentUser.user_id : 4;
      const orders = await window.AgriAPI.getOrders({ customer_id: customerId });

      if (orders.length === 0) {
        container.innerHTML = `
          <div style="background: #fff; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; color: var(--text-muted);">
            No previous orders found for this account. Placed farm orders will appear here for live status tracking.
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(order => `
        <div class="order-card">
          <div class="order-card-header">
            <div class="order-meta">
              <div>Order Tracking: <strong>#AGRI-${order.order_id}</strong></div>
              <div>Placed On: <strong>${order.order_date}</strong></div>
            </div>
            <div>
              <span class="status-pill status-${order.status.toLowerCase()}">
                ● Status: ${order.status}
              </span>
            </div>
          </div>

          <div class="order-items-list">
            ${order.items.map(item => `
              <div class="order-item-row">
                <div class="order-item-info">
                  <img src="${item.image_url}" alt="${item.product_name}" class="order-item-img" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'">
                  <div>
                    <div style="font-weight: 700; color: var(--text-dark);">${item.product_name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Farmer: ${item.farmer_name || 'Local Farmer'}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; color: #14532d;">₹${(item.price * item.quantity).toFixed(2)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">₹${item.price} x ${item.quantity} units</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div>
              📍 <strong>Delivery Address:</strong> ${order.delivery_address}
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Payment on Delivery:</span>
              <span class="order-total-badge">₹${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Could not load orders:', err);
    }
  }

  // ========================================================
  // PRODUCT CARD RENDERING & EVENTS (SHARED)
  // ========================================================
  function renderProductCard(p) {
    let stockClass = 'in-stock';
    let stockText = `In Stock: ${p.quantity} kg`;
    if (p.quantity <= 0) {
      stockClass = 'out-stock';
      stockText = 'Out of Stock';
    } else if (p.quantity < 20) {
      stockClass = 'low-stock';
      stockText = `Low Stock: ${p.quantity} left`;
    }

    const isFarmerOwner = state.currentUser?.role === 'farmer' && state.currentUser.user_id === p.farmer_id;

    return `
      <div class="product-card" data-product-id="${p.product_id}">
        <div class="product-img-wrap" data-product-id="${p.product_id}">
          <img src="${p.image_url}" alt="${p.product_name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'">
          <div class="product-badges">
            <span class="category-tag">${p.category}</span>
            <span class="stock-tag ${stockClass}">${stockText}</span>
          </div>
        </div>

        <div class="product-details">
          <div class="farmer-info-chip">
            <span>👨‍🌾</span>
            <span>By <span class="farmer-name">${p.farmer_name || 'Verified Farmer'}</span></span>
          </div>

          <h3 class="product-title" data-product-id="${p.product_id}">${p.product_name}</h3>
          <p class="product-desc">${p.description || 'Pure agricultural produce harvested directly from certified sustainable family farms.'}</p>

          <div class="product-bottom-row">
            <div class="price-box">
              <span class="price-label">Farmer Price</span>
              <div>
                <span class="price-val">₹${parseFloat(p.price).toFixed(2)}</span>
                <span class="price-unit">/ ${getUnitLabel(p.category)}</span>
              </div>
            </div>

            <button class="btn-add-cart" data-product-id="${p.product_id}" ${p.quantity <= 0 ? 'disabled' : ''}>
              ${p.quantity <= 0 ? 'Sold Out' : '🛒 Add'}
            </button>
          </div>

          ${isFarmerOwner ? `
            <div class="farmer-card-controls">
              <button class="btn-mini-control stock-btn btn-quick-stock" data-product-id="${p.product_id}">
                📦 Update Stock (${p.quantity})
              </button>
              <button class="btn-mini-control price-btn btn-quick-price" data-product-id="${p.product_id}">
                💰 Update Price (₹${p.price})
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function attachProductCardEvents(container) {
    if (!container) return;

    // Add to cart buttons
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = parseInt(btn.dataset.productId, 10);
        addToCart(pId);
      });
    });

    // Product detail modal triggers
    container.querySelectorAll('.product-img-wrap, .product-title').forEach(el => {
      el.addEventListener('click', () => {
        const pId = parseInt(el.dataset.productId, 10);
        openProductDetailModal(pId);
      });
    });

    // Farmer inline controls
    container.querySelectorAll('.btn-quick-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = parseInt(btn.dataset.productId, 10);
        openQuickStockModal(pId);
      });
    });

    container.querySelectorAll('.btn-quick-price').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = parseInt(btn.dataset.productId, 10);
        openQuickPriceModal(pId);
      });
    });
  }

  function getCategoryIcon(cat) {
    switch (cat) {
      case 'Vegetables': return '🥬';
      case 'Fruits': return '🍎';
      case 'Grains & Cereals': return '🌾';
      case 'Dairy & Honey': return '🍯';
      case 'Tubers & Roots': return '🥔';
      default: return '🌱';
    }
  }

  // ========================================================
  // FARMER HUB MANAGEMENT (Dashboard & Updates)
  // ========================================================
  async function loadFarmerDashboard() {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return;

    const farmerId = state.currentUser.user_id;
    const farmerProducts = state.products.filter(p => p.farmer_id === farmerId);
    const farmerOrders = await window.AgriAPI.getOrders({ farmer_id: farmerId });

    // KPIs
    const totalProducts = farmerProducts.length;
    const totalStock = farmerProducts.reduce((sum, p) => sum + parseInt(p.quantity, 10), 0);
    const pendingOrders = farmerOrders.filter(o => o.status === 'Pending').length;
    const estimatedRevenue = farmerOrders.reduce((sum, o) => {
      const myItemsTotal = o.items
        .filter(i => i.farmer_id === farmerId)
        .reduce((isum, i) => isum + (Number(i.price) * i.quantity), 0);
      return sum + myItemsTotal;
    }, 0);

    const kpiProducts = document.getElementById('kpi-farmer-products');
    const kpiStock = document.getElementById('kpi-farmer-stock');
    const kpiOrders = document.getElementById('kpi-farmer-orders');
    const kpiRevenue = document.getElementById('kpi-farmer-revenue');

    if (kpiProducts) kpiProducts.textContent = totalProducts;
    if (kpiStock) kpiStock.textContent = `${totalStock} kg`;
    if (kpiOrders) kpiOrders.textContent = pendingOrders;
    if (kpiRevenue) kpiRevenue.textContent = `₹${estimatedRevenue.toFixed(2)}`;

    // Inventory Table
    const tableBody = document.getElementById('farmer-products-tbody');
    if (tableBody) {
      if (farmerProducts.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              You haven't listed any crops yet. Click "+ List New Agricultural Product" above!
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = farmerProducts.map(p => `
          <tr>
            <td><strong>#${p.product_id}</strong></td>
            <td>
              <div class="table-product-cell">
                <img src="${p.image_url}" alt="${p.product_name}" class="table-product-thumb" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'">
                <div>
                  <div style="font-weight: 700; color: var(--text-dark);">${p.product_name}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${p.category}</div>
                </div>
              </div>
            </td>
            <td><strong style="color: #14532d; font-size: 1rem;">₹${parseFloat(p.price).toFixed(2)}</strong> / ${getUnitLabel(p.category)}</td>
            <td>
              <span class="stock-tag ${p.quantity > 20 ? 'in-stock' : (p.quantity > 0 ? 'low-stock' : 'out-stock')}">
                ${p.quantity} units
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn-mini-control stock-btn btn-table-stock" data-id="${p.product_id}">
                  📦 Update Stock
                </button>
                <button class="btn-mini-control price-btn btn-table-price" data-id="${p.product_id}">
                  💰 Update Price
                </button>
              </div>
            </td>
          </tr>
        `).join('');

        tableBody.querySelectorAll('.btn-table-stock').forEach(btn => {
          btn.addEventListener('click', () => openQuickStockModal(parseInt(btn.dataset.id, 10)));
        });

        tableBody.querySelectorAll('.btn-table-price').forEach(btn => {
          btn.addEventListener('click', () => openQuickPriceModal(parseInt(btn.dataset.id, 10)));
        });
      }
    }

    // Orders to fulfill
    const ordersTbody = document.getElementById('farmer-orders-tbody');
    if (ordersTbody) {
      if (farmerOrders.length === 0) {
        ordersTbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No customer orders received yet. Once customers order your produce, they appear here!
            </td>
          </tr>
        `;
      } else {
        ordersTbody.innerHTML = farmerOrders.map(order => {
          const myItems = order.items.filter(i => i.farmer_id === farmerId);
          const myTotal = myItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);

          return `
            <tr>
              <td><strong>#AGRI-${order.order_id}</strong></td>
              <td>${order.order_date}</td>
              <td>
                <div style="font-weight: 700;">${order.customer_name || 'Customer'}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${order.customer_phone || ''}</div>
              </td>
              <td style="max-width: 200px; font-size: 0.82rem; color: var(--text-muted);">${order.delivery_address}</td>
              <td>
                <div style="font-size: 0.85rem;">
                  ${myItems.map(i => `<div>• ${i.product_name} (x${i.quantity})</div>`).join('')}
                </div>
              </td>
              <td><strong style="color: #14532d;">₹${myTotal.toFixed(2)}</strong></td>
              <td>
                <select class="status-dropdown status-select" data-order-id="${order.order_id}">
                  <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                  <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                  <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
                  <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>🎉 Delivered</option>
                  <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                </select>
              </td>
            </tr>
          `;
        }).join('');

        ordersTbody.querySelectorAll('.status-select').forEach(sel => {
          sel.addEventListener('change', async () => {
            const orderId = parseInt(sel.dataset.orderId, 10);
            const newStatus = sel.value;
            try {
              await window.AgriAPI.updateOrderStatus(orderId, newStatus);
              showToast(`Order #AGRI-${orderId} status updated to ${newStatus}!`, 'success');
              loadFarmerDashboard();
            } catch (err) {
              showToast('Failed to update status: ' + err.message, 'error');
            }
          });
        });
      }
    }
  }

  // Quick Stock Modal
  function openQuickStockModal(productId) {
    const prod = state.products.find(p => p.product_id === productId);
    if (!prod) return;

    document.getElementById('stock-modal-prod-id').value = prod.product_id;
    document.getElementById('stock-modal-prod-name').textContent = prod.product_name;
    document.getElementById('stock-modal-current').textContent = `${prod.quantity} units`;
    document.getElementById('stock-modal-new-qty').value = prod.quantity;

    openModal(updateStockModal);
  }

  // Quick Price Modal
  function openQuickPriceModal(productId) {
    const prod = state.products.find(p => p.product_id === productId);
    if (!prod) return;

    document.getElementById('price-modal-prod-id').value = prod.product_id;
    document.getElementById('price-modal-prod-name').textContent = prod.product_name;
    document.getElementById('price-modal-current').textContent = `₹${parseFloat(prod.price).toFixed(2)}`;
    document.getElementById('price-modal-new-price').value = prod.price;

    openModal(updatePriceModal);
  }

  // Product Detail Modal
  function openProductDetailModal(productId) {
    const p = state.products.find(item => item.product_id === productId);
    if (!p) return;

    document.getElementById('detail-img').src = p.image_url;
    document.getElementById('detail-name').textContent = p.product_name;
    document.getElementById('detail-category').textContent = p.category;
    document.getElementById('detail-price').textContent = `₹${parseFloat(p.price).toFixed(2)}`;
    document.getElementById('detail-stock').textContent = `${p.quantity} units available`;
    document.getElementById('detail-desc').textContent = p.description || 'Grown with natural fertilizers and traditional sustainable farming methods.';
    document.getElementById('detail-farmer-name').textContent = p.farmer_name || 'Verified Farmer';
    document.getElementById('detail-farmer-contact').textContent = p.farmer_phone ? `📞 ${p.farmer_phone}` : 'Verified Farm Network';

    const btnDetailAdd = document.getElementById('btn-detail-add-cart');
    if (btnDetailAdd) {
      btnDetailAdd.disabled = p.quantity <= 0;
      btnDetailAdd.onclick = () => {
        addToCart(p.product_id);
        closeModal(productDetailModal);
      };
    }

    openModal(productDetailModal);
  }

  // Live Database Inspector
  async function openDbInspector() {
    try {
      const data = await window.AgriAPI.getDatabaseTables();
      state.dbTables = data;

      const engineBadge = document.getElementById('db-modal-engine-badge');
      if (engineBadge) {
        engineBadge.textContent = data.isMySQL
          ? 'Active Engine: MySQL Database (Relational Schema Verified)'
          : `Active Engine: ${data.storageEngine || 'Browser LocalStorage'}`;
      }

      renderDbTable('users');
      openModal(dbInspectorModal);
    } catch (err) {
      showToast('Could not inspect database tables: ' + err.message, 'error');
    }
  }

  function renderDbTable(tableName) {
    const container = document.getElementById('db-table-content');
    const schemaDesc = document.getElementById('db-schema-description');
    if (!container || !state.dbTables) return;

    document.querySelectorAll('.db-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.table === tableName);
    });

    if (tableName === 'users') {
      schemaDesc.innerHTML = `<strong>Table Schema:</strong> <code>users(user_id INT PK, name VARCHAR(100), email VARCHAR(100), phone VARCHAR(15), password VARCHAR(255), role VARCHAR(20))</code>`;
      const rows = state.dbTables.users || [];
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>user_id (PK)</th>
              <th>name</th>
              <th>email</th>
              <th>phone</th>
              <th>role</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(u => `
              <tr>
                <td><strong>${u.user_id}</strong></td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td><span class="status-pill status-${u.role === 'farmer' ? 'delivered' : 'confirmed'}">${u.role}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tableName === 'products') {
      schemaDesc.innerHTML = `<strong>Table Schema:</strong> <code>products(product_id INT PK, farmer_id INT FK, product_name VARCHAR(150), category VARCHAR(50), price DECIMAL(10,2), quantity INT, description TEXT)</code>`;
      const rows = state.dbTables.products || [];
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>product_id (PK)</th>
              <th>farmer_id (FK)</th>
              <th>product_name</th>
              <th>category</th>
              <th>price (DECIMAL)</th>
              <th>quantity (INT)</th>
              <th>description</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(p => `
              <tr>
                <td><strong>${p.product_id}</strong></td>
                <td>User #${p.farmer_id}</td>
                <td>${p.product_name}</td>
                <td>${p.category}</td>
                <td>₹${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td style="max-width: 250px; font-size: 0.8rem; color: var(--text-muted);">${p.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tableName === 'orders') {
      schemaDesc.innerHTML = `<strong>Table Schema:</strong> <code>orders(order_id INT PK, customer_id INT FK, order_date DATE, total_amount DECIMAL(10,2), delivery_address VARCHAR(255), status VARCHAR(30))</code>`;
      const rows = state.dbTables.orders || [];
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>order_id (PK)</th>
              <th>customer_id (FK)</th>
              <th>order_date</th>
              <th>total_amount</th>
              <th>delivery_address</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(o => `
              <tr>
                <td><strong>#${o.order_id}</strong></td>
                <td>Customer #${o.customer_id}</td>
                <td>${o.order_date}</td>
                <td><strong>₹${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                <td style="max-width: 200px; font-size: 0.8rem;">${o.delivery_address}</td>
                <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tableName === 'order_items') {
      schemaDesc.innerHTML = `<strong>Table Schema:</strong> <code>order_items(item_id INT PK, order_id INT FK, product_id INT FK, quantity INT, price DECIMAL(10,2))</code>`;
      const rows = state.dbTables.order_items || [];
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>item_id (PK)</th>
              <th>order_id (FK)</th>
              <th>product_id (FK)</th>
              <th>quantity (INT)</th>
              <th>price (DECIMAL)</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(i => `
              <tr>
                <td><strong>#${i.item_id}</strong></td>
                <td>Order #${i.order_id}</td>
                <td>Product #${i.product_id}</td>
                <td>${i.quantity}</td>
                <td>₹${parseFloat(i.price).toFixed(2)}</td>
                <td><strong>₹${(parseFloat(i.price) * i.quantity).toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // User Switcher Modal
  async function openUserSwitcherModal() {
    const grid = document.getElementById('user-switch-list');
    if (!grid) return;

    const users = await window.AgriAPI.getUsers();
    grid.innerHTML = users.map(u => `
      <div class="user-switch-card ${state.currentUser?.user_id === u.user_id ? 'active' : ''}" data-user-id="${u.user_id}">
        <div class="user-avatar-small" style="background:${u.role === 'farmer' ? '#15803d' : '#d97706'}">
          ${u.name.charAt(0)}
        </div>
        <div>
          <div style="font-weight:700; font-size:0.9rem;">${u.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${u.role.toUpperCase()} • ${u.phone || u.email}</div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.user-switch-card').forEach(card => {
      card.addEventListener('click', () => {
        const uId = parseInt(card.dataset.userId, 10);
        const selected = users.find(u => u.user_id === uId);
        if (selected) {
          state.currentUser = selected;
          localStorage.setItem('agri_current_user', JSON.stringify(selected));
          updateUserUI();
          closeModal(userModal);
          showToast(`Switched active profile to ${selected.name} (${selected.role})`, 'success');

          // Refresh page specific views
          if (page === 'products') renderFilteredProducts();
          if (page === 'cart') renderCustomerOrdersHistory();
          if (page === 'home') loadFarmerDashboard();
        }
      });
    });

    openModal(userModal);
  }

  // Modal helpers
  function openModal(el) {
    if (el) el.classList.add('active');
  }

  function closeModal(el) {
    if (el) el.classList.remove('active');
  }

  // ========================================================
  // SHARED EVENT BINDINGS
  // ========================================================
  function bindSharedEvents() {
    // Nav DB Inspector
    const navDbInspector = document.getElementById('nav-db-inspector');
    if (navDbInspector) navDbInspector.addEventListener('click', openDbInspector);

    // Profile switch
    const btnSwitchUser = document.getElementById('btn-switch-user');
    if (btnSwitchUser) btnSwitchUser.addEventListener('click', openUserSwitcherModal);

    // Modal Close Triggers
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) closeModal(modal);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // DB Inspector Tab Switching
    document.querySelectorAll('.db-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        renderDbTable(btn.dataset.table);
      });
    });

    // Reset Demo Data
    const btnResetDemo = document.getElementById('btn-db-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('Reset database/storage to default demo records?')) {
          window.AgriAPI.resetDemoData();
          showToast('Data reset to default successfully!', 'success');
          loadProducts().then(() => {
            if (page === 'home') initHomePage();
            if (page === 'products') renderFilteredProducts();
            if (page === 'categories') initCategoriesPage();
            if (page === 'cart') renderCartPageItems();
            openDbInspector();
          });
        }
      });
    }

    // Farmer Add Product Form Submit
    const formAddProduct = document.getElementById('form-add-product');
    if (formAddProduct) {
      formAddProduct.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!state.currentUser || state.currentUser.role !== 'farmer') {
          showToast('Only farmers can list agricultural products.', 'error');
          return;
        }

        const name = document.getElementById('new-prod-name').value.trim();
        const category = document.getElementById('new-prod-category').value;
        const price = parseFloat(document.getElementById('new-prod-price').value);
        const quantity = parseInt(document.getElementById('new-prod-qty').value, 10);
        const description = document.getElementById('new-prod-desc').value.trim();
        const imageUrl = document.getElementById('new-prod-img').value.trim();

        if (!name || isNaN(price) || isNaN(quantity)) {
          showToast('Please fill all required product fields correctly.', 'warning');
          return;
        }

        try {
          const btnSubmit = formAddProduct.querySelector('button[type="submit"]');
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Listing Product...';

          await window.AgriAPI.createProduct({
            farmer_id: state.currentUser.user_id,
            product_name: name,
            category,
            price,
            quantity,
            description,
            image_url: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
          });

          formAddProduct.reset();
          closeModal(addProductModal);
          showToast(`"${name}" is now listed on the marketplace!`, 'success');

          await loadProducts();
          if (page === 'home') {
            initHomePage();
            loadFarmerDashboard();
          } else if (page === 'products') {
            renderFilteredProducts();
          }
        } catch (err) {
          showToast('Failed to list product: ' + err.message, 'error');
        } finally {
          const btnSubmit = formAddProduct.querySelector('button[type="submit"]');
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'List Product on Marketplace';
        }
      });
    }

    // Farmer Open Add Product Modal Trigger
    const btnOpenAddProduct = document.getElementById('btn-open-add-product');
    if (btnOpenAddProduct) {
      btnOpenAddProduct.addEventListener('click', () => {
        if (state.currentUser?.role !== 'farmer') {
          showToast('Please switch to a farmer account to list products.', 'warning');
          openUserSwitcherModal();
          return;
        }
        openModal(addProductModal);
      });
    }

    // Farmer Quick Stock Form
    const formUpdateStock = document.getElementById('form-update-stock');
    if (formUpdateStock) {
      formUpdateStock.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pId = parseInt(document.getElementById('stock-modal-prod-id').value, 10);
        const newStock = parseInt(document.getElementById('stock-modal-new-qty').value, 10);

        if (isNaN(newStock) || newStock < 0) {
          showToast('Please enter a valid stock quantity.', 'warning');
          return;
        }

        try {
          await window.AgriAPI.updateStock(pId, newStock);
          closeModal(updateStockModal);
          showToast('Stock quantity updated successfully!', 'success');
          await loadProducts();
          if (page === 'home') {
            initHomePage();
            loadFarmerDashboard();
          } else if (page === 'products') {
            renderFilteredProducts();
          }
        } catch (err) {
          showToast('Failed to update stock: ' + err.message, 'error');
        }
      });
    }

    // Farmer Quick Price Form
    const formUpdatePrice = document.getElementById('form-update-price');
    if (formUpdatePrice) {
      formUpdatePrice.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pId = parseInt(document.getElementById('price-modal-prod-id').value, 10);
        const newPrice = parseFloat(document.getElementById('price-modal-new-price').value);

        if (isNaN(newPrice) || newPrice <= 0) {
          showToast('Please enter a valid price greater than zero.', 'warning');
          return;
        }

        try {
          await window.AgriAPI.updatePrice(pId, newPrice);
          closeModal(updatePriceModal);
          showToast('Product price updated successfully!', 'success');
          await loadProducts();
          if (page === 'home') {
            initHomePage();
            loadFarmerDashboard();
          } else if (page === 'products') {
            renderFilteredProducts();
          }
        } catch (err) {
          showToast('Failed to update price: ' + err.message, 'error');
        }
      });
    }

    // Preset Image Selectors
    document.querySelectorAll('.sample-img-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const url = pill.dataset.url;
        const input = document.getElementById('new-prod-img');
        const preview = document.getElementById('add-product-img-preview');
        const noImg = document.getElementById('add-product-no-img');
        if (input) input.value = url;
        if (preview) {
          preview.src = url;
          preview.style.display = 'block';
        }
        if (noImg) noImg.style.display = 'none';
      });
    });

    const newProdImgInput = document.getElementById('new-prod-img');
    if (newProdImgInput) {
      newProdImgInput.addEventListener('input', (e) => {
        const preview = document.getElementById('add-product-img-preview');
        const noImg = document.getElementById('add-product-no-img');
        if (preview) {
          if (e.target.value.trim()) {
            preview.src = e.target.value.trim();
            preview.style.display = 'block';
            if (noImg) noImg.style.display = 'none';
          } else {
            preview.style.display = 'none';
            if (noImg) noImg.style.display = 'block';
          }
        }
      });
    }
  }

  // ========================================================
  // TOAST NOTIFICATIONS
  // ========================================================
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  window.showToast = showToast;

  // Run start
  await init();
});
