"use client"

import { useState, useEffect } from "react"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import type { UserResource } from "@clerk/types"
import { useFinancialData } from "@/hooks/useFinancialData"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { ProfileDialog } from "@/components/dashboard/ProfileDialog"
import { PdfViewerDialog } from "@/components/dashboard/PdfViewerDialog"

export default function FinancialDashboard() {
  const { user, isLoaded, isSignedIn } = useUser()

  // Get financial data and handlers from custom hook
  const {
    invoices,
    expenses,
    offers,
    recurringPayments,
    historyLog,
    handleStatusChange,
    handleDeleteInvoice,
    toggleRecurringStatus,
    remindClient,
    handleFileUpload,
    handleEdit,
  } = useFinancialData(user as UserResource)

  // UI states
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [currentPdfUrl, setCurrentPdfUrl] = useState("")

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

  const openPdfModal = (url: string) => {
    setCurrentPdfUrl(url)
    setIsPdfModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={user} 
        onProfileClick={() => setIsProfileOpen(true)} 
      />

      <div className="container mx-auto px-4 py-6">
        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          invoices={invoices}
          expenses={expenses}
          offers={offers}
          recurringPayments={recurringPayments}
          historyLog={historyLog}
          isLoading={isLoading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          historyFilter={historyFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onHistoryFilterChange={setHistoryFilter}
          onStatusChange={handleStatusChange}
          onDeleteInvoice={handleDeleteInvoice}
          onToggleRecurringStatus={toggleRecurringStatus}
          onRemindClient={remindClient}
          onOpenPdf={openPdfModal}
          onEdit={handleEdit}
        />
      </div>

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={user}
      />

      <PdfViewerDialog
        open={isPdfModalOpen}
        onOpenChange={setIsPdfModalOpen}
        pdfUrl={currentPdfUrl}
      />
    </div>
  )
}
