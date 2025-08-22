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
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Download,
  Building,
  Calendar,
  DollarSign,
  User,
  Clock,
  Image as ImageIcon,
  Search,
  Filter
} from "lucide-react"

interface Payment {
  id: string
  transactionId: string
  amount: number
  paymentDate: string
  bankName: string
  accountNumber?: string
  receiptImage?: string
  notes?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  booking: {
    id: string
    startTime: string
    endTime: string
    status: string
    teacher: {
      user: {
        name: string
        email: string
      }
    }
    student: {
      user: {
        name: string
        email: string
      }
    }
  }
}

interface PaymentApprovalProps {
  onUpdate: () => void
}

export function PaymentApproval({ onUpdate }: PaymentApprovalProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async (paymentId: string, notes?: string) => {
    setProcessingAction(paymentId)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        await fetchPayments()
        onUpdate()
      }
    } catch (error) {
      console.error("Error approving payment:", error)
    } finally {
      setProcessingAction(null)
      setSelectedPayment(null)
    }
  }

  const handleRejectPayment = async (paymentId: string, reason: string) => {
    setProcessingAction(paymentId)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        await fetchPayments()
        onUpdate()
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
    } finally {
      setProcessingAction(null)
      setSelectedPayment(null)
    }
  }

  const filteredPayments = payments
    .filter(payment => {
      if (statusFilter !== "ALL" && payment.status !== statusFilter) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          payment.transactionId.toLowerCase().includes(searchLower) ||
          payment.booking.teacher.user.name.toLowerCase().includes(searchLower) ||
          payment.booking.student.user.name.toLowerCase().includes(searchLower) ||
          payment.bankName.toLowerCase().includes(searchLower)
        )
      }
      return true
    })

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
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
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
          <h3 className="text-xl font-semibold text-gray-900">Payment Approvals</h3>
          <p className="text-gray-600">Review and approve student payment submissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by transaction ID, name, or bank..."
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
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All Payments</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h4>
              <p className="text-gray-600">
                {statusFilter === "PENDING" 
                  ? "No payments waiting for approval." 
                  : "No payments match your search criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusBadge(payment.status)}
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Transaction ID</Label>
                        <p className="font-medium text-sm">{payment.transactionId}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Amount</Label>
                        <p className="font-medium text-sm text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Bank</Label>
                        <p className="font-medium text-sm flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {payment.bankName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Payment Date</Label>
                        <p className="font-medium text-sm">
                          {new Date(payment.paymentDate).toLocaleDateString('en-SA')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-600">Student</Label>
                        <p className="font-medium text-sm flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {payment.booking.student.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{payment.booking.student.user.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Teacher</Label>
                        <p className="font-medium text-sm flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {payment.booking.teacher.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{payment.booking.teacher.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(payment.booking.startTime)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(payment.booking.startTime).toLocaleTimeString('en-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(payment.booking.endTime).toLocaleTimeString('en-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-600">Student Notes</Label>
                        <p className="text-sm text-gray-700">{payment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {payment.receiptImage && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            View Receipt
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Payment Receipt</DialogTitle>
                            <DialogDescription>
                              Transaction ID: {payment.transactionId}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img 
                              src={payment.receiptImage} 
                              alt="Payment receipt" 
                              className="max-w-full max-h-96 object-contain border rounded-lg"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payment Details</DialogTitle>
                          <DialogDescription>
                            Review payment information before taking action
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Transaction ID</Label>
                              <p className="text-sm text-gray-600">{payment.transactionId}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Amount</Label>
                              <p className="text-sm text-gray-600">{formatCurrency(payment.amount)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Bank Name</Label>
                              <p className="text-sm text-gray-600">{payment.bankName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Payment Date</Label>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.paymentDate).toLocaleDateString('en-SA')}
                              </p>
                            </div>
                          </div>

                          {payment.accountNumber && (
                            <div>
                              <Label className="text-sm font-medium">Student Account</Label>
                              <p className="text-sm text-gray-600">{payment.accountNumber}</p>
                            </div>
                          )}

                          {payment.notes && (
                            <div>
                              <Label className="text-sm font-medium">Notes</Label>
                              <p className="text-sm text-gray-600">{payment.notes}</p>
                            </div>
                          )}

                          <div className="flex space-x-2 pt-4">
                            {payment.status === "PENDING" && (
                              <>
                                <Button
                                  onClick={() => handleApprovePayment(payment.id)}
                                  disabled={processingAction === payment.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {processingAction === payment.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => setSelectedPayment(payment)}
                                  disabled={processingAction === payment.id}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {payment.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() => handleApprovePayment(payment.id)}
                          disabled={processingAction === payment.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingAction === payment.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => setSelectedPayment(payment)}
                          disabled={processingAction === payment.id}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this payment is being rejected..."
                rows={3}
                onChange={(e) => {
                  if (selectedPayment) {
                    setSelectedPayment({
                      ...selectedPayment,
                      notes: e.target.value
                    })
                  }
                }}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPayment(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPayment?.notes) {
                    handleRejectPayment(selectedPayment.id, selectedPayment.notes)
                  }
                }}
                disabled={!selectedPayment?.notes || processingAction === selectedPayment?.id}
                variant="destructive"
                className="flex-1"
              >
                {processingAction === selectedPayment?.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}