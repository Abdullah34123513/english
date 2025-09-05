"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Clock,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  BookOpen
} from "lucide-react"

interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number }>
  studentGrowth: Array<{ month: string; students: number }>
  classCompletion: Array<{ subject: string; completion: number }>
  ratingDistribution: Array<{ rating: number; count: number }>
  topSubjects: Array<{ subject: string; bookings: number }>
  performanceMetrics: {
    totalEarnings: number
    averageRating: number
    totalStudents: number
    completionRate: number
    responseRate: number
    classesTaught: number
  }
}

export default function TeacherAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "TEACHER") {
      router.push("/auth/signin")
      return
    }

    fetchAnalyticsData()
  }, [session, status, router])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch("/api/teacher/profile")
      if (response.ok) {
        const data = await response.json()
        const bookings = data.bookings || []
        const reviews = data.reviews || []
        
        // Calculate monthly revenue
        const monthlyRevenueData = []
        const currentYear = new Date().getFullYear()
        for (let month = 0; month < 6; month++) {
          const monthDate = new Date(currentYear, month, 1)
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
          
          const revenue = bookings.reduce((total: number, booking: any) => {
            const approvedPayment = booking.payments?.find((p: any) => p.status === 'APPROVED')
            if (approvedPayment) {
              const paymentDate = new Date(approvedPayment.paymentDate || approvedPayment.createdAt)
              if (paymentDate.getMonth() === month && paymentDate.getFullYear() === currentYear) {
                return total + approvedPayment.amount
              }
            }
            return total
          }, 0)
          
          monthlyRevenueData.push({ month: monthName, revenue })
        }
        
        // Calculate student growth
        const studentGrowthData = []
        const uniqueStudentsPerMonth = new Map()
        
        bookings.forEach((booking: any) => {
          const bookingDate = new Date(booking.createdAt)
          const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
          
          if (!uniqueStudentsPerMonth.has(monthKey)) {
            uniqueStudentsPerMonth.set(monthKey, new Set())
          }
          uniqueStudentsPerMonth.get(monthKey)?.add(booking.studentId)
        })
        
        for (let month = 0; month < 6; month++) {
          const monthDate = new Date(currentYear, month, 1)
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
          const monthKey = `${currentYear}-${month}`
          
          const students = uniqueStudentsPerMonth.get(monthKey)?.size || 0
          studentGrowthData.push({ month: monthName, students })
        }
        
        // Calculate rating distribution
        const ratingCounts = [0, 0, 0, 0, 0] // 1-5 stars
        reviews.forEach((review: any) => {
          if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++
          }
        })
        
        const ratingDistribution = [
          { rating: 5, count: ratingCounts[4] },
          { rating: 4, count: ratingCounts[3] },
          { rating: 3, count: ratingCounts[2] },
          { rating: 2, count: ratingCounts[1] },
          { rating: 1, count: ratingCounts[0] }
        ]
        
        // Calculate performance metrics
        const totalEarnings = bookings.reduce((total: number, booking: any) => {
          const approvedPayment = booking.payments?.find((p: any) => p.status === 'APPROVED')
          return total + (approvedPayment?.amount || 0)
        }, 0)
        
        const averageRating = reviews.length > 0 
          ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 0
        
        const uniqueStudents = new Set(bookings.map((b: any) => b.studentId)).size
        const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED').length
        const completionRate = bookings.length > 0 
          ? Number(((completedBookings / bookings.length) * 100).toFixed(1))
          : 0
        
        const performanceMetrics = {
          totalEarnings,
          averageRating,
          totalStudents: uniqueStudents,
          completionRate,
          responseRate: 95, // Mock for now
          classesTaught: completedBookings
        }
        
        // Mock class completion by subject (since we don't have subject data in bookings)
        const classCompletion = [
          { subject: "Business English", completion: Math.min(95, completionRate + 5) },
          { subject: "IELTS Preparation", completion: Math.min(88, completionRate - 2) },
          { subject: "Conversation Practice", completion: Math.min(92, completionRate + 2) },
          { subject: "Academic Writing", completion: Math.min(85, completionRate - 5) }
        ]
        
        // Mock top subjects (since we don't have subject data)
        const topSubjects = [
          { subject: "Business English", bookings: Math.floor(bookings.length * 0.3) },
          { subject: "IELTS Preparation", bookings: Math.floor(bookings.length * 0.25) },
          { subject: "Conversation Practice", bookings: Math.floor(bookings.length * 0.2) },
          { subject: "Academic Writing", bookings: Math.floor(bookings.length * 0.15) },
          { subject: "Pronunciation", bookings: Math.floor(bookings.length * 0.1) }
        ]
        
        setAnalyticsData({
          monthlyRevenue: monthlyRevenueData,
          studentGrowth: studentGrowthData,
          classCompletion,
          ratingDistribution,
          topSubjects,
          performanceMetrics
        })
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER" || !analyticsData) {
    return null
  }

  const { performanceMetrics, monthlyRevenue, studentGrowth, classCompletion, ratingDistribution, topSubjects } = analyticsData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">Track your teaching performance and growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${performanceMetrics.totalEarnings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{performanceMetrics.averageRating}</div>
              <div className="flex items-center text-xs text-gray-600">
                <Users className="h-3 w-3 mr-1" />
                {performanceMetrics.totalStudents} students
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Classes Taught</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{performanceMetrics.classesTaught}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% growth
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{performanceMetrics.completionRate}%</div>
              <Progress value={performanceMetrics.completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Your earnings over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(item.revenue / Math.max(...monthlyRevenue.map(r => r.revenue))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Revenue Insights</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Best Month</span>
                    </div>
                    <Badge variant="secondary">June - $4,100</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Average Monthly</span>
                    </div>
                    <Badge variant="secondary">${Math.round(performanceMetrics.totalEarnings / 6).toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Growth Rate</span>
                    </div>
                    <Badge variant="secondary">+86% YoY</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Student Growth</CardTitle>
                  <CardDescription>Your student base expansion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentGrowth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.students / Math.max(...studentGrowth.map(s => s.students))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.students} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>How students rate your teaching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ratingDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{item.rating} stars</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${(item.count / Math.max(...ratingDistribution.map(r => r.count))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Class Completion by Subject</CardTitle>
                  <CardDescription>Completion rates across different subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classCompletion.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.subject}</span>
                          <span className="text-sm text-gray-600">{item.completion}%</span>
                        </div>
                        <Progress value={item.completion} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Your teaching effectiveness indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Response Rate</span>
                    </div>
                    <Badge variant="secondary">{performanceMetrics.responseRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Avg. Class Duration</span>
                    </div>
                    <Badge variant="secondary">58 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Student Retention</span>
                    </div>
                    <Badge variant="secondary">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Peak Hours</span>
                    </div>
                    <Badge variant="secondary">2-6 PM</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Top Subjects</CardTitle>
                  <CardDescription>Your most popular teaching subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSubjects.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(item.bookings / Math.max(...topSubjects.map(s => s.bookings))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.bookings} bookings</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Subject Insights</CardTitle>
                  <CardDescription>Performance analysis by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Most Popular</span>
                    </div>
                    <Badge variant="secondary">Business English</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Highest Rated</span>
                    </div>
                    <Badge variant="secondary">IELTS Preparation</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Fastest Growing</span>
                    </div>
                    <Badge variant="secondary">Conversation Practice</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Best Completion</span>
                    </div>
                    <Badge variant="secondary">Business English</Badge>
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