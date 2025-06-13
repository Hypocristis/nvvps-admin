import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useUser } from '@clerk/nextjs';

export interface Offer {
  id: string;
  title: string;
  client: string;
  amount: number;
  createdDate: string;
  sentDate: string | null;
  expirationDate: string;
  status: 'Szkic' | 'Wysłana' | 'Zaakceptowana' | 'Odrzucona';
  googleDocsUrl: string;
  daysToExpiration: number;
  description?: string;
}

export const useOffers = () => {
  const { user } = useUser();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, 'users', user.id, 'offers'),
      orderBy('createdDate', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newOffers = snapshot.docs.map(doc => {
          const data = doc.data();
          const expirationDate = new Date(data.expirationDate);
          const today = new Date();
          const daysToExpiration = Math.ceil(
            (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return {
            id: doc.id,
            ...data,
            daysToExpiration
          } as Offer;
        });
        
        setOffers(newOffers);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching offers:', error);
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const addOffer = async (offerData: Omit<Offer, 'id' | 'daysToExpiration'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'users', user.id, 'offers'), {
        ...offerData,
        createdDate: new Date().toISOString().split('T')[0],
        sentDate: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding offer:', error);
      throw error;
    }
  };

  const editOffer = async (offerId: string, offerData: Partial<Offer>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const offerRef = doc(db, 'users', user.id, 'offers', offerId);
      await updateDoc(offerRef, offerData);
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  };

  const removeOffer = async (offerId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, 'users', user.id, 'offers', offerId));
    } catch (error) {
      console.error('Error removing offer:', error);
      throw error;
    }
  };

  const changeOfferStatus = async (offerId: string, newStatus: Offer['status']) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const offerRef = doc(db, 'users', user.id, 'offers', offerId);
      await updateDoc(offerRef, {
        status: newStatus,
        sentDate: newStatus === 'Wysłana' ? new Date().toISOString().split('T')[0] : null
      });
    } catch (error) {
      console.error('Error changing offer status:', error);
      throw error;
    }
  };

  return {
    offers,
    isLoading,
    error,
    addOffer,
    editOffer,
    removeOffer,
    changeOfferStatus
  };
}; 