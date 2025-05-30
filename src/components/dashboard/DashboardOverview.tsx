import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarDays, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from "@/components/revenue-chart"
import { ExpenseChart } from "@/components/expense-chart"
import { Invoice, Expense, RecurringPayment } from "../../app/types/financial"

interface DashboardOverviewProps {
  invoices: Invoice[]
  expenses: Expense[]
  recurringPayments: RecurringPayment[]
  isLoading: boolean
  onNavigateToTab: (tab: string) => void
}

export function DashboardOverview({
  invoices,
  expenses,
  recurringPayments,
  isLoading,
  onNavigateToTab,
}: DashboardOverviewProps) {
  // Calculate financial metrics
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalTax = invoices.reduce((sum, invoice) => sum + invoice.tax, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const monthlyRecurring = recurringPayments.filter((p) => p.active).reduce((sum, payment) => sum + payment.amount, 0)

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
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

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Przychody vs Wydatki</CardTitle>
            <p className="text-sm text-muted-foreground">Miesięczne porównanie dochodów i wydatków</p>
          </CardHeader>
          <CardContent>{isLoading ? <LoadingSkeleton /> : <RevenueChart />}</CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Podział wydatków</CardTitle>
            <p className="text-sm text-muted-foreground">Wydatki według kategorii</p>
          </CardHeader>
          <CardContent>{isLoading ? <LoadingSkeleton /> : <ExpenseChart />}</CardContent>
        </Card>
      </div>

      {/* Quick Access Sections */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ostatnie faktury</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab("invoices")}
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
                      <Badge variant={invoice.status === "Zapłacona" ? "default" : "secondary"} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ostatnie wydatki</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab("expenses")}
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

        {/* Recurring Payments */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Płatności cykliczne</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToTab("recurring")}
                className="transition-all duration-200 hover:scale-105"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Miesięczne koszty: {monthlyRecurring.toLocaleString()} zł</p>
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
    </div>
  )
} 