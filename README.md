# 🌾 Online Agriculture Product MarketPlace

A modern, elegant, and fully functional web application that directly connects agricultural farmers with customers. Farmers can list agricultural products, update real-time prices, and manage available stock. Customers can explore farm-fresh harvests, search/filter by category, and place orders with direct delivery addresses.

---

## 🌟 Key Highlights & Architecture

- **Dual-Mode Execution (Zero Friction Setup)**:
  1. **Option A: Pure Front-End Mode**: Open `public/index.html` directly in any web browser. Runs seamlessly with **pure HTML, CSS, and Vanilla JavaScript (no frameworks)**, using a client-side relational storage engine with localStorage persistence.
  2. **Option B: Full-Stack Express.js + MySQL Mode**: Run `npm start` to launch the **Express.js REST API** (`server.js`) connected to **MySQL**. If MySQL is not running locally, the server automatically activates an in-memory relational engine with identical SQL schema and transactions so it **never crashes**.
- **Real Agricultural Photos**: High-resolution, authentic produce photography across vegetables, grains, fruits, dairy, and spices.
- **Farmer Management Portal**: Allows registered farmers to list new crops, update product pricing, modify available stock, and fulfill customer orders.
- **Customer Shopping Experience**: Real-time search, category filters, responsive product cards, sliding cart drawer, and complete checkout workflow.
- **Live Database Inspector**: An interactive modal tab in the UI displaying all 4 requested tables (`users`, `products`, `orders`, `order_items`) with live row updates.

---

## 📊 Database Schema (MySQL)

The database schema strictly adheres to the requested relational architecture:

### 1. `users` Table
| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `INT` | **PRIMARY KEY**, Auto-Increment | Unique User ID |
| `name` | `VARCHAR(100)` | NOT NULL | User's full name |
| `email` | `VARCHAR(100)` | NOT NULL, UNIQUE | User's email address |
| `phone` | `VARCHAR(15)` | Optional | Contact phone number |
| `password` | `VARCHAR(255)` | NOT NULL | Account password |
| `role` | `VARCHAR(20)` | NOT NULL | `'farmer'`, `'customer'`, or `'admin'` |

### 2. `products` Table
| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `product_id` | `INT` | **PRIMARY KEY**, Auto-Increment | Unique Product ID |
| `farmer_id` | `INT` | **FOREIGN KEY** (references `users.user_id`) | ID of the farmer grower |
| `product_name`| `VARCHAR(150)`| NOT NULL | Name of agricultural produce |
| `category` | `VARCHAR(50)` | NOT NULL | Vegetables, Fruits, Grains, etc. |
| `price` | `DECIMAL(10,2)`| NOT NULL | Price per unit (kg, box, litre) |
| `quantity` | `INT` | NOT NULL, DEFAULT 0 | Real-time harvest stock |
| `description`| `TEXT` | Optional | Crop details, cultivation method |
| `image_url` | `TEXT` | Optional | Direct link to authentic crop photo |

### 3. `orders` Table
| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `order_id` | `INT` | **PRIMARY KEY**, Auto-Increment | Unique Order ID |
| `customer_id`| `INT` | **FOREIGN KEY** (references `users.user_id`) | ID of placing customer |
| `order_date` | `DATE` | NOT NULL | Date order was placed |
| `total_amount`| `DECIMAL(10,2)`| NOT NULL | Total payable order amount |
| `delivery_address` | `VARCHAR(255)` | NOT NULL | Customer delivery address |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT `'Pending'` | Status: Pending, Confirmed, Shipped, Delivered |

### 4. `order_items` Table
| Column Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `item_id` | `INT` | **PRIMARY KEY**, Auto-Increment | Unique Order Item ID |
| `order_id` | `INT` | **FOREIGN KEY** (references `orders.order_id`) | Associated Order ID |
| `product_id` | `INT` | **FOREIGN KEY** (references `products.product_id`) | Ordered Product ID |
| `quantity` | `INT` | NOT NULL | Ordered item quantity |
| `price` | `DECIMAL(10,2)`| NOT NULL | Unit price at time of purchase |

---

## 🚀 How to Run the Application

### Method 1: Running with Node.js & Express.js (Recommended)

