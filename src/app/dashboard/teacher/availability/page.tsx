"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface TimeSlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", 
  "Friday", "Saturday", "Sunday"
]

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
]

export default function TeacherAvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [availability, setAvailability] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "TEACHER") {
      router.push("/dashboard/student")
      return
    }

    if (status === "authenticated") {
      fetchAvailability()
    }
  }, [status, router, session])

  const fetchAvailability = async () => {
    try {
      console.log('Fetching availability...')
      const response = await fetch("/api/teacher/availability")
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched data:', data)
        if (Array.isArray(data) && data.length > 0) {
          setAvailability(data)
        } else {
          console.log('No availability data, initializing default')
          // Initialize default availability if none exists
          initializeDefaultAvailability()
        }
      } else {
        console.log('Fetch failed, initializing default')
        // Initialize default availability if fetch fails
        initializeDefaultAvailability()
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error)
      console.log('Error occurred, initializing default')
      initializeDefaultAvailability()
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultAvailability = () => {
    const defaultAvailability: TimeSlot[] = []
    daysOfWeek.forEach(day => {
      timeSlots.forEach(time => {
        defaultAvailability.push({
          id: `${day}-${time}`,
          dayOfWeek: day,
          startTime: time,
          endTime: `${parseInt(time) + 1}:00`,
          isAvailable: false
        })
      })
    })
    setAvailability(defaultAvailability)
  }

  const toggleAvailability = (slotId: string) => {
    console.log('Toggling slot:', slotId)
    console.log('Current availability:', availability)
    
    setAvailability(prev => {
      const slotExists = prev.some(slot => slot.id === slotId)
      
      if (!slotExists) {
        // If slot doesn't exist, create it
        const [dayOfWeek, startTime] = slotId.split('-')
        const endTime = `${parseInt(startTime) + 1}:00`
        const newSlot: TimeSlot = {
          id: slotId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable: true
        }
        console.log('Creating new slot:', newSlot)
        return [...prev, newSlot]
      }
      
      // Toggle existing slot
      const updated = prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
      console.log('Updated availability:', updated)
      return updated
    })
  }

  const saveAvailability = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/teacher/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability }),
      })

      if (response.ok) {
        // Show success message
        alert("Availability saved successfully!")
        router.push("/dashboard/teacher")
      } else {
        const errorData = await response.json()
        alert(`Failed to save availability: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to save availability:", error)
      alert("Failed to save availability. Please check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const getAvailabilityByDay = (day: string) => {
    return availability.filter(slot => slot.dayOfWeek === day)
  }

  const getAvailableSlotsCount = () => {
    return availability.filter(slot => slot.isAvailable).length
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/teacher/settings">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Settings
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
              <Badge variant="secondary">
                {getAvailableSlotsCount()} slots available
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={saveAvailability} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Weekly Availability</span>
              </CardTitle>
              <CardDescription>
                Click on time slots to toggle availability. Students will only be able to book lessons during your available times.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header row */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-semibold text-sm text-gray-600">Time</div>
                    {daysOfWeek.map(day => (
                      <div key={day} className="font-semibold text-sm text-gray-600 text-center">
                        {day.substring(0, 3)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Time slots grid */}
                  {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-8 gap-2 mb-2">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </div>
                      {daysOfWeek.map(day => {
                        const slot = availability.find(s => s.dayOfWeek === day && s.startTime === time)
                        const slotId = `${day}-${time}`
                        return (
                          <button
                            key={slotId}
                            onClick={() => toggleAvailability(slotId)}
                            className={`h-10 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                              slot?.isAvailable
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {slot?.isAvailable ? "Available" : "Unavailable"}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  console.log('Clear All clicked')
                  const updatedAvailability = availability.map(slot => ({
                    ...slot,
                    isAvailable: false
                  }))
                  console.log('Cleared availability:', updatedAvailability)
                  setAvailability(updatedAvailability)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  console.log('Set Business Hours clicked')
                  const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                  const workHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
                  const updatedAvailability = availability.map(slot => ({
                    ...slot,
                    isAvailable: workDays.includes(slot.dayOfWeek) && workHours.includes(slot.startTime)
                  }))
                  console.log('Business hours availability:', updatedAvailability)
                  setAvailability(updatedAvailability)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Business Hours
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Slots:</span>
                <span className="font-medium">{availability.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available:</span>
                <span className="font-medium text-green-600">{getAvailableSlotsCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unavailable:</span>
                <span className="font-medium text-gray-600">
                  {availability.length - getAvailableSlotsCount()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Set realistic availability times</li>
                <li>• Include breaks between sessions</li>
                <li>• Update availability weekly</li>
                <li>• Consider your timezone</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}