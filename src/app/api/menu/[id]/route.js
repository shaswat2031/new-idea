import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const item = await MenuItem.findById(id).populate('categoryId');
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      return NextResponse.json({ success: true, item });
    }

    const item = memoryDb.menuItems.find((i) => i._id === id);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const updated = await MenuItem.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      if (!updated) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      return NextResponse.json({ success: true, item: updated });
    }

    const index = memoryDb.menuItems.findIndex((i) => i._id === id);
    if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    memoryDb.menuItems[index] = {
      ...memoryDb.menuItems[index],
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json({ success: true, item: memoryDb.menuItems[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      await MenuItem.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Item deleted' });
    }

    const initialLen = memoryDb.menuItems.length;
    memoryDb.menuItems = memoryDb.menuItems.filter((i) => i._id !== id);

    if (memoryDb.menuItems.length === initialLen) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
