import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Category from '@/models/Category';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const categories = await Category.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean();
      return NextResponse.json({ success: true, categories });
    }

    const categories = [...memoryDb.categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
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
    const { name, description, icon, displayOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const newCategory = await Category.create({
        name,
        slug,
        description: description || '',
        icon: icon || 'Utensils',
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      });
      return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
    }

    const newCategory = {
      _id: `cat_${Date.now()}`,
      name,
      slug,
      description: description || '',
      icon: icon || 'Utensils',
      displayOrder: displayOrder || memoryDb.categories.length + 1,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryDb.categories.push(newCategory);
    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
