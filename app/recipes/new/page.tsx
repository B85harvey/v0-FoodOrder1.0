"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { addRecipe, type Recipe, type Ingredient } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"

export default function NewRecipePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("Easy")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [ingredients, setIngredients] = useState<Omit<Ingredient, "id">[]>([
    {
      name: "",
      amount: "",
      unit: "g",
      required: true,
    },
  ])

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: "",
        amount: "",
        unit: "g",
        required: true,
      },
    ])
  }

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      })
      return
    }
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index: number, field: keyof Omit<Ingredient, "id">, value: string | boolean) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    }
    setIngredients(updatedIngredients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Recipe name is required",
        variant: "destructive",
      })
      return
    }

    // Validate ingredients
    for (const ingredient of ingredients) {
      if (!ingredient.name.trim() || !ingredient.amount.trim()) {
        toast({
          title: "Error",
          description: "All ingredients must have a name and amount",
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)
    try {
      const newRecipe: Omit<Recipe, "id"> = {
        name,
        description,
        difficulty,
        prepTime,
        cookTime,
        isActive,
        ingredients,
      }

      const recipeId = await addRecipe(newRecipe)
      toast({
        title: "Recipe Created",
        description: "The recipe has been created successfully",
      })
      router.push("/recipes")
    } catch (error) {
      console.error("Error creating recipe:", error)
      toast({
        title: "Error",
        description: "Failed to create recipe",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Recipe</h1>
        <div className="flex space-x-2">
          <Link href="/recipes">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Link href="/dashboard/teacher">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter recipe name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the recipe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time</Label>
                  <Input
                    id="prepTime"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g. 15 min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time</Label>
                  <Input
                    id="cookTime"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="e.g. 30 min"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Active Recipe</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>Add the ingredients required for this recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`ingredient-name-${index}`}>Name</Label>
                      <Input
                        id={`ingredient-name-${index}`}
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                        placeholder="Ingredient name"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
                      <Input
                        id={`ingredient-amount-${index}`}
                        value={ingredient.amount}
                        onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                        placeholder="Amount"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label htmlFor={`ingredient-unit-${index}`}>Unit</Label>
                      <Select
                        value={ingredient.unit}
                        onValueChange={(value) => handleIngredientChange(index, "unit", value)}
                      >
                        <SelectTrigger id={`ingredient-unit-${index}`}>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="tsp">tsp</SelectItem>
                          <SelectItem value="tbsp">tbsp</SelectItem>
                          <SelectItem value="cup">cup</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id={`ingredient-required-${index}`}
                        checked={ingredient.required}
                        onCheckedChange={(checked) => handleIngredientChange(index, "required", checked === true)}
                      />
                      <Label htmlFor={`ingredient-required-${index}`}>Required</Label>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddIngredient} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Recipe"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
