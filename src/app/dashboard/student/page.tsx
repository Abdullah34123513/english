"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  BookOpen, 
  Search, 
  Filter,
  TrendingUp,
  Target,
  Award,
  Sparkles,
  Zap,
  ArrowRight,
  Play,
  BarChart3,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User
} from "lucide-react"
import { TeacherList } from "@/components/student/teacher-list"
import { BookingList } from "@/components/student/booking-list"

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
      return
    }

    fetchStudentData()
  }, [session, status, router])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/student/profile`)
      if (response.ok) {
        const data = await response.json()
        // Ensure statistics object exists with default values
        const studentDataWithStats = {
          ...data,
          statistics: data.statistics || {
            totalClasses: 0,
            upcomingClasses: 0,
            moneySpent: 0,
            learningStreak: 0
          }
        }
        setStudentData(studentDataWithStats)
      } else {
        // Handle error response
        const errorData = await response.json()
        console.error("Failed to fetch student data:", response.status, errorData)
        
        // Check if it's a profile not found error
        if (response.status === 404 && errorData.requiresProfile) {
          // Show a user-friendly message for missing profile
          setStudentData({
            bookings: [],
            statistics: {
              totalClasses: 0,
              upcomingClasses: 0,
              moneySpent: 0,
              learningStreak: 0
            },
            profileIncomplete: true,
            profileMessage: errorData.message || "Please complete your student profile to access all features"
          })
        } else {
          // Handle other errors
          setStudentData({
            bookings: [],
            statistics: {
              totalClasses: 0,
              upcomingClasses: 0,
              moneySpent: 0,
              learningStreak: 0
            }
          })
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      // Set default data with empty statistics
      setStudentData({
        bookings: [],
        statistics: {
          totalClasses: 0,
          upcomingClasses: 0,
          moneySpent: 0,
          learningStreak: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Dashboard
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {session.user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <User className="h-3 w-3 mr-1" />
                {session.user.name}
              </Badge>
              <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-blue-50">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Completion Alert */}
      {studentData?.profileIncomplete && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {studentData.profileMessage}
            </AlertDescription>
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => {
                  // TODO: Navigate to profile completion page
                  console.log('Navigate to profile completion')
                }}
              >
                Complete Profile
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Ready to Learn English Today?</h2>
                <p className="text-lg text-white/90 mb-4">
                  Continue your language learning journey with personalized lessons
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">AI-Powered Learning</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Personalized Path</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{studentData?.statistics?.upcomingClasses || 0}</div>
                    <div className="text-sm text-white/80">Classes This Week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Classes</CardTitle>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{studentData?.statistics?.totalClasses || 0}</div>
              <p className="text-xs text-gray-600">Completed</p>
              <div className="mt-2 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((studentData?.statistics?.totalClasses || 0) * 10, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Upcoming Classes</CardTitle>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{studentData?.statistics?.upcomingClasses || 0}</div>
              <p className="text-xs text-gray-600">Scheduled</p>
              <div className="mt-2 h-1 bg-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((studentData?.statistics?.upcomingClasses || 0) * 25, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Money Spent</CardTitle>
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${studentData?.statistics?.moneySpent?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-gray-600">Total Investment</p>
              <div className="mt-2 h-1 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((studentData?.statistics?.moneySpent || 0) / 10, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-pink-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Learning Streak</CardTitle>
              <div className="bg-pink-100 p-2 rounded-lg">
                <Award className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">{studentData?.statistics?.learningStreak || 0}</div>
              <p className="text-xs text-gray-600">Days Active</p>
              <div className="mt-2 h-1 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((studentData?.statistics?.learningStreak || 0) * 10, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="browse" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Search className="h-4 w-4 mr-2" />
              Browse Teachers
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Calendar className="h-4 w-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <BarChart3 className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Find Your Perfect Teacher</h3>
                  <p className="text-gray-600">Browse through our certified English teachers</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
              <TeacherList onUpdate={fetchStudentData} />
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">My Bookings</h3>
                  <p className="text-gray-600">Manage your upcoming and past classes</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {studentData?.bookings?.length || 0} Active Bookings
                </Badge>
              </div>
              <BookingList studentData={studentData} onUpdate={fetchStudentData} />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Learning Progress
                  </CardTitle>
                  <CardDescription>
                    Track your English learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">No progress data yet</p>
                      <p className="text-sm">Start taking classes to see your learning progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    Unlock milestones as you learn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">No achievements yet</p>
                      <p className="text-sm">Complete classes to earn achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}