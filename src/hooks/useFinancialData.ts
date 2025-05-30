import { useState } from "react"
import type { UserResource } from "@clerk/types"
import { Invoice, Expense, Offer, RecurringPayment, HistoryEntry } from "@/app/types/financial"
import { INITIAL_INVOICES, INITIAL_EXPENSES, INITIAL_OFFERS, INITIAL_RECURRING_PAYMENTS } from "@/constants/financial"
import { addToHistory } from "../utils/financial"
import { uploadToGoogleDrive, sendReminderEmail } from "../services/financial"

export const useFinancialData = (user: UserResource) => {
  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS)
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(INITIAL_RECURRING_PAYMENTS)
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([])

  // Handle invoice status change
  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setInvoices(
      invoices.map((invoice) => {
        if (invoice.id === invoiceId) {
          const updatedInvoice = {
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
            historyLog,
            setHistoryLog
          )

          return updatedInvoice
        }
        return invoice
      })
    )
  }

  // Handle invoice deletion
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
        historyLog,
        setHistoryLog
      )

      setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
    }
  }

  // Handle recurring payment status toggle
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
        historyLog,
        setHistoryLog
      )
    }
  }

  // Handle sending reminder
  const remindClient = async (invoice: Invoice) => {
    try {
      await sendReminderEmail(invoice, user)
      addToHistory(
        "Wysłano przypomnienie",
        "Faktura",
        invoice.id,
        `Wysłano przypomnienie o płatności do ${invoice.representativeEmail}`,
        null,
        user,
        historyLog,
        setHistoryLog
      )
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File, type: "invoice" | "expense") => {
    try {
      const fileName = `${type}-${Date.now()}.pdf`
      const url = await uploadToGoogleDrive(file, fileName)
      return url
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  const handleEdit = (item: any, type: string) => {
    if (type === "invoice") {
      setInvoices(invoices.map(inv => inv.id === item.id ? { ...inv, ...item } : inv));
      addToHistory(
        "Edytowano",
        "Faktura",
        item.id,
        `Edytowano fakturę ${item.id}`,
        { before: invoices.find(inv => inv.id === item.id), after: item },
        user,
        historyLog,
        setHistoryLog
      );
    } else if (type === "expense") {
      setExpenses(expenses.map(exp => exp.id === item.id ? { ...exp, ...item } : exp));
      addToHistory(
        "Edytowano",
        "Wydatek",
        `EXP-${item.id}`,
        `Edytowano wydatek: ${item.description}`,
        { before: expenses.find(exp => exp.id === item.id), after: item },
        user,
        historyLog,
        setHistoryLog
      );
    } else if (type === "offer") {
      setOffers(offers.map(off => off.id === item.id ? { ...off, ...item } : off));
      addToHistory(
        "Edytowano",
        "Oferta",
        item.id,
        `Edytowano ofertę: ${item.title}`,
        { before: offers.find(off => off.id === item.id), after: item },
        user,
        historyLog,
        setHistoryLog
      );
    } else if (type === "recurring") {
      setRecurringPayments(recurringPayments.map(rec => rec.id === item.id ? { ...rec, ...item } : rec));
      addToHistory(
        "Edytowano",
        "Płatność cykliczna",
        `REC-${item.id}`,
        `Edytowano płatność cykliczną: ${item.name}`,
        { before: recurringPayments.find(rec => rec.id === item.id), after: item },
        user,
        historyLog,
        setHistoryLog
      );
    }
  };

  return {
    invoices,
    setInvoices,
    expenses,
    setExpenses,
    offers,
    setOffers,
    recurringPayments,
    setRecurringPayments,
    historyLog,
    setHistoryLog,
    handleStatusChange,
    handleDeleteInvoice,
    toggleRecurringStatus,
    remindClient,
    handleFileUpload,
    handleEdit,
  }
} 