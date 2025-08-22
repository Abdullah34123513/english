"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Star, 
  Settings, 
  Edit,
  MapPin,
  Phone,
  Globe,
  Target,
  Clock,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Camera,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Activity,
  BookMarked,
  MessageCircle,
  ThumbsUp,
  Eye,
  Share2,
  Save,
  X,
  Loader2,
  Camera as CameraIcon,
  Upload,
  Trash2,
  CheckCircle as CheckCircleIcon,
  AlertCircle,
  Plus
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  role: string
  image?: string
  createdAt: string
  // Student specific fields
  age?: number
  country?: string
  timezone?: string
  englishLevel?: string
  learningGoals?: string[]
  interests?: string[]
  hobbies?: string[]
  preferredStudyDays?: string[]
  preferredStudyTimes?: string[]
  totalBookings?: number
  completedLessons?: number
  totalReviews?: number
  averageRating?: number
  // Teacher specific fields
  bio?: string
  experience?: string
  specialties?: string[]
  rating?: number
  totalReviews?: number
  totalStudents?: number
  availabilityHours?: number
}

interface ActivityItem {
  id: string
  type: 'booking' | 'review' | 'payment' | 'profile_update'
  title: string
  description: string
  date: string
  icon: React.ComponentType<any>
}

// Helper function to safely convert any value to an array
const safeArray = (value: any): any[] => {
  if (value === null || value === undefined) {
    return []
  }
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === 'string') {
    return value ? [value] : []
  }
  return []
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
      fetchRecentActivity()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      if (session?.user?.role === "STUDENT") {
        const response = await fetch("/api/student/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      } else if (session?.user?.role === "TEACHER") {
        const response = await fetch("/api/teacher/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            image: session.user.image,
            createdAt: session.user.createdAt,
            ...data
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    // Mock recent activity data - in a real app, this would come from an API
    const mockActivity: ActivityItem[] = [
      {
        id: "1",
        type: "booking",
        title: "New Lesson Booked",
        description: "English conversation practice with Sarah Johnson",
        date: "2 hours ago",
        icon: BookMarked
      },
      {
        id: "2",
        type: "review",
        title: "Review Submitted",
        description: "Rated 5 stars for Michael Chen's lesson",
        date: "1 day ago",
        icon: Star
      },
      {
        id: "3",
        type: "payment",
        title: "Payment Confirmed",
        description: "Monthly subscription payment processed",
        date: "3 days ago",
        icon: CheckCircle
      }
    ]
    setRecentActivity(mockActivity)
  }

  const getInterestIcon = (interest: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'music': Music,
      'travel': MapPin,
      'sports': Target,
      'reading': BookOpen,
      'cooking': Coffee,
      'gaming': Gamepad2,
      'photography': Camera,
      'movies': Star,
      'art': Heart,
      'technology': Globe
    }
    const Icon = iconMap[interest.toLowerCase()] || Heart
    return <Icon className="h-4 w-4" />
  }

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'booking': BookMarked,
      'review': Star,
      'payment': CheckCircle,
      'profile_update': User
    }
    return iconMap[type] || Activity
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-red-100 text-red-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-green-100 text-green-800',
      'Native': 'bg-blue-100 text-blue-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        country: profile.country,
        timezone: profile.timezone,
        englishLevel: profile.englishLevel,
        learningGoals: profile.learningGoals,
        interests: profile.interests,
        hobbies: profile.hobbies,
        preferredStudyDays: profile.preferredStudyDays,
        preferredStudyTimes: profile.preferredStudyTimes,
        experience: profile.experience,
        specialties: profile.specialties,
        rating: profile.rating,
        totalStudents: profile.totalStudents,
        availabilityHours: profile.availabilityHours
      })
      setImagePreview(profile.image || null)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
    setImagePreview(null)
    setSelectedFile(null)
    setError("")
    setSuccess("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "profile")

      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        setEditForm(prev => ({ ...prev, image: data.primaryUrl || data.urls.medium }))
        setSuccess("Profile image uploaded successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to upload image")
      }
    } catch (error) {
      setError("An error occurred while uploading the image")
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      setUploadProgress(0)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const endpoint = isStudent ? "/api/student/profile" : "/api/teacher/profile"
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(prev => ({ ...prev, ...updatedProfile }))
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: string, value: string) => {
    if (value.trim() && !editForm[field]?.includes(value.trim())) {
      setEditForm(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((item: string) => item !== value)
    }))
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  const isStudent = profile.role === "STUDENT"
  const isTeacher = profile.role === "TEACHER"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {profile.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={isEditing ? handleSaveProfile : handleEditProfile}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save Profile" : "Edit Profile"}
              </Button>
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button variant="outline" asChild className="border-gray-300 hover:bg-gray-50">
                <Link href={isStudent ? "/dashboard/student" : "/dashboard/teacher"}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
              <CardHeader className="text-center -mt-16 relative z-10">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                    <AvatarImage src={imagePreview || profile.image} />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {(editForm.name || profile.name).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-lg"
                          >
                            <CameraIcon className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Profile Picture</DialogTitle>
                            <DialogDescription>
                              Choose a new profile picture. Max size: 5MB. Supported formats: JPG, PNG, GIF.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <Avatar className="h-32 w-32">
                                <AvatarImage src={imagePreview || profile.image} />
                                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                  {(editForm.name || profile.name).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="profile-image">Choose Image</Label>
                              <Input
                                ref={fileInputRef}
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                              />
                            </div>

                            {selectedFile && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{selectedFile.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedFile(null)
                                      setImagePreview(profile.image || null)
                                    }}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {isUploading && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Uploading...</span>
                                      <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {!isUploading && (
                                  <Button
                                    onClick={handleImageUpload}
                                    className="w-full"
                                    disabled={isUploading}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                  </Button>
                                )}
                              </div>
                            )}

                            {imagePreview && !selectedFile && imagePreview !== profile.image && (
                              <Button
                                variant="outline"
                                onClick={() => setImagePreview(profile.image || null)}
                                className="w-full"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Current Image
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editForm.name || ""}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Enter your name"
                      className="text-center text-xl font-bold"
                    />
                    <div className="text-sm text-gray-600">{profile.email}</div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-bold text-gray-900">{profile.name}</CardTitle>
                    <CardDescription className="text-gray-600">{profile.email}</CardDescription>
                  </>
                )}
                
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge variant="outline" className="border-gray-300">
                    {profile.role}
                  </Badge>
                  {profile.englishLevel && (
                    <Badge className={getLevelColor(profile.englishLevel)}>
                      {profile.englishLevel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={editForm.country || ""}
                        onChange={(e) => handleFormChange("country", e.target.value)}
                        placeholder="Enter your country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={editForm.timezone || ""}
                        onChange={(e) => handleFormChange("timezone", e.target.value)}
                        placeholder="Enter your timezone"
                      />
                    </div>
                    {profile.phone !== undefined && (
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone || ""}
                          onChange={(e) => handleFormChange("phone", e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {profile.country && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.country}</span>
                      </div>
                    )}
                    {profile.timezone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span>{profile.timezone}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </>
                )}
                
                {isTeacher && profile.rating && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>
                      {profile.rating}/5 ({profile.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isStudent && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Bookings</span>
                      <span className="font-semibold">{profile.totalBookings || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed Lessons</span>
                      <span className="font-semibold">{profile.completedLessons || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reviews Given</span>
                      <span className="font-semibold">{profile.totalReviews || 0}</span>
                    </div>
                  </>
                )}
                {isTeacher && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="font-semibold">{profile.totalStudents || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{profile.totalReviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Availability</span>
                      <span className="font-semibold">{profile.availabilityHours || 0}h/week</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeArray(recentActivity).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      <activity.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Learning
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={editForm.name || ""}
                              onChange={(e) => handleFormChange("name", e.target.value)}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={profile.email}
                              disabled
                              className="bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                          </div>
                          {profile.age !== undefined && (
                            <div>
                              <Label htmlFor="age">Age</Label>
                              <Input
                                id="age"
                                type="number"
                                value={editForm.age || ""}
                                onChange={(e) => handleFormChange("age", parseInt(e.target.value))}
                                placeholder="Enter your age"
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={editForm.country || ""}
                              onChange={(e) => handleFormChange("country", e.target.value)}
                              placeholder="Enter your country"
                            />
                          </div>
                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input
                              id="timezone"
                              value={editForm.timezone || ""}
                              onChange={(e) => handleFormChange("timezone", e.target.value)}
                              placeholder="Enter your timezone"
                            />
                          </div>
                          {profile.englishLevel !== undefined && (
                            <div>
                              <Label htmlFor="englishLevel">English Level</Label>
                              <Select value={editForm.englishLevel || ""} onValueChange={(value) => handleFormChange("englishLevel", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                  <SelectItem value="Native">Native</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.email}</p>
                          </div>
                          {profile.age && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Age</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.age} years old</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {profile.country && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Country</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.country}</p>
                            </div>
                          )}
                          {profile.timezone && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Timezone</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.timezone}</p>
                            </div>
                          )}
                          {profile.englishLevel && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">English Level</label>
                              <Badge className={getLevelColor(profile.englishLevel) + " mt-1"}>
                                {profile.englishLevel}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bio and Experience */}
                {(profile.bio || profile.experience) && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>About</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.bio && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bio</label>
                          <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                            {profile.bio}
                          </p>
                        </div>
                      )}
                      {profile.experience && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Experience</label>
                          <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                            {profile.experience}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Progress Overview */}
                {isStudent && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Learning Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Course Completion</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Speaking Practice</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Grammar Mastery</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                {isStudent && (
                  <>
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5" />
                          <span>Learning Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {profile.englishLevel && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">English Level</label>
                            <div className="mt-2">
                              <Badge className={getLevelColor(profile.englishLevel)}>
                                {profile.englishLevel}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {isEditing ? (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Learning Goals</label>
                            <div className="space-y-3 mt-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.learningGoals).map((goal, index) => (
                                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1 flex items-center">
                                    {goal}
                                    <button
                                      onClick={() => removeArrayItem("learningGoals", goal)}
                                      className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Add learning goal"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addArrayItem("learningGoals", (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = ""
                                    }
                                  }}
                                />
                                <Button 
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add learning goal"]') as HTMLInputElement
                                    if (input?.value) {
                                      addArrayItem("learningGoals", input.value)
                                      input.value = ""
                                    }
                                  }}
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          profile.learningGoals && profile.learningGoals.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Learning Goals</label>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {safeArray(profile.learningGoals).map((goal, index) => (
                                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                                    {goal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>

                    {/* Learning Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <BookMarked className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.totalBookings || 0}</div>
                          <div className="text-sm text-gray-600">Total Bookings</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.completedLessons || 0}</div>
                          <div className="text-sm text-gray-600">Completed Lessons</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardContent className="p-6 text-center">
                          <Star className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                          <div className="text-2xl font-bold text-gray-900">{profile.totalReviews || 0}</div>
                          <div className="text-sm text-gray-600">Reviews Given</div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
                {isTeacher && profile.specialties && profile.specialties.length > 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Specialties</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {safeArray(profile.specialties).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                {isStudent && (
                  <>
                    {profile.interests && profile.interests.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Interests</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {safeArray(profile.interests).map((interest, index) => (
                              <Badge key={index} variant="outline" className="flex items-center space-x-2 px-4 py-2">
                                {getInterestIcon(interest)}
                                <span>{interest}</span>
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {profile.hobbies && profile.hobbies.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Coffee className="h-5 w-5" />
                            <span>Hobbies</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {safeArray(profile.hobbies).map((hobby, index) => (
                              <Badge key={index} variant="outline" className="px-4 py-2">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {(profile.preferredStudyDays || profile.preferredStudyTimes) && (
                      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Study Schedule Preferences</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {profile.preferredStudyDays && profile.preferredStudyDays.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Days</label>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {safeArray(profile.preferredStudyDays).map((day, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {profile.preferredStudyTimes && profile.preferredStudyTimes.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Preferred Times</label>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {safeArray(profile.preferredStudyTimes).map((time, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* Account Settings */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Account Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your basic account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="settings-name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="settings-name"
                            value={editForm.name || ""}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium">{profile.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="settings-email">Email Address</Label>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium">{profile.email}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="settings-phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="settings-phone"
                            type="tel"
                            value={editForm.phone || ""}
                            onChange={(e) => handleFormChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm">{profile.phone || "Not specified"}</span>
                          </div>
                        )}
                      </div>

                      {isStudent && (
                        <div className="space-y-2">
                          <Label htmlFor="settings-age">Age</Label>
                          {isEditing ? (
                            <Input
                              id="settings-age"
                              type="number"
                              value={editForm.age || ""}
                              onChange={(e) => handleFormChange("age", parseInt(e.target.value))}
                              placeholder="Enter your age"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <span className="text-sm">{profile.age ? `${profile.age} years old` : "Not specified"}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Time Settings */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Location & Time Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Configure your location and timezone preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="settings-country">Country</Label>
                        {isEditing ? (
                          <Select value={editForm.country || ""} onValueChange={(value) => handleFormChange("country", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Italy">Italy</SelectItem>
                              <SelectItem value="Spain">Spain</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                              <SelectItem value="China">China</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Brazil">Brazil</SelectItem>
                              <SelectItem value="Mexico">Mexico</SelectItem>
                              <SelectItem value="South Korea">South Korea</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="Sweden">Sweden</SelectItem>
                              <SelectItem value="Norway">Norway</SelectItem>
                              <SelectItem value="Denmark">Denmark</SelectItem>
                              <SelectItem value="Finland">Finland</SelectItem>
                              <SelectItem value="Switzerland">Switzerland</SelectItem>
                              <SelectItem value="Austria">Austria</SelectItem>
                              <SelectItem value="Belgium">Belgium</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="Portugal">Portugal</SelectItem>
                              <SelectItem value="Greece">Greece</SelectItem>
                              <SelectItem value="Poland">Poland</SelectItem>
                              <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                              <SelectItem value="Hungary">Hungary</SelectItem>
                              <SelectItem value="Romania">Romania</SelectItem>
                              <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                              <SelectItem value="Croatia">Croatia</SelectItem>
                              <SelectItem value="Serbia">Serbia</SelectItem>
                              <SelectItem value="Slovenia">Slovenia</SelectItem>
                              <SelectItem value="Slovakia">Slovakia</SelectItem>
                              <SelectItem value="Estonia">Estonia</SelectItem>
                              <SelectItem value="Latvia">Latvia</SelectItem>
                              <SelectItem value="Lithuania">Lithuania</SelectItem>
                              <SelectItem value="Malta">Malta</SelectItem>
                              <SelectItem value="Cyprus">Cyprus</SelectItem>
                              <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                              <SelectItem value="Iceland">Iceland</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                              <SelectItem value="Malaysia">Malaysia</SelectItem>
                              <SelectItem value="Thailand">Thailand</SelectItem>
                              <SelectItem value="Indonesia">Indonesia</SelectItem>
                              <SelectItem value="Philippines">Philippines</SelectItem>
                              <SelectItem value="Vietnam">Vietnam</SelectItem>
                              <SelectItem value="Taiwan">Taiwan</SelectItem>
                              <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
                              <SelectItem value="Argentina">Argentina</SelectItem>
                              <SelectItem value="Chile">Chile</SelectItem>
                              <SelectItem value="Colombia">Colombia</SelectItem>
                              <SelectItem value="Peru">Peru</SelectItem>
                              <SelectItem value="Venezuela">Venezuela</SelectItem>
                              <SelectItem value="Ecuador">Ecuador</SelectItem>
                              <SelectItem value="Bolivia">Bolivia</SelectItem>
                              <SelectItem value="Paraguay">Paraguay</SelectItem>
                              <SelectItem value="Uruguay">Uruguay</SelectItem>
                              <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                              <SelectItem value="Panama">Panama</SelectItem>
                              <SelectItem value="Guatemala">Guatemala</SelectItem>
                              <SelectItem value="El Salvador">El Salvador</SelectItem>
                              <SelectItem value="Honduras">Honduras</SelectItem>
                              <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                              <SelectItem value="Cuba">Cuba</SelectItem>
                              <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                              <SelectItem value="Puerto Rico">Puerto Rico</SelectItem>
                              <SelectItem value="Jamaica">Jamaica</SelectItem>
                              <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                              <SelectItem value="Barbados">Barbados</SelectItem>
                              <SelectItem value="Bahamas">Bahamas</SelectItem>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                              <SelectItem value="Egypt">Egypt</SelectItem>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="Kenya">Kenya</SelectItem>
                              <SelectItem value="Morocco">Morocco</SelectItem>
                              <SelectItem value="Tunisia">Tunisia</SelectItem>
                              <SelectItem value="Algeria">Algeria</SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Uganda">Uganda</SelectItem>
                              <SelectItem value="Tanzania">Tanzania</SelectItem>
                              <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                              <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                              <SelectItem value="Zambia">Zambia</SelectItem>
                              <SelectItem value="Botswana">Botswana</SelectItem>
                              <SelectItem value="Namibia">Namibia</SelectItem>
                              <SelectItem value="Mozambique">Mozambique</SelectItem>
                              <SelectItem value="Angola">Angola</SelectItem>
                              <SelectItem value="Senegal">Senegal</SelectItem>
                              <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                              <SelectItem value="Cameroon">Cameroon</SelectItem>
                              <SelectItem value="Mali">Mali</SelectItem>
                              <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                              <SelectItem value="Niger">Niger</SelectItem>
                              <SelectItem value="Chad">Chad</SelectItem>
                              <SelectItem value="Sudan">Sudan</SelectItem>
                              <SelectItem value="Libya">Libya</SelectItem>
                              <SelectItem value="Madagascar">Madagascar</SelectItem>
                              <SelectItem value="Mauritius">Mauritius</SelectItem>
                              <SelectItem value="Seychelles">Seychelles</SelectItem>
                              <SelectItem value="Rwanda">Rwanda</SelectItem>
                              <SelectItem value="Burundi">Burundi</SelectItem>
                              <SelectItem value="Malawi">Malawi</SelectItem>
                              <SelectItem value="Lesotho">Lesotho</SelectItem>
                              <SelectItem value="Eswatini">Eswatini</SelectItem>
                              <SelectItem value="Gambia">Gambia</SelectItem>
                              <SelectItem value="Guinea">Guinea</SelectItem>
                              <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                              <SelectItem value="Liberia">Liberia</SelectItem>
                              <SelectItem value="Togo">Togo</SelectItem>
                              <SelectItem value="Benin">Benin</SelectItem>
                              <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                              <SelectItem value="Republic of the Congo">Republic of the Congo</SelectItem>
                              <SelectItem value="Democratic Republic of the Congo">Democratic Republic of the Congo</SelectItem>
                              <SelectItem value="Gabon">Gabon</SelectItem>
                              <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                              <SelectItem value="São Tomé and Príncipe">São Tomé and Príncipe</SelectItem>
                              <SelectItem value="Cape Verde">Cape Verde</SelectItem>
                              <SelectItem value="Comoros">Comoros</SelectItem>
                              <SelectItem value="Mauritania">Mauritania</SelectItem>
                              <SelectItem value="Western Sahara">Western Sahara</SelectItem>
                              <SelectItem value="Somalia">Somalia</SelectItem>
                              <SelectItem value="Djibouti">Djibouti</SelectItem>
                              <SelectItem value="Eritrea">Eritrea</SelectItem>
                              <SelectItem value="South Sudan">South Sudan</SelectItem>
                              <SelectItem value="Israel">Israel</SelectItem>
                              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="Qatar">Qatar</SelectItem>
                              <SelectItem value="Kuwait">Kuwait</SelectItem>
                              <SelectItem value="Bahrain">Bahrain</SelectItem>
                              <SelectItem value="Oman">Oman</SelectItem>
                              <SelectItem value="Yemen">Yemen</SelectItem>
                              <SelectItem value="Jordan">Jordan</SelectItem>
                              <SelectItem value="Lebanon">Lebanon</SelectItem>
                              <SelectItem value="Syria">Syria</SelectItem>
                              <SelectItem value="Iraq">Iraq</SelectItem>
                              <SelectItem value="Iran">Iran</SelectItem>
                              <SelectItem value="Turkey">Turkey</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Armenia">Armenia</SelectItem>
                              <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                              <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                              <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                              <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                              <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                              <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                              <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                              <SelectItem value="Pakistan">Pakistan</SelectItem>
                              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                              <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                              <SelectItem value="Nepal">Nepal</SelectItem>
                              <SelectItem value="Bhutan">Bhutan</SelectItem>
                              <SelectItem value="Maldives">Maldives</SelectItem>
                              <SelectItem value="Myanmar">Myanmar</SelectItem>
                              <SelectItem value="Laos">Laos</SelectItem>
                              <SelectItem value="Cambodia">Cambodia</SelectItem>
                              <SelectItem value="Brunei">Brunei</SelectItem>
                              <SelectItem value="East Timor">East Timor</SelectItem>
                              <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                              <SelectItem value="Fiji">Fiji</SelectItem>
                              <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                              <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                              <SelectItem value="Samoa">Samoa</SelectItem>
                              <SelectItem value="Tonga">Tonga</SelectItem>
                              <SelectItem value="Kiribati">Kiribati</SelectItem>
                              <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                              <SelectItem value="Nauru">Nauru</SelectItem>
                              <SelectItem value="Palau">Palau</SelectItem>
                              <SelectItem value="Federated States of Micronesia">Federated States of Micronesia</SelectItem>
                              <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                              <SelectItem value="Russia">Russia</SelectItem>
                              <SelectItem value="Ukraine">Ukraine</SelectItem>
                              <SelectItem value="Belarus">Belarus</SelectItem>
                              <SelectItem value="Moldova">Moldova</SelectItem>
                              <SelectItem value="Estonia">Estonia</SelectItem>
                              <SelectItem value="Latvia">Latvia</SelectItem>
                              <SelectItem value="Lithuania">Lithuania</SelectItem>
                              <SelectItem value="Poland">Poland</SelectItem>
                              <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                              <SelectItem value="Slovakia">Slovakia</SelectItem>
                              <SelectItem value="Hungary">Hungary</SelectItem>
                              <SelectItem value="Romania">Romania</SelectItem>
                              <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                              <SelectItem value="Slovenia">Slovenia</SelectItem>
                              <SelectItem value="Croatia">Croatia</SelectItem>
                              <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                              <SelectItem value="Montenegro">Montenegro</SelectItem>
                              <SelectItem value="Serbia">Serbia</SelectItem>
                              <SelectItem value="Kosovo">Kosovo</SelectItem>
                              <SelectItem value="North Macedonia">North Macedonia</SelectItem>
                              <SelectItem value="Albania">Albania</SelectItem>
                              <SelectItem value="Greece">Greece</SelectItem>
                              <SelectItem value="Malta">Malta</SelectItem>
                              <SelectItem value="Andorra">Andorra</SelectItem>
                              <SelectItem value="Monaco">Monaco</SelectItem>
                              <SelectItem value="San Marino">San Marino</SelectItem>
                              <SelectItem value="Vatican City">Vatican City</SelectItem>
                              <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm">{profile.country || "Not specified"}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="settings-timezone">Timezone</Label>
                        {isEditing ? (
                          <Select value={editForm.timezone || ""} onValueChange={(value) => handleFormChange("timezone", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-12:00">UTC-12:00</SelectItem>
                              <SelectItem value="UTC-11:00">UTC-11:00</SelectItem>
                              <SelectItem value="UTC-10:00">UTC-10:00</SelectItem>
                              <SelectItem value="UTC-09:30">UTC-09:30</SelectItem>
                              <SelectItem value="UTC-09:00">UTC-09:00</SelectItem>
                              <SelectItem value="UTC-08:00">UTC-08:00</SelectItem>
                              <SelectItem value="UTC-07:00">UTC-07:00</SelectItem>
                              <SelectItem value="UTC-06:00">UTC-06:00</SelectItem>
                              <SelectItem value="UTC-05:00">UTC-05:00</SelectItem>
                              <SelectItem value="UTC-04:00">UTC-04:00</SelectItem>
                              <SelectItem value="UTC-03:30">UTC-03:30</SelectItem>
                              <SelectItem value="UTC-03:00">UTC-03:00</SelectItem>
                              <SelectItem value="UTC-02:00">UTC-02:00</SelectItem>
                              <SelectItem value="UTC-01:00">UTC-01:00</SelectItem>
                              <SelectItem value="UTC+00:00">UTC+00:00</SelectItem>
                              <SelectItem value="UTC+01:00">UTC+01:00</SelectItem>
                              <SelectItem value="UTC+02:00">UTC+02:00</SelectItem>
                              <SelectItem value="UTC+03:00">UTC+03:00</SelectItem>
                              <SelectItem value="UTC+03:30">UTC+03:30</SelectItem>
                              <SelectItem value="UTC+04:00">UTC+04:00</SelectItem>
                              <SelectItem value="UTC+04:30">UTC+04:30</SelectItem>
                              <SelectItem value="UTC+05:00">UTC+05:00</SelectItem>
                              <SelectItem value="UTC+05:30">UTC+05:30</SelectItem>
                              <SelectItem value="UTC+05:45">UTC+05:45</SelectItem>
                              <SelectItem value="UTC+06:00">UTC+06:00</SelectItem>
                              <SelectItem value="UTC+06:30">UTC+06:30</SelectItem>
                              <SelectItem value="UTC+07:00">UTC+07:00</SelectItem>
                              <SelectItem value="UTC+08:00">UTC+08:00</SelectItem>
                              <SelectItem value="UTC+08:45">UTC+08:45</SelectItem>
                              <SelectItem value="UTC+09:00">UTC+09:00</SelectItem>
                              <SelectItem value="UTC+09:30">UTC+09:30</SelectItem>
                              <SelectItem value="UTC+10:00">UTC+10:00</SelectItem>
                              <SelectItem value="UTC+10:30">UTC+10:30</SelectItem>
                              <SelectItem value="UTC+11:00">UTC+11:00</SelectItem>
                              <SelectItem value="UTC+12:00">UTC+12:00</SelectItem>
                              <SelectItem value="UTC+12:45">UTC+12:45</SelectItem>
                              <SelectItem value="UTC+13:00">UTC+13:00</SelectItem>
                              <SelectItem value="UTC+14:00">UTC+14:00</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm">{profile.timezone || "Not specified"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning & Study Settings */}
                {isStudent && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Learning & Study Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Configure your learning preferences and study schedule
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="settings-englishLevel">English Level</Label>
                        {isEditing ? (
                          <Select value={editForm.englishLevel || ""} onValueChange={(value) => handleFormChange("englishLevel", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Native">Native</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            {profile.englishLevel ? (
                              <Badge className={getLevelColor(profile.englishLevel)}>
                                {profile.englishLevel}
                              </Badge>
                            ) : (
                              <span className="text-sm">Not specified</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Learning Goals</Label>
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {safeArray(editForm.learningGoals).map((goal, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                  {goal}
                                  <button
                                    onClick={() => removeArrayItem("learningGoals", goal)}
                                    className="ml-2 text-xs hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a learning goal"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    addArrayItem("learningGoals", (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.querySelector('input[placeholder="Add a learning goal"]') as HTMLInputElement;
                                  if (input?.value.trim()) {
                                    addArrayItem("learningGoals", input.value.trim());
                                    input.value = '';
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex flex-wrap gap-2">
                              {safeArray(profile.learningGoals).map((goal, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                  {goal}
                                </Badge>
                              ))}
                              {safeArray(profile.learningGoals).length === 0 && (
                                <span className="text-sm">No learning goals set</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Preferred Study Days</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.preferredStudyDays).map((day, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {day}
                                    <button
                                      onClick={() => removeArrayItem("preferredStudyDays", day)}
                                      className="ml-2 text-xs hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Select onValueChange={(value) => addArrayItem("preferredStudyDays", value)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Add study day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                    <SelectItem value="Saturday">Saturday</SelectItem>
                                    <SelectItem value="Sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(profile.preferredStudyDays).map((day, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {day}
                                  </Badge>
                                ))}
                                {safeArray(profile.preferredStudyDays).length === 0 && (
                                  <span className="text-sm">No preference set</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Preferred Study Times</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.preferredStudyTimes).map((time, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {time}
                                    <button
                                      onClick={() => removeArrayItem("preferredStudyTimes", time)}
                                      className="ml-2 text-xs hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Select onValueChange={(value) => addArrayItem("preferredStudyTimes", value)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Add study time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Morning (6AM-12PM)">Morning (6AM-12PM)</SelectItem>
                                    <SelectItem value="Afternoon (12PM-6PM)">Afternoon (12PM-6PM)</SelectItem>
                                    <SelectItem value="Evening (6PM-10PM)">Evening (6PM-10PM)</SelectItem>
                                    <SelectItem value="Night (10PM-6AM)">Night (10PM-6AM)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(profile.preferredStudyTimes).map((time, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {time}
                                  </Badge>
                                ))}
                                {safeArray(profile.preferredStudyTimes).length === 0 && (
                                  <span className="text-sm">No preference set</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Interests</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.interests).map((interest, index) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">
                                    {interest}
                                    <button
                                      onClick={() => removeArrayItem("interests", interest)}
                                      className="ml-2 text-xs hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add an interest"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addArrayItem("interests", (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add an interest"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      addArrayItem("interests", input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(profile.interests).map((interest, index) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">
                                    {interest}
                                  </Badge>
                                ))}
                                {safeArray(profile.interests).length === 0 && (
                                  <span className="text-sm">No interests specified</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Hobbies</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.hobbies).map((hobby, index) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">
                                    {hobby}
                                    <button
                                      onClick={() => removeArrayItem("hobbies", hobby)}
                                      className="ml-2 text-xs hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a hobby"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addArrayItem("hobbies", (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add a hobby"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      addArrayItem("hobbies", input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(profile.hobbies).map((hobby, index) => (
                                  <Badge key={index} variant="outline" className="px-3 py-1">
                                    {hobby}
                                  </Badge>
                                ))}
                                {safeArray(profile.hobbies).length === 0 && (
                                  <span className="text-sm">No hobbies specified</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Professional Settings (Teacher Only) */}
                {isTeacher && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>Professional Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Manage your teaching profile and professional information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="settings-bio">Professional Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="settings-bio"
                            value={editForm.bio || ""}
                            onChange={(e) => handleFormChange("bio", e.target.value)}
                            placeholder="Tell students about your teaching style, experience, and approach..."
                            rows={4}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                            <span className="text-sm">{profile.bio || "No bio provided"}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="settings-experience">Experience</Label>
                          {isEditing ? (
                            <Input
                              id="settings-experience"
                              value={editForm.experience || ""}
                              onChange={(e) => handleFormChange("experience", e.target.value)}
                              placeholder="e.g., 5 years of teaching experience"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <span className="text-sm">{profile.experience || "Not specified"}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Specializations</Label>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(editForm.specialties).map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {specialty}
                                    <button
                                      onClick={() => removeArrayItem("specialties", specialty)}
                                      className="ml-2 text-xs hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a specialization"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addArrayItem("specialties", (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add a specialization"]') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                      addArrayItem("specialties", input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex flex-wrap gap-2">
                                {safeArray(profile.specialties).map((specialty, index) => (
                                  <Badge key={index} variant="secondary" className="px-3 py-1">
                                    {specialty}
                                  </Badge>
                                ))}
                                {safeArray(profile.specialties).length === 0 && (
                                  <span className="text-sm">No specializations specified</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{profile.rating || "0.0"}</span>
                              <span className="text-xs text-gray-500">/5.0</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Total Students</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium">{profile.totalStudents || "0"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Availability Hours</Label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium">{profile.availabilityHours || "0"} hrs/week</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Achievements & Milestones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mock achievements */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Star className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">First Review</h3>
                            <p className="text-sm text-gray-600">Completed your first review</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BookMarked className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">5 Lessons</h3>
                            <p className="text-sm text-gray-600">Completed 5 lessons</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Active Learner</h3>
                            <p className="text-sm text-gray-600">30 days streak</p>
                          </div>
                        </div>
                      </div>
                      
                      {isTeacher && (
                        <>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <Users className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">10 Students</h3>
                                <p className="text-sm text-gray-600">Taught 10 students</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 p-2 rounded-full">
                                <Award className="h-6 w-6 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Top Rated</h3>
                                <p className="text-sm text-gray-600">5.0 star rating</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}