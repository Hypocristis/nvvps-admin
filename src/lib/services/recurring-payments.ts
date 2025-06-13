import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  nextPayment: string;
  active: boolean;
  pdfUrl: string | null;
  createdAt: string;
}

// Get all recurring payments for a user
export async function getRecurringPayments(userId: string): Promise<RecurringPayment[]> {
  try {
    const paymentsRef = collection(db, 'users', userId, 'recurring-payments');
    const q = query(
      paymentsRef,
      orderBy('nextPayment', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      nextPayment: doc.data().nextPayment,
      createdAt: doc.data().createdAt,
    } as RecurringPayment));
  } catch (error) {
    console.error('Error getting recurring payments:', error);
    throw error;
  }
}

// Create a new recurring payment
export async function createRecurringPayment(
  userId: string,
  paymentData: Omit<RecurringPayment, 'id' | 'createdAt'>,
  // pdfFile?: File
): Promise<RecurringPayment> {
  try {
    const paymentWithMetadata = {
      ...paymentData,
      createdAt: new Date().toISOString(),
      pdfUrl: null, // This will be updated once file handling is implemented
    };

    const paymentsRef = collection(db, 'users', userId, 'recurring-payments');
    const docRef = await addDoc(paymentsRef, paymentWithMetadata);
    
    return {
      id: docRef.id,
      ...paymentWithMetadata,
    };
  } catch (error) {
    console.error('Error creating recurring payment:', error);
    throw error;
  }
}

// Update an existing recurring payment
export async function updateRecurringPayment(
  userId: string,
  paymentId: string,
  updates: Partial<RecurringPayment>,
  // pdfFile?: File
): Promise<RecurringPayment> {
  try {
    const paymentRef = doc(db, 'users', userId, 'recurring-payments', paymentId);
    
    await updateDoc(paymentRef, {
      ...updates,
      pdfUrl: null, // This will be updated once file handling is implemented
    });

    const updatedPayment = (await getRecurringPayments(userId)).find(payment => payment.id === paymentId);
    if (!updatedPayment) {
      throw new Error('Updated payment not found');
    }

    return updatedPayment;
  } catch (error) {
    console.error('Error updating recurring payment:', error);
    throw error;
  }
}

// Delete a recurring payment
export async function deleteRecurringPayment(userId: string, paymentId: string): Promise<void> {
  try {
    const paymentRef = doc(db, 'users', userId, 'recurring-payments', paymentId);
    await deleteDoc(paymentRef);
  } catch (error) {
    console.error('Error deleting recurring payment:', error);
    throw error;
  }
}

// Toggle recurring payment status
export async function toggleRecurringPaymentStatus(
  userId: string,
  paymentId: string,
  active: boolean
): Promise<RecurringPayment> {
  try {
    const paymentRef = doc(db, 'users', userId, 'recurring-payments', paymentId);
    await updateDoc(paymentRef, { active });

    const updatedPayment = (await getRecurringPayments(userId)).find(payment => payment.id === paymentId);
    if (!updatedPayment) {
      throw new Error('Updated payment not found');
    }

    return updatedPayment;
  } catch (error) {
    console.error('Error toggling recurring payment status:', error);
    throw error;
  }
} 