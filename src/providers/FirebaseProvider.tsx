"use client"

import { useEffect, useState } from 'react';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { useUser } from '@clerk/nextjs';
import firebaseApp from '@/lib/firebase/config';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  useEffect(() => {
    if (!isClerkLoaded) return;

    const auth = getAuth(firebaseApp);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.uid);
    });

    const initializeFirebase = async () => {
      try {
        if (user) {
          console.log('Clerk user ID:', user.id);
          
          // Get custom token from your backend
          const response = await fetch('/api/firebase/token');
          if (!response.ok) {
            throw new Error(`Token request failed: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Received token from backend');

          // Sign in to Firebase with the custom token
          const userCredential = await signInWithCustomToken(auth, data.token);
          console.log('Firebase sign in successful:', userCredential.user.uid);
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      } finally {
        setIsFirebaseLoaded(true);
      }
    };

    initializeFirebase();

    // Cleanup subscription
    return () => unsubscribe();
  }, [user, isClerkLoaded]);

  if (!isClerkLoaded || !isFirebaseLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
} 