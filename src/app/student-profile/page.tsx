"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, 
  Plus, 
  X, 
  Settings, 
  User, 
  BookOpen, 
  Target, 
  Calendar, 
  Clock, 
  Save,
  Edit,
  Eye,
  ArrowLeft,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  MapPin,
  Globe,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Camera,
  BookMarked,
  MessageCircle,
  ThumbsUp,
  GraduationCap,
  Briefcase,
  Users,
  Languages,
  Flag,
  Target as TargetIcon,
  Zap,
  Shield
} from "lucide-react"
import Link from "next/link"

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
]

const LANGUAGE_OPTIONS = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic",
  "Hindi", "Russian", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Turkish", "Greek"
]

const PROFICIENCY_LEVELS = [
  "Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper Intermediate (B2)", 
  "Advanced (C1)", "Proficient (C2)"
]

const LEARNING_GOALS = [
  "General Conversation", "Business English", "Exam Preparation (IELTS/TOEFL)", "Academic English",
  "Travel English", "Pronunciation Improvement", "Vocabulary Building", "Grammar Mastery",
  "Writing Skills", "Listening Comprehension", "Reading Comprehension", "Public Speaking"
]

const LEARNING_STYLES = [
  "Visual (Diagrams, Videos)", "Auditory (Listening, Discussions)", "Reading/Writing",
  "Kinesthetic (Interactive, Hands-on)", "Conversational Practice", "Structured Lessons"
]

const TEACHER_PREFERENCES = [
  "Native Speaker", "Bilingual Teacher", "Young Teacher", "Experienced Teacher",
  "Formal Teaching Style", "Casual Teaching Style", "Patient Teacher", "Strict Teacher"
]

const INTEREST_OPTIONS = [
  "Technology", "Business", "Science", "Arts & Culture", "Sports", "Music", "Movies", "Travel",
  "Food & Cooking", "Fashion", "Gaming", "Books & Literature", "News & Current Events",
  "Health & Fitness", "Environment", "History", "Psychology", "Education", "Social Media"
]

const TIME_OPTIONS = [
  "Early Morning (6:00-9:00)", "Morning (9:00-12:00)", "Afternoon (12:00-17:00)",
  "Evening (17:00-21:00)", "Late Evening (21:00-23:00)"
]

interface StudentProfileData {
  age: string
  country: string
  nativeLanguage: string
  timezone: string
  currentLevel: string
  learningGoals: string[]
  targetScore: string
  preferredLearningStyle: string[]
  studyFrequency: string
  sessionDuration: string
  teacherPreferences: string[]
  interests: string[]
  hobbies: string[]
  preferredDays: number[]
  preferredTimes: string[]
  previousExperience: string
  specificNeeds: string
  motivation: string
}

interface StudentStats {
  totalBookings: number
  completedLessons: number
  totalReviews: number
  averageRating: number
  studyStreak: number
  completionRate: number
}

