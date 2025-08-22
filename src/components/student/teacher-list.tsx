"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedTeacherCard } from "./enhanced-teacher-card"
import { BookingError, PaymentError, handleUnknownError } from "@/lib/custom-error"
import { createLogger } from "@/lib/logger"
import { Search, Filter, Users, Sparkles, TrendingUp, Award, Star } from "lucide-react"

const logger = createLogger('TeacherList')

interface TeacherListProps {
  onUpdate: () => void
}

interface Teacher {
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

export function TeacherList({ onUpdate }: TeacherListProps) {
  const { data: session } = useSession()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [priceRange, setPriceRange] = useState("all")
  const [experienceLevel, setExperienceLevel] = useState("all")

  const studentId = session?.user?.id || ""

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/student/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      } else {
        logger.error("Failed to fetch teachers", { 
          status: response.status, 
          statusText: response.statusText 
        })
      }
    } catch (error) {
      logger.error("Error fetching teachers", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = teachers
    .filter(teacher => 
      teacher.isActive &&
      (teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(teacher => {
      if (priceRange === "low") return teacher.hourlyRate <= 20
      if (priceRange === "medium") return teacher.hourlyRate > 20 && teacher.hourlyRate <= 40
      if (priceRange === "high") return teacher.hourlyRate > 40
      return true
    })
    .filter(teacher => {
      const extractYears = (experience: string | number | undefined): number => {
        if (!experience) return 0
        if (typeof experience === 'number') return experience
        
        // Extract numbers from string experience (e.g., "8+ years" -> 8, "10+ years" -> 10)
        const match = experience.toString().match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
      
      const years = extractYears(teacher.experience)
      
      if (experienceLevel === "beginner") return years <= 2
      if (experienceLevel === "intermediate") return years > 2 && years <= 5
      if (experienceLevel === "expert") return years > 5
      return true
    })
    .sort((a, b) => {
      const extractYears = (experience: string | number | undefined): number => {
        if (!experience) return 0
        if (typeof experience === 'number') return experience
        
        // Extract numbers from string experience (e.g., "8+ years" -> 8, "10+ years" -> 10)
        const match = experience.toString().match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
      
      switch (sortBy) {
        case "rating":
          const avgRatingA = a.reviews.length > 0 ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0
          const avgRatingB = b.reviews.length > 0 ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0
          return avgRatingB - avgRatingA
        case "price-low":
          return a.hourlyRate - b.hourlyRate
        case "price-high":
          return b.hourlyRate - a.hourlyRate
        case "experience":
          return extractYears(b.experience) - extractYears(a.experience)
        case "reviews":
          return b.reviews.length - a.reviews.length
        default:
          return 0
      }
    })

  const getAverageRating = (teacher: Teacher) => {
    if (teacher.reviews.length === 0) return 0
    return teacher.reviews.reduce((sum, review) => sum + review.rating, 0) / teacher.reviews.length
  }

  const getMaxExperience = (teachers: Teacher[]) => {
    if (teachers.length === 0) return "0"
    
    const extractYears = (experience: string | number | undefined): number => {
      if (!experience) return 0
      if (typeof experience === 'number') return experience
      
      // Extract numbers from string experience (e.g., "8+ years" -> 8, "10+ years" -> 10)
      const match = experience.toString().match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }
    
    const maxYears = Math.max(...teachers.map(t => extractYears(t.experience)))
    return maxYears.toString()
  }

  const handleBookClass = async (teacherId: string, date: Date, timeSlot: string) => {
    try {
      console.log("Creating booking with:", { teacherId, date, timeSlot })
      
      const [startTime, endTime] = timeSlot.split(" - ")
      const bookingDateTime = new Date(date)
      const [hours, minutes] = startTime.split(":")
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes))

      const endDateTime = new Date(date)
      const [endHours, endMinutes] = endTime.split(":")
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))

      const bookingData = {
        teacherId,
        startTime: bookingDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      }
      
      console.log("Sending booking data:", bookingData)

      const response = await fetch("/api/student/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      console.log("Booking API response status:", response.status)
      console.log("Booking API response ok:", response.ok)

      if (!response.ok) {
        let errorMessage = "Failed to book class"
        let errorData = null
        
        try {
          errorData = await response.json()
          console.log("Booking API error data:", errorData)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (jsonError) {
          console.log("Failed to parse booking error response as JSON:", jsonError)
          errorMessage = response.statusText || errorMessage
        }
        
        // Create a more robust error object with proper properties
        const bookingError = new BookingError(`${errorMessage} (Status: ${response.status})`, {
          responseStatus: response.status,
          responseText: response.statusText,
          errorData: errorData
        })
        throw bookingError
      }

      const successData = await response.json()
      console.log("Booking API success response:", successData)
      
      onUpdate()
    } catch (error) {
      const safeError = handleUnknownError(error)
      logger.logPaymentError("Error creating booking", safeError, {
        teacherId: teacherId,
        bookingDateTime: date.toISOString(),
        timeSlot: timeSlot
      })
      
      throw safeError
    }
  }

  const handleSubmitPayment = async (paymentInfo: any) => {
    let enhancedPaymentInfo: any = null
    
    try {
      console.log("Submitting payment with data:", paymentInfo)
      
      // Ensure bookingData contains the correct studentId
      enhancedPaymentInfo = {
        ...paymentInfo,
        bookingData: {
          ...paymentInfo.bookingData,
          studentId: studentId // Override with the actual studentId from session
        }
      }
      
      console.log("Enhanced payment info:", enhancedPaymentInfo)
      
      const response = await fetch("/api/student/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancedPaymentInfo),
      })

      console.log("Payment API response status:", response.status)
      console.log("Payment API response ok:", response.ok)

      if (!response.ok) {
        let errorMessage = "Failed to submit payment"
        let errorData = null
        
        try {
          errorData = await response.json()
          console.log("Payment API error data:", errorData)
          console.log("Payment API error status:", response.status)
          console.log("Payment API error status text:", response.statusText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (jsonError) {
          console.log("Failed to parse error response as JSON:", jsonError)
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
          try {
            const textResponse = await response.text()
            console.log("Response text:", textResponse)
          } catch (textError) {
            console.log("Failed to get response text:", textError)
          }
        }
        
        // Add more context to the error message
        console.log("Enhanced payment info that was sent:", enhancedPaymentInfo)
        console.log("Student ID being used:", studentId)
        console.log("Session data:", session)
        
        // Create a more robust error object with proper properties
        const paymentError = new PaymentError(`${errorMessage} (Status: ${response.status})`, {
          responseStatus: response.status,
          responseText: response.statusText,
          errorData: errorData,
          enhancedPaymentInfo: enhancedPaymentInfo,
          studentId: studentId,
          session: session
        })
        throw paymentError
      }

      const successData = await response.json()
      console.log("Payment API success response:", successData)
      
      onUpdate()
    } catch (error) {
      const safeError = handleUnknownError(error)
      logger.logPaymentError("Error submitting payment", safeError, {
        enhancedPaymentInfo: enhancedPaymentInfo || paymentInfo,
        studentId: studentId,
        session: session
      })
      
      throw safeError
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect English Teacher</h2>
          <p className="text-gray-600">Connect with expert teachers for personalized learning</p>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect English Teacher
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with certified, experienced teachers who will help you achieve your English learning goals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{teachers.length}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Expert Teachers</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">
              {teachers.length > 0 ? getAverageRating(teachers[0]).toFixed(1) : '0'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Average Rating</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2">
            <Award className="h-6 w-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {getMaxExperience(teachers)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Max Experience</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {teachers.reduce((sum, t) => sum + t.reviews.length, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filter Teachers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">⭐ Highest Rated</SelectItem>
                <SelectItem value="reviews">💬 Most Reviews</SelectItem>
                <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price-high">💰 Price: High to Low</SelectItem>
                <SelectItem value="experience">🎓 Most Experience</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">💲 Up to $20/hr</SelectItem>
                <SelectItem value="medium">💲 $20 - $40/hr</SelectItem>
                <SelectItem value="high">💲 Over $40/hr</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">🌱 Beginner (0-2 years)</SelectItem>
                <SelectItem value="intermediate">🌿 Intermediate (3-5 years)</SelectItem>
                <SelectItem value="expert">🌳 Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">
            {filteredTeachers.length} {filteredTeachers.length === 1 ? 'Teacher' : 'Teachers'} Found
          </span>
        </div>
        {searchTerm && (
          <Badge variant="outline" className="text-sm">
            Filtered by: "{searchTerm}"
          </Badge>
        )}
      </div>

      {/* Teacher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <EnhancedTeacherCard
            key={teacher.id}
            teacher={teacher}
            studentId={studentId}
            onBookClass={handleBookClass}
            onSubmitPayment={handleSubmitPayment}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredTeachers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || priceRange !== "all" || experienceLevel !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Check back later as new teachers join our platform."}
            </p>
            {(searchTerm || priceRange !== "all" || experienceLevel !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setPriceRange("all")
                  setExperienceLevel("all")
                }}
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}