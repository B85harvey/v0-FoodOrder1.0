"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getClass, updateClass, type Class } from "@/lib/firestore"

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const classId = params.id as string

  const [classData, setClassData] = useState<Partial<Class>>({
    name: "",
    day: "",
    time: "",
    students: 0,
    room: "",
    teacher: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (classId) {
      const fetchClass = async () => {
        try {
          const data = await getClass(classId)
          if (data) {
            setClassData(data)
          } else {
            toast({
              title: "Error",
              description: "Class not found.",
              variant: "destructive",
            })
            router.push("/classes")
          }
        } catch (error) {
          console.error("Error fetching class:", error)
          toast({
            title: "Error",
            description: "Failed to load class data.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchClass()
    }
  }, [classId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClassData((prev) => ({
      ...prev,
      [name]: name === "students" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!classId) return

    setSaving(true)
    try {
      await updateClass(classId, classData)
      toast({
        title: "Success",
        description: "Class updated successfully.",
      })
      router.push("/classes")
    } catch (error) {
      console.error("Error updating class:", error)
      toast({
        title: "Error",
        description: "Failed to update class.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Class: {classData.name}</CardTitle>
          <CardDescription>Update the details for this class.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input id="name" name="name" value={classData.name || ""} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="day">Day</Label>
              <Input id="day" name="day" value={classData.day || ""} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" value={classData.time || ""} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="students">Number of Students</Label>
              <Input
                id="students"
                name="students"
                type="number"
                value={classData.students || 0}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="room">Room</Label>
              <Input id="room" name="room" value={classData.room || ""} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Input id="teacher" name="teacher" value={classData.teacher || ""} onChange={handleChange} required />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/classes")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
