"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addInventoryItem, type InventoryItem } from "@/lib/firestore"

const categories = ["Dry Goods", "Dairy", "Spices", "Oils", "Baking", "Produce", "Meat", "Frozen"]

export default function NewInventoryItemPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [itemData, setItemData] = useState<Omit<InventoryItem, "id">>({
    name: "",
    category: "",
    currentStock: 0,
    unit: "",
    minLevel: 0,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setItemData((prev) => ({
      ...prev,
      [name]: name === "currentStock" || name === "minLevel" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setItemData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!itemData.name || !itemData.category || !itemData.unit) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await addInventoryItem(itemData)
      toast({
        title: "Success",
        description: "Inventory item added successfully.",
      })
      router.push("/inventory")
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to add inventory item.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Inventory Item</CardTitle>
          <CardDescription>Enter the details for the new storeroom item.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" name="name" value={itemData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" onValueChange={handleCategoryChange} value={itemData.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                name="currentStock"
                type="number"
                step="0.1"
                value={itemData.currentStock}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit (e.g., kg, L, pcs)</Label>
              <Input id="unit" name="unit" value={itemData.unit} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="minLevel">Minimum Stock Level</Label>
              <Input
                id="minLevel"
                name="minLevel"
                type="number"
                step="0.1"
                value={itemData.minLevel}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
