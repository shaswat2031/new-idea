import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB, memoryDb } from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';

export async function POST(req) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, orderNumber, amount } = await req.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;

    if (key_secret && key_secret !== 'rzp_secret_dummy_replace_with_yours' && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Payment signature verification failed' }, { status: 400 });
    }

    const { conn, isFallback } = await connectDB();

    // Update order payment status
    if (!isFallback && conn) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          'paymentDetails.razorpayOrderId': razorpayOrderId,
          'paymentDetails.razorpayPaymentId': razorpayPaymentId,
          'paymentDetails.razorpaySignature': razorpaySignature,
          'paymentDetails.paidAt': new Date(),
        });
      }

      await Payment.create({
        orderId: orderId || null,
        orderNumber: orderNumber || '',
        paymentGateway: 'razorpay',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: amount || 0,
        status: 'captured',
      });
    } else {
      if (orderId) {
        const ord = memoryDb.orders.find((o) => o._id === orderId || o.orderNumber === orderId);
        if (ord) {
          ord.paymentStatus = 'paid';
          ord.paymentDetails = {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            paidAt: new Date(),
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and captured successfully',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
