import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  Expense,
} from '@/lib/services/expenses';

export function useExpenses() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const data = await getExpenses(user.id);
        setExpenses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to fetch expenses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [user?.id]);

  // Add new expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const newExpense = await createExpense(user.id, expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      setError(null);
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing expense
  const editExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedExpense = await updateExpense(user.id, expenseId, updates);
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? updatedExpense : exp));
      setError(null);
      return updatedExpense;
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete expense
  const removeExpense = async (expenseId: string) => {
    if (!user?.id) return false;
    
    try {
      setIsLoading(true);
      await deleteExpense(user.id, expenseId);
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    editExpense,
    removeExpense,
  };
} 