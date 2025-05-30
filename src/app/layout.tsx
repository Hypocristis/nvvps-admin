import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { plPL } from "@clerk/localizations"
import "./globals.css"
import { FirebaseProvider } from "@/providers/FirebaseProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panel Finansowy",
  description: "Administracyjny panel zarządzania finansami",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className="dark">
      <body className={inter.className}>
        <ClerkProvider localization={plPL}>
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
