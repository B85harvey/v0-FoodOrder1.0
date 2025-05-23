"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getClasses, getOrders, generateShoppingList, type Class, type Order } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

export default function TeacherDashboard() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [shoppingList, setShoppingList] = useState<
    Record<string, { required: number; inStock: number; toOrder: number; unit: string }>
  >({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, ordersData] = await Promise.all([getClasses(), getOrders()])

        setClasses(classesData)
        setOrders(ordersData)

        // Generate shopping list
        const shoppingListData = await generateShoppingList()
        setShoppingList(shoppingListData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Group orders by class
  const ordersByClass = orders.reduce(
    (acc, order) => {
      if (!acc[order.classId]) {
        acc[order.classId] = []
      }
      acc[order.classId].push(order)
      return acc
    },
    {} as Record<string, Order[]>,
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/inventory">
            <Button variant="outline">Manage Inventory</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">Manage Recipes</Button>
          </Link>
          <Link href="/classes">
            <Button variant="outline">Manage Classes</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">Upcoming Orders</TabsTrigger>
          <TabsTrigger value="shopping">Shopping Lists</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const classOrders = ordersByClass[cls.id || ""] || []
              const submittedOrders = classOrders.length
              const pendingOrders = cls.students - submittedOrders

              return (
                <Card key={cls.id}>
                  <CardHeader>
                    <CardTitle>
                      {cls.name} - {cls.day}
                    </CardTitle>
                    <CardDescription>Next class</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Students:</span>
                        <span className="font-medium">{cls.students}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Orders Submitted:</span>
                        <span className="font-medium">{submittedOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Orders Pending:</span>
                        <span className={`font-medium ${pendingOrders > 0 ? "text-amber-600" : "text-green-600"}`}>
                          {pendingOrders}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Link href={`/dashboard/teacher/class/${cls.id}`}>
                          <Button className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Shopping List for This Week</CardTitle>
              <CardDescription>Based on current inventory and student orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  Object.keys(shoppingList).reduce(
                    (acc, key) => {
                      const item = shoppingList[key]
                      if (item.toOrder <= 0) return acc

                      // Group by category (this is a simplified example)
                      const category =
                        key.includes("flour") || key.includes("sugar") || key.includes("rice")
                          ? "Dry Goods"
                          : key.includes("milk") || key.includes("cheese") || key.includes("butter")
                            ? "Dairy"
                            : key.includes("pepper") || key.includes("salt")
                              ? "Spices"
                              : key.includes("oil")
                                ? "Oils"
                                : "Other"

                      if (!acc[category]) {
                        acc[category] = {}
                      }

                      acc[category][key] = item
                      return acc
                    },
                    {} as Record<
                      string,
                      Record<string, { required: number; inStock: number; toOrder: number; unit: string }>
                    >,
                  ),
                ).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-medium mb-2">{category}</h3>
                    <ul className="space-y-2">
                      {Object.entries(items).map(([name, item]) => (
                        <li key={name} className="flex justify-between">
                          <span>{name}</span>
                          <span className="font-medium">
                            {item.toOrder} {item.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="pt-4 flex justify-end gap-4">
                  <Button variant="outline">Export PDF</Button>
                  <Button>Print List</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Items that need to be restocked soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-left py-2">Current Stock</th>
                      <th className="text-left py-2">Min Level</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(shoppingList)
                      .filter(([_, item]) => item.inStock <= item.required)
                      .map(([name, item]) => (
                        <tr key={name} className="border-b">
                          <td className="py-2">{name}</td>
                          <td className="py-2">
                            {item.inStock} {item.unit}
                          </td>
                          <td className="py-2">
                            {item.required} {item.unit}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                item.inStock <= item.required * 0.5
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.inStock <= item.required * 0.5 ? "Low" : "Medium"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Link href="/inventory">
                  <Button>Update Inventory</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
