"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CalendarDays,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  FileText,
  Edit,
  Bell,
  ArrowRight,
  Trash2,
  Download,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from "@/components/revenue-chart"
import { ExpenseChart } from "@/components/expense-chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Undo2, Shield, CreditCard, Key } from "lucide-react"
import { useUser, SignOutButton, RedirectToSignIn } from "@clerk/nextjs"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useInvoices } from '@/hooks/useInvoices';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { sendMail } from '@/lib/nodemailer/send-mail';
import { useExpenses } from '@/hooks/useExpenses';
import { Switch } from "@/components/ui/switch"
import { useRecurringPayments } from '@/hooks/useRecurringPayments';
import { useOffers } from '@/hooks/useOffers';
import { getHistoryEntries, addHistoryEntry, HistoryEntry } from '@/lib/services/history';
import Image from "next/image"

import { Expense } from "@/lib/services/expenses"
import { Offer } from "@/hooks/useOffers"

type EditableItem =
  | (RecurringPayment & { type: "recurring" })
  | (Invoice & { type: "invoice" })
  | (Expense & { type: "expense" })
  | (Offer & { type: "offer" })


// Add this interface after the imports and before the historyLog declaration
interface Invoice {
  id: string;
  date: string;
  sentDate: string | null;
  client: string;
  amount: number;
  tax: number;
  vatRate: number;
  status: "Stworzona" | "Wysłana" | "Zapłacona" | "Przeterminowana";
  pdfUrl: string | null;
  dueDate: string;
  representativeName: string;
  representativeEmail: string;
  representativeGender: string;
  invoiceNumber: string;
  description?: string;
}

// Add this type after the Invoice interface
type InvoiceStatus = "Stworzona" | "Wysłana" | "Zapłacona" | "Przeterminowana";

// Add back the RecurringPayment interface
interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextPayment: string;
  category: string;
  active: boolean;
  pdfUrl: string | null;
  createdAt: string;
}

// Add back the calculateNextPaymentDate function
const calculateNextPaymentDate = (paymentDate: string, frequency: string): string => {
  const currentDate = new Date();
  const baseDate = new Date(paymentDate);
  const paymentDay = baseDate.getDate();

  let nextDate = new Date(baseDate);

  // If the payment date has passed, calculate the next occurrence
  if (nextDate < currentDate) {
    nextDate = new Date(currentDate);
    nextDate.setDate(paymentDay); // Keep the same day of month

    // If we've already passed this month's date, move to next period
    if (nextDate < currentDate) {
      switch (frequency) {
        case "Miesięcznie":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "Kwartalnie":
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case "Rocznie":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
    }
  }

  return nextDate.toISOString().split('T')[0];
};

// Add LoadingSkeleton component at the top of the file
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);

// Add utility function to calculate recurring payment occurrences
// function calculateRecurringPaymentAmount(payment: RecurringPayment, targetDate: Date): number {
//   console.log('=== Start payment calculation ===');
//   console.log('Payment:', payment);
//   console.log('Target date:', targetDate);

//   if (!payment.active) {
//     console.log('Payment is inactive');
//     return 0;
//   }

//   const startDate = new Date(payment.createdAt);
//   const paymentDate = new Date(payment.nextPayment);
//   const currentDate = new Date(targetDate);

//   console.log('Initial dates:');
//   console.log('- Start date:', startDate.toISOString());
//   console.log('- Payment date:', paymentDate.toISOString());
//   console.log('- Current date:', currentDate.toISOString());

//   // If the payment hasn't started yet
//   if (currentDate < startDate) {
//     console.log('Payment has not started yet');
//     return 0;
//   }

//   // For the current month check, we only care about the day of the month
//   const currentDay = currentDate.getDate();
//   const paymentDay = paymentDate.getDate();

//   // If we're checking the current month and the payment day hasn't passed yet
//   if (currentDate.getFullYear() === targetDate.getFullYear() && 
//       currentDate.getMonth() === targetDate.getMonth() && 
//       currentDay < paymentDay) {
//     console.log('Payment day has not passed in current month');
//     console.log(`Current day: ${currentDay}, Payment day: ${paymentDay}`);
//     return 0;
//   }

//   let amount = 0;
//   console.log('Checking frequency:', payment.frequency);

//   switch (payment.frequency) {
//     case 'Miesięcznie':
//       // For monthly payments, always include if the payment day has passed
//       amount = payment.amount;
//       console.log('Monthly payment amount:', amount);
//       break;

//     case 'Kwartalnie':
//       // For quarterly payments, check if this is a payment month
//       const monthsSinceStart = (currentDate.getFullYear() - startDate.getFullYear()) * 12 
//                               + (currentDate.getMonth() - startDate.getMonth());
//       const isQuarterlyPaymentMonth = monthsSinceStart % 3 === 0;
//       amount = isQuarterlyPaymentMonth ? payment.amount : 0;
//       console.log('Quarterly payment check:');
//       console.log('- Months since start:', monthsSinceStart);
//       console.log('- Is payment month:', isQuarterlyPaymentMonth);
//       console.log('- Amount:', amount);
//       break;

//     case 'Rocznie':
//       // For yearly payments, check if this is the same month as the start date
//       const isYearlyPaymentMonth = currentDate.getMonth() === startDate.getMonth();
//       amount = isYearlyPaymentMonth ? payment.amount : 0;
//       console.log('Yearly payment check:');
//       console.log('- Current month:', currentDate.getMonth());
//       console.log('- Start month:', startDate.getMonth());
//       console.log('- Is payment month:', isYearlyPaymentMonth);
//       console.log('- Amount:', amount);
//       break;

//     default:
//       console.log('Unknown frequency:', payment.frequency);
//       amount = 0;
//   }

//   console.log('Final amount:', amount);
//   console.log('=== End payment calculation ===');
//   return amount;
// }

// function calculateTotalRecurringForMonth(payments: RecurringPayment[], targetDate: Date): number {
//   return payments
//     .filter(p => p.active)
//     .reduce((sum, payment) => sum + calculateRecurringPaymentAmount(payment, targetDate), 0);
// }

// Add function to calculate accumulated recurring payments
function calculateAccumulatedRecurringPayments(payments: RecurringPayment[], endDate: Date): number {
  let total = 0;
  const currentDate = new Date(endDate);

  payments.filter(p => p.active).forEach(payment => {
    const startDate = new Date(payment.nextPayment); // Changed from createdAt to nextPayment

    console.log(`\nCalculating accumulated payments for: ${payment.name}`);
    console.log(`Payment date: ${startDate.toISOString().split('T')[0]}`);
    console.log(`Current date: ${currentDate.toISOString().split('T')[0]}`);
    console.log(`Amount: ${payment.amount}`);
    console.log(`Frequency: ${payment.frequency}`);

    // Calculate full months between start date and current date
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Calculate months difference (0-based)
    let monthsDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth);

    // If we're past the payment day in the current month, include this month
    if (currentDate.getDate() >= startDate.getDate()) {
      monthsDiff += 1;
    }

    console.log(`Months difference: ${monthsDiff}`);

    let paymentTotal = 0;
    switch (payment.frequency) {
      case 'Miesięcznie':
        paymentTotal = payment.amount * monthsDiff;
        break;

      case 'Kwartalnie':
        // Calculate complete quarters
        const quarters = Math.floor(monthsDiff / 3);
        paymentTotal = payment.amount * quarters;
        break;

      case 'Rocznie':
        // Calculate complete years
        const years = Math.floor(monthsDiff / 12);
        paymentTotal = payment.amount * years;
        break;
    }

    console.log(`Number of payments: ${monthsDiff}`);
    console.log(`Total for this payment: ${paymentTotal}`);
    total += paymentTotal;
  });

  console.log(`\nTotal accumulated recurring payments: ${total}`);
  return total;
}

