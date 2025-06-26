import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ClassesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <div className="flex space-x-2">
          <Link href="/classes/new">
            <Button>Add New Class</Button>
          </Link>
          <Link href="/dashboard/teacher">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
      {/* Add class list or other content here */}
      <div>
        <p>This is where the class list will go.</p>
      </div>
    </div>
  )
}