1. Open PowerShell or Terminal in this folder:
   ```bash
   cd "c:\Users\saisr\OneDrive\Desktop\Online Agriculture Product Market Place"
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Method 2: Running Standalone Front-End (No Server Needed)

Simply double-click:
```
public/index.html
```
Or open it with your browser (`file:///.../public/index.html`) or VS Code Live Server. The application automatically detects standalone mode and runs with zero external dependencies!

### Method 3: Connecting to a Real MySQL Database

1. Open your MySQL client (e.g. MySQL Workbench, phpMyAdmin, or `mysql` CLI).
2. Execute the provided SQL scripts:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
3. Update `.env` with your MySQL credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=agriculture_marketplace
   DB_PORT=3306
   ```
4. Run `npm start`. The server will log:
   `[Database] Successfully connected to MySQL database: agriculture_marketplace`

---

## 📱 Dedicated Pages & Multi-Page Navigation

The website features individual, interconnected pages accessible from the first page (`index.html`):

1. **🏠 Home Page (`index.html`)**:
   - Compelling hero presentation with impact stats (500+ Local Farmers, ₹0 Middleman Fees, 100% Fresh Guarantee).
   - Quick Category preview cards that link directly to corresponding category views.
   - Featured Fresh Harvest produce cards with quick basket add.
   - About Us teaser section and Farmer Hub control center.

2. **🥦 Products Page (`products.html`)**:
   - Complete produce catalog with real-time category filtering (Vegetables, Fruits, Grains, Dairy, Tubers).
   - Instant search across product names, descriptions, and farmer names.
   - Stock & price sorting (Low to High, High to Low, Stock Count).
   - Farmer ownership controls: **"📦 Update Stock"** and **"💰 Update Price"** directly on product cards.
   - **"+ List New Agricultural Product"** modal for growers.

3. **🏷️ Categories Page (`categories.html`)**:
   - Visual showcase for each agricultural category with authentic produce photography.
   - Interactive category switching that filters and displays available harvests below on demand.
   - URL parameter support (e.g. `categories.html?cat=Vegetables` or `categories.html?cat=Fruits`).

4. **🧺 Cart & Checkout Page (`cart.html`)**:
   - Itemized basket list with produce thumbnails, farmer details, unit prices, quantity increment/decrement (`+` / `-`), item removal, and empty basket button.
   - Order confirmation and delivery address form (`Delivery_address VARCHAR 255`).
   - Order placement with automatic product stock deduction and database transaction.
   - Order tracking and past placed orders history list with color-coded status badges.

5. **ℹ️ About Us Page (`about.html`)**:
   - Mission and philosophy: Eliminating middlemen to ensure fair remuneration for farmers.
   - 4-step "How the Agriculture Marketplace Works" visual roadmap.
   - Spotlight profiles of featured local growers (*Kisan Patel*, *Anita Sharma*, *Rajesh Verma*).
   - Quality and sustainability pledge.
   - Click the top right profile pill to toggle between:
     - **Kisan Patel** (Farmer)
     - **Anita Sharma** (Farmer)
     - **Rajesh Verma** (Farmer)
     - **Ramesh Kumar** (Customer)
     - **Priya Reddy** (Customer)
2. **Farmer Hub & Stock/Price Updates**:
   - Access **Farmer Hub** from the top menu.
   - View your harvest statistics: Total Listed Products, Total Stock in kg, Pending Orders, and Total Revenue.
   - Click **"+ List New Agricultural Product"** to list crops with photos and descriptions.
   - Click **"📦 Update Stock"** or **"💰 Update Price"** directly in the inventory table or on product cards for immediate updates.
   - Manage incoming customer orders and advance their status from `Pending` → `Confirmed` → `Shipped` → `Delivered`.
3. **Customer Marketplace & Ordering**:
   - Filter produce by category (Vegetables, Fruits, Grains, Dairy & Honey, Tubers).
   - Search across produce names, descriptions, and farmer names.
   - Add items to your basket, modify quantities, and open the slide-out drawer.
   - Enter your delivery address and confirm your order.
   - Stock quantities automatically decrease upon checkout.
4. **Live Database Inspector**:
   - Click **"🗄️ DB Tables (SQL)"** in the top navigation bar anytime to inspect the 4 live tables with schema definitions and rows.