export default function FinancialDashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const {
    invoices,
    // isLoading: isLoadingInvoices,
    // error: invoicesError,
    addInvoice,
    editInvoice,
    removeInvoice,
    changeInvoiceStatus,
    getNextInvoiceNumber,
  } = useInvoices();

  // Add expenses hook
  const {
    expenses,
    isLoading: isLoadingExpenses,
    // error: expensesError,
    addExpense,
    editExpense,
    removeExpense,
  } = useExpenses();

  // Add recurring payments hook
  const {
    payments: recurringPayments,
    isLoading: isLoadingRecurringPayments,
    // error: recurringPaymentsError,
    addPayment,
    editPayment,
    removePayment,
    togglePaymentStatus,
  } = useRecurringPayments();

  // Add the offers hook
  const {
    offers,
    isLoading: isLoadingOffers,
    // error: offersError,
    addOffer,
    editOffer,
    removeOffer,
    changeOfferStatus,
  } = useOffers();

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("")

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Effect to fetch next invoice number
  useEffect(() => {
    const fetchNextNumber = async () => {
      const number = await getNextInvoiceNumber();
      setNextInvoiceNumber(number || "");
    };
    fetchNextNumber();
  }, [getNextInvoiceNumber]);

  // Add useEffect to load history entries
  useEffect(() => {
    if (!user?.id) return;

    const loadHistoryEntries = async () => {
      try {
        const entries = await getHistoryEntries(user.id);
        setHistoryEntries(entries);
      } catch (error) {
        console.error('Error loading history entries:', error);
        toast.error('Błąd podczas ładowania historii');
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadHistoryEntries();
  }, [user?.id]);

  // Modal states
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false)
  // const [isEditRecurringOpen, setIsEditRecurringOpen] = useState(false)
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null)

  // File upload states
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(null)
  const [selectedExpenseFile, setSelectedExpenseFile] = useState<File | null>(null)
  const [selectedRecurringFile, setSelectedRecurringFile] = useState<File | null>(null)

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    client: "",
    amount: "",
    dueDate: "",
    description: "",
    representativeName: "",
    representativeEmail: "",
    representativeGender: "male",
    vatRate: "23",
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  })

  const [newRecurring, setNewRecurring] = useState({
    name: "",
    amount: "",
    frequency: "",
    category: "",
    nextPayment: "",
  })

  const [newOffer, setNewOffer] = useState({
    title: "",
    client: "",
    amount: "",
    expirationDate: "",
    googleDocsUrl: "",
    description: "",
  })

  // Add these new state variables
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [currentPdfUrl, setCurrentPdfUrl] = useState("")
  // const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<string | null>(null)

  // Add this state for the confirmation dialog
  const [reminderConfirmation, setReminderConfirmation] = useState<{ isOpen: boolean; invoice: Invoice | null }>({
    isOpen: false,
    invoice: null
  });

  // Add new state for payment display modal
  const [isPaymentDisplayOpen, setIsPaymentDisplayOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);

type MinimalUser = {
  fullName?: string | null
  email?: string | null
}

