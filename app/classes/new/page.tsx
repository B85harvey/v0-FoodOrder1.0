"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addClass, type Class } from "@/lib/firestore"
import Link from "next/link"

export default function NewClassPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [classData, setClassData] = useState<Omit<Class, "id">>({
    name: "",
    day: "",
    time: "",
    students: 0,
    room: "",
    teacher: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClassData((prev) => ({
      ...prev,
      [name]: name === "students" ? Number.parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classData.name || !classData.day || !classData.time || !classData.room || !classData.teacher) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await addClass(classData)
      toast({
        title: "Success",
        description: "Class created successfully.",
      })
      router.push("/classes")
    } catch (error) {
      console.error("Error creating class:", error)
      toast({
        title: "Error",
        description: "Failed to create class.",
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
          <CardTitle>Create New Class</CardTitle>
          <CardDescription>Enter the details for the new class.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" name="name" value={classData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher Name</Label>
                <Input id="teacher" name="teacher" value={classData.teacher} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Input id="day" name="day" value={classData.day} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" value={classData.time} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input id="room" name="room" value={classData.room} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="students">Number of Students</Label>
                <Input
                  id="students"
                  name="students"
                  type="number"
                  value={classData.students}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/classes">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
