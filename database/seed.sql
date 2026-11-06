-- ========================================================
-- Online Agriculture Product MarketPlace
-- Seed Data Insertion Script
-- ========================================================

USE agriculture_marketplace;

-- 1. Insert Users (Farmers and Customers)
INSERT INTO users (user_id, name, email, phone, password, role) VALUES
(1, 'Kisan Patel', 'kisan.patel@agrimarket.com', '+91 9876543210', 'farmer123', 'farmer'),
(2, 'Anita Sharma', 'anita.sharma@agrimarket.com', '+91 9876543211', 'farmer123', 'farmer'),
(3, 'Rajesh Verma', 'rajesh.verma@agrimarket.com', '+91 9876543212', 'farmer123', 'farmer'),
(4, 'Ramesh Kumar', 'ramesh.kumar@gmail.com', '+91 9123456780', 'customer123', 'customer'),
(5, 'Priya Reddy', 'priya.reddy@gmail.com', '+91 9123456781', 'customer123', 'customer'),
(6, 'Vikram Malhotra', 'vikram.m@gmail.com', '+91 9123456782', 'customer123', 'customer');

-- 2. Insert Agricultural Products (With Real Photos)
INSERT INTO products (product_id, farmer_id, product_name, category, price, quantity, description, image_url) VALUES
(1, 1, 'Organic Vine Tomatoes', 'Vegetables', 45.00, 150, 'Freshly harvested, pesticide-free, vine-ripened organic red tomatoes with rich flavor and juicy texture.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'),
(2, 1, 'Golden Sharbati Wheat Grain', 'Grains & Cereals', 38.00, 500, 'Premium high-protein golden wheat grain directly harvested from MP farmlands. Ideal for soft, fluffy rotis.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'),
(3, 2, 'Fresh Alphonso Mangoes (Ratnagiri)', 'Fruits', 350.00, 60, 'Naturally tree-ripened Alphonso mangoes celebrated for intense aroma, saffron pulp, and unmatched sweetness.', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80'),
(4, 2, 'Crisp Mountain Spinach (Palak)', 'Vegetables', 25.00, 80, 'Tender, nutrient-rich emerald spinach leaves handpicked early morning. Free from chemical spray.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80'),
(5, 3, 'Aged Traditional Basmati Rice', 'Grains & Cereals', 115.00, 300, 'Royal aged extra-long grain aromatic basmati rice. Non-sticky and fluffy after cooking.', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'),
(6, 1, 'Farm Fresh Orange Carrots', 'Vegetables', 32.00, 120, 'Crunchy, sweet farm carrots loaded with beta-carotene, washed and ready for salads, juices, or cooking.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80'),
(7, 3, 'Pure Raw Forest Honeycomb Honey', 'Dairy & Honey', 420.00, 45, 'Unprocessed, unfiltered multi-flora raw honey directly extracted from ethical bee apiaries located near orchards.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'),
(8, 2, 'Red Kufri Farm Potatoes', 'Vegetables', 28.00, 250, 'Firm, thin-skinned hill potatoes with balanced starch content. Perfect for boiling, roasting, and curries.', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'),
(9, 1, 'Organic Crisp Green Capsicum', 'Vegetables', 55.00, 75, 'Glossy, thick-walled bell peppers with sweet flavor and satisfying crunch. Grown in modern drip-irrigated polyhouses.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80'),
(10, 3, 'Fresh Farm A2 Desi Cow Milk (1L)', 'Dairy & Honey', 75.00, 90, 'Chilled whole milk from pasture-fed Gir cows, unadulterated, pasteurized, rich in nutrients and natural butterfat.', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'),
(11, 2, 'Sweet Golden American Corn', 'Vegetables', 20.00, 140, 'Juicy, milky golden kernels on the cob, picked at peak sugar ripeness for roasting, boiling, and snacks.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80'),
(12, 1, 'Fresh Mahabaleshwar Strawberries', 'Fruits', 120.00, 50, 'Vibrant ruby-red sweet strawberries packed with antioxidants. Harvested fresh every morning.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80');

-- 3. Insert Initial Orders
INSERT INTO orders (order_id, customer_id, order_date, total_amount, delivery_address, status) VALUES
(1, 4, '2026-11-04', 380.00, 'Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001', 'Delivered'),
(2, 5, '2026-11-05', 495.00, 'Villa 12, Palm Grove, Jubilee Hills, Hyderabad, Telangana - 500033', 'Shipped'),
(3, 4, '2026-11-06', 225.00, 'Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001', 'Pending');

-- 4. Insert Order Items
INSERT INTO order_items (item_id, order_id, product_id, quantity, price) VALUES
(1, 1, 1, 2, 45.00),     -- 2x Tomatoes (90)
(2, 1, 3, 1, 350.00),    -- 1x Mangoes (350) minus discount demo = 380
(3, 2, 5, 3, 115.00),    -- 3x Basmati Rice (345)
(4, 2, 10, 2, 75.00),    -- 2x Milk (150) = 495
(5, 3, 6, 2, 32.00),     -- 2x Carrots (64)
(6, 3, 9, 2, 55.00),     -- 2x Capsicum (110)
(7, 3, 4, 2, 25.00);     -- 2x Spinach (50) = 224 (round 225)
