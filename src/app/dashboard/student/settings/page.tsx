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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, X, Settings, User, BookOpen, Target, Calendar, Clock, Save } from "lucide-react"
import { UserProfileEditor } from "@/components/user-profile-editor"

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

export default function StudentSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userData, setUserData] = useState<any>(null)
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

  const [newInterest, setNewInterest] = useState("")
  const [newHobby, setNewHobby] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
      return
    }

    fetchProfileData()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      // Fetch user profile data
      const userResponse = await fetch(`/api/user/profile`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserData(userData)
      }

      // Fetch student-specific profile data
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

  const handleUserProfileUpdate = (updatedUser: any) => {
    setUserData(updatedUser)
    setSuccess("User profile updated successfully!")
    setTimeout(() => setSuccess(""), 3000)
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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Student Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{session.user.name}</Badge>
              <Button variant="outline" onClick={() => router.push("/dashboard/student")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {userData && (
              <UserProfileEditor 
                user={userData} 
                onUpdate={handleUserProfileUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your personal and demographic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age Range</Label>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Your country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nativeLanguage">Native Language</Label>
                    <Select value={profileData.nativeLanguage} onValueChange={(value) => setProfileData(prev => ({ ...prev, nativeLanguage: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select native language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="e.g., EST, PST, GMT+1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousExperience">Previous English Learning Experience</Label>
                  <Textarea
                    id="previousExperience"
                    value={profileData.previousExperience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, previousExperience: e.target.value }))}
                    placeholder="Tell us about your previous English learning experience..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivation for Learning *</Label>
                  <Textarea
                    id="motivation"
                    value={profileData.motivation}
                    onChange={(e) => setProfileData(prev => ({ ...prev, motivation: e.target.value }))}
                    required
                    placeholder="What motivates you to learn English? What are your goals?"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  English Proficiency & Goals
                </CardTitle>
                <CardDescription>
                  Set your current level and learning objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentLevel">Current English Level</Label>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetScore">Target Exam Score (Optional)</Label>
                    <Input
                      id="targetScore"
                      value={profileData.targetScore}
                      onChange={(e) => setProfileData(prev => ({ ...prev, targetScore: e.target.value }))}
                      placeholder="e.g., IELTS 7.0, TOEFL 100"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Learning Goals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {LEARNING_GOALS.map(goal => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={profileData.learningGoals.includes(goal)}
                          onCheckedChange={() => toggleLearningGoal(goal)}
                        />
                        <Label htmlFor={goal} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificNeeds">Specific Learning Needs</Label>
                  <Textarea
                    id="specificNeeds"
                    value={profileData.specificNeeds}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specificNeeds: e.target.value }))}
                    placeholder="Do you have any specific learning requirements or challenges?"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize how you prefer to learn and what kind of teacher you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studyFrequency">Study Frequency</Label>
                    <Select value={profileData.studyFrequency} onValueChange={(value) => setProfileData(prev => ({ ...prev, studyFrequency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="How often do you want to study?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="2-3-times">2-3 times per week</SelectItem>
                        <SelectItem value="4-5-times">4-5 times per week</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionDuration">Preferred Session Duration</Label>
                    <Select value={profileData.sessionDuration} onValueChange={(value) => setProfileData(prev => ({ ...prev, sessionDuration: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Session length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Learning Styles</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {LEARNING_STYLES.map(style => (
                      <div key={style} className="flex items-center space-x-2">
                        <Checkbox
                          id={style}
                          checked={profileData.preferredLearningStyle.includes(style)}
                          onCheckedChange={() => toggleLearningStyle(style)}
                        />
                        <Label htmlFor={style} className="text-sm">{style}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Teacher Preferences</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TEACHER_PREFERENCES.map(pref => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref}
                          checked={profileData.teacherPreferences.includes(pref)}
                          onCheckedChange={() => toggleTeacherPreference(pref)}
                        />
                        <Label htmlFor={pref} className="text-sm">{pref}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Interests</Label>
                    <div className="flex gap-2">
                      <Select value={newInterest} onValueChange={setNewInterest}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select interest" />
                        </SelectTrigger>
                        <SelectContent>
                          {INTEREST_OPTIONS.map(interest => (
                            <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addInterest} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map(interest => (
                        <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                          {interest}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeInterest(interest)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Hobbies</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newHobby}
                        onChange={(e) => setNewHobby(e.target.value)}
                        placeholder="Add your hobby"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                      />
                      <Button type="button" onClick={addHobby} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.hobbies.map(hobby => (
                        <Badge key={hobby} variant="outline" className="flex items-center gap-1">
                          {hobby}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeHobby(hobby)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Preferences
                </CardTitle>
                <CardDescription>
                  Set your preferred days and times for lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Preferred Days</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={day.label}
                            checked={profileData.preferredDays.includes(day.value)}
                            onCheckedChange={() => toggleDay(day.value)}
                          />
                          <Label htmlFor={day.label} className="text-sm">{day.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Preferred Times</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {TIME_OPTIONS.map(time => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={time}
                            checked={profileData.preferredTimes.includes(time)}
                            onCheckedChange={() => toggleTime(time)}
                          />
                          <Label htmlFor={time} className="text-sm">{time}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}