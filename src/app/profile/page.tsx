"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  BookOpen, 
  Star, 
  Settings, 
  Edit,
  MapPin,
  Phone,
  Globe,
  Target,
  Clock,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Camera,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Activity,
  BookMarked,
  MessageCircle,
  ThumbsUp,
  Eye,
  Share2
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  role: string
  image?: string
  createdAt: string
  // Student specific fields
  age?: number
  country?: string
  timezone?: string
  englishLevel?: string
  learningGoals?: string[]
  interests?: string[]
  hobbies?: string[]
  preferredStudyDays?: string[]
  preferredStudyTimes?: string[]
  totalBookings?: number
  completedLessons?: number
  totalReviews?: number
  averageRating?: number
  // Teacher specific fields
  bio?: string
  experience?: string
  specialties?: string[]
  rating?: number
  totalReviews?: number
  totalStudents?: number
  availabilityHours?: number
}

interface ActivityItem {
  id: string
  type: 'booking' | 'review' | 'payment' | 'profile_update'
  title: string
  description: string
  date: string
  icon: React.ComponentType<any>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
      fetchRecentActivity()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      if (session?.user?.role === "STUDENT") {
        const response = await fetch("/api/student/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      } else if (session?.user?.role === "TEACHER") {
        const response = await fetch("/api/teacher/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    // Mock recent activity data - in a real app, this would come from an API
    const mockActivity: ActivityItem[] = [
      {
        id: "1",
        type: "booking",
        title: "New Lesson Booked",
        description: "English conversation practice with Sarah Johnson",
        date: "2 hours ago",
        icon: BookMarked
      },
      {
        id: "2",
        type: "review",
        title: "Review Submitted",
        description: "Rated 5 stars for Michael Chen's lesson",
        date: "1 day ago",
        icon: Star
      },
      {
        id: "3",
        type: "payment",
        title: "Payment Confirmed",
        description: "Monthly subscription payment processed",
        date: "3 days ago",
        icon: CheckCircle
      }
    ]
    setRecentActivity(mockActivity)
  }

  const getInterestIcon = (interest: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'music': Music,
      'travel': MapPin,
      'sports': Target,
      'reading': BookOpen,
      'cooking': Coffee,
      'gaming': Gamepad2,
      'photography': Camera,
      'movies': Star,
      'art': Heart,
      'technology': Globe
    }
    const Icon = iconMap[interest.toLowerCase()] || Heart
    return <Icon className="h-4 w-4" />
  }

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'booking': BookMarked,
      'review': Star,
      'payment': CheckCircle,
      'profile_update': User
    }
    return iconMap[type] || Activity
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-red-100 text-red-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-green-100 text-green-800',
      'Native': 'bg-blue-100 text-blue-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  const isStudent = profile.role === "STUDENT"
  const isTeacher = profile.role === "TEACHER"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {profile.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {isStudent && (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/dashboard/student/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
              {isTeacher && (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/dashboard/teacher/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50">
                <Link href={isStudent ? "/dashboard/student" : "/dashboard/teacher"}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
              <CardHeader className="text-center -mt-16 relative z-10">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.image} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold text-gray-900">{profile.name}</CardTitle>
                <CardDescription className="text-gray-600">{profile.email}</CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge variant="outline" className="border-gray-300">
                    {profile.role}
                  </Badge>
                  {profile.englishLevel && (
                    <Badge className={getLevelColor(profile.englishLevel)}>
                      {profile.englishLevel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {profile.country && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.country}</span>
                  </div>
                )}
                {profile.timezone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span>{profile.timezone}</span>
                  </div>
                )}
                {isTeacher && profile.rating && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>
                      {profile.rating}/5 ({profile.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isStudent && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Bookings</span>
                      <span className="font-semibold">{profile.totalBookings || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed Lessons</span>
                      <span className="font-semibold">{profile.completedLessons || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reviews Given</span>
                      <span className="font-semibold">{profile.totalReviews || 0}</span>
                    </div>
                  </>
                )}
                {isTeacher && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="font-semibold">{profile.totalStudents || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{profile.totalReviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Availability</span>
                      <span className="font-semibold">{profile.availabilityHours || 0}h/week</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      <activity.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Learning
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profile.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profile.email}</p>
                        </div>
                        {profile.age && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.age} years old</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {profile.country && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Country</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.country}</p>
                          </div>
                        )}
                        {profile.timezone && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Timezone</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.timezone}</p>
                          </div>
                        )}
                        {profile.englishLevel && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">English Level</label>
                            <Badge className={getLevelColor(profile.englishLevel) + " mt-1"}>
                              {profile.englishLevel}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    {profile.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bio</label>
                        <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {profile.bio}
                        </p>
                      </div>
                    )}
                    {profile.experience && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {profile.experience}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                {isStudent && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Learning Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Course Completion</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Speaking Practice</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grammar Mastery</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                {isStudent && (
                  <>
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5" />
                          <span>Learning Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile.englishLevel && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">English Level</label>
                            <div className="mt-2">
                              <Badge className={getLevelColor(profile.englishLevel)}>
                                {profile.englishLevel}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {profile.learningGoals && profile.learningGoals.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Learning Goals</label>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {profile.learningGoals.map((goal, index) => (
                                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Learning Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <BookMarked className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.totalBookings || 0}</div>
                          <div className="text-sm text-gray-600">Total Bookings</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.completedLessons || 0}</div>
                          <div className="text-sm text-gray-600">Completed Lessons</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <Star className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.totalReviews || 0}</div>
                          <div className="text-sm text-gray-600">Reviews Given</div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
                {isTeacher && profile.specialties && profile.specialties.length > 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Specialties</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {profile.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                {isStudent && (
                  <>
                    {profile.interests && profile.interests.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Interests</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {profile.interests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="flex items-center space-x-2 px-4 py-2">
                                {getInterestIcon(interest)}
                                <span>{interest}</span>
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {profile.hobbies && profile.hobbies.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Coffee className="h-5 w-5" />
                            <span>Hobbies</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {profile.hobbies.map((hobby, index) => (
                              <Badge key={index} variant="outline" className="px-4 py-2">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {(profile.preferredStudyDays || profile.preferredStudyTimes) && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Study Schedule Preferences</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {profile.preferredStudyDays && profile.preferredStudyDays.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Days</label>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {profile.preferredStudyDays.map((day, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {profile.preferredStudyTimes && profile.preferredStudyTimes.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Times</label>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {profile.preferredStudyTimes.map((time, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Achievements & Milestones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mock achievements */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Star className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">First Review</h3>
                            <p className="text-sm text-gray-600">Completed your first review</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BookMarked className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">5 Lessons</h3>
                            <p className="text-sm text-gray-600">Completed 5 lessons</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Active Learner</h3>
                            <p className="text-sm text-gray-600">30 days streak</p>
                          </div>
                        </div>
                      </div>
                      
                      {isTeacher && (
                        <>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <Users className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">10 Students</h3>
                                <p className="text-sm text-gray-600">Taught 10 students</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 p-2 rounded-full">
                                <Award className="h-6 w-6 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Top Rated</h3>
                                <p className="text-sm text-gray-600">5.0 star rating</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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