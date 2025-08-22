"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  BookOpen, 
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  Image as ImageIcon
} from "lucide-react"
import { BookingManagement } from "@/components/admin/booking-management"
import { PaymentApproval } from "@/components/admin/payment-approval"

interface DashboardStats {
  totalBookings: number
  pendingPayments: number
  completedBookings: number
  totalRevenue: number
  activeTeachers: number
  activeStudents: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingPayments: 0,
    completedBookings: 0,
    totalRevenue: 0,
    activeTeachers: 0,
    activeStudents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse] = await Promise.all([
        fetch("/api/admin/stats")
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  if (!session || session.user.role !== "ADMIN") {
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
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage platform operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                Administrator
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="hover:bg-blue-50"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Platform Administration</h2>
            <p className="text-lg text-white/90 mb-4">
              Manage bookings, payments, and monitor platform performance
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Live Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-yellow-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Payments</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <CreditCard className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
              <p className="text-xs text-gray-600">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-SA', {
                  style: 'currency',
                  currency: 'SAR'
                }).format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600">Approved payments</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Users</CardTitle>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.activeTeachers + stats.activeStudents}
              </div>
              <p className="text-xs text-gray-600">
                {stats.activeTeachers} teachers, {stats.activeStudents} students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="payments" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Approvals
              {stats.pendingPayments > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {stats.pendingPayments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Calendar className="h-4 w-4 mr-2" />
              Booking Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <PaymentApproval onUpdate={fetchDashboardData} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement onUpdate={fetchDashboardData} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>
                    Track platform revenue and payment trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Analytics coming soon</p>
                      <p className="text-sm">Detailed revenue analytics will be available here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    User Activity
                  </CardTitle>
                  <CardDescription>
                    Monitor teacher and student engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Activity metrics coming soon</p>
                      <p className="text-sm">User engagement analytics will be available here</p>
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