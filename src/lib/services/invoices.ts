import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  sentDate: string | null;
  client: string;
  amount: number;
  tax: number;
  vatRate: number;
  status: 'Stworzona' | 'Wysłana' | 'Zapłacona' | 'Przeterminowana';
  pdfUrl: string | null;
  dueDate: string;
  representativeName: string;
  representativeEmail: string;
  representativeGender: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to convert Firestore data to Invoice type
const convertToInvoice = (doc: DocumentData): Invoice => {
  const data = doc.data();
  return {
    id: doc.id,
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    sentDate: data.sentDate,
    client: data.client,
    amount: data.amount,
    tax: data.tax,
    vatRate: data.vatRate,
    status: data.status,
    pdfUrl: data.pdfUrl,
    dueDate: data.dueDate,
    representativeName: data.representativeName,
    representativeEmail: data.representativeEmail,
    representativeGender: data.representativeGender,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Get all invoices for a user
export async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const invoicesRef = collection(db, 'users', userId, 'invoices');
    const q = query(invoicesRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertToInvoice);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Get a single invoice by ID
export async function getInvoice(userId: string, invoiceId: string): Promise<Invoice | null> {
  try {
    const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);
    
    if (!invoiceDoc.exists()) {
      return null;
    }
    
    return convertToInvoice(invoiceDoc);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

// Create a new invoice
export async function createInvoice(userId: string, invoice: Omit<Invoice, 'id'>, pdfFile?: File): Promise<Invoice> {
  try {
    console.log('Creating invoice for user:', userId);
    
    // Only generate invoice number if not provided
    const invoiceNumber = invoice.invoiceNumber || await generateNextInvoiceNumber(userId);
    
    // Upload PDF if provided
    let pdfUrl = null;
    if (pdfFile) {
      console.log('Uploading PDF file:', pdfFile.name);
      const storageRef = ref(storage, `users/${userId}/invoices/${Date.now()}_${pdfFile.name}`);
      await uploadBytes(storageRef, pdfFile);
      pdfUrl = await getDownloadURL(storageRef);
      console.log('PDF uploaded successfully:', pdfUrl);
    }

    console.log('Adding invoice to Firestore...');
    const invoicesRef = collection(db, 'users', userId, 'invoices');
    const docRef = await addDoc(invoicesRef, {
      ...invoice,
      invoiceNumber,
      pdfUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Invoice added successfully with ID:', docRef.id);

    const newInvoice = await getInvoice(userId, docRef.id);
    if (!newInvoice) throw new Error('Failed to create invoice: Document not found after creation');
    
    return newInvoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
    throw error;
  }
}

// Update an existing invoice
export async function updateInvoice(
  userId: string,
  invoiceId: string,
  updates: Partial<Invoice>,
  pdfFile?: File
): Promise<Invoice> {
  try {
    const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceId);
    
    // Upload new PDF if provided
    let pdfUrl = updates.pdfUrl;
    if (pdfFile) {
      const storageRef = ref(storage, `users/${userId}/invoices/${Date.now()}_${pdfFile.name}`);
      await uploadBytes(storageRef, pdfFile);
      pdfUrl = await getDownloadURL(storageRef);
      
      // Delete old PDF if it exists
      if (updates.pdfUrl) {
        const oldPdfRef = ref(storage, updates.pdfUrl);
        await deleteObject(oldPdfRef).catch(console.error); // Don't throw if deletion fails
      }
    }

    await updateDoc(invoiceRef, {
      ...updates,
      pdfUrl,
      updatedAt: serverTimestamp(),
    });

    const updatedInvoice = await getInvoice(userId, invoiceId);
    if (!updatedInvoice) throw new Error('Failed to update invoice');
    
    return updatedInvoice;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

// Delete an invoice
export async function deleteInvoice(userId: string, invoiceId: string): Promise<void> {
  try {
    const invoice = await getInvoice(userId, invoiceId);
    if (!invoice) return;

    // Delete PDF if it exists
    if (invoice.pdfUrl) {
      const pdfRef = ref(storage, invoice.pdfUrl);
      await deleteObject(pdfRef).catch(console.error); // Don't throw if deletion fails
    }

    const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceId);
    await deleteDoc(invoiceRef);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

// Get overdue invoices
export async function getOverdueInvoices(userId: string): Promise<Invoice[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoicesRef = collection(db, 'users', userId, 'invoices');
    const q = query(
      invoicesRef,
      where('dueDate', '<', today.toISOString()),
      where('status', '!=', 'Zapłacona')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToInvoice);
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    throw error;
  }
}

// Update invoice status
export async function updateInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: Invoice['status']
): Promise<Invoice> {
  try {
    const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceId);
    
    await updateDoc(invoiceRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'Wysłana' ? { sentDate: new Date().toISOString() } : {}),
    });

    const updatedInvoice = await getInvoice(userId, invoiceId);
    if (!updatedInvoice) throw new Error('Failed to update invoice status');
    
    return updatedInvoice;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
}

// Generate next invoice number
export async function generateNextInvoiceNumber(userId: string): Promise<string> {
  try {
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear().toString();
    
    const invoicesRef = collection(db, 'users', userId, 'invoices');
    const q = query(
      invoicesRef,
      where('date', '>=', `${currentYear}-${currentMonth}-01`),
      where('date', '<=', `${currentYear}-${currentMonth}-31`)
    );
    
    const querySnapshot = await getDocs(q);
    const currentMonthInvoices = querySnapshot.docs.map(convertToInvoice);
    
    if (currentMonthInvoices.length === 0) {
      return `1/${currentMonth}/${currentYear}`;
    }

    // Find the highest invoice number for the current month
    const numbers = currentMonthInvoices
      .map(invoice => parseInt(invoice.invoiceNumber.split('/')[0]))
      .filter(num => !isNaN(num));
    
    const highestNumber = Math.max(...numbers);
    return `${highestNumber + 1}/${currentMonth}/${currentYear}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
} 