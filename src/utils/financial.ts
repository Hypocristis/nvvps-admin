import type { UserResource } from "@clerk/types"
import { Invoice, HistoryEntry } from "../app/types/financial"

export const generateNextInvoiceNumber = (invoices: Invoice[]) => {
  if (invoices.length === 0)
    return `1/${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`

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

export const getOfferStatusColor = (status: string) => {
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

export const getExpirationColor = (days: number) => {
  if (days <= 3) return "text-red-500"
  if (days <= 7) return "text-yellow-500"
  return "text-green-500"
}

export const addToHistory = (
  action: string,
  type: string,
  itemId: string,
  description: string,
  changes: any = null,
  user: UserResource,
  historyLog: HistoryEntry[],
  setHistoryLog: (log: HistoryEntry[]) => void
) => {
  const historyEntry: HistoryEntry = {
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
  setHistoryLog([historyEntry, ...historyLog])
}

export const calculateFinancialMetrics = (invoices: Invoice[]) => {
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalTax = invoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  
  return {
    totalRevenue,
    totalTax,
  }
}

export const getInvoiceStatusVariant = (status: string) => {
  switch (status) {
    case "Zapłacona":
      return "default"
    case "Przeterminowana":
      return "destructive"
    case "Wysłana":
      return "secondary"
    default:
      return "outline"
  }
} 