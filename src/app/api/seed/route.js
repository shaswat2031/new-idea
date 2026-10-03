import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';
import Table from '@/models/Table';
import Settings from '@/models/Settings';
import { initialCategories, initialMenuItems, initialTables, initialSettings, defaultAdmin } from '@/lib/seedData';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      await Category.deleteMany({});
      await MenuItem.deleteMany({});
      await Table.deleteMany({});
      await Settings.deleteMany({});

      // Seed categories
      const catDocs = await Category.insertMany(
        initialCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          displayOrder: c.displayOrder,
          isActive: c.isActive,
        }))
      );

      const catMap = {};
      catDocs.forEach((doc) => {
        catMap[doc.slug] = doc._id;
      });

      // Seed menu items
      const menuDocs = initialMenuItems.map((item) => {
        const catSlug = item.categoryId.replace('cat_', '');
        const mappedCatId = catMap[catSlug] || catDocs[0]._id;
        return {
          ...item,
          _id: undefined,
          categoryId: mappedCatId,
        };
      });
      await MenuItem.insertMany(menuDocs);

      // Seed tables
      await Table.insertMany(
        initialTables.map((t) => ({
          tableNumber: t.tableNumber,
          label: t.label,
          capacity: t.capacity,
          location: t.location,
          status: t.status,
        }))
      );

      // Seed settings
      await Settings.create(initialSettings);

      // Seed admin user if none exists
      const existingUser = await User.findOne({ email: 'admin@restaurant.com' });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          name: defaultAdmin.name,
          email: defaultAdmin.email,
          password: hashedPassword,
          role: 'admin',
        });
      }

      return NextResponse.json({
        success: true,
        message: `Database initialized and seeded with ${initialMenuItems.length} dishes and categories!`,
      });
    }

    // Reset memory DB
    memoryDb.categories = JSON.parse(JSON.stringify(initialCategories));
    memoryDb.menuItems = JSON.parse(JSON.stringify(initialMenuItems));
    memoryDb.tables = JSON.parse(JSON.stringify(initialTables));
    memoryDb.settings = JSON.parse(JSON.stringify(initialSettings));

    return NextResponse.json({
      success: true,
      message: `In-memory database state reloaded and seeded with ${initialMenuItems.length} dishes!`,
    });
  } catch (error) {
    console.error('Database seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
