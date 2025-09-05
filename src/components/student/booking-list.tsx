"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, RefreshCw } from "lucide-react"
import { ReviewDialog } from "./review-dialog"
import { EnhancedBookingCard } from "./enhanced-booking-card"
import { 
  formatDateTimeForDisplay, 
  formatDateForDisplay, 
  isUpcoming 
} from "@/lib/time-utils"

interface BookingListProps {
  studentData: any
  onUpdate: () => void
}

export function BookingList({ studentData, onUpdate }: BookingListProps) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/student/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else if (response.status === 404) {
        const errorData = await response.json()
        if (errorData.requiresProfile) {
          setError("Please complete your student profile first to view bookings")
        } else {
          setError("Failed to fetch bookings")
        }
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/student/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      })

      if (response.ok) {
        fetchBookings()
        onUpdate()
      } else {
        setError("Failed to cancel booking")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/student/bookings/${selectedBooking.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      if (response.ok) {
        setReviewDialogOpen(false)
        setSelectedBooking(null)
        fetchBookings()
        onUpdate()
      } else {
        setError("Failed to submit review")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const upcomingBookings = bookings.filter(booking => isUpcoming(booking.startTime))
  const pastBookings = bookings.filter(booking => !isUpcoming(booking.startTime))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Your scheduled and past classes</CardDescription>
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
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>Your scheduled English classes</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {upcomingBookings.length} Upcoming
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No upcoming classes</p>
              <p className="text-gray-400">Book your first class to get started!</p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/teachers'}
              >
                Browse Teachers
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <EnhancedBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onReview={handleSubmitReview}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Class History</CardTitle>
              <CardDescription>Your completed classes</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {pastBookings.length} Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No completed classes yet</p>
              <p className="text-gray-400">Complete your first class to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <EnhancedBookingCard
                  key={booking.id}
                  booking={booking}
                  onReview={handleSubmitReview}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedBooking && (
        <ReviewDialog
          isOpen={reviewDialogOpen}
          onClose={() => {
            setReviewDialogOpen(false)
            setSelectedBooking(null)
          }}
          teacher={selectedBooking.teacher.user}
          bookingId={selectedBooking.id}
          completedAt={selectedBooking.startTime}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  )
}