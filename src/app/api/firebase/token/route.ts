import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    const { userId } = auth;

    console.log('Token request received for user:', userId);

    if (!userId) {
      console.log('No user ID found in request');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate a custom token for Firebase
    const token = await adminAuth.createCustomToken(userId);
    console.log('Generated Firebase token for user:', userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Firebase token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 