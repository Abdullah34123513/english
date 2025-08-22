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
import { Progress } from "@/components/ui/progress"
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
  DollarSign,
  ArrowRight,
  Copy,
  Shield,
  Smartphone,
  FileText,
  CheckCircle2,
  Circle,
  Loader2
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
    branch: "Riyadh Main Branch",
    logo: "🏦"
  },
  {
    name: "Saudi National Bank (SNB)",
    accountNumber: "SA9876543210987654321098",
    iban: "SA23SNBKHO0000987654321098",
    accountHolder: "English Learning Platform",
    branch: "Jeddah Commercial Branch",
    logo: "🏛️"
  },
  {
    name: "Riyad Bank",
    accountNumber: "SA5555666677778888999900",
    iban: "SA34RIYAD0000555566667778888",
    accountHolder: "English Learning Platform",
    branch: "Dammam Industrial Branch",
    logo: "🏢"
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
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
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

  const getProgressValue = () => {
    if (activeTab === "instructions") return 33
    if (activeTab === "payment") return 66
    return 100
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <DialogHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center space-x-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Confirm Booking & Payment
              </span>
            </DialogTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 w-fit">
              Secure Payment
            </Badge>
          </div>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Complete your booking in 3 simple steps
          </DialogDescription>
          
          {/* Progress Indicator */}
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  activeTab === "instructions" 
                    ? "bg-blue-600 text-white" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "instructions" ? "1" : <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  activeTab === "instructions" ? "text-blue-600" : "text-green-600"
                }`}>
                  Review Details
                </span>
              </div>
              
              <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
                <Progress value={getProgressValue()} className="h-2" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs sm:text-sm font-medium ${
                  activeTab === "payment" ? "text-blue-600" : "text-gray-400"
                }`}>
                  Payment
                </span>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  activeTab === "payment" 
                    ? "bg-blue-600 text-white" 
                    : activeTab === "instructions" 
                    ? "bg-gray-300 text-gray-600" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "payment" ? "2" : activeTab === "instructions" ? <Circle className="h-3 w-3 sm:h-4 sm:w-4" /> : <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
              </div>
              
              <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
                <Progress value={getProgressValue()} className="h-2" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs sm:text-sm font-medium ${
                  activeTab === "complete" ? "text-blue-600" : "text-gray-400"
                }`}>
                  Complete
                </span>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  activeTab === "complete" 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {activeTab === "complete" ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Circle className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
              </div>
            </div>
            {/* Mobile progress bar */}
            <div className="sm:hidden mt-2">
              <Progress value={getProgressValue()} className="h-2" />
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 h-[calc(90vh-180px)] sm:h-[calc(95vh-200px)] overflow-hidden">
          {/* Enhanced Booking Summary */}
          <div className="lg:col-span-2">
            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-base sm:text-lg">Booking Summary</span>
                  </span>
                  <Shield className="h-5 w-5 text-blue-200" />
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Review your booking details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Teacher Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 rounded-xl">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Teacher</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{bookingData.teacherName}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 sm:p-3 rounded-xl">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Date & Time</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {formatDate(bookingData.date)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">at {bookingData.timeSlot}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 sm:p-3 rounded-xl">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">{bookingData.duration} minutes</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border-2 border-amber-200">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 sm:p-3 rounded-xl">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600">
                        {formatPrice(bookingData.price)}
                      </p>
                      <p className="text-xs text-gray-500">Secure bank transfer</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center pt-2 sm:pt-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 sm:px-4 py-1 sm:py-2">
                    <Clock className="h-3 w-3 mr-2" />
                    <span className="text-xs sm:text-sm">Pending Payment</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Instructions and Form */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger 
                  value="instructions" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Payment Instructions</span>
                  <span className="sm:hidden">Instructions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Upload Payment Proof</span>
                  <span className="sm:hidden">Payment</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="instructions" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Please complete the bank transfer and then upload your payment proof in the next tab.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                        <span className="text-sm sm:text-base">Bank Transfer Details</span>
                      </h3>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {BANK_ACCOUNTS.map((bank, index) => (
                          <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-3 sm:pb-4">
                              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                  <span className="text-xl sm:text-2xl">{bank.logo}</span>
                                  <span className="text-base sm:text-lg font-semibold">{bank.name}</span>
                                </div>
                                <Badge variant="outline" className="border-green-200 text-green-700 w-fit text-xs">
                                  Recommended
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Account Number</Label>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-50 p-2 sm:p-3 rounded-lg border font-mono text-xs sm:text-sm truncate">
                                      {bank.accountNumber}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(bank.accountNumber, `account-${index}`)}
                                      className="shrink-0 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                                    >
                                      {copiedField === `account-${index}` ? 
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                      }
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium text-gray-700">IBAN</Label>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-50 p-2 sm:p-3 rounded-lg border font-mono text-xs sm:text-sm truncate">
                                      {bank.iban}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(bank.iban, `iban-${index}`)}
                                      className="shrink-0 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                                    >
                                      {copiedField === `iban-${index}` ? 
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                      }
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Account Holder</Label>
                                  <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg truncate">
                                    {bank.accountHolder}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Branch</Label>
                                  <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg truncate">
                                    {bank.branch}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-xl text-white">
                      <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="text-sm sm:text-base">Payment Instructions:</span>
                      </h4>
                      <ol className="space-y-2 sm:space-y-3">
                        {[
                          `Transfer the exact amount (${formatPrice(bookingData.price)}) to any of the above bank accounts`,
                          "Use your booking reference as the payment description",
                          "Take a screenshot or photo of the transaction confirmation",
                          "Switch to 'Upload Payment Proof' tab and submit your payment details",
                          "Wait for admin approval (usually within 24 hours)"
                        ].map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                            <div className="bg-white/20 backdrop-blur-sm w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium mt-0.5 shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-xs sm:text-sm text-white/90 leading-relaxed">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Button 
                      onClick={() => setActiveTab("payment")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
                      size="lg"
                    >
                      <span className="hidden sm:inline">I've Made the Payment - Continue to Upload</span>
                      <span className="sm:hidden">Continue to Upload</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      Please fill in all the payment details accurately to ensure quick approval.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="transactionId" className="text-xs sm:text-sm font-medium text-gray-700">
                          Transaction ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="transactionId"
                          value={paymentInfo.transactionId}
                          onChange={(e) => setPaymentInfo({...paymentInfo, transactionId: e.target.value})}
                          placeholder="Enter transaction reference number"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs sm:text-sm font-medium text-gray-700">
                          Amount (SAR) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={paymentInfo.amount}
                          onChange={(e) => setPaymentInfo({...paymentInfo, amount: parseFloat(e.target.value)})}
                          placeholder="0.00"
                          step="0.01"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentDate" className="text-xs sm:text-sm font-medium text-gray-700">
                          Payment Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentInfo.paymentDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentDate: e.target.value})}
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-xs sm:text-sm font-medium text-gray-700">
                          Bank Name <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="bankName"
                          value={paymentInfo.bankName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      <Label htmlFor="accountNumber" className="text-xs sm:text-sm font-medium text-gray-700">
                        Your Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        value={paymentInfo.accountNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                        placeholder="Enter your bank account number"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt" className="text-xs sm:text-sm font-medium text-gray-700">
                        Upload Receipt/Proof of Payment
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Upload screenshot or photo of transaction confirmation
                        </p>
                        <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                          Supported formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="border-0 bg-white text-sm"
                        />
                        {receiptFile && (
                          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs sm:text-sm text-green-700 flex items-center">
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              <span className="truncate">{receiptFile.name} selected</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs sm:text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={paymentInfo.notes}
                        onChange={(e) => setPaymentInfo({...paymentInfo, notes: e.target.value})}
                        placeholder="Any additional information about the payment..."
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                        size="lg"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                            <span className="text-xs sm:text-sm">Submitting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="text-xs sm:text-sm">Submit Payment Proof</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}