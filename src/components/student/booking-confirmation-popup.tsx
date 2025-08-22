"use client"

import { useState, useEffect, useRef } from "react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  Loader2,
  Info,
  HelpCircle,
  X,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Star,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Timer,
  MapPin,
  Phone,
  Mail,
  Camera,
  Image as ImageIcon,
  File,
  Trash2,
  Plus,
  BarChart3
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

interface FormErrors {
  transactionId?: string
  amount?: string
  paymentDate?: string
  bankName?: string
  accountNumber?: string
}

interface BankAccount {
  name: string
  accountNumber: string
  iban: string
  accountHolder: string
  branch: string
  logo: string
  rating?: number
  features?: string[]
  processingTime?: string
}

interface FileUpload {
  file: File
  preview: string
  id: string
  uploadProgress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
}

interface AnimationState {
  isAnimating: boolean
  animationType: 'success' | 'error' | 'loading' | null
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    name: "Al Rajhi Bank",
    accountNumber: "SA1234567890123456789012",
    iban: "SA52ALRAHI0000123456789012",
    accountHolder: "English Learning Platform",
    branch: "Riyadh Main Branch",
    logo: "🏦",
    rating: 4.8,
    features: ["24/7 Processing", "Instant Confirmation", "Mobile App"],
    processingTime: "5-10 minutes"
  },
  {
    name: "Saudi National Bank (SNB)",
    accountNumber: "SA9876543210987654321098",
    iban: "SA23SNBKHO0000987654321098",
    accountHolder: "English Learning Platform",
    branch: "Jeddah Commercial Branch",
    logo: "🏛️",
    rating: 4.6,
    features: ["Fast Processing", "Online Banking", "Customer Support"],
    processingTime: "10-15 minutes"
  },
  {
    name: "Riyad Bank",
    accountNumber: "SA5555666677778888999900",
    iban: "SA34RIYAD0000555566667778888",
    accountHolder: "English Learning Platform",
    branch: "Dammam Industrial Branch",
    logo: "🏢",
    rating: 4.5,
    features: ["Quick Transfer", "Digital Services", "Multi-currency"],
    processingTime: "15-20 minutes"
  }
]

