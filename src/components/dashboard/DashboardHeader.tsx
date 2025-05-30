import { UserResource } from "@clerk/types"
import { UserNav } from "./UserNav"

interface DashboardHeaderProps {
  user: UserResource
  onProfileClick: () => void
}

export function DashboardHeader({ user, onProfileClick }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel Finansowy</h1>
            <p className="text-muted-foreground">Zarządzaj przychodami, wydatkami i analizami finansowymi</p>
          </div>
          <UserNav user={user} onProfileClick={onProfileClick} />
        </div>
      </div>
    </div>
  )
} 