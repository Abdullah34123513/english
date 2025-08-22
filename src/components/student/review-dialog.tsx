"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, CheckCircle2, Loader2, Calendar } from "lucide-react"

interface Teacher {
  id: string
  name: string
  email: string
  image?: string
}

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher
  bookingId: string
  completedAt: string
  onSubmit: (reviewData: { rating: number; comment: string }) => void
}

export function ReviewDialog({ 
  isOpen, 
  onClose, 
  teacher, 
  bookingId, 
  completedAt,
  onSubmit 
}: ReviewDialogProps) {
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(reviewForm)
      onClose()
      setReviewForm({ rating: 5, comment: "" })
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmitting(false)
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            Share your experience with {teacher.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Info */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <Avatar className="h-16 w-16 border-2 border-white shadow-md">
              <AvatarImage src={teacher.image} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {teacher.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {teacher.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Class completed on {new Date(completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

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
              onClick={onClose}
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
  )
}