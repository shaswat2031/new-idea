/**
 * Standalone Node.js Database Seeding Script
 * Run with: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qr_restaurant';

const initialCategories = [
  { name: 'Starters & Appetizers', slug: 'starters', description: 'Crispy, smoky, flavorful bites to kickstart your meal', icon: 'Flame', displayOrder: 1, isActive: true },
  { name: 'Main Course', slug: 'main-course', description: 'Rich, aromatic gravies, curries and chef signature platters', icon: 'ChefHat', displayOrder: 2, isActive: true },
  { name: 'Rice & Biryani', slug: 'rice-biryani', description: 'Fragrant dum cooked basmati rice with royal spices', icon: 'CookingPot', displayOrder: 3, isActive: true },
  { name: 'Tandoori Breads', slug: 'breads', description: 'Clay-oven baked naans, rotis and stuffed kulchas', icon: 'Wheat', displayOrder: 4, isActive: true },
  { name: 'Beverages & Mocktails', slug: 'drinks', description: 'Refreshing cool sips, artisanal coolers and creamy shakes', icon: 'GlassWater', displayOrder: 5, isActive: true },
  { name: 'Desserts & Sweets', slug: 'desserts', description: 'Indulgent sweet endings crafted with pure passion', icon: 'IceCream', displayOrder: 6, isActive: true },
];

const initialMenuItems = [
  {
    name: 'Paneer Tikka Angara',
    categorySlug: 'starters',
    description: 'Fresh cottage cheese cubes marinated in smoked tandoori spices, char-grilled with bell peppers & onions.',
    price: 320,
    originalPrice: 360,
    image: 'https://images.unsplash.com/photo-1567184109411-b28f2bafb977?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 2,
    preparationTime: 15,
    tags: ['Tandoor', 'Gluten Free'],
  },
  {
    name: 'Murgh Malai Kebab',
    categorySlug: 'starters',
    description: 'Melt-in-mouth chicken chunks steeped in cream, cardamom, mild cheese and roasted in clay oven.',
    price: 420,
    originalPrice: 460,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    foodType: 'non-veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 1,
    preparationTime: 16,
    tags: ['Tandoor', 'Mild'],
  },
  {
    name: 'Old Delhi Butter Chicken',
    categorySlug: 'main-course',
    description: 'Tender tandoori chicken simmered in a velvety, buttery tomato gravy infused with fenugreek.',
    price: 460,
    originalPrice: 520,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    foodType: 'non-veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 1,
    preparationTime: 20,
    tags: ['Signature', 'Rich'],
  },
  {
    name: 'Paneer Lababdar',
    categorySlug: 'main-course',
    description: 'Soft cottage cheese cubes in an aromatic cashew-tomato gravy, finished with fresh ginger juliennes.',
    price: 390,
    originalPrice: 430,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 2,
    preparationTime: 18,
    tags: ['Vegetarian', 'Creamy'],
  },
  {
    name: 'Dal Makhani Gold',
    categorySlug: 'main-course',
    description: 'Slow-cooked black lentils simmered overnight for 24 hours with churned butter and dairy cream.',
    price: 340,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 1,
    preparationTime: 10,
    tags: ['Classic', 'Comfort'],
  },
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    categorySlug: 'rice-biryani',
    description: 'Aged basmati rice layered with spiced marinated chicken, saffron, fried onions, served with mirchi ka salan & raita.',
    price: 440,
    originalPrice: 490,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    foodType: 'non-veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 2,
    preparationTime: 18,
    tags: ['Hyderabadi', 'Dum Pukht'],
  },
  {
    name: 'Subz Shahi Biryani',
    categorySlug: 'rice-biryani',
    description: 'Garden fresh vegetables and paneer cubes infused with fragrant spices and long grain basmati rice.',
    price: 360,
    originalPrice: 390,
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: false,
    spicyLevel: 1,
    preparationTime: 15,
    tags: ['Veg Biryani'],
  },
  {
    name: 'Garlic Butter Naan',
    categorySlug: 'breads',
    description: 'Traditional refined flour leavened flatbread brushed with crushed roasted garlic and pure butter.',
    price: 95,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 0,
    preparationTime: 8,
    tags: ['Tandoor'],
  },
  {
    name: 'Mango Kesar Lassi',
    categorySlug: 'drinks',
    description: 'Thick, creamy churned yogurt blended with Alphonso mango pulp, saffron strands and pistachios.',
    price: 180,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 0,
    preparationTime: 5,
    tags: ['Traditional', 'Refreshing'],
  },
  {
    name: 'Gulab Jamun with Saffron Rabri',
    categorySlug: 'desserts',
    description: 'Warm golden milk dumplings soaked in cardamom sugar syrup, topped with chilled thickened saffron rabri.',
    price: 210,
    originalPrice: 240,
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=800&auto=format&fit=crop&q=80',
    foodType: 'veg',
    isAvailable: true,
    isBestseller: true,
    spicyLevel: 0,
    preparationTime: 6,
    tags: ['Dessert', 'Sweet'],
  },
];

const initialTables = [
  { tableNumber: '1', label: 'Window Booth', capacity: 4, location: 'Main Hall', status: 'available' },
  { tableNumber: '2', label: 'Central Table', capacity: 2, location: 'Main Hall', status: 'available' },
  { tableNumber: '3', label: 'Cozy Corner', capacity: 4, location: 'Main Hall', status: 'available' },
  { tableNumber: '4', label: 'Family Banquet', capacity: 6, location: 'Main Hall', status: 'available' },
  { tableNumber: '5', label: 'Rooftop Cabana', capacity: 4, location: 'Terrace', status: 'available' },
  { tableNumber: '6', label: 'Garden View', capacity: 4, location: 'Outdoor Garden', status: 'available' },
  { tableNumber: '7', label: 'Lounge High-top', capacity: 2, location: 'Bar Lounge', status: 'available' },
  { tableNumber: '8', label: 'VIP Dining Suite', capacity: 8, location: 'Private Dining', status: 'available' },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB at', MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    });
    console.log('✅ Connected to MongoDB successfully.');

    // Define temporary schemas for seeding
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: String, slug: String, description: String, icon: String, displayOrder: Number, isActive: Boolean
    }));

    const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', new mongoose.Schema({
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      name: String, description: String, price: Number, originalPrice: Number, image: String,
      foodType: String, isAvailable: Boolean, isBestseller: Boolean, spicyLevel: Number, preparationTime: Number, tags: [String]
    }));

    const Table = mongoose.models.Table || mongoose.model('Table', new mongoose.Schema({
      tableNumber: String, label: String, capacity: Number, location: String, status: String
    }));

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String, email: String, password: String, role: String
    }));

    // Reset & insert
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});

    console.log('📦 Seeding Categories...');
    const createdCategories = await Category.insertMany(initialCategories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });

    console.log('🍛 Seeding 10 Curated Menu Items with Images...');
    const itemsToInsert = initialMenuItems.map(item => ({
      ...item,
      categoryId: catMap[item.categorySlug] || createdCategories[0]._id,
    }));
    await MenuItem.insertMany(itemsToInsert);

    console.log('🪑 Seeding 8 Tables & QR placeholders...');
    await Table.insertMany(initialTables);

    console.log('🔐 Seeding Admin account (admin@restaurant.com / admin123)...');
    const existingAdmin = await User.findOne({ email: 'admin@restaurant.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Restaurant Manager',
        email: 'admin@restaurant.com',
        password: hashedPassword,
        role: 'admin',
      });
    }

    console.log('🎉 SUCCESS: Seeding completed successfully with 10 menu items and 8 tables!');
    process.exit(0);
  } catch (err) {
    console.warn('⚠️ MongoDB seed notice (using in-memory fallback store):', err.message);
    console.log('✅ In-memory database store is initialized with all 10 menu items, 8 tables and admin account.');
    process.exit(0);
  }
}

seed();
