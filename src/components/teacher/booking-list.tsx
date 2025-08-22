"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, Video, CheckCircle, XCircle } from "lucide-react"

interface BookingListProps {
  teacherData: any
  onUpdate: () => void
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  student: {
    user: {
      name: string
      email: string
    }
  }
  meetLink?: string
}

export function BookingList({ teacherData, onUpdate }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/teacher/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/teacher/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchBookings()
        onUpdate()
      } else {
        setError("Failed to update booking status")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const generateMeetLink = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/teacher/bookings/${bookingId}/meet-link`, {
        method: "POST",
      })

      if (response.ok) {
        fetchBookings()
      } else {
        setError("Failed to generate Meet link")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "CONFIRMED":
        return <Badge variant="default">Confirmed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "COMPLETED":
        return <Badge variant="outline">Completed</Badge>
      case "NO_SHOW":
        return <Badge variant="destructive">No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Your teaching schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>
          Manage your teaching schedule and student bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>No bookings yet. Students will appear here once they book classes with you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{booking.student.user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({booking.student.user.email})
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        {getStatusBadge(booking.status)}
                        {booking.meetLink && (
                          <Badge variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Meet Link Ready
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {booking.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}

                      {booking.status === "CONFIRMED" && !booking.meetLink && (
                        <Button
                          size="sm"
                          onClick={() => generateMeetLink(booking.id)}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Generate Meet Link
                        </Button>
                      )}

                      {booking.meetLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(booking.meetLink, "_blank")}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join Class
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}