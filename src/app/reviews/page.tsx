"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  Heart,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  booking: {
    id: string
    teacher: {
      id: string
      name: string
      email: string
      image?: string
    }
  }
}

interface PendingReview {
  bookingId: string
  teacher: {
    id: string
    name: string
    email: string
    image?: string
  }
  completedAt: string
}

export default function ReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<PendingReview | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchReviewsData()
    }
  }, [status, router])

  const fetchReviewsData = async () => {
    try {
      const response = await fetch("/api/student/bookings")
      if (response.ok) {
        const bookings = await response.json()
        
        // Get completed reviews
        const reviewsData = bookings
          .filter((booking: any) => booking.review)
          .map((booking: any) => ({
            id: booking.review.id,
            rating: booking.review.rating,
            comment: booking.review.comment,
            createdAt: booking.review.createdAt,
            booking: {
              id: booking.id,
              teacher: booking.teacher
            }
          }))
        
        // Get pending reviews (completed bookings without reviews)
        const pendingData = bookings
          .filter((booking: any) => 
            booking.status === "COMPLETED" && 
            !booking.review &&
            new Date(booking.endTime) < new Date()
          )
          .map((booking: any) => ({
            bookingId: booking.id,
            teacher: booking.teacher,
            completedAt: booking.endTime
          }))
        
        setReviews(reviewsData)
        setPendingReviews(pendingData)
      }
    } catch (error) {
      console.error("Failed to fetch reviews data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedBooking) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/student/bookings/${selectedBooking.bookingId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      })

      if (response.ok) {
        setReviewDialogOpen(false)
        setSubmitSuccess(true)
        setReviewForm({ rating: 5, comment: "" })
        setSelectedBooking(null)
        
        // Refresh data after a short delay
        setTimeout(() => {
          fetchReviewsData()
          setSubmitSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openReviewDialog = (booking: PendingReview) => {
    setSelectedBooking(booking)
    setReviewForm({ rating: 5, comment: "" })
    setReviewDialogOpen(true)
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            disabled={!interactive}
            className={`transition-all duration-200 ${
              interactive ? "hover:scale-110 focus:outline-none" : ""
            }`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating 
                  ? "text-yellow-400 fill-current" 
                  : "text-gray-300"
              } ${interactive ? "cursor-pointer" : ""}`}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingStats = () => {
    if (reviews.length === 0) return { average: 0, distribution: [0, 0, 0, 0, 0] }
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    const average = total / reviews.length
    
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(review => {
      distribution[review.rating - 1]++
    })
    
    return { average, distribution }
  }

  const getRatingEmoji = (rating: number) => {
    if (rating >= 4.5) return { emoji: "😍", label: "Excellent", color: "text-green-600" }
    if (rating >= 4) return { emoji: "😊", label: "Very Good", color: "text-blue-600" }
    if (rating >= 3) return { emoji: "🙂", label: "Good", color: "text-yellow-600" }
    if (rating >= 2) return { emoji: "😐", label: "Fair", color: "text-orange-600" }
    return { emoji: "😞", label: "Poor", color: "text-red-600" }
  }

  const stats = getRatingStats()

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Reviews
                </h1>
                <p className="text-sm text-gray-500">Share your learning experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {reviews.length} Reviews
              </Badge>
              <Button asChild variant="outline">
                <Link href="/dashboard/student">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Review submitted successfully! Thank you for sharing your feedback.
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Reviews Section */}
        {pendingReviews.length > 0 && (
          <Card className="mb-8 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  Pending Reviews
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {pendingReviews.length} to review
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Share your experience and help other students choose the right teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingReviews.map((booking) => (
                  <Card key={booking.bookingId} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12 border-2 border-white/20">
                          <AvatarImage src={booking.teacher.image} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {booking.teacher.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{booking.teacher.name}</h3>
                          <p className="text-sm text-blue-100">
                            {new Date(booking.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => openReviewDialog(booking)}
                        className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.average.toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="mt-2">
                  {renderStars(Math.round(stats.average))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {reviews.length}
                </div>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-green-50/50 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.distribution[4] + stats.distribution[3]}
                </div>
                <p className="text-sm text-gray-600">Positive Reviews</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-amber-50/50 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {Math.floor((new Date().getTime() - new Date(reviews[0]?.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-sm text-gray-600">Days Active</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <Card className="mb-8 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating - 1]
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  const ratingInfo = getRatingEmoji(rating)
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 w-20">
                        <span className="text-lg">{ratingInfo.emoji}</span>
                        <span className="text-sm font-medium">{rating} star</span>
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="flex items-center space-x-2 w-16 text-right">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Review History
              </span>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {reviews.length} reviews
              </Badge>
            </CardTitle>
            <CardDescription>
              Your feedback helps improve the learning experience for everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Complete your first class and share your experience to help other students!
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/teachers">Find Teachers</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const ratingInfo = getRatingEmoji(review.rating)
                  return (
                    <Card key={review.id} className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 border-2 border-gray-200">
                              <AvatarImage src={review.booking.teacher.image} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                {review.booking.teacher.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {review.booking.teacher.name}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              {renderStars(review.rating)}
                              <span className="text-lg font-semibold text-gray-700">
                                {review.rating}/5
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg">{ratingInfo.emoji}</span>
                              <span className={`text-sm font-medium ${ratingInfo.color}`}>
                                {ratingInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>Booking ID: {review.booking.id}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Link href={`/teachers/${review.booking.teacher.id}`}>
                              View Teacher Profile
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-blue-50 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Star className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Review Your Class
              </span>
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Share your experience with {selectedBooking?.teacher.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Teacher Info */}
            {selectedBooking && (
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  <AvatarImage src={selectedBooking.teacher.image} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {selectedBooking.teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedBooking.teacher.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Class completed on {new Date(selectedBooking.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate your overall experience?
                </label>
                <div className="flex justify-center">
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm(prev => ({ ...prev, rating }))
                  )}
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-semibold text-gray-700">
                    {reviewForm.rating}/5 stars
                  </span>
                </div>
              </div>

              {/* Quick Feedback Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What did you like most about the class?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { emoji: "🎯", label: "Clear Goals" },
                    { emoji: "🗣️", label: "Good Communication" },
                    { emoji: "📚", label: "Well Prepared" },
                    { emoji: "⏰", label: "Punctual" },
                    { emoji: "💡", label: "Engaging" },
                    { emoji: "👥", label: "Patient" },
                    { emoji: "📈", label: "Helpful Feedback" },
                    { emoji: "🌟", label: "Overall Great" }
                  ].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const currentComment = reviewForm.comment
                        const newComment = currentComment 
                          ? `${currentComment}, ${option.label}`
                          : option.label
                        setReviewForm(prev => ({ ...prev, comment: newComment }))
                      }}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center"
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-xs text-gray-600">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tell us more about your experience (Optional)
                </label>
                <Textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share what you enjoyed, what could be improved, or any other feedback that might help other students..."
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setReviewDialogOpen(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}