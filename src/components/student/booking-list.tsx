"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, User, Video, Star, MessageCircle, X } from "lucide-react"

interface BookingListProps {
  studentData: any
  onUpdate: () => void
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  meetLink?: string
  teacher: {
    bio?: string
    hourlyRate: number
    user: {
      name: string
      email: string
      image?: string
    }
  }
  review?: {
    rating: number
    comment?: string
  }
}

export function BookingList({ studentData, onUpdate }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/student/bookings")
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

  const handleSubmitReview = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/student/bookings/${selectedBooking.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      })

      if (response.ok) {
        setReviewDialogOpen(false)
        setReviewForm({ rating: 5, comment: "" })
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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
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
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled English classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>No upcoming classes. Book your first class to get started!</p>
            </div>
          ) : (
            upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.teacher.user.image} />
                          <AvatarFallback>{booking.teacher.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{booking.teacher.user.name}</h3>
                          <p className="text-sm text-muted-foreground">${booking.teacher.hourlyRate}/hr</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
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
                      
                      {booking.status === "PENDING" || booking.status === "CONFIRMED" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Class History</CardTitle>
          <CardDescription>Your completed classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>No completed classes yet.</p>
            </div>
          ) : (
            pastBookings.map((booking) => (
              <Card key={booking.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.teacher.user.image} />
                          <AvatarFallback>{booking.teacher.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{booking.teacher.user.name}</h3>
                          <p className="text-sm text-muted-foreground">${booking.teacher.hourlyRate}/hr</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(booking.status)}
                        
                        {booking.review ? (
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            Rated {booking.review.rating}/5
                          </Badge>
                        ) : booking.status === "COMPLETED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setReviewDialogOpen(true)
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Leave Review
                          </Button>
                        ) : null}
                      </div>

                      {booking.review?.comment && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-muted-foreground">{booking.review.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedBooking && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${reviewDialogOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Review Your Class</h3>
            <p className="text-sm text-muted-foreground mb-4">
              How was your class with {selectedBooking.teacher.user.name}?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= reviewForm.rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                <textarea
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview}>
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}