export default function StudentProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileData, setProfileData] = useState<StudentProfileData>({
    age: "",
    country: "",
    nativeLanguage: "",
    timezone: "",
    currentLevel: "",
    learningGoals: [],
    targetScore: "",
    preferredLearningStyle: [],
    studyFrequency: "",
    sessionDuration: "60",
    teacherPreferences: [],
    interests: [],
    hobbies: [],
    preferredDays: [],
    preferredTimes: [],
    previousExperience: "",
    specificNeeds: "",
    motivation: ""
  })

  const [stats, setStats] = useState<StudentStats>({
    totalBookings: 0,
    completedLessons: 0,
    totalReviews: 0,
    averageRating: 0,
    studyStreak: 0,
    completionRate: 0
  })

  const [newInterest, setNewInterest] = useState("")
  const [newHobby, setNewHobby] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
      return
    }

    fetchProfileData()
    fetchStudentStats()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/student/profile`)
      if (response.ok) {
        const data = await response.json()
        
        // Parse JSON fields if they exist
        setProfileData({
          age: data.age || "",
          country: data.country || "",
          nativeLanguage: data.nativeLanguage || "",
          timezone: data.timezone || "",
          currentLevel: data.currentLevel || "",
          learningGoals: data.learningGoals ? JSON.parse(data.learningGoals) : [],
          targetScore: data.targetScore || "",
          preferredLearningStyle: data.preferredLearningStyle ? JSON.parse(data.preferredLearningStyle) : [],
          studyFrequency: data.studyFrequency || "",
          sessionDuration: data.sessionDuration || "60",
          teacherPreferences: data.teacherPreferences ? JSON.parse(data.teacherPreferences) : [],
          interests: data.interests ? JSON.parse(data.interests) : [],
          hobbies: data.hobbies ? JSON.parse(data.hobbies) : [],
          preferredDays: data.preferredDays ? JSON.parse(data.preferredDays) : [],
          preferredTimes: data.preferredTimes ? JSON.parse(data.preferredTimes) : [],
          previousExperience: data.previousExperience || "",
          specificNeeds: data.specificNeeds || "",
          motivation: data.motivation || ""
        })
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentStats = async () => {
    // Mock stats data - in a real app, this would come from an API
    setStats({
      totalBookings: 15,
      completedLessons: 12,
      totalReviews: 8,
      averageRating: 4.7,
      studyStreak: 23,
      completionRate: 80
    })
  }

  const toggleLearningGoal = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter(g => g !== goal)
        : [...prev.learningGoals, goal]
    }))
  }

  const toggleLearningStyle = (style: string) => {
    setProfileData(prev => ({
      ...prev,
      preferredLearningStyle: prev.preferredLearningStyle.includes(style)
        ? prev.preferredLearningStyle.filter(s => s !== style)
        : [...prev.preferredLearningStyle, style]
    }))
  }

  const toggleTeacherPreference = (pref: string) => {
    setProfileData(prev => ({
      ...prev,
      teacherPreferences: prev.teacherPreferences.includes(pref)
        ? prev.teacherPreferences.filter(p => p !== pref)
        : [...prev.teacherPreferences, pref]
    }))
  }

  const toggleDay = (day: number) => {
    setProfileData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }))
  }

  const toggleTime = (time: string) => {
    setProfileData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const addHobby = () => {
    if (newHobby.trim() && !profileData.hobbies.includes(newHobby.trim())) {
      setProfileData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }))
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    setProfileData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }))
  }

  const saveProfile = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        setEditMode(false)
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

  const getInterestIcon = (interest: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'music': Music,
      'travel': MapPin,
      'sports': TargetIcon,
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

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner (A1)': 'bg-red-100 text-red-800',
      'Elementary (A2)': 'bg-orange-100 text-orange-800',
      'Intermediate (B1)': 'bg-yellow-100 text-yellow-800',
      'Upper Intermediate (B2)': 'bg-blue-100 text-blue-800',
      'Advanced (C1)': 'bg-green-100 text-green-800',
      'Proficient (C2)': 'bg-purple-100 text-purple-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:bg-gray-100">
                <Link href="/dashboard/student">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? "outline" : "default"}
                className={editMode ? "border-gray-300 hover:bg-gray-50" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"}
              >
                {editMode ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    View Mode
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
              <CardHeader className="text-center -mt-16 relative z-10">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={session.user.image} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {session.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold text-gray-900">{session.user.name}</CardTitle>
                <CardDescription className="text-gray-600">{session.user.email}</CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <Badge variant="outline" className="border-gray-300">
                    STUDENT
                  </Badge>
                  {profileData.currentLevel && (
                    <Badge className={getLevelColor(profileData.currentLevel)}>
                      {profileData.currentLevel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.country && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{profileData.country}</p>
                    </div>
                  </div>
                )}
                {profileData.timezone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Timezone</p>
                      <p className="text-gray-900">{profileData.timezone}</p>
                    </div>
                  </div>
                )}
                {profileData.nativeLanguage && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Languages className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Native Language</p>
                      <p className="text-gray-900">{profileData.nativeLanguage}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <BookMarked className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold text-gray-900">{stats.totalBookings}</div>
                  <div className="text-xs text-gray-600">Total Bookings</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-lg font-bold text-gray-900">{stats.completedLessons}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-lg font-bold text-gray-900">{stats.totalReviews}</div>
                  <div className="text-xs text-gray-600">Reviews</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg font-bold text-gray-900">{stats.studyStreak}</div>
                  <div className="text-xs text-gray-600">Day Streak</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Learning
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Progress Overview */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
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
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Vocabulary Building</span>
                          <span>70%</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{session.user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{session.user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age Range</label>
                        {editMode ? (
                          <Select value={profileData.age} onValueChange={(value) => setProfileData(prev => ({ ...prev, age: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under-18">Under 18</SelectItem>
                              <SelectItem value="18-25">18-25</SelectItem>
                              <SelectItem value="26-35">26-35</SelectItem>
                              <SelectItem value="36-45">36-45</SelectItem>
                              <SelectItem value="46-55">46-55</SelectItem>
                              <SelectItem value="over-55">Over 55</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profileData.age || "Not specified"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        {editMode ? (
                          <Input
                            value={profileData.country}
                            onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Your country"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profileData.country || "Not specified"}</p>
                        )}
                      </div>
                    </div>
                    
                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Previous Experience</label>
                          <Textarea
                            value={profileData.previousExperience}
                            onChange={(e) => setProfileData(prev => ({ ...prev, previousExperience: e.target.value }))}
                            placeholder="Tell us about your previous English learning experience..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Motivation for Learning *</label>
                          <Textarea
                            value={profileData.motivation}
                            onChange={(e) => setProfileData(prev => ({ ...prev, motivation: e.target.value }))}
                            required
                            placeholder="What motivates you to learn English? What are your goals?"
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profileData.previousExperience && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Previous Experience</label>
                            <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                              {profileData.previousExperience}
                            </p>
                          </div>
                        )}
                        {profileData.motivation && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Motivation</label>
                            <p className="text-gray-900 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg">
                              {profileData.motivation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>English Proficiency & Goals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current English Level</label>
                        {editMode ? (
                          <Select value={profileData.currentLevel} onValueChange={(value) => setProfileData(prev => ({ ...prev, currentLevel: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROFICIENCY_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-2">
                            {profileData.currentLevel ? (
                              <Badge className={getLevelColor(profileData.currentLevel)}>
                                {profileData.currentLevel}
                              </Badge>
                            ) : (
                              <p className="text-gray-500">Not specified</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Target Score (Optional)</label>
                        {editMode ? (
                          <Input
                            value={profileData.targetScore}
                            onChange={(e) => setProfileData(prev => ({ ...prev, targetScore: e.target.value }))}
                            placeholder="e.g., IELTS 7.0, TOEFL 100"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profileData.targetScore || "Not specified"}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Learning Goals</label>
                      {editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {LEARNING_GOALS.map(goal => (
                            <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.learningGoals.includes(goal)}
                                onChange={() => toggleLearningGoal(goal)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{goal}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profileData.learningGoals.length > 0 ? (
                            profileData.learningGoals.map((goal, index) => (
                              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                                {goal}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No learning goals specified</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Learning Style</label>
                      {editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {LEARNING_STYLES.map(style => (
                            <label key={style} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.preferredLearningStyle.includes(style)}
                                onChange={() => toggleLearningStyle(style)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{style}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profileData.preferredLearningStyle.length > 0 ? (
                            profileData.preferredLearningStyle.map((style, index) => (
                              <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                                {style}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No learning style specified</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Study Frequency</label>
                        {editMode ? (
                          <Select value={profileData.studyFrequency} onValueChange={(value) => setProfileData(prev => ({ ...prev, studyFrequency: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="How often do you want to study?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="2-3 times per week">2-3 times per week</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profileData.studyFrequency || "Not specified"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Preferred Session Duration</label>
                        {editMode ? (
                          <Select value={profileData.sessionDuration} onValueChange={(value) => setProfileData(prev => ({ ...prev, sessionDuration: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Session duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                              <SelectItem value="120">120 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 mt-1">{profileData.sessionDuration} minutes</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Teacher Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {TEACHER_PREFERENCES.map(pref => (
                          <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.teacherPreferences.includes(pref)}
                              onChange={() => toggleTeacherPreference(pref)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{pref}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profileData.teacherPreferences.length > 0 ? (
                          profileData.teacherPreferences.map((pref, index) => (
                            <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                              {pref}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No teacher preferences specified</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Interests</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add an interest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                          />
                          <Button onClick={addInterest} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interest, index) => (
                            <Badge key={index} variant="outline" className="flex items-center space-x-1">
                              {getInterestIcon(interest)}
                              <span>{interest}</span>
                              <button
                                onClick={() => removeInterest(interest)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profileData.interests.length > 0 ? (
                          profileData.interests.map((interest, index) => (
                            <Badge key={index} variant="outline" className="flex items-center space-x-2 px-4 py-2">
                              {getInterestIcon(interest)}
                              <span>{interest}</span>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No interests specified</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coffee className="h-5 w-5" />
                      <span>Hobbies</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a hobby"
                            value={newHobby}
                            onChange={(e) => setNewHobby(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                          />
                          <Button onClick={addHobby} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.hobbies.map((hobby, index) => (
                            <Badge key={index} variant="outline" className="flex items-center space-x-1">
                              <span>{hobby}</span>
                              <button
                                onClick={() => removeHobby(hobby)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profileData.hobbies.length > 0 ? (
                          profileData.hobbies.map((hobby, index) => (
                            <Badge key={index} variant="outline" className="px-4 py-2">
                              {hobby}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No hobbies specified</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Specific Needs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <Textarea
                        value={profileData.specificNeeds}
                        onChange={(e) => setProfileData(prev => ({ ...prev, specificNeeds: e.target.value }))}
                        placeholder="Any specific learning needs or requirements?"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {profileData.specificNeeds || "No specific needs specified"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Preferred Study Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Days</label>
                      {editMode ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {DAYS_OF_WEEK.map(day => (
                            <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.preferredDays.includes(day.value)}
                                onChange={() => toggleDay(day.value)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profileData.preferredDays.length > 0 ? (
                            profileData.preferredDays.map(day => (
                              <Badge key={day} variant="secondary" className="px-3 py-1">
                                {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No preferred days specified</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Times</label>
                      {editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {TIME_OPTIONS.map(time => (
                            <label key={time} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.preferredTimes.includes(time)}
                                onChange={() => toggleTime(time)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{time}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profileData.preferredTimes.length > 0 ? (
                            profileData.preferredTimes.map((time, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {time}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No preferred times specified</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            {editMode && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}