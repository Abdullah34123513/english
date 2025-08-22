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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Confirm Booking & Payment
              </span>
            </DialogTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              Secure Payment
            </Badge>
          </div>
          <DialogDescription className="text-base text-gray-600">
            Complete your booking in 3 simple steps
          </DialogDescription>
          
          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeTab === "instructions" 
                    ? "bg-blue-600 text-white" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "instructions" ? "1" : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <span className={`text-sm font-medium ${
                  activeTab === "instructions" ? "text-blue-600" : "text-green-600"
                }`}>
                  Review Details
                </span>
              </div>
              
              <div className="flex-1 mx-4">
                <Progress value={getProgressValue()} className="h-2" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  activeTab === "payment" ? "text-blue-600" : "text-gray-400"
                }`}>
                  Payment
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeTab === "payment" 
                    ? "bg-blue-600 text-white" 
                    : activeTab === "instructions" 
                    ? "bg-gray-300 text-gray-600" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "payment" ? "2" : activeTab === "instructions" ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
              </div>
              
              <div className="flex-1 mx-4">
                <Progress value={getProgressValue()} className="h-2" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  activeTab === "complete" ? "text-blue-600" : "text-gray-400"
                }`}>
                  Complete
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeTab === "complete" 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {activeTab === "complete" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-[calc(95vh-200px)] overflow-hidden">
          {/* Enhanced Booking Summary */}
          <div className="xl:col-span-2">
            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    Booking Summary
                  </span>
                  <Shield className="h-5 w-5 text-blue-200" />
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Review your booking details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Teacher Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Teacher</p>
                      <p className="text-lg font-semibold text-gray-900">{bookingData.teacherName}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Date & Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(bookingData.date)}
                      </p>
                      <p className="text-sm text-gray-600">at {bookingData.timeSlot}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-xl">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{bookingData.duration} minutes</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {formatPrice(bookingData.price)}
                      </p>
                      <p className="text-xs text-gray-500">Secure bank transfer</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center pt-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                    <Clock className="h-3 w-3 mr-2" />
                    Pending Payment
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Instructions and Form */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger 
                  value="instructions" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Payment Instructions
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upload Payment Proof
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="instructions" className="space-y-6 p-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Please complete the bank transfer and then upload your payment proof in the next tab.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        Bank Transfer Details
                      </h3>
                      
                      <div className="space-y-4">
                        {BANK_ACCOUNTS.map((bank, index) => (
                          <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{bank.logo}</span>
                                  <span className="text-lg font-semibold">{bank.name}</span>
                                </div>
                                <Badge variant="outline" className="border-green-200 text-green-700">
                                  Recommended
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border font-mono text-sm">
                                      {bank.accountNumber}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(bank.accountNumber, `account-${index}`)}
                                      className="shrink-0"
                                    >
                                      {copiedField === `account-${index}` ? 
                                        <CheckCircle2 className="h-4 w-4" /> : 
                                        <Copy className="h-4 w-4" />
                                      }
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">IBAN</Label>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border font-mono text-sm">
                                      {bank.iban}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(bank.iban, `iban-${index}`)}
                                      className="shrink-0"
                                    >
                                      {copiedField === `iban-${index}` ? 
                                        <CheckCircle2 className="h-4 w-4" /> : 
                                        <Copy className="h-4 w-4" />
                                      }
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Account Holder</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {bank.accountHolder}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Branch</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {bank.branch}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Payment Instructions:
                      </h4>
                      <ol className="space-y-3">
                        {[
                          `Transfer the exact amount (${formatPrice(bookingData.price)}) to any of the above bank accounts`,
                          "Use your booking reference as the payment description",
                          "Take a screenshot or photo of the transaction confirmation",
                          "Switch to 'Upload Payment Proof' tab and submit your payment details",
                          "Wait for admin approval (usually within 24 hours)"
                        ].map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="bg-white/20 backdrop-blur-sm w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm text-white/90">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Button 
                      onClick={() => setActiveTab("payment")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                      size="lg"
                    >
                      I've Made the Payment - Continue to Upload
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6 p-6">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Please fill in all the payment details accurately to ensure quick approval.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">
                          Transaction ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="transactionId"
                          value={paymentInfo.transactionId}
                          onChange={(e) => setPaymentInfo({...paymentInfo, transactionId: e.target.value})}
                          placeholder="Enter transaction reference number"
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
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
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">
                          Payment Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentInfo.paymentDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentDate: e.target.value})}
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                          Bank Name <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="bankName"
                          value={paymentInfo.bankName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                        Your Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        value={paymentInfo.accountNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                        placeholder="Enter your bank account number"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt" className="text-sm font-medium text-gray-700">
                        Upload Receipt/Proof of Payment
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">
                          Upload screenshot or photo of transaction confirmation
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Supported formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="border-0 bg-white"
                        />
                        {receiptFile && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {receiptFile.name} selected
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={paymentInfo.notes}
                        onChange={(e) => setPaymentInfo({...paymentInfo, notes: e.target.value})}
                        placeholder="Any additional information about the payment..."
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        size="lg"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}