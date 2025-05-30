import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Edit, Plus } from "lucide-react"
import { Expense } from "../../app/types/financial"
import { EXPENSE_CATEGORIES } from "@/constants/financial"
import { ExpenseDialog } from "./ExpenseDialog"

interface ExpensesSectionProps {
  expenses: Expense[]
  searchTerm: string
  categoryFilter: string
  isLoading: boolean
  onSearchChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onOpenPdf: (url: string) => void
  onEdit: (item: any, type: string) => void
}

export function ExpensesSection({
  expenses,
  searchTerm,
  categoryFilter,
  isLoading,
  onSearchChange,
  onCategoryFilterChange,
  onOpenPdf,
  onEdit,
}: ExpensesSectionProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || expense.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wydatki</h2>
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Szukaj wydatku..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtruj kategorię" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kategorie</SelectItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="transition-all duration-200 hover:scale-105" onClick={() => setIsAddExpenseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wydatek
          </Button>
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
              <TableCell>
                <Badge variant="outline">{expense.category}</Badge>
              </TableCell>
              <TableCell>{expense.amount.toLocaleString()} zł</TableCell>
              <TableCell>
                {expense.pdfUrl ? (
                  <Button variant="ghost" size="sm" onClick={() => onOpenPdf(expense.pdfUrl!)}>
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
                    onClick={() => onEdit(expense, "expense")}
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

      <ExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
      />
    </div>
  )
} 