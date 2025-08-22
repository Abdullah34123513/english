"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Clock } from "lucide-react"

interface AvailabilityManagerProps {
  teacherData: any
  onUpdate: () => void
}

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
]

export function AvailabilityManager({ teacherData, onUpdate }: AvailabilityManagerProps) {
  const [availabilities, setAvailabilities] = useState(teacherData?.availability || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  })

  const handleAddAvailability = async () => {
    if (!newAvailability.dayOfWeek || !newAvailability.startTime || !newAvailability.endTime) {
      setError("Please fill in all fields")
      return
    }

    const startTime = new Date(`2000-01-01 ${newAvailability.startTime}`)
    const endTime = new Date(`2000-01-01 ${newAvailability.endTime}`)

    if (startTime >= endTime) {
      setError("End time must be after start time")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          availabilities: [...availabilities, {
            id: Date.now().toString(),
            dayOfWeek: parseInt(newAvailability.dayOfWeek),
            startTime: newAvailability.startTime,
            endTime: newAvailability.endTime,
            isAvailable: true,
          }]
        }),
      })

      if (response.ok) {
        setSuccess("Time slot added successfully!")
        setNewAvailability({ dayOfWeek: "", startTime: "", endTime: "" })
        setIsAdding(false)
        onUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add time slot")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      const response = await fetch(`/api/teacher/availability/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Time slot removed successfully")
        onUpdate()
      } else {
        setError("Failed to remove time slot")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Set your weekly availability for classes
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isAdding && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={newAvailability.dayOfWeek}
                    onValueChange={(value) => setNewAvailability(prev => ({ ...prev, dayOfWeek: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAvailability} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Availability</h3>
          
          {availabilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <p>No availability set. Add your available time slots above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilities
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((availability) => (
                <Card key={availability.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {daysOfWeek[availability.dayOfWeek]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAvailability(availability.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {availability.startTime} - {availability.endTime}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}