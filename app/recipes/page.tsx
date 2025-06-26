import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RecipesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <div className="flex space-x-2">
          <Link href="/recipes/new">
            <Button>Create New Recipe</Button>
          </Link>
          <Link href="/dashboard/teacher">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
      {/* Rest of the page content goes here */}
      <p>This is the recipes page.</p>
    </div>
  )
}
