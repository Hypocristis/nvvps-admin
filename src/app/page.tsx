"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInButton } from "@clerk/nextjs"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsNavigating(true)
      router.push("/admin/financial-dashboard")
    }
  }, [isSignedIn, isLoaded, router])

  if (!isLoaded || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Panel Finansowy</CardTitle>
          <CardDescription>Zaloguj się, aby uzyskać dostęp do panelu zarządzania finansami</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <SignInButton mode="modal">
              <Button className="w-full" size="lg">
                Zaloguj się
              </Button>
            </SignInButton>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Bezpieczny dostęp do Twojego panelu finansowego
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
