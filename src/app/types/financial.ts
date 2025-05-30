export interface Invoice {
  id: string;
  date: string;
  sentDate: string | null;
  client: string;
  amount: number;
  tax: number;
  vatRate: number;
  status: string;
  pdfUrl: string | null;
  dueDate: string;
  representativeName: string;
  representativeEmail: string;
  representativeGender: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  pdfUrl: string | null;
  recurring: boolean;
}

export interface Offer {
  id: string;
  date: string;
  client: string;
  description: string;
  amount: number;
  status: string;
  validUntil: string;
}

export interface RecurringPayment {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextPayment: string;
  category: string;
  description: string;
  active: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  type: string;
  itemId: string;
  description: string;
  changes: any | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NewInvoiceFormData {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  description: string;
  representativeName: string;
  representativeEmail: string;
  representativeGender: string;
  vatRate: string;
}

export interface NewExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
}

export interface NewRecurringFormData {
  name: string;
  amount: string;
  frequency: string;
  category: string;
  nextPayment: string;
}

export interface NewOfferFormData {
  title: string;
  client: string;
  amount: string;
  expirationDate: string;
  googleDocsUrl: string;
  description: string;
} 