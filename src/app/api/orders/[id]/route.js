import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      // Find by MongoDB _id or orderNumber (e.g. ORD-1001)
      let order = null;
      if (id.startsWith('ORD-')) {
        order = await Order.findOne({ orderNumber: id }).lean();
      } else {
        order = await Order.findById(id).lean();
      }

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, order });
    }

    const order = memoryDb.orders.find((o) => o._id === id || o.orderNumber === id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { orderStatus, paymentStatus, paymentDetails } = body;

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const updateData = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (paymentDetails) updateData.paymentDetails = paymentDetails;

      const updated = await Order.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, order: updated });
    }

    const index = memoryDb.orders.findIndex((o) => o._id === id || o.orderNumber === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (orderStatus) memoryDb.orders[index].orderStatus = orderStatus;
    if (paymentStatus) memoryDb.orders[index].paymentStatus = paymentStatus;
    if (paymentDetails) memoryDb.orders[index].paymentDetails = paymentDetails;
    memoryDb.orders[index].updatedAt = new Date();

    return NextResponse.json({ success: true, order: memoryDb.orders[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  return PATCH(req, { params });
}