const addToHistory = useCallback(
  async (
    action: string,
    type: string,
    itemId: string,
    description: string,
    changes: Record<string, unknown> | null = null,
    currentUser: MinimalUser
  ) => {
    if (!user?.id) return

    try {
      const historyEntry = {
        timestamp: new Date().toLocaleString("pl-PL"),
        user: {
          name: currentUser?.fullName || "System",
          email: currentUser?.email || "system@app.com",
        },
        action,
        type,
        itemId,
        description,
        changes,
        revertible: action !== "Wysłano przypomnienie",
      }

      const newEntry = await addHistoryEntry(user.id, historyEntry)
      setHistoryEntries((prev: HistoryEntry[]) => [newEntry, ...prev])
    } catch (error) {
      console.error("Error adding history entry:", error)
      toast.error("Błąd podczas zapisywania historii")
    }
  },
  [user, setHistoryEntries]
)

  // Add function to check and update overdue invoices
  const updateOverdueInvoices = useCallback(() => {
  if (!user) return; // ✅ Prevent undefined/null from being passed

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const updatedInvoices = invoices.map((invoice) => {
    const dueDate = new Date(invoice.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today && invoice.status !== "Zapłacona") {
      if (invoice.status !== "Przeterminowana") {
        addToHistory(
          "Edytowano",
          "Faktura",
          invoice.id,
          `Automatycznie zmieniono status faktury ${invoice.id} na Przeterminowana`,
          { before: { status: invoice.status }, after: { status: "Przeterminowana" } },
          user
        )
      }
      return { ...invoice, status: "Przeterminowana" as const }
    }

    return invoice
  })

  updatedInvoices.forEach((invoice) => {
    if (invoice.status === "Przeterminowana") {
      changeInvoiceStatus(invoice.id, "Przeterminowana")
    }
  })
}, [addToHistory, changeInvoiceStatus, invoices, user])


  // Add useEffect to check for overdue invoices
  useEffect(() => {
    updateOverdueInvoices()
    // Set up an interval to check daily
    const intervalId = setInterval(updateOverdueInvoices, 24 * 60 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [updateOverdueInvoices]) // ✅ Include dependency

  // Also update overdue check when invoices are modified
  useEffect(() => {
    updateOverdueInvoices()
  }, [updateOverdueInvoices, invoices.length]) // ✅ Add updateOverdueInvoices too

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])


  // Check authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Google Drive API integration
  // const uploadToGoogleDrive = async (file: File, fileName: string) => {
  //   try {
  //     // Mock Google Drive API call
  //     console.log(`Uploading ${fileName} to Google Drive...`)

  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 2000))

  //     const mockDriveUrl = `https://drive.google.com/file/${Math.random().toString(36).substr(2, 9)}`
  //     console.log(`File uploaded successfully: ${mockDriveUrl}`)

  //     return mockDriveUrl
  //   } catch (error) {
  //     console.error("Error uploading to Google Drive:", error)
  //     throw error
  //   }
  // }

  // Email API integration
  const sendReminderEmail = async (invoice: Invoice) => {
    try {
      const emailData = {
        sendTo: invoice.representativeEmail,
        subject: `Przypomnienie o płatności - Faktura ${invoice.invoiceNumber}`,
        text: `Przypomnienie o płatności za fakturę ${invoice.invoiceNumber}`,
        html: `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Przypomnienie o płatności faktury</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    
    .email-wrapper {
      background-color: #f5f5f5;
      padding: 20px 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .header {
      background-color: #1a1a1a;
      padding: 30px 0;
      text-align: center;
    }
    
    .logo {
      width: 140px;
      height: auto;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 16px;
      margin-bottom: 25px;
      color: #333;
    }
    
    .message {
      margin-bottom: 30px;
      font-size: 15px;
    }
    
    .invoice-details {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 25px;
      margin-bottom: 30px;
      border-left: 4px solid #e74c3c;
    }
    
    .invoice-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .invoice-label {
      font-weight: 600;
      color: #555;
    }
    
    .invoice-value {
      font-weight: 700;
      color: #333;
    }
    
    .amount {
      font-size: 20px;
      color: #e74c3c;
    }
    
    .note {
      font-style: italic;
      color: #777;
      margin-top: 25px;
      font-size: 14px;
    }
    
    .signature {
      margin-top: 30px;
    }
    
    .signature-name {
      font-weight: 600;
    }
    
    .footer {
      background-color: #f9f9f9;
      padding: 25px;
      text-align: center;
      font-size: 13px;
      color: #777;
      border-top: 1px solid #eaeaea;
    }
    
    .footer p {
      margin-bottom: 10px;
    }
    
    .footer p:last-child {
      margin-bottom: 0;
    }
    
    @media only screen and (max-width: 480px) {
      .content {
        padding: 30px 20px;
      }
      
      .invoice-details {
        padding: 20px 15px;
      }
      
      .invoice-row {
        flex-direction: column;
        margin-bottom: 15px;
      }
      
      .invoice-value {
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <img class="logo" src="https://novelvision.pl/svg/NovelVision_Logo_Sygnet_Bialy.svg" alt="Novel Vision Logo">
      </div>
      
      <div class="content">
        <p class="greeting">Szanowni Państwo,</p>
        
        <div class="message">
          <p>Uprzejmie informujemy o <strong>minięciu terminu płatności</strong> za fakturę, której szczegóły znajdują się poniżej.</p>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-row">
            <span class="invoice-label">Numer faktury:</span>
            <span class="invoice-value">${invoice.invoiceNumber}</span>
          </div>
          <div class="invoice-row">
            <span class="invoice-label">Termin płatności:</span>
            <span class="invoice-value">${invoice.dueDate}</span>
          </div>
          <div class="invoice-row">
            <span class="invoice-label">Kwota do zapłaty:</span>
            <span class="invoice-value amount">${invoice.amount.toLocaleString()} zł</span>
          </div>
        </div>
        
        <p>Prosimy o niezwłoczne uregulowanie należności.</p>
        
        <p class="note">W przypadku dokonania płatności prosimy zignorować niniejsze przypomnienie.</p>
        
        <div class="signature">
          <p>Z wyrazami szacunku,</p>
          <p class="signature-name">Zespół Novel Vision</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Wiadomość wysłana automatycznie, prosimy na nią nie odpowiadać.</p>
        <p>© ${new Date().getFullYear()} Novel Vision. Wszystkie prawa zastrzeżone.</p>
        <p>Sikorskiego 74, 05-082 Janów</p>
      </div>
    </div>
  </div>
</body>
</html>`
      };

      await sendMail(emailData);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  // Calculate sums with debug logging
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalVat = invoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  console.log('=== Financial Calculations Debug ===');
  console.log('Total Revenue (Przychód):', totalRevenue);
  console.log('Total VAT:', totalVat);
  console.log('Revenue after VAT:', totalRevenue - totalVat);
  console.log('Total Expenses:', totalExpenses);
  console.log('Balance before recurring:', totalRevenue - totalVat - totalExpenses);

  // Get current date info
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Calculate recurring payments
  console.log('\nRecurring Payments:');
  recurringPayments.forEach(payment => {
    if (payment.active) {
      console.log(`Payment: ${payment.name}`);
      console.log(`Amount: ${payment.amount}`);
      console.log(`Start date: ${payment.createdAt}`);
      console.log(`Frequency: ${payment.frequency}`);
    }
  });

  // Calculate total accumulated recurring payments for 6 months
  const accumulatedRecurring = calculateAccumulatedRecurringPayments(recurringPayments, new Date());

  console.log('\nFinal calculations:');
  console.log('Total accumulated recurring payments:', accumulatedRecurring);

  // Calculate final income with the properly accumulated recurring payments
  const netProfit = totalRevenue - totalVat - totalExpenses - accumulatedRecurring;
  console.log('\nFinal income breakdown:');
  console.log(`Revenue: ${totalRevenue}`);
  console.log(`VAT: ${totalVat}`);
  console.log(`Expenses: ${totalExpenses}`);
  console.log(`Accumulated Recurring: ${accumulatedRecurring}`);
  console.log(`Final Income: ${netProfit}`);

  // Calculate current month's values
  const currentMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date)
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
  })

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  // Calculate current month's recurring payments
  const monthlyRecurring = recurringPayments
    .filter(p => p.active && p.frequency === 'Miesięcznie')
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate current month's totals
  const currentMonthRevenue = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const currentMonthVat = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  const currentMonthExpensesTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate current month's income
  const currentMonthIncome = currentMonthRevenue - currentMonthVat - currentMonthExpensesTotal - monthlyRecurring

  // Calculate previous month's values
  const previousMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date)
    return invoiceDate.getMonth() === previousMonth && invoiceDate.getFullYear() === previousYear
  })

  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear
  })

  // Calculate previous month's recurring payments
  const previousMonthRecurring = recurringPayments
    .filter(p => p.active && p.frequency === 'Miesięcznie')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const previousMonthRevenue = previousMonthInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const previousMonthVat = previousMonthInvoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  const previousMonthExpensesTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const previousMonthIncome = previousMonthRevenue - previousMonthVat - previousMonthExpensesTotal - previousMonthRecurring

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const revenueChange = calculatePercentageChange(currentMonthRevenue, previousMonthRevenue)
  const incomeChange = calculatePercentageChange(currentMonthIncome, previousMonthIncome)
  const expensesChange = calculatePercentageChange(currentMonthExpensesTotal, previousMonthExpensesTotal)
  const vatChange = calculatePercentageChange(currentMonthVat, previousMonthVat)

  // Format percentage with sign
  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}% od zeszłego miesiąca`
  }

  // Funkcje filtrowania
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || expense.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.client.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Add this function to handle status change
  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      const invoice = invoices.find(i => i.id === invoiceId);
      await changeInvoiceStatus(invoiceId, newStatus);
      await addToHistory(
        "Edytowano",
        "Faktura",
        invoiceId,
        `Zmieniono status faktury ${invoice?.invoiceNumber} na ${newStatus}`,
        {
          before: { status: invoice?.status },
          after: { status: newStatus },
        },
        user,
      );
      toast.success("Status updated successfully");
      // setIsStatusDropdownOpen(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Add this function to handle invoice deletion
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const invoice = invoices.find(i => i.id === invoiceId);
      await removeInvoice(invoiceId);
      await addToHistory(
        "Usunięto",
        "Faktura",
        invoiceId,
        `Usunięto fakturę ${invoice?.invoiceNumber}`,
        {
          before: invoice,
        },
        user,
      );
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  // Add this function to open PDF modal
  const openPdfModal = (url: string) => {
    setCurrentPdfUrl(url)
    setIsPdfModalOpen(true)
  }

  // Add this function before handleAddInvoice
  const validateInvoiceFormat = (invoiceId: string): { isValid: boolean; error?: string } => {
    // Split the invoice number into parts
    const parts = invoiceId.split('/')
    if (parts.length !== 3) {
      return { isValid: false, error: 'Format faktury musi być: numer/miesiąc/rok' }
    }

    const [number, month, year] = parts

    // Validate number (must be positive integer)
    const invoiceNumber = parseInt(number)
    if (isNaN(invoiceNumber) || invoiceNumber <= 0 || number !== invoiceNumber.toString()) {
      return { isValid: false, error: 'Numer faktury musi być dodatnią liczbą całkowitą' }
    }

    // Validate month (must be 01-12)
    const monthNumber = parseInt(month)
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12 || month !== monthNumber.toString().padStart(2, '0')) {
      return { isValid: false, error: 'Miesiąc musi być w formacie 01-12' }
    }

    // Validate year (must be a valid year, not in the future)
    const yearNumber = parseInt(year)
    const currentYear = new Date().getFullYear()
    if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > currentYear) {
      return { isValid: false, error: `Rok musi być pomiędzy 2000 a ${currentYear}` }
    }

    return { isValid: true }
  }

  const handleAddInvoice = async () => {
    try {
      // Validate required fields
      if (!newInvoice.client.trim()) {
        toast.error("Nazwa klienta jest wymagana");
        return;
      }
      if (!newInvoice.amount || isNaN(Number(newInvoice.amount)) || Number(newInvoice.amount) <= 0) {
        toast.error("Kwota musi być poprawną liczbą większą od 0");
        return;
      }
      if (!newInvoice.dueDate) {
        toast.error("Termin płatności jest wymagany");
        return;
      }
      if (!newInvoice.vatRate || isNaN(Number(newInvoice.vatRate)) || Number(newInvoice.vatRate) < 0) {
        toast.error("Stawka VAT musi być poprawną liczbą nieujemną");
        return;
      }
      if (!newInvoice.representativeName.trim()) {
        toast.error("Imię i nazwisko przedstawiciela jest wymagane");
        return;
      }
      if (!newInvoice.representativeEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInvoice.representativeEmail)) {
        toast.error("Poprawny adres email przedstawiciela jest wymagany");
        return;
      }

      // Only generate number if user hasn't provided one
      let invoiceNumber: string = newInvoice.invoiceNumber || '';
      if (!invoiceNumber || invoiceNumber.trim() === '') {
        const generatedNumber = await getNextInvoiceNumber();
        if (!generatedNumber) {
          toast.error("Failed to generate invoice number");
          return;
        }
        invoiceNumber = generatedNumber;
      } else {
        // Validate custom invoice number format
        const validation = validateInvoiceFormat(invoiceNumber);
        if (!validation.isValid) {
          toast.error(validation.error || "Nieprawidłowy format numeru faktury");
          return;
        }
      }

      const invoiceData = {
  invoiceNumber,
  date:
    editingItem?.type === "invoice"
      ? editingItem.date
      : new Date().toISOString().split("T")[0],
  sentDate: editingItem?.type === "invoice" ? editingItem.sentDate : null,
  client: newInvoice.client,
  amount: Number.parseFloat(newInvoice.amount),
  tax: Number.parseFloat(newInvoice.amount) * (Number.parseFloat(newInvoice.vatRate) / 100),
  vatRate: Number.parseFloat(newInvoice.vatRate),
  status: editingItem?.type === "invoice" ? editingItem.status : "Stworzona",
  dueDate: newInvoice.dueDate,
  representativeName: newInvoice.representativeName,
  representativeEmail: newInvoice.representativeEmail,
  representativeGender: newInvoice.representativeGender,
  pdfUrl: null,
};

      if (editingItem) {
        await editInvoice(editingItem.id, invoiceData, selectedInvoiceFile || undefined);
        await addToHistory(
          "Edytowano",
          "Faktura",
          editingItem.id,
          `Edytowano fakturę ${invoiceNumber}`,
          {
            before: editingItem,
            after: invoiceData,
          },
          user,
        );
        toast.success("Invoice updated successfully");
      } else {
        const newInvoiceRef = await addInvoice(invoiceData, selectedInvoiceFile || undefined);
        if (!newInvoiceRef?.id) {
          throw new Error('Failed to create invoice: No ID returned');
        }
        await addToHistory(
          "Dodano",
          "Faktura",
          newInvoiceRef.id,
          `Dodano nową fakturę ${invoiceNumber}`,
          {
            after: invoiceData,
          },
          user,
        );
        toast.success("Invoice created successfully");
      }

      setIsAddInvoiceOpen(false);
      setNewInvoice({
        invoiceNumber: "",
        client: "",
        amount: "",
        dueDate: "",
        description: "",
        representativeName: "",
        representativeEmail: "",
        representativeGender: "male",
        vatRate: "23",
      });
      setSelectedInvoiceFile(null);
      setEditingItem(null);
    } catch (error) {
      console.error("Error handling invoice:", error);
      toast.error("Failed to handle invoice");
    }
  };

  const handleAddExpense = async () => {
    try {
      // Validate required fields
      if (!newExpense.description.trim()) {
        toast.error("Opis wydatku jest wymagany");
        return;
      }
      if (!newExpense.amount || isNaN(Number(newExpense.amount))) {
        toast.error("Kwota musi być poprawną liczbą");
        return;
      }
      if (!newExpense.category) {
        toast.error("Kategoria jest wymagana");
        return;
      }
      if (!newExpense.date) {
        toast.error("Data jest wymagana");
        return;
      }

      const expenseData = {
        date: newExpense.date,
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        pdfUrl: null,
      };

      if (editingItem) {
        await editExpense(editingItem.id, expenseData, selectedExpenseFile || undefined);
        await addToHistory(
          "Edytowano",
          "Wydatek",
          editingItem.id,
          `Edytowano wydatek: ${expenseData.description}`,
          {
            before: editingItem,
            after: expenseData,
          },
          user,
        );
        toast.success("Expense updated successfully");
      } else {
        const newExpenseRef = await addExpense(expenseData, selectedExpenseFile || undefined);
        if (!newExpenseRef?.id) {
          throw new Error('Failed to create expense: No ID returned');
        }
        await addToHistory(
          "Dodano",
          "Wydatek",
          newExpenseRef.id,
          `Dodano nowy wydatek: ${expenseData.description}`,
          {
            after: expenseData,
          },
          user,
        );
        toast.success("Expense added successfully");
      }

      setIsAddExpenseOpen(false);
      setNewExpense({ description: "", amount: "", category: "", date: "" });
      setSelectedExpenseFile(null);
      setEditingItem(null);
    } catch (error) {
      console.error("Error handling expense:", error);
      toast.error("Failed to handle expense");
    }
  };

  const handleAddRecurring = async () => {
    try {
      // Validate required fields
      if (!newRecurring.name.trim()) {
        toast.error("Nazwa płatności jest wymagana");
        return;
      }
      if (!newRecurring.amount || isNaN(Number(newRecurring.amount))) {
        toast.error("Kwota musi być poprawną liczbą");
        return;
      }
      if (!newRecurring.frequency) {
        toast.error("Częstotliwość jest wymagana");
        return;
      }
      if (!newRecurring.category) {
        toast.error("Kategoria jest wymagana");
        return;
      }
      if (!newRecurring.nextPayment) {
        toast.error("Data płatności jest wymagana");
        return;
      }

      const recurringData = {
        name: newRecurring.name,
        amount: Number.parseFloat(newRecurring.amount),
        frequency: newRecurring.frequency,
        category: newRecurring.category,
        nextPayment: newRecurring.nextPayment,
        active: true,
        pdfUrl: null,
      };

      if (editingItem) {
        await editPayment(editingItem.id, recurringData, selectedRecurringFile || undefined);
        await addToHistory(
          "Edytowano",
          "Płatność cykliczna",
          editingItem.id,
          `Edytowano płatność cykliczną: ${recurringData.name}`,
          {
            before: editingItem,
            after: recurringData,
          },
          user,
        );
        toast.success("Recurring payment updated successfully");
      } else {
        const newPaymentRef = await addPayment(recurringData, selectedRecurringFile || undefined);
        if (!newPaymentRef?.id) {
          throw new Error('Failed to create recurring payment: No ID returned');
        }
        await addToHistory(
          "Dodano",
          "Płatność cykliczna",
          newPaymentRef.id,
          `Dodano nową płatność cykliczną: ${recurringData.name}`,
          {
            after: recurringData,
          },
          user,
        );
        toast.success("Recurring payment added successfully");
      }

      setIsAddRecurringOpen(false);
      // setIsEditRecurringOpen(false);
      setNewRecurring({ name: "", amount: "", frequency: "", category: "", nextPayment: "" });
      setSelectedRecurringFile(null);
      setEditingItem(null);
    } catch (error) {
      console.error("Error handling recurring payment:", error);
      toast.error("Failed to handle recurring payment");
    }
  };

  const handleAddOffer = async () => {
    try {
      // Validate required fields
      if (!newOffer.title.trim()) {
        toast.error("Tytuł oferty jest wymagany");
        return;
      }
      if (!newOffer.client.trim()) {
        toast.error("Nazwa klienta jest wymagana");
        return;
      }
      if (!newOffer.amount || isNaN(Number(newOffer.amount))) {
        toast.error("Kwota musi być poprawną liczbą");
        return;
      }
      if (!newOffer.expirationDate) {
        toast.error("Data wygaśnięcia jest wymagana");
        return;
      }

      const offerData = {
  title: newOffer.title,
  client: newOffer.client,
  amount: Number.parseFloat(newOffer.amount),
  expirationDate: newOffer.expirationDate,
  googleDocsUrl: newOffer.googleDocsUrl,
  description: newOffer.description || '',
  status:
    editingItem?.type === "offer"
      ? editingItem.status
      : "Szkic",
  createdDate:
    editingItem?.type === "offer"
      ? editingItem.createdDate
      : new Date().toISOString().split("T")[0],
  sentDate: editingItem?.type === "offer" ? editingItem.sentDate : null,
};

      if (editingItem) {
        await editOffer(editingItem.id, offerData);
        await addToHistory(
          "Edytowano",
          "Oferta",
          editingItem.id,
          `Edytowano ofertę: ${offerData.title}`,
          {
            before: editingItem,
            after: offerData,
          },
          user,
        );
        toast.success("Offer updated successfully");
      } else {
        const newOfferId = await addOffer(offerData);
        if (!newOfferId) {
          throw new Error('Failed to create offer: No ID returned');
        }
        await addToHistory(
          "Dodano",
          "Oferta",
          newOfferId,
          `Dodano nową ofertę: ${offerData.title}`,
          {
            after: offerData,
          },
          user,
        );
        toast.success("Offer created successfully");
      }

      setIsAddOfferOpen(false);
      setNewOffer({ title: "", client: "", amount: "", expirationDate: "", googleDocsUrl: "", description: "" });
      setEditingItem(null);
    } catch (error) {
      console.error("Error handling offer:", error);
      toast.error("Failed to handle offer");
    }
  };

  const handleEdit = (item: Omit<EditableItem, "type">, type: EditableItem["type"]) => {
  const fullItem = { ...item, type } as EditableItem
  setEditingItem(fullItem)

  if (type === "recurring") {
    const recurring = fullItem as Extract<EditableItem, { type: "recurring" }>
    setNewRecurring({
      name: recurring.name,
      amount: recurring.amount.toString(),
      frequency: recurring.frequency,
      category: recurring.category,
      nextPayment: recurring.nextPayment,
    })
    setIsPaymentDisplayOpen(false)
    setIsAddRecurringOpen(true)
  }

  if (type === "invoice") {
  const invoice = item as Extract<EditableItem, { type: "invoice" }>;
  setNewInvoice({
    invoiceNumber: invoice.invoiceNumber,
    client: invoice.client,
    amount: invoice.amount.toString(),
    dueDate: invoice.dueDate,
    description: invoice.description || "",
    representativeName: invoice.representativeName,
    representativeEmail: invoice.representativeEmail,
    representativeGender: invoice.representativeGender || "male",
    vatRate: invoice.vatRate.toString(),
  });
  setIsAddInvoiceOpen(true);
}


  if (type === "expense") {
    const expense = fullItem as Extract<EditableItem, { type: "expense" }>
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
    })
    setIsAddExpenseOpen(true)
  }

  if (type === "offer") {
    const offer = fullItem as Extract<EditableItem, { type: "offer" }>
    setNewOffer({
      title: offer.title,
      client: offer.client,
      amount: offer.amount.toString(),
      expirationDate: offer.expirationDate,
      googleDocsUrl: offer.googleDocsUrl,
      description: offer.description || "",
    })
    setIsAddOfferOpen(true)
  }
}

  // Update the remindClient function
  const remindClient = async (invoice: Invoice) => {
    setReminderConfirmation({ isOpen: true, invoice });
  }

  const handleConfirmedReminder = async () => {
    if (!reminderConfirmation.invoice) return;

    try {
      await sendReminderEmail(reminderConfirmation.invoice);
      addToHistory(
        "Wysłano przypomnienie",
        "Faktura",
        reminderConfirmation.invoice.id,
        `Wysłano przypomnienie o płatności do ${reminderConfirmation.invoice.representativeEmail}`,
        null,
        user,
      );
      toast.success(`Przypomnienie zostało wysłane do ${reminderConfirmation.invoice.representativeEmail}`);
    } catch {
      toast.error("Błąd podczas wysyłania przypomnienia");
    } finally {
      setReminderConfirmation({ isOpen: false, invoice: null });
    }
  }

  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName)
  }

  // Update revertChange function with proper type handling
  const revertChange = async (historyItem: HistoryEntry) => {
    if (!historyItem.revertible || !user?.id) return;

    try {
      // Get the previous state from the history item
      const previousState = historyItem.changes?.before;
      if (!previousState) {
        toast.error('Nie można cofnąć tej zmiany - brak poprzedniego stanu');
        return;
      }

      // Revert based on the type of item
      switch (historyItem.type) {
        case 'Faktura': {
          const invoiceData = previousState as Partial<Invoice>;
          // Ensure status is of the correct type
          if (invoiceData.status && !["Stworzona", "Wysłana", "Zapłacona", "Przeterminowana"].includes(invoiceData.status)) {
            toast.error('Nieprawidłowy status faktury');
            return;
          }
          await editInvoice(historyItem.itemId, invoiceData);
          break;
        }
        case 'Wydatek':
          await editExpense(historyItem.itemId, previousState);
          break;
        case 'Płatność cykliczna':
          await editPayment(historyItem.itemId, previousState);
          break;
        case 'Oferta':
          await editOffer(historyItem.itemId, previousState);
          break;
        default:
          toast.error('Nieznany typ elementu');
          return;
      }

      // Add revert action to history
      await addToHistory(
        "Cofnięto",
        historyItem.type,
        historyItem.itemId,
        `Cofnięto zmianę: ${historyItem.description}`,
        {
          before: historyItem.changes?.after,
          after: previousState,
        },
        user,
      );

      toast.success('Pomyślnie cofnięto zmianę');
    } catch (error) {
      console.error('Error reverting change:', error);
      toast.error('Błąd podczas cofania zmiany');
    }
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case "Zaakceptowana":
        return "default"
      case "Wysłana":
        return "secondary"
      case "Szkic":
        return "outline"
      case "Odrzucona":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getExpirationColor = (days: number) => {
    if (days <= 3) return "text-red-500"
    if (days <= 7) return "text-yellow-500"
    return "text-green-500"
  }

  // Check authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Add handleDeleteExpense function
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const expense = expenses.find(e => e.id === expenseId);
      await removeExpense(expenseId);
      await addToHistory(
        "Usunięto",
        "Wydatek",
        expenseId,
        `Usunięto wydatek: ${expense?.description}`,
        {
          before: expense,
        },
        user,
      );
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  // Add handleDeleteRecurring function
  const handleDeleteRecurring = async (paymentId: string) => {
    try {
      const payment = recurringPayments.find(p => p.id === paymentId);
      await removePayment(paymentId);
      await addToHistory(
        "Usunięto",
        "Płatność cykliczna",
        paymentId,
        `Usunięto płatność cykliczną: ${payment?.name}`,
        {
          before: payment,
        },
        user,
      );
      toast.success("Recurring payment deleted successfully");
    } catch (error) {
      console.error("Error deleting recurring payment:", error);
      toast.error("Failed to delete recurring payment");
    }
  };

  // Add handleToggleRecurring function
  const handleToggleRecurring = async (paymentId: string, active: boolean) => {
    try {
      const payment = recurringPayments.find(p => p.id === paymentId);
      await togglePaymentStatus(paymentId, active);
      await addToHistory(
        "Edytowano",
        "Płatność cykliczna",
        paymentId,
        `${active ? 'Aktywowano' : 'Dezaktywowano'} płatność cykliczną: ${payment?.name}`,
        {
          before: { active: !active },
          after: { active },
        },
        user,
      );
      toast.success(`Recurring payment ${active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error toggling recurring payment:", error);
      toast.error("Failed to toggle recurring payment status");
    }
  };

  // Update the filtered payments to use the new type
  const filteredRecurringPayments = recurringPayments.filter(payment => {
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || payment.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Add handlePaymentDisplay function before the return statement
  const handlePaymentDisplay = (payment: RecurringPayment) => {
    setSelectedPayment(payment);
    setIsPaymentDisplayOpen(true);
  };

  // Add handleDeleteOffer function
  const handleDeleteOffer = async (offerId: string) => {
    try {
      const offer = offers.find(o => o.id === offerId);
      await removeOffer(offerId);
      await addToHistory(
        "Usunięto",
        "Oferta",
        offerId,
        `Usunięto ofertę: ${offer?.title}`,
        {
          before: offer,
        },
        user,
      );
      toast.success("Offer deleted successfully");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  // Add handleOfferStatusChange function
  const handleOfferStatusChange = async (offerId: string, newStatus: 'Szkic' | 'Wysłana' | 'Zaakceptowana' | 'Odrzucona') => {
    try {
      const offer = offers.find(o => o.id === offerId);
      await changeOfferStatus(offerId, newStatus);
      await addToHistory(
        "Edytowano",
        "Oferta",
        offerId,
        `Zmieniono status oferty ${offer?.title} na ${newStatus}`,
        {
          before: { status: offer?.status },
          after: { status: newStatus },
        },
        user,
      );
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };



  return (
    <div className="min-h-screen bg-background">
      {/* Nagłówek */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel Finansowy</h1>
              <p className="text-muted-foreground">Zarządzaj przychodami, wydatkami i analizami finansowymi</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Witaj, {user?.firstName || user?.fullName}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Image
                        className="h-10 w-10 rounded-full object-cover border-2 border-border"
                        src={user?.imageUrl || "/placeholder.svg?height=40&width=40"}
                        alt={user?.fullName || "User"}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ustawienia</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Bezpieczeństwo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Płatności</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <SignOutButton>
                        <div className="flex items-center w-full cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Wyloguj</span>
                        </div>
                      </SignOutButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="transition-all duration-200 hover:bg-accent">
              Panel główny
            </TabsTrigger>
            <TabsTrigger value="invoices" className="transition-all duration-200 hover:bg-accent">
              Faktury
            </TabsTrigger>
            <TabsTrigger value="expenses" className="transition-all duration-200 hover:bg-accent">
              Wydatki
            </TabsTrigger>
            <TabsTrigger value="offers" className="transition-all duration-200 hover:bg-accent">
              Oferty
            </TabsTrigger>
            <TabsTrigger value="recurring" className="transition-all duration-200 hover:bg-accent">
              Płatności cykliczne
            </TabsTrigger>
            <TabsTrigger value="history" className="transition-all duration-200 hover:bg-accent">
              Historia
            </TabsTrigger>
          </TabsList>

          {/* Panel główny */}
          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Karty podsumowania finansowego */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Przychód</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} zł</div>
                  )}
                  <p className={cn(
                    "text-xs",
                    revenueChange > 0 ? "text-green-600" : revenueChange < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {formatPercentageChange(revenueChange)}
                  </p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dochód</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{netProfit.toLocaleString()} zł</div>
                  )}
                  <p className={cn(
                    "text-xs",
                    incomeChange > 0 ? "text-green-600" : incomeChange < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {formatPercentageChange(incomeChange)}
                  </p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wydatki</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} zł</div>
                      <div className="flex flex-row gap-2">
                        <p className={cn(
                          "text-xs",
                          expensesChange > 0 ? "text-red-600" : expensesChange < 0 ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {formatPercentageChange(expensesChange)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cykliczne: {monthlyRecurring.toLocaleString()} zł
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VAT</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{totalVat.toLocaleString()} zł</div>
                      <p className={cn(
                        "text-xs",
                        vatChange > 0 ? "text-red-600" : vatChange < 0 ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {formatPercentageChange(vatChange)}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sekcja wykresów */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle>Przychody vs Wydatki</CardTitle>
                  <CardDescription>Miesięczne porównanie dochodów i wydatków</CardDescription>
                </CardHeader>
                <CardContent>{isLoading ? <LoadingSkeleton /> : <RevenueChart />}</CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle>Podział wydatków</CardTitle>
                  <CardDescription>Wydatki według kategorii</CardDescription>
                </CardHeader>
                <CardContent>{isLoading ? <LoadingSkeleton /> : <ExpenseChart />}</CardContent>
              </Card>
            </div>

            {/* Sekcje z przyciskami przekierowania */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ostatnie faktury</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToTab("invoices")}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="space-y-2">
                      {invoices.slice(0, 3).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.client}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount.toLocaleString()} zł</p>
                            <Badge
                              variant={invoice.status === "Zapłacona" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ostatnie wydatki</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToTab("expenses")}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="space-y-2">
                      {expenses.slice(0, 3).map((expense, index) => (
                        <div key={expense.id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-sm text-muted-foreground">{expense.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{expense.amount.toLocaleString()} zł</p>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                          {index < 2 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Płatności cykliczne</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToTab("recurring")}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="space-y-3">
                      {recurringPayments
                        .filter((p) => p.active)
                        .slice(0, 3)
                        .map((payment, index) => (
                          <div key={payment.id}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{payment.name}</p>
                                <p className="text-sm text-muted-foreground">Następna: {payment.nextPayment}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{payment.amount} zł</p>
                                <Badge variant="outline" className="text-xs">
                                  {payment.frequency}
                                </Badge>
                              </div>
                            </div>
                            {index < 2 && <Separator className="my-3" />}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Faktury */}
          <TabsContent value="invoices" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Faktury</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Szukaj faktury..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[350px]"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtruj status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie statusy</SelectItem>
                    <SelectItem value="stworzona">Stworzona</SelectItem>
                    <SelectItem value="wysłana">Wysłana</SelectItem>
                    <SelectItem value="zapłacona">Zapłacona</SelectItem>
                    <SelectItem value="przeterminowana">Przeterminowana</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="transition-all duration-200 hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj fakturę
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddInvoice();
                    }}>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? "Edytuj fakturę" : "Dodaj nową fakturę"}</DialogTitle>
                        <DialogDescription>Wprowadź szczegóły faktury i opcjonalnie prześlij PDF</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="invoiceNumber">Numer faktury</Label>
                          <Input
                            id="invoiceNumber"
                            placeholder={nextInvoiceNumber}
                            value={newInvoice.invoiceNumber}
                            onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">Pozostaw puste, aby użyć automatycznego numeru</p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="client">Klient</Label>
                          <Input
                            id="client"
                            placeholder="Nazwa klienta"
                            value={newInvoice.client}
                            onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Kwota (zł)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={newInvoice.amount}
                            onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="vatRate">Stawka VAT (%)</Label>
                          <Input
                            id="vatRate"
                            type="number"
                            placeholder="8"
                            value={newInvoice.vatRate}
                            onChange={(e) => setNewInvoice({ ...newInvoice, vatRate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">Termin płatności</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newInvoice.dueDate}
                            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Opis</Label>
                          <Textarea
                            id="description"
                            placeholder="Opis faktury"
                            value={newInvoice.description}
                            onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="representativeName">Przedstawiciel firmy (wołacz)</Label>
                          <Input
                            id="representativeName"
                            placeholder="Imię i nazwisko w wołaczu"
                            value={newInvoice.representativeName}
                            onChange={(e) => setNewInvoice({ ...newInvoice, representativeName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="representativeGender">Płeć przedstawiciela</Label>
                          <Select
                            value={newInvoice.representativeGender}
                            onValueChange={(value) => setNewInvoice({ ...newInvoice, representativeGender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz płeć" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Mężczyzna</SelectItem>
                              <SelectItem value="female">Kobieta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="representativeEmail">Email przedstawiciela</Label>
                          <Input
                            id="representativeEmail"
                            type="email"
                            placeholder="email@firma.com"
                            value={newInvoice.representativeEmail}
                            onChange={(e) => setNewInvoice({ ...newInvoice, representativeEmail: e.target.value })}
                          />
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                          <Label htmlFor="invoice-pdf">PDF faktury (opcjonalnie)</Label>
                          <Input
                            id="invoice-pdf"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSelectedInvoiceFile(e.target.files?.[0] || null)}
                          />
                          {selectedInvoiceFile && (
                            <div className="p-2 bg-muted rounded text-sm flex justify-between items-center">
                              <div>
                                <p>Wybrany plik: {selectedInvoiceFile.name}</p>
                                <p className="text-muted-foreground">
                                  Rozmiar: {(selectedInvoiceFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedInvoiceFile(null)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="transition-all duration-200 hover:scale-105">
                          {editingItem ? "Zapisz zmiany" : "Dodaj fakturę"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Replace the invoice table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr faktury</TableHead>
                  <TableHead>Data wysłania</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.sentDate || "-"}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.amount.toLocaleString()} zł</TableCell>
                    <TableCell>
                      {invoice.tax.toLocaleString()} zł ({invoice.vatRate}%)
                    </TableCell>
                    <TableCell className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Badge
                            variant={
                              invoice.status === "Zapłacona"
                                ? "default"
                                : invoice.status === "Przeterminowana"
                                  ? "destructive"
                                  : invoice.status === "Wysłana"
                                    ? "secondary"
                                    : "outline"
                            }
                            className="cursor-pointer hover:opacity-80"
                          >
                            {invoice.status}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 grid gap-1">
                          {(["Stworzona", "Wysłana", "Zapłacona", "Przeterminowana"] as InvoiceStatus[]).map((status) => (
                            <Badge
                              key={status}
                              variant={
                                status === "Zapłacona"
                                  ? "default"
                                  : status === "Przeterminowana"
                                    ? "destructive"
                                    : status === "Wysłana"
                                      ? "secondary"
                                      : "outline"
                              }
                              className={cn(
                                "cursor-pointer hover:opacity-80 justify-center",
                                status === invoice.status && "opacity-50 pointer-events-none"
                              )}
                              onClick={() => handleStatusChange(invoice.id, status)}
                            >
                              {status}
                            </Badge>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      {invoice.pdfUrl ? (
                        <Button variant="ghost" size="sm" onClick={() => openPdfModal(invoice.pdfUrl!)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(invoice, "invoice")}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {invoice.status === "Przeterminowana" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remindClient(invoice)}
                            className="transition-all duration-200 hover:scale-105"
                            title={`Wyślij przypomnienie do ${invoice.representativeEmail}`}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Wydatki */}
          <TabsContent value="expenses" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Wydatki</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Szukaj wydatku..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[350px]"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtruj kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie kategorie</SelectItem>
                    <SelectItem value="operacyjne">Operacyjne</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="subskrypcje">Subskrypcje</SelectItem>
                    <SelectItem value="sprzęt">Sprzęt</SelectItem>
                    <SelectItem value="podróże">Podróże</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="transition-all duration-200 hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj wydatek
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddExpense();
                    }}>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? "Edytuj wydatek" : "Dodaj nowy wydatek"}</DialogTitle>
                        <DialogDescription>Wprowadź szczegóły wydatku i opcjonalnie prześlij PDF</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Data wydatku</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Opis</Label>
                          <Input
                            id="description"
                            placeholder="Opis wydatku"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Kwota (zł)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Kategoria</Label>
                          <Select
                            value={newExpense.category}
                            onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz kategorię" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operacyjne">Operacyjne</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Subskrypcje">Subskrypcje</SelectItem>
                              <SelectItem value="Sprzęt">Sprzęt</SelectItem>
                              <SelectItem value="Podróże">Podróże</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                          <Label htmlFor="expense-pdf">PDF wydatku (opcjonalnie)</Label>
                          <Input
                            id="expense-pdf"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSelectedExpenseFile(e.target.files?.[0] || null)}
                          />
                          {selectedExpenseFile && (
                            <div className="p-2 bg-muted rounded text-sm flex justify-between items-center">
                              <div>
                                <p>Wybrany plik: {selectedExpenseFile.name}</p>
                                <p className="text-muted-foreground">
                                  Rozmiar: {(selectedExpenseFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedExpenseFile(null)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="transition-all duration-200 hover:scale-105">
                          {editingItem ? "Zapisz zmiany" : "Dodaj wydatek"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingExpenses ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.amount.toLocaleString()} zł</TableCell>
                    <TableCell>
                      {expense.pdfUrl ? (
                        <Button variant="ghost" size="sm" onClick={() => openPdfModal(expense.pdfUrl!)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense, "expense")}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Oferty */}
          <TabsContent value="offers" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Oferty</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Szukaj oferty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="transition-all duration-200 hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj ofertę
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edytuj ofertę" : "Dodaj nową ofertę"}</DialogTitle>
                      <DialogDescription>Wprowadź szczegóły oferty</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Tytuł oferty</Label>
                        <Input
                          id="title"
                          placeholder="Tytuł oferty"
                          value={newOffer.title}
                          onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="client">Klient</Label>
                        <Input
                          id="client"
                          placeholder="Nazwa klienta"
                          value={newOffer.client}
                          onChange={(e) => setNewOffer({ ...newOffer, client: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Kwota (zł)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newOffer.amount}
                          onChange={(e) => setNewOffer({ ...newOffer, amount: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expirationDate">Data wygaśnięcia</Label>
                        <Input
                          id="expirationDate"
                          type="date"
                          value={newOffer.expirationDate}
                          onChange={(e) => setNewOffer({ ...newOffer, expirationDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="googleDocsUrl">Link do Google Docs</Label>
                        <Input
                          id="googleDocsUrl"
                          type="url"
                          placeholder="docs.google.com/document/..."
                          value={newOffer.googleDocsUrl}
                          onChange={(e) => setNewOffer({ ...newOffer, googleDocsUrl: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Opis</Label>
                        <Textarea
                          id="description"
                          placeholder="Opis oferty"
                          value={newOffer.description}
                          onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddOffer} className="transition-all duration-200 hover:scale-105">
                        {editingItem ? "Zapisz zmiany" : "Dodaj ofertę"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tytuł</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Wygasa za</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOffers ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOffers.map((offer) => (
                  <TableRow key={offer.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>{offer.client}</TableCell>
                    <TableCell>{offer.amount.toLocaleString()} zł</TableCell>
                    <TableCell>{offer.createdDate}</TableCell>
                    <TableCell>
                      <span className={getExpirationColor(offer.daysToExpiration)}>{offer.daysToExpiration} dni</span>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Badge
                            variant={getOfferStatusColor(offer.status)}
                            className="cursor-pointer hover:opacity-80"
                          >
                            {offer.status}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 grid gap-1">
                          {(['Szkic', 'Wysłana', 'Zaakceptowana', 'Odrzucona'] as const).map((status) => (
                            <Badge
                              key={status}
                              variant={getOfferStatusColor(status)}
                              className={cn(
                                "cursor-pointer hover:opacity-80 justify-center",
                                status === offer.status && "opacity-50 pointer-events-none"
                              )}
                              onClick={() => handleOfferStatusChange(offer.id, status)}
                            >
                              {status}
                            </Badge>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(offer, "offer")}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Płatności cykliczne */}
          <TabsContent value="recurring" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Płatności cykliczne</h2>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Szukaj płatności..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[350px]"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filtruj kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie kategorie</SelectItem>
                    <SelectItem value="Subskrypcje">Subskrypcje</SelectItem>
                    <SelectItem value="Operacyjne">Operacyjne</SelectItem>
                    <SelectItem value="Ubezpieczenia">Ubezpieczenia</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isAddRecurringOpen} onOpenChange={setIsAddRecurringOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="transition-all duration-200 hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj płatność
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddRecurring();
                    }}>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? "Edytuj płatność" : "Dodaj nową płatność"}</DialogTitle>
                        <DialogDescription>Wprowadź szczegóły płatności cyklicznej</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nazwa płatności</Label>
                          <Input
                            id="name"
                            placeholder="Nazwa usługi/produktu"
                            value={newRecurring.name}
                            onChange={(e) => setNewRecurring({ ...newRecurring, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Kwota (zł)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={newRecurring.amount}
                            onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="frequency">Częstotliwość</Label>
                          <Select
                            value={newRecurring.frequency}
                            onValueChange={(value) => setNewRecurring({ ...newRecurring, frequency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz częstotliwość" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Miesięcznie">Miesięcznie</SelectItem>
                              <SelectItem value="Kwartalnie">Kwartalnie</SelectItem>
                              <SelectItem value="Rocznie">Rocznie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Kategoria</Label>
                          <Select
                            value={newRecurring.category}
                            onValueChange={(value) => setNewRecurring({ ...newRecurring, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz kategorię" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Subskrypcje">Subskrypcje</SelectItem>
                              <SelectItem value="Operacyjne">Operacyjne</SelectItem>
                              <SelectItem value="Ubezpieczenia">Ubezpieczenia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nextPayment">Data płatności</Label>
                          <Input
                            id="nextPayment"
                            type="date"
                            value={newRecurring.nextPayment}
                            onChange={(e) => setNewRecurring({ ...newRecurring, nextPayment: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Data może być z przeszłości lub przyszłości. System automatycznie obliczy następną płatność.
                          </p>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                          <Label htmlFor="recurring-pdf">PDF dokumentu (opcjonalnie)</Label>
                          <Input
                            id="recurring-pdf"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSelectedRecurringFile(e.target.files?.[0] || null)}
                          />
                          {selectedRecurringFile && (
                            <div className="p-2 bg-muted rounded text-sm flex justify-between items-center">
                              <div>
                                <p>Wybrany plik: {selectedRecurringFile.name}</p>
                                <p className="text-muted-foreground">
                                  Rozmiar: {(selectedRecurringFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRecurringFile(null)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="transition-all duration-200 hover:scale-105">
                          {editingItem ? "Zapisz zmiany" : "Dodaj płatność"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Częstotliwość</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Następna płatność</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecurringPayments ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRecurringPayments.map((payment) => (
                  <TableRow key={payment.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium"
                        onClick={() => handlePaymentDisplay(payment)}
                      >
                        {payment.name}
                      </Button>
                    </TableCell>
                    <TableCell>{payment.amount.toLocaleString()} zł</TableCell>
                    <TableCell>{payment.frequency}</TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>
                      {calculateNextPaymentDate(payment.nextPayment, payment.frequency)}
                    </TableCell>
                    <TableCell>
                      {payment.pdfUrl ? (
                        <Button variant="ghost" size="sm" onClick={() => openPdfModal(payment.pdfUrl!)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={payment.active}
                          onCheckedChange={(checked) => handleToggleRecurring(payment.id, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {payment.active ? "Aktywna" : "Nieaktywna"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(payment, "recurring")}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecurring(payment.id)}
                          className="transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add Payment Display Dialog */}
            <Dialog open={isPaymentDisplayOpen} onOpenChange={setIsPaymentDisplayOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Szczegóły płatności cyklicznej</DialogTitle>
                  <DialogDescription>Informacje o płatności i historia zmian</DialogDescription>
                </DialogHeader>
                {selectedPayment && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label>Status</Label>
                        <Switch
                          checked={selectedPayment.active}
                          onCheckedChange={(checked) => {
                            handleToggleRecurring(selectedPayment.id, checked);
                            setSelectedPayment(prev => prev ? { ...prev, active: checked } : null);
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Nazwa</Label>
                          <p className="font-medium">{selectedPayment.name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Kwota</Label>
                          <p className="font-medium">{selectedPayment.amount.toLocaleString()} zł</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Częstotliwość</Label>
                          <p className="font-medium">{selectedPayment.frequency}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Kategoria</Label>
                          <p className="font-medium">{selectedPayment.category}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Następna płatność</Label>
                        <p className="font-medium">{selectedPayment.nextPayment}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Następna płatność: {calculateNextPaymentDate(selectedPayment.nextPayment, selectedPayment.frequency)}
                      </p>
                      {selectedPayment.pdfUrl && (
                        <div>
                          <Label className="text-muted-foreground">Dokument PDF</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPdfModal(selectedPayment.pdfUrl!)}
                              className="w-full"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Otwórz PDF
                            </Button>
                          </div>
                        </div>
                      )}
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Data utworzenia</Label>
                        <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleDateString('pl-PL')}</p>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedPayment as RecurringPayment, "recurring")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteRecurring(selectedPayment!.id);
                      setIsPaymentDisplayOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Usuń
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Historia */}
          <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Historia zmian</h2>
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtruj według typu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie zmiany</SelectItem>
                  <SelectItem value="Faktura">Faktury</SelectItem>
                  <SelectItem value="Wydatek">Wydatki</SelectItem>
                  <SelectItem value="Oferta">Oferty</SelectItem>
                  <SelectItem value="Płatność cykliczna">Płatności cykliczne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Log aktywności</CardTitle>
                <CardDescription>Wszystkie zmiany w systemie z możliwością cofnięcia</CardDescription>
              </CardHeader>
              <CardContent>
                {isHistoryLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-4">
                    {historyEntries
                      .filter((item) => historyFilter === "all" || item.type === historyFilter)
                      .map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.timestamp}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{item.user.name}</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-muted-foreground">{item.description}</span>
                              </div>
                              {item.changes && (
                                <div className="mt-2 text-xs">
                                  {item.changes.before && (
                                    <div className="text-red-600">
                                      Przed: {JSON.stringify(item.changes.before, null, 2)}
                                    </div>
                                  )}
                                  {item.changes.after && (
                                    <div className="text-green-600">
                                      Po: {JSON.stringify(item.changes.after, null, 2)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {item.revertible && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => revertChange(item)}
                                  className="transition-all duration-200 hover:scale-105"
                                >
                                  <Undo2 className="h-4 w-4 mr-1" />
                                  Cofnij
                                </Button>
                              )}
                            </div>
                          </div>
                          {index < historyEntries.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                    {!isHistoryLoading && historyEntries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Brak zmian w historii. Rozpocznij pracę, aby zobaczyć log aktywności.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profil użytkownika</DialogTitle>
            <DialogDescription>Zarządzaj swoim profilem i ustawieniami konta</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Image
                className="h-16 w-16 rounded-full object-cover border-2 border-border"
                src={user?.imageUrl || "/placeholder.svg?height=64&width=64"}
                alt={user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}
              />
              <div>
                <h3 className="font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}</h3>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Informacje osobiste</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Bezpieczeństwo</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="text-sm">Zmiana hasła</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Metody płatności</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user?.primaryEmailAddress?.emailAddress || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Imię i nazwisko</Label>
              <Input value={user?.firstName ? `${user.firstName} ${user.lastName}` : ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Data utworzenia konta</Label>
              <Input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pl-PL") : ""} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProfileOpen(false)}>Zamknij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add this at the end of the component, before the final closing tag */}
      {/* PDF Modal */}
      {isPdfModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsPdfModalOpen(false)}
        >
          <div className="bg-card w-4/5 h-4/5 rounded-lg shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Podgląd dokumentu</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={currentPdfUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Pobierz
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsPdfModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <iframe src={currentPdfUrl} className="w-full h-full border-0" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}

      {/* Add this before the final closing tag */}
      <Dialog open={reminderConfirmation.isOpen} onOpenChange={(isOpen) =>
        setReminderConfirmation(prev => ({ ...prev, isOpen }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź wysłanie przypomnienia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz wysłać przypomnienie o płatności do {reminderConfirmation.invoice?.representativeEmail}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReminderConfirmation({ isOpen: false, invoice: null })}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleConfirmedReminder}
            >
              Wyślij przypomnienie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}
