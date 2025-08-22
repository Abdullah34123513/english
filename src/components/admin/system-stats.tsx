"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, UserCheck, UserX, Star, Calendar, DollarSign, Activity, BookOpen } from "lucide-react"

interface SystemStatsProps {
  adminData: any
  onUpdate: () => void
}

export function SystemStats({ adminData, onUpdate }: SystemStatsProps) {
  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>
            Key metrics and statistics for the English learning platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{adminData?.totalUsers || 0}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{adminData?.activeUsers || 0}</div>
              <div className="text-sm text-green-600">Active Users</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{adminData?.totalTeachers || 0}</div>
              <div className="text-sm text-purple-600">Total Teachers</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{adminData?.totalBookings || 0}</div>
              <div className="text-sm text-orange-600">Total Bookings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
            <CardDescription>
              Latest users who joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminData?.recentUsers?.length > 0 ? (
                adminData.recentUsers.map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant={user.role === "TEACHER" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent user registrations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest class bookings on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminData?.recentBookings?.length > 0 ? (
                adminData.recentBookings.map((booking: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {booking.student?.user?.name} → {booking.teacher?.user?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={
                      booking.status === "CONFIRMED" ? "default" :
                      booking.status === "PENDING" ? "secondary" :
                      booking.status === "COMPLETED" ? "outline" : "destructive"
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>
            System performance and user engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">4.7</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">+12%</div>
              <div className="text-sm text-muted-foreground">Monthly Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}