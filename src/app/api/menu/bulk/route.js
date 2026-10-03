import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Category from '@/models/Category';

export async function GET() {
  try {
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const items = await MenuItem.find({}).populate('categoryId').lean();
      return NextResponse.json({ success: true, count: items.length, items });
    }

    return NextResponse.json({ success: true, count: memoryDb.menuItems.length, items: memoryDb.menuItems });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const rawItems = Array.isArray(body) ? body : body.items;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of menu items to feed' },
        { status: 400 }
      );
    }

    const { conn, isFallback } = await connectDB();

    // Map each item with defaults
    const formattedItems = rawItems.map((item, idx) => ({
      _id: item._id || `item_feed_${Date.now()}_${idx}`,
      name: item.name || `Special Dish ${idx + 1}`,
      description: item.description || '',
      price: Number(item.price) || 250,
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      categoryId: item.categoryId || 'cat_mains',
      foodType: item.foodType || 'veg',
      image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isBestseller: item.isBestseller !== undefined ? item.isBestseller : false,
      spicyLevel: item.spicyLevel !== undefined ? Number(item.spicyLevel) : 1,
      preparationTime: item.preparationTime ? Number(item.preparationTime) : 15,
      tags: Array.isArray(item.tags) ? item.tags : item.tags ? [item.tags] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (!isFallback && conn) {
      // If replaceMode is true, delete existing items first
      if (body.replaceMode) {
        await MenuItem.deleteMany({});
      }

      const inserted = await MenuItem.insertMany(
        formattedItems.map((it) => ({
          ...it,
          _id: undefined, // Let mongo generate ObjectIds for new documents
        }))
      );

      return NextResponse.json({
        success: true,
        message: `Successfully fed ${inserted.length} menu items into database!`,
        count: inserted.length,
        items: inserted,
      });
    }

    // In-memory update
    if (body.replaceMode) {
      memoryDb.menuItems = formattedItems;
    } else {
      memoryDb.menuItems.push(...formattedItems);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fed ${formattedItems.length} menu items into memory store!`,
      count: memoryDb.menuItems.length,
      items: memoryDb.menuItems,
    });
  } catch (error) {
    console.error('Bulk menu feed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
