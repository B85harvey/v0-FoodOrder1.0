"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { getRecipe, deleteRecipe, type Recipe } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await getRecipe(params.id)
        setRecipe(recipeData)
      } catch (error) {
        console.error("Error fetching recipe:", error)
        toast({
          title: "Error",
          description: "Failed to load recipe details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!recipe?.id) return

    const confirmed = window.confirm("Are you sure you want to delete this recipe?")
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      toast({
        title: "Recipe Deleted",
        description: "The recipe has been deleted successfully",
      })
      router.push("/recipes")
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Recipe Not Found</h1>
        <p>The recipe you are looking for does not exist or has been deleted.</p>
        <Link href="/recipes">
          <Button className="mt-4">Back to Recipes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{recipe.name}</h1>
        <div className="flex gap-4">
          <Link href="/recipes">
            <Button variant="outline">Back to Recipes</Button>
          </Link>
          <Link href={`/recipes/${recipe.id}/edit`}>
            <Button>Edit Recipe</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Recipe Details</CardTitle>
                <Badge variant={recipe.isActive ? "default" : "outline"}>
                  {recipe.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 mb-6 rounded-md overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=400&width=800&text=${encodeURIComponent(recipe.name)}`}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm text-gray-500">Difficulty</h3>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm text-gray-500">Prep Time</h3>
                  <p className="font-medium">{recipe.prepTime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm text-gray-500">Cook Time</h3>
                  <p className="font-medium">{recipe.cookTime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm text-gray-500">Ingredients</h3>
                  <p className="font-medium">{recipe.ingredients.length}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {ingredient.name}
                        {ingredient.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <span className="text-gray-600">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  <span className="text-red-500">*</span> Required ingredients
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Recipe"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>How often this recipe is used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Orders:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Most Popular In:</span>
                  <span className="font-medium">Class 10A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Used:</span>
                  <span className="font-medium">May 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
