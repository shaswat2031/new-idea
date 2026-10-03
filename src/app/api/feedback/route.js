import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Feedback from '@/models/Feedback';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, tableNumber, customerName, rating, tags, comment } = body;

    if (!rating || !tableNumber) {
      return NextResponse.json(
        { error: 'Rating and table number are required' },
        { status: 400 }
      );
    }

    const isFlaggedToManager = Number(rating) <= 3;

    const feedbackDoc = {
      orderId: orderId || '',
      tableNumber: String(tableNumber),
      customerName: customerName || 'Guest',
      rating: Number(rating),
      tags: tags || [],
      comment: comment || '',
      isFlaggedToManager,
      createdAt: new Date(),
    };

    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const created = await Feedback.create(feedbackDoc);
      return NextResponse.json({ success: true, feedback: created });
    }

    // Memory fallback
    if (!memoryDb.feedback) {
      memoryDb.feedback = [];
    }
    const memoryFeedback = {
      _id: `fb_${Date.now()}`,
      ...feedbackDoc,
    };
    memoryDb.feedback.push(memoryFeedback);

    return NextResponse.json({ success: true, feedback: memoryFeedback });
  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(100).lean();
      return NextResponse.json({ success: true, feedback });
    }

    const feedback = (memoryDb.feedback || []).slice().reverse();
    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
