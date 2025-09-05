"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Star, 
  MessageCircle, 
  X, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock as PendingIcon,
  DollarSign,
  CreditCard
} from "lucide-react"
import { ReviewDialog } from "./review-dialog"
import { 
  formatDateTimeForDisplay, 
  formatDateForDisplay, 
  isUpcoming,
  isWithinOneHour
} from "@/lib/time-utils"

interface EnhancedBookingCardProps {
  booking: {
    id: string
    startTime: string
    endTime: string
    status: string
    paymentStatus: string
    meetLink?: string
    notes?: string
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
    payments?: Array<{
      id: string
      amount: number
      status: string
      receiptImage?: string
    }>
  }
  onCancel?: (bookingId: string) => void
  onReview?: (bookingId: string, rating: number, comment: string) => void
  showActions?: boolean
}

export function EnhancedBookingCard({ 
  booking, 
  onCancel, 
  onReview, 
  showActions = true 
}: EnhancedBookingCardProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const isUpcomingClass = isUpcoming(booking.startTime)
  const isClassSoon = isWithinOneHour(booking.startTime)
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"
  const isConfirmed = booking.status === "CONFIRMED"
  const isPending = booking.status === "PENDING"
  const hasPayment = booking.payments && booking.payments.length > 0
  const isPaymentApproved = hasPayment && booking.payments?.some(p => p.status === "APPROVED")
  const isPaymentPending = hasPayment && booking.payments?.some(p => p.status === "PENDING")
  const isPaymentRejected = hasPayment && booking.payments?.some(p => p.status === "REJECTED")

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <X className="h-3 w-3" />
          <span>Cancelled</span>
        </Badge>
      )
    }
    if (isCompleted) {
      return (
        <Badge variant="outline" className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Completed</span>
        </Badge>
      )
    }
    if (isConfirmed) {
      return (
        <Badge variant="default" className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Confirmed</span>
        </Badge>
      )
    }
    if (isPending) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <PendingIcon className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        {booking.status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = () => {
    if (!hasPayment) {
      return (
        <Badge variant="outline" className="flex items-center space-x-1">
          <DollarSign className="h-3 w-3" />
          <span>No Payment</span>
        </Badge>
      )
    }
    if (isPaymentApproved) {
      return (
        <Badge variant="default" className="flex items-center space-x-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>Paid</span>
        </Badge>
      )
    }
    if (isPaymentRejected) {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <X className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      )
    }
    if (isPaymentPending) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Pending Approval</span>
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        {booking.paymentStatus}
      </Badge>
    )
  }

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    if (onReview) {
      await onReview(booking.id, reviewData.rating, reviewData.comment)
    }
    setReviewDialogOpen(false)
    setSelectedBooking(null)
  }

  const handleReviewClick = () => {
    setSelectedBooking(booking)
    setReviewDialogOpen(true)
  }

  const getUrgencyIndicator = () => {
    if (!isUpcomingClass) return null
    if (isClassSoon) {
      return (
        <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium">
          <Clock className="h-3 w-3" />
          <span>Starting soon</span>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`border transition-all duration-200 hover:shadow-md ${
      isClassSoon ? 'border-orange-200 bg-orange-50/30' : ''
    } ${isCancelled ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-transparent hover:ring-blue-200 transition-all">
              <AvatarImage src={booking.teacher.user.image} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                {booking.teacher.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {booking.teacher.user.name}
              </h3>
              <p className="text-sm text-gray-600">
                ${booking.teacher.hourlyRate}/hour
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getUrgencyIndicator()}
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {getPaymentStatusBadge()}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDateForDisplay(booking.startTime)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {formatDateTimeForDisplay(booking.startTime)} - {formatDateTimeForDisplay(booking.endTime)}
              </span>
            </div>
          </div>

          {booking.meetLink && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Video className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Google Meet Link Ready</p>
                <p className="text-xs text-blue-600">Click to join your class</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(booking.meetLink, "_blank")}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Join
              </Button>
            </div>
          )}

          {booking.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          )}

          {hasPayment && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Payment: ${booking.payments![0].amount}
                </span>
              </div>
              {booking.payments![0].receiptImage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(booking.payments![0].receiptImage, "_blank")}
                >
                  View Receipt
                </Button>
              )}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {booking.review ? (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Rated {booking.review.rating}/5</span>
                </Badge>
              ) : isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReviewClick}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Leave Review
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {booking.meetLink && isUpcomingClass && (
                <Button
                  size="sm"
                  onClick={() => window.open(booking.meetLink, "_blank")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Join Class
                </Button>
              )}
              
              {onCancel && (isPending || isConfirmed) && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onCancel(booking.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {booking.review?.comment && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Your Review:</strong> {booking.review.comment}
            </p>
          </div>
        )}

        {isPaymentRejected && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">
                <strong>Payment Rejected:</strong> Please upload a new receipt or contact support.
              </p>
            </div>
          </div>
        )}
      </CardContent>

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
    </Card>
  )
}