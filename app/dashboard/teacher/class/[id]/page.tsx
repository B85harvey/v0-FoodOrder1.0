"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getClass, getOrdersByClass, type Order, type Class } from "@/lib/firestore"
import type { Timestamp } from "firebase/firestore"

export default function ClassOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const classId = params.id as string

  const [classInfo, setClassInfo] = useState<Class | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (classId) {
      const fetchData = async () => {
        try {
          const [classData, ordersData] = await Promise.all([getClass(classId), getOrdersByClass(classId)])

          if (classData) {
            setClassInfo(classData)
          } else {
            toast({ title: "Error", description: "Class not found.", variant: "destructive" })
            router.push("/dashboard/teacher") // Or to classes list
          }
          setOrders(ordersData)
        } catch (error) {
          console.error("Error fetching class orders:", error)
          toast({
            title: "Error",
            description: "Failed to load class orders.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [classId, router, toast])

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!classInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Class information could not be loaded.</p>
        <Button onClick={() => router.push("/classes")} className="mt-4">
          Back to Classes
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders for {classInfo.name}</h1>
          <p className="text-gray-500">
            {classInfo.day} at {classInfo.time} - Room: {classInfo.room}
          </p>
        </div>
        <Button onClick={() => router.push("/classes")}>Back to Classes</Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no student orders submitted for this class yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{order.studentName}</CardTitle>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  Order Date: {formatDate(order.date)} at {formatTime(order.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Recipe: {order.recipeName}</h4>
                <p className="text-sm font-medium mb-1">Ingredients Ordered:</p>
                {order.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {order.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.name} ({ing.amount} {ing.unit})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No specific ingredients listed for this order.</p>
                )}
              </CardContent>
              <CardFooter>
                {/* Add actions like "Mark as Completed" or "View Details" if needed */}
                <Button variant="outline" size="sm" disabled>
                  View Details (Not Implemented)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
