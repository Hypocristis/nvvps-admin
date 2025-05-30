import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  generateNextInvoiceNumber,
  Invoice,
} from '@/lib/services/invoices';

export function useInvoices() {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoices on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await getInvoices(user.id);
        setInvoices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to fetch invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user?.id]);

  // Add new invoice
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>, pdfFile?: File) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const newInvoice = await createInvoice(user.id, invoiceData, pdfFile);
      setInvoices(prev => [newInvoice, ...prev]);
      setError(null);
      return newInvoice;
    } catch (err) {
      console.error('Error adding invoice:', err);
      setError('Failed to add invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing invoice
  const editInvoice = async (invoiceId: string, updates: Partial<Invoice>, pdfFile?: File) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedInvoice = await updateInvoice(user.id, invoiceId, updates, pdfFile);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
      setError(null);
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError('Failed to update invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete invoice
  const removeInvoice = async (invoiceId: string) => {
    if (!user?.id) return false;
    
    try {
      setIsLoading(true);
      await deleteInvoice(user.id, invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update invoice status
  const changeInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!user?.id) return null;
    
    try {
      setIsLoading(true);
      const updatedInvoice = await updateInvoiceStatus(user.id, invoiceId, status);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
      setError(null);
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Failed to update invoice status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate next invoice number
  const getNextInvoiceNumber = async () => {
    if (!user?.id) return null;
    
    try {
      return await generateNextInvoiceNumber(user.id);
    } catch (err) {
      console.error('Error generating invoice number:', err);
      setError('Failed to generate invoice number');
      return null;
    }
  };

  return {
    invoices,
    isLoading,
    error,
    addInvoice,
    editInvoice,
    removeInvoice,
    changeInvoiceStatus,
    getNextInvoiceNumber,
  };
} 