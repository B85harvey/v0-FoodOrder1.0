"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getOrdersByStudent, type Order, type User } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

export default function StudentDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingClasses, setUpcomingClasses] = useState<
    { date: Date; dueDate: Date; status: "needed" | "submitted" | "notOpen" }[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)

        // Fetch orders
        const userOrders = await getOrdersByStudent(user.uid)
        setOrders(userOrders)

        // Generate upcoming classes (this would normally come from the database)
        const today = new Date()
        const upcomingDates = [
          {
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
            dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
            status: "needed" as const,
          },
          {
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
            dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 11),
            status: "needed" as const,
          },
          {
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
            dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 18),
            status: "notOpen" as const,
          },
        ]

        // Check if orders exist for these dates
        upcomingDates.forEach((dateObj, index) => {
          const hasOrder = userOrders.some((order) => {
            const orderDate = order.date.toDate()
            return (
              orderDate.getFullYear() === dateObj.date.getFullYear() &&
              orderDate.getMonth() === dateObj.date.getMonth() &&
              orderDate.getDate() === dateObj.date.getDate()
            )
          })

          if (hasOrder) {
            upcomingDates[index].status = "submitted"
          }
        })

        setUpcomingClasses(upcomingDates)
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div>
          <span className="mr-2">Class:</span>
          <Badge variant="outline" className="font-medium">
            {profile?.classId || "Not Assigned"}
          </Badge>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingClasses.map((classObj, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{formatDate(classObj.date)}</CardTitle>
                <CardDescription>Recipe order due by: {formatDate(classObj.dueDate)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge
                      className={
                        classObj.status === "submitted"
                          ? "bg-green-500"
                          : classObj.status === "needed"
                            ? "bg-amber-500"
                            : "bg-gray-500"
                      }
                    >
                      {classObj.status === "submitted"
                        ? "Order Submitted"
                        : classObj.status === "needed"
                          ? "Order Needed"
                          : "Not Yet Open"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {classObj.status === "submitted"
                      ? "Your order has been submitted."
                      : classObj.status === "needed"
                        ? "Please select your recipe and ingredients for the upcoming class."
                        : "Recipe selection will open soon."}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                {classObj.status === "needed" ? (
                  <Link
                    href={`/dashboard/student/order/${classObj.date.toISOString().split("T")[0]}`}
                    className="w-full"
                  >
                    <Button className="w-full">Place Order</Button>
                  </Link>
                ) : classObj.status === "submitted" ? (
                  <Link
                    href={`/dashboard/student/order/${classObj.date.toISOString().split("T")[0]}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant="outline">
                      View Order
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" disabled>
                    Place Order
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Past Orders</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Recipe</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((order) => order.date.toDate() < new Date())
                    .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
                    .map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-4">{order.date.toDate().toLocaleDateString()}</td>
                        <td className="p-4">{order.recipeName}</td>
                        <td className="p-4">
                          <Badge className="bg-green-500">Completed</Badge>
                        </td>
                        <td className="p-4">
                          <Link href={`/dashboard/student/order/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  {orders.filter((order) => order.date.toDate() < new Date()).length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No past orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
