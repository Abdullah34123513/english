"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingConfirmationPopup } from "./booking-confirmation-popup"
import { ValidationError, BookingError, handleUnknownError } from "@/lib/custom-error"
import { createLogger } from "@/lib/logger"
import { 
  Star, 
  Clock, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Users,
  Globe,
  Award,
  BookOpen,
  MessageCircle,
  Video,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Play
} from "lucide-react"

const logger = createLogger('EnhancedTeacherCard')

interface EnhancedTeacherCardProps {
  teacher: {
    id: string
    bio?: string
    hourlyRate: number
    experience?: string | number
    education?: string
    languages?: string
    isActive: boolean
    user: {
      name: string
      email: string
      image?: string
    }
    availability: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
    }>
    reviews: Array<{
      rating: number
      comment?: string
      student: {
        user: {
          name: string
        }
      }
    }>
  }
  studentId: string
  onBookClass: (teacherId: string, date: Date, timeSlot: string) => Promise<void>
  onSubmitPayment: (paymentInfo: any) => Promise<void>
}

export function EnhancedTeacherCard({ teacher, studentId, onBookClass, onSubmitPayment }: EnhancedTeacherCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<any>(null)

  // Cleanup effect to reset state when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any pending booking state when component unmounts
      if (pendingBooking) {
        logger.warn("Component unmounting with pending booking", { pendingBooking })
        setPendingBooking(null)
        setShowPaymentPopup(false)
      }
    }
  }, [pendingBooking, logger])

  const getAverageRating = () => {
    if (teacher.reviews.length === 0) return 0
    return teacher.reviews.reduce((sum, review) => sum + review.rating, 0) / teacher.reviews.length
  }

  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay()
    const dayAvailability = teacher.availability.filter(avail => avail.dayOfWeek === dayOfWeek)
    
    return dayAvailability.map(avail => ({
      startTime: avail.startTime,
      endTime: avail.endTime
    }))
  }

  const handleBookClass = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingError("Please select a date and time")
      return
    }

    setBookingLoading(true)
    setBookingError("")
    setBookingSuccess("")

    try {
      // Create pending booking data for payment
      const [startTime, endTime] = selectedTime.split(" - ")
      const bookingDateTime = new Date(selectedDate)
      const [hours, minutes] = startTime.split(":")
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes))

      const endDateTime = new Date(selectedDate)
      const [endHours, endMinutes] = endTime.split(":")
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))

      const duration = (endDateTime.getTime() - bookingDateTime.getTime()) / (1000 * 60) // duration in minutes

      const bookingData = {
        teacherId: teacher.id,
        teacherName: teacher.user.name,
        date: selectedDate,
        timeSlot: selectedTime,
        duration: duration,
        price: teacher.hourlyRate * (duration / 60), // calculate price based on duration
        studentId: studentId // Use the actual student ID from session
      }

      // Validate booking data before setting state
      if (!bookingData.teacherId || !bookingData.date || !bookingData.timeSlot) {
        throw new ValidationError("Invalid booking data", { bookingData })
      }

      // Ensure no existing pending booking
      if (pendingBooking) {
        throw new ValidationError("You already have a pending booking. Please complete it first.", { 
          existingBooking: pendingBooking,
          newBooking: bookingData 
        })
      }

      setPendingBooking(bookingData)
      setShowPaymentPopup(true)
      setBookingSuccess("Booking created! Please complete the payment.")
    } catch (error) {
      const safeError = handleUnknownError(error)
      setBookingError(safeError.message)
      logger.logValidationError("Failed to create booking", { error, bookingData })
    } finally {
      setBookingLoading(false)
    }
  }

  const handlePaymentConfirmation = async (paymentInfo: any) => {
    let bookingData: any = null
    
    try {
      console.log("Starting payment confirmation")
      console.log("Payment info received:", paymentInfo)
      console.log("Pending booking data:", pendingBooking)
      
      // Validate required data
      if (!pendingBooking) {
        throw new ValidationError("No booking data available - please try booking again", { 
          pendingBooking: pendingBooking, 
          paymentInfo: paymentInfo 
        })
      }
      
      if (!paymentInfo) {
        throw new ValidationError("No payment information provided", { pendingBooking, paymentInfo })
      }
      
      // Create a local copy of pendingBooking to prevent race conditions
      bookingData = { ...pendingBooking }
      
      // Check time slot availability before attempting to book
      console.log("Checking time slot availability...")
      try {
        const availabilityCheck = await fetch(`/api/student/teachers/${bookingData.teacherId}/availability-check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: bookingData.date,
            timeSlot: bookingData.timeSlot
          }),
        })
        
        if (!availabilityCheck.ok) {
          const availabilityError = await availabilityCheck.json()
          if (availabilityError.error?.includes("already booked") || availabilityError.error?.includes("not available")) {
            throw new BookingError("This time slot is no longer available. Please select a different time.", {
              availabilityCheck: availabilityError,
              bookingData: bookingData
            })
          }
        }
      } catch (availabilityError) {
        if (availabilityError instanceof BookingError) {
          throw availabilityError
        }
        // Log the availability check error but continue with booking attempt
        logger.warn("Availability check failed, proceeding with booking", { error: availabilityError })
      }
      
      // First create the booking
      const [startTime, endTime] = bookingData.timeSlot.split(" - ")
      const bookingDateTime = new Date(bookingData.date)
      const [hours, minutes] = startTime.split(":")
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes))

      const endDateTime = new Date(bookingData.date)
      const [endHours, endMinutes] = endTime.split(":")
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))

      console.log("Creating booking with:", {
        teacherId: bookingData.teacherId,
        bookingDateTime: bookingDateTime.toISOString(),
        timeSlot: bookingData.timeSlot
      })

      await onBookClass(bookingData.teacherId, bookingDateTime, bookingData.timeSlot)
      console.log("Booking created successfully")
      
      // Then submit payment information
      const paymentData = {
        ...paymentInfo,
        bookingData: bookingData
      }
      console.log("Submitting payment with data:", paymentData)
      
      await onSubmitPayment(paymentData)
      console.log("Payment submitted successfully")

      // Reset state only after successful completion
      setIsDialogOpen(false)
      setSelectedDate(undefined)
      setSelectedTime("")
      setBookingSuccess("")
      setPendingBooking(null)
      setShowPaymentPopup(false)
    } catch (error) {
      const safeError = handleUnknownError(error)
      
      // Check if this is a time slot conflict error
      if (safeError.message.includes("Time slot already booked") || safeError.message.includes("already booked") || safeError.message.includes("no longer available")) {
        // This is a conflict error - we should allow the user to try again with a different time
        logger.logBookingError("Time slot conflict detected", safeError, {
          bookingData: bookingData,
          paymentInfo: paymentInfo
        })
        
        // Close the payment popup but keep the dialog open so user can select a new time
        setShowPaymentPopup(false)
        setBookingError("This time slot has just been booked by another student. Please select a different time slot.")
        setBookingSuccess("")
        
        // Don't reset the pending booking or dialog state so user can easily try again
        // Just clear the selected time so they can pick a new one
        setSelectedTime("")
        
        // Throw a more user-friendly error
        throw new BookingError(
          "This time slot has just been booked by another student. Please select a different time slot and try again.",
          {
            originalError: safeError,
            bookingData: bookingData,
            conflictType: "time_slot_taken",
            actionRequired: "select_new_time"
          }
        )
      }
      
      logger.logPaymentError("Error completing booking with payment", safeError, {
        pendingBooking: pendingBooking,
        paymentInfo: paymentInfo
      })
      
      throw safeError
    }
  }

  const formatDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayIndex]
  }

  const getAvailabilitySummary = () => {
    const availabilityByDay = teacher.availability.reduce((acc, avail) => {
      if (!acc[avail.dayOfWeek]) {
        acc[avail.dayOfWeek] = []
      }
      acc[avail.dayOfWeek].push(`${avail.startTime}-${avail.endTime}`)
      return acc
    }, {} as Record<number, string[]>)

    return Object.entries(availabilityByDay).slice(0, 3).map(([day, times]) => ({
      day: formatDayName(parseInt(day)),
      times: times.slice(0, 2).join(', ')
    }))
  }

  const averageRating = getAverageRating()

  return (
    <>
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-200/50 shadow-lg overflow-hidden bg-white hover:border-blue-200/50">
      {/* Teacher Header with Modern Design */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Avatar className="h-24 w-24 border-3 border-white shadow-xl relative">
                  <AvatarImage src={teacher.user.image} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                    {teacher.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 border-3 border-white rounded-full p-1.5 shadow-lg">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px] sm:max-w-none">
                  {teacher.user.name}
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-full border border-amber-200">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                    <span className="text-sm font-semibold text-amber-700">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({teacher.reviews.length} {teacher.reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
                <Sparkles className="h-3 w-3 mr-1" />
                Expert Teacher
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${teacher.hourlyRate}
                </div>
                <div className="text-xs text-gray-500">per hour</div>
              </div>
            </div>
          </div>
          
          {/* Modern Stats Bar */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-gray-100 min-w-0">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-xs font-medium text-gray-600 truncate px-1">Competitive Rate</div>
            </div>
            {teacher.experience && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-gray-100 min-w-0">
                <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="text-xs font-medium text-gray-600 truncate px-1">
                  {teacher.experience} years exp.
                </div>
              </div>
            )}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-gray-100 min-w-0">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-xs font-medium text-gray-600 truncate px-1">Personalized</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-gray-100 min-w-0">
              <div className="flex items-center justify-center space-x-1 text-pink-600 mb-1">
                <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-xs font-medium text-gray-600 truncate px-1">Video Lessons</div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Bio with Enhanced Typography */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400 flex-1"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About</span>
            <div className="h-px bg-gradient-to-r from-purple-400 to-blue-400 flex-1"></div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed text-justify line-clamp-3 overflow-hidden">
            {teacher.bio || "Passionate English teacher dedicated to helping students achieve their language learning goals through personalized instruction and engaging lessons."}
          </p>
        </div>

        {/* Languages with Modern Pills */}
        {teacher.languages && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Languages</span>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {teacher.languages.split(",").slice(0, 3).map((lang, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden min-w-0 flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:border-purple-300 hover:from-purple-50 hover:to-blue-50 transition-all duration-200 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 truncate max-w-[80px] sm:max-w-none"
                  >
                    {lang.trim()}
                  </Badge>
                </div>
              ))}
              {teacher.languages.split(",").length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 flex-shrink-0">
                  +{teacher.languages.split(",").length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Availability with Modern Cards */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Weekly Availability</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {getAvailabilitySummary().map((avail, index) => (
              <div key={index} className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-purple-800 truncate">{avail.day}</span>
                    </div>
                    <div className="bg-purple-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                      <span className="text-xs font-semibold text-purple-700 truncate">{avail.times}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews with Enhanced Design */}
        {teacher.reviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-semibold text-gray-700">Latest Review</span>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-pink-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(teacher.reviews[0].rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs font-semibold text-amber-700">
                    {teacher.reviews[0].rating}.0
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic leading-relaxed mb-2 line-clamp-2 overflow-hidden">
                  "{teacher.reviews[0].comment || 'Great teacher!'}"
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {teacher.reviews[0].student.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium truncate">
                    {teacher.reviews[0].student.user.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Action Buttons */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400 flex-1"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
            <div className="h-px bg-gradient-to-r from-purple-400 to-blue-400 flex-1"></div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative flex items-center justify-center">
                  <Video className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Book a Class
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50"></div>
              <div className="relative">
                <DialogHeader className="pb-6 border-b border-gray-200">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate pr-4">
                    Book a Class with {teacher.user.name}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-base sm:text-lg">
                    Select your preferred date and time for your personalized English lesson
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 py-6">
                  {/* Calendar Section */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-blue-200/50 shadow-sm">
                      <h4 className="font-semibold text-lg sm:text-xl text-gray-800 mb-4 flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="truncate">Select Date</span>
                      </h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                          className="rounded-md border-0"
                        />
                      </div>
                    </div>
                    
                    {/* Teacher Info Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200/50 shadow-sm">
                      <h5 className="font-semibold text-base sm:text-lg text-gray-800 mb-4 flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="truncate">About {teacher.user.name}</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                          <span className="text-gray-600 font-medium flex items-center">
                            <Star className="h-4 w-4 text-amber-400 mr-2" />
                            Rating:
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                            <span className="font-semibold text-amber-700">{averageRating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm ml-1">({teacher.reviews.length})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                          <span className="text-gray-600 font-medium flex items-center">
                            <Award className="h-4 w-4 text-purple-600 mr-2" />
                            Experience:
                          </span>
                          <span className="font-semibold text-purple-600">
                            {typeof teacher.experience === 'number' 
                              ? `${teacher.experience} years` 
                              : teacher.experience || 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                          <span className="text-gray-600 font-medium flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                            Rate:
                          </span>
                          <span className="font-semibold text-green-600">${teacher.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                          <span className="text-gray-600 font-medium flex items-center">
                            <Target className="h-4 w-4 text-pink-600 mr-2" />
                            Specialty:
                          </span>
                          <span className="font-semibold text-pink-600">Personalized Learning</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Slots Section */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-pink-200/50 shadow-sm">
                      <h4 className="font-semibold text-lg sm:text-xl text-gray-800 mb-4 flex items-center">
                        <div className="bg-pink-100 p-2 rounded-lg mr-3">
                          <Clock className="h-5 w-5 text-pink-600" />
                        </div>
                        <span className="truncate">Available Time Slots</span>
                      </h4>
                      {selectedDate ? (
                        <div className="space-y-4">
                          {getAvailableSlots(selectedDate).length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                              {getAvailableSlots(selectedDate).map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={selectedTime === `${slot.startTime} - ${slot.endTime}` ? "default" : "outline"}
                                  className={`h-auto p-3 sm:p-4 text-left justify-start transition-all duration-200 group ${
                                    selectedTime === `${slot.startTime} - ${slot.endTime}`
                                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl'
                                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                                  }`}
                                  onClick={() => setSelectedTime(`${slot.startTime} - ${slot.endTime}`)}
                                >
                                  <div className="space-y-2 w-full">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center min-w-0 flex-1">
                                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="font-semibold truncate">{slot.startTime} - {slot.endTime}</span>
                                      </div>
                                      <Zap className="h-4 w-4 opacity-75 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
                                    </div>
                                    <div className="text-xs opacity-75 truncate">
                                      {selectedDate.toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-red-500" />
                              </div>
                              <p className="text-gray-500 font-semibold text-lg">No available slots</p>
                              <p className="text-gray-400 mt-2">
                                Please try another date
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <CalendarIcon className="h-8 w-8 text-blue-500" />
                          </div>
                          <p className="text-gray-500 font-semibold text-lg">Select a date first</p>
                          <p className="text-gray-400 mt-2">
                            Choose a date to see available time slots
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Booking Summary */}
                    {selectedDate && selectedTime && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200/50 shadow-sm">
                        <h5 className="font-semibold text-base sm:text-lg text-green-800 mb-4 flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="truncate">Booking Summary</span>
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                            <span className="text-gray-600 font-medium flex-shrink-0">Date:</span>
                            <span className="font-medium text-gray-800 text-right truncate ml-2">
                              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                            <span className="text-gray-600 font-medium flex-shrink-0">Time:</span>
                            <span className="font-medium text-gray-800 text-right truncate ml-2">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                            <span className="text-gray-600 font-medium flex-shrink-0">Duration:</span>
                            <span className="font-medium text-gray-800 text-right ml-2">1 hour</span>
                          </div>
                          <div className="flex justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100">
                            <span className="text-gray-600 font-medium flex-shrink-0">Price:</span>
                            <span className="font-medium text-green-600 text-right ml-2">${teacher.hourlyRate}</span>
                          </div>
                        </div>
                        
                        {bookingError && (
                          <Alert className="mt-4 border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700">
                              {bookingError}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {bookingSuccess && (
                          <Alert className="mt-4 border-green-200 bg-green-50">
                            <AlertDescription className="text-green-700">
                              {bookingSuccess}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <Button 
                          onClick={handleBookClass}
                          disabled={bookingLoading}
                          className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                        >
                          {bookingLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Booking...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              Confirm Booking
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            className="w-full border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 group relative overflow-hidden"
            onClick={() => {
              // View profile functionality
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="relative flex items-center justify-center">
              <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              View Full Profile
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Payment Confirmation Popup */}
    {showPaymentPopup && pendingBooking && (
      <BookingConfirmationPopup
        isOpen={showPaymentPopup}
        onClose={() => {
          setShowPaymentPopup(false)
          // Don't reset pendingBooking here - it will be reset after successful payment
          // or if there's an error, the user can retry
        }}
        bookingData={pendingBooking}
        onConfirm={handlePaymentConfirmation}
      />
    )}
    </>
  )
}