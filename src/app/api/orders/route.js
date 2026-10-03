import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Order from '@/models/Order';
import Settings from '@/models/Settings';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const tableNumber = searchParams.get('tableNumber');
    const limit = Number(searchParams.get('limit')) || 50;

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const query = {};
      if (status && status !== 'all') {
        query.orderStatus = status;
      }
      if (tableNumber) {
        query.tableNumber = tableNumber;
      }

      const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      return NextResponse.json({ success: true, orders });
    }

    let orders = [...memoryDb.orders];

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.orderStatus === status);
    }
    if (tableNumber) {
      orders = orders.filter((o) => o.tableNumber === tableNumber);
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json({ success: true, orders: orders.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { tableNumber, customerName, customerPhone, items, specialInstructions, paymentMethod, paymentDetails } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => {
      return acc + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const taxRate = 5; // 5% GST
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus = paymentMethod === 'online' && paymentDetails?.razorpayPaymentId ? 'paid' : 'pending';

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const newOrder = await Order.create({
        orderNumber,
        tableNumber: String(tableNumber).trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : '',
        items: items.map((i) => ({
          menuItemId: i._id || i.menuItemId,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity || 1),
          foodType: i.foodType || 'veg',
          notes: i.notes || '',
        })),
        subtotal,
        taxRate,
        taxAmount,
        total,
        paymentMethod: paymentMethod || 'counter',
        paymentStatus,
        orderStatus: 'new',
        specialInstructions: specialInstructions ? specialInstructions.trim() : '',
        paymentDetails: paymentDetails || {},
      });

      return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    }

    const newOrder = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      orderNumber,
      tableNumber: String(tableNumber).trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      items: items.map((i) => ({
        menuItemId: i._id || i.menuItemId,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity || 1),
        foodType: i.foodType || 'veg',
        notes: i.notes || '',
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentMethod: paymentMethod || 'counter',
      paymentStatus,
      orderStatus: 'new',
      specialInstructions: specialInstructions ? specialInstructions.trim() : '',
      paymentDetails: paymentDetails || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryDb.orders.unshift(newOrder);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
