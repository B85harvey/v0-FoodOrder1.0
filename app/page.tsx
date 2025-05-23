import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Food Tech Inventory Manager</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Streamline Your Food Tech Class Inventory</h2>
            <p className="text-xl text-gray-600 mb-8">
              Manage recipe orders, track inventory, and generate shopping lists automatically
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">For Teachers</h3>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>View all student recipe orders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Manage storeroom inventory</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Generate shopping lists automatically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Organize by class and date</span>
                  </li>
                </ul>
                <Link href="/dashboard/teacher">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Teacher Login</Button>
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">For Students</h3>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Browse available recipes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Select ingredients needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Submit recipe orders easily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>View order history</span>
                  </li>
                </ul>
                <Link href="/dashboard/student">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Student Login</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-600 text-xl font-bold">1</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Students Order</h3>
                <p className="text-gray-600">
                  Students browse recipes and submit their ingredient orders for upcoming classes
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-600 text-xl font-bold">2</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">System Calculates</h3>
                <p className="text-gray-600">The system compares orders with current storeroom inventory levels</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-600 text-xl font-bold">3</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Shopping List Generated</h3>
                <p className="text-gray-600">
                  A complete shopping list is automatically created showing exactly what needs to be ordered
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Food Tech Inventory Manager</p>
        </div>
      </footer>
    </div>
  )
}
