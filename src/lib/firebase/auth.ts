import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { adminAuth } from './admin';

export async function generateFirebaseToken(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const { userId } = auth;
    
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Create a custom token in Firebase
    const firebaseToken = await adminAuth.createCustomToken(userId);
    
    return firebaseToken;
  } catch (error) {
    console.error('Error generating Firebase token:', error);
    throw error;
  }
}

export async function getFirebaseToken(req: NextRequest) {
  try {
    const token = await generateFirebaseToken(req);
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    throw error;
  }
} 