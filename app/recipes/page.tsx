"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { getRecipes, type Recipe } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

export default function RecipesPage() {
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesData = await getRecipes()
        setRecipes(recipesData)
      } catch (error) {
        console.error("Error fetching recipes:", error)
        toast({
          title: "Error",
          description: "Failed to load recipes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [toast])

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
        <h1 className="text-3xl font-bold">Recipe Management</h1>
        <Link href="/recipes/new">
          <Button>Add New Recipe</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className={recipe.isActive ? "" : "opacity-60"}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{recipe.name}</CardTitle>
                <Badge variant={recipe.isActive ? "default" : "outline"}>
                  {recipe.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(recipe.name)}`}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <span className="text-sm text-gray-500">Difficulty</span>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Prep Time</span>
                  <p className="font-medium">{recipe.prepTime}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Cook Time</span>
                  <p className="font-medium">{recipe.cookTime}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Ingredients</span>
                  <p className="font-medium">{recipe.ingredients.length}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/recipes/${recipe.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Button>Edit Recipe</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
