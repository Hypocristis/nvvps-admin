import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Trash2 } from "lucide-react"
import { Invoice, NewInvoiceFormData } from "../../app/types/financial"
import { generateNextInvoiceNumber } from "@/utils/financial"
import { DatePicker } from "@/components/ui/date-picker"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  editingInvoice?: Invoice
  onSubmit?: (data: NewInvoiceFormData, file: File | null) => Promise<void>
}

export function InvoiceDialog({ open, onOpenChange, invoices, editingInvoice, onSubmit }: InvoiceDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewInvoiceFormData>({
    id: editingInvoice?.id || "",
    client: editingInvoice?.client || "",
    amount: editingInvoice?.amount.toString() || "",
    dueDate: editingInvoice?.dueDate || "",
    description: "",
    representativeName: editingInvoice?.representativeName || "",
    representativeEmail: editingInvoice?.representativeEmail || "",
    representativeGender: editingInvoice?.representativeGender || "male",
    vatRate: editingInvoice?.vatRate.toString() || "23",
  })

  const handleSubmit = async () => {
    if (onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(formData, selectedFile)
        onOpenChange(false)
        setFormData({
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
        setSelectedFile(null)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingInvoice ? "Edytuj fakturę" : "Dodaj nową fakturę"}</DialogTitle>
          <DialogDescription>Wprowadź szczegóły faktury i opcjonalnie prześlij PDF</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="id">Numer faktury</Label>
              <Input
                id="id"
                placeholder={generateNextInvoiceNumber(invoices)}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Pozostaw puste, aby użyć automatycznego numeru</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Klient</Label>
              <Input
                id="client"
                placeholder="Nazwa klienta"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Kwota (zł)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vatRate">Stawka VAT (%)</Label>
              <Input
                id="vatRate"
                type="number"
                placeholder="23"
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Termin płatności</Label>
              <DatePicker
                date={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onSelect={(date) => setFormData({ ...formData, dueDate: date ? date.toISOString().split('T')[0] : "" })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                placeholder="Opis faktury"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="representativeName">Przedstawiciel firmy (wołacz)</Label>
              <Input
                id="representativeName"
                placeholder="Imię i nazwisko w wołaczu"
                value={formData.representativeName}
                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="representativeGender">Płeć przedstawiciela</Label>
              <Select
                value={formData.representativeGender}
                onValueChange={(value) => setFormData({ ...formData, representativeGender: value })}
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
                value={formData.representativeEmail}
                onChange={(e) => setFormData({ ...formData, representativeEmail: e.target.value })}
              />
            </div>
            <Separator className="my-4" />
            <div className="grid gap-2">
              <Label htmlFor="invoice-pdf">PDF faktury (opcjonalnie)</Label>
              <Input
                id="invoice-pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="p-2 bg-muted rounded text-sm flex justify-between items-center">
                  <div>
                    <p>Wybrany plik: {selectedFile.name}</p>
                    <p className="text-muted-foreground">
                      Rozmiar: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="transition-all duration-200 hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingInvoice ? "Zapisywanie..." : "Dodawanie..."}
              </>
            ) : (
              editingInvoice ? "Zapisz zmiany" : "Dodaj fakturę"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 