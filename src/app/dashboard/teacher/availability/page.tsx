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
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { formatTimeForDisplay } from "@/lib/time-utils"

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
        if (Array.isArray(data)) {
          setAvailability(data)
        } else {
          console.error('Invalid data format received from API')
          // Initialize with empty array if invalid data
          setAvailability([])
        }
      } else {
        console.error('Fetch failed with status:', response.status)
        setAvailability([])
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error)
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }

  const setAvailabilityPattern = (pattern: (day: string, time: string) => boolean) => {
    console.log('Setting availability pattern...')
    const updatedAvailability = availability.map(slot => ({
      ...slot,
      isAvailable: pattern(slot.dayOfWeek, slot.startTime)
    }))
    console.log('Updated availability:', updatedAvailability)
    setAvailability(updatedAvailability)
  }

  const toggleTimeSlot = (slotId: string) => {
    console.log('Toggling slot:', slotId)
    setAvailability(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    )
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

  const getAvailableSlotsCount = () => {
    return availability.filter(slot => slot.isAvailable).length
  }

  const getAvailableSlotsByDay = (day: string) => {
    return availability.filter(slot => slot.dayOfWeek === day && slot.isAvailable)
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
                <Link href="/dashboard/teacher">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Set Availability</h1>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-red-600" />
                Clear All
              </CardTitle>
              <CardDescription>
                Remove all availability slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setAvailabilityPattern(() => false)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Slots
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Set standard work hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                  const workHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
                  setAvailabilityPattern((day, time) => 
                    workDays.includes(day) && workHours.includes(time)
                  )
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Business Hours
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Full Week
              </CardTitle>
              <CardDescription>
                Available all week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const workHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
                  setAvailabilityPattern((day, time) => workHours.includes(time))
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Set Full Week
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="h-5 w-5 mr-2 text-purple-600" />
                Extended Hours
              </CardTitle>
              <CardDescription>
                Include evenings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const workDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                  const extendedHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
                  setAvailabilityPattern((day, time) => 
                    workDays.includes(day) && extendedHours.includes(time)
                  )
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Extended Hours
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Availability Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Current Availability Summary
              <Badge variant="outline" className="ml-2 text-xs">
                Click to edit
              </Badge>
            </CardTitle>
            <CardDescription>
              Click on any time slot to toggle availability. Green = Available, Gray = Unavailable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {daysOfWeek.map(day => {
                const daySlots = getAvailableSlotsByDay(day)
                const allDaySlots = availability.filter(slot => slot.dayOfWeek === day)
                
                return (
                  <div key={day} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      {day}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {daySlots.length}/{allDaySlots.length}
                      </Badge>
                    </h4>
                    <div className="space-y-1">
                      {allDaySlots.length > 0 ? (
                        allDaySlots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => toggleTimeSlot(slot.id)}
                            className={`w-full flex items-center text-sm p-2 rounded-md transition-colors cursor-pointer hover:opacity-80 ${
                              slot.isAvailable
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {slot.isAvailable ? (
                              <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium">
                              {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="flex items-center text-sm text-gray-500 p-2">
                          <XCircle className="h-3 w-3 mr-1" />
                          No availability set
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
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
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage:</span>
                <span className="font-medium text-blue-600">
                  {Math.round((getAvailableSlotsCount() / availability.length) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use quick actions for common patterns</li>
                <li>• Set realistic availability times</li>
                <li>• Include breaks between sessions</li>
                <li>• Update availability weekly</li>
                <li>• Consider your timezone</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const weekendDays = ["Saturday", "Sunday"]
                  const weekendHours = ["10:00", "11:00", "14:00", "15:00"]
                  setAvailabilityPattern((day, time) => 
                    weekendDays.includes(day) && weekendHours.includes(time)
                  )
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Weekend Hours
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const morningHours = ["08:00", "09:00"]
                  setAvailabilityPattern((day, time) => 
                    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day) && 
                    morningHours.includes(time)
                  )
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Morning Hours
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}