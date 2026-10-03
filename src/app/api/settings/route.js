import { NextResponse } from 'next/server';
import { connectDB, memoryDb } from '@/lib/db';
import Settings from '@/models/Settings';
import { initialSettings } from '@/lib/seedData';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      let settings = await Settings.findOne({}).lean();
      if (!settings) {
        settings = await Settings.create(initialSettings);
      }
      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({ success: true, settings: memoryDb.settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conn, isFallback } = await connectDB();

    if (!isFallback && conn) {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = await Settings.create({ ...initialSettings, ...body });
      } else {
        Object.assign(settings, body);
        await settings.save();
      }
      return NextResponse.json({ success: true, settings });
    }

    memoryDb.settings = {
      ...memoryDb.settings,
      ...body,
    };

    return NextResponse.json({ success: true, settings: memoryDb.settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
