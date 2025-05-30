import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "./DashboardOverview"
import { InvoicesSection } from "./InvoicesSection"
import { ExpensesSection } from "./ExpensesSection"
import { OffersSection } from "./OffersSection"
import { RecurringPaymentsSection } from "./RecurringPaymentsSection"
import { HistorySection } from "./HistorySection"
import { Invoice, Expense, Offer, RecurringPayment, HistoryEntry } from "../../app/types/financial"

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  invoices: Invoice[]
  expenses: Expense[]
  offers: Offer[]
  recurringPayments: RecurringPayment[]
  historyLog: HistoryEntry[]
  isLoading: boolean
  searchTerm: string
  statusFilter: string
  categoryFilter: string
  historyFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onHistoryFilterChange: (value: string) => void
  onStatusChange: (invoiceId: string, newStatus: string) => void
  onDeleteInvoice: (invoiceId: string) => void
  onToggleRecurringStatus: (id: number) => void
  onRemindClient: (invoice: Invoice) => Promise<void>
  onOpenPdf: (url: string) => void
  onEdit: (item: any, type: string) => void
}

export function DashboardTabs({
  activeTab,
  setActiveTab,
  invoices,
  expenses,
  offers,
  recurringPayments,
  historyLog,
  isLoading,
  searchTerm,
  statusFilter,
  categoryFilter,
  historyFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onHistoryFilterChange,
  onStatusChange,
  onDeleteInvoice,
  onToggleRecurringStatus,
  onRemindClient,
  onOpenPdf,
  onEdit,
}: DashboardTabsProps) {
  return (
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

      <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
        <DashboardOverview
          invoices={invoices}
          expenses={expenses}
          recurringPayments={recurringPayments}
          isLoading={isLoading}
          onNavigateToTab={setActiveTab}
        />
      </TabsContent>

      <TabsContent value="invoices" className="space-y-6 animate-in fade-in-50 duration-500">
        <InvoicesSection
          invoices={invoices}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onStatusChange={onStatusChange}
          onDelete={onDeleteInvoice}
          onRemind={onRemindClient}
          onOpenPdf={onOpenPdf}
          onEdit={onEdit}
        />
      </TabsContent>

      <TabsContent value="expenses" className="space-y-6 animate-in fade-in-50 duration-500">
        <ExpensesSection
          expenses={expenses}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          onCategoryFilterChange={onCategoryFilterChange}
          onOpenPdf={onOpenPdf}
          onEdit={onEdit}
        />
      </TabsContent>

      <TabsContent value="offers" className="space-y-6 animate-in fade-in-50 duration-500">
        <OffersSection
          offers={offers}
          searchTerm={searchTerm}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          onEdit={onEdit}
        />
      </TabsContent>

      <TabsContent value="recurring" className="space-y-6 animate-in fade-in-50 duration-500">
        <RecurringPaymentsSection
          recurringPayments={recurringPayments}
          onToggleStatus={onToggleRecurringStatus}
          onEdit={onEdit}
        />
      </TabsContent>

      <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-500">
        <HistorySection
          historyLog={historyLog}
          historyFilter={historyFilter}
          onHistoryFilterChange={onHistoryFilterChange}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  )
} 