"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  Check,
  Award,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  ThumbsUp,
  Eye,
  Share2,
  Video,
  Phone,
  MessageCircle,
  CalendarCheck,
  Languages,
  GraduationCap,
  Briefcase,
  Heart,
  CheckCircle
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
  totalStudents?: number
  availabilityHours?: number
  availability?: any[]
  joinedDate?: string
  responseTime?: string
  completionRate?: number
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

interface StatCard {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  description: string
}

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id: teacherId } = use(params)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (teacherId) {
      Promise.all([
        fetchTeacherProfile(),
        fetchTeacherReviews()
      ]).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [teacherId])

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`/api/teacher/${teacherId}/profile`)
      if (response.ok) {
        const data = await response.json()
        setTeacher(data)
      } else {
        console.error("Failed to fetch teacher profile:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch teacher profile:", error)
    }
  }

  const fetchTeacherReviews = async () => {
    try {
      const response = await fetch(`/api/teacher/reviews?id=${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      } else {
        console.error("Failed to fetch teacher reviews:", response.status, response.statusText)
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

  const getStatCards = (): StatCard[] => {
    if (!teacher) return []
    
    return [
      {
        title: "Total Students",
        value: teacher.totalStudents || 0,
        icon: Users,
        color: "text-blue-600",
        description: "Students taught"
      },
      {
        title: "Rating",
        value: teacher.rating ? `${teacher.rating}/5` : "N/A",
        icon: Star,
        color: "text-yellow-600",
        description: "Average rating"
      },
      {
        title: "Reviews",
        value: teacher.totalReviews || 0,
        icon: MessageSquare,
        color: "text-green-600",
        description: "Student reviews"
      },
      {
        title: "Response Time",
        value: teacher.responseTime || "Fast",
        icon: Clock,
        color: "text-purple-600",
        description: "Average response"
      },
      {
        title: "Completion Rate",
        value: teacher.completionRate ? `${teacher.completionRate}%` : "95%",
        icon: CheckCircle,
        color: "text-emerald-600",
        description: "Lesson completion"
      },
      {
        title: "Experience",
        value: teacher.experience ? "Experienced" : "Professional",
        icon: Briefcase,
        color: "text-orange-600",
        description: "Teaching experience"
      }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading teacher profile...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Teacher not found
            </h3>
            <p className="text-gray-600 mb-6">
              The teacher profile you're looking for doesn't exist.
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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

  const statCards = getStatCards()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:bg-gray-100">
                <Link href="/teachers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teachers
                </Link>
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Profile
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBookLesson}
                disabled={bookingLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Book Lesson
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Teacher Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
              <CardHeader className="text-center -mt-16 relative z-10">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={teacher.image} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {teacher.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold text-gray-900">{teacher.name}</CardTitle>
                <CardDescription className="text-gray-600">{teacher.email}</CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  {teacher.rating && (
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(teacher.rating))}
                      <span className="text-sm text-gray-600 font-medium">
                        ({teacher.rating}/5)
                      </span>
                    </div>
                  )}
                  {teacher.totalReviews && (
                    <Badge variant="outline" className="border-gray-300">
                      {teacher.totalReviews} reviews
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teacher.hourlyRate && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Hourly Rate</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">${teacher.hourlyRate}</span>
                  </div>
                )}
                {teacher.country && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{teacher.country}</p>
                    </div>
                  </div>
                )}
                {teacher.timezone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Timezone</p>
                      <p className="text-gray-900">{teacher.timezone}</p>
                    </div>
                  </div>
                )}
                {teacher.languages && teacher.languages.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Languages className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teacher.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-indigo-200">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {teacher.joinedDate && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Joined</p>
                      <p className="text-gray-900">{new Date(teacher.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.slice(0, 4).map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleBookLesson}
                  disabled={bookingLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Book a Lesson
                </Button>
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  About
                </TabsTrigger>
                <TabsTrigger value="specialties" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Specialties
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {statCards.map((stat, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.description}</p>
                          </div>
                          <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Metrics */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Student Satisfaction</span>
                          <span>{teacher.rating ? Math.round((teacher.rating / 5) * 100) : 95}%</span>
                        </div>
                        <Progress value={teacher.rating ? (teacher.rating / 5) * 100 : 95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lesson Completion</span>
                          <span>{teacher.completionRate || 95}%</span>
                        </div>
                        <Progress value={teacher.completionRate || 95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Rate</span>
                          <span>98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>About Me</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teacher.bio ? (
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {teacher.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                        No bio available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {teacher.experience && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5" />
                        <span>Teaching Experience</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {teacher.experience}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Teaching Approach */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Teaching Approach</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Video className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Interactive Lessons</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Conversational Focus</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Structured Learning</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <Heart className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Student-Centered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specialties" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
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
                      <div className="flex flex-wrap gap-3">
                        {teacher.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                        No specialties listed.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Available Hours</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {teacher.availabilityHours || 20}h/week
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Response Time</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {teacher.responseTime || "Within 2 hours"}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Contact the teacher directly or book a lesson to check their current availability and schedule a convenient time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
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
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No reviews yet.</p>
                        <p className="text-gray-400">Be the first to leave a review!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Rating Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(Math.round(teacher.rating || 0))}
                              </div>
                              <span className="text-lg font-bold text-gray-900">
                                {teacher.rating}/5
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              Based on {teacher.totalReviews} reviews
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = reviews.filter(r => Math.round(r.rating) === star).length
                              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                              return (
                                <div key={star} className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-600">{star}</span>
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage src={review.student.image} />
                                    <AvatarFallback>
                                      {review.student.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{review.student.name}</h4>
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
                              <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                {review.comment}
                              </p>
                            </div>
                          ))}
                        </div>
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