import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock class data
const classes = [
  {
    id: 1,
    name: "Class 10A",
    day: "Monday",
    time: "9:00 AM - 10:30 AM",
    students: 24,
    room: "Kitchen 1",
    teacher: "Ms. Johnson",
  },
  {
    id: 2,
    name: "Class 11B",
    day: "Tuesday",
    time: "11:00 AM - 12:30 PM",
    students: 22,
    room: "Kitchen 2",
    teacher: "Ms. Johnson",
  },
  {
    id: 3,
    name: "Class 9C",
    day: "Wednesday",
    time: "1:00 PM - 2:30 PM",
    students: 26,
    room: "Kitchen 1",
    teacher: "Mr. Davis",
  },
  {
    id: 4,
    name: "Class 12A",
    day: "Thursday",
    time: "9:00 AM - 10:30 AM",
    students: 20,
    room: "Kitchen 2",
    teacher: "Ms. Johnson",
  },
  {
    id: 5,
    name: "Class 10B",
    day: "Friday",
    time: "11:00 AM - 12:30 PM",
    students: 23,
    room: "Kitchen 1",
    teacher: "Mr. Davis",
  },
]

export default function ClassesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <Link href="/classes/new">
          <Button>Add New Class</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{cls.name}</CardTitle>
                <Badge>{cls.day}</Badge>
              </div>
              <CardDescription>{cls.time}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium">{cls.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Room:</span>
                  <span className="font-medium">{cls.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teacher:</span>
                  <span className="font-medium">{cls.teacher}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/dashboard/teacher/class/${cls.id}`}>
                <Button variant="outline">View Orders</Button>
              </Link>
              <Link href={`/classes/${cls.id}/edit`}>
                <Button>Edit Class</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
