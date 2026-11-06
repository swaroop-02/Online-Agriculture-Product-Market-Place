/**
 * Online Agriculture Product MarketPlace
 * Initial Seed & Fallback Data
 * Real Photos from Unsplash
 */

const INITIAL_DATA = {
  users: [
    {
      user_id: 1,
      name: "Kisan Patel",
      email: "kisan.patel@agrimarket.com",
      phone: "+91 9876543210",
      password: "farmer123",
      role: "farmer"
    },
    {
      user_id: 2,
      name: "Anita Sharma",
      email: "anita.sharma@agrimarket.com",
      phone: "+91 9876543211",
      password: "farmer123",
      role: "farmer"
    },
    {
      user_id: 3,
      name: "Rajesh Verma",
      email: "rajesh.verma@agrimarket.com",
      phone: "+91 9876543212",
      password: "farmer123",
      role: "farmer"
    },
    {
      user_id: 4,
      name: "Ramesh Kumar",
      email: "ramesh.kumar@gmail.com",
      phone: "+91 9123456780",
      password: "customer123",
      role: "customer"
    },
    {
      user_id: 5,
      name: "Priya Reddy",
      email: "priya.reddy@gmail.com",
      phone: "+91 9123456781",
      password: "customer123",
      role: "customer"
    },
    {
      user_id: 6,
      name: "Vikram Malhotra",
      email: "vikram.m@gmail.com",
      phone: "+91 9123456782",
      password: "customer123",
      role: "customer"
    }
  ],

  products: [
    {
      product_id: 1,
      farmer_id: 1,
      product_name: "Organic Vine Tomatoes",
      category: "Vegetables",
      price: 45.00,
      quantity: 150,
      description: "Freshly harvested, pesticide-free, vine-ripened organic red tomatoes with rich flavor and juicy texture. Packed straight from our greenhouse polyhouse.",
      image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 2,
      farmer_id: 1,
      product_name: "Golden Sharbati Wheat Grain",
      category: "Grains & Cereals",
      price: 38.00,
      quantity: 500,
      description: "Premium high-protein golden wheat grain directly harvested from MP farmlands. Cleaned, destoned, and ideal for soft, fluffy rotis.",
      image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 3,
      farmer_id: 2,
      product_name: "Fresh Alphonso Mangoes (Ratnagiri)",
      category: "Fruits",
      price: 350.00,
      quantity: 60,
      description: "Naturally tree-ripened Alphonso mangoes celebrated for intense aroma, saffron pulp, and unmatched sweetness. GI-tagged authentic orchard produce.",
      image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 4,
      farmer_id: 2,
      product_name: "Crisp Mountain Spinach (Palak)",
      category: "Vegetables",
      price: 25.00,
      quantity: 80,
      description: "Tender, nutrient-rich emerald spinach leaves handpicked early morning. Packed with iron, calcium, and vitamins.",
      image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 5,
      farmer_id: 3,
      product_name: "Aged Traditional Basmati Rice",
      category: "Grains & Cereals",
      price: 115.00,
      quantity: 300,
      description: "Royal aged extra-long grain aromatic basmati rice from the foothills of the Himalayas. Elongates twice its size when cooked.",
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 6,
      farmer_id: 1,
      product_name: "Farm Fresh Orange Carrots",
      category: "Vegetables",
      price: 32.00,
      quantity: 120,
      description: "Crunchy, sweet farm carrots loaded with beta-carotene, washed and ready for salads, juices, halwa, or everyday cooking.",
      image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 7,
      farmer_id: 3,
      product_name: "Pure Raw Forest Honeycomb Honey",
      category: "Dairy & Honey",
      price: 420.00,
      quantity: 45,
      description: "Unprocessed, unfiltered multi-flora raw honey directly extracted from ethical bee apiaries located near mustard and eucalyptus reserves.",
      image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 8,
      farmer_id: 2,
      product_name: "Red Kufri Farm Potatoes",
      category: "Vegetables",
      price: 28.00,
      quantity: 250,
      description: "Firm, thin-skinned hill potatoes with balanced starch content. Perfect for boiling, roasting, and authentic regional curries.",
      image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 9,
      farmer_id: 1,
      product_name: "Organic Crisp Green Capsicum",
      category: "Vegetables",
      price: 55.00,
      quantity: 75,
      description: "Glossy, thick-walled bell peppers with sweet flavor and satisfying crunch. Grown under natural sunlight with drip irrigation.",
      image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 10,
      farmer_id: 3,
      product_name: "Fresh Farm A2 Desi Cow Milk (1L)",
      category: "Dairy & Honey",
      price: 75.00,
      quantity: 90,
      description: "Chilled whole milk from pasture-fed Gir cows, unadulterated, pasteurized, rich in nutrients and natural golden butterfat.",
      image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 11,
      farmer_id: 2,
      product_name: "Sweet Golden American Corn",
      category: "Vegetables",
      price: 20.00,
      quantity: 140,
      description: "Juicy, milky golden kernels on the cob, picked at peak sugar ripeness for roasting, boiling, chaat, and barbecue.",
      image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 12,
      farmer_id: 1,
      product_name: "Fresh Mahabaleshwar Strawberries",
      category: "Fruits",
      price: 120.00,
      quantity: 50,
      description: "Vibrant ruby-red sweet strawberries packed with antioxidants. Harvested fresh every dawn from hill-slope farms.",
      image_url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 13,
      farmer_id: 2,
      product_name: "Farm Fresh Green Sweet Peas",
      category: "Vegetables",
      price: 48.00,
      quantity: 110,
      description: "Sweet, tender whole green pods bursting with crisp young peas. Harvested daily with zero preservative treatment.",
      image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 14,
      farmer_id: 3,
      product_name: "Fresh Raw Turmeric Roots",
      category: "Tubers & Roots",
      price: 60.00,
      quantity: 85,
      description: "Organically grown golden finger turmeric roots with high curcumin concentration. Great for wellness tea, golden milk, and cooking.",
      image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 15,
      farmer_id: 1,
      product_name: "Cold-Pressed Pure Mustard Oil (1L)",
      category: "Dairy & Honey",
      price: 170.00,
      quantity: 65,
      description: "Traditionally expeller-extracted yellow mustard oil (kacchi ghani) with high pungency and distinct authentic aroma.",
      image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"
    },
    {
      product_id: 16,
      farmer_id: 2,
      product_name: "Nashik Pink Onions (Grade A)",
      category: "Vegetables",
      price: 30.00,
      quantity: 350,
      description: "Pungent, dry, medium-sized Grade A pink onions with excellent shelf life. Direct from the heartland of Maharashtra.",
      image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80"
    }
  ],

  orders: [
    {
      order_id: 1,
      customer_id: 4,
      order_date: "2026-11-04",
      total_amount: 380.00,
      delivery_address: "Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001",
      status: "Delivered"
    },
    {
      order_id: 2,
      customer_id: 5,
      order_date: "2026-11-05",
      total_amount: 495.00,
      delivery_address: "Villa 12, Palm Grove, Jubilee Hills, Hyderabad, Telangana - 500033",
      status: "Shipped"
    },
    {
      order_id: 3,
      customer_id: 4,
      order_date: "2026-11-06",
      total_amount: 225.00,
      delivery_address: "Flat 402, Green Meadows, MG Road, Pune, Maharashtra - 411001",
      status: "Pending"
    }
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

// Export to window if in browser
if (typeof window !== 'undefined') {
  window.INITIAL_DATA = INITIAL_DATA;
}
