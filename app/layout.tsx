import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import FirebaseInit from "./firebase-init"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Food Tech Inventory Manager",
  description: "Manage recipe orders and inventory for food technology classes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FirebaseInit />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
