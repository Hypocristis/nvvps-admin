import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getRecurringPayments,
  createRecurringPayment,
  updateRecurringPayment,
  deleteRecurringPayment,
  toggleRecurringPaymentStatus,
  RecurringPayment,
} from '@/lib/services/recurring-payments';

export function useRecurringPayments() {
  const { user } = useUser();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recurring payments on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const data = await getRecurringPayments(user.id);
        setPayments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recurring payments:', err);
        setError('Failed to fetch recurring payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  // Add new recurring payment
  const addPayment = async (paymentData: Omit<RecurringPayment, 'id' | 'createdAt'>, pdfFile?: File) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const newPayment = await createRecurringPayment(user.id, paymentData, pdfFile);
      setPayments(prev => [newPayment, ...prev]);
      setError(null);
      return newPayment;
    } catch (err) {
      console.error('Error adding recurring payment:', err);
      setError('Failed to add recurring payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing recurring payment
  const editPayment = async (paymentId: string, updates: Partial<RecurringPayment>, pdfFile?: File) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedPayment = await updateRecurringPayment(user.id, paymentId, updates, pdfFile);
      setPayments(prev => prev.map(payment => payment.id === paymentId ? updatedPayment : payment));
      setError(null);
      return updatedPayment;
    } catch (err) {
      console.error('Error updating recurring payment:', err);
      setError('Failed to update recurring payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete recurring payment
  const removePayment = async (paymentId: string) => {
    if (!user?.id) return false;
    
    try {
      setIsLoading(true);
      await deleteRecurringPayment(user.id, paymentId);
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting recurring payment:', err);
      setError('Failed to delete recurring payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle recurring payment status
  const togglePaymentStatus = async (paymentId: string, active: boolean) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedPayment = await toggleRecurringPaymentStatus(user.id, paymentId, active);
      setPayments(prev => prev.map(payment => payment.id === paymentId ? updatedPayment : payment));
      setError(null);
      return updatedPayment;
    } catch (err) {
      console.error('Error toggling recurring payment status:', err);
      setError('Failed to toggle recurring payment status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payments,
    isLoading,
    error,
    addPayment,
    editPayment,
    removePayment,
    togglePaymentStatus,
  };
} 