const FAQ_ITEMS = [
  {
    question: "How long does payment verification take?",
    answer: "Payment verification typically takes 5-20 minutes during business hours. You'll receive a confirmation email once your payment is verified."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept bank transfers from any Saudi bank. You can use online banking, mobile banking apps, or visit your bank branch."
  },
  {
    question: "Can I modify my booking after payment?",
    answer: "Yes, you can modify your booking up to 24 hours before the scheduled lesson. Contact our support team for assistance."
  },
  {
    question: "What if my payment fails?",
    answer: "If your payment fails, you'll receive a notification. You can retry the payment or contact our support team for assistance."
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
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [expandedBank, setExpandedBank] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    animationType: null
  })
  const [showBankComparison, setShowBankComparison] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // Real-time validation
  useEffect(() => {
    validateForm()
  }, [paymentInfo])

  const validateForm = () => {
    const errors: FormErrors = {}
    
    if (!paymentInfo.transactionId.trim()) {
      errors.transactionId = "Transaction ID is required"
    } else if (paymentInfo.transactionId.length < 3) {
      errors.transactionId = "Transaction ID must be at least 3 characters"
    }
    
    if (!paymentInfo.amount || paymentInfo.amount <= 0) {
      errors.amount = "Amount must be greater than 0"
    } else if (paymentInfo.amount !== bookingData.price) {
      errors.amount = `Amount must be exactly ${formatPrice(bookingData.price)}`
    }
    
    if (!paymentInfo.paymentDate) {
      errors.paymentDate = "Payment date is required"
    } else {
      const paymentDate = new Date(paymentInfo.paymentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (paymentDate < today) {
        errors.paymentDate = "Payment date cannot be in the past"
      }
    }
    
    if (!paymentInfo.bankName) {
      errors.bankName = "Please select a bank"
    }
    
    if (paymentInfo.accountNumber && paymentInfo.accountNumber.length < 8) {
      errors.accountNumber = "Account number must be at least 8 characters"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(Array.from(files))
    }
  }

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size must be less than 10MB")
        return
      }
      
      const fileUpload: FileUpload = {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        id: Math.random().toString(36).substr(2, 9),
        uploadProgress: 0,
        status: 'pending'
      }
      
      setFileUploads(prev => [...prev, fileUpload])
    })
  }

  const removeFile = (id: string) => {
    setFileUploads(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setAnimationState({ isAnimating: true, animationType: 'success' })
      setTimeout(() => {
        setCopiedField(null)
        setAnimationState({ isAnimating: false, animationType: null })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      setAnimationState({ isAnimating: true, animationType: 'error' })
      setTimeout(() => setAnimationState({ isAnimating: false, animationType: null }), 2000)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(Array.from(files))
    }
  }

  const simulateUpload = (fileId: string) => {
    setFileUploads(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as const } : f
    ))
    
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFileUploads(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'success' as const, uploadProgress: 100 } : f
        ))
      } else {
        setFileUploads(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploadProgress: progress } : f
        ))
      }
    }, 200)
  }

  const selectBank = (bank: BankAccount) => {
    setSelectedBank(bank)
    setPaymentInfo(prev => ({ ...prev, bankName: bank.name }))
    setExpandedBank(bank.name)
    setAnimationState({ isAnimating: true, animationType: 'success' })
    setTimeout(() => setAnimationState({ isAnimating: false, animationType: null }), 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setAnimationState({ isAnimating: true, animationType: 'error' })
      setTimeout(() => setAnimationState({ isAnimating: false, animationType: null }), 2000)
      return
    }
    
    setIsSubmitting(true)
    setAnimationState({ isAnimating: true, animationType: 'loading' })

    try {
      console.log("Starting payment submission")
      console.log("Payment info state:", paymentInfo)
      console.log("File uploads:", fileUploads)
      
      // Upload files
      const receiptUrls: string[] = []
      for (const fileUpload of fileUploads) {
        if (fileUpload.status === 'pending') {
          simulateUpload(fileUpload.id)
          
          // Simulate upload delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // In real implementation, upload to server
          const formData = new FormData()
          formData.append("file", fileUpload.file)
          
          const uploadResponse = await fetch("/api/upload/receipt", {
            method: "POST",
            body: formData,
          })
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            receiptUrls.push(uploadData.url)
          }
        }
      }

      // Submit payment information
      const completePaymentInfo: PaymentInfo = {
        ...paymentInfo,
        receiptImage: receiptUrls[0] // Use first receipt URL
      }

      console.log("Calling onConfirm with:", completePaymentInfo)
      
      if (typeof onConfirm !== 'function') {
        throw new FunctionError("onConfirm is not a function", { onConfirm, completePaymentInfo })
      }
      
      await onConfirm(completePaymentInfo)
      console.log("Payment confirmation completed")
      
      // Show success animation
      setAnimationState({ isAnimating: true, animationType: 'success' })
      setTimeout(() => {
        setAnimationState({ isAnimating: false, animationType: null })
        onClose()
      }, 2000)
      
    } catch (error) {
      const safeError = handleUnknownError(error)
      logger.logPaymentError("Error submitting payment", safeError, {
        paymentInfo: paymentInfo,
        fileUploads: fileUploads,
        bookingData: bookingData
      })
      
      setAnimationState({ isAnimating: true, animationType: 'error' })
      setTimeout(() => setAnimationState({ isAnimating: false, animationType: null }), 2000)
      
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

  const toggleBankExpansion = (bankName: string) => {
    setExpandedBank(expandedBank === bankName ? null : bankName)
  }

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(expandedFAQ === question ? null : question)
  }

  const getBankStatusColor = (rating: number) => {
    if (rating >= 4.7) return 'text-green-600'
    if (rating >= 4.5) return 'text-blue-600'
    return 'text-amber-600'
  }

  const getBankStatusBadge = (rating: number) => {
    if (rating >= 4.7) return 'bg-green-100 text-green-800 border-green-200'
    if (rating >= 4.5) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-amber-100 text-amber-800 border-amber-200'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <TooltipProvider>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[90vh] sm:max-h-[95vh] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
          {/* Animation Overlay */}
          {animationState.isAnimating && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
                {animationState.animationType === 'loading' && (
                  <>
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-semibold text-gray-800">Processing Payment...</p>
                  </>
                )}
                {animationState.animationType === 'success' && (
                  <>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-800">Success!</p>
                  </>
                )}
                {animationState.animationType === 'error' && (
                  <>
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-800">Please check the form</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          <DialogHeader className="pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <DialogTitle className="flex items-center space-x-3 text-lg sm:text-xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Confirm Booking & Payment
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Complete your booking by following the payment instructions</p>
                  </TooltipContent>
                </Tooltip>
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure Payment
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                  className="h-8 w-8 p-0"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Complete your booking in 3 simple steps
            </DialogDescription>
            
            {/* Interactive Progress Indicator */}
            <div className="mt-3 sm:mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("instructions")}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "instructions" 
                      ? "bg-blue-600 text-white scale-110" 
                      : "bg-green-600 text-white"
                  }`}>
                    {activeTab === "instructions" ? "1" : <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "instructions" ? "text-blue-600 font-semibold" : "text-green-600"
                  }`}>
                    Review Details
                  </span>
                </div>
                
                <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
                  <Progress value={getProgressValue()} className="h-2 transition-all duration-500" />
                </div>
                
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("payment")}>
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "payment" ? "text-blue-600 font-semibold" : "text-gray-400"
                  }`}>
                    Payment
                  </span>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "payment" 
                      ? "bg-blue-600 text-white scale-110" 
                      : activeTab === "instructions" 
                      ? "bg-gray-300 text-gray-600" 
                      : "bg-green-600 text-white"
                  }`}>
                    {activeTab === "payment" ? "2" : activeTab === "instructions" ? <Circle className="h-3 w-3 sm:h-4 sm:w-4" /> : <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                </div>
                
                <div className="flex-1 mx-2 sm:mx-4 hidden sm:block">
                  <Progress value={getProgressValue()} className="h-2 transition-all duration-500" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "complete" ? "text-blue-600 font-semibold" : "text-gray-400"
                  }`}>
                    Complete
                  </span>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeTab === "complete" 
                      ? "bg-green-600 text-white scale-110" 
                      : "bg-gray-300 text-gray-600"
                  }`}>
                    {activeTab === "complete" ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Circle className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                </div>
              </div>
              {/* Mobile progress bar */}
              <div className="sm:hidden mt-2">
                <Progress value={getProgressValue()} className="h-2 transition-all duration-500" />
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 flex-1 overflow-hidden">
          {/* Enhanced Booking Summary */}
          <div className="lg:col-span-2">
            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-base sm:text-lg">Booking Summary</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Shield className="h-5 w-5 text-blue-200 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Your booking is secure and encrypted</p>
                      </TooltipContent>
                    </Tooltip>
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Review your booking details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Teacher Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Teacher</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {bookingData.teacherName}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Date & Time</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-300">
                        {formatDate(bookingData.date)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
                        at {bookingData.timeSlot}
                      </p>
                    </div>
                    <Timer className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {bookingData.duration} minutes
                      </p>
                    </div>
                    <Zap className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border-2 border-amber-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600 group-hover:text-orange-600 transition-colors duration-300">
                        {formatPrice(bookingData.price)}
                      </p>
                      <p className="text-xs text-gray-500">Secure bank transfer</p>
                    </div>
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* Interactive Status */}
                <div className="flex items-center justify-center pt-2 sm:pt-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 sm:px-4 py-1 sm:py-2 hover:bg-blue-200 transition-colors duration-300 cursor-pointer">
                    <Clock className="h-3 w-3 mr-2 animate-pulse" />
                    <span className="text-xs sm:text-sm">Pending Payment</span>
                  </Badge>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("payment")}
                    className="text-xs"
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pay Now
                  </Button>
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
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs sm:text-sm hover:bg-gray-100"
                >
                  <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Payment Instructions</span>
                  <span className="sm:hidden">Instructions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs sm:text-sm hover:bg-gray-100"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Upload Payment Proof</span>
                  <span className="sm:hidden">Payment</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="instructions" className="space-y-4 sm:space-y-6 p-4 sm:p-6 h-full overflow-y-auto pb-20 custom-scrollbar">
                  <Alert className="border-blue-200 bg-blue-50 hover:shadow-md transition-all duration-300">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Please complete the bank transfer and then upload your payment proof in the next tab.
                    </AlertDescription>
                  </Alert>

                  {/* Bank Comparison Toggle */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                      <span className="text-sm sm:text-base">Bank Transfer Details</span>
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBankComparison(!showBankComparison)}
                      className="text-xs"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {showBankComparison ? 'Hide' : 'Show'} Comparison
                    </Button>
                  </div>

                  {/* Bank Comparison Table */}
                  {showBankComparison && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Bank</th>
                            <th className="text-left p-2">Rating</th>
                            <th className="text-left p-2">Processing Time</th>
                            <th className="text-left p-2">Features</th>
                          </tr>
                        </thead>
                        <tbody>
                          {BANK_ACCOUNTS.map((bank, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{bank.name}</td>
                              <td className="p-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(bank.rating)}
                                  <span className="text-xs">{bank.rating}</span>
                                </div>
                              </td>
                              <td className="p-2">{bank.processingTime}</td>
                              <td className="p-2">
                                <div className="flex flex-wrap gap-1">
                                  {bank.features?.slice(0, 2).map((feature, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    {BANK_ACCOUNTS.map((bank, index) => (
                      <Card 
                        key={index} 
                        className={`border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                          selectedBank?.name === bank.name ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => selectBank(bank)}
                      >
                        <CardHeader className="pb-3 sm:pb-4">
                          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="text-xl sm:text-2xl">{bank.logo}</span>
                              <div>
                                <span className="text-base sm:text-lg font-semibold">{bank.name}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    {renderStars(bank.rating)}
                                  </div>
                                  <span className={`text-xs font-medium ${getBankStatusColor(bank.rating)}`}>
                                    {bank.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getBankStatusBadge(bank.rating) + " text-xs"}>
                                {bank.rating >= 4.7 ? 'Fastest' : bank.rating >= 4.5 ? 'Recommended' : 'Reliable'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleBankExpansion(bank.name)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                {expandedBank === bank.name ? 
                                  <ChevronUp className="h-3 w-3" /> : 
                                  <ChevronDown className="h-3 w-3" />
                                }
                              </Button>
                            </div>
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyToClipboard(bank.accountNumber, `account-${index}`)
                                  }}
                                  className="shrink-0 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2 transition-all duration-200 hover:bg-blue-50"
                                >
                                  {copiedField === `account-${index}` ? 
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> : 
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyToClipboard(bank.iban, `iban-${index}`)
                                  }}
                                  className="shrink-0 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2 transition-all duration-200 hover:bg-blue-50"
                                >
                                  {copiedField === `iban-${index}` ? 
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" /> : 
                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                  }
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expandable Details */}
                          {expandedBank === bank.name && (
                            <div className="space-y-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
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
                              <div>
                                <Label className="text-xs sm:text-sm font-medium text-gray-700">Features</Label>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {bank.features?.map((feature, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Timer className="h-4 w-4 text-blue-600" />
                                  <span className="text-xs sm:text-sm font-medium text-blue-800">
                                    Processing Time: {bank.processingTime}
                                  </span>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  {bank.rating >= 4.7 ? '⚡ Fast' : bank.rating >= 4.5 ? '🚀 Quick' : '⏱️ Standard'}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Interactive Payment Instructions */}
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
                        <li key={index} className="flex items-start space-x-2 sm:space-x-3 group cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all duration-200">
                          <div className="bg-white/20 backdrop-blur-sm w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium mt-0.5 shrink-0 group-hover:bg-white/30 transition-colors duration-200">
                            {index + 1}
                          </div>
                          <span className="text-xs sm:text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors duration-200">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* FAQ Section */}
                  <div className="space-y-3">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                      <span className="text-sm sm:text-base">Frequently Asked Questions</span>
                    </h4>
                    <div className="space-y-2">
                      {FAQ_ITEMS.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleFAQ(faq.question)}
                            className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                          >
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{faq.question}</span>
                            {expandedFAQ === faq.question ? 
                              <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            }
                          </button>
                          {expandedFAQ === faq.question && (
                            <div className="p-3 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                              <p className="text-xs sm:text-sm text-gray-600">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab("payment")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
                    size="lg"
                  >
                    <span className="hidden sm:inline">I've Made the Payment - Continue to Upload</span>
                    <span className="sm:hidden">Continue to Upload</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 sm:space-y-6 p-4 sm:p-6 h-full overflow-y-auto pb-20 custom-scrollbar">
                  <Alert className="border-green-200 bg-green-50 hover:shadow-md transition-all duration-300">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      Please fill in all the payment details accurately to ensure quick approval.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="transactionId" className="text-xs sm:text-sm font-medium text-gray-700">
                            Transaction ID <span className="text-red-500">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Find this in your bank transaction details</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="transactionId"
                          value={paymentInfo.transactionId}
                          onChange={(e) => setPaymentInfo({...paymentInfo, transactionId: e.target.value})}
                          placeholder="Enter transaction reference number"
                          required
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-200 ${
                            formErrors.transactionId ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {formErrors.transactionId && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.transactionId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="amount" className="text-xs sm:text-sm font-medium text-gray-700">
                            Amount (SAR) <span className="text-red-500">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Must match the exact booking amount</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="amount"
                          type="number"
                          value={paymentInfo.amount}
                          onChange={(e) => setPaymentInfo({...paymentInfo, amount: parseFloat(e.target.value)})}
                          placeholder="0.00"
                          step="0.01"
                          required
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-200 ${
                            formErrors.amount ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {formErrors.amount && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.amount}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="paymentDate" className="text-xs sm:text-sm font-medium text-gray-700">
                            Payment Date <span className="text-red-500">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Date when you made the payment</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentInfo.paymentDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentDate: e.target.value})}
                          required
                          className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-200 ${
                            formErrors.paymentDate ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        {formErrors.paymentDate && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.paymentDate}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bankName" className="text-xs sm:text-sm font-medium text-gray-700">
                            Bank Name <span className="text-red-500">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Select the bank you used for payment</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <select
                          id="bankName"
                          value={paymentInfo.bankName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm transition-all duration-200 ${
                            formErrors.bankName 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          required
                        >
                          <option value="">Select your bank</option>
                          {BANK_ACCOUNTS.map(bank => (
                            <option key={bank.name} value={bank.name}>
                              {bank.name} ({bank.rating}⭐)
                            </option>
                          ))}
                          <option value="Other">Other Bank</option>
                        </select>
                        {formErrors.bankName && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {formErrors.bankName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accountNumber" className="text-xs sm:text-sm font-medium text-gray-700">
                          Your Account Number
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Your bank account number (optional)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="accountNumber"
                        value={paymentInfo.accountNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                        placeholder="Enter your bank account number"
                        className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-200 ${
                          formErrors.accountNumber ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {formErrors.accountNumber && (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.accountNumber}
                        </p>
                      )}
                    </div>

                    {/* Interactive File Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="receipt" className="text-xs sm:text-sm font-medium text-gray-700">
                          Upload Receipt/Proof of Payment
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Screenshot or photo of transaction confirmation</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div
                        ref={dropAreaRef}
                        className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 cursor-pointer ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                          Supported formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Choose Files
                        </Button>
                        
                        <Input
                          ref={fileInputRef}
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="border-0 bg-white text-sm hidden"
                          multiple
                        />
                      </div>

                      {/* File Upload List */}
                      {fileUploads.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">
                            Uploaded Files ({fileUploads.length})
                          </Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {fileUploads.map((fileUpload) => (
                              <div key={fileUpload.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  {fileUpload.file.type.startsWith('image/') ? (
                                    <img 
                                      src={fileUpload.preview} 
                                      alt={fileUpload.file.name}
                                      className="h-8 w-8 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                      <File className="h-4 w-4 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {fileUpload.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {fileUpload.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        simulateUpload(fileUpload.id)
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Upload className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {fileUpload.status === 'uploading' && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-12 bg-gray-200 rounded-full h-1">
                                        <div 
                                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                          style={{ width: `${fileUpload.uploadProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {Math.round(fileUpload.uploadProgress)}%
                                      </span>
                                    </div>
                                  )}
                                  {fileUpload.status === 'success' && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFile(fileUpload.id)
                                    }}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notes" className="text-xs sm:text-sm font-medium text-gray-700">
                          Additional Notes (Optional)
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Any additional information about the payment</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="notes"
                        value={paymentInfo.notes}
                        onChange={(e) => setPaymentInfo({...paymentInfo, notes: e.target.value})}
                        placeholder="Any additional information about the payment..."
                        rows={3}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Form Validation Summary */}
                    {Object.keys(formErrors).length > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          Please correct the errors above before submitting.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base transition-all duration-200"
                        size="lg"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
    </TooltipProvider>
  )
}