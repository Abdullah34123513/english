"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Clock, 
  MapPin, 
  Globe,
  BookOpen,
  Target,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  Check
} from "lucide-react"
import Link from "next/link"

interface Teacher {
  id: string
  name: string
  email: string
  image?: string
  bio?: string
  experience?: string
  specialties?: string[]
  hourlyRate?: number
  country?: string
  timezone?: string
  languages?: string[]
  rating?: number
  totalReviews?: number
  availability?: any[]
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  student: {
    name: string
    image?: string
  }
}

export default function TeacherProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get('id') || ''
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (teacherId) {
      fetchTeacherProfile()
      fetchTeacherReviews()
    }
  }, [teacherId])

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`/api/teacher/profile?id=${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setTeacher(data)
      }
    } catch (error) {
      console.error("Failed to fetch teacher profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherReviews = async () => {
    try {
      const response = await fetch(`/api/teacher/reviews?id=${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Failed to fetch teacher reviews:", error)
    }
  }

  const handleBookLesson = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/teachers/${teacherId}`)
      return
    }

    if (session.user.role !== "STUDENT") {
      alert("Only students can book lessons")
      return
    }

    setBookingLoading(true)
    try {
      // Create a booking
      const response = await fetch("/api/student/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: teacherId,
          date: new Date().toISOString().split('T')[0], // Today's date
          time: "10:00", // Default time
          duration: 60, // 60 minutes
        }),
      })

      if (response.ok) {
        router.push("/dashboard/student")
      }
    } catch (error) {
      console.error("Failed to book lesson:", error)
    } finally {
      setBookingLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Teacher not found
            </h3>
            <p className="text-gray-600 mb-6">
              The teacher profile you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/teachers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teachers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/teachers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teachers
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
            </div>
            <Button 
              onClick={handleBookLesson}
              disabled={bookingLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {bookingLoading ? "Booking..." : "Book Lesson"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Teacher Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={teacher.image} />
                  <AvatarFallback className="text-2xl">
                    {teacher.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{teacher.name}</CardTitle>
                <CardDescription>{teacher.email}</CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {teacher.rating && (
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(teacher.rating))}
                      <span className="text-sm text-gray-600">
                        ({teacher.rating}/5)
                      </span>
                    </div>
                  )}
                  {teacher.totalReviews && (
                    <Badge variant="outline">
                      {teacher.totalReviews} reviews
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teacher.hourlyRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hourly Rate</span>
                    <span className="font-semibold text-lg">${teacher.hourlyRate}</span>
                  </div>
                )}
                {teacher.country && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{teacher.country}</span>
                  </div>
                )}
                {teacher.timezone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{teacher.timezone}</span>
                  </div>
                )}
                {teacher.languages && teacher.languages.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Languages</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="specialties">Specialties</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>About Me</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teacher.bio ? (
                      <p className="text-gray-700 leading-relaxed">{teacher.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">No bio available.</p>
                    )}
                  </CardContent>
                </Card>

                {teacher.experience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Teaching Experience</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{teacher.experience}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="specialties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Teaching Specialties</span>
                    </CardTitle>
                    <CardDescription>
                      Areas of expertise and specializations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teacher.specialties && teacher.specialties.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {teacher.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No specialties listed.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Availability</span>
                    </CardTitle>
                    <CardDescription>
                      Typical availability for lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Contact the teacher directly or book a lesson to check their current availability.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Student Reviews</span>
                    </CardTitle>
                    <CardDescription>
                      Reviews from students who have taken lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={review.student.image} />
                                  <AvatarFallback>
                                    {review.student.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{review.student.name}</h4>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(review.rating)}
                                    <span className="text-sm text-gray-600">
                                      {review.rating}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}