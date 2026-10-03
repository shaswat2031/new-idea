import mongoose from 'mongoose';
import { initialCategories, initialMenuItems, initialTables, initialSettings, defaultAdmin } from './seedData';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qr_restaurant';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, isMemoryFallback: false };
}

// In-Memory fallback store for resilient zero-setup development
if (!global.__memoryDb) {
  global.__memoryDb = {
    users: [
      {
        _id: 'user_admin_1',
        name: 'Restaurant Manager',
        email: 'admin@restaurant.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    categories: JSON.parse(JSON.stringify(initialCategories)),
    menuItems: JSON.parse(JSON.stringify(initialMenuItems)),
    tables: JSON.parse(JSON.stringify(initialTables)),
    settings: JSON.parse(JSON.stringify(initialSettings)),
    orders: [
      {
        _id: 'ord_sample_1',
        orderNumber: 'ORD-1001',
        tableNumber: '3',
        customerName: 'Rahul Sharma',
        customerPhone: '9876543210',
        items: [
          {
            menuItemId: 'item_1',
            name: 'Paneer Tikka Angara',
            price: 320,
            quantity: 1,
            foodType: 'veg',
            notes: 'Extra spicy please',
          },
          {
            menuItemId: 'item_18',
            name: 'Garlic Butter Naan',
            price: 95,
            quantity: 2,
            foodType: 'veg',
            notes: '',
          },
          {
            menuItemId: 'item_26',
            name: 'Passion Fruit Mint Cooler',
            price: 190,
            quantity: 2,
            foodType: 'veg',
            notes: 'Less ice',
          },
        ],
        subtotal: 890,
        taxRate: 5,
        taxAmount: 44.5,
        total: 934.5,
        paymentMethod: 'counter',
        paymentStatus: 'pending',
        orderStatus: 'preparing',
        specialInstructions: 'Please bring drinks first.',
        createdAt: new Date(Date.now() - 1000 * 60 * 12),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
    payments: [],
  };
} else {
  // Sync memoryDb items with 32 items
  global.__memoryDb.categories = JSON.parse(JSON.stringify(initialCategories));
  global.__memoryDb.menuItems = JSON.parse(JSON.stringify(initialMenuItems));
}

export const memoryDb = global.__memoryDb;

export async function connectDB() {
  if (cached.conn) {
    return { conn: cached.conn, isFallback: false };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cached.isMemoryFallback = false;
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('⚠️ MongoDB connection could not be established; operating with memory state fallback.', err.message);
        cached.isMemoryFallback = true;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { conn: cached.conn, isFallback: cached.isMemoryFallback };
  } catch (e) {
    cached.promise = null;
    cached.isMemoryFallback = true;
    return { conn: null, isFallback: true };
  }
}

export function isUsingMemoryFallback() {
  return !cached.conn || cached.isMemoryFallback;
}
