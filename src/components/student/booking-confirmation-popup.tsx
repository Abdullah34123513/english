"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValidationError, FunctionError, handleUnknownError } from "@/lib/custom-error"
import { createLogger } from "@/lib/logger"
import { 
  CreditCard, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building,
  Calendar,
  User,
  DollarSign
} from "lucide-react"

const logger = createLogger('BookingConfirmationPopup')

interface BookingConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  bookingData: {
    teacherId: string
    teacherName: string
    date: Date
    timeSlot: string
    duration: number
    price: number
    studentId: string
  }
  onConfirm: (paymentInfo: PaymentInfo) => void
}

interface PaymentInfo {
  transactionId: string
  amount: number
  paymentDate: string
  bankName: string
  accountNumber: string
  receiptImage?: string
  notes?: string
}

const BANK_ACCOUNTS = [
  {
    name: "Al Rajhi Bank",
    accountNumber: "SA1234567890123456789012",
    iban: "SA52ALRAHI0000123456789012",
    accountHolder: "English Learning Platform",
    branch: "Riyadh Main Branch"
  },
  {
    name: "Saudi National Bank (SNB)",
    accountNumber: "SA9876543210987654321098",
    iban: "SA23SNBKHO0000987654321098",
    accountHolder: "English Learning Platform",
    branch: "Jeddah Commercial Branch"
  },
  {
    name: "Riyad Bank",
    accountNumber: "SA5555666677778888999900",
    iban: "SA34RIYAD0000555566667778888",
    accountHolder: "English Learning Platform",
    branch: "Dammam Industrial Branch"
  }
]

export function BookingConfirmationPopup({ 
  isOpen, 
  onClose, 
  bookingData, 
  onConfirm 
}: BookingConfirmationPopupProps) {
  const [activeTab, setActiveTab] = useState("instructions")
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    transactionId: "",
    amount: bookingData.price,
    paymentDate: new Date().toISOString().split('T')[0],
    bankName: "",
    accountNumber: "",
    notes: ""
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Starting payment submission")
      console.log("Payment info state:", paymentInfo)
      console.log("Receipt file:", receiptFile)
      
      // Validate required fields
      if (!paymentInfo.transactionId) {
        throw new ValidationError("Transaction ID is required", { paymentInfo, receiptFile })
      }
      
      if (!paymentInfo.amount) {
        throw new ValidationError("Amount is required", { paymentInfo, receiptFile })
      }
      
      if (!paymentInfo.paymentDate) {
        throw new ValidationError("Payment date is required", { paymentInfo, receiptFile })
      }
      
      if (!paymentInfo.bankName) {
        throw new ValidationError("Bank name is required", { paymentInfo, receiptFile })
      }

      // Upload receipt image if provided
      let receiptImageUrl = ""
      if (receiptFile) {
        console.log("Uploading receipt file...")
        const formData = new FormData()
        formData.append("file", receiptFile)
        
        const uploadResponse = await fetch("/api/upload/receipt", {
          method: "POST",
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          receiptImageUrl = uploadData.url
          console.log("Receipt uploaded successfully:", receiptImageUrl)
        } else {
          console.log("Receipt upload failed, continuing without it")
        }
      }

      // Submit payment information
      const completePaymentInfo: PaymentInfo = {
        ...paymentInfo,
        receiptImage: receiptImageUrl
      }

      console.log("Calling onConfirm with:", completePaymentInfo)
      
      if (typeof onConfirm !== 'function') {
        throw new FunctionError("onConfirm is not a function", { onConfirm, completePaymentInfo })
      }
      
      await onConfirm(completePaymentInfo)
      console.log("Payment confirmation completed")
      
      onClose()
    } catch (error) {
      const safeError = handleUnknownError(error)
      logger.logPaymentError("Error submitting payment", safeError, {
        paymentInfo: paymentInfo,
        receiptFile: receiptFile,
        bookingData: bookingData
      })
      
      // Re-throw the error so the UI can handle it
      throw safeError
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Confirm Booking & Payment</span>
          </DialogTitle>
          <DialogDescription>
            Complete your booking by following the payment instructions below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Teacher</p>
                    <p className="text-sm text-gray-600">{bookingData.teacherName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(bookingData.date)} at {bookingData.timeSlot}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-gray-600">{bookingData.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(bookingData.price)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Badge variant="secondary" className="w-full justify-center">
                    Pending Payment
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Instructions and Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
                <TabsTrigger value="payment">Upload Payment Proof</TabsTrigger>
              </TabsList>

              <TabsContent value="instructions" className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete the bank transfer and then upload your payment proof in the next tab.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bank Transfer Details</h3>
                  
                  {BANK_ACCOUNTS.map((bank, index) => (
                    <Card key={index} className="border-0 bg-gradient-to-r from-white to-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base">
                          <Building className="h-4 w-4" />
                          <span>{bank.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Account Number</Label>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                              {bank.accountNumber}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">IBAN</Label>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                              {bank.iban}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Account Holder</Label>
                          <p className="text-sm">{bank.accountHolder}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Branch</Label>
                          <p className="text-sm">{bank.branch}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Transfer the exact amount ({formatPrice(bookingData.price)}) to any of the above bank accounts</li>
                    <li>Use your booking reference as the payment description</li>
                    <li>Take a screenshot or photo of the transaction confirmation</li>
                    <li>Switch to "Upload Payment Proof" tab and submit your payment details</li>
                    <li>Wait for admin approval (usually within 24 hours)</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => setActiveTab("payment")}
                  className="w-full"
                >
                  I've Made the Payment - Continue to Upload
                </Button>
              </TabsContent>

              <TabsContent value="payment">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fill in all the payment details accurately to ensure quick approval.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID *</Label>
                      <Input
                        id="transactionId"
                        value={paymentInfo.transactionId}
                        onChange={(e) => setPaymentInfo({...paymentInfo, transactionId: e.target.value})}
                        placeholder="Enter transaction reference number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (SAR) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentInfo.amount}
                        onChange={(e) => setPaymentInfo({...paymentInfo, amount: parseFloat(e.target.value)})}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentInfo.paymentDate}
                        onChange={(e) => setPaymentInfo({...paymentInfo, paymentDate: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <select
                        id="bankName"
                        value={paymentInfo.bankName}
                        onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select your bank</option>
                        {BANK_ACCOUNTS.map(bank => (
                          <option key={bank.name} value={bank.name}>{bank.name}</option>
                        ))}
                        <option value="Other">Other Bank</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Your Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={paymentInfo.accountNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                      placeholder="Enter your bank account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt">Upload Receipt/Proof of Payment</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload screenshot or photo of transaction confirmation
                      </p>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="border-0"
                      />
                      {receiptFile && (
                        <p className="text-sm text-green-600 mt-2">
                          {receiptFile.name} selected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={paymentInfo.notes}
                      onChange={(e) => setPaymentInfo({...paymentInfo, notes: e.target.value})}
                      placeholder="Any additional information about the payment..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit Payment Proof
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}