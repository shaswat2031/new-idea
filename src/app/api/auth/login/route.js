import { NextResponse } from 'next/server';
import { connectDB, memoryDb, isUsingMemoryFallback } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { conn, isFallback } = await connectDB();
    let user = null;

    if (!isFallback && conn) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    // Default admin fallback if not initialized in database yet
    if (!user && email.toLowerCase() === 'admin@restaurant.com') {
      const isMatch = password === 'admin123';
      if (isMatch) {
        user = {
          _id: 'user_admin_1',
          name: 'Restaurant Manager',
          email: 'admin@restaurant.com',
          role: 'admin',
        };
      }
    } else if (user) {
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      token,
      message: 'Login successful',
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
