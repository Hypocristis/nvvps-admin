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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"
import { Expense, NewExpenseFormData } from "../../app/types/financial"
import { EXPENSE_CATEGORIES } from "@/constants/financial"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingExpense?: Expense
  onSubmit?: (data: NewExpenseFormData, file: File | null) => void
}

export function ExpenseDialog({ open, onOpenChange, editingExpense, onSubmit }: ExpenseDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<NewExpenseFormData>({
    description: editingExpense?.description || "",
    amount: editingExpense?.amount.toString() || "",
    category: editingExpense?.category || "",
    date: editingExpense?.date || "",
  })

  const handleSubmit = () => {
    onSubmit?.(formData, selectedFile)
    onOpenChange(false)
    setFormData({
      description: "",
      amount: "",
      category: "",
      date: "",
    })
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingExpense ? "Edytuj wydatek" : "Dodaj nowy wydatek"}</DialogTitle>
          <DialogDescription>Wprowadź szczegóły wydatku i opcjonalnie prześlij PDF</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Data wydatku</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Input
              id="description"
              placeholder="Opis wydatku"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Kategoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
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
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
        <DialogFooter>
          <Button onClick={handleSubmit} className="transition-all duration-200 hover:scale-105">
            {editingExpense ? "Zapisz zmiany" : "Dodaj wydatek"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 