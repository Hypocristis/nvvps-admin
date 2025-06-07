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
  Timestamp,
} from 'firebase/firestore';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  pdfUrl: string | null;
  createdAt: string;
}

// Get all expenses for a user
export async function getExpenses(userId: string): Promise<Expense[]> {
  try {
    const expensesRef = collection(db, 'users', userId, 'expenses');
    const q = query(
      expensesRef,
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date,
      createdAt: doc.data().createdAt,
    } as Expense));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
}

// Create a new expense
export async function createExpense(
  userId: string,
  expenseData: Omit<Expense, 'id' | 'createdAt'>,
  pdfFile?: File
): Promise<Expense> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate required fields
    if (!expenseData.description || !expenseData.amount || !expenseData.category || !expenseData.date) {
      throw new Error('Missing required fields');
    }

    // For now, we'll skip PDF handling as it's not set up yet
    const expenseWithMetadata = {
      ...expenseData,
      createdAt: new Date().toISOString(),
      pdfUrl: null, // This will be updated once file handling is implemented
    };

    const expensesRef = collection(db, 'users', userId, 'expenses');
    const docRef = await addDoc(expensesRef, expenseWithMetadata);
    
    return {
      id: docRef.id,
      ...expenseWithMetadata,
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

// Update an existing expense
export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: Partial<Expense>,
  pdfFile?: File
): Promise<Expense> {
  try {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    
    // For now, we'll skip PDF handling
    await updateDoc(expenseRef, {
      ...updates,
      pdfUrl: null, // This will be updated once file handling is implemented
    });

    const updatedExpense = (await getExpenses(userId)).find(exp => exp.id === expenseId);
    if (!updatedExpense) {
      throw new Error('Updated expense not found');
    }

    return updatedExpense;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

// Delete an expense
export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  try {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
} 