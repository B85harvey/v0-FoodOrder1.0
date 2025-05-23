"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getInventoryItems, updateInventoryItem, type InventoryItem } from "@/lib/firestore"

// Categories for filtering
const categories = ["All", "Dry Goods", "Dairy", "Spices", "Oils", "Baking"]

export default function InventoryPage() {
  const { toast } = useToast()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    currentStock: 0,
    minLevel: 0,
  })

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const items = await getInventoryItems()
        setInventory(items)
      } catch (error) {
        console.error("Error fetching inventory:", error)
        toast({
          title: "Error",
          description: "Failed to load inventory items",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [toast])

  // Filter inventory based on category and search term
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleEdit = (item: InventoryItem) => {
    if (!item.id) return

    setEditingItem(item.id)
    setEditValues({
      currentStock: item.currentStock,
      minLevel: item.minLevel,
    })
  }

  const handleSave = async (id: string) => {
    try {
      await updateInventoryItem(id, {
        currentStock: editValues.currentStock,
        minLevel: editValues.minLevel,
      })

      // Update local state
      setInventory(
        inventory.map((item) =>
          item.id === id ? { ...item, currentStock: editValues.currentStock, minLevel: editValues.minLevel } : item,
        ),
      )

      setEditingItem(null)

      toast({
        title: "Inventory Updated",
        description: "The inventory item has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating inventory:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minLevel * 0.5) return "low"
    if (item.currentStock <= item.minLevel) return "medium"
    return "good"
  }

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
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button>Add New Item</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64">
          <Label htmlFor="search">Search Inventory</Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="w-full md:w-64">
          <Label>Filter by Category</Label>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mt-1">
            <TabsList className="w-full">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="flex-1">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>Manage your storeroom inventory levels and minimum stock thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Current Stock</th>
                  <th className="text-left py-3 px-4">Min Level</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      {editingItem === item.id ? (
                        <Input
                          type="number"
                          value={editValues.currentStock}
                          onChange={(e) =>
                            setEditValues({ ...editValues, currentStock: Number.parseFloat(e.target.value) })
                          }
                          className="w-24"
                          step="0.1"
                        />
                      ) : (
                        `${item.currentStock} ${item.unit}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingItem === item.id ? (
                        <Input
                          type="number"
                          value={editValues.minLevel}
                          onChange={(e) =>
                            setEditValues({ ...editValues, minLevel: Number.parseFloat(e.target.value) })
                          }
                          className="w-24"
                          step="0.1"
                        />
                      ) : (
                        `${item.minLevel} ${item.unit}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`
                        ${getStockStatus(item) === "low" ? "bg-red-100 text-red-800" : ""}
                        ${getStockStatus(item) === "medium" ? "bg-amber-100 text-amber-800" : ""}
                        ${getStockStatus(item) === "good" ? "bg-green-100 text-green-800" : ""}
                      `}
                      >
                        {getStockStatus(item) === "low" ? "Low" : ""}
                        {getStockStatus(item) === "medium" ? "Medium" : ""}
                        {getStockStatus(item) === "good" ? "Good" : ""}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {editingItem === item.id ? (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => item.id && handleSave(item.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
