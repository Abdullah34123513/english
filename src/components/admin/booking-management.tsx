"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Video,
  MessageCircle,
  User,
  MapPin
} from "lucide-react"

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "FAILED"
  meetLink?: string
  notes?: string
  createdAt: string
  teacher: {
    user: {
      name: string
      email: string
      image?: string
    }
  }
  student: {
    user: {
      name: string
      email: string
      image?: string
    }
  }
  payment?: {
    id: string
    status: string
    amount: number
    transactionId: string
  }
  review?: {
    id: string
    rating: number
    comment?: string
  }
}

interface BookingManagementProps {
  onUpdate: () => void
}

export function BookingManagement({ onUpdate }: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, meetLink?: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, meetLink }),
      })

      if (response.ok) {
        await fetchBookings()
        onUpdate()
        setSelectedBooking(null)
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const filteredBookings = bookings
    .filter(booking => {
      if (statusFilter !== "ALL" && booking.status !== statusFilter) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          booking.teacher.user.name.toLowerCase().includes(searchLower) ||
          booking.student.user.name.toLowerCase().includes(searchLower) ||
          booking.id.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "NO_SHOW":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case "REFUNDED":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Refunded</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Booking Management</h3>
          <p className="text-gray-600">Manage and monitor all platform bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student, teacher, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h4>
              <p className="text-gray-600">
                No bookings match your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                      <span className="text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Booking ID</Label>
                        <p className="font-medium text-sm">{booking.id}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Date & Time</Label>
                        <p className="font-medium text-sm">
                          {new Date(booking.startTime).toLocaleDateString('en-SA')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString('en-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(booking.endTime).toLocaleTimeString('en-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Duration</Label>
                        <p className="font-medium text-sm">
                          {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Payment</Label>
                        <p className="font-medium text-sm">
                          {booking.payment ? formatCurrency(booking.payment.amount) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Student</Label>
                        <p className="font-medium text-sm flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {booking.student.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{booking.student.user.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Teacher</Label>
                        <p className="font-medium text-sm flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {booking.teacher.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{booking.teacher.user.email}</p>
                      </div>
                    </div>

                    {booking.meetLink && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <Label className="text-xs text-gray-600">Meeting Link</Label>
                        <a 
                          href={booking.meetLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          {booking.meetLink}
                        </a>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-600">Notes</Label>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {booking.review && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-600">Student Review</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < booking.review.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {booking.review.rating}/5
                          </span>
                        </div>
                        {booking.review.comment && (
                          <p className="text-sm text-gray-700 mt-1">"{booking.review.comment}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>
                            Review booking information and manage status
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Booking ID</Label>
                              <p className="text-sm text-gray-600">{booking.id}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div>{getStatusBadge(booking.status)}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Start Time</Label>
                              <p className="text-sm text-gray-600">{formatDate(booking.startTime)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">End Time</Label>
                              <p className="text-sm text-gray-600">{formatDate(booking.endTime)}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Student</Label>
                            <p className="text-sm text-gray-600">{booking.student.user.name} ({booking.student.user.email})</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Teacher</Label>
                            <p className="text-sm text-gray-600">{booking.teacher.user.name} ({booking.teacher.user.email})</p>
                          </div>

                          {booking.payment && (
                            <div>
                              <Label className="text-sm font-medium">Payment</Label>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(booking.payment.amount)} - {booking.payment.transactionId}
                              </p>
                            </div>
                          )}

                          <div>
                            <Label className="text-sm font-medium">Meeting Link</Label>
                            <Input
                              value={booking.meetLink || ""}
                              onChange={(e) => {
                                if (selectedBooking) {
                                  setSelectedBooking({
                                    ...selectedBooking,
                                    meetLink: e.target.value
                                  })
                                }
                              }}
                              placeholder="Enter Google Meet link..."
                            />
                          </div>

                          <div className="flex space-x-2 pt-4">
                            {booking.status === "PENDING" && (
                              <Button
                                onClick={() => updateBookingStatus(booking.id, "CONFIRMED", selectedBooking?.meetLink)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <>
                                <Button
                                  onClick={() => updateBookingStatus(booking.id, "COMPLETED", selectedBooking?.meetLink)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </Button>
                                <Button
                                  onClick={() => updateBookingStatus(booking.id, "NO_SHOW", selectedBooking?.meetLink)}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  No Show
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => updateBookingStatus(booking.id, "CANCELLED", selectedBooking?.meetLink)}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {booking.status === "PENDING" && (
                      <Button
                        onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}