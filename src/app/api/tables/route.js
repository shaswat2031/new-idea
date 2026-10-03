import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Table from '@/models/Table';
import { generateTableQRCode } from '@/lib/qr';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { conn, isFallback } = await connectDB();

    let rawTables = [];

    if (!isFallback && conn) {
      rawTables = await Table.find({}).sort({ tableNumber: 1 }).lean();
    } else {
      rawTables = [...memoryDb.tables];
    }

    // Attach QR code data URLs dynamically
    const tables = await Promise.all(
      rawTables.map(async (table) => {
        const { qrDataUrl, targetUrl } = await generateTableQRCode(table.tableNumber, origin);
        return {
          ...table,
          qrCodeDataUrl: qrDataUrl,
          targetUrl,
        };
      })
    );

    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
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
    const { tableNumber, label, capacity, location, status } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { qrDataUrl, targetUrl } = await generateTableQRCode(tableNumber, origin);

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const existing = await Table.findOne({ tableNumber: String(tableNumber).trim() });
      if (existing) {
        return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
      }

      const newTable = await Table.create({
        tableNumber: String(tableNumber).trim(),
        label: label || `Table ${tableNumber}`,
        capacity: capacity ? Number(capacity) : 4,
        location: location || 'Main Hall',
        status: status || 'available',
        qrCodeDataUrl,
      });

      return NextResponse.json({ success: true, table: { ...newTable.toObject(), targetUrl } }, { status: 201 });
    }

    const exists = memoryDb.tables.some((t) => t.tableNumber === String(tableNumber).trim());
    if (exists) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
    }

    const newTable = {
      _id: `tbl_${Date.now()}`,
      tableNumber: String(tableNumber).trim(),
      label: label || `Table ${tableNumber}`,
      capacity: capacity ? Number(capacity) : 4,
      location: location || 'Main Hall',
      status: status || 'available',
      qrCodeDataUrl,
      targetUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryDb.tables.push(newTable);
    return NextResponse.json({ success: true, table: newTable }, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
