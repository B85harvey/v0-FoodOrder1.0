"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  getRecipes,
  getUserProfile,
  addOrder,
  getOrdersByStudent,
  type Recipe,
  type User,
  type Order,
} from "@/lib/firestore"
import { Timestamp } from "firebase/firestore"

export default function OrderPage({ params }: { params: { date: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [profile, setProfile] = useState<User | null>(null)
  const [existingOrder, setExistingOrder] = useState<Order | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Parse the date from the URL
  const orderDate = new Date(params.date)
  const isValidDate = !isNaN(orderDate.getTime())

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isValidDate) return

      try {
        // Fetch user profile
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)

        // Fetch recipes
        const recipesData = await getRecipes()
        setRecipes(recipesData.filter((recipe) => recipe.isActive))

        // Check if an order already exists for this date
        const userOrders = await getOrdersByStudent(user.uid)
        const matchingOrder = userOrders.find((order) => {
          const orderDate = order.date.toDate()
          const paramDate = new Date(params.date)
          return (
            orderDate.getFullYear() === paramDate.getFullYear() &&
            orderDate.getMonth() === paramDate.getMonth() &&
            orderDate.getDate() === paramDate.getDate()
          )
        })

        if (matchingOrder) {
          setExistingOrder(matchingOrder)
          setSelectedRecipe(matchingOrder.recipeId)
          setSelectedIngredients(matchingOrder.ingredients.map((ing) => ing.id))
        }
      } catch (error) {
        console.error("Error fetching order data:", error)
        toast({
          title: "Error",
          description: "Failed to load order data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, params.date, toast, isValidDate])

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipe(recipeId)

    // Auto-select required ingredients
    const recipe = recipes.find((r) => r.id === recipeId)
    if (recipe) {
      const requiredIngredientIds = recipe.ingredients
        .filter((ing) => ing.required)
        .map((ing) => ing.id || "")
        .filter(Boolean)
      setSelectedIngredients(requiredIngredientIds)
    }
  }

  const handleIngredientToggle = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      // Check if it's a required ingredient
      const recipe = recipes.find((r) => r.id === selectedRecipe)
      const ingredient = recipe?.ingredients.find((ing) => ing.id === ingredientId)

      if (ingredient?.required) {
        // Don't allow deselecting required ingredients
        toast({
          title: "Required Ingredient",
          description: `${ingredient.name} is required for this recipe and cannot be removed.`,
          variant: "destructive",
        })
        return
      }

      setSelectedIngredients(selectedIngredients.filter((id) => id !== ingredientId))
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId])
    }
  }

  const handleSubmit = async () => {
    if (!user || !profile || !selectedRecipe) {
      toast({
        title: "Error",
        description: "Please select a recipe before submitting your order.",
        variant: "destructive",
      })
      return
    }

    try {
      const recipe = recipes.find((r) => r.id === selectedRecipe)
      if (!recipe) {
        throw new Error("Selected recipe not found")
      }

      // Get selected ingredients
      const selectedIngredientsData = recipe.ingredients
        .filter((ing) => selectedIngredients.includes(ing.id || ""))
        .map((ing) => ({
          id: ing.id || "",
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        }))

      // Create order object
      const orderData: Omit<Order, "id"> = {
        studentId: user.uid,
        studentName: profile.displayName || user.email || "Unknown Student",
        classId: profile.classId || "unassigned",
        className: "Class Name", // This would normally come from the class data
        date: Timestamp.fromDate(orderDate),
        recipeId: selectedRecipe,
        recipeName: recipe.name,
        ingredients: selectedIngredientsData,
        status: "pending",
      }

      // Submit order
      await addOrder(orderData)

      toast({
        title: "Order Submitted",
        description: "Your recipe order has been submitted successfully!",
      })

      // Redirect back to the dashboard
      setTimeout(() => {
        router.push("/dashboard/student")
      }, 1500)
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Error",
        description: "Failed to submit your order. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isValidDate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Invalid Date</h1>
        <p>The date provided is not valid.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/student")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Format the date for display
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Place Order for {formattedDate}</h1>
      <p className="text-gray-600 mb-8">Select your recipe and ingredients for the upcoming class</p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose Your Recipe</CardTitle>
            <CardDescription>Select one recipe to prepare for class</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedRecipe || ""}
              onValueChange={(value) => handleRecipeSelect(value)}
              disabled={!!existingOrder}
            >
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={recipe.id || ""} id={`recipe-${recipe.id}`} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={`recipe-${recipe.id}`} className="font-medium">
                        {recipe.name}
                      </Label>
                      <p className="text-sm text-gray-500">{recipe.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {selectedRecipe && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Confirm Ingredients</CardTitle>
              <CardDescription>Required ingredients are pre-selected and cannot be deselected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipes
                  .find((r) => r.id === selectedRecipe)
                  ?.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`ingredient-${ingredient.id}`}
                        checked={selectedIngredients.includes(ingredient.id || "")}
                        onCheckedChange={() => handleIngredientToggle(ingredient.id || "")}
                        disabled={!!existingOrder || ingredient.required}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`ingredient-${ingredient.id}`} className="font-medium">
                          {ingredient.name} ({ingredient.amount} {ingredient.unit})
                          {ingredient.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    </div>
                  ))}
                <p className="text-sm text-gray-500 mt-4">
                  <span className="text-red-500">*</span> Required ingredients
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {existingOrder ? (
                <div className="w-full text-center">
                  <p className="mb-4 text-amber-600">
                    You have already submitted an order for this class. Contact your teacher if you need to make
                    changes.
                  </p>
                  <Button variant="outline" onClick={() => router.push("/dashboard/student")}>
                    Return to Dashboard
                  </Button>
                </div>
              ) : (
                <Button onClick={handleSubmit}>Submit Order</Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
