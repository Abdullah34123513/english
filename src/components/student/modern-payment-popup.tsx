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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  BarChart3,
  Wallet,
  Banknote,
  QrCode,
  Building2,
  Landmark,
  CreditCardIcon
} from "lucide-react"

interface ModernPaymentPopupProps {
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
  userData: {
    id: string
    name?: string
    email: string
    image?: string
    phone?: string
    location?: string
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

export function ModernPaymentPopup({ 
  isOpen, 
  onClose, 
  bookingData, 
  userData,
  onConfirm 
}: ModernPaymentPopupProps) {
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
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // Fetch payment configurations
  useEffect(() => {
    const fetchPaymentConfigurations = async () => {
      try {
        const response = await fetch("/api/payment-configurations/active")
        if (response.ok) {
          const data = await response.json()
          setBankAccounts(data)
        } else {
          // Fallback to default bank accounts if API fails
          setBankAccounts([
            {
              name: "Default Bank",
              accountNumber: "SA1234567890123456789012",
              iban: "SA52ALRAHI0000123456789012",
              accountHolder: "English Learning Platform",
              branch: "Main Branch",
              logo: "🏦",
              rating: 4.5,
              features: ["24/7 Processing", "Secure Transfer"],
              processingTime: "5-10 minutes"
            }
          ])
        }
      } catch (error) {
        console.error("Error fetching payment configurations:", error)
        // Fallback to default bank accounts
        setBankAccounts([
          {
            name: "Default Bank",
            accountNumber: "SA1234567890123456789012",
            iban: "SA52ALRAHI0000123456789012",
            accountHolder: "English Learning Platform",
            branch: "Main Branch",
            logo: "🏦",
            rating: 4.5,
            features: ["24/7 Processing", "Secure Transfer"],
            processingTime: "5-10 minutes"
          }
        ])
      } finally {
        setBankAccountsLoading(false)
      }
    }

    fetchPaymentConfigurations()
  }, [])

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
        throw new Error("onConfirm is not a function")
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
      console.error("Error submitting payment:", error)
      setAnimationState({ isAnimating: true, animationType: 'error' })
      setTimeout(() => setAnimationState({ isAnimating: false, animationType: null }), 2000)
      
      // Re-throw the error so the UI can handle it
      throw error
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

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
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
        
        <DialogHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Your Booking Payment
              </span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Secure Payment
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base text-gray-600">
            Follow the steps below to complete your booking payment
          </DialogDescription>
          
          {/* Modern Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  activeTab === "instructions" 
                    ? "bg-blue-600 text-white scale-110" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "instructions" ? "1" : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <span className={`text-sm font-medium transition-all duration-300 ${
                  activeTab === "instructions" ? "text-blue-600 font-semibold" : "text-green-600"
                }`}>
                  Payment Instructions
                </span>
              </div>
              
              <div className="flex-1 mx-4">
                <Progress value={getProgressValue()} className="h-2 transition-all duration-500" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium transition-all duration-300 ${
                  activeTab === "payment" ? "text-blue-600 font-semibold" : "text-gray-400"
                }`}>
                  Upload Payment
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  activeTab === "payment" 
                    ? "bg-blue-600 text-white scale-110" 
                    : activeTab === "instructions" 
                    ? "bg-gray-300 text-gray-600" 
                    : "bg-green-600 text-white"
                }`}>
                  {activeTab === "payment" ? "2" : activeTab === "instructions" ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
          {/* Enhanced Booking Summary */}
          <div className="lg:col-span-2">
            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">Booking Summary</span>
                  </span>
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Review your booking details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Student Profile */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                      <AvatarImage src={userData.image} alt="Student" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-semibold">
                        {getUserInitials(userData.name || "S")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Student</p>
                      <p className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-300">
                        {userData.name || "Student"}
                      </p>
                      <p className="text-sm text-gray-500 truncate group-hover:text-indigo-600 transition-colors duration-300">
                        {userData.email}
                      </p>
                      {(userData.phone || userData.location) && (
                        <div className="flex items-center space-x-2 mt-1">
                          {userData.phone && (
                            <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                              {userData.phone}
                            </span>
                          )}
                          {userData.location && (
                            <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                              {userData.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Teacher</p>
                      <p className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {bookingData.teacherName}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Date & Time</p>
                      <p className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-300">
                        {formatDate(bookingData.date)}
                      </p>
                      <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
                        at {bookingData.timeSlot}
                      </p>
                    </div>
                    <Timer className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {bookingData.duration} minutes
                      </p>
                    </div>
                    <Zap className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-amber-600 group-hover:text-orange-600 transition-colors duration-300">
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
                <div className="flex items-center justify-center pt-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 hover:bg-blue-200 transition-colors duration-300 cursor-pointer">
                    <Clock className="h-3 w-3 mr-2 animate-pulse" />
                    <span className="text-sm">Pending Payment</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Instructions and Form */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl flex-shrink-0">
                <TabsTrigger 
                  value="instructions" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-sm hover:bg-gray-100"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Payment Instructions
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200 text-sm hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Payment Proof
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="instructions" className="space-y-6 p-6 overflow-y-auto pb-20" style={{ maxHeight: 'calc(95vh - 300px)' }}>
                  <Alert className="border-blue-200 bg-blue-50 hover:shadow-md transition-all duration-300">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Please complete the bank transfer and then upload your payment proof in the next tab.
                    </AlertDescription>
                  </Alert>

                  {/* Bank Comparison Toggle */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      Bank Transfer Details
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBankComparison(!showBankComparison)}
                      className="text-sm"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {showBankComparison ? 'Hide' : 'Show'} Comparison
                    </Button>
                  </div>

                  {/* Bank Comparison Table */}
                  {showBankComparison && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Bank</th>
                            <th className="text-left p-2">Rating</th>
                            <th className="text-left p-2">Processing Time</th>
                            <th className="text-left p-2">Features</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bankAccounts.map((bank, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{bank.name}</td>
                              <td className="p-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(bank.rating || 0)}
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

                  <div className="space-y-4">
                    {bankAccountsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading payment options...</span>
                      </div>
                    ) : (
                      bankAccounts.map((bank, index) => (
                        <Card 
                          key={index} 
                          className={`border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                            selectedBank?.name === bank.name ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => selectBank(bank)}
                        >
                          <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{bank.logo}</span>
                                <div>
                                  <span className="text-lg font-semibold">{bank.name}</span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex items-center space-x-1">
                                      {renderStars(bank.rating || 0)}
                                    </div>
                                    <span className={`text-xs font-medium ${getBankStatusColor(bank.rating || 0)}`}>
                                      {bank.rating}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={getBankStatusBadge(bank.rating || 0) + " text-xs"}>
                                  {bank.rating >= 4.7 ? 'Fastest' : bank.rating >= 4.5 ? 'Recommended' : 'Reliable'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBankExpansion(bank.name)
                                  }}
                                  className="group h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:shadow-md relative overflow-hidden"
                                >
                                  {expandedBank === bank.name ? 
                                    <ChevronUp className="h-4 w-4 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" /> : 
                                    <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                                  }
                                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-blue-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-full"></div>
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-50 p-3 rounded-lg border font-mono text-sm truncate">
                                    {bank.accountNumber}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(bank.accountNumber, `account-${index}`)
                                    }}
                                    className="group shrink-0 h-10 w-10 p-2 transition-all duration-300 transform hover:scale-110 hover:bg-blue-50 hover:shadow-md rounded-lg border border-gray-200 hover:border-blue-300 relative overflow-hidden"
                                  >
                                    {copiedField === `account-${index}` ? 
                                      <CheckCircle2 className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" /> : 
                                      <Copy className="h-5 w-5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                                    }
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">IBAN</Label>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-50 p-3 rounded-lg border font-mono text-sm truncate">
                                    {bank.iban}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(bank.iban, `iban-${index}`)
                                    }}
                                    className="group shrink-0 h-10 w-10 p-2 transition-all duration-300 transform hover:scale-110 hover:bg-blue-50 hover:shadow-md rounded-lg border border-gray-200 hover:border-blue-300 relative overflow-hidden"
                                  >
                                    {copiedField === `iban-${index}` ? 
                                      <CheckCircle2 className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" /> : 
                                      <Copy className="h-5 w-5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                                    }
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expandable Details */}
                            {expandedBank === bank.name && (
                              <div className="space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Account Holder</Label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg truncate">
                                      {bank.accountHolder}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Branch</Label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg truncate">
                                      {bank.branch}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Features</Label>
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
                                    <span className="text-sm font-medium text-blue-800">
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
                      ))
                    )}
                  </div>

                  {/* Interactive Payment Instructions */}
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
                        <li key={index} className="flex items-start space-x-3 group cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all duration-200">
                          <div className="bg-white/20 backdrop-blur-sm w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 shrink-0 group-hover:bg-white/30 transition-colors duration-200">
                            {index + 1}
                          </div>
                          <span className="text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors duration-200">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* FAQ Section */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-2">
                      {FAQ_ITEMS.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleFAQ(faq.question)}
                            className="group w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-300 rounded-lg border border-transparent hover:border-gray-200"
                          >
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{faq.question}</span>
                            <div className="flex items-center space-x-2">
                              {expandedFAQ === faq.question ? 
                                <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" /> : 
                                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                              }
                              <div className="h-6 w-6 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-all duration-300 flex items-center justify-center">
                                <HelpCircle className="h-3 w-3 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                              </div>
                            </div>
                          </button>
                          {expandedFAQ === faq.question && (
                            <div className="p-3 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                              <p className="text-sm text-gray-600">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab("payment")}
                    className="group w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 text-white font-bold py-4 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl rounded-xl relative overflow-hidden bg-size-200 bg-pos-0 hover:bg-pos-100"
                    size="lg"
                    style={{
                      backgroundSize: '200% 200%',
                      backgroundImage: 'linear-gradient(45deg, #059669, #0d9488, #059669)'
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="font-medium">I've Made the Payment - Continue to Upload</span>
                      <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6 p-6 overflow-y-auto pb-20" style={{ maxHeight: 'calc(95vh - 300px)' }}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-blue-600" />
                      Upload Payment Proof
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">Transaction ID *</Label>
                          <Input
                            id="transactionId"
                            value={paymentInfo.transactionId}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, transactionId: e.target.value })}
                            placeholder="Enter transaction ID"
                            className={formErrors.transactionId ? "border-red-500" : ""}
                          />
                          {formErrors.transactionId && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.transactionId}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (SAR) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={paymentInfo.amount}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, amount: parseFloat(e.target.value) })}
                            placeholder="0.00"
                            className={formErrors.amount ? "border-red-500" : ""}
                          />
                          {formErrors.amount && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">Payment Date *</Label>
                          <Input
                            id="paymentDate"
                            type="date"
                            value={paymentInfo.paymentDate}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentDate: e.target.value })}
                            className={formErrors.paymentDate ? "border-red-500" : ""}
                          />
                          {formErrors.paymentDate && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.paymentDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">Bank Name *</Label>
                          <select
                            id="bankName"
                            value={paymentInfo.bankName}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                            className={`w-full p-2 border rounded-md ${formErrors.bankName ? "border-red-500" : "border-gray-300"}`}
                          >
                            <option value="">Select a bank</option>
                            {bankAccounts.map((bank, index) => (
                              <option key={index} value={bank.name}>{bank.name}</option>
                            ))}
                          </select>
                          {formErrors.bankName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.bankName}</p>
                          )}
                        </div>
                      </div>

                      {/* Account Number */}
                      <div>
                        <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">Your Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={paymentInfo.accountNumber}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                          placeholder="Enter your bank account number"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional, helps us verify your payment faster</p>
                      </div>

                      {/* Notes */}
                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={paymentInfo.notes}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, notes: e.target.value })}
                          placeholder="Any additional information about your payment..."
                          rows={3}
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Payment Receipt *</Label>
                        <div
                          ref={dropAreaRef}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Drag and drop your payment receipt here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: JPG, PNG, PDF (Max 10MB)
                          </p>
                        </div>

                        {/* File List */}
                        {fileUploads.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {fileUploads.map((fileUpload) => (
                              <div key={fileUpload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <File className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{fileUpload.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {fileUpload.status === 'uploading' && (
                                    <div className="flex items-center space-x-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                      <span className="text-xs text-gray-500">Uploading...</span>
                                    </div>
                                  )}
                                  {fileUpload.status === 'success' && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFile(fileUpload.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("instructions")}
                          className="px-6"
                        >
                          Back to Instructions
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || fileUploads.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <span>Submit Payment Proof</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}