"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getClasses, getOrders, generateShoppingList, type Class, type Order } from "@/lib/firestore" // generateShoppingList here is client-side
import { useToast } from "@/hooks/use-toast"
import { getFunctions, httpsCallable, type HttpsCallableResult } from "firebase/functions"
import { app } from "@/lib/firebase-config" // Ensure you export 'app' from firebase-config

export default function TeacherDashboard() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [shoppingList, setShoppingList] = useState<
    Record<string, { required: number; inStock: number; toOrder: number; unit: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [isGeneratingManualList, setIsGeneratingManualList] = useState(false)

  const functions = getFunctions(app) // Initialize Firebase Functions

  const handleGenerateManualShoppingList = async () => {
    setIsGeneratingManualList(true)
    toast({
      title: "Processing...",
      description: "Manually generating the weekly shopping list. This may take a moment.",
    })
    try {
      const generateShoppingListManualFn = httpsCallable(functions, "generateShoppingListManual")
      const result = (await generateShoppingListManualFn()) as HttpsCallableResult<{
        success: boolean
        message: string
        listId?: string
      }>

      if (result.data.success) {
        toast({
          title: "Success!",
          description: `Shopping list generation triggered. List ID: ${result.data.listId || "N/A"}. The list will appear in Firestore shortly.`,
        })
        // Optionally, you could re-fetch the client-side shopping list here or rely on the next scheduled fetch
      } else {
        throw new Error(result.data.message || "Unknown error from cloud function.")
      }
    } catch (error: any) {
      console.error("Error triggering manual shopping list generation:", error)
      toast({
        title: "Error Generating List",
        description:
          error.message ||
          "Failed to trigger manual shopping list generation. Check console and Firebase Function logs.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingManualList(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [classesData, ordersData] = await Promise.all([getClasses(), getOrders()])

        setClasses(classesData)
        setOrders(ordersData)

        // Generate client-side shopping list for display
        // This uses the client-side generateShoppingList from lib/firestore.ts
        const shoppingListData = await generateShoppingList()
        setShoppingList(shoppingListData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Check console for details.",
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shopping List for This Week</CardTitle>
                <CardDescription>Based on current inventory and student orders (client-side view)</CardDescription>
              </div>
              <Button onClick={handleGenerateManualShoppingList} disabled={isGeneratingManualList}>
                {isGeneratingManualList ? "Generating..." : "Trigger Weekly List (Cloud)"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(shoppingList).length === 0 && !loading && (
                  <p>No items currently on the shopping list or data is still loading.</p>
                )}
                {Object.entries(
                  Object.keys(shoppingList).reduce(
                    (acc, key) => {
                      // key here is the ingredient name
                      const item = shoppingList[key]
                      if (item.toOrder <= 0) return acc // Only show items that need to be ordered

                      // Simplified category grouping
                      const category =
                        key.toLowerCase().includes("flour") ||
                        key.toLowerCase().includes("sugar") ||
                        key.toLowerCase().includes("rice")
                          ? "Dry Goods"
                          : key.toLowerCase().includes("milk") ||
                              key.toLowerCase().includes("cheese") ||
                              key.toLowerCase().includes("butter")
                            ? "Dairy"
                            : key.toLowerCase().includes("pepper") || key.toLowerCase().includes("salt")
                              ? "Spices"
                              : key.toLowerCase().includes("oil")
                                ? "Oils"
                                : "Produce & Other"

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
                    <h3 className="font-medium text-lg mb-2">{category}</h3>
                    <ul className="space-y-2">
                      {Object.entries(items).map(([name, item]) => (
                        <li key={name} className="flex justify-between items-center p-2 border-b last:border-b-0">
                          <span className="capitalize">{name}</span>
                          <div className="text-right">
                            <span className="font-medium block">
                              {item.toOrder} {item.unit} to order
                            </span>
                            <span className="text-xs text-gray-500">
                              {" "}
                              (Needs: {item.required}, Stock: {item.inStock})
                            </span>
                          </div>
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
              <CardDescription>
                Items that need to be restocked soon (based on client-side shopping list calculation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-left py-2 px-3">Current Stock</th>
                      <th className="text-left py-2 px-3">Required (Est.)</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(shoppingList)
                      .filter(([_, item]) => item.inStock < item.required || item.toOrder > 0) // Show if stock is less than required or needs ordering
                      .map(([name, item]) => (
                        <tr key={name} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-2 px-3 capitalize">{name}</td>
                          <td className="py-2 px-3">
                            {item.inStock} {item.unit}
                          </td>
                          <td className="py-2 px-3">
                            {item.required} {item.unit}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.inStock <= item.required * 0.25 // Very Low
                                  ? "bg-red-100 text-red-800"
                                  : item.inStock <= item.required * 0.75 // Low
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800" // Sufficient (but still on list if toOrder > 0)
                              }`}
                            >
                              {item.inStock <= item.required * 0.25
                                ? "Very Low"
                                : item.inStock <= item.required * 0.75
                                  ? "Low"
                                  : "Needs Order"}
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
