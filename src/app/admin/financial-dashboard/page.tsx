"use client"

import { useState, useEffect } from "react"
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

// Add this interface after the imports and before the historyLog declaration
interface Invoice {
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

// History logging system
const historyLog: any[] = []

const addToHistory = (
  action: string,
  type: string,
  itemId: string,
  description: string,
  changes: any = null,
  user: any,
) => {
  const historyEntry = {
    id: `hist-${Date.now()}`,
    timestamp: new Date().toLocaleString("pl-PL"),
    user: user || { name: "System", email: "system@app.com" },
    action,
    type,
    itemId,
    description,
    changes,
    revertible: action !== "Wysłano przypomnienie",
  }
  historyLog.unshift(historyEntry)
}

// Mock data - Faktury
const initialInvoices: Invoice[] = [
  {
    id: "1/01/2024",
    date: "2024-01-15",
    sentDate: "2024-01-15",
    client: "Acme Corp",
    amount: 20000,
    tax: 4600,
    vatRate: 23,
    status: "Zapłacona",
    pdfUrl: null,
    dueDate: "2024-02-15",
    representativeName: "Anna Kowalska",
    representativeEmail: "anna.kowalska@acme.com",
    representativeGender: "female",
  },
  {
    id: "2/01/2024",
    date: "2024-01-20",
    sentDate: "2024-01-20",
    client: "TechStart Inc",
    amount: 12800,
    tax: 2944,
    vatRate: 23,
    status: "Przeterminowana",
    pdfUrl: "drive.google.com/file/123",
    dueDate: "2024-02-05",
    representativeName: "Piotr Nowak",
    representativeEmail: "piotr.nowak@techstart.com",
    representativeGender: "male",
  },
  {
    id: "3/01/2024",
    date: "2024-01-25",
    sentDate: "2024-01-25",
    client: "Global Solutions",
    amount: 30000,
    tax: 6900,
    vatRate: 23,
    status: "Zapłacona",
    pdfUrl: "drive.google.com/file/124",
    dueDate: "2024-02-25",
    representativeName: "Maria Wiśniewska",
    representativeEmail: "maria.wisniewska@global.com",
    representativeGender: "female",
  },
  {
    id: "4/02/2024",
    date: "2024-02-01",
    sentDate: null,
    client: "Innovation Labs",
    amount: 16800,
    tax: 3864,
    vatRate: 23,
    status: "Stworzona",
    pdfUrl: null,
    dueDate: "2024-03-01",
    representativeName: "Tomasz Zieliński",
    representativeEmail: "tomasz.zielinski@innovation.com",
    representativeGender: "male",
  },
]

// Mock data - Wydatki
const initialExpenses = [
  { id: 1, date: "2024-01-10", description: "Czynsz biura", amount: 8000, category: "Operacyjne", pdfUrl: null },
  {
    id: 2,
    date: "2024-01-15",
    description: "Kampania marketingowa",
    amount: 6000,
    category: "Marketing",
    pdfUrl: "drive.google.com/file/exp1",
  },
  {
    id: 3,
    date: "2024-01-20",
    description: "Subskrypcje oprogramowania",
    amount: 3200,
    category: "Subskrypcje",
    pdfUrl: null,
  },
  {
    id: 4,
    date: "2024-01-25",
    description: "Zakup sprzętu",
    amount: 12800,
    category: "Sprzęt",
    pdfUrl: "drive.google.com/file/exp2",
  },
  { id: 5, date: "2024-02-01", description: "Koszty podróży", amount: 2600, category: "Podróże", pdfUrl: null },
]

// Mock data - Oferty
const initialOffers = [
  {
    id: "OF-001",
    title: "Projekt strony internetowej - Acme Corp",
    client: "Acme Corp",
    amount: 25000,
    createdDate: "2024-01-10",
    sentDate: "2024-01-12",
    expirationDate: "2024-02-12",
    status: "Wysłana",
    googleDocsUrl: "docs.google.com/document/123",
    daysToExpiration: 5,
  },
  {
    id: "OF-002",
    title: "Aplikacja mobilna - TechStart",
    client: "TechStart Inc",
    amount: 45000,
    createdDate: "2024-01-15",
    sentDate: "2024-01-18",
    expirationDate: "2024-02-18",
    status: "Zaakceptowana",
    googleDocsUrl: "docs.google.com/document/124",
    daysToExpiration: 11,
  },
  {
    id: "OF-003",
    title: "Konsultacje IT - Global Solutions",
    client: "Global Solutions",
    amount: 15000,
    createdDate: "2024-02-01",
    sentDate: null,
    expirationDate: "2024-03-01",
    status: "Szkic",
    googleDocsUrl: "docs.google.com/document/125",
    daysToExpiration: 23,
  },
]

// Mock data - Płatności cykliczne
const initialRecurringPayments = [
  {
    id: 1,
    name: "Adobe Creative Suite",
    amount: 299,
    frequency: "Miesięcznie",
    nextPayment: "2024-02-15",
    category: "Subskrypcje",
    active: true,
  },
  {
    id: 2,
    name: "Hosting serwera",
    amount: 150,
    frequency: "Miesięcznie",
    nextPayment: "2024-02-20",
    category: "Operacyjne",
    active: true,
  },
  {
    id: 3,
    name: "Ubezpieczenie biznesowe",
    amount: 800,
    frequency: "Miesięcznie",
    nextPayment: "2024-02-25",
    category: "Ubezpieczenia",
    active: false,
  },
]

export default function FinancialDashboard() {
  const { user, isLoaded, isSignedIn } = useUser()

  // Data states
  const [invoices, setInvoices] = useState(initialInvoices)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [offers, setOffers] = useState(initialOffers)
  const [recurringPayments, setRecurringPayments] = useState(initialRecurringPayments)

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false)
  const [isEditRecurringOpen, setIsEditRecurringOpen] = useState(false)
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // File upload states
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(null)
  const [selectedExpenseFile, setSelectedExpenseFile] = useState<File | null>(null)

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    id: "",
    client: "",
    amount: "",
    dueDate: "",
    description: "",
    representativeName: "",
    representativeEmail: "",
    representativeGender: "male",
    vatRate: "23",
  })

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
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<string | null>(null)

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
  const uploadToGoogleDrive = async (file: File, fileName: string) => {
    try {
      // Mock Google Drive API call
      console.log(`Uploading ${fileName} to Google Drive...`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockDriveUrl = `https://drive.google.com/file/${Math.random().toString(36).substr(2, 9)}`
      console.log(`File uploaded successfully: ${mockDriveUrl}`)

      return mockDriveUrl
    } catch (error) {
      console.error("Error uploading to Google Drive:", error)
      throw error
    }
  }

  // Email API integration
  const sendReminderEmail = async (invoice: any, userInfo: any) => {
    try {
      const greeting = invoice.representativeGender === "female" ? "Szanowna Pani" : "Szanowny Panie"

      const emailData = {
        to: invoice.representativeEmail,
        subject: `Przypomnienie o płatności - Faktura ${invoice.id}`,
        html: `
          <h2>Przypomnienie o płatności</h2>
          <p>${greeting} ${invoice.representativeName},</p>
          
          <p>Uprzejmie przypominamy o zaległej płatności za fakturę <strong>${invoice.id}</strong> z dnia ${invoice.date}.</p>
          
          <h3>Szczegóły faktury:</h3>
          <ul>
            <li><strong>Numer:</strong> ${invoice.id}</li>
            <li><strong>Kwota:</strong> ${invoice.amount.toLocaleString()} zł</li>
            <li><strong>Termin płatności:</strong> ${invoice.dueDate}</li>
            <li><strong>Klient:</strong> ${invoice.client}</li>
          </ul>
          
          <p>Prosimy o jak najszybsze uregulowanie należności.</p>
          
          <p>Z poważaniem,<br>
          ${userInfo?.fullName || userInfo?.name || "Panel Finansowy"}<br>
          ${userInfo?.primaryEmailAddress?.emailAddress || userInfo?.email}</p>
        `,
      }

      // Mock Email API call (replace with actual service like SendGrid, Resend, etc.)
      console.log("Sending email via API:", emailData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Email sent successfully!")
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  // Obliczenia sum
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalTax = invoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const monthlyRecurring = recurringPayments.filter((p) => p.active).reduce((sum, payment) => sum + payment.amount, 0)

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

  // Add this function to generate next invoice number
  const generateNextInvoiceNumber = () => {
    if (invoices.length === 0)
      return `1/${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`

    // Extract the numeric part of the last invoice ID
    const lastInvoice = [...invoices].sort((a, b) => {
      const numA = Number.parseInt(a.id.split("/")[0])
      const numB = Number.parseInt(b.id.split("/")[0])
      return numB - numA
    })[0]

    const lastNumber = Number.parseInt(lastInvoice.id.split("/")[0])
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")
    const currentYear = new Date().getFullYear()

    return `${lastNumber + 1}/${currentMonth}/${currentYear}`
  }

  // Add this function to handle status change
  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setInvoices(
      invoices.map((invoice) => {
        if (invoice.id === invoiceId) {
          const updatedInvoice: Invoice = {
            ...invoice,
            status: newStatus,
            sentDate: newStatus === "Wysłana" ? new Date().toISOString().split("T")[0] : invoice.sentDate,
          }

          addToHistory(
            "Edytowano",
            "Faktura",
            invoiceId,
            `Zmieniono status faktury ${invoiceId} na ${newStatus}`,
            { before: { status: invoice.status }, after: { status: newStatus } },
            user,
          )

          return updatedInvoice
        }
        return invoice
      }),
    )

    setIsStatusDropdownOpen(null)
  }

  // Add this function to handle invoice deletion
  const handleDeleteInvoice = (invoiceId: string) => {
    const invoiceToDelete = invoices.find((inv) => inv.id === invoiceId)

    if (invoiceToDelete) {
      addToHistory(
        "Usunięto",
        "Faktura",
        invoiceId,
        `Usunięto fakturę ${invoiceId}`,
        { deleted: invoiceToDelete },
        user,
      )

      setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
    }
  }

  // Add this function to open PDF modal
  const openPdfModal = (url: string) => {
    setCurrentPdfUrl(url)
    setIsPdfModalOpen(true)
  }

  // Handler functions
  const handleAddInvoice = async () => {
    try {
      let pdfUrl: string | null = null
      if (selectedInvoiceFile) {
        pdfUrl = await uploadToGoogleDrive(selectedInvoiceFile, `invoice-${Date.now()}.pdf`)
      }

      const invoiceId = newInvoice.id || generateNextInvoiceNumber()
      const vatRate = Number.parseFloat(newInvoice.vatRate)
      const amount = Number.parseFloat(newInvoice.amount)

      const invoiceData: Invoice = {
        id: invoiceId,
        date: new Date().toISOString().split("T")[0],
        sentDate: null,
        client: newInvoice.client,
        amount: amount,
        tax: amount * (vatRate / 100),
        vatRate: vatRate,
        status: "Stworzona",
        pdfUrl,
        dueDate: newInvoice.dueDate,
        representativeName: newInvoice.representativeName,
        representativeEmail: newInvoice.representativeEmail,
        representativeGender: newInvoice.representativeGender,
      }

      if (editingItem) {
        const oldInvoice = invoices.find((inv) => inv.id === editingItem.id)
        setInvoices(
          invoices.map((inv) =>
            inv.id === editingItem.id
              ? { ...inv, ...invoiceData, id: editingItem.id, status: inv.status, sentDate: inv.sentDate }
              : inv,
          ),
        )
        addToHistory(
          "Edytowano",
          "Faktura",
          editingItem.id,
          `Edytowano fakturę ${editingItem.id}`,
          { before: oldInvoice, after: invoiceData },
          user,
        )
      } else {
        setInvoices([...invoices, invoiceData])
        addToHistory(
          "Dodano",
          "Faktura",
          invoiceData.id,
          `Dodano nową fakturę ${invoiceData.id} dla ${invoiceData.client}`,
          { before: null, after: invoiceData },
          user,
        )
      }

      setIsAddInvoiceOpen(false)
      setNewInvoice({
        id: "",
        client: "",
        amount: "",
        dueDate: "",
        description: "",
        representativeName: "",
        representativeEmail: "",
        representativeGender: "male",
        vatRate: "23",
      })
      setSelectedInvoiceFile(null)
      setEditingItem(null)
    } catch (error) {
      console.error("Error adding invoice:", error)
    }
  }

  const handleAddExpense = async () => {
    try {
      let pdfUrl = null
      if (selectedExpenseFile) {
        pdfUrl = await uploadToGoogleDrive(selectedExpenseFile, `expense-${Date.now()}.pdf`)
      }

      const expenseData = {
        id: expenses.length + 1,
        date: newExpense.date,
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        pdfUrl,
      }

      if (editingItem) {
        const oldExpense = expenses.find((exp) => exp.id === editingItem.id)
        setExpenses(
          expenses.map((exp) => (exp.id === editingItem.id ? { ...exp, ...expenseData, id: editingItem.id } : exp)),
        )
        addToHistory(
          "Edytowano",
          "Wydatek",
          `EXP-${editingItem.id}`,
          `Edytowano wydatek: ${expenseData.description}`,
          { before: oldExpense, after: expenseData },
          user,
        )
      } else {
        setExpenses([...expenses, expenseData])
        addToHistory(
          "Dodano",
          "Wydatek",
          `EXP-${expenseData.id}`,
          `Dodano nowy wydatek: ${expenseData.description}`,
          { before: null, after: expenseData },
          user,
        )
      }

      setIsAddExpenseOpen(false)
      setNewExpense({ description: "", amount: "", category: "", date: "" })
      setSelectedExpenseFile(null)
      setEditingItem(null)
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const handleAddRecurring = () => {
    const recurringData = {
      id: recurringPayments.length + 1,
      name: newRecurring.name,
      amount: Number.parseFloat(newRecurring.amount),
      frequency: newRecurring.frequency,
      category: newRecurring.category,
      nextPayment: newRecurring.nextPayment,
      active: true,
    }

    if (editingItem) {
      const oldRecurring = recurringPayments.find((rec) => rec.id === editingItem.id)
      setRecurringPayments(
        recurringPayments.map((rec) =>
          rec.id === editingItem.id ? { ...rec, ...recurringData, id: editingItem.id } : rec,
        ),
      )
      addToHistory(
        "Edytowano",
        "Płatność cykliczna",
        `REC-${editingItem.id}`,
        `Edytowano płatność cykliczną: ${recurringData.name}`,
        { before: oldRecurring, after: recurringData },
        user,
      )
    } else {
      setRecurringPayments([...recurringPayments, recurringData])
      addToHistory(
        "Dodano",
        "Płatność cykliczna",
        `REC-${recurringData.id}`,
        `Dodano nową płatność cykliczną: ${recurringData.name}`,
        { before: null, after: recurringData },
        user,
      )
    }

    setIsAddRecurringOpen(false)
    setIsEditRecurringOpen(false)
    setNewRecurring({ name: "", amount: "", frequency: "", category: "", nextPayment: "" })
    setEditingItem(null)
  }

  const handleAddOffer = () => {
    const offerData = {
      id: `OF-${String(offers.length + 1).padStart(3, "0")}`,
      title: newOffer.title,
      client: newOffer.client,
      amount: Number.parseFloat(newOffer.amount),
      createdDate: new Date().toISOString().split("T")[0],
      sentDate: null,
      expirationDate: newOffer.expirationDate,
      status: "Szkic",
      googleDocsUrl: newOffer.googleDocsUrl,
      daysToExpiration: Math.ceil(
        (new Date(newOffer.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      ),
    }

    if (editingItem) {
      const oldOffer = offers.find((off) => off.id === editingItem.id)
      setOffers(offers.map((off) => (off.id === editingItem.id ? { ...off, ...offerData, id: editingItem.id } : off)))
      addToHistory(
        "Edytowano",
        "Oferta",
        editingItem.id,
        `Edytowano ofertę: ${offerData.title}`,
        { before: oldOffer, after: offerData },
        user,
      )
    } else {
      setOffers([...offers, offerData])
      addToHistory(
        "Dodano",
        "Oferta",
        offerData.id,
        `Dodano nową ofertę: ${offerData.title}`,
        { before: null, after: offerData },
        user,
      )
    }

    setIsAddOfferOpen(false)
    setNewOffer({ title: "", client: "", amount: "", expirationDate: "", googleDocsUrl: "", description: "" })
    setEditingItem(null)
  }

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type })

    if (type === "invoice") {
      setNewInvoice({
        id: item.id,
        client: item.client,
        amount: item.amount.toString(),
        dueDate: item.dueDate,
        description: item.description || "",
        representativeName: item.representativeName,
        representativeEmail: item.representativeEmail,
        representativeGender: item.representativeGender || "male",
        vatRate: item.vatRate.toString(),
      })
      setIsAddInvoiceOpen(true)
    }

    if (type === "expense") {
      setNewExpense({
        description: item.description,
        amount: item.amount.toString(),
        category: item.category,
        date: item.date,
      })
      setIsAddExpenseOpen(true)
    }

    if (type === "offer") {
      setNewOffer({
        title: item.title,
        client: item.client,
        amount: item.amount.toString(),
        expirationDate: item.expirationDate,
        googleDocsUrl: item.googleDocsUrl,
        description: item.description || "",
      })
      setIsAddOfferOpen(true)
    }

    if (type === "recurring") {
      setNewRecurring({
        name: item.name,
        amount: item.amount.toString(),
        frequency: item.frequency,
        category: item.category,
        nextPayment: item.nextPayment,
      })
      setIsEditRecurringOpen(true)
    }
  }

  const toggleRecurringStatus = (id: number) => {
    const payment = recurringPayments.find((p) => p.id === id)
    if (payment) {
      const newStatus = !payment.active
      setRecurringPayments(recurringPayments.map((p) => (p.id === id ? { ...p, active: newStatus } : p)))
      addToHistory(
        "Edytowano",
        "Płatność cykliczna",
        `REC-${id}`,
        `${newStatus ? "Aktywowano" : "Dezaktywowano"} płatność cykliczną: ${payment.name}`,
        { before: { active: payment.active }, after: { active: newStatus } },
        user,
      )
    }
  }

  const remindClient = async (invoice: any) => {
    try {
      await sendReminderEmail(invoice, user)
      addToHistory(
        "Wysłano przypomnienie",
        "Faktura",
        invoice.id,
        `Wysłano przypomnienie o płatności do ${invoice.representativeEmail}`,
        null,
        user,
      )
      alert(`Przypomnienie zostało wysłane do ${invoice.representativeEmail}`)
    } catch (error) {
      alert("Błąd podczas wysyłania przypomnienia")
    }
  }

  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName)
  }

  const revertChange = (historyItem: any) => {
    if (!historyItem.revertible) return

    // Implementation for reverting changes would go here
    console.log("Reverting change:", historyItem)
    addToHistory(
      "Cofnięto",
      historyItem.type,
      historyItem.itemId,
      `Cofnięto zmianę: ${historyItem.description}`,
      { reverted: historyItem.changes },
      user,
    )
  }

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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )

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
                      <img
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
                  <CardTitle className="text-sm font-medium">Całkowity przychód</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} zł</div>
                  )}
                  <p className="text-xs text-muted-foreground">+12.5% od zeszłego miesiąca</p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Całkowite wydatki</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} zł</div>
                  )}
                  <p className="text-xs text-muted-foreground">+2.1% od zeszłego miesiąca</p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Zysk netto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{netProfit.toLocaleString()} zł</div>
                  )}
                  <p className="text-xs text-muted-foreground">+18.2% od zeszłego miesiąca</p>
                </CardContent>
              </Card>
              <Card className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VAT do zapłaty</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">{totalTax.toLocaleString()} zł</div>
                  )}
                  <p className="text-xs text-muted-foreground">Stawka VAT 23%</p>
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
                            <p className="font-medium">{invoice.id}</p>
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
                      {expenses.slice(0, 3).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
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
                  <CardDescription>Miesięczne koszty: {monthlyRecurring.toLocaleString()} zł</CardDescription>
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
                            {index < 2 && <Separator className="mt-3" />}
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
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
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
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edytuj fakturę" : "Dodaj nową fakturę"}</DialogTitle>
                      <DialogDescription>Wprowadź szczegóły faktury i opcjonalnie prześlij PDF</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="id">Numer faktury</Label>
                        <Input
                          id="id"
                          placeholder={generateNextInvoiceNumber()}
                          value={newInvoice.id}
                          onChange={(e) => setNewInvoice({ ...newInvoice, id: e.target.value })}
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
                          placeholder="23"
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
                      <Button onClick={handleAddInvoice} className="transition-all duration-200 hover:scale-105">
                        {editingItem ? "Zapisz zmiany" : "Dodaj fakturę"}
                      </Button>
                    </DialogFooter>
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
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.sentDate || "-"}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.amount.toLocaleString()} zł</TableCell>
                    <TableCell>
                      {invoice.tax.toLocaleString()} zł ({invoice.vatRate}%)
                    </TableCell>
                    <TableCell className="relative">
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
                        className="cursor-pointer"
                        onClick={() => setIsStatusDropdownOpen(isStatusDropdownOpen === invoice.id ? null : invoice.id)}
                      >
                        {invoice.status}
                      </Badge>

                      {isStatusDropdownOpen === invoice.id && (
                        <div className="absolute z-10 mt-1 w-40 rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {["Stworzona", "Wysłana", "Zapłacona", "Przeterminowana"].map((status) => (
                              <button
                                key={status}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-accent ${
                                  status === invoice.status ? "bg-muted" : ""
                                }`}
                                onClick={() => handleStatusChange(invoice.id, status)}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
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
                      <Button onClick={handleAddExpense} className="transition-all duration-200 hover:scale-105">
                        {editingItem ? "Zapisz zmiany" : "Dodaj wydatek"}
                      </Button>
                    </DialogFooter>
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
                {filteredExpenses.map((expense) => (
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
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>{offer.client}</TableCell>
                    <TableCell>{offer.amount.toLocaleString()} zł</TableCell>
                    <TableCell>{offer.createdDate}</TableCell>
                    <TableCell>
                      <span className={getExpirationColor(offer.daysToExpiration)}>{offer.daysToExpiration} dni</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOfferStatusColor(offer.status)}>{offer.status}</Badge>
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
              <Dialog open={isAddRecurringOpen} onOpenChange={setIsAddRecurringOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="transition-all duration-200 hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj płatność
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
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
                      <Label htmlFor="nextPayment">Następna płatność</Label>
                      <Input
                        id="nextPayment"
                        type="date"
                        value={newRecurring.nextPayment}
                        onChange={(e) => setNewRecurring({ ...newRecurring, nextPayment: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddRecurring} className="transition-all duration-200 hover:scale-105">
                      {editingItem ? "Zapisz zmiany" : "Dodaj płatność"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Częstotliwość</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Następna płatność</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringPayments.map((payment) => (
                  <TableRow key={payment.id} className="transition-all duration-200 hover:bg-muted/50">
                    <TableCell className="font-medium">{payment.name}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} zł</TableCell>
                    <TableCell>{payment.frequency}</TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>{payment.nextPayment}</TableCell>
                    <TableCell>
                      <Badge variant={payment.active ? "default" : "secondary"}>
                        {payment.active ? "Aktywna" : "Nieaktywna"}
                      </Badge>
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
                          onClick={() => toggleRecurringStatus(payment.id)}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          {payment.active ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-4">
                    {historyLog
                      .filter((item) => historyFilter === "all" || item.type === historyFilter)
                      .map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-start justify-between p-4 rounded-lg border transition-all duration-200 hover:bg-muted/50">
                            <div className="flex items-start gap-3">
                              <img
                                className="h-8 w-8 rounded-full object-cover border"
                                src={item.user?.imageUrl || "/placeholder.svg?height=32&width=32"}
                                alt={item.user?.fullName || item.user?.name || "User"}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant={
                                      item.action === "Dodano"
                                        ? "default"
                                        : item.action === "Edytowano"
                                          ? "secondary"
                                          : item.action === "Usunięto"
                                            ? "destructive"
                                            : "outline"
                                    }
                                  >
                                    {item.action}
                                  </Badge>
                                  <Badge variant="outline">{item.type}</Badge>
                                  <span className="text-sm text-muted-foreground">{item.itemId}</span>
                                </div>
                                <p className="text-sm font-medium">{item.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.user?.fullName || item.user?.name || "Użytkownik"} • {item.timestamp}
                                </p>
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
                          {index < historyLog.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                    {historyLog.length === 0 && (
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
              <img
                className="h-16 w-16 rounded-full object-cover border-2 border-border"
                src={user?.imageUrl || "/placeholder.svg?height=64&width=64"}
                alt={user?.fullName || "User"}
              />
              <div>
                <h3 className="font-medium">{user?.fullName}</h3>
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
              <Input value={user?.fullName || ""} disabled />
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
    </div>
  )
}
