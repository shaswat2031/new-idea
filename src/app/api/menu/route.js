import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Category from '@/models/Category';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const foodType = searchParams.get('foodType');
    const search = searchParams.get('search');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const query = {};
      if (category && category !== 'all') {
        // can be category id or category slug
        const catDoc = await Category.findOne({ $or: [{ _id: category }, { slug: category }] });
        if (catDoc) {
          query.categoryId = catDoc._id;
        }
      }
      if (foodType && foodType !== 'all') {
        query.foodType = foodType;
      }
      if (availableOnly) {
        query.isAvailable = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      const items = await MenuItem.find(query).populate('categoryId').sort({ isBestseller: -1, name: 1 }).lean();
      return NextResponse.json({ success: true, items });
    }

    // In-memory fallback
    let items = [...memoryDb.menuItems];

    if (category && category !== 'all') {
      const targetCat = memoryDb.categories.find(
        (c) => c._id === category || c.slug === category || c.name.toLowerCase() === category.toLowerCase()
      );
      if (targetCat) {
        items = items.filter((i) => i.categoryId === targetCat._id || i.categoryId === targetCat.slug);
      }
    }

    if (foodType && foodType !== 'all') {
      items = items.filter((i) => i.foodType === foodType);
    }

    if (availableOnly) {
      items = items.filter((i) => i.isAvailable);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      originalPrice,
      categoryId,
      foodType,
      image,
      isAvailable,
      isBestseller,
      spicyLevel,
      preparationTime,
      tags,
    } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const newItem = await MenuItem.create({
        name,
        description: description || '',
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId,
        foodType: foodType || 'veg',
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        isBestseller: isBestseller !== undefined ? isBestseller : false,
        spicyLevel: spicyLevel !== undefined ? Number(spicyLevel) : 1,
        preparationTime: preparationTime ? Number(preparationTime) : 15,
        tags: Array.isArray(tags) ? tags : [],
      });

      return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    }

    const newItem = {
      _id: `item_${Date.now()}`,
      name,
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      categoryId,
      foodType: foodType || 'veg',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isBestseller: isBestseller !== undefined ? isBestseller : false,
      spicyLevel: spicyLevel !== undefined ? Number(spicyLevel) : 1,
      preparationTime: preparationTime ? Number(preparationTime) : 15,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryDb.menuItems.push(newItem);
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
