"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold">Food Tech Inventory Manager</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard/teacher">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-green-700">
                Teacher
              </Button>
            </Link>
            <Link href="/dashboard/student">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-green-700">
                Student
              </Button>
            </Link>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-green-700 hover:text-white"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {children}

      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Food Tech Inventory Manager</p>
        </div>
      </footer>
    </div>
  )
}
