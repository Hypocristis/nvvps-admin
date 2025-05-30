import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Edit, Bell, Trash2, Plus } from "lucide-react"
import { Invoice } from "../../app/types/financial"
import { getInvoiceStatusVariant } from "@/utils/financial"
import { INVOICE_STATUSES } from "@/constants/financial"
import { InvoiceDialog } from "./InvoiceDialog"

interface InvoicesSectionProps {
  invoices: Invoice[]
  searchTerm: string
  statusFilter: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onStatusChange: (invoiceId: string, newStatus: string) => void
  onDelete: (invoiceId: string) => void
  onRemind: (invoice: Invoice) => Promise<void>
  onOpenPdf: (url: string) => void
  onEdit: (item: any, type: string) => void
}

export function InvoicesSection({
  invoices,
  searchTerm,
  statusFilter,
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onStatusChange,
  onDelete,
  onRemind,
  onOpenPdf,
  onEdit,
}: InvoicesSectionProps) {
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<string | null>(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Faktury</h2>
        <div className="flex items-center gap-2">
          <Input
            className="w-72"
            type="search"
            placeholder="Szukaj faktury..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtruj status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              {INVOICE_STATUSES.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="transition-all duration-200 hover:scale-105" onClick={() => setIsAddInvoiceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj fakturę
          </Button>
        </div>
      </div>

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
                  variant={getInvoiceStatusVariant(invoice.status)}
                  className="cursor-pointer"
                  onClick={() => setIsStatusDropdownOpen(isStatusDropdownOpen === invoice.id ? null : invoice.id)}
                >
                  {invoice.status}
                </Badge>

                {isStatusDropdownOpen === invoice.id && (
                  <div className="absolute z-10 mt-0.5 bg-background p-2 rounded-lg border">
                    <div className="flex flex-col gap-2" role="menu" aria-orientation="vertical">
                      {INVOICE_STATUSES.map((status) => (
                        <Badge
                          key={status}
                          variant={getInvoiceStatusVariant(status)}
                          className="cursor-pointer"
                          onClick={() => {
                            onStatusChange(invoice.id, status)
                            setIsStatusDropdownOpen(null)
                          }}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {invoice.pdfUrl ? (
                  <Button variant="ghost" size="sm" onClick={() => onOpenPdf(invoice.pdfUrl!)}>
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
                    onClick={() => onEdit(invoice, "invoice")}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(invoice.id)}
                    className="transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {invoice.status === "Przeterminowana" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemind(invoice)}
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

      <InvoiceDialog
        open={isAddInvoiceOpen}
        onOpenChange={setIsAddInvoiceOpen}
        invoices={invoices}
      />
    </div>
  )
} 