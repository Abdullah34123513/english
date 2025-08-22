"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Target,
  MessageCircle,
  Video,
  Bell,
  BarChart3,
  Activity,
  Heart,
  Zap,
  Plus,
  Settings,
  LogOut
} from "lucide-react"
import { TeacherProfile } from "@/components/teacher/teacher-profile"
import { AvailabilityManager } from "@/components/teacher/availability-manager"
import { BookingList } from "@/components/teacher/booking-list"

interface DashboardStats {
  totalBookings: number
  upcomingClasses: number
  monthlyEarnings: number
  averageRating: number
  totalStudents: number
  completionRate: number
  responseRate: number
  thisMonthBookings: number
  lastMonthBookings: number
}

interface RecentActivity {
  id: string
  type: 'booking' | 'review' | 'payment' | 'cancellation'
  title: string
  description: string
  time: string
  icon: React.ComponentType<any>
}

interface UpcomingClass {
  id: string
  studentName: string
  studentAvatar?: string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'PENDING'
  meetLink?: string
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teacherData, setTeacherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingClasses: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalStudents: 0,
    completionRate: 0,
    responseRate: 0,
    thisMonthBookings: 0,
    lastMonthBookings: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "TEACHER") {
      router.push("/auth/signin")
      return
    }

    fetchTeacherData()
    fetchDashboardStats()
    fetchRecentActivity()
    fetchUpcomingClasses()
    fetchNotifications()
  }, [session, status, router])

  const fetchTeacherData = async () => {
    try {
      const response = await fetch(`/api/teacher/profile`)
      if (response.ok) {
        const data = await response.json()
        setTeacherData(data)
      } else if (response.status === 404) {
        const createResponse = await fetch(`/api/teacher/create-profile`, {
          method: 'POST'
        })
        if (createResponse.ok) {
          const data = await createResponse.json()
          setTeacherData(data)
        }
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Mock data - in real app, this would come from API
      setStats({
        totalBookings: 156,
        upcomingClasses: 8,
        monthlyEarnings: 2840,
        averageRating: 4.8,
        totalStudents: 42,
        completionRate: 94,
        responseRate: 98,
        thisMonthBookings: 28,
        lastMonthBookings: 24
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Mock data - in real app, this would come from API
      setRecentActivity([
        {
          id: "1",
          type: "booking",
          title: "New Booking Confirmed",
          description: "Sarah Johnson booked a Business English class",
          time: "2 hours ago",
          icon: Calendar
        },
        {
          id: "2",
          type: "review",
          title: "New Review Received",
          description: "Michael Chen left a 5-star review",
          time: "5 hours ago",
          icon: Star
        },
        {
          id: "3",
          type: "payment",
          title: "Payment Processed",
          description: "Received payment for 3 completed classes",
          time: "1 day ago",
          icon: DollarSign
        }
      ])
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    }
  }

  const fetchUpcomingClasses = async () => {
    try {
      // Mock data - in real app, this would come from API
      setUpcomingClasses([
        {
          id: "1",
          studentName: "Emma Wilson",
          startTime: "2024-01-15T10:00:00",
          endTime: "2024-01-15T11:00:00",
          status: "CONFIRMED",
          meetLink: "https://meet.google.com/abc-defg-hij"
        },
        {
          id: "2",
          studentName: "James Chen",
          startTime: "2024-01-15T14:00:00",
          endTime: "2024-01-15T15:00:00",
          status: "PENDING"
        },
        {
          id: "3",
          studentName: "Maria Garcia",
          startTime: "2024-01-16T09:00:00",
          endTime: "2024-01-16T10:00:00",
          status: "CONFIRMED"
        }
      ])
    } catch (error) {
      console.error("Error fetching upcoming classes:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      // Mock data - in real app, this would come from API
      setNotifications([
        {
          id: "1",
          title: "Profile Completion Reminder",
          message: "Complete your profile to increase visibility",
          type: "info",
          read: false
        },
        {
          id: "2",
          title: "New Student Inquiry",
          message: "A student is interested in your IELTS preparation course",
          type: "success",
          read: false
        }
      ])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getBookingGrowth = () => {
    if (stats.lastMonthBookings === 0) return 100
    return Math.round(((stats.thisMonthBookings - stats.lastMonthBookings) / stats.lastMonthBookings) * 100)
  }

  const handleStartClass = () => {
    if (upcomingClasses.length === 0) return
    
    // Find the next upcoming class that has a meet link
    const nextClass = upcomingClasses.find(cls => cls.meetLink && cls.status === 'CONFIRMED')
    
    if (nextClass && nextClass.meetLink) {
      window.open(nextClass.meetLink, '_blank')
    } else {
      // Show a message that no class is ready to start
      alert('No confirmed class with meet link available. Please check your schedule.')
    }
  }

  const handleMessageStudents = () => {
    // For now, navigate to a placeholder messaging page
    // In a real app, this would open a messaging interface
    router.push('/dashboard/teacher/messages')
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return null
  }

  const bookingGrowth = getBookingGrowth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Teacher Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">Welcome back, {session.user.name}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {teacherData?.hourlyRate || "25"}/hr
              </Badge>
              <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{bookingGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${stats.monthlyEarnings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
              <div className="flex items-center text-xs text-gray-600">
                <Users className="h-3 w-3 mr-1" />
                {stats.totalStudents} students
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
              <Progress value={stats.completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Upcoming Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks you might need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push("/dashboard/teacher/availability")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Availability
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleStartClass}
                disabled={upcomingClasses.length === 0}
              >
                <Video className="h-4 w-4 mr-2" />
                Start Class
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleMessageStudents}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Students
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push("/dashboard/teacher/analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Today's Schedule
                  </div>
                  <Badge variant="outline">{upcomingClasses.length} classes</Badge>
                </CardTitle>
                <CardDescription>Your upcoming classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingClasses.slice(0, 3).map((classItem) => {
                      const { date, time } = formatDateTime(classItem.startTime)
                      return (
                        <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{classItem.studentName}</h4>
                              <p className="text-sm text-gray-600">{date} • {time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={classItem.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                              {classItem.status}
                            </Badge>
                            {classItem.meetLink && (
                              <Button size="sm" variant="outline">
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {upcomingClasses.length > 3 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View All Classes
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Availability
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <activity.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Response Rate</span>
                      <span className="text-sm text-gray-600">{stats.responseRate}%</span>
                    </div>
                    <Progress value={stats.responseRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Student Satisfaction</span>
                      <span className="text-sm text-gray-600">{stats.averageRating}/5.0</span>
                    </div>
                    <Progress value={stats.averageRating * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Class Completion</span>
                      <span className="text-sm text-gray-600">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.upcomingClasses}</div>
                      <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingList teacherData={teacherData} onUpdate={fetchTeacherData} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManager teacherData={teacherData} onUpdate={fetchTeacherData} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>Your monthly earnings trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Earnings Chart Placeholder</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">${stats.monthlyEarnings}</div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">${Math.round(stats.monthlyEarnings * 0.88)}</div>
                        <div className="text-sm text-gray-600">Last Month</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">+12%</div>
                        <div className="text-sm text-gray-600">Growth</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>How students interact with your classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Engagement Chart Placeholder</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">94%</div>
                        <div className="text-sm text-gray-600">Attendance Rate</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">4.8</div>
                        <div className="text-sm text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <TeacherProfile teacherData={teacherData} onUpdate={fetchTeacherData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}