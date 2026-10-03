import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Table from '@/models/Table';
import { getAuthUserFromRequest } from '@/lib/auth';

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
      const updated = await Table.findByIdAndUpdate(id, body, { new: true });
      if (!updated) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      return NextResponse.json({ success: true, table: updated });
    }

    const index = memoryDb.tables.findIndex((t) => t._id === id);
    if (index === -1) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    memoryDb.tables[index] = {
      ...memoryDb.tables[index],
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json({ success: true, table: memoryDb.tables[index] });
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
      await Table.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Table removed' });
    }

    const initLen = memoryDb.tables.length;
    memoryDb.tables = memoryDb.tables.filter((t) => t._id !== id);

    if (memoryDb.tables.length === initLen) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Table removed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
